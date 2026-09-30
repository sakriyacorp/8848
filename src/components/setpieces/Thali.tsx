"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { addToPack } from "@/lib/add-to-pack";
import { formatPrice } from "@/lib/format";

/* Dal bhat from above: a hammered brass thali with its katoris. Tap (or tab to) any part of the
   meal and that bowl lifts off the plate while a card tells you what it is and why it's there.
   Ends with the thali itself, into the pack. */

const DISH = { id: "nepali-thali", name: "8848 Signature Nepali Thali", price: 20 };

type Part = { id: string; name: string; np: string; what: string; why: string; x: number; y: number; r: number };

const PARTS: Part[] = [
  { id: "bhat", name: "Bhat", np: "भात", what: "Steamed rice, the middle of the plate.", why: "Everything else on the plate is there to go with it.", x: 178, y: 222, r: 70 },
  { id: "dal", name: "Dal", np: "दाल", what: "Black lentils tempered with jimbu, cumin and ghee.", why: "Poured over the rice. Porters swear by it: “dal bhat power, 24 hour.”", x: 292, y: 146, r: 46 },
  { id: "tarkari", name: "Tarkari", np: "तरकारी", what: "The day's vegetable curry: potato, cauliflower, beans.", why: "Whatever the garden gave. It changes with the season, like ours.", x: 118, y: 112, r: 42 },
  { id: "saag", name: "Saag", np: "साग", what: "Mustard greens wilted with garlic and a little chilli.", why: "Something green and iron-rich for the climb.", x: 302, y: 268, r: 38 },
  { id: "achar", name: "Achar", np: "अचार", what: "Sesame-tomato achar, bright and sharp.", why: "The bite that wakes the whole plate up.", x: 208, y: 94, r: 28 },
  { id: "masu", name: "Masu", np: "मासु", what: "Chicken, goat, lamb or fish curry.", why: "Order the thali with meat or fish and it arrives in its own katori.", x: 104, y: 282, r: 34 },
  { id: "papad", name: "Papad", np: "पापड", what: "A crisp lentil wafer, blistered over the flame.", why: "Crumble it over the rice for crunch.", x: 236, y: 330, r: 34 },
];

