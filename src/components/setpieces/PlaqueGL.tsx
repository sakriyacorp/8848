"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { subscribeTilt } from "@/lib/tilt";
import { ARC, PEAKS_D, NUMERAL_GLYPHS, TAGLINE_D } from "@/components/brand/logo-paths";
import { ARC_PATH } from "@/components/brand/Logo";

/* The plaque face in three.js: brushed brass lit per pixel. The logo is engraved through a
   height map (drawn from the same vector paths as the SVG logo, blurred through the mip chain
   for the bevels), the grooves are filled with dark chocolate lacquer like the real plaque, and
   the lamp — your cursor, or the phone's tilt — rakes an anisotropic highlight across the
   brushing and catches the engraved edges. It sits on top of the CSS plaque, which stays
   underneath as the fallback and takes over (cross-fade) as the camera pushes through the arc,
   so the zoom stays razor sharp. The numerals sink with the hero via window.__plaque. */

type HeroLink = { __plaque?: { nf: number; zoom: number } };

const VIEW = { x: 70, y: 36, w: 1780, h: 1634 };
const SIZE = 1024;
const ASPECT = 1.04; // face height / width

function buildMask(): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = c.height = SIZE;
  const g = c.getContext("2d")!;
  g.fillStyle = "#000";
  g.fillRect(0, 0, SIZE, SIZE);
  // face pixel space is SIZE × SIZE*ASPECT, squeezed into the square texture
  const W = SIZE;
  const H = SIZE * ASPECT;
  const bx = 0.09 * W;
  const by = 0.09 * H;
  const bw = 0.82 * W;
  const bh = 0.8 * H;
  const s = Math.min(bw / VIEW.w, bh / VIEW.h);
  const ox = bx + (bw - VIEW.w * s) / 2 - VIEW.x * s;
  const oy = by + (bh - VIEW.h * s) / 2 - VIEW.y * s;
  g.setTransform(s, 0, 0, s / ASPECT, ox, oy / ASPECT);
  // R: the mark (arc + peaks)
  g.fillStyle = g.strokeStyle = "rgb(255,0,0)";
  g.lineWidth = 23;
  g.stroke(new Path2D(ARC_PATH));
  g.save();
  g.beginPath();
  g.rect(0, 0, 1916, 1006);
  g.clip();
  g.fill(new Path2D(PEAKS_D), "evenodd");
  g.restore();
  // G: numerals + tagline (these sink away in the hero)
  g.globalCompositeOperation = "lighter";
  g.fillStyle = "rgb(0,255,0)";
  NUMERAL_GLYPHS.forEach((d) => g.fill(new Path2D(d), "evenodd"));
  g.fill(new Path2D(TAGLINE_D), "evenodd");
  void ARC;
  return c;
}

const vert = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

const frag = /* glsl */ `
precision highp float;
uniform sampler2D uMask;
uniform vec2 uRes;
uniform vec3 uLight;
uniform float uNum;
uniform float uTime;
uniform float uSweep;
varying vec2 vUv;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
}
float engr(vec2 uv, float lod) {
  vec4 m = texture2D(uMask, uv, lod);
  return clamp(m.r + m.g * uNum, 0.0, 1.0);
}

void main() {
  vec2 uv = vUv;
  float px = 1.0 / uRes.x;

  // engraving: crisp for colour, blurred (mip bias) for the bevelled walls
  float inside = smoothstep(0.3, 0.7, engr(uv, 0.0));
  float d = 1.6 * px;
  float lod = 1.4;
  float ex = engr(uv + vec2(d, 0.0), lod) - engr(uv - vec2(d, 0.0), lod);
  float ey = engr(uv + vec2(0.0, d), lod) - engr(uv - vec2(0.0, d), lod);
  vec3 N = normalize(vec3(ex * 1.6, ey * 1.6, 1.0));

  // brushing: fine horizontal grooves in both the normal and the albedo
  float b1 = noise(vec2(uv.x * 5.0, uv.y * 950.0));
  float b2 = noise(vec2(uv.x * 2.0 + 7.0, uv.y * 240.0));
  N.y += (b1 - 0.5) * 0.06 * (1.0 - inside);
  // the plate's own rounded edge
  vec2 q = uv - 0.5;
  vec2 a = abs(q);
  float bw = 0.014;
  float rx = 1.0 - smoothstep(0.0, bw, 0.5 - a.x);
  float ry = 1.0 - smoothstep(0.0, bw * 0.96, 0.5 - a.y);
  N.xy += vec2(sign(q.x) * rx, sign(q.y) * ry) * 1.1;
  N = normalize(N);

  vec3 P = vec3(uv, 0.0);
  vec3 L = normalize(uLight - P);
  vec3 L2 = normalize(vec3(-0.2, 1.2, 0.9) - P);
  vec3 V = normalize(vec3(0.5, 0.5, 2.4) - P);
  vec3 Hh = normalize(L + V);
  float ndl = max(dot(N, L), 0.0);
  float ndl2 = max(dot(N, L2), 0.0);

  // anisotropic (Ward-ish) highlight: grooves run along x, so it stretches along y
  float ht = dot(Hh, vec3(1.0, 0.0, 0.0));
  float hb = dot(Hh, vec3(0.0, 1.0, 0.0));
  float ax = 0.1, ay = 0.5;
  float spec = exp(-((ht * ht) / (ax * ax) + (hb * hb) / (ay * ay))) * ndl;
  float specTight = pow(max(dot(N, Hh), 0.0), 90.0);

  vec3 brass = vec3(0.714, 0.620, 0.439);
  vec3 brassDeep = vec3(0.56, 0.46, 0.30);
  vec3 lamp = vec3(1.0, 0.94, 0.80);
  vec3 alb = mix(brassDeep, brass, 0.55 + 0.45 * b2) * (0.93 + 0.1 * b1);
  // gentle falloff away from the lamp, like the photo
  float fall = 1.0 - 0.35 * smoothstep(0.1, 0.9, distance(uv, uLight.xy));

  vec3 metal = alb * (0.3 + 0.62 * ndl + 0.12 * ndl2) * fall + lamp * (spec * 0.62 + specTight * 0.3);
  // lacquer in the grooves: dark chocolate, a little gloss
  vec3 choc = vec3(0.20, 0.125, 0.075);
  vec3 lac = choc * (0.55 + 0.5 * ndl) + lamp * (specTight * 0.22 + spec * 0.06);
  vec3 col = mix(metal, lac, inside);

  // one slow sheen sweep on arrival
  float s = exp(-pow((uv.x + (1.0 - uv.y) * 0.35 - uSweep) * 5.0, 2.0));
  col += lamp * s * 0.28 * (1.0 - inside * 0.8);

  gl_FragColor = vec4(col, 1.0);
}
`;

