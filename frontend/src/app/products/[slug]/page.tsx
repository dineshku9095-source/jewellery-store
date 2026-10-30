"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { formatINR, apiGet } from "@/lib/api";
import { useCart } from "@/context/CartContext";

interface ProductDetail {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  images: Array<{ url: string; alt: string | null }>;
  variants: Array<{ id: string; label: string; price: string; stock: number }>;
}

export default function ProductPage({ params }: { params: { slug: string } }) {
  const { addItem } = useCart();
  const router = useRouter();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [variantId, setVariantId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiGet<{ product: ProductDetail }>(`/api/products/${params.slug}`)
      .then((data) => {
        setProduct(data.product);
        setVariantId(data.product.variants[0]?.id ?? "");
      })
      .catch((e) => setError(e.message));
  }, [params.slug]);

  if (error) return <p className="p-8 text-red-700">{error}</p>;
  if (!product) return <p className="p-8 text-charcoal-muted">Loading…</p>;

  const image = product.images[0];
  const variant = product.variants.find((v) => v.id === variantId) ?? product.variants[0];

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-2">
      <div className="relative aspect-square bg-cream">
        {image ? (
          <Image src={image.url} alt={image.alt ?? product.name} fill className="object-cover" />
        ) : null}
      </div>
      <div>
        <h1 className="font-display text-4xl text-charcoal">{product.name}</h1>
        {variant ? (
          <p className="mt-2 text-xl text-champagne-dark">{formatINR(variant.price)}</p>
        ) : null}
        {product.description ? (
          <p className="mt-6 text-charcoal-muted">{product.description}</p>
        ) : null}
        <label className="mt-8 block text-sm uppercase tracking-widest text-charcoal-muted">
          Variant
          <select
            className="input-field mt-2"
            value={variantId}
            onChange={(e) => setVariantId(e.target.value)}
          >
            {product.variants.map((v) => (
              <option key={v.id} value={v.id} disabled={v.stock < 1}>
                {v.label} {v.stock < 1 ? "(out of stock)" : ""}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className="btn-primary mt-6 w-full md:w-auto"
          disabled={!variant || variant.stock < 1}
          onClick={() => {
            if (!variant) return;
            addItem({
              variantId: variant.id,
              productSlug: product.slug,
              productName: product.name,
              variantLabel: variant.label,
              unitPrice: variant.price,
              imageUrl: image?.url,
            });
            router.push("/cart");
          }}
        >
          Add to cart
        </button>
      </div>
    </div>
  );
}
