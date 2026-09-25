"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { TIP_OPTIONS, useBag } from "@/lib/bag";
import { bagTotals, lineTotal, packWeightKg } from "@/lib/bag-totals";
import { byId } from "@/lib/menu";
import { site } from "@/config/site";
import { addDays, dayName, formatTime, isOpenAt, nextOpening, pickupSlots, sameLocalDay, toLocal } from "@/lib/hours";
import { LEAD_MINUTES, MODE_LABEL, deliveryFeeNote, formatAddress, type DeliveryAddress } from "@/lib/fulfillment";
import { digitsOnly, formatMoney, formatPhone } from "@/lib/format";
import { newOrderId, saveOrder, type Order } from "@/lib/orders";
import { DishImage } from "@/components/menu/DishImage";
import { ModeSwitch } from "@/components/order/ModeSwitch";
import { TrekPack } from "@/components/icons/Icons";

type When = "asap" | "scheduled";
type FieldName = "name" | "phone" | "email" | "street" | "unit" | "city" | "addrZip" | "notes";
type Fields = Record<FieldName, string>;
type Errors = Partial<Record<FieldName | "slot", string>>;

const EMPTY: Fields = { name: "", phone: "", email: "", street: "", unit: "", city: "Harrisonburg", addrZip: "", notes: "" };
const FIELD_ORDER: (FieldName | "slot")[] = ["slot", "name", "phone", "email", "street", "unit", "city", "addrZip", "notes"];

function validate(f: Fields, delivery: boolean): Errors {
  const e: Errors = {};
  if (!f.name.trim()) e.name = delivery ? "Add a name for the delivery." : "Add the name we should call out at pickup.";
  const phone = digitsOnly(f.phone).replace(/^1(?=\d{10})/, "");
  if (phone.length === 0) e.phone = "Add a phone number so we can reach you about the order.";
  else if (phone.length !== 10) e.phone = `That's ${phone.length} digits — a US number has 10.`;
  if (f.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) e.email = "That email looks off — check for a missing @ or dot.";
  if (delivery) {
    if (!f.street.trim()) e.street = "Add the street address.";
    if (!f.city.trim()) e.city = "Add the city.";
    if (digitsOnly(f.addrZip).length !== 5) e.addrZip = "ZIP is 5 digits.";
  }
  return e;
}

function whenLabel(at: Date, now: Date): string {
  const time = formatTime(at);
  if (sameLocalDay(at, now)) return `Today, ${time}`;
  if (sameLocalDay(at, addDays(now, 1))) return `Tomorrow, ${time}`;
  return `${dayName(toLocal(at).day)}, ${time}`;
}

