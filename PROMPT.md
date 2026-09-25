# 8848 — Himalayan Fusion & Bar · Website Build Brief

You are building the full website for **8848**, a Nepalese / Himalayan + Indo-Chinese restaurant and bar in Harrisonburg, Virginia. You are running unattended overnight. **Do not stop to ask me anything.** Make every decision yourself, log it, and keep going until the whole site is finished, polished, and `npm run build` passes clean.

Re-read this file whenever your context is compacted. It is the source of truth.

---

## 0. THE MOST IMPORTANT INSTRUCTION: BE CREATIVE

Read this section twice.

I am not asking for a restaurant template. I am asking for the most beautiful, alive, memorable restaurant website you are capable of making. You have **complete creative control** over layout, palette details, typography, section order, copy, illustrations, and motion — inside the brand guardrails in section 3.

- **Push past your first idea.** For every section, think of the obvious version, then throw it away and build the version a top design studio would put in its portfolio.
- **Animate everything that deserves it.** Fades, reveals, parallax, draw-on SVG lines, counters, drifting particles, hover and tap micro-interactions. The site should feel alive the second it loads, especially on a phone.
- **Make original graphics with SVG, Canvas, CSS, or WebGL.** Hand-built SVG illustrations that move: mountain ridgelines, drifting clouds, falling snow, fluttering prayer flags, rising steam from a momo basket, topographic contour lines, a sun or moon travelling along the arc from the logo, stars coming out over the peaks. These are not decorations you might add at the end; they are the core of the design.
- **Surprise me, over and over.** I want as many "wait, do that again" moments as you can fit. Section 5 is a big bank of set-piece ideas. Build as many as you can, then invent your own.
- **Work hard on this one.** This is a showcase build, and you have the whole night. Do not stop at "good enough." When something works, make it better. When you think you're done, you're not; go back to section 5 and build more. I would rather delete extra wow moments tomorrow than wish there were more.
- **Taste over quantity.** Creative does not mean cluttered. Every animation has a purpose, uses good easing, and never blocks reading. Restraint on text, generosity on craft.
- **Do two dedicated creative passes** at the end (section 9) where your only job is to make it more beautiful and more delightful.

If you ever have to choose between "safe and generic" and "bold and crafted," choose bold and crafted. If you ever have to choose between "stop here" and "build one more amazing thing," build one more amazing thing.

---

## 1. Reference code (structure + components — NOT colors)

Two of my previous sites are the quality bar. Their code is already in this folder; **no cloning needed**:

- `reference-code/natraj/` — **Natraj Indian Cuisine** (restaurant site): source, menu data, dish photos.
- `reference-code/sakriya/` — **sakriya.net** (my portfolio): components, lib, global CSS.
- `reference-code/README.md` — a map of exactly which files to look at for what. **Read it first.**

**Critical setup rules for `reference-code/`:**
- It is **read-only reference**. Never edit it. Copy what you need into the real project, then adapt.
- **Exclude it from the build.** Add `reference-code` to `tsconfig.json` `exclude`, to ESLint ignores, and anywhere else the toolchain might pick it up. It contains `.ts/.tsx` files that will break type-checking otherwise.
- `reference-code/natraj/CLAUDE.reference.md` and `docs/PROMPTS.reference.md` were written for a different, phase-by-phase job. Read them for conventions only. **Do NOT follow their "stop after each phase / don't offer next steps / ask before adding deps" rules.** This brief overrides them: you run all night without stopping.

Before writing code, study both codebases thoroughly and write a short `REFERENCE_NOTES.md` of what you are reusing.

**Take from Natraj:**
- **Tech stack and project structure.** Next.js 15 App Router, TypeScript, `src/` dir, Tailwind v4 with CSS-variable tokens, `motion` (Framer Motion), `zustand` + persist for the bag, `lucide-react`. Add `three` for the 3D work (sakriya uses it). You may add other deps if they earn their place (e.g. GSAP, Lenis for smooth scroll).
- The **menu with filters** (category chips/rail, filter panel, search, featured rail, dish sheet) and the menu JSON shape.
- The **order flow**: bag (zustand), cart drawer, checkout page, order confirmation page, pickup/delivery mode, hours logic, bag totals.
- Glass panel + `useLiquidGlass` refraction, `Reveal`, toast, stepper, `DishImage` with fallback, JSON-LD, sitemap/robots.
- **Menu names, descriptions and dish photos** (section 7).

