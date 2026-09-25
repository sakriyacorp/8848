import { cn } from "@/lib/cn";
import type { Testimonial } from "@/data/testimonials";

const STAMP_TONES = [
  { bg: "#5b3825", fg: "#e9d7ae" },
  { bg: "#8f7447", fg: "#fbf3de" },
  { bg: "#4b3630", fg: "#dcbf7b" },
  { bg: "#2a1b12", fg: "#dcbf7b" },
];

/* A postcard from the trail: lokta paper, a perforated stamp with a peak, a round postmark
   cancelled across it, foil stars, the guest and the dish they wrote home about. */
export function Postcard({ t, index, dup }: { t: Testimonial; index: number; dup?: boolean }) {
  const tone = STAMP_TONES[index % STAMP_TONES.length];
  const tilt = ((index * 37) % 7) - 3; // −3…3 degrees, deterministic
  const initials = t.name
    .replace(/&.*$/, "")
    .split(/\s+/)
    .filter((w) => /^[A-Z]/.test(w))
    .map((w) => w[0])
    .join("")
    .slice(0, 2);

  return (
    <figure
      aria-hidden={dup || undefined}
      data-card
      className="postcard paper relative w-[300px] shrink-0 select-none rounded-[6px] p-5 pr-[92px] sm:w-[360px] sm:p-6 sm:pr-[104px]"
      style={{ ["--tilt" as string]: `${tilt * 0.35}deg` }}
    >
      {/* stamp */}
      <div className="postcard-stamp absolute right-4 top-4 h-[76px] w-[62px] sm:right-5 sm:top-5 sm:h-[84px] sm:w-[68px]" style={{ background: tone.bg }} aria-hidden="true">
        <svg viewBox="0 0 68 84" className="h-full w-full">
          <path d="M8 62 L26 36 L32 44 L40 30 L60 62Z" fill={tone.fg} opacity=".9" />
          <path d="M40 30 L44 37 L41 36 L38 40 L36 36Z" fill="#fffaf0" />
          <circle cx="50" cy="18" r="6" fill={tone.fg} opacity=".55" />
          <text x="34" y="76" textAnchor="middle" fontFamily="var(--font-display)" fontSize="11" fontWeight="600" fill={tone.fg}>
            8848
          </text>
        </svg>
      </div>
      {/* postmark */}
      <div className="postcard-mark pointer-events-none absolute right-[22px] top-[62px] h-[70px] w-[70px] sm:right-[28px] sm:top-[68px]" aria-hidden="true" style={{ rotate: `${-10 + (index % 5) * 6}deg` }}>
        <svg viewBox="0 0 80 80" className="h-full w-full">
          <defs>
            <path id={`pm-${t.id}${dup ? "-d" : ""}`} d="M 12 40 A 28 28 0 1 1 68 40" />
          </defs>
          <circle cx="40" cy="40" r="34" fill="none" stroke="#5b3825" strokeWidth="1.6" opacity=".55" />
          <circle cx="40" cy="40" r="24" fill="none" stroke="#5b3825" strokeWidth="1" opacity=".45" />
          <text fontFamily="var(--font-caps)" fontSize="7.5" letterSpacing="1.5" fill="#5b3825" opacity=".7">
            <textPath href={`#pm-${t.id}${dup ? "-d" : ""}`} startOffset="50%" textAnchor="middle">
              {t.postmark.toUpperCase()}
            </textPath>
          </text>
          <text x="40" y="44" textAnchor="middle" fontFamily="var(--font-caps)" fontSize="8" fill="#5b3825" opacity=".7">
            8848
          </text>
          <path d="M-30 58 q 10 -6 20 0 t 20 0 t 20 0 t 20 0 t 20 0" fill="none" stroke="#5b3825" strokeWidth="1.2" opacity=".35" />
          <path d="M-30 66 q 10 -6 20 0 t 20 0 t 20 0 t 20 0 t 20 0" fill="none" stroke="#5b3825" strokeWidth="1.2" opacity=".35" />
        </svg>
      </div>

      <Stars rating={t.rating} />
      <blockquote className="mt-3 font-display text-[18.5px] leading-[1.32] text-choc italic sm:text-[20px]">&ldquo;{t.quote}&rdquo;</blockquote>
      <figcaption className="mt-4 flex items-center gap-3 pr-0">
        {t.photo ? (
          <img src={t.photo} alt="" width={40} height={40} loading="lazy" decoding="async" className="h-10 w-10 shrink-0 rounded-full border border-ink-line object-cover [filter:sepia(.18)_saturate(.9)]" />
        ) : (
          <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#c9a764,#8e6f3e)] font-display text-[15px] font-semibold text-paper shadow-[inset_0_1px_0_rgba(255,250,232,.6)]">
            {initials}
          </span>
        )}
        <span className="min-w-0 leading-tight">
          <span className="block truncate text-[14px] font-semibold text-choc">{t.name}</span>
          <span className="block truncate text-[12px] text-bronze">{t.context}</span>
        </span>
      </figcaption>
      <p className="mt-3 border-t border-dashed border-ink-line pt-2.5 text-[11.5px] text-bronze">
        <span className="caps text-[8.5px]">Wrote home about</span> <span className="font-medium text-choc">{t.dish}</span>
      </p>
    </figure>
  );
}

export function Stars({ rating, className, size = 15 }: { rating: number; className?: string; size?: number }) {
  return (
    <span role="img" aria-label={`${rating} out of 5 stars`} className={cn("inline-flex items-center gap-[3px]", className)}>
      {Array.from({ length: 5 }, (_, i) => {
        const pct = Math.max(0, Math.min(1, rating - i)) * 100;
        return (
          <span key={i} className="relative inline-block" style={{ width: size, height: size }}>
            <svg viewBox="0 0 24 24" className="absolute inset-0 h-full w-full" aria-hidden="true">
              <path d="M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.3L12 17.1l-5.7 3.1 1.2-6.3-4.7-4.4 6.4-.8Z" fill="none" stroke="#b08a4a" strokeWidth="1.3" />
            </svg>
            <span className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: `${pct}%` }}>
              <svg viewBox="0 0 24 24" style={{ width: size, height: size }} aria-hidden="true">
                <defs>
                  <linearGradient id="star-foil" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#f6e7b8" />
                    <stop offset=".5" stopColor="#c9a764" />
                    <stop offset="1" stopColor="#8e6f3e" />
                  </linearGradient>
                </defs>
                <path d="M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.3L12 17.1l-5.7 3.1 1.2-6.3-4.7-4.4 6.4-.8Z" fill="url(#star-foil)" />
              </svg>
            </span>
          </span>
        );
      })}
    </span>
  );
}
