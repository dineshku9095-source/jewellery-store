import Link from "next/link";
import Image from "next/image";
import { formatINR, type PublicProduct } from "@/lib/api";

/** Demo sale compare-at prices for Elements-style strikethrough (slug → original). */
const SALE_COMPARE: Record<string, string> = {
  "ivory-pendant-necklace": "15600",
  "rose-gold-hoops": "9800",
  "pearl-drop-earrings": "7200",
};

export function ProductCard({ product }: { product: PublicProduct }) {
  const image = product.images[0];
  const variant = product.variants[0];
  const price = variant?.price ?? "0";
  const outOfStock = product.variants.length > 0 && product.variants.every((v) => v.stock <= 0);
  const compareAt = SALE_COMPARE[product.slug];
  const onSale = Boolean(compareAt) && !outOfStock;

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="relative aspect-square overflow-hidden bg-soft">
        {image ? (
          <Image
            src={image.url}
            alt={image.alt ?? product.name}
            fill
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
            sizes="(max-width:768px) 50vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs uppercase tracking-widest text-muted">
            No image
          </div>
        )}
        {onSale ? (
          <span className="absolute left-3 top-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-sale">
            Sale
          </span>
        ) : null}
        {outOfStock ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/55">
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink">
              Out of stock
            </span>
          </div>
        ) : null}
      </div>
      <div className="mt-4 text-center">
        <h3 className="text-sm font-medium text-ink">{product.name}</h3>
        <p className="mt-1 text-sm text-muted">
          {formatINR(price)}
          {compareAt ? (
            <span className="ml-2 text-xs text-muted/70 line-through">{formatINR(compareAt)}</span>
          ) : null}
        </p>
      </div>
    </Link>
  );
}
