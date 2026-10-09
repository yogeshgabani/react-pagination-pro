import { useCallback, useEffect, useState } from "react";

export interface UseUrlPaginationOptions {
  /** Query param name. Default "page". */
  param?: string;
  /** Initial / fallback page when the URL has none. Default 1. */
  initialPage?: number;
  /**
   * Custom navigation. Provide this to integrate with Next.js / React Router /
   * Remix routers. Receives the fully-built URL string. Defaults to
   * History `pushState` (works in any SPA / SSR-hydrated app).
   */
  navigate?: (url: string, page: number) => void;
}

export interface UseUrlPaginationResult {
  page: number;
  setPage: (page: number) => void;
}

/**
 * Two-way sync between the current page and a URL query param (`?page=5`).
 * SSR-safe (guards `window`), works with the History API out of the box, and
 * accepts a `navigate` callback to defer to any router.
 */
export function useUrlPagination(
  options: UseUrlPaginationOptions = {},
): UseUrlPaginationResult {
  const { param = "page", initialPage = 1, navigate } = options;

  const read = useCallback((): number => {
    if (typeof window === "undefined") return initialPage;
    const sp = new URLSearchParams(window.location.search);
    const raw = sp.get(param);
    const n = raw ? parseInt(raw, 10) : NaN;
    return Number.isNaN(n) || n < 1 ? initialPage : n;
  }, [param, initialPage]);

  const [page, setPageState] = useState<number>(read);

  // Keep state in sync with browser back/forward navigation.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onPop = () => setPageState(read());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [read]);

  const setPage = useCallback(
    (next: number) => {
      const target = Math.max(1, Math.floor(next) || 1);
      setPageState(target);
      if (typeof window === "undefined") return;
      const url = new URL(window.location.href);
      url.searchParams.set(param, String(target));
      const href = url.pathname + url.search + url.hash;
      if (navigate) navigate(href, target);
      else window.history.pushState({ [param]: target }, "", href);
    },
    [param, navigate],
  );

  return { page, setPage };
}
