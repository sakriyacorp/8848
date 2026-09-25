// Downscale public/dishes/*.jpg (and public/*.jpg) in place to a sane source size.
// next/image resizes from these at request time, so 1600px wide is plenty.
//   node scripts/optimize-images.mjs            all files
//   node scripts/optimize-images.mjs --width=1600 --quality=82

import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const args = Object.fromEntries(process.argv.slice(2).map((a) => {
  const [k, v = true] = a.replace(/^--/, "").split("=");
  return [k, v];
}));
const WIDTH = Number(args.width || 1600);
const QUALITY = Number(args.quality || 82);
const DIRS = ["public/dishes", "public"];

let before = 0, after = 0, n = 0;
for (const dir of DIRS) {
  const files = await readdir(dir).catch(() => []);
  for (const f of files) {
    if (!/\.jpe?g$/i.test(f)) continue;
    const file = path.join(dir, f);
    const src = await readFile(file);
    const size = src.length;
    const img = sharp(src);
    const meta = await img.metadata();
    if ((meta.width ?? 0) <= WIDTH && size < 400_000) continue;
    const buf = await img.rotate().resize({ width: WIDTH, withoutEnlargement: true }).jpeg({ quality: QUALITY, mozjpeg: true }).toBuffer();
    await writeFile(file, buf);
    before += size; after += buf.length; n++;
  }
}
console.log(`${n} files: ${(before / 1e6).toFixed(1)} MB → ${(after / 1e6).toFixed(1)} MB`);
