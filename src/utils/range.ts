import { ELLIPSIS, type PageItem } from "../types";

/** Inclusive integer range [start, end]. Returns [] if start > end. */
export function range(start: number, end: number): number[] {
  if (start > end) return [];
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

export interface BuildRangeArgs {
  totalPages: number;
  currentPage: number;
  siblingCount: number;
  boundaryCount: number;
}

/**
 * Build the list of page items with ellipsis gaps, e.g.
 * `[1, "ellipsis", 4, 5, 6, "ellipsis", 50]`.
 *
 * Mirrors the battle-tested MUI/Ant algorithm: always render the boundary
 * pages, the sibling window around the current page, and collapse everything
 * else — but only insert an ellipsis when it hides more than one page,
 * otherwise render the single hidden page number directly (no lonely "...").
 */
export function buildRange({
  totalPages,
  currentPage,
  siblingCount,
  boundaryCount,
}: BuildRangeArgs): PageItem[] {
  // If everything fits, just list every page.
  const totalNumbers = boundaryCount * 2 + siblingCount * 2 + 3; // boundaries + siblings + current + 2 gaps
  if (totalPages <= totalNumbers) {
    return range(1, totalPages);
  }

  const startPages = range(1, Math.min(boundaryCount, totalPages));
  const endPages = range(
    Math.max(totalPages - boundaryCount + 1, boundaryCount + 1),
    totalPages,
  );

  const siblingsStart = Math.max(
    Math.min(currentPage - siblingCount, totalPages - boundaryCount - siblingCount * 2 - 1),
    boundaryCount + 2,
  );
  const siblingsEnd = Math.min(
    Math.max(currentPage + siblingCount, boundaryCount + siblingCount * 2 + 2),
    endPages.length > 0 ? endPages[0] - 2 : totalPages - 1,
  );

  const items: PageItem[] = [...startPages];

  // Left gap.
  if (siblingsStart > boundaryCount + 2) {
    items.push(ELLIPSIS);
  } else if (boundaryCount + 1 < totalPages - boundaryCount) {
    items.push(boundaryCount + 1);
  }

  items.push(...range(siblingsStart, siblingsEnd));

  // Right gap.
  if (siblingsEnd < totalPages - boundaryCount - 1) {
    items.push(ELLIPSIS);
  } else if (totalPages - boundaryCount > boundaryCount) {
    items.push(totalPages - boundaryCount);
  }

  items.push(...endPages);

  return items;
}
