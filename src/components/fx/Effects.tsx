"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/* Page-level effects (sakriya Effects.tsx, re-lit for 8848):
   - [data-tilt] cards tilt toward the pointer with a warm glare
   - scroll velocity as window.__scrollV, read by the wind-driven pieces (prayer flags, snow,
     polaroids). Deliberately not a CSS variable on <html>: writing one every frame restyles the
     whole document.
   - off-screen sections get .anim-paused, which pauses every CSS animation inside them, so
     twinkling stars and flickering lamps three screens away cost nothing */
export function Effects() {
  const pathname = usePathname();

  useEffect(() => {
    const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
    const cleanups: Array<() => void> = [];

    /* ---------- pause CSS animations off-screen ---------- */
    const pauser = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.target.classList.toggle("anim-paused", !e.isIntersecting)),
      { rootMargin: "120px 0px" },
    );
    const watched = new WeakSet<Element>();
    const watch = () =>
      document.querySelectorAll("main section, footer, [data-pause-offscreen]").forEach((el) => {
        if (watched.has(el)) return;
        watched.add(el);
        pauser.observe(el);
      });
    watch();
    // lazily mounted scenes (globe, 3D sections) arrive later
    let mraf = 0;
    const mo = new MutationObserver(() => {
      if (!mraf) mraf = requestAnimationFrame(() => ((mraf = 0), watch()));
    });
    const main = document.querySelector("main");
    if (main) mo.observe(main, { childList: true, subtree: true });
    cleanups.push(() => {
      pauser.disconnect();
      mo.disconnect();
      cancelAnimationFrame(mraf);
      document.querySelectorAll(".anim-paused").forEach((el) => el.classList.remove("anim-paused"));
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
