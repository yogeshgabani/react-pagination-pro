import type { BasePaginationProps } from "../types";
import { usePagination } from "../hooks/usePagination";
import { useResolvedDark } from "../hooks/useSystemDark";
import { themeToStyle } from "../utils/themeToStyle";
import { DEFAULT_LABELS, DEFAULT_VARIANT } from "../variants";

/**
 * Mobile-optimized compact control: just Prev / "5 of 50" / Next.
 * Ideal for small screens and dense toolbars.
 */
export function CompactPagination(props: BasePaginationProps) {
  const {
    onPageChange,
    variant = DEFAULT_VARIANT,
    color = "blue",
    size = "md",
    shape = "rounded",
    dark = "auto",
    rtl = false,
    theme,
    className,
    ariaLabel = "Pagination",
    labels: labelOverrides,
  } = props;

  const labels = { ...DEFAULT_LABELS, ...labelOverrides };
  const isDark = useResolvedDark(dark);
  const { currentPage, totalPages, hasPrev, hasNext, clamp } = usePagination(props);
  const goTo = (p: number) => {
    const n = clamp(p);
    if (n !== currentPage) onPageChange?.(n);
  };

  const rootClass = [
    "rpp",
    "rpp-compact",
    `rpp-v-${variant}`,
    `rpp-c-${color}`,
    `rpp-s-${size}`,
    `rpp-shape-${shape}`,
    isDark ? "rpp-dark" : "",
    className || "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <nav
      className={rootClass}
      style={themeToStyle(theme)}
      aria-label={ariaLabel}
      dir={rtl ? "rtl" : undefined}
    >
      <button
        type="button"
        className="rpp-item rpp-nav rpp-prev"
        onClick={() => goTo(currentPage - 1)}
        disabled={!hasPrev}
        aria-label={labels.previous}
      >
        ‹
      </button>
      <span className="rpp-compact-label" aria-live="polite">
        {currentPage} {labels.of} {totalPages}
      </span>
      <button
        type="button"
        className="rpp-item rpp-nav rpp-next"
        onClick={() => goTo(currentPage + 1)}
        disabled={!hasNext}
        aria-label={labels.next}
      >
        ›
      </button>
    </nav>
  );
}
