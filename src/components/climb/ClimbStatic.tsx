"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Plus } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/format";
import { WAYPOINTS } from "@/data/climb";
import type { MenuItem } from "@/lib/menu";
import { addToPack } from "@/lib/add-to-pack";
import { getDishImage } from "@/lib/dish-path";
import { DishImage } from "@/components/menu/DishImage";
import { Altimeter } from "@/components/climb/Altimeter";

export type ClimbDish = Pick<MenuItem, "id" | "name" | "price" | "img" | "category" | "spice"> & { available: boolean; spiceable: boolean };

/* The climb as a scroll story, no WebGL required: a route line draws itself down the page while
   the brass altimeter reads out each camp. The sky behind darkens from Kathmandu morning to the
   night at the summit. This is also the fallback for the 3D ascent. */
export function ClimbStatic({ dishes }: { dishes: Record<string, ClimbDish> }) {
  const root = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const wp = WAYPOINTS[active];

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const cards = Array.from(el.querySelectorAll<HTMLElement>("[data-wp]"));
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.wp));
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    cards.forEach((c) => io.observe(c));

    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const r = el.getBoundingClientRect();
        const p = Math.min(1, Math.max(0, (innerHeight * 0.5 - r.top) / r.height));
        el.style.setProperty("--climb", p.toFixed(4));
      });
    };
    onScroll();
    addEventListener("scroll", onScroll, { passive: true });
    return () => {
      io.disconnect();
      removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={root} className="climb-static relative">
      <div className="sticky top-[76px] z-20 flex justify-center px-4 md:top-[92px] lg:absolute lg:inset-y-0 lg:left-[var(--gutter)] lg:top-0 lg:block lg:px-0">
        <div className="lg:sticky lg:top-[120px]">
          <Altimeter alt={wp.alt} temp={wp.temp} o2={wp.o2} place={wp.name} progress={active / (WAYPOINTS.length - 1)} compact className="lg:hidden" />
          <Altimeter alt={wp.alt} temp={wp.temp} o2={wp.o2} place={wp.name} progress={active / (WAYPOINTS.length - 1)} className="hidden lg:flex" />
          <ol className="mt-6 hidden space-y-2 pl-2 lg:block" aria-label="Camps">
            {WAYPOINTS.map((w, i) => (
              <li key={w.id} className={cn("caps flex items-center gap-2 text-[9.5px] transition-colors duration-500", i === active ? "text-brass-hi" : i < active ? "text-brass/60" : "text-muted/40")}>
                <span className={cn("h-1.5 w-1.5 rotate-45 transition-colors", i <= active ? "bg-foil" : "bg-muted/30")} />
                {w.name}
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="relative mx-auto max-w-[760px] px-[var(--gutter)] lg:ml-[calc(var(--gutter)+290px)] lg:mr-auto xl:ml-auto">
        {/* the route */}
        <svg aria-hidden="true" className="absolute left-[calc(var(--gutter)+14px)] top-0 h-full w-8 md:left-1/2 md:-ml-4" preserveAspectRatio="none" viewBox="0 0 32 1000">
          <path d="M16 0 C 4 120, 28 240, 16 360 S 4 600, 16 720 S 28 900, 16 1000" fill="none" stroke="rgba(222,196,146,.16)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
          <path
            className="climb-route"
            d="M16 0 C 4 120, 28 240, 16 360 S 4 600, 16 720 S 28 900, 16 1000"
            fill="none"
            stroke="#dcbf7b"
            strokeWidth="2"
            strokeDasharray="6 7"
            pathLength={1}
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        <ol className="relative space-y-[18vh] py-[10vh] md:space-y-[26vh]">
          {WAYPOINTS.map((w, i) => {
            const d = dishes[w.dish];
            const left = i % 2 === 0;
            return (
              <li key={w.id} data-wp={i} className={cn("relative pl-12 md:w-1/2 md:pl-0", left ? "md:pr-14" : "md:ml-auto md:pl-14")}>
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute top-3 flex h-7 w-7 items-center justify-center rounded-full border transition-all duration-700",
                    "left-[3px] md:left-auto",
                    left ? "md:-right-[14px]" : "md:-left-[14px]",
                    i <= active ? "border-foil bg-[radial-gradient(circle,#f3e2ae,#b08a4a)] shadow-[0_0_24px_rgba(220,191,123,.6)]" : "border-line-strong bg-night",
                  )}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-night" />
                </span>
                <WaypointCard w={w} d={d} i={i} />
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

function WaypointCard({ w, d, i }: { w: (typeof WAYPOINTS)[number]; d?: ClimbDish; i: number }) {
  const photo = useRef<HTMLDivElement>(null);
  const summit = w.id === "summit";
  return (
    <article className={cn("climb-card glass reveal-lite rounded-[24px] p-4 md:p-5", summit && "border-foil/50")} style={{ ["--i" as string]: i }}>
      <p className="caps num text-[10px] text-brass">
        {w.alt.toLocaleString("en-US", { maximumFractionDigits: 2 })} m · {w.name}
      </p>
      <h3 className={cn("display mt-2 text-[28px] leading-tight text-brass-hi md:text-[32px]", summit && "brass-text text-[36px] md:text-[44px]")}>{w.title}</h3>
      <p className="mt-2 text-[15px] leading-relaxed text-text/80">{w.body}</p>
      {d && (
        <div className="mt-4 flex items-center gap-3 rounded-2xl border border-line bg-void/35 p-2 pr-3">
          <div ref={photo} className="shrink-0">
            <DishImage item={d} available={d.available} sizes="64px" className="h-16 w-16 rounded-xl" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[15px] text-text">{d.name}</p>
            <p className="num text-[13px] text-brass">{formatPrice(d.price)}</p>
          </div>
          <button
            type="button"
            onClick={() => addToPack(d.id, d.name, { spice: d.spiceable ? (d.spice >= 3 ? "Hot" : "Medium") : undefined }, photo.current, d.available ? getDishImage(d) : null)}
            aria-label={`Add ${d.name} to your pack`}
            className="add-btn flex h-10 w-10 items-center justify-center rounded-full"
          >
            <Plus size={18} aria-hidden="true" />
          </button>
        </div>
      )}
      <Link href={w.link.href} className={cn("group mt-4 inline-flex items-center gap-2 text-[14px] font-medium", summit ? "btn btn-brass px-5 py-3" : "text-brass-hi")}>
        {w.link.label}
        <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" aria-hidden="true" />
      </Link>
    </article>
  );
}
