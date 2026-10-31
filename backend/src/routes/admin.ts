import { Router } from "express";
import * as argon2 from "argon2";
import {
  adminLoginSchema,
  bannerInputSchema,
  categoryInputSchema,
  changePasswordSchema,
  collectionInputSchema,
  DEFAULT_HOMEPAGE_CONTENT,
  homepageContentSchema,
  mergeHomepageContent,
  orderStatusUpdateSchema,
  productInputSchema,
  storeSettingsSchema,
} from "@jewellery/shared";
import { requireAdmin, type AuthedRequest } from "../middleware/auth";
import { attachCsrfToken, csrfProtection } from "../middleware/csrf";
import { loginLimiter } from "../middleware/rateLimit";
import {
  createAdminSession,
  revokeSession,
  sessionCookieName,
  SESSION_DAYS,
} from "../lib/session";
import { config } from "../config";
import { prisma } from "../lib/prisma";
import { destroyCloudinaryAsset, getSignedUploadParams } from "../services/cloudinary";
import { serializeOrder, updateOrderStatus } from "../services/orderService";

export const adminRouter = Router();

adminRouter.use(csrfProtection);

adminRouter.get("/csrf", (req, res) => {
  const token = attachCsrfToken(req, res);
  res.json({ csrfToken: token });
});

adminRouter.post("/login", loginLimiter, async (req, res, next) => {
  try {
    const parsed = adminLoginSchema.parse(req.body);
    const admin = await prisma.admin.findUnique({ where: { email: parsed.email } });
    if (!admin) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }
    const ok = await argon2.verify(admin.passwordHash, parsed.password);
    if (!ok) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }
    const token = await createAdminSession(admin.id, {
      ipAddress: req.ip,
      userAgent: req.get("user-agent") ?? undefined,
    });
    res.cookie(sessionCookieName(), token, {
      httpOnly: true,
      secure: config.cookieSecure,
      sameSite: config.cookieSameSite,
      maxAge: SESSION_DAYS * 24 * 60 * 60 * 1000,
      path: "/",
    });
    res.json({ admin: { id: admin.id, email: admin.email, name: admin.name } });
  } catch (e) {
    next(e);
  }
});

adminRouter.post("/logout", requireAdmin, async (req: AuthedRequest, res, next) => {
  try {
    const token = req.cookies?.[sessionCookieName()];
    if (token) await revokeSession(token);
    res.clearCookie(sessionCookieName(), { path: "/" });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

adminRouter.get("/me", requireAdmin, (req: AuthedRequest, res) => {
  res.json({ admin: req.admin });
});

adminRouter.post("/change-password", requireAdmin, async (req: AuthedRequest, res, next) => {
  try {
    const parsed = changePasswordSchema.parse(req.body);
    const admin = await prisma.admin.findUniqueOrThrow({ where: { id: req.admin!.id } });
    const ok = await argon2.verify(admin.passwordHash, parsed.currentPassword);
    if (!ok) {
      res.status(400).json({ error: "Current password is incorrect" });
      return;
    }
    const passwordHash = await argon2.hash(parsed.newPassword, { type: argon2.argon2id });
    await prisma.admin.update({ where: { id: admin.id }, data: { passwordHash } });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

adminRouter.get("/dashboard", requireAdmin, async (_req, res, next) => {
  try {
    const [productCount, orderCount, pendingOrders] = await Promise.all([
      prisma.product.count(),
      prisma.order.count(),
      prisma.order.count({ where: { status: "WHATSAPP_PENDING" } }),
    ]);
    res.json({ stats: { productCount, orderCount, pendingOrders } });
  } catch (e) {
    next(e);
  }
});

adminRouter.get("/products", requireAdmin, async (_req, res, next) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,
        variants: true,
        images: { orderBy: { sortOrder: "asc" } },
      },
      orderBy: { updatedAt: "desc" },
    });
    res.json({ products });
  } catch (e) {
    next(e);
  }
});

adminRouter.get("/products/:id", requireAdmin, async (req, res, next) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: {
        category: true,
        variants: { orderBy: { createdAt: "asc" } },
        images: { orderBy: { sortOrder: "asc" } },
        collections: true,
      },
    });
    if (!product) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.json({
      product: {
        ...product,
        variants: product.variants.map((v) => ({
          ...v,
          price: v.price.toFixed(2),
        })),
      },
    });
  } catch (e) {
    next(e);
  }
});

