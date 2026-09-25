"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/* Runs page-level effects: scroll reveals, card tilt + glare,
   scroll-driven palette warming, and Chromium liquid-glass refraction. */
export default function Effects() {
  const pathname = usePathname();

  useEffect(() => {
    const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = matchMedia("(hover:hover) and (pointer:fine)").matches;
    const cleanups: Array<() => void> = [];

    /* ---------- Reveals ---------- */
    const io = new IntersectionObserver(
      (es) => {
        es.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );
    document.querySelectorAll(".reveal,.reveal-slow").forEach((el) => io.observe(el));
    cleanups.push(() => io.disconnect());

    /* ---------- Card tilt + glare ---------- */
    if (finePointer && !reduceMotion) {
      document.querySelectorAll<HTMLElement>("[data-tilt]").forEach((card) => {
        const move = (e: PointerEvent) => {
          const r = card.getBoundingClientRect();
          const px = (e.clientX - r.left) / r.width;
          const py = (e.clientY - r.top) / r.height;
          card.style.transform = `translateY(-5px) rotateX(${(py - 0.5) * -4.5}deg) rotateY(${(px - 0.5) * 4.5}deg)`;
          card.style.setProperty("--gx", px * 100 + "%");
          card.style.setProperty("--gy", py * 100 + "%");
        };
        const leave = () => { card.style.transform = ""; };
        card.addEventListener("pointermove", move);
        card.addEventListener("pointerleave", leave);
        cleanups.push(() => {
          card.removeEventListener("pointermove", move);
          card.removeEventListener("pointerleave", leave);
        });
      });
    }

    /* ---------- Scroll-driven palette warming ---------- */
    const punteSec = document.getElementById("punte");
    if (punteSec) {
      let warmRaf: number | null = null;
      const hexLerp = (a: string, b: string, t: number) => {
        const A = parseInt(a.slice(1), 16), B = parseInt(b.slice(1), 16);
        const r = Math.round(((A >> 16) & 255) + ((((B >> 16) & 255) - ((A >> 16) & 255)) * t));
        const g = Math.round(((A >> 8) & 255) + ((((B >> 8) & 255) - ((A >> 8) & 255)) * t));
        const bl = Math.round((A & 255) + (((B & 255) - (A & 255)) * t));
        return `rgb(${r},${g},${bl})`;
      };
      const warmTick = () => {
        warmRaf = null;
        const r = punteSec.getBoundingClientRect();
        const mid = r.top + r.height / 2;
        const vh = innerHeight;
        const dist = Math.abs(mid - vh / 2);
        const t = Math.max(0, 1 - dist / (vh * 1.2));
        document.documentElement.style.setProperty("--bg-top", hexLerp("#0e0a07", "#181009", t));
        document.documentElement.style.setProperty("--bg-bot", hexLerp("#171008", "#211307", t));
      };
      const scrollH = () => {
        if (!warmRaf) warmRaf = requestAnimationFrame(warmTick);
      };
      addEventListener("scroll", scrollH, { passive: true });
      warmTick();
      cleanups.push(() => {
        removeEventListener("scroll", scrollH);
        if (warmRaf) cancelAnimationFrame(warmRaf);
        document.documentElement.style.setProperty("--bg-top", "#0e0a07");
        document.documentElement.style.setProperty("--bg-bot", "#171008");
      });
    }

    /* ---------- Liquid glass refraction (Chromium) ---------- */
    const test = document.createElement("div");
    test.style.backdropFilter = "url(#x) blur(2px)";
    const supported = !!test.style.backdropFilter;
    if (supported && !reduceMotion) {
      const svgNS = "http://www.w3.org/2000/svg";
      let defsHost = document.getElementById("filter-defs") as unknown as SVGSVGElement | null;
      if (!defsHost) {
        defsHost = document.createElementNS(svgNS, "svg") as SVGSVGElement;
        defsHost.setAttribute("id", "filter-defs");
        defsHost.setAttribute("width", "0");
        defsHost.setAttribute("height", "0");
        (defsHost.style as CSSStyleDeclaration).position = "absolute";
        document.body.appendChild(defsHost);
      }
      const makeMap = (w: number, h: number) => {
        const edge = Math.round(Math.min(w, h) * 0.18);
        const rx = Math.round(Math.min(w, h) * 0.22);
        const svg =
          `<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}'>` +
          `<defs>` +
          `<linearGradient id='r' x1='0' y1='0' x2='1' y2='0'><stop offset='0' stop-color='#000'/><stop offset='1' stop-color='#f00'/></linearGradient>` +
          `<linearGradient id='g' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='#000'/><stop offset='1' stop-color='#0f0'/></linearGradient>` +
          `<filter id='b'><feGaussianBlur stdDeviation='${Math.round(edge * 0.55)}'/></filter>` +
          `</defs>` +
          `<rect width='${w}' height='${h}' fill='#000'/>` +
          `<rect width='${w}' height='${h}' fill='url(#r)' style='mix-blend-mode:screen'/>` +
          `<rect width='${w}' height='${h}' fill='url(#g)' style='mix-blend-mode:screen'/>` +
          `<rect x='${edge}' y='${edge}' width='${w - 2 * edge}' height='${h - 2 * edge}' rx='${rx}' fill='#7f7f7f' filter='url(#b)'/>` +
          `</svg>`;
        return "data:image/svg+xml," + encodeURIComponent(svg);
      };
      type Rec = { el: HTMLElement; f: SVGFilterElement; img: SVGFEImageElement; blur: number };
      const targets: Rec[] = [];
      const sizeRefraction = (rec: Rec) => {
        const r = rec.el.getBoundingClientRect();
        const w = Math.max(2, Math.round(r.width));
        const h = Math.max(2, Math.round(r.height));
        rec.f.setAttribute("x", "0");
        rec.f.setAttribute("y", "0");
        rec.f.setAttribute("width", String(w));
        rec.f.setAttribute("height", String(h));
        rec.img.setAttribute("width", String(w));
        rec.img.setAttribute("height", String(h));
        const map = makeMap(w, h);
        rec.img.setAttribute("href", map);
        rec.img.setAttributeNS("http://www.w3.org/1999/xlink", "href", map);
      };
      const attach = (el: HTMLElement | null, scale: number, blur: number) => {
        if (!el) return;
        const id = "rf-" + Math.random().toString(36).slice(2, 8);
        const f = document.createElementNS(svgNS, "filter") as SVGFilterElement;
        f.setAttribute("id", id);
        f.setAttribute("filterUnits", "userSpaceOnUse");
        const img = document.createElementNS(svgNS, "feImage") as SVGFEImageElement;
        img.setAttribute("result", "map");
        img.setAttribute("preserveAspectRatio", "none");
        const disp = document.createElementNS(svgNS, "feDisplacementMap");
        disp.setAttribute("in", "SourceGraphic");
        disp.setAttribute("in2", "map");
        disp.setAttribute("scale", String(scale));
        disp.setAttribute("xChannelSelector", "R");
        disp.setAttribute("yChannelSelector", "G");
        f.appendChild(img);
        f.appendChild(disp);
        defsHost!.appendChild(f);
        const rec: Rec = { el, f, img, blur };
        targets.push(rec);
        sizeRefraction(rec);
        el.style.backdropFilter = `url(#${id}) blur(${blur}px) saturate(1.45)`;
        cleanups.push(() => {
          el.style.backdropFilter = "";
          f.remove();
        });
      };
      attach(document.querySelector<HTMLElement>(".loc-pill"), 26, 10);
      attach(document.getElementById("contact-glass"), 34, 14);
      attach(document.getElementById("wordmark"), 44, 8);
      let rsz: ReturnType<typeof setTimeout>;
      const rszH = () => {
        clearTimeout(rsz);
        rsz = setTimeout(() => targets.forEach(sizeRefraction), 200);
      };
      addEventListener("resize", rszH);
      cleanups.push(() => removeEventListener("resize", rszH));
    }

    return () => cleanups.forEach((fn) => fn());
  }, [pathname]);

  return null;
}