export function Checkout({ available }: { available: string[] }) {
  const router = useRouter();
  const availableSet = useMemo(() => new Set(available), [available]);
  const hydrated = useBag((s) => s.hydrated);
  const lines = useBag((s) => s.lines);
  const mode = useBag((s) => s.mode);
  const tipPct = useBag((s) => s.tipPct);
  const setTip = useBag((s) => s.setTip);
  const clearBag = useBag((s) => s.clear);
  const delivery = mode === "delivery";
  const lead = LEAD_MINUTES[mode];
  const [now, setNow] = useState<Date | null>(null);
  const [when, setWhen] = useState<When>("asap");
  const [dayIdx, setDayIdx] = useState(0);
  const [slot, setSlot] = useState("");
  const [fields, setFields] = useState<Fields>(EMPTY);
  const [touched, setTouched] = useState<Partial<Record<FieldName | "slot", boolean>>>({});
  const [placing, setPlacing] = useState(false);
  const [placed, setPlaced] = useState(false);
  const inputs = useRef<Partial<Record<FieldName | "slot", HTMLElement | null>>>({});

  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, []);

  const days = useMemo(() => {
    if (!now) return [];
    const out: { label: string; slots: Date[] }[] = [];
    for (let i = 0; i < 8 && out.length < 3; i++) {
      const base = i === 0 ? now : addDays(now, i);
      const slots = pickupSlots(base, site.hours, site.orderCutoffMinutes, { leadMinutes: lead });
      if (slots.length > 0) out.push({ label: i === 0 ? "Today" : i === 1 ? "Tomorrow" : dayName(toLocal(base).day), slots });
    }
    return out;
  }, [now, lead]);

  const openNow = now ? isOpenAt(now, site.hours) : false;
  const asapAt = useMemo(() => {
    if (!now) return null;
    return openNow ? new Date(now.getTime() + lead * 60_000) : nextOpening(now, site.hours);
  }, [now, openNow, lead]);

  const errors = useMemo(() => {
    const e = validate(fields, delivery);
    if (when === "scheduled" && !slot) e.slot = `Pick a ${delivery ? "delivery" : "pickup"} time.`;
    return e;
  }, [fields, delivery, when, slot]);

  const totals = bagTotals(lines, tipPct);
  const address: DeliveryAddress = {
    street: fields.street.trim(),
    unit: fields.unit.trim() || undefined,
    city: fields.city.trim(),
    state: "VA",
    zip: digitsOnly(fields.addrZip),
    notes: fields.notes.trim() || undefined,
  };

  const set = (name: FieldName, value: string) => setFields((f) => ({ ...f, [name]: value }));
  const blur = (name: FieldName | "slot") => setTouched((t) => ({ ...t, [name]: true }));
  const show = (name: FieldName | "slot") => (touched[name] ? errors[name] : undefined);

  const place = async () => {
    if (!now || !asapAt) return;
    setTouched(Object.fromEntries(FIELD_ORDER.map((k) => [k, true])));
    const first = FIELD_ORDER.find((k) => errors[k]);
    if (first) {
      inputs.current[first]?.focus();
      return;
    }
    setPlacing(true);
    await new Promise((r) => setTimeout(r, 1100));
    const at = when === "asap" ? asapAt : new Date(slot);
    const id = newOrderId();
    const order: Order = {
      id,
      placedAt: new Date().toISOString(),
      fulfillment: {
        mode,
        type: when,
        at: at.toISOString(),
        label: when === "asap" && openNow ? `ASAP, around ${formatTime(at)}` : whenLabel(at, now),
        address: delivery ? address : undefined,
      },
      contact: { name: fields.name.trim(), phone: formatPhone(fields.phone), email: fields.email.trim() || undefined },
      payment: delivery ? "on-delivery" : "at-pickup",
      lines: lines.flatMap((l) => {
        const item = byId(l.itemId);
        return item ? [{ itemId: l.itemId, name: item.name, qty: l.qty, spice: l.spice, instructions: l.instructions, unitPrice: item.price, lineTotal: lineTotal(l) }] : [];
      }),
      ...totals,
    };
    saveOrder(order);
    setPlaced(true);
    router.push(`/order/permit?id=${id}`);
    setTimeout(clearBag, 400);
  };

  if (!hydrated || !now) return <div className="min-h-[80svh]" aria-busy="true" />;

  if (lines.length === 0 && !placed) {
    return (
      <div className="flex min-h-[80svh] items-center pt-24">
        <div className="container-x">
          <span className="flex h-16 w-16 items-center justify-center rounded-full border border-line-strong text-brass-hi">
            <TrekPack size={30} />
          </span>
          <h1 className="display mt-6 text-[clamp(2.6rem,8vw,4.5rem)] text-brass-hi">Your pack is empty.</h1>
          <p className="mt-3 max-w-[40ch] text-muted">Every climb starts with momos. Pick a few dishes and come back to check out.</p>
          <Link href="/menu" className="btn btn-brass mt-8 px-6 py-3.5 text-[15px]">
            Open the menu
          </Link>
        </div>
      </div>
    );
  }

  const inputClass = (name: FieldName) =>
    cn(
      "mt-2 h-12 w-full rounded-2xl border bg-white/50 px-4 text-[16px] text-choc outline-none transition-[border-color,background] placeholder:text-bronze/60 focus:border-choc focus:bg-white/80",
      show(name) ? "border-[#9a4a2c]" : "border-ink-line",
    );
  const radioClass = (on: boolean) =>
    cn(
      "flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-3 has-[:focus-visible]:outline-choc",
      on ? "border-choc bg-choc/[0.06]" : "border-ink-line hover:border-bronze",
    );

  return (
    <div className="pb-24 pt-28 md:pt-36">
      <div className="container-x">
        <p className="eyebrow text-brass">Checkout · {packWeightKg(lines).toFixed(1)} kg in the pack</p>
        <h1 className="display mt-3 text-[clamp(2.8rem,8vw,5rem)] text-brass-hi">
          Pack check<span className="brass-text">.</span>
        </h1>
        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_400px] lg:gap-12">
          <form
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              place();
            }}
            className="paper menu-sheet space-y-10 p-5 md:p-9"
          >
            <fieldset>
              <legend className="display text-[28px] text-choc">Pickup or delivery</legend>
              <div className="mt-4 flex flex-wrap items-center gap-4">
                <ModeSwitch className="!border-ink-line !bg-choc/90" />
                <p aria-live="polite" className="text-[14px] text-bronze">
                  {delivery ? `To your door around ${site.deliveryArea}, about ${lead} minutes.` : `Ready in about ${lead} minutes at ${site.address.street}.`}
                </p>
              </div>
            </fieldset>

            <fieldset>
              <legend className="display text-[28px] text-choc">{delivery ? "Delivery time" : "Pickup time"}</legend>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <label className={radioClass(when === "asap")}>
                  <input type="radio" name="when" className="peer sr-only" checked={when === "asap"} onChange={() => setWhen("asap")} />
                  <Dot on={when === "asap"} />
                  <span>
                    <span className="block text-[15px] font-medium text-choc">{openNow ? "As soon as it's ready" : "When we open"}</span>
                    <span className="mt-0.5 block text-[13px] text-bronze">{openNow ? `About ${lead} minutes` : asapAt ? whenLabel(asapAt, now) : "Closed"}</span>
                  </span>
                </label>
                <label className={radioClass(when === "scheduled")}>
                  <input type="radio" name="when" className="peer sr-only" checked={when === "scheduled"} onChange={() => setWhen("scheduled")} />
                  <Dot on={when === "scheduled"} />
                  <span>
                    <span className="block text-[15px] font-medium text-choc">Schedule it</span>
                    <span className="mt-0.5 block text-[13px] text-bronze">Pick a day and a 15-minute window</span>
                  </span>
                </label>
              </div>
              {when === "scheduled" && (
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <Field id="day" label="Day">
                    <Select
                      id="day"
                      value={String(dayIdx)}
                      onChange={(v) => {
                        setDayIdx(Number(v));
                        setSlot("");
                      }}
                      options={days.map((d, i) => ({ value: String(i), label: d.label }))}
                    />
                  </Field>
                  <Field id="slot" label="Time" error={show("slot")}>
                    <Select
                      id="slot"
                      ref={(el) => {
                        inputs.current.slot = el;
                      }}
                      value={slot}
                      onChange={setSlot}
                      onBlur={() => blur("slot")}
                      placeholder="Choose a time"
                      invalid={!!show("slot")}
                      options={(days[dayIdx]?.slots ?? []).map((s) => ({ value: s.toISOString(), label: formatTime(s) }))}
                    />
                  </Field>
                </div>
              )}
            </fieldset>

            <fieldset>
              <legend className="display text-[28px] text-choc">Who&rsquo;s it for?</legend>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Field id="name" label="Name" error={show("name")}>
                  <input id="name" ref={(el) => { inputs.current.name = el; }} autoComplete="name" value={fields.name} onChange={(e) => set("name", e.target.value)} onBlur={() => blur("name")} aria-invalid={!!show("name")} aria-describedby={show("name") ? "name-error" : undefined} className={inputClass("name")} />
                </Field>
                <Field id="phone" label="Phone" error={show("phone")}>
                  <input id="phone" ref={(el) => { inputs.current.phone = el; }} type="tel" inputMode="tel" autoComplete="tel" placeholder="(540) 555-0100" value={fields.phone} onChange={(e) => set("phone", formatPhone(e.target.value))} onBlur={() => blur("phone")} aria-invalid={!!show("phone")} aria-describedby={show("phone") ? "phone-error" : undefined} className={cn(inputClass("phone"), "num")} />
                </Field>
                <Field id="email" label="Email" hint="optional, for a receipt" error={show("email")} className="sm:col-span-2">
                  <input id="email" ref={(el) => { inputs.current.email = el; }} type="email" inputMode="email" autoComplete="email" value={fields.email} onChange={(e) => set("email", e.target.value)} onBlur={() => blur("email")} aria-invalid={!!show("email")} aria-describedby={show("email") ? "email-error" : undefined} className={inputClass("email")} />
                </Field>
              </div>
            </fieldset>

            {delivery && (
              <fieldset>
                <legend className="display text-[28px] text-choc">Where to?</legend>
                <p className="mt-1 text-[13px] text-bronze">{deliveryFeeNote()}</p>
                <div className="mt-4 grid gap-4 sm:grid-cols-6">
                  <Field id="street" label="Street address" error={show("street")} className="sm:col-span-4">
                    <input id="street" ref={(el) => { inputs.current.street = el; }} autoComplete="shipping street-address" placeholder="800 S Main St" value={fields.street} onChange={(e) => set("street", e.target.value)} onBlur={() => blur("street")} aria-invalid={!!show("street")} aria-describedby={show("street") ? "street-error" : undefined} className={inputClass("street")} />
                  </Field>
                  <Field id="unit" label="Apt or dorm room" hint="optional" className="sm:col-span-2">
                    <input id="unit" ref={(el) => { inputs.current.unit = el; }} autoComplete="shipping address-line2" value={fields.unit} onChange={(e) => set("unit", e.target.value)} className={inputClass("unit")} />
                  </Field>
                  <Field id="city" label="City" error={show("city")} className="sm:col-span-3">
                    <input id="city" ref={(el) => { inputs.current.city = el; }} autoComplete="shipping address-level2" value={fields.city} onChange={(e) => set("city", e.target.value)} onBlur={() => blur("city")} aria-invalid={!!show("city")} aria-describedby={show("city") ? "city-error" : undefined} className={inputClass("city")} />
                  </Field>
                  <Field id="state" label="State" className="sm:col-span-1">
                    <input id="state" value="VA" readOnly aria-readonly="true" className={cn(inputClass("city"), "text-bronze")} />
                  </Field>
                  <Field id="addrZip" label="ZIP" error={show("addrZip")} className="sm:col-span-2">
                    <input id="addrZip" ref={(el) => { inputs.current.addrZip = el; }} inputMode="numeric" autoComplete="shipping postal-code" placeholder="22801" value={fields.addrZip} onChange={(e) => set("addrZip", digitsOnly(e.target.value).slice(0, 5))} onBlur={() => blur("addrZip")} aria-invalid={!!show("addrZip")} aria-describedby={show("addrZip") ? "addrZip-error" : undefined} className={cn(inputClass("addrZip"), "num")} />
                  </Field>
                  <Field id="notes" label="Notes for the driver" hint="optional" className="sm:col-span-6">
                    <input id="notes" ref={(el) => { inputs.current.notes = el; }} placeholder="Gate code, leave at the door, call on arrival" maxLength={140} value={fields.notes} onChange={(e) => set("notes", e.target.value)} className={inputClass("notes")} />
                  </Field>
                </div>
              </fieldset>
            )}

            <fieldset>
              <legend className="display text-[28px] text-choc">Payment</legend>
              <p className="mt-2 max-w-[56ch] text-[14px] text-bronze">
                This is a demo: nothing is charged and no card is asked for. You&rsquo;ll {delivery ? "pay the driver on delivery" : "pay at the counter when you pick up"} — card or cash.
              </p>
              <div className="mt-5">
                <p className="text-[13px] text-bronze">Tip for the kitchen</p>
                <div role="radiogroup" aria-label="Tip" className="mt-2 flex flex-wrap gap-2">
                  {TIP_OPTIONS.map((t) => (
                    <button
                      key={t}
                      type="button"
                      role="radio"
                      aria-checked={tipPct === t}
                      onClick={() => setTip(t)}
                      className={cn("num rounded-full border px-4 py-2 text-[14px] transition-colors", tipPct === t ? "border-choc bg-choc text-paper" : "border-ink-line text-choc hover:border-bronze")}
                    >
                      {t === 0 ? "No tip" : `${Math.round(t * 100)}% · ${formatMoney(Math.round(totals.subtotal * t * 100) / 100)}`}
                    </button>
                  ))}
                </div>
              </div>
            </fieldset>

            <button type="submit" disabled={placing} className="btn btn-brass w-full py-4 text-[16px] disabled:opacity-90 md:w-auto md:px-10">
              {placing ? (
                <>
                  <Loader2 size={18} className="animate-spin" aria-hidden="true" />
                  Filing your permit…
                </>
              ) : (
                `Place ${MODE_LABEL[mode].toLowerCase()} order · ${formatMoney(totals.total)}`
              )}
            </button>
          </form>

          <aside className="self-start lg:sticky lg:top-[100px]">
            <div className="glass rounded-[28px] p-6 [--glass-base:rgba(20,14,10,0.7)]">
              <h2 className="display text-[26px] text-brass-hi">In your pack</h2>
              <ul className="mt-4 divide-y divide-line">
                {lines.map((l) => {
                  const item = byId(l.itemId);
                  if (!item) return null;
                  const details = [l.spice, l.instructions].filter(Boolean).join(" · ");
                  return (
                    <li key={l.key} className="flex gap-3 py-3">
                      <DishImage item={item} available={availableSet.has(item.img)} sizes="48px" className="h-12 w-12 shrink-0 rounded-xl" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[14.5px] text-text">
                          <span className="num text-muted">{l.qty}×</span> {item.name}
                        </p>
                        {details && <p className="truncate text-[12px] text-muted">{details}</p>}
                      </div>
                      <span className="num text-[14px] text-brass-hi">{formatMoney(lineTotal(l))}</span>
                    </li>
                  );
                })}
              </ul>
              <dl className="mt-4 space-y-1.5 border-t border-line pt-4 text-[14px]">
                <SumRow label="Subtotal" value={formatMoney(totals.subtotal)} />
                <SumRow label={`Tax (${(site.taxRate * 100).toFixed(1)}%)`} value={formatMoney(totals.tax)} />
                <SumRow label="Tip" value={formatMoney(totals.tip)} />
                {delivery && <SumRow label="Delivery fee" value="Confirmed by phone" />}
                <div className="flex justify-between pt-1.5 text-[18px] font-semibold text-brass-hi">
                  <dt>Total</dt>
                  <dd className="num">{formatMoney(totals.total)}</dd>
                </div>
              </dl>
              <p className="mt-4 text-[12.5px] text-muted">
                {delivery ? (address.street ? `Delivery to ${formatAddress(address)}` : "Delivery · add your address") : `Pickup · ${site.address.street}, ${site.address.city}`}
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function SumRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-muted">
      <dt>{label}</dt>
      <dd className="num">{value}</dd>
    </div>
  );
}

