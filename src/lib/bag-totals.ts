import type { BagLine } from "@/lib/bag";
import { byId, chosenOption, unitPrice } from "@/lib/menu";
import { site } from "@/config/site";

/* Prices are looked up from menu.json at render time, never stored in the bag.
   Kept apart from the store so the nav badge doesn't pull the menu data into its chunk. */
export function lineTotal(line: BagLine): number {
  const item = byId(line.itemId);
  return item ? Math.round(unitPrice(item, line.option) * line.qty * 100) / 100 : 0;
}

/* What to print under a line: option, spice and notes, e.g. "Goat · Hot · no cilantro". Only
   shows the option for dishes that have one (the default counts: "Vegetable"). */
export function lineDetails(line: BagLine): string {
  const item = byId(line.itemId);
  const opt = item ? chosenOption(item, line.option)?.name : line.option;
  return [opt, line.spice, line.instructions].filter(Boolean).join(" · ");
}

const round2 = (n: number) => Math.round(n * 100) / 100;

export function bagTotals(lines: BagLine[], tipPct = 0) {
  const subtotal = round2(lines.reduce((n, l) => n + lineTotal(l), 0));
  const tax = round2(subtotal * site.taxRate);
  const tip = round2(subtotal * tipPct);
  return { subtotal, tax, tip, total: round2(subtotal + tax + tip) };
}

/* A trekking pack is weighed, not counted: roughly 450 g per dish. Just for fun. */
export function packWeightKg(lines: BagLine[]): number {
  return Math.round(lines.reduce((n, l) => n + l.qty * 0.45, 0) * 10) / 10;
}
