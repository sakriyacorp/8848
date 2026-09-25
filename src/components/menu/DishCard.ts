import { formatPrice } from "@/lib/format";
import { isOn } from "@/config/features";
import { getDishImage } from "@/lib/dish-path";
import { hasSpiceControl, type MenuItem, type Tag } from "@/lib/menu";

/* The menu grid is emitted as one static HTML string per section (see MenuBody) so hydration
   treats ~100 cards as a single leaf instead of walking thousands of nodes. Clicks are delegated
   by MenuClient through data-action. Keep in step with DishImage / SpicePeaks / DietBadges. */

const WIDTHS = [256, 384, 640, 828];
const ICON_PLUS =
  '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M5 12h14"/><path d="M12 5v14"/></svg>';

export function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

const SPICE_LABEL = ["No heat", "Gentle", "Warm", "Hot", "Very hot", "Himalayan hot"];

function peaksHtml(level: number): string {
  if (!level) return "";
  if (!isOn("spicePeaks")) return `<span class="caps text-[10px] text-bronze">${SPICE_LABEL[level]}</span>`;
  const peaks = [1, 2, 3, 4, 5]
    .map((n) => `<svg viewBox="0 0 10 8" width="11" height="9" aria-hidden="true"${n <= level ? ' class="lit"' : ""}><path d="M0.5 7.5 5 0.8l4.5 6.7Z"/></svg>`)
    .join("");
  return `<span role="img" aria-label="Spice: ${SPICE_LABEL[level]}" class="spice-peaks tone-paper inline-flex items-end gap-[2px]">${peaks}</span>`;
}

const DIET: Array<[Tag, string, string]> = [
  ["vegan", "VG", "Vegan"],
  ["vegetarian", "V", "Vegetarian"],
  ["gf", "GF", "Gluten-free"],
  ["nuts", "N", "Contains nuts"],
];

function dietHtml(tags: Tag[]): string {
  const shown = DIET.filter(([t]) => tags.includes(t) && !(t === "vegetarian" && tags.includes("vegan")));
  if (!shown.length) return "";
  return `<ul class="flex flex-wrap gap-1" aria-label="Dietary">${shown
    .map(([, s, l]) => `<li title="${l}" class="caps rounded-full border border-ink-line px-1.5 py-[1px] text-[8.5px] tracking-[0.12em] text-bronze"><span aria-hidden="true">${s}</span><span class="sr-only">${l}</span></li>`)
    .join("")}</ul>`;
}

function imageHtml(item: MenuItem, available: boolean): string {
  const cls = "dish-photo relative h-[92px] w-[92px] shrink-0 overflow-hidden rounded-[16px] bg-walnut-deep md:h-auto md:w-full md:aspect-[4/3] md:rounded-[18px]";
  const steam = isOn("steam") ? '<span class="steam" aria-hidden="true"><i></i><i></i><i></i></span>' : "";
  if (!available) {
    return `<div class="${cls}" data-photo><div class="dish-fallback absolute inset-0" data-kind="${item.category}"></div><span class="dish-vignette"></span>${steam}</div>`;
  }
  const src = getDishImage(item);
  const url = (w: number) => `/_next/image?url=${encodeURIComponent(src)}&w=${w}&q=80`;
  const srcset = WIDTHS.map((w) => `${url(w)} ${w}w`).join(", ");
  return `<div class="${cls}" data-photo data-src="${url(256)}"><img alt="" loading="lazy" decoding="async" src="${url(640)}" srcset="${srcset}" sizes="(max-width: 767px) 92px, (max-width: 1279px) 42vw, 300px" class="dish-img object-cover" style="position:absolute;height:100%;width:100%;inset:0;color:transparent"><span class="dish-vignette"></span>${steam}</div>`;
}

export function dishCardHtml(item: MenuItem, available: boolean): string {
  const name = escapeHtml(item.name);
  const desc = escapeHtml(item.desc);
  const price = formatPrice(item.price);
  const search = escapeHtml(`${item.name} ${item.np ?? ""} ${item.desc} ${item.style ?? ""}`.toLowerCase());
  const chef = item.tags.includes("chef");
  const popular = item.tags.includes("popular");
  const flag = chef
    ? '<span class="caps foil-stamp">Chef&rsquo;s pick</span>'
    : popular
      ? '<span class="caps foil-stamp is-quiet">Most loved</span>'
      : "";
  const np = item.np ? `<p lang="ne" class="np mt-0.5 text-[13px] text-bronze/80">${escapeHtml(item.np)}</p>` : "";
  return (
    `<article data-item="${item.id}" data-name="${name}" data-spiceable="${hasSpiceControl(item) ? "1" : ""}" data-spice="${item.spice}" data-search="${search}" data-tags="${item.tags.join(" ")}" class="dish-card @container group relative flex items-start gap-4 rounded-[22px] p-2.5 transition-[transform,background-color,box-shadow] duration-500 ease-out md:block md:p-3 md:hover:-translate-y-1${item.spice >= 3 && isOn("spicePeaks") ? " heat" : ""}">` +
    `<button type="button" data-action="open" aria-label="${name}, ${price}. Details" class="absolute inset-0 z-[1] rounded-[22px]"></button>` +
    imageHtml(item, available) +
    `<div class="min-w-0 flex-1 pr-11 md:mt-3.5 md:pr-0">` +
    `<div class="flex items-baseline gap-2"><h4 class="display min-w-0 text-[20px] leading-tight text-choc md:text-[22px]">${name}</h4><span aria-hidden="true" class="leader mb-[5px] hidden min-w-4 flex-1 md:block"></span><span class="num ml-auto shrink-0 text-[15px] font-medium text-choc md:ml-0">${price}</span></div>` +
    np +
    `<p class="mt-1.5 line-clamp-2 text-[14px] leading-snug text-bronze md:line-clamp-3">${desc}</p>` +
    `<div class="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5">${flag}${peaksHtml(item.spice)}${dietHtml(item.tags)}</div>` +
    `</div>` +
    `<button type="button" data-action="add" aria-label="Add ${name} to your pack" class="add-btn absolute right-3 top-3 z-[2] flex h-10 w-10 items-center justify-center rounded-full md:right-5 md:top-[calc(75cqw-40px)]">${ICON_PLUS}</button>` +
    `</article>`
  );
}
