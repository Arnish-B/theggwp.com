"use client";

import { useState } from "react";
import { BentoCard } from "@/components/ui/bento-grid";
import { IntelIcon, VlrIcon } from "@/components/common/VlrIcon";
import { MapViewer } from "@/components/features/deck/MapViewer";
import { cn } from "@/lib/utils";

// Current competitive pool — mirrors the maps the dataset draws from (lib/data).
const POOL = ["Ascent", "Bind", "Haven", "Split", "Lotus", "Sunset", "Icebox", "Abyss"] as const;

export interface MapPoolTileProps {
  className?: string;
  /** Controlled selected map; when omitted the tile manages its own selection. */
  activeMap?: string;
  /** Notifies the parent when the user picks a map (drives the hero pan sync). */
  onMapChange?: (map: string) => void;
}

/**
 * Tactical map-pool tile: the selected map's footprint is rendered as a glowing
 * cyan schematic (the minimap PNG used as a mask over the accent colour), with a
 * compact selectable list of the active-duty pool beside it.
 */
export function MapPoolTile({ className, activeMap, onMapChange }: MapPoolTileProps) {
  const [internal, setInternal] = useState<string>(POOL[0]);
  const active = activeMap ?? internal;
  const slug = active.toLowerCase();
  const setActive = (map: string) => {
    setInternal(map);
    onMapChange?.(map);
  };

  return (
    <BentoCard
      flush
      className={cn("min-h-[176px]", className)}
    >
      <div className="grid h-full grid-cols-[132px_1fr]">
        {/* selectable pool list */}
        <div className="flex min-w-0 flex-col p-3">
          <header className="mb-2.5 flex items-center gap-1.5 px-1">
            <IntelIcon name="recon" size={12} className="text-cyan" />
            <span className="font-mono-ggwp text-[9px] font-semibold uppercase tracking-[0.16em] text-ink-3">
              Pool
            </span>
            <span className="ml-auto font-mono-ggwp text-[9px] tabular-nums text-ink-3">
              {POOL.length}
            </span>
          </header>
          <div className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-hidden">
            {POOL.map((m) => {
              const on = m === active;
              return (
                <button
                  key={m}
                  onClick={() => setActive(m)}
                  className={cn(
                    "group flex items-center gap-2 rounded-md px-2 py-[5px] text-left transition",
                    on ? "bg-cyan/[0.1]" : "hover:bg-white/[0.04]",
                  )}
                >
                  <VlrIcon
                    kind="map"
                    name={m.toLowerCase()}
                    size={14}
                    className={cn(
                      "flex-none transition",
                      on
                        ? "text-cyan drop-shadow-[0_0_5px_rgba(92,198,214,0.5)]"
                        : "text-ink-3 group-hover:text-ink-2",
                    )}
                  />
                  <span
                    className={cn(
                      "truncate text-[12.5px] font-semibold transition",
                      on ? "text-white" : "text-ink-2 group-hover:text-ink",
                    )}
                  >
                    {m}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* featured interactive schematic */}
        <MapViewer slug={slug} label={active} />
      </div>
    </BentoCard>
  );
}
