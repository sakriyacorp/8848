# sakriya.net

Personal operator portfolio — Next.js 14, App Router, TypeScript.

## Editing rules (for humans and AIs)

- **Add/edit articles:** `content/longform/*.md` only. See HOW-TO-ADD-ARTICLES.md.
- **Text changes:** `app/page.tsx` (homepage copy) — edit text between tags only.
- **Colors/design tokens:** `:root` block at the top of `app/globals.css`.
- **Photos:** `public/images/` + the set lists in `lib/photos.ts`.
- **Testimonials:** managed in a Google Sheet — see SHEET-SETUP-GUIDE.md (setup) and HOW-TO-ADD-TESTIMONIALS.md (daily use). Sheet URL lives in `lib/config.ts`. People photos go in `public/images/people/`. `lib/testimonials.ts` holds fallback samples only.
- **DO NOT modify** `components/` (Globe, Gallery, Nav, Effects, CursorLens,
  Wordmark) unless you know exactly what you're doing — this is where all the
  animation/3D/refraction logic lives.

## Local dev

npm install && npm run dev
