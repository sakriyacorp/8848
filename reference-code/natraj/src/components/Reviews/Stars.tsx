import { Star } from "lucide-react";
import { cn } from "@/lib/cn";

type Props = { rating: number; size?: number; className?: string };

export function Stars({ rating, size = 14, className }: Props) {
  const label = `${rating} out of 5 stars`;
  return (
    <span role="img" aria-label={label} className={cn("inline-flex items-center gap-0.5", className)}>
      {Array.from({ length: 5 }, (_, i) => {
        const pct = Math.max(0, Math.min(1, rating - i)) * 100;
        return (
          <span key={i} className="relative inline-block" style={{ width: size, height: size }}>
            <Star size={size} strokeWidth={1.5} className="absolute inset-0 text-cream/25" aria-hidden="true" />
            <span className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: `${pct}%` }} aria-hidden="true">
              <Star size={size} strokeWidth={1.5} className="fill-gold text-gold" />
            </span>
          </span>
        );
      })}
    </span>
  );
}
