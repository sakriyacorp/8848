"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { isOn } from "@/config/features";
import { ClimbStatic, type ClimbDish } from "@/components/climb/ClimbStatic";
import { MandalaLoader } from "@/components/setpieces/MandalaLoader";

/* Chooses the climb: the scroll-driven 3D ascent when WebGL is available and motion is welcome,
   otherwise the SVG route. The 3D scene (and three.js) only loads when the section is near. */
const Ascent3D = dynamic(() => import("@/components/climb/Ascent3D"), {
  ssr: false,
  loading: () => (
    <div className="relative h-[950svh]">
      <div className="sticky top-0 flex h-[100svh] items-center justify-center">{isOn("mandalaLoader") ? <MandalaLoader /> : null}</div>
    </div>
  ),
});

function webglOK(): boolean {
  try {
    const c = document.createElement("canvas");
    return !!c.getContext("webgl2");
  } catch {
    return false;
  }
}

export function Climb({ dishes }: { dishes: Record<string, ClimbDish> }) {
  const [mode, setMode] = useState<"pending" | "3d" | "static">("pending");
  const [near, setNear] = useState(false);
  const holder = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const force = new URLSearchParams(location.search).get("climb");
    if (force === "static") return setMode("static");
    setMode(!reduce && isOn("ascent") && webglOK() ? "3d" : "static");
  }, []);

  useEffect(() => {
    if (mode !== "3d") return;
    const el = holder.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setNear(true), { rootMargin: "150% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, [mode]);

  const fail = useCallback(() => setMode("static"), []);

  if (mode === "static") return <ClimbStatic dishes={dishes} />;
  return <div ref={holder} className="min-h-[100svh]">{mode === "3d" && near ? <Ascent3D dishes={dishes} onFail={fail} /> : <div className="h-[950svh]" />}</div>;
}
