/* Procedural Everest massif for the ascent. World units are kilometres: y is altitude, the
   summit sits at (0, 8.85, 0), the Khumbu valley runs south toward +z. Pure functions, so the
   same heightfield can place the route, the camps and the camera. */

// ---- 2D simplex noise (seeded) ---------------------------------------------------------------
const F2 = 0.5 * (Math.sqrt(3) - 1);
const G2 = (3 - Math.sqrt(3)) / 6;
const GRAD = [
  [1, 1],
  [-1, 1],
  [1, -1],
  [-1, -1],
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];

function makeNoise(seed: number) {
  const perm = new Uint8Array(512);
  const p = new Uint8Array(256);
  for (let i = 0; i < 256; i++) p[i] = i;
  let s = seed >>> 0;
  for (let i = 255; i > 0; i--) {
    s = (s * 1664525 + 1013904223) >>> 0;
    const j = s % (i + 1);
    [p[i], p[j]] = [p[j], p[i]];
  }
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255];
  return (x: number, y: number) => {
    const s2 = (x + y) * F2;
    const i = Math.floor(x + s2);
    const j = Math.floor(y + s2);
    const t = (i + j) * G2;
    const x0 = x - (i - t);
    const y0 = y - (j - t);
    const i1 = x0 > y0 ? 1 : 0;
    const j1 = x0 > y0 ? 0 : 1;
    const x1 = x0 - i1 + G2;
    const y1 = y0 - j1 + G2;
    const x2 = x0 - 1 + 2 * G2;
    const y2 = y0 - 1 + 2 * G2;
    const ii = i & 255;
    const jj = j & 255;
    let n = 0;
    const corner = (xx: number, yy: number, gi: number) => {
      const tt = 0.5 - xx * xx - yy * yy;
      if (tt < 0) return 0;
      const g = GRAD[gi % 8];
      return tt * tt * tt * tt * (g[0] * xx + g[1] * yy);
    };
    n += corner(x0, y0, perm[ii + perm[jj]]);
    n += corner(x1, y1, perm[ii + i1 + perm[jj + j1]]);
    n += corner(x2, y2, perm[ii + 1 + perm[jj + 1]]);
    return 70 * n; // ~ -1..1
  };
}

const noise = makeNoise(8848);
const noise2 = makeNoise(2953);

function ridged(x: number, z: number, oct = 5) {
  let f = 1;
  let a = 0.5;
  let sum = 0;
  let prev = 1;
  for (let o = 0; o < oct; o++) {
    let n = 1 - Math.abs(noise(x * f, z * f));
    n *= n;
    sum += n * a * prev;
    prev = n;
    f *= 2.03;
    a *= 0.5;
  }
  return sum; // ~0..1
}

function fbm(x: number, z: number, oct = 4) {
  let f = 1;
  let a = 0.5;
  let sum = 0;
  for (let o = 0; o < oct; o++) {
    sum += noise2(x * f, z * f) * a;
    f *= 2.1;
    a *= 0.5;
  }
  return sum;
}

