"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { useDebounced, useFocusTrap, useScrollLock } from "@/lib/hooks";
import { EMPTY_SELECTION, matches, selectionCount, type CardFacts, type Selection } from "@/lib/filters";
import { useBag } from "@/lib/bag";
import { useUI } from "@/lib/ui";
import { CategoryRail, type CategoryNavItem } from "@/components/Menu/CategoryRail";
import { CategoryChips } from "@/components/Menu/CategoryChips";
import { ActiveFilters, FilterPanel, type Group } from "@/components/Menu/FilterPanel";

/* The one client boundary for the menu. Cards and sections arrive server-rendered as
   children; search, the grouped filters, active-category tracking and card clicks all work
   on that DOM directly, so nothing per-dish is hydrated. Filters combine: any of the chosen
   courses or drink kinds, and every chosen diet / "more" tag, and the search text. */

type Props = { categories: CategoryNavItem[]; children: ReactNode };

type CardRef = { el: HTMLElement; facts: CardFacts; section: string };

function readCards(root: HTMLElement): CardRef[] {
  const out: CardRef[] = [];
  root.querySelectorAll<HTMLElement>("[data-section]").forEach((section) => {
    section.querySelectorAll<HTMLElement>("[data-item]").forEach((el) => {
      out.push({
        el,
        section: section.dataset.section ?? "",
        facts: {
          tags: (el.dataset.tags ?? "").split(" ").filter(Boolean),
          course: el.dataset.course ?? "",
          kind: el.dataset.kind ?? "",
          search: el.dataset.search ?? "",
        },
      });
    });
  });
  return out;
}

const GROUP_KEYS: Group[] = ["diet", "course", "drink", "more"];

