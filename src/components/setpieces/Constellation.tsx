"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { rng } from "@/lib/ridge";
import { ARC_PATH } from "@/components/brand/Logo";
import { PEAKS_HULL_D, PEAKS_BOX } from "@/components/brand/logo-paths";

/* Press and hold the bar's night sky: forty loose stars drift together into the 8848 mark —
   the arc and the ridge of the peaks — and faint constellation lines draw between them. Let go
   and they wander back after a moment. There's also a button, for keyboards and the curious. */

const VB = { x: 70, y: 36, w: 1780, h: 984 };

function samplePath(d: string, n: number, from = 0, to = 1): Array<[number, number]> {
  const p = document.createElementNS("http://www.w3.org/2000/svg", "path");
  p.setAttribute("d", d);
  const len = p.getTotalLength();
  return Array.from({ length: n }, (_, i) => {
    const pt = p.getPointAtLength(len * (from + ((to - from) * i) / (n - 1)));
    return [pt.x, pt.y];
  });
}

export function Constellation() {
  const [targets, setTargets] = useState<{ arc: Array<[number, number]>; ridge: Array<[number, number]> } | null>(null);
  const [formed, setFormed] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const hold = useRef<{ t: number; x: number; y: number } | null>(null);
  const release = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // the ridge is the top edge of the snow hull: sample its first leg only (not the base)
    const hullTop = PEAKS_HULL_D.split(" L ").slice(0, -2).join(" L ");
    setTargets({ arc: samplePath(ARC_PATH, 17), ridge: samplePath(hullTop, 26, 0.02, 0.98) });
  }, []);

  const loose = useMemo(() => {
    const r = rng(42);
    return Array.from({ length: 43 }, () => [VB.x - 500 + r() * (VB.w + 1000), VB.y - 300 + r() * (VB.h + 500)] as [number, number]);
  }, []);

  useEffect(() => {
    const el = root.current?.parentElement;
    if (!el) return;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const down = (e: PointerEvent) => {
      if ((e.target as Element).closest("a,button,input")) return;
      hold.current = { t: performance.now(), x: e.clientX, y: e.clientY };
      timer = setTimeout(() => {
        if (release.current) clearTimeout(release.current);
        setFormed(true);
      }, 280);
    };
    const move = (e: PointerEvent) => {
      if (!hold.current || !timer) return;
      if (Math.hypot(e.clientX - hold.current.x, e.clientY - hold.current.y) > 12) {
        clearTimeout(timer);
        timer = null;
      }
    };
    const up = () => {
      if (timer) clearTimeout(timer);
      timer = null;
      hold.current = null;
      release.current = setTimeout(() => setFormed(false), 2600);
    };
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    addEventListener("pointerup", up);
    addEventListener("pointercancel", up);
    return () => {
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      removeEventListener("pointerup", up);
      removeEventListener("pointercancel", up);
      if (timer) clearTimeout(timer);
    };
  }, []);

  const pts = targets ? [...targets.arc, ...targets.ridge] : [];
  const arcN = targets?.arc.length ?? 0;
  const line = (arr: Array<[number, number]>) => arr.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");

  return (
    <div ref={root} className={cn("constellation pointer-events-none absolute inset-0 z-[1]", formed && "is-formed")}>
      <svg viewBox={`${VB.x - 200} ${VB.y - 120} ${VB.w + 400} ${VB.h + 240}`} className="absolute left-1/2 top-[34%] w-[min(92vw,720px)] -translate-x-1/2 -translate-y-1/2 overflow-visible" aria-hidden="true">
        {targets && (
          <>
            <path className="cn-line" d={line(targets.arc)} pathLength={1} />
            <path className="cn-line" d={line(targets.ridge)} pathLength={1} style={{ animationDelay: "0.2s" }} />
            <path className="cn-line cn-faint" d={`M${PEAKS_BOX.minX} ${PEAKS_BOX.maxY - 40} L${PEAKS_BOX.maxX} ${PEAKS_BOX.maxY - 40}`} pathLength={1} />
          </>
        )}
        {pts.map(([x, y], i) => {
          const [lx, ly] = loose[i % loose.length];
          return (
            <g
              key={i}
              className="cn-star"
              style={{
                ["--lx" as string]: `${lx}px`,
                ["--ly" as string]: `${ly}px`,
                ["--tx" as string]: `${x}px`,
                ["--ty" as string]: `${y}px`,
                transitionDelay: `${(i % 9) * 45}ms`,
              }}
            >
              <circle r={i < arcN ? 7 : 8} fill="#fff8e6" />
              <circle r={22} fill="#f2e9cf" opacity=".16" />
            </g>
          );
        })}
      </svg>
      <button
        type="button"
        onClick={() => {
          if (release.current) clearTimeout(release.current);
          setFormed(true);
          release.current = setTimeout(() => setFormed(false), 4200);
        }}
        className="caps pointer-events-auto absolute bottom-6 right-6 rounded-full border border-line-strong bg-void/40 px-4 py-2 text-[10px] text-brass/80 backdrop-blur transition-colors hover:text-brass-hi"
      >
        Align the stars
      </button>
    </div>
  );
}