adminRouter.post("/products", requireAdmin, async (req: AuthedRequest, res, next) => {
  try {
    const parsed = productInputSchema.parse(req.body);
    type ImageInput = {
      url: string;
      publicId: string | null;
      alt: string;
      sortOrder: number;
    };
    const images: ImageInput[] = [];
    const rawImages = Array.isArray(req.body.images) ? req.body.images : [];
    for (const [i, item] of rawImages.entries()) {
      if (!item || typeof item !== "object") continue;
      const row = item as { url?: unknown; publicId?: unknown; alt?: unknown; sortOrder?: unknown };
      if (typeof row.url !== "string" || !row.url) continue;
      images.push({
        url: row.url,
        publicId: typeof row.publicId === "string" ? row.publicId : null,
        alt: typeof row.alt === "string" ? row.alt : parsed.name,
        sortOrder: typeof row.sortOrder === "number" ? row.sortOrder : i,
      });
    }
    // Back-compat: plain URL list
    if (!images.length && Array.isArray(req.body.imageUrls)) {
      for (const [i, url] of (req.body.imageUrls as unknown[]).entries()) {
        if (typeof url === "string" && url) {
          images.push({ url, publicId: null, alt: parsed.name, sortOrder: i });
        }
      }
    }
    const product = await prisma.product.create({
      data: {
        name: parsed.name,
        slug: parsed.slug,
        description: parsed.description,
        categoryId: parsed.categoryId,
        isPublished: parsed.isPublished ?? false,
        variants: {
          create: parsed.variants.map((v) => ({
            sku: v.sku,
            label: v.label,
            price: v.price,
            stock: v.stock,
            isActive: v.isActive ?? true,
          })),
        },
        images: images.length ? { create: images } : undefined,
      },
      include: { variants: true, images: true },
    });
    res.status(201).json({ product });
  } catch (e) {
    next(e);
  }
});

adminRouter.patch("/products/:id", requireAdmin, async (req: AuthedRequest, res, next) => {
  try {
    const parsed = productInputSchema.partial().parse(req.body);
    const id = req.params.id;

    const product = await prisma.$transaction(async (tx) => {
      const updated = await tx.product.update({
        where: { id },
        data: {
          name: parsed.name,
          slug: parsed.slug,
          description: parsed.description,
          categoryId: parsed.categoryId,
          isPublished: parsed.isPublished,
        },
      });

      if (parsed.variants) {
        const existing = await tx.productVariant.findMany({ where: { productId: id } });
        const keptSkus = new Set(parsed.variants.map((v) => v.sku));
        for (const v of existing) {
          if (!keptSkus.has(v.sku)) {
            const orderCount = await tx.orderItem.count({ where: { variantId: v.id } });
            if (orderCount > 0) {
              await tx.productVariant.update({
                where: { id: v.id },
                data: { isActive: false, stock: 0 },
              });
            } else {
              await tx.productVariant.delete({ where: { id: v.id } });
            }
          }
        }
        for (const v of parsed.variants) {
          await tx.productVariant.upsert({
            where: { sku: v.sku },
            create: {
              productId: id,
              sku: v.sku,
              label: v.label,
              price: v.price,
              stock: v.stock,
              isActive: v.isActive ?? true,
            },
            update: {
              label: v.label,
              price: v.price,
              stock: v.stock,
              isActive: v.isActive ?? true,
              productId: id,
            },
          });
        }
      }

      return updated;
    });
    res.json({ product });
  } catch (e) {
    next(e);
  }
});

