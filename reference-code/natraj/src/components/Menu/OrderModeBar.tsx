"use client";

import { useEffect } from "react";
import { useBag } from "@/lib/bag";
import { LEAD_MINUTES } from "@/lib/fulfillment";
import { ModeSwitch } from "@/components/Menu/ModeSwitch";

/* Sits under the menu header: the first decision of the order. Honors ?mode=delivery so a
   link can land straight on delivery. */
export function OrderModeBar({ pickupAddress }: { pickupAddress: string }) {
  const mode = useBag((s) => s.mode);
  const setMode = useBag((s) => s.setMode);

  useEffect(() => {
    const m = new URLSearchParams(window.location.search).get("mode");
    if (m === "pickup" || m === "delivery") setMode(m);
  }, [setMode]);

  const text =
    mode === "pickup"
      ? `Ready in about ${LEAD_MINUTES.pickup} minutes at ${pickupAddress}.`
      : `To your door in the Culpeper area, about ${LEAD_MINUTES.delivery} minutes. Address at checkout.`;

  return (
    <div className="glass mt-8 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 rounded-2xl px-4 py-3 md:px-5">
      <div className="min-w-0">
        <p className="text-[13px] font-medium text-cream-2">How would you like it?</p>
        <p aria-live="polite" className="mt-0.5 text-[14px] text-cream">
          {text}
        </p>
      </div>
      <ModeSwitch />
    </div>
  );
}
