import { formatMoney } from "@/lib/format";
import { getDishImage, hasSpiceControl, type MenuItem, type Tag } from "@/lib/menu";
import { courseOf, drinkKindOf } from "@/lib/filters";

/* The menu grid is emitted as one static HTML string (see MenuSection) so React hydration
   treats 151 cards as a single leaf instead of walking ~4,500 nodes. Clicks are delegated by
   MenuClient through data-action. Keep this markup in step with DishImage/DietTags. */

const WIDTHS = [256, 384, 640, 828, 1080];
const ICON_PLUS = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="M12 5v14"/></svg>';
const ICON_PLACEHOLDER =
  '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m16 2-2.3 2.3a3 3 0 0 0 0 4.2l1.8 1.8a3 3 0 0 0 4.2 0L22 8"/><path d="M15 15 3.3 3.3a4.2 4.2 0 0 0 0 6l7.3 7.3c.7.7 2 .7 2.8 0L15 15Zm0 0 7 7"/><path d="m2.1 21.8 6.4-6.3"/><path d="m19 5-7 7"/></svg>';

const TAG_META: Record<Tag, { label: string; dot: string }> = {
  vegan: { label: "Vegan", dot: "bg-green" },
  vegetarian: { label: "Vegetarian", dot: "bg-green" },
  spicy: { label: "Spicy", dot: "bg-red" },
  popular: { label: "Popular", dot: "bg-gold" },
};
const TAG_ORDER: Tag[] = ["vegan", "vegetarian", "spicy", "popular"];

export function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function imageHtml(item: MenuItem, available: boolean): string {
  const base = "dish-photo relative h-24 w-24 shrink-0 overflow-hidden rounded-[12px] bg-charcoal md:aspect-[4/3] md:h-auto md:w-full";
  if (!available) {
    return `<div class="${base}"><div aria-hidden="true" class="absolute inset-0 flex items-center justify-center bg-[radial-gradient(70%_70%_at_50%_35%,rgba(242,232,213,0.06),transparent)] text-cream/20">${ICON_PLACEHOLDER}</div></div>`;
  }
  const src = getDishImage(item);
  const url = (w: number) => `/_next/image?url=${encodeURIComponent(src)}&w=${w}&q=85`;
  const srcset = WIDTHS.map((w) => `${url(w)} ${w}w`).join(", ");
  const sizes = "(max-width: 767px) 96px, (max-width: 1279px) 45vw, 340px";
  return `<div class="${base}"><img alt="" loading="lazy" decoding="async" src="${url(1080)}" srcset="${srcset}" sizes="${sizes}" class="object-cover" style="position:absolute;height:100%;width:100%;inset:0;color:transparent"></div>`;
}

function tagsHtml(tags: Tag[]): string {
  const shown = TAG_ORDER.filter((t) => tags.includes(t));
  if (shown.length === 0) return "";
  const items = shown
    .map(
      (t) =>
        `<li class="flex items-center gap-1.5 text-[12px] font-medium text-cream-2"><span aria-hidden="true" class="h-1.5 w-1.5 rounded-full ${TAG_META[t].dot}"></span>${TAG_META[t].label}</li>`,
    )
    .join("");
  return `<ul class="mt-2 flex flex-wrap gap-x-3 gap-y-1" aria-label="Dietary">${items}</ul>`;
}

export function dishCardHtml(item: MenuItem, available: boolean): string {
  const name = escapeHtml(item.name);
  const desc = escapeHtml(item.desc);
  const price = formatMoney(item.price);
  const search = escapeHtml(`${item.name} ${item.desc}`.toLowerCase());
  return (
    `<article data-item="${item.id}" data-name="${name}" data-spice="${hasSpiceControl(item) ? "1" : ""}" data-search="${search}" data-tags="${item.tags.join(" ")}" data-course="${courseOf(item.category) ?? ""}" data-kind="${drinkKindOf(item.id) ?? ""}" class="group relative flex scroll-mt-[140px] items-center gap-3 @container transition-transform duration-200 ease-out md:block md:hover:-translate-y-1 lg:scroll-mt-[110px]">` +
    `<button type="button" data-action="open" aria-label="${name}, ${price}. View details" class="absolute inset-y-0 left-0 right-12 z-[1] rounded-[12px] md:inset-0"></button>` +
    imageHtml(item, available) +
    `<div class="min-w-0 flex-1 md:mt-3"><div class="flex items-baseline justify-between gap-3"><h4 class="truncate text-[16px] font-semibold text-cream md:text-[17px]">${name}</h4><span class="shrink-0 text-[15px] font-medium tabular-nums text-cream-2 transition-colors duration-200 group-hover:text-gold">${price}</span></div><p class="mt-1 line-clamp-2 text-[14px] leading-snug text-cream-2">${desc}</p>${tagsHtml(item.tags)}</div>` +
    `<button type="button" data-action="add" aria-label="Add ${name} to bag" class="glass relative z-[2] flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-cream transition-[background,transform] duration-150 ease-bounce hover:scale-105 hover:bg-red md:absolute md:right-3 md:top-[calc(75cqw-52px)] md:h-10 md:w-10">${ICON_PLUS}</button>` +
    `</article>`
  );
}
