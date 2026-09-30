# Placeholders to replace

Everything marked `// PLACEHOLDER` in code is listed here. Business facts live in
`src/config/site.ts`; change them there and the whole site follows (header, footer, JSON-LD,
checkout, reservations).

| What | Where | Current value |
|---|---|---|
| Phone | `src/config/site.ts` → `phone`, `phoneHref` | (540) 555-8848 |
| Email | `src/config/site.ts` → `email`, `emailHref` | hello@8848restaurant.com |
| Kitchen hours | `src/config/site.ts` → `hours` | Tue–Thu 11:30–2:30 & 5–9:30 · Fri–Sat 11:30–2:30 & 5–10:30 · Sun 12–9 · Mon closed |
| Bar hours | `src/config/site.ts` → `barHours` | Tue–Wed 4–10:30 · Thu 4–11 · Fri 4–midnight · Sat 12–midnight · Sun 12–9 |
| Rating | `src/config/site.ts` → `rating` | 4.9 ★ from 300+ guests |
| Socials | `src/config/site.ts` → `socials` | instagram.com/8848harrisonburg, facebook…, tiktok… |
| Map coordinates | `src/config/site.ts` → `address.lat/lng` | approximate geocode (directions link uses the street address) |
| Tax rate | `src/config/site.ts` → `taxRate` | 13.3% (5.3% VA + 1% local + 7% Harrisonburg meals tax) — confirm |
| Order lead times | `src/lib/fulfillment.ts` → `LEAD_MINUTES` | pickup 20 min, delivery 45 min |
| Delivery area copy | `src/config/site.ts` → `deliveryArea` | "Harrisonburg and JMU campus" |
| Opening year | `src/config/site.ts` → `foundedYear` | 2025 |
| **Menu prices** | `data/menu-content.md` → `npm run menu` | The menu itself now follows the owner's 2026 draft (152 dishes and drinks, descriptions trimmed). **Every price is a placeholder**: the draft had none except goat +$3.50 on kothey / chilli fry momo. Choice upcharges (egg, chicken, shrimp, thali meats…) are guesses too |
| Heat levels, chef's picks, "most loved" | `data/menu-content.md` (▲ marks), `scripts/menu-from-md.mjs` (`CHEF`, `POPULAR`) | our suggestions; the kitchen should set them |
| Diet tags | `data/menu-content.md` (V, N) | only vegetarian and "contains nuts" (where a description names nuts) are marked. Vegan, gluten-free and nut-free filters were removed until the kitchen confirms them dish by dish |
| Names to confirm | `data/menu-content.md` | "Bysen – Buff Sukuti" printed as Buff Sukuti; "Poleko Moleko Chicken" spelling; "Timmur" spelling now used everywhere |
| Nepali names | `data/menu-content.md` | Devanagari on 19 dishes; have a native speaker check |
| Natraj photos (`o-*.jpg`) | `public/dishes/o-*.jpg` | Natraj Indian Cuisine's own dish photos, used as stand-ins. Replace with 8848 photography |
| Pexels photos (`p-*.jpg` and plain names) | `public/dishes/` | free-licence stock (credits in `data/photo-credits.json`); fine to keep, better to replace |
| Testimonials (all 20) | `src/data/testimonials.ts` | invented sample reviews |
| Testimonial portraits | `public/people/*.jpg` | randomuser.me placeholder portraits |
| Story copy | `src/app/story/page.tsx` → `CHAPTERS` | tasteful boilerplate; replace with the owners' own words |
| Base Camp Hour (happy hour) | `src/app/bar/page.tsx` | Tue–Thu 4–6 PM, $2 off draft beer, $10 steamed momo, half-price masala chiya (invented) |
| Private events capacity | `src/app/visit/page.tsx` → `FAQ` | "up to 60 people" |
| Parking note | `src/components/home/VisitSection.tsx`, `src/app/visit/page.tsx` | "street parking + lot behind the building" |
| Polaroid captions + backs | `src/components/setpieces/Polaroids.tsx` → `SNAPS` | dish photos with invented captions ("Opening night", "Asan Tole · 2014"…); swap in the family's own snapshots |
| Momo counter | `src/components/setpieces/MomoCounter.tsx` | "≈ N momos pleated today" is an estimate from the kitchen clock (labelled "≈"); wire to real POS counts or switch `momoCounter` off |
| Prayer-wheel fortunes | `src/components/menu/MenuExtras.tsx` → `ORACLE` | 8 dishes + invented fortunes |
| Momo builder fillings | `src/components/setpieces/MomoBuilder.tsx` → `FILLINGS`, `STYLES` | chicken / veg / paneer & spinach / lamb × steamed / fried / kothey / jhol / chilli, flat $15 for 10 |
| Thali explainer copy | `src/components/setpieces/Thali.tsx` → `PARTS` | general dal bhat notes; make it describe 8848's own thali |
| Everest camp stories + dish pairings | `src/data/everest.ts`, `src/data/climb.ts` | written for the demo; facts are real, pairings are suggestions |
| Shooting-star wishes | `src/components/setpieces/NightSky.tsx` → `WISHES` | playful lines, change freely |
| Site URL (for OG/sitemap/JSON-LD) | env `NEXT_PUBLIC_SITE_URL` | falls back to http://localhost:3000; set it on Vercel |
