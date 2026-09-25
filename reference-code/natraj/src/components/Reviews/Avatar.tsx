"use client";

import { useState } from "react";
import Image from "next/image";

export function Avatar({ image, name }: { image?: string; name: string }) {
  const [broken, setBroken] = useState(false);
  const initials = name
    .split(/\s+/)
    .map((w) => w[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (!image || broken) {
    return (
      <span
        aria-hidden="true"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#d9313f,#8f1520)] font-display text-[13px] font-medium text-cream shadow-[inset_0_1px_0_rgba(242,232,213,0.35)]"
      >
        {initials}
      </span>
    );
  }
  return (
    <Image
      src={image}
      alt=""
      width={36}
      height={36}
      referrerPolicy="no-referrer"
      onError={() => setBroken(true)}
      className="h-9 w-9 shrink-0 rounded-full border border-line object-cover"
    />
  );
}
