"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { site } from "@/config/site";
import { parseHM, toLocal, windowsFor } from "@/lib/hours";
import { formatWhole } from "@/lib/format";

/* "≈ 1,284 momos pleated today" — an estimate that runs off the kitchen clock: a lunch pace and a
   faster dinner pace across today's open hours, with a little seeded wobble so days differ. It
   ticks while the kitchen is open and rests when it's closed. It is labelled as an estimate on
   purpose. PLACEHOLDER: wire to real counts from the POS, or switch the flag off. */

const PER_MIN = { lunch: 5.2, dinner: 8.4 };

function estimate(now: Date): { count: number; open: boolean } {
  const l = toLocal(now);
  const wins = windowsFor(now, site.hours);
  const seed = (l.y * 372 + l.m * 31 + l.d) % 97;
  let count = 0;
  let open = false;
  for (const [o, c] of wins) {
    const a = parseHM(o);
    const b = parseHM(c);
    const rate = a < 15 * 60 ? PER_MIN.lunch : PER_MIN.dinner;
    const until = Math.min(b, l.minutes + l.s / 60);
    if (until > a) count += (until - a) * rate * (0.92 + (seed % 17) / 100);
    if (l.minutes >= a && l.minutes < b) open = true;
  }
  return { count: Math.floor(count), open };
}

export function MomoCounter({ className }: { className?: string }) {
  const [state, setState] = useState<{ count: number; open: boolean } | null>(null);

  useEffect(() => {
    const run = () => setState(estimate(new Date()));
    run();
    const id = setInterval(run, 4000);
    return () => clearInterval(id);
  }, []);

  if (!state) return <p className={cn("h-6", className)} aria-hidden="true" />;
  const text = state.count > 0 ? `≈ ${formatWhole(state.count)} momos pleated today` : "The first momos of the day are waiting to be pleated";
  return (
    <p className={cn("momo-counter inline-flex items-center gap-2.5 text-[13.5px] text-muted", className)} title="An estimate from the kitchen clock">
      <span aria-hidden="true" className={cn("momo-counter-dot", state.open && "is-on")} />
      <span>
        {state.count > 0 ? (
          <>
            ≈ <span key={state.count} className="num momo-counter-num text-brass-hi">{formatWhole(state.count)}</span> momos pleated today
          </>
        ) : (
          text
        )}
        {!state.open && state.count > 0 ? <span className="text-muted/80"> · kitchen resting</span> : null}
      </span>
    </p>
  );
}
