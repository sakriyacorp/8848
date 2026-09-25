"use client";

import { useEffect, useRef, useState } from "react";

/* A brass dial for picking a time: drag it round like a safe dial (or use the arrow keys); each
   detent is one slot. The engraved window shows the chosen time; ticks light up as it turns. */
export function BrassDial({ options, value, onChange, label }: { options: string[]; value: number; onChange(i: number): void; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef<{ a0: number; v0: number } | null>(null);
  const [angle, setAngle] = useState(0);
  const n = Math.max(1, options.length);
  const step = 300 / Math.max(1, n - 1); // spread over 300°

  useEffect(() => setAngle(-150 + value * step), [value, step]);

  const angleAt = (e: PointerEvent | React.PointerEvent) => {
    const r = ref.current!.getBoundingClientRect();
    return (Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)) * 180) / Math.PI;
  };

  useEffect(() => {
    const move = (e: PointerEvent) => {
      if (!drag.current) return;
      let d = angleAt(e) - drag.current.a0;
      if (d > 180) d -= 360;
      if (d < -180) d += 360;
      const raw = drag.current.v0 + d / step;
      const next = Math.max(0, Math.min(n - 1, Math.round(raw)));
      setAngle(-150 + Math.max(0, Math.min(n - 1, raw)) * step);
      if (next !== value) {
        onChange(next);
        try {
          navigator.vibrate?.(4);
        } catch {}
      }
    };
    const up = () => {
      if (!drag.current) return;
      drag.current = null;
      setAngle(-150 + value * step);
    };
    addEventListener("pointermove", move);
    addEventListener("pointerup", up);
    return () => {
      removeEventListener("pointermove", move);
      removeEventListener("pointerup", up);
    };
  });

  return (
    <div className="flex flex-col items-center">
      <div
        ref={ref}
        role="slider"
        tabIndex={0}
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={n - 1}
        aria-valuenow={value}
        aria-valuetext={options[value]}
        onPointerDown={(e) => {
          e.preventDefault();
          (e.target as Element).setPointerCapture?.(e.pointerId);
          drag.current = { a0: angleAt(e), v0: value };
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight" || e.key === "ArrowUp") onChange(Math.min(n - 1, value + 1));
          else if (e.key === "ArrowLeft" || e.key === "ArrowDown") onChange(Math.max(0, value - 1));
          else return;
          e.preventDefault();
        }}
        className="brass-dial relative h-[210px] w-[210px] cursor-grab touch-none select-none rounded-full active:cursor-grabbing"
      >
        <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full" aria-hidden="true">
          {options.map((_, i) => {
            const a = ((-150 + i * step - 90) * Math.PI) / 180;
            const on = i <= value;
            return <line key={i} x1={100 + Math.cos(a) * 88} y1={100 + Math.sin(a) * 88} x2={100 + Math.cos(a) * 96} y2={100 + Math.sin(a) * 96} stroke={on ? "#f2e9cf" : "#9b7e53"} strokeWidth={i % 4 === 0 ? 2.2 : 1.2} strokeLinecap="round" opacity={on ? 1 : 0.6} />;
          })}
        </svg>
        <div className="brass absolute inset-[16px] rounded-full shadow-[0_18px_40px_-10px_rgba(0,0,0,.8),inset_0_2px_0_rgba(255,250,232,.8),inset_0_-3px_6px_rgba(80,56,28,.5)]" style={{ transform: `rotate(${angle}deg)`, transition: drag.current ? "none" : "transform .45s var(--ease-bounce)" }}>
          <span className="absolute left-1/2 top-2 h-5 w-[3px] -translate-x-1/2 rounded-full bg-choc shadow-[0_1px_0_rgba(255,246,220,.6)]" />
          {Array.from({ length: 24 }, (_, i) => (
            <span key={i} className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2" style={{ transform: `rotate(${i * 15}deg)` }}>
              <span className="absolute left-0 top-[6px] h-2 w-px bg-choc/40" />
            </span>
          ))}
        </div>
        <div className="absolute inset-[58px] flex flex-col items-center justify-center rounded-full bg-[radial-gradient(circle_at_40%_35%,#2e2015,#120d09)] shadow-[inset_0_3px_8px_rgba(0,0,0,.8)]">
          <span className="caps text-[8.5px] text-brass/80">Arrive</span>
          <span className="num display text-[26px] leading-tight text-brass-hi">{options[value] ?? "—"}</span>
        </div>
      </div>
      <p className="caps mt-3 text-[9.5px] text-muted">Drag the dial · or use ← →</p>
    </div>
  );
}
