"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";

export function SiteHeader() {
  const { count } = useCart();

  return (
    <header className="border-b border-charcoal/10 bg-ivory/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-5">
        <Link href="/" className="font-display text-2xl tracking-wide text-charcoal">
          Refine Gilt
        </Link>
        <nav className="hidden items-center gap-6 text-sm uppercase tracking-widest text-charcoal-muted md:flex">
          <Link href="/shop" className="hover:text-champagne-dark">
            Shop
          </Link>
          <Link href="/collections" className="hover:text-champagne-dark">
            Collections
          </Link>
          <Link href="/about" className="hover:text-champagne-dark">
            About
          </Link>
          <Link href="/contact" className="hover:text-champagne-dark">
            Contact
          </Link>
        </nav>
        <Link
          href="/cart"
          className="text-sm uppercase tracking-widest text-charcoal hover:text-champagne-dark"
        >
          Cart ({count})
        </Link>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-charcoal/10 bg-cream">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-3">
        <div>
          <p className="font-display text-xl text-charcoal">Refine Gilt</p>
          <p className="mt-2 text-sm text-charcoal-muted">
            Handcrafted jewellery. Checkout completes via WhatsApp with the shop — we never send
            messages automatically.
          </p>
        </div>
        <div className="text-sm text-charcoal-muted">
          <p className="mb-2 font-medium uppercase tracking-widest text-charcoal">Explore</p>
          <ul className="space-y-1">
            <li>
              <Link href="/faq">FAQ</Link>
            </li>
            <li>
              <Link href="/shipping">Shipping</Link>
            </li>
            <li>
              <Link href="/privacy">Privacy</Link>
            </li>
            <li>
              <Link href="/terms">Terms</Link>
            </li>
          </ul>
        </div>
        <div className="text-sm text-charcoal-muted">
          <p className="mb-2 font-medium uppercase tracking-widest text-charcoal">Admin</p>
          <Link href="/admin/login">Store login</Link>
        </div>
      </div>
    </footer>
  );
}
