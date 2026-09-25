import { cn } from "@/lib/cn";
import type { Aggregate } from "@/lib/reviews";
import { Stars } from "@/components/Reviews/Stars";

export function RatingBadge({ aggregate, className }: { aggregate: Aggregate; className?: string }) {
  const rating = aggregate.rating.toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const count = aggregate.count.toLocaleString("en-US");
  return (
    <div className={cn("flex items-center gap-4", className)}>
      <span className="display text-[48px] leading-none text-cream">{rating}</span>
      <div>
        <Stars rating={aggregate.rating} size={18} />
        <p className="mt-1.5 text-[14px] text-cream-2">
          <a href={aggregate.url} target="_blank" rel="noopener noreferrer" className="hover:text-cream">
            {count} {aggregate.source} reviews
          </a>
        </p>
      </div>
    </div>
  );
}
