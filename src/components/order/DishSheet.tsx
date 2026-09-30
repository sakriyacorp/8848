"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion, useDragControls } from "motion/react";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatMoney } from "@/lib/format";
import { useFocusTrap, useMediaQuery, useScrollLock } from "@/lib/hooks";
import { byId, categoryById, hasSpiceControl, SPICE_LEVELS, unitPrice, type MenuItem, type SpiceChoice } from "@/lib/menu";
import { getDishImage } from "@/lib/dish-path";
import { MAX_QTY } from "@/lib/bag";
import { useUI } from "@/lib/ui";
import { addToPack } from "@/lib/add-to-pack";
import { DishImage } from "@/components/menu/DishImage";
import { DietBadges, SpicePeaks, TAG_LABEL } from "@/components/menu/SpicePeaks";
import { Stepper } from "@/components/order/Stepper";

const NOTES_MAX = 140;

/* Dish detail: Natraj's sheet, re-dressed. Bottom sheet with drag-to-dismiss on phones, side
   panel on desktop. The photo steams; spice is chosen on a four-step brass rail. */
export function DishSheet({ available }: { available: Set<string> }) {
  const itemId = useUI((s) => s.sheetItemId);
  const close = useUI((s) => s.closeSheet);
  const item = itemId ? byId(itemId) : undefined;
  const isDesktop = useMediaQuery("(min-width: 768px)", true);
  const panel = useRef<HTMLDivElement>(null);
  const controls = useDragControls();

  useFocusTrap(panel, !!item, close);
  useScrollLock(!!item);

  return (
    <AnimatePresence>
      {item && (
        <>
          <motion.div
            key="dish-backdrop"
            aria-hidden="true"
            onClick={close}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-void/70 backdrop-blur-[2px]"
          />
          <motion.div
            key="dish-panel"
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-labelledby="dish-sheet-title"
            tabIndex={-1}
            initial={isDesktop ? { x: 60, opacity: 0 } : { y: "100%" }}
            animate={isDesktop ? { x: 0, opacity: 1 } : { y: 0 }}
            exit={isDesktop ? { x: 60, opacity: 0 } : { y: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 280 }}
            drag={isDesktop ? false : "y"}
            dragControls={controls}
            dragListener={false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.7 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 110 || info.velocity.y > 500) close();
            }}
            className={cn(
              "glass fixed z-[71] flex flex-col overflow-hidden outline-none [--glass-base:rgba(20,14,10,0.95)]",
              isDesktop ? "bottom-3 right-3 top-3 w-[480px] rounded-[28px]" : "inset-x-0 bottom-0 max-h-[92svh] rounded-t-[28px]",
            )}
          >
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-line-strong bg-void/60 text-brass-hi backdrop-blur hover:bg-brass/15"
            >
              <X size={17} aria-hidden="true" />
            </button>
            <SheetBody key={item.id} item={item} available={available.has(item.img)} isDesktop={isDesktop} onHandle={(e) => controls.start(e)} />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function SheetBody({ item, available, isDesktop, onHandle }: { item: MenuItem; available: boolean; isDesktop: boolean; onHandle(e: React.PointerEvent): void }) {
  const [spice, setSpice] = useState<SpiceChoice>(item.spice >= 3 ? "Hot" : "Medium");
  const [option, setOption] = useState<string | undefined>(item.options?.values[0]?.name);
  const each = unitPrice(item, option);
  const [qty, setQty] = useState(1);
  const [notes, setNotes] = useState("");
  const close = useUI((s) => s.closeSheet);
  const photo = useRef<HTMLDivElement>(null);
  const spiceable = hasSpiceControl(item);
  const cat = categoryById(item.category);
  const flags = item.tags.filter((t) => t === "chef" || t === "popular");

  const onAdd = () => {
    addToPack(item.id, item.name, { qty, option: item.options ? option : undefined, spice: spiceable ? spice : undefined, instructions: notes }, photo.current, available ? getDishImage(item) : null);
    close();
  };

  return (
    <>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        {!isDesktop && (
          <div className="flex touch-none justify-center pb-1 pt-3" onPointerDown={onHandle} aria-hidden="true">
            <span className="h-1.5 w-12 rounded-full bg-brass/35" />
          </div>
        )}
        <div ref={photo} className={cn("relative", !isDesktop && "mx-4 mt-2 overflow-hidden rounded-2xl")}>
          <DishImage item={item} available={available} sizes="(max-width: 767px) 100vw, 480px" className="aspect-[16/10] w-full" />
          <span className="steam on" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          {cat && (
            <span className="caps absolute bottom-3 left-3 rounded-full bg-void/70 px-3 py-1 text-[9.5px] text-brass-hi backdrop-blur">
              {cat.camp} · {cat.altitude.toLocaleString("en-US")} m
            </span>
          )}
        </div>
        <div className="p-5 md:p-6">
          <div className="flex items-start justify-between gap-4 pr-10">
            <div>
              {flags.length > 0 && (
                <p className="caps mb-2 text-[9.5px] text-foil">{flags.map((f) => TAG_LABEL[f].long).join(" · ")}</p>
              )}
              <h3 id="dish-sheet-title" className="display text-[30px] text-brass-hi md:text-[34px]">
                {item.name}
              </h3>
              {item.np && (
                <p lang="ne" className="np mt-1 text-[15px] text-brass/90">
                  {item.np}
                </p>
              )}
            </div>
            <span className="num mt-2 shrink-0 text-[19px] text-brass-hi">{item.priceLabel && !option ? item.priceLabel : formatMoney(each)}</span>
          </div>
          {item.desc && <p className="mt-4 text-[15.5px] leading-relaxed text-text/85">{item.desc}</p>}
          {item.notes && <p className="display mt-1 text-[18px] italic text-brass">{item.notes}</p>}
          {cat?.blurb && <p className="mt-2 text-[13px] text-muted">{cat.blurb}</p>}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <SpicePeaks level={item.spice} tone="dark" />
            <DietBadges tags={item.tags} tone="dark" />
          </div>

          {item.options && item.options.values.length > 1 && (
            <fieldset className="mt-7">
              <legend className="text-[13px] text-muted">{item.options.label}</legend>
              <div role="radiogroup" aria-label={item.options.label} className="mt-2 flex flex-wrap gap-2">
                {item.options.values.map((v) => {
                  const on = v.name === option;
                  return (
                    <button
                      key={v.name}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      onClick={() => setOption(v.name)}
                      className={cn(
                        "inline-flex min-h-10 items-center gap-1.5 rounded-full border px-4 py-2 text-[13.5px] transition-[background,color,border-color] duration-300",
                        on ? "border-foil bg-[linear-gradient(100deg,#a58a58,#e9dab0_45%,#b69e70)] text-choc shadow-[inset_0_1px_0_rgba(255,250,232,.8)]" : "border-line-strong text-muted hover:text-brass-hi",
                      )}
                    >
                      {v.name}
                      {v.add ? <span className={cn("num text-[12px]", on ? "text-choc/80" : "text-brass/90")}>+{formatMoney(v.add)}</span> : null}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          )}

          {spiceable && (
            <fieldset className="mt-7">
              <legend className="text-[13px] text-muted">How hot?</legend>
              <div role="radiogroup" aria-label="Spice level" className="relative mt-2 grid grid-cols-4 gap-1 rounded-full border border-line-strong bg-void/40 p-1">
                {SPICE_LEVELS.map((level) => {
                  const on = level === spice;
                  return (
                    <button
                      key={level}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      onClick={() => setSpice(level)}
                      className={cn(
                        "rounded-full px-1 py-2 text-[12px] font-medium transition-[background,color] duration-300 md:text-[12.5px]",
                        on ? "bg-[linear-gradient(100deg,#a58a58,#e9dab0_45%,#b69e70)] text-choc shadow-[inset_0_1px_0_rgba(255,250,232,.8)]" : "text-muted hover:text-brass-hi",
                      )}
                    >
                      {level}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          )}

          <div className="mt-7 flex items-center justify-between">
            <span className="text-[13px] text-muted">Quantity</span>
            <Stepper value={qty} min={1} max={MAX_QTY} label="Quantity" onChange={setQty} />
          </div>

          <label className="mt-7 block">
            <span className="text-[13px] text-muted">Notes for the kitchen</span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value.slice(0, NOTES_MAX))}
              maxLength={NOTES_MAX}
              rows={2}
              placeholder="No cilantro, extra achar on the side…"
              className="mt-2 w-full resize-none rounded-2xl border border-line-strong bg-void/40 p-3.5 text-[16px] text-text outline-none transition-colors placeholder:text-muted/85 focus:border-foil/60"
            />
            <span className="num mt-1 block text-right text-[12px] text-muted">
              {notes.length}/{NOTES_MAX}
            </span>
          </label>
        </div>
      </div>
      <div className="border-t border-line p-4 md:p-5">
        <button type="button" onClick={onAdd} data-autofocus className="btn btn-brass w-full py-4 text-[15.5px]">
          Add to pack · {formatMoney(each * qty)}
        </button>
      </div>
    </>
  );
}
