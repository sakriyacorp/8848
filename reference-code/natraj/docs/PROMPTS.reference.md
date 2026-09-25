# Claude Code — phase prompts

One phase per session. Paste the prompt, let it finish, look at the result, commit, `/clear`, next phase. Six short sessions cost far less than one long one because the context never balloons.

Before phase 0:
```
mkdir natraj && cd natraj
# drop the handoff folder contents here: CLAUDE.md, docs/, data/, scripts/
git init && git add -A && git commit -m "handoff"
claude
```

---

## Phase 0 — scaffold + design system + shell
```
Read CLAUDE.md and docs/SPEC.md. Phase 0 only.

1. Scaffold Next.js 15 (TypeScript, App Router, src/, Tailwind v4, eslint) in this folder — keep the existing CLAUDE.md, docs/, data/, scripts/.
2. Install: motion, zustand, lucide-react.
3. globals.css: the tokens from SPEC §1 as CSS vars + Tailwind @theme, Fraunces + Instrument Sans via next/font, the 3% grain overlay, a `.glass` utility, the red focus ring, prefers-reduced-motion handling.
4. Copy from ../sakriya: glass panel, custom cursor, marquee. Retint to this palette. Tell me if the path is wrong.
5. lib/menu.ts: typed loader + helpers (byCategory, byId, popular, getDishImage). lib/hours.ts per CLAUDE.md. lib/format.ts.
6. Nav + Footer per SPEC §3 in app/layout.tsx. Home page with just a placeholder hero (solid --ember, headline in Fraunces) so I can see the type and the nav glass-on-scroll.
7. npm run build. Summarize.
```

## Phase 1 — menu
```
Read CLAUDE.md and docs/SPEC.md §3 Menu / DishCard / DishSheet, §5. Phase 1 only.

Build the Menu section on the home page (#menu) and /menu route: CategoryRail (desktop) / CategoryChips (mobile), search + diet filter chips, category sections with blurbs, DishGrid, DishCard, DishImage with blur placeholder, DishSheet (drawer on desktop, bottom sheet on mobile) with spice control, qty, instructions. 

The bag store doesn't exist yet — make the "Add to bag" button call a stub `onAdd(line)` that console.logs. I'll wire it in phase 2.

Images: public/dishes/ may be empty. DishImage must render a --charcoal placeholder when the file is missing so the layout is reviewable without photos.

npm run build. Summarize.
```

Between phase 1 and 2, run the image script (needs a free Pexels key):
```
PEXELS_API_KEY=xxxx node scripts/fetch-images.mjs
```
Look through `public/dishes/`. For any bad photo: `node scripts/fetch-images.mjs --only=<family> --page=2 --force` (or 3, 4…).

## Phase 2 — bag
```
Read CLAUDE.md and docs/SPEC.md §3 Nav (bag button), CartDrawer, DishSheet (on add), §4, §6. Phase 2 only.

lib/bag.ts: zustand + persist store exactly per §4. Wire DishSheet and the card + button to it. CartDrawer with line items, qty steppers, remove with row-collapse, subtotal/tax/total, empty state. Bag badge bounce on count change. Toast with Undo (aria-live). Focus trap + Esc + backdrop close.

npm run build. Summarize.
```

## Phase 3 — home page sections
```
Read CLAUDE.md and docs/SPEC.md §3 Hero, SignatureDishes, About, Reviews, Visit, and §6. Phase 3 only.

Replace the placeholder hero with the real one (live hours line from lib/hours.ts, both CTAs, the one page-load animation sequence). SignatureDishes snap strip with the 6 dishes listed. About (placeholder room photo, 3 short paragraphs — plain copy, I'll replace facts). Reviews marquee from data/reviews.json using the ported sakriya marquee, plus /reviews grid page. Visit section with live open/closed pill, hours table, map iframe (lazy), phone/CTAs. LocalBusiness JSON-LD + metadata in layout.

For hero.jpg and about-room.jpg: pull one each from Pexels with the queries in SPEC §3, same script pattern, into public/.

npm run build. Summarize.
```

## Phase 4 — checkout + confirmation
```
Read CLAUDE.md and docs/SPEC.md §3 Checkout, Confirmation, §4 Orders. Phase 4 only.

/checkout: pickup time (ASAP or scheduled slots from lib/hours.ts), contact, payment with Luhn + formatting + "Pay at pickup" option, clear "Demo — no charge" line, inline validation on blur with specific messages. Sticky order summary. Place order → 900ms → save to localStorage natraj-orders → clear bag → /order/[id]. Confirmation page per spec, including the unknown-id state.

npm run build. Summarize.
```

## Phase 5 — polish pass
```
Read CLAUDE.md, docs/SPEC.md §6 and §7. Phase 5 only.

Audit against §6: remove any animation not in the table. Audit against §7: run Lighthouse on / (mobile) and fix anything under 90; check keyboard flow through card → sheet → bag → checkout; verify reduced-motion; verify 390px layout of menu list rows, sheet, drawer, checkout. Fix what you find. Don't add features.

npm run build. Summarize with the Lighthouse numbers.
```

---

## If a phase goes sideways
- It's looping or rewriting big files: `Esc`, then "Stop. Show me a diff summary of what changed since the phase started." Decide, then `git checkout .` or `git commit`.
- It wants to add a dependency: say no unless it's on the CLAUDE.md list.
- It asks a question you'd answer with "whatever's simpler": say "Pick the simpler one and keep going."
- Context getting long mid-phase (responses slow, it forgets things): commit, `/clear`, paste the same phase prompt + "Continue from the current state of the repo; here's what's done: …".
