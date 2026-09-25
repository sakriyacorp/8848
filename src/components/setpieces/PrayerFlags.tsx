"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/cn";

/* Lung-ta prayer flags on a sagging string. The string is an analytic sag curve that sways; every
   flag is verlet cloth — a small grid of particles sewn to the string — blown by a wind that rises with how fast you scroll (and gusts
   on its own). Pushing a cursor or finger through them makes them flap. Colours are the five
   traditional ones, muted to sit in a brass-and-walnut room. Pauses off-screen; reduced motion
   settles the cloth once and draws it still. */

const COLORS = ["#50698a", "#d8cfbd", "#9a5040", "#5d7a58", "#c7a452"];
const MARK = ["#3a4e68", "#b1a792", "#7a3c30", "#465e43", "#9f7f37"];

type P = { x: number; y: number; px: number; py: number; pin: boolean };
type Flag = { pts: P[]; cols: number; rows: number; rest: number; color: number; anchor: number };

export function PrayerFlags({ className, height = 130, tilt = 0.08, tone = "dark" }: { className?: string; height?: number; tilt?: number; tone?: "dark" | "paper" }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;
    let rope: P[] = [];
    let flags: Flag[] = [];
    let ropeRest = 0;
    let time = 0;
    let geo = { y0: 0, y1: 0, span: 0, sag: 0 };
    const pointer = { x: -999, y: -999, vx: 0, vy: 0 };

    const build = () => {
      const r = canvas.getBoundingClientRect();
      w = Math.max(1, r.width);
      h = Math.max(1, r.height);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      const phone = w < 640;
      const flagW = phone ? 22 : 28;
      const gap = phone ? 7 : 9;
      const n = Math.max(4, Math.floor((w + 20) / (flagW + gap)));
      const segs = n * 3;
      const y0 = h * 0.14;
      const y1 = h * (0.14 + tilt);
      const span = w + 40;
      ropeRest = span / segs;
      geo = { y0, y1, span, sag: h * 0.2 };
      rope = Array.from({ length: segs + 1 }, () => ({ x: 0, y: 0, px: 0, py: 0, pin: true }));
      placeRope(0);
      flags = [];
      const cols = 4;
      const rows = 5;
      const cell = flagW / (cols - 1);
      for (let f = 0; f < n; f++) {
        const segLen = span / segs;
        const anchor = Math.max(0, Math.min(segs - flagW / segLen - 0.01, (f + 0.5) * (segs / n) - flagW / segLen / 2));
        const pts: P[] = [];
        const ax = ropeAt(anchor);
        for (let r2 = 0; r2 < rows; r2++)
          for (let c = 0; c < cols; c++) {
            const x = ax.x + c * cell;
            const y = ax.y + r2 * cell * 1.08;
            pts.push({ x, y, px: x, py: y, pin: r2 === 0 });
          }
        flags.push({ pts, cols, rows, rest: cell, color: f % 5, anchor });
      }
    };

    // the string: a sag curve that lifts a little and ripples when the wind gets up (a simulated
    // rope this long stretches unless solved very stiffly; this reads the same and never breaks)
    const placeRope = (gust: number) => {
      const segs = rope.length - 1;
      for (let i = 0; i <= segs; i++) {
        const t = i / segs;
        const env = Math.sin(t * Math.PI);
        rope[i].x = -20 + geo.span * t + env * gust * 6;
        rope[i].y = geo.y0 + (geo.y1 - geo.y0) * t + env * geo.sag * (1 - Math.min(0.35, gust * 0.12)) + env * Math.sin(time * 1.4 + t * 7) * (1 + gust * 2.2);
      }
    };

    // where along the rope each pinned top-row point sits (interpolated between rope particles)
    const ropeAt = (s: number) => {
      const i = Math.max(0, Math.min(rope.length - 2, Math.floor(s)));
      const t = s - i;
      const a = rope[i];
      const b = rope[i + 1];
      return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
    };

    const satisfy = (a: P, b: P, rest: number) => {
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const d = Math.hypot(dx, dy) || 0.0001;
      const diff = (d - rest) / d;
      if (a.pin && b.pin) return;
      if (a.pin) {
        b.x -= dx * diff;
        b.y -= dy * diff;
      } else if (b.pin) {
        a.x += dx * diff;
        a.y += dy * diff;
      } else {
        a.x += dx * diff * 0.5;
        a.y += dy * diff * 0.5;
        b.x -= dx * diff * 0.5;
        b.y -= dy * diff * 0.5;
      }
    };

    const step = (dt: number, windOn: boolean) => {
      time += dt;
      const sv = Math.abs((window as unknown as { __scrollV?: number }).__scrollV ?? 0);
      const gust = windOn ? 0.62 + Math.sin(time * 0.7) * 0.26 + Math.sin(time * 1.9 + 1.3) * 0.16 + Math.min(1.8, sv * 1.1) : 0;
      const g = 520;
      const k = dt * dt;
      const integrate = (p: P, fx: number, fy: number) => {
        if (p.pin) return;
        const vx = (p.x - p.px) * 0.985;
        const vy = (p.y - p.py) * 0.985;
        p.px = p.x;
        p.py = p.y;
        p.x += vx + fx * k;
        p.y += vy + fy * k;
      };
      placeRope(gust);

      for (const f of flags) {
        const spacing = f.rest / (ropeRest || 1);
        for (let c = 0; c < f.cols; c++) {
          const top = f.pts[c];
          const at = ropeAt(f.anchor + c * spacing);
          top.x = at.x;
          top.y = at.y;
        }
        for (let i = f.cols; i < f.pts.length; i++) {
          const p = f.pts[i];
          const row = Math.floor(i / f.cols);
          const flutter = Math.sin(time * 9 + p.x * 0.09 + row * 0.9) * 0.6 + Math.sin(time * 5.3 + p.x * 0.05) * 0.4;
          let fx = gust * (880 + row * 170) + flutter * gust * 760;
          let fy = g + flutter * gust * 420;
          const dx = p.x - pointer.x;
          const dy = p.y - pointer.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 3600) {
            fx += pointer.vx * 900 + dx * 40;
            fy += pointer.vy * 900 + dy * 40;
          }
          integrate(p, fx, fy);
        }
        for (let it = 0; it < 3; it++) {
          for (let r2 = 0; r2 < f.rows; r2++)
            for (let c = 0; c < f.cols; c++) {
              const i = r2 * f.cols + c;
              if (c < f.cols - 1) satisfy(f.pts[i], f.pts[i + 1], f.rest);
              if (r2 < f.rows - 1) satisfy(f.pts[i], f.pts[i + f.cols], f.rest * 1.08);
              if (c < f.cols - 1 && r2 < f.rows - 1) satisfy(f.pts[i], f.pts[i + f.cols + 1], Math.hypot(f.rest, f.rest * 1.08));
            }
        }
      }
      pointer.vx *= 0.8;
      pointer.vy *= 0.8;
    };

    const draw = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      for (const f of flags) {
        const base = COLORS[f.color];
        // one fill for the whole flag (no seams), then per-cell light and shade on top
        const P2 = (r2: number, c: number) => f.pts[r2 * f.cols + c];
        ctx.fillStyle = base;
        ctx.globalAlpha = 0.92;
        ctx.beginPath();
        for (let c = 0; c < f.cols; c++) (c ? ctx.lineTo(P2(0, c).x, P2(0, c).y) : ctx.moveTo(P2(0, 0).x, P2(0, 0).y));
        for (let r2 = 1; r2 < f.rows; r2++) ctx.lineTo(P2(r2, f.cols - 1).x, P2(r2, f.cols - 1).y);
        for (let c = f.cols - 2; c >= 0; c--) ctx.lineTo(P2(f.rows - 1, c).x, P2(f.rows - 1, c).y);
        for (let r2 = f.rows - 2; r2 > 0; r2--) ctx.lineTo(P2(r2, 0).x, P2(r2, 0).y);
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = 1;
        for (let r2 = 0; r2 < f.rows - 1; r2++)
          for (let c = 0; c < f.cols - 1; c++) {
            const a = f.pts[r2 * f.cols + c];
            const b = f.pts[r2 * f.cols + c + 1];
            const d = f.pts[(r2 + 1) * f.cols + c];
            const e = f.pts[(r2 + 1) * f.cols + c + 1];
            // foreshortening: a cell squeezed sideways is turned away from us → darker
            const span = Math.hypot(b.x - a.x, b.y - a.y) / f.rest;
            const shade = Math.max(0.45, Math.min(1.08, 0.35 + span * 0.72));
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.lineTo(e.x, e.y);
            ctx.lineTo(d.x, d.y);
            ctx.closePath();
            if (shade < 1) {
              ctx.fillStyle = `rgba(20,12,8,${(1 - shade) * 0.8})`;
              ctx.fill();
            } else {
              ctx.fillStyle = `rgba(255,244,220,${(shade - 1) * 1.6})`;
              ctx.fill();
            }
          }
        // the printed wind-horse, reduced to a small seal in the middle
        const m = f.pts[2 * f.cols + 1];
        const m2 = f.pts[2 * f.cols + 2];
        ctx.fillStyle = MARK[f.color];
        ctx.globalAlpha = 0.75;
        ctx.beginPath();
        ctx.arc((m.x + m2.x) / 2, (m.y + m2.y) / 2, f.rest * 0.42, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
      ctx.strokeStyle = tone === "paper" ? "rgba(40,26,17,.85)" : "rgba(182,158,112,.6)";
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      rope.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
      ctx.stroke();
    };

    let raf = 0;
    let visible = false;
    let last = performance.now();
    const frame = (now: number) => {
      raf = 0;
      if (!visible) return;
      const dt = Math.min(1 / 30, (now - last) / 1000);
      last = now;
      step(dt / 2, true);
      step(dt / 2, true);
      draw();
      raf = requestAnimationFrame(frame);
    };

    const settle = () => {
      for (let i = 0; i < 240; i++) step(1 / 60, false);
      draw();
    };

    build();
    settle();

    const ro = new ResizeObserver(() => {
      build();
      settle();
    });
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting && !reduce;
      if (visible && !raf) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    });
    io.observe(canvas);

    const move = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      if (y < -40 || y > r.height + 40) return;
      pointer.vx = (x - pointer.x) * 0.02;
      pointer.vy = (y - pointer.y) * 0.02;
      if (Math.abs(pointer.vx) > 2 || Math.abs(pointer.vy) > 2) pointer.vx = pointer.vy = 0;
      pointer.x = x;
      pointer.y = y;
    };
    addEventListener("pointermove", move, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      removeEventListener("pointermove", move);
    };
  }, [tilt, tone]);

  return <canvas ref={ref} aria-hidden="true" className={cn("pointer-events-none absolute inset-x-0 w-full", className)} style={{ height }} />;
}
