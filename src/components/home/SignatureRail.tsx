"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/format";
import { getDishImage } from "@/lib/dish-path";
import type { Spice, Tag } from "@/lib/menu";
import { useUI } from "@/lib/ui";
import { addToPack } from "@/lib/add-to-pack";
import { DishImage } from "@/components/menu/DishImage";
import { DietBadges, SpicePeaks } from "@/components/menu/SpicePeaks";

export type RailEntry = {
  id: string;
  name: string;
  np?: string;
  price: number;
  desc: string;
  img: string;
  category: string;
  available: boolean;
  spiceable: boolean;
  spice: Spice;
  tags: Tag[];
  camp: string;
};

/* Natraj's FeaturedRail on paper: a snap rail of tall menu cards that nudges itself along every
   few seconds while on screen and untouched. Drag with the mouse, swipe on phones. */
const STEP_MS = 4200;
const IDLE_MS = 7000;

export function SignatureRail({ items }: { items: RailEntry[] }) {
  const scroller = useRef<HTMLUListElement>(null);
  const drag = useRef({ down: false, moved: false, startX: 0, startLeft: 0 });
  const lastTouch = useRef(0);
  const [paused, setPaused] = useState(false);
  const [inView, setInView] = useState(false);
  const [autoplay, setAutoplay] = useState(false);
  const openSheet = useUI((s) => s.openSheet);

  useEffect(() => {
    setAutoplay(!matchMedia("(prefers-reduced-motion: reduce)").matches);
    const el = scroller.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const step = () => {
    const card = scroller.current?.querySelector<HTMLElement>("li");
    return card ? card.offsetWidth + 20 : 300;
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
    scroller.current?.scrollBy({ left: dir * step() * (innerWidth >= 1024 ? 2 : 1), behavior: "smooth" });
  };

  return (
    <div
      aria-roledescription="carousel"
      aria-label="Signature dishes"
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setPaused(false);
      }}
    >
      <ul
        ref={scroller}
        onPointerDown={(e) => {
          touched();
          if (e.pointerType !== "mouse" || !scroller.current) return;
          drag.current = { down: true, moved: false, startX: e.clientX, startLeft: scroller.current.scrollLeft };
          scroller.current.style.scrollSnapType = "none";
        }}
        onPointerMove={(e) => {
          const d = drag.current;
          if (!d.down || !scroller.current) return;
          const dx = e.clientX - d.startX;
          if (Math.abs(dx) > 4) d.moved = true;
          scroller.current.scrollLeft = d.startLeft - dx;
        }}
        onPointerUp={() => {
          drag.current.down = false;
          if (scroller.current) scroller.current.style.scrollSnapType = "";
        }}
        onPointerLeave={() => {
          drag.current.down = false;
          if (scroller.current) scroller.current.style.scrollSnapType = "";
        }}
        onClickCapture={(e) => {
          if (drag.current.moved) {
            e.preventDefault();
            e.stopPropagation();
            drag.current.moved = false;
          }
        }}
        onWheel={touched}
        onTouchStart={touched}
        className="no-scrollbar mt-10 flex cursor-grab snap-x snap-mandatory gap-5 overflow-x-auto pb-8 pt-2 [padding-inline:max(var(--gutter),calc((100vw-var(--maxw))/2+var(--gutter)))] [scroll-padding-inline:max(var(--gutter),calc((100vw-var(--maxw))/2+var(--gutter)))] active:cursor-grabbing md:mt-14"
      >
        {items.map((e, i) => (
          <SigCard key={e.id} e={e} i={i} onOpen={() => openSheet(e.id)} />
        ))}
      </ul>
      <div className="container-x flex items-center justify-between">
        <p className="caps text-[10px] text-bronze">Drag, swipe or tap a dish</p>
        <div className="flex gap-2">
          <button type="button" onClick={() => nudge(-1)} aria-label="Previous dishes" className="flex h-11 w-11 items-center justify-center rounded-full border border-ink-line text-choc transition-[background,transform] hover:-translate-x-0.5 hover:bg-white/50">
            <ChevronLeft size={18} aria-hidden="true" />
          </button>
          <button type="button" onClick={() => nudge(1)} aria-label="Next dishes" className="flex h-11 w-11 items-center justify-center rounded-full border border-ink-line text-choc transition-[background,transform] hover:translate-x-0.5 hover:bg-white/50">
            <ChevronRight size={18} aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}

function SigCard({ e, i, onOpen }: { e: RailEntry; i: number; onOpen(): void }) {
  const photo = useRef<HTMLDivElement>(null);
  const [pop, setPop] = useState(0);
  return (
    <li
      data-tilt="4"
      className={cn("sig-card group relative w-[270px] shrink-0 snap-start rounded-[26px] p-3 md:w-[310px]", e.spice >= 3 && "heat")}
      style={{ ["--i" as string]: i }}
    >
      <button type="button" onClick={onOpen} aria-label={`${e.name}, ${formatPrice(e.price)}. Details`} className="absolute inset-0 z-[1] rounded-[26px]" />
      <div ref={photo}>
        <DishImage item={e} available={e.available} sizes="(max-width: 767px) 270px, 310px" className="aspect-[4/5] w-full rounded-[20px]" steam />
      </div>
      <p className="caps mt-4 text-[9.5px] text-bronze">{e.camp}</p>
      <div className="mt-1.5 flex items-baseline gap-2">
        <h3 className="display text-[25px] leading-tight text-choc">{e.name}</h3>
        <span aria-hidden="true" className="mb-[6px] min-w-3 flex-1 border-b-[1.5px] border-dotted border-choc/30" />
        <span className="num text-[16px] font-medium text-choc">{formatPrice(e.price)}</span>
      </div>
      {e.np && (
        <p lang="ne" className="np text-[13.5px] text-bronze/80">
          {e.np}
        </p>
      )}
      <p className="mt-2 line-clamp-2 text-[14px] leading-snug text-bronze">{e.desc}</p>
      <div className="mt-3 flex items-center gap-3">
        <SpicePeaks level={e.spice} />
        <DietBadges tags={e.tags} />
      </div>
      <button
        key={pop}
        type="button"
        onClick={() => {
          addToPack(e.id, e.name, { spice: e.spiceable ? (e.spice >= 3 ? "Hot" : "Medium") : undefined }, photo.current, e.available ? getDishImage(e) : null);
          setPop((p) => p + 1);
        }}
        aria-label={`Add ${e.name} to your pack`}
        className={cn("add-btn absolute right-6 top-6 z-[2] flex h-11 w-11 items-center justify-center rounded-full", pop > 0 && "added")}
      >
        <Plus size={19} aria-hidden="true" />
      </button>
    </li>
  );
}
