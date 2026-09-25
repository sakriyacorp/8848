"use client";

import { X } from "lucide-react";
import { cn } from "@/lib/cn";
import {
  COURSE_OPTIONS,
  DIET_OPTIONS,
  DRINK_OPTIONS,
  MORE_OPTIONS,
  type FilterOption,
  type Selection,
  selectionCount,
} from "@/lib/filters";

export type Group = keyof Selection;

type Props = {
  sel: Selection;
  counts: Record<string, number>;
  onToggle(group: Group, id: string): void;
  onClear(): void;
  layout: "inline" | "sheet";
};

const GROUPS: { id: Group; label: string; options: FilterOption<string>[] }[] = [
  { id: "diet", label: "Diet", options: DIET_OPTIONS },
  { id: "course", label: "Course", options: COURSE_OPTIONS },
  { id: "drink", label: "Drinks", options: DRINK_OPTIONS },
  { id: "more", label: "More", options: MORE_OPTIONS },
];

/* Grouped multi-select. Counts arrive from MenuClient for "what you would get if you added
   this"; options that would leave nothing are hidden unless they are already on, so a dead
   combination is never offered. */
export function FilterPanel({ sel, counts, onToggle, onClear, layout }: Props) {
  const active = selectionCount(sel);
  return (
    <div className={cn(layout === "inline" ? "flex flex-col gap-4" : "flex flex-col gap-6")}>
      {GROUPS.map((g) => {
        const options = g.options.filter((o) => (counts[`${g.id}:${o.id}`] ?? 0) > 0 || (sel[g.id] as string[]).includes(o.id));
        if (options.length === 0) return null;
        return (
          <div key={g.id} role="group" aria-label={g.label} className={cn(layout === "inline" && "flex flex-wrap items-center gap-x-3 gap-y-2")}>
            <p className={cn("text-[12px] font-semibold uppercase tracking-[0.08em] text-cream-2/80", layout === "inline" ? "w-14 shrink-0" : "mb-2.5")}>
              {g.label}
            </p>
            <div className="flex flex-wrap gap-2">
              {options.map((o) => {
                const on = (sel[g.id] as string[]).includes(o.id);
                const count = counts[`${g.id}:${o.id}`] ?? 0;
                return (
                  <button
                    key={o.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => onToggle(g.id, o.id)}
                    className={cn(
                      "flex items-center gap-2 rounded-full border px-3.5 py-2 text-[13px] font-medium transition-colors duration-150",
                      on ? "border-red bg-red text-cream" : "border-line bg-glass text-cream-2 hover:text-cream",
                    )}
                  >
                    {o.label}
                    <span className={cn("tabular-nums", on ? "text-cream/80" : "text-cream-2/70")}>{count}</span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
      {active > 0 && layout === "inline" && (
        <button type="button" onClick={onClear} className="self-start text-[13px] font-medium text-cream-2 underline underline-offset-4 hover:text-cream">
          Clear all
        </button>
      )}
    </div>
  );
}

/* The chips under the search box: every active choice, each removable, plus Clear all. */
export function ActiveFilters({ sel, onToggle, onClear }: { sel: Selection; onToggle(group: Group, id: string): void; onClear(): void }) {
  const all = GROUPS.flatMap((g) => (sel[g.id] as string[]).map((id) => ({ group: g.id, id, label: g.options.find((o) => o.id === id)?.label ?? id })));
  if (all.length === 0) return null;
  return (
    <ul aria-label="Active filters" className="mt-3 flex flex-wrap items-center gap-2">
      {all.map((f) => (
        <li key={`${f.group}:${f.id}`}>
          <button
            type="button"
            onClick={() => onToggle(f.group, f.id)}
            aria-label={`Remove filter ${f.label}`}
            className="flex items-center gap-1.5 rounded-full border border-red/60 bg-red/15 py-1.5 pl-3 pr-2 text-[13px] font-medium text-cream transition-colors duration-150 hover:bg-red/25"
          >
            {f.label}
            <X size={13} aria-hidden="true" />
          </button>
        </li>
      ))}
      <li>
        <button type="button" onClick={onClear} className="rounded-full px-2.5 py-1.5 text-[13px] font-medium text-cream-2 underline underline-offset-4 hover:text-cream">
          Clear all
        </button>
      </li>
    </ul>
  );
}
