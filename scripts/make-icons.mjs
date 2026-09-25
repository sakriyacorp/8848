// Favicon, apple-touch-icon and Open Graph image, rendered from the traced logo paths with the
// brass treatment.   node scripts/make-icons.mjs
import sharp from "sharp";
import { readFile, writeFile, mkdir } from "node:fs/promises";

const src = await readFile("src/components/brand/logo-paths.ts", "utf8");
const str = (name) => JSON.parse(src.match(new RegExp(`${name} = (".*?");`))[1]);
const obj = (name) => JSON.parse(src.match(new RegExp(`${name} = (\\{.*?\\}|\\[.*?\\]) as const;`, "s"))[1]);
const PEAKS = str("PEAKS_D");
const TAG = str("TAGLINE_D");
const GLYPHS = obj("NUMERAL_GLYPHS");
const ARC = obj("ARC");
const ARC_PATH = `M ${ARC.cx - ARC.r} ${ARC.legBottom} L ${ARC.cx - ARC.r} ${ARC.cy} A ${ARC.r} ${ARC.r} 0 0 1 ${ARC.cx + ARC.r} ${ARC.cy} L ${ARC.cx + ARC.r} ${ARC.legBottom}`;

const brassDefs = `
  <linearGradient id="brass" x1="0" y1="0" x2="1" y2="0.35">
    <stop offset="0" stop-color="#8f7447"/><stop offset=".18" stop-color="#d8c391"/><stop offset=".32" stop-color="#f7ecce"/>
    <stop offset=".48" stop-color="#b69e70"/><stop offset=".66" stop-color="#e3d2a4"/><stop offset=".82" stop-color="#a88c5a"/><stop offset="1" stop-color="#c7ae7a"/>
  </linearGradient>
  <linearGradient id="plate" x1="0" y1="0" x2="1" y2="0.2">
    <stop offset="0" stop-color="#9b7e53"/><stop offset=".22" stop-color="#e3d2a4"/><stop offset=".4" stop-color="#c4ab78"/>
    <stop offset=".6" stop-color="#d9c595"/><stop offset=".78" stop-color="#f1e4bd"/><stop offset="1" stop-color="#a88c5a"/>
  </linearGradient>
  <radialGradient id="room" cx=".5" cy=".35" r=".8">
    <stop offset="0" stop-color="#3a2618"/><stop offset=".6" stop-color="#1a120d"/><stop offset="1" stop-color="#0e0a07"/>
  </radialGradient>
  <radialGradient id="lamp" cx=".5" cy=".5" r=".5">
    <stop offset="0" stop-color="#ffe2aa" stop-opacity=".55"/><stop offset="1" stop-color="#ffe2aa" stop-opacity="0"/>
  </radialGradient>
  <filter id="brush" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="0.004 0.9" numOctaves="3" seed="8" result="n"/>
    <feColorMatrix in="n" values="0 0 0 0 .5  0 0 0 0 .45  0 0 0 0 .35  0 0 0 .22 0"/>
    <feComposite in2="SourceGraphic" operator="in"/>
  </filter>
  <filter id="engrave">
    <feOffset dy="3" in="SourceAlpha" result="o"/>
    <feFlood flood-color="#fff6dc" flood-opacity=".55"/><feComposite in2="o" operator="in" result="lip"/>
    <feMerge><feMergeNode in="lip"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>`;

const mark = (fill) => `<path d="${ARC_PATH}" fill="none" stroke="${fill}" stroke-width="30"/><path d="${PEAKS}" fill="${fill}" fill-rule="evenodd"/>`;
const lockup = (fill, accent) =>
  `<path d="${ARC_PATH}" fill="none" stroke="${fill}" stroke-width="23"/><path d="${PEAKS}" fill="${accent}" fill-rule="evenodd"/>${GLYPHS.map((g) => `<path d="${g}" fill="${fill}" fill-rule="evenodd"/>`).join("")}<path d="${TAG}" fill="${accent}" fill-rule="evenodd"/>`;

