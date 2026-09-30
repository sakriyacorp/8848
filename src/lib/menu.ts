import raw from "../../data/menu.json";

export type Tag = "vegetarian" | "vegan" | "gf" | "nuts" | "popular" | "chef";
export type Spice = 0 | 1 | 2 | 3 | 4 | 5;
export type DrinkKind = "cocktail" | "beer" | "wine" | "spirit" | "zero";

export type Category = {
  id: string;
  name: string;
  np?: string;
  camp: string;
  altitude: number;
  blurb?: string;
};

/* A choice the guest makes (protein, pour, style). The first value is the default and costs the
   base price; others may add to it. */
export type OptionValue = { name: string; add?: number };
export type ItemOptions = { label: string; values: OptionValue[] };

export type MenuItem = {
  id: string;
  name: string;
  np?: string;
  category: string;
  /** sub-heading inside a section: Vegetarian, Chicken… / Sparkling, Red… */
  group?: string;
  kind?: DrinkKind;
  price: number;
  /** shown instead of the price where one number doesn't tell it (wine: "$11 / $42") */
  priceLabel?: string;
  desc: string;
  /** tasting notes (drinks) */
  notes?: string;
  tags: Tag[];
  spice: Spice;
  img: string;
  options?: ItemOptions;
};

type MenuData = { categories: Category[]; items: MenuItem[] };

const data = raw as unknown as MenuData;

export const categories: Category[] = data.categories;
export const items: MenuItem[] = data.items;

const itemIndex = new Map(items.map((item) => [item.id, item]));
const categoryIndex = new Map(categories.map((c) => [c.id, c]));

export function byId(id: string): MenuItem | undefined {
  return itemIndex.get(id);
}

export function categoryById(id: string): Category | undefined {
  return categoryIndex.get(id);
}

export function byCategory(categoryId: string): MenuItem[] {
  return items.filter((item) => item.category === categoryId);
}

export function menuSections(): { category: Category; items: MenuItem[] }[] {
  return categories.map((category) => ({ category, items: byCategory(category.id) }));
}

export function picks(ids: string[]): MenuItem[] {
  return ids.map(byId).filter((i): i is MenuItem => i !== undefined);
}

/* Food carries a spice choice in the bag; drinks, breads, kids' plates, sandwiches and
   desserts don't. */
const NO_SPICE = new Set(["breads", "kids", "fusion", "desserts", "drinks", "bar"]);
export function hasSpiceControl(item: Pick<MenuItem, "category">): boolean {
  return !NO_SPICE.has(item.category);
}

export const SPICE_LEVELS = ["Mild", "Medium", "Hot", "Himalayan hot"] as const;
export type SpiceChoice = (typeof SPICE_LEVELS)[number];

/* The option a line actually carries: what the guest picked, or the default (first) value. */
export function chosenOption(item: Pick<MenuItem, "options">, option?: string): OptionValue | undefined {
  const values = item.options?.values;
  if (!values?.length) return undefined;
  return values.find((v) => v.name === option) ?? values[0];
}

/* Price of one portion with its option. */
export function unitPrice(item: Pick<MenuItem, "price" | "options">, option?: string): number {
  return Math.round((item.price + (chosenOption(item, option)?.add ?? 0)) * 100) / 100;
}

/* "Choose: Vegetable · Chicken · Goat +$3.50" as a short line for cards. */
export function optionsLine(item: Pick<MenuItem, "options" | "priceLabel">): string {
  if (!item.options || item.priceLabel) return "";
  return item.options.values.map((v) => (v.add ? `${v.name} +$${v.add % 1 ? v.add.toFixed(2) : v.add}` : v.name)).join(" · ");
}

export { getDishImage } from "@/lib/dish-path";
