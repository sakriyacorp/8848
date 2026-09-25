import type { Metadata } from "next";
import { getReviews } from "@/lib/reviews";
import { RatingBadge } from "@/components/Reviews/RatingBadge";
import { ReviewCard } from "@/components/Reviews/ReviewCard";

export const metadata: Metadata = {
  title: "Reviews — Natraj Indian Cuisine",
  description: "What guests say about Natraj Indian Cuisine in Culpeper, VA.",
};

export default async function ReviewsPage() {
  const { aggregate, reviews } = await getReviews();
  return (
    <div className="px-5 pb-24 pt-32 md:px-8 md:pt-40">
      <div className="mx-auto max-w-[1280px]">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="display text-[44px] text-cream md:text-[64px]">Every review.</h1>
            <RatingBadge aggregate={aggregate} className="mt-6" />
          </div>
          <a
            href={aggregate.writeReviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost self-start px-5 py-2.5 text-[14px] md:self-auto"
          >
            Leave a review
          </a>
        </div>

        <div className="mt-12 columns-1 gap-5 sm:columns-2 lg:columns-3">
          {reviews.map((r) => (
            <ReviewCard key={r.id} review={r} linkAuthor className="mb-5 break-inside-avoid" />
          ))}
        </div>

        <p className="mt-8 text-[13px] text-cream-2/80">
          Reviews are shown word for word.{" "}
          <a href={aggregate.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-cream">
            Read all {aggregate.count.toLocaleString("en-US")} on Google
          </a>
          .
        </p>
      </div>
    </div>
  );
}
