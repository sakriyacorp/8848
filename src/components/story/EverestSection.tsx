"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { isOn } from "@/config/features";
import { HOTSPOTS } from "@/data/everest";
import { MandalaLoader } from "@/components/setpieces/MandalaLoader";
import { MountainScene } from "@/components/setpieces/MountainScene";
import type { PairDish } from "@/components/setpieces/Everest3D";

const Everest3D = dynamic(() => import("@/components/setpieces/Everest3D"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[70svh] min-h-[440px] items-center justify-center rounded-[30px] border border-line md:h-[78svh]">
      <MandalaLoader label="Raising the mountain" />
    </div>
  ),
});

/* Loads the 3D massif only when it's close, and only with WebGL2 and motion allowed; otherwise
   a still of the living mountain with the camps as cards. */
export function EverestSection({ dishes }: { dishes: Record<string, PairDish> }) {
  const holder = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<"pending" | "3d" | "still">("pending");
  const [near, setNear] = useState(false);

  useEffect(() => {
    let ok = false;
    try {
      ok = !!document.createElement("canvas").getContext("webgl2");
    } catch {}
    setMode(isOn("everest3d") && ok ? "3d" : "still");
  }, []);

  useEffect(() => {
    const el = holder.current;
    if (!el || mode !== "3d") return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setNear(true), { rootMargin: "80% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, [mode]);

  if (mode === "still") {
    return (
      <div>
        <div className="relative h-[52svh] min-h-[360px] overflow-hidden rounded-[30px] border border-line">
          <MountainScene phase="golden" />
        </div>
        <ol className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {HOTSPOTS.map((h) => (
            <li key={h.name} className="rounded-[22px] border border-line bg-void/30 p-5">
              <p className="caps num text-[9.5px] text-brass">{h.alt}</p>
              <p className="display mt-1 text-[22px] text-brass-hi">{h.name}</p>
              <p className="mt-1 text-[14px] text-text/80">{h.story}</p>
            </li>
          ))}
        </ol>
      </div>
    );
  }
  return <div ref={holder}>{mode === "3d" && near ? <Everest3D dishes={dishes} /> : <div className="h-[70svh] min-h-[440px] md:h-[78svh]" />}</div>;
}
