import Decimal from "decimal.js";
import { customAlphabet } from "nanoid";
import {
  buildWhatsAppOrderMessage,
  buildWhatsAppUrl,
  checkoutSchema,
  multiplyMoney,
  sumLineItems,
} from "@jewellery/shared";
import type { CheckoutInput } from "@jewellery/shared";
import { prisma } from "../lib/prisma";

const orderNumber = customAlphabet("0123456789", 8);

export async function processCheckout(input: CheckoutInput) {
  const parsed = checkoutSchema.parse(input);
  const variantIds = parsed.items.map((i) => i.variantId);

  const variants = await prisma.productVariant.findMany({
    where: {
      id: { in: variantIds },
      isActive: true,
      product: { isPublished: true },
    },
    include: {
      product: { include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } } },
    },
  });

  if (variants.length !== variantIds.length) {
    throw new Error("One or more items are unavailable");
  }

  const variantMap = new Map(variants.map((v) => [v.id, v]));
  const lineItems: Array<{
    variantId: string;
    productId: string;
    productName: string;
    variantLabel: string;
    sku: string;
    quantity: number;
    unitPrice: string;
    lineTotal: string;
  }> = [];

  for (const item of parsed.items) {
    const variant = variantMap.get(item.variantId)!;
    if (variant.stock < item.quantity) {
      throw new Error(`Insufficient stock for ${variant.product.name}`);
    }
    const unitPrice = new Decimal(variant.price.toString()).toFixed(2);
    const lineTotal = multiplyMoney(unitPrice, item.quantity);
    lineItems.push({
      variantId: variant.id,
      productId: variant.productId,
      productName: variant.product.name,
      variantLabel: variant.label,
      sku: variant.sku,
      quantity: item.quantity,
      unitPrice,
      lineTotal,
    });
  }

  const subtotal = sumLineItems(
    lineItems.map((l) => ({ unitPrice: l.unitPrice, quantity: l.quantity }))
  );

  const settings = await prisma.storeSettings.findUnique({ where: { id: 1 } });
  if (!settings?.whatsappNumber) {
    throw new Error("Store WhatsApp number is not configured");
  }

  const num = `ORD-${orderNumber()}`;
  const waMessage = buildWhatsAppOrderMessage({
    orderNumber: num,
    customerName: parsed.customerName,
    customerPhone: parsed.customerPhone,
    customerEmail: parsed.customerEmail || null,
    shippingAddress: parsed.shippingAddress,
    notes: parsed.notes,
    items: lineItems.map((l) => ({
      productName: l.productName,
      variantLabel: l.variantLabel,
      quantity: l.quantity,
      unitPrice: l.unitPrice,
      lineTotal: l.lineTotal,
    })),
    subtotal,
    currency: settings.currency,
    status: "WHATSAPP_PENDING",
  });
  const whatsappUrl = buildWhatsAppUrl(settings.whatsappNumber, waMessage);

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        orderNumber: num,
        status: "WHATSAPP_PENDING",
        customerName: parsed.customerName,
        customerPhone: parsed.customerPhone,
        customerEmail: parsed.customerEmail || null,
        shippingAddress: parsed.shippingAddress,
        notes: parsed.notes,
        subtotal,
        currency: settings.currency,
        whatsappUrl,
        statusHistory: {
          create: {
            status: "WHATSAPP_PENDING",
            note: "Order placed via storefront checkout",
          },
        },
        items: {
          create: lineItems.map((l) => ({
            productId: l.productId,
            variantId: l.variantId,
            productName: l.productName,
            variantLabel: l.variantLabel,
            sku: l.sku,
            quantity: l.quantity,
            unitPrice: l.unitPrice,
            lineTotal: l.lineTotal,
          })),
        },
      },
      include: { items: true },
    });

    for (const item of parsed.items) {
      await tx.productVariant.update({
        where: { id: item.variantId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    return created;
  });

  return {
    order: {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      subtotal: order.subtotal.toString(),
      currency: order.currency,
      whatsappUrl: order.whatsappUrl,
    },
    message:
      "Your order is WhatsApp Pending. Open WhatsApp to send your order details to the shop — we do not send messages automatically.",
  };
}
