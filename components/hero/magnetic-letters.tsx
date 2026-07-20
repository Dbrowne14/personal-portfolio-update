"use client";

import { useEffect, useRef } from "react";

interface MagneticLine {
  text: string;
  variant: "solid" | "outline";
}

interface MagneticLettersProps {
  lines: MagneticLine[];
}

// Client-only physics for the hero name. Decorative and duplicative of the
// accessible name set on the parent <h1> (see hero.tsx), so this whole
// subtree is aria-hidden. No-ops entirely — no listeners, no rAF loop — for
// coarse pointers or prefers-reduced-motion: those visitors get the exact
// same static markup with none of the interaction cost.
export function MagneticLetters({ lines }: MagneticLettersProps) {
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const fine = window.matchMedia("(pointer: fine)").matches;
    if (reduced || !fine) return;

    const letters = Array.from(
      stage.querySelectorAll<HTMLElement>("[data-letter]"),
    );
    const state = letters.map(() => ({ x: 0, y: 0, rot: 0 }));
    let mouseX = -9999;
    let mouseY = -9999;
    let raf = 0;

    // Settled once every letter is within a fraction of a pixel of its
    // target and the pointer is away — below that, per-frame movement is
    // visually imperceptible, so continuing to render it is pure idle cost
    // with no usability or feedback value (04-non-negotiables.md: "No
    // idle-looping animation"). tick() stops scheduling itself once
    // settled instead of running forever; onPointerMove restarts it.
    const REST_EPSILON = 0.02;

    function onPointerMove(event: PointerEvent) {
      const rect = stage!.getBoundingClientRect();
      mouseX = event.clientX - rect.left;
      mouseY = event.clientY - rect.top;
      if (!raf) raf = requestAnimationFrame(tick);
    }

    function onPointerLeave() {
      mouseX = -9999;
      mouseY = -9999;
      if (!raf) raf = requestAnimationFrame(tick);
    }

    function tick() {
      const stageRect = stage!.getBoundingClientRect();
      let settled = mouseX === -9999;
      letters.forEach((el, i) => {
        const r = el.getBoundingClientRect();
        const cx = r.left - stageRect.left + r.width / 2;
        const cy = r.top - stageRect.top + r.height / 2;
        const dx = cx - mouseX;
        const dy = cy - mouseY;
        const distance = Math.hypot(dx, dy);

        let targetX = 0;
        let targetY = 0;
        let targetRot = 0;
        if (distance < 230) {
          const force = (230 - distance) / 230;
          targetX = (dx / (distance || 1)) * force * 44;
          targetY = (dy / (distance || 1)) * force * 44;
          targetRot = (dx > 0 ? 1 : -1) * force * 6;
        }

        const s = state[i];
        s.x += (targetX - s.x) * 0.12;
        s.y += (targetY - s.y) * 0.12;
        s.rot += (targetRot - s.rot) * 0.12;
        if (
          Math.abs(targetX - s.x) > REST_EPSILON ||
          Math.abs(targetY - s.y) > REST_EPSILON ||
          Math.abs(targetRot - s.rot) > REST_EPSILON
        ) {
          settled = false;
        }
        el.style.transform = `translate(${s.x.toFixed(1)}px, ${s.y.toFixed(1)}px) rotate(${s.rot.toFixed(2)}deg)`;
      });
      raf = settled ? 0 : requestAnimationFrame(tick);
    }

    stage.addEventListener("pointermove", onPointerMove);
    stage.addEventListener("pointerleave", onPointerLeave);
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      stage.removeEventListener("pointermove", onPointerMove);
      stage.removeEventListener("pointerleave", onPointerLeave);
    };
  }, []);

  return (
    <div ref={stageRef} aria-hidden="true" className="flex select-none flex-col items-center">
      {lines.map((line) => (
        <div
          key={line.text}
          className="flex font-sans text-monument font-extrabold"
          style={
            line.variant === "outline"
              ? {
                  WebkitTextStroke: "1.5px var(--color-ink)",
                  color: "transparent",
                }
              : { color: "var(--color-ink)" }
          }
        >
          {line.text.split("").map((char, i) => (
            <span
              key={i}
              data-letter
              className="inline-block will-change-transform"
            >
              {char}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}
