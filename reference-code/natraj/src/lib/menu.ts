import raw from "../../data/menu.json";
import type { Hours } from "@/lib/hours";

export type Tag = "vegetarian" | "vegan" | "spicy" | "popular";
export type SpiceLevel = "Mild" | "Medium" | "Hot" | "Indian Hot";

export type Category = { id: string; name: string; blurb?: string };

export type MenuItem = {
  id: string;
  name: string;
  category: string;
  price: number;
  desc: string;
  tags: Tag[];
  img: string;
  priceVerified?: boolean;
};

export type Restaurant = {
  name: string;
  tagline: string;
  address: {
    line1: string;
    line2: string;
    city: string;
    state: string;
    zip: string;
    lat: number;
    lng: number;
  };
  phone: string;
  phoneHref: string;
  hours: Hours;
  carryoutCutoffMinutes: number;
  reservationUrl: string;
  reviewUrl: string;
  email: string;
  emailHref: string;
  legalName: string;
  officialSite: string;
  links: {
    orderOnline: string;
    pdfMenu: string;
    privateEvents: string;
    sundayBuffet: string;
    story: string;
    giftCards: string;
    contact: string;
    careers: string;
    rewards: string;
  };
  sundayBuffet: { price: number; days: string };
  mapsUrl: string;
  estimatedTaxRate: number;
  spiceLevels: SpiceLevel[];
  entreeNote: string;
  biryaniNote: string;
};

type MenuData = { restaurant: Restaurant; categories: Category[]; items: MenuItem[] };

const data = raw as unknown as MenuData;

export const restaurant: Restaurant = data.restaurant;
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

export function popular(): MenuItem[] {
  return items.filter((item) => item.tags.includes("popular"));
}

export function menuSections(): { category: Category; items: MenuItem[] }[] {
  return categories.map((category) => ({ category, items: byCategory(category.id) }));
}

export { getDishImage } from "@/lib/dish-path";

const NO_SPICE_CATEGORIES = new Set(["soups", "breads-sides", "desserts", "beverages"]);

export function hasSpiceControl(item: Pick<MenuItem, "category">): boolean {
  return !NO_SPICE_CATEGORIES.has(item.category);
}
