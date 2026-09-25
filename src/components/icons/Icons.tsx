import type { SVGProps } from "react";

/* Custom line icons in the brass-engraving style (1.6 stroke, round joins). */

type P = SVGProps<SVGSVGElement> & { size?: number };

const base = (size = 22): SVGProps<SVGSVGElement> => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
});

/* The bag is a trekking pack: rolled mat on top, front pocket, side strap. */
export function TrekPack({ size, ...rest }: P) {
  return (
    <svg {...base(size)} {...rest}>
      <rect x="7.2" y="2.3" width="9.6" height="3.1" rx="1.55" />
      <path d="M6.5 9a3.6 3.6 0 0 1 3.6-3.6h3.8A3.6 3.6 0 0 1 17.5 9v10a2.6 2.6 0 0 1-2.6 2.6H9.1A2.6 2.6 0 0 1 6.5 19Z" />
      <path d="M9.2 13.2h5.6v4.2a1 1 0 0 1-1 1h-3.6a1 1 0 0 1-1-1Z" />
      <path d="M9.2 15.4h5.6" />
      <path d="M6.5 11.5H5.3a.9.9 0 0 0-.9.9v4.3" />
      <path d="M17.5 11.5h1.2a.9.9 0 0 1 .9.9v4.3" />
    </svg>
  );
}

export function Peak({ size, ...rest }: P) {
  return (
    <svg {...base(size)} {...rest}>
      <path d="M2.5 20 9.5 7.5l3.2 5.2 2.3-3.4L21.5 20Z" />
      <path d="m8 10 1.5 1.6L11 10" />
    </svg>
  );
}

export function Compass({ size, ...rest }: P) {
  return (
    <svg {...base(size)} {...rest}>
      <circle cx="12" cy="12" r="9.3" />
      <path d="m15.6 8.4-2.2 5-5 2.2 2.2-5Z" />
    </svg>
  );
}

export function Pin({ size, ...rest }: P) {
  return (
    <svg {...base(size)} {...rest}>
      <path d="M12 21.3s-6.8-6-6.8-11.1a6.8 6.8 0 0 1 13.6 0c0 5.1-6.8 11.1-6.8 11.1Z" />
      <path d="m9.3 11.3 2.7-4.3 2.7 4.3Z" />
    </svg>
  );
}

export function Instagram({ size, ...rest }: P) {
  return (
    <svg {...base(size)} {...rest}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r=".6" fill="currentColor" />
    </svg>
  );
}

export function Facebook({ size, ...rest }: P) {
  return (
    <svg {...base(size)} {...rest}>
      <path d="M14.5 21v-7.6h2.7l.4-3.2h-3.1V8.4c0-.9.3-1.6 1.6-1.6h1.6V4a21 21 0 0 0-2.4-.1c-2.4 0-4 1.4-4 4.1v2.2H8.6v3.2h2.7V21" />
    </svg>
  );
}

export function TikTok({ size, ...rest }: P) {
  return (
    <svg {...base(size)} {...rest}>
      <path d="M14.2 3.5v11.4a3.6 3.6 0 1 1-3.6-3.6" />
      <path d="M14.2 3.5c.4 2.6 2.2 4.4 5 4.6" />
    </svg>
  );
}

/* A butter lamp (brass bowl on a stem). The flame is drawn by <ButterLamp> in setpieces. */
export function LampBowl({ size, ...rest }: P) {
  return (
    <svg {...base(size)} {...rest}>
      <path d="M5 11.5h14a7 7 0 0 1-14 0Z" />
      <path d="M12 18.5v2.5M8.5 21h7" />
      <path d="M12 11.5V9.8" />
    </svg>
  );
}
