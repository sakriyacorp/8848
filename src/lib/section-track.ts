/* Where a section sits on the page, without asking the browser every frame.

   Reading getBoundingClientRect() inside a render loop forces a synchronous layout whenever
   anything wrote to the DOM since the last read — on a page as tall as the home page that is
   most of the frame budget. This measures once (and again whenever the page or the element
   resizes, plus a slow safety re-measure), then answers from scrollY, which is free. */

export type SectionTrack = {
  /** 0 → 1 through a pinned section (top reaches viewport top → bottom reaches viewport bottom) */
  progress(): number;
  /** the element's rect in viewport coordinates, from the cached page offsets */
  rect(): { left: number; top: number; width: number; height: number; bottom: number };
  dispose(): void;
};

export function trackSection(el: HTMLElement): SectionTrack {
  let top = 0;
  let left = 0;
  let width = 0;
  let height = 0;
  const measure = () => {
    const r = el.getBoundingClientRect();
    top = r.top + scrollY;
    left = r.left + scrollX;
    width = r.width;
    height = r.height;
  };
  measure();
  const ro = new ResizeObserver(measure);
  ro.observe(el);
  ro.observe(document.body);
  addEventListener("resize", measure);
  const iv = setInterval(measure, 2000);
  return {
    progress() {
      const span = height - innerHeight;
      return span > 0 ? Math.min(1, Math.max(0, (scrollY - top) / span)) : 0;
    },
    rect() {
      const t = top - scrollY;
      return { left: left - scrollX, top: t, width, height, bottom: t + height };
    },
    dispose() {
      ro.disconnect();
      removeEventListener("resize", measure);
      clearInterval(iv);
    },
  };
}
