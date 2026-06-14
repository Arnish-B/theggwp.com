"use client";

import { IntelIcon } from "@/components/common/VlrIcon";
import { BentoCard } from "@/components/ui/bento-grid";
import { cn } from "@/lib/utils";
import type { Match } from "@/types/ggwp";
import { MatchLineList } from "./MatchLine";

export interface UpcomingTileProps {
  matches: Match[];
  onOpen: (m: Match) => void;
  className?: string;
}

export function UpcomingTile({ matches, onOpen, className }: UpcomingTileProps) {
  return (
    <BentoCard
      accent="blue"
      className={cn("pl-5", className)}
      label={
        <span className="flex items-center gap-1.5">
          <IntelIcon name="drone" size={12} className="text-blue" />
          Up next
        </span>
      }
      action={
        <span className="font-mono-ggwp text-[10px] uppercase tracking-[0.12em] text-blue-dim">
          schedule
        </span>
      }
    >
      <MatchLineList matches={matches} onOpen={onOpen} empty="Nothing scheduled." />
    </BentoCard>
  );
}
