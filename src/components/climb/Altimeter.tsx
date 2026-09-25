"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/cn";

/* The brass altimeter used by the ascent (3D and SVG). Numbers tween toward their targets so
   the reading "rolls" like an instrument instead of jumping. Values are written straight to
   the DOM each frame; React only renders the frame once. */
export function Altimeter({
  alt,
  temp,
  o2,
  place,
  progress,
  className,
  compact = false,
}: {
  alt: number;
  temp: number;
  o2: number;
  place: string;
  progress: number;
  className?: string;
  compact?: boolean;
}) {
  const altEl = useRef<HTMLSpanElement>(null);
  const tempEl = useRef<HTMLSpanElement>(null);
  const o2El = useRef<HTMLSpanElement>(null);
  const needle = useRef<SVGGElement>(null);
  const cur = useRef({ alt, temp, o2, p: progress });
  const target = useRef({ alt, temp, o2, p: progress });
  const raf = useRef(0);

  useEffect(() => {
    target.current = { alt, temp, o2, p: progress };
    if (raf.current) return;
    const tick = () => {
      const c = cur.current;
      const t = target.current;
      c.alt += (t.alt - c.alt) * 0.12;
      c.temp += (t.temp - c.temp) * 0.12;
      c.o2 += (t.o2 - c.o2) * 0.12;
      c.p += (t.p - c.p) * 0.12;
      if (altEl.current) altEl.current.textContent = c.alt.toLocaleString("en-US", { maximumFractionDigits: t.alt % 1 && Math.abs(t.alt - c.alt) < 1 ? 2 : 0, minimumFractionDigits: t.alt % 1 && Math.abs(t.alt - c.alt) < 1 ? 2 : 0 });
      if (tempEl.current) tempEl.current.textContent = `${Math.round(c.temp)}`;
      if (o2El.current) o2El.current.textContent = `${Math.round(c.o2)}`;
      if (needle.current) needle.current.style.transform = `rotate(${-120 + c.p * 240}deg)`;
      const settled = Math.abs(t.alt - c.alt) < 0.05 && Math.abs(t.p - c.p) < 0.0005;
      raf.current = settled ? 0 : requestAnimationFrame(tick);
      if (settled && altEl.current) altEl.current.textContent = t.alt.toLocaleString("en-US", { maximumFractionDigits: 2 });
    };
    raf.current = requestAnimationFrame(tick);
  }, [alt, temp, o2, progress]);

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  return (
    <div className={cn("altimeter brass sheen relative flex items-center gap-3 rounded-[22px] p-2.5 pr-4", compact && "rounded-full p-1.5 pr-4", className)} role="status" aria-live="polite" aria-label={`${place}, ${Math.round(alt)} metres`}>
      <svg viewBox="0 0 80 80" className={cn("shrink-0", compact ? "h-11 w-11" : "h-[74px] w-[74px]")} aria-hidden="true">
        <defs>
          <radialGradient id="alt-face" cx=".45" cy=".4" r=".7">
            <stop offset="0" stopColor="#2e2015" />
            <stop offset="1" stopColor="#140e0a" />
          </radialGradient>
        </defs>
        <circle cx="40" cy="40" r="37" fill="url(#alt-face)" stroke="#6b5332" strokeWidth="2" />
        {Array.from({ length: 25 }, (_, i) => {
          const a = ((-120 + i * 10) * Math.PI) / 180;
          const long = i % 3 === 0;
          const r1 = long ? 26 : 29;
          return (
            <line key={i} x1={40 + Math.sin(a) * r1} y1={40 - Math.cos(a) * r1} x2={40 + Math.sin(a) * 33} y2={40 - Math.cos(a) * 33} stroke="#dcbf7b" strokeWidth={long ? 1.4 : 0.8} opacity={long ? 0.9 : 0.5} />
          );
        })}
        <text x="40" y="58" textAnchor="middle" fontSize="7" fontFamily="var(--font-caps)" fill="#b69e70" letterSpacing="1">
          ×1000 m
        </text>
        <g ref={needle} style={{ transformOrigin: "40px 40px", transform: "rotate(-120deg)" }}>
          <path d="M40 40 L40 11" stroke="#f2e9cf" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M40 40 L40 48" stroke="#b69e70" strokeWidth="2.4" strokeLinecap="round" />
        </g>
        <circle cx="40" cy="40" r="3.4" fill="#dcbf7b" />
      </svg>
      <div className="min-w-0 leading-none text-choc">
        <p className={cn("caps truncate text-bronze", compact ? "text-[8.5px]" : "text-[9.5px]")}>{place}</p>
        <p className={cn("display num mt-1 whitespace-nowrap", compact ? "text-[22px]" : "text-[30px]")}>
          <span ref={altEl}>{Math.round(alt).toLocaleString("en-US")}</span>
          <span className="ml-1 text-[0.5em] italic">m</span>
        </p>
        {!compact && (
          <p className="num mt-1.5 flex gap-3 text-[11.5px] text-bronze">
            <span>
              <span ref={tempEl}>{temp}</span>°C
            </span>
            <span>
              O₂ <span ref={o2El}>{o2}</span>%
            </span>
          </p>
        )}
      </div>
    </div>
  );
}
