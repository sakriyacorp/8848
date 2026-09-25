"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { useSound, restoreSound } from "@/lib/sound";
import { bowl } from "@/lib/audio";

/* The one switch for the site's sound: a little singing bowl. Off by default; turning it on
   strikes the bowl once so you know what you've done. */
export function SoundToggle({ className, label = true }: { className?: string; label?: boolean }) {
  const on = useSound((s) => s.on);
  const toggle = useSound((s) => s.toggle);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    restoreSound();
  }, []);

  return (
    <button
      type="button"
      aria-pressed={mounted ? on : false}
      onClick={() => {
        const next = !on;
        toggle();
        if (next) bowl({ freq: 220, gain: 0.18, dur: 5 });
      }}
      className={cn("sound-toggle group inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full text-[13px] text-muted transition-colors hover:text-brass-hi", on && "is-on text-brass-hi", className)}
    >
      <svg viewBox="0 0 32 24" width="26" height="20" aria-hidden="true" className="overflow-visible">
        <path d="M4 11h24c-.6 6.2-5.6 10-12 10S4.6 17.2 4 11Z" fill="currentColor" opacity=".9" />
        <path d="M3 11h26" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        <path className="sound-wave" d="M11 7c1.4-1.4 1.4-3 0-4.4M16 7c1.4-1.4 1.4-3 0-4.4M21 7c1.4-1.4 1.4-3 0-4.4" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      </svg>
      {label && <span>Sound {mounted && on ? "on" : "off"}</span>}
      {!label && <span className="sr-only">Sound {mounted && on ? "on" : "off"}</span>}
    </button>
  );
}
