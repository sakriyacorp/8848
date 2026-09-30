// Print menus (food + drinks) from data/menu.json, typeset in HTML and printed to PDF by Chrome,
// so the Devanagari shapes correctly and the type matches the website exactly.
//   node scripts/print-menu.mjs            → handoff/print/*.pdf + previews/*.png
// Needs the brand kit (logo + textures): node --experimental-strip-types scripts/export-brand-kit.mts handoff/8848-menu-kit/brand
import { chromium } from "playwright";
import { readFileSync, mkdirSync, existsSync } from "node:fs";
import path from "node:path";

const KIT = "handoff/8848-menu-kit";
const OUT = "handoff/print";
if (!existsSync(`${KIT}/brand/logo/8848-lockup-chocolate.svg`)) {
  console.error("Brand kit missing. Run: node --experimental-strip-types scripts/export-brand-kit.mts handoff/8848-menu-kit/brand");
  process.exit(1);
}
mkdirSync(`${OUT}/previews`, { recursive: true });

const menu = JSON.parse(readFileSync("data/menu.json", "utf8"));
const cat = Object.fromEntries(menu.categories.map((c) => [c.id, c]));
const items = menu.items;
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const dataUri = (file, type) => `data:${type};base64,${readFileSync(file).toString("base64")}`;
const svgInline = (file) => readFileSync(file, "utf8").replace(/<svg /, '<svg class="logo" ');

const money = (n) => (n % 1 ? n.toFixed(2) : String(n));
const heat = (n) =>
  n
    ? `<span class="heat" aria-label="heat ${n}">${'<svg viewBox="0 0 10 8"><path d="M0.5 7.5 5 0.8l4.5 6.7Z"/></svg>'.repeat(n)}</span>`
    : "";
const tags = (t) => (t.includes("vegetarian") ? '<span class="tag">V</span>' : "") + (t.includes("nuts") ? '<span class="tag">N</span>' : "");
const choices = (i) => {
  if (!i.options || i.priceLabel) return "";
  const lbl = i.id === "momo-platter" ? "Chilli fry: " : "";
  return `<p class="choices">${lbl}${i.options.values.map((v) => esc(v.name) + (v.add ? ` <span class="add">+${money(v.add)}</span>` : "")).join(" · ")}</p>`;
};

function dish(i, dark) {
  const price = i.priceLabel ? i.priceLabel.replace(/\$/g, "") : money(i.price);
  const np = i.np ? `<span class="np" lang="ne">${esc(i.np)}</span>` : "";
  const desc = i.desc ? `<p class="desc">${esc(i.desc)}</p>` : "";
  const notes = i.notes ? `<p class="notes">${esc(i.notes)}</p>` : "";
  return `<div class="dish${dark ? " dark" : ""}${i.kind && ["wine", "beer", "spirit"].includes(i.kind) ? " compact" : ""}">
    <div class="line"><span class="name">${esc(i.name)}</span>${np}${tags(i.tags)}${heat(i.spice)}<span class="leader"></span><span class="price">${price}</span></div>
    ${desc}${notes}${choices(i)}
  </div>`;
}

function section(title, list, { eyebrow, subtitle, italic, dark } = {}) {
  let html = `<section class="sec">`;
  html += `<div class="sec-head">${eyebrow ? `<p class="eyebrow">${esc(eyebrow)}</p>` : ""}<h2>${italic ? title.replace(italic, `<em>${italic}</em>`) : esc(title)}</h2>${subtitle ? `<p class="sub">${esc(subtitle)}</p>` : ""}</div>`;
  let group = null;
  for (const i of list) {
    if (i.group && i.group !== group && !["Tea & coffee", "Cold & refreshing", "Signature cocktails", "Zero-proof"].includes(i.group)) {
      group = i.group;
      html += `<p class="group">${esc(i.group)}</p>`;
    }
    html += dish(i, dark);
  }
  return html + `</section>`;
}

const camp = (id) => `${cat[id].camp} · ${cat[id].altitude.toLocaleString("en-US")} m`;
const by = (c) => items.filter((i) => i.category === c);
const S = (id, opts = {}) => section(cat[id].name, by(id), { eyebrow: camp(id), subtitle: cat[id].blurb, ...opts });

