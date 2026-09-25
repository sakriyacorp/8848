import { readdirSync } from "node:fs";
import path from "node:path";

let cache: string[] | null = null;

/* Families that have a photo in public/dishes. Read on the server so DishImage can
   fall back to a placeholder instead of a broken image before photos are fetched. */
export function availableDishImages(): string[] {
  if (cache && process.env.NODE_ENV === "production") return cache;
  try {
    cache = readdirSync(path.join(process.cwd(), "public", "dishes"))
      .filter((f) => f.toLowerCase().endsWith(".jpg"))
      .map((f) => f.slice(0, -4));
  } catch {
    cache = [];
  }
  return cache;
}
