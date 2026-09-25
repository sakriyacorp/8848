"use client";

import { useStatus } from "@/lib/use-status";
import { ButterLamp } from "@/components/setpieces/ButterLamp";
import { cn } from "@/lib/cn";

export function FooterStatus() {
  const st = useStatus();
  return (
    <p aria-live="polite" className={cn("mt-6 flex items-center gap-3 text-[14px] transition-opacity duration-700", st ? "opacity-100" : "opacity-0")}>
      <ButterLamp lit={!!st?.open} size={18} />
      <span className={st?.open ? "text-brass-hi" : "text-muted"}>{st?.line ?? "Hours below"}</span>
    </p>
  );
}
