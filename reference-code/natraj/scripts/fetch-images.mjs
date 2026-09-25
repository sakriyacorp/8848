// Pull one photo per image family from Pexels into public/dishes/<family>.jpg
//
// Setup (2 minutes):
//   1. Free key at https://www.pexels.com/api/  (Pexels license allows commercial use, no attribution required)
//   2. PEXELS_API_KEY=xxxx node scripts/fetch-images.mjs
//
// Flags:
//   --only=butter-chicken,naan   fetch just these families
//   --force                      re-download even if the file exists
//   --page=2                     take the Nth result instead of the first (use when a photo looks wrong)
//
// The script never touches menu.json. To swap a photo later, just replace the jpg.

import { mkdir, writeFile, access } from "node:fs/promises";
import path from "node:path";

const KEY = process.env.PEXELS_API_KEY;
if (!KEY) { console.error("Set PEXELS_API_KEY"); process.exit(1); }

const OUT = path.resolve("public/dishes");
const args = Object.fromEntries(process.argv.slice(2).map(a => {
  const [k, v = true] = a.replace(/^--/, "").split("=");
  return [k, v];
}));

// family -> Pexels query. Tuned toward dark, moody, close-up food photography.
const FAMILIES = {
  "soup-lentil": "dal soup bowl indian",
  "soup-tomato": "tomato soup bowl dark",
  "soup-chicken": "chicken soup bowl",
  "soup-veg": "vegetable soup bowl dark",
  "chaat": "aloo chaat indian street food",
  "chaat-chicken": "chicken chaat salad indian",
  "salad": "kachumber salad cucumber tomato onion",
  "samosa": "samosa chutney dark background",
  "samosa-meat": "meat samosa",
  "tikki": "potato cutlet patties fried",
  "bhaji": "onion bhaji fritters",
  "pakora": "vegetable pakora fritters",
  "paneer-pakora": "paneer fritters fried",
  "chicken-pakora": "chicken pakora fried",
  "platter-veg": "indian vegetarian appetizer platter",
  "platter-mixed": "indian appetizer platter kebab samosa",
  "shrimp-poori": "shrimp curry leaves indian appetizer",
  "tandoori-chicken": "tandoori chicken sizzling dark",
  "chicken-tikka": "chicken tikka skewers grilled",
  "boti-kebab": "grilled lamb skewers",
  "seekh-kebab": "seekh kebab grilled",
  "reshmi-kebab": "chicken kebab skewers grilled creamy",
  "tandoori-fish": "tandoori fish salmon grilled",
  "tandoori-shrimp": "tandoori prawns grilled",
  "mixed-grill": "tandoori mixed grill platter sizzling",
  "veg-grill": "grilled vegetable skewers tandoori",
  "butter-chicken": "butter chicken creamy bowl",
  "tikka-masala": "chicken tikka masala creamy curry",
  "curry-chicken": "chicken curry indian bowl dark",
  "korma": "chicken korma curry creamy",
  "korma-pistachio": "chicken korma pistachio",
  "saag": "chicken saag spinach curry",
  "saag-lamb": "lamb saag spinach curry",
  "saag-paneer": "palak paneer bowl",
  "saag-sabzi": "saag vegetables spinach curry",
  "jalfrezi": "chicken jalfrezi peppers",
  "jalfrezi-lamb": "lamb jalfrezi",
  "shrimp-jalfrezi": "shrimp jalfrezi",
  "vindaloo": "chicken vindaloo red curry",
  "vindaloo-lamb": "mutton vindaloo curry",
  "patia": "chicken patia sweet sour curry",
  "patia-lamb": "lamb curry mango",
  "mushroom-curry": "chicken mushroom curry",
  "mushroom-lamb": "mushroom masala curry",
  "madras": "chicken madras curry coconut",
  "madras-lamb": "lamb madras curry",
  "madras-shrimp": "prawn madras curry",
  "karahi": "karahi chicken wok",
  "karahi-lamb": "mutton karahi masala",
  "karahi-paneer": "kadai paneer",
  "karahi-shrimp": "prawn curry karahi indian",
  "chilli-chicken": "chilli chicken indo chinese",
  "chilli-paneer": "chilli paneer",
  "mango-curry": "mango chicken curry",
  "mango-curry-lamb": "mango lamb curry coconut",
  "mango-curry-shrimp": "shrimp curry mango",
  "paneer-tikka-masala": "paneer tikka masala",
  "veg-tikka-masala": "vegetable tikka masala",
  "goat-curry": "goat curry mutton",
  "goat-kashmiri": "mutton korma kashmiri",
  "lamb-curry": "rogan josh lamb curry",
  "lamb-korma": "lamb korma creamy",
  "bhuna": "mutton masala curry bowl",
  "fish-curry": "fish curry coconut kerala",
  "fish-tikka-masala": "fish tikka masala",
  "shrimp-curry": "shrimp curry indian bowl",
  "shrimp-masala": "shrimp masala curry",
  "seafood-curry": "seafood curry mussels shrimp",
  "scallop": "scallop curry",
  "malai-kofta": "malai kofta",
  "mattar-paneer": "matar paneer",
  "navratan-korma": "navratan korma",
  "chana-masala": "chana masala chickpea curry",
  "dal-makhani": "dal makhani",
  "dal-tadka": "dal tadka yellow lentils",
  "dal-saag": "dal palak spinach lentils",
  "aloo-gobi": "aloo gobi",
  "aloo-mattar": "aloo matar",
  "aloo-palak": "palak potato curry green",
  "baingan-bharta": "baingan bharta",
  "baingan-masala": "eggplant masala curry",
  "bhindi-masala": "bhindi masala okra",
  "mattar-mushroom": "matar mushroom curry",
  "veg-curry": "mixed vegetable curry indian",
  "biryani-chicken": "chicken biryani dark background",
  "biryani-lamb": "mutton biryani",
  "biryani-shrimp": "prawn biryani",
  "biryani-veg": "vegetable biryani",
  "biryani-house": "biryani platter mixed",
  "pulao": "peas pulao rice",
  "rice-basmati": "saffron basmati rice bowl",
  "naan": "naan bread tandoor",
  "naan-garlic": "garlic naan butter coriander",
  "naan-stuffed": "stuffed naan cheese",
  "kulcha": "onion kulcha",
  "roti": "tandoori roti",
  "paratha": "paratha layered flatbread",
  "poori": "puri puffed bread",
  "papadum": "papadum crisp",
  "bread-basket": "indian bread basket naan roti",
  "raita": "raita cucumber yogurt",
  "yogurt": "plain yogurt bowl",
  "chutney": "mango chutney jar",
  "pickle": "indian mixed pickle achar",
  "masala-papad": "masala papad",
  "samosa-chaat": "samosa chaat",
  "gulab-jamun": "gulab jamun",
  "kheer": "kheer rice pudding",
  "ras-malai": "rasmalai",
  "kulfi": "kulfi indian ice cream",
  "ice-cream-mango": "mango ice cream scoop",
  "ice-cream-pistachio": "pistachio ice cream scoop",
  "mango-lassi": "mango lassi glass",
  "lassi": "lassi yogurt drink glass",
  "mango-shake": "mango milkshake",
  "chai": "masala chai cup",
  "coffee": "black coffee cup dark",
  "juice-mango": "mango juice glass",
  "juice-orange": "orange juice glass",
  "juice-apple": "apple juice glass",
  "lemonade": "lemonade glass ice",
  "iced-tea": "iced tea glass",
  "soda": "cola glass ice",
  "sparkling-water": "sparkling water glass lime"
};

