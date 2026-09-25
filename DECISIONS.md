# Decisions log

Choices made without asking, per PROMPT.md §10. Newest at the bottom.

1. **Project lives in `OneDrive/Documents/8848website`** (the session's working folder). The kit's
   `assets/`, `reference-code/`, `PROMPT.md`, `.gitignore` and `.env.local` were copied in.
   `reference-code/` is committed (per its README) but excluded from tsconfig, ESLint and output tracing.
2. **No git remote is configured**, so commits are local only.
3. **Next 15.5.26 + React 19.2** (Natraj's stack, latest patch). `three`, `lenis` added; `potrace`,
   `sharp`, `playwright` as dev deps for tracing, icons/images and screenshots.
4. **Playwright drives the system Chrome/Edge** (`channel: "chrome"`) instead of downloading its own browser.
5. **Logo is traced, not redrawn.** `scripts/trace-logo.mjs` separates the flat logo into layers by
   projecting each pixel onto bg→ink lines, then potrace's each layer (peaks with low `alphaMax` for
   sharper facets). The arc is drawn as a stroke (semicircle + legs) fitted to the trace, so it can
   draw itself on.
6. **Fonts:** Cormorant (display), Cinzel (engraved caps), Jost (text/UI). None used by Natraj or sakriya.
7. **Checkout never asks for card numbers.** Payment is "pay at pickup" / "pay on delivery"; the page
   says plainly that it's a demo. Keeps the mock honest and avoids a fake credential form.
8. **Confirmation route is `/order/permit?id=…`** (search param, not a dynamic segment) so the whole
   site can be statically exported.
