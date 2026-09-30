import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { SpiceChoice } from "@/lib/menu";
import type { OrderMode } from "@/lib/fulfillment";

export type BagLine = {
  key: string;
  itemId: string;
  qty: number;
  /** the guest's choice for dishes with options (protein, pour…); absent = the default */
  option?: string;
  spice?: SpiceChoice;
  instructions?: string;
};

type AddOpts = { qty?: number; option?: string; spice?: SpiceChoice; instructions?: string };

type BagState = {
  lines: BagLine[];
  mode: OrderMode;
  tipPct: number;
  hydrated: boolean;
  lastAdded: { key: string; qty: number } | null;
  add(itemId: string, opts?: AddOpts): void;
  setQty(key: string, qty: number): void;
  remove(key: string): void;
  clear(): void;
  undoLastAdd(): void;
  setHydrated(value: boolean): void;
  setMode(mode: OrderMode): void;
  setTip(pct: number): void;
};

export const MAX_QTY = 20;
export const TIP_OPTIONS = [0, 0.15, 0.18, 0.2] as const;

function hash(input: string): string {
  let h = 5381;
  for (let i = 0; i < input.length; i++) h = ((h << 5) + h + input.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}

export function lineKey(itemId: string, spice?: SpiceChoice, instructions?: string, option?: string): string {
  const notes = instructions?.trim() ?? "";
  return `${itemId}|${spice ?? ""}|${notes ? hash(notes) : ""}${option ? `|${option}` : ""}`;
}

const clampQty = (n: number) => Math.max(1, Math.min(MAX_QTY, Math.round(n)));

export const useBag = create<BagState>()(
  persist(
    (set, get) => ({
      lines: [],
      mode: "pickup",
      tipPct: 0.18,
      hydrated: false,
      lastAdded: null,
      add(itemId, opts = {}) {
        const qty = clampQty(opts.qty ?? 1);
        const instructions = opts.instructions?.trim() || undefined;
        const key = lineKey(itemId, opts.spice, instructions, opts.option);
        set((s) => {
          const existing = s.lines.find((l) => l.key === key);
          const lines = existing
            ? s.lines.map((l) => (l.key === key ? { ...l, qty: clampQty(l.qty + qty) } : l))
            : [...s.lines, { key, itemId, qty, option: opts.option, spice: opts.spice, instructions }];
          return { lines, lastAdded: { key, qty } };
        });
      },
      setQty(key, qty) {
        set((s) => ({
          lines:
            qty <= 0
              ? s.lines.filter((l) => l.key !== key)
              : s.lines.map((l) => (l.key === key ? { ...l, qty: clampQty(qty) } : l)),
        }));
      },
      remove(key) {
        set((s) => ({ lines: s.lines.filter((l) => l.key !== key) }));
      },
      clear() {
        set({ lines: [], lastAdded: null });
      },
      undoLastAdd() {
        const last = get().lastAdded;
        if (!last) return;
        set((s) => ({
          lines: s.lines.flatMap((l) => {
            if (l.key !== last.key) return [l];
            const qty = l.qty - last.qty;
            return qty > 0 ? [{ ...l, qty }] : [];
          }),
          lastAdded: null,
        }));
      },
      setHydrated(value) {
        set({ hydrated: value });
      },
      setMode(mode) {
        set({ mode });
      },
      setTip(pct) {
        set({ tipPct: pct });
      },
    }),
    {
      name: "8848-bag",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ lines: s.lines, mode: s.mode, tipPct: s.tipPct }),
      skipHydration: true,
      onRehydrateStorage: () => (state) => state?.setHydrated(true),
    },
  ),
);

export const selectCount = (s: { lines: BagLine[] }) => s.lines.reduce((n, l) => n + l.qty, 0);
