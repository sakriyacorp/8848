"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

export type Camp = { id: string; name: string; camp: string; altitude: number; count: number };

/* Menu categories as camps on the way up. Desktop: a vertical altitude rail with a tiny climber
   who walks to whichever camp you're reading. Phone: a sticky strip of camp chips with a thin
   ridgeline progress bar and the same climber. */

function Climber({ className, walking }: { className?: string; walking?: boolean }) {
  return (
    <svg viewBox="0 0 20 24" className={cn("climber", walking && "walking", className)} aria-hidden="true">
      <circle cx="11" cy="4" r="2.6" fill="currentColor" />
      <path d="M8.2 8.2h5.2l1.4 6.6-2 .4-1-4.4-1.6 4.8 2.6 6.4-2.2.9-3-7.2Z" fill="currentColor" />
      <path d="M6.4 8.6 5 18.4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="m13.4 9.2 2.9 3.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M16.3 12.4 18 22" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

export function CampRail({ camps, activeId, onSelect, climber = true }: { camps: Camp[]; activeId: string | null; onSelect(id: string): void; climber?: boolean }) {
  const list = useRef<HTMLOListElement>(null);
  const [y, setY] = useState(0);
  const [walking, setWalking] = useState(false);
  // Top of the list is the summit: render in reverse so altitude reads upward.
  const ordered = [...camps].reverse();

  useEffect(() => {
    const el = list.current?.querySelector<HTMLElement>(`[data-camp="${activeId}"]`);
    if (!el) return;
    setY(el.offsetTop + el.offsetHeight / 2);
    setWalking(true);
    const t = setTimeout(() => setWalking(false), 700);
    return () => clearTimeout(t);
  }, [activeId, camps.length]);

  return (
    <nav aria-label="Menu camps" className="sticky top-[96px] hidden self-start lg:block">
      <p className="caps mb-4 pl-7 text-[9.5px] text-bronze">Altitude</p>
      <div className="relative">
        <span aria-hidden="true" className="absolute bottom-3 left-[9px] top-3 w-px bg-[linear-gradient(to_bottom,rgba(59,37,23,.15),rgba(59,37,23,.45))]" />
        {climber && (
          <span aria-hidden="true" className="absolute left-0 z-[1] -mt-3 text-choc transition-[top] duration-700 ease-[cubic-bezier(.34,1.36,.64,1)]" style={{ top: y }}>
            <Climber className="h-6 w-5" walking={walking} />
          </span>
        )}
        <ol ref={list} className="space-y-0.5">
          {ordered.map((c) => {
            const on = c.id === activeId;
            return (
              <li key={c.id} data-camp={c.id}>
                <a
                  href={`#cat-${c.id}`}
                  aria-current={on ? "true" : undefined}
                  onClick={(e) => {
                    e.preventDefault();
                    onSelect(c.id);
                  }}
                  className={cn("group flex items-center gap-3 rounded-xl py-1.5 pl-7 pr-2 transition-colors", on ? "text-choc" : "text-bronze hover:text-choc")}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "absolute left-[5px] h-[9px] w-[9px] rotate-45 border transition-all duration-500",
                      on ? "scale-125 border-choc bg-[linear-gradient(135deg,#f3e2ae,#b08a4a)]" : "border-bronze/50 bg-paper group-hover:border-choc",
                    )}
                  />
                  <span className="min-w-0 flex-1">
                    <span className={cn("block truncate text-[14px] leading-tight", on && "font-medium")}>{c.name}</span>
                    <span className="num caps block text-[9px] text-bronze/80">
                      {c.camp} · {c.altitude.toLocaleString("en-US")} m
                    </span>
                  </span>
                  <span className="num text-[11px] text-bronze">{c.count}</span>
                </a>
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}

export function CampChips({ camps, activeId, onSelect, climber = true }: { camps: Camp[]; activeId: string | null; onSelect(id: string): void; climber?: boolean }) {
  const strip = useRef<HTMLDivElement>(null);
  const idx = Math.max(0, camps.findIndex((c) => c.id === activeId));
  const active = camps[idx];

  useEffect(() => {
    const box = strip.current;
    const chip = box?.querySelector<HTMLElement>(`[data-chip="${activeId}"]`);
    if (!box || !chip) return;
    const left = chip.offsetLeft - box.clientWidth / 2 + chip.clientWidth / 2;
    box.scrollTo({ left, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }, [activeId]);

  const pct = camps.length > 1 ? idx / (camps.length - 1) : 0;

  return (
    <div className="paper sticky top-[68px] z-30 -mx-[var(--gutter)] mt-4 border-b border-ink-line px-[var(--gutter)] pb-2 pt-2.5 shadow-[0_10px_20px_-18px_rgba(59,37,23,.6)] md:top-[76px] lg:hidden">
      <div className="flex items-center gap-3">
        <p className="num caps shrink-0 text-[10px] leading-tight text-bronze" aria-live="polite">
          <span className="block text-[8.5px] text-bronze">Alt.</span>
          {active ? `${active.altitude.toLocaleString("en-US")} m` : ""}
        </p>
        <div ref={strip} role="tablist" aria-label="Menu camps" className="no-scrollbar flex gap-2 overflow-x-auto">
          {camps.map((c) => {
            const on = c.id === activeId;
            return (
              <button
                key={c.id}
                type="button"
                role="tab"
                aria-selected={on}
                data-chip={c.id}
                onClick={() => onSelect(c.id)}
                className={cn(
                  "shrink-0 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-[background,color,border-color] duration-300",
                  on ? "border-choc bg-choc text-paper" : "border-ink-line bg-white/40 text-choc",
                )}
              >
                {c.name}
              </button>
            );
          })}
        </div>
      </div>
      <div aria-hidden="true" className="relative mt-2 h-3">
        <span className="absolute inset-x-0 top-1/2 h-px bg-ink-line" />
        <span className="absolute left-0 top-1/2 h-px bg-choc transition-[width] duration-700 ease-out" style={{ width: `${pct * 100}%` }} />
        {climber && (
          <span className="absolute -top-2.5 text-choc transition-[left] duration-700 ease-[cubic-bezier(.34,1.36,.64,1)]" style={{ left: `calc(${pct * 100}% - 8px)` }}>
            <Climber className="h-[18px] w-[15px]" />
          </span>
        )}
      </div>
    </div>
  );
}
