"use client";

import { useEffect, useState } from "react";

/* Two brass clocks side by side: here, and on the mountain (Nepal keeps UTC+5:45, so the hands
   never quite line up). */
function parts(tz: string, d: Date) {
  const f = new Intl.DateTimeFormat("en-US", { timeZone: tz, hour: "numeric", minute: "numeric", second: "numeric", hourCycle: "h23" });
  const p: Record<string, number> = {};
  for (const x of f.formatToParts(d)) if (x.type !== "literal") p[x.type] = Number(x.value);
  return { h: p.hour % 24, m: p.minute, s: p.second };
}

export function TwinClocks() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const diffLabel = "+9 h 45 min";
  return (
    <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
      <Clock label="Harrisonburg" tz="America/New_York" now={now} />
      <div className="caps text-center text-[10px] text-brass/80">
        <span className="block text-[22px] leading-none text-brass">⇄</span>
        {diffLabel}
        <span className="block text-muted">(+10:45 in winter)</span>
      </div>
      <Clock label="Everest · Kathmandu" tz="Asia/Kathmandu" now={now} />
    </div>
  );
}

function Clock({ label, tz, now }: { label: string; tz: string; now: Date | null }) {
  const t = now ? parts(tz, now) : { h: 10, m: 10, s: 0 };
  const hA = ((t.h % 12) + t.m / 60) * 30;
  const mA = (t.m + t.s / 60) * 6;
  const sA = t.s * 6;
  const time = now ? new Intl.DateTimeFormat("en-US", { timeZone: tz, hour: "numeric", minute: "2-digit" }).format(now) : "";
  return (
    <figure className="flex flex-col items-center">
      <svg viewBox="0 0 120 120" className="h-[132px] w-[132px] drop-shadow-[0_18px_30px_rgba(0,0,0,.6)] md:h-[150px] md:w-[150px]" role="img" aria-label={`${label}: ${time}`}>
        <defs>
          <linearGradient id={`tc-ring-${tz}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#f1e4bd" />
            <stop offset=".45" stopColor="#b69e70" />
            <stop offset="1" stopColor="#7d623a" />
          </linearGradient>
          <radialGradient id={`tc-face-${tz}`} cx=".4" cy=".35" r=".8">
            <stop offset="0" stopColor="#2e2015" />
            <stop offset="1" stopColor="#120d09" />
          </radialGradient>
        </defs>
        <circle cx="60" cy="60" r="58" fill={`url(#tc-ring-${tz})`} />
        <circle cx="60" cy="60" r="51" fill={`url(#tc-face-${tz})`} />
        {Array.from({ length: 60 }, (_, i) => {
          const a = (i * 6 * Math.PI) / 180;
          const long = i % 5 === 0;
          return (
            <line key={i} x1={60 + Math.sin(a) * (long ? 40 : 44)} y1={60 - Math.cos(a) * (long ? 40 : 44)} x2={60 + Math.sin(a) * 47} y2={60 - Math.cos(a) * 47} stroke="#dcbf7b" strokeWidth={long ? 1.6 : 0.6} opacity={long ? 0.9 : 0.4} />
          );
        })}
        <path d="M44 74 L54 58 L58 64 L62 58 L76 74Z" fill="#dcbf7b" opacity=".25" />
        <g style={{ transform: `rotate(${hA}deg)`, transformOrigin: "60px 60px", transition: "transform .5s var(--ease)" }}>
          <path d="M60 64 L60 32" stroke="#f2e9cf" strokeWidth="3.4" strokeLinecap="round" />
        </g>
        <g style={{ transform: `rotate(${mA}deg)`, transformOrigin: "60px 60px", transition: "transform .5s var(--ease)" }}>
          <path d="M60 66 L60 20" stroke="#f2e9cf" strokeWidth="2" strokeLinecap="round" />
        </g>
        <g style={{ transform: `rotate(${sA}deg)`, transformOrigin: "60px 60px" }}>
          <path d="M60 70 L60 16" stroke="#dcbf7b" strokeWidth=".9" strokeLinecap="round" />
        </g>
        <circle cx="60" cy="60" r="3.2" fill="#dcbf7b" />
      </svg>
      <figcaption className="mt-3 text-center">
        <span className="caps block text-[10px] text-brass">{label}</span>
        <span className="num display mt-1 block text-[22px] text-brass-hi">{time || "—"}</span>
      </figcaption>
    </figure>
  );
}
