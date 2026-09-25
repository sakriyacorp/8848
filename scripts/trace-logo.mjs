// Vectorize the flat 8848 logo into clean, separately animatable SVG layers.
//
//   node scripts/trace-logo.mjs
//
// 1. Every pixel is projected onto the two lines bg→chocolate and bg→olive; the line it sits
//    closest to decides the layer and the projection gives its coverage. Anti-aliased edges
//    therefore stay with their own layer instead of leaking a halo into the other one.
// 2. Chocolate splits into arc (top) + numerals; olive splits into peaks + tagline.
// 3. Each layer is traced with potrace (peaks with a low alphaMax so the facets stay sharp,
//    like the engraved plaque), numerals are split into four glyphs by x.
// 4. A circle is fitted to the arc so it can also be drawn as a stroke (draw-on animation).
//
// Output: src/components/brand/logo-paths.ts and public/brand/*.svg

import sharp from "sharp";
import potrace from "potrace";
import { mkdir, writeFile } from "node:fs/promises";
import { promisify } from "node:util";

const trace = promisify(potrace.trace);
const SRC = "assets/brand/logo-8848-primary-beige.jpeg";

// Crop box around the lockup (source pixels, 2576×2576 image).
const CROP = { left: 330, top: 440, width: 1916, height: 1720 };
const SPLIT_ARC_Y = 1160 - CROP.top; // chocolate above = arc, below = numerals
const SPLIT_TAG_Y = 1650 - CROP.top; // olive above = peaks, below = tagline

const BG = [232, 217, 196];
const CHOC = [62, 22, 12];
const OLIVE = [123, 94, 52];

function projector(ink) {
  const d = ink.map((v, i) => v - BG[i]);
  const len2 = d.reduce((n, v) => n + v * v, 0);
  return (r, g, b) => {
    const p = [r - BG[0], g - BG[1], b - BG[2]];
    let a = (p[0] * d[0] + p[1] * d[1] + p[2] * d[2]) / len2;
    a = Math.max(0, Math.min(1, a));
    const res = Math.hypot(p[0] - a * d[0], p[1] - a * d[1], p[2] - a * d[2]);
    return { a, res };
  };
}

const { data, info } = await sharp(SRC).extract(CROP).raw().toBuffer({ resolveWithObject: true });
const W = info.width;
const H = info.height;
const C = info.channels;
const choc = projector(CHOC);
const olive = projector(OLIVE);

const layers = {
  arc: new Uint8Array(W * H).fill(255),
  numerals: new Uint8Array(W * H).fill(255),
  peaks: new Uint8Array(W * H).fill(255),
  tagline: new Uint8Array(W * H).fill(255),
};
const arcPts = [];

for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const i = (y * W + x) * C;
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const c = choc(r, g, b);
    const o = olive(r, g, b);
    const k = y * W + x;
    if (c.res <= o.res) {
      const v = Math.round(255 * (1 - c.a));
      if (y < SPLIT_ARC_Y) {
        layers.arc[k] = v;
        if (c.a > 0.5) arcPts.push([x, y]);
      } else layers.numerals[k] = v;
    } else {
      const v = Math.round(255 * (1 - o.a));
      if (y < SPLIT_TAG_Y) layers.peaks[k] = v;
      else layers.tagline[k] = v;
    }
  }
}

