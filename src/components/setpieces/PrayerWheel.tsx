"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { addToPack } from "@/lib/add-to-pack";
import { formatPrice } from "@/lib/format";
import { getDishImage } from "@/lib/dish-path";
import { useSound } from "@/lib/sound";
import { bowl, tick as click } from "@/lib/audio";
import { sfx } from "@/lib/sound";

/* The oracle: a brass mani wheel engraved with ॐ मणि पद्मे हूँ. Swipe it (it only turns
   clockwise, as prayer wheels do) or press Spin. The counterweight swings out on its chain as it
   speeds up; where it comes to rest picks tonight's dish, with a fortune to go with it. */

export type OracleDish = { id: string; name: string; price: number; img: string; available: boolean; spiceable: boolean; spice: number; fortune: string };

const MANTRA = "ॐ मणि पद्मे हूँ";
const TAU = Math.PI * 2;

export function PrayerWheel({ dishes }: { dishes: OracleDish[] }) {
  const drum = useRef<HTMLDivElement>(null);
  const band = useRef<HTMLDivElement>(null);
  const weight = useRef<HTMLDivElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const st = useRef({ angle: 0, v: 0, spun: false, raf: 0, last: 0, dragging: false, px: 0, pt: 0, sector: 0, lastClick: 0 });
  const [result, setResult] = useState<number | null>(null);
  const [spinning, setSpinning] = useState(false);

  useEffect(() => {
    const s = st.current;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const bandW = () => (band.current ? band.current.scrollWidth / 2 : 1);
    const render = () => {
      const r = (drum.current?.clientWidth ?? 160) / 2;
      const x = -((s.angle * r) % bandW());
      if (band.current) band.current.style.transform = `translate3d(${x}px,0,0)`;
      if (weight.current) {
        // the counterweight orbits the axis; faster = swung further out
        const reach = 0.55 + Math.min(1, s.v / 9) * 0.45;
        const a = s.angle * 1 + 0.6;
        const wx = Math.sin(a) * r * 1.25 * reach;
        const front = Math.cos(a) > 0;
        weight.current.style.transform = `translate3d(${wx}px, ${-Math.min(1, s.v / 9) * 18}px, 0) scale(${front ? 1 : 0.86})`;
        weight.current.style.zIndex = front ? "3" : "0";
        weight.current.style.opacity = front ? "1" : "0.7";
      }
    };
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - s.last) / 1000);
      s.last = now;
      if (!s.dragging) s.v *= Math.exp(-dt * 0.9);
      s.angle += s.v * dt;
      // a detent per dish: clicks (and a buzz on phones) as each one passes, once it slows
      const sector = Math.floor(s.angle / (TAU / dishes.length));
      if (sector !== s.sector) {
        s.sector = sector;
        if (s.v < 5.5 && now - s.lastClick > 70) {
          s.lastClick = now;
          sfx(() => click(0.85 + (sector % 2) * 0.1));
          try {
            navigator.vibrate?.(6);
          } catch {}
        }
      }
      render();
      if (!s.dragging && s.v < 0.06) {
        s.v = 0;
        s.raf = 0;
        setSpinning(false);
        if (s.spun) {
          s.spun = false;
          const idx = Math.floor((((s.angle % TAU) + TAU) % TAU) / (TAU / dishes.length));
          setResult(idx);
          if (useSound.getState().on) bowl({ freq: 880, gain: 0.08, dur: 2.6 });
          try {
            navigator.vibrate?.(18);
          } catch {}
        }
        return;
      }
      s.raf = requestAnimationFrame(tick);
    };
    const start = () => {
      if (!s.raf) {
        s.last = performance.now();
        s.raf = requestAnimationFrame(tick);
      }
    };
    (drum.current as unknown as { __spin?: (v: number) => void }).__spin = (v: number) => {
      if (reduce) {
        s.angle += v * 1.3;
        s.spun = true;
        s.v = 0.07;
      } else {
        s.v = Math.max(s.v, v);
        s.spun = true;
      }
      setSpinning(true);
      setResult(null);
      start();
    };
    render();
    return () => cancelAnimationFrame(s.raf);
  }, [dishes.length]);

  const spin = (v = 7 + Math.random() * 5) => (drum.current as unknown as { __spin?: (v: number) => void })?.__spin?.(v);

  const onDown = (e: React.PointerEvent) => {
    const s = st.current;
    s.dragging = true;
    s.px = e.clientX;
    s.pt = e.timeStamp;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    const s = st.current;
    if (!s.dragging) return;
    const dx = e.clientX - s.px;
    const dt = Math.max(1, e.timeStamp - s.pt) / 1000;
    s.px = e.clientX;
    s.pt = e.timeStamp;
    // clockwise from above = the front face moves right-to-left; only that direction turns it
    if (dx < 0) {
      const r = (drum.current?.clientWidth ?? 160) / 2;
      const v = -dx / r / dt;
      spin(Math.min(16, v));
    }
  };
  const onUp = () => {
    st.current.dragging = false;
  };

  const dish = result !== null ? dishes[result] : null;

  useEffect(() => {
    if (dish && card.current && innerWidth < 1024) card.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [dish]);

  return (
    <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-14">
      <div className="prayer-wheel relative mx-auto flex h-[400px] w-[260px] select-none flex-col items-center pt-6">
        <div className="pw-finial" aria-hidden="true" />
        <div className="pw-cap pw-cap-top" aria-hidden="true" />
        <div
          ref={drum}
          role="button"
          tabIndex={0}
          aria-label="Prayer wheel. Swipe left or press Enter to spin."
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              spin();
            }
          }}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          className="pw-drum relative z-[2] h-[210px] w-[160px] cursor-grab touch-pan-y overflow-hidden active:cursor-grabbing"
        >
          <div className="pw-rings" aria-hidden="true" />
          <div ref={band} className="pw-band absolute left-0 top-1/2 flex -translate-y-1/2 whitespace-nowrap will-change-transform" aria-hidden="true">
            {Array.from({ length: 2 }, (_, k) => (
              <span key={k} lang="ne" className="np flex shrink-0 gap-6 pr-6 text-[30px] text-[#4a331f]">
                {Array.from({ length: 3 }, (_, i) => (
                  <span key={i}>{MANTRA}</span>
                ))}
              </span>
            ))}
          </div>
          <div className="pw-shade" aria-hidden="true" />
        </div>
        <div className="pw-cap pw-cap-bottom" aria-hidden="true" />
        <div ref={weight} className="pw-weight" aria-hidden="true">
          <i />
          <b />
        </div>
        <div className="pw-handle" aria-hidden="true" />
      </div>

      <div ref={card}>
        {dish ? (
          <div key={dish.id} className="pw-result glass rounded-[26px] p-5 [--glass-base:rgba(20,14,10,0.6)] md:p-7">
            <p className="caps text-[10.5px] text-brass">The wheel says</p>
            <p className="display mt-2 text-[clamp(1.6rem,3.6vw,2.3rem)] italic leading-tight text-brass-hi">“{dish.fortune}”</p>
            <div className="mt-5 flex items-center gap-4">
              {dish.available && (
                <img src={getDishImage(dish)} alt="" className="dish-photo h-20 w-20 shrink-0 rounded-2xl object-cover" loading="lazy" />
              )}
              <div className="min-w-0">
                <p className="display text-[26px] leading-tight text-text">{dish.name}</p>
                <p className="num text-[14px] text-muted">{formatPrice(dish.price)}</p>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={(e) => addToPack(dish.id, dish.name, { spice: dish.spiceable ? (dish.spice >= 3 ? "Hot" : "Medium") : undefined }, e.currentTarget.closest<HTMLElement>(".pw-result"), dish.available ? getDishImage(dish) : null)}
                className="btn btn-brass px-6 py-3 text-[14.5px]"
              >
                Pack it
              </button>
              <button type="button" onClick={() => spin()} className="btn btn-ghost px-5 py-3 text-[14.5px]">
                Spin again
              </button>
            </div>
          </div>
        ) : (
          <div>
            <p className="max-w-[40ch] text-[16.5px] leading-relaxed text-text/80">
              Every turn of a mani wheel sends its prayer out into the world. Ours also chooses dinner. Give it a swipe to the left, or:
            </p>
            <button type="button" onClick={() => spin()} disabled={spinning} className={cn("btn btn-brass mt-6 px-6 py-3.5 text-[15px] disabled:opacity-60")}>
              {spinning ? "Turning…" : "Spin the wheel"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
