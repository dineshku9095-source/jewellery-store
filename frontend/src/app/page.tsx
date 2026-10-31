import Link from "next/link";
import Image from "next/image";
import { TrendingTabs } from "@/components/TrendingTabs";
import { apiGet, type PublicProduct } from "@/lib/api";
import { fetchPublicSettings } from "@/lib/homepage";

export const dynamic = "force-dynamic";

const HERO_IMG = "/brand/hero-portrait.jpg";

const TONE_FALLBACK = ["bg-blush", "bg-cream", "bg-blush-deep"];

export default async function HomePage() {
  let products: PublicProduct[] = [];
  const settings = await fetchPublicSettings();
  const copy = settings.homepage;

  try {
    const { products: list } = await apiGet<{ products: PublicProduct[] }>("/api/products");
    products = list;
  } catch {
    products = [];
  }

  return (
    <div>
      <section className="animate-fade-up bg-cream">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-10 md:grid-cols-2 md:py-16 lg:gap-12">
          <div className="relative aspect-[5/4] overflow-hidden bg-forest md:aspect-[6/5]">
            <Image
              src={HERO_IMG}
              alt={copy.heroHeadline}
              fill
              className="object-cover object-top transition duration-700 hover:scale-[1.02]"
              priority
              sizes="(max-width:768px) 100vw, 50vw"
            />
          </div>
          <div className="px-2 md:px-6">
            <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-gold">
              {copy.heroEyebrow}
            </p>
            <h1 className="mt-4 font-script text-[2.75rem] leading-tight text-forest sm:text-5xl md:text-6xl lg:text-[4.5rem]">
              {copy.heroHeadline}
            </h1>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-muted">{copy.heroBody}</p>
            <Link href={copy.heroCtaHref || "/shop"} className="btn-outline-dark mt-8">
              {copy.heroCtaLabel}
            </Link>
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-forest">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
          {copy.trust.map((item) => (
            <div key={item.title} className="text-center lg:text-left">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold">
                {item.title}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-cream/75">{item.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Gap after trust strip so cards are not flush against the green bar */}
      <section className="animate-fade-up bg-cream pt-8 md:pt-10 [animation-delay:120ms]">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 md:grid-cols-3 md:gap-5 md:px-4">
          {copy.promos.map((item, idx) => (
            <div
              key={`${item.title}-${idx}`}
              className={`group flex min-h-[380px] flex-col overflow-hidden border border-line ${
                item.tone || TONE_FALLBACK[idx % TONE_FALLBACK.length]
              }`}
            >
              {/* Image plane — overflow clipped here only, not the CTA block */}
              <div className="relative min-h-[200px] flex-1 overflow-hidden">
                <Image
                  src={item.image}
                  alt=""
                  fill
                  className="object-cover transition duration-700 group-hover:scale-[1.04]"
                  sizes="(max-width:768px) 100vw, 33vw"
                />
              </div>
              {/* Solid content panel keeps SHOP NOW fully visible with padding */}
              <div className="relative z-10 flex flex-col bg-cream/95 px-6 pb-7 pt-5">
                <div className="min-h-[1.25rem]">
                  {item.subtitle ? (
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-forest">
                      {item.subtitle}
                    </p>
                  ) : (
                    <span className="block h-[1.25rem]" aria-hidden />
                  )}
                </div>
                <h2 className="mt-2 font-display text-2xl leading-snug text-forest md:text-[1.65rem]">
                  {item.title}
                </h2>
                <Link
                  href={item.href || "/shop"}
                  className="btn-outline-dark mt-5 inline-flex w-fit shrink-0 !px-5 !py-2.5 text-[10px]"
                >
                  Shop now
                </Link>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-6 border-t border-line py-4 text-center text-[11px] tracking-wide text-muted">
          {copy.promoFooter}
        </p>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="text-center">
          <h2 className="text-2xl font-semibold uppercase tracking-[0.18em] text-forest md:text-3xl">
            {copy.trendingTitle}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-muted">{copy.trendingSubtitle}</p>
        </div>
        <TrendingTabs products={products} />
      </section>

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
              {copy.offerEyebrow}
            </p>
            <h2 className="mt-3 font-script text-[2.75rem] leading-tight text-cream sm:text-5xl md:text-6xl">
              {copy.offerHeadline}
            </h2>
            <p className="mt-4 max-w-md text-sm text-cream/75">{copy.offerBody}</p>
            <Link href={copy.offerCtaHref || "/shop"} className="btn-outline-gold mt-8">
              {copy.offerCtaLabel}
            </Link>
          </div>
          <div className="relative aspect-[5/4] overflow-hidden bg-forest-deep">
            <Image
              src={copy.offerImageUrl}
              alt={copy.offerHeadline}
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
