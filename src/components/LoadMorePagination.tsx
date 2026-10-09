import type { PaginationColor, PaginationSize } from "../types";
import { useResolvedDark } from "../hooks/useSystemDark";
import { DEFAULT_VARIANT } from "../variants";

export interface LoadMorePaginationProps {
  /** Whether more items are available. */
  hasMore: boolean;
  /** Whether a fetch is in flight. */
  loading?: boolean;
  /** Called when the button is pressed. */
  onLoadMore: () => void;
  /** Count shown / count total, rendered as "Showing X of Y". */
  count?: number;
  total?: number;
  label?: string;
  loadingLabel?: string;
  doneLabel?: string;
  variant?: string;
  color?: PaginationColor;
  size?: PaginationSize;
  /** Dark styling. `true`/`false` force it; `"auto"` (default) follows the OS. */
  dark?: boolean | "auto";
  className?: string;
}

/** A "Load more" button with loading + exhausted states and optional counter. */
export function LoadMorePagination({
  hasMore,
  loading = false,
  onLoadMore,
  count,
  total,
  label = "Load more",
  loadingLabel = "Loading…",
  doneLabel = "No more items",
  variant = DEFAULT_VARIANT,
  color = "blue",
  size = "md",
  dark = "auto",
  className,
}: LoadMorePaginationProps) {
  const isDark = useResolvedDark(dark);
  const rootClass = [
    "rpp",
    "rpp-loadmore",
    `rpp-v-${variant}`,
    `rpp-c-${color}`,
    `rpp-s-${size}`,
    isDark ? "rpp-dark" : "",
    className || "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={rootClass}>
      <button
        type="button"
        className="rpp-item rpp-loadmore-btn"
        onClick={onLoadMore}
        disabled={!hasMore || loading}
        aria-busy={loading}
      >
        {loading ? loadingLabel : hasMore ? label : doneLabel}
      </button>
      {count != null && total != null && (
        <span className="rpp-loadmore-count" aria-live="polite">
          Showing {count} of {total}
        </span>
      )}
    </div>
  );
}
