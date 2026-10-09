import { useCallback, useState } from "react";

export interface CursorPage<T, C = string> {
  items: T[];
  nextCursor?: C | null;
  prevCursor?: C | null;
}

export interface UseCursorPaginationOptions<T, C = string> {
  /** Fetch a page for the given cursor (undefined = first page). */
  fetchPage: (cursor: C | undefined, direction: "next" | "prev" | "initial") => Promise<CursorPage<T, C>>;
  /** Fetch the first page immediately. Default false (call `next()` / `refresh()`). */
  autoLoad?: boolean;
}

export interface UseCursorPaginationResult<T> {
  items: T[];
  loading: boolean;
  error: unknown;
  hasNext: boolean;
  hasPrev: boolean;
  next: () => Promise<void>;
  prev: () => Promise<void>;
  refresh: () => Promise<void>;
}

/**
 * Cursor-based pagination for APIs that return `nextCursor` / `prevCursor`
 * (GraphQL relay, Stripe, GitHub, etc.). Tracks a small cursor stack so
 * `prev()` works even when the API only returns a forward cursor.
 */
export function useCursorPagination<T, C = string>(
  options: UseCursorPaginationOptions<T, C>,
): UseCursorPaginationResult<T> {
  const { fetchPage } = options;
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [nextCursor, setNextCursor] = useState<C | null | undefined>(undefined);
  const [stack, setStack] = useState<(C | undefined)[]>([]);

  const load = useCallback(
    async (cursor: C | undefined, direction: "next" | "prev" | "initial") => {
      setLoading(true);
      setError(null);
      try {
        const page = await fetchPage(cursor, direction);
        setItems(page.items);
        setNextCursor(page.nextCursor);
        return page;
      } catch (e) {
        setError(e);
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [fetchPage],
  );

  const refresh = useCallback(async () => {
    setStack([]);
    await load(undefined, "initial");
  }, [load]);

  const next = useCallback(async () => {
    if (nextCursor == null) return;
    setStack((s) => [...s, nextCursor as C]);
    await load(nextCursor as C, "next");
  }, [nextCursor, load]);

  const prev = useCallback(async () => {
    if (stack.length === 0) return;
    const newStack = stack.slice(0, -1);
    const target = newStack[newStack.length - 1];
    setStack(newStack);
    await load(target, "prev");
  }, [stack, load]);

  return {
    items,
    loading,
    error,
    hasNext: nextCursor != null,
    hasPrev: stack.length > 0,
    next,
    prev,
    refresh,
  };
}
