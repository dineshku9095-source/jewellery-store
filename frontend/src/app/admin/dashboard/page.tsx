"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { adminDashboard, adminMe } from "@/lib/admin-api";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<{ productCount: number; orderCount: number; pendingOrders: number } | null>(
    null
  );

  useEffect(() => {
    adminMe()
      .then(() => adminDashboard())
      .then((data) => setStats(data.stats))
      .catch(() => router.replace("/admin/login"));
  }, [router]);

  if (!stats) return <p className="text-charcoal-muted">Loading…</p>;

  return (
    <div>
      <h1 className="font-display text-3xl">Dashboard</h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-sm border border-charcoal/10 bg-cream/50 p-6">
          <p className="text-sm uppercase tracking-widest text-charcoal-muted">Products</p>
          <p className="mt-2 font-display text-3xl">{stats.productCount}</p>
        </div>
        <div className="rounded-sm border border-charcoal/10 bg-cream/50 p-6">
          <p className="text-sm uppercase tracking-widest text-charcoal-muted">Orders</p>
          <p className="mt-2 font-display text-3xl">{stats.orderCount}</p>
        </div>
        <div className="rounded-sm border border-charcoal/10 bg-cream/50 p-6">
          <p className="text-sm uppercase tracking-widest text-charcoal-muted">WhatsApp Pending</p>
          <p className="mt-2 font-display text-3xl">{stats.pendingOrders}</p>
        </div>
      </div>
    </div>
  );
}
