import type { ReactNode } from "react";

/** Sentinel used inside the computed page list to represent a gap ("..."). */
export const ELLIPSIS = "ellipsis" as const;
export type Ellipsis = typeof ELLIPSIS;

/** A single item in the computed pagination range: either a page number or a gap. */
export type PageItem = number | Ellipsis;

/** Visual size scale. */
export type PaginationSize = "sm" | "md" | "lg";

/** Shape of the interactive controls. */
export type PaginationShape = "rounded" | "pill" | "square" | "circle";

/** Built-in color presets mapped onto CSS variables. */
export type PaginationColor =
  | "blue"
  | "purple"
  | "green"
  | "orange"
  | "red"
  | "pink"
  | "cyan"
  | "indigo"
  | "emerald"
  | "gray";

/** Entrance / interaction animation applied to items. */
export type PaginationAnimation =
  | "none"
  | "fade"
  | "scale"
  | "bounce"
  | "slide"
  | "flip"
  | "ripple"
  | "pulse"
  | "elastic";

/**
 * Named UI variant. Variants are grouped into collections
 * (minimal / modern / glass / soft / gradient / pro / premium / animated).
 * See {@link PAGINATION_VARIANTS} for the full list of 100+ variants.
 */
export type PaginationVariant = string;

/** Runtime-overridable theme tokens (mapped to CSS custom properties). */
export interface PaginationTheme {
  /** Primary / active color, e.g. "#2563eb". */
  primary?: string;
  /** Text color on top of the primary color. */
  onPrimary?: string;
  /** Active-page background. Accepts a solid color OR a gradient
   *  (e.g. "linear-gradient(135deg,#6366f1,#ec4899)"). Defaults to `primary`. */
  activeBg?: string;
  /** Default control background. */
  surface?: string;
  /** Control background on hover. */
  surfaceHover?: string;
  /** Default control text color. */
  text?: string;
  /** Muted text (disabled, ellipsis). */
  muted?: string;
  /** Border color. */
  border?: string;
  /** Corner radius, e.g. "12px". */
  radius?: string;
  /** Gap between items, e.g. "6px". */
  gap?: string;
  /** Font size, e.g. "14px". */
  fontSize?: string;
}

export interface UsePaginationOptions {
  /** Total number of pages. Prefer this OR (totalItems + pageSize). */
  totalPages?: number;
  /** Total number of items; used with pageSize to derive totalPages. */
  totalItems?: number;
  /** Items per page (used with totalItems). Default 10. */
  pageSize?: number;
  /** Current active page (1-based). */
  currentPage: number;
  /** Pages to show on each side of the current page. Default 1. */
  siblingCount?: number;
  /** Pages pinned at the start and end. Default 1. */
  boundaryCount?: number;
}

export interface UsePaginationResult {
  /** Computed list of pages + ellipsis sentinels ready to render. */
  items: PageItem[];
  /** Resolved total page count (>= 1). */
  totalPages: number;
  /** Clamped current page. */
  currentPage: number;
  /** Whether a previous page exists. */
  hasPrev: boolean;
  /** Whether a next page exists. */
  hasNext: boolean;
  /** Is this the first page. */
  isFirst: boolean;
  /** Is this the last page. */
  isLast: boolean;
  /** 1-based index of the first item on the current page. */
  startItem: number;
  /** 1-based index of the last item on the current page. */
  endItem: number;
  /** Clamp + return a valid page number. */
  clamp: (page: number) => number;
}

export interface BasePaginationProps extends UsePaginationOptions {
  /** Called with the next page number when the user navigates. */
  onPageChange?: (page: number) => void;
  /** UI variant name (one of {@link PAGINATION_VARIANTS}). Default "minimal-modern". */
  variant?: PaginationVariant;
  /** Color preset. Default "blue". */
  color?: PaginationColor;
  /** Size scale. Default "md". */
  size?: PaginationSize;
  /** Control shape. Default "rounded". */
  shape?: PaginationShape;
  /** Item animation. Default "none". */
  animation?: PaginationAnimation;
  /** Dark styling. `true`/`false` force it; `"auto"` (the default) follows the
   *  OS/browser `prefers-color-scheme`. */
  dark?: boolean | "auto";
  /** Right-to-left layout. */
  rtl?: boolean;
  /** Show First / Last buttons. Default false. */
  showFirstLast?: boolean;
  /** Show Prev / Next buttons. Default true. */
  showPrevNext?: boolean;
  /** Show the numbered page buttons. Default true. */
  showPageNumbers?: boolean;
  /** Show a "jump to page" number input. Default false. */
  showJumpInput?: boolean;
  /** Show a "Page X of Y" summary. Default false. */
  showSummary?: boolean;
  /** Enable keyboard arrow / home / end navigation. Default true. */
  keyboard?: boolean;
  /** Inline theme token overrides. */
  theme?: PaginationTheme;
  /** Extra className on the root <nav>. */
  className?: string;
  /** Accessible label for the nav landmark. Default "Pagination". */
  ariaLabel?: string;
  /** Custom labels for controls / screen readers. */
  labels?: Partial<PaginationLabels>;
  /** Render-prop override for a page button's inner content. */
  renderItem?: (item: PageItem, active: boolean) => ReactNode;
}

export interface PaginationLabels {
  first: string;
  previous: string;
  next: string;
  last: string;
  page: string; // used as `${page} 5`
  jump: string;
  of: string; // used in "Page X of Y"
  pageLabel: string; // "Page"
  rowsPerPage: string; // label for the table page-size dropdown
  goto: string; // "Go to page" label in the bar's go-to control
  go: string; // "Go" button text
  showing: string; // "Showing" prefix in the range summary
}
