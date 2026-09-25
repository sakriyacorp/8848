/* Filter vocabulary for the menu. Pure constants (no menu.json import) so the client chunk that
   runs the filters stays small. Card facts are stamped onto each card by DishCard and read back
   from the DOM by MenuClient. */

export type Diet = "vegetarian" | "vegan" | "gf" | "nutfree";
export type Heat = "mild" | "medium" | "hot";
export type More = "chef" | "popular";

export type FilterOption<T extends string> = { id: T; label: string };

export const DIET_OPTIONS: FilterOption<Diet>[] = [
  { id: "vegetarian", label: "Vegetarian" },
  { id: "vegan", label: "Vegan" },
  { id: "gf", label: "Gluten-free" },
  { id: "nutfree", label: "No nuts" },
];

export const HEAT_OPTIONS: FilterOption<Heat>[] = [
  { id: "mild", label: "Mild" },
  { id: "medium", label: "Medium" },
  { id: "hot", label: "Hot" },
];

export const MORE_OPTIONS: FilterOption<More>[] = [
  { id: "chef", label: "Chef's picks" },
  { id: "popular", label: "Most loved" },
];

export type Selection = { diet: Diet[]; heat: Heat[]; more: More[] };
export const EMPTY_SELECTION: Selection = { diet: [], heat: [], more: [] };

export function selectionCount(s: Selection): number {
  return s.diet.length + s.heat.length + s.more.length;
}

export type CardFacts = { tags: string[]; spice: number; search: string };

export function heatOf(spice: number): Heat {
  return spice <= 1 ? "mild" : spice === 2 ? "medium" : "hot";
}

function hasDiet(card: CardFacts, d: Diet): boolean {
  return d === "nutfree" ? !card.tags.includes("nuts") : card.tags.includes(d);
}

/* Diet and "more" narrow (every choice must hold); heat widens (any of the chosen levels). */
export function matches(card: CardFacts, s: Selection, q: string): boolean {
  if (q && !card.search.includes(q)) return false;
  if (!s.diet.every((d) => hasDiet(card, d))) return false;
  if (!s.more.every((m) => card.tags.includes(m))) return false;
  if (s.heat.length > 0 && !s.heat.includes(heatOf(card.spice))) return false;
  return true;
}