const only = args.only ? String(args.only).split(",") : Object.keys(FAMILIES);
const page = Number(args.page || 1);
await mkdir(OUT, { recursive: true });

let ok = 0, skipped = 0, failed = [];
for (const fam of only) {
  const q = FAMILIES[fam];
  if (!q) { failed.push(`${fam} (unknown family)`); continue; }
  const file = path.join(OUT, `${fam}.jpg`);
  if (!args.force && await access(file).then(() => true, () => false)) { skipped++; continue; }

  try {
    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(q)}&per_page=1&page=${page}&orientation=landscape`;
    const res = await fetch(url, { headers: { Authorization: KEY } });
    if (!res.ok) throw new Error(`pexels ${res.status}`);
    const json = await res.json();
    const photo = json.photos?.[0];
    if (!photo) throw new Error("no result");
    const img = await fetch(photo.src.large2x); // ~1880px wide
    await writeFile(file, Buffer.from(await img.arrayBuffer()));
    ok++;
    console.log(`✓ ${fam}  ←  ${photo.photographer}  (${photo.url})`);
    await new Promise(r => setTimeout(r, 250)); // stay well under rate limit
  } catch (e) {
    failed.push(`${fam} (${e.message})`);
  }
}
console.log(`\n${ok} downloaded, ${skipped} skipped, ${failed.length} failed`);
if (failed.length) console.log(failed.join("\n"));
