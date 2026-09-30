// Builds data/menu.json from data/menu-content.md, the single source of the menu copy (the same
// file goes into the print-menu kit). Edit the .md, then run:
//   npm run menu
// Web-only facts that aren't part of the printed copy (ids, photos, camps, picks) live here.
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const SRC = "data/menu-content.md";
const OUT = "data/menu.json";

/* Sections → website categories (each a camp on the climb). */
const SECTIONS = {
  "HIMALAYAN APPETIZERS": { id: "appetizers", name: "Himalayan Appetizers", np: "खाजा", camp: "Kathmandu", altitude: 1400 },
  "SOUPS & SALADS": { id: "soups-salads", name: "Soups & Salads", camp: "Lukla", altitude: 2860 },
  "MOMO · HIMALAYAN DUMPLINGS": { id: "momo", name: "Momo", np: "मोमो", camp: "Namche Bazaar", altitude: 3440 },
  "NEPALI STREET FLAVORS": { id: "street", name: "Nepali Street Flavors", camp: "Tengboche", altitude: 3867 },
  "TANDOOR & HIMALAYAN GRILL": { id: "grill", name: "Tandoor & Himalayan Grill", camp: "Dingboche", altitude: 4410 },
  "HIMALAYAN & INDIAN ENTRÉES": { id: "entrees", name: "Himalayan & Indian Entrées", camp: "Lobuche", altitude: 4940 },
  "8848 HIMALAYAN SIGNATURES": { id: "signatures", name: "8848 Himalayan Signatures", np: "दाल भात", camp: "Gorak Shep", altitude: 5164 },
  "BIRYANI & RICE": { id: "biryani", name: "Biryani & Rice", camp: "Everest Base Camp", altitude: 5364 },
  "8848 FUSION FAVORITES": { id: "fusion", name: "8848 Fusion Favorites", camp: "Khumbu Icefall", altitude: 5500 },
  "BREADS FROM THE TANDOOR": { id: "breads", name: "Breads from the Tandoor", camp: "Camp I", altitude: 6065 },
  "LITTLE HIMALAYAN ADVENTURERS": { id: "kids", name: "Little Himalayan Adventurers", camp: "Camp II", altitude: 6400 },
  DESSERTS: { id: "desserts", name: "Desserts", np: "मिठाई", camp: "South Col", altitude: 7950 },
  "HIMALAYAN TEA & COFFEE": { id: "drinks", name: "Tea, Coffee & Cold Drinks", np: "चिया", camp: "The Balcony", altitude: 8400, group: "Tea & coffee" },
  "COLD & REFRESHING": { id: "drinks", group: "Cold & refreshing" },
  "8848 ZERO-PROOF": { id: "bar", name: "The Bar", camp: "Summit", altitude: 8849, kind: "zero", group: "Zero-proof" },
  "8848 SIGNATURE COCKTAILS": { id: "bar", kind: "cocktail", group: "Signature cocktails" },
  WINE: { id: "bar", kind: "wine" },
  BEER: { id: "bar", kind: "beer" },
  "THE SPIRIT COLLECTION": { id: "bar", kind: "spirit" },
};

const BLURB = {
  momo: "Himalayan dumplings, pleated by hand.",
  street: "From the Terai to the Himalayas.",
  entrees: "Classic favorites, refined Himalayan flavors.",
  signatures: "The food of home, the way Nepal eats it.",
  biryani: "Saffron basmati layered with caramelized onion and herbs, slow-finished. Served with raita.",
  fusion: "Familiar favorites with a Himalayan twist. Served with fries.",
  kids: "Kids' menu · ages 12 and under.",
  bar: "Signature cocktails, Nepal's own spirits, wine, beer and zero-proof. 21+ with ID.",
};

/* Short, readable ids where the name makes a clumsy slug. */
const ID = {
  "8848 Himalayan Momo Platter · 12 pieces": "momo-platter",
  "8848 Signature Nepali Thali": "nepali-thali",
  "8848 Mixed Grill": "mixed-grill",
  "8848 Lamb Biryani": "lamb-biryani",
  "8848 Grand Biryani": "grand-biryani",
  "8848 Himalayan Lemonade": "himalayan-lemonade",
  "8848 Summit": "summit-cocktail",
  "Vegetable Steamed Momo": "veg-steamed-momo",
};
/* Web display names (the print copy keeps the long form). */
const NAME = { "8848 Himalayan Momo Platter · 12 pieces": "8848 Himalayan Momo Platter" };
const DESC_PREFIX = { "momo-platter": "Twelve pieces. " };

