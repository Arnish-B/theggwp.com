"use client";

import { Crest } from "@/components/common/Crest";
import { LiveDot } from "@/components/common/LiveDot";
import { Spoiler } from "@/components/common/Spoiler";
import { cn } from "@/lib/utils";
import type { Match } from "@/types/ggwp";

interface MatchLineProps {
  m: Match;
  onOpen: (m: Match) => void;
  className?: string;
}

/** Compact, one-row match summary used inside the bento rail tiles. */
function MatchLine({ m, onOpen, className }: MatchLineProps) {
  const live = m.status === "live";
  const scored = m.status === "done" || live;

  return (
    <button
      type="button"
      onClick={() => onOpen(m)}
      className={cn(
        "group flex w-full flex-col gap-1.5 rounded-lg border border-line bg-white/[0.015] px-2.5 py-2 text-left transition hover:border-line-2 hover:bg-white/[0.04]",
        className,
      )}
    >
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <span className="flex min-w-0 items-center justify-end gap-2">
          <span className="truncate text-[12.5px] font-semibold text-ink">
            {m.teamA?.tag ?? "TBD"}
          </span>
          <Crest team={m.teamA} size={22} />
        </span>
        {scored ? (
          <Spoiler className="gap-1.5 font-score text-[18px] leading-none tracking-[0.04em] tabular-nums text-ink">
            <span className="text-blue">{m.scoreA}</span>
            <span className="text-ink-3">:</span>
            <span className="text-red">{m.scoreB}</span>
          </Spoiler>
        ) : (
          <span className="font-score text-[13px] tracking-[0.12em] text-ink-3">VS</span>
        )}
        <span className="flex min-w-0 items-center gap-2">
          <Crest team={m.teamB} size={22} />
          <span className="truncate text-[12.5px] font-semibold text-ink">
            {m.teamB?.tag ?? "TBD"}
          </span>
        </span>
      </div>
      <div className="flex items-center justify-between gap-2">
        <span className="truncate font-mono-ggwp text-[10px] uppercase tracking-[0.08em] text-ink-3">
          {m.tournamentName}
        </span>
        {live ? (
          <LiveDot />
        ) : (
          <span className="whitespace-nowrap font-mono-ggwp text-[10px] tracking-[0.04em] text-ink-2">
            {m.time}
          </span>
        )}
      </div>
    </button>
  );
}

export interface MatchLineListProps {
  matches: Match[];
  onOpen: (m: Match) => void;
  empty: string;
}

/** Shared list-or-empty-state body for the rail match tiles. */
export function MatchLineList({ matches, onOpen, empty }: MatchLineListProps) {
  if (!matches.length) {
    return <p className="py-6 text-center font-mono-ggwp text-[11px] text-ink-3">{empty}</p>;
  }
  return (
    <div className="flex flex-col gap-1.5">
      {matches.map((m) => (
        <MatchLine key={m.id} m={m} onOpen={onOpen} />
      ))}
    </div>
  );
}
