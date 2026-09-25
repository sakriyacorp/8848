"use client";

import { useEffect, useId, useState, type CSSProperties } from "react";
import { cn } from "@/lib/cn";
import { ARC, NUMERAL_GLYPHS, PEAKS_D, TAGLINE_D } from "@/components/brand/logo-paths";

/* The 8848 mark as live SVG, traced from the original logo (scripts/trace-logo.mjs).
   Layers: arc (a stroke, so it can draw itself on) · peaks · four numerals · tagline.
   Materials follow the two physical references: engraved into brass, gold foil on cream,
   plus brass-on-dark for the night room. `animate` plays the draw-on:
   arc strokes on → peaks rise out of the ground → sun rises through the arc → numerals settle
   → tagline → a light sheen crosses the metal. */

export type LogoVariant = "lockup" | "mark" | "stacked" | "numerals";
export type LogoMaterial = "engraved" | "foil" | "brass" | "cream" | "ink";

const VIEWBOX: Record<LogoVariant, string> = {
  lockup: "70 36 1780 1634",
  mark: "70 36 1780 984",
  stacked: "70 36 1780 1414",
  numerals: "250 848 1420 600",
};

const ARC_SW = 23;
export const ARC_PATH = `M ${ARC.cx - ARC.r} ${ARC.legBottom} L ${ARC.cx - ARC.r} ${ARC.cy} A ${ARC.r} ${ARC.r} 0 0 1 ${ARC.cx + ARC.r} ${ARC.cy} L ${ARC.cx + ARC.r} ${ARC.legBottom}`;

type Props = {
  variant?: LogoVariant;
  material?: LogoMaterial;
  animate?: boolean;
  /** Seconds before the draw-on starts. */
  delay?: number;
  /** Show a sun (day) or moon (night) inside the arc. */
  orb?: "sun" | "moon" | null;
  /** Replays the sheen when this changes. */
  sheenKey?: number;
  title?: string;
  className?: string;
  style?: CSSProperties;
};

export function Logo({
  variant = "lockup",
  material = "brass",
  animate = false,
  delay = 0,
  orb = null,
  sheenKey = 0,
  title = "8848 Himalayan Fusion & Bar",
  className,
  style,
}: Props) {
  const uid = useId().replace(/:/g, "");
  const [reduce, setReduce] = useState(false);
  useEffect(() => setReduce(matchMedia("(prefers-reduced-motion: reduce)").matches), []);

  const showArc = variant !== "numerals";
  const showPeaks = variant !== "numerals";
  const showNumerals = variant !== "mark";
  const showTag = variant === "lockup";

  const paint = material === "ink" ? "currentColor" : `url(#${uid}-paint)`;
  const accent = material === "ink" ? "currentColor" : `url(#${uid}-accent)`;
  const moving = animate && !reduce;

  return (
    <svg
      viewBox={VIEWBOX[variant]}
      role="img"
      aria-label={title}
      className={cn("logo8848", `logo-${material}`, moving && "logo-anim", className)}
      style={{ ...style, ["--ld" as string]: `${delay}s` }}
    >
      <title>{title}</title>
      <defs>
        <Paints uid={uid} material={material} moving={moving} />
        <clipPath id={`${uid}-ground`}>
          <rect x="0" y="0" width="1916" height="1006" />
        </clipPath>
        <clipPath id={`${uid}-sky`}>
          <circle cx={ARC.cx} cy={ARC.cy} r={ARC.r - ARC_SW} />
        </clipPath>
        <radialGradient id={`${uid}-orb`} cx="0.42" cy="0.38" r="0.7">
          <stop offset="0" stopColor={orb === "moon" ? "#fbf6e8" : "#fff4d4"} />
          <stop offset="0.55" stopColor={orb === "moon" ? "#e4dac2" : "#f2cf86"} />
          <stop offset="1" stopColor={orb === "moon" ? "#b9ab8c" : "#d59b4e"} />
        </radialGradient>
        <radialGradient id={`${uid}-orbglow`}>
          <stop offset="0" stopColor={orb === "moon" ? "#f2e9cf" : "#ffd48a"} stopOpacity="0.55" />
          <stop offset="1" stopColor={orb === "moon" ? "#f2e9cf" : "#ffd48a"} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${uid}-sheen`} x1="0" y1="0" x2="1" y2="0.35">
          <stop offset="0.35" stopColor="#fffaf0" stopOpacity="0" />
          <stop offset="0.5" stopColor="#fffaf0" stopOpacity="0.85" />
          <stop offset="0.65" stopColor="#fffaf0" stopOpacity="0" />
        </linearGradient>
        <clipPath id={`${uid}-shape`}>
          {showArc && <path d={ARC_PATH} fill="none" stroke="#000" strokeWidth={ARC_SW} />}
          {showPeaks && <path d={PEAKS_D} />}
          {showNumerals && NUMERAL_GLYPHS.map((d, i) => <path key={i} d={d} />)}
        </clipPath>
      </defs>

      {orb && showArc && (
        <g clipPath={`url(#${uid}-sky)`}>
          <g className="logo-orb">
            <circle cx={1300} cy={372} r={210} fill={`url(#${uid}-orbglow)`} />
            <circle cx={1300} cy={372} r={92} fill={`url(#${uid}-orb)`} />
            {orb === "moon" && <circle cx={1334} cy={352} r={84} fill="#17110d" opacity="0.0" className="logo-moon-shadow" />}
          </g>
        </g>
      )}

      {showArc && (
        <path
          className="logo-arc"
          d={ARC_PATH}
          fill="none"
          stroke={paint}
          strokeWidth={ARC_SW}
          pathLength={1}
        />
      )}

      {showPeaks && (
        <g clipPath={`url(#${uid}-ground)`}>
          <path className="logo-peaks" d={PEAKS_D} fill={accent} fillRule="evenodd" />
        </g>
      )}

      {showNumerals &&
        NUMERAL_GLYPHS.map((d, i) => (
          <path key={i} className="logo-num" style={{ ["--i" as string]: i }} d={d} fill={paint} fillRule="evenodd" />
        ))}

      {showTag && <path className="logo-tag" d={TAGLINE_D} fill={accent} fillRule="evenodd" />}

      {material !== "ink" && (
        <g clipPath={`url(#${uid}-shape)`} className="logo-sheen-wrap" aria-hidden="true">
          <rect key={sheenKey} className="logo-sheen" x="-900" y="0" width="900" height="1720" fill={`url(#${uid}-sheen)`} />
        </g>
      )}
    </svg>
  );
}