const FOOD = [
  { mast: true, body: S("appetizers", { italic: "Appetizers" }) + S("soups-salads") },
  { body: S("momo") + S("street", { italic: "Flavors" }) + S("signatures") },
  { body: S("grill") + S("entrees", { italic: "Entrées" }) },
  { body: S("biryani") + S("fusion") + S("breads") + S("kids") + S("desserts"), end: true },
];
const bar = by("bar");
const DRINKS = [
  {
    mast: true,
    body:
      section("Signature Cocktails", bar.filter((i) => i.kind === "cocktail"), { eyebrow: "Summit · 8,848.86 m", subtitle: "Inspired by the Himalayas", italic: "Cocktails", dark: true }) +
      section("8848 Zero-Proof", bar.filter((i) => i.kind === "zero"), { eyebrow: "Crafted without spirits", dark: true }) +
      section("Himalayan Tea & Coffee", by("drinks").filter((i) => i.group === "Tea & coffee"), { eyebrow: "The Balcony · 8,400 m", dark: true }) +
      section("Cold & Refreshing", by("drinks").filter((i) => i.group === "Cold & refreshing"), { dark: true }),
  },
  {
    body:
      section("Wine", bar.filter((i) => i.kind === "wine"), { eyebrow: "Glass / bottle", subtitle: "Chosen to meet Himalayan spice", dark: true }) +
      section("Beer", bar.filter((i) => i.kind === "beer"), { dark: true }) +
      section("The Spirit Collection", bar.filter((i) => i.kind === "spirit"), { eyebrow: "Neat · on the rocks · or in a cocktail", italic: "Spirit", dark: true }),
    end: true,
  },
];

