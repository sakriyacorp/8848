"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { cn } from "@/lib/cn";
import { LAND_MASK, MASK_W, MASK_H } from "@/lib/landmask";
import { EVEREST, HARRISONBURG, KATHMANDU } from "@/config/site";

/* ★ Flagship 3 — sakriya's globe, re-cast in brass on walnut and scripted by scroll:
     0.00–0.28  spin to the Himalayas; Everest pulses
     0.28–0.66  the arc flies Kathmandu → Harrisonburg, a packet riding it
     0.66–1.00  swing to Virginia and fall toward Harrisonburg, handing off to Visit
   You can still drag it (inertia), it springs back to the script. Land-mask dot field,
   astrolabe rings and clean teardown are sakriya's. */

const R = 2.05;
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (a: number, b: number, v: number) => {
  const t = clamp((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};

function latLon(lat: number, lon: number, r: number) {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lon + 180) * Math.PI) / 180;
  return new THREE.Vector3(-r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta));
}

/* Globe rotation (x, y) that brings a surface point to face the camera (+z). */
function facing(v: THREE.Vector3) {
  const ry = Math.atan2(-v.x, v.z);
  const z1 = -v.x * Math.sin(ry) + v.z * Math.cos(ry);
  const rx = Math.atan2(v.y, z1);
  return { rx, ry };
}

