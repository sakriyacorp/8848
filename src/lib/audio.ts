/* A tiny synthesiser for the site's optional sound (off by default). Everything is generated —
   no audio files. The context is created lazily on the first user gesture that turns sound on.

   bowl()   a struck singing bowl: inharmonic partials, each a slightly detuned pair so it beats
   hum()    a rubbed rim: the same partials held, level follows how fast you circle
   wind()   filtered brown noise with a slow gust LFO, very quiet */

type Ctx = AudioContext;
let ctx: Ctx | null = null;
let master: GainNode | null = null;
let windNodes: { src: AudioBufferSourceNode; gain: GainNode; lfo: OscillatorNode } | null = null;

const PARTIALS: [number, number][] = [
  [1, 1],
  [2.76, 0.46],
  [5.4, 0.2],
  [8.93, 0.09],
];

export function audio(): Ctx | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.55;
    master.connect(ctx.destination);
  }
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  return ctx;
}

export function suspend() {
  stopWind();
  ctx?.suspend().catch(() => {});
}

export function bowl({ freq = 196, gain = 0.2, dur = 7, pan = 0 }: { freq?: number; gain?: number; dur?: number; pan?: number } = {}) {
  const c = audio();
  if (!c || !master) return;
  const t = c.currentTime;
  const out = c.createGain();
  out.gain.value = gain;
  const p = c.createStereoPanner();
  p.pan.value = Math.max(-1, Math.min(1, pan));
  out.connect(p).connect(master);
  PARTIALS.forEach(([r, a], i) => {
    for (const det of [-0.55, 0.55]) {
      const o = c.createOscillator();
      o.type = "sine";
      o.frequency.value = freq * r + det * (i + 1);
      const g = c.createGain();
      const d = dur / (1 + i * 0.9);
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(a * 0.5, t + 0.008 + i * 0.002);
      g.gain.exponentialRampToValueAtTime(0.0001, t + d);
      o.connect(g).connect(out);
      o.start(t);
      o.stop(t + d + 0.05);
    }
  });
  setTimeout(() => out.disconnect(), dur * 1000 + 400);
}

export function hum(freq = 174) {
  const c = audio();
  if (!c || !master) return null;
  const out = c.createGain();
  out.gain.value = 0;
  out.connect(master);
  const oscs = PARTIALS.slice(0, 3).flatMap(([r, a], i) =>
    [-0.4, 0.4].map((det) => {
      const o = c.createOscillator();
      o.type = "sine";
      o.frequency.value = freq * r + det * (i + 1);
      const g = c.createGain();
      g.gain.value = a * 0.35;
      o.connect(g).connect(out);
      o.start();
      return o;
    }),
  );
  return {
    set(level: number) {
      out.gain.setTargetAtTime(Math.max(0, Math.min(1, level)) * 0.5, c.currentTime, 0.12);
    },
    stop() {
      out.gain.setTargetAtTime(0, c.currentTime, 0.4);
      setTimeout(() => {
        oscs.forEach((o) => o.stop());
        out.disconnect();
      }, 2200);
    },
  };
}

export function startWind(level = 0.035) {
  const c = audio();
  if (!c || !master || windNodes) return;
  const len = c.sampleRate * 4;
  const buf = c.createBuffer(1, len, c.sampleRate);
  const d = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < len; i++) {
    const white = Math.random() * 2 - 1;
    last = (last + 0.02 * white) / 1.02;
    d[i] = last * 3.2;
  }
  const src = c.createBufferSource();
  src.buffer = buf;
  src.loop = true;
  const bp = c.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = 420;
  bp.Q.value = 0.7;
  const gain = c.createGain();
  gain.gain.value = 0;
  gain.gain.setTargetAtTime(level, c.currentTime, 1.5);
  const lfo = c.createOscillator();
  lfo.frequency.value = 0.07;
  const lfoGain = c.createGain();
  lfoGain.gain.value = 180;
  lfo.connect(lfoGain).connect(bp.frequency);
  src.connect(bp).connect(gain).connect(master);
  src.start();
  lfo.start();
  windNodes = { src, gain, lfo };
}

