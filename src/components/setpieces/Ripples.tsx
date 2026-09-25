"use client";

import { useEffect } from "react";
import { useSound } from "@/lib/sound";
import { bowl, BOWL_NOTES } from "@/lib/audio";

/* Tap any quiet, dark part of the page and it rings like a singing bowl: brass rings spread out
   from your finger (and, if sound is on, the bowl sings — pitch by where you tapped). Controls,
   canvases and paper sections are left alone. */
const SKIP = "a,button,input,select,textarea,label,summary,details,[role=button],[role=slider],[role=radio],[role=tab],[role=dialog],canvas,[data-no-ripple],.paper,.linen";

export function Ripples() {
  useEffect(() => {
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let last = 0;
    const down = (e: PointerEvent) => {
      if (e.button !== 0) return;
      const t = e.target as Element | null;
      if (!t || t.closest(SKIP)) return;
      const now = performance.now();
      if (now - last < 240) return;
      last = now;
      if (!reduce) {
        const el = document.createElement("span");
        el.className = "bowl-ripple";
        el.style.left = `${e.clientX}px`;
        el.style.top = `${e.clientY}px`;
        el.innerHTML = "<i></i><i></i><i></i>";
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 2400);
      }
      if (useSound.getState().on) {
        const i = Math.min(BOWL_NOTES.length - 1, Math.floor((1 - e.clientY / innerHeight) * BOWL_NOTES.length));
        bowl({ freq: BOWL_NOTES[Math.max(0, i)], gain: 0.13, dur: 5.5, pan: ((e.clientX / innerWidth) * 2 - 1) * 0.6 });
      }
    };
    addEventListener("pointerdown", down, { passive: true });
    return () => removeEventListener("pointerdown", down);
  }, []);
  return null;
}
