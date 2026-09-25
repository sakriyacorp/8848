"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useBag } from "@/lib/bag";

/* Sheet, pack drawer, toast and the flight layer (plus motion) load on the first interaction or
   shortly after paint, so they never compete with the hero. The bag rehydrates immediately so
   the pack badge is right on load. */
const Overlays = dynamic(() => import("@/components/order/Overlays").then((m) => m.Overlays), { ssr: false });
const Ambient = dynamic(() => import("@/components/layout/Ambient").then((m) => m.Ambient), { ssr: false });

const WAKE = ["pointerdown", "keydown", "touchstart", "scroll"] as const;

export function ClientShell({ available }: { available: string[] }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    useBag.persist.rehydrate();
  }, []);

  useEffect(() => {
    const wake = () => setReady(true);
    const t = setTimeout(wake, 1400);
    WAKE.forEach((e) => addEventListener(e, wake, { once: true, passive: true }));
    return () => {
      clearTimeout(t);
      WAKE.forEach((e) => removeEventListener(e, wake));
    };
  }, []);

  return ready ? (
    <>
      <Overlays available={available} />
      <Ambient />
    </>
  ) : null;
}