export default function PlaqueGL() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const face = canvas?.parentElement;
    if (!canvas || !face) return;
    const phone = matchMedia("(max-width: 767px)").matches;

    let renderer: THREE.WebGLRenderer;
    // (no THREE.Color anywhere here, so colour management is left alone for the other scenes)
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: "low-power" });
    } catch {
      return;
    }
    renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, phone ? 1.5 : 2));

    const tex = new THREE.CanvasTexture(buildMask());
    tex.generateMipmaps = true;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.anisotropy = 4;

    const uniforms = {
      uMask: { value: tex },
      uRes: { value: new THREE.Vector2(1, 1) },
      uLight: { value: new THREE.Vector3(0.62, 0.72, 0.8) },
      uNum: { value: 1 },
      uTime: { value: 0 },
      uSweep: { value: -1 },
    };
    const mat = new THREE.ShaderMaterial({ vertexShader: vert, fragmentShader: frag, uniforms, depthTest: false, depthWrite: false });
    const geo = new THREE.PlaneGeometry(2, 2);
    const scene = new THREE.Scene();
    scene.add(new THREE.Mesh(geo, mat));
    const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const size = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      renderer.setSize(w, h, false);
      uniforms.uRes.value.set(w * renderer.getPixelRatio(), h * renderer.getPixelRatio());
    };
    const ro = new ResizeObserver(size);
    ro.observe(canvas);
    size();

    // the lamp: cursor / tilt, drifting by itself when nobody's steering
    const target = { x: 0.2, y: -0.25 };
    let lastInput = -1e9;
    const unsub = subscribeTilt((x, y) => {
      target.x = x;
      target.y = y;
      lastInput = performance.now();
    });
    const light = { x: 0.2, y: -0.25 };

    let raf = 0;
    let visible = true;
    let ready = false;
    const t0 = performance.now();
    const frame = (now: number) => {
      raf = 0;
      if (!visible) return;
      const t = (now - t0) / 1000;
      if (now - lastInput > 2500) {
        target.x = Math.sin(t * 0.35) * 0.55;
        target.y = -0.2 + Math.sin(t * 0.23 + 1) * 0.35;
      }
      light.x += (target.x - light.x) * 0.08;
      light.y += (target.y - light.y) * 0.08;
      uniforms.uLight.value.set(0.5 + light.x * 0.62, 0.6 - light.y * 0.5, 0.85);
      uniforms.uTime.value = t;
      uniforms.uSweep.value = -0.6 + Math.max(0, t - 0.5) * 1.2;

      const hero = (window as unknown as HeroLink).__plaque;
      const nf = hero?.nf ?? 0;
      const zoom = hero?.zoom ?? 1;
      uniforms.uNum.value = 1 - nf;
      // hand back to the vector plaque as the push-through begins
      const gl = 1 - Math.min(1, Math.max(0, (zoom - 1.02) / 0.3));
      face.style.setProperty("--gl", ready ? gl.toFixed(3) : "0");

      if (gl > 0.001) renderer.render(scene, cam);
      if (!ready) {
        ready = true;
        face.classList.add("gl-on");
      }
      raf = requestAnimationFrame(frame);
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !raf) raf = requestAnimationFrame(frame);
    });
    io.observe(face);
    raf = requestAnimationFrame(frame);

    const lost = (e: Event) => {
      e.preventDefault();
      face.classList.remove("gl-on");
      face.style.setProperty("--gl", "0");
      cancelAnimationFrame(raf);
      visible = false;
    };
    canvas.addEventListener("webglcontextlost", lost);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      unsub();
      canvas.removeEventListener("webglcontextlost", lost);
      face.classList.remove("gl-on");
      face.style.removeProperty("--gl");
      tex.dispose();
      mat.dispose();
      geo.dispose();
      renderer.dispose();
      // actually hand the context back: only one WebGL scene should be alive at a time
      renderer.forceContextLoss();
    };
  }, []);

  return <canvas ref={ref} aria-hidden="true" className="plaque-gl" />;
}
