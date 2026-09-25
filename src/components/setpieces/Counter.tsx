"use client";

import { useEffect, useRef, useState } from "react";
import { isOn } from "@/config/features";

/* A number that ticks up once when it scrolls into view (8,848.86 m, 29,031.7 ft, 4.9 ★…).
   Eases out so the last digits land slowly, like an altimeter settling. Tabular figures keep
   the width steady while it runs. */
export function Counter({
  to,
  from = 0,
  decimals = 0,
  duration = 1.8,
  className,
  prefix = "",
  suffix = "",
}: {
  to: number;
  from?: number;
  decimals?: number;
  duration?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const fmt = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  const [text, setText] = useState(fmt(to));

  useEffect(() => {
    const el = ref.current;
    if (!el || !isOn("counters")) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    setText(fmt(from));
    const run = () => {
      const t0 = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - t0) / (duration * 1000));
        const e = 1 - Math.pow(1 - t, 4);
        setText(fmt(from + (to - from) * e));
        if (t < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(
      (es) => {
        if (es.some((e) => e.isIntersecting)) {
          io.disconnect();
          run();
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [to, from, decimals, duration]);

  return (
    <span ref={ref} className={`num ${className ?? ""}`}>
      {prefix}
      {text}
      {suffix}
    </span>
  );
}
