import Image from "next/image";
import { cn } from "@/lib/utils";

export interface AgentAtmosphereProps {
  /** Agent slug present in /public/valorant/agents as `${agent}-portrait.png`. */
  agent: string;
  /** Which edge the figure is anchored to. */
  side?: "left" | "right";
  /** Accent wash bled behind the figure to tie it to the palette. */
  tone?: "cyan" | "violet";
  className?: string;
  /** Base opacity of the desaturated figure (kept low so it reads as depth). */
  opacity?: number;
}

const TONE_WASH: Record<NonNullable<AgentAtmosphereProps["tone"]>, string> = {
  cyan: "radial-gradient(60% 70% at var(--ax) 78%, rgba(92,198,214,0.18), transparent 70%)",
  violet: "radial-gradient(60% 70% at var(--ax) 78%, rgba(255,70,85,0.2), transparent 70%)",
};

/**
 * A single agent render dissolved into the background: desaturated, low-opacity,
 * and softly masked on every edge so it reads as atmosphere rather than a poster.
 * Decorative only — never announced to assistive tech.
 */
export function AgentAtmosphere({
  agent,
  side = "right",
  tone = "violet",
  className,
  opacity = 0.14,
}: AgentAtmosphereProps) {
  const ax = side === "right" ? "78%" : "22%";
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-y-0 z-0 w-[clamp(280px,42%,560px)]",
        side === "right" ? "right-0" : "left-0",
        className,
      )}
      style={{ ["--ax" as string]: ax }}
    >
      {/* palette wash that the figure emerges from */}
      <div className="absolute inset-0" style={{ backgroundImage: TONE_WASH[tone] }} />
      {/* the desaturated figure, faded into the panel on all sides */}
      <div
        className="absolute inset-0"
        style={{
          maskImage:
            "linear-gradient(to top, transparent 2%, #000 38%, #000 72%, transparent 100%), linear-gradient(to " +
            (side === "right" ? "left" : "right") +
            ", #000 30%, transparent 92%)",
          WebkitMaskImage:
            "linear-gradient(to top, transparent 2%, #000 38%, #000 72%, transparent 100%), linear-gradient(to " +
            (side === "right" ? "left" : "right") +
            ", #000 30%, transparent 92%)",
          maskComposite: "intersect",
          WebkitMaskComposite: "source-in",
        }}
      >
        <Image
          src={`/valorant/agents/${agent}-portrait.png`}
          alt=""
          fill
          sizes="560px"
          className="object-contain object-bottom mix-blend-luminosity"
          style={{
            opacity,
            objectPosition: `${side === "right" ? "85%" : "15%"} 100%`,
            filter: "grayscale(1) contrast(1.04) brightness(0.92)",
          }}
          priority={false}
        />
      </div>
    </div>
  );
}