adminRouter.delete("/products/:id", requireAdmin, async (req: AuthedRequest, res, next) => {
  try {
    const id = req.params.id;
    const orderItemCount = await prisma.orderItem.count({ where: { productId: id } });
    if (orderItemCount > 0) {
      res.status(409).json({
        error:
          "Cannot delete product referenced by orders. Unpublish it instead, or cancel related orders first.",
      });
      return;
    }
    const images = await prisma.productImage.findMany({ where: { productId: id } });
    for (const img of images) {
      await destroyCloudinaryAsset({ publicId: img.publicId, url: img.url });
    }
    await prisma.product.delete({ where: { id } });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

adminRouter.post("/products/:id/images", requireAdmin, async (req: AuthedRequest, res, next) => {
  try {
    const { url, publicId, alt, sortOrder } = req.body as {
      url: string;
      publicId?: string;
      alt?: string;
      sortOrder?: number;
    };
    if (!url || typeof url !== "string") {
      res.status(400).json({ error: "url is required" });
      return;
    }
    const image = await prisma.productImage.create({
      data: {
        productId: req.params.id,
        url,
        publicId: typeof publicId === "string" && publicId ? publicId : null,
        alt,
        sortOrder: sortOrder ?? 0,
      },
    });
    res.status(201).json({ image });
  } catch (e) {
    next(e);
  }
});

adminRouter.delete("/products/:productId/images/:imageId", requireAdmin, async (req: AuthedRequest, res, next) => {
  try {
    const image = await prisma.productImage.findFirst({
      where: { id: req.params.imageId, productId: req.params.productId },
    });
    if (!image) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    await destroyCloudinaryAsset({ publicId: image.publicId, url: image.url });
    await prisma.productImage.delete({ where: { id: image.id } });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

adminRouter.get("/categories", requireAdmin, async (_req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { products: true } } },
    });
    res.json({ categories });
  } catch (e) {
    next(e);
  }
});

adminRouter.post("/categories", requireAdmin, async (req: AuthedRequest, res, next) => {
  try {
    const parsed = categoryInputSchema.parse(req.body);
    const category = await prisma.category.create({ data: parsed });
    res.status(201).json({ category });
  } catch (e) {
    next(e);
  }
});

adminRouter.patch("/categories/:id", requireAdmin, async (req: AuthedRequest, res, next) => {
  try {
    const parsed = categoryInputSchema.partial().parse(req.body);
    const category = await prisma.category.update({
      where: { id: req.params.id },
      data: parsed,
    });
    res.json({ category });
  } catch (e) {
    next(e);
  }
});

adminRouter.delete("/categories/:id", requireAdmin, async (req: AuthedRequest, res, next) => {
  try {
    const id = req.params.id;
    await prisma.$transaction([
      prisma.product.updateMany({ where: { categoryId: id }, data: { categoryId: null } }),
      prisma.category.delete({ where: { id } }),
    ]);
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

adminRouter.get("/collections", requireAdmin, async (_req, res, next) => {
  try {
    const collections = await prisma.collection.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { products: true } } },
    });
    res.json({ collections });
  } catch (e) {
    next(e);
  }
});

adminRouter.post("/collections", requireAdmin, async (req: AuthedRequest, res, next) => {
  try {
    const parsed = collectionInputSchema.parse(req.body);
    const collection = await prisma.collection.create({ data: parsed });
    res.status(201).json({ collection });
  } catch (e) {
    next(e);
  }
});

adminRouter.patch("/collections/:id", requireAdmin, async (req: AuthedRequest, res, next) => {
  try {
    const parsed = collectionInputSchema.partial().parse(req.body);
    const collection = await prisma.collection.update({
      where: { id: req.params.id },
      data: parsed,
    });
    res.json({ collection });
  } catch (e) {
    next(e);
  }
});

