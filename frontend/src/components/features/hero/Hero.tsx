"use client";

import dynamic from "next/dynamic";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { AgentAtmosphere } from "@/components/common/AgentAtmosphere";
import { Crest } from "@/components/common/Crest";
import { IntelIcon } from "@/components/common/VlrIcon";
import { LiveDot } from "@/components/common/LiveDot";
import { Spoiler } from "@/components/common/Spoiler";
import { Tag } from "@/components/common/Tag";
import { cn } from "@/lib/utils";
import type { Match } from "@/types/ggwp";

// Client-only canvas backdrop; never server-rendered and lazy so it stays out
// of the initial bundle until the hero mounts.
const TacticalRadar = dynamic(() => import("./TacticalRadar").then((m) => m.TacticalRadar), {
  ssr: false,
});

const heroShell =
  "group relative h-full min-h-[440px] cursor-pointer overflow-hidden rounded-[20px] border border-glass-line bg-glass shadow-[0_24px_70px_-16px_rgba(0,0,0,0.65)] backdrop-blur-2xl transition-[border-color,box-shadow] duration-300 hover:border-line-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet/50";

// ── entrance choreography (gentle, glass-premium) ──
const stage: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
const fromTop: Variants = {
  hidden: { opacity: 0, y: -12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};
const fromBottom: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};
const fromLeft: Variants = {
  hidden: { opacity: 0, x: -32 },
  show: { opacity: 1, x: 0, transition: { duration: 0.58, ease: [0.16, 1, 0.3, 1] } },
};
const fromRight: Variants = {
  hidden: { opacity: 0, x: 32 },
  show: { opacity: 1, x: 0, transition: { duration: 0.58, ease: [0.16, 1, 0.3, 1] } },
};
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 12, scale: 0.96 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.22 } },
};

const FACE = {
  blue: { variants: fromLeft, items: "sm:items-end", text: "sm:text-right", label: "Cyan" },
  red: { variants: fromRight, items: "sm:items-start", text: "sm:text-left", label: "Violet" },
} as const;

// Soft local fx layered inside the glass: split cyan/violet glow + top sheen.
function HeroFx() {
  return (
    <>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_120%_at_12%_25%,rgba(92,198,214,0.12),transparent_46%),radial-gradient(120%_120%_at_88%_78%,rgba(255,70,85,0.14),transparent_48%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.18),transparent)]" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[58%] w-px -translate-x-1/2 -translate-y-1/2 bg-[linear-gradient(180deg,transparent,rgba(92,198,214,0.25),rgba(255,70,85,0.25),transparent)] opacity-60 sm:block" />
    </>
  );
}

// One face of the head-to-head: crest + team identity (crisp, no transforms).
function FaceOffTeam({ team, side }: { team: Match["teamA"]; side: "blue" | "red" }) {
  const f = FACE[side];
  return (
    <motion.div
      variants={f.variants}
      className={cn("z-[2] flex min-w-0 flex-col items-center gap-3 sm:gap-4", f.items)}
    >
      <Crest team={team} size={92} side={side} />
      <div className={cn("flex flex-col items-center gap-1", f.items)}>
        <span
          className={cn(
            "max-w-[12ch] truncate text-center font-disp text-[clamp(24px,3.2vw,40px)] font-semibold uppercase leading-[0.92] tracking-[0.01em] text-ink",
            f.text,
          )}
        >
          {team ? team.name : "TBD"}
        </span>
        <span className="font-mono-ggwp text-[10px] uppercase tracking-[0.18em] text-ink-3">
          {team ? team.region : "—"}
        </span>
      </div>
    </motion.div>
  );
}

// Series tracker: one segment per map in the BO; filled from each side inward.
function SeriesPips({ a, b, bestOf }: { a: number; b: number; bestOf: number }) {
  const segs = Array.from({ length: bestOf }, (_, i) =>
    i < a ? "blue" : i >= bestOf - b ? "red" : "off",
  );
  return (
    <Spoiler as="div" className="flex items-center justify-center gap-1.5">
      {segs.map((s, i) => (
        <span
          key={i}
          className={cn(
            "h-[5px] w-6 rounded-full transition-colors",
            s === "blue" && "bg-blue/80 shadow-[0_0_10px_var(--blueglow)]",
            s === "red" && "bg-red/80 shadow-[0_0_10px_var(--redglow)]",
            s === "off" && "bg-white/[0.08]",
          )}
        />
      ))}
    </Spoiler>
  );
}

