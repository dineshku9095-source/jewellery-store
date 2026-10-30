import Link from "next/link";
import Image from "next/image";
import { formatINR, type PublicProduct } from "@/lib/api";

export function ProductCard({ product }: { product: PublicProduct }) {
  const image = product.images[0];
  const price = product.variants[0]?.price ?? "0";

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block overflow-hidden rounded-sm border border-charcoal/10 bg-cream/30 transition hover:border-champagne/40"
    >
      <div className="relative aspect-[4/5] bg-cream">
        {image ? (
          <Image
            src={image.url}
            alt={image.alt ?? product.name}
            fill
            className="object-cover transition duration-500 group-hover:scale-105"
            sizes="(max-width:768px) 100vw, 33vw"
          />
        ) : null}
      </div>
      <div className="p-4">
        <h3 className="font-display text-lg text-charcoal">{product.name}</h3>
        <p className="mt-1 text-sm text-champagne-dark">From {formatINR(price)}</p>
      </div>
    </Link>
  );
}
