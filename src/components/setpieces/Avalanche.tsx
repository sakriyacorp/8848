"use client";

import { useEffect, useState } from "react";
import { Snow } from "@/components/setpieces/Snow";
import { useUI } from "@/lib/ui";

/* Easter egg: type 8848 anywhere (outside a form field), tap the logo eight times, or give your
   phone a good shake (Android; iOS once "Tilt to shine" has been allowed). The page
   gives a small shudder, a powder cloud rolls down off the top of the screen, a burst of snow
   follows, and a line of yeti footprints wanders across and fades. Every Snow on the page also
   hears the "8848:avalanche" event and joins in. */

const STEPS = 13;
const trail = (t: number) => [80 + t * 840, 820 - Math.sin(t * Math.PI * 0.9) * 260 + t * 40];

export function Avalanche() {
  const [run, setRun] = useState(0);

  useEffect(() => {
    let buf = "";
    let taps: number[] = [];
    const fire = () => setRun((r) => r + 1);
    const key = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t?.closest("input,textarea,select,[contenteditable=true]")) return;
      if (e.key.length !== 1) return;
      buf = (buf + e.key).slice(-4);
      if (buf === "8848") {
        buf = "";
        fire();
      }
    };
    const click = (e: MouseEvent) => {
      if (!(e.target as Element | null)?.closest("[data-logo-tap]")) return;
      const now = performance.now();
      taps = taps.filter((t) => now - t < 4000);
      taps.push(now);
      if (taps.length >= 8) {
        taps = [];
        fire();
      }
    };
    // shake: three hard jolts inside a second (cool-down so it can't machine-gun)
    let jolts: number[] = [];
    let quiet = 0;
    const motion = (e: DeviceMotionEvent) => {
      const g = e.acceleration ?? e.accelerationIncludingGravity;
      if (!g || g.x == null || g.y == null || g.z == null) return;
      const m = Math.hypot(g.x, g.y, g.z) - (e.acceleration ? 0 : 9.81);
      const now = performance.now();
      if (now < quiet || m < 17) return;
      if (jolts.length && now - jolts[jolts.length - 1] < 120) return;
      jolts = jolts.filter((t) => now - t < 1000);
      jolts.push(now);
      if (jolts.length >= 3) {
        jolts = [];
        quiet = now + 9000;
        fire();
      }
    };
    addEventListener("keydown", key);
    addEventListener("click", click, true);
    addEventListener("devicemotion", motion);
    return () => {
      removeEventListener("keydown", key);
      removeEventListener("click", click, true);
      removeEventListener("devicemotion", motion);
    };
  }, []);

  if (!run) return null;
  return <AvalancheRun key={run} />;
}

function AvalancheRun() {
  const [done, setDone] = useState(false);

  useEffect(() => {
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const root = document.documentElement;
    if (!reduce) root.classList.add("quake");
    navigator.vibrate?.([30, 40, 60, 40, 30]);
    const t1 = setTimeout(() => dispatchEvent(new Event("8848:avalanche")), 60);
    const t2 = setTimeout(() => root.classList.remove("quake"), 900);
    const t3 = setTimeout(() => useUI.getState().showToast("Something big just walked through. It ordered the jhol momo.", { plain: true }), 2600);
    const t4 = setTimeout(() => setDone(true), 11000);
    return () => {
      [t1, t2, t3, t4].forEach(clearTimeout);
      root.classList.remove("quake");
    };
  }, []);

  if (done) return null;
  return (
    <div aria-hidden="true" className="avalanche pointer-events-none fixed inset-0 z-[65] overflow-hidden">
      <div className="avalanche-cloud">
        <i />
        <i />
        <i />
        <i />
      </div>
      <Snow avalanche density={0.4} wind={0.7} interactive={false} />
      <svg className="yeti-trail absolute inset-0 h-full w-full" viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice">
        {Array.from({ length: STEPS }, (_, i) => {
          const t = i / (STEPS - 1);
          const [x, y] = trail(t);
          const [x2, y2] = trail(t + 0.01);
          const ang = (Math.atan2(y2 - y, x2 - x) * 180) / Math.PI + 90;
          const side = i % 2 ? 1 : -1;
          return (
            <g key={i} transform={`translate(${x + side * 12 * Math.cos((ang * Math.PI) / 180)} ${y + side * 12 * Math.sin((ang * Math.PI) / 180)}) rotate(${ang}) scale(${side} 1)`}>
              <g className="yeti-step" style={{ animationDelay: `${1.3 + i * 0.26}s` }}>
                <ellipse cx="0" cy="6" rx="11" ry="17" />
                <circle cx="-9" cy="-15" r="3.6" />
                <circle cx="-2.5" cy="-18" r="3.9" />
                <circle cx="4.5" cy="-17" r="3.6" />
                <circle cx="10" cy="-12.5" r="3.2" />
                <circle cx="-13.5" cy="-8" r="3" />
              </g>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
