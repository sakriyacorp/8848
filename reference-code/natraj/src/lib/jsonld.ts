import type { DayKey, Hours, HoursWindow } from "@/lib/hours";
import { restaurant } from "@/lib/menu";
import type { FaqItem } from "@/lib/faq";

const DAY: Record<DayKey, string> = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
};

function openingHours(hours: Hours) {
  const byWindow = new Map<string, { window: HoursWindow; days: string[] }>();
  for (const day of Object.keys(hours) as DayKey[]) {
    for (const window of hours[day] ?? []) {
      const key = window.join("-");
      const entry = byWindow.get(key) ?? { window, days: [] };
      entry.days.push(DAY[day]);
      byWindow.set(key, entry);
    }
  }
  return [...byWindow.values()].map(({ window, days }) => ({
    "@type": "OpeningHoursSpecification",
    dayOfWeek: days,
    opens: window[0],
    closes: window[1],
  }));
}

export function restaurantJsonLd(siteUrl: string) {
  const { name, address, phoneHref, email, hours, reservationUrl, officialSite } = restaurant;
  return {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name,
    url: siteUrl,
    logo: `${siteUrl}/brand/natraj-logo.png`,
    image: [`${siteUrl}/official/hero-curry.jpg`, `${siteUrl}/official/dining-room.jpg`],
    telephone: phoneHref.replace("tel:", ""),
    email,
    sameAs: [officialSite],
    servesCuisine: ["Indian", "North Indian", "South Indian"],
    priceRange: "$$",
    acceptsReservations: reservationUrl,
    hasMenu: `${siteUrl}/menu`,
    address: {
      "@type": "PostalAddress",
      streetAddress: address.line1,
      addressLocality: address.city,
      addressRegion: address.state,
      postalCode: address.zip,
      addressCountry: "US",
    },
    geo: { "@type": "GeoCoordinates", latitude: address.lat, longitude: address.lng },
    openingHoursSpecification: openingHours(hours),
  };
}

export function faqJsonLd(items: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((i) => ({
      "@type": "Question",
      name: i.q,
      acceptedAnswer: { "@type": "Answer", text: i.a },
    })),
  };
}
