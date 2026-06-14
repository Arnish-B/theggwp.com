"use client";

import { useMemo } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type TargetAndTransition,
  type Transition,
} from "framer-motion";
import { cn } from "@/lib/utils";

export interface MapPanSceneProps {
  /** Map slug, matches `/public/valorant/maps/<slug>.png` (e.g. "ascent"). */
  slug: string;
  className?: string;
}

// How many image slabs are stacked along Z to fake a solid extrusion, and the
// gap between them. More slabs = thicker, smoother sides at a higher paint cost.
const SLABS = 18;
const STEP = 2.4; // px between extrusion layers
const DEPTH = (SLABS - 1) * STEP;

// One continuous camera move: a fixed oblique tilt plus a slow truck/orbit so
// the extruded faces parallax against each other (the cue that reads as 3D).
// Transform-only and eased in-out so it eases to a stop at each turnaround —
// no visible seam when the loop reverses, which keeps it feeling buttery.
const RIG: TargetAndTransition = {
  rotateX: [59, 64, 59],
  rotateZ: [-11, 11, -11],
  x: ["-4.5%", "4.5%", "-4.5%"],
  y: ["-2.5%", "2.5%", "-2.5%"],
  scale: [1.02, 1.1, 1.02],
};
const RIG_T: Transition = {
  duration: 34,
  ease: "easeInOut",
  repeat: Infinity,
  repeatType: "mirror",
};

const RIG_STATIC: TargetAndTransition = { rotateX: 60, rotateZ: 0, scale: 1.05 };

/**
 * Cinematic 3D pan over a single map. The flat minimap art is extruded into a
 * real volumetric solid — many copies stacked along Z inside a `preserve-3d`
 * rig — and a slow camera move trucks across it so the front and back faces
 * parallax, selling genuine depth rather than a tilted 2D pane. Crossfades on
 * map change; a dark scrim keeps any foreground content legible. Decorative.
 */
export function MapPanScene({ slug, className }: MapPanSceneProps) {
  const reduce = useReducedMotion() ?? false;
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
      style={{ perspective: "1100px", perspectiveOrigin: "50% 34%" }}
    >
      {/* drifting tactical grid, sunk behind the solid for ground-plane depth */}
      <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(rgba(92,198,214,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(92,198,214,0.5)_1px,transparent_1px)] [background-size:40px_40px]" />

      <div className="absolute inset-0 grid place-items-center [transform-style:preserve-3d]">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={slug}
            className="relative h-[130%] w-[115%] [transform-style:preserve-3d]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div
              className="absolute inset-0 [transform-style:preserve-3d]"
              initial={false}
              animate={reduce ? RIG_STATIC : RIG}
              transition={reduce ? undefined : RIG_T}
            >
              <ExtrudedMap slug={slug} />
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* faint palette tie-in: cyan top-left, red bottom-right, kept low */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_14%_22%,rgba(92,198,214,0.08),transparent_46%),radial-gradient(120%_120%_at_86%_82%,rgba(255,70,85,0.07),transparent_48%)] mix-blend-screen" />

      {/* blend veil — never fully clears, so the map reads as a ghost in the
          panel rather than a poster, and its edges dissolve into the dark glass */}
      <div className="absolute inset-0 bg-[radial-gradient(125%_105%_at_50%_42%,rgba(15,25,35,0.32)_0%,rgba(15,25,35,0.62)_46%,rgba(15,25,35,0.9)_74%,rgba(15,25,35,0.97)_100%)]" />
      {/* edge falloff on all four sides to kill the rectangular boundary */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(15,25,35,0.85),transparent_18%,transparent_82%,rgba(15,25,35,0.85)),linear-gradient(to_bottom,rgba(15,25,35,0.7),transparent_20%,transparent_80%,rgba(15,25,35,0.85))]" />
    </div>
  );
}

/**
 * The minimap extruded into a solid: `SLABS` copies of the art stacked along Z,
 * centred so the rig orbits its mid-plane. The top face glows; deeper slabs
 * darken so the swept side walls read as a lit volume.
 */
function ExtrudedMap({ slug }: { slug: string }) {
  const url = `/valorant/maps/${slug}.png`;
  const slabs = useMemo(() => Array.from({ length: SLABS }, (_, i) => i), []);
  return (
    <div
      className="absolute inset-0 [transform-style:preserve-3d]"
      style={{ transform: `translateZ(${DEPTH / 2}px)` }}
    >
      {slabs.map((i) => {
        const z = -(SLABS - 1 - i) * STEP; // back (−DEPTH) → front (0)
        const t = i / (SLABS - 1); // 0 = deepest, 1 = top face
        const top = i === SLABS - 1;
        return (
          <div
            key={i}
            className="absolute inset-0 bg-contain bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${url})`,
              transform: `translateZ(${z}px)`,
              filter: top
                ? "brightness(0.62) contrast(1.05) saturate(0.7) drop-shadow(0 0 14px rgba(92,198,214,0.22))"
                : `brightness(${(0.06 + t * 0.28).toFixed(3)}) saturate(0.45)`,
            }}
          />
        );
      })}
    </div>
  );
}
