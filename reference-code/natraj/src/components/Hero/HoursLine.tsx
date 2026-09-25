"use client";

import { useEffect, useState } from "react";
import { hoursLine, hoursSummary, type Hours } from "@/lib/hours";

/* Server-rendered as the weekly summary, then swapped for the live status on the client. */
export function HoursLine({ hours, className }: { hours: Hours; className?: string }) {
  const [text, setText] = useState<string | null>(null);

  useEffect(() => {
    const tick = () => setText(hoursLine(new Date(), hours));
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, [hours]);

  return <span className={className}>{text ?? hoursSummary(hours)[0]}</span>;
}
