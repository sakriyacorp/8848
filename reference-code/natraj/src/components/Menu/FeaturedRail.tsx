"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { formatMoney } from "@/lib/format";
import { useBag } from "@/lib/bag";
import { useUI } from "@/lib/ui";
import { DishImage } from "@/components/Menu/DishImage";

export type RailEntry = { id: string; name: string; price: number; img: string; available: boolean; spice: boolean };

const STEP_MS = 3600;
const IDLE_MS = 7000;

/* A snap rail of the featured dishes. It advances by itself every few seconds while it is on
   screen and nobody is touching it; hover, focus, drag, wheel, swipe or the arrows all pause
   it. Reduced motion turns autoplay off. Plain data in, so this chunk never pulls menu.json. */
export function FeaturedRail({ items }: { items: RailEntry[] }) {
  const scroller = useRef<HTMLUListElement>(null);
  const drag = useRef({ down: false, moved: false, startX: 0, startLeft: 0 });
  const lastTouch = useRef(0);
  const [paused, setPaused] = useState(false);
  const [inView, setInView] = useState(false);
  const [autoplay, setAutoplay] = useState(false);
  const [ready, setReady] = useState(false);
  const openSheet = useUI((s) => s.openSheet);
  const showToast = useUI((s) => s.showToast);
  const add = useBag((s) => s.add);

  /* Photos are requested a beat after load so they never queue up alongside the hero image. */
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 600);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    setAutoplay(!matchMedia("(prefers-reduced-motion: reduce)").matches);
    const el = scroller.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const step = () => {
    const el = scroller.current;
    const card = el?.querySelector<HTMLElement>("li");
    return card ? card.offsetWidth + 16 : 300;
  };

  useEffect(() => {
    if (!autoplay || !inView || paused) return;
    const id = setInterval(() => {
      const el = scroller.current;
      if (!el || Date.now() - lastTouch.current < IDLE_MS) return;
      const max = el.scrollWidth - el.clientWidth;
      if (el.scrollLeft >= max - 4) el.scrollTo({ left: 0, behavior: "smooth" });
      else el.scrollBy({ left: step(), behavior: "smooth" });
    }, STEP_MS);
    return () => clearInterval(id);
  }, [autoplay, inView, paused]);

  const touched = () => {
    lastTouch.current = Date.now();
  };

  const nudge = (dir: 1 | -1) => {
    touched();
    const el = scroller.current;
    if (!el) return;
    const cards = window.innerWidth >= 1024 ? 2 : 1;
    el.scrollBy({ left: dir * step() * cards, behavior: "smooth" });
  };

  const onPointerDown = (e: React.PointerEvent<HTMLUListElement>) => {
    touched();
    if (e.pointerType !== "mouse" || !scroller.current) return;
    drag.current = { down: true, moved: false, startX: e.clientX, startLeft: scroller.current.scrollLeft };
    scroller.current.style.scrollSnapType = "none";
    scroller.current.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLUListElement>) => {
    const d = drag.current;
    if (!d.down || !scroller.current) return;
    const dx = e.clientX - d.startX;
    if (Math.abs(dx) > 4) d.moved = true;
    scroller.current.scrollLeft = d.startLeft - dx;
  };
  const onPointerUp = () => {
    if (!scroller.current) return;
    drag.current.down = false;
    scroller.current.style.scrollSnapType = "";
  };
  const onClickCapture = (e: React.MouseEvent) => {
    if (drag.current.moved) {
      e.preventDefault();
      e.stopPropagation();
      drag.current.moved = false;
    }
  };

  const quickAdd = (e: RailEntry) => {
    touched();
    add(e.id, { spice: e.spice ? "Medium" : undefined });
    showToast(`Added ${e.name}`, { undo: true });
  };

  return (
    <div
      aria-roledescription="carousel"
      aria-label="Featured dishes"
      className="rail-wrap relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setPaused(false);
      }}
    >
      <ul
        ref={scroller}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onClickCapture={onClickCapture}
        onWheel={touched}
        onTouchStart={touched}
        onKeyDown={touched}
        className="no-scrollbar mt-8 flex cursor-grab snap-x snap-mandatory gap-4 overflow-x-auto pb-4 pl-(--edge) pr-5 scroll-pl-(--edge) active:cursor-grabbing md:mt-10 md:pr-8"
      >
        {items.map((e) => (
          <li
            key={e.id}
            className="group relative h-[300px] w-[228px] shrink-0 snap-start overflow-hidden rounded-[20px] bg-charcoal transition-transform duration-200 ease-out hover:-translate-y-1 md:h-[360px] md:w-[280px]"
          >
            <div className="absolute inset-0">
              <DishImage item={e} available={e.available && ready} sizes="(max-width: 767px) 228px, 280px" className="dish-photo h-full w-full" iconSize={36} />
            </div>
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(7,7,7,0.9)_0%,rgba(7,7,7,0.3)_45%,transparent_100%)]"
            />
            <button
              type="button"
              onClick={() => openSheet(e.id)}
              aria-label={`${e.name}, ${formatMoney(e.price)}. View details`}
              className="absolute inset-0 z-[1] rounded-[20px]"
            />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] p-4 pr-16">
              <p className="display text-[22px] leading-tight text-cream">{e.name}</p>
              <p className="mt-1 text-[15px] font-medium tabular-nums text-cream-2 transition-colors duration-200 group-hover:text-gold">
                {formatMoney(e.price)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => quickAdd(e)}
              aria-label={`Add ${e.name} to bag`}
              className="glass absolute bottom-4 right-4 z-[2] flex h-10 w-10 items-center justify-center rounded-full text-cream transition-[background,transform] duration-150 ease-bounce hover:scale-105 hover:bg-red"
            >
              <Plus size={18} aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-2 flex justify-end gap-2 pr-(--edge)">
        <button
          type="button"
          onClick={() => nudge(-1)}
          aria-label="Previous dishes"
          className="glass flex h-11 w-11 items-center justify-center rounded-full text-cream transition-[background,transform] duration-150 ease-bounce hover:scale-105 hover:bg-[rgba(242,232,213,0.12)]"
        >
          <ChevronLeft size={18} aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => nudge(1)}
          aria-label="Next dishes"
          className="glass flex h-11 w-11 items-center justify-center rounded-full text-cream transition-[background,transform] duration-150 ease-bounce hover:scale-105 hover:bg-[rgba(242,232,213,0.12)]"
        >
          <ChevronRight size={18} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
