"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { VlrIcon } from "@/components/common/VlrIcon";
import { cn } from "@/lib/utils";

export interface MapViewerProps {
  /** Map slug, matches `/public/valorant/maps/<slug>.png` (e.g. "ascent"). */
  slug: string;
  /** Display name shown on the schematic. */
  label: string;
  className?: string;
}

const ZOOM_MIN = 0.85;
const ZOOM_MAX = 2.6;
const TILT_LIMIT = 55;
const SPIN_BASE = 0;
const TILT_BASE = 16;
const ZOOM_BASE = 1;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/**
 * Interactive tactical schematic for a single map: the full-detail minimap art
 * (not a flat mask) rendered as a tiltable "recon table". Drag to rotate/tilt,
 * scroll or use the controls to zoom, double-click or press 0 to recenter.
 */
export function MapViewer({ slug, label, className }: MapViewerProps) {
  const [spin, setSpin] = useState(SPIN_BASE);
  const [tilt, setTilt] = useState(TILT_BASE);
  const [zoom, setZoom] = useState(ZOOM_BASE);
  const [dragging, setDragging] = useState(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  const reset = useCallback(() => {
    setSpin(SPIN_BASE);
    setTilt(TILT_BASE);
    setZoom(ZOOM_BASE);
  }, []);

  const zoomBy = useCallback(
    (delta: number) => setZoom((z) => clamp(z + delta, ZOOM_MIN, ZOOM_MAX)),
    [],
  );

  const spinBy = useCallback((delta: number) => setSpin((s) => s + delta), []);

  const tiltBy = useCallback(
    (delta: number) => setTilt((t) => clamp(t + delta, -TILT_LIMIT, TILT_LIMIT)),
    [],
  );

  const onPointerDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    last.current = { x: e.clientX, y: e.clientY };
    setDragging(true);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging || !last.current) return;
    const dx = e.clientX - last.current.x;
    const dy = e.clientY - last.current.y;
    last.current = { x: e.clientX, y: e.clientY };
    spinBy(dx * 0.55);
    tiltBy(-dy * 0.4);
  };

  const endDrag = (e: React.PointerEvent) => {
    e.currentTarget.releasePointerCapture?.(e.pointerId);
    setDragging(false);
    last.current = null;
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const actions: Record<string, () => void> = {
      ArrowLeft: () => spinBy(-8),
      ArrowRight: () => spinBy(8),
      ArrowUp: () => tiltBy(6),
      ArrowDown: () => tiltBy(-6),
      "+": () => zoomBy(0.2),
      "=": () => zoomBy(0.2),
      "-": () => zoomBy(-0.2),
      _: () => zoomBy(-0.2),
      "0": reset,
    };
    const run = actions[e.key];
    if (!run) return;
    run();
    e.preventDefault();
  };

  // Native non-passive wheel listener so we can zoom without scrolling the page.
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      zoomBy(-e.deltaY * 0.0016);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [zoomBy]);

  return (
    <div
      ref={stageRef}
      role="img"
      aria-label={`${label} tactical map — drag to rotate, scroll to zoom`}
      tabIndex={0}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onDoubleClick={reset}
      onKeyDown={onKeyDown}
      className={cn(
        "group relative grid touch-none select-none place-items-center overflow-hidden outline-none",
        "border-l border-line/60 bg-[radial-gradient(120%_100%_at_70%_30%,rgba(92,198,214,0.12),transparent_70%)]",
        "focus-visible:ring-1 focus-visible:ring-cyan/50",
        dragging ? "cursor-grabbing" : "cursor-grab",
        className,
      )}
    >
      {/* tactical grid backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.18] [background-image:linear-gradient(rgba(92,198,214,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(92,198,214,0.5)_1px,transparent_1px)] [background-size:22px_22px]"
      />

      {/* the rotatable schematic */}
      <div
        className="relative grid h-full w-full place-items-center"
        style={{ perspective: "1000px" }}
      >
        <div
          className={cn(
            "relative h-[82%] w-[82%]",
            !dragging && "transition-transform duration-300 ease-out",
          )}
          style={{
            transform: `rotateX(${tilt}deg) rotateZ(${spin}deg) scale(${zoom})`,
          }}
        >
          <MapPlate slug={slug} reduceMotion={!!reduceMotion} />
        </div>
      </div>

      {/* recon scan + ping — fires on every map switch */}
      <ReconSweep slug={slug} enabled={!reduceMotion} />

      {/* corner tag */}
      <span className="pointer-events-none absolute right-2.5 top-2 font-mono-ggwp text-[8px] uppercase tracking-[0.18em] text-cyan/60">
        recon
      </span>

      {/* zoom + reset controls */}
      <div className="absolute right-2 top-1/2 flex -translate-y-1/2 flex-col gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100">
        <ControlButton label="Zoom in" onClick={() => zoomBy(0.25)}>
          +
        </ControlButton>
        <ControlButton label="Zoom out" onClick={() => zoomBy(-0.25)}>
          −
        </ControlButton>
        <ControlButton label="Reset view" onClick={reset}>
          ↺
        </ControlButton>
      </div>

      {/* label */}
      <span className="pointer-events-none absolute bottom-2 left-0 right-0 text-center font-disp text-[12px] font-semibold uppercase tracking-[0.16em] text-ink-2">
        {label}
      </span>

      {/* drag hint */}
      <span className="pointer-events-none absolute bottom-2 left-2.5 font-mono-ggwp text-[8px] uppercase tracking-[0.14em] text-ink-3 opacity-70 transition-opacity duration-200 group-hover:opacity-0">
        drag · scroll
      </span>
    </div>
  );
}

