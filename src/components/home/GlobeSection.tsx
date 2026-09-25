"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { isOn } from "@/config/features";
import { MandalaLoader } from "@/components/setpieces/MandalaLoader";

const Globe = dynamic(() => import("@/components/setpieces/Globe"), {
  ssr: false,
  loading: () => (
    <div className="relative h-[260svh]">
      <div className="sticky top-0 flex h-[100svh] items-center justify-center">{isOn("mandalaLoader") ? <MandalaLoader label="Finding Harrisonburg" /> : null}</div>
    </div>
  ),
});

/* The globe hands the climb back down to Harrisonburg. Loads near the viewport; without WebGL2
   or with reduced motion it's a still brass drawing of the same journey. */
export function GlobeSection() {
  const holder = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<"pending" | "3d" | "still">("pending");
  const [near, setNear] = useState(false);

  useEffect(() => {
    let ok = false;
    try {
      ok = !!document.createElement("canvas").getContext("webgl2");
    } catch {}
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    setMode(isOn("globe") && ok && !reduce ? "3d" : "still");
  }, []);

  useEffect(() => {
    const el = holder.current;
    if (!el || mode !== "3d") return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setNear(true), { rootMargin: "120% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, [mode]);

  if (mode === "still") return <GlobeStill />;
  return <div ref={holder} id="globe">{mode === "3d" && near ? <Globe /> : <div className="h-[260svh]" />}</div>;
}

function GlobeStill() {
  return (
    <section aria-label="From Everest to Harrisonburg" className="relative overflow-hidden bg-night py-24">
      <div className="container-x flex flex-col items-center text-center">
        <svg viewBox="0 0 300 300" className="h-[260px] w-[260px]" aria-hidden="true">
          <circle cx="150" cy="150" r="118" fill="#1a120d" stroke="#b69e70" strokeOpacity=".5" />
          <circle cx="150" cy="150" r="136" fill="none" stroke="#b69e70" strokeOpacity=".3" />
          <ellipse cx="150" cy="150" rx="118" ry="40" fill="none" stroke="#9b7e53" strokeOpacity=".25" />
          <ellipse cx="150" cy="150" rx="50" ry="118" fill="none" stroke="#9b7e53" strokeOpacity=".25" />
          <path d="M214 118 Q 150 20 70 110" fill="none" stroke="#f2e2b6" strokeWidth="2" strokeDasharray="4 5" />
          <circle cx="214" cy="118" r="5" fill="#f2e2b6" />
          <circle cx="70" cy="110" r="6" fill="#f2e2b6" />
        </svg>
        <p className="caps mt-6 text-[10px] text-brass">Kathmandu → Harrisonburg</p>
        <p className="display mt-2 text-[clamp(1.8rem,5vw,3.2rem)] text-brass-hi">7,752 miles from the roof of the world to Reservoir Street.</p>
      </div>
    </section>
  );
}
