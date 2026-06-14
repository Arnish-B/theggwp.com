import { cn } from "@/lib/utils";

export interface AdTileProps {
  className?: string;
}

/**
 * Empty sponsored slot for the bento layout. Intentionally low-emphasis and
 * peripheral: dashed muted border, explicit "Sponsored" labelling, and it grows
 * to fill leftover rail space rather than interrupting primary content.
 */
export function AdTile({ className }: AdTileProps) {
  return (
    <aside
      aria-label="Advertisement"
      className={cn(
        "flex min-h-[260px] flex-1 flex-col overflow-hidden rounded-ggwp border border-glass-line bg-glass/70 backdrop-blur-xl",
        className,
      )}
    >
      <div className="flex items-center justify-between border-b border-glass-line px-4 py-2.5">
        <span className="font-mono-ggwp text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-3">
          Sponsored
        </span>
        <span className="font-mono-ggwp text-[10px] uppercase tracking-[0.12em] text-ink-3">
          Ad
        </span>
      </div>
      <div className="m-3 flex flex-1 flex-col items-center justify-center gap-1.5 rounded-ggwp border border-dashed border-white/[0.1] [background:repeating-linear-gradient(135deg,rgba(255,255,255,0.022)_0_14px,transparent_14px_28px)]">
        <span className="font-score text-[30px] tracking-[0.1em] text-ink-3/70">AD</span>
        <span className="whitespace-nowrap font-mono-ggwp text-[10px] text-ink-3">
          your brand here · VCT
        </span>
      </div>
    </aside>
  );
}