/* Photos in public/dishes/ that genuinely show the dish. Anything not listed gets the brass
   line-art illustration until it has a real photo. */
const IMG = {
  "vegetable-samosa": "o-vegetable-samosa",
  "thicheko-aalu": "p-aloo-sadheko",
  "sweet-and-spicy-bhel-puri": "p-chatpate",
  "veg-mix-platter": "o-vegetable-pakoras",
  "paneer-chilli": "p-chilli-paneer",
  "chicken-lollipop": "p-chicken-lollipop",
  "chilli-chicken": "o-chicken-chilli",
  "chicken-65": "p-dragon-chicken",
  "hot-and-sour-soup": "p-hot-sour-soup",
  "veg-steamed-momo": "o-momo-veggie",
  "chicken-steamed-momo": "o-chicken-momo",
  "goat-steamed-momo": "p-momo-dark",
  "chicken-jhol-momo": "p-jhol-momo",
  "goat-jhol-momo": "p-jhol-momo",
  "kothey-momo": "p-kothey-momo",
  "chilli-fry-momo": "o-chicken-chili-momo",
  "momo-platter": "p-momo-platter",
  "chicken-choila": "p-choila",
  "mutton-sekuwa": "p-sekuwa",
  "mutton-jhaneko-sekuwa": "o-boti-kebab",
  "buff-sukuti": "p-sukuti",
  "chow-mein": "p-chowmein",
  thukpa: "p-thukpa",
  "fried-rice": "p-fried-rice",
  "tandoori-chicken": "o-chicken-tandoori",
  "chicken-tikka": "o-chicken-tikka",
  "paneer-tikka": "o-paneer-tikka",
  "mixed-grill": "o-tandoori-mixed-grill",
  "dal-makhani": "dal-makhani",
  "palak-paneer": "o-saag-paneer",
  "shahi-paneer": "o-paneer-tikka-masala",
  "butter-chicken": "o-butter-chicken",
  "chicken-tikka-masala": "o-chicken-tikka-masala",
  "chicken-curry": "o-chicken-curry",
  "chicken-korma": "o-pistachio-chicken-korma",
  "lamb-curry": "o-rogan-josh",
  "goat-curry": "goat-curry",
  "nepali-thali": "p-dal-bhat",
  "himalayan-vegetable-biryani": "biryani-veg",
  "royal-chicken-biryani": "o-chicken-biryani",
  "everest-goat-biryani": "o-goat-biryani",
  roti: "o-roti",
  "butter-naan": "o-naan",
  "garlic-naan": "o-garlic-naan",
  "cheese-naan": "o-paneer-naan",
  "momo-mountain": "o-chicken-momo",
  "little-explorer-chow-mein": "p-chowmein",
  "cheesy-naan-combo": "o-paneer-naan",
  "gulab-jamun": "o-gulab-jamun",
  kheer: "p-kheer",
  "nepali-masala-chiya": "chai",
  "mango-lassi": "o-mango-lassi",
  "sweet-lassi": "lassi",
  "himalayan-lemonade": "p-ginger-lemonade",
  "soft-drinks": "soda",
  "everest-cooler": "p-mocktail",
  "timmur-ginger-fizz": "p-ginger-fizz",
  "kathmandu-old-fashioned": "p-old-fashioned",
  "khukri-mule": "p-mule",
  "timmur-margarita": "p-margarita",
  "kim-crawford-sauvignon-blanc": "p-white-wine",
  "kendall-jackson-vintners-reserve-chardonnay": "p-white-wine",
  "chateau-ste-michelle-riesling": "p-white-wine",
  "meiomi-pinot-noir": "p-red-wine",
  "josh-cellars-cabernet-sauvignon": "p-red-wine",
  "alamos-malbec": "p-red-wine",
  "modelo-especial": "p-lager",
  "virginia-craft-ipa": "p-ipa",
  "kingfisher-premium-lager": "p-lager",
  "taj-mahal-premium-lager": "p-lager",
  "khukri-xxx-rum": "p-dark-rum",
  // 2026 menu photos (Pexels, reviewed one by one; dishes without an honest match keep the illustration)
  "aloo-chop": "p-aloo-chop",
  "sweet-and-sour-chicken": "p-sweet-sour-chicken",
  "poleko-moleko-chicken": "p-poleko-chicken",
  "shrimp-chilli": "p-shrimp-chilli",
  "himalayan-goat-soup": "p-goat-soup",
  "sweet-corn-soup": "p-sweet-corn-soup",
  "8848-himalayan-salad": "p-himalayan-salad",
  "himalayan-grilled-chicken-salad": "p-chicken-salad",
  "macha-tareko": "p-macha-tareko",
  "badel-sekuwa": "p-badel-sekuwa",
  "mutton-taas": "p-mutton-taas",
  "buff-chilli": "p-buff-chilli",
  "lamb-chops": "p-lamb-chops",
  "himalayan-wild-boar-chops": "p-boar-chops",
  "grilled-salmon": "p-grilled-salmon",
  "tandoori-shrimp": "p-tandoori-shrimp",
  "dal-tadka": "p-dal-tadka",
  "chicken-kadai": "p-kadai",
  "lamb-kadai": "p-kadai",
  "goat-kadai": "p-kadai",
  "chicken-vindaloo": "p-vindaloo",
  "fish-curry": "p-fish-curry",
  "butter-shrimp": "p-butter-shrimp",
  "coconut-shrimp-curry": "p-coconut-shrimp",
  "lamb-biryani": "p-lamb-biryani",
  "coastal-shrimp-biryani": "p-shrimp-biryani",
  "grand-biryani": "p-grand-biryani",
  "butter-chicken-sandwich": "p-bc-sandwich",
  "buttermilk-chicken-sandwich": "p-buttermilk-sandwich",
  "honey-glazed-spiced-chicken-wings": "p-wings",
  "aloo-paratha": "p-aloo-paratha",
  "everest-chicken-tender-combo": "p-chicken-tenders",
  "fresh-ginger-tea": "p-ginger-tea",
  "himalayan-honey-lemon-tea": "p-honey-lemon-tea",
  "green-tea": "p-green-tea",
  "fresh-brewed-coffee": "p-coffee",
  "fresh-lime-soda": "p-lime-soda",
  "fresh-brewed-iced-tea": "p-iced-tea",
  "everest-garden": "p-everest-garden",
  "himalayan-sunset": "p-himalayan-sunset",
  "kathmandu-garden": "p-kathmandu-garden",
};

