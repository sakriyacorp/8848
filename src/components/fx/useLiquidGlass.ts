"use client";

import { useEffect, type RefObject } from "react";

/* Chromium liquid-glass refraction, ported from sakriya Effects.tsx: an SVG displacement
   map sized to the element bends the backdrop at the edges. Other engines and users with
   reduced motion/transparency keep the plain CSS glass. */

const SVG_NS = "http://www.w3.org/2000/svg";

function makeMap(w: number, h: number): string {
  const edge = Math.round(Math.min(w, h) * 0.18);
  const rx = Math.round(Math.min(w, h) * 0.22);
  const svg =
    `<svg xmlns='${SVG_NS}' width='${w}' height='${h}'>` +
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
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function supported(): boolean {
  const test = document.createElement("div");
  test.style.backdropFilter = "url(#x) blur(2px)";
  return !!test.style.backdropFilter;
}

function defsHost(): SVGSVGElement {
  let host = document.getElementById("liquid-glass-defs") as SVGSVGElement | null;
  if (!host) {
    host = document.createElementNS(SVG_NS, "svg");
    host.id = "liquid-glass-defs";
    host.setAttribute("width", "0");
    host.setAttribute("height", "0");
    host.setAttribute("aria-hidden", "true");
    host.style.position = "absolute";
    document.body.appendChild(host);
  }
  return host;
}

type Options = { scale?: number; blur?: number; saturate?: number };

export function useLiquidGlass(ref: RefObject<HTMLElement | null>, active: boolean, opts: Options = {}) {
  const { scale = 24, blur = 14, saturate = 1.4 } = opts;

  useEffect(() => {
    const el = ref.current;
    if (!el || !active) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (matchMedia("(prefers-reduced-transparency: reduce)").matches) return;
    if (!supported()) return;

    const id = `lg-${Math.random().toString(36).slice(2, 8)}`;
    const filter = document.createElementNS(SVG_NS, "filter");
    filter.setAttribute("id", id);
    filter.setAttribute("filterUnits", "userSpaceOnUse");
    const img = document.createElementNS(SVG_NS, "feImage");
    img.setAttribute("result", "map");
    img.setAttribute("preserveAspectRatio", "none");
    const disp = document.createElementNS(SVG_NS, "feDisplacementMap");
    disp.setAttribute("in", "SourceGraphic");
    disp.setAttribute("in2", "map");
    disp.setAttribute("scale", String(scale));
    disp.setAttribute("xChannelSelector", "R");
    disp.setAttribute("yChannelSelector", "G");
    filter.appendChild(img);
    filter.appendChild(disp);
    defsHost().appendChild(filter);

    const size = () => {
      const r = el.getBoundingClientRect();
      const w = Math.max(2, Math.round(r.width));
      const h = Math.max(2, Math.round(r.height));
      filter.setAttribute("x", "0");
      filter.setAttribute("y", "0");
      filter.setAttribute("width", String(w));
      filter.setAttribute("height", String(h));
      img.setAttribute("width", String(w));
      img.setAttribute("height", String(h));
      img.setAttribute("href", makeMap(w, h));
    };
    size();
    const value = `url(#${id}) blur(${blur}px) saturate(${saturate})`;
    el.style.setProperty("backdrop-filter", value);
    el.style.setProperty("-webkit-backdrop-filter", value);

    const ro = new ResizeObserver(size);
    ro.observe(el);

    return () => {
      ro.disconnect();
      filter.remove();
      el.style.removeProperty("backdrop-filter");
      el.style.removeProperty("-webkit-backdrop-filter");
    };
  }, [ref, active, scale, blur, saturate]);
}
