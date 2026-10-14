import type { ReactNode } from "react";
import type { PaginationColor, PaginationSize } from "../types";
import { useInfiniteScroll, type UseInfiniteScrollOptions } from "../hooks/useInfiniteScroll";
import { useResolvedDark } from "../hooks/useSystemDark";
import { DEFAULT_VARIANT } from "../variants";

export interface InfiniteScrollProps extends UseInfiniteScrollOptions {
  /** Replaces the built-in spinner + loading label. */
  loader?: ReactNode;
  loadingLabel?: string;
  /** Shown once `hasMore` is false. Pass `null` to render nothing. */
  endMessage?: ReactNode;
  errorLabel?: string;
  retryLabel?: string;
  variant?: string;
  color?: PaginationColor;
  size?: PaginationSize;
  /** Dark styling. `true`/`false` force it; `"auto"` (default) follows the OS. */
  dark?: boolean | "auto";
  className?: string;
}

/**
 * Drop-in infinite scroll footer: place it after your list and it loads the
 * next batch as it scrolls into view, with loading, error/retry and
 * end-of-list states. Works with any list markup (rows, cards, grids).
 */
export function InfiniteScroll({
  loader,
  loadingLabel = "Loading…",
  endMessage = "You’re all caught up",
  errorLabel = "Couldn’t load more items.",
  retryLabel = "Retry",
  variant = DEFAULT_VARIANT,
  color = "blue",
  size = "md",
  dark = "auto",
  className,
  ...options
}: InfiniteScrollProps) {
  const isDark = useResolvedDark(dark);
  const { sentinelRef, pending, error, retry } = useInfiniteScroll(options);
  const busy = pending || !!options.loading;
  const failed = error !== undefined;

  const rootClass = [
    "rpp",
    "rpp-infinite",
    `rpp-v-${variant}`,
    `rpp-c-${color}`,
    `rpp-s-${size}`,
    isDark ? "rpp-dark" : "",
    className || "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div ref={sentinelRef} className={rootClass} role="status" aria-live="polite" aria-busy={busy}>
      {failed ? (
        <>
          <span className="rpp-infinite-msg">{errorLabel}</span>
          <button type="button" className="rpp-item rpp-infinite-retry" onClick={retry}>
            {retryLabel}
          </button>
        </>
      ) : busy ? (
        loader ?? (
          <span className="rpp-infinite-msg">
            <span className="rpp-spinner" aria-hidden="true" />
            {loadingLabel}
          </span>
        )
      ) : (
        !options.hasMore && endMessage != null && <span className="rpp-infinite-msg">{endMessage}</span>
      )}
    </div>
  );
}