// Kasa least-squares circle fit on the arc stroke pixels.
function fitCircle(pts) {
  let sx = 0, sy = 0, sxx = 0, syy = 0, sxy = 0, sxz = 0, syz = 0, sz = 0;
  const n = pts.length;
  for (const [x, y] of pts) {
    const z = x * x + y * y;
    sx += x; sy += y; sxx += x * x; syy += y * y; sxy += x * y; sxz += x * z; syz += y * z; sz += z;
  }
  // Solve [sxx sxy sx; sxy syy sy; sx sy n] [A B C]^T = [sxz syz sz]
  const M = [
    [sxx, sxy, sx, sxz],
    [sxy, syy, sy, syz],
    [sx, sy, n, sz],
  ];
  for (let col = 0; col < 3; col++) {
    let piv = col;
    for (let r = col + 1; r < 3; r++) if (Math.abs(M[r][col]) > Math.abs(M[piv][col])) piv = r;
    [M[col], M[piv]] = [M[piv], M[col]];
    for (let r = 0; r < 3; r++) {
      if (r === col) continue;
      const f = M[r][col] / M[col][col];
      for (let c2 = col; c2 < 4; c2++) M[r][c2] -= f * M[col][c2];
    }
  }
  const A = M[0][3] / M[0][0], B = M[1][3] / M[1][1], Cc = M[2][3] / M[2][2];
  const cx = A / 2, cy = B / 2;
  const r = Math.sqrt(Cc + cx * cx + cy * cy);
  const resid = Math.sqrt(pts.reduce((s, [x, y]) => s + (Math.hypot(x - cx, y - cy) - r) ** 2, 0) / n);
  return { cx, cy, r, resid };
}

void fitCircle;

async function traceLayer(buf, opts) {
  const png = await sharp(Buffer.from(buf), { raw: { width: W, height: H, channels: 1 } }).png().toBuffer();
  const svg = await trace(png, { threshold: 128, turdSize: 12, optTolerance: 0.25, ...opts });
  const m = svg.match(/ d="([^"]+)"/);
  return m ? m[1] : "";
}

const fmt = (n) => (Math.round(n * 10) / 10).toString();
function tidy(d) {
  return d.replace(/-?\d+\.?\d*(e-?\d+)?/g, (m) => fmt(Number(m))).replace(/\s+/g, " ").trim();
}

// Split a potrace path into its subpaths with bounding boxes.
function subpaths(d) {
  const parts = d.split(/(?=M)/).map((s) => s.trim()).filter(Boolean);
  return parts.map((p) => {
    const nums = p.match(/-?\d+\.?\d*/g).map(Number);
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (let i = 0; i + 1 < nums.length; i += 2) {
      minX = Math.min(minX, nums[i]); maxX = Math.max(maxX, nums[i]);
      minY = Math.min(minY, nums[i + 1]); maxY = Math.max(maxY, nums[i + 1]);
    }
    return { d: p, minX, maxX, minY, maxY, cx: (minX + maxX) / 2 };
  });
}

const arcD = tidy(await traceLayer(layers.arc, { alphaMax: 1 }));
const numeralsD = tidy(await traceLayer(layers.numerals, { alphaMax: 1.05 }));
const peaksD = tidy(await traceLayer(layers.peaks, { alphaMax: 0.55, turdSize: 20 }));
const taglineD = tidy(await traceLayer(layers.tagline, { alphaMax: 0.9, turdSize: 4 }));

// Four glyphs, split at the widest gaps between subpath clusters along x.
const nsub = subpaths(numeralsD).sort((a, b) => a.minX - b.minX);
const outers = nsub.filter((s) => !nsub.some((o) => o !== s && o.minX <= s.minX && o.maxX >= s.maxX && o.minY <= s.minY && o.maxY >= s.maxY));
outers.sort((a, b) => a.minX - b.minX);
const glyphs = outers.map((o) => ({ box: o, parts: [] }));
for (const s of nsub) {
  const g = glyphs.find((gl) => s.cx >= gl.box.minX && s.cx <= gl.box.maxX) ?? glyphs[0];
  g.parts.push(s.d);
}
const glyphD = glyphs.map((g) => g.parts.join(" "));

const box = (d) => subpaths(d).reduce(
  (b, s) => ({ minX: Math.min(b.minX, s.minX), maxX: Math.max(b.maxX, s.maxX), minY: Math.min(b.minY, s.minY), maxY: Math.max(b.maxY, s.maxY) }),
  { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity },
);
const peaksBox = box(peaksD);
const numBox = box(numeralsD);
const tagBox = box(taglineD);