const smooth = (a: number, b: number, v: number) => {
  const t = Math.min(1, Math.max(0, (v - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

// ---- the massif ------------------------------------------------------------------------------
type Peak = { x: number; z: number; h: number; r: number; sharp: number };
export const PEAKS: Peak[] = [
  { x: 0, z: 0, h: 8.85, r: 6.2, sharp: 1.25 }, // Sagarmatha
  { x: 2.3, z: 1.6, h: 8.5, r: 4.4, sharp: 1.3 }, // Lhotse
  { x: -2.4, z: 2.0, h: 7.85, r: 3.8, sharp: 1.35 }, // Nuptse
  { x: -5.2, z: -0.4, h: 7.15, r: 3.2, sharp: 1.5 }, // Pumori
  { x: 3.6, z: 9.8, h: 6.8, r: 2.2, sharp: 1.9 }, // Ama Dablam
  { x: 9.5, z: -3.5, h: 8.3, r: 5.2, sharp: 1.25 }, // Makalu, far right
  { x: -11, z: -6, h: 8.1, r: 6, sharp: 1.2 }, // Cho Oyu, far left
  { x: 7.5, z: 6.5, h: 6.4, r: 3, sharp: 1.5 },
  { x: -8.5, z: 8, h: 6.1, r: 3.4, sharp: 1.4 },
  { x: 6.5, z: 15, h: 5.6, r: 3.2, sharp: 1.4 },
  { x: -9, z: 16, h: 5.2, r: 3.6, sharp: 1.3 },
];

/* Route through the Khumbu, Kathmandu (off the edge of the world) to the summit. */
export const ROUTE_XZ: Array<[number, number]> = [
  [-4.2, 24.5], // Kathmandu (symbolic)
  [-3.0, 18.5], // Lukla
  [-2.1, 14.0], // Namche
  [-0.6, 10.6], // Tengboche
  [-2.2, 5.2], // Base Camp
  [-1.6, 4.0], // Icefall
  [-1.0, 3.3], // Camp I
  [-0.2, 2.6], // Camp II
  [0.9, 1.7], // Camp III (Lhotse face)
  [0.95, 0.85], // South Col
  [0.35, 0.28], // Hillary Step
  [0, 0], // Summit
];

/* Real altitudes, in metres, at each route point (HUD + trail constraint). */
export const ROUTE_ALT = [1400, 2860, 3440, 3867, 5364, 5500, 6065, 6400, 7200, 7950, 8790, 8848.86];

/* Nearest point on the route: distance, and the real altitude (km) there. */
function nearestOnRoute(x: number, z: number, upTo = ROUTE_XZ.length - 1) {
  let best = Infinity;
  let alt = 0;
  let seg = 0;
  for (let i = 0; i < upTo; i++) {
    const [ax, az] = ROUTE_XZ[i];
    const [bx, bz] = ROUTE_XZ[i + 1];
    const dx = bx - ax;
    const dz = bz - az;
    const t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz)));
    const d = Math.hypot(x - (ax + dx * t), z - (az + dz * t));
    if (d < best) {
      best = d;
      alt = (ROUTE_ALT[i] + (ROUTE_ALT[i + 1] - ROUTE_ALT[i]) * t) / 1000;
      seg = i + t;
    }
  }
  return { d: best, alt, seg };
}

export function height(x: number, z: number): number {
  // valley floor climbing north toward the massif
  const floor = 1.45 + 3.7 * smooth(26, 3, z);
  const valley = nearestOnRoute(x, z, 5);
  // flanks rise away from the valley line
  const flank = Math.min(2.8, valley.d * 0.6) * (0.55 + 0.45 * smooth(26, 8, z));
  let h = floor + flank + fbm(x * 0.16, z * 0.16) * 0.6;

  // peaks, as sharpened cones mixed with a diamond metric so faces read as facets
  for (const p of PEAKS) {
    const dx = x - p.x;
    const dz = z - p.z;
    const d = (Math.hypot(dx, dz) * 0.65 + (Math.abs(dx) + Math.abs(dz)) * 0.35 * 0.82) / p.r;
    if (d < 1) {
      const cone = p.h * Math.pow(1 - d, p.sharp);
      h = Math.max(h, cone + floor * 0.25 * (1 - d));
    }
  }

  // ridges: sharp detail on the flanks, fading out toward the tops so the big peaks stay clean
  const rid = ridged(x * 0.17 + 7.1, z * 0.17 - 3.3);
  const mid = smooth(2.5, 6.5, h) * (1 - smooth(7.2, 8.6, h));
  h += (rid - 0.45) * (0.35 + 0.75 * mid);

  // the trail: terrain relaxes toward the real altitude of the route, so every camp sits at its height
  const trail = nearestOnRoute(x, z);
  const sigma = trail.seg < 5 ? 1.1 : 0.55;
  const w = Math.exp(-(trail.d * trail.d) / (sigma * sigma)) * 0.9;
  h = h + (trail.alt - 0.03 - h) * w;

  // nothing above the summit
  const ds = Math.hypot(x, z);
  h = Math.min(h, 8.85 - ds * 0.02);
  if (ds < 0.6) h = Math.max(h, 8.85 - ds * 1.4);
  return h;
}
