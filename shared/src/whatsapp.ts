import { formatMoney, multiplyMoney } from "./money";
import type { OrderStatus } from "./order-status";
import { orderStatusLabel } from "./order-status";

export interface WhatsAppOrderLine {
  productName: string;
  variantLabel?: string | null;
  quantity: number;
  unitPrice: string;
  lineTotal: string;
}

export interface BuildWhatsAppMessageInput {
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  shippingAddress: string;
  items: WhatsAppOrderLine[];
  subtotal: string;
  currency?: string;
  notes?: string | null;
  status?: OrderStatus;
}

/** Build plain-text message for shop owner (prefilled wa.me body). */
export function buildWhatsAppOrderMessage(input: BuildWhatsAppMessageInput): string {
  const currency = input.currency ?? "INR";
  const lines: string[] = [
    `New order ${input.orderNumber}`,
    `Status: ${orderStatusLabel(input.status ?? "WHATSAPP_PENDING")}`,
    "",
    `Name: ${input.customerName}`,
    `Phone: ${input.customerPhone}`,
  ];
  if (input.customerEmail) {
    lines.push(`Email: ${input.customerEmail}`);
  }
  lines.push(`Address: ${input.shippingAddress}`, "", "Items:");
  for (const item of input.items) {
    const variant = item.variantLabel ? ` (${item.variantLabel})` : "";
    lines.push(
      `- ${item.productName}${variant} x${item.quantity} @ ${formatMoney(item.unitPrice, currency)} = ${formatMoney(item.lineTotal, currency)}`
    );
  }
  lines.push("", `Subtotal: ${formatMoney(input.subtotal, currency)}`);
  lines.push("Payment: To be arranged with shop");
  if (input.notes) {
    lines.push("", `Notes: ${input.notes}`);
  }
  return lines.join("\n");
}

/** Normalize phone to digits for wa.me (assumes country code included or default 91). */
export function normalizeWhatsAppPhone(raw: string, defaultCountryCode = "91"): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length <= 10) {
    return defaultCountryCode + digits;
  }
  return digits;
}

export function buildWhatsAppUrl(shopPhone: string, message: string): string {
  const phone = normalizeWhatsAppPhone(shopPhone);
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${phone}?text=${encoded}`;
}

export function computeLineTotal(unitPrice: string, quantity: number): string {
  return multiplyMoney(unitPrice, quantity);
}
