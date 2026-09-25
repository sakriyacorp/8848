import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { featured, getReviews } from "@/lib/reviews";
import { Reveal } from "@/components/Reveal";
import { RatingBadge } from "@/components/Reviews/RatingBadge";
import { ReviewWall } from "@/components/Reviews/ReviewWall";

export async function ReviewsSection() {
  const { aggregate, reviews } = await getReviews();
  return (
    <section
      id="reviews"
      aria-labelledby="reviews-title"
      className="scroll-mt-16 px-5 pb-20 [content-visibility:auto] [contain-intrinsic-size:auto_1100px] md:px-8 md:pb-28"
    >
      {/* The handoff from the menu: a single hairline drops from the last dish to a red point, then the reviews rise in. */}
      <div aria-hidden="true" className="bridge" />

      <div className="mx-auto max-w-[1280px]">
        <Reveal className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 id="reviews-title" className="display text-[36px] text-cream md:text-[48px]">
              What people say.
            </h2>
            <RatingBadge aggregate={aggregate} className="mt-6" />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <a href={aggregate.writeReviewUrl} target="_blank" rel="noopener noreferrer" className="btn-ghost px-5 py-2.5 text-[14px]">
              Leave a review
            </a>
            <Link
              href="/reviews"
              className="flex items-center gap-1.5 rounded-full px-3 py-2.5 text-[14px] font-medium text-cream-2 transition-colors duration-150 hover:text-cream"
            >
              All reviews
              <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>
        </Reveal>

        <Reveal delay={0.12}>
          <ReviewWall reviews={featured(reviews)} />
        </Reveal>

        <p className="mt-6 text-[13px] text-cream-2/80">
          Reviews are shown word for word.{" "}
          <a href={aggregate.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-cream">
            Read all {aggregate.count.toLocaleString("en-US")} on Google
          </a>
          .
        </p>
      </div>
    </section>
  );
}
