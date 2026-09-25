"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { LAND_MASK, MASK_W, MASK_H } from "@/lib/landmask";

export default function Globe() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

    let renderer: THREE.WebGLRenderer | null = null;
    let scene: THREE.Scene | null = null;
    let raf: number | null = null;
    let alive = true;
    const cleanups: Array<() => void> = [];

    try {
      const wrap = canvas.parentElement as HTMLElement;
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      scene = new THREE.Scene();
      const activeScene = scene;
      const activeRenderer = renderer;
      const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
      camera.position.set(0, 0, 7.4);
      const globe = new THREE.Group();
      activeScene.add(globe);
      const R = 2.05;

      const latLon = (lat: number, lon: number, r: number) => {
        const phi = ((90 - lat) * Math.PI) / 180;
        const theta = ((lon + 180) * Math.PI) / 180;
        return new THREE.Vector3(
          -r * Math.sin(phi) * Math.cos(theta),
          r * Math.cos(phi),
          r * Math.sin(phi) * Math.sin(theta)
        );
      };

      /* ambient warmth behind the instrument */
      const makeInstrumentGlowTex = () => {
        const c = document.createElement("canvas");
        c.width = 256;
        c.height = 256;
        const g = c.getContext("2d")!;
        const grad = g.createRadialGradient(128, 128, 8, 128, 128, 126);
        grad.addColorStop(0, "rgba(224,152,92,0.14)");
        grad.addColorStop(0.43, "rgba(168,131,72,0.085)");
        grad.addColorStop(0.76, "rgba(115,72,37,0.035)");
        grad.addColorStop(1, "rgba(115,72,37,0)");
        g.fillStyle = grad;
        g.fillRect(0, 0, 256, 256);
        const texture = new THREE.CanvasTexture(c);
        texture.colorSpace = THREE.SRGBColorSpace;
        return texture;
      };
      const instrumentGlowTex = makeInstrumentGlowTex();
      const instrumentGlow = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: instrumentGlowTex,
          transparent: true,
          depthTest: false,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        })
      );
      instrumentGlow.position.z = -1.25;
      instrumentGlow.scale.set(5.8, 5.8, 1);
      instrumentGlow.renderOrder = -10;
      activeScene.add(instrumentGlow);

      /* astrolabe dial and orbital depth */
      const astrolabe = new THREE.Group();
      astrolabe.rotation.z = -0.055;
      activeScene.add(astrolabe);

      const brassMat = new THREE.MeshBasicMaterial({
        color: 0xc99857,
        transparent: true,
        opacity: 0.34,
        depthWrite: false,
      });
      const outerRing = new THREE.Mesh(
        new THREE.TorusGeometry(R * 1.17, 0.009, 8, 192),
        brassMat
      );
      astrolabe.add(outerRing);

      const tickPos: number[] = [];
      const tickRadius = R * 1.205;
      for (let i = 0; i < 96; i++) {
        const angle = (i / 96) * Math.PI * 2;
        const tickLength = i % 12 === 0 ? 0.105 : i % 4 === 0 ? 0.07 : 0.038;
        const inner = tickRadius - tickLength;
        tickPos.push(
          Math.cos(angle) * inner,
          Math.sin(angle) * inner,
          0,
          Math.cos(angle) * tickRadius,
          Math.sin(angle) * tickRadius,
          0
        );
      }
      const tickGeometry = new THREE.BufferGeometry();
      tickGeometry.setAttribute(
        "position",
        new THREE.BufferAttribute(new Float32Array(tickPos), 3)
      );
      astrolabe.add(
        new THREE.LineSegments(
          tickGeometry,
          new THREE.LineBasicMaterial({
            color: 0xd7ae72,
            transparent: true,
            opacity: 0.25,
            depthWrite: false,
          })
        )
      );

      const orbitMaterialA = new THREE.MeshBasicMaterial({
        color: 0xc99857,
        transparent: true,
        opacity: 0.2,
        depthWrite: false,
      });
      const orbitMaterialB = orbitMaterialA.clone();
      orbitMaterialB.opacity = 0.13;
      const orbitA = new THREE.Mesh(
        new THREE.TorusGeometry(R * 1.095, 0.006, 6, 192),
        orbitMaterialA
      );
      orbitA.rotation.set(1.04, 0.18, -0.22);
      astrolabe.add(orbitA);
      const orbitB = new THREE.Mesh(
        new THREE.TorusGeometry(R * 1.13, 0.005, 6, 192),
        orbitMaterialB
      );
      orbitB.rotation.set(0.48, 0.82, 0.34);
      astrolabe.add(orbitB);

      const finialGeometry = new THREE.SphereGeometry(0.025, 10, 10);
      const finialMaterial = new THREE.MeshBasicMaterial({ color: 0xe0a066 });
      [0, Math.PI / 2, Math.PI, (Math.PI * 3) / 2].forEach((angle) => {
        const finial = new THREE.Mesh(finialGeometry, finialMaterial);
        finial.position.set(
          Math.cos(angle) * tickRadius,
          Math.sin(angle) * tickRadius,
          0.015
        );
        astrolabe.add(finial);
      });

      /* occluder sphere */
      globe.add(
        new THREE.Mesh(
          new THREE.SphereGeometry(R * 0.985, 48, 48),
          new THREE.MeshBasicMaterial({ color: 0x140d08, transparent: true, opacity: 0.72 })
        )
      );

      /* land mask decode */
      const bin = atob(LAND_MASK);
      const maskBytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) maskBytes[i] = bin.charCodeAt(i);
      const isLand = (lat: number, lon: number) => {
        const x = Math.min(MASK_W - 1, Math.max(0, Math.floor(((lon + 180) / 360) * MASK_W)));
        const y = Math.min(MASK_H - 1, Math.max(0, Math.floor(((90 - lat) / 180) * MASK_H)));
        const idx = y * MASK_W + x;
        return (maskBytes[idx >> 3] & (128 >> (idx & 7))) !== 0;
      };

      /* world dot field */
      const landPos: number[] = [];
      const seaPos: number[] = [];
      const N = 16000;
      const golden = Math.PI * (3 - Math.sqrt(5));
      for (let i = 0; i < N; i++) {
        const yy = 1 - (i / (N - 1)) * 2;
        const rad = Math.sqrt(1 - yy * yy);
        const th = golden * i;
        const vx = Math.cos(th) * rad, vy = yy, vz = Math.sin(th) * rad;
        const lat = (Math.asin(vy) * 180) / Math.PI;
        let lon = (Math.atan2(vz, -vx) * 180) / Math.PI - 180;
        if (lon < -180) lon += 360;
        if (isLand(lat, lon)) landPos.push(vx * R, vy * R, vz * R);
        else if (i % 9 === 0) seaPos.push(vx * R, vy * R, vz * R);
      }
      const pointsFrom = (arr: number[], color: number, size: number, op: number) => {
        const g = new THREE.BufferGeometry();
        g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(arr), 3));
        return new THREE.Points(
          g,
          new THREE.PointsMaterial({ color, size, transparent: true, opacity: op })
        );
      };
      globe.add(pointsFrom(landPos, 0xe8d4b2, 0.024, 0.92));
      globe.add(pointsFrom(seaPos, 0xa88348, 0.02, 0.15));

      /* graticule */
      const lineMat = new THREE.LineBasicMaterial({ color: 0xa88348, transparent: true, opacity: 0.13 });
      const ring = (rad: number, y: number) => {
        const pts: THREE.Vector3[] = [];
        for (let a = 0; a <= 128; a++) {
          const t = (a / 128) * Math.PI * 2;
          pts.push(new THREE.Vector3(Math.cos(t) * rad, y, Math.sin(t) * rad));
        }
        return new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), lineMat);
      };
      [-45, 0, 45].forEach((latDeg) => {
        const lr = (latDeg * Math.PI) / 180;
        globe.add(ring(R * Math.cos(lr), R * Math.sin(lr)));
      });
      [0, 60, 120].forEach((deg) => {
        const pts: THREE.Vector3[] = [];
        for (let a = 0; a <= 128; a++) {
          const t = (a / 128) * Math.PI * 2;
          pts.push(new THREE.Vector3(Math.cos(t) * R, Math.sin(t) * R, 0));
        }
        const m = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), lineMat);
        m.rotation.y = (deg * Math.PI) / 180;
        globe.add(m);
      });

      /* pins: Kathmandu + Virginia */
      const KTM = latLon(27.7172, 85.324, R);
      const VA = latLon(38.4496, -78.8689, R);
      const makeHaloTex = () => {
        const c = document.createElement("canvas");
        c.width = 64;
        c.height = 64;
        const g = c.getContext("2d")!;
        const grad = g.createRadialGradient(32, 32, 2, 32, 32, 30);
        grad.addColorStop(0, "rgba(240,180,120,0.95)");
        grad.addColorStop(0.35, "rgba(224,152,92,0.45)");
        grad.addColorStop(1, "rgba(224,152,92,0)");
        g.fillStyle = grad;
        g.fillRect(0, 0, 64, 64);
        const texture = new THREE.CanvasTexture(c);
        texture.colorSpace = THREE.SRGBColorSpace;
        return texture;
      };
      const haloTex = makeHaloTex();
      const halos: THREE.Sprite[] = [];
      [KTM, VA].forEach((v) => {
        const pin = new THREE.Mesh(
          new THREE.SphereGeometry(0.045, 16, 16),
          new THREE.MeshBasicMaterial({ color: 0xe0985c })
        );
        pin.position.copy(v.clone().multiplyScalar(1.005));
        globe.add(pin);
        const sp = new THREE.Sprite(
          new THREE.SpriteMaterial({ map: haloTex, transparent: true, depthWrite: false })
        );
        sp.position.copy(v.clone().multiplyScalar(1.02));
        sp.scale.set(0.4, 0.4, 1);
        globe.add(sp);
        halos.push(sp);
      });

      /* arc + traveling packet */
      const mid = KTM.clone().add(VA).normalize().multiplyScalar(R * 1.55);
      const curve = new THREE.QuadraticBezierCurve3(
        KTM.clone().multiplyScalar(1.01),
        mid,
        VA.clone().multiplyScalar(1.01)
      );
      globe.add(
        new THREE.Line(
          new THREE.BufferGeometry().setFromPoints(curve.getPoints(80)),
          new THREE.LineBasicMaterial({ color: 0xe0985c, transparent: true, opacity: 0.75 })
        )
      );
      const packet = new THREE.Sprite(
        new THREE.SpriteMaterial({ map: haloTex, transparent: true, depthWrite: false })
      );
      packet.scale.set(0.22, 0.22, 1);
      packet.position.copy(curve.getPoint(0));
      globe.add(packet);

      /* time-based rotation, pointer capture, and inertial drag */
      globe.rotation.x = 0.42;
      let rotY = 3.6;
      let tRotY = 3.6;
      let tRotX = 0.42;
      let velocityY = 0;
      let velocityX = 0;
      let dragging = false;
      let activePointer: number | null = null;
      let lx = 0;
      let ly = 0;
      let lastPointerTime = 0;
      const t0 = performance.now();

      const renderFrame = (now: number, delta: number, advanceMotion: boolean) => {
        const t = (now - t0) / 1000;

        if (advanceMotion && !dragging && !reduceMotion) {
          tRotY += (0.17 + velocityY) * delta;
          tRotX = THREE.MathUtils.clamp(tRotX + velocityX * delta, -0.2, 0.9);
          const dragDecay = Math.exp(-5.4 * delta);
          velocityY *= dragDecay;
          velocityX *= dragDecay;
        }

        const ease = reduceMotion ? 1 : 1 - Math.exp(-9 * delta);
        rotY += (tRotY - rotY) * ease;
        globe.rotation.y = rotY;
        globe.rotation.x += (tRotX - globe.rotation.x) * ease;

        if (!reduceMotion) {
          halos.forEach((halo, i) => {
            const q = 1 + Math.sin(t * 2.4 + i * 1.6) * 0.22;
            halo.scale.set(0.4 * q, 0.4 * q, 1);
          });
          packet.position.copy(curve.getPoint((t * 0.12) % 1));
          orbitA.rotation.z = -0.22 + Math.sin(t * 0.18) * 0.045;
          orbitB.rotation.z = 0.34 + Math.sin(t * 0.14 + 1.8) * 0.035;
          instrumentGlow.material.opacity = 0.9 + Math.sin(t * 0.55) * 0.08;
        }

        activeRenderer.render(activeScene, camera);
      };

      const renderReducedMotionState = () => {
        if (!reduceMotion || !alive) return;
        renderFrame(performance.now(), 0, false);
      };

      const downH = (e: PointerEvent) => {
        if (activePointer !== null) return;
        activePointer = e.pointerId;
        dragging = true;
        velocityY = 0;
        velocityX = 0;
        lx = e.clientX;
        ly = e.clientY;
        lastPointerTime = e.timeStamp;
        canvas.setPointerCapture(e.pointerId);
      };
      const moveH = (e: PointerEvent) => {
        if (!dragging || e.pointerId !== activePointer) return;
        const dx = e.clientX - lx;
        const dy = e.clientY - ly;
        const deltaY = dx * 0.005;
        const deltaX = dy * 0.003;
        const sampleTime = Math.max((e.timeStamp - lastPointerTime) / 1000, 1 / 240);
        tRotY += deltaY;
        tRotX = Math.max(-0.2, Math.min(0.9, tRotX + deltaX));
        velocityY = THREE.MathUtils.lerp(velocityY, deltaY / sampleTime, 0.32);
        velocityX = THREE.MathUtils.lerp(velocityX, deltaX / sampleTime, 0.32);
        lx = e.clientX;
        ly = e.clientY;
        lastPointerTime = e.timeStamp;
        renderReducedMotionState();
      };
      const endPointer = (e: PointerEvent, cancelled = false) => {
        if (e.pointerId !== activePointer) return;
        dragging = false;
        activePointer = null;
        if (reduceMotion || cancelled) {
          velocityY = 0;
          velocityX = 0;
        }
        if (canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId);
        renderReducedMotionState();
      };
      const upH = (e: PointerEvent) => endPointer(e);
      const cancelH = (e: PointerEvent) => endPointer(e, true);
      const lostCaptureH = (e: PointerEvent) => {
        if (e.pointerId !== activePointer) return;
        dragging = false;
        activePointer = null;
        if (reduceMotion) {
          velocityY = 0;
          velocityX = 0;
        }
      };
      const keyH = (e: KeyboardEvent) => {
        const step = e.shiftKey ? 0.22 : 0.11;
        if (e.key === "ArrowLeft") tRotY -= step;
        else if (e.key === "ArrowRight") tRotY += step;
        else if (e.key === "ArrowUp") tRotX = Math.max(-0.2, tRotX - step * 0.6);
        else if (e.key === "ArrowDown") tRotX = Math.min(0.9, tRotX + step * 0.6);
        else if (e.key === "Home") {
          tRotY = 3.6;
          tRotX = 0.42;
        } else return;
        velocityY = 0;
        velocityX = 0;
        e.preventDefault();
        renderReducedMotionState();
      };
      canvas.addEventListener("pointerdown", downH);
      canvas.addEventListener("pointermove", moveH);
      canvas.addEventListener("pointerup", upH);
      canvas.addEventListener("pointercancel", cancelH);
      canvas.addEventListener("lostpointercapture", lostCaptureH);
      canvas.addEventListener("keydown", keyH);
      cleanups.push(() => {
        canvas.removeEventListener("pointerdown", downH);
        canvas.removeEventListener("pointermove", moveH);
        canvas.removeEventListener("pointerup", upH);
        canvas.removeEventListener("pointercancel", cancelH);
        canvas.removeEventListener("lostpointercapture", lostCaptureH);
        canvas.removeEventListener("keydown", keyH);
      });

      const size = () => {
        const w = Math.max(1, wrap.clientWidth);
        const h = Math.max(1, wrap.clientHeight || w);
        activeRenderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderReducedMotionState();
      };
      size();
      addEventListener("resize", size);
      cleanups.push(() => removeEventListener("resize", size));

      if (typeof ResizeObserver !== "undefined") {
        const resizeObserver = new ResizeObserver(size);
        resizeObserver.observe(wrap);
        cleanups.push(() => resizeObserver.disconnect());
      }

      let lastFrame = t0;
      const frame = (now: number) => {
        if (!alive) return;
        const delta = Math.min(Math.max((now - lastFrame) / 1000, 0), 0.05);
        lastFrame = now;
        renderFrame(now, delta, true);
        raf = requestAnimationFrame(frame);
      };
      if (reduceMotion) {
        renderFrame(t0, 0, false);
      } else {
        raf = requestAnimationFrame(frame);
      }
    } catch {
      canvas.style.display = "none";
    }

    return () => {
      alive = false;
      if (raf !== null) cancelAnimationFrame(raf);
      cleanups.forEach((fn) => fn());

      if (scene) {
        const geometries = new Set<THREE.BufferGeometry>();
        const materials = new Set<THREE.Material>();
        const textures = new Set<THREE.Texture>();
        scene.traverse((object) => {
          const renderable = object as THREE.Object3D & {
            geometry?: THREE.BufferGeometry;
            material?: THREE.Material | THREE.Material[];
          };
          if (renderable.geometry) geometries.add(renderable.geometry);
          const objectMaterials = Array.isArray(renderable.material)
            ? renderable.material
            : renderable.material
              ? [renderable.material]
              : [];
          objectMaterials.forEach((material) => materials.add(material));
        });
        materials.forEach((material) => {
          Object.values(material).forEach((value) => {
            if (value instanceof THREE.Texture) textures.add(value);
          });
        });
        textures.forEach((texture) => texture.dispose());
        materials.forEach((material) => material.dispose());
        geometries.forEach((geometry) => geometry.dispose());
        scene.clear();
      }

      if (renderer) {
        renderer.setAnimationLoop(null);
        renderer.renderLists.dispose();
        renderer.dispose();
      }
    };
  }, []);

  return (
    <div className="globe-wrap reveal" style={{ transitionDelay: ".2s" }}>
      <canvas
        id="globe"
        ref={canvasRef}
        role="img"
        tabIndex={0}
        aria-label="KTM ⇄ VA · drag to spin"
      >
        KTM ⇄ VA · drag to spin
      </canvas>
      <div className="globe-cap">KTM ⇄ VA · drag to spin</div>
    </div>
  );
}
