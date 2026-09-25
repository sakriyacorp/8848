import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { availableDishImages } from "@/lib/dish-images";
import { byId, hasSpiceControl, items, type MenuItem } from "@/lib/menu";
import { FeaturedRail, type RailEntry } from "@/components/Menu/FeaturedRail";

/* Fourteen dishes with official photos: the kitchen's most-ordered plates plus the tandoor,
   lamb, biryani and paneer signatures. The full menu lives on /menu. */
const FEATURED = [
  "butter-chicken",
  "chicken-tikka-masala",
  "lamb-curry",
  "garlic-naan",
  "saag-paneer",
  "tandoori-mixed-grill",
  "chicken-biryani",
  "vegetable-samosa",
  "paneer-tikka-masala",
  "rogan-josh",
  "chicken-curry",
  "chicken-tandoori",
  "pistachio-chicken-korma",
  "chicken-tikka",
];

export function FeaturedMenu() {
  const available = new Set(availableDishImages());
  const picks: RailEntry[] = FEATURED.map(byId)
    .filter((i): i is MenuItem => i !== undefined)
    .map((item) => ({
      id: item.id,
      name: item.name,
      price: item.price,
      img: item.img,
      available: available.has(item.img),
      spice: hasSpiceControl(item),
    }));

  return (
    <section id="menu" aria-labelledby="menu-title" className="scroll-mt-16 pt-20 md:pt-28">
      <div className="px-5 md:px-8">
        <div className="mx-auto flex max-w-[1280px] flex-wrap items-end justify-between gap-x-8 gap-y-5">
          <div className="max-w-[60ch]">
            <h2 id="menu-title" className="display text-[36px] text-cream md:text-[48px]">
              The menu.
            </h2>
            <p className="mt-3 text-[16px] text-cream-2">
              {items.length} dishes, North and South. {picks.length} to start with.
            </p>
          </div>
          <Link href="/menu" className="btn-ghost hidden px-5 py-2.5 text-[14px] md:inline-flex">
            View full menu
            <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </div>
      </div>

      <FeaturedRail items={picks} />

      <div className="px-5 md:hidden">
        <Link href="/menu" className="btn-ghost mt-4 w-full py-3.5 text-[15px]">
          View full menu
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
