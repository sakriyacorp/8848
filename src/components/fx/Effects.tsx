"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/* Page-level effects (sakriya Effects.tsx, re-lit for 8848):
   - [data-tilt] cards tilt toward the pointer with a warm glare
   - --mx/--my/--mxp/--myp on <html>: the pointer (or finger) position for lamp-light layers
   - scroll velocity on <html> as --scroll-v, consumed by wind-driven pieces (prayer flags) */
export function Effects() {
  const pathname = usePathname();

  useEffect(() => {
    const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
    const root = document.documentElement;
    const cleanups: Array<() => void> = [];

    /* ---------- pointer → CSS vars ---------- */
    let praf = 0;
    let px = innerWidth / 2;
    let py = innerHeight * 0.4;
    const paint = () => {
      praf = 0;
      root.style.setProperty("--mx", `${px}px`);
      root.style.setProperty("--my", `${py}px`);
      root.style.setProperty("--mxp", (px / innerWidth).toFixed(3));
      root.style.setProperty("--myp", (py / innerHeight).toFixed(3));
    };
    const onPointer = (e: PointerEvent) => {
      px = e.clientX;
      py = e.clientY;
      if (!praf) praf = requestAnimationFrame(paint);
    };
    addEventListener("pointermove", onPointer, { passive: true });
    addEventListener("pointerdown", onPointer, { passive: true });
    paint();
    cleanups.push(() => {
      removeEventListener("pointermove", onPointer);
      removeEventListener("pointerdown", onPointer);
      cancelAnimationFrame(praf);
    });

    /* ---------- card tilt + glare ---------- */
    if (finePointer && !reduceMotion) {
      document.querySelectorAll<HTMLElement>("[data-tilt]").forEach((card) => {
        const strength = Number(card.dataset.tilt || 5);
        const move = (e: PointerEvent) => {
          const r = card.getBoundingClientRect();
          const x = (e.clientX - r.left) / r.width;
          const y = (e.clientY - r.top) / r.height;
          card.style.transform = `perspective(900px) translateY(-4px) rotateX(${(y - 0.5) * -strength}deg) rotateY(${(x - 0.5) * strength}deg)`;
          card.style.setProperty("--gx", `${x * 100}%`);
          card.style.setProperty("--gy", `${y * 100}%`);
        };
        const leave = () => {
          card.style.transform = "";
        };
        card.addEventListener("pointermove", move);
        card.addEventListener("pointerleave", leave);
        cleanups.push(() => {
          card.removeEventListener("pointermove", move);
          card.removeEventListener("pointerleave", leave);
        });
      });
    }

    /* ---------- scroll velocity ---------- */
    let last = scrollY;
    let lastT = performance.now();
    let v = 0;
    let vraf = 0;
    const decay = () => {
      v *= 0.92;
      root.style.setProperty("--scroll-v", v.toFixed(3));
      (window as unknown as { __scrollV: number }).__scrollV = v;
      vraf = Math.abs(v) > 0.002 ? requestAnimationFrame(decay) : 0;
    };
    const onScroll = () => {
      const now = performance.now();
      const dt = Math.max(16, now - lastT);
      const inst = (scrollY - last) / dt; // px per ms
      last = scrollY;
      lastT = now;
      v = Math.max(-4, Math.min(4, v * 0.6 + inst * 0.4));
      (window as unknown as { __scrollV: number }).__scrollV = v;
      if (!vraf) vraf = requestAnimationFrame(decay);
    };
    addEventListener("scroll", onScroll, { passive: true });
    cleanups.push(() => {
      removeEventListener("scroll", onScroll);
      cancelAnimationFrame(vraf);
    });

    return () => cleanups.forEach((fn) => fn());
  }, [pathname]);

  return null;
}
