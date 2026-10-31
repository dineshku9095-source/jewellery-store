"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { formatINR } from "@/lib/api";

export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotal } = useCart();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="font-display text-4xl">Your cart</h1>
        <p className="mt-4 text-charcoal-muted">Your cart is empty.</p>
        <Link href="/shop" className="btn-primary mt-8 inline-flex">
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="font-display text-4xl text-charcoal">Your cart</h1>
      <ul className="mt-8 divide-y divide-charcoal/10">
        {items.map((item) => (
          <li key={item.variantId} className="flex gap-4 py-6">
            {item.imageUrl ? (
              <div className="relative h-24 w-20 shrink-0 bg-cream">
                <Image src={item.imageUrl} alt="" fill className="object-cover" />
              </div>
            ) : null}
            <div className="flex-1">
              <p className="font-display text-lg">{item.productName}</p>
              <p className="text-sm text-charcoal-muted">{item.variantLabel}</p>
              <p className="mt-1 text-champagne-dark">{formatINR(item.unitPrice)}</p>
              <div className="mt-3 flex items-center gap-3">
                <label className="text-xs uppercase tracking-widest">
                  Qty
                  <input
                    type="number"
                    min={1}
                    className="input-field ml-2 inline-block w-20 py-1"
                    value={item.quantity}
                    onChange={(e) => updateQuantity(item.variantId, parseInt(e.target.value, 10) || 1)}
                  />
                </label>
                <button
                  type="button"
                  className="text-sm text-charcoal-muted underline"
                  onClick={() => removeItem(item.variantId)}
                >
                  Remove
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-8 flex flex-col gap-4 border-t border-charcoal/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-display text-2xl">Subtotal {formatINR(subtotal)}</p>
        <Link href="/checkout" className="btn-primary w-full justify-center sm:w-auto">
          Checkout
        </Link>
      </div>
    </div>
  );
}
