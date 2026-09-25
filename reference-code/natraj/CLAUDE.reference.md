# Natraj Indian Cuisine — website

Restaurant site with a working (mock) ordering flow. Full spec in `docs/SPEC.md` — read it once at the start of each session, then work from the phase prompt you were given. Data lives in `data/`. Don't invent menu items, prices, hours, or copy that the spec/data already define.

## Stack (fixed — don't add to it without asking)
- Next.js 15, App Router, TypeScript strict, `src/` dir
- Tailwind v4 with CSS variables from `docs/SPEC.md` §1 as the token source (`@theme` in `globals.css`)
- Framer Motion (`motion` package) for drawers/sheets/marquee/hero only
- zustand + persist for the bag
- lucide-react for icons
- `next/font/google`: Fraunces (display), Instrument Sans (body)
- No UI kit, no shadcn, no CSS-in-JS, no form library. Plain components + a tiny `cn()`.

## Commands
- `npm run dev` — dev server on :3000
- `npm run build && npm run start` — production check (run at the END of a phase, not after every edit)
- `npm run lint`
- `PEXELS_API_KEY=… node scripts/fetch-images.mjs` — dish photos into `public/dishes/`

## Reuse from sakriya.net (path: `../sakriya` — ask if it's elsewhere)
Copy, don't reinvent: the glass panel component, the custom cursor, the testimonial marquee, the section-reveal wrapper (use it only where SPEC §6 allows), and the Tailwind/theme setup. Adjust tokens to this palette. If the portfolio repo isn't reachable, say so and build minimal versions from the spec — don't guess at its implementation.

## Structure
```
src/
  app/            layout.tsx, page.tsx, menu/, checkout/, order/[id]/, reviews/
  components/     one folder per component from SPEC §3 (Nav, Hero, Menu/, DishSheet, CartDrawer, …)
  lib/            menu.ts (typed loader for data/menu.json), hours.ts (open-now logic), bag.ts (zustand), format.ts (money/phone/card)
  styles/         globals.css (tokens, grain, glass utility, focus ring)
data/             menu.json, reviews.json   ← source of truth, import directly
public/dishes/    <family>.jpg
```

## Conventions
- Server components by default; `"use client"` only where there's state or motion.
- Money: cents are fine internally, but `menu.json` uses dollars — `formatMoney(n)` renders `$17.95`. Never `toFixed` in JSX.
- Hours logic lives in `lib/hours.ts` and is unit-testable pure functions (`isOpenAt(date, hours)`, `nextOpening(date, hours)`, `pickupSlots(date, hours, cutoff)`). Use `America/New_York`.
- Images always through `<DishImage>`; never raw `<img>`.
- Accessibility is not a later pass: labels, focus trap, `aria-live` on the toast, `aria-expanded` on the bag button.
- Copy is sentence case, plain, short. No "culinary journey", no "elevate", no emoji.

## Working style (this matters — usage is metered)
- Work in the phase you were given. Don't start the next one, don't refactor outside it.
- Read a file before editing it, once. Don't re-read files you just wrote. Don't `cat` `menu.json` — it's 151 items; grep for what you need.
- Prefer targeted edits over rewriting whole files.
- No tests unless asked. No storybook. No README updates. No comments explaining what the code obviously does.
- When a phase is done: run `npm run build`, fix errors, take a screenshot of the affected page at 1440px and 390px if a browser tool is available, then stop and summarize in ≤ 8 lines: what was built, what to look at, what's uncertain. Don't offer next steps — the next phase prompt already exists.
- If something in the spec is ambiguous, pick the simpler reading, note it in the summary, keep moving. Only stop to ask if the ambiguity would waste more than ~15 minutes of work.
- Never spend tokens on: praise, restating the prompt, explaining Next.js basics, ASCII diagrams of what you're about to do.
