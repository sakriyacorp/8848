"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const SLIDES = ["/official/spread.jpg", "/official/dining-room.jpg", "/official/storefront.jpg"];

/* Three more official photos mount a couple of seconds after load, so the first (LCP) image
   never shares bandwidth with them, then crossfade on a 24s cycle driven by CSS. */
export function HeroSlides() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setTimeout(() => setReady(true), 2500);
    return () => clearTimeout(t);
  }, []);

  if (!ready) return null;
  return (
    <>
      {SLIDES.map((src, i) => (
        <div key={src} aria-hidden="true" className="hero-slide absolute inset-0" style={{ animationDelay: `${(i + 1) * 6}s` }}>
          <div className="hero-drift absolute inset-0">
            <Image src={src} alt="" fill sizes="100vw" quality={90} className="object-cover" />
          </div>
        </div>
      ))}
    </>
  );
}
