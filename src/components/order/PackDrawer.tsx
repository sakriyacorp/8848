"use client";

import { useRef } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { Trash2, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatMoney } from "@/lib/format";
import { useFocusTrap, useScrollLock } from "@/lib/hooks";
import { byId } from "@/lib/menu";
import { MAX_QTY, TIP_OPTIONS, useBag, type BagLine } from "@/lib/bag";
import { bagTotals, lineTotal, packWeightKg } from "@/lib/bag-totals";
import { useUI } from "@/lib/ui";
import { LEAD_MINUTES } from "@/lib/fulfillment";
import { site } from "@/config/site";
import { DishImage } from "@/components/menu/DishImage";
import { Stepper } from "@/components/order/Stepper";
import { ModeSwitch } from "@/components/order/ModeSwitch";
import { TrekPack } from "@/components/icons/Icons";

/* The bag is a trekking pack. Same flow as Natraj's cart drawer (focus trap, scroll lock,
   animated rows), plus a tip selector and the pack's weight, because every trekker checks. */
export function PackDrawer({ available }: { available: Set<string> }) {
  const open = useUI((s) => s.drawerOpen);
  const close = useUI((s) => s.closeDrawer);
  const lines = useBag((s) => s.lines);
  const mode = useBag((s) => s.mode);
  const tipPct = useBag((s) => s.tipPct);
  const setTip = useBag((s) => s.setTip);
  const panel = useRef<HTMLElement>(null);

  useFocusTrap(panel, open, close);
  useScrollLock(open);

  const { subtotal, tax, tip, total } = bagTotals(lines, tipPct);
  const kg = packWeightKg(lines);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="pack-backdrop"
            aria-hidden="true"
            onClick={close}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-void/70 backdrop-blur-[2px]"
          />
          <motion.aside
            key="pack-panel"
            id="bag-drawer"
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-labelledby="pack-title"
            tabIndex={-1}
            initial={{ x: "104%" }}
            animate={{ x: 0 }}
            exit={{ x: "104%" }}
            transition={{ type: "spring", damping: 30, stiffness: 260 }}
            className="glass fixed inset-y-0 right-0 z-[71] flex w-full flex-col overflow-hidden outline-none [--glass-base:rgba(20,14,10,0.94)] sm:inset-y-3 sm:right-3 sm:w-[430px] sm:rounded-[28px]"
          >
            <header className="flex items-center justify-between gap-3 px-5 pb-3 pt-5">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-full border border-line-strong text-brass-hi">
                  <TrekPack size={22} />
                </span>
                <div>
                  <h2 id="pack-title" className="display text-[28px] leading-none text-brass-hi">
                    Your pack
                  </h2>
                  <p className="caps mt-1 text-[9.5px] text-muted">
                    {lines.length === 0 ? "Empty · 0.0 kg" : `${lines.reduce((n, l) => n + l.qty, 0)} items · ${kg.toFixed(1)} kg`}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={close}
                aria-label="Close your pack"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-line-strong text-brass-hi transition-colors hover:bg-brass/10"
              >
                <X size={17} aria-hidden="true" />
              </button>
            </header>

            {lines.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
                <EmptyPack />
                <p className="display mt-6 text-[26px] text-brass-hi">Nothing packed yet.</p>
                <p className="mt-2 max-w-[28ch] text-[14.5px] text-muted">Every climb starts with momos. Pick a few and they&rsquo;ll land in here.</p>
                <Link href="/menu" onClick={close} className="btn btn-brass mt-7 px-6 py-3 text-[14.5px]">
                  Open the menu
                </Link>
              </div>
            ) : (
              <>
                <ul className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5">
                  <AnimatePresence initial={false}>
                    {lines.map((line) => (
                      <motion.li
                        key={line.key}
                        layout
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ height: 0, opacity: 0, paddingTop: 0, paddingBottom: 0 }}
                        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden border-b border-line py-4 last:border-b-0"
                      >
                        <LineRow line={line} available={available} />
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
                <footer className="border-t border-line bg-void/30 px-5 pb-5 pt-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[13px] text-muted">Tip for the kitchen</span>
                    <div role="radiogroup" aria-label="Tip" className="flex gap-1">
                      {TIP_OPTIONS.map((t) => (
                        <button
                          key={t}
                          type="button"
                          role="radio"
                          aria-checked={tipPct === t}
                          onClick={() => setTip(t)}
                          className={cn(
                            "num rounded-full border px-2.5 py-1 text-[12.5px] transition-colors",
                            tipPct === t ? "border-foil bg-foil/15 text-brass-hi" : "border-line text-muted hover:text-brass-hi",
                          )}
                        >
                          {t === 0 ? "None" : `${Math.round(t * 100)}%`}
                        </button>
                      ))}
                    </div>
                  </div>
                  <dl className="mt-4 space-y-1.5 text-[14px]">
                    <Row label="Subtotal" value={formatMoney(subtotal)} />
                    <Row label={`Tax (${(site.taxRate * 100).toFixed(1)}%)`} value={formatMoney(tax)} />
                    {tip > 0 && <Row label="Tip" value={formatMoney(tip)} />}
                    <div className="flex justify-between pt-1.5 text-[17px] font-semibold text-brass-hi">
                      <dt>Total</dt>
                      <dd className="num">{formatMoney(total)}</dd>
                    </div>
                  </dl>
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <ModeSwitch size="sm" />
                    <p className="text-right text-[12px] leading-tight text-muted">
                      {mode === "pickup" ? `Ready in ~${LEAD_MINUTES.pickup} min` : `~${LEAD_MINUTES.delivery} min to your door`}
                    </p>
                  </div>
                  <Link href="/order" onClick={close} className="btn btn-brass mt-4 w-full py-4 text-[15.5px]">
                    Checkout · {formatMoney(total)}
                  </Link>
                </footer>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-muted">
      <dt>{label}</dt>
      <dd className="num">{value}</dd>
    </div>
  );
}

function LineRow({ line, available }: { line: BagLine; available: Set<string> }) {
  const setQty = useBag((s) => s.setQty);
  const remove = useBag((s) => s.remove);
  const item = byId(line.itemId);
  if (!item) return null;
  const details = [line.spice, line.instructions].filter(Boolean).join(" · ");
  return (
    <div className="flex gap-3.5">
      <DishImage item={item} available={available.has(item.img)} sizes="64px" className="h-16 w-16 shrink-0 rounded-xl" />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <p className="truncate text-[15px] font-medium text-text">{item.name}</p>
          <span className="num shrink-0 text-[14px] text-brass-hi">{formatMoney(lineTotal(line))}</span>
        </div>
        {details && <p className="mt-0.5 truncate text-[12.5px] text-muted">{details}</p>}
        <div className="mt-2.5 flex items-center justify-between">
          <Stepper size="sm" value={line.qty} min={1} max={MAX_QTY} label={`Quantity of ${item.name}`} onChange={(n) => setQty(line.key, n)} />
          <button
            type="button"
            onClick={() => remove(line.key)}
            aria-label={`Remove ${item.name}`}
            className="flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-brass/10 hover:text-brass-hi"
          >
            <Trash2 size={15} aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}

function EmptyPack() {
  return (
    <svg viewBox="0 0 120 120" className="h-28 w-28 text-brass" aria-hidden="true">
      <circle cx="60" cy="60" r="56" fill="none" stroke="currentColor" strokeOpacity=".18" />
      <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" transform="translate(24 20) scale(3)">
        <rect x="7.2" y="2.3" width="9.6" height="3.1" rx="1.55" />
        <path d="M6.5 9a3.6 3.6 0 0 1 3.6-3.6h3.8A3.6 3.6 0 0 1 17.5 9v10a2.6 2.6 0 0 1-2.6 2.6H9.1A2.6 2.6 0 0 1 6.5 19Z" />
        <path d="M9.2 13.2h5.6v4.2a1 1 0 0 1-1 1h-3.6a1 1 0 0 1-1-1Z" />
      </g>
    </svg>
  );
}