export function Thali() {
  const [active, setActive] = useState<string>("dal");
  const plate = useRef<HTMLDivElement>(null);
  const part = PARTS.find((p) => p.id === active) ?? PARTS[0];

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-14">
      <div ref={plate} className="thali relative mx-auto aspect-square w-full max-w-[520px]" data-active={active}>
        <svg viewBox="0 0 400 400" className="absolute inset-0 h-full w-full" aria-hidden="true">
          <defs>
            <radialGradient id="th-brass" cx="40%" cy="35%" r="75%">
              <stop offset="0" stopColor="#f0dca6" />
              <stop offset=".45" stopColor="#c9ab6c" />
              <stop offset=".85" stopColor="#8e7146" />
              <stop offset="1" stopColor="#5f4a2c" />
            </radialGradient>
            <radialGradient id="th-well" cx="45%" cy="40%" r="70%">
              <stop offset="0" stopColor="#dcc38b" />
              <stop offset="1" stopColor="#a2834f" />
            </radialGradient>
            <radialGradient id="th-katori" cx="35%" cy="30%" r="80%">
              <stop offset="0" stopColor="#f6e6b8" />
              <stop offset=".5" stopColor="#c7a767" />
              <stop offset="1" stopColor="#6e5634" />
            </radialGradient>
            <radialGradient id="th-shadow">
              <stop offset=".6" stopColor="#000" stopOpacity=".45" />
              <stop offset="1" stopColor="#000" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="206" cy="210" r="190" fill="url(#th-shadow)" />
          <circle cx="200" cy="200" r="186" fill="url(#th-brass)" />
          {[176, 168, 160].map((r, i) => (
            <circle key={r} cx="200" cy="200" r={r} fill="none" stroke={i === 0 ? "#5f4a2c" : "#f3e3b5"} strokeOpacity={i === 0 ? 0.5 : 0.25} strokeWidth={i === 0 ? 1.4 : 0.8} />
          ))}
          <circle cx="200" cy="200" r="156" fill="url(#th-well)" />
          {/* hammer marks */}
          {Array.from({ length: 70 }, (_, i) => {
            const a = i * 2.39996;
            const rr = 20 + ((i * 37) % 130);
            return <circle key={i} cx={200 + Math.cos(a) * rr} cy={200 + Math.sin(a) * rr} r={3 + (i % 3)} fill="#fff4d6" opacity=".08" />;
          })}

          {/* bhat */}
          <g className="th-part" data-id="bhat" style={{ transformOrigin: "178px 222px" }}>
            <ellipse cx="182" cy="230" rx="68" ry="58" fill="#000" opacity=".18" />
            <path d="M118 222c0-38 30-66 62-66s64 26 64 62c0 38-30 62-64 62s-62-22-62-58z" fill="#f4efe3" />
            {Array.from({ length: 120 }, (_, i) => {
              const a = i * 2.39996;
              const rr = Math.sqrt(i / 120) * 58;
              return <ellipse key={i} cx={180 + Math.cos(a) * rr} cy={220 + Math.sin(a) * rr * 0.92} rx="3.4" ry="1.5" fill={i % 3 ? "#fffdf6" : "#e6ddc9"} transform={`rotate(${(i * 47) % 180} ${180 + Math.cos(a) * rr} ${220 + Math.sin(a) * rr * 0.92})`} />;
            })}
          </g>

          {/* papad */}
          <g className="th-part" data-id="papad" style={{ transformOrigin: "236px 330px" }}>
            <circle cx="238" cy="334" r="36" fill="#000" opacity=".18" />
            <circle cx="236" cy="330" r="35" fill="#e2c890" />
            {Array.from({ length: 24 }, (_, i) => {
              const a = i * 2.39996;
              const rr = Math.sqrt(i / 24) * 30;
              return <circle key={i} cx={236 + Math.cos(a) * rr} cy={330 + Math.sin(a) * rr} r={1.6 + (i % 3) * 0.7} fill={i % 2 ? "#c9a462" : "#f1dcaa"} opacity=".8" />;
            })}
          </g>

          {/* katoris */}
          {PARTS.filter((p) => !["bhat", "papad"].includes(p.id)).map((p) => (
            <g key={p.id} className="th-part" data-id={p.id} style={{ transformOrigin: `${p.x}px ${p.y}px` }}>
              <circle cx={p.x + 5} cy={p.y + 7} r={p.r + 2} fill="#000" opacity=".3" />
              <circle cx={p.x} cy={p.y} r={p.r} fill="url(#th-katori)" />
              <circle cx={p.x} cy={p.y} r={p.r - 5} fill="#6e5634" opacity=".5" />
              <Food id={p.id} x={p.x} y={p.y} r={p.r - 6} />
              <path d={`M${p.x - p.r * 0.72} ${p.y - p.r * 0.5} a${p.r} ${p.r} 0 0 1 ${p.r * 0.9} ${-p.r * 0.38}`} fill="none" stroke="#fff6dc" strokeOpacity=".7" strokeWidth="2" strokeLinecap="round" />
            </g>
          ))}
        </svg>

        <span aria-hidden="true" className="steam on" style={{ left: `${(292 / 400) * 100}%`, bottom: `${100 - (146 / 400) * 100}%` }}>
          <i />
          <i />
          <i />
        </span>

        {PARTS.map((p) => (
          <button
            key={p.id}
            type="button"
            aria-pressed={active === p.id}
            aria-label={`${p.name}: ${p.what}`}
            onClick={() => setActive(p.id)}
            onPointerEnter={(e) => e.pointerType === "mouse" && setActive(p.id)}
            className="thali-hit absolute rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foil"
            style={{ left: `${((p.x - p.r) / 400) * 100}%`, top: `${((p.y - p.r) / 400) * 100}%`, width: `${((p.r * 2) / 400) * 100}%`, height: `${((p.r * 2) / 400) * 100}%` }}
          />
        ))}
      </div>

      <div>
        <div aria-live="polite" className="thali-card glass rounded-[26px] p-6 [--glass-base:rgba(20,14,10,0.6)] md:p-8">
          <p className="caps text-[10.5px] text-brass">
            {PARTS.findIndex((p) => p.id === part.id) + 1} of {PARTS.length} on the plate
          </p>
          <h3 key={part.id} className="thali-name display mt-2 text-[clamp(2.4rem,5vw,3.4rem)] leading-none text-brass-hi">
            {part.name}{" "}
            <span lang="ne" className="np align-middle text-[0.45em] text-brass">
              {part.np}
            </span>
          </h3>
          <p className="mt-4 text-[16.5px] leading-relaxed text-text">{part.what}</p>
          <p className="mt-2 text-[15px] leading-relaxed text-muted">{part.why}</p>
          <div className="mt-5 flex flex-wrap gap-1.5">
            {PARTS.map((p) => (
              <button key={p.id} type="button" onClick={() => setActive(p.id)} className={cn("chip-brass min-h-9 px-3 py-1.5 text-[12.5px]", active === p.id && "is-on")} aria-pressed={active === p.id}>
                {p.name}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button type="button" onClick={() => addToPack(DISH.id, DISH.name, { spice: "Medium" }, plate.current, "/dishes/p-dal-bhat.jpg")} className="btn btn-brass px-6 py-3.5 text-[15px]">
            Pack a thali · {formatPrice(DISH.price)}
          </button>
          <p className="text-[13.5px] text-muted">Vegetable, or with chicken, goat, lamb or fish.</p>
        </div>
      </div>
    </div>
  );
}

function Food({ id, x, y, r }: { id: string; x: number; y: number; r: number }) {
  const bits = (n: number, color: string, size: number, spread = 0.75) =>
    Array.from({ length: n }, (_, i) => {
      const a = i * 2.39996 + id.length;
      const rr = Math.sqrt((i + 0.5) / n) * r * spread;
      return <circle key={`${color}${i}`} cx={x + Math.cos(a) * rr} cy={y + Math.sin(a) * rr} r={size * (0.7 + ((i * 7) % 5) / 10)} fill={color} />;
    });
  switch (id) {
    case "dal":
      return (
        <g>
          <circle cx={x} cy={y} r={r} fill="#c98f35" />
          <circle cx={x - r * 0.15} cy={y - r * 0.15} r={r * 0.75} fill="#d9a441" opacity=".8" />
          {bits(14, "#6b4219", 1.3)}
          {bits(5, "#f4d58c", 2.2, 0.6)}
        </g>
      );
    case "tarkari":
      return (
        <g>
          <circle cx={x} cy={y} r={r} fill="#b9772f" />
          {bits(9, "#e8c27a", 5)}
          {bits(6, "#6f7d3a", 2.6)}
        </g>
      );
    case "saag":
      return (
        <g>
          <circle cx={x} cy={y} r={r} fill="#4f6230" />
          {bits(16, "#6c8240", 3.4)}
          {bits(5, "#e9dcc0", 1.4)}
        </g>
      );
    case "achar":
      return (
        <g>
          <circle cx={x} cy={y} r={r} fill="#a8502b" />
          {bits(10, "#e9d2a0", 1.1)}
          {bits(4, "#c9713e", 3)}
        </g>
      );
    case "masu":
      return (
        <g>
          <circle cx={x} cy={y} r={r} fill="#8a4a24" />
          <circle cx={x - r * 0.1} cy={y - r * 0.1} r={r * 0.78} fill="#9c5a2c" opacity=".8" />
          {bits(7, "#5c2f16", 5.2, 0.6)}
          {bits(8, "#d8a05a", 1.3)}
        </g>
      );
    default:
      return null;
  }
}
