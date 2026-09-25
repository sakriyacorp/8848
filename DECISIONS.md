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

## 9. Performance: no layout reads in render loops, no root CSS-var writes, pause off-screen CSS animation
Profiling home at 390px with 4× CPU throttle showed ~70% of main-thread time in forced style/layout. Three causes, three rules:
- **Render loops never ask the DOM where things are.** `lib/section-track.ts` measures a section's page offsets once (and on resize) and answers progress/rects from `scrollY`. Used by the hero, ascent, globe, footer horizon, snow, lamp light and prayer flags. Canvas sizes are cached in `size()`; the ascent's leader-line card box is re-measured only for a few frames after the camp changes. DOM text in the altimeter is written only when it changes.
- **Nothing writes CSS variables on `<html>` per frame.** The old pointer (`--mx/--my`) and scroll-velocity (`--scroll-v`) variables had no consumers and restyled the whole document every frame; scroll velocity now lives on `window.__scrollV` only.
- **Off-screen sections pause their CSS animations.** `Effects.tsx` observes every `main section` and the footer and adds `.anim-paused` (→ `animation-play-state: paused`) when they leave the viewport. Twinkle keyframes for HTML stars use plain numbers (no `var()`) so the compositor can run them.
Result at 390px/4× throttle (software rendering): menu 100–200 ms → 8–32 ms per frame, postcards 400 → 26 ms, story/visit mostly < 40 ms. Remaining home cost is software-rendered WebGL/clip-path, which a real GPU absorbs.

## 10. Final: Lenis removed, contrast floor, three.js plaque waits for idle
- Lenis was allowed but never used; native scroll plays better with the pinned 3D scenes, sticky stages and `overflow-x: clip`, so the dependency is gone.
- Contrast: main tokens are 6–15:1 on their backgrounds. Translucent variants below 4.5:1 were raised (bar hint, Devanagari in menu headings, camp counts, checkout hints, the static climb's upcoming camps, input placeholders).
- The hero's three.js plaque mounts on `requestIdleCallback` (1.8 s timeout) so three.js never competes with first paint; the CSS plaque is already on screen and the GL face cross-fades over it.
