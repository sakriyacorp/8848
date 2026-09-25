# Reference notes — what 8848 takes from Natraj and sakriya

`reference-code/` is read-only. Nothing under `src/` imports from it; it is excluded in
`tsconfig.json`, `eslint.config.mjs` and `next.config.ts` (`outputFileTracingExcludes`).
Everything below was copied into `src/` and then re-tinted, renamed and reworked for 8848.

## From Natraj (stack, structure, ordering)

| Natraj file | 8848 home | What changed |
|---|---|---|
| `package.json` stack | `package.json` | Same core (Next 15.5, React 19, Tailwind v4, `motion`, `zustand`, `lucide-react`) + `three`, `lenis`. Dev: `potrace`, `sharp`, `playwright`. |
| `src/styles/globals.css` | `src/styles/globals.css` | Kept the Tailwind v4 `@theme inline` token pattern, grain overlay, `glass` utility, focus ring, reduced-motion block. Palette, fonts and every material (brass, foil, walnut, lokta) are new. |
| `lib/menu.ts`, `filters.ts`, `dish-path.ts`, `dish-images.ts` | `src/lib/*` | Same typed-JSON loader + image-family lookup. Menu shape extended with `spice` (0–5), `np` (Nepali name), `flags` (chef/popular), `diet` tags incl. `gf` and `nuts`, `altitude` camp per category. |
| `lib/bag.ts`, `bag-totals.ts`, `fulfillment.ts`, `orders.ts`, `hours.ts`, `format.ts`, `hooks.ts`, `ui.ts` | `src/lib/*` | Zustand + persist bag (key `8848-bag`), pickup/delivery mode, tip added to totals, open-now logic (America/New_York) unchanged in spirit; hours now include a late bar window. |
| `components/Menu/*` (MenuClient DOM-filtering, CategoryRail/Chips, FilterPanel, DishCard, DishImage, FeaturedRail, ModeSwitch) | `src/components/menu/*` | Filtering still runs on server-rendered cards via data attributes. Category rail became the **camp altitude rail** with a climber; chips are brass tabs; spice filter is new; cards are cream-paper menu cards with spice peaks and steam. |
| `components/DishSheet`, `CartDrawer`, `Checkout`, `Confirmation`, `Stepper`, `Toast` | `src/components/order/*` | Same flows and a11y (focus trap, scroll lock, aria-live). Bag is a **trekking pack**; confirmation is a **Sagarmatha trekking permit** with a stamp. Card-number fields dropped: payment is pay-at-pickup / pay-on-delivery, so the mock never asks for card data. |
| `components/Glass/useLiquidGlass.ts`, `GlassPanel` | `src/components/fx/useLiquidGlass.ts` | Same SVG displacement refraction (Chromium only), warm brass rim instead of red. |
| `components/Reveal.tsx` | `src/components/fx/Reveal.tsx` | Same SSR-safe rise + unblur; used everywhere (Natraj reserved it for one handoff). Adds stagger + split-word headline variant. |
| `components/Nav/*` + `useNavLens.ts` | `src/components/layout/Nav.tsx` | Glass pill nav + springy lens behind links, 8848 mark, trekking-pack bag button. |
| `components/Reviews/*` (ReviewWall etc.) | `src/components/testimonials/*` | See sakriya wall below. `Stars` and `Avatar` (initials fallback) reused. |
| `lib/jsonld.ts`, `app/sitemap.ts`, `app/robots.ts` | same paths | `Restaurant` schema with 8848 address + placeholder hours/phone. |
| `scripts/fetch-images.mjs`, `optimize-images.mjs` | `scripts/` | Pexels queries retuned for momo / thukpa / sekuwa / cocktails, dark and moody. |
| `data/menu.json` | `data/menu.json` | Dish names/descriptions reused where they fit (momos, chilli dishes, curries, tandoor, biryani, breads, desserts, lassi, chai). Nepali, Indo-Chinese and bar items written new. |
| `public/dishes/*` | `public/dishes/*` | Only the photos actually used, each viewed before assignment. `o-*` files are Natraj's own photos → listed in `PLACEHOLDERS.md`. |

Conventions kept: server components by default; money through `formatMoney()`; hours in
`America/New_York`; dish images through `<DishImage>`; accessibility from the start; plain,
short copy (no "culinary journey", no "elevate", no emoji).

Conventions **not** kept (overridden by PROMPT.md): stop-after-each-phase, don't-add-deps,
Reveal-only-in-one-place, no-comments.

## From sakriya.net (motion, globe, wall)

| sakriya file | 8848 home | What changed |
|---|---|---|
| `components/WallMarquee.tsx` | `src/components/testimonials/PostcardWall.tsx` | Same rAF engine (clamped dt, duplicated track for a seamless loop, per-lane speed multipliers, hover pause). Re-oriented to **horizontal lanes** that auto-scroll on every screen size, alternating direction. **Tap a card to pause its lane, tap again to resume**; paused card lifts and glows. Edge fade masks. The phone "manual carousel" fallback is gone. |
| `components/Globe.tsx` + `lib/landmask.ts` | `src/components/setpieces/Globe.tsx` + `src/lib/landmask.ts` | Same land-mask dot field, astrolabe rings, KTM + VA pins, bezier arc with travelling packet, inertial drag and clean disposal. Restyled brass-on-walnut; adds a scripted sequence: spin to the Himalayas → pulse Everest → fly KTM→HBG → zoom toward Harrisonburg → hand off to Visit. |
| `components/Effects.tsx` | `src/components/fx/Effects.tsx` | Reveals, `[data-tilt]` card tilt + glare, scroll-driven palette warming (now: the page warms toward lamp light as you near the bar/visit sections). |
| `components/CursorLens.tsx` / Natraj `CustomCursor.tsx` | `src/components/fx/Cursor.tsx` | Desktop-only lens cursor, retinted brass; doubles as the **lamp-light spotlight** carrier on dark sections. |
| `components/Wordmark.tsx` | `src/components/brand/Wordmark.tsx` | Springy drag-and-release physics reused for the header mark easter egg (tap 8× → avalanche). |
| `app/globals.css` | `src/styles/globals.css` | Easing curves `--ease: cubic-bezier(.22,1,.36,1)`, `--bounce: cubic-bezier(.34,1.36,.64,1)`, glass rim-light recipe, `cardIn` rise + unblur, drift keyframes. |

## Not taken
- Either site's palette (Natraj red/gold, sakriya ember) or fonts (Fraunces, Instrument Sans, Hanken Grotesk).
- Natraj's Google Places review fetch (needs a key) — 8848 ships 20 sample testimonials in `src/data/testimonials.ts`.
- Card-number checkout fields.
