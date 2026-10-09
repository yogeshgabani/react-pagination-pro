import { useEffect, useState } from "react";

/**
 * All-time npm download count for a package, from npm's public downloads API
 * (CORS-enabled, no key; npm marks responses cacheable for 5 minutes).
 *
 * The API answers at most 18 months per query — and silently clamps a longer
 * range instead of erroring — so the total is summed over consecutive windows
 * walking back from today, stopping at the first empty one (we've walked past
 * the first publish). A package younger than 18 months costs two requests.
 *
 * If the package isn't published or npm is unreachable the value stays `null`
 * and the footer shows "—" rather than inventing a number.
 */
const API = "https://api.npmjs.org/downloads/point";
const DAY = 86_400_000;
/** Days per query — just under the API's 18-month cap. */
const WINDOW = 540;
/** npm keeps no download data before this date. */
const FIRST_DAY = Date.UTC(2015, 0, 10);

const ymd = (t: number) => new Date(t).toISOString().slice(0, 10);

export async function fetchTotalDownloads(pkg: string, now = Date.now()): Promise<number> {
  let total = 0;
  for (let end = now; end >= FIRST_DAY; end -= WINDOW * DAY) {
    const start = Math.max(end - (WINDOW - 1) * DAY, FIRST_DAY);
    const res = await fetch(`${API}/${ymd(start)}:${ymd(end)}/${pkg}`);
    if (!res.ok) throw new Error(`npm downloads ${pkg}: ${res.status}`);
    const { downloads }: { downloads?: number } = await res.json();
    if (typeof downloads !== "number") throw new Error(`npm downloads ${pkg}: bad payload`);
    if (downloads === 0) break;
    total += downloads;
  }
  return total;
}

/** One lookup per package per page load, shared across StrictMode's remount. */
const cache = new Map<string, Promise<number | null>>();

export function useNpmDownloads(pkg: string): number | null {
  const [downloads, setDownloads] = useState<number | null>(null);

  useEffect(() => {
    let alive = true;
    if (!cache.has(pkg)) cache.set(pkg, fetchTotalDownloads(pkg).catch(() => null));
    cache.get(pkg)!.then((n) => {
      if (alive) setDownloads(n);
    });
    return () => {
      alive = false;
    };
  }, [pkg]);

  return downloads;
}
