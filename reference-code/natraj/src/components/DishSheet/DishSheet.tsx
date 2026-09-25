"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion, useDragControls } from "motion/react";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatMoney } from "@/lib/format";
import { useFocusTrap, useMediaQuery, useScrollLock } from "@/lib/hooks";
import { byId, categoryById, hasSpiceControl, restaurant, type MenuItem, type SpiceLevel } from "@/lib/menu";
import { MAX_QTY, useBag } from "@/lib/bag";
import { useUI } from "@/lib/ui";
import { DishImage } from "@/components/Menu/DishImage";
import { DietTags } from "@/components/Menu/DietTags";
import { Stepper } from "@/components/Stepper";

const NOTES_MAX = 140;

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
            className="fixed inset-0 z-[70] bg-void/60"
          />
          <motion.div
            key="dish-panel"
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-labelledby="dish-sheet-title"
            tabIndex={-1}
            initial={isDesktop ? { x: 48, opacity: 0 } : { y: "100%" }}
            animate={isDesktop ? { x: 0, opacity: 1 } : { y: 0 }}
            exit={isDesktop ? { x: 48, opacity: 0 } : { y: "100%" }}
            drag={isDesktop ? false : "y"}
            dragControls={controls}
            dragListener={false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.7 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 110 || info.velocity.y > 500) close();
            }}
            className={cn(
              "glass fixed z-[71] flex flex-col overflow-hidden outline-none [--glass-base:rgba(13,12,12,0.88)]",
              isDesktop ? "bottom-3 right-3 top-3 w-[480px] rounded-3xl" : "inset-x-0 bottom-0 max-h-[92svh] rounded-t-3xl",
            )}
          >
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="glass absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full text-cream hover:bg-cream/10"
            >
              <X size={16} aria-hidden="true" />
            </button>
            <SheetBody key={item.id} item={item} available={available.has(item.img)} isDesktop={isDesktop} onHandle={(e) => controls.start(e)} />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

type BodyProps = {
  item: MenuItem;
  available: boolean;
  isDesktop: boolean;
  onHandle(e: React.PointerEvent): void;
};

function SheetBody({ item, available, isDesktop, onHandle }: BodyProps) {
  const [spice, setSpice] = useState<SpiceLevel>("Medium");
  const [qty, setQty] = useState(1);
  const [notes, setNotes] = useState("");
  const add = useBag((s) => s.add);
  const close = useUI((s) => s.closeSheet);
  const showToast = useUI((s) => s.showToast);
  const spiceable = hasSpiceControl(item);
  const blurb = categoryById(item.category)?.blurb;

  const onAdd = () => {
    add(item.id, { qty, spice: spiceable ? spice : undefined, instructions: notes });
    close();
    showToast(`Added ${item.name}`, { undo: true });
  };

  return (
    <>
      <div className="min-h-0 flex-1 overflow-y-auto">
        {!isDesktop && (
          <div className="flex touch-none justify-center pb-1 pt-3" onPointerDown={onHandle} aria-hidden="true">
            <span className="h-1.5 w-12 rounded-full bg-cream/25" />
          </div>
        )}
        <DishImage
          item={item}
          available={available}
          sizes="(max-width: 767px) 100vw, 480px"
          className={cn("aspect-[16/9] w-full", !isDesktop && "mx-4 mt-2 w-auto rounded-2xl")}
          iconSize={32}
        />
        <div className="p-5 md:p-6">
          <div className="flex items-start justify-between gap-4 pr-8">
            <h3 id="dish-sheet-title" className="display text-[26px] text-cream md:text-[28px]">
              {item.name}
            </h3>
            <span className="mt-1 shrink-0 text-[17px] font-medium tabular-nums text-cream">{formatMoney(item.price)}</span>
          </div>
          <p className="mt-3 text-[15px] leading-relaxed text-cream-2">{item.desc}</p>
          {blurb && <p className="mt-2 text-[13px] text-cream-2/80">{blurb}</p>}
          <DietTags tags={item.tags} className="mt-4" />

          {spiceable && (
            <fieldset className="mt-7">
              <legend className="text-[13px] font-medium text-cream-2">Spice level</legend>
              <div role="radiogroup" aria-label="Spice level" className="mt-2 grid grid-cols-4 gap-1 rounded-full border border-line bg-void/40 p-1">
                {restaurant.spiceLevels.map((level) => {
                  const on = level === spice;
                  return (
                    <button
                      key={level}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      onClick={() => setSpice(level)}
                      className={cn(
                        "rounded-full px-1 py-2 text-[12.5px] font-medium transition-colors duration-150 md:text-[13px]",
                        on ? "bg-red text-cream" : "text-cream-2 hover:text-cream",
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
            <span className="text-[13px] font-medium text-cream-2">Quantity</span>
            <Stepper value={qty} min={1} max={MAX_QTY} label="Quantity" onChange={setQty} />
          </div>

          <label className="mt-7 block">
            <span className="text-[13px] font-medium text-cream-2">Special instructions</span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value.slice(0, NOTES_MAX))}
              maxLength={NOTES_MAX}
              rows={2}
              placeholder="No cilantro, extra sauce on the side…"
              className="mt-2 w-full resize-none rounded-2xl border border-line bg-void/40 p-3.5 text-[15px] text-cream outline-none transition-colors duration-150 placeholder:text-cream-2/80 focus:border-red/60"
            />
            <span className="mt-1 block text-right text-[12px] tabular-nums text-cream-2/80">
              {notes.length}/{NOTES_MAX}
            </span>
          </label>
        </div>
      </div>
      <div className="border-t border-line p-4 md:p-5">
        <button type="button" onClick={onAdd} data-autofocus className="btn-primary w-full py-3.5 text-[15px]">
          Add to bag · {formatMoney(item.price * qty)}
        </button>
      </div>
    </>
  );
}
