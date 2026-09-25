"use client";

import { useEffect, useMemo, useRef } from "react";
import { rng } from "@/lib/ridge";

/* A hand-drawn trekking map on lokta paper: contour rings, the Dudh Koshi river, and the route
   from Kathmandu to the summit that inks itself in as you scroll. Each stop's label and little
   drawing appears as the line reaches it. */

const STOPS = [
  { id: "ktm", name: "Kathmandu", alt: "1,400 m", x: 110, y: 610, t: 0, icon: "city" },
  { id: "lukla", name: "Lukla", alt: "2,860 m", x: 430, y: 470, t: 0.34, icon: "plane" },
  { id: "namche", name: "Namche Bazaar", alt: "3,440 m", x: 520, y: 360, t: 0.5, icon: "houses" },
  { id: "tengboche", name: "Tengboche", alt: "3,867 m", x: 640, y: 300, t: 0.62, icon: "gompa" },
  { id: "ebc", name: "Base Camp", alt: "5,364 m", x: 790, y: 190, t: 0.83, icon: "tent" },
  { id: "summit", name: "Sagarmatha", alt: "8,848.86 m", x: 880, y: 95, t: 1, icon: "flag" },
] as const;

const ROUTE =
  "M110 610 C 170 600, 210 560, 260 548 C 320 534, 330 500, 380 492 S 420 480, 430 470 C 452 440, 486 420, 500 392 S 512 366, 520 360 C 560 340, 600 330, 640 300 C 680 272, 700 260, 730 236 S 772 206, 790 190 C 812 170, 846 140, 862 120 S 876 100, 880 95";

