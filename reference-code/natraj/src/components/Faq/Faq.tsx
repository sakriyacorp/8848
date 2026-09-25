"use client";

import { useId, useState } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/cn";
import type { FaqItem } from "@/lib/faq";

/* Glass disclosures. Buttons carry aria-expanded and aria-controls; panels are regions that
   animate open with a grid-row transition (no measuring, no jank). Several can stay open. */
export function Faq({ items }: { items: FaqItem[] }) {
  const base = useId();
  const [open, setOpen] = useState<Set<number>>(() => new Set([0]));

  const toggle = (i: number) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  return (
    <ul className="flex flex-col gap-3">
      {items.map((item, i) => {
        const isOpen = open.has(i);
        const panelId = `${base}-panel-${i}`;
        const buttonId = `${base}-button-${i}`;
        return (
          <li key={item.q} className={cn("glass rounded-2xl transition-[background] duration-300", isOpen && "[--glass-base:rgba(242,232,213,0.03)]")}>
            <h3>
              <button
                type="button"
                id={buttonId}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(i)}
                className="flex w-full items-center justify-between gap-4 rounded-2xl px-5 py-4 text-left text-[17px] font-medium text-cream md:px-6 md:py-5"
              >
                {item.q}
                <span
                  aria-hidden="true"
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line text-cream-2 transition-colors duration-300",
                    isOpen && "border-red/60 bg-red/15 text-cream",
                  )}
                >
                  <Plus size={16} className="faq-chev" />
                </span>
              </button>
            </h3>
            <div id={panelId} role="region" aria-labelledby={buttonId} className="faq-panel" data-open={isOpen}>
              <div>
                <p className="px-5 pb-5 text-[16px] leading-relaxed text-cream-2 md:px-6 md:pb-6">{item.a}</p>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
