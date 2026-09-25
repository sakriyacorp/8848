"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { formatMoney } from "@/lib/format";
import { restaurant } from "@/lib/menu";
import { formatAddress } from "@/lib/fulfillment";
import { getOrder, type Order } from "@/lib/orders";
import { GlassPanel } from "@/components/Glass/GlassPanel";

export function Confirmation({ id }: { id: string }) {
  const [order, setOrder] = useState<Order | null | undefined>(undefined);

  useEffect(() => {
    setOrder(getOrder(id));
  }, [id]);

  if (order === undefined) return <div className="min-h-[70svh]" aria-busy="true" />;

  if (!order || !order.fulfillment) {
    return (
      <div className="flex min-h-[70svh] items-center px-5 pt-24 md:px-8">
        <div className="mx-auto w-full max-w-[1280px]">
          <h1 className="display text-[40px] text-cream md:text-[56px]">We couldn&rsquo;t find that order.</h1>
          <p className="mt-4 max-w-[50ch] text-cream-2">
            Orders are saved on the device that placed them. If you ordered from another phone or browser, call us and
            we will look it up.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/menu" className="btn-primary px-6 py-3 text-[15px]">
              Back to the menu
            </Link>
            <a href={restaurant.phoneHref} className="btn-ghost px-6 py-3 text-[15px]">
              {restaurant.phone}
            </a>
          </div>
        </div>
      </div>
    );
  }

  const { address } = restaurant;
  const f = order.fulfillment;
  const delivery = f.mode === "delivery";
  const payment =
    order.payment.method === "card"
      ? `${order.payment.brand && order.payment.brand !== "unknown" ? order.payment.brand[0].toUpperCase() + order.payment.brand.slice(1) : "Card"} ending ${order.payment.last4}`
      : "Pay at pickup";

  return (
    <div className="px-5 pb-24 pt-28 md:px-8 md:pt-36">
      <div className="mx-auto max-w-[1280px]">
        <div className="flex items-center gap-5">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-red text-cream shadow-[0_8px_30px_rgba(200,32,46,0.4)]">
            <Check size={30} strokeWidth={2.5} aria-hidden="true" />
          </span>
          <h1 className="display text-[36px] text-cream md:text-[56px]">
            Order <span className="tabular-nums">{order.id}</span> is in.
          </h1>
        </div>
        <p className="mt-6 text-[17px] text-cream-2">
          Thanks, {order.contact.name}. {delivery ? "We’ll bring it to you." : "We’ll have it ready for pickup."}
        </p>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          <GlassPanel className="rounded-3xl p-6">
            <h2 className="text-[13px] font-medium text-cream-2">{delivery ? "Delivery" : "Pickup"}</h2>
            <p className="display mt-2 text-[26px] text-cream">{f.label}</p>
            <p className="mt-3 text-[14px] text-cream-2">{payment}</p>
            {delivery && (
              <p className="mt-1 text-[14px] text-cream-2">
                Delivery fee: {f.deliveryFee === null ? "confirmed by the restaurant" : formatMoney(f.deliveryFee)}
              </p>
            )}
          </GlassPanel>
          <GlassPanel className="rounded-3xl p-6">
            <h2 className="text-[13px] font-medium text-cream-2">{delivery ? "Delivering to" : "Where"}</h2>
            {delivery && f.address ? (
              <>
                <address className="mt-2 text-[15px] not-italic text-cream">{formatAddress(f.address)}</address>
                {f.address.notes && <p className="mt-2 text-[14px] text-cream-2">{f.address.notes}</p>}
              </>
            ) : (
              <>
                <address className="mt-2 text-[15px] not-italic text-cream">
                  {address.line1}
                  <br />
                  {address.line2}
                  <br />
                  {address.city}, {address.state} {address.zip}
                </address>
                <a href={restaurant.mapsUrl} target="_blank" rel="noopener noreferrer" className="btn-ghost mt-4 px-4 py-2 text-[14px]">
                  Get directions
                </a>
              </>
            )}
          </GlassPanel>
          <GlassPanel className="rounded-3xl p-6">
            <h2 className="text-[13px] font-medium text-cream-2">Questions</h2>
            <a href={restaurant.phoneHref} className="display mt-2 block text-[26px] text-cream hover:text-gold">
              {restaurant.phone}
            </a>
            <p className="mt-3 text-[14px] text-cream-2">Mention order {order.id}.</p>
          </GlassPanel>
        </div>

        <GlassPanel className="mt-5 rounded-3xl p-6">
          <h2 className="display text-[22px] text-cream">Your order</h2>
          <ul className="mt-4 divide-y divide-line">
            {order.lines.map((l, i) => {
              const details = [l.spice, l.instructions].filter(Boolean).join(" · ");
              return (
                <li key={`${l.itemId}-${i}`} className="flex items-start justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <p className="text-[15px] font-medium text-cream">
                      <span className="tabular-nums text-cream-2">{l.qty}×</span> {l.name}
                    </p>
                    {details && <p className="text-[13px] text-cream-2">{details}</p>}
                  </div>
                  <span className="shrink-0 text-[15px] tabular-nums text-cream">{formatMoney(l.lineTotal)}</span>
                </li>
              );
            })}
          </ul>
          <dl className="mt-4 space-y-1.5 border-t border-line pt-4 text-[14px]">
            <div className="flex justify-between text-cream-2">
              <dt>Subtotal</dt>
              <dd className="tabular-nums">{formatMoney(order.subtotal)}</dd>
            </div>
            <div className="flex justify-between text-cream-2">
              <dt>Estimated tax</dt>
              <dd className="tabular-nums">{formatMoney(order.tax)}</dd>
            </div>
            {delivery && (
              <div className="flex justify-between text-cream-2">
                <dt>Delivery fee</dt>
                <dd>{f.deliveryFee === null ? "To be confirmed" : formatMoney(f.deliveryFee)}</dd>
              </div>
            )}
            <div className="flex justify-between pt-1 text-[16px] font-semibold text-cream">
              <dt>Total</dt>
              <dd className="tabular-nums">{formatMoney(order.total)}</dd>
            </div>
          </dl>
        </GlassPanel>

        <Link href="/menu" className="btn-ghost mt-8 px-6 py-3 text-[15px]">
          Order again
        </Link>
      </div>
    </div>
  );
}
