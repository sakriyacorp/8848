"use client";

import { useEffect, useRef } from "react";

/* A brass compass whose needle can't decide: it spins, hunts, overshoots, and every few seconds
   settles on "down" for a moment before the storm spins it again. */
export function Compass404() {
  const needle = useRef<SVGGElement>(null);
  const bezel = useRef<SVGGElement>(null);

  useEffect(() => {
    const n = needle.current;
    const b = bezel.current;
    if (!n || !b) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      n.style.transform = "rotate(180deg)";
      return;
    }
    let a = 0;
    let v = 9;
    let target = 0;
    let nextFlip = performance.now() + 1500;
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      if (now > nextFlip) {
        const settle = Math.random() < 0.4;
        target = settle ? a - (a % 360) + 180 : a + (Math.random() - 0.3) * 900;
        nextFlip = now + (settle ? 2400 : 900 + Math.random() * 1200);
      }
      v += (target - a) * 0.012;
      v *= 0.94;
      a += v;
      n.style.transform = `rotate(${a.toFixed(2)}deg)`;
      b.style.transform = `rotate(${Math.sin((now - t0) / 1800) * 6}deg)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <svg viewBox="0 0 200 200" className="h-[170px] w-[170px] drop-shadow-[0_24px_40px_rgba(59,37,23,.45)] md:h-[210px] md:w-[210px]" aria-hidden="true">
      <defs>
        <linearGradient id="cp-ring" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f6ecd0" />
          <stop offset=".4" stopColor="#c7ae7a" />
          <stop offset=".7" stopColor="#9b7e53" />
          <stop offset="1" stopColor="#e3d2a4" />
        </linearGradient>
        <radialGradient id="cp-face" cx=".42" cy=".38" r=".75">
          <stop offset="0" stopColor="#fbf5e6" />
          <stop offset="1" stopColor="#dccfb4" />
        </radialGradient>
      </defs>
      <circle cx="100" cy="100" r="96" fill="url(#cp-ring)" />
      <circle cx="100" cy="100" r="84" fill="url(#cp-face)" stroke="#9b7e53" strokeWidth="1.5" />
      <g ref={bezel} style={{ transformOrigin: "100px 100px" }}>
        {Array.from({ length: 72 }, (_, i) => {
          const a = (i * 5 * Math.PI) / 180;
          const long = i % 9 === 0;
          return <line key={i} x1={100 + Math.sin(a) * (long ? 68 : 74)} y1={100 - Math.cos(a) * (long ? 68 : 74)} x2={100 + Math.sin(a) * 80} y2={100 - Math.cos(a) * 80} stroke="#614a32" strokeWidth={long ? 1.6 : 0.7} />;
        })}
        {[
          ["N", 0],
          ["E", 90],
          ["S", 180],
          ["W", 270],
        ].map(([l, deg]) => {
          const a = ((deg as number) * Math.PI) / 180;
          return (
            <text key={l as string} x={100 + Math.sin(a) * 56} y={100 - Math.cos(a) * 56 + 6} textAnchor="middle" fontFamily="var(--font-caps)" fontSize="17" fontWeight="600" fill="#3b2517">
              {l}
            </text>
          );
        })}
        <path d="M78 116 L94 92 L100 100 L106 94 L122 116Z" fill="#b69e70" opacity=".35" />
      </g>
      <g ref={needle} style={{ transformOrigin: "100px 100px" }}>
        <path d="M100 30 L108 100 L100 108 L92 100Z" fill="#7d3f22" />
        <path d="M100 170 L108 100 L100 92 L92 100Z" fill="#3b2517" />
      </g>
      <circle cx="100" cy="100" r="7" fill="url(#cp-ring)" stroke="#614a32" />
    </svg>
  );
}
