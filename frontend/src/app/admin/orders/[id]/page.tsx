"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { adminList, adminMe, adminUpdate } from "@/lib/admin-api";
import {
  AdminField,
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

type OrderDetail = {
  id: string;
  orderNumber: string;
  status: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  shippingAddress: string;
  notes?: string | null;
  whatsappUrl?: string | null;
  subtotal?: string;
  items?: Array<{
    productName: string;
    variantLabel: string;
    quantity: number;
    lineTotal: string;
  }>;
};

export default function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { toast, showOk, showErr, clear } = useToast();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [nextStatus, setNextStatus] = useState("CONTACTED");
  const [note, setNote] = useState("");

  const load = useCallback(async () => {
    const data = await adminList<{ order: OrderDetail }>(`/api/admin/orders/${params.id}`);
    setOrder(data.order);
    setNextStatus(data.order.status === "WHATSAPP_PENDING" ? "CONTACTED" : data.order.status);
  }, [params.id]);

  useEffect(() => {
    adminMe()
      .then(load)
      .catch(() => router.replace("/admin/login"));
  }, [load, router]);

  async function updateStatus() {
    if (!order) return;
    try {
      await adminUpdate(`/api/admin/orders/${order.id}/status`, {
        status: nextStatus,
        note: note.trim() || undefined,
      });
      setNote("");
      showOk("Status updated");
      await load();
    } catch (err) {
      showErr(err instanceof Error ? err.message : "Update failed");
    }
  }

  if (!order) return <p className="text-muted">Loading…</p>;

  return (
    <div>
      <AdminPageHeader
        title={order.orderNumber}
        subtitle={`${order.customerName} · ${order.status}`}
        actions={
          <Link href="/admin/orders" className="btn-outline-dark !px-4 !py-2 text-[10px]">
            Back to orders
          </Link>
        }
      />
      <AdminToast message={toast?.message ?? null} tone={toast?.tone} onClear={clear} />

      <div className="grid gap-6 lg:grid-cols-2">
        <AdminPanel className="space-y-2 text-sm">
          <p>
            <span className="text-muted">Phone:</span> {order.customerPhone}
          </p>
          {order.customerEmail ? (
            <p>
              <span className="text-muted">Email:</span> {order.customerEmail}
            </p>
          ) : null}
          <p>
            <span className="text-muted">Address:</span> {order.shippingAddress}
          </p>
          {order.notes ? (
            <p>
              <span className="text-muted">Notes:</span> {order.notes}
            </p>
          ) : null}
          {order.whatsappUrl ? (
            <a href={order.whatsappUrl} target="_blank" rel="noreferrer" className="inline-block text-gold underline">
              Open WhatsApp link
            </a>
          ) : null}
          {order.items?.length ? (
            <ul className="mt-4 space-y-1 border-t border-line pt-3">
              {order.items.map((item, i) => (
                <li key={i}>
                  {item.productName} ({item.variantLabel}) × {item.quantity} — ₹{item.lineTotal}
                </li>
              ))}
            </ul>
          ) : null}
        </AdminPanel>

        <AdminPanel className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold">Update status</p>
          <AdminField label="Status">
            <select
              className="input-field"
              value={nextStatus}
              onChange={(e) => setNextStatus(e.target.value)}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </AdminField>
          <AdminField label="Note (optional)">
            <textarea
              className="input-field"
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </AdminField>
          <button type="button" className="btn-primary" onClick={updateStatus}>
            Save status
          </button>
          <p className="mt-3 text-xs text-muted">
            Status notes are appended to the order notes field (no separate history table — Neon free-tier
            friendly).
          </p>
        </AdminPanel>
      </div>
    </div>
  );
}
