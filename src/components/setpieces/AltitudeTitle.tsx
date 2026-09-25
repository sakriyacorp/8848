"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/* The browser tab keeps climbing with you: while the ascent is running the title reads
   "▲ 6,400 m · 8848". Leave the tab and it calls you back down for dinner. */
type W = { __8848alt?: number; __8848altAt?: number };

export function AltitudeTitle() {
  const pathname = usePathname();

  useEffect(() => {
    let original = document.title;
    let overriding = false;
    const set = (t: string) => {
      if (!overriding) original = document.title;
      overriding = true;
      document.title = t;
    };
    const restore = () => {
      if (overriding) document.title = original;
      overriding = false;
    };
    const tick = () => {
      if (document.hidden) return;
      const w = window as unknown as W;
      if (w.__8848alt && w.__8848altAt && performance.now() - w.__8848altAt < 700) set(`▲ ${Math.round(w.__8848alt).toLocaleString("en-US")} m · 8848`);
      else restore();
    };
    const vis = () => {
      if (document.hidden) set("Your momos are getting cold… · 8848");
      else {
        restore();
        tick();
      }
    };
    const iv = setInterval(tick, 300);
    document.addEventListener("visibilitychange", vis);
    return () => {
      clearInterval(iv);
      document.removeEventListener("visibilitychange", vis);
      // a route change owns the title now; only put ours back if nothing replaced it
      if (overriding && document.title.startsWith("▲")) document.title = original;
    };
  }, [pathname]);

  return null;
}
