"use client";

import { useEffect } from "react";
import { useBag } from "@/lib/bag";

/* Client-only chrome that every page shares. The bag rehydrates immediately so the pack
   badge is right on load; overlays and ambient pieces are added here as they're built. */
export function ClientShell({ available }: { available: string[] }) {
  void available;
  useEffect(() => {
    useBag.persist.rehydrate();
  }, []);
  return null;
}
