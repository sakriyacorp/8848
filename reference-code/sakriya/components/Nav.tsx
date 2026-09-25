"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

export default function Nav() {
  const linksRef = useRef<HTMLDivElement>(null);
  const lensRef = useRef<HTMLSpanElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const linksBox = linksRef.current;
    const lensEl = lensRef.current;
    if (!linksBox || !lensEl) return;

    const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const navLinks = Array.from(
      linksBox.querySelectorAll<HTMLAnchorElement>("a[data-link]")
    );
    let cur = { x: 0, w: 0 };
    let vel = { x: 0, w: 0 };
    let tgt: { x: number; w: number } | null = null;
    let raf: number | null = null;
    let shown = false;
    let alive = true;

    function measure(a: HTMLElement) {
      const r = a.getBoundingClientRect();
      const p = linksBox!.getBoundingClientRect();
      return { x: r.left - p.left, w: r.width };
    }
    function tick() {
      if (!tgt || !alive) return;
      const k = 0.16, d = 0.72;
      vel.x = (vel.x + (tgt.x - cur.x) * k) * d;
      vel.w = (vel.w + (tgt.w - cur.w) * k) * d;
      cur.x += vel.x;
      cur.w += vel.w;
      lensEl!.style.transform = `translateX(${cur.x}px)`;
      lensEl!.style.width = cur.w + "px";
      if (
        Math.abs(vel.x) + Math.abs(vel.w) +
        Math.abs(tgt.x - cur.x) + Math.abs(tgt.w - cur.w) > 0.4
      ) {
        raf = requestAnimationFrame(tick);
      } else {
        raf = null;
      }
    }
    function moveTo(a: HTMLElement, instant = false) {
      const m = measure(a);
      if (reduceMotion || instant || !shown) {
        cur = { ...m };
        vel = { x: 0, w: 0 };
        lensEl!.style.transform = `translateX(${m.x}px)`;
        lensEl!.style.width = m.w + "px";
      }
      tgt = m;
      lensEl!.style.opacity = "1";
      shown = true;
      if (!raf && !reduceMotion) raf = requestAnimationFrame(tick);
    }

    const enterHandlers: Array<[HTMLElement, () => void]> = [];
    navLinks.forEach((a) => {
      const h = () => moveTo(a);
      a.addEventListener("mouseenter", h);
      a.addEventListener("focus", h);
      enterHandlers.push([a, h]);
    });
    const leaveH = () => {
      const act = linksBox.querySelector<HTMLElement>("a.active");
      if (act) moveTo(act);
    };
    linksBox.addEventListener("mouseleave", leaveH);

    /* active section tracking (homepage only) */
    let secIO: IntersectionObserver | null = null;
    const ids = ["about", "work", "punte"];
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];
    function setActive(href: string) {
      navLinks.forEach((a) =>
        a.classList.toggle("active", a.getAttribute("href") === href)
      );
      const act = linksBox!.querySelector<HTMLElement>("a.active");
      if (act && !linksBox!.matches(":hover")) moveTo(act);
    }
    if (sections.length) {
      secIO = new IntersectionObserver(
        (es) => {
          es.forEach((e) => {
            if (e.isIntersecting) setActive("/#" + e.target.id);
          });
        },
        { rootMargin: "-40% 0px -55% 0px" }
      );
      sections.forEach((s) => secIO!.observe(s));
    }
    if (pathname.startsWith("/thoughts")) setActive("/thoughts");

    const rszH = () => {
      const act = linksBox.querySelector<HTMLElement>("a.active");
      if (act) moveTo(act, true);
    };
    addEventListener("resize", rszH);

    return () => {
      alive = false;
      if (raf) cancelAnimationFrame(raf);
      enterHandlers.forEach(([a, h]) => {
        a.removeEventListener("mouseenter", h);
        a.removeEventListener("focus", h);
      });
      linksBox.removeEventListener("mouseleave", leaveH);
      removeEventListener("resize", rszH);
      if (secIO) secIO.disconnect();
    };
  }, [pathname]);

  return (
    <div className="nav-wrap">
      <nav className="glassnav glass" style={{ borderRadius: 999 }}>
        <Link className="logo" href="/">
          Sakriya<span>.</span>
        </Link>
        <div className="links" ref={linksRef}>
          <span className="lens" ref={lensRef} />
          <a href="/#about" data-link>About</a>
          <a href="/#work" data-link>Work</a>
          <a href="/#punte" data-link>Punte</a>
          <Link href="/thoughts" data-link>Thoughts</Link>
        </div>
        <a className="cta" href="/#contact">Contact</a>
      </nav>
    </div>
  );
}
