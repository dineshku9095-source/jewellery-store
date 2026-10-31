import { canTransition } from "@jewellery/shared";
import type { OrderStatus } from "@jewellery/shared";
import { prisma } from "../lib/prisma";

export async function updateOrderStatus(
  orderId: string,
  to: OrderStatus,
  _adminId: string,
  note?: string
) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new Error("Order not found");

  if (!canTransition(order.status as OrderStatus, to)) {
    throw new Error(`Cannot transition from ${order.status} to ${to}`);
  }

  const notes =
    note && note.trim()
      ? [order.notes?.trim(), `[${to}] ${note.trim()}`].filter(Boolean).join("\n").slice(0, 500)
      : undefined;

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: {
      status: to,
      ...(notes !== undefined ? { notes } : {}),
    },
    include: { items: true },
  });

  return updated;
}

export function serializeOrder(order: {
  id: string;
  orderNumber: string;
  status: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  shippingAddress: string;
  notes: string | null;
  subtotal: { toString(): string };
  currency: string;
  whatsappUrl: string | null;
  createdAt: Date;
  items?: Array<{
    id: string;
    productName: string;
    variantLabel: string;
    sku: string;
    quantity: number;
    unitPrice: { toString(): string };
    lineTotal: { toString(): string };
  }>;
}) {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    customerEmail: order.customerEmail,
    shippingAddress: order.shippingAddress,
    notes: order.notes,
    subtotal: order.subtotal.toString(),
    currency: order.currency,
    whatsappUrl: order.whatsappUrl,
    createdAt: order.createdAt.toISOString(),
    items: order.items?.map((i) => ({
      id: i.id,
      productName: i.productName,
      variantLabel: i.variantLabel,
      sku: i.sku,
      quantity: i.quantity,
      unitPrice: i.unitPrice.toString(),
      lineTotal: i.lineTotal.toString(),
    })),
  };
}
