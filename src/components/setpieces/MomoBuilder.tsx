"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { SPICE_LEVELS, type SpiceChoice } from "@/lib/menu";
import { addToPack } from "@/lib/add-to-pack";
import { formatPrice } from "@/lib/format";
import { useSound } from "@/lib/sound";
import { bowl } from "@/lib/audio";

/* Build a momo. Pick a filling and a way to cook it, press "Pleat it" and watch the wrapper rise
   around the filling while eighteen pleats fold in one by one to the knot, then it cooks the way
   you chose: steamed in bamboo, fried golden, kothey (seared on one side), sitting in jhol, or
   tossed in chilli. Adds "Momo, Your Way" to the pack with your choices written on the ticket. */

const ITEM = { id: "momo-your-way", name: "Momo, Your Way", price: 15, pieces: 10 };

const FILLINGS = [
  { id: "chicken", label: "Chicken", note: "minced thigh, ginger, cilantro", color: "#c49a73" },
  { id: "veg", label: "Garden veg", note: "cabbage, carrot, onion, garlic", color: "#8f9a5e" },
  { id: "paneer", label: "Paneer & spinach", note: "fresh cheese, saag, cumin", color: "#a8b27a" },
  { id: "lamb", label: "Spiced lamb", note: "timmur pepper, red onion", color: "#83563b" },
] as const;

const STYLES = [
  { id: "steamed", label: "Steamed", note: "in a bamboo basket, the classic" },
  { id: "fried", label: "Fried", note: "golden and crackly all over" },
  { id: "kothey", label: "Kothey", note: "steamed, then seared flat on the pan" },
  { id: "jhol", label: "Jhol", note: "sitting in warm sesame-tomato broth" },
  { id: "chilli", label: "Chilli", note: "wok-tossed with peppers and onion" },
] as const;

type FillingId = (typeof FILLINGS)[number]["id"];
type StyleId = (typeof STYLES)[number]["id"];
const PLEATS = 18;

/* pleat curves: from points around the upper body to the knot, with a little swirl */
const KNOT = { x: 100, y: 58 };
const BODY = "M28 132 C24 104 54 80 90 66 Q100 61 110 66 C146 80 176 104 172 132 C170 146 140 152 100 152 C60 152 30 146 28 132 Z";
const PLEAT_PATHS = Array.from({ length: PLEATS }, (_, i) => {
  const t = i / (PLEATS - 1);
  const a = Math.PI * (1.04 - t * 1.08);
  const sx = 100 + Math.cos(a) * 68;
  const sy = 120 - Math.sin(a) * 30;
  const cx = 100 + Math.cos(a - 0.55) * 34;
  const cy = 88 - Math.sin(a) * 14;
  return `M${sx.toFixed(1)} ${sy.toFixed(1)} Q${cx.toFixed(1)} ${cy.toFixed(1)} ${KNOT.x} ${KNOT.y}`;
});

function MomoShape({ count }: { count: number }) {
  return (
    <>
      <path className="mb-body" d={BODY} />
      <path className="mb-sear" d={BODY} fill="url(#mb-sear)" />
      {PLEAT_PATHS.map((d, i) => (
        <path key={i} d={d} className={cn("mb-pleat", i < count && "on")} pathLength={1} />
      ))}
      <path className="mb-knot" d={`M${KNOT.x - 5} ${KNOT.y + 2} q5 -9 10 0 q-5 3 -10 0Z`} />
      <path className="mb-shine" d="M50 116 C52 100 64 88 78 80" fill="none" strokeLinecap="round" />
      <g className="mb-char">
        {[
          [70, 120],
          [130, 114],
          [104, 138],
          [86, 96],
        ].map(([x, y], i) => (
          <ellipse key={i} cx={x} cy={y} rx={4 + (i % 2)} ry={2.4} fill="#3b2517" opacity=".45" />
        ))}
      </g>
      <g className="mb-garnish">
        {[
          [56, 122, 20],
          [142, 126, -30],
          [98, 90, 60],
          [120, 104, 10],
          [76, 102, -50],
        ].map(([x, y, r], i) => (
          <rect key={i} x={x} y={y} width="7" height="2.4" rx="1.2" fill={i % 2 ? "#7c8f45" : "#e2c28a"} transform={`rotate(${r} ${x} ${y})`} />
        ))}
      </g>
    </>
  );
}

