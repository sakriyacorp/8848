import { HARRISONBURG } from "@/config/site";
import { toLocal } from "@/lib/hours";

/* The sky over Harrisonburg right now: real sunrise/sunset (NOAA approximation) and the
   moon's phase. Used by the hero, the footer horizon and the bar. */

export type SkyPhase = "night" | "dawn" | "day" | "golden" | "dusk";

const RAD = Math.PI / 180;

function sunTimesUTC(y: number, m: number, d: number, lat: number, lng: number) {
  const start = Date.UTC(y, 0, 0);
  const n = Math.floor((Date.UTC(y, m - 1, d) - start) / 86_400_000);
  const g = ((2 * Math.PI) / 365) * (n - 1);
  const eqtime =
    229.18 *
    (0.000075 + 0.001868 * Math.cos(g) - 0.032077 * Math.sin(g) - 0.014615 * Math.cos(2 * g) - 0.040849 * Math.sin(2 * g));
  const decl =
    0.006918 -
    0.399912 * Math.cos(g) +
    0.070257 * Math.sin(g) -
    0.006758 * Math.cos(2 * g) +
    0.000907 * Math.sin(2 * g) -
    0.002697 * Math.cos(3 * g) +
    0.00148 * Math.sin(3 * g);
  const cosHa = Math.cos(90.833 * RAD) / (Math.cos(lat * RAD) * Math.cos(decl)) - Math.tan(lat * RAD) * Math.tan(decl);
  const ha = Math.acos(Math.max(-1, Math.min(1, cosHa))) / RAD;
  const base = Date.UTC(y, m - 1, d);
  return {
    sunrise: new Date(base + (720 - 4 * (lng + ha) - eqtime) * 60_000),
    sunset: new Date(base + (720 - 4 * (lng - ha) - eqtime) * 60_000),
  };
}

export type Sky = {
  phase: SkyPhase;
  /** 0 at sunrise → 1 at sunset (clamped); where the sun sits on the arc. */
  sun: number;
  /** 0 at sunset → 1 at next sunrise; where the moon sits on the arc at night. */
  moon: number;
  /** 0 new → 0.5 full → 1 new. */
  moonPhase: number;
  /** 0 day → 1 deep night. */
  darkness: number;
  label: string;
  sunrise: Date;
  sunset: Date;
};

export function skyAt(now: Date, where: { lat: number; lng: number } = HARRISONBURG): Sky {
  const l = toLocal(now);
  const { sunrise, sunset } = sunTimesUTC(l.y, l.m, l.d, where.lat, where.lng);
  const t = now.getTime();
  const rise = sunrise.getTime();
  const set = sunset.getTime();
  const min = 60_000;

  let phase: SkyPhase;
  if (t < rise - 50 * min || t > set + 45 * min) phase = "night";
  else if (t < rise + 35 * min) phase = "dawn";
  else if (t > set) phase = "dusk";
  else if (t > set - 80 * min) phase = "golden";
  else phase = "day";

  const sun = Math.max(0, Math.min(1, (t - rise) / (set - rise)));
  // Night runs sunset → next sunrise (~ previous sunset if we're before dawn).
  const nightLen = 24 * 60 * min - (set - rise);
  const sinceSet = t > set ? t - set : t - (set - 24 * 60 * min);
  const moon = Math.max(0, Math.min(1, sinceSet / nightLen));

  const synodic = 29.530588853;
  const ref = Date.UTC(2000, 0, 6, 18, 14);
  const moonPhase = ((((t - ref) / 86_400_000 / synodic) % 1) + 1) % 1;

  const darkness = phase === "night" ? 1 : phase === "dusk" ? 0.7 : phase === "dawn" ? 0.55 : phase === "golden" ? 0.25 : 0;

  const label = {
    night: "Night in the valley",
    dawn: "First light",
    day: "Clear day",
    golden: "Golden hour",
    dusk: "Blue hour",
  }[phase];

  return { phase, sun, moon, moonPhase, darkness, label, sunrise, sunset };
}

/* Sky gradients per phase: zenith → mid → horizon, plus the light the mountains catch. */
export const SKY_COLORS: Record<SkyPhase, { top: string; mid: string; low: string; rim: string; haze: string; stars: number }> = {
  night: { top: "#07060a", mid: "#110d10", low: "#2a1d18", rim: "#6b5a44", haze: "rgba(238,211,165,0.06)", stars: 1 },
  dawn: { top: "#1b1618", mid: "#4a3a33", low: "#c79a6c", rim: "#f0cf9c", haze: "rgba(240,190,140,0.22)", stars: 0.25 },
  day: { top: "#3b3a3a", mid: "#8a7e6e", low: "#d9c8a6", rim: "#f6ead0", haze: "rgba(246,234,208,0.25)", stars: 0 },
  golden: { top: "#241a14", mid: "#6e4a2c", low: "#e0a866", rim: "#ffd79a", haze: "rgba(255,200,130,0.28)", stars: 0.05 },
  dusk: { top: "#0d0b0e", mid: "#2b2024", low: "#8a5e44", rim: "#d8a878", haze: "rgba(216,168,120,0.16)", stars: 0.6 },
};
