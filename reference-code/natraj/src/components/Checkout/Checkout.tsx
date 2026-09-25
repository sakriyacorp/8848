"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { useBag } from "@/lib/bag";
import { bagTotals, lineTotal } from "@/lib/bag-totals";
import { byId, restaurant } from "@/lib/menu";
import { addDays, dayName, formatTime, isOpenAt, nextOpening, pickupSlots, sameLocalDay, toLocal } from "@/lib/hours";
import { LEAD_MINUTES, MODE_LABEL, formatAddress, quoteDelivery, type DeliveryAddress } from "@/lib/fulfillment";
import {
  cardBrand,
  cardLength,
  digitsOnly,
  expiryInFuture,
  formatCard,
  formatExpiry,
  formatMoney,
  formatPhone,
  luhn,
  type CardBrand,
} from "@/lib/format";
import { newOrderId, saveOrder, type Order } from "@/lib/orders";
import { GlassPanel } from "@/components/Glass/GlassPanel";
import { DishImage } from "@/components/Menu/DishImage";
import { ModeSwitch } from "@/components/Menu/ModeSwitch";

type When = "asap" | "scheduled";
type PayMethod = "card" | "pickup";
type FieldName = "name" | "phone" | "email" | "street" | "unit" | "city" | "addrZip" | "notes" | "card" | "expiry" | "cvc" | "zip";
type Fields = Record<FieldName, string>;
type Errors = Partial<Record<FieldName | "slot", string>>;

const BRAND: Record<CardBrand, string> = { visa: "Visa", mastercard: "Mastercard", amex: "Amex", discover: "Discover", unknown: "" };
const EMPTY: Fields = { name: "", phone: "", email: "", street: "", unit: "", city: "Culpeper", addrZip: "", notes: "", card: "", expiry: "", cvc: "", zip: "" };
const FIELD_ORDER: (FieldName | "slot")[] = ["slot", "name", "phone", "email", "street", "unit", "city", "addrZip", "notes", "card", "expiry", "cvc", "zip"];

function validate(f: Fields, pay: PayMethod, delivery: boolean): Errors {
  const e: Errors = {};
  if (!f.name.trim()) e.name = delivery ? "Add the name for the delivery." : "Add the name we should call out at pickup.";
  const phone = digitsOnly(f.phone).replace(/^1(?=\d{10})/, "");
  if (phone.length === 0) e.phone = "Add a phone number so we can reach you about the order.";
  else if (phone.length !== 10) e.phone = `Phone number is ${phone.length} digits — it should be 10.`;
  if (f.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) {
    e.email = "That email doesn't look right — check for a missing @ or dot.";
  }
  if (delivery) {
    if (!f.street.trim()) e.street = "Add the street address for the delivery.";
    if (!f.city.trim()) e.city = "Add the city.";
    if (digitsOnly(f.addrZip).length !== 5) e.addrZip = "ZIP is 5 digits.";
  }
  if (pay === "card") {
    const d = digitsOnly(f.card);
    const brand = cardBrand(d);
    const need = cardLength(brand);
    if (d.length === 0) e.card = "Add a card number.";
    else if (d.length < need) e.card = `Card number is ${d.length} digits — check for a missing one.`;
    else if (d.length > need) e.card = `Card number is ${d.length} digits — that's one too many.`;
    else if (!luhn(d)) e.card = "That card number doesn't check out — double-check it.";
    if (digitsOnly(f.expiry).length !== 4) e.expiry = "Use MM/YY.";
    else if (!expiryInFuture(f.expiry)) e.expiry = "That expiry date has passed.";
    const cvcLen = brand === "amex" ? 4 : 3;
    if (digitsOnly(f.cvc).length !== cvcLen) {
      e.cvc = brand === "amex" ? "CVC is the 4-digit code on the front of an Amex." : "CVC is the 3-digit code on the back of the card.";
    }
    if (digitsOnly(f.zip).length !== 5) e.zip = "ZIP is 5 digits.";
  }
  return e;
}

