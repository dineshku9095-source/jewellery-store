import { Router } from "express";
import * as argon2 from "argon2";
import {
  adminLoginSchema,
  bannerInputSchema,
  categoryInputSchema,
  changePasswordSchema,
  collectionInputSchema,
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
import { writeAuditLog } from "../services/audit";
import { getSignedUploadParams } from "../services/cloudinary";
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
    await writeAuditLog({ adminId: admin.id, action: "admin.login" });
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
    if (req.admin) {
      await writeAuditLog({ adminId: req.admin.id, action: "admin.logout" });
    }
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
    await writeAuditLog({ adminId: admin.id, action: "admin.change_password" });
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
        images: { orderBy: { sortOrder: "asc" }, take: 1 },
      },
      orderBy: { updatedAt: "desc" },
    });
    res.json({ products });
  } catch (e) {
    next(e);
  }
});

adminRouter.post("/products", requireAdmin, async (req: AuthedRequest, res, next) => {
  try {
    const parsed = productInputSchema.parse(req.body);
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
      },
      include: { variants: true },
    });
    await writeAuditLog({
      adminId: req.admin!.id,
      action: "product.create",
      entity: "Product",
      entityId: product.id,
    });
    res.status(201).json({ product });
  } catch (e) {
    next(e);
  }
});

adminRouter.patch("/products/:id", requireAdmin, async (req: AuthedRequest, res, next) => {
  try {
    const parsed = productInputSchema.partial().parse(req.body);
    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: {
        name: parsed.name,
        slug: parsed.slug,
        description: parsed.description,
        categoryId: parsed.categoryId,
        isPublished: parsed.isPublished,
      },
    });
    await writeAuditLog({
      adminId: req.admin!.id,
      action: "product.update",
      entity: "Product",
      entityId: product.id,
    });
    res.json({ product });
  } catch (e) {
    next(e);
  }
});

adminRouter.post("/products/:id/images", requireAdmin, async (req: AuthedRequest, res, next) => {
  try {
    const { url, alt, sortOrder } = req.body as {
      url: string;
      alt?: string;
      sortOrder?: number;
    };
    const image = await prisma.productImage.create({
      data: {
        productId: req.params.id,
        url,
        alt,
        sortOrder: sortOrder ?? 0,
      },
    });
    await writeAuditLog({
      adminId: req.admin!.id,
      action: "product.image_add",
      entity: "Product",
      entityId: req.params.id,
    });
    res.status(201).json({ image });
  } catch (e) {
    next(e);
  }
});

adminRouter.get("/categories", requireAdmin, async (_req, res, next) => {
  try {
    const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
    res.json({ categories });
  } catch (e) {
    next(e);
  }
});

adminRouter.post("/categories", requireAdmin, async (req: AuthedRequest, res, next) => {
  try {
    const parsed = categoryInputSchema.parse(req.body);
    const category = await prisma.category.create({ data: parsed });
    await writeAuditLog({
      adminId: req.admin!.id,
      action: "category.create",
      entity: "Category",
      entityId: category.id,
    });
    res.status(201).json({ category });
  } catch (e) {
    next(e);
  }
});

adminRouter.get("/collections", requireAdmin, async (_req, res, next) => {
  try {
    const collections = await prisma.collection.findMany({ orderBy: { name: "asc" } });
    res.json({ collections });
  } catch (e) {
    next(e);
  }
});

adminRouter.post("/collections", requireAdmin, async (req: AuthedRequest, res, next) => {
  try {
    const parsed = collectionInputSchema.parse(req.body);
    const collection = await prisma.collection.create({ data: parsed });
    await writeAuditLog({
      adminId: req.admin!.id,
      action: "collection.create",
      entity: "Collection",
      entityId: collection.id,
    });
    res.status(201).json({ collection });
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
    await writeAuditLog({
      adminId: req.admin!.id,
      action: "banner.create",
      entity: "Banner",
      entityId: banner.id,
    });
    res.status(201).json({ banner });
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
    await writeAuditLog({
      adminId: req.admin!.id,
      action: "settings.update",
      entity: "StoreSettings",
      entityId: "1",
    });
    res.json({ settings });
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
      include: { items: true, statusHistory: { orderBy: { createdAt: "desc" } } },
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

adminRouter.get("/audit", requireAdmin, async (_req, res, next) => {
  try {
    const logs = await prisma.adminAuditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      include: { admin: { select: { email: true, name: true } } },
    });
    res.json({ logs });
  } catch (e) {
    next(e);
  }
});

adminRouter.get("/uploads/sign", requireAdmin, async (req: AuthedRequest, res, next) => {
  try {
    const folder = (req.query.folder as string) || "jewellery";
    const params = getSignedUploadParams(folder);
    await writeAuditLog({
      adminId: req.admin!.id,
      action: "upload.sign",
      metadata: { folder },
    });
    res.json(params);
  } catch (e) {
    if (e instanceof Error && e.message.includes("not configured")) {
      res.status(503).json({ error: e.message });
      return;
    }
    next(e);
  }
});
