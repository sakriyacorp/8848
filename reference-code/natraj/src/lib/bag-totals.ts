import type { BagLine } from "@/lib/bag";
import { byId, restaurant } from "@/lib/menu";

/* Prices are always looked up from menu.json at render time, never stored in the bag.
   Kept apart from the store so the nav badge doesn't pull the menu data into its chunk. */
export function lineTotal(line: BagLine): number {
  const item = byId(line.itemId);
  return item ? item.price * line.qty : 0;
}

export function bagTotals(lines: BagLine[]) {
  const subtotal = lines.reduce((n, l) => n + lineTotal(l), 0);
  const tax = Math.round(subtotal * restaurant.estimatedTaxRate * 100) / 100;
  return { subtotal, tax, total: subtotal + tax };
}
