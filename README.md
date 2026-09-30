# 8848 — Himalayan Fusion & Bar

The website for 8848, a Nepalese / Himalayan, Indo-Chinese and North Indian kitchen with a full bar at 258 Reservoir St, Harrisonburg, VA. Brushed brass and walnut, lamp-lit, cream paper for reading, and a climb from the table to the summit of Sagarmatha.

**Start with [`PROGRESS.md`](PROGRESS.md)**: what was built, the moments worth demoing, every set-piece and how to trigger it, and what's left.

## Run it

Requires Node 20+.

```bash
npm install
```

```bash
npm run dev
```

Open http://localhost:3000. For the production build (what gets deployed):

```bash
npm run build
```

```bash
npm start
```

Every route is statically generated. Deploy to Vercel (or any Next.js host) as is; set `NEXT_PUBLIC_SITE_URL` to the real origin so Open Graph tags, the sitemap and the JSON-LD point at it. No API keys, backend or paid services are needed at runtime.

## Where things live

| | |
|---|---|
| Business facts (address, phone, hours, rating, socials, tax) | `src/config/site.ts` — change them once, the whole site follows |
| Set-piece on/off switches | `src/config/features.ts` — 43 flags; switching one off leaves the page complete |
| Menu (owner's draft: 152 dishes and drinks, 14 "camps") | `data/menu-content.md` → `npm run menu` builds `data/menu.json`. Prices are placeholders |
| Dish photos | `public/dishes/` (credits for stock photos in `data/photo-credits.json`) |
| Testimonials | `src/data/testimonials.ts` |
| Everything that's invented and needs replacing | [`PLACEHOLDERS.md`](PLACEHOLDERS.md) |
| Why things are the way they are | [`DECISIONS.md`](DECISIONS.md) |
| Creative direction, palette, type, sitemap | [`PLAN.md`](PLAN.md) |

```
src/
  app/                  routes: / menu order order/permit bar story visit + 404, icons, sitemap, robots
  components/
    brand/              the traced logo (engraved / foil / brass / cream / ink, draw-on)
    setpieces/          every signature animation (one file each)
    climb/              ★ the 3D ascent (+ terrain and shaders) and its static fallback
    home/ menu/ order/ bar/ story/ visit/ testimonials/ layout/ fx/
  config/               site.ts, features.ts
  lib/                  bag, orders, hours, sky/moon, tilt, audio, section tracking, …
data/menu.json
scripts/                logo tracing, icons, image fetch/optimize, screenshots
```

## Useful URLs while demoing

- `/?sky=night` (or `dawn`, `day`, `golden`, `dusk`) pins the hero sky instead of using Harrisonburg's real time.
- `/?climb=static` shows the 2D fallback of the 3D ascent.
- Clear `8848-intro-seen` in localStorage to see the first-visit logo intro again.
- Type `8848` on any page.

## Scripts

| | |
|---|---|
| `npm run logo` | Re-trace the logo from `assets/` into `src/components/brand/logo-paths.ts` |
| `npm run icons` | Regenerate favicon, apple-touch icon and OG images from the logo |
| `npm run images:fetch` | Build-time only: pull extra dish photos from Pexels (needs `PEXELS_API_KEY` in `.env.local`) |
| `npm run images:optimize` | Downscale photos in `public/` in place |
| `npm run shots` | Playwright screenshots of every page at 390 and 1440 px (server on :3100) |
| `npm run menu` | Rebuild `data/menu.json` from `data/menu-content.md` (edit the .md, not the json) |
| `npm run brand-kit` | Export the logo (SVG + PNG, four materials), textures and palette for print into `handoff/` |
| `npm run print-menu` | Typeset the printed food menu (4 pages) and drinks menu (2 pages), US Legal, into `handoff/print/` as PDF + PNG previews |

## Accessibility and motion

Every animation has a reduced-motion version that still looks designed; the 3D scenes fall back to illustrated stills without WebGL2. Text meets WCAG AA contrast. Sound is off by default and only ever starts from a tap. Heavy scenes are lazy-loaded, pause off-screen, cap device pixel ratio, and release their WebGL context when they leave.

## Notes

`reference-code/` holds the two earlier sites this one borrows mechanics from (Natraj, sakriya). It's read-only reference, excluded from TypeScript, ESLint and the build. `assets/` holds the brand source files.
