"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { useSound } from "@/lib/sound";
import { bowl, hum } from "@/lib/audio";
import { SoundToggle } from "@/components/setpieces/SoundToggle";

/* A singing bowl you can play. Tap it to strike; run your finger (or cursor, button held) round
   the rim and it starts to sing — the faster and steadier you circle, the louder and brighter
   it gets, and rings of vibration spread across the brass. With sound off it still glows and
   ripples, and says how to hear it. */

export function SingingBowl() {
  const box = useRef<HTMLDivElement>(null);
  const ringsRef = useRef<HTMLDivElement>(null);
  const [level, setLevel] = useState(0);
  const on = useSound((s) => s.on);
  const st = useRef({ down: false, lastA: 0, lastT: 0, speed: 0, level: 0, raf: 0, hum: null as ReturnType<typeof hum> | null, moved: 0 });

  useEffect(() => {
    const s = st.current;
    const loop = () => {
      s.speed *= 0.93;
      const target = Math.min(1, s.speed / 9);
      s.level += (target - s.level) * 0.08;
      s.hum?.set(s.level);
      box.current?.style.setProperty("--sing", s.level.toFixed(3));
      setLevel((l) => (Math.abs(l - s.level) > 0.02 ? s.level : l));
      if (s.level < 0.004 && !s.down) {
        s.level = 0;
        box.current?.style.setProperty("--sing", "0");
        setLevel(0);
        s.hum?.stop();
        s.hum = null;
        s.raf = 0;
        return;
      }
      s.raf = requestAnimationFrame(loop);
    };
    (box.current as unknown as { __kick?: () => void }).__kick = () => {
      if (!s.raf) s.raf = requestAnimationFrame(loop);
    };
    return () => {
      cancelAnimationFrame(s.raf);
      s.hum?.stop();
    };
  }, []);

  const kick = () => (box.current as unknown as { __kick?: () => void })?.__kick?.();

  const ripple = (strength: number) => {
    const el = ringsRef.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = document.createElement("i");
    r.style.setProperty("--k", strength.toFixed(2));
    el.appendChild(r);
    setTimeout(() => r.remove(), 2600);
  };

  const angleOf = (e: React.PointerEvent) => {
    const r = box.current!.getBoundingClientRect();
    return Math.atan2(e.clientY - (r.top + r.height * 0.46), e.clientX - (r.left + r.width / 2));
  };

  const onDown = (e: React.PointerEvent) => {
    const s = st.current;
    s.down = true;
    s.moved = 0;
    s.lastA = angleOf(e);
    s.lastT = e.timeStamp;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    const s = st.current;
    if (!s.down) return;
    const a = angleOf(e);
    let d = a - s.lastA;
    if (d > Math.PI) d -= Math.PI * 2;
    if (d < -Math.PI) d += Math.PI * 2;
    const dt = Math.max(1, e.timeStamp - s.lastT) / 1000;
    s.lastA = a;
    s.lastT = e.timeStamp;
    s.moved += Math.abs(d);
    s.speed = Math.min(14, s.speed * 0.7 + (Math.abs(d) / dt) * 0.3);
    if (s.moved > 0.4) {
      if (!s.hum && useSound.getState().on) s.hum = hum(174.6);
      kick();
      if (Math.random() < 0.05) ripple(0.4 + s.level * 0.6);
    }
  };
  const onUp = (e: React.PointerEvent) => {
    const s = st.current;
    s.down = false;
    // a tap (no circling) strikes the bowl
    if (s.moved < 0.4) strike(e);
  };
  const strike = (e?: React.PointerEvent | React.KeyboardEvent) => {
    void e;
    if (useSound.getState().on) bowl({ freq: 174.6, gain: 0.26, dur: 9 });
    ripple(1);
    setTimeout(() => ripple(0.7), 180);
    const s = st.current;
    s.speed = Math.max(s.speed, 6);
    kick();
    try {
      navigator.vibrate?.(14);
    } catch {}
  };

  return (
    <div className="grid gap-10 md:grid-cols-[1fr_1fr] md:items-center">
      <div
        ref={box}
        role="button"
        tabIndex={0}
        aria-label="Singing bowl. Press to strike it; drag round the rim to make it sing."
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={() => (st.current.down = false)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            strike(e);
          }
        }}
        className="singing-bowl relative mx-auto aspect-[1/0.8] w-full max-w-[460px] cursor-pointer touch-none select-none"
      >
        <div className="sb-glow" aria-hidden="true" />
        <svg viewBox="0 0 400 320" className="relative z-[1] h-full w-full overflow-visible" aria-hidden="true">
          <defs>
            <radialGradient id="sb-in" cx="50%" cy="40%" r="60%">
              <stop offset="0" stopColor="#3a2716" />
              <stop offset=".7" stopColor="#6b4f2c" />
              <stop offset="1" stopColor="#b8995e" />
            </radialGradient>
            <linearGradient id="sb-out" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#4a3620" />
              <stop offset=".22" stopColor="#a8894f" />
              <stop offset=".42" stopColor="#f1dca2" />
              <stop offset=".6" stopColor="#c9ab6c" />
              <stop offset="1" stopColor="#4a3620" />
            </linearGradient>
            <linearGradient id="sb-lip" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#7d6441" />
              <stop offset=".4" stopColor="#fbeec7" />
              <stop offset="1" stopColor="#7d6441" />
            </linearGradient>
          </defs>
          {/* cushion */}
          <ellipse cx="200" cy="286" rx="150" ry="26" fill="#2a1a10" />
          <ellipse cx="200" cy="280" rx="138" ry="22" fill="#5b3825" />
          <ellipse cx="200" cy="276" rx="120" ry="16" fill="#6e4630" />
          {/* body */}
          <path d="M52 150 C58 238 120 282 200 282 C280 282 342 238 348 150 Z" fill="url(#sb-out)" />
          {[176, 204, 232].map((y, i) => (
            <path key={y} d={`M${62 + i * 9} ${y} Q200 ${y + 26 - i * 4} ${338 - i * 9} ${y}`} fill="none" stroke="#3b2517" strokeOpacity=".35" strokeWidth={i === 1 ? 2 : 1} />
          ))}
          {/* mouth */}
          <ellipse cx="200" cy="150" rx="148" ry="40" fill="url(#sb-lip)" />
          <ellipse cx="200" cy="152" rx="138" ry="34" fill="url(#sb-in)" />
          <ellipse className="sb-rim-glow" cx="200" cy="150" rx="146" ry="39" fill="none" stroke="#fff2cc" strokeWidth="2" />
        </svg>
        <div ref={ringsRef} className="sb-rings" aria-hidden="true" />
        {/* striker */}
        <div className="sb-striker" aria-hidden="true" />
      </div>

      <div>
        <p className="text-[16.5px] leading-relaxed text-text/80">
          Bowls like this ring in every monastery on the way up. <strong className="font-medium text-brass-hi">Tap it</strong> to strike it, or <strong className="font-medium text-brass-hi">circle the rim</strong> slowly and steadily and it will start to sing.
        </p>
        <div className="mt-6 flex items-center gap-4">
          <div className="sb-meter relative h-1.5 w-40 overflow-hidden rounded-full bg-line" aria-hidden="true">
            <span className="absolute inset-y-0 left-0 rounded-full bg-[linear-gradient(90deg,#9b7e53,#f2e9cf)]" style={{ width: `${Math.round(level * 100)}%` }} />
          </div>
          <span className="caps text-[10px] text-brass">{level > 0.65 ? "Singing" : level > 0.25 ? "Humming" : level > 0.02 ? "Waking" : "Still"}</span>
        </div>
        <div className={cn("mt-6 flex items-center gap-3 text-[13.5px]", on ? "text-muted" : "text-text/80")}>
          <SoundToggle />
          {!on && <span>— sound is off; switch it on to hear the bowl.</span>}
        </div>
      </div>
    </div>
  );
}
