import { formatPrice } from "@/lib/format";
import { isOn } from "@/config/features";
import { getDishImage } from "@/lib/dish-path";
import { hasSpiceControl, optionsLine, type MenuItem, type Tag } from "@/lib/menu";

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

/* String twin of DishIllustration (DishImage.tsx): brass line-art vessels on walnut. */
const VESSEL: Record<string, string> = {
  steamer:
    '<ellipse cx="100" cy="82" rx="54" ry="14"/><path d="M46 82v22c0 8 24 14 54 14s54-6 54-14V82"/><path d="M52 96h96M60 106h80" opacity=".5"/><path d="M78 76c0-8 10-14 22-14s22 6 22 14"/><path d="M84 72c4-6 28-6 32 0" opacity=".6"/>',
  bowl: '<path d="M44 78h112c0 26-24 42-56 42S44 104 44 78Z"/><path d="M82 120h36"/><path d="M58 78c10-8 26-10 42-6s30 2 42 6" opacity=".55"/><path d="M120 40l30 34M128 36l30 34" opacity=".7"/>',
  glass: '<path d="M74 38h52l-6 70a8 8 0 0 1-8 7H88a8 8 0 0 1-8-7Z"/><path d="M78 64h44" opacity=".55"/><circle cx="112" cy="54" r="9" opacity=".6"/><path d="M118 30l18-10"/>',
  plate: '<ellipse cx="100" cy="88" rx="64" ry="22"/><ellipse cx="100" cy="86" rx="42" ry="13" opacity=".6"/><path d="M84 80c6-10 26-10 32 0"/>',
};
function vesselOf(category: string): string {
  if (category === "momo") return "steamer";
  if (category === "bar" || category === "drinks") return "glass";
  if (category === "soups-salads" || category === "entrees" || category === "signatures" || category === "biryani") return "bowl";
  return "plate";
}
function illustrationSvg(category: string): string {
  const kind = vesselOf(category);
  const steam = kind === "glass" ? "" : '<g stroke="#eed3a5" stroke-width="1.2" fill="none" stroke-linecap="round" opacity=".5"><path d="M88 52c-4-6 4-10 0-16"/><path d="M100 48c-4-6 4-10 0-16"/><path d="M112 52c-4-6 4-10 0-16"/></g>';
  return `<svg viewBox="0 0 200 150" preserveAspectRatio="xMidYMid slice" class="absolute inset-0 h-full w-full" aria-hidden="true"><g fill="none" stroke="#b69e70" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" opacity=".85">${VESSEL[kind]}</g>${steam}</svg>`;
}

function imageHtml(item: MenuItem, available: boolean): string {
  const cls = "dish-photo relative h-[92px] w-[92px] shrink-0 overflow-hidden rounded-[16px] bg-walnut-deep md:h-auto md:w-full md:aspect-[4/3] md:rounded-[18px]";
  const steam = isOn("steam") ? '<span class="steam" aria-hidden="true"><i></i><i></i><i></i></span>' : "";
  if (!available) {
    return `<div class="${cls}" data-photo><div class="dish-fallback absolute inset-0" data-kind="${item.category}">${illustrationSvg(item.category)}</div><span class="dish-vignette"></span></div>`;
  }
  const src = getDishImage(item);
  const url = (w: number) => `/_next/image?url=${encodeURIComponent(src)}&w=${w}&q=80`;
  const srcset = WIDTHS.map((w) => `${url(w)} ${w}w`).join(", ");
  return `<div class="${cls}" data-photo data-src="${url(256)}"><img alt="" loading="lazy" decoding="async" src="${url(640)}" srcset="${srcset}" sizes="(max-width: 767px) 92px, (max-width: 1279px) 42vw, 300px" class="dish-img object-cover" style="position:absolute;height:100%;width:100%;inset:0;color:transparent"><span class="dish-vignette"></span>${steam}</div>`;
}

function priceText(item: MenuItem): string {
  return item.priceLabel ?? formatPrice(item.price);
}

function searchText(item: MenuItem): string {
  return escapeHtml(`${item.name} ${item.np ?? ""} ${item.desc} ${item.group ?? ""} ${item.options?.values.map((v) => v.name).join(" ") ?? ""}`.toLowerCase());
}

/* Shared card facts read back by MenuClient: filters, search, and whether "+" can add straight
   away or needs the sheet (dishes with a choice to make). */
