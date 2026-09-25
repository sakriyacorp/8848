"use client";

import { useEffect, useRef } from "react";
import { useUI, type Flight } from "@/lib/ui";

/* Add-to-pack flight: a copy of the dish photo lifts off the card, arcs up over the page and
   drops into the trekking-pack button, shrinking and spinning a little; the pack bounces when
   it lands (Nav listens to packBump). */
export function FlightLayer() {
  const flights = useUI((s) => s.flights);
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[85]">
      {flights.map((f) => (
        <FlightItem key={f.id} f={f} />
      ))}
    </div>
  );
}

function FlightItem({ f }: { f: Flight }) {
  const ref = useRef<HTMLDivElement>(null);
  const land = useUI((s) => s.land);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const target = document.querySelector<HTMLElement>("[data-pack]")?.getBoundingClientRect();
    const size = Math.min(96, Math.max(56, f.from.w * 0.5));
    const sx = f.from.x + f.from.w / 2;
    const sy = f.from.y + f.from.h / 2;
    const tx = target ? target.left + target.width / 2 : innerWidth - 40;
    const ty = target ? target.top + target.height / 2 : 30;
    // control point: up and over, biased toward the target
    const cx = sx + (tx - sx) * 0.35;
    const cy = Math.min(sy, ty) - Math.max(90, Math.abs(tx - sx) * 0.28);
    const frames: Keyframe[] = [];
    const N = 24;
    for (let i = 0; i <= N; i++) {
      const t = i / N;
      const x = (1 - t) * (1 - t) * sx + 2 * (1 - t) * t * cx + t * t * tx;
      const y = (1 - t) * (1 - t) * sy + 2 * (1 - t) * t * cy + t * t * ty;
      const s = 1 - t * 0.78;
      frames.push({
        transform: `translate(${x - size / 2}px, ${y - size / 2}px) scale(${s}) rotate(${t * 200}deg)`,
        opacity: t > 0.92 ? (1 - t) / 0.08 : 1,
        offset: t,
      });
    }
    const anim = el.animate(frames, { duration: 820, easing: "cubic-bezier(.45,.05,.4,1)", fill: "forwards" });
    anim.onfinish = () => land(f.id);
    return () => anim.cancel();
  }, [f, land]);

  return (
    <div
      ref={ref}
      className="absolute left-0 top-0 h-[72px] w-[72px] overflow-hidden rounded-full border-2 border-foil shadow-[0_10px_30px_rgba(0,0,0,.55),0_0_24px_rgba(220,191,123,.45)]"
      style={{ transform: `translate(${f.from.x}px, ${f.from.y}px)` }}
    >
      {f.src ? (
        <img src={f.src} alt="" className="h-full w-full object-cover" />
      ) : (
        <div className="h-full w-full bg-[radial-gradient(circle_at_35%_30%,#f7ecce,#b69e70_60%,#7d623a)]" />
      )}
    </div>
  );
}
