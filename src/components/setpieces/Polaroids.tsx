"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

/* Polaroids clipped to a string like prayer flags. Each one is a little pendulum: it sways when
   you scroll (harder the faster you go), swings away from a passing cursor, and flips over when
   tapped to show what's written on the back. The string scrolls sideways on narrow screens.
   PLACEHOLDER: these are dish photos with invented captions — swap in the family's own. */

type Snap = { img: string; caption: string; back: string; date: string };

const SNAPS: Snap[] = [
  { img: "p-jhol-momo", caption: "Jhol momo, Kathmandu", back: "The bowl that started all of this. We went back three nights running.", date: "Asan Tole · 2014" },
  { img: "p-thukpa", caption: "Thukpa weather, Namche", back: "Snow on the prayer flags outside, noodles and steam inside.", date: "3,440 m · Nov" },
  { img: "p-dal-bhat", caption: "Teahouse dal bhat", back: "Seconds were compulsory. Thirds were encouraged.", date: "Dingboche · 4,410 m" },
  { img: "chai", caption: "Chiya at every stop", back: "Sweet, milky, a little ginger. Our recipe is the lodge owner's, mostly.", date: "Tengboche" },
  { img: "p-sekuwa", caption: "Sekuwa smoke", back: "Charcoal, timmur pepper, a paper plate. Perfect.", date: "Dharan · 2016" },
  { img: "p-momo-platter", caption: "Family meal, before service", back: "Every new cook's first job: pleat a hundred of these.", date: "Reservoir St." },
  { img: "p-old-fashioned", caption: "Opening night", back: "We ran out of ice at nine. Nobody minded.", date: "Harrisonburg" },
];

export function Polaroids() {
  const wrap = useRef<HTMLDivElement>(null);
  const cards = useRef<(HTMLDivElement | null)[]>([]);
  const [flipped, setFlipped] = useState<number | null>(null);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const phys = SNAPS.map((_, i) => ({ a: (i % 2 ? 1 : -1) * 2.5, v: 0, rest: (i % 3) - 1 }));
    let raf = 0;
    let visible = false;
    let last = performance.now();
    const pointer = { x: -1e4, y: -1e4, vx: 0 };
    const frame = (now: number) => {
      raf = 0;
      if (!visible) return;
      const dt = Math.min(0.033, (now - last) / 1000);
      last = now;
      const sv = (window as unknown as { __scrollV?: number }).__scrollV ?? 0;
      const t = now / 1000;
      phys.forEach((p, i) => {
        const c = cards.current[i];
        if (!c) return;
        const r = c.getBoundingClientRect();
        let f = -28 * (p.a - p.rest) - 2.2 * p.v;
        f += sv * 55 * (i % 2 ? 1 : 0.8) + Math.sin(t * 0.9 + i * 1.7) * 3;
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        if (Math.abs(pointer.x - cx) < r.width * 0.7 && Math.abs(pointer.y - cy) < r.height * 0.7) f += pointer.vx * 40;
        p.v += f * dt;
        p.a += p.v * dt;
        p.a = Math.max(-18, Math.min(18, p.a));
        c.style.setProperty("--swing", `${p.a.toFixed(2)}deg`);
      });
      pointer.vx *= 0.85;
      raf = requestAnimationFrame(frame);
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting && !reduce;
      if (visible && !raf) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    });
    io.observe(el);
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      pointer.vx = Math.max(-3, Math.min(3, (e.clientX - pointer.x) * 0.05));
      pointer.x = e.clientX;
      pointer.y = e.clientY;
    };
    addEventListener("pointermove", move, { passive: true });
    if (reduce) phys.forEach((p, i) => cards.current[i]?.style.setProperty("--swing", `${p.rest}deg`));
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      removeEventListener("pointermove", move);
    };
  }, []);

  return (
    <div ref={wrap} className="polaroids relative -mx-[var(--gutter)] overflow-x-auto overflow-y-hidden pb-10 pt-4 [scrollbar-width:none] md:mx-0 md:overflow-visible">
      <div className="relative mx-auto flex w-max gap-5 px-[var(--gutter)] md:w-full md:justify-between md:gap-3 md:px-0">
        <svg aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-[14px] h-10 w-full overflow-visible" viewBox="0 0 100 10" preserveAspectRatio="none">
          <path d="M-2 1 Q50 12 102 1" fill="none" stroke="rgba(182,158,112,.55)" strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
        </svg>
        {SNAPS.map((s, i) => {
          const sag = Math.sin(((i + 0.5) / SNAPS.length) * Math.PI) * 22;
          return (
            <div key={s.img} ref={(n) => void (cards.current[i] = n)} className="polaroid-hang relative shrink-0" style={{ marginTop: sag }}>
              <span aria-hidden="true" className="polaroid-pin" />
              <button
                type="button"
                aria-pressed={flipped === i}
                aria-label={`${s.caption}. ${flipped === i ? "Showing the back." : "Tap to read the back."}`}
                onClick={() => setFlipped((f) => (f === i ? null : i))}
                className={cn("polaroid", flipped === i && "is-flipped")}
              >
                <span className="polaroid-face polaroid-front">
                  <img src={`/dishes/${s.img}.jpg`} alt="" loading="lazy" className="dish-photo aspect-square w-full object-cover" />
                  <span className="polaroid-caption">{s.caption}</span>
                </span>
                <span className="polaroid-face polaroid-back">
                  <span className="polaroid-note">{s.back}</span>
                  <span className="caps mt-auto text-[9px] text-bronze">{s.date}</span>
                </span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