**Take from sakriya.net:**
- **The testimonials wall** (`WallMarquee.tsx`). I love this. Port the mechanics and upgrade them (section 6).
- **The interactive globe** (`Globe.tsx` + `lib/landmask.ts`). I love this too. It already plots Kathmandu and Harrisonburg, VA. Reuse its tech and interaction feel, reimagined around Everest (section 5).
- `Effects.tsx` (scroll reveals, card tilt + glare, scroll-driven palette shift, liquid-glass refraction), `CursorLens.tsx` (desktop custom cursor), `Wordmark.tsx`, the easing curves and transitions in `app/globals.css`.

**Do NOT take:** either site's color palette or fonts (Natraj uses Fraunces + Instrument Sans; pick new ones for 8848). 8848 has its own brand (section 3).

Reuse and adapt freely. Do not blindly copy-paste; everything must feel native to 8848.

---

## 2. Brand assets in this folder

**The brass table plaque is THE reference for the whole site.** Look at it before every design decision.

- `assets/brand/style-reference-brass-plaque.png` — **PRIMARY STYLE REFERENCE.** Brushed brass plaque with the logo engraved in dark chocolate brown, standing on a walnut block, in a dim, warm, upscale dining room (walnut tables, cocoa linen napkins, glowing lamps, one orchid). This is exactly the look and mood I want: the logo treatment, the colors, the materials, the lighting.
- `assets/brand/style-reference-gold-foil-card.png` — **SECONDARY STYLE REFERENCE.** The mark in gold foil on textured cream paper. Use this treatment on light/cream surfaces.
- `assets/brand/logo-8848-primary-beige.jpeg` — the original flat logo file. Use it for **structure only** (arc, peaks, numerals, tagline layout). Do NOT use its flat colors; the plaque and card versions replace them.
- `assets/brand/logo-variants-with-and-without-numerals.png` — shows the full lockup and the **mark-only version** (arc + peaks, no numerals). Use mark-only for favicon, loader, small spaces.
- `assets/moodboard/` — the same two references at original crop.
- `assets/reference/abc-notice-legal-name-address.png` — newspaper legal notice. Source of the legal name and address (section 4).

**Logo handling:**
- The logo must look like it does on the plaque and the card: crisp, refined, angular peaks with snow-ridge facets, a thin clean arc, elegant numerals. Build it as a **real SVG**.
  - First try vectorizing the original logo (e.g. the `potrace` npm package), then hand-clean the paths to match the sharper plaque/card style.
  - If tracing looks bad, hand-draw the SVG mark to match the plaque version as closely as you can.
  - Last resort: an optimized transparent raster. The SVG is strongly preferred because it unlocks the best animation: the arc draws itself on, the peaks rise from the ground, the numerals fade/slide up, and a brass light sheen sweeps across it.
- **Two signature logo treatments.** Both should look genuinely tactile, not flat:
  - **Engraved brass** (on dark backgrounds): a brushed-brass surface built from layered gradients, fine directional grain, subtle noise and a soft specular highlight. The logo is *engraved* into it in dark chocolate `#3B2517`, using inset shadows / SVG filters so it reads as cut into metal. A slow light sweep across the brass on load, and on scroll or tilt (device orientation on phones, cursor on desktop).
  - **Gold foil on cream** (on light backgrounds): a foil gradient with a moving sheen, slight emboss, over a subtle paper texture.
- The wordmark is **"8848"**. A trailing dot ("8848.") is allowed if it looks better somewhere. Your call.
- In the header and hero, keep it clean: **8848** + the mark. The full name "8848 Himalayan Fusion & Bar" can appear as the tagline and in the footer. Don't crowd the top with long text.
- A brass-plaque version of the logo (like the reference, walnut stand and all, built in CSS/SVG or 3D) would make a great hero or intro moment.
- Generate favicon, apple-touch-icon, and an Open Graph share image from the mark, using the brass treatment.

---

## 3. Brand guardrails (palette + type)

The mood is **the dining room in the plaque photo**: dim, warm, candle-and-lamp lit, walnut and brushed brass, with cream paper for reading. Upscale and cozy, never flashy.

Colors sampled directly from the plaque and card photos:

