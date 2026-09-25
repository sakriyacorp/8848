"use client";

import { useEffect, useId, useMemo, useRef, useState, type CSSProperties } from "react";
import { cn } from "@/lib/cn";
import { ridgePath, stars as makeStars } from "@/lib/ridge";
import { skyAt, SKY_COLORS, type Sky, type SkyPhase } from "@/lib/sky";
import { subscribeTilt } from "@/lib/tilt";
import { isOn } from "@/config/features";
import { PEAKS_BOX, PEAKS_D, PEAKS_HULL_D } from "@/components/brand/logo-paths";

/* The living mountain: the logo's own peaks, blown up into a massif with snow in the cut
   streaks, under the real sky over Harrisonburg right now (dawn, day, golden hour, night with
   stars and a moon riding the logo's arc). Layers drift with phone tilt / the mouse. */

const W = 1600;
const H = 1000;
const MASSIF = "translate(109 150) scale(0.72)";
const ARC_C = { x: 800, y: 760, r: 600 };

type Props = {
  className?: string;
  /** Force a phase (the bar is always night). */
  phase?: SkyPhase;
  parallax?: boolean;
  /** Show the brass arc across the sky with the sun/moon on it. */
  arc?: boolean;
  style?: CSSProperties;
  onSky?: (s: Sky) => void;
  /** No sky and no background: just the mountains, for laying over another sky. */
  transparent?: boolean;
  /** Pull the snow down a stop so the massif sits back behind text. */
  dim?: boolean;
};

