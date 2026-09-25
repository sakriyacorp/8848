import type { Tag } from "@/lib/menu";

/* Filter vocabulary for the full menu. Pure constants (no menu.json import) so the client
   chunk that runs the filters stays small. Course and drink kind are stamped onto each card by
   DishCard; MenuClient reads them back from the DOM. */

export type Course = "appetizers" | "entrees" | "biryani" | "breads" | "soups" | "desserts" | "drinks";
export type DrinkKind = "lassi" | "tea-coffee" | "soda-juice";

export type FilterOption<T extends string> = { id: T; label: string };

export const DIET_OPTIONS: FilterOption<Tag>[] = [
  { id: "vegetarian", label: "Vegetarian" },
  { id: "vegan", label: "Vegan" },
];

export const COURSE_OPTIONS: FilterOption<Course>[] = [
  { id: "appetizers", label: "Appetizers" },
  { id: "entrees", label: "Entrées" },
  { id: "biryani", label: "Biryani & rice" },
  { id: "breads", label: "Breads & sides" },
  { id: "soups", label: "Soups" },
  { id: "desserts", label: "Desserts" },
  { id: "drinks", label: "Drinks" },
];

export const DRINK_OPTIONS: FilterOption<DrinkKind>[] = [
  { id: "lassi", label: "Lassi & shakes" },
  { id: "tea-coffee", label: "Tea & coffee" },
  { id: "soda-juice", label: "Soda & juice" },
];

export const MORE_OPTIONS: FilterOption<Tag>[] = [
  { id: "spicy", label: "Spicy" },
  { id: "popular", label: "Most ordered" },
];

const COURSE_BY_CATEGORY: Record<string, Course> = {
  appetizers: "appetizers",
  "lunch-combos": "entrees",
  chicken: "entrees",
  vegetarian: "entrees",
  lamb: "entrees",
  seafood: "entrees",
  "chef-specials": "entrees",
  tandoori: "entrees",
  "biryani-rice": "biryani",
  "breads-sides": "breads",
  soups: "soups",
  desserts: "desserts",
  beverages: "drinks",
};

export function courseOf(categoryId: string): Course | undefined {
  return COURSE_BY_CATEGORY[categoryId];
}

/* Only the beverages the official menu actually lists. */
const DRINK_BY_ID: Record<string, DrinkKind> = {
  "mango-lassi": "lassi",
  "sweet-lassi": "lassi",
  "salted-lassi": "lassi",
  "mango-shake": "lassi",
  "indian-chai-tea": "tea-coffee",
  "masala-tea": "tea-coffee",
  coffee: "tea-coffee",
  soda: "soda-juice",
  "mango-juice": "soda-juice",
  "perrier-water": "soda-juice",
};

export function drinkKindOf(itemId: string): DrinkKind | undefined {
  return DRINK_BY_ID[itemId];
}

export type Selection = {
  diet: Tag[];
  course: Course[];
  drink: DrinkKind[];
  more: Tag[];
};

export const EMPTY_SELECTION: Selection = { diet: [], course: [], drink: [], more: [] };

export function selectionCount(s: Selection): number {
  return s.diet.length + s.course.length + s.drink.length + s.more.length;
}

export type CardFacts = { tags: string[]; course: string; kind: string; search: string };

/* Within a group the choices widen the result (any course, any drink kind); across groups and
   for diet / "more" they narrow it, so Vegetarian + Entrées means vegetarian entrées. */
export function matches(card: CardFacts, s: Selection, q: string): boolean {
  if (q && !card.search.includes(q)) return false;
  if (!s.diet.every((t) => card.tags.includes(t))) return false;
  if (!s.more.every((t) => card.tags.includes(t))) return false;
  if (s.course.length > 0 && !s.course.includes(card.course as Course)) return false;
  if (s.drink.length > 0 && !s.drink.includes(card.kind as DrinkKind)) return false;
  return true;
}
