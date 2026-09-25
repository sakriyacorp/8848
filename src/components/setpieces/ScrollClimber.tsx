"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { formatWhole } from "@/lib/format";

/* A hairline ridge up the right edge of the page with a tiny climber on it: your reading
   position, as an ascent. Camps tick past, the altitude shows on hover, and at the bottom of the
   page they plant a flag. Click the ridge to jump. Wide screens only — on a phone it would be
   clutter. */

const H = 400;
const RIDGE = (() => {
  let s = 7;
  const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const pts: [number, number][] = [[14, H]];
  for (let y = H - 14; y > 8; y -= 12 + r() * 14) pts.push([6 + r() * 16, y]);
  pts.push([14, 4]);
  return "M" + pts.map((p) => p.map((v) => v.toFixed(1)).join(" ")).join(" L");
})();

export function ScrollClimber() {
  const pathname = usePathname();
  const path = useRef<SVGPathElement>(null);
  const ink = useRef<SVGPathElement>(null);
  const man = useRef<HTMLSpanElement>(null);
  const [on, setOn] = useState(false);
  const [top, setTop] = useState(false);
  const [alt, setAlt] = useState(405);

  useEffect(() => {
    const p = path.current;
    if (!p) return;
    const len = p.getTotalLength();
    if (ink.current) ink.current.style.strokeDasharray = `${len}`;
    let raf = 0;
    let shown = -1;
    const update = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - innerHeight;
      const long = max > innerHeight * 1.2;
      const prog = max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0;
      const pt = p.getPointAtLength(len * prog);
      // (the svg stretches to the rail, so the climber is an HTML dot placed in % — stays round)
      if (man.current) {
        man.current.style.left = `${(pt.x / 28) * 100}%`;
        man.current.style.top = `${(pt.y / H) * 100}%`;
      }
      if (ink.current) ink.current.style.strokeDashoffset = `${len * (1 - prog)}`;
      const want = long && scrollY > innerHeight * 0.6 ? 1 : 0;
      if (want !== shown) {
        shown = want;
        setOn(!!want);
      }
      setTop(prog > 0.985);
      setAlt(405 + prog * (8849 - 405));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onScroll);
    };
  }, [pathname]);

  const jump = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const prog = 1 - (e.clientY - r.top) / r.height;
    const max = document.documentElement.scrollHeight - innerHeight;
    scrollTo({ top: max * Math.min(1, Math.max(0, prog)), behavior: "smooth" });
  };

  return (
    <div
      aria-hidden="true"
      onClick={jump}
      className={cn("scroll-climber group fixed right-3 top-[20svh] z-30 hidden h-[62svh] w-7 cursor-pointer transition-opacity duration-700 xl:block", on ? "opacity-100" : "pointer-events-none opacity-0", top && "at-top")}
    >
      <svg viewBox={`0 0 28 ${H}`} preserveAspectRatio="none" className="h-full w-full overflow-visible">
        <path ref={path} d={RIDGE} fill="none" stroke="rgba(182,158,112,.28)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        <path ref={ink} d={RIDGE} fill="none" stroke="rgba(242,226,182,.8)" strokeWidth="1.2" vectorEffect="non-scaling-stroke" style={{ strokeDashoffset: 0 }} />
        {[0.25, 0.5, 0.75].map((c) => (
          <line key={c} x1="0" x2="4" y1={H * c} y2={H * c} stroke="rgba(182,158,112,.45)" vectorEffect="non-scaling-stroke" />
        ))}
      </svg>
      <svg viewBox="0 0 12 18" className="scroll-climber-flag absolute left-1/2 top-0 h-[18px] w-3 -translate-y-full">
        <line x1="1" y1="18" x2="1" y2="1" stroke="#dcbf7b" strokeWidth="1" />
        <path d="M1 1 L11 4 L1 7 Z" fill="#dcbf7b" />
      </svg>
      <span ref={man} className="absolute h-[9px] w-[9px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brass-hi shadow-[0_0_0_4px_rgba(220,191,123,.16),0_0_12px_rgba(242,226,182,.6)]" />
      <span className="num caps pointer-events-none absolute right-8 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-full border border-line bg-night/85 px-2.5 py-1 text-[10px] text-brass-hi opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        ▲ {formatWhole(alt)} m
      </span>
    </div>
  );
}
