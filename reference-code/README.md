# reference-code — what to look at, and for what

Read-only reference, copied from Bee's two previous sites. Copy code out into the real project and adapt it; never edit these files. Keep this folder excluded from `tsconfig`, ESLint and the build. It stays committed in the repo; do not delete or git-ignore it.

Stacks:
- **natraj:** Next 15.5, React 19, Tailwind v4, `motion`, `zustand`, `lucide-react`
- **sakriya:** Next 14, React 18, `three`, plain CSS

**Build 8848 on the Natraj stack.** Port sakriya pieces into it.

## Testimonials (top priority)
| File | What it is |
|---|---|
| `sakriya/components/WallMarquee.tsx` | The original wall. Columns drift vertically on a requestAnimationFrame loop (middle column reversed), each column is duplicated for a seamless loop, hover pauses, and a glass scrollbar scrubs the wall. |
| `sakriya/components/TestimonialWall.tsx`, `Avatar.tsx`, `lib/testimonials.ts` | Section wrapper, avatar with initials fallback, and the data shape. |
| `sakriya/app/globals.css` | Search `testi-` and `tbar` for the card, glass and scrollbar styles. |
| `natraj/src/components/Reviews/*` | The same wall ported to Tailwind: `ReviewWall`, `ReviewCard`, `Stars`, `RatingBadge`, `Avatar`, `ReviewsSection`. `natraj/src/lib/reviews.ts` is the loader (the Google Places part needs a key, so skip it). |

**Mobile gap:** both walls fall back to a manual swipe carousel under 640px, with no auto-scroll. 8848 needs an auto-scrolling horizontal marquee on phone with tap-to-pause.

## Globe → Everest centerpiece
| File | What it is |
|---|---|
| `sakriya/components/Globe.tsx` | three.js dotted globe built from a land mask. It already defines `KTM` (Kathmandu) and `VA` (Harrisonburg) points with an arc between them. Drag to rotate, reduced-motion aware, clean teardown. |
| `sakriya/lib/landmask.ts` | The land mask data for the globe. |
| `sakriya/components/LocPill.tsx` | The location label pill. |

## Motion, glass, cursor
| File | What it is |
|---|---|
| `sakriya/components/Effects.tsx` | Scroll reveals, card tilt + glare, scroll-driven palette warming, Chromium liquid-glass refraction. |
| `sakriya/components/CursorLens.tsx` | Desktop-only lens cursor. |
| `natraj/src/components/Cursor/CustomCursor.tsx` | The Natraj port of that cursor. |
| `sakriya/components/Wordmark.tsx` | Animated wordmark. |
| `sakriya/components/Nav.tsx`, `natraj/src/components/Nav/*` | Glass nav; `useNavLens.ts` gives the lens effect. |
| `natraj/src/components/Glass/GlassPanel.tsx`, `useLiquidGlass.ts` | Glass panel with SVG displacement refraction. |
| `natraj/src/components/Reveal.tsx` | Rise + unblur on enter; SSR-safe. |
| `natraj/src/components/Toast/Toast.tsx` | Toasts. |
| `natraj/src/components/Hero/*` | Hero slides and a live "open now" hours line. |
| `sakriya/components/Gallery.tsx`, `natraj/src/components/Kitchen/KitchenGallery.tsx` | Galleries. |
| `natraj/src/styles/globals.css` | Tailwind v4 `@theme` tokens, grain, glass utility, focus ring. |
| `sakriya/app/globals.css` | Easing curves, keyframes, glass, the full motion vocabulary. |

## Menu + ordering (from natraj)
| File | What it is |
|---|---|
| `data/menu.json` | 151 items in 13 categories. Shape: `{id, name, category, price, desc, tags[], img}`. **Names and descriptions may be reused for now.** |
| `src/lib/menu.ts`, `filters.ts`, `dish-path.ts`, `dish-images.ts` | Typed menu loader, filter logic, and image lookup with fallback. |
| `src/components/Menu/*` | `MenuClient`, `CategoryRail`, `CategoryChips`, `FilterPanel`, `DietTags`, `DishCard`, `DishImage`, `FeaturedRail`, `FeaturedMenu`, `ModeSwitch`, `OrderModeBar`. |
| `src/components/DishSheet/DishSheet.tsx` | Dish detail sheet. |
| `src/lib/bag.ts`, `bag-totals.ts`, `fulfillment.ts`, `orders.ts`, `hours.ts`, `format.ts` | Zustand bag with persist, totals, pickup/delivery, mock orders, open-now logic, money formatting. |
| `src/components/CartDrawer`, `Checkout`, `Confirmation`, `Stepper.tsx` | Bag drawer, checkout page, confirmation screen, quantity stepper. |
| `src/app/menu`, `checkout`, `order/[id]`, `reviews` | The page routes. |
| `src/lib/jsonld.ts`, `app/sitemap.ts`, `app/robots.ts` | SEO. |
| `src/components/Faq`, `Visit`, `Footer`, `Story/*` | FAQ, visit/hours/map, footer, and story sections (dining room, family story, rewards, order CTA). |

## Images
- **`natraj/public/dishes/`** has 137 dish photos:
  - Files **without** the `o-` prefix are Pexels photos, free for commercial use.
  - Files **with** `o-` are Natraj's own photos. They're OK as placeholders for this demo; list them in `PLACEHOLDERS.md` so they get swapped later.
- **`natraj/scripts/fetch-images.mjs`** pulls from Pexels. It needs `PEXELS_API_KEY` in `.env.local`.
- **`natraj/scripts/optimize-images.mjs`** is the image optimizer.

## Conventions worth keeping (from `natraj/CLAUDE.reference.md`)
- Server components by default; `"use client"` only for state or motion.
- Money goes through `formatMoney()`.
- Hours use `America/New_York`.
- Images always go through `<DishImage>`.
- Accessibility is built in from the start, not a later pass.
- Copy is short and plain; no "culinary journey", no "elevate".

**Ignore that file's stop-after-each-phase and don't-add-deps rules.**
