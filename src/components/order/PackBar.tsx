"use client";

import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/cn";
import { useBag, selectCount } from "@/lib/bag";
import { useUI } from "@/lib/ui";
import { bagTotals, packWeightKg } from "@/lib/bag-totals";
import { formatMoney } from "@/lib/format";
import { TrekPack } from "@/components/icons/Icons";

/* Phones only: once something's in the pack, a brass-edged bar rises from the bottom of the menu
   with the count, the weight and the running total — one thumb-tap from the drawer. It steps
   aside while the drawer is open, and toasts float above it. */
export function PackBar() {
  const lines = useBag((s) => s.lines);
  const hydrated = useBag((s) => s.hydrated);
  const count = useBag(selectCount);
  const drawerOpen = useUI((s) => s.drawerOpen);
  const openDrawer = useUI((s) => s.openDrawer);
  const packBump = useUI((s) => s.packBump);
  const [bump, setBump] = useState(0);
  const show = hydrated && count > 0 && !drawerOpen;

  useEffect(() => {
    document.documentElement.classList.toggle("packbar-on", show);
    return () => document.documentElement.classList.remove("packbar-on");
  }, [show]);

  useEffect(() => {
    if (packBump) setBump((b) => b + 1);
  }, [packBump]);

  const { subtotal } = bagTotals(lines);
  return (
    <div className={cn("packbar fixed inset-x-0 bottom-0 z-[60] px-3 pb-[max(12px,env(safe-area-inset-bottom))] md:hidden", show ? "is-on" : "")} aria-hidden={!show}>
      <button
        type="button"
        onClick={openDrawer}
        tabIndex={show ? 0 : -1}
        className="glass flex w-full items-center gap-3 rounded-full py-2 pl-2 pr-2 text-left [--glass-base:rgba(20,14,10,0.92)]"
        aria-label={`Open your pack: ${count} ${count === 1 ? "item" : "items"}, ${formatMoney(subtotal)}`}
      >
        <span key={bump} className={cn("relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brass/15 text-brass-hi", bump > 0 && "animate-badge")}>
          <TrekPack size={22} />
          <span className="num absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[linear-gradient(135deg,#f1e4bd,#c5ac78)] px-1 text-[11px] font-semibold text-choc">{count}</span>
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[14.5px] font-medium text-text">Your pack</span>
          <span className="caps block text-[9.5px] text-muted">{packWeightKg(lines).toFixed(1)} kg · subtotal</span>
        </span>
        <span className="num text-[16px] text-brass-hi">{formatMoney(subtotal)}</span>
        <span className="btn btn-brass ml-1 px-4 py-2.5 text-[14px]">
          Review <ArrowRight size={15} aria-hidden="true" />
        </span>
      </button>
    </div>
  );
}
