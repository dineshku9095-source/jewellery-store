import { describe, expect, it } from "vitest";
import {
  addMoney,
  formatMoney,
  multiplyMoney,
  parseMoney,
  sumLineItems,
} from "../src/money";

describe("money helpers", () => {
  it("parses and formats INR", () => {
    expect(formatMoney("1234.5")).toBe("₹1234.50");
  });

  it("adds without float error", () => {
    expect(addMoney("0.1", "0.2")).toBe("0.30");
  });

  it("multiplies quantity", () => {
    expect(multiplyMoney("99.99", 3)).toBe("299.97");
  });

  it("sums line items", () => {
    const total = sumLineItems([
      { unitPrice: "100.00", quantity: 2 },
      { unitPrice: "50.50", quantity: 1 },
    ]);
    expect(total).toBe("250.50");
  });

  it("rejects invalid input", () => {
    expect(() => parseMoney("not-a-number")).toThrow();
  });
});
