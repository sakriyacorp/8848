"use client";

import { useBag } from "@/lib/bag";
import { useUI } from "@/lib/ui";
import { isOn } from "@/config/features";
import type { SpiceChoice } from "@/lib/menu";
import { sfx } from "@/lib/sound";
import { pluck } from "@/lib/audio";

type Opts = { qty?: number; option?: string; spice?: SpiceChoice; instructions?: string };

/* Every "add" in the site goes through here: the bag, the flight of the dish into the trekking
   pack, a light haptic tick, and the undo toast. `from` is the element the dish flies out of
   (usually its photo). */
export function addToPack(itemId: string, name: string, opts: Opts = {}, from?: HTMLElement | null, src?: string | null) {
  useBag.getState().add(itemId, opts);
  sfx(pluck);
  const ui = useUI.getState();
  const reduce = typeof window !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (from && isOn("bagFlight") && !reduce) {
    const r = from.getBoundingClientRect();
    ui.launch({ src: src ?? null, from: { x: r.left, y: r.top, w: r.width, h: r.height } });
  } else {
    ui.bumpPack();
  }
  if (isOn("haptics") && typeof navigator !== "undefined" && "vibrate" in navigator) {
    try {
      navigator.vibrate(12);
    } catch {}
  }
  const qty = opts.qty && opts.qty > 1 ? `${opts.qty} × ` : "";
  ui.showToast(`${qty}${name}${opts.option ? ` (${opts.option})` : ""} is in your pack`, { undo: true });
}
