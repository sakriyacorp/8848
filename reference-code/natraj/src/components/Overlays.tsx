"use client";

import { useMemo } from "react";
import { MotionConfig } from "motion/react";
import { DishSheet } from "@/components/DishSheet/DishSheet";
import { CartDrawer } from "@/components/CartDrawer/CartDrawer";
import { Toast } from "@/components/Toast/Toast";

export function Overlays({ available }: { available: string[] }) {
  const set = useMemo(() => new Set(available), [available]);

  return (
    <MotionConfig reducedMotion="user" transition={{ duration: 0.26, ease: [0.2, 0.8, 0.2, 1] }}>
      <DishSheet available={set} />
      <CartDrawer available={set} />
      <Toast />
    </MotionConfig>
  );
}
