"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ridgePoints, stars, type RidgeOpts } from "@/lib/ridge";
import { skyAt } from "@/lib/sky";
import { isOn } from "@/config/features";
import { trackSection } from "@/lib/section-track";

const W = 1440;
const H = 360;
const CX = 720;
const CY = 330;
const R = 262;

type Pt = [number, number];
const toPath = (pts: Pt[]) => pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
const fillPath = (pts: Pt[]) => `${toPath(pts)} L${W} ${H} L0 ${H} Z`;
const yAt = (pts: Pt[], x: number) => {
  const i = Math.max(0, Math.min(pts.length - 2, Math.floor((x / W) * (pts.length - 1))));
  const [x0, y0] = pts[i];
  const [x1, y1] = pts[i + 1];
  return y0 + ((y1 - y0) * (x - x0)) / Math.max(1e-6, x1 - x0);
};

/* Footer horizon: the view back down from the pass at night. Four ranges fade into the haze
   (each rim-lit on the side facing the moon or sun, which sits on the logo's arc at its real
   position for Harrisonburg right now), mist pooling between them, a teahouse window glowing on
   the middle ridge, a string of prayer flags on the nearest one, stars and the odd shooting
   star. The ranges slide apart as the footer rises into view. */
export function FooterHorizon() {
  const ref = useRef<HTMLDivElement>(null);
  const [orb, setOrb] = useState<{ t: number; night: boolean } | null>(null);

  const ranges = useMemo(() => {
    const specs: Array<RidgeOpts & { fill: string; rim: number; speed: number; snow?: boolean }> = [
      { width: W, base: 214, amp: 70, rough: 0.5, seed: 11, peaks: [[720, 160], [540, 88], [905, 104], [1210, 60]], fill: "#46352a", rim: 0.55, speed: 0.2, snow: true },
      { width: W, base: 258, amp: 76, rough: 0.55, seed: 23, peaks: [[300, 84], [1150, 92]], fill: "#30231a", rim: 0.4, speed: 0.45 },
      { width: W, base: 298, amp: 50, rough: 0.58, seed: 37, peaks: [[1010, 36]], fill: "#1f160f", rim: 0.3, speed: 0.75 },
      { width: W, base: 336, amp: 24, rough: 0.6, seed: 41, fill: "#110c08", rim: 0.2, speed: 1.05 },
    ];
    return specs.map((s) => ({ ...s, pts: ridgePoints(s) as Pt[] }));
  }, []);
  const starField = useMemo(() => stars(80, 7, W, 230), []);

  // a teahouse on the middle ridge, prayer flags on the nearest
  const lodge = useMemo(() => {
    const x = 1010;
    return { x, y: yAt(ranges[2].pts, x) };
  }, [ranges]);
  const flags = useMemo(() => {
    const near = ranges[3].pts;
    const a: Pt = [520, yAt(near, 520) - 30];
    const b: Pt = [800, yAt(near, 800) - 26];
    const n = 14;
    const pts = Array.from({ length: n }, (_, i) => {
      const t = (i + 0.5) / n;
      return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t + Math.sin(t * Math.PI) * 9] as Pt;
    });
    return { a, b, pts, near };
  }, [ranges]);

  useEffect(() => {
    const s = skyAt(new Date());
    const night = s.phase === "night" || s.phase === "dusk";
    setOrb({ t: night ? s.moon : s.sun, night });
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el || !isOn("footerHorizon")) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    let visible = false;
    const track = trackSection(el);
    const tick = () => {
      raf = 0;
      const r = track.rect();
      const p = Math.max(0, Math.min(1, 1 - (r.top + r.height * 0.2) / innerHeight));
      el.style.setProperty("--fp", p.toFixed(3));
    };
    const onScroll = () => {
      if (visible && !raf) raf = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) tick();
    });
    io.observe(el);
    addEventListener("scroll", onScroll, { passive: true });
    return () => {
      track.dispose();
      io.disconnect();
      removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  // Orb position on the arc: t=0 at the left foot, 0.5 at the top, 1 at the right foot.
  const a = orb ? Math.PI * (1 - orb.t) : Math.PI * 0.35;
  const ox = CX + Math.cos(a) * R;
  const oy = CY - Math.sin(a) * R;
  const day = orb?.night === false;
  const FLAG = ["#50698a", "#d8cfbd", "#9a5040", "#5d7a58", "#c7a452"];

  return (
    <div ref={ref} className="footer-horizon pointer-events-none relative -mb-px h-[210px] overflow-hidden md:h-[320px]" aria-hidden="true">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMax slice" className="absolute inset-0 h-full w-full">
        <defs>
          <radialGradient id="fh-glow" cx={ox / W} cy={oy / H} r="0.75" gradientUnits="objectBoundingBox">
            <stop offset="0" stopColor={day ? "#f2cf86" : "#eed3a5"} stopOpacity={day ? 0.22 : 0.14} />
            <stop offset="1" stopColor="#eed3a5" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="fh-orb" cx="0.4" cy="0.35" r="0.7">
            <stop offset="0" stopColor="#fffaf0" />
            <stop offset="0.6" stopColor={day ? "#f3cf86" : "#e8dfc9"} />
            <stop offset="1" stopColor={day ? "#d69b50" : "#b9ab8c"} />
          </radialGradient>
          <radialGradient id="fh-orbglow">
            <stop offset="0" stopColor="#f2e9cf" stopOpacity="0.55" />
            <stop offset="0.4" stopColor="#f2e9cf" stopOpacity="0.14" />
            <stop offset="1" stopColor="#f2e9cf" stopOpacity="0" />
          </radialGradient>
          {/* rim light: each range brightens toward the orb */}
          {ranges.map((r, i) => (
            <linearGradient key={i} id={`fh-rim-${i}`} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2={W} y2="0">
              <stop offset="0" stopColor="#f2e9cf" stopOpacity="0" />
              <stop offset={Math.max(0.05, Math.min(0.95, ox / W))} stopColor="#f2e9cf" stopOpacity={r.rim} />
              <stop offset="1" stopColor="#f2e9cf" stopOpacity="0" />
            </linearGradient>
          ))}
          <linearGradient id="fh-snow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#f2e9cf" stopOpacity="0.5" />
            <stop offset="0.35" stopColor="#f2e9cf" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="fh-mist" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#eed3a5" stopOpacity="0" />
            <stop offset="0.6" stopColor="#eed3a5" stopOpacity="0.07" />
            <stop offset="1" stopColor="#eed3a5" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="fh-window">
            <stop offset="0" stopColor="#ffd999" stopOpacity="0.9" />
            <stop offset="1" stopColor="#ffb85c" stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect width={W} height={H} fill="url(#fh-glow)" />
        <g className="fh-stars">
          {starField.map((s, i) => (
            <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#f2e9cf" style={{ ["--o" as string]: s.o, animationDelay: `${s.d}s` }} opacity={s.o} />
          ))}
        </g>
        <line className="fh-shoot" x1="0" y1="0" x2="70" y2="18" stroke="#f2e9cf" strokeWidth="1.2" strokeLinecap="round" />

        <path className="fh-arc" d={`M ${CX - R} ${CY} A ${R} ${R} 0 0 1 ${CX + R} ${CY}`} fill="none" stroke="#b69e70" strokeOpacity="0.4" strokeWidth="1.5" pathLength={1} />
        {orb && (
          <g className="fh-orb" style={{ transform: `translate(${ox}px, ${oy}px)` }}>
            <circle r="70" fill="url(#fh-orbglow)" />
            <circle r="15" fill="url(#fh-orb)" />
            {orb.night && <circle r="13" cx="6" cy="-4" fill="#17110d" opacity="0.5" />}
          </g>
        )}

        {ranges.map((r, i) => (
          <g key={i} className="fh-layer" style={{ ["--s" as string]: r.speed }}>
            <path d={fillPath(r.pts)} fill={r.fill} />
            <path d={fillPath(r.pts)} fill={`url(#fh-rim-${i})`} opacity="0.16" />
            <path d={toPath(r.pts)} fill="none" stroke={`url(#fh-rim-${i})`} strokeWidth={i === 0 ? 1.4 : 1.1} />
            {r.snow && <path d={fillPath(r.pts)} fill="url(#fh-snow)" opacity="0.55" />}
            {/* mist pooling in the valley in front of this range */}
            {i < 3 && <rect x="0" y={r.base - 6} width={W} height={46} fill="url(#fh-mist)" />}
            {i === 2 && (
              <g className="fh-lodge" transform={`translate(${lodge.x} ${lodge.y + 4})`}>
                <circle r="16" fill="url(#fh-window)" />
                <path d="M-9 0 L0 -7 L9 0 V7 H-9 Z" fill="#1f160f" />
                <rect x="-3.5" y="0.5" width="4" height="3.5" fill="#ffcf7a" />
              </g>
            )}
            {i === 3 && (
              <g className="fh-flags">
                <line x1={flags.a[0]} y1={flags.a[1]} x2={flags.a[0]} y2={yAt(flags.near, flags.a[0])} stroke="#110c08" strokeWidth="2" />
                <line x1={flags.b[0]} y1={flags.b[1]} x2={flags.b[0]} y2={yAt(flags.near, flags.b[0])} stroke="#110c08" strokeWidth="2" />
                <path d={`M${flags.a[0]} ${flags.a[1]} Q${(flags.a[0] + flags.b[0]) / 2} ${(flags.a[1] + flags.b[1]) / 2 + 18} ${flags.b[0]} ${flags.b[1]}`} fill="none" stroke="#3a2a1f" strokeWidth="0.8" />
                {flags.pts.map(([x, y], k) => (
                  <path key={k} className="fh-flag" d={`M${x - 5} ${y} h10 l-1 11 h-8 Z`} fill={FLAG[k % 5]} opacity="0.55" style={{ animationDelay: `${(k % 5) * 0.2}s` }} />
                ))}
              </g>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
}
