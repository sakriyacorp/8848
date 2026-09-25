"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/cn";

type Props = {
  value: number;
  min?: number;
  max?: number;
  label: string;
  onChange(next: number): void;
  size?: "sm" | "md";
};

export function Stepper({ value, min = 1, max = 20, label, onChange, size = "md" }: Props) {
  const btn = cn(
    "flex items-center justify-center rounded-full text-brass-hi transition-colors duration-150 hover:bg-brass/15 disabled:opacity-35 disabled:hover:bg-transparent",
    size === "sm" ? "h-8 w-8" : "h-10 w-10",
  );
  return (
    <div role="group" aria-label={label} className="inline-flex items-center rounded-full border border-line-strong bg-void/40">
      <button type="button" aria-label="Decrease quantity" disabled={value <= min} onClick={() => onChange(value - 1)} className={btn}>
        <Minus size={14} aria-hidden="true" />
      </button>
      <span aria-live="polite" className={cn("text-center font-medium tabular-nums text-brass-hi", size === "sm" ? "w-6 text-[13px]" : "w-8 text-[15px]")}>
        {value}
      </span>
      <button type="button" aria-label="Increase quantity" disabled={value >= max} onClick={() => onChange(value + 1)} className={btn}>
        <Plus size={14} aria-hidden="true" />
      </button>
    </div>
  );
}
