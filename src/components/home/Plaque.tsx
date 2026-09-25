"use client";

import dynamic from "next/dynamic";
import { forwardRef, useEffect, useRef, useState, type CSSProperties } from "react";
import { cn } from "@/lib/cn";
import { isOn } from "@/config/features";
import { subscribeTilt } from "@/lib/tilt";
import { Logo } from "@/components/brand/Logo";

const PlaqueGL = dynamic(() => import("@/components/setpieces/PlaqueGL"), { ssr: false });

/* The brass table plaque from the reference photo, in CSS: brushed brass face with the logo
   engraved, a walnut stand, a soft shadow on the table. The specular highlight and a few
   degrees of tilt follow the mouse or the phone. `logoRef` is the element the hero measures to
   find the arc. */
export const Plaque = forwardRef<HTMLDivElement, { className?: string; style?: CSSProperties; interactive?: boolean }>(
  function Plaque({ className, style, interactive = true }, logoRef) {
    const face = useRef<HTMLDivElement>(null);
    const tiltEl = useRef<HTMLDivElement>(null);
    const [gl, setGl] = useState(false);

    // three.js face while the plaque is on (or near) screen; the CSS face underneath is the
    // fallback and is what you see when WebGL is missing, off, or reduced motion is set
    useEffect(() => {
      const f = face.current;
      if (!f || !interactive || !isOn("plaque")) return;
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      let ok = false;
      try {
        ok = !!document.createElement("canvas").getContext("webgl2");
      } catch {}
      if (!ok) return;
      // wait for the page to settle (first paint, fonts, hydration) before pulling in three.js;
      // the CSS plaque is already on screen and the GL face cross-fades over it
      let io: IntersectionObserver | null = null;
      const w = window as unknown as { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number; cancelIdleCallback?: (h: number) => void };
      const start = () => {
        io = new IntersectionObserver(([e]) => setGl(e.isIntersecting), { rootMargin: "30% 0px" });
        io.observe(f);
      };
      const h = w.requestIdleCallback ? w.requestIdleCallback(start, { timeout: 1800 }) : window.setTimeout(start, 900);
      return () => {
        if (w.cancelIdleCallback && w.requestIdleCallback) w.cancelIdleCallback(h);
        else clearTimeout(h);
        io?.disconnect();
      };
    }, [interactive]);

    useEffect(() => {
      const f = face.current;
      const t = tiltEl.current;
      if (!f || !t || !interactive) return;
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      return subscribeTilt((x, y) => {
        f.style.setProperty("--sx", `${50 + x * 42}%`);
        f.style.setProperty("--sy", `${26 + y * 34}%`);
        f.style.setProperty("--band", `${x * 30}%`);
        t.style.setProperty("--ry", `${x * 9}deg`);
        t.style.setProperty("--rx", `${-y * 5}deg`);
      });
    }, [interactive]);

    return (
      <div className={cn("plaque-3d relative", className)} style={style}>
        <div ref={tiltEl} className="plaque-tilt relative">
          <div ref={face} className="plaque-face brass sheen relative aspect-[1/1.04] w-full rounded-[3px]" style={{ ["--sheen-delay" as string]: "1.2s" }}>
            <div aria-hidden="true" className="plaque-band" />
            {gl && <PlaqueGL />}
            <div ref={logoRef} className="absolute inset-[9%_9%_11%]">
              <Logo variant="lockup" material="engraved" className="h-full w-full" title="8848 Himalayan Fusion & Bar, engraved on a brass plaque" />
            </div>
          </div>
          <div aria-hidden="true" className="plaque-stand walnut" />
        </div>
        <div aria-hidden="true" className="plaque-shadow" />
      </div>
    );
  },
);
