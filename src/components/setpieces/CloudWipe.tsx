"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";

/* Moving between pages is moving between camps: a bank of cloud rolls in from the side, the page
   changes behind it, and the cloud drifts off the other way. Only for internal page-to-page
   links (not hash jumps, new tabs, downloads or modified clicks). Reduced motion: no clouds. */

const COVER_MS = 420;

export function CloudWipe() {
  const router = useRouter();
  const pathname = usePathname();
  const el = useRef<HTMLDivElement>(null);
  const pending = useRef(false);

  useEffect(() => {
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const click = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest("a");
      if (!a || a.target === "_blank" || a.hasAttribute("download") || a.dataset.noWipe !== undefined) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin) return;
      if (url.pathname === location.pathname) return; // same page: hash jump / scroll to top
      e.preventDefault();
      if (pending.current) return;
      pending.current = true;
      const node = el.current;
      node?.classList.remove("is-out");
      node?.classList.add("is-in");
      setTimeout(() => router.push(url.pathname + url.search + url.hash), COVER_MS);
      // safety: never leave the cloud up
      setTimeout(() => {
        if (pending.current) {
          pending.current = false;
          node?.classList.remove("is-in");
          node?.classList.add("is-out");
        }
      }, 4000);
    };
    document.addEventListener("click", click, true);
    return () => document.removeEventListener("click", click, true);
  }, [router]);

  useEffect(() => {
    if (!pending.current) return;
    pending.current = false;
    const node = el.current;
    const t = setTimeout(() => {
      node?.classList.remove("is-in");
      node?.classList.add("is-out");
    }, 80);
    return () => clearTimeout(t);
  }, [pathname]);

  return (
    <div ref={el} aria-hidden="true" className="cloud-wipe" onAnimationEnd={(e) => e.currentTarget.classList.contains("is-out") && e.animationName === "cloud-out" && e.currentTarget.classList.remove("is-out")}>
      <i />
      <i />
      <i />
      <i />
      <i />
    </div>
  );
}
