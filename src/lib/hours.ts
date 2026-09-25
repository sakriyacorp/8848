export type DayKey = "sun" | "mon" | "tue" | "wed" | "thu" | "fri" | "sat";
export type HoursWindow = [open: string, close: string];
export type Hours = Record<DayKey, HoursWindow[] | null>;

export const TZ = "America/New_York";

const DAYS: DayKey[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
const DAY_NAMES: Record<DayKey, string> = {
  sun: "Sunday",
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
};
const DAY_SHORT: Record<DayKey, string> = {
  sun: "Sun",
  mon: "Mon",
  tue: "Tue",
  wed: "Wed",
  thu: "Thu",
  fri: "Fri",
  sat: "Sat",
};

export type LocalTime = {
  y: number;
  m: number;
  d: number;
  h: number;
  min: number;
  s: number;
  day: DayKey;
  minutes: number;
};

const formatter = new Intl.DateTimeFormat("en-US", {
  timeZone: TZ,
  hourCycle: "h23",
  weekday: "short",
  year: "numeric",
  month: "numeric",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
  second: "numeric",
});

export function toLocal(date: Date): LocalTime {
  const p: Record<string, string> = {};
  for (const part of formatter.formatToParts(date)) p[part.type] = part.value;
  const h = Number(p.hour) % 24;
  const min = Number(p.minute);
  return {
    y: Number(p.year),
    m: Number(p.month),
    d: Number(p.day),
    h,
    min,
    s: Number(p.second),
    day: p.weekday.toLowerCase() as DayKey,
    minutes: h * 60 + min,
  };
}

function offsetMs(utcMs: number): number {
  const l = toLocal(new Date(utcMs));
  return Date.UTC(l.y, l.m - 1, l.d, l.h, l.min, l.s) - utcMs;
}

export function fromLocal(y: number, m: number, d: number, h = 0, min = 0): Date {
  const naive = Date.UTC(y, m - 1, d, h, min);
  const utc = naive - offsetMs(naive);
  return new Date(naive - offsetMs(utc));
}

export function addDays(date: Date, days: number): Date {
  const l = toLocal(date);
  const shifted = new Date(Date.UTC(l.y, l.m - 1, l.d + days));
  return fromLocal(shifted.getUTCFullYear(), shifted.getUTCMonth() + 1, shifted.getUTCDate());
}

export function sameLocalDay(a: Date, b: Date): boolean {
  const la = toLocal(a);
  const lb = toLocal(b);
  return la.y === lb.y && la.m === lb.m && la.d === lb.d;
}

export function parseHM(hm: string): number {
  const [h, m] = hm.split(":").map(Number);
  return h * 60 + m;
}

/* Every visible time reads "11:00 AM" / "2:30 PM": minutes always shown, meridiem always on. */
export function formatHM(hm: string | number): string {
  const total = typeof hm === "string" ? parseHM(hm) : hm;
  const h24 = Math.floor(total / 60) % 24;
  const min = total % 60;
  const h12 = h24 % 12 || 12;
  return `${h12}:${String(min).padStart(2, "0")} ${h24 < 12 ? "AM" : "PM"}`;
}

export function formatTime(date: Date): string {
  return formatHM(toLocal(date).minutes);
}

export function formatWindows(windows: HoursWindow[]): string {
  return windows.map(([o, c]) => `${formatHM(o)}–${formatHM(c)}`).join(" · ");
}

export function dayName(day: DayKey): string {
  return DAY_NAMES[day];
}

export function windowsFor(date: Date, hours: Hours): HoursWindow[] {
  return hours[toLocal(date).day] ?? [];
}

export function isOpenAt(date: Date, hours: Hours): boolean {
  const l = toLocal(date);
  return (hours[l.day] ?? []).some(([o, c]) => l.minutes >= parseHM(o) && l.minutes < parseHM(c));
}

export function closingAt(date: Date, hours: Hours): Date | null {
  const l = toLocal(date);
  const current = (hours[l.day] ?? []).find(([o, c]) => l.minutes >= parseHM(o) && l.minutes < parseHM(c));
  if (!current) return null;
  const c = parseHM(current[1]);
  return fromLocal(l.y, l.m, l.d, Math.floor(c / 60), c % 60);
}

export function nextOpening(date: Date, hours: Hours): Date | null {
  const l = toLocal(date);
  for (let i = 0; i < 8; i++) {
    const dd = new Date(Date.UTC(l.y, l.m - 1, l.d + i));
    const day = DAYS[dd.getUTCDay()];
    for (const [open] of hours[day] ?? []) {
      const om = parseHM(open);
      if (i > 0 || om > l.minutes) {
        return fromLocal(dd.getUTCFullYear(), dd.getUTCMonth() + 1, dd.getUTCDate(), Math.floor(om / 60), om % 60);
      }
    }
  }
  return null;
}

export function hoursLine(date: Date, hours: Hours): string {
  const l = toLocal(date);
  const today = hours[l.day];
  if (!today) return `Closed ${DAY_NAMES[l.day]}s`;
  const current = today.find(([o, c]) => l.minutes >= parseHM(o) && l.minutes < parseHM(c));
  if (current) return `Open now · closes ${formatHM(current[1])}`;
  const later = today.find(([o]) => parseHM(o) > l.minutes);
  if (later) return `Opens at ${formatHM(later[0])}`;
  const next = nextOpening(date, hours);
  if (!next) return "Closed";
  const n = toLocal(next);
  const when = sameLocalDay(next, addDays(date, 1)) ? "tomorrow" : DAY_NAMES[n.day];
  return `Closed · opens ${when} at ${formatHM(n.minutes)}`;
}

export function pickupSlots(
  date: Date,
  hours: Hours,
  cutoffMinutes: number,
  opts: { stepMinutes?: number; leadMinutes?: number } = {},
): Date[] {
  const { stepMinutes = 15, leadMinutes = 20 } = opts;
  const l = toLocal(date);
  const earliest = date.getTime() + leadMinutes * 60_000;
  const out: Date[] = [];
  for (const [open, close] of hours[l.day] ?? []) {
    const last = parseHM(close) - cutoffMinutes;
    for (let t = parseHM(open); t <= last; t += stepMinutes) {
      const slot = fromLocal(l.y, l.m, l.d, Math.floor(t / 60), t % 60);
      if (slot.getTime() >= earliest) out.push(slot);
    }
  }
  return out;
}

export function hoursSummary(hours: Hours): string[] {
  const order: DayKey[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
  const groups: { from: DayKey; to: DayKey; windows: HoursWindow[] | null }[] = [];
  for (const day of order) {
    const windows = hours[day];
    const last = groups[groups.length - 1];
    if (last && JSON.stringify(last.windows) === JSON.stringify(windows)) last.to = day;
    else groups.push({ from: day, to: day, windows });
  }
  const label = (g: (typeof groups)[number]) =>
    g.from === g.to ? DAY_SHORT[g.from] : `${DAY_SHORT[g.from]}–${DAY_SHORT[g.to]}`;
  const open = groups.filter((g) => g.windows).map((g) => `${label(g)} ${formatWindows(g.windows ?? [])}`);
  const closed = groups
    .filter((g) => !g.windows)
    .map((g) => (g.from === g.to ? `Closed ${DAY_NAMES[g.from]}s` : `Closed ${label(g)}`));
  return [...open, ...closed];
}

/* ---- 8848: kitchen + bar ------------------------------------------------------------------ */

export type Status = {
  kitchenOpen: boolean;
  barOpen: boolean;
  open: boolean;
  line: string;
  short: string;
};

/* One sentence for the header/footer: kitchen first, then the bar if it's the only thing open. */
export function status(date: Date, kitchen: Hours, bar: Hours): Status {
  const kitchenOpen = isOpenAt(date, kitchen);
  const barOpen = isOpenAt(date, bar);
  if (kitchenOpen) {
    const c = closingAt(date, kitchen);
    return { kitchenOpen, barOpen, open: true, line: `Open now · kitchen till ${c ? formatTime(c) : "late"}`, short: "Open now" };
  }
  if (barOpen) {
    const c = closingAt(date, bar);
    return { kitchenOpen, barOpen, open: true, line: `Bar open till ${c ? formatTime(c) : "late"} · kitchen closed`, short: "Bar open" };
  }
  return { kitchenOpen, barOpen, open: false, line: hoursLine(date, kitchen), short: "Closed" };
}
