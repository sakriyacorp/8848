"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/format";
import { byId } from "@/lib/menu";
import { subscribeTilt } from "@/lib/tilt";
import { addToPack } from "@/lib/add-to-pack";

/* Tap a cocktail and watch it built in the glass: the layers pour in one after another from a
   thin stream, ice drops and bobs, the garnish lands on the rim. The surface sloshes with the
   phone's tilt (or the mouse) and settles like liquid. */

type GlassKind = "rocks" | "coupe" | "wine";
type Recipe = {
  glass: GlassKind;
  layers: Array<{ color: string; to: number; label: string }>;
  ice?: number;
  garnish: "lime" | "orange" | "cinnamon" | "flower" | "salt" | "star";
  foam?: string;
};

const RECIPES: Record<string, Recipe> = {
  "summit-cocktail": { glass: "coupe", layers: [{ color: "#e2d6b0", to: 0.5, label: "8848 Vodka + lychee" }, { color: "#efe4c2", to: 0.84, label: "Elderflower + sparkling wine" }], garnish: "star" },
  "kathmandu-old-fashioned": { glass: "rocks", layers: [{ color: "#7b3c12", to: 0.4, label: "Old Durbar whisky" }, { color: "#a55a1e", to: 0.66, label: "Demerara + bitters" }], ice: 1, garnish: "orange" },
  "khukri-mule": { glass: "rocks", layers: [{ color: "#8a4d22", to: 0.34, label: "Khukri rum" }, { color: "#d9b56b", to: 0.78, label: "Ginger beer + lime" }], ice: 3, garnish: "lime" },
  "timmur-margarita": { glass: "coupe", layers: [{ color: "#d9d29a", to: 0.5, label: "Reposado + lime" }, { color: "#ece6b8", to: 0.84, label: "Orange liqueur + agave" }], garnish: "salt" },
  "everest-garden": { glass: "wine", layers: [{ color: "#d4d6a8", to: 0.34, label: "Gin + elderflower" }, { color: "#ecd7b2", to: 0.62, label: "White peach + lime" }, { color: "#f3ead6", to: 0.8, label: "Cucumber + soda" }], ice: 3, garnish: "flower" },
};

const G = {
  rocks: { body: "M52 118 L60 282 Q62 294 76 294 L164 294 Q178 294 180 282 L188 118", inner: "M60 122 L66 272 L174 272 L180 122 Z", top: 122, bottom: 272, rimY: 118, rimX: [52, 188] as [number, number] },
  coupe: { body: "M34 120 Q36 204 120 210 Q204 204 206 120 M120 210 L120 286 M84 292 Q120 280 156 292", inner: "M40 124 Q44 198 120 203 Q196 198 200 124 Z", top: 124, bottom: 203, rimY: 120, rimX: [34, 206] as [number, number] },
  wine: { body: "M64 58 Q56 196 120 206 Q184 196 176 58 M120 206 L120 288 M86 294 Q120 282 154 294", inner: "M70 62 Q64 190 120 199 Q176 190 170 62 Z", top: 62, bottom: 199, rimY: 58, rimX: [64, 176] as [number, number] },
};

