"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Mountain, RotateCcw, X, Plus } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/format";
import { HOTSPOTS } from "@/data/everest";
import { height, ROUTE_XZ } from "@/components/climb/ascent/terrain";
import { terrainFrag, terrainVert } from "@/components/climb/ascent/shaders";
import { addToPack } from "@/lib/add-to-pack";
import { getDishImage } from "@/lib/dish-path";
import { DishImage } from "@/components/menu/DishImage";

export type PairDish = { id: string; name: string; price: number; img: string; category: string; spice: number; available: boolean; spiceable: boolean };

/* ★ Flagship 2 — Everest you can turn in your hands. The same massif as the ascent, drawn as
   brass contour lines on walnut (or lit snow). Drag to rotate (inertia, touch and mouse), tap a
   glowing camp to fly there and read its card. Tiny climbers inch up the route; a plume of snow
   streams off the summit in the jet stream. */

const TARGET0 = new THREE.Vector3(0.2, 6.3, 2.3);

const plumeVert = /* glsl */ `
  attribute vec4 aSeed;
  uniform float uTime;
  uniform vec3 uOrigin;
  uniform float uPixel;
  varying float vA;
  void main() {
    float age = fract(uTime * (0.08 + aSeed.w * 0.05) + aSeed.x);
    vec3 p = uOrigin;
    p.x += age * (2.6 + aSeed.y * 1.4);
    p.y += age * (0.25 + aSeed.z * 0.2) - age * age * 0.35 + sin(age * 9.0 + aSeed.x * 30.0) * 0.05;
    p.z += (aSeed.z - 0.5) * age * 0.9 + sin(age * 6.0 + aSeed.y * 20.0) * 0.08;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uPixel * (1.0 + age * 4.5) * (6.0 / max(1.0, -mv.z));
    vA = (1.0 - age) * smoothstep(0.0, 0.08, age);
  }
`;
const plumeFrag = /* glsl */ `
  varying float vA;
  uniform vec3 uColor;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    gl_FragColor = vec4(uColor, smoothstep(0.5, 0.0, d) * vA * 0.28);
  }
`;

