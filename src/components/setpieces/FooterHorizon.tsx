"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ridgePath, stars } from "@/lib/ridge";
import { skyAt } from "@/lib/sky";
import { isOn } from "@/config/features";
import { trackSection } from "@/lib/section-track";

const W = 1440;
const H = 360;
const CX = 720;
const CY = 330;
const R = 300;

/* Footer horizon: layered ridges that slide at different speeds as the footer rises into view,
   stars, and the logo's arc drawn across the sky with the moon (or sun) sitting on it at the
   real position for this time in Harrisonburg. */
export function FooterHorizon() {
  const ref = useRef<HTMLDivElement>(null);
  const [orb, setOrb] = useState<{ t: number; night: boolean } | null>(null);

  const layers = useMemo(
    () => [
      { d: ridgePath({ width: W, height: H, base: 250, amp: 90, rough: 0.52, seed: 11, peaks: [[720, 150], [520, 70], [930, 90]] }), fill: "#3a2a1f", speed: 0.25, snow: true },
      { d: ridgePath({ width: W, height: H, base: 285, amp: 80, rough: 0.55, seed: 23, peaks: [[300, 80], [1180, 95]] }), fill: "#2a1d15", speed: 0.5, snow: false },
      { d: ridgePath({ width: W, height: H, base: 318, amp: 50, rough: 0.6, seed: 37 }), fill: "#1c140e", speed: 0.8, snow: false },
      { d: ridgePath({ width: W, height: H, base: 345, amp: 26, rough: 0.6, seed: 41 }), fill: "#120d09", speed: 1.1, snow: false },
    ],
    [],
  );
  const starField = useMemo(() => stars(70, 7, W, 240), []);

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

  return (
    <div ref={ref} className="footer-horizon pointer-events-none relative -mb-px h-[200px] overflow-hidden md:h-[300px]" aria-hidden="true">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMax slice" className="absolute inset-0 h-full w-full">
        <defs>
          <radialGradient id="fh-glow" cx="0.5" cy="1" r="0.7">
            <stop offset="0" stopColor="#eed3a5" stopOpacity="0.16" />
            <stop offset="1" stopColor="#eed3a5" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="fh-orb" cx="0.4" cy="0.35" r="0.7">
            <stop offset="0" stopColor="#fffaf0" />
            <stop offset="0.6" stopColor={orb?.night === false ? "#f3cf86" : "#e8dfc9"} />
            <stop offset="1" stopColor={orb?.night === false ? "#d69b50" : "#b9ab8c"} />
          </radialGradient>
          <radialGradient id="fh-orbglow">
            <stop offset="0" stopColor="#f2e9cf" stopOpacity="0.5" />
            <stop offset="1" stopColor="#f2e9cf" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="fh-snow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#f2e9cf" stopOpacity="0.55" />
            <stop offset="0.4" stopColor="#f2e9cf" stopOpacity="0" />
          </linearGradient>
        </defs>
        <rect width={W} height={H} fill="url(#fh-glow)" />
        <g className="fh-stars">
          {starField.map((s, i) => (
            <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#f2e9cf" style={{ ["--o" as string]: s.o, animationDelay: `${s.d}s` }} opacity={s.o} />
          ))}
        </g>
        <path
          className="fh-arc"
          d={`M ${CX - R} ${CY} A ${R} ${R} 0 0 1 ${CX + R} ${CY}`}
          fill="none"
          stroke="#b69e70"
          strokeOpacity="0.35"
          strokeWidth="1.5"
          pathLength={1}
        />
        {orb && (
          <g className="fh-orb" style={{ transform: `translate(${ox}px, ${oy}px)` }}>
            <circle r="46" fill="url(#fh-orbglow)" />
            <circle r="15" fill="url(#fh-orb)" />
            {orb.night && <circle r="13" cx="6" cy="-4" fill="#17110d" opacity="0.55" />}
          </g>
        )}
        {layers.map((l, i) => (
          <g key={i} className="fh-layer" style={{ ["--s" as string]: l.speed }}>
            <path d={l.d} fill={l.fill} />
            {l.snow && <path d={l.d} fill="url(#fh-snow)" opacity="0.5" />}
          </g>
        ))}
      </svg>
    </div>
  );
}
