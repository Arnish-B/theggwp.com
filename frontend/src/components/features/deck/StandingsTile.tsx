"use client";

import { Crest } from "@/components/common/Crest";
import { IntelIcon } from "@/components/common/VlrIcon";
import { BentoCard } from "@/components/ui/bento-grid";
import { cn } from "@/lib/utils";
import type { Standing } from "@/types/ggwp";

export interface StandingsTileProps {
  title: string;
  standings: Standing[];
  className?: string;
}

function streakTone(streak: string) {
  if (streak.startsWith("W")) return "text-blue-dim";
  if (streak.startsWith("L")) return "text-red-dim";
  return "text-ink-3";
}

export function StandingsTile({ title, standings, className }: StandingsTileProps) {
  const rows = standings.slice(0, 5);
  return (
    <BentoCard
      className={className}
      label={
        <span className="flex items-center gap-1.5">
          <IntelIcon name="pulse" size={12} className="text-violet" />
          Standings
        </span>
      }
      action={
        <span className="truncate font-mono-ggwp text-[10px] uppercase tracking-[0.1em] text-ink-2">
          {title}
        </span>
      }
    >
      <div className="flex flex-col">
        {rows.map((s, i) => (
          <div
            key={s.team.id}
            className="grid grid-cols-[16px_22px_1fr_auto_auto] items-center gap-2.5 border-t border-line/60 py-[7px] first:border-t-0"
          >
            <span className="text-center font-score text-[14px] tabular-nums text-ink-3">
              {i + 1}
            </span>
            <Crest team={s.team} size={22} />
            <span className="truncate text-[12.5px] font-semibold text-ink">{s.team.name}</span>
            <span className="font-mono-ggwp text-[11px] tabular-nums text-ink-2">
              {s.w}–{s.l}
            </span>
            <span
              className={cn(
                "w-7 text-right font-mono-ggwp text-[11px] font-semibold tabular-nums",
                streakTone(s.streak),
              )}
            >
              {s.streak}
            </span>
          </div>
        ))}
      </div>
    </BentoCard>
  );
}
