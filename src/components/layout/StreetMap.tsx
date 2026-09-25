import { cn } from "@/lib/cn";

/* A stylised map of the blocks around 258 Reservoir St, engraved in brass on walnut. Not to
   scale; it's a way-finding sketch, and the "Get directions" link does the real work. */
export function StreetMap({ className, animate = true }: { className?: string; animate?: boolean }) {
  return (
    <svg viewBox="0 0 400 260" className={cn("street-map", animate && "street-map-anim", className)} role="img" aria-label="Map: 8848 is on Reservoir Street, east of Main Street in downtown Harrisonburg">
      <defs>
        <radialGradient id="sm-glow" cx="0.62" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#eed3a5" stopOpacity="0.28" />
          <stop offset="1" stopColor="#eed3a5" stopOpacity="0" />
        </radialGradient>
        <pattern id="sm-contour" width="400" height="260" patternUnits="userSpaceOnUse">
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <path
              key={i}
              d={`M-20 ${40 + i * 34} C 80 ${20 + i * 34}, 140 ${70 + i * 30}, 230 ${44 + i * 32} S 380 ${60 + i * 30}, 430 ${36 + i * 34}`}
              fill="none"
              stroke="#b69e70"
              strokeOpacity="0.08"
            />
          ))}
        </pattern>
      </defs>
      <rect width="400" height="260" fill="url(#sm-contour)" />
      <rect width="400" height="260" fill="url(#sm-glow)" />

      {/* minor grid */}
      <g stroke="#b69e70" strokeOpacity="0.16" strokeWidth="1" className="sm-minor">
        <path d="M60 0v260M110 0v260M300 0v260M350 0v260" />
        <path d="M0 50h400M0 110h400M0 200h400" />
      </g>

      {/* Main St (N–S) */}
      <path className="sm-road" d="M160 -10 L 172 270" stroke="#dcbf7b" strokeOpacity="0.55" strokeWidth="3" fill="none" pathLength={1} />
      {/* Market St (E–W) */}
      <path className="sm-road" d="M-10 92 L 410 80" stroke="#dcbf7b" strokeOpacity="0.4" strokeWidth="2" fill="none" pathLength={1} />
      {/* Reservoir St, heading east-southeast */}
      <path className="sm-road sm-main" d="M168 126 C 220 132, 262 146, 300 160 S 370 188, 410 200" stroke="#f2e9cf" strokeWidth="4" fill="none" strokeLinecap="round" pathLength={1} />
      {/* University Blvd, suggestion */}
      <path className="sm-road" d="M290 270 C 300 220, 330 190, 410 150" stroke="#dcbf7b" strokeOpacity="0.3" strokeWidth="2" fill="none" pathLength={1} />

      <g fontFamily="var(--font-caps)" fontSize="9" letterSpacing="2" fill="#b7a68a">
        <text x="178" y="24">MAIN ST</text>
        <text x="20" y="84">MARKET ST</text>
        <text x="300" y="148" transform="rotate(17 300 148)" fill="#f2e9cf">RESERVOIR ST</text>
        <text x="40" y="236" fontSize="8">DOWNTOWN</text>
        <text x="304" y="246" fontSize="8">JMU · EAST</text>
      </g>

      {/* the pin */}
      <g className="sm-pin" transform="translate(236 139)">
        <circle r="22" fill="#eed3a5" opacity="0.12" className="sm-pulse" />
        <circle r="12" fill="#eed3a5" opacity="0.18" className="sm-pulse" style={{ animationDelay: "0.8s" }} />
        <path d="M0 6 C -9 -4 -10 -8 -10 -12 A 10 10 0 0 1 10 -12 C 10 -8 9 -4 0 6Z" fill="#dcbf7b" stroke="#3b2517" strokeWidth="1.2" transform="translate(0 -6)" />
        <path d="M-4.2 -16.5 L0 -23 L4.2 -16.5Z" fill="#3b2517" />
      </g>
      <text x="252" y="120" fontFamily="var(--font-display)" fontSize="17" fill="#f2e9cf">
        8848
      </text>
      <text x="252" y="131" fontFamily="var(--font-caps)" fontSize="6.5" letterSpacing="1.6" fill="#b69e70">
        258 RESERVOIR ST
      </text>

      {/* compass rose */}
      <g transform="translate(366 36)" stroke="#b69e70" strokeOpacity="0.7" fill="none">
        <circle r="14" />
        <path d="M0 -18 L3 0 L0 18 L-3 0Z" fill="#b69e70" fillOpacity="0.35" />
        <text y="-21" textAnchor="middle" fontSize="8" fill="#b69e70" stroke="none" fontFamily="var(--font-caps)">
          N
        </text>
      </g>
    </svg>
  );
}