export function RouteMap() {
  const root = useRef<HTMLDivElement>(null);
  const contours = useMemo(() => {
    const r = rng(77);
    const rings: string[] = [];
    const centres = [
      { x: 880, y: 95, n: 9 },
      { x: 700, y: 250, n: 6 },
      { x: 300, y: 380, n: 5 },
      { x: 960, y: 420, n: 6 },
    ];
    for (const c of centres) {
      for (let i = 1; i <= c.n; i++) {
        const rad = i * 34 + r() * 8;
        const pts: string[] = [];
        for (let a = 0; a <= 48; a++) {
          const th = (a / 48) * Math.PI * 2;
          const wob = 1 + 0.12 * Math.sin(3 * th + i * 1.3) + 0.06 * Math.cos(7 * th - i);
          pts.push(`${(c.x + Math.cos(th) * rad * wob * 1.3).toFixed(1)},${(c.y + Math.sin(th) * rad * wob).toFixed(1)}`);
        }
        rings.push(pts.join(" "));
      }
    }
    return rings;
  }, []);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      el.style.setProperty("--route", "1");
      return;
    }
    let raf = 0;
    const tick = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (innerHeight * 0.85 - r.top) / (r.height * 0.95)));
      el.style.setProperty("--route", p.toFixed(4));
      el.querySelectorAll<SVGGElement>("[data-t]").forEach((g) => g.classList.toggle("on", p >= Number(g.dataset.t) - 0.01));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    tick();
    addEventListener("scroll", onScroll, { passive: true });
    return () => {
      removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={root} className="route-map paper relative overflow-hidden rounded-[26px] shadow-[0_40px_90px_-30px_rgba(0,0,0,.8)]">
      <svg viewBox="0 0 1000 700" className="h-auto w-full" role="img" aria-label="Hand-drawn map of the trek from Kathmandu via Lukla, Namche Bazaar, Tengboche and Everest Base Camp to the summit of Sagarmatha">
        <defs>
          <filter id="rm-rough">
            <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="3" />
            <feDisplacementMap in="SourceGraphic" scale="2.2" />
          </filter>
          <pattern id="rm-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
            <path d="M0 0 V6" stroke="#614a32" strokeWidth=".6" opacity=".25" />
          </pattern>
        </defs>

        <g filter="url(#rm-rough)">
          <g fill="none" stroke="#9b7e53" strokeWidth=".9" opacity=".55">
            {contours.map((pts, i) => (
              <polygon key={i} points={pts} strokeDasharray={i % 4 === 0 ? undefined : "0"} opacity={i % 4 === 0 ? 0.9 : 0.5} />
            ))}
          </g>
          {/* the Dudh Koshi, milky river */}
          <path d="M360 700 C 380 620, 420 560, 450 500 S 470 420, 520 390 S 610 330, 700 300" fill="none" stroke="#b8ab94" strokeOpacity=".55" strokeWidth="5" strokeLinecap="round" />
          {/* glacier around base camp */}
          <path d="M760 210 C 800 230, 840 240, 900 230 C 930 225, 950 200, 940 170 C 900 180, 860 170, 820 160 Z" fill="url(#rm-hatch)" stroke="#614a32" strokeOpacity=".35" />
        </g>

        {/* the route, inked as you scroll */}
        <path d={ROUTE} fill="none" stroke="#3b2517" strokeOpacity=".16" strokeWidth="3" strokeDasharray="2 7" strokeLinecap="round" />
        <path className="rm-route" d={ROUTE} fill="none" stroke="#3b2517" strokeWidth="3.2" strokeLinecap="round" pathLength={1} filter="url(#rm-rough)" />

        {STOPS.map((s) => (
          <g key={s.id} data-t={s.t} className="rm-stop" transform={`translate(${s.x} ${s.y})`}>
            <circle r="7" fill="#efe8db" stroke="#3b2517" strokeWidth="2" />
            <circle r="2.5" fill="#3b2517" />
            <g className="rm-icon" transform={s.id === "summit" ? "translate(8 -38)" : "translate(-14 -44)"}>
              <StopIcon kind={s.icon} />
            </g>
            <text x={s.id === "summit" ? -16 : 14} y={s.id === "summit" ? -2 : 22} textAnchor={s.id === "summit" ? "end" : "start"} fontFamily="var(--font-caps)" fontSize="15" fontWeight="600" letterSpacing="2" fill="#3b2517">
              {s.name.toUpperCase()}
            </text>
            <text x={s.id === "summit" ? -16 : 14} y={s.id === "summit" ? 16 : 40} textAnchor={s.id === "summit" ? "end" : "start"} fontFamily="var(--font-display)" fontSize="17" fontStyle="italic" fill="#614a32">
              {s.alt}
            </text>
          </g>
        ))}

        {/* compass + scale */}
        <g transform="translate(90 110)" fill="none" stroke="#3b2517" strokeOpacity=".7">
          <circle r="34" />
          <circle r="28" strokeOpacity=".35" />
          <path d="M0 -44 L7 0 L0 44 L-7 0Z" fill="#3b2517" fillOpacity=".75" />
          <path d="M-44 0 L0 5 L44 0 L0 -5Z" fill="#3b2517" fillOpacity=".25" />
          <text y="-50" textAnchor="middle" fontSize="14" fill="#3b2517" stroke="none" fontFamily="var(--font-caps)">
            N
          </text>
        </g>
        <g transform="translate(700 640)" stroke="#3b2517" fill="#3b2517">
          <path d="M0 0 H160" strokeWidth="1.5" />
          <path d="M0 -6 V6 M80 -4 V4 M160 -6 V6" strokeWidth="1.5" />
          <text x="0" y="-12" fontSize="12" fontFamily="var(--font-caps)" stroke="none" letterSpacing="1.5">
            0
          </text>
          <text x="160" y="-12" fontSize="12" fontFamily="var(--font-caps)" stroke="none" textAnchor="end" letterSpacing="1.5">
            20 KM
          </text>
        </g>
        <text x="500" y="44" textAnchor="middle" fontFamily="var(--font-caps)" fontSize="13" letterSpacing="5" fill="#614a32" opacity=".8">
          KHUMBU · SOLUKHUMBU DISTRICT · NEPAL
        </text>
      </svg>
    </div>
  );
}

function StopIcon({ kind }: { kind: string }) {
  const s = { fill: "none", stroke: "#3b2517", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (kind) {
    case "plane":
      return <path {...s} d="M2 18 L28 10 L20 18 L28 26 Z M14 14 L6 6 M14 22 L6 30" />;
    case "houses":
      return <path {...s} d="M2 30 V18 L10 11 L18 18 V30 Z M18 30 V22 L25 16 L32 22 V30" />;
    case "gompa":
      return <path {...s} d="M4 30 H30 M7 30 V20 H27 V30 M10 20 L17 12 L24 20 M17 12 V6 M14 8 H20" />;
    case "tent":
      return <path {...s} d="M2 30 L16 8 L30 30 Z M16 8 V30 M12 30 L16 22 L20 30" />;
    case "flag":
      return (
        <g {...s}>
          <path d="M2 34 V4" />
          <path d="M2 5 C 10 2, 14 9, 24 6 V 18 C 14 21, 10 14, 2 17" fill="#b69e70" fillOpacity=".6" />
        </g>
      );
    default:
      return <path {...s} d="M4 30 V16 H12 V30 M12 30 V10 H20 V30 M20 30 V20 H28 V30 M8 12 V8 M16 8 V4" />;
  }
}
