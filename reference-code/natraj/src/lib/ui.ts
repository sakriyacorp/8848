import { create } from "zustand";

type Toast = { id: number; message: string; undo?: boolean };

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
};

let toastId = 0;

export const useUI = create<UIState>((set) => ({
  drawerOpen: false,
  openDrawer: () => set({ drawerOpen: true, sheetItemId: null }),
  closeDrawer: () => set({ drawerOpen: false }),
  sheetItemId: null,
  openSheet: (itemId) => set({ sheetItemId: itemId }),
  closeSheet: () => set({ sheetItemId: null }),
  toast: null,
  showToast: (message, opts) => set({ toast: { id: ++toastId, message, undo: opts?.undo } }),
  dismissToast: () => set({ toast: null }),
}));
