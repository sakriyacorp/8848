"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/cn";
import type { CategoryNavItem } from "@/components/Menu/CategoryRail";

type Props = { categories: CategoryNavItem[]; activeId: string | null; onSelect(id: string): void };

export function CategoryChips({ categories, activeId, onSelect }: Props) {
  const strip = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const box = strip.current;
    const chip = box?.querySelector<HTMLElement>(`[data-chip="${activeId}"]`);
    if (!box || !chip) return;
    const left = chip.offsetLeft - box.clientWidth / 2 + chip.clientWidth / 2;
    box.scrollTo({ left, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }, [activeId]);

  return (
    <div className="sticky top-[68px] z-30 -mx-5 bg-night/85 px-5 py-2.5 backdrop-blur-[18px] backdrop-saturate-[1.4] md:-mx-8 md:px-8 lg:hidden">
      <div ref={strip} role="tablist" aria-label="Menu categories" className="no-scrollbar flex gap-2 overflow-x-auto">
        {categories.map((c) => {
          const active = c.id === activeId;
          return (
            <button
              key={c.id}
              type="button"
              role="tab"
              aria-selected={active}
              data-chip={c.id}
              onClick={() => onSelect(c.id)}
              className={cn(
                "shrink-0 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors duration-150",
                active ? "border-red bg-red text-cream" : "border-line bg-glass text-cream-2 hover:text-cream",
              )}
            >
              {c.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