| Role | Hex | Source |
|---|---|---|
| Night room / deepest base | `#17110D` (derive a warm near-black) | shadows of the dining room |
| Walnut | `#5B3825` | plaque stand, tables |
| Cocoa linen | `#4B3630` | napkins |
| Engraving chocolate (logo ink on brass) | `#3B2517` | engraved logo |
| Bronze text on brass | `#614A32` | engraved tagline |
| Brass shadow | `#9B7E53` | plaque edge |
| Brass | `#B69E70` | plaque face |
| Gold foil | `#DCBF7B` | business card foil |
| Brass highlight | `#F2E9CF` | light hitting the plaque |
| Lamp glow | `#EED3A5` | lamps in the background |
| Cream paper | `#E6E0D6` | business card stock |

- **Dark-first site.** Most of the site sits in the warm walnut/night-room tones with brass as the hero material, as if you're sitting at that table. Use **cream paper sections** where reading matters (menu cards, story text), with gold-foil accents. Alternate dark and cream with intention, like moving from the dining room to reading a menu.
- Lighting is part of the palette: soft warm radial glows (like the lamps), vignettes, a gentle bokeh feel in backgrounds. Brass should catch light when things move.
- Derive tints and shades yourself. Keep body text WCAG AA: cream/brass-highlight text on the dark tones, chocolate text on the cream.
- The Bar section/page can go even darker and moodier: starry sky over the peaks, brass-rimmed glassware illustrations, lamp glow.
- The five **prayer-flag colors** (blue, white, red, green, yellow) may appear only inside prayer-flag illustrations, heavily muted so they sit in this warm palette. Nowhere else.
- No reddish/oxblood browns, no purple, no neon, no blue-violet AI gradients, no flat yellow "gold." Gold must always look like metal or foil.
- **Typography:** match the logo. "8848" is an elegant high-contrast serif with curled 8s; the tagline is a sturdy serif in caps with wide tracking. Pick web fonts that echo both (display serif + a refined text face). Big, confident numerals. Use tabular figures for prices.

---

## 4. Business info

Put all of this in one config file (e.g. `src/config/site.ts`) so I can edit it later. Mark every placeholder with a `// PLACEHOLDER` comment and list them all in `PLACEHOLDERS.md`.

- **Brand name:** 8848
- **Full name:** 8848 Himalayan Fusion & Bar
- **Legal entity:** 8848 LLC (footer small print only)
- **Address:** 258 Reservoir St, Harrisonburg, VA 22801
- **Phone:** PLACEHOLDER — use `(540) 555-8848`
- **Email:** PLACEHOLDER — `hello@8848restaurant.com`
- **Hours:** PLACEHOLDER — make realistic lunch/dinner hours, bar open later on weekends, one closed day
- **Rating:** PLACEHOLDER — something like "4.9 ★ from 300+ guests"
- **Socials:** PLACEHOLDER Instagram / Facebook / TikTok links
- **Cuisine:** Nepalese / Himalayan, Indo-Chinese, with some North Indian favorites, plus a full bar (beer, wine, mixed drinks, specialty liquors)
- Footer includes the full name, address, phone, hours, an embedded map or stylized map graphic with a "Get directions" link to Google Maps, and `© 2026 8848 LLC`.

Where you don't have real info, make up tasteful, believable boilerplate. Never leave "Lorem ipsum" or empty sections.

---

## 5. Signature set-pieces (THE WOW LIST)

8848 is the height of Mount Everest (Sagarmatha / Chomolungma) in meters; the current official figure is 8,848.86 m (29,031.7 ft). This number is the whole brand. The site should feel like **a climb**: from a warm lamp-lit dining room up to the roof of the world.

Below is a bank of ideas. **They are a starting point, not a ceiling.**
- Build as many of them as you can, to a polished standard (not sketches).
- Then invent **at least 5 more of your own** that fit the brand.
- Target: **15+ set-pieces live on the site** by morning.

I can always delete later, so lean toward more.

### How to build them so I can delete later
- Each set-piece lives in its own component under `src/components/setpieces/` and is registered in one `src/config/features.ts` file with an on/off flag and a one-line description.
- Turning a flag off must cleanly remove that piece and leave the page still looking complete.
- List every set-piece in `PROGRESS.md` with where to find it on the site and how to trigger it, so I can demo them.

