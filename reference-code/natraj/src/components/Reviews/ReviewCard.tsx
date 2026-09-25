import { cn } from "@/lib/cn";
import type { Review } from "@/lib/reviews";
import { Stars } from "@/components/Reviews/Stars";
import { Avatar } from "@/components/Reviews/Avatar";

type Props = { review: Review; dup?: boolean; linkAuthor?: boolean; className?: string };

export function ReviewCard({ review, dup, linkAuthor, className }: Props) {
  const meta = [review.relativeTime, review.source === "google" ? "on Google" : undefined].filter(Boolean).join(" · ");
  return (
    <figure aria-hidden={dup || undefined} className={cn("review-card glass rounded-3xl p-6", className)}>
      <Stars rating={review.rating} />
      <blockquote className="mt-3 whitespace-pre-line text-[15px] leading-[1.65] text-cream">{review.text}</blockquote>
      <figcaption className="mt-4 flex items-center gap-3">
        <Avatar image={review.photo} name={review.name} />
        <span className="flex min-w-0 flex-col leading-tight">
          {linkAuthor && review.authorUrl ? (
            <a
              href={review.authorUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block truncate py-1.5 text-[13.5px] font-semibold text-cream hover:text-gold"
            >
              {review.name}
            </a>
          ) : (
            <span className="truncate text-[13.5px] font-semibold text-cream">{review.name}</span>
          )}
          {meta && (
            <span className="text-[12px] text-cream-2">
              {linkAuthor && review.url ? (
                <a href={review.url} target="_blank" rel="noopener noreferrer" className="inline-block py-1.5 hover:text-cream">
                  {meta}
                </a>
              ) : (
                meta
              )}
            </span>
          )}
        </span>
      </figcaption>
    </figure>
  );
}
