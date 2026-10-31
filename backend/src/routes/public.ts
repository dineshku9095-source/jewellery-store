import { Router } from "express";
import { DEFAULT_HOMEPAGE_CONTENT, mergeHomepageContent } from "@jewellery/shared";
import { processCheckout } from "../services/checkoutService";
import { checkoutLimiter } from "../middleware/rateLimit";
import { prisma } from "../lib/prisma";

export const publicRouter = Router();

function serializeProduct(p: {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category?: { id: string; name: string; slug: string } | null;
  images: Array<{ id: string; url: string; alt: string | null; sortOrder: number }>;
  variants: Array<{
    id: string;
    sku: string;
    label: string;
    price: { toString(): string };
    stock: number;
  }>;
}) {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    category: p.category,
    images: p.images,
    variants: p.variants.map((v) => ({
      id: v.id,
      sku: v.sku,
      label: v.label,
      price: v.price.toString(),
      stock: v.stock,
    })),
  };
}

publicRouter.get("/products", async (req, res, next) => {
  try {
    const category = req.query.category as string | undefined;
    const collection = req.query.collection as string | undefined;
    const products = await prisma.product.findMany({
      where: {
        isPublished: true,
        ...(category ? { category: { slug: category } } : {}),
        ...(collection
          ? { collections: { some: { collection: { slug: collection, isPublished: true } } } }
          : {}),
      },
      include: {
        category: true,
        images: { orderBy: { sortOrder: "asc" } },
        variants: { where: { isActive: true }, orderBy: { price: "asc" } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json({ products: products.map(serializeProduct) });
  } catch (e) {
    next(e);
  }
});

publicRouter.get("/products/:slug", async (req, res, next) => {
  try {
    const product = await prisma.product.findFirst({
      where: { slug: req.params.slug, isPublished: true },
      include: {
        category: true,
        images: { orderBy: { sortOrder: "asc" } },
        variants: { where: { isActive: true }, orderBy: { price: "asc" } },
        collections: { include: { collection: true } },
      },
    });
    if (!product) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.json({ product: serializeProduct(product) });
  } catch (e) {
    next(e);
  }
});

publicRouter.get("/categories", async (_req, res, next) => {
  try {
    const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
    res.json({ categories });
  } catch (e) {
    next(e);
  }
});

publicRouter.get("/categories/:slug", async (req, res, next) => {
  try {
    const category = await prisma.category.findUnique({ where: { slug: req.params.slug } });
    if (!category) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.json({ category });
  } catch (e) {
    next(e);
  }
});

publicRouter.get("/collections", async (_req, res, next) => {
  try {
    const collections = await prisma.collection.findMany({
      where: { isPublished: true },
      orderBy: { name: "asc" },
    });
    res.json({ collections });
  } catch (e) {
    next(e);
  }
});

publicRouter.get("/collections/:slug", async (req, res, next) => {
  try {
    const collection = await prisma.collection.findFirst({
      where: { slug: req.params.slug, isPublished: true },
    });
    if (!collection) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.json({ collection });
  } catch (e) {
    next(e);
  }
});

publicRouter.get("/banners", async (_req, res, next) => {
  try {
    const banners = await prisma.banner.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });
    res.json({ banners });
  } catch (e) {
    next(e);
  }
});

publicRouter.get("/settings/public", async (_req, res, next) => {
  try {
    const settings = await prisma.storeSettings.findUnique({ where: { id: 1 } });
    if (!settings) {
      res.json({
        settings: {
          storeName: "Queen's Jewels Aura",
          tagline: "",
          contactEmail: "",
          contactPhone: "",
          whatsappNumber: "",
          address: "",
          currency: "INR",
          homepage: DEFAULT_HOMEPAGE_CONTENT,
        },
      });
      return;
    }
    res.json({
      settings: {
        storeName: settings.storeName,
        tagline: settings.tagline,
        contactEmail: settings.contactEmail,
        contactPhone: settings.contactPhone,
        whatsappNumber: settings.whatsappNumber,
        address: settings.address,
        currency: settings.currency,
        homepage: mergeHomepageContent(settings.homepageContent),
      },
    });
  } catch (e) {
    next(e);
  }
});

publicRouter.post("/checkout", checkoutLimiter, async (req, res, next) => {
  try {
    const result = await processCheckout(req.body);
    res.status(201).json(result);
  } catch (e) {
    if (e instanceof Error && e.message.includes("unavailable")) {
      res.status(400).json({ error: e.message });
      return;
    }
    next(e);
  }
});

publicRouter.get("/orders/:orderNumber", async (req, res, next) => {
  try {
    const order = await prisma.order.findUnique({
      where: { orderNumber: req.params.orderNumber },
      include: { items: true },
    });
    if (!order) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.json({
      order: {
        orderNumber: order.orderNumber,
        status: order.status,
        subtotal: order.subtotal.toString(),
        currency: order.currency,
        whatsappUrl: order.whatsappUrl,
      },
    });
  } catch (e) {
    next(e);
  }
});
