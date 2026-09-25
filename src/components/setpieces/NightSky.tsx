"use client";

import { useEffect, useRef } from "react";
import { rng } from "@/lib/ridge";
import { cn } from "@/lib/cn";

/* The bar's sky: a canvas star field with a Milky Way band, stars that twinkle on their own
   clocks, a very slow drift of the whole sky, and a shooting star every few seconds. Pauses
   off-screen; reduced motion gets one still frame. Exposes its stars on window.__8848stars for
   the constellation easter egg. */
export type Star = { x: number; y: number; r: number; a: number; ph: number; sp: number };

export function NightSky({ className, density = 1, onStars }: { className?: string; density?: number; onStars?: (s: Star[], size: { w: number; h: number }) => void }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const phone = innerWidth < 768;
    const dpr = Math.min(devicePixelRatio || 1, phone ? 1.5 : 2);
    let w = 0;
    let h = 0;
    let stars: Star[] = [];
    let glow: HTMLCanvasElement | null = null;
    const shooters: { x: number; y: number; vx: number; vy: number; life: number }[] = [];
    let nextShoot = performance.now() + 2500;

    const build = () => {
      const r = canvas.getBoundingClientRect();
      w = Math.max(1, r.width);
      h = Math.max(1, r.height);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      const rand = rng(8848);
      const n = Math.round(((w * h) / (phone ? 2600 : 2200)) * density);
      stars = [];
      // Milky Way band: a line from lower-left to upper-right; stars cluster around it.
      const bx0 = w * -0.1;
      const by0 = h * 0.95;
      const bx1 = w * 1.1;
      const by1 = h * 0.05;
      for (let i = 0; i < n; i++) {
        const inBand = rand() < 0.55;
        let x: number;
        let y: number;
        if (inBand) {
          const t = rand();
          const g = (rand() + rand() + rand() - 1.5) * 0.16 * Math.min(w, h) * 1.4;
          const nx = -(by1 - by0);
          const ny = bx1 - bx0;
          const nl = Math.hypot(nx, ny);
          x = bx0 + (bx1 - bx0) * t + (nx / nl) * g;
          y = by0 + (by1 - by0) * t + (ny / nl) * g;
        } else {
          x = rand() * w;
          y = rand() * h;
        }
        const big = rand() < 0.04;
        stars.push({ x, y, r: big ? 1 + rand() * 1.1 : 0.35 + rand() * 0.75, a: 0.35 + rand() * 0.65, ph: rand() * Math.PI * 2, sp: 0.5 + rand() * 2.2 });
      }
      // soft glow of the band, drawn once
      glow = document.createElement("canvas");
      glow.width = canvas.width;
      glow.height = canvas.height;
      const g = glow.getContext("2d")!;
      g.scale(dpr, dpr);
      for (let i = 0; i < 26; i++) {
        const t = i / 25;
        const x = bx0 + (bx1 - bx0) * t + (rand() - 0.5) * w * 0.08;
        const y = by0 + (by1 - by0) * t + (rand() - 0.5) * h * 0.08;
        const rad = Math.min(w, h) * (0.16 + rand() * 0.16);
        const grd = g.createRadialGradient(x, y, 0, x, y, rad);
        const warm = rand() < 0.5;
        grd.addColorStop(0, warm ? "rgba(238,211,165,0.07)" : "rgba(242,233,207,0.055)");
        grd.addColorStop(1, "rgba(0,0,0,0)");
        g.fillStyle = grd;
        g.beginPath();
        g.arc(x, y, rad, 0, Math.PI * 2);
        g.fill();
      }
      // dust lanes
      g.globalCompositeOperation = "destination-out";
      for (let i = 0; i < 10; i++) {
        const t = 0.1 + rand() * 0.8;
        const x = bx0 + (bx1 - bx0) * t;
        const y = by0 + (by1 - by0) * t;
        const rad = Math.min(w, h) * (0.04 + rand() * 0.06);
        const grd = g.createRadialGradient(x, y, 0, x, y, rad);
        grd.addColorStop(0, "rgba(0,0,0,0.5)");
        grd.addColorStop(1, "rgba(0,0,0,0)");
        g.fillStyle = grd;
        g.beginPath();
        g.arc(x, y, rad, 0, Math.PI * 2);
        g.fill();
      }
      onStars?.(stars, { w, h });
      (window as unknown as { __8848stars?: Star[] }).__8848stars = stars;
    };

    const draw = (now: number) => {
      const t = now / 1000;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      // very slow drift, as if the sky turns
      const drift = reduce ? 0 : t * 0.0035;
      ctx.save();
      ctx.translate(w * 0.5, h * 1.6);
      ctx.rotate(drift);
      ctx.translate(-w * 0.5, -h * 1.6);
      if (glow) ctx.drawImage(glow, 0, 0, w, h);
      for (const s of stars) {
        const tw = reduce ? 1 : 0.65 + 0.35 * Math.sin(t * s.sp + s.ph);
        ctx.globalAlpha = s.a * tw;
        ctx.fillStyle = s.r > 1 ? "#fff8e6" : "#f2e9cf";
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
        if (s.r > 1.3) {
          ctx.globalAlpha = s.a * tw * 0.25;
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r * 3.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();
      ctx.globalAlpha = 1;
      // shooting stars
      if (!reduce && now > nextShoot) {
        nextShoot = now + 3500 + Math.random() * 6000;
        const fromLeft = Math.random() < 0.5;
        shooters.push({ x: fromLeft ? w * (0.1 + Math.random() * 0.4) : w * (0.5 + Math.random() * 0.4), y: h * Math.random() * 0.35, vx: (fromLeft ? 1 : -1) * (520 + Math.random() * 260), vy: 170 + Math.random() * 120, life: 1 });
      }
      for (let i = shooters.length - 1; i >= 0; i--) {
        const s = shooters[i];
        s.x += s.vx / 60;
        s.y += s.vy / 60;
        s.life -= 1 / 55;
        if (s.life <= 0) {
          shooters.splice(i, 1);
          continue;
        }
        const tail = 0.16;
        const grd = ctx.createLinearGradient(s.x, s.y, s.x - s.vx * tail, s.y - s.vy * tail);
        grd.addColorStop(0, `rgba(255,248,230,${0.9 * s.life})`);
        grd.addColorStop(1, "rgba(255,248,230,0)");
        ctx.strokeStyle = grd;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x - s.vx * tail, s.y - s.vy * tail);
        ctx.stroke();
      }
    };

    build();
    let raf = 0;
    let visible = false;
    let lastDraw = 0;
    const loop = (now: number) => {
      raf = 0;
      if (!visible) return;
      if (now - lastDraw > (phone ? 33 : 16)) {
        lastDraw = now;
        draw(now);
      }
      raf = requestAnimationFrame(loop);
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !raf) {
        if (reduce) draw(performance.now());
        else raf = requestAnimationFrame(loop);
      }
    });
    io.observe(canvas);
    const ro = new ResizeObserver(() => {
      build();
      draw(performance.now());
    });
    ro.observe(canvas);
    return () => {
      io.disconnect();
      ro.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [density, onStars]);

  return <canvas ref={ref} aria-hidden="true" className={cn("absolute inset-0 h-full w-full", className)} />;
}
