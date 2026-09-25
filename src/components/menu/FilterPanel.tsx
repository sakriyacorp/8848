"use client";

import { X } from "lucide-react";
import { cn } from "@/lib/cn";
import { DIET_OPTIONS, HEAT_OPTIONS, MORE_OPTIONS, type FilterOption, type Selection, selectionCount } from "@/lib/filters";

export type Group = keyof Selection;

const GROUPS: { id: Group; label: string; options: FilterOption<string>[] }[] = [
  { id: "diet", label: "Diet", options: DIET_OPTIONS },
  { id: "heat", label: "Heat", options: HEAT_OPTIONS },
  { id: "more", label: "Picks", options: MORE_OPTIONS },
];

/* Grouped multi-select on paper. Counts preview "what you'd get if you added this"; options that
   would leave nothing are hidden unless already on, so a dead end is never offered. */
export function FilterPanel({
  sel,
  counts,
  onToggle,
  onClear,
  layout,
}: {
  sel: Selection;
  counts: Record<string, number>;
  onToggle(group: Group, id: string): void;
  onClear(): void;
  layout: "inline" | "sheet";
}) {
  const active = selectionCount(sel);
  return (
    <div className={cn(layout === "inline" ? "flex flex-wrap items-center gap-x-8 gap-y-3" : "flex flex-col gap-6")}>
      {GROUPS.map((g) => {
        const options = g.options.filter((o) => (counts[`${g.id}:${o.id}`] ?? 1) > 0 || (sel[g.id] as string[]).includes(o.id));
        if (options.length === 0) return null;
        return (
          <div key={g.id} role="group" aria-label={g.label} className={cn(layout === "inline" && "flex items-center gap-3")}>
            <p className={cn("caps text-[10px] text-bronze", layout === "sheet" && "mb-2.5")}>{g.label}</p>
            <div className="flex flex-wrap gap-2">
              {options.map((o) => {
                const on = (sel[g.id] as string[]).includes(o.id);
                const count = counts[`${g.id}:${o.id}`];
                return (
                  <button
                    key={o.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => onToggle(g.id, o.id)}
                    className={cn(
                      "chip flex items-center gap-2 rounded-full border px-3.5 py-2 text-[13.5px] font-medium transition-[background,color,border-color,transform] duration-300 active:scale-95",
                      on ? "border-choc bg-choc text-paper" : "border-ink-line bg-white/40 text-choc hover:border-bronze",
                    )}
                  >
                    {g.id === "heat" && <HeatGlyph level={o.id} on={on} />}
                    {o.label}
                    {count !== undefined && <span className={cn("num text-[12px]", on ? "text-paper/70" : "text-bronze/80")}>{count}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
      {active > 0 && layout === "inline" && (
        <button type="button" onClick={onClear} className="text-[13px] font-medium text-bronze underline underline-offset-4 hover:text-choc">
          Clear all
        </button>
      )}
    </div>
  );
}

function HeatGlyph({ level, on }: { level: string; on: boolean }) {
  const n = level === "mild" ? 1 : level === "medium" ? 2 : 3;
  return (
    <span aria-hidden="true" className="inline-flex items-end gap-[1px]">
      {Array.from({ length: n }, (_, i) => (
        <svg key={i} viewBox="0 0 10 8" width="8" height="7">
          <path d="M0.5 7.5 5 0.8l4.5 6.7Z" fill={on ? "#f2b27a" : "#b5602d"} />
        </svg>
      ))}
    </span>
  );
}

export function ActiveFilters({ sel, onToggle, onClear }: { sel: Selection; onToggle(group: Group, id: string): void; onClear(): void }) {
  const all = GROUPS.flatMap((g) => (sel[g.id] as string[]).map((id) => ({ group: g.id, id, label: g.options.find((o) => o.id === id)?.label ?? id })));
  if (all.length === 0) return null;
  return (
    <ul aria-label="Active filters" className="mt-3 flex flex-wrap items-center gap-2 lg:hidden">
      {all.map((f) => (
        <li key={`${f.group}:${f.id}`}>
          <button
            type="button"
            onClick={() => onToggle(f.group, f.id)}
            aria-label={`Remove filter ${f.label}`}
            className="flex items-center gap-1.5 rounded-full border border-choc/40 bg-choc/10 py-1.5 pl-3 pr-2 text-[13px] font-medium text-choc"
          >
            {f.label}
            <X size={13} aria-hidden="true" />
          </button>
        </li>
      ))}
      <li>
        <button type="button" onClick={onClear} className="rounded-full px-2.5 py-1.5 text-[13px] font-medium text-bronze underline underline-offset-4">
          Clear all
        </button>
      </li>
    </ul>
  );
}
