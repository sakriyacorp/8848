"use client";

import { useEffect, useMemo, useRef } from "react";
import { trackSection } from "@/lib/section-track";

/* Lamp-light spotlight: a warm glow follows the cursor (or finger) across a dark section and
   reveals topographic contour lines "engraved" into the walnut — invisible everywhere else. On
   touch devices with no finger down, the lamp drifts slowly on its own. */
export function LampLight({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const contours = useMemo(() => {
    // concentric, wobbly rings around two summits: a topo map of a massif
    const rings: string[] = [];
    const peaks = [
      { cx: 0.32, cy: 0.42, n: 14 },
      { cx: 0.74, cy: 0.62, n: 11 },
    ];
    for (const p of peaks) {
      for (let i = 1; i <= p.n; i++) {
        const r = i * 46;
        const pts: string[] = [];
        for (let a = 0; a <= 64; a++) {
          const t = (a / 64) * Math.PI * 2;
          const wob = 1 + 0.08 * Math.sin(3 * t + i) + 0.05 * Math.cos(5 * t - i * 0.7);
          const x = p.cx * 1600 + Math.cos(t) * r * wob * 1.25;
          const y = p.cy * 1000 + Math.sin(t) * r * wob * 0.8;
          pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
        }
        rings.push(pts.join(" "));
      }
    }
    return rings;
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let tx = 0.5;
    let ty = 0.4;
    let x = tx;
    let y = ty;
    let lastInput = 0;
    let visible = false;
    const t0 = performance.now();
    const tick = (now: number) => {
      raf = 0;
      if (!visible) return;
      if (now - lastInput > 2500 && !reduce) {
        const t = (now - t0) / 1000;
        tx = 0.5 + Math.sin(t * 0.21) * 0.32;
        ty = 0.45 + Math.cos(t * 0.17) * 0.25;
      }
      x += (tx - x) * 0.08;
      y += (ty - y) * 0.08;
      el.style.setProperty("--lx", `${(x * 100).toFixed(2)}%`);
      el.style.setProperty("--ly", `${(y * 100).toFixed(2)}%`);
      raf = requestAnimationFrame(tick);
    };
    const onMove = (e: PointerEvent) => {
      const r = track.rect();
      if (e.clientY < r.top || e.clientY > r.bottom) return;
      tx = (e.clientX - r.left) / r.width;
      ty = (e.clientY - r.top) / r.height;
      lastInput = performance.now();
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !raf) raf = requestAnimationFrame(tick);
    });
    io.observe(el);
    const track = trackSection(el);
    addEventListener("pointermove", onMove, { passive: true });
    addEventListener("pointerdown", onMove, { passive: true });
    return () => {
      track.dispose();
      io.disconnect();
      cancelAnimationFrame(raf);
      removeEventListener("pointermove", onMove);
      removeEventListener("pointerdown", onMove);
    };
  }, []);

  return (
    <div ref={ref} aria-hidden="true" className={`lamp-light pointer-events-none absolute inset-0 ${className ?? ""}`}>
      <div className="lamp-light-glow absolute inset-0" />
      <svg className="lamp-light-lines absolute inset-0 h-full w-full" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice">
        <g fill="none" stroke="#dcbf7b" strokeWidth="1.1">
          {contours.map((pts, i) => (
            <polygon key={i} points={pts} opacity={i % 5 === 0 ? 0.9 : 0.5} />
          ))}
        </g>
      </svg>
    </div>
  );
}
