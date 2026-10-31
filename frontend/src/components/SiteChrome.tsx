"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useState } from "react";
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

function MobileNavPanel({
  items,
  open,
  onClose,
  panelId,
}: {
  items: HeaderNavItem[];
  open: boolean;
  onClose: () => void;
  panelId: string;
}) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] lg:hidden" role="dialog" aria-modal="true" aria-labelledby={panelId}>
      <button
        type="button"
        className="absolute inset-0 bg-forest/40"
        aria-label="Close menu"
        onClick={onClose}
      />
      <div className="absolute inset-x-0 top-0 max-h-[min(100dvh,100%)] overflow-y-auto border-b border-line bg-cream shadow-lg">
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <p id={panelId} className="text-xs font-semibold uppercase tracking-[0.2em] text-forest">
            Menu
          </p>
          <button
            type="button"
            className="px-2 py-1 text-xs uppercase tracking-widest text-muted hover:text-forest"
            onClick={onClose}
          >
            Close
          </button>
        </div>
        <nav className="px-2 py-2">
          {items.map((item) => {
            const children = item.children.filter((c) => c.visible);
            const hasKids = children.length > 0;
            const isOpen = expanded[item.id] ?? false;
            return (
              <div key={item.id} className="border-b border-line/70">
                <div className="flex items-stretch">
                  <Link
                    href={item.href || "/shop"}
                    className="flex-1 px-3 py-3.5 text-[12px] font-medium uppercase tracking-[0.16em] text-forest"
                    onClick={onClose}
                  >
                    {item.label}
                  </Link>
                  {hasKids ? (
                    <button
                      type="button"
                      className="px-4 text-forest/70"
                      aria-expanded={isOpen}
                      aria-label={`${isOpen ? "Collapse" : "Expand"} ${item.label}`}
                      onClick={() =>
                        setExpanded((prev) => ({ ...prev, [item.id]: !isOpen }))
                      }
                    >
                      {isOpen ? "−" : "+"}
                    </button>
                  ) : null}
                </div>
                {hasKids && isOpen ? (
                  <ul className="bg-blush/50 pb-2">
                    {children.map((child) => (
                      <li key={child.id}>
                        <Link
                          href={child.href || "/shop"}
                          className="block px-5 py-2.5 text-[11px] uppercase tracking-[0.14em] text-muted hover:text-gold"
                          onClick={onClose}
                        >
                          {child.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            );
          })}
        </nav>
        <div className="grid grid-cols-2 gap-2 px-4 py-4">
          <Link href="/shop" className="btn-outline-dark !px-3 !py-2.5 text-[10px]" onClick={onClose}>
            Shop
          </Link>
          <Link href="/cart" className="btn-primary !px-3 !py-2.5 text-[10px]" onClick={onClose}>
            Cart
          </Link>
        </div>
      </div>
    </div>
  );
}

export function SiteHeader() {
  const { count } = useCart();
  const pathname = usePathname();
  const copy = useChromeCopy();
  const [menuOpen, setMenuOpen] = useState(false);
  const panelId = useId();

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  if (pathname?.startsWith("/admin")) return null;

  const navItems = copy.headerNav.items.filter((i) => i.visible);

  return (
    <header className="sticky top-0 z-50 bg-cream">
      <div className="bg-forest text-[10px] text-cream sm:text-[11px]">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-3 py-2 sm:gap-4 sm:px-4">
          <a
            href={`mailto:${copy.contactEmail}`}
            className="hidden truncate text-gold-soft/90 hover:text-gold-soft sm:inline"
          >
            {copy.contactEmail}
          </a>
          <p className="min-w-0 flex-1 truncate text-center tracking-wide text-cream/95">
            {copy.topBarPromo}
          </p>
          <div className="hidden shrink-0 items-center gap-4 text-gold-soft/90 sm:flex">
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
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-3 py-2.5 sm:gap-4 sm:px-4 sm:py-3">
          <Link href="/" className="flex min-w-0 items-center gap-2 sm:gap-3">
            <Image
              src="/brand/qj-logo-mark.png"
              alt={`${copy.storeName} logo`}
              width={52}
              height={52}
              className="h-10 w-10 shrink-0 rounded-full object-cover shadow-sm ring-1 ring-gold/40 sm:h-12 sm:w-12"
              priority
            />
            <span className="hidden leading-tight min-[380px]:block">
              <span className="block truncate font-display text-base tracking-wide text-forest sm:text-lg md:text-xl">
                Queen&apos;s Jewels
              </span>
              <span className="block font-script text-lg text-gold sm:text-xl md:text-2xl">Aura</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-7 text-[12px] font-medium uppercase tracking-[0.16em] text-forest lg:flex">
            {navItems.map((item) => (
              <NavItem key={item.id} item={item} />
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-2 text-forest sm:gap-4">
            <Link href="/shop" aria-label="Search shop" className="hidden hover:text-gold sm:inline">
              <SearchIcon />
            </Link>
            <Link href="/admin/login" aria-label="Account" className="hidden hover:text-gold sm:inline">
              <UserIcon />
            </Link>
            <Link href="/cart" aria-label="Bag" className="relative hover:text-gold">
              <BagIcon />
              {count > 0 ? (
                <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[10px] text-forest-deep">
                  {count}
                </span>
              ) : null}
            </Link>
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center border border-line text-forest hover:border-gold hover:text-gold lg:hidden"
              aria-expanded={menuOpen}
              aria-controls={panelId}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              onClick={() => setMenuOpen((v) => !v)}
            >
              {menuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>
      </div>

      <MobileNavPanel
        items={navItems}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        panelId={panelId}
      />
    </header>
  );
}

function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
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
    <footer className="mt-12 border-t border-gold/20 bg-forest text-cream sm:mt-16">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:gap-10 sm:py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3">
            <Image
              src="/brand/qj-logo-mark.png"
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
              .slice(0, 6)
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
      <div className="border-t border-gold/20 px-4 py-4 text-center text-[11px] uppercase tracking-wider text-cream/60">
        © {new Date().getFullYear()} {copy.storeName}
      </div>
    </footer>
  );
}
