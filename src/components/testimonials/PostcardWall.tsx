"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { cn } from "@/lib/cn";
import type { Testimonial } from "@/data/testimonials";
import { Postcard } from "@/components/testimonials/Postcard";

/* sakriya's WallMarquee, turned sideways and made to work on phones.
   - Horizontal lanes that auto-scroll on every screen size, alternating direction
     (2 lanes on phones, 3 on desktop). rAF-driven with a clamped dt; each lane's cards are
     duplicated (aria-hidden) so the loop is seamless.
   - Speed ≈ one card every 5 s: moving the moment you see it, slow enough to read.
   - Tap a card to stop its lane (the card lifts and glows); tap again to let it go.
     Hover pauses a lane on desktop. A Pause button stops everything (WCAG 2.2.2).
   - Only runs while on screen. Reduced motion: lanes become swipeable rows. */

const SECONDS_PER_CARD = 5;

function lanesFor(items: Testimonial[], n: number): Testimonial[][] {
  const lanes: Testimonial[][] = Array.from({ length: n }, () => []);
  items.forEach((t, i) => lanes[i % n].push(t));
  return lanes;
}

export function PostcardWall({ items }: { items: Testimonial[] }) {
  const wall = useRef<HTMLDivElement>(null);
  const [laneCount, setLaneCount] = useState(2);
  const [paused, setPaused] = useState<boolean[]>([false, false, false]);
  const [pinned, setPinned] = useState<(string | null)[]>([null, null, null]);
  const [allStopped, setAllStopped] = useState(false);
  const [reduced, setReduced] = useState(false);
  const state = useRef({ paused: [false, false, false], hover: [false, false, false], all: false });

  useEffect(() => {
    setReduced(matchMedia("(prefers-reduced-motion: reduce)").matches);
    const mq = matchMedia("(min-width: 1024px)");
    const apply = () => setLaneCount(mq.matches ? 3 : 2);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    state.current.paused = paused;
    state.current.all = allStopped;
  }, [paused, allStopped]);

  const lanes = lanesFor(items, laneCount);

  useEffect(() => {
    const root = wall.current;
    if (!root || reduced) return;
    const tracks = Array.from(root.querySelectorAll<HTMLElement>("[data-track]"));
    const halves = tracks.map(() => 0);
    const cardW = tracks.map(() => 340);
    const measure = () =>
      tracks.forEach((t, i) => {
        halves[i] = t.scrollWidth / 2;
        const c = t.querySelector<HTMLElement>("[data-card]");
        cardW[i] = c ? c.offsetWidth + 20 : 340;
      });
    measure();
    const ro = new ResizeObserver(measure);
    tracks.forEach((t) => ro.observe(t));

    const pos = tracks.map((_, i) => (i % 2 ? -halves[i] * 0.37 : -halves[i] * 0.11));
    const vel = tracks.map(() => 1);
    let raf = 0;
    let last = performance.now();
    let visible = false;

    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      tracks.forEach((t, i) => {
        const h = halves[i];
        if (!h) return;
        const stop = state.current.all || state.current.paused[i] || state.current.hover[i];
        // ease to a stop / back to speed rather than snapping
        vel[i] += ((stop ? 0 : 1) - vel[i]) * Math.min(1, dt * 6);
        const speed = (cardW[i] / SECONDS_PER_CARD) * (i === 1 ? 0.88 : i === 2 ? 1.07 : 1);
        const dir = i % 2 ? 1 : -1;
        pos[i] += dir * speed * vel[i] * dt;
        if (pos[i] <= -h) pos[i] += h;
        if (pos[i] > 0) pos[i] -= h;
        t.style.transform = `translate3d(${pos[i].toFixed(2)}px,0,0)`;
      });
      raf = requestAnimationFrame(frame);
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      cancelAnimationFrame(raf);
      if (visible) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    });
    io.observe(root);

    const canHover = matchMedia("(hover: hover)").matches;
    const laneEls = Array.from(root.querySelectorAll<HTMLElement>("[data-lane]"));
    const enters = laneEls.map((el, i) => {
      const on = () => {
        if (canHover) state.current.hover[i] = true;
      };
      const off = () => {
        state.current.hover[i] = false;
      };
      el.addEventListener("mouseenter", on);
      el.addEventListener("mouseleave", off);
      return [el, on, off] as const;
    });

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      enters.forEach(([el, on, off]) => {
        el.removeEventListener("mouseenter", on);
        el.removeEventListener("mouseleave", off);
      });
    };
  }, [laneCount, items.length, reduced]);

  const onTap = (lane: number, key: string) => {
    const same = pinned[lane] === key;
    setPinned((p) => p.map((v, i) => (i === lane ? (same ? null : key) : v)));
    setPaused((p) => p.map((v, i) => (i === lane ? !same : v)));
  };

  return (
    <div className="relative">
      <div ref={wall} className="edge-mask-x -mx-[var(--gutter)] space-y-5 overflow-hidden py-6 md:space-y-7" aria-roledescription="carousel" aria-label="Guest postcards">
        {lanes.map((lane, li) => (
          <div key={`${laneCount}-${li}`} data-lane className={cn(reduced && "no-scrollbar overflow-x-auto px-[var(--gutter)]")}>
            <div data-track className="flex w-max gap-5 will-change-transform">
              {[0, 1].map((copy) =>
                lane.map((t, i) => {
                  const key = `${copy}-${t.id}`;
                  const on = pinned[li] === key;
                  if (copy === 1 && reduced) return null;
                  return (
                    <div
                      key={key}
                      role="button"
                      tabIndex={copy === 1 ? -1 : 0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          onTap(li, key);
                        }
                      }}
                      aria-hidden={copy === 1 || undefined}
                      aria-pressed={on}
                      aria-label={copy === 1 ? undefined : `${t.name}: ${t.quote} ${on ? "Tap to resume." : "Tap to pause this row."}`}
                      onClick={() => onTap(li, key)}
                      className={cn("postcard-hit block cursor-pointer text-left outline-none", on && "is-pinned")}
                    >
                      <Postcard t={t} index={li * 7 + i} dup={copy === 1} />
                    </div>
                  );
                }),
              )}
            </div>
          </div>
        ))}
      </div>
      {!reduced && (
        <button
          type="button"
          onClick={() => setAllStopped((s) => !s)}
          aria-pressed={allStopped}
          className="btn btn-ghost mx-auto mt-2 flex px-4 py-2 text-[12.5px]"
        >
          {allStopped ? <Play size={13} aria-hidden="true" /> : <Pause size={13} aria-hidden="true" />}
          {allStopped ? "Play the postcards" : "Pause the postcards"}
        </button>
      )}
    </div>
  );
}