export function MountainScene({ className, phase: forced, parallax = true, arc = true, style, onSky, transparent = false, dim = false }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const u = useId().replace(/:/g, "");
  const [sky, setSky] = useState<Sky | null>(null);

  useEffect(() => {
    const s = skyAt(new Date());
    setSky(s);
    onSky?.(s);
    const id = setInterval(() => setSky(skyAt(new Date())), 5 * 60_000);
    return () => clearInterval(id);
  }, [onSky]);

  const phase: SkyPhase = forced ?? sky?.phase ?? "night";
  const c = SKY_COLORS[phase];
  const night = phase === "night" || phase === "dusk";

  const layers = useMemo(
    () => ({
      far: ridgePath({ width: W, height: H, base: 690, amp: 120, rough: 0.5, seed: 5, peaks: [[160, 150], [1450, 170], [1240, 110]] }),
      mid: ridgePath({ width: W, height: H, base: 820, amp: 110, rough: 0.55, seed: 9, peaks: [[260, 90], [1320, 120]] }),
      near: ridgePath({ width: W, height: H, base: 910, amp: 70, rough: 0.6, seed: 17, peaks: [[90, 70], [1500, 80]] }),
      stars: makeStars(140, 3, W, 620),
    }),
    [],
  );

  useEffect(() => {
    const el = root.current;
    if (!el || !parallax || !isOn("tilt")) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    return subscribeTilt((x, y) => {
      el.style.setProperty("--tx", x.toFixed(3));
      el.style.setProperty("--ty", y.toFixed(3));
    });
  }, [parallax]);

  const t = forced === "night" ? 0.62 : night ? (sky?.moon ?? 0.6) : (sky?.sun ?? 0.35);
  const ang = Math.PI * (1 - (0.12 + t * 0.76));
  const ox = ARC_C.x + Math.cos(ang) * ARC_C.r;
  const oy = ARC_C.y - Math.sin(ang) * ARC_C.r;

  const svg = (children: React.ReactNode, cls?: string, depth = 0) => (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMax slice"
      className={cn("ms-layer absolute inset-0 h-full w-full", cls)}
      style={{ ["--d" as string]: depth }}
      aria-hidden="true"
    >
      {children}
    </svg>
  );

  return (
    <div
      ref={root}
      className={cn("mountain-scene absolute inset-0 overflow-hidden", dim && "ms-dim", transparent && "ms-transparent", className)}
      data-phase={phase}
      style={{ ...style, background: transparent ? "transparent" : c.top }}
      role="img"
      aria-label={`Illustration: the Everest massif under a ${sky?.label.toLowerCase() ?? "night"} sky`}
    >
      {svg(
        <>
          <defs>
            <linearGradient id={`${u}-sky`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={c.top} />
              <stop offset="0.55" stopColor={c.mid} />
              <stop offset="0.85" stopColor={c.low} />
            </linearGradient>
            <radialGradient id={`${u}-orbglow`}>
              <stop offset="0" stopColor={night ? "#f2e9cf" : c.rim} stopOpacity={night ? 0.35 : 0.6} />
              <stop offset="1" stopColor={night ? "#f2e9cf" : c.rim} stopOpacity="0" />
            </radialGradient>
            <clipPath id={`${u}-moonclip`}>
              <circle r={30} />
            </clipPath>
            <radialGradient id={`${u}-orb`} cx="0.4" cy="0.35" r="0.75">
              <stop offset="0" stopColor="#fffaf0" />
              <stop offset="0.6" stopColor={night ? "#e8dfc9" : "#f6d9a0"} />
              <stop offset="1" stopColor={night ? "#b9ab8c" : "#e3a45a"} />
            </radialGradient>
          </defs>
          <rect width={W} height={H} fill={`url(#${u}-sky)`} />
          <g className="ms-stars" style={{ opacity: c.stars }}>
            {layers.stars.map((s, i) => (
              <circle
                key={i}
                className={i % 6 === 0 ? "tw" : undefined}
                cx={s.x}
                cy={s.y}
                r={s.r}
                fill="#f2e9cf"
                opacity={s.o}
                style={i % 6 === 0 ? { ["--o" as string]: s.o, animationDelay: `${s.d}s` } : undefined}
              />
            ))}
          </g>
          {arc && (
            <path
              d={`M ${ARC_C.x - ARC_C.r} ${ARC_C.y} A ${ARC_C.r} ${ARC_C.r} 0 0 1 ${ARC_C.x + ARC_C.r} ${ARC_C.y}`}
              fill="none"
              stroke="#dcbf7b"
              strokeOpacity={night ? 0.22 : 0.3}
              strokeWidth="2"
              strokeDasharray="2 10"
              className="ms-arc"
            />
          )}
          <g className="ms-orb" style={{ transform: `translate(${ox}px, ${oy}px)` }}>
            <circle r={night ? 160 : 240} fill={`url(#${u}-orbglow)`} />
            <circle r={night ? 30 : 38} fill={`url(#${u}-orb)`} />
            {night && sky && (
              <g clipPath={`url(#${u}-moonclip)`}>
                <MoonShadow phase={sky.moonPhase} r={30} />
              </g>
            )}
          </g>
        </>,
        "ms-sky",
        0.1,
      )}

      {svg(
        <>
          <defs>
            <linearGradient id={`${u}-far`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={c.mid} />
              <stop offset="1" stopColor={c.top} />
            </linearGradient>
          </defs>
          <path d={layers.far} fill={`url(#${u}-far)`} opacity="0.75" />
        </>,
        undefined,
        0.25,
      )}

      <div aria-hidden="true" className="ms-cloud ms-cloud-a" style={{ ["--haze" as string]: c.haze }} />

      {svg(
        <>
          <defs>
            <linearGradient id={`${u}-snow`} x1="0" y1="0" x2="0.5" y2="1">
              <stop offset="0" stopColor={night ? "#f7f0e0" : "#fff8ea"} />
              <stop offset="0.35" stopColor={night ? "#d9cfba" : c.rim} />
              <stop offset="0.75" stopColor={night ? "#8f846f" : "#c9b48f"} />
              <stop offset="1" stopColor={night ? "#4a3e33" : "#8b7a62"} />
            </linearGradient>
            <linearGradient id={`${u}-rock`} x1="0" y1="0.2" x2="1" y2="0.6">
              <stop offset="0" stopColor={night ? "#5e4a37" : "#7a5c42"} />
              <stop offset="0.42" stopColor={night ? "#3a2c21" : "#4e3827"} />
              <stop offset="0.55" stopColor={night ? "#241b14" : "#2e2118"} />
              <stop offset="1" stopColor="#140e0a" />
            </linearGradient>
            <linearGradient id={`${u}-massif-fade`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0.72" stopColor={c.top} stopOpacity="0" />
              <stop offset="1" stopColor={c.top} stopOpacity="0.85" />
            </linearGradient>
          </defs>
          <g transform={MASSIF} className="ms-massif">
            <rect className="ms-massif-box" x={PEAKS_BOX.minX} y={PEAKS_BOX.minY} width={PEAKS_BOX.maxX - PEAKS_BOX.minX} height={PEAKS_BOX.maxY - PEAKS_BOX.minY} fill="none" />
            <path d={PEAKS_HULL_D} fill={`url(#${u}-snow)`} />
            <path d={PEAKS_D} fill={`url(#${u}-rock)`} fillRule="evenodd" />
            <path d={PEAKS_HULL_D} fill={`url(#${u}-massif-fade)`} />
          </g>
          <defs>
            <filter id={`${u}-plume`} x="-20%" y="-200%" width="140%" height="500%">
              <feGaussianBlur stdDeviation="7 4" />
            </filter>
            <linearGradient id={`${u}-plumeg`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor={night ? "#efe7d6" : "#fff8ea"} stopOpacity="0.85" />
              <stop offset="1" stopColor={night ? "#efe7d6" : "#fff8ea"} stopOpacity="0" />
            </linearGradient>
          </defs>
          <g className="ms-plume" filter={`url(#${u}-plume)`}>
            <path d="M824 300 C 848 294, 896 298, 952 310 C 996 319, 1040 330, 1086 338 L 1078 349 C 1026 344, 968 336, 910 327 C 868 320, 840 313, 822 305 Z" fill={`url(#${u}-plumeg)`} />
          </g>
        </>,
        "ms-massif-layer",
        0.45,
      )}

      <div aria-hidden="true" className="ms-cloud ms-cloud-b" style={{ ["--haze" as string]: c.haze }} />

      {svg(
        <>
          <defs>
            <linearGradient id={`${u}-mid`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#2e2118" />
              <stop offset="1" stopColor="#17110d" />
            </linearGradient>
          </defs>
          <path d={layers.mid} fill={`url(#${u}-mid)`} />
          <path d={layers.mid} fill="none" stroke={c.rim} strokeOpacity="0.18" strokeWidth="1.5" />
        </>,
        undefined,
        0.7,
      )}
      {svg(<path d={layers.near} fill="#120d09" />, undefined, 1)}
    </div>
  );
}

/* A crescent/gibbous shadow drawn over the moon disc for the real phase. */
function MoonShadow({ phase, r }: { phase: number; r: number }) {
  // phase 0 new, .5 full. Shadow offset slides across the disc.
  const lit = 1 - Math.abs(phase - 0.5) * 2; // 0 new → 1 full
  if (lit > 0.95) return null;
  const dir = phase < 0.5 ? 1 : -1;
  const off = dir * r * 2 * lit;
  return <circle cx={-off} cy={0} r={r * 1.02} fill="#0b0908" opacity={0.82} />;
}
