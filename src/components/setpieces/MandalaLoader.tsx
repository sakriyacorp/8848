import { cn } from "@/lib/cn";

/* A brass mandala / compass rose that turns while a heavy scene loads. */
export function MandalaLoader({ label = "Loading the mountain", className }: { label?: string; className?: string }) {
  return (
    <div className={cn("mandala-loader flex flex-col items-center justify-center gap-4", className)} role="status" aria-live="polite">
      <svg viewBox="0 0 120 120" className="h-24 w-24" aria-hidden="true">
        <defs>
          <linearGradient id="ml-brass" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#f6ecd0" />
            <stop offset=".5" stopColor="#b69e70" />
            <stop offset="1" stopColor="#7d623a" />
          </linearGradient>
        </defs>
        <circle cx="60" cy="60" r="56" fill="none" stroke="url(#ml-brass)" strokeWidth="1.5" />
        <circle cx="60" cy="60" r="50" fill="none" stroke="#b69e70" strokeOpacity=".4" strokeDasharray="2 5" />
        {Array.from({ length: 8 }, (_, i) => (
          <path key={i} d="M60 8 L66 44 L60 52 L54 44Z" fill="url(#ml-brass)" opacity={i % 2 ? 0.5 : 0.95} transform={`rotate(${i * 45} 60 60)`} />
        ))}
        <g className="ml-inner">
          {Array.from({ length: 12 }, (_, i) => (
            <circle key={i} cx="60" cy="30" r="3" fill="none" stroke="#dcbf7b" transform={`rotate(${i * 30} 60 60)`} />
          ))}
          <circle cx="60" cy="60" r="16" fill="none" stroke="#dcbf7b" strokeWidth="1.2" />
        </g>
        <circle cx="60" cy="60" r="5" fill="url(#ml-brass)" />
      </svg>
      <p className="caps text-[10px] text-brass/80">{label}</p>
    </div>
  );
}
