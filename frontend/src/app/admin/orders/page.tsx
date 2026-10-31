"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { adminList, adminMe, adminUpdate } from "@/lib/admin-api";
import {
  AdminEmpty,
  AdminPageHeader,
  AdminPanel,
  AdminToast,
  useToast,
} from "@/components/admin/AdminUi";

const STATUSES = [
  "WHATSAPP_PENDING",
  "CONTACTED",
  "CONFIRMED",
  "PREPARING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const;

type Order = {
  id: string;
  orderNumber: string;
  status: string;
  customerName: string;
  customerPhone?: string;
  createdAt?: string;
};

export default function AdminOrdersPage() {
  const router = useRouter();
  const { toast, showOk, showErr, clear } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState("");

  const load = useCallback(async () => {
    const q = filter ? `?status=${encodeURIComponent(filter)}` : "";
    const data = await adminList<{ orders: Order[] }>(`/api/admin/orders${q}`);
    setOrders(data.orders);
  }, [filter]);

  useEffect(() => {
    adminMe()
      .then(load)
      .catch(() => router.replace("/admin/login"));
  }, [load, router]);

  async function quickStatus(order: Order, status: string) {
    try {
      await adminUpdate(`/api/admin/orders/${order.id}/status`, { status });
      showOk(`${order.orderNumber} → ${status}`);
      await load();
    } catch (err) {
      showErr(err instanceof Error ? err.message : "Status update failed");
    }
  }

  return (
    <div>
      <AdminPageHeader
        title="Orders"
        subtitle="WhatsApp checkout pipeline — update status inline."
        actions={
          <select
            className="input-field w-auto text-sm"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        }
      />
      <AdminToast message={toast?.message ?? null} tone={toast?.tone} onClear={clear} />

      {orders.length === 0 ? (
        <AdminEmpty message="No orders match this filter." />
      ) : (
        <div className="space-y-2">
          {orders.map((o) => (
            <AdminPanel key={o.id} className="flex flex-wrap items-center justify-between gap-3 !py-3">
              <div>
                <Link href={`/admin/orders/${o.id}`} className="font-medium text-forest underline-offset-2 hover:underline">
                  {o.orderNumber}
                </Link>
                <p className="text-xs text-muted">
                  {o.customerName}
                  {o.customerPhone ? ` · ${o.customerPhone}` : ""} · {o.status}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  className="input-field w-auto !py-2 text-xs"
                  defaultValue=""
                  onChange={(e) => {
                    if (e.target.value) quickStatus(o, e.target.value);
                    e.target.value = "";
                  }}
                >
                  <option value="">Set status…</option>
                  {STATUSES.filter((s) => s !== o.status).map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <Link href={`/admin/orders/${o.id}`} className="btn-outline-dark !px-3 !py-1.5 text-[10px]">
                  Open
                </Link>
              </div>
            </AdminPanel>
          ))}
        </div>
      )}
    </div>
  );
}
