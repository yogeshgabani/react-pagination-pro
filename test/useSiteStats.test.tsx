import { StrictMode } from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";

/** Fresh module per test — the hook reads env at module scope and caches the
 *  in-flight request there, so both must be re-evaluated. */
const loadHook = async () => {
  vi.resetModules();
  return (await import("../demo/src/useSiteStats")).useSiteStats;
};

const okFetch = (value: number) =>
  vi.fn(async () => ({ ok: true, status: 200, json: async () => ({ value }) }) as unknown as Response);

/** URL paths the hook requested, e.g. ["/hit/ns/views", "/get/ns/visitors"]. */
const paths = (f: ReturnType<typeof okFetch>) =>
  f.mock.calls.map((c) => new URL(c[0] as string).pathname);

describe("useSiteStats", () => {
  beforeEach(() => {
    vi.stubEnv("VITE_COUNTER_NAMESPACE", "test-ns");
    localStorage.clear();
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("counts a view and a first-time visitor", async () => {
    const fetchMock = okFetch(7);
    vi.stubGlobal("fetch", fetchMock);

    const useSiteStats = await loadHook();
    const { result } = renderHook(() => useSiteStats());

    await waitFor(() => expect(result.current.visitors).toBe(7));
    expect(paths(fetchMock)).toEqual(["/hit/test-ns/views", "/hit/test-ns/visitors"]);
    // Remembered so the next visit doesn't count them twice.
    expect(localStorage.getItem("rpp:visited")).toBe("1");
  });

  it("counts the view but not the visitor on a return visit", async () => {
    localStorage.setItem("rpp:visited", "1");
    const fetchMock = okFetch(9);
    vi.stubGlobal("fetch", fetchMock);

    const useSiteStats = await loadHook();
    renderHook(() => useSiteStats());

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(paths(fetchMock)).toEqual(["/hit/test-ns/views", "/get/test-ns/visitors"]);
  });

  it("still increments under StrictMode's mount/unmount/remount", async () => {
    // Regression: an effect-owned AbortController used to cancel the `hit` on
    // StrictMode's throwaway unmount, and the remount then downgraded to a
    // read of a key that was never created — so the counter sat at 0 forever.
    const fetchMock = okFetch(3);
    vi.stubGlobal("fetch", fetchMock);

    const useSiteStats = await loadHook();
    const { result } = renderHook(() => useSiteStats(), { wrapper: StrictMode });

    await waitFor(() => expect(result.current.hits).toBe(3));
    // Exactly one request pair, both increments, none aborted or downgraded.
    expect(paths(fetchMock)).toEqual(["/hit/test-ns/views", "/hit/test-ns/visitors"]);
    expect(fetchMock.mock.calls.every((c) => c[1]?.signal === undefined)).toBe(true);
  });

  it("reports 0 for a counter nobody has hit yet instead of failing", async () => {
    // Abacus 404s on `get` for a key that was never created — that means zero,
    // not an error. Regression: this used to leave the cards stuck on "—".
    localStorage.setItem("rpp:visited", "1");
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) =>
        url.includes("/get/")
          ? ({ ok: false, status: 404, json: async () => ({ error: "Key not found" }) } as unknown as Response)
          : ({ ok: true, status: 200, json: async () => ({ value: 1 }) } as unknown as Response),
      ),
    );

    const useSiteStats = await loadHook();
    const { result } = renderHook(() => useSiteStats());

    await waitFor(() => expect(result.current.visitors).toBe(0));
    expect(result.current.hits).toBe(1);
  });

  it("keeps one counter when the other fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) =>
        url.includes("visitors")
          ? ({ ok: false, status: 503 } as Response)
          : ({ ok: true, status: 200, json: async () => ({ value: 12 }) } as unknown as Response),
      ),
    );

    const useSiteStats = await loadHook();
    const { result } = renderHook(() => useSiteStats());

    await waitFor(() => expect(result.current.hits).toBe(12));
    expect(result.current.visitors).toBeNull();
  });

  it("leaves the values null when the counter service fails", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({ ok: false, status: 503 }) as Response));

    const useSiteStats = await loadHook();
    const { result } = renderHook(() => useSiteStats());

    // A dead counter must not crash the footer or fabricate a number.
    await waitFor(() => expect(result.current.hits).toBeNull());
    expect(result.current.visitors).toBeNull();
  });

  it("stays off the network when no namespace is configured", async () => {
    vi.stubEnv("VITE_COUNTER_NAMESPACE", "");
    const fetchMock = okFetch(1);
    vi.stubGlobal("fetch", fetchMock);

    const useSiteStats = await loadHook();
    const { result } = renderHook(() => useSiteStats());

    expect(fetchMock).not.toHaveBeenCalled();
    expect(result.current.hits).toBeNull();
  });
});