export function BarPours({ ids }: { ids: string[] }) {
  const [sel, setSel] = useState(ids[0]);
  const [run, setRun] = useState(0);
  const recipe = RECIPES[sel];
  const item = byId(sel);
  const glass = G[recipe.glass];
  const svg = useRef<SVGSVGElement>(null);
  const layerRefs = useRef<(SVGPathElement | null)[]>([]);
  const foamRef = useRef<SVGPathElement>(null);
  const streamRef = useRef<SVGLineElement>(null);
  const iceRefs = useRef<(SVGGElement | null)[]>([]);
  const garnishRef = useRef<SVGGElement>(null);
  const [label, setLabel] = useState("");
  const tilt = useRef(0);

  useEffect(() => subscribeTilt((x) => (tilt.current = x)), []);

  useEffect(() => {
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const H = glass.bottom - glass.top;
    const [x0, x1] = glass.rimX;
    const cx = (x0 + x1) / 2;
    const levels = recipe.layers.map(() => 0); // 0–1 fill of each layer (fraction of its target)
    let slosh = 0;
    let sloshV = 0;
    let raf = 0;
    const POUR = 900; // ms per layer
    const start = performance.now();
    let lbl = "";
    const setL = (v: string) => {
      if (v !== lbl) {
        lbl = v;
        setLabel(v);
      }
    };

    const surface = (level: number, now: number, amp: number) => {
      const y = glass.bottom - H * level;
      const pts: string[] = [];
      for (let i = 0; i <= 24; i++) {
        const x = x0 - 10 + ((x1 - x0 + 20) * i) / 24;
        const wave = Math.sin(i * 0.7 + now / 260) * amp + Math.sin(i * 1.9 - now / 410) * amp * 0.5;
        pts.push(`${x.toFixed(1)} ${(y + Math.tan(slosh) * (x - cx) + wave).toFixed(2)}`);
      }
      return { d: `M${pts.join(" L")} L${x1 + 10} ${glass.bottom + 30} L${x0 - 10} ${glass.bottom + 30} Z`, y };
    };

    const frame = (now: number) => {
      const el = now - start;
      // spring toward the tilt, plus a jolt while pouring
      const targetAngle = -tilt.current * 0.22;
      sloshV += (targetAngle - slosh) * 0.08;
      sloshV *= 0.9;
      slosh += sloshV;
      let pouring = -1;
      recipe.layers.forEach((l, i) => {
        const begin = 250 + i * (POUR + 180);
        const p = reduce ? 1 : Math.min(1, Math.max(0, (el - begin) / POUR));
        levels[i] = p;
        if (p > 0 && p < 1) pouring = i;
      });
      recipe.layers.forEach((l, i) => {
        const prev = i === 0 ? 0 : recipe.layers[i - 1].to;
        const level = prev + (l.to - prev) * levels[i];
        const amp = pouring === i ? 2.2 : 0.9;
        const s = surface(level, now, levels[i] > 0 ? amp : 0);
        const path = layerRefs.current[i];
        if (path) {
          path.setAttribute("d", s.d);
          path.style.opacity = levels[i] > 0 ? "1" : "0";
        }
      });
      if (pouring >= 0) {
        setL(recipe.layers[pouring].label);
        const l = recipe.layers[pouring];
        const prev = pouring === 0 ? 0 : recipe.layers[pouring - 1].to;
        const y = glass.bottom - H * (prev + (l.to - prev) * levels[pouring]);
        if (streamRef.current) {
          streamRef.current.setAttribute("y2", String(y));
          streamRef.current.style.stroke = l.color;
          streamRef.current.style.opacity = "1";
        }
        sloshV += (Math.random() - 0.5) * 0.004;
      } else if (streamRef.current) {
        streamRef.current.style.opacity = "0";
      }
      const top = recipe.layers[recipe.layers.length - 1].to;
      const done = levels[levels.length - 1] >= 1;
      if (foamRef.current && recipe.foam) {
        const f = surface(top, now, 0.6);
        const fy = f.y;
        foamRef.current.setAttribute("d", `M${x0} ${fy - 1} Q${cx} ${fy - 9} ${x1} ${fy - 1} L${x1} ${fy + 5} Q${cx} ${fy + 2} ${x0} ${fy + 5} Z`);
        foamRef.current.style.opacity = done ? "1" : "0";
      }
      // ice: drop after the first layer, bob on the surface
      iceRefs.current.forEach((g, i) => {
        if (!g) return;
        const drop = 250 + POUR * 0.6 + i * 180;
        const k = reduce ? 1 : Math.min(1, Math.max(0, (el - drop) / 520));
        const lvl = glass.bottom - H * Math.max(0.28, recipe.layers.reduce((acc, l, j) => (levels[j] > 0 ? (j === 0 ? 0 : recipe.layers[j - 1].to) + (l.to - (j === 0 ? 0 : recipe.layers[j - 1].to)) * levels[j] : acc), 0));
        const bounce = k < 1 ? 1 - Math.abs(Math.sin(k * Math.PI * 1.5)) * (1 - k) : 1;
        const y = -80 + (lvl - 12 + 80) * Math.min(1, k * 1.1) * bounce + Math.sin(now / 500 + i) * 1.5;
        g.setAttribute("transform", `translate(${cx - 22 + i * 16} ${y.toFixed(1)}) rotate(${(i * 23 + now / 90) % 12 - 6})`);
        g.style.opacity = k > 0 ? "1" : "0";
      });
      if (garnishRef.current) {
        const land = 250 + recipe.layers.length * (POUR + 180) + 120;
        const k = reduce ? 1 : Math.min(1, Math.max(0, (el - land) / 600));
        const e = 1 - Math.pow(1 - k, 3);
        garnishRef.current.style.opacity = k > 0 ? "1" : "0";
        garnishRef.current.style.transform = `translateY(${(-70 * (1 - e)).toFixed(1)}px) rotate(${(-25 * (1 - e)).toFixed(1)}deg)`;
        if (k >= 1) setL("");
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    const io = new IntersectionObserver(([e]) => {
      cancelAnimationFrame(raf);
      if (e.isIntersecting) raf = requestAnimationFrame(frame);
    });
    if (svg.current) io.observe(svg.current);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sel, run]);

  const [x0, x1] = glass.rimX;
  const cx = (x0 + x1) / 2;

  return (
    <div className="glass mt-12 grid gap-6 overflow-hidden rounded-[30px] p-5 [--glass-base:rgba(10,8,10,0.65)] md:grid-cols-[1fr_1.1fr] md:p-8">
      <div className="relative flex items-end justify-center">
        <div aria-hidden="true" className="absolute bottom-6 left-1/2 h-10 w-3/4 -translate-x-1/2 rounded-[50%] bg-[radial-gradient(closest-side,rgba(238,211,165,0.22),transparent)]" />
        <svg ref={svg} viewBox="0 0 240 310" className="relative h-[300px] w-auto md:h-[380px]" role="img" aria-label={`${item?.name ?? "Cocktail"} being poured`}>
          <defs>
            <clipPath id="pour-inner">
              <path d={glass.inner} />
            </clipPath>
            <linearGradient id="pour-glass" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#f2e9cf" stopOpacity=".35" />
              <stop offset=".25" stopColor="#f2e9cf" stopOpacity=".05" />
              <stop offset=".8" stopColor="#f2e9cf" stopOpacity=".04" />
              <stop offset="1" stopColor="#f2e9cf" stopOpacity=".3" />
            </linearGradient>
          </defs>
          <line ref={streamRef} x1={cx + 6} y1="0" x2={cx + 6} y2="0" strokeWidth="4" strokeLinecap="round" style={{ opacity: 0, transition: "opacity .2s" }} />
          <g clipPath="url(#pour-inner)">
            <path d={glass.inner} fill="rgba(242,233,207,0.04)" />
            {recipe.layers.map((l, i) => (
              <path
                key={`${sel}-${run}-${i}`}
                ref={(el) => {
                  layerRefs.current[i] = el;
                }}
                fill={l.color}
                style={{ opacity: 0, mixBlendMode: i ? "normal" : "normal" }}
              />
            ))}
            {recipe.foam && <path ref={foamRef} fill={recipe.foam} style={{ opacity: 0, transition: "opacity .6s" }} />}
            {Array.from({ length: recipe.ice ?? 0 }, (_, i) => (
              <g
                key={`${sel}-${run}-ice-${i}`}
                ref={(el) => {
                  iceRefs.current[i] = el;
                }}
                style={{ opacity: 0 }}
              >
                <rect x="0" y="0" width={recipe.glass === "rocks" ? 46 : 22} height={recipe.glass === "rocks" ? 42 : 20} rx="6" fill="rgba(255,252,244,0.28)" stroke="rgba(255,252,244,0.6)" strokeWidth="1.2" />
                <path d="M5 6 L16 4" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity=".6" />
              </g>
            ))}
            {/* bubbles for the spritz */}
            {recipe.glass === "wine" &&
              Array.from({ length: 10 }, (_, i) => (
                <circle key={i} className="pour-bubble" cx={80 + ((i * 37) % 80)} cy={190} r={1.2 + (i % 3) * 0.6} fill="#fff6e2" style={{ animationDelay: `${(i * 0.37) % 2.4}s` }} />
              ))}
          </g>
          <path d={glass.body} fill="url(#pour-glass)" stroke="#f2e9cf" strokeOpacity=".55" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          {/* brass rim */}
          <line x1={x0 - 1} y1={glass.rimY} x2={x1 + 1} y2={glass.rimY} stroke="#dcbf7b" strokeWidth="3" strokeLinecap="round" />
          <g ref={garnishRef} style={{ opacity: 0, transformBox: "fill-box", transformOrigin: "center" }}>
            <Garnish kind={recipe.garnish} x={x1 - 18} y={glass.rimY} />
          </g>
        </svg>
        <p aria-live="polite" className="caps absolute left-0 top-0 text-[10px] text-brass/80">
          {label ? `Pouring · ${label}` : "Ready"}
        </p>
      </div>

      <div className="flex flex-col justify-center">
        <p className="caps text-[10px] text-brass">Watch it poured</p>
        <ul className="mt-4 space-y-2" role="radiogroup" aria-label="Choose a cocktail">
          {ids.map((id) => {
            const it = byId(id);
            if (!it) return null;
            const on = id === sel;
            return (
              <li key={id}>
                <button
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => {
                    setSel(id);
                    setRun((r) => r + 1);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between gap-4 rounded-2xl border px-4 py-3 text-left transition-[background,border-color,transform] duration-300 active:scale-[0.99]",
                    on ? "border-foil/60 bg-brass/10" : "border-line hover:border-line-strong",
                  )}
                >
                  <span>
                    <span className={cn("display block text-[21px] leading-tight", on ? "text-brass-hi" : "text-text")}>{it.name}</span>
                    <span className="mt-0.5 block text-[13px] text-muted">{RECIPES[id].layers.map((l) => l.label).join(" · ")}</span>
                  </span>
                  <span className="num shrink-0 text-[15px] text-brass">{formatPrice(it.price)}</span>
                </button>
              </li>
            );
          })}
        </ul>
        {item && (
          <button type="button" onClick={(e) => addToPack(item.id, item.name, {}, e.currentTarget, null)} className="btn btn-brass mt-5 self-start px-6 py-3 text-[14.5px]">
            Add a {item.name} to your pack
          </button>
        )}
      </div>
    </div>
  );
}

function Garnish({ kind, x, y }: { kind: Recipe["garnish"]; x: number; y: number }) {
  switch (kind) {
    case "lime":
    case "orange": {
      const c = kind === "lime" ? "#b9c46a" : "#e0913a";
      return (
        <g transform={`translate(${x} ${y})`}>
          <circle r="17" fill={c} stroke="#f6ecd2" strokeWidth="2" />
          {Array.from({ length: 8 }, (_, i) => (
            <path key={i} d={`M0 0 L${Math.cos((i * Math.PI) / 4) * 14} ${Math.sin((i * Math.PI) / 4) * 14}`} stroke="#f6ecd2" strokeWidth="1" opacity=".7" />
          ))}
        </g>
      );
    }
    case "cinnamon":
      return (
        <g transform={`translate(${x - 30} ${y - 40}) rotate(28)`}>
          <rect width="9" height="70" rx="4" fill="#7a4a24" />
          <path d="M2 4v62M6 4v62" stroke="#4d2c14" strokeWidth="1" />
          <path d="M4 -2 q -3 -10 3 -18 q 4 -8 -2 -14" fill="none" stroke="#cfc6b3" strokeWidth="1.4" opacity=".5" className="pour-smoke" />
        </g>
      );
    case "flower":
      return (
        <g transform={`translate(${x} ${y - 4})`}>
          {Array.from({ length: 6 }, (_, i) => (
            <ellipse key={i} rx="6" ry="12" fill="#b4545a" opacity=".9" transform={`rotate(${i * 60}) translate(0 -9)`} />
          ))}
          <circle r="4" fill="#e3b34f" />
        </g>
      );
    case "salt":
      return (
        <g>
          {Array.from({ length: 26 }, (_, i) => (
            <circle key={i} cx={34 + i * 6.6} cy={y - 2 + (i % 3)} r="1.6" fill="#f6ecd2" />
          ))}
        </g>
      );
    default:
      return (
        <g transform={`translate(${x} ${y - 2})`}>
          <path d="M0 -14 L3.5 -4 L14 -4 L5.5 2.5 L9 13 L0 6.5 L-9 13 L-5.5 2.5 L-14 -4 L-3.5 -4Z" fill="#d49a45" stroke="#7a4a24" strokeWidth=".8" />
        </g>
      );
  }
}
