const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export function formatMoney(dollars: number): string {
  return money.format(dollars);
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

export type CardBrand = "visa" | "mastercard" | "amex" | "discover" | "unknown";

export function cardBrand(input: string): CardBrand {
  const d = digitsOnly(input);
  if (/^4/.test(d)) return "visa";
  if (/^(5[1-5]|2[2-7])/.test(d)) return "mastercard";
  if (/^3[47]/.test(d)) return "amex";
  if (/^(6011|65|64[4-9])/.test(d)) return "discover";
  return "unknown";
}

export function cardLength(brand: CardBrand): number {
  return brand === "amex" ? 15 : 16;
}

export function formatCard(input: string): string {
  const brand = cardBrand(input);
  const d = digitsOnly(input).slice(0, cardLength(brand));
  const groups = brand === "amex" ? [4, 6, 5] : [4, 4, 4, 4];
  const out: string[] = [];
  let i = 0;
  for (const g of groups) {
    if (i >= d.length) break;
    out.push(d.slice(i, i + g));
    i += g;
  }
  return out.join(" ");
}

export function luhn(input: string): boolean {
  const d = digitsOnly(input);
  if (d.length < 13) return false;
  let sum = 0;
  let double = false;
  for (let i = d.length - 1; i >= 0; i--) {
    let n = Number(d[i]);
    if (double) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    double = !double;
  }
  return sum % 10 === 0;
}

export function formatExpiry(input: string): string {
  const d = digitsOnly(input).slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
}

export function expiryInFuture(input: string, now = new Date()): boolean {
  const d = digitsOnly(input);
  if (d.length !== 4) return false;
  const month = Number(d.slice(0, 2));
  const year = 2000 + Number(d.slice(2));
  if (month < 1 || month > 12) return false;
  const endOfMonth = new Date(year, month, 0, 23, 59, 59);
  return endOfMonth.getTime() > now.getTime();
}