function whenLabel(at: Date, now: Date): string {
  const time = formatTime(at);
  if (sameLocalDay(at, now)) return `Today, ${time}`;
  if (sameLocalDay(at, addDays(now, 1))) return `Tomorrow, ${time}`;
  return `${dayName(toLocal(at).day)}, ${time}`;
}

export function Checkout() {
  const router = useRouter();
  const hydrated = useBag((s) => s.hydrated);
  const lines = useBag((s) => s.lines);
  const mode = useBag((s) => s.mode);
  const clearBag = useBag((s) => s.clear);
  const delivery = mode === "delivery";
  const lead = LEAD_MINUTES[mode];
  const [now, setNow] = useState<Date | null>(null);
  const [when, setWhen] = useState<When>("asap");
  const [dayIdx, setDayIdx] = useState(0);
  const [slot, setSlot] = useState("");
  const [pay, setPay] = useState<PayMethod>("card");
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

  /* Paying at the counter only makes sense for pickup. */
  useEffect(() => {
    if (delivery && pay === "pickup") setPay("card");
  }, [delivery, pay]);

  const days = useMemo(() => {
    if (!now) return [];
    const out: { label: string; slots: Date[] }[] = [];
    for (let i = 0; i < 8 && out.length < 2; i++) {
      const base = i === 0 ? now : addDays(now, i);
      const slots = pickupSlots(base, restaurant.hours, restaurant.carryoutCutoffMinutes, { leadMinutes: lead });
      if (slots.length > 0) out.push({ label: i === 0 ? "Today" : i === 1 ? "Tomorrow" : dayName(toLocal(base).day), slots });
    }
    return out;
  }, [now, lead]);

  const openNow = now ? isOpenAt(now, restaurant.hours) : false;
  const asapAt = useMemo(() => {
    if (!now) return null;
    return openNow ? new Date(now.getTime() + lead * 60_000) : nextOpening(now, restaurant.hours);
  }, [now, openNow, lead]);

  const errors = useMemo(() => {
    const e = validate(fields, pay, delivery);
    if (when === "scheduled" && !slot) e.slot = `Pick a ${delivery ? "delivery" : "pickup"} time.`;
    return e;
  }, [fields, pay, delivery, when, slot]);

  const totals = bagTotals(lines);
  const brand = cardBrand(fields.card);
  const address: DeliveryAddress = {
    street: fields.street.trim(),
    unit: fields.unit.trim() || undefined,
    city: fields.city.trim(),
    state: "VA",
    zip: digitsOnly(fields.addrZip),
    notes: fields.notes.trim() || undefined,
  };
  const quote = delivery ? quoteDelivery(address) : null;

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
    await new Promise((r) => setTimeout(r, 900));
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
        deliveryFee: quote?.fee ?? null,
      },
      contact: { name: fields.name.trim(), phone: formatPhone(fields.phone), email: fields.email.trim() || undefined },
      payment: pay === "card" ? { method: "card", brand, last4: digitsOnly(fields.card).slice(-4) } : { method: "pickup" },
      lines: lines.flatMap((l) => {
        const item = byId(l.itemId);
        return item
          ? [{ itemId: l.itemId, name: item.name, qty: l.qty, spice: l.spice, instructions: l.instructions, unitPrice: item.price, lineTotal: lineTotal(l) }]
          : [];
      }),
      ...totals,
    };
    saveOrder(order);
    setPlaced(true);
    clearBag();
    router.push(`/order/${id}`);
  };

  if (!hydrated || !now) return <div className="min-h-[70svh]" aria-busy="true" />;

  if (lines.length === 0 && !placed) {
    return (
      <div className="flex min-h-[70svh] items-center px-5 pt-24 md:px-8">
        <div className="mx-auto w-full max-w-[1280px]">
          <h1 className="display text-[40px] text-cream md:text-[56px]">Your bag is empty.</h1>
          <p className="mt-4 text-cream-2">Add a few dishes and come back.</p>
          <Link href="/menu" className="btn-primary mt-8 px-6 py-3 text-[15px]">
            Browse the menu
          </Link>
        </div>
      </div>
    );
  }

  const inputClass = (name: FieldName) =>
    cn(
      "mt-2 h-12 w-full rounded-2xl border bg-void/40 px-4 text-[16px] text-cream outline-none transition-colors duration-150 placeholder:text-cream-2/50 focus:border-red/70",
      show(name) ? "border-red" : "border-line",
    );
  const radioClass = (on: boolean) =>
    cn(
      "flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-colors duration-150 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-3 has-[:focus-visible]:outline-red",
      on ? "border-red bg-red/10" : "border-line hover:border-cream/25",
    );
  const shortAddress = restaurant.address.line1.split(",")[0];

  return (
    <div className="px-5 pb-24 pt-28 md:px-8 md:pt-36">
      <div className="mx-auto max-w-[1280px]">
        <h1 className="display text-[40px] text-cream md:text-[56px]">Checkout.</h1>
        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_400px] lg:gap-16">
          <form
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              place();
            }}
            className="space-y-12"
          >
            <fieldset>
              <legend className="display text-[26px] text-cream">Pickup or delivery</legend>
              <div className="mt-5 flex flex-wrap items-center gap-4">
                <ModeSwitch />
                <p aria-live="polite" className="text-[14px] text-cream-2">
                  {delivery ? `To your door in the Culpeper area, about ${lead} minutes.` : `Ready in about ${lead} minutes at ${shortAddress}.`}
                </p>
              </div>
            </fieldset>

            <fieldset>
              <legend className="display text-[26px] text-cream">{delivery ? "Delivery time" : "Pickup time"}</legend>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <label className={radioClass(when === "asap")}>
                  <input type="radio" name="when" className="peer sr-only" checked={when === "asap"} onChange={() => setWhen("asap")} />
                  <Dot on={when === "asap"} />
                  <span>
                    <span className="block text-[15px] font-medium text-cream">{openNow ? "ASAP" : "When we open"}</span>
                    <span className="mt-0.5 block text-[13px] text-cream-2">
                      {openNow ? `About ${lead} minutes` : asapAt ? whenLabel(asapAt, now) : "Closed"}
                    </span>
                  </span>
                </label>
                <label className={radioClass(when === "scheduled")}>
                  <input type="radio" name="when" className="peer sr-only" checked={when === "scheduled"} onChange={() => setWhen("scheduled")} />
                  <Dot on={when === "scheduled"} />
                  <span>
                    <span className="block text-[15px] font-medium text-cream">Schedule</span>
                    <span className="mt-0.5 block text-[13px] text-cream-2">Pick a day and a 15-minute window</span>
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
                      onChange={(v) => setSlot(v)}
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
              <legend className="display text-[26px] text-cream">Contact</legend>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <Field id="name" label="Name" error={show("name")}>
                  <input
                    id="name"
                    ref={(el) => {
                      inputs.current.name = el;
                    }}
                    autoComplete="name"
                    value={fields.name}
                    onChange={(e) => set("name", e.target.value)}
                    onBlur={() => blur("name")}
                    aria-invalid={!!show("name")}
                    aria-describedby={show("name") ? "name-error" : undefined}
                    className={inputClass("name")}
                  />
                </Field>
                <Field id="phone" label="Phone" error={show("phone")}>
                  <input
                    id="phone"
                    ref={(el) => {
                      inputs.current.phone = el;
                    }}
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="(540) 555-0100"
                    value={fields.phone}
                    onChange={(e) => set("phone", formatPhone(e.target.value))}
                    onBlur={() => blur("phone")}
                    aria-invalid={!!show("phone")}
                    aria-describedby={show("phone") ? "phone-error" : undefined}
                    className={inputClass("phone")}
                  />
                </Field>
                <Field id="email" label="Email" hint="optional" error={show("email")} className="sm:col-span-2">
                  <input
                    id="email"
                    ref={(el) => {
                      inputs.current.email = el;
                    }}
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    value={fields.email}
                    onChange={(e) => set("email", e.target.value)}
                    onBlur={() => blur("email")}
                    aria-invalid={!!show("email")}
                    aria-describedby={show("email") ? "email-error" : undefined}
                    className={inputClass("email")}
                  />
                </Field>
              </div>
            </fieldset>

            {delivery && (
              <fieldset>
                <legend className="display text-[26px] text-cream">Delivery address</legend>
                <p className="mt-1 text-[13px] text-cream-2">{quote?.message}</p>
                <div className="mt-5 grid gap-4 sm:grid-cols-6">
                  <Field id="street" label="Street address" error={show("street")} className="sm:col-span-4">
                    <input
                      id="street"
                      ref={(el) => {
                        inputs.current.street = el;
                      }}
                      autoComplete="shipping street-address"
                      placeholder="219 E Davis St"
                      value={fields.street}
                      onChange={(e) => set("street", e.target.value)}
                      onBlur={() => blur("street")}
                      aria-invalid={!!show("street")}
                      aria-describedby={show("street") ? "street-error" : undefined}
                      className={inputClass("street")}
                    />
                  </Field>
                  <Field id="unit" label="Apt or suite" hint="optional" className="sm:col-span-2">
                    <input
                      id="unit"
                      ref={(el) => {
                        inputs.current.unit = el;
                      }}
                      autoComplete="shipping address-line2"
                      value={fields.unit}
                      onChange={(e) => set("unit", e.target.value)}
                      className={inputClass("unit")}
                    />
                  </Field>
                  <Field id="city" label="City" error={show("city")} className="sm:col-span-3">
                    <input
                      id="city"
                      ref={(el) => {
                        inputs.current.city = el;
                      }}
                      autoComplete="shipping address-level2"
                      value={fields.city}
                      onChange={(e) => set("city", e.target.value)}
                      onBlur={() => blur("city")}
                      aria-invalid={!!show("city")}
                      aria-describedby={show("city") ? "city-error" : undefined}
                      className={inputClass("city")}
                    />
                  </Field>
                  <Field id="state" label="State" className="sm:col-span-1">
                    <input id="state" value="VA" readOnly aria-readonly="true" className={cn(inputClass("city"), "text-cream-2")} />
                  </Field>
                  <Field id="addrZip" label="ZIP" error={show("addrZip")} className="sm:col-span-2">
                    <input
                      id="addrZip"
                      ref={(el) => {
                        inputs.current.addrZip = el;
                      }}
                      inputMode="numeric"
                      autoComplete="shipping postal-code"
                      placeholder="22701"
                      value={fields.addrZip}
                      onChange={(e) => set("addrZip", digitsOnly(e.target.value).slice(0, 5))}
                      onBlur={() => blur("addrZip")}
                      aria-invalid={!!show("addrZip")}
                      aria-describedby={show("addrZip") ? "addrZip-error" : undefined}
                      className={cn(inputClass("addrZip"), "tabular-nums")}
                    />
                  </Field>
                  <Field id="notes" label="Delivery notes" hint="optional" className="sm:col-span-6">
                    <input
                      id="notes"
                      ref={(el) => {
                        inputs.current.notes = el;
                      }}
                      placeholder="Gate code, leave at the door, call on arrival"
                      maxLength={140}
                      value={fields.notes}
                      onChange={(e) => set("notes", e.target.value)}
                      className={inputClass("notes")}
                    />
                  </Field>
                </div>
              </fieldset>
            )}

            <fieldset>
              <legend className="display text-[26px] text-cream">Payment</legend>
              <p className="mt-1 text-[13px] text-cream-2">Demo — no charge is made.</p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <label className={radioClass(pay === "card")}>
                  <input type="radio" name="pay" className="peer sr-only" checked={pay === "card"} onChange={() => setPay("card")} />
                  <Dot on={pay === "card"} />
                  <span>
                    <span className="block text-[15px] font-medium text-cream">Card</span>
                    {delivery && <span className="mt-0.5 block text-[13px] text-cream-2">Delivery orders are paid online</span>}
                  </span>
                </label>
                {!delivery && (
                  <label className={radioClass(pay === "pickup")}>
                    <input type="radio" name="pay" className="peer sr-only" checked={pay === "pickup"} onChange={() => setPay("pickup")} />
                    <Dot on={pay === "pickup"} />
                    <span>
                      <span className="block text-[15px] font-medium text-cream">Pay at pickup</span>
                      <span className="mt-0.5 block text-[13px] text-cream-2">Card or cash at the counter</span>
                    </span>
                  </label>
                )}
              </div>
              {pay === "card" && (
                <div className="mt-4 grid gap-4 sm:grid-cols-6">
                  <Field id="card" label="Card number" error={show("card")} className="sm:col-span-6">
                    <div className="relative">
                      <input
                        id="card"
                        ref={(el) => {
                          inputs.current.card = el;
                        }}
                        inputMode="numeric"
                        autoComplete="cc-number"
                        placeholder="1234 5678 9012 3456"
                        value={fields.card}
                        onChange={(e) => set("card", formatCard(e.target.value))}
                        onBlur={() => blur("card")}
                        aria-invalid={!!show("card")}
                        aria-describedby={show("card") ? "card-error" : undefined}
                        className={cn(inputClass("card"), "pr-24 tabular-nums")}
                      />
                      {BRAND[brand] && (
                        <span className="pointer-events-none absolute right-3 top-1/2 mt-1 -translate-y-1/2 rounded-full border border-line px-2.5 py-1 text-[12px] font-semibold text-cream-2">
                          {BRAND[brand]}
                        </span>
                      )}
                    </div>
                  </Field>
                  <Field id="expiry" label="Expiry" error={show("expiry")} className="sm:col-span-2">
                    <input
                      id="expiry"
                      ref={(el) => {
                        inputs.current.expiry = el;
                      }}
                      inputMode="numeric"
                      autoComplete="cc-exp"
                      placeholder="MM/YY"
                      value={fields.expiry}
                      onChange={(e) => set("expiry", formatExpiry(e.target.value))}
                      onBlur={() => blur("expiry")}
                      aria-invalid={!!show("expiry")}
                      aria-describedby={show("expiry") ? "expiry-error" : undefined}
                      className={cn(inputClass("expiry"), "tabular-nums")}
                    />
                  </Field>
                  <Field id="cvc" label="CVC" error={show("cvc")} className="sm:col-span-2">
                    <input
                      id="cvc"
                      ref={(el) => {
                        inputs.current.cvc = el;
                      }}
                      inputMode="numeric"
                      autoComplete="cc-csc"
                      placeholder={brand === "amex" ? "1234" : "123"}
                      value={fields.cvc}
                      onChange={(e) => set("cvc", digitsOnly(e.target.value).slice(0, 4))}
                      onBlur={() => blur("cvc")}
                      aria-invalid={!!show("cvc")}
                      aria-describedby={show("cvc") ? "cvc-error" : undefined}
                      className={cn(inputClass("cvc"), "tabular-nums")}
                    />
                  </Field>
                  <Field id="zip" label="Billing ZIP" error={show("zip")} className="sm:col-span-2">
                    <input
                      id="zip"
                      ref={(el) => {
                        inputs.current.zip = el;
                      }}
                      inputMode="numeric"
                      autoComplete="billing postal-code"
                      placeholder="22701"
                      value={fields.zip}
                      onChange={(e) => set("zip", digitsOnly(e.target.value).slice(0, 5))}
                      onBlur={() => blur("zip")}
                      aria-invalid={!!show("zip")}
                      aria-describedby={show("zip") ? "zip-error" : undefined}
                      className={cn(inputClass("zip"), "tabular-nums")}
                    />
                  </Field>
                </div>
              )}
            </fieldset>

            <button type="submit" disabled={placing} className="btn-primary w-full py-4 text-[16px] disabled:opacity-80 md:w-auto md:px-10">
              {placing ? (
                <>
                  <Loader2 size={18} className="animate-spin" aria-hidden="true" />
                  Placing order…
                </>
              ) : (
                `Place ${MODE_LABEL[mode].toLowerCase()} order · ${formatMoney(totals.total)}`
              )}
            </button>
          </form>

          <aside className="self-start lg:sticky lg:top-[100px]">
            <GlassPanel className="rounded-3xl p-6">
              <h2 className="display text-[22px] text-cream">Your order</h2>
              <ul className="mt-4 divide-y divide-line">
                {lines.map((l) => {
                  const item = byId(l.itemId);
                  if (!item) return null;
                  const details = [l.spice, l.instructions].filter(Boolean).join(" · ");
                  return (
                    <li key={l.key} className="flex gap-3 py-3">
                      <DishImage item={item} available sizes="48px" className="h-12 w-12 shrink-0 rounded-[8px]" iconSize={14} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[14px] font-medium text-cream">
                          <span className="tabular-nums text-cream-2">{l.qty}×</span> {item.name}
                        </p>
                        {details && <p className="truncate text-[12px] text-cream-2">{details}</p>}
                      </div>
                      <span className="text-[14px] tabular-nums text-cream">{formatMoney(lineTotal(l))}</span>
                    </li>
                  );
                })}
              </ul>
              <dl className="mt-4 space-y-1.5 border-t border-line pt-4 text-[14px]">
                <div className="flex justify-between text-cream-2">
                  <dt>Subtotal</dt>
                  <dd className="tabular-nums">{formatMoney(totals.subtotal)}</dd>
                </div>
                <div className="flex justify-between text-cream-2">
                  <dt>Estimated tax</dt>
                  <dd className="tabular-nums">{formatMoney(totals.tax)}</dd>
                </div>
                {delivery && (
                  <div className="flex justify-between text-cream-2">
                    <dt>Delivery fee</dt>
                    <dd>{quote?.fee === null || quote?.fee === undefined ? "To be confirmed" : formatMoney(quote.fee)}</dd>
                  </div>
                )}
                <div className="flex justify-between pt-1 text-[16px] font-semibold text-cream">
                  <dt>Total</dt>
                  <dd className="tabular-nums">{formatMoney(totals.total)}</dd>
                </div>
              </dl>
              <p className="mt-4 text-[12px] text-cream-2">
                {delivery
                  ? address.street
                    ? `Delivery to ${formatAddress(address)}`
                    : "Delivery · add your address on the left"
                  : `Pickup · ${shortAddress}`}
              </p>
            </GlassPanel>
          </aside>
        </div>
      </div>
    </div>
  );
}

function Dot({ on }: { on: boolean }) {
  return (
    <span aria-hidden="true" className={cn("mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border", on ? "border-red" : "border-cream/40")}>
      <span className={cn("h-2 w-2 rounded-full bg-red transition-opacity duration-150", on ? "opacity-100" : "opacity-0")} />
    </span>
  );
}

function Field({
  id,
  label,
  hint,
  error,
  className,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-[13px] font-medium text-cream-2">
        {label}
        {hint && <span className="text-cream-2/80"> · {hint}</span>}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-2 border-l-2 border-red pl-3 text-[13px] text-cream">
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
          "mt-2 h-12 w-full appearance-none rounded-2xl border bg-void/40 px-4 pr-10 text-[16px] text-cream outline-none transition-colors duration-150 focus:border-red/70",
          invalid ? "border-red" : "border-line",
          !value && "text-cream-2/80",
        )}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-charcoal text-cream">
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown size={16} aria-hidden="true" className="pointer-events-none absolute right-4 top-1/2 mt-1 -translate-y-1/2 text-cream-2" />
    </div>
  );
}