function dataAttrs(item: MenuItem, name: string): string {
  const needsChoice = item.options && item.options.values.length > 1 ? "1" : "";
  return `data-item="${item.id}" data-name="${name}" data-choose="${needsChoice}" data-spiceable="${hasSpiceControl(item) ? "1" : ""}" data-spice="${item.spice}" data-search="${searchText(item)}" data-tags="${item.tags.join(" ")}"`;
}

/* Wine, beer and spirits: a compact line (name · leader · price, notes underneath), no photo. */
export function dishRowHtml(item: MenuItem): string {
  const name = escapeHtml(item.name);
  const price = escapeHtml(priceText(item));
  const desc = item.desc ? `<p class="mt-0.5 text-[13.5px] leading-snug text-bronze">${escapeHtml(item.desc)}</p>` : "";
  return (
    `<article ${dataAttrs(item, name)} class="dish-card dish-row group relative rounded-[16px] px-3 py-2.5 pr-14 transition-colors duration-300">` +
    `<button type="button" data-action="open" aria-label="${name}, ${price}. Details" class="absolute inset-0 z-[1] rounded-[16px]"></button>` +
    `<div class="flex items-baseline gap-2"><h4 class="display min-w-0 text-[19px] leading-tight text-choc">${name}</h4><span aria-hidden="true" class="leader mb-[5px] min-w-4 flex-1"></span><span class="num shrink-0 text-[14.5px] font-medium text-choc">${price}</span></div>` +
    desc +
    `<button type="button" data-action="add" aria-label="Add ${name} to your pack" class="add-btn absolute right-2 top-1/2 z-[2] flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full">${ICON_PLUS}</button>` +
    `</article>`
  );
}

export function dishCardHtml(item: MenuItem, available: boolean): string {
  const name = escapeHtml(item.name);
  const desc = escapeHtml(item.desc);
  const price = escapeHtml(priceText(item));
  const choices = optionsLine(item);
  const chef = item.tags.includes("chef");
  const popular = item.tags.includes("popular");
  const flag = chef
    ? '<span class="caps foil-stamp">Chef&rsquo;s pick</span>'
    : popular
      ? '<span class="caps foil-stamp is-quiet">Most loved</span>'
      : "";
  const np = item.np ? `<p lang="ne" class="np mt-0.5 text-[13px] text-bronze/80">${escapeHtml(item.np)}</p>` : "";
  return (
    `<article ${dataAttrs(item, name)} class="dish-card @container group relative flex items-start gap-4 rounded-[22px] p-2.5 transition-[transform,background-color,box-shadow] duration-500 ease-out md:block md:p-3 md:hover:-translate-y-1${item.spice >= 3 && isOn("spicePeaks") ? " heat" : ""}">` +
    `<button type="button" data-action="open" aria-label="${name}, ${price}. Details" class="absolute inset-0 z-[1] rounded-[22px]"></button>` +
    imageHtml(item, available) +
    `<div class="min-w-0 flex-1 pr-11 md:mt-3.5 md:pr-0">` +
    `<div class="flex items-baseline gap-2"><h4 class="display min-w-0 text-[20px] leading-tight text-choc md:text-[22px]">${name}</h4><span aria-hidden="true" class="leader mb-[5px] hidden min-w-4 flex-1 md:block"></span><span class="num ml-auto shrink-0 text-[15px] font-medium text-choc md:ml-0">${price}</span></div>` +
    np +
    (desc ? `<p class="mt-1.5 line-clamp-2 text-[14px] leading-snug text-bronze md:line-clamp-3">${desc}</p>` : "") +
    (item.notes ? `<p class="display mt-1 text-[15px] italic text-bronze">${escapeHtml(item.notes)}</p>` : "") +
    (choices ? `<p class="display mt-1 text-[15px] italic leading-snug text-bronze">${escapeHtml(choices)}</p>` : "") +
    `<div class="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5">${flag}${peaksHtml(item.spice)}${dietHtml(item.tags)}</div>` +
    `</div>` +
    `<button type="button" data-action="add" aria-label="Add ${name} to your pack" class="add-btn absolute right-3 top-3 z-[2] flex h-10 w-10 items-center justify-center rounded-full md:right-5 md:top-[calc(75cqw-40px)]">${ICON_PLUS}</button>` +
    `</article>`
  );
}
