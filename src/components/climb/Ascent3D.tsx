"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { trackSection } from "@/lib/section-track";
import { ArrowRight, Plus } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/format";
import { WAYPOINTS } from "@/data/climb";
import { addToPack } from "@/lib/add-to-pack";
import { getDishImage } from "@/lib/dish-path";
import { DishImage } from "@/components/menu/DishImage";
import { Logo } from "@/components/brand/Logo";
import type { ClimbDish } from "@/components/climb/ClimbStatic";
import { height, ROUTE_ALT, ROUTE_XZ } from "@/components/climb/ascent/terrain";
import {
  cloudFrag,
  cloudVert,
  routeFrag,
  routeVert,
  skyFrag,
  skyVert,
  snowFrag,
  snowVert,
  streakFrag,
  streakVert,
  terrainFrag,
  terrainVert,
} from "@/components/climb/ascent/shaders";

/* ★ The ascent. A pinned stage ~9 screens tall; scrolling drives a camera up the South Col
   route over a procedural Everest (faceted, brass contour lines, snow on the high faces).
   Each camp dwells for a beat and pins a card to the terrain. The air changes as you climb:
   morning → golden-hour alpenglow → a whiteout through the cloud deck → a starry night above
   it at the summit, where a flag goes in and the mark appears in brass. */

const N = ROUTE_XZ.length; // 12
const ROUTE_SHARE = 0.86; // the rest of the scroll is the summit finale
const CLOUD_Y = 7.95;

type Env = {
  alt: number;
  top: string;
  mid: string;
  hor: string;
  sun: string;
  amb: string;
  sunY: number;
  sunX: number;
  fog: number;
  stars: number;
  snow: number;
  alpen: number;
  streak: number;
  moon: number;
};

const ENV: Env[] = [
  { alt: 1400, top: "#6d655b", mid: "#b3a58e", hor: "#e9dcc2", sun: "#fff0d2", amb: "#5c4c3d", sunY: 0.35, sunX: 0.8, fog: 0.018, stars: 0, snow: 0, alpen: 0, streak: 0, moon: 0 },
  { alt: 3440, top: "#57514a", mid: "#9a8f80", hor: "#d9cdb8", sun: "#f3eadb", amb: "#4f4236", sunY: 0.62, sunX: 0.4, fog: 0.016, stars: 0, snow: 0.08, alpen: 0, streak: 0, moon: 0 },
  { alt: 5364, top: "#433a33", mid: "#7f7060", hor: "#d6c3a6", sun: "#efdcbf", amb: "#463a2f", sunY: 0.42, sunX: -0.3, fog: 0.017, stars: 0, snow: 0.35, alpen: 0.2, streak: 0, moon: 0 },
  { alt: 6400, top: "#2c2018", mid: "#6a472c", hor: "#e5a05a", sun: "#ffbe78", amb: "#3a2a1f", sunY: 0.16, sunX: -0.85, fog: 0.019, stars: 0.05, snow: 0.55, alpen: 1, streak: 0, moon: 0 },
  { alt: 7450, top: "#1a1413", mid: "#44332b", hor: "#9a7a62", sun: "#e7a877", amb: "#2e2522", sunY: 0.04, sunX: -0.95, fog: 0.05, stars: 0.2, snow: 0.95, alpen: 0.6, streak: 0.2, moon: 0.2 },
  { alt: 8200, top: "#07060a", mid: "#120e10", hor: "#2d2019", sun: "#8f8676", amb: "#1d191b", sunY: -0.2, sunX: -1, fog: 0.012, stars: 0.85, snow: 0.3, alpen: 0, streak: 1, moon: 1 },
  { alt: 8849, top: "#040306", mid: "#0c090b", hor: "#2a1d16", sun: "#8a8171", amb: "#1c181a", sunY: -0.2, sunX: -1, fog: 0.008, stars: 1, snow: 0.15, alpen: 0, streak: 0.8, moon: 1 },
];

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ease = (t: number) => 0.5 - 0.5 * Math.cos(Math.PI * t);

function envAt(alt: number) {
  let i = 0;
  while (i < ENV.length - 2 && alt > ENV[i + 1].alt) i++;
  const a = ENV[i];
  const b = ENV[i + 1];
  const t = clamp((alt - a.alt) / (b.alt - a.alt));
  const c = (x: string, y: string) => new THREE.Color(x).lerp(new THREE.Color(y), t);
  return {
    top: c(a.top, b.top),
    mid: c(a.mid, b.mid),
    hor: c(a.hor, b.hor),
    sun: c(a.sun, b.sun),
    amb: c(a.amb, b.amb),
    sunY: lerp(a.sunY, b.sunY, t),
    sunX: lerp(a.sunX, b.sunX, t),
    fog: lerp(a.fog, b.fog, t),
    stars: lerp(a.stars, b.stars, t),
    snow: lerp(a.snow, b.snow, t),
    alpen: lerp(a.alpen, b.alpen, t),
    streak: lerp(a.streak, b.streak, t),
    moon: lerp(a.moon, b.moon, t),
  };
}

