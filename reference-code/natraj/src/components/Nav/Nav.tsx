"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu as MenuIcon, ShoppingBag, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { selectCount, useBag } from "@/lib/bag";
import { useUI } from "@/lib/ui";
import { useLiquidGlass } from "@/components/Glass/useLiquidGlass";
import { useNavLens } from "@/components/Nav/useNavLens";

const LINKS = [
  { id: "menu", label: "Menu", href: "/menu" },
  { id: "reviews", label: "Reviews", href: "/#reviews" },
  { id: "story", label: "Story", href: "/#story" },
  { id: "visit", label: "Visit", href: "/#visit" },
] as const;

export function Nav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [bump, setBump] = useState(0);
  const bagCount = useBag(selectCount);
  const hydrated = useBag((s) => s.hydrated);
  const drawerOpen = useUI((s) => s.drawerOpen);
  const openDrawer = useUI((s) => s.openDrawer);
  const prevCount = useRef(0);
  const armed = useRef(false);
  const pill = useRef<HTMLElement>(null);
  const linksBox = useRef<HTMLDivElement>(null);
  const lens = useRef<HTMLSpanElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const firstLink = useRef<HTMLAnchorElement>(null);

  const solid = scrolled || open;
  useLiquidGlass(pill, solid, { scale: 22, blur: 16 });
  useNavLens(linksBox, lens, active);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
    const sections = LINKS.map((l) => document.getElementById(l.id)).filter((el): el is HTMLElement => el !== null);
    if (sections.length === 0) return;
    const visible = new Set<string>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) visible.add(e.target.id);
          else visible.delete(e.target.id);
        }
        setActive(LINKS.find((l) => visible.has(l.id))?.id ?? null);
      },
      { rootMargin: "-40% 0px -55% 0px" },
    );
    sections.forEach((s) => io.observe(s));
    return () => {
      io.disconnect();
      setActive(null);
    };
  }, [pathname]);

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
      <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 md:px-4 md:pt-4">
        <nav
          ref={pill}
          aria-label="Main"
          className={cn(
            "glass mx-auto flex h-14 max-w-[1120px] items-center gap-2 rounded-full pl-5 pr-2 transition-[--glass-base,box-shadow] duration-300",
            solid ? "[--glass-base:rgba(7,7,7,0.66)]" : "[--glass-base:rgba(7,7,7,0.34)]",
          )}
        >
          <Link href="/" className="mr-auto font-display text-[22px] font-medium tracking-tight text-cream">
            Natraj<span className="text-red">.</span>
          </Link>

          <div ref={linksBox} className="relative hidden items-center gap-0.5 md:flex">
            <span ref={lens} aria-hidden="true" className="nav-lens" />
            {LINKS.map((l) => (
              <Link
                key={l.id}
                href={l.href}
                data-link={l.id}
                aria-current={active === l.id ? "location" : undefined}
                className={cn(
                  "relative z-[1] whitespace-nowrap rounded-full px-3.5 py-2 text-[14px] font-medium transition-colors duration-200 hover:text-cream",
                  active === l.id ? "text-cream" : "text-cream/85",
                )}
              >
                {l.label}
              </Link>
            ))}
          </div>

          <Link href="/menu" className="btn-order ml-1 hidden px-5 py-2 text-[14px] md:inline-flex">
            Order
          </Link>
          <button
            type="button"
            onClick={openDrawer}
            aria-label={`Bag, ${bagCount} ${bagCount === 1 ? "item" : "items"}`}
            aria-expanded={drawerOpen}
            aria-controls="bag-drawer"
            aria-haspopup="dialog"
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-line bg-glass text-cream transition-colors duration-200 hover:bg-[rgba(242,232,213,0.12)]"
          >
            <ShoppingBag size={18} strokeWidth={1.75} aria-hidden="true" />
            {bagCount > 0 && (
              <span
                key={bump}
                className={cn(
                  "absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red px-1 text-[11px] font-semibold tabular-nums text-cream",
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
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line bg-glass text-cream md:hidden"
          >
            {open ? <X size={18} aria-hidden="true" /> : <MenuIcon size={18} aria-hidden="true" />}
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
          "fixed inset-0 z-40 flex flex-col justify-end bg-night/90 px-6 pb-10 pt-24 backdrop-blur-[18px] backdrop-saturate-[1.4] transition-[opacity,transform,visibility] duration-[260ms] ease-soft md:hidden",
          open ? "visible translate-y-0 opacity-100" : "invisible pointer-events-none -translate-y-3 opacity-0",
        )}
      >
        <ul className="flex flex-col">
          {LINKS.map((l, i) => (
            <li key={l.id}>
              <Link
                ref={i === 0 ? firstLink : undefined}
                href={l.href}
                onClick={() => setOpen(false)}
                className="display block py-3 text-[40px] text-cream"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
        <Link href="/menu" onClick={() => setOpen(false)} className="btn-order mt-8 w-full px-5 py-3.5 text-[15px]">
          Order
        </Link>
      </div>
    </>
  );
}
