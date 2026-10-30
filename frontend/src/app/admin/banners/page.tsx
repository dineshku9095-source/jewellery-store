"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { adminList, adminMe } from "@/lib/admin-api";

export default function AdminBannersPage() {
  const router = useRouter();
  const [banners, setBanners] = useState<Array<{ id: string; title: string; isActive: boolean }>>([]);

  useEffect(() => {
    adminMe()
      .then(() => adminList<{ banners: typeof banners }>("/api/admin/banners"))
      .then((data) => setBanners(data.banners))
      .catch(() => router.replace("/admin/login"));
  }, [router]);

  return (
    <div>
      <h1 className="font-display text-3xl">Banners</h1>
      <ul className="mt-6 space-y-2">
        {banners.map((b) => (
          <li key={b.id} className="rounded-sm border border-charcoal/10 px-4 py-3">
            {b.title} — {b.isActive ? "Active" : "Inactive"}
          </li>
        ))}
      </ul>
    </div>
  );
}
