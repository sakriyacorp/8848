import { create } from "zustand";

type Toast = { id: number; message: string; undo?: boolean };

/* A dish on its way to the pack: where it starts (screen rect) and which image flies. */
export type Flight = { id: number; src: string | null; from: { x: number; y: number; w: number; h: number } };

type UIState = {
  drawerOpen: boolean;
  openDrawer(): void;
  closeDrawer(): void;
  sheetItemId: string | null;
  openSheet(itemId: string): void;
  closeSheet(): void;
  toast: Toast | null;
  showToast(message: string, opts?: { undo?: boolean }): void;
  dismissToast(): void;
  flights: Flight[];
  launch(f: Omit<Flight, "id">): void;
  land(id: number): void;
  packBump: number;
  bumpPack(): void;
};

let seq = 0;

export const useUI = create<UIState>((set) => ({
  drawerOpen: false,
  openDrawer: () => set({ drawerOpen: true, sheetItemId: null }),
  closeDrawer: () => set({ drawerOpen: false }),
  sheetItemId: null,
  openSheet: (itemId) => set({ sheetItemId: itemId }),
  closeSheet: () => set({ sheetItemId: null }),
  toast: null,
  showToast: (message, opts) => set({ toast: { id: ++seq, message, undo: opts?.undo } }),
  dismissToast: () => set({ toast: null }),
  flights: [],
  launch: (f) => set((s) => ({ flights: [...s.flights, { ...f, id: ++seq }] })),
  land: (id) => set((s) => ({ flights: s.flights.filter((f) => f.id !== id), packBump: s.packBump + 1 })),
  packBump: 0,
  bumpPack: () => set((s) => ({ packBump: s.packBump + 1 })),
}));