// Center column: scores, series tracker, format + time.
function ScoreCore({ m, up }: { m: Match; up: boolean }) {
  const scoreCls =
    "min-w-[38px] text-center font-score text-[clamp(46px,5.6vw,72px)] leading-[0.8]";
  return (
    <motion.div variants={fadeUp} className="z-[2] flex flex-col items-center gap-4">
      <div className="flex items-center gap-4 sm:gap-5">
        <Spoiler className={cn(scoreCls, "text-cyan")}>{up ? "0" : m.scoreA}</Spoiler>
        <span className="font-score text-[clamp(15px,1.5vw,20px)] tracking-[0.16em] text-ink-3">VS</span>
        <Spoiler className={cn(scoreCls, "text-violet")}>{up ? "0" : m.scoreB}</Spoiler>
      </div>
      <SeriesPips a={m.scoreA} b={m.scoreB} bestOf={m.bestOf ?? 3} />
      <div className="flex items-center gap-3 font-mono-ggwp text-[11px] tracking-[0.08em] text-ink-2">
        <span className="whitespace-nowrap">BEST OF {m.bestOf}</span>
        <span className="h-[3px] w-[3px] flex-none rounded-full bg-ink-3" />
        <span className="whitespace-nowrap">{m.time}</span>
      </div>
    </motion.div>
  );
}

function heroAria(m: Match, live: boolean): string {
  const a = m.teamA ? m.teamA.name : "TBD";
  const b = m.teamB ? m.teamB.name : "TBD";
  return `${live ? "Live" : "Upcoming"} match: ${a} versus ${b}`;
}

function activateOnKey(e: React.KeyboardEvent, run: () => void) {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    run();
  }
}

// Top status row: live / up-next badge, tournament line, live REC marker.
function HeroMeta({ m, live }: { m: Match; live: boolean }) {
  return (
    <motion.div variants={fromTop} className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        {live ? <LiveDot label="LIVE NOW" /> : <Tag tone="blue">UP NEXT</Tag>}
        <span className="flex items-center gap-1.5 whitespace-nowrap font-mono-ggwp text-[11px] uppercase tracking-[0.16em] text-ink-2">
          <IntelIcon name="recon" size={12} className="text-ink-3" />
          {m.tournamentName} · Semifinal
        </span>
      </div>
      <span className="hidden font-mono-ggwp text-[10px] uppercase tracking-[0.2em] text-ink-3 sm:inline">
        {live ? "live broadcast" : "scheduled"}
      </span>
    </motion.div>
  );
}

// Glass primary action; the whole banner is clickable, so this is a cue.
function HeroCta({ live }: { live: boolean }) {
  return (
    <motion.div variants={fromBottom} className="flex justify-center">
      <span className="relative inline-flex items-center gap-[7px] overflow-hidden rounded-[11px] border border-glass-line bg-[linear-gradient(100deg,rgba(92,198,214,0.16),rgba(255,70,85,0.18))] px-[22px] py-[11px] font-mono-ggwp text-[12px] font-semibold text-ink shadow-[0_8px_24px_-8px_rgba(255,70,85,0.4)] transition duration-200 group-hover:-translate-y-0.5 group-hover:border-line-2">
        <span className="pointer-events-none absolute inset-0 -translate-x-full bg-[linear-gradient(110deg,transparent,rgba(255,255,255,0.22),transparent)] transition-transform duration-700 group-hover:translate-x-full" />
        {live ? "Watch live" : "Match preview"}
        <span className="text-violet-dim transition group-hover:translate-x-[3px]">→</span>
      </span>
    </motion.div>
  );
}

export interface HeroProps {
  m: Match;
  onOpen: (m: Match) => void;
  className?: string;
}

// The hero match banner: a calm glass head-to-head face-off over the app's
// ambient aurora, with cyan/violet team sides and a gentle staggered reveal.
export function Hero({ m, onOpen, className }: HeroProps) {
  const reduce = useReducedMotion() ?? false;
  const live = m.status === "live";
  const up = !live;
  const open = () => onOpen(m);

  return (
    <motion.header
      role="button"
      tabIndex={0}
      aria-label={heroAria(m, live)}
      className={cn(heroShell, className)}
      onClick={open}
      onKeyDown={(e) => activateOnKey(e, open)}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.6] [mask-image:radial-gradient(115%_88%_at_50%_42%,#000_16%,transparent_70%)]"
      >
        <TacticalRadar />
      </div>

      {/* Agent renders dissolved into each side, framing the face-off as depth. */}
      <AgentAtmosphere agent="jett" side="left" tone="cyan" className="hidden sm:block" />
      <AgentAtmosphere agent="reyna" side="right" tone="violet" className="hidden sm:block" />

      <HeroFx />

      <motion.div
        variants={stage}
        initial={reduce ? false : "hidden"}
        animate="show"
        className="relative z-[4] flex h-full min-h-[440px] flex-col px-[clamp(20px,4vw,52px)] py-7"
      >
        <HeroMeta m={m} live={live} />

        <div className="flex flex-1 items-center py-5">
          <div className="grid w-full grid-cols-1 items-center gap-7 sm:grid-cols-[1fr_auto_1fr] sm:gap-5">
            <FaceOffTeam team={m.teamA} side="blue" />
            <ScoreCore m={m} up={up} />
            <FaceOffTeam team={m.teamB} side="red" />
          </div>
        </div>

        <HeroCta live={live} />
      </motion.div>
    </motion.header>
  );
}
