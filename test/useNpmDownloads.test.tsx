import { StrictMode } from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";

/** Fresh module per test — the hook caches the lookup at module scope. */
const loadModule = async () => {
  vi.resetModules();
  return import("../demo/src/useNpmDownloads");
};

const NOW = Date.UTC(2026, 9, 9); // 2026-10-09

/** Answers each range query with the next count in `counts`. */
const rangeFetch = (counts: number[]) => {
  let i = 0;
  return vi.fn(async () => ({
    ok: true,
    status: 200,
    json: async () => ({ downloads: counts[i++] ?? 0 }),
  }) as unknown as Response);
};

const ranges = (f: ReturnType<typeof rangeFetch>) =>
  f.mock.calls.map((c) => new URL(c[0] as string).pathname.split("/")[3]);

describe("fetchTotalDownloads", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("sums consecutive ≤18-month windows until one is empty", async () => {
    const fetchMock = rangeFetch([200, 32, 0]);
    vi.stubGlobal("fetch", fetchMock);
    const { fetchTotalDownloads } = await loadModule();

    expect(await fetchTotalDownloads("pkg", NOW)).toBe(232);
    // Back-to-back windows: no gap, no overlap, each under npm's cap.
    expect(ranges(fetchMock)).toEqual([
      "2025-04-18:2026-10-09",
      "2023-10-26:2025-04-17",
      "2022-05-04:2023-10-25",
    ]);
  });

  it("never asks for data before npm started recording (2015-01-10)", async () => {
    const fetchMock = rangeFetch(Array(20).fill(1));
    vi.stubGlobal("fetch", fetchMock);
    const { fetchTotalDownloads } = await loadModule();

    const total = await fetchTotalDownloads("pkg", NOW);
    const all = ranges(fetchMock);
    expect(all.at(-1)).toMatch(/^2015-01-10:/);
    expect(total).toBe(all.length);
  });

  it("counts a published package nobody has downloaded as 0", async () => {
    vi.stubGlobal("fetch", rangeFetch([0]));
    const { fetchTotalDownloads } = await loadModule();
    expect(await fetchTotalDownloads("pkg", NOW)).toBe(0);
  });

  it("rejects when npm doesn't know the package", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({ ok: false, status: 404 }) as Response));
    const { fetchTotalDownloads } = await loadModule();
    await expect(fetchTotalDownloads("nope", NOW)).rejects.toThrow("404");
  });
});

describe("useNpmDownloads", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it("resolves to the all-time total", async () => {
    vi.stubGlobal("fetch", rangeFetch([232, 0]));
    const { useNpmDownloads } = await loadModule();
    const { result } = renderHook(() => useNpmDownloads("react-next-pagination-pro"));

    expect(result.current).toBeNull();
    await waitFor(() => expect(result.current).toBe(232));
  });

  it("looks the package up once under StrictMode's remount", async () => {
    const fetchMock = rangeFetch([5, 0]);
    vi.stubGlobal("fetch", fetchMock);
    const { useNpmDownloads } = await loadModule();
    const { result } = renderHook(() => useNpmDownloads("pkg"), { wrapper: StrictMode });

    await waitFor(() => expect(result.current).toBe(5));
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("stays null when npm is unreachable", async () => {
    const fetchMock = vi.fn(async () => {
      throw new TypeError("Failed to fetch");
    });
    vi.stubGlobal("fetch", fetchMock);
    const { useNpmDownloads } = await loadModule();
    const { result } = renderHook(() => useNpmDownloads("pkg"));

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    await Promise.resolve();
    expect(result.current).toBeNull();
  });
});
