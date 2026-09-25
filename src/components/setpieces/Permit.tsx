"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { formatMoney } from "@/lib/format";
import { formatAddress } from "@/lib/fulfillment";
import { getOrder, type Order } from "@/lib/orders";
import { site, mapsUrl } from "@/config/site";
import { isOn } from "@/config/features";
import { Logo } from "@/components/brand/Logo";
import { ShareSummit } from "@/components/order/ShareSummit";
import { sfx } from "@/lib/sound";
import { stamp as stampSound } from "@/lib/audio";

/* Order confirmation as a summit permit: a flag is planted on the peak, then the permit slides
   up with the guest's name, the order number and the provisions, and a round brass-ink stamp
   slams down across it. */
export function Permit({ id }: { id: string | null }) {
  const [order, setOrder] = useState<Order | null | undefined>(undefined);

  useEffect(() => {
    setOrder(id ? getOrder(id) : null);
  }, [id]);

  // the stamp lands 2.85 s after the permit appears (see .permit-stamp in globals.css)
  const found = !!order;
  useEffect(() => {
    if (!found || !isOn("permit") || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setTimeout(() => sfx(stampSound), 2850);
    return () => clearTimeout(t);
  }, [found]);

  if (order === undefined) return <div className="min-h-[80svh]" aria-busy="true" />;

  if (!order) {
    return (
      <div className="flex min-h-[80svh] items-center pt-24">
        <div className="container-x">
          <h1 className="display text-[clamp(2.6rem,8vw,4.5rem)] text-brass-hi">We couldn&rsquo;t find that permit.</h1>
          <p className="mt-4 max-w-[50ch] text-muted">
            Orders are saved on the device that placed them. If you ordered from another phone or browser, call us and we&rsquo;ll look it up.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/menu" className="btn btn-brass px-6 py-3.5 text-[15px]">
              Back to the menu
            </Link>
            <a href={site.phoneHref} className="btn btn-ghost px-6 py-3.5 text-[15px]">
              {site.phone}
            </a>
          </div>
        </div>
      </div>
    );
  }

  const f = order.fulfillment;
  const delivery = f.mode === "delivery";
  const issued = new Date(order.placedAt);
  const dateStr = issued.toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric", timeZone: "America/New_York" }).toUpperCase();
  const first = order.contact.name.split(/\s+/)[0];
  const stamp = isOn("permit");

  return (
    <div className="relative overflow-hidden pb-24 pt-28 md:pt-32">
      <div aria-hidden="true" className="lamp-glow left-1/2 top-24 h-[60vmin] w-[60vmin] -translate-x-1/2" />
      <div className="container-x relative">
        <SummitFlag />
        <div className="mx-auto max-w-[760px] text-center">
          <p className="eyebrow justify-center text-brass [&::before]:hidden">8,848.86 m · summit reached</p>
          <h1 className="display mt-3 text-[clamp(2.4rem,8vw,4.6rem)] text-brass-hi">
            You made it, <span className="italic brass-text">{first}.</span>
          </h1>
          <p className="mx-auto mt-3 max-w-[48ch] text-[16px] text-text/80">
            Order <span className="num text-brass-hi">{order.id}</span> is in. {delivery ? "We'll bring it down the mountain to you." : "We'll have it ready at the counter."}
          </p>
        </div>

        <article className={cn("permit paper relative mx-auto mt-12 max-w-[760px] overflow-hidden", stamp && "permit-in")} aria-label={`Summit permit ${order.id}`}>
          <div className="permit-border pointer-events-none absolute inset-3 rounded-[14px] md:inset-4" aria-hidden="true" />
          <div className="relative grid gap-6 p-6 md:grid-cols-[1fr_170px] md:gap-8 md:p-10">
            <div>
              <div className="flex items-center gap-3">
                <Logo variant="mark" material="foil" className="h-9 w-auto" title="8848" />
                <div>
                  <p className="caps text-[9.5px] text-bronze">{site.fullName}</p>
                  <p className="display text-[26px] leading-none text-choc md:text-[30px]">Summit permit</p>
                </div>
              </div>
              <dl className="mt-7 grid grid-cols-2 gap-x-6 gap-y-4 text-[14px]">
                <PermitField label="Permit no." value={order.id} mono />
                <PermitField label="Issued" value={dateStr} mono />
                <PermitField label="Trekker" value={order.contact.name} wide />
                <PermitField label="Route" value={delivery ? "Delivery" : "Pickup"} />
                <PermitField label="Summit window" value={f.label} />
                <PermitField
                  label={delivery ? "Base camp (you)" : "Base camp"}
                  value={delivery && f.address ? formatAddress(f.address) : `${site.address.street}, ${site.address.city}`}
                  wide
                />
              </dl>
            </div>
            <div className="flex flex-col items-center justify-start gap-3">
              <div className="permit-photo relative flex h-[150px] w-[130px] items-end justify-center overflow-hidden rounded-md border border-ink-line bg-[#e4dccb]">
                <svg viewBox="0 0 130 150" className="absolute inset-0 h-full w-full" aria-hidden="true">
                  <path d="M0 150 L0 110 L30 80 L48 96 L70 50 L92 88 L108 74 L130 100 L130 150Z" fill="#b69e70" opacity=".55" />
                  <path d="M70 50 L78 64 L72 62 L66 70Z" fill="#fffaf0" />
                  <circle cx="98" cy="32" r="9" fill="#dcbf7b" opacity=".8" />
                </svg>
                <span className="caps relative mb-2 rounded bg-paper/80 px-2 py-0.5 text-[8px] text-bronze">Trekker</span>
              </div>
              <p className="num caps text-center text-[9px] text-bronze">Valid 1 climb · non-transferable</p>
            </div>
          </div>

          <div className="relative border-t border-dashed border-ink-line px-6 pb-8 pt-6 md:px-10">
            <p className="caps text-[10px] text-bronze">Provisions</p>
            <ul className="mt-3 divide-y divide-ink-line">
              {order.lines.map((l, i) => (
                <li key={`${l.itemId}-${i}`} className="flex items-baseline justify-between gap-4 py-2.5">
                  <div className="min-w-0">
                    <p className="text-[15px] text-choc">
                      <span className="num text-bronze">{l.qty}×</span> {l.name}
                    </p>
                    {(l.spice || l.instructions) && <p className="text-[12.5px] text-bronze">{[l.spice, l.instructions].filter(Boolean).join(" · ")}</p>}
                  </div>
                  <span className="num shrink-0 text-[14.5px] text-choc">{formatMoney(l.lineTotal)}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-4 space-y-1 border-t border-ink-line pt-4 text-[14px] text-bronze">
              <div className="flex justify-between">
                <dt>Subtotal</dt>
                <dd className="num">{formatMoney(order.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Tax</dt>
                <dd className="num">{formatMoney(order.tax)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Tip</dt>
                <dd className="num">{formatMoney(order.tip)}</dd>
              </div>
              <div className="flex justify-between pt-1 text-[18px] font-semibold text-choc">
                <dt>Total, {order.payment === "on-delivery" ? "paid on delivery" : "paid at pickup"}</dt>
                <dd className="num">{formatMoney(order.total)}</dd>
              </div>
            </dl>
            <div aria-hidden="true" className="permit-barcode mt-6 h-9 opacity-70" />
            <p className="num mt-1 text-[10px] tracking-[0.4em] text-bronze">{order.id.replace("-", "")}8848</p>
          </div>

          {stamp && (
            <div aria-hidden="true" className="permit-stamp">
              <svg viewBox="0 0 200 200">
                <defs>
                  <path id="stamp-top" d="M 30 100 A 70 70 0 0 1 170 100" />
                  <path id="stamp-bot" d="M 36 104 A 64 64 0 0 0 164 104" />
                  <filter id="stamp-ink">
                    <feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="2" seed="4" />
                    <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.2 1.5" />
                    <feComposite in="SourceGraphic" operator="in" />
                  </filter>
                </defs>
                <g filter="url(#stamp-ink)" fill="none" stroke="#7d3f22">
                  <circle cx="100" cy="100" r="92" strokeWidth="4" />
                  <circle cx="100" cy="100" r="80" strokeWidth="1.5" />
                  <circle cx="100" cy="100" r="46" strokeWidth="1.5" />
                  <text fill="#7d3f22" stroke="none" fontFamily="var(--font-caps)" fontSize="15" letterSpacing="4">
                    <textPath href="#stamp-top" startOffset="50%" textAnchor="middle">
                      SAGARMATHA
                    </textPath>
                  </text>
                  <text fill="#7d3f22" stroke="none" fontFamily="var(--font-caps)" fontSize="12" letterSpacing="3">
                    <textPath href="#stamp-bot" startOffset="50%" textAnchor="middle">
                      {dateStr}
                    </textPath>
                  </text>
                  <path d="M70 116 L92 80 L102 94 L110 84 L130 116Z" fill="#7d3f22" stroke="none" />
                  <text x="100" y="138" textAnchor="middle" fill="#7d3f22" stroke="none" fontFamily="var(--font-display)" fontSize="20" fontWeight="600">
                    8848
                  </text>
                  <text x="100" y="70" textAnchor="middle" fill="#7d3f22" stroke="none" fontFamily="var(--font-caps)" fontSize="9" letterSpacing="2">
                    APPROVED
                  </text>
                </g>
              </svg>
            </div>
          )}
        </article>

        <div className="mx-auto mt-8 flex max-w-[760px] flex-wrap justify-center gap-3">
          {!delivery && (
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="btn btn-brass px-6 py-3.5 text-[15px]">
              Directions to {site.address.street}
            </a>
          )}
          <a href={site.phoneHref} className="btn btn-ghost px-6 py-3.5 text-[15px]">
            Questions? {site.phone}
          </a>
          {isOn("shareSummit") && <ShareSummit first={first} />}
          <Link href="/menu" className="btn btn-ghost px-6 py-3.5 text-[15px]">
            Order again
          </Link>
        </div>
      </div>
    </div>
  );
}

function PermitField({ label, value, mono, wide }: { label: string; value: string; mono?: boolean; wide?: boolean }) {
  return (
    <div className={cn(wide && "col-span-2")}>
      <dt className="caps text-[9px] text-bronze">{label}</dt>
      <dd className={cn("mt-1 border-b border-ink-line pb-1 text-choc", mono ? "num font-medium tracking-wide" : "display text-[19px] leading-tight")}>{value}</dd>
    </div>
  );
}

/* A small summit with a flag being planted, and a puff of snow when it lands. */
function SummitFlag() {
  return (
    <div className="mx-auto mb-2 h-[150px] w-[260px]" aria-hidden="true">
      <svg viewBox="0 0 260 150" className="summit-flag h-full w-full overflow-visible">
        <defs>
          <linearGradient id="sf-rock" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#6b513c" />
            <stop offset="1" stopColor="#1e150f" />
          </linearGradient>
          <linearGradient id="sf-snow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff8ea" />
            <stop offset="1" stopColor="#c9b48f" />
          </linearGradient>
        </defs>
        <path d="M10 150 L110 58 L130 70 L150 50 L250 150Z" fill="url(#sf-rock)" />
        <path d="M110 58 L130 70 L150 50 L170 70 L152 66 L140 80 L128 72 L112 84 L118 68Z" fill="url(#sf-snow)" />
        <g className="sf-pole">
          <path d="M150 50 L150 4" stroke="#dcbf7b" strokeWidth="2.4" strokeLinecap="round" />
          <g className="sf-cloth">
            <path d="M151 6 C 168 2, 176 12, 196 8 L 196 30 C 176 34, 168 24, 151 28Z" fill="#b69e70" />
            <path d="M151 6 C 168 2, 176 12, 196 8 L 196 30 C 176 34, 168 24, 151 28Z" fill="url(#sf-snow)" opacity=".25" />
            <text x="173" y="22" textAnchor="middle" fontFamily="var(--font-display)" fontSize="11" fontWeight="600" fill="#3b2517">
              8848
            </text>
          </g>
        </g>
        <g className="sf-puff" fill="#f2e9cf">
          <circle cx="142" cy="52" r="3" />
          <circle cx="158" cy="50" r="2.5" />
          <circle cx="146" cy="46" r="2" />
          <circle cx="156" cy="44" r="1.6" />
        </g>
      </svg>
    </div>
  );
}
