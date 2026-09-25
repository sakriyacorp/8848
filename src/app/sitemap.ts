import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/menu`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/bar`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/visit`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/story`, changeFrequency: "yearly", priority: 0.5 },
  ];
}
