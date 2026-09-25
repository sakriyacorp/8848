"use client";

import { useState } from "react";

export default function Avatar({ image, name }: { image?: string; name: string }) {
  const [broken, setBroken] = useState(false);
  const initials = name
    .split(/\s+/)
    .map((w) => w[0] || "")
    .join("")
    .slice(0, 2)
    .toUpperCase();
  if (!image || broken) return <span className="testi-ini">{initials}</span>;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className="testi-ava"
      src={image}
      alt={name}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setBroken(true)}
    />
  );
}
