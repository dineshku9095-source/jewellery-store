"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { adminLogout } from "@/lib/admin-api";

const links = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/collections", label: "Collections" },
  { href: "/admin/banners", label: "Banners" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/settings", label: "Settings" },
  { href: "/admin/profile", label: "Profile" },
  { href: "/admin/audit", label: "Audit" },
];

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();
  if (pathname === "/admin/login") return null;

  async function logout() {
    try {
      await adminLogout();
    } catch {
      // still leave the session UI
    }
    router.replace("/admin/login");
  }

  return (
    <aside className="border-b border-gold/20 bg-forest text-cream md:min-h-[70vh] md:w-56 md:shrink-0 md:border-b-0 md:border-r">
      <div className="px-4 py-5">
        <p className="font-display text-lg text-gold-soft">Queen&apos;s Jewels</p>
        <p className="font-script text-xl text-gold">Aura Admin</p>
      </div>
      <nav className="flex flex-wrap gap-1 px-3 pb-4 md:flex-col">
        {links.map((l) => {
          const active = pathname.startsWith(l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded px-3 py-2 text-[11px] font-medium uppercase tracking-[0.14em] ${
                active ? "bg-gold text-forest-deep" : "text-cream/80 hover:bg-forest-deep hover:text-gold-soft"
              }`}
            >
              {l.label}
            </Link>
          );
        })}
        <button
          type="button"
          onClick={logout}
          className="mt-2 rounded px-3 py-2 text-left text-[11px] font-medium uppercase tracking-[0.14em] text-cream/60 hover:text-gold-soft md:mt-4"
        >
          Sign out
        </button>
      </nav>
    </aside>
  );
}
