// Styles are imported by consumers via "react-next-pagination-pro/styles.css".
// (Kept out of the JS entry so tree-shaking of components stays clean.)

// ---- Components ----
export { Pagination } from "./components/Pagination";
export { CompactPagination } from "./components/CompactPagination";
export { LoadMorePagination } from "./components/LoadMorePagination";
export { CursorPagination } from "./components/CursorPagination";
export { TablePagination } from "./components/TablePagination";
export { BarPagination } from "./components/BarPagination";
export { InfiniteScroll } from "./components/InfiniteScroll";
export { DotsPagination } from "./components/DotsPagination";
export { AlphabetPagination, ALPHABET } from "./components/AlphabetPagination";

// ---- Hooks ----
export { usePagination } from "./hooks/usePagination";
export { useLoadMore } from "./hooks/useLoadMore";
export { useInfiniteScroll } from "./hooks/useInfiniteScroll";
export { useCursorPagination } from "./hooks/useCursorPagination";
export { useUrlPagination } from "./hooks/useUrlPagination";
export { useSystemDark, useResolvedDark } from "./hooks/useSystemDark";

// ---- Utilities ----
export { range, buildRange } from "./utils/range";

// ---- Variant catalog ----
export {
  PAGINATION_VARIANTS,
  VARIANT_COLLECTIONS,
  DEFAULT_VARIANT,
  DEFAULT_LABELS,
} from "./variants";

// ---- Types ----
export { ELLIPSIS } from "./types";
export type {
  PageItem,
  Ellipsis,
  PaginationSize,
  PaginationShape,
  PaginationColor,
  PaginationAnimation,
  PaginationVariant,
  PaginationTheme,
  PaginationLabels,
  BasePaginationProps,
  UsePaginationOptions,
  UsePaginationResult,
} from "./types";

export type { LoadMorePaginationProps } from "./components/LoadMorePagination";
export type { TablePaginationProps } from "./components/TablePagination";
export type {
  BarPaginationProps,
  BarTotalFormat,
  BarLayout,
} from "./components/BarPagination";
export type { CursorPaginationProps } from "./components/CursorPagination";
export type { InfiniteScrollProps } from "./components/InfiniteScroll";
export type { DotsPaginationProps, DotsEffect } from "./components/DotsPagination";
export type { AlphabetPaginationProps } from "./components/AlphabetPagination";
export type {
  UseLoadMoreOptions,
  UseLoadMoreResult,
} from "./hooks/useLoadMore";
export type {
  UseInfiniteScrollOptions,
  UseInfiniteScrollResult,
} from "./hooks/useInfiniteScroll";
export type {
  CursorPage,
  UseCursorPaginationOptions,
  UseCursorPaginationResult,
} from "./hooks/useCursorPagination";
export type {
  UseUrlPaginationOptions,
  UseUrlPaginationResult,
} from "./hooks/useUrlPagination";
