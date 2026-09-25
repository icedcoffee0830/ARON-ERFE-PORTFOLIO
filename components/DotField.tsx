"use client";

import { useEffect, useRef } from "react";

/*
  Interactive dot grid drawn on a canvas behind the hero.
  - A slow wave keeps it gently moving.
  - Dots near the pointer are pushed away and brighten; the closest take the accent colour.
  Colours come from the page's CSS tokens, so it follows light and dark mode.
  Runs only while on screen and the tab is visible; draws a still grid for reduced motion.
  Pointer position lives in refs, never React state, so nothing re-renders per frame.
*/

const GAP = 26; // px between dots
const RADIUS = 1.25; // dot radius
const REACH = 170; // pointer influence radius
const PUSH = 14; // max displacement near the pointer

type RGB = [number, number, number];

function readColor(name: string, fallback: RGB): RGB {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const probe = document.createElement("canvas").getContext("2d");
  if (!probe || !value) return fallback;
  probe.fillStyle = value;
  const hex = probe.fillStyle; // normalised to #rrggbb
  const m = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!m) return fallback;
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function DotField({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const scheme = window.matchMedia("(prefers-color-scheme: dark)");
    let fg: RGB = [20, 20, 20];
    let accent: RGB = [209, 57, 15];
    const loadColors = () => {
      fg = readColor("--fg", fg);
      accent = readColor("--accent", accent);
    };
    loadColors();

    let width = 0;
    let height = 0;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    // Pointer in canvas coordinates; eased towards the target for smooth trailing.
    const target = { x: -9999, y: -9999, active: false };
    const pointer = { x: -9999, y: -9999, strength: 0 };
    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      target.x = e.clientX - rect.left;
      target.y = e.clientY - rect.top;
      target.active = target.y > -REACH && target.y < rect.height + REACH;
    };
    const onLeave = () => (target.active = false);

    const draw = (t: number) => {
      ctx.clearRect(0, 0, width, height);
      pointer.x += (target.x - pointer.x) * 0.12;
      pointer.y += (target.y - pointer.y) * 0.12;
      pointer.strength += ((target.active ? 1 : 0) - pointer.strength) * 0.06;

      const time = t / 1000;
      const cols = Math.ceil(width / GAP) + 1;
      const rows = Math.ceil(height / GAP) + 1;
      const offX = (width - (cols - 1) * GAP) / 2;
      const offY = (height - (rows - 1) * GAP) / 2;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const bx = offX + c * GAP;
          const by = offY + r * GAP;
          // Ambient wave: a slow ripple across the grid.
          const wave = Math.sin(time * 0.6 + bx * 0.012 + by * 0.018);
          let x = bx + wave * 1.6;
          let y = by + Math.cos(time * 0.5 + bx * 0.01) * 1.6;
          let alpha = 0.14 + wave * 0.05;
          let size = RADIUS;
          let near = 0;

          if (pointer.strength > 0.01) {
            const dx = x - pointer.x;
            const dy = y - pointer.y;
            const dist = Math.hypot(dx, dy);
            if (dist < REACH) {
              near = (1 - dist / REACH) ** 2 * pointer.strength;
              const k = (near * PUSH) / (dist || 1);
              x += dx * k;
              y += dy * k;
              alpha += near * 0.55;
              size += near * 1.3;
            }
          }

          const [cr, cg, cb] =
            near > 0.35
              ? accent.map((v, i) => Math.round(fg[i] + (v - fg[i]) * Math.min(1, (near - 0.35) * 2.2))) as RGB
              : fg;
          ctx.fillStyle = `rgba(${cr},${cg},${cb},${Math.min(alpha, 0.85)})`;
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    let frame = 0;
    let visible = true;
    const loop = (t: number) => {
      draw(t);
      frame = requestAnimationFrame(loop);
    };
    const start = () => {
      cancelAnimationFrame(frame);
      if (reduce.matches) {
        draw(0);
        return;
      }
      if (visible && document.visibilityState === "visible") frame = requestAnimationFrame(loop);
    };
    const stop = () => cancelAnimationFrame(frame);

    resize();
    start();

    const ro = new ResizeObserver(() => {
      resize();
      if (reduce.matches) draw(0);
    });
    ro.observe(canvas);

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
      else stop();
    });
    io.observe(canvas);

    const onVisibility = () => (document.visibilityState === "visible" ? start() : stop());
    const onScheme = () => {
      loadColors();
      if (reduce.matches) draw(0);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    document.addEventListener("visibilitychange", onVisibility);
    scheme.addEventListener("change", onScheme);
    reduce.addEventListener("change", start);

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
      scheme.removeEventListener("change", onScheme);
      reduce.removeEventListener("change", start);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden className={`pointer-events-none ${className}`} />;
}