// The arc is a horseshoe: a semicircle on top with short vertical legs. Derive its centreline
// from the traced shape's bounds; the stroke width comes from inked area / centreline length.
const arcBox = box(arcD);
const legBottom = arcBox.maxY;
const sw0 = 24;
const rr = (arcBox.maxX - arcBox.minX - sw0) / 2;
const acx = (arcBox.minX + arcBox.maxX) / 2;
const acy = arcBox.minY + sw0 / 2 + rr;
const centreLen = Math.PI * rr + 2 * Math.max(0, legBottom - acy);
const strokeW = arcPts.length / centreLen;
const r1 = (n) => Math.round(n * 10) / 10;
const out = {
  width: W,
  height: H,
  arc: {
    d: arcD,
    cx: r1(acx),
    cy: r1(acy),
    r: r1(rr),
    strokeWidth: r1(strokeW),
    legBottom: r1(legBottom),
    box: arcBox,
  },
  peaks: { d: peaksD, box: peaksBox },
  numerals: { d: numeralsD, glyphs: glyphD, box: numBox, glyphBoxes: glyphs.map((g) => g.box && { minX: g.box.minX, maxX: g.box.maxX, minY: g.box.minY, maxY: g.box.maxY }) },
  tagline: { d: taglineD, box: tagBox },
};

console.log("arc", out.arc);
console.log("glyphs", glyphD.length, "peaks subpaths", subpaths(peaksD).length, "sizes", arcD.length, numeralsD.length, peaksD.length, taglineD.length);

await mkdir("src/components/brand", { recursive: true });
await mkdir("public/brand", { recursive: true });
await mkdir("scratch", { recursive: true });

const ts = `/* Generated by scripts/trace-logo.mjs from assets/brand/logo-8848-primary-beige.jpeg.
   Coordinates are in the cropped source space (${W}×${H}). Re-run the script to regenerate. */

export const LOGO_W = ${W};
export const LOGO_H = ${H};

export const ARC = ${JSON.stringify({ cx: out.arc.cx, cy: out.arc.cy, r: out.arc.r, strokeWidth: out.arc.strokeWidth, legBottom: out.arc.legBottom })} as const;
export const ARC_D = ${JSON.stringify(arcD)};
export const PEAKS_D = ${JSON.stringify(peaksD)};
export const PEAKS_BOX = ${JSON.stringify(peaksBox)} as const;
export const NUMERAL_GLYPHS = ${JSON.stringify(glyphD)} as const;
export const NUMERALS_BOX = ${JSON.stringify(numBox)} as const;
export const TAGLINE_D = ${JSON.stringify(taglineD)};
export const TAGLINE_BOX = ${JSON.stringify(tagBox)} as const;
`;
await writeFile("src/components/brand/logo-paths.ts", ts);

const preview = (fillA, fillB) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
<rect width="100%" height="100%" fill="#E6E0D6"/>
<path d="${arcD}" fill="${fillA}" fill-rule="evenodd"/>
<path d="${peaksD}" fill="${fillB}" fill-rule="evenodd"/>
${glyphD.map((g) => `<path d="${g}" fill="${fillA}" fill-rule="evenodd"/>`).join("\n")}
<path d="${taglineD}" fill="${fillB}" fill-rule="evenodd"/>
<path d="M ${out.arc.cx - out.arc.r} ${out.arc.legBottom} L ${out.arc.cx - out.arc.r} ${out.arc.cy} A ${out.arc.r} ${out.arc.r} 0 0 1 ${out.arc.cx + out.arc.r} ${out.arc.cy} L ${out.arc.cx + out.arc.r} ${out.arc.legBottom}" fill="none" stroke="#f00" stroke-width="2" opacity=".8"/>
</svg>`;
await writeFile("scratch/logo-trace-preview.svg", preview("#3B2517", "#7A5E33"));
await sharp(Buffer.from(preview("#3B2517", "#7A5E33"))).resize(1000).png().toFile("scratch/logo-trace-preview.png");
console.log("wrote src/components/brand/logo-paths.ts and scratch/logo-trace-preview.png");
