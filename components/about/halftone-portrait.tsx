"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

interface HalftonePortraitProps {
  /** No real photograph exists in the repo yet. When absent, this renders
   *  the site's established hairline placeholder and does nothing else —
   *  no canvas, no listeners, no animation frame loop. The moment a real
   *  photo is added, the dot-halftone rendering activates with no change
   *  needed at the call site. */
  src?: string;
  alt: string;
}

// Client Component. A real <Image> of the source photograph always exists
// underneath the canvas with correct alt text, so accessibility never
// depends on the canvas rendering at all — the canvas itself is
// aria-hidden, a decorative duplicate (02-architecture.md).
//
// Draws once, immediately, on load and on resize. The cursor-scatter loop
// only starts for a fine pointer with no reduced-motion preference; static
// only otherwise — confirmed by no requestAnimationFrame call happening in
// either of those cases, not just by intent.
export function HalftonePortrait({ src, alt }: HalftonePortraitProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!src) return;
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!container || !canvas || !ctx) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const fine = window.matchMedia("(pointer: fine)").matches;

    const SAMPLE = 64;
    let points: Array<{
      hx: number;
      hy: number;
      x: number;
      y: number;
      vx: number;
      vy: number;
      lum: number;
    }> = [];
    let mouseX = -9999;
    let mouseY = -9999;
    let raf = 0;

    const image = new window.Image();
    image.src = src;

    function inkColor(): string {
      return (
        getComputedStyle(document.documentElement)
          .getPropertyValue("--color-ink")
          .trim() || "#1b1a17"
      );
    }

    function dotFor(lum: number): { r: number; a: number } | null {
      const v = Math.pow(
        Math.max(0, Math.min(1, (1 - lum - 0.08) / 0.8)),
        0.9,
      );
      if (v < 0.05) return null;
      return { r: 0.6 + v * 2.4, a: 0.3 + v * 0.7 };
    }

    function layout() {
      const width = container!.clientWidth;
      const height = container!.clientHeight;
      if (!width || !height || !image.complete) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

      const off = document.createElement("canvas");
      off.width = SAMPLE;
      off.height = SAMPLE;
      const octx = off.getContext("2d");
      if (!octx) return;
      octx.drawImage(image, 0, 0, SAMPLE, SAMPLE);
      const data = octx.getImageData(0, 0, SAMPLE, SAMPLE).data;

      const gap = Math.min(width, height) / SAMPLE;
      const offsetX = (width - SAMPLE * gap) / 2;
      const offsetY = (height - SAMPLE * gap) / 2;

      points = [];
      for (let y = 0; y < SAMPLE; y++) {
        for (let x = 0; x < SAMPLE; x++) {
          const i = (y * SAMPLE + x) * 4;
          const lum =
            (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114) /
            255;
          const px = offsetX + x * gap;
          const py = offsetY + y * gap;
          points.push({ hx: px, hy: py, x: px, y: py, vx: 0, vy: 0, lum });
        }
      }

      drawStatic();
    }

    function drawStatic() {
      const width = container!.clientWidth;
      const height = container!.clientHeight;
      ctx!.clearRect(0, 0, width, height);
      ctx!.fillStyle = inkColor();
      for (const p of points) {
        const dot = dotFor(p.lum);
        if (!dot) continue;
        ctx!.globalAlpha = dot.a;
        ctx!.beginPath();
        ctx!.arc(p.hx, p.hy, dot.r, 0, Math.PI * 2);
        ctx!.fill();
      }
      ctx!.globalAlpha = 1;
    }

    function tick() {
      const width = container!.clientWidth;
      const height = container!.clientHeight;
      ctx!.clearRect(0, 0, width, height);
      ctx!.fillStyle = inkColor();
      for (const p of points) {
        const dx = p.x - mouseX;
        const dy = p.y - mouseY;
        const d2 = dx * dx + dy * dy;
        if (d2 < 6400) {
          const d = Math.sqrt(d2) || 1;
          const force = ((80 - d) / 80) * 2.4;
          p.vx += (dx / d) * force;
          p.vy += (dy / d) * force;
        }
        p.vx += (p.hx - p.x) * 0.06;
        p.vy += (p.hy - p.y) * 0.06;
        p.vx *= 0.82;
        p.vy *= 0.82;
        p.x += p.vx;
        p.y += p.vy;

        const dot = dotFor(p.lum);
        if (!dot) continue;
        ctx!.globalAlpha = dot.a;
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, dot.r, 0, Math.PI * 2);
        ctx!.fill();
      }
      ctx!.globalAlpha = 1;
      raf = requestAnimationFrame(tick);
    }

    function onPointerMove(event: PointerEvent) {
      const rect = container!.getBoundingClientRect();
      mouseX = event.clientX - rect.left;
      mouseY = event.clientY - rect.top;
    }

    function onPointerLeave() {
      mouseX = -9999;
      mouseY = -9999;
    }

    image.onload = () => {
      layout();
      if (reduced || !fine) return;
      container!.addEventListener("pointermove", onPointerMove);
      container!.addEventListener("pointerleave", onPointerLeave);
      raf = requestAnimationFrame(tick);
    };

    const resizeObserver = new ResizeObserver(() => layout());
    resizeObserver.observe(container);

    // M8: inkColor() already reads --color-ink fresh on every call, so a
    // theme change just needs a redraw. drawStatic() is safe to call even
    // while the pointer-driven tick() loop is running (fine pointer, no
    // reduced motion) — the next animation frame simply overwrites it with
    // the same colour a moment later. This is one of the two places
    // 01-vision.md's colour doctrine allows a component to branch on theme
    // in JavaScript at all; every other component's theme response is
    // CSS-only.
    const themeObserver = new MutationObserver(() => drawStatic());
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => {
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      themeObserver.disconnect();
      container.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("pointerleave", onPointerLeave);
    };
  }, [src]);

  return (
    <div
      ref={containerRef}
      className="relative aspect-4/5 w-full overflow-hidden border border-ink/16"
    >
      {src ? (
        <>
          <Image
            src={src}
            alt={alt}
            fill
            sizes="(min-width: 768px) 40vw, 100vw"
            className="object-cover"
          />
          <canvas
            ref={canvasRef}
            aria-hidden="true"
            className="absolute inset-0 h-full w-full bg-ivory"
          />
        </>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,color-mix(in_srgb,var(--color-ink)_16%,transparent)_10px,color-mix(in_srgb,var(--color-ink)_16%,transparent)_11px)]">
          <span className="bg-ivory px-3 py-1.5 font-mono text-meta text-ink/45 uppercase tracking-[0.1em]">
            Portrait to follow
          </span>
        </div>
      )}
    </div>
  );
}
