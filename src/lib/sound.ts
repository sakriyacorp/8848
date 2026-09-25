import { create } from "zustand";
import { audio, startWind, suspend } from "@/lib/audio";

/* Sound is off by default and only ever turned on by a tap. The choice is remembered for the
   tab (sessionStorage), not forever — nobody wants a restaurant site that hums on arrival. */
type SoundState = { on: boolean; set(on: boolean): void; toggle(): void };

const KEY = "8848-sound";

export const useSound = create<SoundState>((set, get) => ({
  on: false,
  set(on) {
    set({ on });
    try {
      sessionStorage.setItem(KEY, on ? "1" : "0");
    } catch {}
    if (on) {
      audio();
      startWind();
    } else suspend();
  },
  toggle() {
    get().set(!get().on);
  },
}));

/* After a reload in the same tab, sound comes back on at the next gesture (browsers block audio
   until then). */
export function restoreSound() {
  try {
    if (sessionStorage.getItem(KEY) !== "1") return;
  } catch {
    return;
  }
  const wake = () => {
    useSound.getState().set(true);
    removeEventListener("pointerdown", wake);
    removeEventListener("keydown", wake);
  };
  addEventListener("pointerdown", wake, { once: true });
  addEventListener("keydown", wake, { once: true });
}

/* Play an effect only if the guest has turned sound on. */
export function sfx(play: () => void) {
  if (useSound.getState().on) play();
}
