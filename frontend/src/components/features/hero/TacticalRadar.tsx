"use client";

import { useEffect, useRef } from "react";

// Original, license-safe VALORANT-flavoured backdrop: a top-down tactical radar
// scope — range rings, a slow cyan→violet sweep, and "agent" blips that ignite
// as the sweep passes them (echoing recon / minimap reads). Built from plain
// canvas primitives only, so nothing here reproduces Riot game art and it is
// safe to ship on a live, ad-supported site. Reduced-motion renders one static
// frame; cheap to run and self-disposing.

type RGB = readonly [number, number, number];

const FALLBACK_CYAN: RGB = [92, 198, 214];
const FALLBACK_VIOLET: RGB = [255,70,85];

function readRgb(varName: string, fallback: RGB): RGB {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  const m = /^#?([0-9a-f]{6})$/i.exec(raw);
  if (!m) return fallback;
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

const rgba = (c: RGB, a: number) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

// Deterministic blip field (fixed so the scene is stable across renders).
// angle in radians, radius as a 0..1 fraction of scope radius.
const BLIPS: ReadonlyArray<{ a: number; r: number }> = [
  { a: 0.35, r: 0.42 },
  { a: 1.15, r: 0.7 },
  { a: 2.0, r: 0.3 },
  { a: 2.7, r: 0.82 },
  { a: 3.5, r: 0.55 },
  { a: 4.25, r: 0.36 },
  { a: 5.0, r: 0.74 },
  { a: 5.7, r: 0.5 },
];

const TWO_PI = Math.PI * 2;
const SWEEP_SPEED = 0.55; // rad/s
const TRAIL = 1.15; // radians of fading wake behind the leading edge
const TRAIL_SLICES = 26;

type Lit = number[];
type Scope = { cx: number; cy: number; R: number };

const lerp = (a: RGB, b: RGB, t: number): RGB => [
  Math.round(a[0] + (b[0] - a[0]) * t),
  Math.round(a[1] + (b[1] - a[1]) * t),
  Math.round(a[2] + (b[2] - a[2]) * t),
];

function drawGrid(ctx: CanvasRenderingContext2D, s: Scope, cyan: RGB, violet: RGB) {
  ctx.lineWidth = 1;
  for (let i = 1; i <= 4; i++) {
    ctx.beginPath();
    ctx.arc(s.cx, s.cy, (s.R * i) / 4, 0, TWO_PI);
    ctx.strokeStyle = rgba(cyan, 0.06 + (4 - i) * 0.015);
    ctx.stroke();
  }
  for (let i = 0; i < 12; i++) {
    const ang = (i / 12) * TWO_PI;
    ctx.beginPath();
    ctx.moveTo(s.cx, s.cy);
    ctx.lineTo(s.cx + Math.cos(ang) * s.R, s.cy + Math.sin(ang) * s.R);
    ctx.strokeStyle = rgba(violet, 0.035);
    ctx.stroke();
  }
}

// Sweep wake (cyan leading edge → red trail) plus the bright leading line.
function drawSweep(
  ctx: CanvasRenderingContext2D,
  s: Scope,
  cyan: RGB,
  violet: RGB,
  sweep: number,
) {
  for (let i = 0; i < TRAIL_SLICES; i++) {
    const t = i / TRAIL_SLICES;
    const a0 = sweep - (i / TRAIL_SLICES) * TRAIL;
    const a1 = sweep - ((i + 1) / TRAIL_SLICES) * TRAIL;
    ctx.beginPath();
    ctx.moveTo(s.cx, s.cy);
    ctx.arc(s.cx, s.cy, s.R, a1, a0);
    ctx.closePath();
    ctx.fillStyle = rgba(lerp(cyan, violet, t), (1 - t) * 0.14);
    ctx.fill();
  }
  ctx.beginPath();
  ctx.moveTo(s.cx, s.cy);
  ctx.lineTo(s.cx + Math.cos(sweep) * s.R, s.cy + Math.sin(sweep) * s.R);
  ctx.strokeStyle = rgba(cyan, 0.42);
  ctx.lineWidth = 1.4;
  ctx.stroke();
}

function drawBlip(ctx: CanvasRenderingContext2D, x: number, y: number, col: RGB, glow: number) {
  if (glow > 0.02) {
    const rad = 16 + glow * 14;
    const halo = ctx.createRadialGradient(x, y, 0, x, y, rad);
    halo.addColorStop(0, rgba(col, 0.5 * glow));
    halo.addColorStop(1, rgba(col, 0));
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(x, y, rad, 0, TWO_PI);
    ctx.fill();
  }
  ctx.beginPath();
  ctx.arc(x, y, 2, 0, TWO_PI);
  ctx.fillStyle = rgba(col, 0.25 + glow * 0.7);
  ctx.fill();
}

function drawReticle(ctx: CanvasRenderingContext2D, s: Scope, cyan: RGB) {
  ctx.strokeStyle = rgba(cyan, 0.3);
  ctx.lineWidth = 1;
  const g = 7;
  ctx.beginPath();
  ctx.moveTo(s.cx - g, s.cy);
  ctx.lineTo(s.cx + g, s.cy);
  ctx.moveTo(s.cx, s.cy - g);
  ctx.lineTo(s.cx, s.cy + g);
  ctx.stroke();
}

function drawFrame(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  cyan: RGB,
  violet: RGB,
  sweep: number,
  lit: Lit,
  px: number,
  py: number,
) {
  ctx.clearRect(0, 0, w, h);
  const s: Scope = { cx: w / 2 + px, cy: h / 2 + py, R: Math.min(w, h) * 0.62 };
  drawGrid(ctx, s, cyan, violet);
  drawSweep(ctx, s, cyan, violet, sweep);
  for (let i = 0; i < BLIPS.length; i++) {
    const b = BLIPS[i];
    const col: RGB = b.r > 0.6 ? violet : cyan;
    drawBlip(ctx, s.cx + Math.cos(b.a) * s.R * b.r, s.cy + Math.sin(b.a) * s.R * b.r, col, lit[i]);
  }
  drawReticle(ctx, s, cyan);
}

// True when the sweep crossed a blip's bearing this frame (handles wrap).
function crossed(prev: number, next: number, target: number): boolean {
  const norm = (x: number) => ((x % TWO_PI) + TWO_PI) % TWO_PI;
  const p = norm(prev);
  const n = norm(next);
  const tg = norm(target);
  return p <= n ? tg > p && tg <= n : tg > p || tg <= n;
}

export function TacticalRadar() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const parent = canvas?.parentElement;
    if (!canvas || !parent) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cyan = readRgb("--cyan", FALLBACK_CYAN);
    const violet = readRgb("--violet", FALLBACK_VIOLET);

    let w = 0;
    let h = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      w = parent.clientWidth;
      h = parent.clientHeight;
      if (!w || !h) return;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(parent);

    const target = { x: 0, y: 0 };
    const cur = { x: 0, y: 0 };
    const onMove = (e: PointerEvent) => {
      const r = parent.getBoundingClientRect();
      target.x = ((e.clientX - r.left) / r.width - 0.5) * 22;
      target.y = ((e.clientY - r.top) / r.height - 0.5) * 14;
    };
    parent.addEventListener("pointermove", onMove);

    const lit: Lit = BLIPS.map(() => 0);
    let sweep = 0;
    let last = performance.now();
    let raf = 0;

    const step = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const prev = sweep;
      sweep += SWEEP_SPEED * dt;
      for (let i = 0; i < BLIPS.length; i++) {
        if (crossed(prev, sweep, BLIPS[i].a)) lit[i] = 1;
        lit[i] *= Math.pow(0.45, dt); // decay toward 0 over ~1s
      }
      cur.x += (target.x - cur.x) * 0.06;
      cur.y += (target.y - cur.y) * 0.06;
      if (w && h) drawFrame(ctx, w, h, cyan, violet, sweep, lit, cur.x, cur.y);
      raf = requestAnimationFrame(step);
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      if (w && h) drawFrame(ctx, w, h, cyan, violet, 0.6, lit.map(() => 0), 0, 0);
    } else {
      raf = requestAnimationFrame(step);
    }

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      parent.removeEventListener("pointermove", onMove);
    };
  }, []);

  return <canvas className="block h-full w-full" ref={ref} />;
}
