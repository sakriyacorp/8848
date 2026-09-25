"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useBag } from "@/lib/bag";
import { useUI } from "@/lib/ui";

export function Toast() {
  const toast = useUI((s) => s.toast);
  const dismiss = useUI((s) => s.dismissToast);
  const undo = useBag((s) => s.undoLastAdd);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(dismiss, 4000);
    return () => clearTimeout(t);
  }, [toast, dismiss]);

  return (
    <div aria-live="polite" aria-atomic="true" className="pointer-events-none fixed inset-x-0 bottom-5 z-[80] flex justify-center px-4">
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 12, opacity: 0 }}
            className="glass pointer-events-auto flex items-center gap-4 rounded-full py-2 pl-5 pr-2 text-[14px] text-cream [--glass-base:rgba(13,12,12,0.92)]"
          >
            <span>{toast.message}</span>
            {toast.undo && (
              <button
                type="button"
                onClick={() => {
                  undo();
                  dismiss();
                }}
                className="rounded-full bg-cream/10 px-3.5 py-1.5 text-[13px] font-medium transition-colors duration-150 hover:bg-cream/15"
              >
                Undo
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