export default function Globe() {
  const section = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stage, setStage] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const sec = section.current;
    if (!canvas || !sec) return;
    const phone = matchMedia("(max-width: 767px)").matches;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let renderer: THREE.WebGLRenderer;
    try {
      THREE.ColorManagement.enabled = false;
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    } catch {
      return;
    }
    renderer.setPixelRatio(Math.min(devicePixelRatio, phone ? 1.5 : 2));
    renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(0, 0, 7.4);
    // rig lifts the whole instrument a little so the caption has room underneath
    const rig = new THREE.Group();
    scene.add(rig);
    const globe = new THREE.Group();
    rig.add(globe);

    const glowTex = (inner: string, outer: string) => {
      const c = document.createElement("canvas");
      c.width = c.height = 64;
      const g = c.getContext("2d")!;
      const grd = g.createRadialGradient(32, 32, 2, 32, 32, 30);
      grd.addColorStop(0, inner);
      grd.addColorStop(0.35, outer);
      grd.addColorStop(1, "rgba(0,0,0,0)");
      g.fillStyle = grd;
      g.fillRect(0, 0, 64, 64);
      return new THREE.CanvasTexture(c);
    };
    const haloTex = glowTex("rgba(255,240,205,1)", "rgba(220,191,123,0.45)");
    const warmTex = glowTex("rgba(238,211,165,0.18)", "rgba(182,158,112,0.07)");

    // lamp-warmth behind the instrument
    const aura = new THREE.Sprite(new THREE.SpriteMaterial({ map: warmTex, transparent: true, depthTest: false, depthWrite: false, blending: THREE.AdditiveBlending }));
    aura.position.z = -1.25;
    aura.scale.set(6.2, 6.2, 1);
    aura.renderOrder = -10;
    rig.add(aura);

    // astrolabe dial
    const astro = new THREE.Group();
    astro.rotation.z = -0.055;
    rig.add(astro);
    const brass = new THREE.MeshBasicMaterial({ color: 0xc9ae78, transparent: true, opacity: 0.4, depthWrite: false });
    astro.add(new THREE.Mesh(new THREE.TorusGeometry(R * 1.17, 0.009, 8, 192), brass));
    const tick: number[] = [];
    const tr = R * 1.205;
    for (let i = 0; i < 96; i++) {
      const a = (i / 96) * Math.PI * 2;
      const len = i % 12 === 0 ? 0.105 : i % 4 === 0 ? 0.07 : 0.038;
      tick.push(Math.cos(a) * (tr - len), Math.sin(a) * (tr - len), 0, Math.cos(a) * tr, Math.sin(a) * tr, 0);
    }
    const tg = new THREE.BufferGeometry();
    tg.setAttribute("position", new THREE.BufferAttribute(new Float32Array(tick), 3));
    astro.add(new THREE.LineSegments(tg, new THREE.LineBasicMaterial({ color: 0xdcbf7b, transparent: true, opacity: 0.32, depthWrite: false })));
    const orbitA = new THREE.Mesh(new THREE.TorusGeometry(R * 1.095, 0.006, 6, 192), brass.clone());
    (orbitA.material as THREE.MeshBasicMaterial).opacity = 0.22;
    orbitA.rotation.set(1.04, 0.18, -0.22);
    astro.add(orbitA);
    const orbitB = new THREE.Mesh(new THREE.TorusGeometry(R * 1.13, 0.005, 6, 192), brass.clone());
    (orbitB.material as THREE.MeshBasicMaterial).opacity = 0.14;
    orbitB.rotation.set(0.48, 0.82, 0.34);
    astro.add(orbitB);

    // walnut occluder
    // (explicit render order: the occluder must write depth before any dots draw, whatever the
    // transparent sort decides)
    const occluder = new THREE.Mesh(new THREE.SphereGeometry(R * 0.985, 48, 48), new THREE.MeshBasicMaterial({ color: 0x1a120d, transparent: true, opacity: 0.86 }));
    occluder.renderOrder = -5;
    globe.add(occluder);

    // land mask → dots
    const bin = atob(LAND_MASK);
    const mask = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) mask[i] = bin.charCodeAt(i);
    const isLand = (lat: number, lon: number) => {
      const x = Math.min(MASK_W - 1, Math.max(0, Math.floor(((lon + 180) / 360) * MASK_W)));
      const y = Math.min(MASK_H - 1, Math.max(0, Math.floor(((90 - lat) / 180) * MASK_H)));
      const idx = y * MASK_W + x;
      return (mask[idx >> 3] & (128 >> (idx & 7))) !== 0;
    };
    const land: number[] = [];
    const sea: number[] = [];
    const Nd = phone ? 11000 : 16000;
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < Nd; i++) {
      const yy = 1 - (i / (Nd - 1)) * 2;
      const rad = Math.sqrt(1 - yy * yy);
      const th = golden * i;
      const vx = Math.cos(th) * rad;
      const vz = Math.sin(th) * rad;
      const lat = (Math.asin(yy) * 180) / Math.PI;
      let lon = (Math.atan2(vz, -vx) * 180) / Math.PI - 180;
      if (lon < -180) lon += 360;
      if (isLand(lat, lon)) land.push(vx * R, yy * R, vz * R);
      else if (i % 9 === 0) sea.push(vx * R, yy * R, vz * R);
    }
    // round dots (PointsMaterial alone draws squares, which show once the camera falls in)
    const dc = document.createElement("canvas");
    dc.width = dc.height = 32;
    const dg = dc.getContext("2d")!;
    dg.fillStyle = "#fff";
    dg.beginPath();
    dg.arc(16, 16, 14, 0, Math.PI * 2);
    dg.fill();
    const dotTex = new THREE.CanvasTexture(dc);
    const pts = (arr: number[], color: number, size: number, op: number) => {
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(arr), 3));
      return new THREE.Points(g, new THREE.PointsMaterial({ color, size, map: dotTex, alphaTest: 0.35, transparent: true, opacity: op, depthWrite: false }));
    };
    const LAND_SIZE = phone ? 0.056 : 0.042;
    const landPts = pts(land, 0xe3cc9a, LAND_SIZE, 0.95);
    landPts.renderOrder = 1;
    globe.add(landPts);
    globe.add(pts(sea, 0x9b7e53, phone ? 0.04 : 0.032, 0.22));

    // graticule
    const lineMat = new THREE.LineBasicMaterial({ color: 0x9b7e53, transparent: true, opacity: 0.14 });
    const ring = (rad: number, y: number) => {
      const p: THREE.Vector3[] = [];
      for (let a = 0; a <= 128; a++) {
        const t = (a / 128) * Math.PI * 2;
        p.push(new THREE.Vector3(Math.cos(t) * rad, y, Math.sin(t) * rad));
      }
      return new THREE.Line(new THREE.BufferGeometry().setFromPoints(p), lineMat);
    };
    [-45, 0, 45].forEach((d) => {
      const lr = (d * Math.PI) / 180;
      globe.add(ring(R * Math.cos(lr), R * Math.sin(lr)));
    });
    [0, 60, 120].forEach((deg) => {
      const p: THREE.Vector3[] = [];
      for (let a = 0; a <= 128; a++) {
        const t = (a / 128) * Math.PI * 2;
        p.push(new THREE.Vector3(Math.cos(t) * R, Math.sin(t) * R, 0));
      }
      const m = new THREE.Line(new THREE.BufferGeometry().setFromPoints(p), lineMat);
      m.rotation.y = (deg * Math.PI) / 180;
      globe.add(m);
    });

    // pins
    const KTM = latLon(KATHMANDU.lat, KATHMANDU.lng, R);
    const EVT = latLon(EVEREST.lat, EVEREST.lng, R);
    const HBG = latLon(HARRISONBURG.lat, HARRISONBURG.lng, R);
    const pin = (v: THREE.Vector3, size: number) => {
      const m = new THREE.Mesh(new THREE.SphereGeometry(size, 16, 16), new THREE.MeshBasicMaterial({ color: 0xf2e2b6 }));
      m.position.copy(v.clone().multiplyScalar(1.004));
      globe.add(m);
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: haloTex, transparent: true, depthWrite: false }));
      s.position.copy(v.clone().multiplyScalar(1.02));
      s.scale.set(0.38, 0.38, 1);
      globe.add(s);
      return s;
    };
    const everestHalo = pin(EVT, 0.03);
    pin(KTM, 0.036);
    const hbgHalo = pin(HBG, 0.042);

    // "you are here" ripples at Harrisonburg, for the landing
    const ripples: THREE.Mesh[] = [];
    const rippleMat = new THREE.MeshBasicMaterial({ color: 0xf2e2b6, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false });
    for (let i = 0; i < 3; i++) {
      const m = new THREE.Mesh(new THREE.RingGeometry(0.1, 0.108, 64), rippleMat.clone());
      m.position.copy(HBG.clone().multiplyScalar(1.006));
      m.lookAt(HBG.clone().multiplyScalar(2));
      globe.add(m);
      ripples.push(m);
    }

    // arc
    const mid = KTM.clone().add(HBG).normalize().multiplyScalar(R * 1.62);
    const curve = new THREE.QuadraticBezierCurve3(KTM.clone().multiplyScalar(1.01), mid, HBG.clone().multiplyScalar(1.01));
    const ARC_N = 220;
    const arcGeo = new THREE.BufferGeometry().setFromPoints(curve.getPoints(ARC_N));
    arcGeo.setDrawRange(0, 0);
    const arc = new THREE.Line(arcGeo, new THREE.LineBasicMaterial({ color: 0xf2e2b6, transparent: true, opacity: 0.9 }));
    globe.add(arc);
    const packet = new THREE.Sprite(new THREE.SpriteMaterial({ map: haloTex, transparent: true, depthWrite: false }));
    packet.scale.set(0.26, 0.26, 1);
    globe.add(packet);

    // script keyframes
    const fEvt = facing(EVT);
    const midSurface = curve.getPoint(0.5).normalize().multiplyScalar(R);
    const fMid = facing(midSurface);
    const fHbg = facing(HBG);
    const unwrap = (a: number, ref: number) => {
      let x = a;
      while (x - ref > Math.PI) x -= Math.PI * 2;
      while (x - ref < -Math.PI) x += Math.PI * 2;
      return x;
    };
    fEvt.ry = unwrap(fEvt.ry, 3.6);
    fMid.ry = unwrap(fMid.ry, fEvt.ry);
    fHbg.ry = unwrap(fHbg.ry, fMid.ry);

    // drag with inertia (offset springs back to the script)
    const off = { y: 0, x: 0, vy: 0, vx: 0 };
    let dragging = false;
    let lx = 0;
    let ly = 0;
    let lt = 0;
    const down = (e: PointerEvent) => {
      dragging = true;
      lx = e.clientX;
      ly = e.clientY;
      lt = e.timeStamp;
      off.vx = off.vy = 0;
      canvas.setPointerCapture(e.pointerId);
    };
    const move = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - lx;
      const dy = e.clientY - ly;
      const dt = Math.max((e.timeStamp - lt) / 1000, 1 / 240);
      off.y += dx * 0.006;
      off.x = clamp(off.x + dy * 0.004, -0.6, 0.6);
      off.vy = (dx * 0.006) / dt;
      off.vx = (dy * 0.004) / dt;
      lx = e.clientX;
      ly = e.clientY;
      lt = e.timeStamp;
    };
    const up = () => {
      dragging = false;
    };
    canvas.addEventListener("pointerdown", down);
    canvas.addEventListener("pointermove", move);
    canvas.addEventListener("pointerup", up);
    canvas.addEventListener("pointercancel", up);

    // fit the astrolabe (not the globe) to the frame: ~78% of height on wide screens, ~94% of
    // width on portrait phones, lifted so the caption sits underneath
    let baseZ = 7.4;
    const size = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.fov = 38;
      camera.updateProjectionMatrix();
      const half = Math.tan((camera.fov * Math.PI) / 360);
      const fitR = R * 1.24;
      const byH = fitR / (half * 0.76);
      const byW = fitR / (half * camera.aspect * 0.94);
      baseZ = Math.max(byH, byW);
      rig.position.y = fitR * (w < h ? 0.2 : 0.1);
    };
    const ro = new ResizeObserver(size);
    ro.observe(canvas);
    size();

    let raf = 0;
    let visible = false;
    let last = performance.now();
    let p = 0;
    let lastStage = -1;
    const t0 = performance.now();
    const frame = (now: number) => {
      raf = 0;
      if (!visible) return;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const t = (now - t0) / 1000;
      const r = sec.getBoundingClientRect();
      const target = clamp(-r.top / (r.height - innerHeight));
      p += (target - p) * (1 - Math.exp(-dt * 6));

      // scripted orientation
      const a = smooth(0, 0.24, p);
      const b = smooth(0.3, 0.56, p);
      const c = smooth(0.58, 0.78, p);
      let ry = 3.6 + (fEvt.ry - 3.6) * a;
      let rx = 0.42 + (fEvt.rx - 0.42) * a;
      // over the arc we look from a lower latitude than its midpoint so the flight bows upward
      // instead of reading as a straight line across the pole
      const midRx = fMid.rx * 0.45;
      ry += (fMid.ry - fEvt.ry) * b;
      rx += (midRx - fEvt.rx) * b;
      ry += (fHbg.ry - fMid.ry) * c;
      rx += (fHbg.rx - midRx) * c;
      if (!dragging) {
        off.y += off.vy * dt;
        off.x += off.vx * dt;
        off.vy *= Math.exp(-4 * dt);
        off.vx *= Math.exp(-4 * dt);
        off.y *= Math.exp(-1.6 * dt);
        off.x *= Math.exp(-1.6 * dt);
      }
      globe.rotation.y = ry + off.y + (reduce ? 0 : Math.sin(t * 0.25) * 0.02 * (1 - a));
      globe.rotation.x = rx + off.x;

      // arc + packet
      const arcP = smooth(0.3, 0.6, p);
      arcGeo.setDrawRange(0, Math.floor(arcP * ARC_N) + 1);
      arc.visible = arcP > 0.002;
      packet.visible = arcP > 0.002 && arcP < 0.999;
      packet.position.copy(curve.getPoint(Math.max(0.001, arcP)));
      packet.scale.setScalar(0.22 + Math.sin(t * 8) * 0.03);

      // pulses
      const pulseE = 0.38 + (Math.sin(t * 3.2) * 0.5 + 0.5) * 0.35 * (1 - b);
      everestHalo.scale.set(pulseE * (1 + a * 0.6), pulseE * (1 + a * 0.6), 1);
      // the fall toward Harrisonburg
      const z = smooth(0.74, 1, p);
      camera.position.z = baseZ * (1 - z * 0.5);
      const near = camera.position.z / baseZ;
      (landPts.material as THREE.PointsMaterial).size = LAND_SIZE * (0.55 + 0.45 * near);
      const pulseH = 0.38 + (Math.sin(t * 3.2 + 1) * 0.5 + 0.5) * 0.3 * (0.4 + c);
      const hs = pulseH * (1 + c * 0.5) * (0.6 + 0.4 * near);
      hbgHalo.scale.set(hs, hs, 1);
      ripples.forEach((m, i) => {
        const k = (t * 0.45 + i / 3) % 1;
        m.scale.setScalar(0.6 + k * 3.4);
        (m.material as THREE.MeshBasicMaterial).opacity = c * (1 - k) * 0.55;
      });
      astro.scale.setScalar(1 + z * 0.9);
      (astro.children[0] as THREE.Mesh).visible = z < 0.7;
      orbitA.rotation.z = -0.22 + Math.sin(t * 0.18) * 0.045;
      orbitB.rotation.z = 0.34 + Math.sin(t * 0.14 + 1.8) * 0.035;

      renderer.render(scene, camera);

      const st = p < 0.28 ? 0 : p < 0.66 ? 1 : 2;
      if (st !== lastStage) {
        lastStage = st;
        setStage(st);
      }
      raf = requestAnimationFrame(frame);
    };
    const io = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting;
        if (visible && !raf) {
          last = performance.now();
          raf = requestAnimationFrame(frame);
        }
      },
      { rootMargin: "100px 0px" },
    );
    io.observe(sec);
    setReady(true);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      canvas.removeEventListener("pointerdown", down);
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerup", up);
      canvas.removeEventListener("pointercancel", up);
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        m.geometry?.dispose();
        const mats = Array.isArray(m.material) ? m.material : m.material ? [m.material] : [];
        mats.forEach((mt) => {
          (mt as THREE.SpriteMaterial).map?.dispose();
          mt.dispose();
        });
      });
      renderer.dispose();
      THREE.ColorManagement.enabled = true;
    };
  }, []);

  const lines = [
    { k: "Sagarmatha · 27.99° N, 86.93° E", t: "It starts at 8,848.86 metres." },
    { k: "Kathmandu → Harrisonburg", t: "7,752 miles from the roof of the world…" },
    { k: "38.45° N, 78.87° W", t: "…to 258 Reservoir Street." },
  ];

  return (
    <section ref={section} aria-label="From Everest to Harrisonburg" className="globe-section relative h-[260svh]">
      <div className="sticky top-0 flex h-[100svh] items-center justify-center overflow-hidden">
        <div aria-hidden="true" className="lamp-glow left-1/2 top-1/2 h-[80vmin] w-[80vmin] -translate-x-1/2 -translate-y-1/2" />
        <canvas
          ref={canvasRef}
          className={cn("absolute inset-0 h-full w-full cursor-grab touch-pan-y transition-opacity duration-1000 active:cursor-grabbing", ready ? "opacity-100" : "opacity-0")}
          role="img"
          aria-label="Globe: an arc flies from Kathmandu, near Everest, to Harrisonburg, Virginia"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-[9svh] z-[2] px-6 text-center md:bottom-[11svh]">
          {lines.map((l, i) => (
            <div key={i} className={cn("globe-line absolute inset-x-0", stage === i && "is-on")} aria-hidden={stage !== i}>
              <p className="caps text-[10px] text-brass">{l.k}</p>
              <p className="display mt-2 text-[clamp(1.8rem,5.4vw,3.4rem)] leading-tight text-brass-hi [text-shadow:0_2px_24px_rgba(0,0,0,.7)]">{l.t}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