export function MomoBuilder() {
  const [filling, setFilling] = useState<FillingId>("chicken");
  const [style, setStyle] = useState<StyleId>("steamed");
  const [spice, setSpice] = useState<SpiceChoice>("Medium");
  const [phase, setPhase] = useState<"raw" | "pleating" | "done">("raw");
  const [count, setCount] = useState(0);
  const photo = useRef<HTMLDivElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const fill = FILLINGS.find((f) => f.id === filling)!;
  const sty = STYLES.find((s) => s.id === style)!;

  const pleat = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setCount(PLEATS);
      setPhase("done");
      return;
    }
    setPhase("pleating");
    setCount(0);
    for (let i = 1; i <= PLEATS; i++) timers.current.push(setTimeout(() => setCount(i), 500 + i * 95));
    timers.current.push(
      setTimeout(
        () => {
          setPhase("done");
          if (useSound.getState().on) bowl({ freq: 523.3, gain: 0.07, dur: 2.2 });
        },
        500 + PLEATS * 95 + 350,
      ),
    );
  };

  const reset = () => {
    timers.current.forEach(clearTimeout);
    setPhase("raw");
    setCount(0);
  };

  const add = () => {
    addToPack(ITEM.id, ITEM.name, { spice, instructions: `${fill.label}, ${sty.label.toLowerCase()} (momo builder)` }, photo.current, "/dishes/o-momo-veggie.jpg");
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-12">
      <div ref={photo} className="momo-stage relative mx-auto aspect-[5/4] w-full max-w-[520px] overflow-hidden rounded-[28px] border border-line bg-[radial-gradient(90%_80%_at_50%_30%,#3a281c,#17110d)]" data-phase={phase} data-style={style}>
        <div aria-hidden="true" className="lamp-glow left-1/2 top-[8%] h-[70%] w-[70%] -translate-x-1/2" />
        <svg viewBox="0 0 200 170" className="absolute inset-0 h-full w-full" role="img" aria-label={`A ${fill.label.toLowerCase()} momo, ${phase === "done" ? sty.label.toLowerCase() : "being pleated"}`}>
          <defs>
            <radialGradient id="mb-dough" cx="45%" cy="35%" r="75%">
              <stop offset="0" stopColor="#fbf5e8" />
              <stop offset=".7" stopColor="#eadfc8" />
              <stop offset="1" stopColor="#cdbd9c" />
            </radialGradient>
            <radialGradient id="mb-fried" cx="45%" cy="35%" r="75%">
              <stop offset="0" stopColor="#f0cf8c" />
              <stop offset=".6" stopColor="#d49b52" />
              <stop offset="1" stopColor="#9c6428" />
            </radialGradient>
            <radialGradient id="mb-chilli" cx="45%" cy="35%" r="75%">
              <stop offset="0" stopColor="#d27a44" />
              <stop offset=".6" stopColor="#a4502a" />
              <stop offset="1" stopColor="#6e3219" />
            </radialGradient>
            <linearGradient id="mb-sear" x1="0" y1="0" x2="0" y2="1">
              <stop offset=".55" stopColor="#b4783b" stopOpacity="0" />
              <stop offset=".78" stopColor="#b4783b" stopOpacity=".85" />
              <stop offset="1" stopColor="#6f4219" />
            </linearGradient>
            <linearGradient id="mb-brass" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#7d6441" />
              <stop offset=".45" stopColor="#dcc28a" />
              <stop offset="1" stopColor="#7d6441" />
            </linearGradient>
            <clipPath id="mb-rise">
              <rect className="mb-rise-rect" x="0" y="0" width="200" height="170" />
            </clipPath>
          </defs>

          {/* plate / steamer / bowl */}
          <g className="mb-plate">
            <ellipse cx="100" cy="150" rx="86" ry="15" fill="url(#mb-brass)" opacity=".85" />
            <ellipse cx="100" cy="147" rx="78" ry="11" fill="#2a1d14" opacity=".55" />
          </g>
          <g className="mb-basket">
            <ellipse cx="100" cy="150" rx="88" ry="16" fill="#8a6a3e" />
            <path d="M12 150 v-18 a88 16 0 0 0 176 0 v18" fill="#a07c48" />
            <path d="M12 136 a88 16 0 0 0 176 0" fill="none" stroke="#6d5230" strokeWidth="1.2" />
            <path d="M12 143 a88 16 0 0 0 176 0" fill="none" stroke="#6d5230" strokeWidth="1" opacity=".6" />
          </g>
          <g className="mb-soup">
            <ellipse cx="100" cy="132" rx="84" ry="16" fill="#b8733a" />
            <ellipse cx="100" cy="130" rx="80" ry="13" fill="#c9854a" />
            {[30, 58, 128, 150, 88].map((x, i) => (
              <circle key={i} cx={x} cy={128 + (i % 2) * 5} r={2.2} fill="#e8b36f" opacity=".7" />
            ))}
          </g>

          {/* raw: the wrapper disc with filling */}
          <g className="mb-raw">
            <ellipse cx="100" cy="128" rx="70" ry="20" fill="url(#mb-dough)" />
            <ellipse cx="100" cy="124" rx="30" ry="10" fill={fill.color} />
            {[-14, -4, 6, 14].map((x, i) => (
              <circle key={i} cx={100 + x} cy={122 + (i % 2) * 3} r="2" fill="#3f5a2a" opacity=".55" />
            ))}
          </g>

          {/* two more behind, once it's done: an order is ten */}
          <g className="mb-friends">
            <g transform="translate(-7 56) scale(.55)">
              <MomoShape count={PLEATS} />
            </g>
            <g transform="translate(97 56) scale(.55)">
              <MomoShape count={PLEATS} />
            </g>
          </g>

          {/* the momo */}
          <g className="mb-momo" clipPath="url(#mb-rise)">
            <MomoShape count={count} />
          </g>

          {/* bowl rim in front for jhol */}
          <path className="mb-bowl" d="M12 132 a88 18 0 0 0 176 0 c-4 22 -40 34 -88 34 s-84 -12 -88 -34 Z" fill="url(#mb-brass)" />
          {/* sizzle for fried / chilli */}
          <g className="mb-sizzle">
            {[40, 70, 130, 162].map((x, i) => (
              <circle key={i} cx={x} cy={140} r={1.6 + (i % 2)} fill="#f2e2b6" style={{ animationDelay: `${i * 0.23}s` }} />
            ))}
          </g>
        </svg>
        <span aria-hidden="true" className={cn("steam", phase === "done" && (style === "steamed" || style === "jhol" || style === "kothey") && "on")} style={{ bottom: "60%" }}>
          <i />
          <i />
          <i />
        </span>
        <div className="pointer-events-none absolute inset-x-0 bottom-3 flex items-end justify-between px-5">
          <p className="num caps text-[10px] text-brass/90" aria-live="polite">
            Pleats <span className="text-brass-hi">{count}</span>/{PLEATS}
          </p>
          <p className={cn("display text-[22px] text-brass-hi transition-all duration-500", phase === "done" ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0")}>× {ITEM.pieces}</p>
        </div>
      </div>

      <div>
        <fieldset>
          <legend className="caps text-[10.5px] text-brass">Filling</legend>
          <div className="mt-3 flex flex-wrap gap-2" role="radiogroup" aria-label="Filling">
            {FILLINGS.map((f) => (
              <button
                key={f.id}
                type="button"
                role="radio"
                aria-checked={filling === f.id}
                onClick={() => {
                  setFilling(f.id);
                  if (phase === "done") reset();
                }}
                className={cn("chip-brass", filling === f.id && "is-on")}
              >
                <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full" style={{ background: f.color }} />
                {f.label}
              </button>
            ))}
          </div>
          <p className="mt-2 text-[13.5px] text-muted">{fill.note}</p>
        </fieldset>

        <fieldset className="mt-7">
          <legend className="caps text-[10.5px] text-brass">Cooked</legend>
          <div className="mt-3 flex flex-wrap gap-2" role="radiogroup" aria-label="How it's cooked">
            {STYLES.map((s) => (
              <button key={s.id} type="button" role="radio" aria-checked={style === s.id} onClick={() => setStyle(s.id)} className={cn("chip-brass", style === s.id && "is-on")}>
                {s.label}
              </button>
            ))}
          </div>
          <p className="mt-2 text-[13.5px] text-muted">{sty.note}</p>
        </fieldset>

        <fieldset className="mt-7">
          <legend className="caps text-[10.5px] text-brass">Heat</legend>
          <div className="mt-3 flex flex-wrap gap-2" role="radiogroup" aria-label="Spice">
            {SPICE_LEVELS.map((s) => (
              <button key={s} type="button" role="radio" aria-checked={spice === s} onClick={() => setSpice(s)} className={cn("chip-brass", spice === s && "is-on")}>
                {s}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          {phase !== "done" ? (
            <button type="button" onClick={pleat} disabled={phase === "pleating"} className="btn btn-brass px-6 py-3.5 text-[15px] disabled:opacity-60">
              {phase === "pleating" ? "Pleating…" : "Pleat it"}
            </button>
          ) : (
            <>
              <button type="button" onClick={add} className="btn btn-brass px-6 py-3.5 text-[15px]">
                Pack {ITEM.pieces} · {formatPrice(ITEM.price)}
              </button>
              <button type="button" onClick={pleat} className="btn btn-ghost px-5 py-3.5 text-[15px]">
                Pleat another
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
