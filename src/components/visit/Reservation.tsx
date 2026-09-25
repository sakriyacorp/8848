"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Minus, Plus, RotateCcw } from "lucide-react";
import { cn } from "@/lib/cn";
import { site } from "@/config/site";
import { isOn } from "@/config/features";
import { addDays, dayName, formatHM, parseHM, toLocal } from "@/lib/hours";
import { digitsOnly, formatPhone } from "@/lib/format";
import { BrassDial } from "@/components/visit/BrassDial";
import { Logo } from "@/components/brand/Logo";

/* A mock reservation: pick a day, turn the brass dial to a time, say how many. Confirming cuts
   your name into a brass "Reserved" plaque and stamps it like a passport. Nothing is sent
   anywhere; the booking lives in this browser. */

type Day = { date: Date; label: string; sub: string; slots: string[] };
const OCCASIONS = ["Just hungry", "Date night", "Birthday", "Anniversary", "Bar seats"];

function slotsFor(date: Date): string[] {
  const l = toLocal(date);
  const windows = site.hours[l.day] ?? [];
  const out: string[] = [];
  for (const [o, c] of windows) {
    for (let t = parseHM(o); t <= parseHM(c) - 60; t += 15) out.push(formatHM(t));
  }
  return out;
}

export function Reservation() {
  const [now, setNow] = useState<Date | null>(null);
  const [dayIdx, setDayIdx] = useState(0);
  const [slot, setSlot] = useState(0);
  const [party, setParty] = useState(2);
  const [occasion, setOccasion] = useState(OCCASIONS[0]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [touched, setTouched] = useState(false);
  const [state, setState] = useState<"form" | "saving" | "done">("form");

  useEffect(() => setNow(new Date()), []);

  const days: Day[] = useMemo(() => {
    if (!now) return [];
    const out: Day[] = [];
    for (let i = 0; i < 16 && out.length < 12; i++) {
      const d = i === 0 ? now : addDays(now, i);
      const slots = slotsFor(d);
      if (!slots.length) continue;
      const l = toLocal(d);
      out.push({ date: d, label: i === 0 ? "Today" : i === 1 ? "Tomorrow" : dayName(l.day).slice(0, 3), sub: `${l.m}/${l.d}`, slots });
    }
    return out;
  }, [now]);

  useEffect(() => {
    const d = days[dayIdx];
    if (!d) return;
    // default to a dinner slot around 7 PM
    const i = d.slots.findIndex((s) => s === "7:00 PM");
    setSlot(i >= 0 ? i : Math.min(d.slots.length - 1, Math.floor(d.slots.length * 0.7)));
  }, [dayIdx, days]);

  const day = days[dayIdx];
  const time = day?.slots[slot] ?? "";
  const nameErr = touched && !name.trim() ? "Add the name for the booking." : "";
  const phoneLen = digitsOnly(phone).length;
  const phoneErr = touched && phoneLen !== 10 ? "A 10-digit phone number, in case we need to reach you." : "";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!name.trim() || phoneLen !== 10) return;
    setState("saving");
    await new Promise((r) => setTimeout(r, 900));
    try {
      localStorage.setItem("8848-reservation", JSON.stringify({ name, phone, party, occasion, day: day?.date.toISOString(), time }));
    } catch {}
    setState("done");
  };

  if (!now || !day) return <div className="min-h-[520px]" aria-busy="true" />;

  if (state === "done") {
    const when = `${day.label === "Today" || day.label === "Tomorrow" ? day.label : dayName(toLocal(day.date).day)} · ${time}`;
    return (
      <div className="flex flex-col items-center py-6 text-center" role="status" aria-live="polite">
        <div className="reserved-plaque relative w-full max-w-[420px]">
          <div className="brass sheen relative rounded-[6px] px-6 pb-8 pt-7 shadow-[0_40px_80px_-24px_rgba(0,0,0,.9)] [--sheen-delay:0.6s]">
            <Logo variant="mark" material="engraved" className="mx-auto h-10 w-auto" title="8848" />
            <p className="caps engraved mt-3 text-[11px] tracking-[0.4em]">Reserved</p>
            <p className="engrave-in display engraved mt-3 text-[clamp(1.8rem,7vw,2.6rem)] leading-tight">{name.trim()}</p>
            <p className="engraved mt-2 text-[15px]">
              Party of {party} · {when}
            </p>
            <p className="caps engraved mt-1 text-[10px] opacity-80">{occasion}</p>
          </div>
          <div className="walnut mx-[-5%] h-9 rounded-[3px] shadow-[inset_0_2px_0_rgba(255,220,180,.18),0_18px_30px_-10px_rgba(0,0,0,.9)]" />
          {isOn("reservation") && (
            <svg viewBox="0 0 200 120" className="passport-stamp absolute -right-4 -top-8 w-[150px]" aria-hidden="true">
              <rect x="6" y="6" width="188" height="108" rx="14" fill="none" stroke="#7d3f22" strokeWidth="4" />
              <rect x="14" y="14" width="172" height="92" rx="9" fill="none" stroke="#7d3f22" strokeWidth="1.5" />
              <text x="100" y="42" textAnchor="middle" fontFamily="var(--font-caps)" fontSize="15" letterSpacing="3" fill="#7d3f22">
                ADMITTED
              </text>
              <text x="100" y="72" textAnchor="middle" fontFamily="var(--font-display)" fontSize="26" fontWeight="600" fill="#7d3f22">
                8848
              </text>
              <text x="100" y="96" textAnchor="middle" fontFamily="var(--font-caps)" fontSize="10" letterSpacing="2" fill="#7d3f22">
                {day.sub} · HARRISONBURG
              </text>
            </svg>
          )}
        </div>
        <p className="mt-8 max-w-[44ch] text-[15px] text-text/80">
          See you then, {name.trim().split(/\s+/)[0]}. This is a demo booking — for a real table, call {site.phone}.
        </p>
        <button type="button" onClick={() => setState("form")} className="btn btn-ghost mt-5 px-5 py-2.5 text-[14px]">
          <RotateCcw size={14} aria-hidden="true" /> Change it
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-12">
      <div className="min-w-0 space-y-8">
        <fieldset>
          <legend className="caps text-[10.5px] text-brass">Day</legend>
          <div className="no-scrollbar -mx-[var(--gutter)] mt-3 flex gap-2 overflow-x-auto px-[var(--gutter)] pb-1 md:mx-0 md:flex-wrap md:px-0">
            {days.map((d, i) => (
              <button
                key={d.date.toISOString()}
                type="button"
                aria-pressed={i === dayIdx}
                onClick={() => setDayIdx(i)}
                className={cn(
                  "flex w-[72px] shrink-0 flex-col items-center rounded-2xl border py-2.5 transition-[background,border-color,transform] duration-300 active:scale-95",
                  i === dayIdx ? "border-foil bg-brass/15 text-brass-hi" : "border-line text-muted hover:border-line-strong hover:text-text",
                )}
              >
                <span className="text-[13px] font-medium">{d.label}</span>
                <span className="num text-[12px] opacity-80">{d.sub}</span>
              </button>
            ))}
          </div>
          <p className="mt-2 text-[12.5px] text-muted">Closed Mondays.</p>
        </fieldset>

        <fieldset>
          <legend className="caps text-[10.5px] text-brass">How many?</legend>
          <div className="mt-3 flex items-center gap-4">
            <div className="inline-flex items-center rounded-full border border-line-strong bg-void/40">
              <button type="button" aria-label="Fewer people" disabled={party <= 1} onClick={() => setParty((p) => p - 1)} className="flex h-12 w-12 items-center justify-center rounded-full text-brass-hi hover:bg-brass/15 disabled:opacity-30">
                <Minus size={16} aria-hidden="true" />
              </button>
              <span className="num display w-10 text-center text-[26px] text-brass-hi" aria-live="polite">
                {party}
              </span>
              <button type="button" aria-label="More people" disabled={party >= 12} onClick={() => setParty((p) => p + 1)} className="flex h-12 w-12 items-center justify-center rounded-full text-brass-hi hover:bg-brass/15 disabled:opacity-30">
                <Plus size={16} aria-hidden="true" />
              </button>
            </div>
            <div className="flex flex-wrap gap-1" aria-hidden="true">
              {Array.from({ length: party }, (_, i) => (
                <svg key={i} viewBox="0 0 12 20" className="h-6 w-auto text-brass" style={{ animation: `rise .4s var(--ease) ${i * 0.03}s both` }}>
                  <circle cx="6" cy="4" r="3" fill="currentColor" />
                  <path d="M1 20 V12 a5 5 0 0 1 10 0 V20Z" fill="currentColor" />
                </svg>
              ))}
            </div>
          </div>
          <p className="mt-2 text-[12.5px] text-muted">More than 12? Call us for the room.</p>
        </fieldset>

        <fieldset>
          <legend className="caps text-[10.5px] text-brass">Occasion</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {OCCASIONS.map((o) => (
              <button key={o} type="button" aria-pressed={o === occasion} onClick={() => setOccasion(o)} className={cn("rounded-full border px-4 py-2 text-[13.5px] transition-colors", o === occasion ? "border-foil bg-brass/15 text-brass-hi" : "border-line text-muted hover:text-text")}>
                {o}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-[13px] text-muted">Name on the plaque</span>
            <input value={name} onChange={(e) => setName(e.target.value.slice(0, 40))} autoComplete="name" aria-invalid={!!nameErr} aria-describedby={nameErr ? "res-name-err" : undefined} className="mt-2 h-12 w-full rounded-2xl border border-line-strong bg-void/40 px-4 text-[16px] text-text outline-none transition-colors placeholder:text-muted/50 focus:border-foil/70" placeholder="Your name" />
            {nameErr && (
              <span id="res-name-err" role="alert" className="mt-2 block text-[13px] text-brass-hi">
                {nameErr}
              </span>
            )}
          </label>
          <label className="block">
            <span className="text-[13px] text-muted">Phone</span>
            <input value={phone} onChange={(e) => setPhone(formatPhone(e.target.value))} type="tel" inputMode="tel" autoComplete="tel" aria-invalid={!!phoneErr} aria-describedby={phoneErr ? "res-phone-err" : undefined} className="num mt-2 h-12 w-full rounded-2xl border border-line-strong bg-void/40 px-4 text-[16px] text-text outline-none transition-colors placeholder:text-muted/50 focus:border-foil/70" placeholder="(540) 555-0100" />
            {phoneErr && (
              <span id="res-phone-err" role="alert" className="mt-2 block text-[13px] text-brass-hi">
                {phoneErr}
              </span>
            )}
          </label>
        </div>
      </div>

      <div className="flex flex-col items-center justify-between gap-8 rounded-[28px] border border-line bg-void/30 p-6 md:p-8">
        <p className="caps self-start text-[10.5px] text-brass">Time · {day.label}</p>
        <BrassDial options={day.slots} value={Math.min(slot, day.slots.length - 1)} onChange={setSlot} label={`Arrival time, ${day.label}`} />
        <div className="w-full">
          <p className="text-center text-[14.5px] text-text/85">
            {party} {party === 1 ? "person" : "people"} · {day.label} {day.sub} · <span className="num text-brass-hi">{time}</span>
          </p>
          <button type="submit" disabled={state === "saving"} className="btn btn-brass mt-4 w-full py-4 text-[15.5px]">
            {state === "saving" ? (
              <>
                <Loader2 size={17} className="animate-spin" aria-hidden="true" /> Engraving…
              </>
            ) : (
              "Reserve the table"
            )}
          </button>
          <p className="mt-2 text-center text-[12px] text-muted">Demo booking · nothing is sent</p>
        </div>
      </div>
    </form>
  );
}
