"use client";

import { useEffect, useRef, useState } from "react";
import { Logo } from "@/components/brand/Logo";

const KEY = "8848-intro-seen";

/* First visit only: the mark draws itself in brass on the night room — the arc strokes on,
   the peaks rise out of the ground, the sun comes up through the arc, the numerals settle,
   a sheen crosses the metal — then a hole opens in the middle of the screen, through the arc,
   onto the site. Any tap, key or the Skip button ends it early. A tiny script in the layout
   hides it before paint on later visits and for reduced motion. */
export function Intro() {
  const ref = useRef<HTMLDivElement>(null);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (document.documentElement.classList.contains("intro-seen")) {
      setGone(true);
      return;
    }
    const html = document.documentElement;
    html.style.overflow = "hidden";
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      try {
        localStorage.setItem(KEY, "1");
      } catch {}
      el.classList.add("out");
      html.style.overflow = "";
      setTimeout(() => setGone(true), 1150);
    };
    const t = setTimeout(finish, 3700);
    const skip = (e: Event) => {
      if (e instanceof KeyboardEvent && ["Shift", "Control", "Alt", "Meta", "Tab"].includes(e.key)) return;
      finish();
    };
    el.addEventListener("pointerdown", skip);
    addEventListener("keydown", skip);
    return () => {
      clearTimeout(t);
      el.removeEventListener("pointerdown", skip);
      removeEventListener("keydown", skip);
      html.style.overflow = "";
    };
  }, []);

  if (gone) return null;

  return (
    <div
      ref={ref}
      className="intro fixed inset-0 z-[95] flex flex-col items-center justify-center bg-void"
      role="dialog"
      aria-label="8848 — welcome"
    >
      <div aria-hidden="true" className="lamp-glow left-1/2 top-[44%] h-[80vmin] w-[80vmin] -translate-x-1/2 -translate-y-1/2" />
      <Logo variant="lockup" material="brass" animate orb="sun" delay={0.25} className="relative w-[min(76vw,440px)]" />
      <p className="caps relative mt-8 text-[10.5px] text-muted [animation:fade_1.2s_var(--ease)_2.6s_both]">Harrisonburg · Virginia</p>
      <button
        type="button"
        className="caps absolute bottom-6 right-6 rounded-full border border-line-strong px-4 py-2 text-[10.5px] text-muted transition-colors hover:text-brass-hi"
      >
        Skip
      </button>
    </div>
  );
}
