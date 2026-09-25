"use client";

import { Footprints, Truck } from "lucide-react";
import { cn } from "@/lib/cn";
import { useBag } from "@/lib/bag";
import { MODE_LABEL, type OrderMode } from "@/lib/fulfillment";

const MODES: OrderMode[] = ["pickup", "delivery"];

/* Pickup / delivery, shared by the menu, the pack and checkout; the choice lives in the bag. */
export function ModeSwitch({ size = "md", className }: { size?: "sm" | "md"; className?: string }) {
  const mode = useBag((s) => s.mode);
  const setMode = useBag((s) => s.setMode);
  return (
    <div role="group" aria-label="Order type" className={cn("relative inline-flex shrink-0 rounded-full border border-line-strong bg-void/50 p-1", className)}>
      <span
        aria-hidden="true"
        className="absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-full bg-[linear-gradient(100deg,#a58a58,#e9dab0_45%,#b69e70)] shadow-[inset_0_1px_0_rgba(255,250,232,.8),0_4px_14px_rgba(0,0,0,.4)] transition-transform duration-500 ease-bounce"
        style={{ transform: mode === "delivery" ? "translateX(100%)" : "none" }}
      />
      {MODES.map((m) => {
        const on = mode === m;
        const Icon = m === "pickup" ? Footprints : Truck;
        return (
          <button
            key={m}
            type="button"
            aria-pressed={on}
            onClick={() => setMode(m)}
            className={cn(
              "relative z-[1] flex flex-1 items-center justify-center gap-1.5 rounded-full font-medium transition-colors duration-300",
              size === "sm" ? "px-3 py-1.5 text-[12.5px]" : "px-4 py-2 text-[14px]",
              on ? "text-choc" : "text-muted hover:text-brass-hi",
            )}
          >
            <Icon size={size === "sm" ? 13 : 15} strokeWidth={1.75} aria-hidden="true" />
            {MODE_LABEL[m]}
          </button>
        );
      })}
    </div>
  );
}
