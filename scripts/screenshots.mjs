// Visual QA: screenshot pages at phone and desktop widths with the system Chrome.
//   node scripts/screenshots.mjs [--base=http://localhost:3100] [--pages=/,/menu] [--widths=390,1440]
//                                [--full] [--wait=1500] [--scroll=0.5] [--out=shots] [--tag=name]
//                                [--eval="js to run before the shot"] [--throttle=4] [--reduced]
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const args = Object.fromEntries(process.argv.slice(2).map((a) => {
  const body = a.replace(/^--/, "");
  const eq = body.indexOf("=");
  return eq === -1 ? [body, true] : [body.slice(0, eq), body.slice(eq + 1)];
}));

const BASE = args.base || "http://localhost:3100";
const PAGES = String(args.pages || "/,/menu,/order,/bar,/story,/visit,/nope").split(",");
const WIDTHS = String(args.widths || "390,1440").split(",").map(Number);
const OUT = args.out || "shots";
const WAIT = Number(args.wait || 1800);
await mkdir(OUT, { recursive: true });

const browser = await chromium.launch({ channel: args.channel || "chrome", headless: true, args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
const errors = [];
for (const w of WIDTHS) {
  const phone = w < 768;
  const ctx = await browser.newContext({
    viewport: { width: w, height: phone ? 844 : 900 },
    deviceScaleFactor: phone ? 2 : 1,
    isMobile: phone,
    hasTouch: phone,
    reducedMotion: args.reduced ? "reduce" : "no-preference",
  });
  if (args.skipIntro !== "false") {
    await ctx.addInitScript(() => {
      try {
        localStorage.setItem("8848-intro-seen", "1");
      } catch {}
    });
  }
  for (const p of PAGES) {
    const page = await ctx.newPage();
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(`[${w}] ${p}: ${m.text()}`);
    });
    page.on("pageerror", (e) => errors.push(`[${w}] ${p}: PAGEERROR ${e.message}`));
    if (args.throttle) {
      const cdp = await ctx.newCDPSession(page);
      await cdp.send("Emulation.setCPUThrottlingRate", { rate: Number(args.throttle) });
    }
    await page.goto(BASE + p, { waitUntil: "load", timeout: 60000 }).catch((e) => errors.push(`[${w}] ${p}: ${e.message}`));
    await page.waitForTimeout(WAIT);
    if (args.scroll) {
      await page.evaluate((f) => window.scrollTo(0, (document.documentElement.scrollHeight - innerHeight) * f), Number(args.scroll));
      await page.waitForTimeout(1200);
    }
    if (args.eval) {
      await page.evaluate(String(args.eval));
      await page.waitForTimeout(WAIT);
    }
    if (args.full) {
      // walk the page so lazy sections and reveals fire, then come back up
      await page.evaluate(async () => {
        const h = document.documentElement.scrollHeight;
        for (let y = 0; y < h; y += innerHeight * 0.7) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 140));
        }
        window.scrollTo(0, 0);
        await new Promise((r) => setTimeout(r, 400));
      });
    }
    const name = `${OUT}/${(p === "/" ? "home" : p.replace(/\//g, "_").replace(/^_/, "")).replace(/[?=&]/g, "-")}${args.tag ? "-" + args.tag : ""}-${w}.png`;
    await page.screenshot({ path: name, fullPage: !!args.full });
    console.log("✓", name);
    await page.close();
  }
  await ctx.close();
}
await browser.close();
if (errors.length) {
  console.log("\nConsole errors:");
  for (const e of [...new Set(errors)]) console.log(" ", e);
}