### ★ Flagship 1 — The scroll-driven ascent (three.js). Top-priority set-piece. Make it incredible.
- **Terrain:** a real 3D Everest massif in three.js. Use procedural noise shaped into a pyramid peak with ridges (or a heightmap you generate), styled low-poly/faceted to echo the angular peaks of the logo, with brass contour lines on the terrain and snow on the high faces.
- **Scroll drives the camera** along a CatmullRom curve that follows the classic South Col route. Smooth-scrubbed, with damping, no jitter.
- **A brass altimeter HUD** counts up as you climb: Kathmandu 1,400 m → Lukla 2,860 m → Namche Bazaar 3,440 m → Tengboche 3,867 m → Base Camp 5,364 m → Khumbu Icefall → Camp I 6,065 m → Camp II 6,400 m → Camp III 7,200 m → Camp IV / South Col 7,950 m → Hillary Step → **Summit 8,848.86 m**.
- **Each waypoint reveals content:** a menu category, a signature dish, a slice of the story, the bar. Waypoints are glass/brass cards pinned to the terrain.
- **The atmosphere changes with altitude:**
  - The sky shifts from morning to golden hour to deep starry night at the summit.
  - Temperature and oxygen % readouts drop.
  - Snowfall thickens, wind streaks appear, and frost creeps in from the screen edges near the top.
- **The summit moment:** the camera breaks above the clouds, prayer flags burst into frame and flutter, a flag gets planted, and there's a glorious reveal of the 8848 logo in brass, followed by a CTA ("You made it. Now eat." → Order).
- **Phones:** must run great. Lower-poly terrain, DPR cap, pause when offscreen. If WebGL is unavailable or `prefers-reduced-motion` is set, fall back to a layered SVG parallax version of the same climb.

### ★ Flagship 2 — Interactive 3D Everest (three.js)
- A drag-to-rotate massif (touch and mouse) with inertia, rendered as brass wireframe/contour lines over dark walnut, with glowing hotspots at each camp.
- Tapping a hotspot flies the camera there and opens a card: a story, a fact, a dish pairing.
- Tiny animated climbers (glowing dots) inch along the route. Wind-blown snow plumes stream off the summit.
- A toggle between "Brass contour" and "Snow" render modes.

### ★ Flagship 3 — The globe, reimagined
- Port the sakriya globe (it already has Kathmandu and Harrisonburg points and an arc with a traveling packet).
- Restyle it in brass dots on walnut. It spins to the Himalayas and pulses on Everest, then an arc flies Kathmandu → Harrisonburg with a line like "~7,800 miles from the roof of the world to Reservoir Street."
- Then it zooms toward Harrisonburg and hands off to the Visit section.

### Hero + intro
- **3D brass plaque intro:**
  - A three.js brushed-brass plaque on a walnut stand (exactly like the reference photo), lit by a warm lamp.
  - The logo is engraved into it with a normal/bump map.
  - The specular highlight follows the cursor, or phone tilt via DeviceOrientation (with the iOS permission prompt behind a tasteful "Tilt to shine" button).
  - On scroll, the camera pushes *through the logo's arc* into the mountains.
- **Logo draw-on:** the arc strokes itself on, the peaks rise out of the ground, a sun rises through the arc, then the numerals settle.
- **Real time of day:** the hero sky matches the current time in Harrisonburg (dawn, day, golden hour, night with stars and a moon on the arc).
- **Lamp-light spotlight:** on dark sections, a warm glow follows the cursor or finger and reveals hidden engraved contour lines and details in the walnut.

### Ambient life (sitewide)
- **Prayer flags** strung across section tops, with real cloth physics (verlet in canvas), fluttering in wind that picks up with scroll speed.
- **Interactive snow:** particles drift and get pushed away by the cursor or touch.
- **Singing-bowl ripples:** tapping anywhere on dark sections sends out soft brass ripple rings. Optional ambient sound (singing bowl chime, wind) is **off by default** behind a small sound toggle.
- **Butter lamps** that flicker. "Open now" is a lit lamp; "Closed" is an extinguished one with a wisp of smoke.
- **Scroll progress as a climber:** a tiny climber ascends a ridgeline along the page edge as you scroll.
- **Cloud-wipe page transitions** between routes.
- A **brass mandala / compass loader** that spins while heavy scenes load.
- **Phone tilt parallax** on mountain layers.
- **Light haptics** (`navigator.vibrate`) on add-to-bag where supported.

