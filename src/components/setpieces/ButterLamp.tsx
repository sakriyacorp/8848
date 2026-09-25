"use client";

import { useId } from "react";
import { cn } from "@/lib/cn";
import { isOn } from "@/config/features";

/* A brass butter lamp. Lit = open (the flame flickers and throws a glow);
   out = closed (a thin wisp of smoke curls up from the wick). */
export function ButterLamp({ lit, size = 22, className }: { lit: boolean; size?: number; className?: string }) {
  const id = useId().replace(/:/g, "");
  if (!isOn("butterLamps")) {
    return (
      <span
        aria-hidden="true"
        className={cn("inline-block h-2 w-2 rounded-full", lit ? "bg-foil shadow-[0_0_10px_rgba(220,191,123,.8)]" : "bg-muted/60", className)}
      />
    );
  }
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 40 52"
      width={size}
      height={(size * 52) / 40}
      className={cn("butter-lamp overflow-visible", lit ? "is-lit" : "is-out", className)}
    >
      <defs>
        <linearGradient id={`${id}-b`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#8f7447" />
          <stop offset="0.35" stopColor="#f1e2b6" />
          <stop offset="0.6" stopColor="#b69e70" />
          <stop offset="1" stopColor="#7d623a" />
        </linearGradient>
        <radialGradient id={`${id}-f`} cx="0.5" cy="0.72" r="0.62">
          <stop offset="0" stopColor="#fffdf2" />
          <stop offset="0.35" stopColor="#ffe6a6" />
          <stop offset="0.7" stopColor="#f3a94f" />
          <stop offset="1" stopColor="#d9782c" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${id}-g`}>
          <stop offset="0" stopColor="#ffd98f" stopOpacity="0.55" />
          <stop offset="1" stopColor="#ffd98f" stopOpacity="0" />
        </radialGradient>
      </defs>
      {lit && <circle className="lamp-glow-disc" cx="20" cy="17" r="17" fill={`url(#${id}-g)`} />}
      {lit ? (
        <path className="lamp-flame" d="M20 4.5c3.4 5.2 5.2 8.4 5.2 11.4a5.2 5.2 0 0 1-10.4 0c0-3 1.8-6.2 5.2-11.4Z" fill={`url(#${id}-f)`} />
      ) : (
        <g className="lamp-smoke" fill="none" stroke="#cbbfa8" strokeLinecap="round" strokeWidth="1.1">
          <path d="M20 21c-2-3 2-5 0-8s2-5 0-9" pathLength={1} />
          <path d="M20.5 21c2-2.5-1.5-4.5.5-7.5s-1-4 1-7" pathLength={1} style={{ animationDelay: "1.4s" }} />
        </g>
      )}
      <path d="M20 21.5v-3" stroke="#2a1b12" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M6 22h28a14 14 0 0 1-28 0Z" fill={`url(#${id}-b)`} />
      <path d="M6 22h28" stroke="#f7ecce" strokeWidth="1" opacity=".7" />
      <path d="M17.5 35.5h5l1.2 8h-7.4Z" fill={`url(#${id}-b)`} />
      <path d="M11 45.5c0-1.4 4-2.4 9-2.4s9 1 9 2.4c0 1.3-4 2-9 2s-9-.7-9-2Z" fill={`url(#${id}-b)`} />
    </svg>
  );
}
