"use client";

import { cn } from "@/lib/cn";

export type CategoryNavItem = { id: string; name: string; count: number };

type Props = { categories: CategoryNavItem[]; activeId: string | null; onSelect(id: string): void };

export function CategoryRail({ categories, activeId, onSelect }: Props) {
  return (
    <nav aria-label="Menu categories" className="sticky top-[100px] hidden self-start lg:block">
      <ul className="space-y-0.5">
        {categories.map((c) => {
          const active = c.id === activeId;
          return (
            <li key={c.id}>
              <a
                href={`#cat-${c.id}`}
                aria-current={active ? "true" : undefined}
                onClick={(e) => {
                  e.preventDefault();
                  onSelect(c.id);
                }}
                className={cn(
                  "flex items-center gap-3 border-l-2 py-1.5 pl-4 pr-2 text-[14px] transition-colors duration-150",
                  active ? "border-red text-cream" : "border-transparent text-cream-2 hover:text-cream",
                )}
              >
                <span className="truncate">{c.name}</span>
                <span className="ml-auto text-[12px] tabular-nums text-cream-2/80">{c.count}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