/* Placeholder picks (the owner should choose these). */
const CHEF = ["momo-platter", "nepali-thali", "chicken-jhol-momo", "chicken-choila", "mixed-grill", "mutton-jhaneko-sekuwa", "thicheko-aalu", "summit-cocktail", "kathmandu-old-fashioned"];
const POPULAR = ["chicken-steamed-momo", "veg-steamed-momo", "chilli-chicken", "chilli-fry-momo", "butter-chicken", "chicken-tikka-masala", "chow-mein", "royal-chicken-biryani", "garlic-naan", "vegetable-samosa", "mango-lassi", "timmur-margarita"];

const OPTION_LABEL = { "momo-platter": "Chilli fry momo", "soft-drinks": "Your drink", "fresh-lime-soda": "Style", "fresh-brewed-iced-tea": "Sweetness", "fresh-brewed-coffee": "How you take it" };

const slug = (s) =>
  s
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
const money = (s) => Number(s.replace(/[$,]/g, ""));

function parseChoices(text) {
  return text.split(" · ").map((part) => {
    const m = part.trim().match(/^(.*?)(?:\s*\(\+\$([\d.]+)\))?$/);
    const v = { name: m[1].trim() };
    if (m[2]) v.add = Number(m[2]);
    return v;
  });
}

const md = readFileSync(SRC, "utf8");
const lines = md.split(/\r?\n/);
const categories = [];
const items = [];
let section = null;
let group = null;
let item = null;
let started = false;

const pushCategory = (spec) => {
  if (categories.some((c) => c.id === spec.id)) return;
  const c = { id: spec.id, name: spec.name, camp: spec.camp, altitude: spec.altitude };
  if (spec.np) c.np = spec.np;
  if (BLURB[spec.id]) c.blurb = BLURB[spec.id];
  categories.push(c);
};