function Dot({ on }: { on: boolean }) {
  return (
    <span aria-hidden="true" className={cn("mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border", on ? "border-choc" : "border-bronze/50")}>
      <span className={cn("h-2 w-2 rounded-full bg-choc transition-opacity", on ? "opacity-100" : "opacity-0")} />
    </span>
  );
}

function Field({ id, label, hint, error, className, children }: { id: string; label: string; hint?: string; error?: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-[13px] font-medium text-bronze">
        {label}
        {hint && <span className="font-normal text-bronze/70"> · {hint}</span>}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-2 border-l-2 border-[#9a4a2c] pl-3 text-[13px] text-choc">
          {error}
        </p>
      )}
    </div>
  );
}

type SelectProps = {
  id: string;
  value: string;
  onChange(value: string): void;
  onBlur?(): void;
  options: { value: string; label: string }[];
  placeholder?: string;
  invalid?: boolean;
  ref?: (el: HTMLSelectElement | null) => void;
};

function Select({ id, value, onChange, onBlur, options, placeholder, invalid, ref }: SelectProps) {
  return (
    <div className="relative">
      <select
        id={id}
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        aria-invalid={invalid || undefined}
        aria-describedby={invalid ? `${id}-error` : undefined}
        className={cn(
          "mt-2 h-12 w-full appearance-none rounded-2xl border bg-white/50 px-4 pr-10 text-[16px] text-choc outline-none transition-colors focus:border-choc",
          invalid ? "border-[#9a4a2c]" : "border-ink-line",
          !value && "text-bronze/70",
        )}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown size={16} aria-hidden="true" className="pointer-events-none absolute right-4 top-1/2 mt-1 -translate-y-1/2 text-bronze" />
    </div>
  );
}
