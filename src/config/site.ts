import type { Hours } from "@/lib/hours";

/* ============================================================================================
   8848 — every business fact in one place. Edit here; the whole site follows.
   Anything marked PLACEHOLDER is invented and listed in PLACEHOLDERS.md.
   ========================================================================================== */

export const site = {
  name: "8848",
  fullName: "8848 Himalayan Fusion & Bar",
  tagline: "Himalayan Fusion & Bar",
  legalName: "8848 LLC",
  cuisine: ["Nepalese", "Himalayan", "Indo-Chinese", "North Indian"],
  description:
    "Momos, thukpa, sekuwa and dal bhat, Indo-Chinese chilli dishes and a full bar under the Himalayan night sky. On Reservoir Street in Harrisonburg, Virginia.",

  address: {
    street: "258 Reservoir St",
    city: "Harrisonburg",
    state: "VA",
    zip: "22801",
    county: "Rockingham",
    // Approximate; the directions link uses the street address, not these numbers.
    lat: 38.4441, // PLACEHOLDER (approximate geocode)
    lng: -78.8637, // PLACEHOLDER (approximate geocode)
  },

  phone: "(540) 555-8848", // PLACEHOLDER
  phoneHref: "tel:+15405558848", // PLACEHOLDER
  email: "hello@8848restaurant.com", // PLACEHOLDER
  emailHref: "mailto:hello@8848restaurant.com", // PLACEHOLDER

  /* Kitchen hours. Closed Mondays. PLACEHOLDER */
  hours: {
    mon: null,
    tue: [
      ["11:30", "14:30"],
      ["17:00", "21:30"],
    ],
    wed: [
      ["11:30", "14:30"],
      ["17:00", "21:30"],
    ],
    thu: [
      ["11:30", "14:30"],
      ["17:00", "21:30"],
    ],
    fri: [
      ["11:30", "14:30"],
      ["17:00", "22:30"],
    ],
    sat: [
      ["11:30", "14:30"],
      ["17:00", "22:30"],
    ],
    sun: [["12:00", "21:00"]],
  } satisfies Hours, // PLACEHOLDER

  /* The bar keeps going after the kitchen on weekends. PLACEHOLDER */
  barHours: {
    mon: null,
    tue: [["16:00", "22:30"]],
    wed: [["16:00", "22:30"]],
    thu: [["16:00", "23:00"]],
    fri: [["16:00", "24:00"]],
    sat: [["12:00", "24:00"]],
    sun: [["12:00", "21:00"]],
  } satisfies Hours, // PLACEHOLDER

  /* Last orders for pickup this many minutes before the kitchen closes. PLACEHOLDER */
  orderCutoffMinutes: 20,

  rating: { value: 4.9, count: 300, label: "from 300+ guests" }, // PLACEHOLDER

  socials: {
    instagram: "https://instagram.com/8848harrisonburg", // PLACEHOLDER
    facebook: "https://facebook.com/8848harrisonburg", // PLACEHOLDER
    tiktok: "https://tiktok.com/@8848harrisonburg", // PLACEHOLDER
  },

  /* Virginia 5.3% + 1% local sales tax, plus Harrisonburg's 7% meals tax. PLACEHOLDER — confirm. */
  taxRate: 0.133,

  /* Delivery radius copy only; no courier is wired up. PLACEHOLDER */
  deliveryArea: "Harrisonburg and JMU campus",

  foundedYear: 2025, // PLACEHOLDER
} as const;

export const fullAddress = `${site.address.street}, ${site.address.city}, ${site.address.state} ${site.address.zip}`;

export const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(fullAddress)}`;
export const mapsSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${site.fullName}, ${fullAddress}`)}`;

/* Everest and the route, used by the ascent, the maps and the counters. */
export const EVEREST = {
  metres: 8848.86,
  feet: 29031.7,
  nepali: "सगरमाथा",
  nepaliLatin: "Sagarmatha",
  tibetan: "Chomolungma",
  lat: 27.9881,
  lng: 86.925,
} as const;

export const KATHMANDU = { lat: 27.7172, lng: 85.324 } as const;
export const HARRISONBURG = { lat: 38.4496, lng: -78.8689 } as const;

export const NAV_LINKS = [
  { href: "/menu", label: "Menu", alt: 3440 },
  { href: "/bar", label: "The Bar", alt: 8848 },
  { href: "/story", label: "Story", alt: 1400 },
  { href: "/visit", label: "Visit", alt: 405 },
] as const;
