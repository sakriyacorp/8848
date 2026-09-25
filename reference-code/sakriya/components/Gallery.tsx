"use client";

import { useEffect, useRef } from "react";
import { PHOTO_SETS } from "@/lib/photos";

type Props = {
  setKey: string;
  label: string;
  frameClass: string; // e.g. "pframe glass big" or "jframe glass"
  delay?: string;
};

export default function Gallery({ setKey, label, frameClass, delay }: Props) {
  const frameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const list = PHOTO_SETS[setKey] || [];
    if (!list.length) return;
    const stage = frame.querySelector<HTMLElement>(".gstage")!;
    const count = frame.querySelector<HTMLElement>(".gcount");
    let idx = 0, lock = false, warmed = false;
    const timeouts: Array<ReturnType<typeof setTimeout>> = [];

    const setCount = () => {
      if (count) count.textContent = `${idx + 1} / ${list.length}`;
    };
    const spawn = (i: number, dir: number) => {
      const img = document.createElement("img");
      img.className = "gimg " + (dir >= 0 ? "enter-r" : "enter-l");
      img.alt = `${label} photo ${i + 1}`;
      img.src = list[i];
      stage.appendChild(img);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          img.classList.remove("enter-r", "enter-l");
          img.classList.add("active");
        });
      });
      return img;
    };
    const warm = () => {
      if (warmed) return;
      warmed = true;
      list.forEach((src, i) => {
        if (i > 0) { const im = new Image(); im.src = src; }
      });
    };

    let curImg = spawn(0, 1);
    setCount();
    if (list.length < 2) {
      frame.querySelectorAll<HTMLElement>(".gnav,.gcount").forEach((n) => {
        n.style.display = "none";
      });
      return () => { stage.innerHTML = ""; };
    }

    const clickH = (e: MouseEvent) => {
      warm();
      if (lock) return;
      const r = frame.getBoundingClientRect();
      const dir = e.clientX - r.left < r.width / 2 ? -1 : 1;
      lock = true;
      idx = (idx + dir + list.length) % list.length;
      const old = curImg;
      old.classList.remove("active");
      old.classList.add(dir > 0 ? "exit-l" : "exit-r");
      curImg = spawn(idx, dir);
      setCount();
      timeouts.push(
        setTimeout(() => {
          if (old.parentNode) old.parentNode.removeChild(old);
          lock = false;
        }, 620)
      );
    };
    frame.addEventListener("pointerenter", warm);
    frame.addEventListener("click", clickH);

    return () => {
      frame.removeEventListener("pointerenter", warm);
      frame.removeEventListener("click", clickH);
      timeouts.forEach(clearTimeout);
      stage.innerHTML = "";
    };
  }, [setKey, label]);

  return (
    <div
      ref={frameRef}
      className={`${frameClass} gallery reveal`}
      style={delay ? { transitionDelay: delay } : undefined}
    >
      <div className="gstage" />
      <span className="gnav left">‹</span>
      <span className="gnav right">›</span>
      <span className="gscrim" />
      <span className="plabel">{label}</span>
      <span className="gcount" />
    </div>
  );
}