export function stopWind() {
  if (!ctx || !windNodes) return;
  const w = windNodes;
  windNodes = null;
  w.gain.gain.setTargetAtTime(0, ctx.currentTime, 0.4);
  setTimeout(() => {
    w.src.stop();
    w.lfo.stop();
    w.gain.disconnect();
  }, 1800);
}

/* A pentatonic set of bowl pitches so random taps always sound consonant. */
export const BOWL_NOTES = [174.6, 196, 220, 261.6, 293.7, 349.2];

/* ---------- small effects ---------- */

let noiseBuf: AudioBuffer | null = null;
function noise(c: AudioContext) {
  if (noiseBuf) return noiseBuf;
  const len = c.sampleRate * 2;
  noiseBuf = c.createBuffer(1, len, c.sampleRate);
  const d = noiseBuf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  return noiseBuf;
}

/** Wind level while climbing (0–1). Only acts if the wind bed is running. */
export function setWind(level: number) {
  if (!ctx || !windNodes) return;
  windNodes.gain.gain.setTargetAtTime(0.02 + Math.max(0, Math.min(1, level)) * 0.11, ctx.currentTime, 0.6);
}

/** Air moving past: a band-passed noise sweep (the globe's flight). */
export function whoosh(dur = 1.6, gain = 0.12) {
  const c = audio();
  if (!c || !master) return;
  const t = c.currentTime;
  const src = c.createBufferSource();
  src.buffer = noise(c);
  const bp = c.createBiquadFilter();
  bp.type = "bandpass";
  bp.Q.value = 1.2;
  bp.frequency.setValueAtTime(260, t);
  bp.frequency.exponentialRampToValueAtTime(1800, t + dur * 0.55);
  bp.frequency.exponentialRampToValueAtTime(500, t + dur);
  const g = c.createGain();
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(gain, t + dur * 0.45);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(bp).connect(g).connect(master);
  src.start(t);
  src.stop(t + dur + 0.05);
}

/** A rubber stamp landing on paper: low thump + papery click. */
export function stamp() {
  const c = audio();
  if (!c || !master) return;
  const t = c.currentTime;
  const o = c.createOscillator();
  o.type = "sine";
  o.frequency.setValueAtTime(140, t);
  o.frequency.exponentialRampToValueAtTime(55, t + 0.12);
  const g = c.createGain();
  g.gain.setValueAtTime(0.35, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
  o.connect(g).connect(master);
  o.start(t);
  o.stop(t + 0.25);
  const n = c.createBufferSource();
  n.buffer = noise(c);
  const hp = c.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = 1800;
  const ng = c.createGain();
  ng.gain.setValueAtTime(0.12, t);
  ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);
  n.connect(hp).connect(ng).connect(master);
  n.start(t);
  n.stop(t + 0.08);
}

/** A detent: a small brass click (dials, camps). */
export function tick(pitch = 1) {
  const c = audio();
  if (!c || !master) return;
  const t = c.currentTime;
  const o = c.createOscillator();
  o.type = "triangle";
  o.frequency.value = 1900 * pitch;
  const g = c.createGain();
  g.gain.setValueAtTime(0.07, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.045);
  o.connect(g).connect(master);
  o.start(t);
  o.stop(t + 0.06);
}

/** Something soft going into the pack: a muted two-note pluck. */
export function pluck() {
  const c = audio();
  if (!c || !master) return;
  const t = c.currentTime;
  [392, 587.3].forEach((f, i) => {
    const o = c.createOscillator();
    o.type = "sine";
    o.frequency.value = f;
    const g = c.createGain();
    const s = t + i * 0.07;
    g.gain.setValueAtTime(0, s);
    g.gain.linearRampToValueAtTime(0.08, s + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, s + 0.35);
    o.connect(g).connect(master!);
    o.start(s);
    o.stop(s + 0.4);
  });
}
