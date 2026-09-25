"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useBag } from "@/lib/bag";

/* Sheet, drawer and toast (and the motion library behind them) are only needed once the
   visitor interacts, so their chunk is requested on the first pointer/key event or after a
   short delay, well after the hero has painted. The bag rehydrates immediately so the badge
   count is right on load. */
const Overlays = dynamic(() => import("@/components/Overlays").then((m) => m.Overlays), { ssr: false });

const WAKE_EVENTS = ["pointerdown", "keydown", "touchstart"] as const;

export function OverlaysLoader({ available }: { available: string[] }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    useBag.persist.rehydrate();
  }, []);

  useEffect(() => {
    const wake = () => setReady(true);
    const timer = setTimeout(wake, 1500);
    WAKE_EVENTS.forEach((e) => window.addEventListener(e, wake, { once: true, passive: true }));
    return () => {
      clearTimeout(timer);
      WAKE_EVENTS.forEach((e) => window.removeEventListener(e, wake));
    };
  }, []);

  return ready ? <Overlays available={available} /> : null;
}
