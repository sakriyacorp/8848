"use client";

import { useRef } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { Trash2, X } from "lucide-react";
import { formatMoney } from "@/lib/format";
import { useFocusTrap, useScrollLock } from "@/lib/hooks";
import { byId, restaurant } from "@/lib/menu";
import { MAX_QTY, useBag, type BagLine } from "@/lib/bag";
import { bagTotals, lineTotal } from "@/lib/bag-totals";
import { useUI } from "@/lib/ui";
import { DishImage } from "@/components/Menu/DishImage";
import { Stepper } from "@/components/Stepper";
import { ModeSwitch } from "@/components/Menu/ModeSwitch";
import { LEAD_MINUTES } from "@/lib/fulfillment";

export function CartDrawer({ available }: { available: Set<string> }) {
  const open = useUI((s) => s.drawerOpen);
  const close = useUI((s) => s.closeDrawer);
  const lines = useBag((s) => s.lines);
  const mode = useBag((s) => s.mode);
  const panel = useRef<HTMLElement>(null);

  useFocusTrap(panel, open, close);
  useScrollLock(open);

  const { subtotal, tax, total } = bagTotals(lines);
  const taxPct = Math.round(restaurant.estimatedTaxRate * 1000) / 10;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="bag-backdrop"
            aria-hidden="true"
            onClick={close}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-void/60"
          />
          <motion.aside
            key="bag-panel"
            id="bag-drawer"
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-labelledby="bag-title"
            tabIndex={-1}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            className="glass fixed inset-y-0 right-0 z-[71] flex w-full flex-col overflow-hidden outline-none [--glass-base:rgba(13,12,12,0.9)] md:inset-y-3 md:right-3 md:w-[420px] md:rounded-3xl"
          >
            <header className="flex items-center justify-between px-5 pb-3 pt-5">
              <h2 id="bag-title" className="display text-[26px] text-cream">
                Your bag
              </h2>
              <button
                type="button"
                onClick={close}
                aria-label="Close bag"
                className="glass flex h-9 w-9 items-center justify-center rounded-full text-cream hover:bg-cream/10"
              >
                <X size={16} aria-hidden="true" />
              </button>
            </header>

            {lines.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
                <p className="text-[17px] text-cream">Your bag is empty.</p>
                <Link href="/menu" onClick={close} className="btn-primary mt-5 px-5 py-2.5 text-[14px]">
                  Browse the menu
                </Link>
              </div>
            ) : (
              <>
                <ul className="min-h-0 flex-1 overflow-y-auto px-5">
                  <AnimatePresence initial={false}>
                    {lines.map((line) => (
                      <motion.li
                        key={line.key}
                        layout
                        exit={{ height: 0, opacity: 0, paddingTop: 0, paddingBottom: 0 }}
                        transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
                        className="overflow-hidden border-b border-line py-4 last:border-b-0"
                      >
                        <LineRow line={line} available={available} />
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
                <footer className="border-t border-line p-5">
                  <dl className="space-y-1.5 text-[14px]">
                    <div className="flex justify-between text-cream-2">
                      <dt>Subtotal</dt>
                      <dd className="tabular-nums">{formatMoney(subtotal)}</dd>
                    </div>
                    <div className="flex justify-between text-cream-2">
                      <dt>Estimated tax ({taxPct}%)</dt>
                      <dd className="tabular-nums">{formatMoney(tax)}</dd>
                    </div>
                    <div className="flex justify-between pt-1 text-[16px] font-semibold text-cream">
                      <dt>Total</dt>
                      <dd className="tabular-nums">{formatMoney(total)}</dd>
                    </div>
                  </dl>
                  <Link href="/checkout" onClick={close} className="btn-primary mt-4 w-full py-3.5 text-[15px]">
                    Checkout
                  </Link>
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <ModeSwitch size="sm" />
                    <p className="text-right text-[12px] text-cream-2">
                      {mode === "pickup"
                        ? `About ${LEAD_MINUTES.pickup} min · ${restaurant.address.line1.split(",")[0]}`
                        : `About ${LEAD_MINUTES.delivery} min · address at checkout`}
                    </p>
                  </div>
                </footer>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function LineRow({ line, available }: { line: BagLine; available: Set<string> }) {
  const setQty = useBag((s) => s.setQty);
  const remove = useBag((s) => s.remove);
  const item = byId(line.itemId);
  if (!item) return null;
  const details = [line.spice, line.instructions].filter(Boolean).join(" · ");
  return (
    <div className="flex gap-3">
      <DishImage
        item={item}
        available={available.has(item.img)}
        sizes="64px"
        className="h-16 w-16 shrink-0 rounded-[10px]"
        iconSize={16}
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <p className="truncate text-[15px] font-semibold text-cream">{item.name}</p>
          <span className="shrink-0 text-[14px] font-medium tabular-nums text-cream">{formatMoney(lineTotal(line))}</span>
        </div>
        {details && <p className="mt-0.5 truncate text-[13px] text-cream-2">{details}</p>}
        <div className="mt-2.5 flex items-center justify-between">
          <Stepper size="sm" value={line.qty} min={1} max={MAX_QTY} label={`Quantity for ${item.name}`} onChange={(n) => setQty(line.key, n)} />
          <button
            type="button"
            onClick={() => remove(line.key)}
            aria-label={`Remove ${item.name}`}
            className="flex h-8 w-8 items-center justify-center rounded-full text-cream-2 transition-colors duration-150 hover:bg-red/15 hover:text-red"
          >
            <Trash2 size={15} aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
