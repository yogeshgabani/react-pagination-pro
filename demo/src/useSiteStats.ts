import { useEffect, useState } from "react";

/**
 * Live hit / visitor counters backed by a hosted counter service (Abacus by
 * default — free, no signup, no PII).
 *
 *   hits     = page views, incremented on every load
 *   visitors = unique browsers, incremented once and then remembered locally
 *
 * Every visit counts, including local dev — point `VITE_COUNTER_NAMESPACE` at a
 * throwaway namespace while developing if you'd rather not touch the real one.
 * If no namespace is configured, or the service is unreachable, the values stay
 * `null` and the footer shows "—" rather than inventing a number.
 */
const BASE = (import.meta.env.VITE_COUNTER_API || "https://abacus.jasoncameron.dev").replace(/\/$/, "");
const NAMESPACE = import.meta.env.VITE_COUNTER_NAMESPACE?.trim();
const SEEN_KEY = "rpp:visited";

export interface SiteStats {
  hits: number | null;
  visitors: number | null;
}

/** `hit` creates-or-increments then returns; `get` only reads. Both answer
 *  `{ value }` — except `get` on a key no one has hit yet, which 404s. */
const read = async (verb: "hit" | "get", key: string) => {
  const res = await fetch(`${BASE}/${verb}/${NAMESPACE}/${key}`);
  // A counter that doesn't exist yet is zero, not a failure.
  if (res.status === 404) return 0;
  if (!res.ok) throw new Error(`counter ${key}: ${res.status}`);
  const data: { value?: number } = await res.json();
  if (typeof data.value !== "number") throw new Error(`counter ${key}: bad payload`);
  return data.value;
};

/**
 * One request pair per page load, cached at module scope.
 *
 * This must NOT live in the effect: StrictMode mounts, unmounts and re-mounts,
 * so an effect-owned AbortController tears the increment down before it lands
 * and the retry then reads a key that was never created. Sharing one promise
 * means the second mount reuses the first result instead of re-requesting.
 */
let pending: Promise<SiteStats> | null = null;

const loadStats = () => {
  if (pending) return pending;
  const returning = localStorage.getItem(SEEN_KEY) === "1";
  pending = (async () => {
    // A failure on either counter shouldn't blank out the other.
    const [hits, visitors] = await Promise.all([
      read("hit", "views").catch(() => null),
      read(returning ? "get" : "hit", "visitors").catch(() => null),
    ]);
    localStorage.setItem(SEEN_KEY, "1");
    return { hits, visitors };
  })();
  return pending;
};

export function useSiteStats(): SiteStats {
  const [stats, setStats] = useState<SiteStats>({ hits: null, visitors: null });

  useEffect(() => {
    if (!NAMESPACE) return;
    let alive = true;
    // Cleanup only stops the state update — never the in-flight increment.
    loadStats().then((s) => {
      if (alive) setStats(s);
    });
    return () => {
      alive = false;
    };
  }, []);

  return stats;
}