export default function Everest3D({ dishes }: { dishes: Record<string, PairDish> }) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const spotRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const api = useRef<{ fly(i: number | null): void; setMode(m: 0 | 1): void } | null>(null);
  const [mode, setMode] = useState<0 | 1>(1);
  const [open, setOpen] = useState<number | null>(null);
  const [ready, setReady] = useState(false);
  const [hint, setHint] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    const box = wrap.current;
    if (!canvas || !box) return;
    const phone = matchMedia("(max-width: 767px)").matches;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(devicePixelRatio || 1, phone ? 1.5 : 2);
    let renderer: THREE.WebGLRenderer;
    try {
      THREE.ColorManagement.enabled = false;
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    } catch {
      return;
    }
    renderer.setPixelRatio(dpr);
    renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
    renderer.setClearColor(0x000000, 0);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.05, 200);

    // terrain: the upper Khumbu and the massif
    const S = 17;
    const seg = phone ? 120 : 190;
    const geo = new THREE.PlaneGeometry(S, S, seg, seg);
    geo.rotateX(-Math.PI / 2);
    geo.translate(0, 0, 2.6);
    const pos = geo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      // fall away at the edges so the massif sits on a plinth, like a relief model
      const edge = Math.max(Math.abs(x) / (S / 2), Math.abs(z - 2.6) / (S / 2));
      const fall = Math.pow(Math.max(0, (edge - 0.72) / 0.28), 2);
      pos.setY(i, height(x, z) * (1 - fall) + 2.4 * fall);
    }
    const terrainU = {
      uSunDir: { value: new THREE.Vector3(-0.6, 0.55, 0.45).normalize() },
      uSunColor: { value: new THREE.Color("#f6e8cf") },
      uAmbient: { value: new THREE.Color("#4a3c30") },
      uFogColor: { value: new THREE.Color("#140e0a") },
      uFogDensity: { value: 0.0 },
      uCam: { value: new THREE.Vector3() },
      uSnowLine: { value: 5.6 },
      uContour: { value: 0.5 },
      uAlpen: { value: 0.35 },
      uMode: { value: 1 },
      uSmooth: { value: 0 },
    };
    geo.computeVertexNormals();
    const terrain = new THREE.Mesh(geo, new THREE.ShaderMaterial({ vertexShader: terrainVert, fragmentShader: terrainFrag, uniforms: terrainU }));
    scene.add(terrain);

    // route + climbers
    const routePts = ROUTE_XZ.map(([x, z]) => new THREE.Vector3(x, height(x, z) + 0.04, z));
    const curve = new THREE.CatmullRomCurve3(routePts.slice(4), false, "catmullrom", 0.35);
    const routeLine = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(curve.getPoints(260)),
      new THREE.LineDashedMaterial({ color: "#f2e2b6", dashSize: 0.08, gapSize: 0.06, transparent: true, opacity: 0.85 }),
    );
    routeLine.computeLineDistances();
    scene.add(routeLine);

    const glowTex = (() => {
      const c = document.createElement("canvas");
      c.width = c.height = 64;
      const g = c.getContext("2d")!;
      const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
      grd.addColorStop(0, "rgba(255,244,214,1)");
      grd.addColorStop(0.25, "rgba(238,211,165,0.7)");
      grd.addColorStop(1, "rgba(238,211,165,0)");
      g.fillStyle = grd;
      g.fillRect(0, 0, 64, 64);
      return new THREE.CanvasTexture(c);
    })();
    const climbers = Array.from({ length: 6 }, (_, i) => {
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
      s.scale.set(0.16, 0.16, 1);
      scene.add(s);
      return { s, off: i / 6, speed: 0.006 + (i % 3) * 0.002 };
    });
    const camps = HOTSPOTS.map((h) => {
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
      s.position.copy(routePts[h.route]).add(new THREE.Vector3(0, 0.12, 0));
      s.scale.set(0.42, 0.42, 1);
      scene.add(s);
      return s;
    });

    // summit plume
    const P = phone ? 500 : 1100;
    const pg = new THREE.BufferGeometry();
    const seeds = new Float32Array(P * 4);
    for (let i = 0; i < P * 4; i++) seeds[i] = Math.random();
    pg.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 4));
    pg.setAttribute("position", new THREE.BufferAttribute(new Float32Array(P * 3), 3));
    const plumeU = { uTime: { value: 0 }, uOrigin: { value: routePts[11].clone().add(new THREE.Vector3(0.05, 0.05, 0)) }, uPixel: { value: 3 * dpr }, uColor: { value: new THREE.Color("#fbf5e6") } };
    const plume = new THREE.Points(pg, new THREE.ShaderMaterial({ vertexShader: plumeVert, fragmentShader: plumeFrag, uniforms: plumeU, transparent: true, depthWrite: false }));
    plume.frustumCulled = false;
    scene.add(plume);

    // orbit state
    const orbit = { theta: 0.55, phi: 1.02, r: phone ? 17 : 13.5, vt: 0, vp: 0 };
    const target = TARGET0.clone();
    const fly = { active: false, t: 0, from: { target: new THREE.Vector3(), r: 0, theta: 0, phi: 0 }, to: { target: new THREE.Vector3(), r: 0, theta: 0, phi: 0 } };
    let lastInput = performance.now();

    const startFly = (to: { target: THREE.Vector3; r: number; theta: number; phi: number }) => {
      fly.active = true;
      fly.t = 0;
      fly.from = { target: target.clone(), r: orbit.r, theta: orbit.theta, phi: orbit.phi };
      // take the short way round
      let dt = to.theta - orbit.theta;
      dt = ((dt + Math.PI) % (Math.PI * 2)) - Math.PI;
      fly.to = { ...to, theta: orbit.theta + dt };
    };

    api.current = {
      fly(i) {
        if (i === null) {
          startFly({ target: TARGET0.clone(), r: phone ? 17 : 13.5, theta: orbit.theta, phi: 1.02 });
          return;
        }
        const p = routePts[HOTSPOTS[i].route];
        startFly({ target: p.clone().add(new THREE.Vector3(0, 0.15, 0)), r: phone ? 5 : 4.2, theta: orbit.theta + 0.35, phi: 1.12 });
      },
      setMode(m) {
        terrainU.uMode.value = m;
        terrainU.uSmooth.value = m ? 0 : 0.8;
        terrainU.uContour.value = m ? 0.5 : 0.28;
        terrainU.uAmbient.value.set(m ? "#4a3c30" : "#5b4a3b");
        (routeLine.material as THREE.LineDashedMaterial).color.set(m ? "#f2e2b6" : "#fff8ea");
      },
    };

    // input
    let drag: { id: number; x: number; y: number; t: number } | null = null;
    const down = (e: PointerEvent) => {
      drag = { id: e.pointerId, x: e.clientX, y: e.clientY, t: performance.now() };
      orbit.vt = 0;
      orbit.vp = 0;
      fly.active = false;
      lastInput = performance.now();
      setHint(false);
    };
    const move = (e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.id) return;
      const dx = e.clientX - drag.x;
      const dy = e.clientY - drag.y;
      const now = performance.now();
      const dt = Math.max(8, now - drag.t) / 1000;
      orbit.theta -= dx * 0.006;
      if (e.pointerType === "mouse") orbit.phi = Math.min(1.35, Math.max(0.55, orbit.phi - dy * 0.004));
      orbit.vt = (-dx * 0.006) / dt;
      orbit.vp = e.pointerType === "mouse" ? (-dy * 0.004) / dt : 0;
      drag = { id: e.pointerId, x: e.clientX, y: e.clientY, t: now };
      lastInput = now;
    };
    const up = () => {
      drag = null;
    };
    const wheel = (e: WheelEvent) => {
      if (!e.ctrlKey && Math.abs(e.deltaY) < 40 && !e.shiftKey) return; // let the page scroll
      e.preventDefault();
      orbit.r = Math.min(20, Math.max(3.5, orbit.r * (1 + e.deltaY * 0.001)));
    };
    const key = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") orbit.vt = -1.4;
      else if (e.key === "ArrowRight") orbit.vt = 1.4;
      else if (e.key === "ArrowUp") orbit.phi = Math.max(0.55, orbit.phi - 0.08);
      else if (e.key === "ArrowDown") orbit.phi = Math.min(1.35, orbit.phi + 0.08);
      else return;
      e.preventDefault();
      lastInput = performance.now();
    };
    canvas.addEventListener("pointerdown", down);
    addEventListener("pointermove", move);
    addEventListener("pointerup", up);
    addEventListener("pointercancel", up);
    canvas.addEventListener("wheel", wheel, { passive: false });
    canvas.addEventListener("keydown", key);

    const view = { w: 1, h: 1 };
    const size = () => {
      const w = box.clientWidth;
      const h = box.clientHeight;
      view.w = w;
      view.h = h;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(size);
    ro.observe(box);
    size();

    let raf = 0;
    let visible = false;
    let last = performance.now();
    const t0 = performance.now();
    const tmp = new THREE.Vector3();
    const frame = (now: number) => {
      raf = 0;
      if (!visible) return;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const time = (now - t0) / 1000;

      if (fly.active) {
        fly.t = Math.min(1, fly.t + dt / 1.3);
        const k = 0.5 - 0.5 * Math.cos(Math.PI * fly.t);
        target.lerpVectors(fly.from.target, fly.to.target, k);
        orbit.r = fly.from.r + (fly.to.r - fly.from.r) * k;
        orbit.theta = fly.from.theta + (fly.to.theta - fly.from.theta) * k;
        orbit.phi = fly.from.phi + (fly.to.phi - fly.from.phi) * k;
        if (fly.t >= 1) fly.active = false;
      } else if (!drag) {
        orbit.theta += orbit.vt * dt;
        orbit.phi = Math.min(1.35, Math.max(0.55, orbit.phi + orbit.vp * dt));
        const damp = Math.exp(-3.2 * dt);
        orbit.vt *= damp;
        orbit.vp *= damp;
        if (!reduce && now - lastInput > 3500) orbit.theta += dt * 0.06; // idle drift
      }
      camera.position.set(
        target.x + orbit.r * Math.sin(orbit.phi) * Math.sin(orbit.theta),
        target.y + orbit.r * Math.cos(orbit.phi),
        target.z + orbit.r * Math.sin(orbit.phi) * Math.cos(orbit.theta),
      );
      camera.lookAt(target);
      terrainU.uCam.value.copy(camera.position);
      plumeU.uTime.value = reduce ? 3 : time;

      climbers.forEach((c) => {
        const t = reduce ? c.off : (c.off + time * c.speed) % 1;
        curve.getPoint(t, c.s.position);
        c.s.position.y += 0.05;
        const tw = 0.13 + Math.sin(time * 5 + c.off * 20) * 0.03;
        c.s.scale.set(tw, tw, 1);
      });
      camps.forEach((s, i) => {
        const k = 0.36 + Math.sin(time * 2.2 + i) * 0.06;
        s.scale.set(k, k, 1);
      });

      renderer.render(scene, camera);

      // pin the HTML hotspots (sizes cached by size(); no layout reads per frame)
      const w = view.w;
      const h = view.h;
      HOTSPOTS.forEach((hs, i) => {
        const b = spotRefs.current[i];
        if (!b) return;
        tmp.copy(routePts[hs.route]).add(new THREE.Vector3(0, 0.12, 0)).project(camera);
        const x = (tmp.x * 0.5 + 0.5) * w;
        const y = (-tmp.y * 0.5 + 0.5) * h;
        const vis = tmp.z < 1 && x > 8 && x < w - 8 && y > 8 && y < h - 8;
        b.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
        b.style.opacity = vis ? "1" : "0";
        b.style.pointerEvents = vis ? "auto" : "none";
      });
      raf = requestAnimationFrame(frame);
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !raf) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    });
    io.observe(box);
    setReady(true);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      canvas.removeEventListener("pointerdown", down);
      removeEventListener("pointermove", move);
      removeEventListener("pointerup", up);
      removeEventListener("pointercancel", up);
      canvas.removeEventListener("wheel", wheel);
      canvas.removeEventListener("keydown", key);
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        m.geometry?.dispose();
        const mats = Array.isArray(m.material) ? m.material : m.material ? [m.material] : [];
        mats.forEach((mt) => mt.dispose());
      });
      glowTex.dispose();
      renderer.dispose();
      THREE.ColorManagement.enabled = true;
      api.current = null;
    };
  }, []);

  useEffect(() => {
    api.current?.setMode(mode);
  }, [mode]);

  const choose = (i: number | null) => {
    setOpen(i);
    api.current?.fly(i);
  };

  const hs = open !== null ? HOTSPOTS[open] : null;
  const dish = hs ? dishes[hs.dish] : undefined;

  return (
    <div className="relative">
      <div
        ref={wrap}
        className={cn(
          "everest3d relative h-[70svh] min-h-[440px] overflow-hidden rounded-[30px] border border-line transition-[background] duration-700 md:h-[78svh]",
          mode ? "is-brass" : "is-snow",
        )}
      >
        <canvas
          ref={canvasRef}
          tabIndex={0}
          role="img"
          aria-label="Interactive 3D model of the Everest massif. Drag or use the arrow keys to turn it; choose a camp below to fly there."
          className={cn("absolute inset-0 h-full w-full cursor-grab touch-pan-y outline-none transition-opacity duration-1000 active:cursor-grabbing", ready ? "opacity-100" : "opacity-0")}
        />
        {HOTSPOTS.map((h, i) => (
          <button
            key={h.name}
            ref={(el) => {
              spotRefs.current[i] = el;
            }}
            type="button"
            onClick={() => choose(open === i ? null : i)}
            aria-pressed={open === i}
            className={cn("everest-spot group absolute left-0 top-0 z-[2] opacity-0", open === i && "is-open")}
          >
            <span className="everest-dot" aria-hidden="true" />
            <span className="everest-label caps">{h.name}</span>
          </button>
        ))}

        <div className="absolute left-4 top-4 z-[3] flex flex-wrap gap-2 md:left-6 md:top-6">
          <div role="radiogroup" aria-label="Render mode" className="flex rounded-full border border-line-strong bg-void/60 p-1 backdrop-blur">
            {(["Brass contour", "Snow"] as const).map((l, i) => {
              const m = (i === 0 ? 1 : 0) as 0 | 1;
              return (
                <button key={l} type="button" role="radio" aria-checked={mode === m} onClick={() => setMode(m)} className={cn("rounded-full px-3.5 py-1.5 text-[12.5px] transition-colors", mode === m ? "bg-brass text-choc" : "text-muted hover:text-brass-hi")}>
                  {l}
                </button>
              );
            })}
          </div>
          <button type="button" onClick={() => choose(null)} className="flex items-center gap-1.5 rounded-full border border-line-strong bg-void/60 px-3.5 py-1.5 text-[12.5px] text-muted backdrop-blur hover:text-brass-hi">
            <RotateCcw size={13} aria-hidden="true" /> Reset
          </button>
        </div>

        {hint && ready && (
          <p aria-hidden="true" className="everest-hint caps pointer-events-none absolute bottom-5 left-1/2 z-[2] -translate-x-1/2 rounded-full bg-void/60 px-4 py-2 text-[10px] text-brass-hi backdrop-blur">
            <Mountain size={12} className="mr-2 inline-block align-[-2px]" /> Drag to turn · tap a camp
          </p>
        )}

        {hs && (
          <div key={hs.name} className="everest-card glass absolute inset-x-3 bottom-3 z-[4] rounded-[22px] p-4 [--glass-base:rgba(14,10,7,0.86)] md:inset-x-auto md:bottom-6 md:left-6 md:w-[380px] md:p-5">
            <button type="button" onClick={() => choose(null)} aria-label="Close" className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-muted hover:text-brass-hi">
              <X size={15} aria-hidden="true" />
            </button>
            <p className="caps num text-[9.5px] text-brass">{hs.alt}</p>
            <h3 className="display mt-1 pr-8 text-[26px] leading-tight text-brass-hi">{hs.name}</h3>
            <p className="mt-1.5 text-[14px] leading-snug text-text/85">{hs.story}</p>
            <p className="mt-2 border-l border-foil/60 pl-3 text-[13px] leading-snug text-muted">{hs.fact}</p>
            {dish && (
              <div className="mt-3 flex items-center gap-3 rounded-2xl border border-line bg-void/40 p-1.5 pr-2.5">
                <DishImage item={dish} available={dish.available} sizes="48px" className="h-12 w-12 shrink-0 rounded-xl" />
                <div className="min-w-0 flex-1">
                  <p className="caps text-[8.5px] text-brass">Pair it with</p>
                  <p className="truncate text-[14px] text-text">{dish.name}</p>
                </div>
                <span className="num text-[13px] text-brass">{formatPrice(dish.price)}</span>
                <button
                  type="button"
                  onClick={(e) => addToPack(dish.id, dish.name, { spice: dish.spiceable ? "Medium" : undefined }, e.currentTarget.parentElement, dish.available ? getDishImage(dish) : null)}
                  aria-label={`Add ${dish.name} to your pack`}
                  className="add-btn flex h-9 w-9 items-center justify-center rounded-full"
                >
                  <Plus size={16} aria-hidden="true" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* keyboard / screen-reader route to every camp */}
      <ol className="no-scrollbar mt-4 flex gap-2 overflow-x-auto pb-1" aria-label="Camps">
        {HOTSPOTS.map((h, i) => (
          <li key={h.name} className="shrink-0">
            <button type="button" onClick={() => choose(i)} aria-pressed={open === i} className={cn("rounded-full border px-3.5 py-2 text-[13px] transition-colors", open === i ? "border-foil bg-brass/15 text-brass-hi" : "border-line text-muted hover:text-text")}>
              {h.name} <span className="num text-[11px] opacity-70">{h.alt}</span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}
