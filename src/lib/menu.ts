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

export type MenuItem = {
  id: string;
  name: string;
  np?: string;
  category: string;
  style?: string;
  kind?: DrinkKind;
  price: number;
  desc: string;
  tags: Tag[];
  spice: Spice;
  img: string;
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

/* Food carries a spice choice in the bag; drinks, breads and desserts don't. */
const NO_SPICE = new Set(["rice-breads", "desserts", "chiya-soft", "bar"]);
export function hasSpiceControl(item: Pick<MenuItem, "category">): boolean {
  return !NO_SPICE.has(item.category);
}

export const SPICE_LEVELS = ["Mild", "Medium", "Hot", "Himalayan hot"] as const;
export type SpiceChoice = (typeof SPICE_LEVELS)[number];

export { getDishImage } from "@/lib/dish-path";
