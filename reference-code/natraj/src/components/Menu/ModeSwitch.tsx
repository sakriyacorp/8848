"use client";

import { ShoppingBag, Truck } from "lucide-react";
import { cn } from "@/lib/cn";
import { useBag } from "@/lib/bag";
import { MODE_LABEL, type OrderMode } from "@/lib/fulfillment";

const MODES: OrderMode[] = ["pickup", "delivery"];

/* One control for the order type, shared by the menu bar, the bag drawer and checkout. The
   choice lives in the bag store, so it follows the visitor through the whole flow. */
export function ModeSwitch({ size = "md", className }: { size?: "sm" | "md"; className?: string }) {
  const mode = useBag((s) => s.mode);
  const setMode = useBag((s) => s.setMode);
  return (
    <div role="group" aria-label="Order type" className={cn("glass inline-flex shrink-0 rounded-full p-1", className)}>
      {MODES.map((m) => {
        const on = mode === m;
        const Icon = m === "pickup" ? ShoppingBag : Truck;
        return (
          <button
            key={m}
            type="button"
            aria-pressed={on}
            onClick={() => setMode(m)}
            className={cn(
              "flex items-center gap-1.5 rounded-full font-medium transition-[background,color,box-shadow] duration-200",
              size === "sm" ? "px-3 py-1.5 text-[13px]" : "px-4 py-2 text-[14px]",
              on ? "bg-red text-cream shadow-[0_4px_18px_rgba(200,32,46,0.35)]" : "text-cream-2 hover:text-cream",
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
