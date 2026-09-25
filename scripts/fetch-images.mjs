// Dish photos from Pexels (free for commercial use, no attribution required — credits are
// still recorded in data/photo-credits.json). Build-time only; the site never calls Pexels.
//
//   node --env-file=.env.local scripts/fetch-images.mjs --candidates [--only=a,b] [--n=5]
//       → scratch/pexels/<family>/<i>.jpg thumbnails + scratch/pexels/index.json, for review
//   node --env-file=.env.local scripts/fetch-images.mjs --pick=p-thukpa:2,p-laphing:0
//       → public/dishes/<family>.jpg (large) + credit line
//   --pick=p-momo-dark=p-tandoori-momo:0   (save another family's candidate under a new name)
//
// Queries lean dark, moody and close-up to sit next to the brass-plaque dining room.

import { mkdir, writeFile, readFile } from "node:fs/promises";
import path from "node:path";

const KEY = process.env.PEXELS_API_KEY;
if (!KEY) {
  console.error("PEXELS_API_KEY is not set (put it in .env.local).");
  process.exit(1);
}

export const FAMILIES = {
  "p-jhol-momo": "momo dumplings soup broth",
  "p-kothey-momo": "pan fried dumplings potstickers",
  "p-fried-momo": "fried dumplings golden",
  "p-tandoori-momo": "grilled dumplings charred",
  "p-choila": "spicy grilled chicken pieces dark",
  "p-sukuti": "spicy dried meat stir fry",
  "p-sekuwa": "chicken skewers grilled charcoal",
  "p-aloo-sadheko": "spiced potato salad sesame",
  "p-chatpate": "bhel puri puffed rice snack",
  "p-sel-roti": "ring shaped fried bread",
  "p-wai-wai": "instant noodle salad spicy",
  "p-thukpa": "noodle soup bowl dark",
  "p-thenthuk": "hand pulled noodle soup",
  "p-chowmein": "chow mein noodles wok",
  "p-laphing": "cold noodles chili oil",
  "p-manchow-soup": "dark soy broth soup vegetables",
  "p-hot-sour-soup": "hot and sour soup bowl",
  "p-chilli-paneer": "chilli paneer",
  "p-gobi-manchurian": "gobi manchurian",
  "p-dragon-chicken": "crispy chilli chicken cashew",
  "p-honey-chilli-potato": "honey chilli potatoes sesame",
  "p-hakka-noodles": "vegetable hakka noodles",
  "p-fried-rice": "spicy fried rice wok",
  "p-veg-manchurian": "manchurian balls gravy",
  "p-chicken-lollipop": "chicken wings red sauce",
  "p-dal-bhat": "dal bhat thali",
  "p-aloo-tama": "potato bamboo shoot curry",
  "p-gundruk": "leafy greens soup bowl rustic",
  "p-juju-dhau": "yogurt clay pot",
  "p-kheer": "rice pudding pistachio cardamom",
  "p-creme-brulee": "creme brulee dark",
  "p-chocolate-kulfi": "chocolate kulfi",
  "p-butter-tea": "butter tea tibetan",
  "p-ginger-lemonade": "ginger honey lemonade glass",
  "p-old-fashioned": "old fashioned cocktail dark bar",
  "p-margarita": "margarita salt rim dark",
  "p-spritz": "pink spritz cocktail",
  "p-dark-rum": "dark rum cocktail bar moody",
  "p-mule": "moscow mule copper mug",
  "p-negroni": "negroni cocktail dark",
  "p-golden-sour": "whiskey sour foam cocktail",
  "p-lager": "lager beer glass dark bar",
  "p-ipa": "ipa beer glass",
  "p-red-wine": "red wine glass dark",
  "p-white-wine": "white wine glass moody",
  "p-mocktail": "hibiscus mocktail mint",
  "p-ginger-fizz": "ginger soda mocktail lemon",
};

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const body = a.replace(/^--/, "");
    const eq = body.indexOf("=");
    return eq === -1 ? [body, true] : [body.slice(0, eq), body.slice(eq + 1)];
  }),
);

async function search(query, n, page = 1) {
  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${n}&page=${page}`;
  const res = await fetch(url, { headers: { Authorization: KEY } });
  if (!res.ok) throw new Error(`pexels ${res.status}`);
  return (await res.json()).photos ?? [];
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

if (args.candidates) {
  const n = Number(args.n || 5);
  const only = args.only ? String(args.only).split(",") : Object.keys(FAMILIES);
  const indexFile = "scratch/pexels/index.json";
  let index = {};
  try {
    index = JSON.parse(await readFile(indexFile, "utf8"));
  } catch {}
  for (const fam of only) {
    const q = args.q && only.length === 1 ? String(args.q) : FAMILIES[fam];
    try {
      const photos = await search(q, n, Number(args.page || 1));
      const dir = path.join("scratch/pexels", fam);
      await mkdir(dir, { recursive: true });
      index[fam] = [];
      for (let i = 0; i < photos.length; i++) {
        const p = photos[i];
        const img = await fetch(p.src.medium);
        await writeFile(path.join(dir, `${i}.jpg`), Buffer.from(await img.arrayBuffer()));
        index[fam].push({ id: p.id, url: p.url, photographer: p.photographer, large: p.src.large2x, alt: p.alt });
      }
      console.log(`✓ ${fam} (${photos.length})`);
    } catch (e) {
      console.log(`✗ ${fam}: ${e.message}`);
    }
    await sleep(200);
  }
  await mkdir("scratch/pexels", { recursive: true });
  await writeFile(indexFile, JSON.stringify(index, null, 1));
}

if (args.pick) {
  const index = JSON.parse(await readFile("scratch/pexels/index.json", "utf8"));
  const creditsFile = "data/photo-credits.json";
  let credits = {};
  try {
    credits = JSON.parse(await readFile(creditsFile, "utf8"));
  } catch {}
  await mkdir("public/dishes", { recursive: true });
  for (const pair of String(args.pick).split(",")) {
    // "family:idx" or "dest=sourceFamily:idx" (reuse another family's candidate)
    const [lhs, idx] = pair.split(":");
    const [fam, src = fam] = lhs.split("=");
    const c = index[src]?.[Number(idx)];
    if (!c) {
      console.log(`✗ ${fam}:${idx} not in index`);
      continue;
    }
    const img = await fetch(c.large);
    await writeFile(path.join("public/dishes", `${fam}.jpg`), Buffer.from(await img.arrayBuffer()));
    credits[fam] = { source: "Pexels", photographer: c.photographer, url: c.url };
    console.log(`✓ ${fam} ← ${c.photographer}`);
    await sleep(150);
  }
  await writeFile(creditsFile, JSON.stringify(credits, null, 1));
}
