// Frost for the ascent: branching ice crystals growing in from the edges of the frame.
//   node scripts/make-frost.mjs  → public/fx/frost.svg
import { mkdir, writeFile } from "node:fs/promises";

let seed = 8848;
const rand = () => {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 4294967296;
};

const W = 1600;
const H = 1000;
const paths = [];

function grow(x, y, ang, len, depth, width) {
  let d = `M${x.toFixed(1)} ${y.toFixed(1)}`;
  const segs = 4 + Math.floor(rand() * 4);
  let cx = x;
  let cy = y;
  for (let i = 0; i < segs; i++) {
    ang += (rand() - 0.5) * 0.5;
    const l = (len / segs) * (0.7 + rand() * 0.6);
    cx += Math.cos(ang) * l;
    cy += Math.sin(ang) * l;
    d += ` L${cx.toFixed(1)} ${cy.toFixed(1)}`;
    if (depth > 0 && rand() < 0.42) {
      const side = rand() < 0.5 ? 1 : -1;
      grow(cx, cy, ang + side * (0.6 + rand() * 0.5), len * 0.45, depth - 1, width * 0.6);
    }
  }
  paths.push(`<path d="${d}" stroke-width="${width.toFixed(2)}" opacity="${(0.25 + rand() * 0.35).toFixed(2)}"/>`);
}

const edges = [
  { n: 20, pos: () => [rand() * W, 0], ang: Math.PI / 2 },
  { n: 20, pos: () => [rand() * W, H], ang: -Math.PI / 2 },
  { n: 14, pos: () => [0, rand() * H], ang: 0 },
  { n: 14, pos: () => [W, rand() * H], ang: Math.PI },
];
for (const e of edges) {
  for (let i = 0; i < e.n; i++) {
    const [x, y] = e.pos();
    grow(x, y, e.ang + (rand() - 0.5) * 0.9, 60 + rand() * 120, 2, 0.5 + rand() * 0.6);
  }
}
// heavier corners
for (const [x, y, a] of [
  [0, 0, Math.PI / 4],
  [W, 0, (3 * Math.PI) / 4],
  [0, H, -Math.PI / 4],
  [W, H, (-3 * Math.PI) / 4],
]) {
  for (let i = 0; i < 7; i++) grow(x, y, a + (rand() - 0.5) * 1.2, 120 + rand() * 160, 3, 0.7 + rand() * 0.6);
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">
<defs><radialGradient id="v" cx=".5" cy=".5" r=".75"><stop offset=".55" stop-color="#fbf8f0" stop-opacity="0"/><stop offset="1" stop-color="#fbf8f0" stop-opacity=".62"/></radialGradient></defs>
<rect width="${W}" height="${H}" fill="url(#v)"/>
<g fill="none" stroke="#fdfbf5" stroke-linecap="round" stroke-linejoin="round">${paths.join("")}</g>
</svg>`;
await mkdir("public/fx", { recursive: true });
await writeFile("public/fx/frost.svg", svg);
console.log("frost.svg", (svg.length / 1024).toFixed(1), "KB,", paths.length, "strokes");
