import { describe, it, expect } from "vitest";
import { buildRange, range } from "../src/utils/range";
import { ELLIPSIS } from "../src/types";

describe("range", () => {
  it("builds an inclusive range", () => {
    expect(range(1, 5)).toEqual([1, 2, 3, 4, 5]);
  });
  it("returns empty when start > end", () => {
    expect(range(5, 1)).toEqual([]);
  });
});

describe("buildRange", () => {
  const args = { siblingCount: 1, boundaryCount: 1 };

  it("lists every page when they all fit", () => {
    expect(buildRange({ ...args, totalPages: 7, currentPage: 4 })).toEqual([
      1, 2, 3, 4, 5, 6, 7,
    ]);
  });

  it("shows a trailing ellipsis near the start", () => {
    const r = buildRange({ ...args, totalPages: 50, currentPage: 1 });
    expect(r[0]).toBe(1);
    expect(r).toContain(ELLIPSIS);
    expect(r[r.length - 1]).toBe(50);
  });

  it("shows both ellipses in the middle", () => {
    const r = buildRange({ ...args, totalPages: 50, currentPage: 25 });
    expect(r[0]).toBe(1);
    expect(r[r.length - 1]).toBe(50);
    expect(r.filter((x) => x === ELLIPSIS)).toHaveLength(2);
    expect(r).toContain(25);
  });

  it("shows a leading ellipsis near the end", () => {
    const r = buildRange({ ...args, totalPages: 50, currentPage: 50 });
    expect(r[0]).toBe(1);
    expect(r).toContain(ELLIPSIS);
    expect(r[r.length - 1]).toBe(50);
  });

  it("uses a real ellipsis only when it hides more than one page", () => {
    // current=1 of 8: pages 6–7 are hidden (two pages) → a legitimate ellipsis.
    expect(buildRange({ ...args, totalPages: 8, currentPage: 1 })).toEqual([
      1, 2, 3, 4, 5, ELLIPSIS, 8,
    ]);
  });

  it("renders the hidden page as a number instead of a lonely ellipsis", () => {
    // current=4 of 8: only page 2 would be hidden on the left → render "2", no "…".
    const r = buildRange({ ...args, totalPages: 8, currentPage: 4 });
    expect(r.slice(0, 3)).toEqual([1, 2, 3]);
    expect(r[1]).not.toBe(ELLIPSIS);
  });
});
