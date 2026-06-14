import { cn } from "@/lib/utils";

export type VlrIconKind = "ability" | "role" | "weapon" | "map";

const FOLDER: Record<VlrIconKind, string> = {
  ability: "abilities",
  role: "roles",
  weapon: "weapons",
  map: "maps",
};

export interface VlrIconProps {
  /** Asset slug, e.g. "sova-recon-bolt", "sentinel", "vandal", "ascent". */
  name: string;
  kind?: VlrIconKind;
  /** Pixel size of the (square) icon. */
  size?: number;
  className?: string;
}

/**
 * Renders a VALORANT glyph (ability / role / weapon / map) as a single-colour,
 * theme-aware icon. The source PNG is used as a CSS mask over `currentColor`,
 * so the icon inherits text colour — letting the same official art read as
 * cyan, violet, or ink depending on context instead of its raw white.
 */
export function VlrIcon({ name, kind = "ability", size = 16, className }: VlrIconProps) {
  const src = `/valorant/${FOLDER[kind]}/${name}.png`;
  return (
    <span
      aria-hidden
      className={cn("inline-block flex-none bg-current align-middle", className)}
      style={{
        width: size,
        height: size,
        WebkitMaskImage: `url(${src})`,
        maskImage: `url(${src})`,
        WebkitMaskSize: "contain",
        maskSize: "contain",
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskPosition: "center",
      }}
    />
  );
}

// Curated semantic mapping so call-sites read by meaning, not by agent name.
// Each value is an ability slug present in /public/valorant/abilities.
const INTEL_ICON = {
  recon: "sova-recon-bolt",
  drone: "sova-owl-drone",
  scan: "cypher-spycam",
  trap: "cypher-trapwire",
  turret: "killjoy-turret",
  alert: "killjoy-alarmbot",
  flash: "breach-flashpoint",
  smoke: "brimstone-sky-smoke",
  marker: "brimstone-incendiary",
  pulse: "omen-paranoia",
  blade: "jett-blade-storm",
  dash: "jett-cloudburst",
  toxic: "viper-toxic-screen",
  haunt: "fade-haunt",
  seek: "fade-seize",
  heal: "sage-healing-orb",
} as const;

export type IntelIconName = keyof typeof INTEL_ICON;

/** Convenience wrapper for semantic "intel" glyphs used across the dashboard. */
export function IntelIcon({
  name,
  size = 16,
  className,
}: {
  name: IntelIconName;
  size?: number;
  className?: string;
}) {
  return <VlrIcon kind="ability" name={INTEL_ICON[name]} size={size} className={className} />;
}