### Menu + ordering
- **Menu categories as camps** on a mini altitude rail. Switching categories animates the climber between camps.
- **Spice level as peaks:** 1–5 tiny mountains that light up; hot dishes get a subtle heat shimmer.
- **Steam** rises off dish photos on hover/tap.
- **Add-to-bag flight:** the dish thumbnail flies along an arc into the bag, which is styled as a **trekking pack**. The pack icon bounces and its count ticks up.
- **Momo builder** (interactive toy):
  - Choose a filling and a style (steamed, fried, kothey, jhol, C-momo).
  - Watch an SVG momo get pleated and cooked (steam, sizzle, or jhol broth pouring), then add it to the bag.
- **Dal bhat thali explorer:** a top-down plate where tapping each katori/bowl explains it.
- **Order confirmation as a trekking permit:** a stamped "Sagarmatha permit" style ticket with the guest's name and order number, stamp animation included.

### The Bar (night mode)
- A deep night sky over the peaks with a slow Milky Way, twinkling stars and occasional shooting stars.
- **Cocktail pour:** tap a cocktail and watch the layers pour into an SVG glass, ice drops in, and the garnish lands. The liquid sloshes with phone tilt.
- Warm bokeh lamp lights, and brass-rimmed glassware illustrations.

### Story + testimonials + visit
- **A hand-drawn route map** (Kathmandu → Lukla → Namche → Base Camp → Summit) that draws itself on scroll on textured lokta paper.
- Big counters that tick up: 8,848.86 m, 29,031 ft.
- **Testimonial cards as postcards from Base Camp,** with stamps and postmarks, or as prayer-flag cloth. Your call; make them beautiful.
- **A gallery of polaroids** pinned on a string like prayer flags, swaying gently.
- A mock **reservation** using a brass dial date/time picker. Confirming stamps a passport-style stamp.
- **Footer:** a mountain silhouette horizon with a moon on the logo's arc and parallax ridges.

### Easter eggs
- Tap the logo 8 times (or type "8848") for a gentle avalanche of snow and a yeti footprint trail across the page.
- **404 page:** lost in a whiteout blizzard, with a spinning brass compass and "Return to Base Camp."
- A subtle Devanagari accent, सगरमाथा (Sagarmatha), used tastefully somewhere.

### Performance rules for all set-pieces
- Lazy-load every heavy scene.
- Pause rendering offscreen (IntersectionObserver).
- Cap DPR at 2 (1.5 on phones).
- Avoid more than one active WebGL context at a time.
- Dispose three.js resources on unmount.
- Every set-piece needs a reduced-motion fallback that still looks designed.
- Test on a 390px viewport with CPU throttling in Playwright and fix jank.

## 6. Testimonials (must-have, high priority)

Port the sakriya.net testimonial wall and make it even better.

- **20 sample testimonials.** Varied, specific, believable voices: JMU students, local families, Harrisonburg regulars, Nepali community members, someone who trekked to Base Camp, a date-night couple, a cocktail lover, a spice skeptic who got converted by the momos. Mention real dishes from your menu. Mix of short and medium length. Mostly 5 stars, a couple 4.5.
- **Photos:** random portrait avatars are fine (e.g. randomuser.me portraits, or download a set into `public/`). Also fine to mix in a few initials avatars. No broken images.
- **Heads-up:** in both reference repos, phones fall back to a *manual* swipe carousel (no auto-scroll) and desktop scrolls vertical columns. That is **not** what I want on phone. Build a real auto-scrolling marquee for mobile.
- **Motion:**
  - On phone, **horizontal (side-to-side) is preferred.** Two rows scrolling in opposite directions works well. On desktop, horizontal rows or vertical columns — your choice.
  - Seamless infinite loop.
  - **Speed:** noticeably moving (people should see it move instantly), but slow enough that someone can read most of a card as it passes. Tune it on a 390px-wide viewport. Roughly one card width every 4–6 seconds as a starting point.
  - **Tap a card (or its row) to pause. Tap again to resume.** Hover pauses on desktop. Paused card gets a subtle lift/glow so it's obvious it stopped.
  - Edge fade masks on both sides.
- Cards: warm liquid glass with a thin brass edge (dark section) or cream paper with foil details (light section), star rating, name, a short context line ("JMU '27", "Regular since opening", etc.), and the dish they're raving about.
- Above the wall: the aggregate rating with an animated count-up.

---

## 7. Menu + ordering

