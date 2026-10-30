"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { adminList, adminMe } from "@/lib/admin-api";

export default function AdminOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<
    Array<{ id: string; orderNumber: string; status: string; customerName: string }>
  >([]);

  useEffect(() => {
    adminMe()
      .then(() => adminList<{ orders: typeof orders }>("/api/admin/orders"))
      .then((data) => setOrders(data.orders))
      .catch(() => router.replace("/admin/login"));
  }, [router]);

  return (
    <div>
      <h1 className="font-display text-3xl">Orders</h1>
      <ul className="mt-6 divide-y divide-charcoal/10">
        {orders.map((o) => (
          <li key={o.id} className="py-3">
            <Link href={`/admin/orders/${o.id}`} className="text-champagne-dark underline">
              {o.orderNumber}
            </Link>{" "}
            — {o.status} — {o.customerName}
          </li>
        ))}
      </ul>
    </div>
  );
}
