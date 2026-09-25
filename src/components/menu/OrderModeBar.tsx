"use client";

import { useEffect } from "react";
import { useBag } from "@/lib/bag";
import { LEAD_MINUTES } from "@/lib/fulfillment";
import { site } from "@/config/site";
import { useStatus } from "@/lib/use-status";
import { ModeSwitch } from "@/components/order/ModeSwitch";
import { ButterLamp } from "@/components/setpieces/ButterLamp";

/* The first decision of the order, under the menu title. Honours ?mode=delivery. */
export function OrderModeBar() {
  const mode = useBag((s) => s.mode);
  const setMode = useBag((s) => s.setMode);
  const st = useStatus();

  useEffect(() => {
    const m = new URLSearchParams(window.location.search).get("mode");
    if (m === "pickup" || m === "delivery") setMode(m);
  }, [setMode]);

  const text =
    mode === "pickup"
      ? `Ready in about ${LEAD_MINUTES.pickup} minutes at ${site.address.street}.`
      : `To your door around ${site.deliveryArea}, about ${LEAD_MINUTES.delivery} minutes.`;

  return (
    <div className="glass mt-8 flex max-w-[720px] flex-wrap items-center justify-between gap-x-6 gap-y-3 rounded-[22px] px-4 py-3.5 md:px-5">
      <div className="min-w-0">
        <p className="flex items-center gap-2 text-[12.5px] text-muted">
          <ButterLamp lit={!!st?.open} size={12} />
          {st?.line ?? "How would you like it?"}
        </p>
        <p aria-live="polite" className="mt-1 text-[14.5px] text-text">
          {text}
        </p>
      </div>
      <ModeSwitch />
    </div>
  );
}