// --- square icon: brass mark on the night room ---------------------------------------------
const icon = (size, pad = 0.14, round = 0.22) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 512 512">
<defs>${brassDefs}</defs>
<rect width="512" height="512" rx="${512 * round}" fill="url(#room)"/>
<circle cx="256" cy="210" r="230" fill="url(#lamp)"/>
<g transform="translate(${512 * pad} ${512 * pad + 40}) scale(${(512 * (1 - 2 * pad)) / 1780}) translate(-70 -36)">${mark("url(#brass)")}</g>
</svg>`;

await mkdir("public/brand", { recursive: true });
await sharp(Buffer.from(icon(512))).png().toFile("src/app/icon.png");
await sharp(Buffer.from(icon(512))).png().toFile("public/brand/mark-brass-512.png");
await sharp(Buffer.from(icon(180, 0.12, 0))).resize(180, 180).png().toFile("src/app/apple-icon.png");

// favicon.ico with a 32px and a 48px PNG inside
const png32 = await sharp(Buffer.from(icon(512, 0.08))).resize(32, 32).png().toBuffer();
const png48 = await sharp(Buffer.from(icon(512, 0.08))).resize(48, 48).png().toBuffer();
const imgs = [
  [32, png32],
  [48, png48],
];
const header = Buffer.alloc(6 + 16 * imgs.length);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(imgs.length, 4);
let offset = header.length;
imgs.forEach(([s, buf], i) => {
  const o = 6 + i * 16;
  header.writeUInt8(s, o);
  header.writeUInt8(s, o + 1);
  header.writeUInt8(0, o + 2);
  header.writeUInt8(0, o + 3);
  header.writeUInt16LE(1, o + 4);
  header.writeUInt16LE(32, o + 6);
  header.writeUInt32LE(buf.length, o + 8);
  header.writeUInt32LE(offset, o + 12);
  offset += buf.length;
});
await writeFile("src/app/favicon.ico", Buffer.concat([header, ...imgs.map(([, b]) => b)]));

// --- Open Graph: the brass plaque on the table ----------------------------------------------
const W = 1200, H = 630;
const pw = 400, ph = 420, px = W - pw - 90, py = 80;
const og = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs>${brassDefs}
  <linearGradient id="wood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6a4330"/><stop offset="1" stop-color="#3a2416"/></linearGradient>
  <linearGradient id="table" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a1b12"/><stop offset="1" stop-color="#140e0a"/></linearGradient>
</defs>
<rect width="${W}" height="${H}" fill="url(#room)"/>
<circle cx="140" cy="90" r="220" fill="url(#lamp)"/><circle cx="1080" cy="60" r="200" fill="url(#lamp)" opacity=".8"/>
<rect y="520" width="${W}" height="110" fill="url(#table)"/>
<ellipse cx="${px + pw / 2}" cy="${py + ph + 58}" rx="270" ry="22" fill="#000" opacity=".55"/>
<rect x="${px}" y="${py}" width="${pw}" height="${ph}" rx="4" fill="url(#plate)"/>
<rect x="${px}" y="${py}" width="${pw}" height="${ph}" rx="4" fill="#fff" filter="url(#brush)" opacity=".9"/>
<g filter="url(#engrave)" transform="translate(${px + 42} ${py + 36}) scale(${(pw - 84) / 1780}) translate(-70 -36)">${lockup("#3b2517", "#4a3020")}</g>
<rect x="${px - 26}" y="${py + ph - 28}" width="${pw + 52}" height="76" rx="3" fill="url(#wood)"/>
<rect x="${px - 26}" y="${py + ph - 28}" width="${pw + 52}" height="12" fill="#8a5a3c" opacity=".7"/>
<text x="90" y="250" font-family="Georgia, serif" font-size="64" fill="#f2e9cf">Sit down.</text>
<text x="90" y="326" font-family="Georgia, serif" font-style="italic" font-size="64" fill="#dcbf7b">We'll take you up.</text>
<text x="92" y="392" font-family="Georgia, serif" font-size="22" letter-spacing="5" fill="#b69e70">HIMALAYAN FUSION &amp; BAR</text>
<text x="92" y="430" font-family="Georgia, serif" font-size="20" fill="#b7a68a">258 Reservoir St · Harrisonburg, VA</text>
</svg>`;
await sharp(Buffer.from(og)).png().toFile("src/app/opengraph-image.png");
await sharp(Buffer.from(og)).png().toFile("src/app/twitter-image.png");
console.log("icons written");
