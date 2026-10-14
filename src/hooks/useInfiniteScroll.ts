import { useCallback, useEffect, useRef, useState } from "react";

export interface UseInfiniteScrollOptions {
  /** Whether more items can be loaded. Auto-loading stops once this is false. */
  hasMore: boolean;
  /** Whether a load is in flight. Optional when `onLoadMore` returns a Promise. */
  loading?: boolean;
  /**
   * Called when the sentinel scrolls into view. Return a Promise to have the
   * hook wait for it (e.g. `useLoadMore().loadMore`); a rejection pauses
   * auto-loading and is exposed as `error` until `retry()` is called.
   */
  onLoadMore: () => void | Promise<unknown>;
  /** Scroll container to watch. Default: the browser viewport. */
  root?: Element | null;
  /** How early to trigger, as an IntersectionObserver margin. Default "0px 0px 300px 0px". */
  rootMargin?: string;
  /** Pause auto-loading without unmounting. Default false. */
  disabled?: boolean;
}

export interface UseInfiniteScrollResult {
  /** Callback ref — attach it to an element placed after your list. */
  sentinelRef: (node: Element | null) => void;
  /** Whether the hook is waiting on a Promise returned by `onLoadMore`. */
  pending: boolean;
  /** The rejection from the last failed load, if any. */
  error: unknown;
  /** Clears `error` and resumes auto-loading. */
  retry: () => void;
}

/**
 * Infinite scroll: calls `onLoadMore` whenever a sentinel element placed after
 * your list comes into view, and keeps loading until the viewport is filled or
 * `hasMore` turns false. Built on IntersectionObserver — no scroll listeners.
 */
export function useInfiniteScroll(options: UseInfiniteScrollOptions): UseInfiniteScrollResult {
  const {
    hasMore,
    loading = false,
    onLoadMore,
    root = null,
    rootMargin = "0px 0px 300px 0px",
    disabled = false,
  } = options;

  const [node, setNode] = useState<Element | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<unknown>(undefined);
  const [failed, setFailed] = useState(false);
  // Bumped after every finished load so the observer is re-created and
  // re-measures: if the sentinel is still in view, the next batch loads.
  const [round, setRound] = useState(0);

  const loadRef = useRef(onLoadMore);
  useEffect(() => {
    loadRef.current = onLoadMore;
  });

  useEffect(() => {
    if (!node || disabled || failed || pending || loading || !hasMore) return;
    if (typeof IntersectionObserver === "undefined") return;

    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        // One trigger per observer; the next round re-arms with fresh geometry.
        io.disconnect();
        setPending(true);
        Promise.resolve()
          .then(() => loadRef.current())
          .then(
            () => {
              setPending(false);
              setRound((r) => r + 1);
            },
            (err: unknown) => {
              setPending(false);
              setError(err);
              setFailed(true);
            },
          );
      },
      { root, rootMargin },
    );
    io.observe(node);
    return () => io.disconnect();
  }, [node, root, rootMargin, disabled, failed, pending, loading, hasMore, round]);

  const retry = useCallback(() => {
    setError(undefined);
    setFailed(false);
  }, []);

  return { sentinelRef: setNode, pending, error, retry };
}
