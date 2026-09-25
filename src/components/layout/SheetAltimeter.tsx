"use client";

import { formatWhole } from "@/lib/format";

/* In the phone menu: a small brass mountain with a glowing dot where you are on it — the page's
   altitude on the climb (Base Camp 405 m … The Bar at the summit). */
const W = 320;
const H = 92;
const RIDGE: Array<[number, number]> = [
  [0, 90],
  [40, 74],
  [70, 80],
  [112, 50],
  [134, 58],
  [160, 8],
  [186, 46],
  [204, 40],
  [236, 66],
  [262, 60],
  [320, 90],
];

export function SheetAltimeter({ alt, label }: { alt: number; label: string }) {
  // place the dot on the left flank, from the foot (405 m) to the summit (8,849 m)
  const t = Math.max(0, Math.min(1, (alt - 405) / (8849 - 405)));
  const flank = RIDGE.slice(0, 6);
  const seg = t * (flank.length - 1);
  const i = Math.min(flank.length - 2, Math.floor(seg));
  const f = seg - i;
  const x = flank[i][0] + (flank[i + 1][0] - flank[i][0]) * f;
  const y = flank[i][1] + (flank[i + 1][1] - flank[i][1]) * f;
  const d = "M" + RIDGE.map((p) => p.join(" ")).join(" L");
  return (
    <div className="sheet-alt mb-6 flex items-end gap-4" aria-label={`You are at ${formatWhole(alt)} metres: ${label}`}>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-[70px] w-auto min-w-0 flex-1 overflow-visible" aria-hidden="true">
        <defs>
          <linearGradient id="sa-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#b69e70" stopOpacity=".35" />
            <stop offset="1" stopColor="#b69e70" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={`${d} Z`} fill="url(#sa-fill)" />
        <path d={d} fill="none" stroke="#b69e70" strokeOpacity=".7" strokeWidth="1.2" />
        <path d="M150 20 L160 8 L172 26" fill="none" stroke="#f2e9cf" strokeOpacity=".7" strokeWidth="1.4" />
        <circle className="sheet-alt-dot" cx={x} cy={y} r="4.5" fill="#f2e9cf" />
        <circle cx={x} cy={y} r="11" fill="#dcbf7b" opacity=".18" />
      </svg>
      <p className="shrink-0 whitespace-nowrap pb-1 text-[12px] leading-tight text-muted">
        You are at
        <br />
        <span className="num display text-[22px] text-brass-hi">{formatWhole(alt)} m</span>
      </p>
    </div>
  );
}
