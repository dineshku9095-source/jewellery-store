import Link from "next/link";
import Image from "next/image";
import { ProductCard } from "@/components/ProductCard";
import { apiGet, type PublicProduct } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [{ products }, { banners }] = await Promise.all([
    apiGet<{ products: PublicProduct[] }>("/api/products"),
    apiGet<{ banners: Array<{ title: string; subtitle?: string | null; imageUrl: string; linkUrl?: string | null }> }>(
      "/api/banners"
    ),
  ]);

  const hero = banners[0];

  return (
    <div>
      <section className="relative bg-charcoal text-ivory">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16 md:grid-cols-2 md:items-center">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-champagne">Refine Gilt</p>
            <h1 className="mt-4 font-display text-5xl leading-tight">
              Jewellery in ivory, cream &amp; champagne gold
            </h1>
            <p className="mt-6 max-w-md text-ivory/80">
              Browse as a guest, checkout without an account, and complete your order over WhatsApp
              with our team. Payment is arranged directly with the shop.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/shop" className="btn-primary">
                Shop now
              </Link>
              <Link href="/collections" className="btn-outline border-ivory/30 text-ivory hover:border-champagne">
                Collections
              </Link>
            </div>
          </div>
          {hero ? (
            <div className="relative aspect-[4/3] overflow-hidden rounded-sm">
              <Image src={hero.imageUrl} alt={hero.title} fill className="object-cover" priority />
            </div>
          ) : null}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="font-display text-3xl text-charcoal">Featured pieces</h2>
          <Link href="/shop" className="text-sm uppercase tracking-widest text-champagne-dark">
            View all
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.slice(0, 6).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
}
