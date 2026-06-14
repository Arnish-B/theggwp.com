"use client";

import { IntelIcon } from "@/components/common/VlrIcon";
import { BentoCard } from "@/components/ui/bento-grid";
import { cn } from "@/lib/utils";
import type { Match } from "@/types/ggwp";
import { MatchLineList } from "./MatchLine";

export interface LiveNowTileProps {
  matches: Match[];
  onOpen: (m: Match) => void;
  className?: string;
}

export function LiveNowTile({ matches, onOpen, className }: LiveNowTileProps) {
  return (
    <BentoCard
      accent="red"
      className={cn("pl-5", className)}
      label={
        <span className="flex items-center gap-1.5">
          <IntelIcon name="alert" size={12} className="text-red" />
          Live now
        </span>
      }
      action={
        <span className="rounded-[10px] bg-red px-1.5 py-px font-mono-ggwp text-[10px] font-bold tabular-nums text-white">
          {matches.length}
        </span>
      }
    >
      <MatchLineList matches={matches} onOpen={onOpen} empty="No live matches right now." />
    </BentoCard>
  );
}
