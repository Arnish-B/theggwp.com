import { cn } from "@/lib/utils";

export interface BentoGridProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Full-bleed bento grid. 12 columns on desktop so tiles can span freely and
 * tile the whole viewport width; collapses to 1–2 columns on smaller screens.
 */
export function BentoGrid({ children, className }: BentoGridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-12",
        className,
      )}
    >
      {children}
    </div>
  );
}

export type BentoAccent = "red" | "blue" | "none";

export interface BentoCardProps {
  children?: React.ReactNode;
  className?: string;
  /** Tactical mono label rendered in the tile header. */
  label?: React.ReactNode;
  /** Optional right-aligned slot in the header (count, link, live dot…). */
  action?: React.ReactNode;
  /** Edge accent bar colour. */
  accent?: BentoAccent;
  /** Adds hover affordance + pointer + keyboard activation. */
  interactive?: boolean;
  /** Removes the default inner padding (for tiles that manage their own). */
  flush?: boolean;
  onClick?: () => void;
}

const accentBar: Record<BentoAccent, string> = {
  red: "before:absolute before:inset-y-0 before:left-0 before:w-[3px] before:bg-red before:shadow-[0_0_14px_var(--redglow)] before:content-['']",
  blue: "before:absolute before:inset-y-0 before:left-0 before:w-[3px] before:bg-blue before:shadow-[0_0_14px_var(--blueglow)] before:content-['']",
  none: "",
};

const interactiveClass =
  "cursor-pointer transition-[border-color,box-shadow,transform] duration-200 hover:border-line-2 hover:shadow-[0_18px_50px_-12px_rgba(0,0,0,0.55)] focus-visible:border-violet focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet/40 motion-safe:hover:-translate-y-0.5";

function handleActivateKey(onClick?: () => void) {
  return (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick?.();
    }
  };
}

export function BentoCard({
  children,
  className,
  label,
  action,
  accent = "none",
  interactive,
  flush,
  onClick,
}: BentoCardProps) {
  const interactiveProps = interactive
    ? { role: "button" as const, tabIndex: 0, onClick, onKeyDown: handleActivateKey(onClick) }
    : { onClick };

  return (
    <section
      {...interactiveProps}
      className={cn(
        "relative flex min-w-0 flex-col overflow-hidden rounded-ggwp border border-glass-line bg-glass shadow-[0_16px_44px_-20px_rgba(0,0,0,0.7)] backdrop-blur-xl",
        accentBar[accent],
        interactive && interactiveClass,
        !flush && "p-4",
        className,
      )}
    >
      {(label || action) && (
        <header className="mb-3 flex items-center justify-between gap-3">
          {label && (
            <span className="font-mono-ggwp text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-3">
              {label}
            </span>
          )}
          {action && <span className="flex items-center gap-2">{action}</span>}
        </header>
      )}
      {children}
    </section>
  );
}
