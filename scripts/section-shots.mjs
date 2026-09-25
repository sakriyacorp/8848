// Viewport screenshots scrolled to each section (full-page captures break svh-pinned scenes).
//   node scripts/section-shots.mjs --page=/ --sel="#story,#signatures" [--widths=390,1440] [--offset=0] [--tag=x]
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const args = Object.fromEntries(process.argv.slice(2).map((a) => {
  const body = a.replace(/^--/, "");
  const eq = body.indexOf("=");
  return eq === -1 ? [body, true] : [body.slice(0, eq), body.slice(eq + 1)];
}));
const BASE = args.base || "http://localhost:3100";
const PAGE = args.page || "/";
const SELS = String(args.sel || "body").split(",");
const WIDTHS = String(args.widths || "390,1440").split(",").map(Number);
const OFFSET = Number(args.offset || 0);
await mkdir("shots", { recursive: true });

const browser = await chromium.launch({ channel: "chrome", headless: true });
const errors = [];
for (const w of WIDTHS) {
  const phone = w < 768;
  const ctx = await browser.newContext({ viewport: { width: w, height: phone ? 844 : 900 }, deviceScaleFactor: phone ? 2 : 1, isMobile: phone, hasTouch: phone });
  await ctx.addInitScript(() => localStorage.setItem("8848-intro-seen", "1"));
  if (args.bag) {
    await ctx.addInitScript((bag) => localStorage.setItem("8848-bag", bag), String(args.bag));
  }
  const page = await ctx.newPage();
  page.on("pageerror", (e) => errors.push(`[${w}] PAGEERROR ${e.message}`));
  page.on("console", (m) => { if (m.type() === "error" && !/404/.test(m.text())) errors.push(`[${w}] ${m.text()}`); });
  await page.goto(BASE + PAGE, { waitUntil: "load" });
  await page.waitForTimeout(1500);
  for (const sel of SELS) {
    const ok = await page.evaluate(({ sel, off }) => {
      const el = document.querySelector(sel);
      if (!el) return false;
      const y = el.getBoundingClientRect().top + scrollY + off * innerHeight;
      window.scrollTo(0, y);
      return true;
    }, { sel, off: OFFSET });
    if (!ok) { errors.push(`[${w}] missing ${sel}`); continue; }
    await page.waitForTimeout(Number(args.wait || 1300));
    if (args.eval) { await page.evaluate(String(args.eval)); await page.waitForTimeout(900); }
    const name = `shots/s-${(PAGE === "/" ? "home" : PAGE.replace(/[\/?=&]/g, "_"))}-${sel.replace(/[^a-z0-9]/gi, "")}${args.tag ? "-" + args.tag : ""}-${w}.png`;
    await page.screenshot({ path: name });
    console.log("✓", name);
  }
  await ctx.close();
}
await browser.close();
if (errors.length) console.log("\nErrors:\n" + [...new Set(errors)].join("\n"));
