import { useMemo } from "react";
import type { UsePaginationOptions, UsePaginationResult } from "../types";
import { buildRange } from "../utils/range";

/**
 * Framework-agnostic pagination engine. Computes the visible page range
 * (with ellipsis gaps), navigation flags, and item-window indices.
 *
 * @example
 * const { items, hasNext } = usePagination({ currentPage: 5, totalPages: 50 });
 */
export function usePagination(options: UsePaginationOptions): UsePaginationResult {
  const {
    currentPage,
    totalPages: totalPagesProp,
    totalItems,
    pageSize = 10,
    siblingCount = 1,
    boundaryCount = 1,
  } = options;

  return useMemo(() => {
    const derivedTotal =
      totalPagesProp ??
      (totalItems != null ? Math.ceil(totalItems / Math.max(pageSize, 1)) : 1);

    const totalPages = Math.max(1, Math.floor(derivedTotal) || 1);

    const clamp = (page: number) => Math.min(Math.max(1, Math.floor(page) || 1), totalPages);
    const page = clamp(currentPage);

    const items = buildRange({
      totalPages,
      currentPage: page,
      siblingCount: Math.max(0, siblingCount),
      boundaryCount: Math.max(1, boundaryCount),
    });

    const startItem = totalItems != null ? (page - 1) * pageSize + 1 : (page - 1) * pageSize + 1;
    const endItem =
      totalItems != null ? Math.min(page * pageSize, totalItems) : page * pageSize;

    return {
      items,
      totalPages,
      currentPage: page,
      hasPrev: page > 1,
      hasNext: page < totalPages,
      isFirst: page === 1,
      isLast: page === totalPages,
      startItem,
      endItem,
      clamp,
    };
  }, [currentPage, totalPagesProp, totalItems, pageSize, siblingCount, boundaryCount]);
}
