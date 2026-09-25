"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useBag } from "@/lib/bag";
import { useUI } from "@/lib/ui";
import { Peak, TrekPack } from "@/components/icons/Icons";

export function Toast() {
  const toast = useUI((s) => s.toast);
  const dismiss = useUI((s) => s.dismissToast);
  const openDrawer = useUI((s) => s.openDrawer);
  const drawerOpen = useUI((s) => s.drawerOpen);
  const undo = useBag((s) => s.undoLastAdd);

  useEffect(() => {
    if (drawerOpen) dismiss();
  }, [drawerOpen, dismiss]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(dismiss, 4200);
    return () => clearTimeout(t);
  }, [toast, dismiss]);

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="pointer-events-none fixed inset-x-0 bottom-5 z-[80] flex justify-center px-4"
    >
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ y: 30, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 14, opacity: 0 }}
            transition={{ type: "spring", damping: 26, stiffness: 320 }}
            className="glass pointer-events-auto flex max-w-[calc(100vw-32px)] items-center gap-3 rounded-full py-2 pl-3 pr-2 text-[14px] text-text [--glass-base:rgba(20,14,10,0.94)]"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brass/15 text-brass-hi">
              {toast.plain ? <Peak size={16} /> : <TrekPack size={16} />}
            </span>
            <span
              className={toast.plain ? "py-1 pr-3 leading-snug" : "truncate"}
            >
              {toast.message}
            </span>
            {toast.undo && (
              <button
                type="button"
                onClick={() => {
                  undo();
                  dismiss();
                }}
                className="shrink-0 rounded-full px-3 py-1.5 text-[13px] text-muted transition-colors hover:text-brass-hi"
              >
                Undo
              </button>
            )}
            {!toast.plain && (
              <button
                type="button"
                onClick={() => {
                  openDrawer();
                  dismiss();
                }}
                className="shrink-0 rounded-full bg-brass/15 px-3.5 py-1.5 text-[13px] font-medium text-brass-hi transition-colors hover:bg-brass/25"
              >
                View
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