export default function Ascent3D({ dishes, onFail }: { dishes: Record<string, ClimbDish>; onFail?: () => void }) {
  const section = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const leaderRef = useRef<SVGLineElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const altRef = useRef<HTMLSpanElement>(null);
  const tempRef = useRef<HTMLSpanElement>(null);
  const o2Ref = useRef<HTMLSpanElement>(null);
  const needleRef = useRef<SVGGElement>(null);
  const placeRef = useRef<HTMLSpanElement>(null);
  const frostRef = useRef<HTMLDivElement>(null);
  const whiteRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<number | null>(0);
  const [finale, setFinale] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const sec = section.current;
    if (!canvas || !sec) return;
    const phone = matchMedia("(max-width: 767px)").matches;
    const dpr = Math.min(devicePixelRatio || 1, phone ? 1.5 : 2);

    let renderer: THREE.WebGLRenderer;
    try {
      THREE.ColorManagement.enabled = false;
      renderer = new THREE.WebGLRenderer({ canvas, antialias: !phone, alpha: false, powerPreference: "high-performance" });
    } catch {
      onFail?.();
      return;
    }
    renderer.setPixelRatio(dpr);
    renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(phone ? 62 : 52, 1, 0.02, 900);

    // ---------------- terrain ----------------
    const W = 44;
    const D = 46;
    const seg = phone ? 120 : 210;
    const geo = new THREE.PlaneGeometry(W, D, seg, Math.round((seg * D) / W));
    geo.rotateX(-Math.PI / 2);
    geo.translate(0, 0, 9);
    const pos = geo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) pos.setY(i, height(pos.getX(i), pos.getZ(i)));
    pos.needsUpdate = true;
    const terrainU = {
      uSunDir: { value: new THREE.Vector3(0.6, 0.5, 0.3) },
      uSunColor: { value: new THREE.Color("#fff0d2") },
      uAmbient: { value: new THREE.Color("#5c4c3d") },
      uFogColor: { value: new THREE.Color("#e9dcc2") },
      uFogDensity: { value: 0.018 },
      uCam: { value: new THREE.Vector3() },
      uSnowLine: { value: 5.85 },
      uContour: { value: 0.55 },
      uAlpen: { value: 0 },
      uMode: { value: 0 },
      uSmooth: { value: 0 },
    };
    const terrainMat = new THREE.ShaderMaterial({ vertexShader: terrainVert, fragmentShader: terrainFrag, uniforms: terrainU });
    const terrain = new THREE.Mesh(geo, terrainMat);
    scene.add(terrain);

    // ---------------- route + camps ----------------
    const routePts = ROUTE_XZ.map(([x, z]) => new THREE.Vector3(x, height(x, z) + 0.05, z));
    const routeCurve = new THREE.CatmullRomCurve3(routePts, false, "catmullrom", 0.35);
    const routeU = { uProgress: { value: 0 }, uTime: { value: 0 } };
    const routeMesh = new THREE.Mesh(
      new THREE.TubeGeometry(routeCurve, phone ? 300 : 600, phone ? 0.035 : 0.028, 6, false),
      new THREE.ShaderMaterial({ vertexShader: routeVert, fragmentShader: routeFrag, uniforms: routeU, transparent: true, depthWrite: false }),
    );
    scene.add(routeMesh);

    const campGroup = new THREE.Group();
    const ringGeo = new THREE.TorusGeometry(0.07, 0.007, 6, 32);
    const pinGeo = new THREE.CylinderGeometry(0.004, 0.004, 0.24, 5);
    const brassMat = new THREE.MeshBasicMaterial({ color: "#e9d39a" });
    const glowTex = (() => {
      const c = document.createElement("canvas");
      c.width = c.height = 64;
      const g = c.getContext("2d")!;
      const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
      grd.addColorStop(0, "rgba(255,236,190,1)");
      grd.addColorStop(0.3, "rgba(238,211,165,0.5)");
      grd.addColorStop(1, "rgba(238,211,165,0)");
      g.fillStyle = grd;
      g.fillRect(0, 0, 64, 64);
      return new THREE.CanvasTexture(c);
    })();
    const campGlows: THREE.Sprite[] = [];
    const campItems: THREE.Group[] = [];
    routePts.forEach((p, i) => {
      if (i === 0) return;
      const item = new THREE.Group();
      item.position.copy(p);
      const ring = new THREE.Mesh(ringGeo, brassMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.02;
      const pin = new THREE.Mesh(pinGeo, brassMat);
      pin.position.y = 0.12;
      const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
      glow.position.y = 0.25;
      glow.scale.set(0.3, 0.3, 1);
      campGlows.push(glow);
      item.add(ring, pin, glow);
      campItems.push(item);
      campGroup.add(item);
    });
    scene.add(campGroup);

    // ---------------- camera rails ----------------
    const camPts = routePts.map((p, i) => {
      const next = routePts[Math.min(N - 1, i + 1)];
      const prev = routePts[Math.max(0, i - 1)];
      const dir = next.clone().sub(prev).setY(0).normalize();
      const side = new THREE.Vector3(dir.z, 0, -dir.x);
      const k = i / (N - 1);
      const back = lerp(2.4, 1.2, k);
      const up = lerp(0.95, 0.3, k);
      return p.clone().addScaledVector(dir, -back).addScaledVector(side, lerp(0.9, 0.5, k)).add(new THREE.Vector3(0, up, 0));
    });
    // lift any camera point that would end up inside the terrain
    camPts.forEach((c) => {
      const g = height(c.x, c.z) + 0.35;
      if (c.y < g) c.y = g;
    });
    const camCurve = new THREE.CatmullRomCurve3(camPts, false, "catmullrom", 0.4);
    const lookPts = routePts.map((p, i) => {
      const next = routePts[Math.min(N - 1, i + 1)];
      return p.clone().lerp(next, 0.55).add(new THREE.Vector3(0, 0.25, 0));
    });
    lookPts[N - 1] = routePts[N - 1].clone().add(new THREE.Vector3(0, 0.05, 0));
    const lookCurve = new THREE.CatmullRomCurve3(lookPts, false, "catmullrom", 0.4);

    // ---------------- sky ----------------
    const skyU = {
      uTop: { value: new THREE.Color() },
      uMid: { value: new THREE.Color() },
      uHorizon: { value: new THREE.Color() },
      uSunDir: { value: new THREE.Vector3(0.6, 0.4, 0.3) },
      uSunColor: { value: new THREE.Color("#fff0d2") },
      uStars: { value: 0 },
      uTime: { value: 0 },
      uMoonDir: { value: new THREE.Vector3(-0.5, 0.55, -0.6).normalize() },
      uMoon: { value: 0 },
    };
    const sky = new THREE.Mesh(
      new THREE.SphereGeometry(400, 32, 16),
      new THREE.ShaderMaterial({ vertexShader: skyVert, fragmentShader: skyFrag, uniforms: skyU, side: THREE.BackSide, depthWrite: false }),
    );
    sky.frustumCulled = false;
    scene.add(sky);

    // ---------------- sea of clouds ----------------
    const cloudU = { uTime: { value: 0 }, uColor: { value: new THREE.Color("#f2e9cf") }, uShade: { value: new THREE.Color("#8a7a68") }, uOpacity: { value: 0.9 }, uCam: { value: new THREE.Vector3() } };
    const clouds = new THREE.Mesh(
      new THREE.PlaneGeometry(160, 160, 1, 1).rotateX(-Math.PI / 2),
      new THREE.ShaderMaterial({ vertexShader: cloudVert, fragmentShader: cloudFrag, uniforms: cloudU, transparent: true, depthWrite: false, side: THREE.DoubleSide }),
    );
    clouds.position.y = CLOUD_Y;
    scene.add(clouds);

    // ---------------- snow + spindrift ----------------
    const SNOW = phone ? 1400 : 3200;
    const snowGeo = new THREE.BufferGeometry();
    const seeds = new Float32Array(SNOW * 4);
    for (let i = 0; i < SNOW; i++) {
      seeds[i * 4] = Math.random();
      seeds[i * 4 + 1] = Math.random();
      seeds[i * 4 + 2] = Math.random();
      seeds[i * 4 + 3] = Math.random();
    }
    snowGeo.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 4));
    snowGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(SNOW * 3), 3));
    const snowU = { uTime: { value: 0 }, uCam: { value: new THREE.Vector3() }, uWind: { value: 0.2 }, uCount: { value: 0 }, uPixel: { value: 2.2 * dpr }, uTint: { value: new THREE.Color("#fbf6ea") } };
    const snow = new THREE.Points(snowGeo, new THREE.ShaderMaterial({ vertexShader: snowVert, fragmentShader: snowFrag, uniforms: snowU, transparent: true, depthWrite: false }));
    snow.frustumCulled = false;
    scene.add(snow);

    const STREAKS = phone ? 160 : 320;
    const stGeo = new THREE.BufferGeometry();
    const stSeed = new Float32Array(STREAKS * 2 * 4);
    const stEnd = new Float32Array(STREAKS * 2);
    for (let i = 0; i < STREAKS; i++) {
      const s = [Math.random(), Math.random(), Math.random(), Math.random()];
      for (let e = 0; e < 2; e++) {
        stSeed.set(s, (i * 2 + e) * 4);
        stEnd[i * 2 + e] = e;
      }
    }
    stGeo.setAttribute("aSeed", new THREE.BufferAttribute(stSeed, 4));
    stGeo.setAttribute("aEnd", new THREE.BufferAttribute(stEnd, 1));
    stGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(STREAKS * 2 * 3), 3));
    const stU = { uTime: { value: 0 }, uCam: { value: new THREE.Vector3() }, uOpacity: { value: 0 } };
    const streaks = new THREE.LineSegments(stGeo, new THREE.ShaderMaterial({ vertexShader: streakVert, fragmentShader: streakFrag, uniforms: stU, transparent: true, depthWrite: false }));
    streaks.frustumCulled = false;
    scene.add(streaks);

    // ---------------- the summit flag ----------------
    const flag = new THREE.Group();
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.32, 6), brassMat);
    pole.position.y = 0.16;
    const clothGeo = new THREE.PlaneGeometry(0.19, 0.115, 12, 4);
    clothGeo.translate(0.095, 0.26, 0);
    const clothU = { uTime: { value: 0 } };
    const cloth = new THREE.Mesh(
      clothGeo,
      new THREE.ShaderMaterial({
        uniforms: clothU,
        side: THREE.DoubleSide,
        vertexShader: `uniform float uTime; varying vec2 vUv; void main(){ vUv=uv; vec3 p=position; float k=uv.x; p.z+=sin(uTime*6.0+uv.x*7.0)*0.035*k; p.y+=sin(uTime*4.0+uv.x*5.0)*0.012*k; gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0);} `,
        fragmentShader: `varying vec2 vUv; void main(){ vec3 a=vec3(0.86,0.75,0.48); vec3 b=vec3(0.95,0.88,0.66); vec3 c=mix(a,b,vUv.y); float stripe=step(0.5,fract(vUv.x*5.0)); gl_FragColor=vec4(c*mix(0.9,1.0,stripe),1.0);} `,
      }),
    );
    flag.add(pole, cloth);
    flag.position.copy(routePts[N - 1]).add(new THREE.Vector3(0, -0.02, 0));
    flag.scale.setScalar(0.0001);
    scene.add(flag);

    // ---------------- loop ----------------
    const tmp = new THREE.Vector3();
    const tmpC = new THREE.Color();
    const look = new THREE.Vector3();
    let p = 0;
    let target = 0;
    let raf = 0;
    let visible = false;
    let last = performance.now();
    let lastActive: number | null = -1;
    let finaleOn = false;
    const t0 = performance.now();

    // scroll position from cached offsets: no layout reads inside the render loop
    const track = trackSection(sec);
    const readScroll = () => {
      target = track.progress();
    };
    // DOM text only when it actually changes (every write would invalidate layout)
    const said = new WeakMap<HTMLElement, string>();
    const say = (el: HTMLElement | null, v: string) => {
      if (!el || said.get(el) === v) return;
      said.set(el, v);
      el.textContent = v;
    };
    // the card's box (relative to the stage) is measured when the camp changes, not per frame
    let cardBox: { x: number; y: number } | null = null;
    let cardMeasure = 0;
    const view = { w: 1, h: 1 };

    const size = () => {
      cardMeasure = 6;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      view.w = w;
      view.h = h;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.fov = w < h ? 64 : 52;
      camera.updateProjectionMatrix();
    };

    const frame = (now: number) => {
      raf = 0;
      if (!visible) return;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const time = (now - t0) / 1000;
      readScroll();
      p += (target - p) * (1 - Math.exp(-dt * 5.5));

      const pr = clamp(p / ROUTE_SHARE);
      const segF = pr * (N - 1);
      const i = Math.min(N - 2, Math.floor(segF));
      const local = segF - i;
      const r = (i + ease(local)) / (N - 1);
      const fin = clamp((p - ROUTE_SHARE) / (1 - ROUTE_SHARE));

      // real altitude for the HUD (linear between camps, so the needle keeps moving)
      const alt = lerp(ROUTE_ALT[i], ROUTE_ALT[i + 1], local);
      const e = envAt(alt);

      camCurve.getPoint(r, camera.position);
      lookCurve.getPoint(Math.min(1, r + 0.015), look);
      if (fin > 0) {
        // the summit: rise above the clouds, swing round and look back at the flag
        const f = ease(fin);
        const summit = routePts[N - 1];
        // eye level with the summit: flag low in frame, the sea of clouds below, stars above
        const ang = lerp(0.2, -0.55, f);
        const rad = lerp(1.5, 4.0, f);
        tmp.set(Math.sin(ang) * rad - 0.4 * f, lerp(0.35, 0.3, f), Math.cos(ang) * rad).add(summit);
        camera.position.lerp(tmp, f);
        look.lerp(summit.clone().add(new THREE.Vector3(0.35 * f, lerp(0.1, 0.62, f), 0)), f);
        campGroup.visible = f < 0.2;
        routeMesh.visible = f < 0.35;
      }
      const ground = height(camera.position.x, camera.position.z) + 0.25;
      if (camera.position.y < ground) camera.position.y = ground;
      camera.lookAt(look);

      // atmosphere
      const sunDir = tmp.set(e.sunX, e.sunY, 0.35).normalize();
      terrainU.uSunDir.value.copy(sunDir);
      skyU.uSunDir.value.copy(sunDir);
      terrainU.uSunColor.value.copy(e.sun);
      skyU.uSunColor.value.copy(e.sun).multiplyScalar(e.sunY > -0.05 ? 1 : 0);
      terrainU.uAmbient.value.copy(e.amb);
      skyU.uTop.value.copy(e.top);
      skyU.uMid.value.copy(e.mid);
      skyU.uHorizon.value.copy(e.hor);
      skyU.uStars.value = e.stars;
      skyU.uMoon.value = e.moon;
      skyU.uTime.value = time;
      // whiteout as the camera passes through the cloud deck
      if (fin <= 0) {
        campGroup.visible = true;
        routeMesh.visible = true;
      }
      // camp markers step aside when the camera is right on top of them
      campItems.forEach((it) => {
        const d = it.position.distanceTo(camera.position);
        it.visible = d > 0.6;
        it.scale.setScalar(clamp(d / 2.6, 0.25, 1));
      });
      const inCloud = Math.exp(-Math.pow((camera.position.y - CLOUD_Y) / 0.16, 2));
      terrainU.uFogColor.value.copy(e.hor).lerp(new THREE.Color("#efe6d4"), inCloud * 0.8);
      terrainU.uFogDensity.value = e.fog + inCloud * 0.2;
      terrainU.uCam.value.copy(camera.position);
      terrainU.uAlpen.value = e.alpen;
      cloudU.uTime.value = time;
      cloudU.uCam.value.copy(camera.position);
      const night = clamp((alt - 7600) / 900);
      cloudU.uColor.value.set("#f4ecdc").lerp(tmpC.set("#d6cdbd"), night);
      cloudU.uShade.value.copy(e.mid).lerp(tmpC.set("#5e544b"), 0.5 + night * 0.2);
      // the deck only appears as you reach it; above it, it's a solid sea
      const cy = camera.position.y;
      cloudU.uOpacity.value = cy > CLOUD_Y ? 0.95 : clamp((cy - (CLOUD_Y - 0.6)) / 0.55) * 0.6;
      snowU.uTime.value = time;
      snowU.uCam.value.copy(camera.position);
      snowU.uCount.value = e.snow;
      snowU.uWind.value = 0.2 + e.streak * 1.4;
      stU.uTime.value = time;
      stU.uCam.value.copy(camera.position);
      stU.uOpacity.value = e.streak * 0.55;
      routeU.uProgress.value = r;
      routeU.uTime.value = time;
      clothU.uTime.value = time;
      campGlows.forEach((g, gi) => {
        const on = Math.abs(r * (N - 1) - (gi + 1)) < 0.5;
        const s = on ? 0.42 + Math.sin(time * 3) * 0.06 : 0.22;
        g.scale.set(s, s, 1);
        (g.material as THREE.SpriteMaterial).opacity = on ? 0.75 : 0.28;
      });
      const plant = clamp((fin - 0.12) / 0.3);
      flag.scale.setScalar(Math.max(0.0001, (plant < 1 ? 1 - Math.pow(1 - plant, 3) : 1) * 1.7));
      flag.position.y = routePts[N - 1].y - 0.02 + (1 - plant) * 0.4;

      renderer.render(scene, camera);

      // ---- overlay ----
      const near = local < 0.42 ? i : local > 0.58 ? i + 1 : null;
      const act = fin > 0.08 ? null : near;
      if (act !== lastActive) {
        cardMeasure = 24;
        lastActive = act;
        setActive(act);
      }
      const fOn = fin > 0.3;
      if (fOn !== finaleOn) {
        finaleOn = fOn;
        setFinale(fOn);
      }
      say(altRef.current, fin > 0.05 ? "8,848.86" : Math.round(alt).toLocaleString("en-US"));
      // the browser tab climbs too (AltitudeTitle)
      const tab = window as unknown as { __8848alt: number; __8848altAt: number };
      tab.__8848alt = fin > 0.05 ? 8849 : alt;
      tab.__8848altAt = performance.now();
      say(placeRef.current, WAYPOINTS[Math.round(i + local)]?.name ?? "");
      const wi = Math.min(N - 2, i);
      say(tempRef.current, String(Math.round(lerp(WAYPOINTS[wi].temp, WAYPOINTS[wi + 1].temp, local))));
      say(o2Ref.current, String(Math.round(lerp(WAYPOINTS[wi].o2, WAYPOINTS[wi + 1].o2, local))));
      if (needleRef.current) needleRef.current.style.transform = `rotate(${-120 + (alt / 8848.86) * 240}deg)`;
      if (frostRef.current) frostRef.current.style.opacity = String(clamp((alt - 6900) / 1700) * 0.7 * (1 - fin * 0.6));
      if (whiteRef.current) whiteRef.current.style.opacity = String(inCloud * 0.6);
      if (railRef.current) railRef.current.style.setProperty("--r", r.toFixed(4));

      // pin the card to its camp
      if (act !== null && pinRef.current) {
        tmp.copy(routePts[act]).add(new THREE.Vector3(0, 0.45, 0)).project(camera);
        const w = view.w;
        const h = view.h;
        const x = (tmp.x * 0.5 + 0.5) * w;
        const y = (-tmp.y * 0.5 + 0.5) * h;
        const onScreen = tmp.z < 1 && x > -40 && x < w + 40 && y > -40 && y < h + 40;
        pinRef.current.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
        pinRef.current.style.opacity = onScreen ? "1" : "0";
        // re-measure the card for a few frames after the camp changes (its content re-renders)
        if (cardMeasure > 0 || !cardBox) {
          cardMeasure = Math.max(0, cardMeasure - 1);
          const card = cardRef.current?.getBoundingClientRect();
          const stage = canvas.getBoundingClientRect();
          cardBox = card ? { x: card.left - stage.left + (phone ? card.width / 2 : 0), y: phone ? card.top - stage.top : card.top - stage.top + 40 } : null;
        }
        if (cardBox && leaderRef.current) {
          const cx = cardBox.x;
          const cy = cardBox.y;
          leaderRef.current.setAttribute("x1", x.toFixed(1));
          leaderRef.current.setAttribute("y1", y.toFixed(1));
          leaderRef.current.setAttribute("x2", cx.toFixed(1));
          leaderRef.current.setAttribute("y2", cy.toFixed(1));
          leaderRef.current.style.opacity = onScreen ? "1" : "0";
        }
      } else if (leaderRef.current) {
        leaderRef.current.style.opacity = "0";
        if (pinRef.current) pinRef.current.style.opacity = "0";
      }

      raf = requestAnimationFrame(frame);
    };

    const io = new IntersectionObserver(
      ([en]) => {
        visible = en.isIntersecting;
        if (visible && !raf) {
          last = performance.now();
          raf = requestAnimationFrame(frame);
        }
      },
      { rootMargin: "200px 0px" },
    );
    io.observe(sec);
    const ro = new ResizeObserver(size);
    ro.observe(canvas);
    size();
    readScroll();
    p = target;
    setReady(true);

    const lost = (ev: Event) => {
      ev.preventDefault();
      onFail?.();
    };
    canvas.addEventListener("webglcontextlost", lost);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      track.dispose();
      canvas.removeEventListener("webglcontextlost", lost);
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        m.geometry?.dispose();
        const mats = Array.isArray(m.material) ? m.material : m.material ? [m.material] : [];
        mats.forEach((mt) => {
          (mt as THREE.SpriteMaterial).map?.dispose();
          mt.dispose();
        });
      });
      glowTex.dispose();
      renderer.dispose();
      THREE.ColorManagement.enabled = true;
    };
  }, [onFail]);

  const wp = active !== null ? WAYPOINTS[active] : null;
  const dish = wp ? dishes[wp.dish] : undefined;

  return (
    <section ref={section} aria-label="The climb, in 3D" className="ascent relative h-[950svh]">
      <div className="sticky top-0 h-[100svh] overflow-hidden bg-[#1a130e]">
        <canvas ref={canvasRef} className={cn("absolute inset-0 h-full w-full transition-opacity duration-1000", ready ? "opacity-100" : "opacity-0")} aria-hidden="true" />
        <div ref={whiteRef} aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[#efe6d4] opacity-0" />
        <div ref={frostRef} aria-hidden="true" className="ascent-frost pointer-events-none absolute inset-0 opacity-0" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_45%,transparent_55%,rgba(10,7,5,0.55))]" />

        {/* HUD */}
        <div className={cn("absolute left-3 top-[76px] z-[3] transition-opacity duration-700 md:left-6 md:top-[96px]", finale && "opacity-0")}>
          <div className="altimeter brass relative flex items-center gap-3 rounded-full p-1.5 pr-5 md:rounded-[22px] md:p-2.5 md:pr-5" role="status" aria-live="off">
            <svg viewBox="0 0 80 80" className="h-11 w-11 shrink-0 md:h-[66px] md:w-[66px]" aria-hidden="true">
              <circle cx="40" cy="40" r="37" fill="#1a120d" stroke="#6b5332" strokeWidth="2" />
              {Array.from({ length: 25 }, (_, k) => {
                const a = ((-120 + k * 10) * Math.PI) / 180;
                const long = k % 3 === 0;
                return <line key={k} x1={40 + Math.sin(a) * (long ? 26 : 29)} y1={40 - Math.cos(a) * (long ? 26 : 29)} x2={40 + Math.sin(a) * 33} y2={40 - Math.cos(a) * 33} stroke="#dcbf7b" strokeWidth={long ? 1.4 : 0.8} opacity={long ? 0.9 : 0.5} />;
              })}
              <g ref={needleRef} style={{ transformOrigin: "40px 40px", transform: "rotate(-120deg)" }}>
                <path d="M40 40 L40 11" stroke="#f2e9cf" strokeWidth="1.8" strokeLinecap="round" />
              </g>
              <circle cx="40" cy="40" r="3.4" fill="#dcbf7b" />
            </svg>
            <div className="leading-none text-choc">
              <span ref={placeRef} className="caps block text-[8.5px] text-bronze md:text-[9.5px]">
                Kathmandu
              </span>
              <span className="display num mt-1 block text-[22px] md:text-[28px]">
                <span ref={altRef}>1,400</span>
                <span className="ml-1 text-[0.5em] italic">m</span>
              </span>
              <span className="num mt-1 flex gap-3 text-[10px] text-bronze md:text-[11px]">
                <span>
                  <span ref={tempRef}>24</span>°C
                </span>
                <span>
                  O₂ <span ref={o2Ref}>86</span>%
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* progress ridge on the right edge */}
        <div ref={railRef} aria-hidden="true" className="ascent-rail absolute right-4 top-1/2 z-[3] hidden h-[46vh] w-5 -translate-y-1/2 md:block">
          <span className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-brass/25" />
          <span className="absolute bottom-0 left-1/2 w-px -translate-x-1/2 bg-brass-hi" style={{ height: "calc(var(--r, 0) * 100%)" }} />
          {WAYPOINTS.map((w, k) => (
            <span key={w.id} className="absolute left-1/2 h-1.5 w-1.5 -translate-x-1/2 rotate-45 bg-brass/60" style={{ bottom: `calc(${(k / (N - 1)) * 100}% - 3px)` }} />
          ))}
        </div>

        {/* pin + leader */}
        <svg aria-hidden="true" className="pointer-events-none absolute inset-0 z-[2] h-full w-full">
          <line ref={leaderRef} stroke="#dcbf7b" strokeWidth="1" strokeDasharray="3 4" opacity="0" />
        </svg>
        <div ref={pinRef} aria-hidden="true" className="pointer-events-none absolute left-0 top-0 z-[2] opacity-0 transition-opacity duration-300">
          <div className="-translate-x-1/2 -translate-y-full pb-2">
            <p className="caps whitespace-nowrap rounded-full border border-foil/50 bg-void/70 px-3 py-1 text-[9.5px] text-brass-hi backdrop-blur">
              {wp ? `${wp.name} · ${wp.alt.toLocaleString("en-US", { maximumFractionDigits: 2 })} m` : ""}
            </p>
          </div>
          <span className="absolute left-0 top-0 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brass-hi shadow-[0_0_14px_4px_rgba(238,211,165,.7)]" />
        </div>

        {/* the camp card */}
        <div className="pointer-events-none absolute inset-x-3 bottom-4 z-[3] md:inset-x-auto md:bottom-auto md:right-12 md:top-1/2 md:w-[380px] md:-translate-y-1/2">
          {wp && (
            <div key={wp.id} ref={cardRef} className="ascent-card glass pointer-events-auto rounded-[24px] p-4 [--glass-base:rgba(20,14,10,0.78)] md:p-5">
              <p className="caps num text-[9.5px] text-brass">
                {wp.alt.toLocaleString("en-US", { maximumFractionDigits: 2 })} m · {wp.name}
              </p>
              <h3 className="display mt-1.5 text-[24px] leading-tight text-brass-hi md:text-[30px]">{wp.title}</h3>
              <p className="mt-1.5 text-[14px] leading-snug text-text/80 md:text-[15px]">{wp.body}</p>
              {dish && (
                <div className="mt-3 flex items-center gap-3 rounded-2xl border border-line bg-void/40 p-1.5 pr-2.5">
                  <DishImage item={dish} available={dish.available} sizes="56px" className="h-12 w-12 shrink-0 rounded-xl md:h-14 md:w-14" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] text-text">{dish.name}</p>
                    <p className="num text-[12.5px] text-brass">{formatPrice(dish.price)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => addToPack(dish.id, dish.name, { spice: dish.spiceable ? (dish.spice >= 3 ? "Hot" : "Medium") : undefined }, e.currentTarget.parentElement, dish.available ? getDishImage(dish) : null)}
                    aria-label={`Add ${dish.name} to your pack`}
                    className="add-btn flex h-9 w-9 items-center justify-center rounded-full"
                  >
                    <Plus size={17} aria-hidden="true" />
                  </button>
                </div>
              )}
              <Link href={wp.link.href} className="group mt-3 inline-flex items-center gap-1.5 text-[13.5px] font-medium text-brass-hi">
                {wp.link.label} <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </Link>
            </div>
          )}
        </div>

        {/* the summit */}
        <div className={cn("ascent-finale pointer-events-none absolute inset-0 z-[4] flex flex-col items-center justify-between px-6 pb-[9svh] pt-[13svh] text-center", finale && "is-on")}>
          <SummitFlags />
          <div className="relative">{finale && <Logo variant="lockup" material="brass" animate delay={0.1} orb="moon" className="mx-auto w-[min(56vw,250px)]" />}</div>
          <div className="relative">
            <p className="display text-[clamp(2.2rem,7vw,4rem)] leading-none text-brass-hi [text-shadow:0_2px_30px_rgba(0,0,0,.7)]">You made it. Now eat.</p>
            <p className="mt-3 text-[15px] text-text/85 [text-shadow:0_1px_12px_rgba(0,0,0,.8)]">8,848.86 m · −32 °C · a third of the air · a table waiting on Reservoir Street.</p>
            <div className="pointer-events-auto mt-6 flex flex-wrap justify-center gap-3">
              <Link href="/menu" className="btn btn-brass px-7 py-4 text-[15.5px]">
                Order now <ArrowRight size={16} aria-hidden="true" />
              </Link>
              <Link href="/visit#reserve" className="btn btn-ghost px-6 py-4 text-[15px]">
                Book a table
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* Two strings of prayer flags that sweep in from the corners at the summit. */
function SummitFlags() {
  const colors = ["var(--flag-blue)", "var(--flag-white)", "var(--flag-red)", "var(--flag-green)", "var(--flag-yellow)"];
  const string = (flip: boolean) => (
    <svg viewBox="0 0 600 160" className={cn("summit-flags absolute w-[120vw] max-w-[1100px] [filter:saturate(.55)_brightness(.85)]", flip ? "summit-flags-b" : "summit-flags-a")} aria-hidden="true">
      <path d="M0 30 Q300 120 600 20" fill="none" stroke="#b69e70" strokeWidth="1.5" />
      {Array.from({ length: 15 }, (_, i) => {
        const t = (i + 0.5) / 15;
        const x = t * 600;
        const y = (1 - t) * (1 - t) * 30 + 2 * (1 - t) * t * 120 + t * t * 20;
        return (
          <g key={i} transform={`translate(${x} ${y})`}>
            <rect className="sf-cloth" x="-14" y="0" width="28" height="36" fill={colors[i % 5]} opacity=".9" style={{ animationDelay: `${(i % 5) * 0.13}s` }} />
          </g>
        );
      })}
    </svg>
  );
  return (
    <>
      {string(false)}
      {string(true)}
    </>
  );
}
