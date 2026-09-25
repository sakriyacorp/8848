"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { site } from "@/config/site";
import { formatWindows, toLocal, type DayKey } from "@/lib/hours";

const ORDER: DayKey[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const SHORT: Record<DayKey, string> = { mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu", fri: "Fri", sat: "Sat", sun: "Sun" };

/* Kitchen + bar hours, today's row lit. Server renders all rows; the highlight arrives on mount. */
export function HoursTable({ tone = "dark", compact = false }: { tone?: "dark" | "paper"; compact?: boolean }) {
  const [today, setToday] = useState<DayKey | null>(null);
  useEffect(() => setToday(toLocal(new Date()).day), []);
  const paper = tone === "paper";

  return (
    <table className={cn("w-full", compact ? "text-[13.5px]" : "text-[14.5px]")}>
      <caption className="sr-only">Opening hours for the kitchen and the bar</caption>
      <thead>
        <tr className={cn("caps text-[10px]", paper ? "text-bronze" : "text-muted")}>
          <th scope="col" className="pb-2 text-left font-medium">Day</th>
          <th scope="col" className="pb-2 text-right font-medium">Kitchen</th>
          {!compact && <th scope="col" className="pb-2 pl-4 text-right font-medium">Bar</th>}
        </tr>
      </thead>
      <tbody>
        {ORDER.map((d) => {
          const k = site.hours[d];
          const b = site.barHours[d];
          const isToday = d === today;
          return (
            <tr
              key={d}
              className={cn(
                "border-t transition-colors duration-500",
                paper ? "border-ink-line" : "border-line",
                isToday ? (paper ? "text-choc" : "text-brass-hi") : paper ? "text-bronze" : "text-text/75",
              )}
            >
              <th scope="row" className="py-2 pr-3 text-left font-medium">
                <span className="flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className={cn(
                      "h-1.5 w-1.5 rotate-45 transition-colors",
                      isToday ? "bg-foil shadow-[0_0_10px_rgba(220,191,123,.9)]" : "bg-transparent",
                    )}
                  />
                  {SHORT[d]}
                  {isToday && <span className="sr-only">(today)</span>}
                </span>
              </th>
              <td className="num py-2 text-right">
                {k ? k.map((w) => <span key={w.join("-")} className="block whitespace-nowrap">{formatWindows([w])}</span>) : "Closed"}
              </td>
              {!compact && (
                <td className="num py-2 pl-4 text-right">
                  {b ? b.map((w) => <span key={w.join("-")} className="block whitespace-nowrap">{formatWindows([w]).replace("12:00 AM", "midnight")}</span>) : "—"}
                </td>
              )}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