export function MenuClient({ categories, children }: Props) {
  const container = useRef<HTMLDivElement>(null);
  const cards = useRef<CardRef[] | null>(null);
  const sheet = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const q = useDebounced(query, 150).trim().toLowerCase();
  const [sel, setSel] = useState<Selection>(EMPTY_SELECTION);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [counts, setCounts] = useState<Record<string, number>>(() =>
    Object.fromEntries(categories.map((c) => [c.id, c.count])),
  );
  const [optionCounts, setOptionCounts] = useState<Record<string, number>>({});
  const [active, setActive] = useState<string | null>(categories[0]?.id ?? null);
  const openSheet = useUI((s) => s.openSheet);
  const showToast = useUI((s) => s.showToast);
  const add = useBag((s) => s.add);

  const activeCount = selectionCount(sel);
  const filtering = q !== "" || activeCount > 0;
  const navItems = categories.filter((c) => (counts[c.id] ?? 0) > 0).map((c) => ({ ...c, count: counts[c.id] }));
  const total = navItems.reduce((n, c) => n + c.count, 0);

  const closeSheet = useCallback(() => setSheetOpen(false), []);
  useFocusTrap(sheet, sheetOpen, closeSheet);
  useScrollLock(sheetOpen);

  /* Apply search + filters to the DOM and recount categories and options. */
  useEffect(() => {
    const root = container.current;
    if (!root) return;
    if (!cards.current) cards.current = readCards(root);
    const list = cards.current;

    const next: Record<string, number> = {};
    for (const c of list) {
      const ok = matches(c.facts, sel, q);
      c.el.hidden = !ok;
      next[c.section] = (next[c.section] ?? 0) + (ok ? 1 : 0);
    }
    root.querySelectorAll<HTMLElement>("[data-section]").forEach((section) => {
      const id = section.dataset.section ?? "";
      const visible = next[id] ?? 0;
      section.hidden = visible === 0;
      const count = section.querySelector<HTMLElement>("[data-count]");
      if (count) count.textContent = String(visible);
      next[id] = visible;
    });
    setCounts(next);

    /* What each option would yield if it were switched on, given everything else. */
    const opt: Record<string, number> = {};
    const seen = new Map<Group, Set<string>>();
    for (const c of list) {
      const values: Record<Group, string[]> = {
        diet: c.facts.tags,
        course: c.facts.course ? [c.facts.course] : [],
        drink: c.facts.kind ? [c.facts.kind] : [],
        more: c.facts.tags,
      };
      for (const g of GROUP_KEYS) for (const v of values[g]) (seen.get(g) ?? seen.set(g, new Set()).get(g)!).add(v);
    }
    for (const g of GROUP_KEYS) {
      for (const id of seen.get(g) ?? []) {
        const current = sel[g] as string[];
        const trial: Selection = { ...sel, [g]: current.includes(id) ? current : [...current, id] };
        opt[`${g}:${id}`] = list.filter((c) => matches(c.facts, trial, q)).length;
      }
    }
    setOptionCounts(opt);
  }, [q, sel]);

  useEffect(() => {
    const root = container.current;
    if (!root) return;
    const sections = Array.from(root.querySelectorAll<HTMLElement>("[data-section]")).filter((s) => !s.hidden);
    if (sections.length === 0) return;
    const visible = new Map<string, number>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const id = (e.target as HTMLElement).dataset.section ?? "";
          if (e.isIntersecting) visible.set(id, e.boundingClientRect.top);
          else visible.delete(id);
        }
        if (visible.size > 0) setActive([...visible.entries()].sort((a, b) => a[1] - b[1])[0][0]);
      },
      { rootMargin: "-130px 0px -55% 0px" },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [counts]);

  useEffect(() => {
    const root = container.current;
    if (!root) return;
    const onClick = (e: MouseEvent) => {
      const btn = (e.target as Element).closest<HTMLElement>("[data-action]");
      if (!btn || !root.contains(btn)) return;
      const card = btn.closest<HTMLElement>("[data-item]");
      const id = card?.dataset.item;
      if (!card || !id) return;
      if (btn.dataset.action === "open") {
        openSheet(id);
      } else if (btn.dataset.action === "add") {
        add(id, { spice: card.dataset.spice ? "Medium" : undefined });
        showToast(`Added ${card.dataset.name ?? "to bag"}`, { undo: true });
      }
    };
    root.addEventListener("click", onClick);
    return () => root.removeEventListener("click", onClick);
  }, [openSheet, add, showToast]);

  const select = (id: string) => {
    setActive(id);
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.getElementById(`cat-${id}`)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    history.replaceState(null, "", `#cat-${id}`);
  };
  const toggle = (group: Group, id: string) =>
    setSel((s) => {
      const current = s[group] as string[];
      return { ...s, [group]: current.includes(id) ? current.filter((x) => x !== id) : [...current, id] };
    });
  const clearFilters = () => setSel(EMPTY_SELECTION);
  const clearAll = () => {
    setQuery("");
    setSel(EMPTY_SELECTION);
  };
  const summary = useMemo(() => `${total} ${total === 1 ? "dish" : "dishes"}`, [total]);

  return (
    <>
      <div className="mt-8 flex flex-col gap-3 md:flex-row md:items-center">
        <label className="relative block flex-1 md:max-w-[380px]">
          <span className="sr-only">Search the menu</span>
          <Search size={16} aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-cream-2" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search dishes"
            autoComplete="off"
            className="h-11 w-full rounded-full border border-line bg-glass pl-11 pr-10 text-[15px] text-cream outline-none transition-colors duration-150 placeholder:text-cream-2/80 focus:border-red/60 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-red [&::-webkit-search-cancel-button]:hidden"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-cream-2 hover:bg-cream/10 hover:text-cream"
            >
              <X size={14} aria-hidden="true" />
            </button>
          )}
        </label>
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={sheetOpen}
          aria-controls="menu-filters"
          className={cn(
            "flex h-11 items-center justify-center gap-2 rounded-full border px-4 text-[14px] font-medium transition-colors duration-150 lg:hidden",
            activeCount > 0 ? "border-red bg-red/15 text-cream" : "border-line bg-glass text-cream-2 hover:text-cream",
          )}
        >
          <SlidersHorizontal size={15} aria-hidden="true" />
          Filters
          {activeCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red px-1.5 text-[11px] font-semibold tabular-nums text-cream">
              {activeCount}
            </span>
          )}
        </button>
        <p aria-live="polite" className="text-[13px] tabular-nums text-cream-2 md:ml-auto">
          {summary}
        </p>
      </div>

      <ActiveFilters sel={sel} onToggle={toggle} onClear={clearFilters} />

      <div className="glass mt-4 hidden rounded-2xl px-5 py-4 lg:block">
        <FilterPanel sel={sel} counts={optionCounts} onToggle={toggle} onClear={clearFilters} layout="inline" />
      </div>

      {navItems.length > 0 && <CategoryChips categories={navItems} activeId={active} onSelect={select} />}

      <div className="mt-6 lg:grid lg:grid-cols-[220px_1fr] lg:gap-12">
        {navItems.length > 0 && <CategoryRail categories={navItems} activeId={active} onSelect={select} />}
        <div className="min-w-0">
          {total === 0 && (
            <div className="rounded-3xl border border-line px-6 py-16 text-center">
              <p className="text-[17px] text-cream">
                Nothing matches {q ? `“${query.trim()}”` : "those filters"}. Try “lamb” or “naan”.
              </p>
              <button type="button" onClick={clearAll} className="btn-ghost mt-5 px-5 py-2.5 text-[14px]">
                Clear search and filters
              </button>
            </div>
          )}
          <div ref={container} className={cn(total === 0 && "hidden", filtering && "[&>section]:first-of-type:border-t-0")}>
            {children}
          </div>
        </div>
      </div>

      {/* Phone and tablet: the same groups in a bottom sheet. */}
      <div
        aria-hidden="true"
        onClick={closeSheet}
        className={cn(
          "fixed inset-0 z-[70] bg-void/60 transition-opacity duration-[260ms] ease-soft lg:hidden",
          sheetOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />
      <div
        id="menu-filters"
        ref={sheet}
        role="dialog"
        aria-modal="true"
        aria-labelledby="menu-filters-title"
        aria-hidden={!sheetOpen}
        inert={!sheetOpen}
        tabIndex={-1}
        className={cn(
          "glass fixed inset-x-0 bottom-0 z-[71] flex max-h-[86svh] flex-col rounded-t-3xl outline-none transition-[transform,visibility] duration-[260ms] ease-soft [--glass-base:rgba(13,12,12,0.92)] lg:hidden",
          sheetOpen ? "visible translate-y-0" : "invisible translate-y-full",
        )}
      >
        <div className="flex items-center justify-between px-5 pb-2 pt-4">
          <h2 id="menu-filters-title" className="display text-[24px] text-cream">
            Filters
          </h2>
          <button
            type="button"
            onClick={closeSheet}
            aria-label="Close filters"
            className="glass flex h-9 w-9 items-center justify-center rounded-full text-cream hover:bg-cream/10"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-3">
          <FilterPanel sel={sel} counts={optionCounts} onToggle={toggle} onClear={clearFilters} layout="sheet" />
        </div>
        <div className="flex items-center gap-3 border-t border-line p-4">
          <button type="button" onClick={clearFilters} className="btn-ghost px-5 py-3 text-[14px]" disabled={activeCount === 0}>
            Clear all
          </button>
          <button type="button" onClick={closeSheet} className="btn-primary flex-1 py-3 text-[15px]">
            Show {summary}
          </button>
        </div>
      </div>
    </>
  );
}