for (const raw of lines) {
  const line = raw.replace(/\s+$/, "");
  const h = line.match(/^## (.+)$/);
  if (h) {
    section = SECTIONS[h[1].trim()];
    if (!section) throw new Error(`Unknown section: ${h[1]}`);
    pushCategory(section.name ? section : { ...SECTIONS[Object.keys(SECTIONS).find((k) => SECTIONS[k].id === section.id && SECTIONS[k].name)] });
    group = section.group ?? null;
    item = null;
    started = true;
    continue;
  }
  if (!started || !section) continue;
  if (/^(eyebrow|subtitle):/.test(line) || line.startsWith("#") || line.startsWith(">") || line.startsWith("Footer") || line === "---") continue;

  const it = line.match(/^- \*\*(.+?)\*\*(.*)$/);
  if (it) {
    const rawName = it[1];
    const rest = it[2];
    const id = ID[rawName] ?? slug(rawName);
    const parts = rest.split(" · ").map((p) => p.trim()).filter(Boolean);
    const out = { id, name: NAME[rawName] ?? rawName, category: section.id, price: 0, desc: "", tags: [], spice: 0, img: IMG[id] ?? `x-${id}` };
    if (group) out.group = group;
    if (section.kind) out.kind = section.kind;
    // wine / beer / spirits: "· $11 / $42 — notes" or "· $7 — notes"
    const dash = rest.match(/·\s*\$([\d.]+)(?:\s*\/\s*\$([\d.]+))?\s*—\s*(.+)$/);
    if (dash) {
      out.price = Number(dash[1]);
      out.desc = dash[3].trim();
      if (dash[2]) {
        out.options = { label: "Pour", values: [{ name: "Glass" }, { name: "Bottle", add: Math.round((Number(dash[2]) - out.price) * 100) / 100 }] };
        out.priceLabel = `$${dash[1]} / $${dash[2]}`;
      }
    } else {
      for (const p of parts) {
        if (/^[ऀ-ॿ]/.test(p)) out.np = p;
        else if (/^\$/.test(p)) out.price = money(p);
        else if (p === "V") out.tags.push("vegetarian");
        else if (p === "N") out.tags.push("nuts");
        else if (/^▲+$/.test(p)) out.spice = p.length;
      }
    }
    if (CHEF.includes(id)) out.tags.push("chef");
    if (POPULAR.includes(id)) out.tags.push("popular");
    if (items.some((x) => x.id === id)) throw new Error(`Duplicate id ${id}`);
    items.push(out);
    item = out;
    continue;
  }

  if (item && /^\s{2,}\S/.test(raw)) {
    const t = line.trim();
    const choice = t.match(/^(?:Choice|Chilli fry):\s*(.+)$/);
    if (choice) {
      item.options = { label: OPTION_LABEL[item.id] ?? "Choose", values: parseChoices(choice[1]) };
      continue;
    }
    const notes = t.match(/^(.*?)\s*\*(.+)\*$/);
    if (notes) {
      item.desc = (DESC_PREFIX[item.id] ?? "") + notes[1].trim();
      item.notes = notes[2].trim();
    } else {
      item.desc = (DESC_PREFIX[item.id] ?? "") + t;
    }
    continue;
  }

  // a plain line inside a section is a group label (Vegetarian, Chicken, Sparkling, On draft…)
  const g = line.trim();
  if (g && !g.startsWith("-")) {
    group = g;
    item = null;
  }
}

// bar: cocktails first, then zero-proof, wine, beer, spirits
const KIND_ORDER = { cocktail: 0, zero: 1, wine: 2, beer: 3, spirit: 4 };
const bar = items.filter((i) => i.category === "bar").sort((a, b) => KIND_ORDER[a.kind] - KIND_ORDER[b.kind]);
const ordered = [...items.filter((i) => i.category !== "bar"), ...bar];

const noPrice = ordered.filter((i) => !i.price);
if (noPrice.length) throw new Error(`no price: ${noPrice.map((i) => i.id).join(", ")}`);
const orphanImg = Object.keys(IMG).filter((id) => !ordered.some((i) => i.id === id));
if (orphanImg.length) throw new Error(`IMG ids not on the menu: ${orphanImg.join(", ")}`);
for (const i of ordered) if (!i.img.startsWith("x-") && !existsSync(`public/dishes/${i.img}.jpg`)) throw new Error(`missing photo ${i.img}`);

const json = {
  _notes: {
    source: "Generated from data/menu-content.md by scripts/menu-from-md.mjs. Edit the .md, then run npm run menu.",
    placeholder: true,
    status: "Dishes, names, sections and descriptions follow the owner's draft menu (2026). PRICES ARE PLACEHOLDERS (the draft had none; only the goat +$3.50 momo upcharge is from the draft). Heat levels and chef/popular picks are suggestions. Diet tags: only 'vegetarian' (from ingredients) and 'nuts' (where the description names nuts) are marked; gluten-free and vegan need the kitchen's confirmation.",
    img: "Image family key: public/dishes/<img>.jpg. Keys starting x- have no photo yet and render a brass line-art illustration.",
    spice: "0 = none … 4 = hot (▲ marks on the printed menu).",
    options: "Choices a guest picks (protein, pour…). 'add' is the extra charge on top of price.",
  },
  categories,
  items: ordered,
};
writeFileSync(OUT, JSON.stringify(json, null, 1) + "\n");
console.log(`${categories.length} categories, ${ordered.length} items → ${OUT} (${ordered.filter((i) => !i.img.startsWith("x-")).length} with photos)`);
