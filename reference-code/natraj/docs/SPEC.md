# Natraj Indian Cuisine — Site Spec

Client: Natraj Indian Cuisine, 219 E Davis St (The Taft Building), Culpeper, VA. Family-run, North + South Indian, in an old downtown building with a tin ceiling and exposed brick. Guests keep mentioning the same things: garlic naan, lamb pasanda, samosas, generous portions, honest spice levels.

Job of the site: make someone hungry in three seconds, get them to a dish, get the dish into a bag. Everything else is secondary.

Reference for feel: sakriya.net (same author's portfolio) — glass panels, custom cursor, testimonial marquee. Reuse its components; don't rebuild them.

---

## 1. Design plan

### Concept — "lacquer and glass"
Near-black charcoal foundation, liquid-glass overlays carried over from sakriya.net (frosted, rim-lit, slightly refractive), and one accent: the restaurant's red. Type and secondary surfaces are warm cream and beige, never stark white. Gold appears only in tiny doses (stars, a price on hover). The food photography supplies most of the warmth and color; the chrome around it stays quiet and premium.

### Color tokens (globals.css, `:root`)
| token | value | use |
|---|---|---|
| `--night` | `#0d0c0c` | page background |
| `--charcoal` | `#171616` | raised surfaces, drawer/sheet backgrounds, image placeholders |
| `--void` | `#070707` | hero vignette floor |
| `--red` | `#c8202e` | the accent: primary buttons, active states, focus rings, "spicy" chip |
| `--red-deep` | `#8f1520` | hover/pressed red, destructive (remove) |
| `--gold` | `#e2b44a` | sparingly: stars, price on hover |
| `--cream` | `#f2e8d5` | primary text on dark |
| `--cream-2` | `#b5aa98` | secondary text on dark |
| `--beige` | `#e8dfcc` | light surfaces: footer (About is a candidate, decide in phase 3) |
| `--beige-2` | `#d9cfb8` | hairlines and secondary fills on beige |
| `--ink` | `#141313` | primary text on beige |
| `--ink-2` | `#5d564d` | secondary text on beige |
| `--green` | `#6f8c5e` | "vegetarian"/"vegan" chips |
| `--line` | `rgba(242,232,213,0.12)` | hairlines, glass borders |
| `--glass-fill` | `linear-gradient(135deg, rgba(242,232,213,.075), rgba(242,232,213,.022))` | glass panel fill |

Glass (ported from sakriya.net, retinted): `--glass-fill` + 1px `--line` border + `backdrop-filter: blur(18px) saturate(1.4)` + inset top highlight + a 1px masked rim gradient (`::before`) that warms to red at the tail + one soft drop shadow. That is the `.glass` utility. Chromium adds a refraction pass (SVG displacement map) on the nav pill via `useLiquidGlass`. Buttons: `.btn-primary` (red gradient, soft red glow) and `.btn-ghost` (glass). Gradients live only inside glass and buttons, never as page decoration. A single 3% film-grain overlay on `body` is the only texture. `prefers-reduced-transparency` swaps glass for solid `--charcoal`.

Confirm the exact red against the logo file once it's in `/public/brand/` (the branding is red, black and yellow; the tokens above are a lacquer red and a restrained gold).

### Type
- Display: **Fraunces** (Google, variable). Use the optical-size axis: `opsz 144` for hero and section titles, weight 500–600, tight tracking (`-0.02em`), soft italics for the one accent word per section title *only where it reads as a voice, not decoration*.
- Body/UI: **Instrument Sans** (Google). 400/500/600. Prices use `font-variant-numeric: tabular-nums`.
- Scale (desktop → mobile): hero 88/56, h2 48/36, h3 28/22, body 17/16, small 14, price 15 medium.
- Line length ≤ 70ch for prose. Sentence case everywhere. No all-caps labels, no eyebrow labels above headings, no "01/02/03" markers.

### Layout concept
Content is left-aligned. The menu is the site — the home page is a runway to it.

```
┌──────────────────────────────────────────────────────────────┐
│ NAV (glass after scroll)   Natraj   Menu About Reviews Visit │ Order ● Bag(2)
├──────────────────────────────────────────────────────────────┤
│ HERO  full-bleed photo, dark vignette bottom-left            │
│   Indian cooking on Davis Street, since [year]               │
│   Open today 11–2:30 · 4:30–9:30            [Order pickup]   │
│                                             [Reserve table]  │
├──────────────────────────────────────────────────────────────┤
│ SIGNATURES  horizontal snap-scroll, 6 big cards, edge-bleeds │
├──────────────────────────────────────────────────────────────┤
│ MENU                                                         │
│ ┌ category rail ┐ ┌────────── dish grid (3 / 2 / 1 cols) ─┐ │
│ │ Soups         │ │ [photo]   [photo]   [photo]            │ │
│ │ Cold apps     │ │ Name  $   Name  $   Name  $            │ │
│ │ ● Tandoori    │ │ desc      desc      desc               │ │
│ │ Chef's        │ │ chips +   chips +   chips +            │ │
│ │ …             │ │                                        │ │
│ └ sticky ───────┘ └────────────────────────────────────────┘ │
├──────────────────────────────────────────────────────────────┤
│ ABOUT  photo of the room (tin ceiling / brick) | 3 short ¶   │
├──────────────────────────────────────────────────────────────┤
│ REVIEWS  two marquee rows, opposite directions (sakriya.net) │
├──────────────────────────────────────────────────────────────┤
│ VISIT  hours (live "open now") | address + map | phone/CTAs  │
├──────────────────────────────────────────────────────────────┤
│ FOOTER                                                       │
└──────────────────────────────────────────────────────────────┘
```
Mobile: category rail becomes a horizontal chip strip pinned under the nav; grid goes to one column with photo left / text right (list rows, 96px thumb) so 150 items don't become 150 screens of scrolling.

### Principles
1. Photos carry the page. Every dish card is a photo first. Cards have no border, no shadow — just the image with a 12px radius and the text below it. Glass is reserved for overlays (nav, drawer, sheet, review cards), not for content cards.
2. One orchestrated moment: page load. Hero image scales 1.06→1 over 1.2s, headline lines rise in with blur 8px→0 staggered 80ms, CTAs fade last. After that, motion only answers the user: hover lifts a card 4px, adding to bag bounces the bag icon, the drawer slides. No scroll-triggered fade-ups on every section.
3. The custom cursor from sakriya.net: a liquid-glass arrow that trails the pointer, grows over interactive elements and becomes an I-beam over text. Form fields keep the native caret. Disabled on touch devices and when `prefers-reduced-motion`.
4. Restraint: remove one thing before shipping each section.

---

## 2. Pages & routes (Next.js App Router)

| route | purpose |
|---|---|
| `/` | Home: hero → signatures → full menu (in-page, `#menu`) → about → reviews → visit |
| `/menu` | Same menu component, standalone, no hero (deep-link target, SEO) |
| `/checkout` | Mock checkout |
| `/order/[id]` | Confirmation |
| `/reviews` | All reviews, static grid (like sakriya.net/testimonials) |

Keep the menu on the home page. Restaurants lose people on the click to a separate menu page.

---

## 3. Components

### Nav
- Floating pill, transparent over the hero; liquid glass (`.glass` + refraction) after 40px scroll. A glass lens springs behind the hovered link and settles on the active one.
- Left: wordmark. Center: Menu / About / Reviews / Visit (anchor links, active state via IntersectionObserver). Right: "Order pickup" (`.btn-primary`, red) + Bag button with count badge.
- Bag badge bounces (scale 1→1.25→1, 300ms) whenever count changes.
- Mobile: wordmark + bag; links collapse into a full-screen glass sheet.

### Hero
- `next/image` priority, full-bleed, `object-cover`, vignette via CSS `linear-gradient` bottom-left (this is the one allowed gradient — it's a photo treatment, not decoration).
- Copy: headline "Indian cooking on Davis Street." Sub: today's hours, computed live ("Open now · closes 2:30" / "Opens at 4:30" / "Closed Mondays"). CTAs: **Order pickup** (primary) → scrolls to `#menu`; **Reserve a table** (ghost) → Yelp reservation URL, new tab.
- Photo for now: a tandoor/naan or a spread on a dark table (`public/hero.jpg`, from Pexels — query "indian food spread dark table" or "naan tandoor oven flames").

### SignatureDishes
- Horizontal `scroll-snap` strip, 6 items with `tags` includes `popular`, hand-picked order: Butter Chicken, Garlic Naan, Lamb Pasanda, Chicken Tikka Masala, Vegetable Samosa, Tandoori Mixed Grill.
- Cards 320×400, photo full-bleed, name + price bottom-left over vignette. Tap → opens DishSheet.
- Edge bleeds past container on desktop; drag-to-scroll with Framer Motion `drag="x"` on pointer devices.

### Menu
- `CategoryRail` (desktop, sticky `top: 88px`): plain list, active item gets a red left rule and cream text; others `--cream-2`. Clicking smooth-scrolls to the category anchor. Active category tracks scroll via IntersectionObserver.
- `CategoryChips` (mobile, sticky under nav): horizontally scrollable chips; active chip scrolls into view.
- Search input above the rail (filters by name/desc, debounced 150ms). Diet filter chips: Vegetarian · Vegan · Spicy — multi-select, filter `tags`.
- Each category: title + optional blurb + `DishGrid`.
- `DishCard`: photo (4:3, `next/image`, `sizes` set correctly, blur placeholder), name, price (tabular), 1-line desc (`line-clamp-2`), diet chips (tiny dot + word, `--green` / `--red`), and a round **+** button bottom-right of the photo. Whole card is clickable → DishSheet. **+** adds one at default spice without opening the sheet (fast path).
- Empty state (search with no results): "Nothing matches 'xyz'. Try 'lamb' or 'naan'." + clear button.

### DishSheet
- Desktop: right-side drawer 480px, glass. Mobile: bottom sheet, drag-to-dismiss.
- Photo top (16:9), name, price, full desc, category blurb (e.g. "Served with saffron basmati rice").
- Spice level: segmented control Mild / Medium / Hot / Indian Hot (default Medium; hidden for breads, sides, desserts, beverages, soups, cold appetizers).
- Quantity stepper (1–20). Special instructions textarea (140 chars).
- Primary button: "Add to bag · $17.95" (price × qty, live). On add: close sheet, bag badge bounces, toast "Added Butter Chicken" with an "Undo" action (4s).

### CartDrawer
- Right drawer, glass, 420px desktop / full-width mobile. Opens from Bag button; `Esc` and backdrop close it; focus trapped.
- Line items: thumb 64px, name, spice + instructions in `--cream-2`, qty stepper (− / n / +), line total, remove (trash, `--red-deep` on hover). Removing an item collapses its row (height animate) rather than snapping.
- Footer: subtotal, estimated tax (6.3%, from `restaurant.estimatedTaxRate`), total. "Checkout" primary → `/checkout`. Under it, small: "Pickup only · 219 E Davis St".
- Empty state: illustration-free. "Your bag is empty." + "Browse the menu" button.

### Checkout (mock)
Single page, two columns on desktop (form left, order summary right, sticky), stacked on mobile.
1. **Pickup time** — "ASAP (about 20 min)" or "Schedule": date (today/tomorrow, respecting closed Mondays) + 15-min slots inside open hours, minus `carryoutCutoffMinutes` at the end of each window. If closed now and ASAP picked, show next opening time instead.
2. **Contact** — name, phone (formatted as typed), email (optional).
3. **Payment** — card number (Luhn check, auto-format, brand icon), expiry (MM/YY, future), CVC, ZIP. Clearly labeled **"Demo — no charge is made"** in a quiet line under the heading. Also a "Pay at pickup" radio that hides the card form.
4. **Place order** button → 900ms loading state → generate order id (`NAT-` + 5 chars), persist order to localStorage, clear bag, route to `/order/[id]`.
Validation inline, on blur, no alerts. Errors say what to fix: "Card number is 15 digits — check for a missing one."

### Confirmation `/order/[id]`
- Big check, "Order NAT-7K2QP is in." Pickup time, address with "Get directions" (maps URL), phone, itemized summary. "Order again" → `/`.
- Reads from localStorage; unknown id → "We couldn't find that order." + link home.

### About
- Two columns: photo of the dining room (placeholder until owner sends one — Pexels "restaurant exposed brick interior dark" for now) and 3 short paragraphs: the building, the two kitchens (North tandoor + South coconut/curry-leaf), the family. Get real facts from the owner; keep the copy plain, no "culinary journey" language.

### Reviews (wall)
- Port the sakriya.net testimonial wall: three columns drifting vertically (middle reversed, ~46s loop), liquid-glass scrub bar, pause on hover, columns duplicated (aria-hidden) for a seamless loop; below 640px a native snap carousel; `prefers-reduced-motion` → static grid.
- Card: liquid glass with a soft red glow on hover, 5 stars in `--gold`, verbatim quote, name, relative date, Google avatar when the API provides one (initials otherwise).
- Header: "4.5 · 462 Google reviews" — live from the Places API (New) when `GOOGLE_PLACES_API_KEY` + `GOOGLE_PLACE_ID` are set (`lib/reviews.ts`, up to 5 reviews per Google's limit, 6h cache), else `reviews.json.aggregate`. "Leave a review" ghost button → `reviewUrl`. Link to `/reviews`. Only verbatim public reviews, ever — never placeholders.

### Visit
- Three columns → stacked: **Hours** (7-row table, today's row highlighted, live "Open now"/"Closed" pill), **Find us** (address, "Get directions", embedded Google Map iframe with dark style param, `loading="lazy"`), **Reach us** (phone as tel link, "Reserve a table", "Order pickup").

### Footer
- Wordmark, address, phone, hours summary, © year. Nothing else. Beige surface (`--beige`, `--ink` text): the one light band on the page.

---

## 4. Cart state

`zustand` store with `persist` (key `natraj-bag`, localStorage).

```ts
type BagLine = {
  key: string;            // `${itemId}|${spice}|${hash(instructions)}`
  itemId: string;
  qty: number;
  spice?: SpiceLevel;
  instructions?: string;
};
type BagState = {
  lines: BagLine[];
  add(itemId, opts?: { qty?; spice?; instructions? }): void;  // merges on same key
  setQty(key, qty): void;  // qty 0 → remove
  remove(key): void;
  clear(): void;
  // derived (selectors, not stored): count, subtotal, tax, total, lastAddedKey
};
```
Prices are always looked up from `menu.json` at render time, never stored in the bag (so a price edit in JSON is reflected everywhere).

Orders: `localStorage['natraj-orders']` = `Record<orderId, Order>`. Mock only; note in code that this is where a real POS/Stripe call goes.

---

## 5. Images
- Dish photos: `public/dishes/<family>.jpg`, produced by `scripts/fetch-images.mjs` (Pexels). `getDishImage(item)` returns `/dishes/${item.img}.jpg`.
- Shared helper `<DishImage item sizes />` wraps `next/image` with a warm blur placeholder (`placeholder="blur"` with a tiny base64 of `#241D18`).
- Hero, about-room, and og image live in `public/`.
- When the owner sends real photos, drop them in with the same family filenames. Nothing else changes.

---

## 6. Motion inventory (complete list — nothing else animates)
| trigger | what |
|---|---|
| page load | hero image scale, headline rise + unblur, CTAs fade (once) |
| scroll > 40px | nav pill gets liquid glass (200ms) |
| hover card | translateY(-4px), 200ms ease-out; photo scale 1.03 |
| add to bag | bag badge bounce; toast slides up |
| open sheet / drawer | slide + fade, 260ms, `cubic-bezier(.2,.8,.2,1)`; backdrop fade |
| remove line | row height → 0, 220ms |
| place order | button spinner 900ms → route |
| reviews | vertical column drift, pause on hover, scrub bar |
| cursor | glass arrow lerps at 0.32; grow / I-beam states 220ms |

All respect `prefers-reduced-motion: reduce` (instant states, marquee static, cursor off).

---

## 7. Quality floor
- Lighthouse ≥ 90 across the board on `/` (mobile). Photos are the risk: `sizes` correct, `priority` only on hero, everything else lazy.
- Keyboard: every interactive element reachable; visible red focus ring (`outline: 2px solid var(--red); outline-offset: 3px`); drawers trap focus and return it on close.
- Contrast: `--cream` on `--night` ~16:1; `--cream-2` on `--night` ~8:1; `--ink-2` on `--beige` ~5:1. `--red` is for fills, rules and large display type only (3.3:1 on `--night`); never for text under 24px on dark.
- Metadata: title "Natraj Indian Cuisine — Culpeper, VA", description, og image, `LocalBusiness` JSON-LD with hours/address/phone from `menu.json.restaurant`.
- Works with JS disabled down to: menu readable, prices visible, phone/address visible (bag obviously won't).

---

## 8. Things to confirm with the owner (don't block the build)
- Prices (see `menu.json._notes.pricing`), especially lamb and seafood.
- Sunday buffet — a review mentions one. If real, it's a hero-worthy line.
- Founding year for the hero sub-line.
- Culpeper meals tax rate.
- Real photos of the room, the tandoor, and 8–10 hero dishes.
- 8–10 real Google reviews to replace placeholders.
