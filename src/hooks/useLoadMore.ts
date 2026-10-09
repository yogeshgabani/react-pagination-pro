import { useCallback, useMemo, useState } from "react";

export interface UseLoadMoreOptions<T> {
  /** All available items (client-side) OR the currently loaded slice (server-side). */
  items?: T[];
  /** How many items to reveal per "load more". Default 10. */
  pageSize?: number;
  /** Total items available on the server (enables hasMore without loading all). */
  total?: number;
  /**
   * Async fetcher for server mode: given the next offset, return the next batch.
   * When provided, `loadMore` appends the fetched batch to internal state.
   */
  fetchMore?: (offset: number, pageSize: number) => Promise<T[]>;
}

export interface UseLoadMoreResult<T> {
  /** Items currently visible. */
  visible: T[];
  /** Whether more items can be loaded. */
  hasMore: boolean;
  /** Whether a fetch is in flight (server mode). */
  loading: boolean;
  /** Reveal / fetch the next batch. */
  loadMore: () => void | Promise<void>;
  /** Reset back to the first batch. */
  reset: () => void;
  /** Count currently shown. */
  count: number;
}

/**
 * "Load more" pagination. Works client-side (slice a local array) or server-side
 * (append via `fetchMore`). Returns the visible window and a `loadMore` action.
 */
export function useLoadMore<T>(options: UseLoadMoreOptions<T>): UseLoadMoreResult<T> {
  const { items, pageSize = 10, total, fetchMore } = options;
  const [limit, setLimit] = useState(pageSize);
  const [fetched, setFetched] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);

  const serverMode = typeof fetchMore === "function";
  const visible = useMemo(() => {
    if (serverMode) return fetched;
    return (items ?? []).slice(0, limit);
  }, [serverMode, fetched, items, limit]);

  const knownTotal = total ?? items?.length ?? 0;
  const hasMore = serverMode ? fetched.length < knownTotal : limit < (items?.length ?? 0);

  const loadMore = useCallback(async () => {
    if (serverMode) {
      if (loading || !hasMore) return;
      setLoading(true);
      try {
        const batch = await fetchMore!(fetched.length, pageSize);
        setFetched((prev) => [...prev, ...batch]);
      } finally {
        setLoading(false);
      }
    } else {
      setLimit((l) => l + pageSize);
    }
  }, [serverMode, loading, hasMore, fetchMore, fetched.length, pageSize]);

  const reset = useCallback(() => {
    setLimit(pageSize);
    setFetched([]);
  }, [pageSize]);

  return { visible, hasMore, loading, loadMore, reset, count: visible.length };
}
