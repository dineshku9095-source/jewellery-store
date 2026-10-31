import { z } from "zod";

export const homepageTrustItemSchema = z.object({
  title: z.string().min(1).max(80),
  detail: z.string().min(1).max(160),
});

export const homepagePromoItemSchema = z.object({
  title: z.string().min(1).max(120),
  subtitle: z.string().max(160).optional().or(z.literal("")),
  href: z.string().min(1).max(300),
  image: z.string().url(),
  tone: z.string().max(80).optional(),
});

export const homepageContentSchema = z.object({
  topBarPromo: z.string().min(1).max(200),
  topBarEmail: z.string().max(120).optional().or(z.literal("")),
  heroEyebrow: z.string().min(1).max(160),
  heroHeadline: z.string().min(1).max(160),
  heroBody: z.string().min(1).max(600),
  heroCtaLabel: z.string().min(1).max(60),
  heroCtaHref: z.string().min(1).max(300),
  trust: z.array(homepageTrustItemSchema).min(1).max(6),
  promoFooter: z.string().min(1).max(200),
  promos: z.array(homepagePromoItemSchema).min(1).max(6),
  trendingTitle: z.string().min(1).max(120),
  trendingSubtitle: z.string().min(1).max(300),
  offerEyebrow: z.string().min(1).max(120),
  offerHeadline: z.string().min(1).max(160),
  offerBody: z.string().min(1).max(400),
  offerCtaLabel: z.string().min(1).max(60),
  offerCtaHref: z.string().min(1).max(300),
  offerImageUrl: z.string().url(),
  footerBlurb: z.string().min(1).max(500),
});

export type HomepageContent = z.infer<typeof homepageContentSchema>;

export const DEFAULT_HOMEPAGE_CONTENT: HomepageContent = {
  topBarPromo: "New Summer Sale 50% Off · Premium antitarnish pieces",
  topBarEmail: "hello@queensjewelsaura.example",
  heroEyebrow: "Every Piece Of Jewellery Tells A Story",
  heroHeadline: "Classic Jewellery Collection",
  heroBody:
    "Discover Queen's Jewels Aura — premium, antitarnish pieces for every occasion. Guest checkout on WhatsApp; payment arranged with the shop.",
  heroCtaLabel: "Shop now",
  heroCtaHref: "/shop",
  trust: [
    { title: "Premium Quality", detail: "Fine jewellery essentials" },
    { title: "Antitarnish", detail: "Built to stay bright" },
    { title: "Gold Covering", detail: "Warm lasting finish" },
    { title: "Antique Collections", detail: "Heritage-inspired pieces" },
  ],
  promoFooter: "Get exclusive offers on WhatsApp orders",
  promos: [
    {
      title: "Silver Pendant Collection",
      href: "/shop",
      image:
        "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80",
      tone: "bg-blush",
    },
    {
      title: "Stylish Bangles",
      subtitle: "Upto 20% Off Only Today",
      href: "/collections",
      image:
        "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=800&q=80",
      tone: "bg-cream",
    },
    {
      title: "Top Rings Collection",
      subtitle: "Never Go Out Of Style…",
      href: "/category",
      image:
        "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=800&q=80",
      tone: "bg-blush-deep",
    },
  ],
  trendingTitle: "Trending Products",
  trendingSubtitle: "Featured pieces curated for everyday elegance and special occasions.",
  offerEyebrow: "Up to 30% off",
  offerHeadline: "Diamond Engagement Rings",
  offerBody: "Find your perfect match in our wedding ring collection.",
  offerCtaLabel: "Shop now",
  offerCtaHref: "/shop",
  offerImageUrl:
    "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1400&q=80",
  footerBlurb:
    "Premium quality, antitarnish, and gold-covering pieces — plus antique collections. Browse as a guest and complete checkout over WhatsApp.",
};

export function mergeHomepageContent(raw: unknown): HomepageContent {
  if (!raw || typeof raw !== "object") return DEFAULT_HOMEPAGE_CONTENT;
  const merged = { ...DEFAULT_HOMEPAGE_CONTENT, ...(raw as Record<string, unknown>) };
  const parsed = homepageContentSchema.safeParse(merged);
  return parsed.success ? parsed.data : DEFAULT_HOMEPAGE_CONTENT;
}
