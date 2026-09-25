"use client";

import { useEffect, useRef } from "react";

export default function CursorLens() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = ref.current;
    if (!cursor) return;
    const finePointer = matchMedia("(hover:hover) and (pointer:fine)").matches;
    const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!finePointer || reduceMotion) return;

    document.body.classList.add("lensed");
    let cx = innerWidth / 2, cy = innerHeight / 2, mx = cx, my = cy;
    let raf: number | null = null;
    let alive = true;

    function tick() {
      if (!alive) return;
      cx += (mx - cx) * 0.32;
      cy += (my - cy) * 0.32;
      cursor!.style.left = cx + "px";
      cursor!.style.top = cy + "px";
      if (Math.abs(mx - cx) + Math.abs(my - cy) > 0.3) {
        raf = requestAnimationFrame(tick);
      } else {
        raf = null;
      }
    }
    const moveH = (e: PointerEvent) => {
      mx = e.clientX;
      my = e.clientY;
      cursor!.style.opacity = "1";
      if (!raf) raf = requestAnimationFrame(tick);
      const t = e.target as HTMLElement;
      if (t.closest && t.closest("a,button,.card,.gallery,#wordmark,#globe")) {
        cursor!.classList.add("grow");
        cursor!.classList.remove("text");
      } else if (t.closest && t.closest("p,h1,h2,h3,li,span")) {
        cursor!.classList.add("text");
        cursor!.classList.remove("grow");
      } else {
        cursor!.classList.remove("grow", "text");
      }
    };
    const outH = () => { cursor!.style.opacity = "0"; };
    addEventListener("pointermove", moveH);
    document.addEventListener("mouseleave", outH);

    return () => {
      alive = false;
      if (raf) cancelAnimationFrame(raf);
      removeEventListener("pointermove", moveH);
      document.removeEventListener("mouseleave", outH);
      document.body.classList.remove("lensed");
    };
  }, []);

  return <div id="cursor" ref={ref} />;
}
