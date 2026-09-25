"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/cn";
import { trackSection } from "@/lib/section-track";

/* Snow on a canvas. Flakes drift with a little wind and sway; the cursor or a finger pushes them
   aside. `blizzard` turns it into a sideways whiteout for the 404. Pauses off-screen; reduced
   motion shows a still scatter. */
type Props = {
  className?: string;
  density?: number;
  wind?: number;
  blizzard?: boolean;
  interactive?: boolean;
  color?: string;
  /** listen for window "8848:avalanche" events and dump a burst of snow */
  avalanche?: boolean;
};

type Flake = { x: number; y: number; r: number; vx: number; vy: number; ph: number; a: number };

export function Snow({ className, density = 1, wind = 0.3, blizzard = false, interactive = true, color = "242,233,207", avalanche = false }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const phone = innerWidth < 768;
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    let w = 0;
    let h = 0;
    let flakes: Flake[] = [];
    const pointer = { x: -9999, y: -9999, active: false };
    let gust = 0;

    const spawn = (top = false): Flake => {
      const r = Math.pow(Math.random(), 2.2) * (blizzard ? 3.2 : 2.6) + 0.5;
      return {
        x: Math.random() * w * (blizzard ? 1.4 : 1) - (blizzard ? w * 0.4 : 0),
        y: top ? -10 - Math.random() * h * 0.3 : Math.random() * h,
        r,
        vx: 0,
        vy: (blizzard ? 70 : 22) + r * (blizzard ? 40 : 14),
        ph: Math.random() * Math.PI * 2,
        a: 0.35 + Math.random() * 0.6,
      };
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = Math.max(1, rect.width);
      h = Math.max(1, rect.height);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      const n = Math.round(((w * h) / (blizzard ? 2200 : phone ? 16000 : 11000)) * density);
      flakes = Array.from({ length: Math.min(n, blizzard ? 900 : 260) }, () => spawn());
    };

    const draw = (dt: number, now: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      gust = blizzard ? 0.6 + 0.4 * Math.sin(now / 900) + 0.25 * Math.sin(now / 370) : 0.2 * Math.sin(now / 3000);
      const baseWind = (wind + gust) * (blizzard ? 260 : 28) + ((window as unknown as { __scrollV?: number }).__scrollV ?? 0) * 18;
      for (const f of flakes) {
        f.ph += dt * 1.3;
        let ax = 0;
        let ay = 0;
        if (pointer.active && interactive) {
          const dx = f.x - pointer.x;
          const dy = f.y - pointer.y;
          const d2 = dx * dx + dy * dy;
          const R = phone ? 90 : 120;
          if (d2 < R * R) {
            const d = Math.sqrt(d2) || 1;
            const push = (1 - d / R) * 900;
            ax += (dx / d) * push;
            ay += (dy / d) * push;
          }
        }
        f.vx += (baseWind + Math.sin(f.ph) * (blizzard ? 30 : 10) - f.vx) * Math.min(1, dt * 2) + ax * dt;
        f.x += f.vx * dt;
        f.y += (f.vy + ay * 0.15) * dt;
        if (f.y > h + 10 || f.x > w + 40 || f.x < -w * 0.5) Object.assign(f, spawn(true));
        ctx.globalAlpha = f.a;
        ctx.fillStyle = `rgb(${color})`;
        ctx.beginPath();
        if (blizzard && f.r > 1.5) {
          // motion-streaked flakes in the whiteout
          ctx.ellipse(f.x, f.y, f.r * 2.4, f.r * 0.8, Math.atan2(f.vy, f.vx), 0, Math.PI * 2);
        } else {
          ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        }
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    resize();
    let raf = 0;
    let last = performance.now();
    let visible = false;
    const loop = (now: number) => {
      raf = 0;
      if (!visible) return;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      draw(dt, now);
      raf = requestAnimationFrame(loop);
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !raf) {
        last = performance.now();
        if (reduce) draw(0, 0);
        else raf = requestAnimationFrame(loop);
      }
    });
    io.observe(canvas);
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const track = trackSection(canvas);
    const move = (e: PointerEvent) => {
      const r = track.rect();
      pointer.x = e.clientX - r.left;
      pointer.y = e.clientY - r.top;
      pointer.active = true;
    };
    const leave = () => {
      pointer.active = false;
    };
    if (interactive) {
      addEventListener("pointermove", move, { passive: true });
      addEventListener("pointerdown", move, { passive: true });
      addEventListener("pointerup", leave);
      document.addEventListener("mouseleave", leave);
    }
    const burst = () => {
      for (let i = 0; i < (phone ? 160 : 320); i++) {
        const f = spawn(true);
        f.vy *= 2.2;
        f.y = -Math.random() * h * 0.6;
        flakes.push(f);
      }
      setTimeout(() => {
        flakes.splice(0, Math.max(0, flakes.length - Math.round((w * h) / (phone ? 16000 : 11000))));
      }, 7000);
    };
    if (avalanche) addEventListener("8848:avalanche", burst);

    return () => {
      track.dispose();
      io.disconnect();
      ro.disconnect();
      cancelAnimationFrame(raf);
      removeEventListener("pointermove", move);
      removeEventListener("pointerdown", move);
      removeEventListener("pointerup", leave);
      document.removeEventListener("mouseleave", leave);
      removeEventListener("8848:avalanche", burst);
    };
  }, [density, wind, blizzard, interactive, color, avalanche]);

  return <canvas ref={ref} aria-hidden="true" className={cn("pointer-events-none absolute inset-0 h-full w-full", className)} />;
}
