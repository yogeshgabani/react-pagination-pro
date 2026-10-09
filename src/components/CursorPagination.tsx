import type { PaginationColor, PaginationSize } from "../types";
import { useResolvedDark } from "../hooks/useSystemDark";
import { DEFAULT_VARIANT } from "../variants";

export interface CursorPaginationProps {
  hasNext: boolean;
  hasPrev: boolean;
  loading?: boolean;
  onNext: () => void;
  onPrev: () => void;
  prevLabel?: string;
  nextLabel?: string;
  variant?: string;
  color?: PaginationColor;
  size?: PaginationSize;
  /** Dark styling. `true`/`false` force it; `"auto"` (default) follows the OS. */
  dark?: boolean | "auto";
  className?: string;
}

/**
 * Prev / Next controls for cursor-based APIs (no page numbers, since totals are
 * usually unknown). Pair with {@link useCursorPagination}.
 */
export function CursorPagination({
  hasNext,
  hasPrev,
  loading = false,
  onNext,
  onPrev,
  prevLabel = "Previous",
  nextLabel = "Next",
  variant = DEFAULT_VARIANT,
  color = "blue",
  size = "md",
  dark = "auto",
  className,
}: CursorPaginationProps) {
  const isDark = useResolvedDark(dark);
  const rootClass = [
    "rpp",
    "rpp-cursor",
    `rpp-v-${variant}`,
    `rpp-c-${color}`,
    `rpp-s-${size}`,
    isDark ? "rpp-dark" : "",
    className || "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <nav className={rootClass} aria-label="Pagination">
      <button
        type="button"
        className="rpp-item rpp-nav rpp-prev"
        onClick={onPrev}
        disabled={!hasPrev || loading}
      >
        ‹ {prevLabel}
      </button>
      <button
        type="button"
        className="rpp-item rpp-nav rpp-next"
        onClick={onNext}
        disabled={!hasNext || loading}
      >
        {nextLabel} ›
      </button>
    </nav>
  );
}
