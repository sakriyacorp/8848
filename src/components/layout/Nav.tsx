"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu as MenuIcon, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { NAV_LINKS, site } from "@/config/site";
import { selectCount, useBag } from "@/lib/bag";
import { useUI } from "@/lib/ui";
import { useStatus } from "@/lib/use-status";
import { formatWhole } from "@/lib/format";
import { Logo } from "@/components/brand/Logo";
import { TrekPack } from "@/components/icons/Icons";
import { ButterLamp } from "@/components/setpieces/ButterLamp";
import { useLiquidGlass } from "@/components/fx/useLiquidGlass";
import { useNavLens } from "@/components/layout/useNavLens";

export function Nav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [bump, setBump] = useState(0);
  const bagCount = useBag(selectCount);
  const hydrated = useBag((s) => s.hydrated);
  const drawerOpen = useUI((s) => s.drawerOpen);
  const openDrawer = useUI((s) => s.openDrawer);
  const packBump = useUI((s) => s.packBump);
  const st = useStatus();
  const prevCount = useRef(0);
  const armed = useRef(false);
  const pill = useRef<HTMLElement>(null);
  const linksBox = useRef<HTMLDivElement>(null);
  const lens = useRef<HTMLSpanElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const firstLink = useRef<HTMLAnchorElement>(null);

  const active = NAV_LINKS.find((l) => pathname.startsWith(l.href))?.href ?? null;
  const solid = scrolled || open;
  useLiquidGlass(pill, solid, { scale: 22, blur: 16 });
  useNavLens(linksBox, lens, active);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  /* Badge bounce: when the count changes, and when a flying dish lands in the pack. */
  useEffect(() => {
    if (!hydrated) return;
    if (!armed.current) {
      armed.current = true;
      prevCount.current = bagCount;
      return;
    }
    if (prevCount.current !== bagCount) {
      prevCount.current = bagCount;
      setBump((b) => b + 1);
    }
  }, [bagCount, hydrated]);

  useEffect(() => {
    if (packBump > 0) setBump((b) => b + 1);
  }, [packBump]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const trigger = menuButton.current;
    document.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    const raf = requestAnimationFrame(() => firstLink.current?.focus());
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
      trigger?.focus();
    };
  }, [open]);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 md:px-5 md:pt-4">
        <nav
          ref={pill}
          aria-label="Main"
          className={cn(
            "mx-auto flex h-14 max-w-[1180px] items-center gap-1.5 rounded-full pl-3 pr-2 transition-[background,box-shadow,border-color] duration-500 md:h-[60px] md:pl-4",
            solid ? "glass [--glass-base:rgba(14,10,7,0.72)]" : "border border-transparent",
          )}
        >
          <Link href="/" aria-label={`${site.fullName} — home`} className="group mr-auto flex items-center gap-2.5" data-logo-tap>
            <Logo variant="mark" material="brass" className="h-7 w-auto transition-transform duration-500 ease-out group-hover:-translate-y-0.5 md:h-8" title="8848" />
            <Logo variant="numerals" material="brass" className="h-[18px] w-auto md:h-5" title="8848" />
          </Link>

          <div ref={linksBox} className="relative hidden items-center gap-0.5 lg:flex">
            <span ref={lens} aria-hidden="true" className="nav-lens" />
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                data-link={l.href}
                aria-current={active === l.href ? "page" : undefined}
                className={cn(
                  "relative z-[1] whitespace-nowrap rounded-full px-4 py-2 text-[14.5px] font-medium tracking-wide transition-colors duration-200 hover:text-brass-hi",
                  active === l.href ? "text-brass-hi" : "text-text/80",
                )}
              >
                {l.label}
              </Link>
            ))}
          </div>

          <Link
            href="/visit"
            className="ml-2 hidden items-center gap-2 rounded-full px-3 py-2 text-[13px] text-muted transition-colors hover:text-brass-hi xl:flex"
            aria-live="polite"
          >
            <ButterLamp lit={!!st?.open} size={14} />
            <span className={cn("transition-opacity duration-500", st ? "opacity-100" : "opacity-0")}>{st?.short ?? "Hours"}</span>
          </Link>

          <Link href="/menu" className="btn btn-brass ml-1 hidden px-5 py-2.5 text-[14px] md:inline-flex">
            Order
          </Link>

          <button
            type="button"
            onClick={openDrawer}
            data-pack
            aria-label={`Your pack, ${bagCount} ${bagCount === 1 ? "item" : "items"}`}
            aria-expanded={drawerOpen}
            aria-controls="bag-drawer"
            aria-haspopup="dialog"
            className="relative ml-1 inline-flex h-11 w-11 items-center justify-center rounded-full border border-line-strong bg-[var(--glass-fill)] text-brass-hi transition-[transform,border-color] duration-300 ease-bounce hover:-translate-y-0.5 hover:border-foil/60 active:scale-95"
          >
            <span key={bump} className={cn("inline-flex", bump > 0 && "animate-badge")}>
              <TrekPack size={22} />
            </span>
            {bagCount > 0 && (
              <span
                key={`n${bump}`}
                className={cn(
                  "num absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px] font-semibold text-choc",
                  "bg-[linear-gradient(135deg,#f1e4bd,#c5ac78)] shadow-[0_2px_8px_rgba(0,0,0,.5)]",
                  bump > 0 && "animate-badge",
                )}
              >
                {bagCount}
              </span>
            )}
          </button>

          <button
            ref={menuButton}
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="nav-sheet"
            onClick={() => setOpen((o) => !o)}
            className="ml-1 inline-flex h-11 w-11 items-center justify-center rounded-full border border-line-strong bg-[var(--glass-fill)] text-brass-hi lg:hidden"
          >
            {open ? <X size={19} aria-hidden="true" /> : <MenuIcon size={19} aria-hidden="true" />}
          </button>
        </nav>
      </header>

      <div
        id="nav-sheet"
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        aria-hidden={!open}
        inert={!open}
        className={cn(
          "fixed inset-0 z-40 flex flex-col justify-end overflow-hidden bg-void/92 px-6 pb-10 pt-24 backdrop-blur-[22px] transition-[opacity,visibility] duration-500 ease-out lg:hidden",
          open ? "visible opacity-100" : "invisible pointer-events-none opacity-0",
        )}
      >
        <div aria-hidden="true" className="lamp-glow -right-24 top-10 h-80 w-80" />
        <p className="eyebrow mb-6 text-brass">The climb</p>
        <ul className="flex flex-col">
          {[{ href: "/", label: "Base Camp", alt: 405 }, ...NAV_LINKS].map((l, i) => (
            <li
              key={l.href}
              className={cn("transition-[opacity,transform] duration-700 ease-out", open ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0")}
              style={{ transitionDelay: open ? `${80 + i * 60}ms` : "0ms" }}
            >
              <Link
                ref={i === 0 ? firstLink : undefined}
                href={l.href}
                onClick={() => setOpen(false)}
                className="flex items-baseline justify-between gap-4 border-b border-line py-3.5"
              >
                <span className="display text-[42px] text-brass-hi">{l.label}</span>
                <span className="num caps text-[11px] text-muted">{formatWhole(l.alt)} m</span>
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-8 flex items-center justify-between gap-4">
          <Link href="/menu" onClick={() => setOpen(false)} className="btn btn-brass flex-1 px-5 py-3.5 text-[15px]">
            Order now
          </Link>
          <a href={site.phoneHref} className="btn btn-ghost px-5 py-3.5 text-[15px]">
            Call
          </a>
        </div>
        <p className="mt-6 flex items-center gap-2 text-[13px] text-muted">
          <ButterLamp lit={!!st?.open} size={14} /> {st?.line ?? ""}
        </p>
      </div>
    </>
  );
}