adminRouter.delete("/collections/:id", requireAdmin, async (req: AuthedRequest, res, next) => {
  try {
    const id = req.params.id;
    await prisma.collection.delete({ where: { id } });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

adminRouter.get("/banners", requireAdmin, async (_req, res, next) => {
  try {
    const banners = await prisma.banner.findMany({ orderBy: { sortOrder: "asc" } });
    res.json({ banners });
  } catch (e) {
    next(e);
  }
});

adminRouter.post("/banners", requireAdmin, async (req: AuthedRequest, res, next) => {
  try {
    const parsed = bannerInputSchema.parse(req.body);
    const banner = await prisma.banner.create({
      data: {
        ...parsed,
        linkUrl: parsed.linkUrl || null,
      },
    });
    res.status(201).json({ banner });
  } catch (e) {
    next(e);
  }
});

adminRouter.patch("/banners/:id", requireAdmin, async (req: AuthedRequest, res, next) => {
  try {
    const parsed = bannerInputSchema.partial().parse(req.body);
    const banner = await prisma.banner.update({
      where: { id: req.params.id },
      data: {
        ...parsed,
        linkUrl: parsed.linkUrl === "" ? null : parsed.linkUrl,
      },
    });
    res.json({ banner });
  } catch (e) {
    next(e);
  }
});

adminRouter.delete("/banners/:id", requireAdmin, async (req: AuthedRequest, res, next) => {
  try {
    const id = req.params.id;
    const banner = await prisma.banner.findUnique({ where: { id } });
    if (!banner) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    await destroyCloudinaryAsset({ url: banner.imageUrl });
    await prisma.banner.delete({ where: { id } });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

adminRouter.get("/settings", requireAdmin, async (_req, res, next) => {
  try {
    const settings = await prisma.storeSettings.findUnique({ where: { id: 1 } });
    res.json({ settings });
  } catch (e) {
    next(e);
  }
});

adminRouter.put("/settings", requireAdmin, async (req: AuthedRequest, res, next) => {
  try {
    const parsed = storeSettingsSchema.parse(req.body);
    const settings = await prisma.storeSettings.upsert({
      where: { id: 1 },
      update: parsed,
      create: { id: 1, ...parsed },
    });
    res.json({ settings });
  } catch (e) {
    next(e);
  }
});

adminRouter.get("/homepage", requireAdmin, async (_req, res, next) => {
  try {
    const settings = await prisma.storeSettings.findUnique({ where: { id: 1 } });
    res.json({
      homepage: mergeHomepageContent(settings?.homepageContent ?? DEFAULT_HOMEPAGE_CONTENT),
    });
  } catch (e) {
    next(e);
  }
});

adminRouter.put("/homepage", requireAdmin, async (req: AuthedRequest, res, next) => {
  try {
    const parsed = homepageContentSchema.parse(req.body);
    const existing = await prisma.storeSettings.findUnique({ where: { id: 1 } });
    if (!existing) {
      res.status(400).json({ error: "Save store settings first (WhatsApp number required)." });
      return;
    }
    const settings = await prisma.storeSettings.update({
      where: { id: 1 },
      data: { homepageContent: parsed },
    });
    res.json({ homepage: mergeHomepageContent(settings.homepageContent) });
  } catch (e) {
    next(e);
  }
});

adminRouter.get("/orders", requireAdmin, async (req, res, next) => {
  try {
    const status = req.query.status as string | undefined;
    const orders = await prisma.order.findMany({
      where: status ? { status: status as never } : undefined,
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    res.json({ orders: orders.map(serializeOrder) });
  } catch (e) {
    next(e);
  }
});

adminRouter.get("/orders/:id", requireAdmin, async (req, res, next) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: { items: true },
    });
    if (!order) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.json({ order: serializeOrder(order) });
  } catch (e) {
    next(e);
  }
});

adminRouter.patch("/orders/:id/status", requireAdmin, async (req: AuthedRequest, res, next) => {
  try {
    const parsed = orderStatusUpdateSchema.parse(req.body);
    const order = await updateOrderStatus(
      req.params.id,
      parsed.status,
      req.admin!.id,
      parsed.note
    );
    res.json({ order: serializeOrder(order) });
  } catch (e) {
    if (e instanceof Error) {
      res.status(400).json({ error: e.message });
      return;
    }
    next(e);
  }
});

adminRouter.get("/uploads/sign", requireAdmin, async (req: AuthedRequest, res, next) => {
  try {
    const folder = (req.query.folder as string) || undefined;
    const params = getSignedUploadParams(folder);
    res.json(params);
  } catch (e) {
    if (e instanceof Error && e.message.includes("not configured")) {
      res.status(503).json({ error: e.message });
      return;
    }
    next(e);
  }
});
