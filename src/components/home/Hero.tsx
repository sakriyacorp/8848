"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, Smartphone } from "lucide-react";
import { EVEREST, site } from "@/config/site";
import { isOn } from "@/config/features";
import { ARC, PEAKS_BOX } from "@/components/brand/logo-paths";
import { needsTiltPermission, requestTilt } from "@/lib/tilt";
import { useStatus } from "@/lib/use-status";
import type { Sky } from "@/lib/sky";
import { Plaque } from "@/components/home/Plaque";
import { MountainScene } from "@/components/setpieces/MountainScene";
import { ButterLamp } from "@/components/setpieces/ButterLamp";
import { Counter } from "@/components/setpieces/Counter";

/* The hero is one continuous move, pinned for 3 screens of scroll:
     0.00  the table: a brass plaque on walnut in a lamp-lit room
     0.05  the numerals sink away; the arc becomes a window onto the living mountain
     0.10–0.62  you're pulled through the arc (the plaque scales around the arc's centre,
                the window's circular clip grows with it) until the mountain fills the screen
     0.62–1  Sagarmatha: the real-time sky over the massif, altitude, a line of copy
   Everything is transform/opacity except the portal's clip-path. Reduced motion shows the
   table and the mountain as two plain stacked screens. */

const LOGO_VB = { x: 70, y: 36, w: 1780 };
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (a: number, b: number, v: number) => {
  const t = clamp((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};

export function Hero() {
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const rig = useRef<HTMLDivElement>(null);
  const logoBox = useRef<HTMLDivElement>(null);
  const portal = useRef<HTMLDivElement>(null);
  const cut = useRef<HTMLDivElement>(null);
  const copy = useRef<HTMLDivElement>(null);
  const room = useRef<HTMLDivElement>(null);
  const summit = useRef<HTMLDivElement>(null);
  const cue = useRef<HTMLDivElement>(null);
  const [reduced, setReduced] = useState(false);
  const [askTilt, setAskTilt] = useState(false);
  const [sky, setSky] = useState<Sky | null>(null);
  const [atSummit, setAtSummit] = useState(false);
  const st = useStatus();

  useEffect(() => {
    setReduced(matchMedia("(prefers-reduced-motion: reduce)").matches);
    setAskTilt(needsTiltPermission());
  }, []);

  useEffect(() => {
    if (reduced) return;
    const sec = section.current;
    const stg = stage.current;
    const rg = rig.current;
    const lb = logoBox.current;
    const pt = portal.current;
    const ct = cut.current;
    if (!sec || !stg || !rg || !lb || !pt || !ct) return;

    const geo = { cx: 0, cy: 0, r0: 0, smax: 40, h: 0, s0: 1, p0x: 0, p0y: 0, m1x: 0, m1y: 0 };
    const measure = () => {
      const prev = rg.style.transform;
      rg.style.transform = "none";
      const s = stg.getBoundingClientRect();
      const svg = lb.querySelector("svg")?.getBoundingClientRect() ?? lb.getBoundingClientRect();
      const r = rg.getBoundingClientRect();
      const k = svg.width / LOGO_VB.w;
      geo.cx = svg.left - s.left + (ARC.cx - LOGO_VB.x) * k;
      geo.cy = svg.top - s.top + (ARC.cy - LOGO_VB.y) * k;
      geo.r0 = (ARC.r - 11.5) * k;
      geo.h = s.height;
      // engraved peaks (centre, width) on screen vs the living massif's natural layout
      const pw = (PEAKS_BOX.maxX - PEAKS_BOX.minX) * k;
      geo.p0x = svg.left - s.left + ((PEAKS_BOX.minX + PEAKS_BOX.maxX) / 2 - LOGO_VB.x) * k;
      geo.p0y = svg.top - s.top + ((PEAKS_BOX.minY + PEAKS_BOX.maxY) / 2 - LOGO_VB.y) * k;
      const prevCt = ct.style.transform;
      ct.style.transform = "none";
      const mb = ct.querySelector(".ms-massif-box")?.getBoundingClientRect();
      ct.style.transform = prevCt;
      if (mb && mb.width > 0) {
        geo.m1x = mb.left - s.left + mb.width / 2;
        geo.m1y = mb.top - s.top + mb.height / 2;
        geo.s0 = pw / mb.width;
      }
      geo.smax = (Math.hypot(Math.max(geo.cx, s.width - geo.cx), Math.max(geo.cy, s.height - geo.cy)) / geo.r0) * 1.08;
      rg.style.transformOrigin = `${geo.cx - (r.left - s.left)}px ${geo.cy - (r.top - s.top)}px`;
      rg.style.transform = prev;
      frame();
    };

    let last = -1;
    let raf = 0;
    let summitShown = false;
    const frame = () => {
      raf = 0;
      const rect = sec.getBoundingClientRect();
      const total = rect.height - innerHeight;
      const p = clamp(-rect.top / total);
      if (Math.abs(p - last) < 0.0005 && last >= 0) return;
      last = p;

      const numFade = smooth(0, 0.1, p);
      const copyOut = smooth(0, 0.14, p);
      const z = smooth(0.08, 0.64, p);
      const zoom = 1 + Math.pow(z, 2.6) * (geo.smax - 1);
      const windowIn = smooth(0.03, 0.16, p);
      const roomOut = smooth(0.25, 0.55, p);
      const summitIn = smooth(0.64, 0.8, p);

      stg.style.setProperty("--nf", numFade.toFixed(3));
      rg.style.transform = `scale(${zoom.toFixed(4)})`;
      rg.style.visibility = zoom > geo.smax * 0.98 ? "hidden" : "visible";
      if (copy.current) {
        copy.current.style.opacity = String(1 - copyOut);
        copy.current.style.transform = `translate3d(0, ${-50 * copyOut}px, 0)`;
        copy.current.style.visibility = copyOut > 0.99 ? "hidden" : "visible";
      }
      if (cue.current) cue.current.style.opacity = String(1 - smooth(0, 0.05, p));
      if (room.current) room.current.style.opacity = String(1 - roomOut);

      const r = geo.r0 * zoom;
      pt.style.opacity = windowIn.toFixed(3);
      pt.style.clipPath = `circle(${r.toFixed(1)}px at ${geo.cx.toFixed(1)}px ${geo.cy.toFixed(1)}px)`;
      // The living massif starts exactly on the engraved peaks and grows with the ring, then
      // lags behind it (it's further away) and settles into the full-screen framing.
      const sl = geo.s0 * zoom;
      const u = geo.s0 < 1 ? clamp(Math.log(sl / geo.s0) / Math.log(1 / geo.s0)) : 1;
      const sc = Math.min(1, sl);
      const w = smooth(0, 1, u) * smooth(0.1, 0.5, p) + (1 - smooth(0.1, 0.5, p)) * 0;
      const lx = geo.cx + (geo.p0x - geo.cx) * zoom;
      const ly = geo.cy + (geo.p0y - geo.cy) * zoom;
      const tx = lx + (geo.m1x - lx) * w - geo.m1x * sc;
      const ty = ly + (geo.m1y - ly) * w - geo.m1y * sc;
      ct.style.transform = `translate3d(${tx.toFixed(1)}px, ${ty.toFixed(1)}px, 0) scale(${sc.toFixed(4)})`;

      if (summit.current) {
        summit.current.style.opacity = summitIn.toFixed(3);
        summit.current.style.transform = `translate3d(0, ${(1 - summitIn) * 40}px, 0)`;
        summit.current.style.visibility = summitIn < 0.01 ? "hidden" : "visible";
      }
      if (!summitShown && summitIn > 0.5) {
        summitShown = true;
        setAtSummit(true);
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(frame);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(stg);
    addEventListener("scroll", onScroll, { passive: true });
    // fonts/images can shift the plaque after first paint
    const t = setTimeout(measure, 600);
    return () => {
      ro.disconnect();
      removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
      clearTimeout(t);
    };
  }, [reduced]);

  const onSky = useCallback((s: Sky) => setSky(s), []);

  const ktm = useKathmanduTime();

  return (
    <section
      ref={section}
      id="top"
      aria-label="Welcome to 8848"
      className={reduced ? "relative" : "relative h-[300svh]"}
    >
      <div ref={stage} className={reduced ? "relative" : "sticky top-0 h-[100svh] overflow-hidden"}>
        {/* ---------- the room ---------- */}
        <div ref={room} className={reduced ? "relative min-h-[100svh] overflow-hidden" : "absolute inset-0"}>
          <div aria-hidden="true" className="hero-room absolute inset-0">
            <div className="hero-wall" />
            <div className="hero-lamp left-[6%] top-[4%] h-[26vh] w-[18vw] min-w-[120px]" />
            <div className="hero-lamp right-[8%] top-[2%] h-[22vh] w-[16vw] min-w-[110px]" style={{ animationDelay: "-3s" }} />
            {BOKEH.map((b, i) => (
              <span
                key={i}
                className="hero-bokeh"
                style={{
                  left: `${b[0]}%`,
                  top: `${b[1]}%`,
                  width: b[2],
                  height: b[2],
                  ["--o" as string]: b[3],
                  ["--dur" as string]: `${14 + i * 3}s`,
                  ["--bx" as string]: `${(i % 2 ? -1 : 1) * 14}px`,
                  animationDelay: `${-i * 2}s`,
                }}
              />
            ))}
            <div className="hero-table walnut" />
          </div>
        </div>

        {/* ---------- copy + plaque ---------- */}
        <div className={reduced ? "absolute inset-0" : "absolute inset-0"}>
          <div className="container-x relative grid h-full grid-rows-[auto_1fr] items-center gap-4 pb-8 pt-[92px] md:grid-cols-[1.05fr_0.95fr] md:grid-rows-1 md:gap-10 md:pb-0 md:pt-[80px]">
            <div className="order-1 flex justify-center md:order-2">
              <div ref={rig} className="w-[min(58vw,280px)] will-change-transform sm:w-[min(52vw,320px)] md:w-[min(34vw,430px)]">
                <Plaque ref={logoBox} className="hero-plaque" />
              </div>
            </div>
            <div ref={copy} className="order-2 self-start text-center md:order-1 md:self-center md:text-left">
              <p className="eyebrow hero-in text-brass" style={{ ["--hd" as string]: "0.1s" }}>
                Reservoir St · Harrisonburg
              </p>
              <h1 className="display hero-in mt-4 text-[clamp(2.6rem,9.6vw,5.6rem)] text-brass-hi" style={{ ["--hd" as string]: "0.2s" }}>
                Sit down.
                <br />
                <span className="italic brass-text">We&rsquo;ll take you up.</span>
              </h1>
              <p className="hero-in mx-auto mt-4 max-w-[40ch] text-[15.5px] leading-relaxed text-text/80 md:mx-0 md:mt-6 md:text-[17px]" style={{ ["--hd" as string]: "0.35s" }}>
                Hand-pleated momos, Himalayan spice, Indo-Chinese fire and a bar that stays up late. {site.fullName}.
              </p>
              <div className="hero-in mt-6 flex flex-wrap justify-center gap-3 md:justify-start" style={{ ["--hd" as string]: "0.5s" }}>
                <Link href="/menu" className="btn btn-brass px-6 py-3.5 text-[15px]">
                  Order pickup <ArrowRight size={16} aria-hidden="true" />
                </Link>
                <Link href="/menu" className="btn btn-ghost px-6 py-3.5 text-[15px]">
                  See the menu
                </Link>
              </div>
              <p className="hero-in mt-5 flex items-center justify-center gap-2 text-[13px] text-muted md:justify-start" style={{ ["--hd" as string]: "0.6s" }}>
                <ButterLamp lit={!!st?.open} size={14} />
                <span className={st ? "opacity-100 transition-opacity" : "opacity-0"}>{st?.line ?? "…"}</span>
                {askTilt && isOn("plaque") && (
                  <button
                    type="button"
                    onClick={async () => {
                      if (await requestTilt()) setAskTilt(false);
                    }}
                    className="ml-2 inline-flex items-center gap-1.5 rounded-full border border-line-strong px-3 py-1.5 text-[12px] text-brass-hi"
                  >
                    <Smartphone size={13} aria-hidden="true" /> Tilt to shine
                  </button>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* ---------- the window through the arc ---------- */}
        <div
          ref={portal}
          className={reduced ? "relative h-[100svh]" : "hero-portal pointer-events-none absolute inset-0 bg-[#120d09]"}
          style={reduced ? undefined : { opacity: 0 }}
        >
          <div ref={cut} className="absolute inset-0 origin-top-left will-change-transform">
            <MountainScene onSky={onSky} />
          </div>
        </div>

        {/* ---------- summit copy ---------- */}
        <div
          ref={summit}
          className={
            reduced
              ? "absolute inset-x-0 bottom-0 pb-16"
              : "pointer-events-none absolute inset-x-0 bottom-0 pb-[12svh] opacity-0 md:pb-[14svh]"
          }
          style={reduced ? undefined : { visibility: "hidden" }}
        >
          <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[70%] bg-[radial-gradient(60%_60%_at_50%_62%,rgba(10,7,5,0.72),rgba(10,7,5,0.35)_55%,transparent_80%)]" />
          <div className="container-x relative text-center">
            <p lang="ne" className="np text-[26px] leading-none text-brass-hi/95 md:text-[32px]">
              {EVEREST.nepali}
            </p>
            <p className="caps mt-3 text-[10.5px] text-brass/90 md:text-[11.5px]">
              {EVEREST.nepaliLatin} · {EVEREST.tibetan} · Everest
            </p>
            <p className="display mt-3 text-[clamp(3.4rem,15vw,9rem)] leading-[0.9] text-brass-hi [text-shadow:0_4px_40px_rgba(0,0,0,.5)]">
              {atSummit || reduced ? <Counter to={EVEREST.metres} decimals={2} duration={2.2} /> : "0.00"}
              <span className="ml-2 align-top text-[0.32em] italic text-brass">m</span>
            </p>
            <p className="mx-auto mt-4 max-w-[46ch] text-[15px] text-text/85 md:text-[17px]">
              The height of Everest, and the number over our door. Everything on the menu is a step on the way up.
            </p>
            <p className="caps mt-5 text-[10.5px] text-brass/90">
              {sky ? `${sky.label} over Harrisonburg` : "Harrisonburg"}
              {ktm ? ` · ${ktm} on Everest` : ""}
            </p>
          </div>
        </div>

        {!reduced && (
          <div ref={cue} aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-5 flex flex-col items-center gap-2 text-muted">
            <span className="caps text-[9.5px]">Scroll to climb</span>
            <span className="scroll-cue-line h-10 w-px bg-gradient-to-b from-brass to-transparent" />
          </div>
        )}
      </div>
    </section>
  );
}

const BOKEH: Array<[number, number, number, number]> = [
  [12, 28, 34, 0.35],
  [28, 16, 18, 0.25],
  [64, 22, 26, 0.3],
  [86, 34, 40, 0.28],
  [44, 10, 14, 0.22],
  [72, 48, 22, 0.18],
  [6, 52, 20, 0.16],
  [92, 12, 16, 0.24],
];

/* Local time at Everest (Nepal Time, UTC+5:45). */
function useKathmanduTime(): string | null {
  const [t, setT] = useState<string | null>(null);
  useEffect(() => {
    const f = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Kathmandu", hour: "numeric", minute: "2-digit" });
    const tick = () => setT(f.format(new Date()));
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);
  return t;
}