function Paints({ uid, material, moving }: { uid: string; material: LogoMaterial; moving: boolean }) {
  if (material === "ink") return null;

  if (material === "engraved") {
    // Ink cut into brass: deep chocolate, darker where the cut throws shadow (top).
    return (
      <>
        <linearGradient id={`${uid}-paint`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#24160d" />
          <stop offset="0.5" stopColor="#3b2517" />
          <stop offset="1" stopColor="#4a3020" />
        </linearGradient>
        <linearGradient id={`${uid}-accent`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2c1b10" />
          <stop offset="1" stopColor="#4d3322" />
        </linearGradient>
      </>
    );
  }

  if (material === "cream") {
    return (
      <>
        <linearGradient id={`${uid}-paint`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fbf5e6" />
          <stop offset="1" stopColor="#e6dcc6" />
        </linearGradient>
        <linearGradient id={`${uid}-accent`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f2e9cf" />
          <stop offset="1" stopColor="#cdb98f" />
        </linearGradient>
      </>
    );
  }

  // foil (on cream) and brass (on dark) are both metal; foil runs brighter and its sheen drifts.
  const stops =
    material === "foil"
      ? ["#8e6f3e", "#c9a764", "#f6e7b8", "#dcbf7b", "#a8854b", "#e8d39a", "#fff3cf", "#b08a4a"]
      : ["#8f7447", "#c7ae7a", "#f2e2b6", "#b69e70", "#9b7e53", "#d8c391", "#f7ecce", "#a88c5a"];
  return (
    <>
      <linearGradient id={`${uid}-paint`} x1="0" y1="0" x2="1" y2="0.4" spreadMethod="reflect">
        {stops.map((c, i) => (
          <stop key={i} offset={i / (stops.length - 1)} stopColor={c} />
        ))}
        {moving && material === "foil" && (
          <animateTransform attributeName="gradientTransform" type="translate" values="0 0; 0.6 0; 0 0" dur="11s" repeatCount="indefinite" />
        )}
      </linearGradient>
      <linearGradient id={`${uid}-accent`} x1="0" y1="0" x2="0.9" y2="1">
        {stops.slice(1).map((c, i, a) => (
          <stop key={i} offset={i / (a.length - 1)} stopColor={c} />
        ))}
      </linearGradient>
    </>
  );
}
