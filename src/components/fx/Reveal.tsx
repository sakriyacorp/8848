"use client";

import { createElement, useEffect, useRef, type CSSProperties, type ElementType, type ReactNode } from "react";
import { cn } from "@/lib/cn";

/* Rise + unblur once on entering the viewport (Natraj Reveal / sakriya Effects). Server
   markup is fully visible; the hidden start state is applied only after JS runs. */
export function Reveal({
  children,
  className,
  delay = 0,
  as = "div",
  style,
  id,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: ElementType;
  style?: CSSProperties;
  id?: string;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.classList.add("reveal");
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          el.classList.add("in");
          io.disconnect();
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return createElement(
    as,
    { ref, id, className, style: { ...style, ...(delay ? { ["--rd" as string]: `${delay}s` } : null) } },
    children,
  );
}

/* Headline whose words rise one by one from behind a mask. Pass a plain string; `em` segments
   wrapped in *asterisks* render in italic brass. */
export function SplitHeading({
  text,
  as = "h2",
  className,
  delay = 0,
  id,
}: {
  text: string;
  as?: ElementType;
  className?: string;
  delay?: number;
  id?: string;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.classList.add("split");
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          el.classList.add("in");
          io.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  let i = 0;
  const parts = text.split(/(\*[^*]+\*)/g).filter(Boolean);
  const children = parts.flatMap((part, pi) => {
    const em = part.startsWith("*") && part.endsWith("*");
    const words = (em ? part.slice(1, -1) : part).split(/(\s+)/);
    return words.map((w, wi) => {
      if (/^\s+$/.test(w) || w === "") return w;
      const idx = i++;
      return (
        <span key={`${pi}-${wi}`} className="split-word">
          <span style={{ ["--i" as string]: idx }} className={cn(em && "italic brass-text pr-[0.06em]")}>
            {w}
          </span>
        </span>
      );
    });
  });

  return createElement(
    as,
    { ref, id, className, style: delay ? { ["--rd" as string]: `${delay}s` } : undefined, "aria-label": text.replace(/\*/g, "") },
    <span aria-hidden="true">{children}</span>,
  );
}