/** Crossfading map art, keyed by slug so each switch animates in. */
function MapPlate({ slug, reduceMotion }: { slug: string; reduceMotion: boolean }) {
  const enter = reduceMotion
    ? { opacity: 0 }
    : { opacity: 0, scale: 0.9, filter: "brightness(2.4)" };
  const leave = reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 1.06 };
  return (
    <AnimatePresence mode="popLayout">
      <motion.div
        key={slug}
        className="absolute inset-0"
        initial={enter}
        animate={{ opacity: 1, scale: 1, filter: "brightness(1)" }}
        exit={leave}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <Image
          src={`/valorant/maps/${slug}.png`}
          alt=""
          fill
          sizes="320px"
          draggable={false}
          className="object-contain"
          style={{
            filter:
              "brightness(1.22) contrast(1.12) saturate(0.85) drop-shadow(0 0 16px rgba(92,198,214,0.4))",
          }}
          priority={false}
        />
      </motion.div>
    </AnimatePresence>
  );
}

/** Sova-style recon scan beam + ability-icon ping, replayed on each map switch. */
function ReconSweep({ slug, enabled }: { slug: string; enabled: boolean }) {
  if (!enabled) return null;
  return (
    <AnimatePresence>
      <motion.div
        key={slug}
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10"
      >
        {/* vertical scan beam sweeping across the schematic */}
        <motion.div
          className="absolute inset-y-0 w-1/3 bg-[linear-gradient(90deg,transparent,rgba(92,198,214,0.35),rgba(92,198,214,0.7),rgba(92,198,214,0.35),transparent)] mix-blend-screen"
          initial={{ left: "-35%", opacity: 0 }}
          animate={{ left: "100%", opacity: [0, 1, 1, 0] }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        />
        {/* recon-bolt ping at center */}
        <motion.div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: [0.4, 1.15, 1], opacity: [0, 1, 0] }}
          transition={{ duration: 0.55, ease: "easeOut" }}
        >
          <VlrIcon
            kind="ability"
            name="sova-recon-bolt"
            size={34}
            className="text-cyan drop-shadow-[0_0_12px_rgba(92,198,214,0.8)]"
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function ControlButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={onClick}
      className="grid h-6 w-6 place-items-center rounded-md border border-line/70 bg-surface-2/80 font-mono-ggwp text-[12px] leading-none text-ink-2 backdrop-blur-sm transition hover:border-cyan/60 hover:text-cyan"
    >
      {children}
    </button>
  );
}
