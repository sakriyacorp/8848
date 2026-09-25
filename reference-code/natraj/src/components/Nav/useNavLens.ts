"use client";

import { useEffect, useRef, type RefObject } from "react";

/* sakriya Nav lens: a glass pill springs (k .16, damping .72) behind the hovered link
   and settles back on the active one. Instant under prefers-reduced-motion. */

type Box = { x: number; w: number };

export function useNavLens(
  linksRef: RefObject<HTMLElement | null>,
  lensRef: RefObject<HTMLElement | null>,
  activeId: string | null,
) {
  const state = useRef({ cur: { x: 0, w: 0 }, vel: { x: 0, w: 0 }, shown: false });

  useEffect(() => {
    const box = linksRef.current;
    const lens = lensRef.current;
    if (!box || !lens) return;

    const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const links = Array.from(box.querySelectorAll<HTMLAnchorElement>("a[data-link]"));
    const s = state.current;
    let tgt: Box | null = null;
    let raf: number | null = null;
    let alive = true;

    const measure = (a: HTMLElement): Box => {
      const r = a.getBoundingClientRect();
      const p = box.getBoundingClientRect();
      return { x: r.left - p.left, w: r.width };
    };
    const paint = () => {
      lens.style.transform = `translateX(${s.cur.x}px)`;
      lens.style.width = `${s.cur.w}px`;
    };
    const tick = () => {
      if (!tgt || !alive) return;
      const k = 0.16;
      const d = 0.72;
      s.vel.x = (s.vel.x + (tgt.x - s.cur.x) * k) * d;
      s.vel.w = (s.vel.w + (tgt.w - s.cur.w) * k) * d;
      s.cur.x += s.vel.x;
      s.cur.w += s.vel.w;
      paint();
      const energy = Math.abs(s.vel.x) + Math.abs(s.vel.w) + Math.abs(tgt.x - s.cur.x) + Math.abs(tgt.w - s.cur.w);
      if (energy > 0.4) raf = requestAnimationFrame(tick);
      else raf = null;
    };
    const moveTo = (a: HTMLElement, instant = false) => {
      const m = measure(a);
      if (reduceMotion || instant || !s.shown) {
        s.cur = { ...m };
        s.vel = { x: 0, w: 0 };
        paint();
      }
      tgt = m;
      lens.style.opacity = "1";
      s.shown = true;
      if (!raf && !reduceMotion) raf = requestAnimationFrame(tick);
    };
    const activeLink = () => links.find((a) => a.dataset.link === activeId) ?? null;
    const settle = () => {
      const act = activeLink();
      if (act) moveTo(act);
      else {
        lens.style.opacity = "0";
        s.shown = false;
      }
    };

    const enterHandlers = links.map((a) => {
      const h = () => moveTo(a);
      a.addEventListener("mouseenter", h);
      a.addEventListener("focus", h);
      return [a, h] as const;
    });
    box.addEventListener("mouseleave", settle);
    box.addEventListener("focusout", settle);
    const rszH = () => {
      const act = activeLink();
      if (act) moveTo(act, true);
    };
    addEventListener("resize", rszH);

    if (!box.matches(":hover")) settle();

    return () => {
      alive = false;
      if (raf) cancelAnimationFrame(raf);
      enterHandlers.forEach(([a, h]) => {
        a.removeEventListener("mouseenter", h);
        a.removeEventListener("focus", h);
      });
      box.removeEventListener("mouseleave", settle);
      box.removeEventListener("focusout", settle);
      removeEventListener("resize", rszH);
    };
  }, [linksRef, lensRef, activeId]);
}
