/* Exports the traced logo as standalone SVG + high-res transparent PNG in each material, plus
   seamless paper / walnut / brushed-brass texture tiles and a palette swatch, for print work.
     node --experimental-strip-types scripts/export-brand-kit.mts <outDir> */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { ARC, PEAKS_D, NUMERAL_GLYPHS, TAGLINE_D } from "../src/components/brand/logo-paths.ts";

const OUT = process.argv[2] ?? "handoff/brand";
const ARC_SW = 23;
const ARC_PATH = `M ${ARC.cx - ARC.r} ${ARC.legBottom} L ${ARC.cx - ARC.r} ${ARC.cy} A ${ARC.r} ${ARC.r} 0 0 1 ${ARC.cx + ARC.r} ${ARC.cy} L ${ARC.cx + ARC.r} ${ARC.legBottom}`;
const VIEW = { lockup: [70, 36, 1780, 1634], mark: [70, 36, 1780, 984] } as const;

const BRASS = ["#8f7447", "#c7ae7a", "#f2e2b6", "#b69e70", "#9b7e53", "#d8c391", "#f7ecce", "#a88c5a"];
const FOIL = ["#8e6f3e", "#c9a764", "#f6e7b8", "#dcbf7b", "#a8854b", "#e8d39a", "#fff3cf", "#b08a4a"];

type Material = { name: string; paint: string; accent: string; defs: string };
const metal = (name: string, stops: string[]): Material => ({
  name,
  paint: "url(#paint)",
  accent: "url(#accent)",
  defs: `<linearGradient id="paint" x1="0" y1="0" x2="1" y2="0.4" spreadMethod="reflect">${stops.map((c, i) => `<stop offset="${i / (stops.length - 1)}" stop-color="${c}"/>`).join("")}</linearGradient>
<linearGradient id="accent" x1="0" y1="0" x2="0.9" y2="1">${stops.slice(1).map((c, i, a) => `<stop offset="${i / (a.length - 1)}" stop-color="${c}"/>`).join("")}</linearGradient>`,
});
const flat = (name: string, color: string): Material => ({ name, paint: color, accent: color, defs: "" });

const MATERIALS: Material[] = [
  metal("brass", BRASS), // on dark walnut / night
  metal("gold-foil", FOIL), // on cream paper
  flat("chocolate", "#3b2517"), // one-colour on cream paper (engraved look)
  flat("cream", "#f2e9cf"), // one-colour on dark
];

function svg(m: Material, variant: keyof typeof VIEW) {
  const [x, y, w, h] = VIEW[variant];
  const tag = variant === "lockup" ? `<path d="${TAGLINE_D}" fill="${m.accent}" fill-rule="evenodd"/>` : "";
  const nums = NUMERAL_GLYPHS.map((d) => `<path d="${d}" fill="${m.paint}" fill-rule="evenodd"/>`).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x} ${y} ${w} ${h}" width="${w}" height="${h}">
<defs>${m.defs}<clipPath id="ground"><rect x="0" y="0" width="1916" height="1006"/></clipPath></defs>
<path d="${ARC_PATH}" fill="none" stroke="${m.paint}" stroke-width="${ARC_SW}"/>
<g clip-path="url(#ground)"><path d="${PEAKS_D}" fill="${m.accent}" fill-rule="evenodd"/></g>
${variant === "lockup" ? nums : ""}${tag}
</svg>`;
}

const tile = (id: string, w: number, h: number, freq: string, octaves: number, matrix: string, seed: number, base: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><filter id="${id}" x="0" y="0" width="1" height="1"><feTurbulence type="fractalNoise" stitchTiles="stitch" baseFrequency="${freq}" numOctaves="${octaves}" seed="${seed}"/><feColorMatrix values="${matrix}"/></filter><rect width="${w}" height="${h}" fill="${base}"/><rect width="${w}" height="${h}" filter="url(#${id})"/></svg>`;

await mkdir(path.join(OUT, "logo"), { recursive: true });
await mkdir(path.join(OUT, "textures"), { recursive: true });
for (const variant of ["lockup", "mark"] as const) {
  for (const m of MATERIALS) {
    const s = svg(m, variant);
    const base = path.join(OUT, "logo", `8848-${variant}-${m.name}`);
    await writeFile(`${base}.svg`, s);
    await sharp(Buffer.from(s), { density: 300 }).resize({ width: 3000 }).png().toFile(`${base}.png`);
  }
}

// textures (seamless tiles; repeat them, don't stretch)
await sharp(Buffer.from(tile("p", 1200, 1200, "0.9", 3, "0 0 0 0 .42 0 0 0 0 .31 0 0 0 0 .2 0 0 0 .5 -.12", 2, "#efe8db")))
  .composite([{ input: Buffer.from(tile("m", 1200, 1200, "0.006", 3, "0 0 0 0 .55 0 0 0 0 .42 0 0 0 0 .28 0 0 0 .35 -.08", 9, "none")) }])
  .png()
  .toFile(path.join(OUT, "textures", "paper-lokta-cream.png"));
await sharp(Buffer.from(tile("w", 1200, 600, "0.0035 0.08", 4, "0 0 0 0 .36 0 0 0 0 .22 0 0 0 0 .14 0 0 0 2.2 -.75", 3, "#3a2416")))
  .png()
  .toFile(path.join(OUT, "textures", "walnut.png"));
await sharp(Buffer.from(tile("b", 1200, 1200, "0.002 0.9", 2, "0 0 0 0 1 0 0 0 0 .95 0 0 0 0 .82 0 0 0 .35 -.05", 5, "#b69e70")))
  .png()
  .toFile(path.join(OUT, "textures", "brushed-brass.png"));
await sharp(Buffer.from(tile("n", 1200, 1200, "0.85", 2, "0 0 0 0 .9 0 0 0 0 .8 0 0 0 0 .6 0 0 0 .08 0", 4, "#17110d")))
  .png()
  .toFile(path.join(OUT, "textures", "night-walnut-dark.png"));

// palette swatch
const PAL: [string, string, string][] = [
  ["Night", "#17110D", "page background (dark)"],
  ["Walnut", "#5B3825", "wood, stands"],
  ["Cocoa", "#4B3630", "linen, cards"],
  ["Chocolate", "#3B2517", "ink on cream"],
  ["Bronze", "#614A32", "secondary ink on cream"],
  ["Brass shadow", "#9B7E53", "rules, edges"],
  ["Brass", "#B69E70", "labels on dark"],
  ["Gold foil", "#DCBF7B", "accents on cream"],
  ["Brass highlight", "#F2E9CF", "headings on dark"],
  ["Lamp", "#EED3A5", "warm glow"],
  ["Cream", "#E6E0D6", "paper"],
  ["Lokta paper", "#EFE8DB", "menu page"],
];
const sw = PAL.map(
  ([n, hex, use], i) =>
    `<g transform="translate(${(i % 4) * 300} ${Math.floor(i / 4) * 230})"><rect x="16" y="16" width="268" height="140" rx="10" fill="${hex}" stroke="#00000022"/><text x="20" y="182" font-family="Georgia, serif" font-size="22" fill="#3b2517">${n}</text><text x="20" y="208" font-family="monospace" font-size="17" fill="#614a32">${hex} · ${use}</text></g>`,
).join("");
await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="700"><rect width="1200" height="700" fill="#efe8db"/>${sw}</svg>`))
  .png()
  .toFile(path.join(OUT, "palette.png"));
console.log("brand kit →", OUT);
