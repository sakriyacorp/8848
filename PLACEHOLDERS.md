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
| **Whole menu** | `data/menu.json` (`_notes.placeholder: true`) | 98 items. Curry/tandoor/biryani/bread/dessert/lassi wording reused from Natraj; Nepali, Indo-Chinese and bar items written for the demo; all prices invented |
| Nepali names | `data/menu.json` → `np` | best-effort Devanagari; have a native speaker check |
| Natraj photos (`o-*.jpg`) | `public/dishes/o-*.jpg` | Natraj Indian Cuisine's own dish photos, used as stand-ins. Replace with 8848 photography |
| Pexels photos (`p-*.jpg` and plain names) | `public/dishes/` | free-licence stock (credits in `data/photo-credits.json`); fine to keep, better to replace |
| Testimonials (all 20) | `src/data/testimonials.ts` | invented sample reviews |
| Testimonial portraits | `public/people/*.jpg` | randomuser.me placeholder portraits |
| Story copy | `src/app/story/page.tsx` → `CHAPTERS` | tasteful boilerplate; replace with the owners' own words |
| Base Camp Hour (happy hour) | `src/app/bar/page.tsx` | Tue–Thu 4–6 PM, $2 off lagers, $10 momos |
| Private events capacity | `src/app/visit/page.tsx` → `FAQ` | "up to 60 people" |
| Parking note | `src/components/home/VisitSection.tsx`, `src/app/visit/page.tsx` | "street parking + lot behind the building" |
| Beer names | `data/menu.json` (bar) | Everest / Gorkha / Nepal Ice as placeholders for what's actually stocked |
