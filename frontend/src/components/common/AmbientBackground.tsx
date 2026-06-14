import { AgentAtmosphere } from "@/components/common/AgentAtmosphere";

// Fixed, app-wide ambient backdrop for the "glass premium" direction:
// slowly drifting desaturated aurora blobs (cyan + violet) layered behind a set
// of faint angular shards and contour lines that echo VALORANT's geometry, plus
// a subtle film grain. Pure CSS motion (see globals.css); reduced-motion safe.
export function AmbientBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* a lone agent dissolved into the far edge — atmosphere, not a poster */}
      <AgentAtmosphere agent="cypher" side="right" tone="violet" opacity={0.05} />
      {/* desaturated aurora depth */}
      <div className="aurora-blob aurora-1 -left-[12%] -top-[18%] h-[55vh] w-[55vh] bg-[radial-gradient(circle,rgba(92,198,214,0.16),transparent_68%)]" />
      <div className="aurora-blob aurora-2 right-[-10%] top-[-8%] h-[62vh] w-[62vh] bg-[radial-gradient(circle,rgba(255,70,85,0.15),transparent_70%)]" />
      <div className="aurora-blob aurora-3 bottom-[-22%] left-[28%] h-[58vh] w-[58vh] bg-[radial-gradient(circle,rgba(92,198,214,0.1),transparent_70%)]" />

      {/* angular tactical shards + faint map contours, slowly drifting */}
      <svg
        className="shard-drift absolute left-1/2 top-1/2 h-[140%] w-[140%] -translate-x-1/2 -translate-y-1/2 opacity-[0.5]"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        <g stroke="rgba(255,255,255,0.05)" strokeWidth="1">
          <path d="M-40 250 L520 60 L900 300 L1480 120" />
          <path d="M-40 640 L420 760 L980 560 L1500 720" />
          <path d="M260 -40 L360 420 L180 940" />
          <path d="M1120 -40 L1040 460 L1260 940" />
        </g>
        <g fill="rgba(255,70,85,0.05)">
          <path d="M520 60 L900 300 L760 360 L470 200 Z" />
        </g>
        <g fill="rgba(92,198,214,0.05)">
          <path d="M420 760 L980 560 L880 660 L520 820 Z" />
        </g>
        <g stroke="rgba(92,198,214,0.06)" strokeWidth="1" fill="none">
          <circle cx="720" cy="430" r="150" strokeDasharray="2 10" />
          <circle cx="720" cy="430" r="280" strokeDasharray="2 14" />
        </g>
      </svg>

      {/* grain */}
      <div className="absolute inset-0 opacity-[0.035] [background-image:repeating-radial-gradient(circle_at_0_0,#fff_0,#fff_0.6px,transparent_0.6px,transparent_3px)] [background-size:3px_3px]" />
    </div>
  );
}