const paper = dataUri(`${KIT}/brand/textures/paper-lokta-cream.png`, "image/png");
const night = dataUri(`${KIT}/brand/textures/night-walnut-dark.png`, "image/png");
const logoChoc = svgInline(`${KIT}/brand/logo/8848-lockup-chocolate.svg`);
const logoBrass = svgInline(`${KIT}/brand/logo/8848-lockup-brass.svg`).replace(/id="(paint|accent|ground)"/g, 'id="b-$1"').replace(/url\(#(paint|accent|ground)\)/g, "url(#b-$1)");
const markFoil = svgInline(`${KIT}/brand/logo/8848-mark-gold-foil.svg`).replace(/id="(paint|accent|ground)"/g, 'id="f-$1"').replace(/url\(#(paint|accent|ground)\)/g, "url(#f-$1)");
const markBrass = svgInline(`${KIT}/brand/logo/8848-mark-brass.svg`).replace(/id="(paint|accent|ground)"/g, 'id="m-$1"').replace(/url\(#(paint|accent|ground)\)/g, "url(#m-$1)");
const fontFace = (fam, file, weight, style = "normal") => `@font-face{font-family:"${fam}";src:url("${dataUri(`${KIT}/fonts/${file}`, "font/ttf")}");font-weight:${weight};font-style:${style}}`;
const FONTS = [
  fontFace("Cormorant", "Cormorant-Medium.ttf", 500),
  fontFace("Cormorant", "Cormorant-SemiBold.ttf", 600),
  fontFace("Cormorant", "Cormorant-MediumItalic.ttf", 500, "italic"),
  fontFace("Cormorant", "Cormorant-SemiBoldItalic.ttf", 600, "italic"),
  fontFace("Cinzel", "Cinzel-Medium.ttf", 500),
  fontFace("Cinzel", "Cinzel-SemiBold.ttf", 600),
  fontFace("Jost", "Jost-Regular.ttf", 400),
  fontFace("Jost", "Jost-Medium.ttf", 500),
  fontFace("NotoDeva", "NotoSerifDevanagari-Medium.ttf", 500),
].join("\n");

const CSS = `
${FONTS}
@page { size: 8.5in 14in; margin: 0 }
* { box-sizing: border-box; margin: 0; padding: 0 }
html, body { background: #555 }
.page:last-child { page-break-after: auto }
.page { width: 8.5in; height: 14in; position: relative; overflow: hidden; page-break-after: always; padding: 0.55in 0.55in 0.62in;
  background: #efe8db url("${paper}") repeat; background-size: 4in 4in; color: #3b2517; font-family: Jost, sans-serif }
.page.dark { background: #17110d url("${night}") repeat; background-size: 4in 4in; color: #e6e0d6 }
.page::after { content:""; position:absolute; inset:0; pointer-events:none; box-shadow: inset 0 0 1.2in rgba(80,50,25,.10) }
.page.dark::after { box-shadow: inset 0 0 1.4in rgba(0,0,0,.45) }
.frame { position:absolute; inset:0.28in; border: 0.6pt solid rgba(155,126,83,.55); pointer-events:none }
.frame::before { content:""; position:absolute; inset:3pt; border: 0.3pt solid rgba(155,126,83,.35) }
.mast { text-align:center; margin: 0.05in 0 0.18in }
.mast .logo { width: 2.35in; height: auto; display:block; margin: 0 auto }
.dark .mast .logo { width: 2.05in }
.mast .kinds { font-family: Cinzel; font-weight:500; font-size: 7.6pt; letter-spacing: .32em; text-transform: uppercase; color:#614a32; margin-top: 10pt }
.dark .mast .kinds { color:#b69e70 }
.mast .tagline { font-family: Cormorant; font-style: italic; font-weight:500; font-size: 15pt; color:#614a32; margin-top: 3pt }
.dark .mast .tagline { color:#d8c391 }
.mast .rule { width: 2.2in; height: 0; border-top: 0.5pt solid rgba(155,126,83,.7); margin: 10pt auto 0; position:relative }
.mast .rule::after { content:""; position:absolute; left:50%; top:-3.2pt; width:6pt; height:6pt; background:#b69e70; transform: translateX(-50%) rotate(45deg) }
.cols { column-count: 2; column-gap: 0.4in; column-fill: balance; height: calc(14in - 0.55in - 0.62in); }
.mast + .cols { height: calc(14in - 0.55in - 0.62in - var(--mast, 2.3in)) }
.sec { break-inside: auto; margin-bottom: calc(var(--g, 7pt) * 2.5) }
.sec-head { break-inside: avoid; break-after: avoid; margin-bottom: 7pt }
.eyebrow { font-family: Cinzel; font-weight:500; font-size: 7pt; letter-spacing: .3em; text-transform: uppercase; color:#614a32; display:flex; align-items:center; gap:7pt }
.eyebrow::before { content:""; width: 20pt; border-top: 0.5pt solid #9b7e53 }
.dark .eyebrow { color:#b69e70 }
h2 { font-family: Cormorant; font-weight: 600; font-size: calc(25pt * var(--s, 1)); line-height: 1.02; margin-top: 3pt; color:#3b2517 }
h2 em { font-style: italic; font-weight: 500; color:#8a6a3a }
.dark h2 { color:#f2e9cf } .dark h2 em { color:#dcbf7b }
.sub { font-family: Cormorant; font-style: italic; font-weight:500; font-size: calc(11.5pt * var(--s, 1)); color:#614a32; margin-top: 2pt; line-height: 1.2 }
.dark .sub { color:#d8c391 }
.group { font-family: Cinzel; font-weight:600; font-size: 7pt; letter-spacing: .26em; text-transform: uppercase; color:#614a32; margin: calc(var(--g, 7pt) * 1.3) 0 calc(var(--g, 7pt) * .6); break-after: avoid; display:flex; align-items:center; gap:6pt }
.group::after { content:""; flex:1; border-top: 0.4pt solid rgba(155,126,83,.45) }
.dark .group { color:#b69e70 }
.dish { break-inside: avoid; margin-bottom: var(--g, 7pt) }
.dish.compact { margin-bottom: calc(var(--g, 7pt) * .72) }
.line { display:flex; align-items: baseline; gap: 4pt }
.name { font-family: Cormorant; font-weight: 600; font-size: calc(13.2pt * var(--s, 1)); line-height: 1.12; color:#3b2517 }
.compact .name { font-size: calc(11.8pt * var(--s, 1)) }
.dark .name { color:#f2e9cf }
.np { font-family: NotoDeva; font-weight:500; font-size: calc(7.6pt * var(--s, 1)); color:#614a32; white-space: nowrap }
.dark .np { color:#d8c391 }
.tag { font-family: Cinzel; font-weight:600; font-size: 5.4pt; width: 8.6pt; height: 8.6pt; border: 0.5pt solid #614a32; border-radius: 50%; display:inline-flex; align-items:center; justify-content:center; color:#614a32; flex: none; transform: translateY(-1pt) }
.heat { display:inline-flex; gap: 0.8pt; flex:none; transform: translateY(-0.5pt) }
.heat svg { width: 4.6pt; height: 3.8pt; fill:#b5602d }
.leader { flex: 1; min-width: 10pt; border-bottom: 0.9pt dotted rgba(155,126,83,.75); transform: translateY(-2.4pt) }
.price { font-family: Jost; font-weight:500; font-size: calc(10pt * var(--s, 1)); color:#3b2517; font-variant-numeric: tabular-nums; white-space: nowrap }
.dark .price { color:#f2e9cf }
.desc { font-size: calc(8.4pt * var(--s, 1)); line-height: 1.36; color:#614a32; margin-top: 1pt; padding-right: 0.3in }
.dark .desc { color:#d9d0c2 }
.notes { font-family: Cormorant; font-style: italic; font-weight:500; font-size: calc(9.6pt * var(--s, 1)); color:#8a6a3a; margin-top: 0.5pt }
.dark .notes { color:#dcbf7b }
.choices { font-family: Cormorant; font-style: italic; font-weight:500; font-size: calc(9.6pt * var(--s, 1)); color:#614a32; margin-top: 1pt }
.choices .add { font-family: Jost; font-style: normal; font-size: 7.4pt }
.dark .choices { color:#d8c391 }
.foot { position:absolute; left:0.55in; right:0.55in; bottom: 0.36in; display:flex; align-items:center; justify-content:center; gap: 8pt; font-size: 6.6pt; letter-spacing: .08em; color:#614a32 }
.dark .foot { color:#b69e70 }
.foot .logo { width: 0.3in; height:auto }
.legend { font-size: 6.9pt; color:#614a32; line-height: 1.5; border-top: 0.4pt solid rgba(155,126,83,.5); padding-top: 5pt; margin-top: 4pt; break-inside: avoid }
.legend .tag { display:inline-flex; transform: translateY(1pt) }
.legend .heat { transform: translateY(0) }
.end { text-align:center; margin-top: 10pt; break-inside: avoid }
.end .logo { width: 0.9in; height: auto; opacity: .95 }
.end p { font-family: Cormorant; font-style: italic; font-size: 11pt; color:#614a32; margin-top: 2pt }
.dark .end p { color:#d8c391 }
`;

const legend = `<div class="legend"><span class="tag">V</span> vegetarian &nbsp; <span class="tag">N</span> contains nuts &nbsp; ${heat(1)} mild … ${heat(4)} hot<br>Please tell your server about any allergies before ordering.</div>`;

function pageHtml(p, dark, idx, total, kind) {
  const mast = p.mast
    ? `<header class="mast">${dark ? logoBrass : logoChoc}<p class="kinds">${dark ? "The Bar" : "Himalayan · Nepalese · Indian · Indo-Chinese"}</p><p class="tagline">${dark ? "Last orders at the summit" : "From the Terai to the Himalayas"}</p><div class="rule"></div></header>`
    : "";
  const end = p.end ? `<div class="end">${dark ? markBrass : markFoil}<p>${dark ? "Please drink responsibly. 21+ with valid ID." : "Thank you for climbing with us."}</p></div>` : "";
  return `<div class="page${dark ? " dark" : ""}" data-kind="${kind}"><div class="frame"></div>${mast}<div class="cols">${p.body}${p.mast && !dark ? legend : ""}${end}</div>
    <footer class="foot">${dark ? markBrass : markFoil}<span>8848 HIMALAYAN FUSION &amp; BAR · 258 RESERVOIR ST, HARRISONBURG, VA · ${idx + 1} / ${total}</span></footer></div>`;
}

const html = (pages, dark, kind) => `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body>${pages.map((p, i) => pageHtml(p, dark, i, pages.length, kind)).join("")}</body></html>`;

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 816, height: 1344 }, deviceScaleFactor: 2 });
let problems = 0;
for (const [kind, pages, dark] of [["food", FOOD, false], ["drinks", DRINKS, true]]) {
  await page.setContent(html(pages, dark, kind), { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  // size each page's column box to what's left under the masthead, then check nothing overflows
  const report = await page.evaluate(() => {
    const pages = [...document.querySelectorAll(".page")];
    const fitsAll = () => pages.every((pg) => { const c = pg.querySelector(".cols"); return c.scrollWidth <= c.clientWidth + 2; });
    const setCols = () => pages.forEach((pg) => {
      const mast = pg.querySelector(".mast"); const cols = pg.querySelector(".cols"); const cs = getComputedStyle(pg);
      cols.style.height = `${pg.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom) - (mast ? mast.getBoundingClientRect().height + 14 : 0)}px`;
    });
    const root = document.documentElement;
    pages.forEach((pg) => pg.style.setProperty("--g", "8pt"));
    let lo = 0.9, hi = 1.3;
    for (let k = 0; k < 12; k++) { const mid = (lo + hi) / 2; root.style.setProperty("--s", String(mid)); setCols(); if (fitsAll()) lo = mid; else hi = mid; }
    const scale = Math.floor(lo * 0.97 * 1000) / 1000; // leave room for the spacing fit
    root.style.setProperty("--s", String(scale)); setCols();
    return pages.map((pg, i) => {
      const mast = pg.querySelector(".mast");
      const cols = pg.querySelector(".cols");
      const avail = pg.clientHeight - parseFloat(getComputedStyle(pg).paddingTop) - parseFloat(getComputedStyle(pg).paddingBottom) - (mast ? mast.getBoundingClientRect().height + 14 : 0);
      cols.style.height = `${avail}px`;
      const fits = () => cols.scrollWidth <= cols.clientWidth + 2;
      let lo = 4, hi = 16;
      pg.style.setProperty("--g", lo + "pt");
      if (fits()) {
        for (let k = 0; k < 14; k++) {
          const mid = (lo + hi) / 2;
          pg.style.setProperty("--g", mid + "pt");
          if (fits()) lo = mid;
          else hi = mid;
        }
        // column balancing isn't perfectly monotonic: step back until it really fits
        lo = Math.floor(lo * 10) / 10;
        pg.style.setProperty("--g", lo + "pt");
        while (!fits() && lo > 4) { lo -= 0.3; pg.style.setProperty("--g", lo + "pt"); }
      }
      const gap = lo;
      const over = !fits();
      const last = [...cols.querySelectorAll(".dish, .legend, .end")].pop();
      const lastRight = last ? last.getBoundingClientRect().right - pg.getBoundingClientRect().left : 0;
      return { page: i + 1, overflow: over || lastRight > pg.clientWidth, dishes: cols.querySelectorAll(".dish").length, gap: gap.toFixed(1), scale: scale.toFixed(2) };
    });
  });
  for (const r of report) {
    console.log(`${kind} p${r.page}: ${r.dishes} items, type ×${r.scale}, gap ${r.gap}pt${r.overflow ? "  ← OVERFLOW" : ""}`);
    if (r.overflow) problems++;
  }
  await page.pdf({ path: path.join(OUT, `8848-${kind}-menu.pdf`), width: "8.5in", height: "14in", printBackground: true, preferCSSPageSize: true });
  const els = await page.$$(".page");
  for (let i = 0; i < els.length; i++) await els[i].screenshot({ path: path.join(OUT, "previews", `${kind}-${i + 1}.png`) });
}
const total = items.length;
console.log(`${total} items in menu.json`);
await browser.close();
if (problems) process.exitCode = 1;
