import { describe, expect, it } from "vitest";
import {
  buildWhatsAppOrderMessage,
  buildWhatsAppUrl,
  computeLineTotal,
  normalizeWhatsAppPhone,
} from "../src/whatsapp";

describe("whatsapp helpers", () => {
  it("normalizes phone with default country code", () => {
    expect(normalizeWhatsAppPhone("9876543210")).toBe("919876543210");
  });

  it("keeps full international number", () => {
    expect(normalizeWhatsAppPhone("+91 98765 43210")).toBe("919876543210");
  });

  it("builds wa.me URL with encoded message", () => {
    const url = buildWhatsAppUrl("9876543210", "Hello & test");
    expect(url).toContain("https://wa.me/919876543210");
    expect(url).toContain(encodeURIComponent("Hello & test"));
  });

  it("builds order message with payment disclaimer", () => {
    const msg = buildWhatsAppOrderMessage({
      orderNumber: "ORD-001",
      customerName: "Ada",
      customerPhone: "+919876543210",
      shippingAddress: "123 Lane, City",
      items: [
        {
          productName: "Gold Ring",
          variantLabel: "Size 7",
          quantity: 1,
          unitPrice: "15000.00",
          lineTotal: "15000.00",
        },
      ],
      subtotal: "15000.00",
    });
    expect(msg).toContain("ORD-001");
    expect(msg).toContain("To be arranged with shop");
    expect(msg).toContain("Gold Ring");
  });

  it("computes line total", () => {
    expect(computeLineTotal("10.00", 3)).toBe("30.00");
  });
});
