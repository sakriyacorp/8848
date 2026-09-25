const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const whole = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

export function formatMoney(dollars: number): string {
  return money.format(dollars);
}

/* Menu prices: "$14" for whole dollars, "$14.50" otherwise. */
export function formatPrice(dollars: number): string {
  return Number.isInteger(dollars) ? `$${dollars}` : money.format(dollars);
}

export function formatNumber(n: number, digits = 0): string {
  return n.toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

export function formatWhole(n: number): string {
  return whole.format(n);
}

export function digitsOnly(input: string): string {
  return input.replace(/\D/g, "");
}

export function formatPhone(input: string): string {
  const d = digitsOnly(input).replace(/^1(?=\d{10})/, "").slice(0, 10);
  if (d.length < 4) return d;
  if (d.length < 7) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}
