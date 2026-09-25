import type { DayKey, Hours, HoursWindow } from "@/lib/hours";
import { site } from "@/config/site";

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
    closes: window[1] === "24:00" ? "23:59" : window[1],
  }));
}

export function restaurantJsonLd(siteUrl: string) {
  const { address } = site;
  return {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: site.fullName,
    alternateName: site.name,
    legalName: site.legalName,
    url: siteUrl,
    logo: `${siteUrl}/brand/mark-brass-512.png`,
    image: [`${siteUrl}/opengraph-image.png`],
    description: site.description,
    telephone: site.phoneHref.replace("tel:", ""),
    email: site.email,
    servesCuisine: [...site.cuisine],
    priceRange: "$$",
    acceptsReservations: true,
    hasMenu: `${siteUrl}/menu`,
    address: {
      "@type": "PostalAddress",
      streetAddress: address.street,
      addressLocality: address.city,
      addressRegion: address.state,
      postalCode: address.zip,
      addressCountry: "US",
    },
    geo: { "@type": "GeoCoordinates", latitude: address.lat, longitude: address.lng },
    openingHoursSpecification: openingHours(site.hours),
    sameAs: Object.values(site.socials),
  };
}
