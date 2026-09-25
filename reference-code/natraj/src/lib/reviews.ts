import raw from "../../data/reviews.json";
import { restaurant } from "@/lib/menu";

/* Google Place ID for Natraj Indian Cuisine, 219 E Davis St #110, Culpeper, VA.
   Place IDs are public; the API key is not and is only ever read on the server. */
export const PLACE_ID = process.env.GOOGLE_PLACE_ID || "ChIJv9KfLsAmtIkR04N0fjrd3bo";

export type Review = {
  id: string;
  name: string;
  rating: number;
  text: string;
  relativeTime?: string;
  publishedAt?: string;
  photo?: string;
  authorUrl?: string;
  url?: string;
  source: "google" | "site";
};

export type Aggregate = {
  rating: number;
  count: number;
  source: string;
  url: string;
  writeReviewUrl: string;
};

export type ReviewsData = { aggregate: Aggregate; reviews: Review[]; live: boolean };

type SiteReview = { id: string; name: string; stars: number; text: string; date?: string };
const site = raw as unknown as {
  aggregate: { rating: number; count: number; source: string };
  reviews: SiteReview[];
};

const siteReviews: Review[] = site.reviews.map((r) => ({
  id: r.id,
  name: r.name,
  rating: r.stars,
  text: r.text,
  publishedAt: r.date,
  source: "site",
}));

type PlaceResponse = {
  rating?: number;
  userRatingCount?: number;
  googleMapsUri?: string;
  reviews?: Array<{
    name?: string;
    rating?: number;
    text?: { text?: string };
    relativePublishTimeDescription?: string;
    publishTime?: string;
    googleMapsUri?: string;
    authorAttribution?: { displayName?: string; uri?: string; photoUri?: string };
  }>;
};

type GoogleResult = { rating?: number; count?: number; url?: string; reviews: Review[] };

/* Places API (New) Place Details: live rating, total count and up to five reviews
   (Google's limit), verbatim. Cached for six hours; any failure falls back to the
   local data so the section never breaks. */
async function fetchGoogle(): Promise<GoogleResult | null> {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (!key || !PLACE_ID) return null;
  try {
    const res = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(PLACE_ID)}`, {
      headers: { "X-Goog-Api-Key": key, "X-Goog-FieldMask": "rating,userRatingCount,reviews,googleMapsUri" },
      next: { revalidate: 21600 },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as PlaceResponse;
    const reviews: Review[] = (data.reviews ?? [])
      .filter((r) => r.text?.text && typeof r.rating === "number")
      .map((r, i) => ({
        id: r.name ?? `google-${i}`,
        name: r.authorAttribution?.displayName ?? "Google user",
        rating: r.rating ?? 0,
        text: r.text?.text ?? "",
        relativeTime: r.relativePublishTimeDescription,
        publishedAt: r.publishTime,
        photo: r.authorAttribution?.photoUri,
        authorUrl: r.authorAttribution?.uri,
        url: r.googleMapsUri,
        source: "google" as const,
      }));
    return { rating: data.rating, count: data.userRatingCount, url: data.googleMapsUri, reviews };
  } catch {
    return null;
  }
}

export async function getReviews(): Promise<ReviewsData> {
  const google = await fetchGoogle();
  const seen = new Set<string>();
  const reviews = [...(google?.reviews ?? []), ...siteReviews].filter((r) => {
    const k = r.text.trim().toLowerCase().slice(0, 80);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
  reviews.sort((a, b) => b.rating - a.rating || (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""));
  return {
    aggregate: {
      rating: google?.rating ?? site.aggregate.rating,
      count: google?.count ?? site.aggregate.count,
      source: "Google",
      url: google?.url ?? restaurant.reviewUrl,
      writeReviewUrl: `https://search.google.com/local/writereview?placeid=${PLACE_ID}`,
    },
    reviews,
    live: google !== null,
  };
}

/* The home wall leads with the strongest reviews; the /reviews page shows every one. */
export function featured(reviews: Review[]): Review[] {
  const strong = reviews.filter((r) => r.rating >= 4);
  return strong.length >= 3 ? strong : reviews;
}
