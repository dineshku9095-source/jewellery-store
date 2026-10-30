"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { apiPost, formatINR } from "@/lib/api";

export default function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = new FormData(e.currentTarget);
    try {
      const result = await apiPost<{
        order: { orderNumber: string; whatsappUrl?: string | null };
        message: string;
      }>("/api/checkout", {
        customerName: form.get("customerName"),
        customerPhone: form.get("customerPhone"),
        customerEmail: form.get("customerEmail") || "",
        shippingAddress: form.get("shippingAddress"),
        notes: form.get("notes") || "",
        items: items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
      });
      clear();
      const q = new URLSearchParams({
        order: result.order.orderNumber,
        wa: result.order.whatsappUrl ?? "",
      });
      router.push(`/order/success?${q.toString()}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
    } finally {
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p>Your cart is empty.</p>
        <Link href="/shop" className="btn-primary mt-6 inline-flex">
          Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-display text-4xl text-charcoal">Checkout</h1>
      <p className="mt-2 text-sm text-charcoal-muted">
        No payment gateway — totals are calculated on our server. After placing your order you will
        open WhatsApp to send details to the shop. We do not send WhatsApp messages for you.
      </p>
      <p className="mt-2 text-sm font-medium text-charcoal">
        Payment: to be arranged with the shop.
      </p>
      <p className="mt-4 text-lg">Subtotal {formatINR(subtotal)}</p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <input name="customerName" required placeholder="Full name" className="input-field" />
        <input name="customerPhone" required placeholder="Phone (with country code)" className="input-field" />
        <input name="customerEmail" type="email" placeholder="Email (optional)" className="input-field" />
        <textarea
          name="shippingAddress"
          required
          rows={4}
          placeholder="Shipping address"
          className="input-field"
        />
        <textarea name="notes" rows={3} placeholder="Order notes (optional)" className="input-field" />
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? "Placing order…" : "Place order — WhatsApp Pending"}
        </button>
      </form>
    </div>
  );
}
