"use client";

import { useMemo } from "react";
import { MotionConfig } from "motion/react";
import { DishSheet } from "@/components/order/DishSheet";
import { PackDrawer } from "@/components/order/PackDrawer";
import { Toast } from "@/components/order/Toast";
import { FlightLayer } from "@/components/order/FlightLayer";

export function Overlays({ available }: { available: string[] }) {
  const set = useMemo(() => new Set(available), [available]);
  return (
    <MotionConfig reducedMotion="user" transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}>
      <DishSheet available={set} />
      <PackDrawer available={set} />
      <Toast />
      <FlightLayer />
    </MotionConfig>
  );
}