**Menu data:** start from `reference-code/natraj/data/menu.json`. **You may reuse Natraj's dish names and descriptions for now** (I'll replace them with the real 8848 menu later). Keep its JSON shape, extend it where needed (spice level, "Chef's pick", Nepali names, bar items).
- Pull in Natraj's Indian dishes that fit a Himalayan/Indo-Chinese restaurant (appetizers, momos, chilli dishes, curries, tandoor, biryani, breads, desserts, drinks). Trim the rest; I don't need all 151.
- Write the Nepali, Himalayan, Indo-Chinese and Bar items that Natraj doesn't have.
- Target 70–100 items total with names, short appetizing descriptions, realistic Harrisonburg prices, diet tags (veg, vegan, GF, contains nuts), spice level, and a "Chef's pick" / "Popular" flag.
- Add `"placeholder": true` to the menu file's notes and list the menu as a placeholder in `PLACEHOLDERS.md`.

Suggested categories (adjust as you see fit):
- **Momo** — steamed, fried, kothey (pan-fried), jhol momo, C-momo (chilli momo), tandoori momo; chicken / veg / paneer / buff-style (use beef or lamb)
- **Himalayan Small Plates** — chicken choila, sadheko (spiced salads), sekuwa (grilled skewers), aloo sadheko, sukuti, sel roti
- **Noodles & Soups** — thukpa, thenthuk, chowmein, laphing-style cold noodles
- **Indo-Chinese** — chilli chicken, chilli paneer, gobi manchurian, Hakka noodles, Schezwan fried rice, honey chilli potatoes, dragon chicken
- **Nepali Thali & Mains** — dal bhat thali, goat curry (khasi ko masu), aloo tama, gundruk
- **From the Tandoor & Curries** — a focused North Indian section
- **Rice & Breads**
- **Desserts** — juju dhau (king curd), kheer, gulab jamun, something fusion
- **Chiya & Soft Drinks** — masala chiya, lassi, butter tea for the adventurous
- **The Bar** — signature cocktails with Himalayan names and ingredients (timur pepper, cardamom, Himalayan salt rim, rhododendron, ginger, yak-butter-washed something if you want to be bold), beers (include Nepali-style lagers like Everest / Gorkha / Nepal Ice as placeholders), wine, mocktails

**Menu page:** port Natraj's filter UX and make it feel native to 8848: sticky animated category rail, diet + spice filter chips, search, smooth layout animations when filtering, dish cards with photo, price, tags, and an "Add" button that animates into the bag.

**Order page / bag:** port Natraj's flow. Bag drawer with quantities, subtotal, tax, tip, pickup vs. delivery toggle, pickup time picker, a checkout form, and a confirmation screen with a celebratory animation (e.g. the order "reaches the summit": a flag planted on the peak). Clearly mock, no payment processing. Cart persists across page reloads.

**Dish images:**
- Copy the photos you use from `reference-code/natraj/public/dishes/` into `public/dishes/`. Map them the same way Natraj does (the `img` key in the menu JSON → `<family>.jpg`).
- Useful for 8848: `o-chicken-momo`, `o-momo-veggie`, `o-chicken-chili-momo`, `o-chicken-chilli`, `chilli-paneer`, `goat-curry`, `o-goat-kashmiri`, `chai`, `lassi`, `kheer`, `o-gulab-jamun`, the curries, biryanis, naan, soups. Look at each photo before assigning it.
- `scripts/fetch-images.mjs` pulls more from Pexels, but only if `PEXELS_API_KEY` is available (check `echo $PEXELS_API_KEY` in the environment, or `.env.local`). If it's set, use it for dishes with no good photo (thukpa, chowmein, sekuwa, choila, dal bhat, cocktails). Tune the queries toward dark, moody, close-up shots that match the plaque photo.
- For anything still without a matching photo, make beautiful illustrated SVG/CSS placeholders in the brand palette (brass line-art on walnut, for example).
- **No broken images and no mismatched photos** (no pizza on a momo card). All images local in `public/`, optimized (Natraj has `scripts/optimize-images.mjs`).

---

## 8. Pages / sections (your call on final order and names)

At minimum:
- **Home:** animated logo intro (short, skippable, only on first visit), hero with living illustration, the story of 8848 (short, evocative), signature dishes, Everest centerpiece, the Bar teaser, testimonials, visit/hours/map, footer.
- **Menu**
- **Order** (bag + checkout)
- **The Bar** (can be a section or a page; dark night theme welcome)
- **Our Story / About**
- **Visit / Contact / Reservations** (reservation form is mock, with a nice success state)
- Custom **404** page (lost on the mountain, "return to Base Camp")

