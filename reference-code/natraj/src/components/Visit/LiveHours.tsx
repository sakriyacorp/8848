"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { dayName, formatWindows, isOpenAt, toLocal, type DayKey, type Hours } from "@/lib/hours";

const ORDER: DayKey[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

export function OpenPill({ hours, className }: { hours: Hours; className?: string }) {
  const [open, setOpen] = useState<boolean | null>(null);

  useEffect(() => {
    const tick = () => setOpen(isOpenAt(new Date(), hours));
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, [hours]);

  return (
    <span
      aria-hidden={open === null || undefined}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-opacity duration-300",
        open === null && "opacity-0",
        open ? "border-green/50 text-cream" : "border-line text-cream-2",
        className,
      )}
    >
      <span aria-hidden="true" className={cn("h-2 w-2 rounded-full", open ? "bg-green" : "bg-red")} />
      {open === null ? "Closed" : open ? "Open now" : "Closed"}
    </span>
  );
}

export function HoursTable({ hours }: { hours: Hours }) {
  const [today, setToday] = useState<DayKey | null>(null);

  useEffect(() => {
    setToday(toLocal(new Date()).day);
  }, []);

  return (
    <table className="mt-4 w-full text-[14px]">
      <tbody>
        {ORDER.map((d) => {
          const windows = hours[d];
          const isToday = d === today;
          return (
            <tr key={d} className={cn("border-t border-line first:border-t-0", isToday ? "text-cream" : "text-cream-2")}>
              <th scope="row" className="flex items-center gap-2 py-2.5 pr-3 text-left font-medium">
                <span aria-hidden="true" className={cn("h-1.5 w-1.5 rounded-full", isToday ? "bg-red" : "bg-transparent")} />
                {dayName(d)}
                {isToday && <span className="sr-only">(today)</span>}
              </th>
              <td className="py-2.5 text-right tabular-nums">
                {windows
                  ? windows.map((w) => (
                      <span key={w.join("-")} className="block">
                        {formatWindows([w])}
                      </span>
                    ))
                  : "Closed"}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
