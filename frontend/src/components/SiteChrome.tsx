"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";

export function SiteHeader() {
  const { count } = useCart();
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  return (
    <header className="sticky top-0 z-50 bg-white">
      <div className="bg-ink text-[11px] text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2">
          <a href="mailto:hello@jewellerystore.example" className="hidden opacity-90 hover:opacity-100 sm:inline">
            hello@jewellerystore.example
          </a>
          <p className="flex-1 text-center tracking-wide">New collection — WhatsApp checkout · payment arranged with shop</p>
          <div className="hidden items-center gap-4 opacity-90 sm:flex">
            <Link href="/checkout" className="hover:opacity-100">
              Checkout
            </Link>
            <Link href="/contact" className="hover:opacity-100">
              Contact
            </Link>
          </div>
        </div>
      </div>

      <div className="border-b border-line">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-ink text-[10px] tracking-widest">
              JS
            </span>
            <span className="text-sm font-semibold uppercase tracking-[0.18em] text-ink">
              Jewellery Store
            </span>
          </Link>

          <nav className="hidden items-center gap-7 text-[12px] font-medium uppercase tracking-[0.16em] text-ink lg:flex">
            <Link href="/shop" className="hover:opacity-60">
              Jewellery
            </Link>
            <Link href="/collections" className="hover:opacity-60">
              Collection
            </Link>
            <Link href="/category" className="hover:opacity-60">
              Category
            </Link>
            <Link href="/about" className="hover:opacity-60">
              About
            </Link>
            <Link href="/contact" className="hover:opacity-60">
              Contact
            </Link>
          </nav>

          <div className="flex items-center gap-4 text-ink">
            <Link href="/shop" aria-label="Search shop" className="hover:opacity-60">
              <SearchIcon />
            </Link>
            <Link href="/cart" aria-label="Bag" className="relative hover:opacity-60">
              <BagIcon />
              {count > 0 ? (
                <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-ink px-1 text-[10px] text-white">
                  {count}
                </span>
              ) : null}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </svg>
  );
}

function BagIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M6 8h12l-1 12H7L6 8z" />
      <path d="M9 8V6a3 3 0 016 0v2" />
    </svg>
  );
}

export function SiteFooter() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  return (
    <footer className="mt-16 border-t border-line bg-blush">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-ink">Jewellery Store</p>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
            Every piece of jewellery tells a story. Browse as a guest and complete checkout over
            WhatsApp — payment is arranged with the shop.
          </p>
        </div>
        <div className="text-sm text-muted">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-ink">Explore</p>
          <ul className="space-y-2">
            <li>
              <Link href="/shop">Shop</Link>
            </li>
            <li>
              <Link href="/collections">Collections</Link>
            </li>
            <li>
              <Link href="/faq">FAQ</Link>
            </li>
            <li>
              <Link href="/shipping">Shipping</Link>
            </li>
          </ul>
        </div>
        <div className="text-sm text-muted">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-ink">Help</p>
          <ul className="space-y-2">
            <li>
              <Link href="/contact">Contact</Link>
            </li>
            <li>
              <Link href="/privacy">Privacy</Link>
            </li>
            <li>
              <Link href="/terms">Terms</Link>
            </li>
            <li>
              <Link href="/admin/login">Admin</Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line/80 py-4 text-center text-[11px] uppercase tracking-wider text-muted">
        © {new Date().getFullYear()} Jewellery Store
      </div>
    </footer>
  );
}
