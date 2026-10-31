"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  DEFAULT_HEADER_NAV,
  DEFAULT_HOMEPAGE_CONTENT,
  type HeaderNav,
  type HeaderNavItem,
  type HomepageContent,
} from "@jewellery/shared";
import { useCart } from "@/context/CartContext";

type ChromeCopy = {
  storeName: string;
  contactEmail: string;
  topBarPromo: string;
  footerBlurb: string;
  headerNav: HeaderNav;
};

const DEFAULT_CHROME: ChromeCopy = {
  storeName: "Queen's Jewels Aura",
  contactEmail: DEFAULT_HOMEPAGE_CONTENT.topBarEmail || "hello@queensjewelsaura.example",
  topBarPromo: DEFAULT_HOMEPAGE_CONTENT.topBarPromo,
  footerBlurb: DEFAULT_HOMEPAGE_CONTENT.footerBlurb,
  headerNav: DEFAULT_HEADER_NAV,
};

function useChromeCopy(): ChromeCopy {
  const [copy, setCopy] = useState<ChromeCopy>(DEFAULT_CHROME);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/settings/public", { credentials: "include" })
      .then((r) => r.json())
      .then(
        (data: {
          settings?: {
            storeName?: string;
            contactEmail?: string | null;
            homepage?: HomepageContent;
            headerNav?: HeaderNav;
          };
        }) => {
          if (cancelled || !data.settings) return;
          const home = data.settings.homepage ?? DEFAULT_HOMEPAGE_CONTENT;
          setCopy({
            storeName: data.settings.storeName || DEFAULT_CHROME.storeName,
            contactEmail:
              home.topBarEmail || data.settings.contactEmail || DEFAULT_CHROME.contactEmail,
            topBarPromo: home.topBarPromo || DEFAULT_CHROME.topBarPromo,
            footerBlurb: home.footerBlurb || DEFAULT_CHROME.footerBlurb,
            headerNav: data.settings.headerNav ?? DEFAULT_HEADER_NAV,
          });
        }
      )
      .catch(() => {
        /* keep defaults */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return copy;
}

function NavItem({ item }: { item: HeaderNavItem }) {
  const children = item.children.filter((c) => c.visible);
  const hasDropdown = children.length > 0;

  if (!hasDropdown) {
    return (
      <Link href={item.href || "/shop"} className="hover:text-gold">
        {item.label}
      </Link>
    );
  }

  return (
    <div className="group relative">
      <Link
        href={item.href || "/shop"}
        className="inline-flex items-center gap-1 hover:text-gold"
        aria-haspopup="true"
      >
        {item.label}
        <span className="text-[9px] opacity-70" aria-hidden>
          ▾
        </span>
      </Link>
      <div className="invisible absolute left-0 top-full z-50 min-w-[180px] pt-2 opacity-0 transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
        <ul className="border border-line bg-cream py-2 shadow-sm">
          {children.map((child) => (
            <li key={child.id}>
              <Link
                href={child.href || "/shop"}
                className="block px-4 py-2 text-[11px] font-medium uppercase tracking-[0.14em] text-forest hover:bg-blush hover:text-gold"
              >
                {child.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function SiteHeader() {
  const { count } = useCart();
  const pathname = usePathname();
  const copy = useChromeCopy();
  if (pathname?.startsWith("/admin")) return null;

  const navItems = copy.headerNav.items.filter((i) => i.visible);

  return (
    <header className="sticky top-0 z-50 bg-cream">
      <div className="bg-forest text-[11px] text-cream">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2">
          <a
            href={`mailto:${copy.contactEmail}`}
            className="hidden text-gold-soft/90 hover:text-gold-soft sm:inline"
          >
            {copy.contactEmail}
          </a>
          <p className="flex-1 text-center tracking-wide text-cream/95">{copy.topBarPromo}</p>
          <div className="hidden items-center gap-4 text-gold-soft/90 sm:flex">
            <Link href="/checkout" className="hover:text-gold-soft">
              Checkout
            </Link>
            <Link href="/cart" className="hover:text-gold-soft">
              Wishlist
            </Link>
            <Link href="/contact" className="hover:text-gold-soft">
              Contact
            </Link>
          </div>
        </div>
      </div>

      <div className="border-b border-line bg-cream">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/brand/qj-logo.jpg"
              alt={`${copy.storeName} logo`}
              width={52}
              height={52}
              className="h-12 w-12 rounded-full object-cover shadow-sm ring-1 ring-gold/40"
              priority
            />
            <span className="leading-tight">
              <span className="block font-display text-lg tracking-wide text-forest md:text-xl">
                Queen&apos;s Jewels
              </span>
              <span className="block font-script text-xl text-gold md:text-2xl">Aura</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-7 text-[12px] font-medium uppercase tracking-[0.16em] text-forest lg:flex">
            {navItems.map((item) => (
              <NavItem key={item.id} item={item} />
            ))}
          </nav>

          {/* Mobile: compact links */}
          <nav className="flex max-w-[45%] flex-wrap justify-end gap-x-3 gap-y-1 text-[10px] font-medium uppercase tracking-[0.12em] text-forest lg:hidden">
            {navItems.slice(0, 4).map((item) => (
              <Link key={item.id} href={item.href || "/shop"} className="hover:text-gold">
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4 text-forest">
            <Link href="/shop" aria-label="Search shop" className="hover:text-gold">
              <SearchIcon />
            </Link>
            <Link href="/admin/login" aria-label="Account" className="hidden hover:text-gold sm:inline">
              <UserIcon />
            </Link>
            <Link href="/cart" aria-label="Wishlist" className="hidden hover:text-gold sm:inline">
              <HeartIcon />
            </Link>
            <Link href="/cart" aria-label="Bag" className="relative hover:text-gold">
              <BagIcon />
              {count > 0 ? (
                <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[10px] text-forest-deep">
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

function UserIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 19c1.5-3.5 4-5 7-5s5.5 1.5 7 5" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 20s-7-4.5-7-10a4 4 0 017-2.5A4 4 0 0119 10c0 5.5-7 10-7 10z" />
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
  const copy = useChromeCopy();
  if (pathname?.startsWith("/admin")) return null;

  return (
    <footer className="mt-16 border-t border-gold/20 bg-forest text-cream">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3">
            <Image
              src="/brand/qj-logo.jpg"
              alt=""
              width={48}
              height={48}
              className="h-12 w-12 rounded-full object-cover ring-1 ring-gold/50"
            />
            <div>
              <p className="font-display text-lg text-gold-soft">Queen&apos;s Jewels</p>
              <p className="font-script text-xl text-gold">Aura</p>
            </div>
          </div>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-cream/75">{copy.footerBlurb}</p>
        </div>
        <div className="text-sm text-cream/75">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-gold">Explore</p>
          <ul className="space-y-2">
            {copy.headerNav.items
              .filter((i) => i.visible)
              .slice(0, 5)
              .map((item) => (
                <li key={item.id}>
                  <Link href={item.href || "/shop"} className="hover:text-gold-soft">
                    {item.label}
                  </Link>
                </li>
              ))}
          </ul>
        </div>
        <div className="text-sm text-cream/75">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-gold">Help</p>
          <ul className="space-y-2">
            <li>
              <Link href="/contact" className="hover:text-gold-soft">
                Contact
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="hover:text-gold-soft">
                Privacy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-gold-soft">
                Terms
              </Link>
            </li>
            <li>
              <Link href="/admin/login" className="hover:text-gold-soft">
                Admin
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gold/20 py-4 text-center text-[11px] uppercase tracking-wider text-cream/60">
        © {new Date().getFullYear()} {copy.storeName}
      </div>
    </footer>
  );
}
