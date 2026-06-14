"use client";

import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

interface Piece {
  src: string;
  className: string;
  w: number;
  rotate: number;
  /** Parallax depth multiplier — larger drifts further/faster on scroll. */
  depth: number;
}

// Faint armoury wireframes anchored to the page edges. White line-art guns sit
// at very low opacity so they read as texture, then drift up and dissolve as the
// command deck scrolls away.
const PIECES: Piece[] = [
  { src: "/valorant/weapons/operator.png", className: "right-[-3%] top-[7%]", w: 420, rotate: -8, depth: 1 },
  { src: "/valorant/weapons/vandal.png", className: "left-[-4%] top-[26%]", w: 360, rotate: 7, depth: 1.5 },
  { src: "/valorant/weapons/phantom.png", className: "right-[6%] top-[52%]", w: 300, rotate: 4, depth: 2.1 },
  { src: "/valorant/weapons/sheriff.png", className: "left-[10%] top-[68%]", w: 150, rotate: -12, depth: 2.6 },
];

export function WeaponScrollLayer() {
  const reduce = useReducedMotion() ?? false;
  const { scrollY } = useScroll();
  // Whole layer fades out over the first ~viewport of scroll.
  const opacity = useTransform(scrollY, [0, 520], [1, 0]);

  if (reduce) return null;

  return (
    <motion.div
      aria-hidden
      style={{ opacity }}
      className="pointer-events-none fixed inset-0 -z-[5] overflow-hidden"
    >
      {PIECES.map((p) => (
        <ScrollPiece key={p.src} piece={p} scrollY={scrollY} />
      ))}
    </motion.div>
  );
}

function ScrollPiece({
  piece,
  scrollY,
}: {
  piece: Piece;
  scrollY: ReturnType<typeof useScroll>["scrollY"];
}) {
  const y = useTransform(scrollY, [0, 600], [0, -120 * piece.depth]);
  return (
    <motion.div style={{ y }} className={`absolute ${piece.className}`}>
      <Image
        src={piece.src}
        alt=""
        width={piece.w}
        height={Math.round(piece.w * 0.4)}
        style={{ transform: `rotate(${piece.rotate}deg)` }}
        className="select-none opacity-[0.06] [filter:brightness(1.4)]"
      />
    </motion.div>
  );
}
