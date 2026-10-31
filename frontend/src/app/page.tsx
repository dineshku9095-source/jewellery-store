import Link from "next/link";
import Image from "next/image";
import { ProductCard } from "@/components/ProductCard";
import { TrendingTabs } from "@/components/TrendingTabs";
import { apiGet, type PublicProduct } from "@/lib/api";

export const dynamic = "force-dynamic";

const HERO_IMG =
  "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1200&q=80";
const PROMO = [
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
    tone: "bg-white",
  },
  {
    title: "Top Rings Collection",
    subtitle: "Never Go Out Of Style…",
    href: "/category",
    image:
      "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=800&q=80",
    tone: "bg-blush-deep",
  },
];

const BANNER_IMG =
  "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1400&q=80";

export default async function HomePage() {
  let products: PublicProduct[] = [];
  let heroImage = HERO_IMG;
  try {
    const [{ products: list }, { banners }] = await Promise.all([
      apiGet<{ products: PublicProduct[] }>("/api/products"),
      apiGet<{
        banners: Array<{ title: string; imageUrl: string }>;
      }>("/api/banners"),
    ]);
    products = list;
    if (banners[0]?.imageUrl) heroImage = banners[0].imageUrl;
  } catch {
    products = [];
  }

  return (
    <div>
      {/* Hero — Elements-style split */}
      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-10 md:grid-cols-2 md:py-16 lg:gap-12">
          <div className="relative aspect-[5/4] overflow-hidden bg-soft md:aspect-[6/5]">
            <Image
              src={heroImage}
              alt="Classic jewellery collection"
              fill
              className="object-cover"
              priority
              sizes="(max-width:768px) 100vw, 50vw"
            />
          </div>
          <div className="px-2 md:px-6">
            <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-muted">
              Every Piece Of Jewellery Tells A Story
            </p>
            <h1 className="mt-4 font-script text-5xl leading-tight text-ink md:text-6xl lg:text-7xl">
              Classic Jewellery Collection
            </h1>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-muted">
              Discover refined pieces for every occasion. Guest checkout — complete your order on
              WhatsApp. Payment to be arranged with the shop.
            </p>
            <Link href="/shop" className="btn-outline-dark mt-8">
              Shop now
            </Link>
          </div>
        </div>
      </section>

      {/* Promo grid */}
      <section className="border-y border-line bg-white">
        <div className="mx-auto grid max-w-7xl md:grid-cols-3">
          {PROMO.map((item) => (
            <div
              key={item.title}
              className={`relative flex min-h-[280px] flex-col justify-end overflow-hidden p-8 ${item.tone}`}
            >
              <div className="absolute inset-0 opacity-90">
                <Image src={item.image} alt="" fill className="object-cover" sizes="33vw" />
                <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/40 to-transparent" />
              </div>
              <div className="relative z-10">
                {item.subtitle ? (
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink">
                    {item.subtitle}
                  </p>
                ) : null}
                <h2 className="mt-2 font-display text-2xl text-ink md:text-3xl">{item.title}</h2>
                <Link href={item.href} className="btn-outline-dark mt-5 !px-5 !py-2 text-[10px]">
                  Shop now
                </Link>
              </div>
            </div>
          ))}
        </div>
        <p className="border-t border-line py-3 text-center text-[11px] tracking-wide text-muted">
          Get exclusive offers on orders confirmed over WhatsApp
        </p>
      </section>

      {/* Trending */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="text-center">
          <h2 className="text-2xl font-semibold uppercase tracking-[0.18em] text-ink md:text-3xl">
            Trending Products
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-muted">
            Featured pieces curated for everyday elegance and special occasions.
          </p>
        </div>
        <TrendingTabs products={products} />
      </section>

      {/* Secondary banner */}
      <section className="relative overflow-hidden bg-blush">
        <div className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 5c8 10 20 12 20 28S38 55 30 55 10 49 10 33 22 15 30 5z' fill='%23111111' fill-opacity='0.4'/%3E%3C/svg%3E\")",
          }}
        />
        <div className="relative mx-auto grid max-w-7xl items-center gap-8 px-4 py-14 md:grid-cols-2 md:py-20">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-ink">
              Up to 30% off
            </p>
            <h2 className="mt-3 font-script text-5xl text-ink md:text-6xl">
              Diamond Engagement Rings
            </h2>
            <p className="mt-4 max-w-md text-sm text-muted">
              Find your perfect match in our wedding ring collection.
            </p>
            <Link href="/shop" className="btn-solid-dark mt-8">
              Shop now
            </Link>
          </div>
          <div className="relative aspect-[5/4] overflow-hidden bg-blush-deep">
            <Image
              src={BANNER_IMG}
              alt="Engagement rings"
              fill
              className="object-cover"
              sizes="(max-width:768px) 100vw, 50vw"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
