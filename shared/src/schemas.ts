import { z } from "zod";
import { ORDER_STATUSES } from "./order-status";

export const checkoutItemSchema = z.object({
  variantId: z.string().uuid(),
  quantity: z.number().int().min(1).max(99),
});

export const checkoutSchema = z.object({
  customerName: z.string().min(2).max(120),
  customerPhone: z.string().min(8).max(20),
  customerEmail: z.string().email().optional().or(z.literal("")),
  shippingAddress: z.string().min(10).max(500),
  notes: z.string().max(500).optional(),
  items: z.array(checkoutItemSchema).min(1).max(50),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export const adminLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(8),
  newPassword: z.string().min(12).max(128),
});

export const productVariantInputSchema = z.object({
  sku: z.string().min(1).max(64),
  label: z.string().min(1).max(120),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/),
  stock: z.number().int().min(0),
  isActive: z.boolean().optional(),
});

export const productInputSchema = z.object({
  name: z.string().min(2).max(200),
  slug: z.string().min(2).max(200).regex(/^[a-z0-9-]+$/),
  description: z.string().max(5000).optional(),
  categoryId: z.string().uuid().optional().nullable(),
  isPublished: z.boolean().optional(),
  variants: z.array(productVariantInputSchema).min(1),
});

export const categoryInputSchema = z.object({
  name: z.string().min(2).max(120),
  slug: z.string().min(2).max(120).regex(/^[a-z0-9-]+$/),
  description: z.string().max(2000).optional(),
});

export const collectionInputSchema = z.object({
  name: z.string().min(2).max(120),
  slug: z.string().min(2).max(120).regex(/^[a-z0-9-]+$/),
  description: z.string().max(2000).optional(),
  isPublished: z.boolean().optional(),
});

export const bannerInputSchema = z.object({
  title: z.string().min(2).max(200),
  subtitle: z.string().max(300).optional(),
  imageUrl: z.string().url(),
  linkUrl: z
    .string()
    .max(500)
    .refine((v) => v === "" || v.startsWith("/") || /^https?:\/\//i.test(v), {
      message: "linkUrl must be a path or URL",
    })
    .optional()
    .or(z.literal("")),
  sortOrder: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

export const storeSettingsSchema = z.object({
  storeName: z.string().min(2).max(120),
  tagline: z.string().max(200).optional(),
  contactEmail: z.string().email().optional().or(z.literal("")),
  contactPhone: z.string().max(20).optional(),
  whatsappNumber: z.string().min(8).max(20),
  address: z.string().max(500).optional(),
  currency: z.string().length(3).default("INR"),
});

export const orderStatusUpdateSchema = z.object({
  status: z.enum(ORDER_STATUSES),
  note: z.string().max(500).optional(),
});

export type ProductInput = z.infer<typeof productInputSchema>;
export type CategoryInput = z.infer<typeof categoryInputSchema>;
export type CollectionInput = z.infer<typeof collectionInputSchema>;
export type BannerInput = z.infer<typeof bannerInputSchema>;
export type StoreSettingsInput = z.infer<typeof storeSettingsSchema>;

export { homepageContentSchema } from "./homepage";
