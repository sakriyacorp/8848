"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { useDebounced, useFocusTrap, useScrollLock } from "@/lib/hooks";
import { EMPTY_SELECTION, matches, selectionCount, type CardFacts, type Selection } from "@/lib/filters";
import { useUI } from "@/lib/ui";
import { addToPack } from "@/lib/add-to-pack";
import { isOn } from "@/config/features";
import { CampRail, CampChips, type Camp } from "@/components/menu/CampRail";
import { ActiveFilters, FilterPanel, type Group } from "@/components/menu/FilterPanel";

/* The one client boundary for the menu (Natraj's MenuClient, re-dressed): cards arrive
   server-rendered as HTML; search, filters, active-camp tracking and card clicks all work on
   that DOM directly, so nothing per-dish is hydrated. */

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
          spice: Number(el.dataset.spice ?? 0),
          search: el.dataset.search ?? "",
        },
      });
    });
  });
  return out;
}

const GROUPS: Group[] = ["diet", "heat", "more"];

export function MenuClient({ camps, children }: { camps: Camp[]; children: ReactNode }) {
  const container = useRef<HTMLDivElement>(null);
  const cards = useRef<CardRef[] | null>(null);
  const sheet = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const q = useDebounced(query, 140).trim().toLowerCase();
  const [sel, setSel] = useState<Selection>(EMPTY_SELECTION);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [counts, setCounts] = useState<Record<string, number>>(() => Object.fromEntries(camps.map((c) => [c.id, c.count])));
  const [optionCounts, setOptionCounts] = useState<Record<string, number>>({});
  const [active, setActive] = useState<string | null>(camps[0]?.id ?? null);
  const openSheet = useUI((s) => s.openSheet);

  const activeCount = selectionCount(sel);
  const navCamps = camps.filter((c) => (counts[c.id] ?? 0) > 0).map((c) => ({ ...c, count: counts[c.id] }));
  const total = navCamps.reduce((n, c) => n + c.count, 0);

  const closeSheet = useCallback(() => setSheetOpen(false), []);
  useFocusTrap(sheet, sheetOpen, closeSheet);
  useScrollLock(sheetOpen);

  /* Apply search + filters to the DOM and recount camps and options. */
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
      if (count) count.textContent = `${visible} ${visible === 1 ? "dish" : "dishes"}`;
      next[id] = visible;
    });
    setCounts(next);

    const opt: Record<string, number> = {};
    const values: Record<Group, string[]> = {
      diet: ["vegetarian", "vegan", "gf", "nutfree"],
      heat: ["mild", "medium", "hot"],
      more: ["chef", "popular"],
    };
    for (const g of GROUPS) {
      for (const id of values[g]) {
        const current = sel[g] as string[];
        const trial: Selection = { ...sel, [g]: current.includes(id) ? current : [...current, id] };
        opt[`${g}:${id}`] = list.filter((c) => matches(c.facts, trial, q)).length;
      }
    }
    setOptionCounts(opt);
  }, [q, sel]);

  /* Which camp are we at? */
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
      { rootMargin: "-140px 0px -55% 0px" },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [counts]);

  /* Delegated card clicks. */
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
      } else if (btn.dataset.action === "add" && card.dataset.choose) {
        openSheet(id);
      } else if (btn.dataset.action === "add") {
        const photo = card.querySelector<HTMLElement>("[data-photo]");
        addToPack(id, card.dataset.name ?? "Dish", { spice: card.dataset.spiceable ? (Number(card.dataset.spice) >= 3 ? "Hot" : "Medium") : undefined }, photo, photo?.dataset.src ?? null);
        btn.classList.remove("added");
        void btn.offsetWidth;
        btn.classList.add("added");
      }
    };
    root.addEventListener("click", onClick);
    return () => root.removeEventListener("click", onClick);
  }, [openSheet]);

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
  const summary = `${total} ${total === 1 ? "dish" : "dishes"}`;
  const campsOn = isOn("campRail");

  return (
    <>
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <label className="relative block flex-1 md:max-w-[400px]">
          <span className="sr-only">Search the menu</span>
          <Search size={16} aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-bronze" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search momo, sekuwa, biryani…"
            autoComplete="off"
            className="h-12 w-full rounded-full border border-ink-line bg-white/45 pl-11 pr-10 text-[16px] text-choc outline-none transition-[border-color,background] placeholder:text-bronze/90 focus:border-bronze focus:bg-white/70 [&::-webkit-search-cancel-button]:hidden"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-bronze hover:bg-choc/10"
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
            "flex h-12 items-center justify-center gap-2 rounded-full border px-5 text-[14px] font-medium transition-colors lg:hidden",
            activeCount > 0 ? "border-choc bg-choc text-paper" : "border-ink-line bg-white/45 text-choc",
          )}
        >
          <SlidersHorizontal size={15} aria-hidden="true" />
          Filters
          {activeCount > 0 && <span className="num flex h-5 min-w-5 items-center justify-center rounded-full bg-paper px-1.5 text-[11px] font-semibold text-choc">{activeCount}</span>}
        </button>
        <p aria-live="polite" className="num text-[13px] text-bronze md:ml-auto">
          {summary}
        </p>
      </div>

      <ActiveFilters sel={sel} onToggle={toggle} onClear={clearFilters} />

      <div className="mt-4 hidden rounded-2xl border border-ink-line bg-white/30 px-5 py-4 lg:block">
        <FilterPanel sel={sel} counts={optionCounts} onToggle={toggle} onClear={clearFilters} layout="inline" />
      </div>

      {navCamps.length > 0 && <CampChips camps={navCamps} activeId={active} onSelect={select} climber={campsOn} />}

      <div className="mt-6 lg:grid lg:grid-cols-[240px_1fr] lg:gap-10">
        {navCamps.length > 0 && <CampRail camps={navCamps} activeId={active} onSelect={select} climber={campsOn} />}
        <div className="min-w-0">
          {total === 0 && (
            <div className="rounded-3xl border border-dashed border-ink-line px-6 py-16 text-center">
              <p className="display text-[26px] text-choc">Nothing on the trail matches {q ? `“${query.trim()}”` : "those filters"}.</p>
              <p className="mt-2 text-bronze">Try “momo”, “lamb” or “vegan”.</p>
              <button type="button" onClick={clearAll} className="btn btn-ink mt-6 px-5 py-2.5 text-[14px]">
                Clear search and filters
              </button>
            </div>
          )}
          <div ref={container} className={cn(total === 0 && "hidden")}>
            {children}
          </div>
        </div>
      </div>

      {/* Phone and tablet: the filters in a bottom sheet. */}
      <div
        aria-hidden="true"
        onClick={closeSheet}
        className={cn("fixed inset-0 z-[70] bg-void/60 transition-opacity duration-300 lg:hidden", sheetOpen ? "opacity-100" : "pointer-events-none opacity-0")}
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
          "paper fixed inset-x-0 bottom-0 z-[71] flex max-h-[86svh] flex-col rounded-t-[28px] outline-none transition-[transform,visibility] duration-500 ease-out lg:hidden",
          sheetOpen ? "visible translate-y-0" : "invisible translate-y-full",
        )}
      >
        <div className="flex items-center justify-between px-5 pb-2 pt-5">
          <h2 id="menu-filters-title" className="display text-[28px] text-choc">
            Filters
          </h2>
          <button type="button" onClick={closeSheet} aria-label="Close filters" className="flex h-10 w-10 items-center justify-center rounded-full border border-ink-line text-choc">
            <X size={16} aria-hidden="true" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-3">
          <FilterPanel sel={sel} counts={optionCounts} onToggle={toggle} onClear={clearFilters} layout="sheet" />
        </div>
        <div className="flex items-center gap-3 border-t border-ink-line p-4">
          <button type="button" onClick={clearFilters} className="btn btn-ink px-5 py-3 text-[14px]" disabled={activeCount === 0}>
            Clear
          </button>
          <button type="button" onClick={closeSheet} className="btn btn-brass flex-1 py-3.5 text-[15px]">
            Show {summary}
          </button>
        </div>
      </div>
    </>
  );
}
