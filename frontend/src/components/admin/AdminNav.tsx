"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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
  if (pathname === "/admin/login") return null;

  return (
    <aside className="border-b border-charcoal/10 bg-charcoal text-ivory md:border-b-0 md:border-r md:min-h-[60vh]">
      <div className="px-4 py-4 font-display text-lg">Admin</div>
      <nav className="flex flex-wrap gap-2 px-4 pb-4 md:flex-col md:gap-1">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`rounded-sm px-3 py-2 text-sm uppercase tracking-widest ${
              pathname.startsWith(l.href) ? "bg-champagne text-charcoal" : "text-ivory/80 hover:text-champagne"
            }`}
          >
            {l.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
