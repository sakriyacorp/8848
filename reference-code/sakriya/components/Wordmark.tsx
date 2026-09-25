"use client";

import { useEffect, useRef } from "react";

export default function Wordmark() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wm = ref.current;
    if (!wm) return;
    const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let px = 0, py = 0, rot = 0, vx = 0, vy = 0;
    let dragging = false, sx = 0, sy = 0;
    let wRaf: number | null = null;
    let alive = true;

    const render = () => {
      wm.style.transform = `translate(${px}px,${py}px) rotate(${rot}deg)`;
    };
    const spring = () => {
      wRaf = null;
      if (dragging || !alive) return;
      const k = 0.08, d = 0.86;
      vx = (vx + (0 - px) * k) * d;
      vy = (vy + (0 - py) * k) * d;
      px += vx;
      py += vy;
      rot = vx * 0.35;
      render();
      if (Math.abs(px) + Math.abs(py) + Math.abs(vx) + Math.abs(vy) > 0.4) {
        wRaf = requestAnimationFrame(spring);
      } else {
        px = 0; py = 0; rot = 0;
        render();
      }
    };
    const downH = (e: PointerEvent) => {
      dragging = true;
      sx = e.clientX - px;
      sy = e.clientY - py;
      wm.setPointerCapture(e.pointerId);
      if (wRaf) { cancelAnimationFrame(wRaf); wRaf = null; }
    };
    const moveH = (e: PointerEvent) => {
      if (!dragging) return;
      const nx = e.clientX - sx, ny = e.clientY - sy;
      vx = nx - px;
      vy = ny - py;
      px = Math.max(-160, Math.min(160, nx));
      py = Math.max(-90, Math.min(90, ny));
      rot = Math.max(-8, Math.min(8, vx * 0.4));
      render();
    };
    const release = () => {
      if (!dragging) return;
      dragging = false;
      if (!reduceMotion) {
        wRaf = requestAnimationFrame(spring);
      } else {
        px = 0; py = 0; rot = 0;
        render();
      }
    };
    wm.addEventListener("pointerdown", downH);
    wm.addEventListener("pointermove", moveH);
    wm.addEventListener("pointerup", release);
    wm.addEventListener("pointercancel", release);
    return () => {
      alive = false;
      if (wRaf) cancelAnimationFrame(wRaf);
      wm.removeEventListener("pointerdown", downH);
      wm.removeEventListener("pointermove", moveH);
      wm.removeEventListener("pointerup", release);
      wm.removeEventListener("pointercancel", release);
    };
  }, []);

  return (
    <div id="wordmark" className="glass" ref={ref}>
      S<span className="a">A</span>KRIY<span className="a">A</span>
    </div>
  );
}