Mobile-first everywhere. Most people will first see this on a phone when I show it to them.

---

## 9. Motion + quality standards

**Motion:**
- Scroll-reveal fade/slide on sections and cards — must be clearly visible on phones.
- Staggered text reveals on headlines.
- Parallax mountain layers in the hero.
- 15+ set-pieces from section 5 (plus your own inventions), each polished and behind a feature flag.
- Smooth page transitions.
- Tactile micro-interactions on every button, chip, and card (press, hover, focus).
- Use GPU-friendly properties (transform, opacity). 60fps on a mid-range phone. No layout thrash.
- Respect `prefers-reduced-motion`: keep fades, kill movement-heavy effects.

**Never ship:**
- Generic stock-template sections ("Welcome to our restaurant!" with a centered paragraph).
- Emoji as icons. Use a proper icon set or custom SVG.
- Purple/blue AI gradients, glassmorphism with no contrast, text over busy images without a scrim.
- Placeholder text, broken links, console errors, horizontal scroll on mobile.

**Accessibility + SEO:** semantic HTML, alt text, keyboard navigation, visible focus rings, proper headings, meta tags, OG image, JSON-LD `Restaurant` schema with the address and placeholder hours/phone.

---

## 10. How to work tonight

1. **Setup:** read `reference-code/README.md`, study both codebases, write `REFERENCE_NOTES.md`. Scaffold the project in this folder (keep `assets/` and `reference-code/`), exclude `reference-code` from the build, initialize git.
2. **Plan:** write `PLAN.md` with your design concept (a short creative direction statement), the full palette and type choices, the sitemap, and the list of signature animations you'll build. Then execute the plan without waiting for approval.
3. **Build in milestones.** After each one: `npm run build`, fix errors, `git commit` with a clear message, and append a line to `PROGRESS.md`. Milestones:
   1. Foundation, design tokens, fonts, `features.ts`.
   2. Logo SVG + hero.
   3. Core pages working end to end: home sections, menu + filters, bag + checkout + confirmation, testimonials, visit, bar, story, 404. **A complete, shippable site exists before the heavy set-pieces.**
   4. ★ Flagship 1: the scroll-driven ascent.
   5. ★ Flagship 2: the interactive 3D Everest.
   6. ★ Flagship 3: the globe.
   7. Set-piece rounds: build section 5 ideas in batches of 3–4, committing after each batch, until you hit 15+, then keep going with your own inventions.
   8. Polish.
4. **Visual QA with screenshots.** Use Playwright (install it) to screenshot every page at **390px** and **1440px** wide, including the testimonial wall mid-scroll and the bag open. Look at the screenshots yourself and fix anything ugly, misaligned, clipped, or low-contrast. Repeat until it's genuinely beautiful.
5. **Creative pass #1:** go page by page and ask "how can this be more memorable?" Add or upgrade at least 5 animations, illustrations or interactions. Revisit the flagships and push them further (lighting, easing, detail, sound design). Commit.
6. **Creative pass #2:** same question, focused on mobile. Commit.
7. **Final:** clean `npm run build`, no console errors, Lighthouse-minded performance (lazy-load heavy 3D, compress images, code-split).
8. **Hand-off:** finish `README.md` with how to run it, and a summary at the top of `PROGRESS.md` covering what was built, the signature moments I should show people, all placeholders to replace, and anything unfinished.

Rules for unattended running:
- **Git:** you are running locally.
  - Commit after every milestone.
  - If a git remote is configured, also `git push` after each commit.
  - Never commit secrets or `.env*` files.
- **Never stop to ask.** When unsure, choose the more beautiful option that still works on mobile, log it in `DECISIONS.md`, move on.
- If a dependency or approach fails twice, switch approaches instead of looping.
- Don't spend more than one milestone's worth of effort stuck on any single effect. Ship a strong fallback and come back in the creative pass.
- Keep everything self-contained: the site must not need API keys at runtime (the optional Pexels key is only for fetching photos at build time), no paid services, no backend. Static-deployable (e.g. to Vercel).

Now go build the most beautiful restaurant website you've ever made. Be creative.
