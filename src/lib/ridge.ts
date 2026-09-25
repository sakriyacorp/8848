/* Deterministic randomness + ridgeline generation, shared by every hand-built mountain on the
   site (hero layers, footer horizon, 404 whiteout). Same seed → same mountains on server and
   client, so SVG paths hydrate cleanly. */

export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type RidgeOpts = {
  width: number;
  /** y of the ridge's average height (SVG space, 0 = top). */
  base: number;
  /** vertical amplitude of the big shapes. */
  amp: number;
  /** 0–1: how jagged the small detail is. */
  rough?: number;
  seed?: number;
  /** extra peaks: [x, height above base] — placed exactly, e.g. an Everest at the centre. */
  peaks?: Array<[number, number]>;
  /** subdivisions: 2^depth segments. */
  depth?: number;
};

/* Midpoint displacement, then carve in named peaks as sharp triangles so the silhouette reads
   as the angular, faceted peaks of the logo rather than rolling hills. */
export function ridgePoints({ width, base, amp, rough = 0.55, seed = 1, peaks = [], depth = 7 }: RidgeOpts): Array<[number, number]> {
  const r = rng(seed);
  const n = 2 ** depth;
  const ys = new Array(n + 1).fill(0);
  ys[0] = (r() - 0.5) * amp;
  ys[n] = (r() - 0.5) * amp;
  let step = n;
  let scale = amp;
  while (step > 1) {
    const half = step / 2;
    for (let i = half; i < n; i += step) {
      ys[i] = (ys[i - half] + ys[i + half]) / 2 + (r() - 0.5) * scale;
    }
    step = half;
    scale *= rough;
  }
  const pts: Array<[number, number]> = ys.map((y, i) => [(i / n) * width, base + y]);
  for (const [px, h] of peaks) {
    const spread = h * 1.15;
    for (const p of pts) {
      const d = Math.abs(p[0] - px);
      if (d < spread) {
        const lift = h * (1 - d / spread);
        p[1] = Math.min(p[1], base - lift + (r() - 0.5) * h * 0.06);
      }
    }
  }
  return pts;
}

export function ridgePath(opts: RidgeOpts & { height: number }): string {
  const pts = ridgePoints(opts);
  const d = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  return `${d} L${opts.width} ${opts.height} L0 ${opts.height} Z`;
}

/* Snow caps: the parts of the ridge above `line`, as a thin light edge path (no fill). */
export function ridgeEdge(opts: RidgeOpts): string {
  const pts = ridgePoints(opts);
  return pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
}

export function stars(count: number, seed: number, w: number, h: number) {
  const r = rng(seed);
  return Array.from({ length: count }, () => ({
    x: r() * w,
    y: Math.pow(r(), 1.6) * h,
    r: 0.4 + Math.pow(r(), 3) * 1.6,
    o: 0.35 + r() * 0.65,
    d: r() * 6,
  }));
}
