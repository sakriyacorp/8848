// Downscale photos in place to a sane source size; next/image resizes from these on request.
//   node scripts/optimize-images.mjs [--width=1600] [--quality=80]
import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const args = Object.fromEntries(process.argv.slice(2).map((a) => {
  const body = a.replace(/^--/, "");
  const eq = body.indexOf("=");
  return eq === -1 ? [body, true] : [body.slice(0, eq), body.slice(eq + 1)];
}));
const WIDTH = Number(args.width || 1600);
const QUALITY = Number(args.quality || 80);
const DIRS = ["public/dishes", "public/gallery", "public/people"];

let before = 0, after = 0, n = 0;
for (const dir of DIRS) {
  const files = await readdir(dir).catch(() => []);
  for (const f of files) {
    if (!/\.jpe?g$/i.test(f)) continue;
    const file = path.join(dir, f);
    const src = await readFile(file);
    const meta = await sharp(src).metadata();
    if ((meta.width ?? 0) <= WIDTH && src.length < 350_000) continue;
    const buf = await sharp(src).rotate().resize({ width: WIDTH, withoutEnlargement: true }).jpeg({ quality: QUALITY, mozjpeg: true }).toBuffer();
    if (buf.length >= src.length) continue;
    await writeFile(file, buf);
    before += src.length; after += buf.length; n++;
  }
}
console.log(`${n} files: ${(before / 1e6).toFixed(1)} MB → ${(after / 1e6).toFixed(1)} MB`);
