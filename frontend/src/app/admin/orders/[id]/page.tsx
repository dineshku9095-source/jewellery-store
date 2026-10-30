"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { adminList, adminMe, adminUpdate } from "@/lib/admin-api";

export default function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [order, setOrder] = useState<{
    id: string;
    orderNumber: string;
    status: string;
    whatsappUrl?: string | null;
  } | null>(null);
  const [nextStatus, setNextStatus] = useState("CONTACTED");

  useEffect(() => {
    adminMe()
      .then(() => adminList<{ order: NonNullable<typeof order> }>(`/api/admin/orders/${params.id}`))
      .then((data) => setOrder(data.order))
      .catch(() => router.replace("/admin/login"));
  }, [params.id, router]);

  async function updateStatus() {
    if (!order) return;
    await adminUpdate(`/api/admin/orders/${order.id}/status`, { status: nextStatus });
    const refreshed = await adminList<{ order: NonNullable<typeof order> }>(
      `/api/admin/orders/${params.id}`
    );
    setOrder(refreshed.order);
  }

  if (!order) return <p>Loading…</p>;

  return (
    <div>
      <h1 className="font-display text-3xl">{order.orderNumber}</h1>
      <p className="mt-2">Status: {order.status}</p>
      {order.whatsappUrl ? (
        <a href={order.whatsappUrl} className="mt-4 inline-block text-champagne-dark underline">
          WhatsApp link
        </a>
      ) : null}
      <div className="mt-8 flex gap-2">
        <select className="input-field w-auto" value={nextStatus} onChange={(e) => setNextStatus(e.target.value)}>
          <option value="CONTACTED">Contacted</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="PREPARING">Preparing</option>
          <option value="SHIPPED">Shipped</option>
          <option value="DELIVERED">Delivered</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
        <button type="button" className="btn-primary" onClick={updateStatus}>
          Update status
        </button>
      </div>
    </div>
  );
}
