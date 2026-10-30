import Decimal from "decimal.js";

export type MoneyInput = string | number | Decimal;

/** Parse user or API input into a Decimal with 2 decimal places for display. */
export function parseMoney(value: MoneyInput): Decimal {
  const d = new Decimal(value);
  if (!d.isFinite()) {
    throw new Error("Invalid money value");
  }
  return d;
}

export function formatMoney(value: MoneyInput, currency = "INR"): string {
  const d = parseMoney(value);
  const symbol = currency === "INR" ? "₹" : currency;
  return `${symbol}${d.toFixed(2)}`;
}

export function moneyToString(value: MoneyInput): string {
  return parseMoney(value).toFixed(2);
}

export function addMoney(a: MoneyInput, b: MoneyInput): string {
  return parseMoney(a).plus(parseMoney(b)).toFixed(2);
}

export function multiplyMoney(amount: MoneyInput, quantity: number): string {
  return parseMoney(amount).times(quantity).toFixed(2);
}

export function sumLineItems(
  items: Array<{ unitPrice: MoneyInput; quantity: number }>
): string {
  return items
    .reduce(
      (acc, item) => acc.plus(parseMoney(item.unitPrice).times(item.quantity)),
      new Decimal(0)
    )
    .toFixed(2);
}
