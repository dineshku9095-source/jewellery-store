import { z } from "zod";

export const headerNavChildSchema = z.object({
  id: z.string().min(1).max(64),
  label: z.string().min(1).max(80),
  href: z.string().min(1).max(300),
  visible: z.boolean().default(true),
});

export const headerNavItemSchema = z.object({
  id: z.string().min(1).max(64),
  label: z.string().min(1).max(80),
  href: z.string().min(1).max(300),
  visible: z.boolean().default(true),
  children: z.array(headerNavChildSchema).max(20).default([]),
});

export const headerNavSchema = z.object({
  items: z.array(headerNavItemSchema).max(12),
});

export type HeaderNavChild = z.infer<typeof headerNavChildSchema>;
export type HeaderNavItem = z.infer<typeof headerNavItemSchema>;
export type HeaderNav = z.infer<typeof headerNavSchema>;

function nid(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

export const DEFAULT_HEADER_NAV: HeaderNav = {
  items: [
    {
      id: "jewellery",
      label: "Jewellery",
      href: "/shop",
      visible: true,
      children: [
        { id: "jewellery-all", label: "All jewellery", href: "/shop", visible: true },
        { id: "jewellery-rings", label: "Rings", href: "/category/rings", visible: true },
        { id: "jewellery-necklaces", label: "Necklaces", href: "/category/necklaces", visible: true },
      ],
    },
    {
      id: "blogs",
      label: "Blogs",
      href: "/about",
      visible: true,
      children: [],
    },
    {
      id: "accessories",
      label: "Accessories",
      href: "/shop",
      visible: true,
      children: [],
    },
    {
      id: "collection",
      label: "Collection",
      href: "/collections",
      visible: true,
      children: [
        { id: "collection-all", label: "All collections", href: "/collections", visible: true },
        { id: "collection-bridal", label: "Bridal Edit", href: "/collections/bridal-edit", visible: true },
      ],
    },
    {
      id: "category",
      label: "Category",
      href: "/category",
      visible: true,
      children: [
        { id: "category-all", label: "All categories", href: "/category", visible: true },
      ],
    },
    {
      id: "contact",
      label: "Contact",
      href: "/contact",
      visible: true,
      children: [],
    },
  ],
};

export function mergeHeaderNav(raw: unknown): HeaderNav {
  if (!raw || typeof raw !== "object") return DEFAULT_HEADER_NAV;
  const parsed = headerNavSchema.safeParse(raw);
  if (parsed.success) return parsed.data;
  // Soft merge: if items array present but partial, fall back to defaults
  return DEFAULT_HEADER_NAV;
}

export function newHeaderNavItem(partial?: Partial<HeaderNavItem>): HeaderNavItem {
  return {
    id: partial?.id ?? nid("nav"),
    label: partial?.label ?? "New item",
    href: partial?.href ?? "/shop",
    visible: partial?.visible ?? true,
    children: partial?.children ?? [],
  };
}

export function newHeaderNavChild(partial?: Partial<HeaderNavChild>): HeaderNavChild {
  return {
    id: partial?.id ?? nid("link"),
    label: partial?.label ?? "New link",
    href: partial?.href ?? "/shop",
    visible: partial?.visible ?? true,
  };
}
