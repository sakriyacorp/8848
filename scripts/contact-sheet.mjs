// Contact sheet for reviewing photos before assigning them to dishes.
//   node scripts/contact-sheet.mjs <out.png> <dir> [name1 name2 ...]   (names without .jpg)
//   node scripts/contact-sheet.mjs <out.png> --glob <dir>              (every jpg under dir, recursive)
import sharp from "sharp";
import { readdir, stat } from "node:fs/promises";
import path from "node:path";

const [out, dirOrFlag, ...rest] = process.argv.slice(2);
let files = [];
if (dirOrFlag === "--glob") {
  const walk = async (d) => {
    for (const f of await readdir(d)) {
      const p = path.join(d, f);
      if ((await stat(p)).isDirectory()) await walk(p);
      else if (/\.jpe?g$/i.test(f)) files.push(p);
    }
  };
  await walk(rest[0]);
  files.sort();
} else {
  files = rest.map((n) => path.join(dirOrFlag, `${n}.jpg`));
}

const TW = 240, TH = 170, LABEL = 22, COLS = 6;
const rows = Math.ceil(files.length / COLS);
const tiles = [];
for (let i = 0; i < files.length; i++) {
  const f = files[i];
  const label = path.relative(dirOrFlag === "--glob" ? rest[0] : dirOrFlag, f).replace(/\.jpe?g$/i, "");
  let img;
  try {
    img = await sharp(f).resize(TW, TH, { fit: "cover" }).toBuffer();
  } catch {
    img = await sharp({ create: { width: TW, height: TH, channels: 3, background: "#400" } }).png().toBuffer();
  }
  const text = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${TW}" height="${LABEL}"><rect width="100%" height="100%" fill="#111"/><text x="4" y="15" font-family="Arial" font-size="12" fill="#fff">${label.replace(/&/g, "&amp;").slice(0, 38)}</text></svg>`,
  );
  const x = (i % COLS) * TW;
  const y = Math.floor(i / COLS) * (TH + LABEL);
  tiles.push({ input: img, left: x, top: y }, { input: text, left: x, top: y + TH });
}
await sharp({ create: { width: COLS * TW, height: rows * (TH + LABEL), channels: 3, background: "#222" } })
  .composite(tiles)
  .png()
  .toFile(out);
console.log(`${files.length} images → ${out}`);
