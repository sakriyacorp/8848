"use client";

import { useMemo, useState } from "react";
import Avatar from "./Avatar";
import type { Testimonial } from "@/lib/testimonials";

export default function TestimonialBrowser({ list }: { list: Testimonial[] }) {
  const cats = useMemo(() => {
    const s = new Set<string>();
    list.forEach((t) => t.category && s.add(t.category));
    return ["All", ...Array.from(s)];
  }, [list]);
  const [active, setActive] = useState("All");
  const shown = active === "All" ? list : list.filter((t) => t.category === active);

  return (
    <>
      <div className="tb-filters">
        {cats.map((c) => (
          <button
            key={c}
            className={"fchip" + (c === active ? " on" : "")}
            onClick={() => setActive(c)}
          >
            {c}
          </button>
        ))}
        <span className="tb-count">
          {shown.length} {shown.length === 1 ? "voice" : "voices"}
        </span>
      </div>
      <div className="tb-grid" key={active}>
        {shown.map((t, i) => (
          <figure
            key={t.name + i}
            className="tb-card glass"
            style={{ animationDelay: `${Math.min(i * 45, 500)}ms` }}
          >
            <blockquote className="testi-quote">{t.quote}</blockquote>
            <figcaption className="testi-person">
              <Avatar image={t.image} name={t.name} />
              <span>
                <span className="testi-name">{t.name}</span>
                <span className="testi-role">{t.role}</span>
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
    </>
  );
}
