"use client";

/* One source of "where is the light coming from": phone tilt (DeviceOrientation) when
   available and allowed, otherwise the mouse. Values are smoothed and normalised to -1…1.
   Subscribers get called on every animation frame while the value is still settling. */

type Listener = (x: number, y: number) => void;

const state = { tx: 0, ty: 0, x: 0, y: 0, source: "none" as "none" | "pointer" | "tilt" };
const listeners = new Set<Listener>();
let raf = 0;
let started = false;
let baseBeta: number | null = null;

function loop() {
  raf = 0;
  state.x += (state.tx - state.x) * 0.12;
  state.y += (state.ty - state.y) * 0.12;
  listeners.forEach((l) => l(state.x, state.y));
  if (Math.abs(state.tx - state.x) + Math.abs(state.ty - state.y) > 0.001) raf = requestAnimationFrame(loop);
}

function kick() {
  if (!raf) raf = requestAnimationFrame(loop);
}

function onPointer(e: PointerEvent) {
  if (state.source === "tilt" || e.pointerType !== "mouse") return;
  state.source = "pointer";
  state.tx = (e.clientX / innerWidth) * 2 - 1;
  state.ty = (e.clientY / innerHeight) * 2 - 1;
  kick();
}

function onOrient(e: DeviceOrientationEvent) {
  if (e.gamma == null || e.beta == null) return;
  state.source = "tilt";
  if (baseBeta === null) baseBeta = e.beta;
  state.tx = Math.max(-1, Math.min(1, e.gamma / 28));
  state.ty = Math.max(-1, Math.min(1, (e.beta - baseBeta) / 22));
  kick();
}

function start() {
  if (started || typeof window === "undefined") return;
  started = true;
  addEventListener("pointermove", onPointer, { passive: true });
  const DOE = window.DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> } | undefined;
  if (DOE && typeof DOE.requestPermission !== "function") addEventListener("deviceorientation", onOrient);
}

export function subscribeTilt(fn: Listener): () => void {
  start();
  listeners.add(fn);
  fn(state.x, state.y);
  return () => {
    listeners.delete(fn);
  };
}

/* iOS asks first. Call from a tap. */
export function needsTiltPermission(): boolean {
  if (typeof window === "undefined") return false;
  const DOE = window.DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> } | undefined;
  return !!DOE && typeof DOE.requestPermission === "function" && matchMedia("(pointer: coarse)").matches;
}

export async function requestTilt(): Promise<boolean> {
  const DOE = window.DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> } | undefined;
  if (!DOE?.requestPermission) return true;
  try {
    const r = await DOE.requestPermission();
    if (r === "granted") {
      baseBeta = null;
      addEventListener("deviceorientation", onOrient);
      return true;
    }
  } catch {}
  return false;
}
