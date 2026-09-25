"use client";

import { useEffect, useRef, useState } from "react";
import Avatar from "./Avatar";
import type { Testimonial } from "@/lib/testimonials";

/* Client engine for the testimonial wall:
   - three columns drift vertically (middle reversed), JS-driven
   - liquid glass scrollbar on the right scrubs the whole wall
   - hover pauses, drag scrubs, release resumes from that point
   - mobile (<=640px) falls back to the native swipe carousel (CSS)   */

const BASE_DURATION = 46; /* seconds per loop */
const COL_SPEED = [1, 0.86, 0.93]; /* per-column multipliers */

function Card({ t, dup }: { t: Testimonial; dup?: boolean }) {
  return (
    <figure
      className={"testi-card glass" + (dup ? " dup" : "")}
      aria-hidden={dup || undefined}
    >
      <blockquote className="testi-quote">{t.quote}</blockquote>
      <figcaption className="testi-person">
        <Avatar image={t.image} name={t.name} />
        <span>
          <span className="testi-name">{t.name}</span>
          <span className="testi-role">{t.role}</span>
        </span>
      </figcaption>
    </figure>
  );
}

export default function WallMarquee({ items }: { items: Testimonial[] }) {
  const wallRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);

  /* 3 columns on desktop, 2 on small screens */
  const [colCount, setColCount] = useState(3);
  useEffect(() => {
    const mq = matchMedia("(max-width: 820px)");
    const apply = () => setColCount(mq.matches ? 2 : 3);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const cols: Testimonial[][] = Array.from({ length: colCount }, () => []);
  items.forEach((t, i) => cols[i % colCount].push(t));

  useEffect(() => {
    const wall = wallRef.current;
    const bar = barRef.current;
    const thumb = thumbRef.current;
    if (!wall || !bar || !thumb) return;

    const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const canHover = matchMedia("(hover:hover)").matches;
    if (reduceMotion) {
      bar.style.display = "none";
      return;
    }

    const colEls = Array.from(wall.querySelectorAll<HTMLElement>(".testi-col"));
    let halves = colEls.map(() => 0);
    const measure = () => {
      halves = colEls.map((c) => c.scrollHeight / 2);
    };
    measure();
    const ro = new ResizeObserver(measure);
    colEls.forEach((c) => ro.observe(c));
    addEventListener("load", measure);

    let p = 0; /* master progress, unbounded; frac(p) = loop position */
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
        c.style.transform = `translateY(${off}px)`;
      });
      const trackH = bar.clientHeight;
      const thumbH = thumb.clientHeight;
      thumb.style.top = frac(p) * (trackH - thumbH) + "px";
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    /* hover pause (desktop only) */
    const enter = () => { if (canHover) paused = true; };
    const leave = () => { paused = false; };
    wall.addEventListener("mouseenter", enter);
    wall.addEventListener("mouseleave", leave);

    /* glass scrollbar scrubbing */
    const scrubTo = (clientY: number) => {
      const r = bar.getBoundingClientRect();
      const thumbH = thumb.clientHeight;
      const usable = r.height - thumbH;
      const f = Math.min(1, Math.max(0, (clientY - r.top - thumbH / 2) / usable));
      p = Math.floor(p) + f;
    };
    const downH = (e: PointerEvent) => {
      dragging = true;
      bar.classList.add("dragging");
      bar.setPointerCapture(e.pointerId);
      scrubTo(e.clientY);
      e.preventDefault();
    };
    const moveH = (e: PointerEvent) => { if (dragging) scrubTo(e.clientY); };
    const upH = () => { dragging = false; bar.classList.remove("dragging"); };
    bar.addEventListener("pointerdown", downH);
    bar.addEventListener("pointermove", moveH);
    bar.addEventListener("pointerup", upH);
    bar.addEventListener("pointercancel", upH);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      removeEventListener("load", measure);
      wall.removeEventListener("mouseenter", enter);
      wall.removeEventListener("mouseleave", leave);
      bar.removeEventListener("pointerdown", downH);
      bar.removeEventListener("pointermove", moveH);
      bar.removeEventListener("pointerup", upH);
      bar.removeEventListener("pointercancel", upH);
    };
  }, [items.length, colCount]);

  return (
    <div className="twrap reveal">
      <div className="testi-wall" ref={wallRef}>
        {cols.map((col, ci) => (
          <div key={ci} className="testi-col">
            {col.map((t, i) => (
              <Card key={i} t={t} />
            ))}
            {col.map((t, i) => (
              <Card key={"d" + i} t={t} dup />
            ))}
          </div>
        ))}
      </div>
      <div className="tbar" ref={barRef} aria-hidden="true">
        <div className="tbar-thumb" ref={thumbRef} />
      </div>
    </div>
  );
}
