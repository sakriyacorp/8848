# 8848 — Plan

## Creative direction: *From the table to the summit*

You sit down at a walnut table. The room is dim, a lamp glows behind you, and in front of you
stands a brushed-brass plaque with the mark cut into it. Tilt your phone and the light slides
across the brass. Scroll, and you fall through the arc of the logo into the Himalaya — and
from there the whole site is a climb: Kathmandu at the bottom, the summit at the top, the bar
under the stars at night.

Three rules hold it together:

1. **Materials, not colours.** Brushed brass, walnut, cocoa linen, gold foil, lokta paper,
   night sky. Brass is the material of everything you can touch; it catches light when it moves.
2. **Light is a character.** Lamp glows, a warm spotlight that follows your finger, a sheen that
   sweeps across metal, butter lamps that flicker, stars that come out as you gain altitude.
3. **Altitude is the organising idea.** Every page has an altitude. A tiny climber on the page
   edge shows how far you've come. Menu categories are camps. The order confirmation is a
   trekking permit. 8,848.86 m is the finish line and the brand.

Copy is short, warm and plain. No "culinary journey", no "elevate", no emoji.

## Palette

| Token | Hex | Role |
|---|---|---|
| `--night` | `#17110D` | Base of the room |
| `--void` | `#0E0A07` | Deepest shadow, bar sky base |
| `--walnut-deep` | `#2A1B12` | Raised dark surfaces |
| `--walnut` | `#5B3825` | Stands, tables, wood |
| `--cocoa` | `#4B3630` | Linen, secondary dark |
| `--choc` | `#3B2517` | Engraving ink; body text on cream |
| `--bronze` | `#614A32` | Secondary text on cream, engraved tagline |
| `--brass-shadow` | `#9B7E53` | Brass edge, hairlines |
| `--brass` | `#B69E70` | Brass face, UI accents on dark |
| `--foil` | `#DCBF7B` | Gold foil (always as a gradient/sheen) |
| `--brass-hi` | `#F2E9CF` | Specular highlight, headline text on dark |
| `--lamp` | `#EED3A5` | Lamp glow, warm light |
| `--cream` | `#E6E0D6` | Paper sections |
| `--paper` | `#EFE8DB` | Lighter lokta paper |
| `--text` | `#EDE4D3` | Body text on dark (AA ≥ 12:1 on night) |
| `--muted` | `#B7A68A` | Secondary text on dark (AA ≈ 7:1 on night) |

Prayer-flag colours (only inside flag illustrations, muted): blue `#5A7188`, white `#D8D0C0`,
red `#9A5446`, green `#627457`, yellow `#C6A55A`.

Gold is never flat: foil = moving linear gradient `#8E6F3E → #DCBF7B → #F6E7B8 → #B08A4A`;
brass = layered gradients + directional grain + specular highlight.

## Type

- **Display — Cormorant** (500/600, italic): high-contrast, elegant curled numerals; used big
  (clamp up to 9rem) with lining figures for 8,848.86.
- **Engraved caps — Cinzel** (500/600): the tagline voice. Wide tracking (0.18–0.32em) for
  eyebrows, labels, stamps, permit fields.
- **Text / UI — Jost** (400/500/600): clean geometric sans for body, buttons, prices
  (`tabular-nums`).

## Sitemap

| Route | Altitude | What's there |
|---|---|---|
| `/` | Base camp → summit | Intro (first visit), brass plaque hero → fall through the arc → living mountain + time-of-day sky, story teaser + counters, signature dishes (cream menu cards), **The Ascent** (scroll-driven 3D climb), the Bar teaser, postcards wall, globe → visit, footer horizon |
| `/menu` | Camps | Camp altitude rail + climber, diet/spice filters, search, featured rail, dish sheet, momo builder, thali explorer, prayer-wheel oracle |
| `/order` | — | Trekking pack review, pickup/delivery, time picker, contact, tip, place order |
| `/order/permit?id=` | Summit | Sagarmatha trekking permit with stamp + flag-planting summit |
| `/bar` | 8,848 m at night | Milky Way, shooting stars, constellation logo, cocktail pour, bar menu |
| `/story` | Kathmandu | Route map on lokta paper, counters, interactive 3D Everest, polaroids on a string, singing bowl |
| `/visit` | Reservoir St | Hours with butter lamps, stylised map, twin clocks, brass-dial reservation → engraved plaque + passport stamp |
| `404` | Whiteout | Blizzard, spinning brass compass, "Return to Base Camp" |

## Signature set-pieces (each in `src/components/setpieces/`, flagged in `src/config/features.ts`)

Flagships: **Ascent** (scroll-driven three.js climb, altimeter HUD, waypoint cards, sky/temperature/O₂
shift, snow thickening, frost, summit flag + logo reveal), **Everest 3D** (drag massif, brass contour /
snow modes, camp hotspots, climbers, summit plume), **Globe** (brass dots on walnut, KTM → HBG flight).

Hero + intro: 3D brass plaque (engraved normal map, cursor/tilt specular, push through the arc), logo
draw-on intro, real time-of-day sky, lamp-light spotlight.

Ambient: verlet prayer flags (wind from scroll speed), interactive snow, singing-bowl ripples
(+ optional sound), butter lamps (open/closed), climber scroll progress, cloud-wipe page transitions,
mandala loader, phone-tilt parallax, haptics.

Menu + order: camps rail, spice peaks + heat shimmer, dish steam, add-to-bag flight into the trekking
pack, momo builder, thali explorer, trekking-permit confirmation.

Bar: night sky + shooting stars, cocktail pour with tilt slosh, bokeh + brass glassware.

Story/visit: route map draw-on on lokta paper, counters, postcard testimonials, polaroid string,
brass dial reservation + passport stamp, mountain footer with moon on the arc.

Easter eggs: tap the logo 8× / type "8848" → avalanche + yeti footprints; blizzard 404; सगरमाथा.

My own additions: **prayer-wheel dish oracle** (spin with inertia → a dish suggestion),
**twin clocks** (Harrisonburg ↔ Kathmandu, +9:45/+10:45), **playable singing bowl** (rub the rim,
WebAudio), **constellation logo** (hold on the bar sky and the stars draw the mark),
**engraved reservation plaque** (your name cut into brass), **momo counter** (momos pleated today),
**altitude tab title**.

## Build order

1. Foundation — tokens, fonts, features.ts, site config, layout shell.
2. Logo SVG + hero.
3. Core pages end to end (home sections, menu + filters, bag + checkout + permit, testimonials,
   visit, bar, story, 404).
4. Flagship 1 — Ascent. 5. Flagship 2 — Everest 3D. 6. Flagship 3 — Globe.
7. Set-piece batches of 3–4, committing each. 8. Polish, Playwright QA at 390/1440, two creative
   passes, final build.
