"use client";

import { cn } from "@/lib/cn";
import { useStatus } from "@/lib/use-status";
import { ButterLamp } from "@/components/setpieces/ButterLamp";

/* "Open now" as a lit butter lamp; closed as a lamp just blown out, still smoking. */
export function LiveStatus({ className }: { className?: string }) {
  const st = useStatus();
  return (
    <p aria-live="polite" className={cn("inline-flex items-center gap-3 rounded-full border border-line-strong bg-void/40 py-2 pl-3 pr-5 text-[14.5px] transition-opacity duration-700", st ? "opacity-100" : "opacity-0", className)}>
      <ButterLamp lit={!!st?.open} size={22} />
      <span className={st?.open ? "text-brass-hi" : "text-muted"}>{st?.line ?? "Checking the lamps…"}</span>
    </p>
  );
}
