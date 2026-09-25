/* Public origin for absolute URLs (metadata, JSON-LD, sitemap). No trailing slash. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
