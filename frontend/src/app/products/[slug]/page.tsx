import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { apiGet } from "@/lib/api";
import { AddToCart } from "@/components/AddToCart";

export const dynamic = "force-dynamic";

interface ProductDetail {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  images: Array<{ url: string; alt: string | null }>;
  variants: Array<{ id: string; label: string; price: string; stock: number }>;
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  let product: ProductDetail | null = null;
  try {
    const data = await apiGet<{ product: ProductDetail }>(`/api/products/${params.slug}`);
    product = data.product;
  } catch {
    product = null;
  }
  if (!product) notFound();

  const image = product.images[0];

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:gap-10 sm:py-12 md:grid-cols-2">
      <div className="relative aspect-square overflow-hidden bg-soft">
        {image ? (
          <Image
            src={image.url}
            alt={image.alt ?? product.name}
            fill
            className="object-cover"
            sizes="(max-width:768px) 100vw, 50vw"
            priority
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs uppercase tracking-widest text-muted">
            No image
          </div>
        )}
      </div>
      <div>
        <p className="text-[11px] uppercase tracking-[0.22em] text-gold">
          <Link href="/shop" className="hover:text-forest">
            Shop
          </Link>
        </p>
        <h1 className="mt-2 font-display text-3xl text-forest sm:text-4xl">{product.name}</h1>
        {product.description ? (
          <p className="mt-6 text-sm leading-relaxed text-muted sm:text-base">{product.description}</p>
        ) : null}
        <AddToCart
          productSlug={product.slug}
          productName={product.name}
          imageUrl={image?.url}
          variants={product.variants}
        />
      </div>
    </div>
  );
}
