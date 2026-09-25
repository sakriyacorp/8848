"use client";

import Image, { type ImageProps } from "next/image";
import { useEffect, useState } from "react";

/* A next/image that is requested a beat after load, for photos that sit just under the fold:
   they would otherwise queue up alongside the hero and drag out the LCP. The wrapper keeps
   the tile's charcoal background until the photo arrives. */
export function DeferredImage({ delay = 900, ...props }: ImageProps & { delay?: number }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  if (!ready) return null;
  return <Image {...props} alt={props.alt} />;
}
