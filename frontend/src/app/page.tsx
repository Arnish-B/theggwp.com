"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AdTile } from "@/components/common/AdTile";
import { IntelIcon } from "@/components/common/VlrIcon";
import { WeaponScrollLayer } from "@/components/common/WeaponScrollLayer";
import { CalendarView } from "@/components/features/calendar/CalendarView";
import { LiveNowTile } from "@/components/features/deck/LiveNowTile";
import { MapPoolTile } from "@/components/features/deck/MapPoolTile";
import { StandingsTile } from "@/components/features/deck/StandingsTile";
import { UpcomingTile } from "@/components/features/deck/UpcomingTile";
import { Hero } from "@/components/features/hero/Hero";
import {
  DEFAULT_FILTERS,
  FilterBar,
  type FilterHandlers,
  type Filters,
} from "@/components/features/tournaments/FilterBar";
import { TournamentRow } from "@/components/features/tournaments/TournamentRow";
import { Nav, type Tab } from "@/components/layouts/Nav";
import { BentoGrid } from "@/components/ui/bento-grid";
import { featured, tournaments } from "@/lib/data";
import type { Match } from "@/types/ggwp";

const tierRank: Record<string, number> = { S: 0, A: 1, B: 2 };
const statusRank: Record<string, number> = { live: 0, upcoming: 1, done: 2 };

function flattenMatches(): Match[] {
  return tournaments.flatMap((t) => [
    ...(t.bracket ? t.bracket.rounds.flatMap((r) => r.matches) : []),
    ...(t.matchList ?? []),
  ]);
}

export default function Home() {
  const router = useRouter();
  const all = tournaments;

  const [view, setView] = useState<"list" | "calendar">("list");
  const [f, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [openId, setOpenId] = useState<string | null>(all[0].id);
  const [activeMap, setActiveMap] = useState("Ascent");

  const openMatch = (m: Match) => router.push(`/match/${m.id}`);

  const { liveMatches, upcomingMatches, snapshot } = useMemo(() => {
    const matches = flattenMatches();
    const hasTeams = (m: Match) => Boolean(m.teamA && m.teamB);
    const standingsTour = all.find((t) => t.standings?.length);
    return {
      liveMatches: matches.filter((m) => m.status === "live" && hasTeams(m)).slice(0, 4),
      upcomingMatches: matches.filter((m) => m.status === "upcoming" && hasTeams(m)).slice(0, 4),
      snapshot: standingsTour
        ? { title: standingsTour.short, standings: standingsTour.standings! }
        : null,
    };
  }, [all]);

  const on: FilterHandlers = {
    toggle: (key, val) =>
      setFilters((p) => {
        const arr = p[key] as string[];
        return {
          ...p,
          [key]: arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val],
        };
      }),
    set: (key, val) => setFilters((p) => ({ ...p, [key]: val })),
    reset: () => setFilters((p) => ({ ...DEFAULT_FILTERS, sort: p.sort })),
  };

  const onTab = (k: Tab) => {
    if (k === "calendar") {
      setView("calendar");
      return;
    }
    setView("list");
    on.set("status", k === "history" ? "done" : k === "upcoming" ? "upcoming" : "any");
  };

  const activeTab: Tab =
    view === "calendar"
      ? "calendar"
      : f.status === "done"
        ? "history"
        : f.status === "upcoming"
          ? "upcoming"
          : "home";

  const counts = { live: all.filter((t) => t.status === "live").length };

  let list = all.filter((t) => {
    if (f.status !== "any" && t.status !== f.status) return false;
    if (f.tier.length && !f.tier.includes(t.tier)) return false;
    if (f.region.length && !f.region.includes(t.region)) return false;
    if (f.type === "vct" && !t.isVCT) return false;
    return true;
  });
  list = [...list].sort((a, b) => {
    if (f.sort === "tier") return tierRank[a.tier] - tierRank[b.tier] || a.name.localeCompare(b.name);
    if (f.sort === "name") return a.name.localeCompare(b.name);
    if (f.sort === "prize")
      return (
        parseInt(b.prize.replace(/\D/g, ""), 10) - parseInt(a.prize.replace(/\D/g, ""), 10)
      );
    return (
      statusRank[a.status] - statusRank[b.status] ||
      (a.bracket ? 0 : 1) - (b.bracket ? 0 : 1) ||
      +new Date(a.start) - +new Date(b.start)
    );
  });

  return (
    <div className="w-full px-3 pb-[90px] sm:px-4 lg:px-5">
      <WeaponScrollLayer />
      <Nav activeTab={activeTab} onTab={onTab} onLogo={() => setView("list")} />
      {view === "calendar" ? (
        <CalendarView onOpenMatch={openMatch} />
      ) : (
        <div className="flex flex-col gap-3">
          {/* Command deck: full-width bento mosaic above the fold. */}
          <BentoGrid className="lg:auto-rows-[minmax(176px,auto)]">
            <Hero
              m={featured}
              onOpen={openMatch}
              mapName={activeMap}
              className="sm:col-span-2 lg:col-span-8 lg:row-span-2"
            />
            <LiveNowTile
              matches={liveMatches}
              onOpen={openMatch}
              className="lg:col-span-4"
            />
            <MapPoolTile
              activeMap={activeMap}
              onMapChange={setActiveMap}
              className="lg:col-span-4"
            />
          </BentoGrid>

          {/* Tournament browser + peripheral rail (ad sits lowest, out of the way). */}
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
            <div className="flex min-w-0 flex-col lg:col-span-8">
              <FilterBar f={f} on={on} counts={counts} />
              <div className="flex items-baseline justify-between px-1 pb-3">
                <span className="flex items-center gap-2 whitespace-nowrap font-disp text-[15px] font-semibold uppercase tracking-[0.02em] text-ink-2">
                  <IntelIcon name="marker" size={13} className="text-violet" />
                  {list.length} tournament{list.length !== 1 ? "s" : ""}
                </span>
                <span className="whitespace-nowrap font-mono-ggwp text-[10px] text-ink-3">
                  click a row to expand the bracket
                </span>
              </div>
              <div className="flex flex-col gap-[9px]">
                {list.map((t) => (
                  <TournamentRow
                    key={t.id}
                    t={t}
                    open={openId === t.id}
                    onToggle={() => setOpenId(openId === t.id ? null : t.id)}
                    onOpenMatch={openMatch}
                  />
                ))}
                {!list.length && (
                  <div className="rounded-ggwp border border-line bg-surface px-4 py-10 text-center font-mono-ggwp text-[12px] text-ink-3">
                    No tournaments match these filters.
                  </div>
                )}
              </div>
            </div>
            <aside className="flex flex-col gap-3 lg:col-span-4">
              {snapshot && (
                <StandingsTile title={snapshot.title} standings={snapshot.standings} />
              )}
              <UpcomingTile matches={upcomingMatches} onOpen={openMatch} />
              <AdTile />
            </aside>
          </div>
        </div>
      )}
    </div>
  );
}
