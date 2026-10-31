"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatINR } from "@/lib/api";
import { useCart } from "@/context/CartContext";

type Variant = { id: string; label: string; price: string; stock: number };

export function AddToCart({
  productSlug,
  productName,
  imageUrl,
  variants,
}: {
  productSlug: string;
  productName: string;
  imageUrl?: string;
  variants: Variant[];
}) {
  const { addItem } = useCart();
  const router = useRouter();
  const [variantId, setVariantId] = useState(variants[0]?.id ?? "");
  const variant = variants.find((v) => v.id === variantId) ?? variants[0];

  return (
    <div>
      {variant ? (
        <p className="mt-2 text-xl text-muted">{formatINR(variant.price)}</p>
      ) : null}
      <label className="mt-8 block text-sm uppercase tracking-widest text-muted">
        Variant
        <select
          className="input-field mt-2"
          value={variantId}
          onChange={(e) => setVariantId(e.target.value)}
        >
          {variants.map((v) => (
            <option key={v.id} value={v.id} disabled={v.stock < 1}>
              {v.label} {v.stock < 1 ? "(out of stock)" : ""}
            </option>
          ))}
        </select>
      </label>
      <button
        type="button"
        className="btn-primary mt-6 w-full sm:w-auto"
        disabled={!variant || variant.stock < 1}
        onClick={() => {
          if (!variant) return;
          addItem({
            variantId: variant.id,
            productSlug,
            productName,
            variantLabel: variant.label,
            unitPrice: variant.price,
            imageUrl,
          });
          router.push("/cart");
        }}
      >
        Add to cart
      </button>
    </div>
  );
}
