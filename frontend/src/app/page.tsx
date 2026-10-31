import Link from "next/link";
import Image from "next/image";
import { TrendingTabs } from "@/components/TrendingTabs";
import { apiGet, type PublicProduct } from "@/lib/api";

export const dynamic = "force-dynamic";

const HERO_IMG = "/brand/hero-portrait.jpg";

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
];

const TRUST = [
  { title: "Premium Quality", detail: "Fine jewellery essentials" },
  { title: "Antitarnish", detail: "Built to stay bright" },
  { title: "Gold Covering", detail: "Warm lasting finish" },
  { title: "Antique Collections", detail: "Heritage-inspired pieces" },
];

const BANNER_IMG =
  "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1400&q=80";

export default async function HomePage() {
  let products: PublicProduct[] = [];
  try {
    const { products: list } = await apiGet<{ products: PublicProduct[] }>("/api/products");
    products = list;
  } catch {
    products = [];
  }

  return (
    <div>
      {/* Hero — same split layout, green theme + brand portrait */}
      <section className="animate-fade-up bg-cream">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-10 md:grid-cols-2 md:py-16 lg:gap-12">
          <div className="relative aspect-[5/4] overflow-hidden bg-forest md:aspect-[6/5]">
            <Image
              src={HERO_IMG}
              alt="Queen's Jewels Aura — fine jewellery"
              fill
              className="object-cover object-top transition duration-700 hover:scale-[1.02]"
              priority
              sizes="(max-width:768px) 100vw, 50vw"
            />
          </div>
          <div className="px-2 md:px-6">
            <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-gold">
              Every Piece Of Jewellery Tells A Story
            </p>
            <h1 className="mt-4 font-script text-5xl leading-tight text-forest md:text-6xl lg:text-[4.5rem]">
              Classic Jewellery Collection
            </h1>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-muted">
              Discover Queen&apos;s Jewels Aura — premium, antitarnish pieces for every occasion.
              Guest checkout on WhatsApp; payment arranged with the shop.
            </p>
            <Link href="/shop" className="btn-outline-dark mt-8">
              Shop now
            </Link>
          </div>
        </div>
      </section>

      {/* Brand trust strip */}
      <section className="border-y border-line bg-forest">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:grid-cols-2 lg:grid-cols-4">
          {TRUST.map((item) => (
            <div key={item.title} className="text-center lg:text-left">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold">
                {item.title}
              </p>
              <p className="mt-1 text-sm text-cream/75">{item.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Promo grid */}
      <section className="animate-fade-up border-b border-line bg-cream [animation-delay:120ms]">
        <div className="mx-auto grid max-w-7xl md:grid-cols-3">
          {PROMO.map((item) => (
            <div
              key={item.title}
              className={`group relative flex min-h-[320px] flex-col justify-end overflow-hidden p-8 ${item.tone}`}
            >
              <div className="absolute inset-0">
                <Image
                  src={item.image}
                  alt=""
                  fill
                  className="object-cover transition duration-700 group-hover:scale-[1.04]"
                  sizes="33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-cream via-cream/55 to-transparent" />
              </div>
              <div className="relative z-10">
                {item.subtitle ? (
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-forest">
                    {item.subtitle}
                  </p>
                ) : null}
                <h2 className="mt-2 font-display text-2xl text-forest md:text-3xl">{item.title}</h2>
                <Link href={item.href} className="btn-outline-dark mt-5 !px-5 !py-2 text-[10px]">
                  Shop now
                </Link>
              </div>
            </div>
          ))}
        </div>
        <p className="border-t border-line py-3 text-center text-[11px] tracking-wide text-muted">
          Get exclusive offers on WhatsApp orders
        </p>
      </section>

      {/* Trending */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="text-center">
          <h2 className="text-2xl font-semibold uppercase tracking-[0.18em] text-forest md:text-3xl">
            Trending Products
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-muted">
            Featured pieces curated for everyday elegance and special occasions.
          </p>
        </div>
        <TrendingTabs products={products} />
      </section>

      {/* Secondary banner — deep green + gold */}
      <section className="relative overflow-hidden bg-forest">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 5c8 10 20 12 20 28S38 55 30 55 10 49 10 33 22 15 30 5z' fill='%23C5A059' fill-opacity='0.5'/%3E%3C/svg%3E\")",
          }}
        />
        <div className="relative mx-auto grid max-w-7xl items-center gap-8 px-4 py-14 md:grid-cols-2 md:py-20">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-gold">
              Up to 30% off
            </p>
            <h2 className="mt-3 font-script text-5xl text-cream md:text-6xl">
              Diamond Engagement Rings
            </h2>
            <p className="mt-4 max-w-md text-sm text-cream/75">
              Find your perfect match in our wedding ring collection.
            </p>
            <Link href="/shop" className="btn-outline-gold mt-8">
              Shop now
            </Link>
          </div>
          <div className="relative aspect-[5/4] overflow-hidden bg-forest-deep">
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
