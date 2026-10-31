"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { adminDashboard, adminMe } from "@/lib/admin-api";
import { AdminPageHeader, AdminPanel } from "@/components/admin/AdminUi";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<{
    productCount: number;
    orderCount: number;
    pendingOrders: number;
  } | null>(null);

  useEffect(() => {
    adminMe()
      .then(() => adminDashboard())
      .then((data) => setStats(data.stats))
      .catch(() => router.replace("/admin/login"));
  }, [router]);

  if (!stats) return <p className="text-muted">Loading…</p>;

  return (
    <div>
      <AdminPageHeader
        title="Dashboard"
        subtitle="Queen's Jewels Aura catalogue & WhatsApp orders."
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <AdminPanel>
          <p className="text-[11px] uppercase tracking-[0.16em] text-muted">Products</p>
          <p className="mt-2 font-display text-3xl text-forest">{stats.productCount}</p>
          <Link href="/admin/products" className="mt-3 inline-block text-xs text-gold underline">
            Manage
          </Link>
        </AdminPanel>
        <AdminPanel>
          <p className="text-[11px] uppercase tracking-[0.16em] text-muted">Orders</p>
          <p className="mt-2 font-display text-3xl text-forest">{stats.orderCount}</p>
          <Link href="/admin/orders" className="mt-3 inline-block text-xs text-gold underline">
            View orders
          </Link>
        </AdminPanel>
        <AdminPanel>
          <p className="text-[11px] uppercase tracking-[0.16em] text-muted">WhatsApp pending</p>
          <p className="mt-2 font-display text-3xl text-forest">{stats.pendingOrders}</p>
          <Link href="/admin/orders" className="mt-3 inline-block text-xs text-gold underline">
            Follow up
          </Link>
        </AdminPanel>
      </div>
    </div>
  );
}
