"use client";

import { useEffect, useRef } from "react";

/* sakriya CursorLens, refined for this site: glass arrow trails the pointer (lerp 0.32),
   grows over interactive elements, becomes an I-beam over text, and yields to the
   native caret on form fields. Off on touch devices and under prefers-reduced-motion. */

const GROW = "a, button, [role='button'], label, summary, [data-cursor='grow']";
const TEXT = "p, h1, h2, h3, h4, li, blockquote, dd, dt, figcaption, td, th, address";
const HIDE = "input, textarea, select";

export function CustomCursor() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = ref.current;
    if (!cursor) return;
    const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!finePointer || reduceMotion) return;

    document.documentElement.dataset.cursor = "custom";
    let cx = innerWidth / 2;
    let cy = innerHeight / 2;
    let mx = cx;
    let my = cy;
    let raf: number | null = null;
    let alive = true;

    const tick = () => {
      if (!alive) return;
      cx += (mx - cx) * 0.32;
      cy += (my - cy) * 0.32;
      cursor.style.left = `${cx}px`;
      cursor.style.top = `${cy}px`;
      if (Math.abs(mx - cx) + Math.abs(my - cy) > 0.3) {
        raf = requestAnimationFrame(tick);
      } else {
        raf = null;
      }
    };
    const moveH = (e: PointerEvent) => {
      mx = e.clientX;
      my = e.clientY;
      const t = e.target as Element | null;
      const over = (selector: string) => !!t?.closest?.(selector);
      const grow = over(GROW);
      cursor.style.opacity = over(HIDE) ? "0" : "1";
      cursor.classList.toggle("grow", grow);
      cursor.classList.toggle("text", !grow && over(TEXT));
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const outH = () => {
      cursor.style.opacity = "0";
    };

    addEventListener("pointermove", moveH, { passive: true });
    document.addEventListener("mouseleave", outH);

    return () => {
      alive = false;
      if (raf) cancelAnimationFrame(raf);
      removeEventListener("pointermove", moveH);
      document.removeEventListener("mouseleave", outH);
      delete document.documentElement.dataset.cursor;
    };
  }, []);

  return <div id="cursor" ref={ref} aria-hidden="true" />;
}
