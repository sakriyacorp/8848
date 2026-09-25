"use client";

import { useEffect, useRef, useState } from "react";
import type { Review } from "@/lib/reviews";
import { ReviewCard } from "@/components/Reviews/ReviewCard";

/* Ported from sakriya WallMarquee: three columns drift vertically (middle reversed),
   rAF-driven with a clamped dt; a liquid-glass scrollbar on the right scrubs the wall;
   hover pauses; each column is duplicated (aria-hidden) for a seamless loop. Below
   640px the wall gives way to a native snap carousel. */

const BASE_DURATION = 46;
const COL_SPEED = [1, 0.86, 0.93];

function distribute(items: Review[], colCount: number, minPerCol = 3): Review[][] {
  const cols: Review[][] = Array.from({ length: colCount }, () => []);
  items.forEach((r, n) => cols[n % colCount].push(r));
  if (items.length > 0) {
    cols.forEach((col, c) => {
      let k = c + 1;
      while (col.length < minPerCol) col.push(items[k++ % items.length]);
    });
  }
  return cols;
}

export function ReviewWall({ reviews }: { reviews: Review[] }) {
  const wallRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const [colCount, setColCount] = useState(3);

  useEffect(() => {
    const mq = matchMedia("(max-width: 1023px)");
    const apply = () => setColCount(mq.matches ? 2 : 3);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const cols = distribute(reviews, colCount);

  useEffect(() => {
    const wall = wallRef.current;
    const bar = barRef.current;
    const thumb = thumbRef.current;
    if (!wall || !bar || !thumb) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const canHover = matchMedia("(hover: hover)").matches;

    const colEls = Array.from(wall.querySelectorAll<HTMLElement>(".review-col"));
    let halves = colEls.map(() => 0);
    const measure = () => {
      halves = colEls.map((c) => c.scrollHeight / 2);
    };
    measure();
    const ro = new ResizeObserver(measure);
    colEls.forEach((c) => ro.observe(c));

    let p = 0;
    let paused = false;
    let dragging = false;
    let last = performance.now();
    let raf = 0;
    let alive = true;
    const frac = (x: number) => ((x % 1) + 1) % 1;

    const frame = (now: number) => {
      if (!alive) return;
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      if (!paused && !dragging) p += dt / BASE_DURATION;
      colEls.forEach((c, i) => {
        const h = halves[i];
        if (!h) return;
        const f = frac(p * (COL_SPEED[i] ?? 0.9));
        const off = i === 1 ? f * h - h : -f * h;
        c.style.transform = `translate3d(0, ${off}px, 0)`;
      });
      const usable = bar.clientHeight - thumb.clientHeight;
      thumb.style.top = `${frac(p) * usable}px`;
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    const enter = () => {
      if (canHover) paused = true;
    };
    const leave = () => {
      paused = false;
    };
    wall.addEventListener("mouseenter", enter);
    wall.addEventListener("mouseleave", leave);

    const scrubTo = (clientY: number) => {
      const r = bar.getBoundingClientRect();
      const thumbH = thumb.clientHeight;
      const f = Math.min(1, Math.max(0, (clientY - r.top - thumbH / 2) / (r.height - thumbH)));
      p = Math.floor(p) + f;
    };
    const downH = (e: PointerEvent) => {
      dragging = true;
      bar.classList.add("dragging");
      bar.setPointerCapture(e.pointerId);
      scrubTo(e.clientY);
      e.preventDefault();
    };
    const moveH = (e: PointerEvent) => {
      if (dragging) scrubTo(e.clientY);
    };
    const upH = () => {
      dragging = false;
      bar.classList.remove("dragging");
    };
    bar.addEventListener("pointerdown", downH);
    bar.addEventListener("pointermove", moveH);
    bar.addEventListener("pointerup", upH);
    bar.addEventListener("pointercancel", upH);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      wall.removeEventListener("mouseenter", enter);
      wall.removeEventListener("mouseleave", leave);
      bar.removeEventListener("pointerdown", downH);
      bar.removeEventListener("pointermove", moveH);
      bar.removeEventListener("pointerup", upH);
      bar.removeEventListener("pointercancel", upH);
      colEls.forEach((c) => {
        c.style.transform = "";
      });
    };
  }, [reviews.length, colCount]);

  return (
    <>
      <div className="no-scrollbar -mx-5 mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 sm:hidden">
        {reviews.map((r) => (
          <div key={r.id} className="w-[84vw] max-w-[380px] shrink-0 snap-center">
            <ReviewCard review={r} className="h-full" />
          </div>
        ))}
      </div>

      <div className="relative mt-10 hidden sm:block">
        <div ref={wallRef} className="review-wall" style={{ gridTemplateColumns: `repeat(${colCount}, minmax(0, 1fr))` }}>
          {cols.map((col, ci) => (
            <div key={ci} className="review-col">
              {col.map((r, i) => (
                <ReviewCard key={`${r.id}-${i}`} review={r} />
              ))}
              {col.map((r, i) => (
                <ReviewCard key={`dup-${r.id}-${i}`} review={r} dup />
              ))}
            </div>
          ))}
        </div>
        <div ref={barRef} className="tbar" aria-hidden="true">
          <div ref={thumbRef} className="tbar-thumb" />
        </div>
      </div>
    </>
  );
}
