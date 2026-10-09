import { useCallback, useState, type KeyboardEvent } from "react";
import type { BasePaginationProps, PageItem } from "../types";
import { ELLIPSIS } from "../types";
import { usePagination } from "../hooks/usePagination";
import { useResolvedDark } from "../hooks/useSystemDark";
import { themeToStyle } from "../utils/themeToStyle";
import { DEFAULT_LABELS, DEFAULT_VARIANT } from "../variants";

/**
 * The primary, fully-featured pagination component. Renders First/Prev/Next/Last
 * controls, numbered pages with ellipsis, an optional jump-to input and summary,
 * and supports 100+ variants, color presets, sizes, shapes, animations, dark mode
 * and RTL — all keyboard accessible with proper ARIA semantics.
 */
export function Pagination(props: BasePaginationProps) {
  const {
    onPageChange,
    variant = DEFAULT_VARIANT,
    color = "blue",
    size = "md",
    shape = "rounded",
    animation = "none",
    dark = "auto",
    rtl = false,
    showFirstLast = false,
    showPrevNext = true,
    showPageNumbers = true,
    showJumpInput = false,
    showSummary = false,
    keyboard = true,
    theme,
    className,
    ariaLabel = "Pagination",
    labels: labelOverrides,
    renderItem,
  } = props;

  const labels = { ...DEFAULT_LABELS, ...labelOverrides };
  const isDark = useResolvedDark(dark);
  const { items, currentPage, totalPages, hasPrev, hasNext, isFirst, isLast, clamp } =
    usePagination(props);

  const [jumpValue, setJumpValue] = useState("");

  const goTo = useCallback(
    (page: number) => {
      const next = clamp(page);
      if (next !== currentPage) onPageChange?.(next);
    },
    [clamp, currentPage, onPageChange],
  );

  const onKeyDown = useCallback(
    (e: KeyboardEvent<HTMLElement>) => {
      if (!keyboard) return;
      const step = rtl ? -1 : 1;
      switch (e.key) {
        case "ArrowRight":
          goTo(currentPage + step);
          break;
        case "ArrowLeft":
          goTo(currentPage - step);
          break;
        case "Home":
          goTo(1);
          break;
        case "End":
          goTo(totalPages);
          break;
        default:
          return;
      }
      e.preventDefault();
    },
    [keyboard, rtl, goTo, currentPage, totalPages],
  );

  const rootClass = [
    "rpp",
    `rpp-v-${variant}`,
    `rpp-c-${color}`,
    `rpp-s-${size}`,
    `rpp-shape-${shape}`,
    animation !== "none" ? `rpp-anim-${animation}` : "",
    isDark ? "rpp-dark" : "",
    className || "",
  ]
    .filter(Boolean)
    .join(" ");

  const submitJump = () => {
    const n = parseInt(jumpValue, 10);
    if (!Number.isNaN(n)) goTo(n);
    setJumpValue("");
  };

  return (
    <nav
      className={rootClass}
      style={themeToStyle(theme)}
      aria-label={ariaLabel}
      dir={rtl ? "rtl" : undefined}
      onKeyDown={onKeyDown}
    >
      <ul className="rpp-list">
        {showFirstLast && (
          <li>
            <button
              type="button"
              className="rpp-item rpp-nav rpp-first"
              onClick={() => goTo(1)}
              disabled={isFirst}
              aria-label={labels.first}
            >
              «
            </button>
          </li>
        )}
        {showPrevNext && (
          <li>
            <button
              type="button"
              className="rpp-item rpp-nav rpp-prev"
              onClick={() => goTo(currentPage - 1)}
              disabled={!hasPrev}
              aria-label={labels.previous}
            >
              ‹
            </button>
          </li>
        )}

        {showPageNumbers &&
          items.map((item: PageItem, i) => {
            if (item === ELLIPSIS) {
              return (
                <li key={`e-${i}`} aria-hidden="true">
                  <span className="rpp-item rpp-ellipsis">…</span>
                </li>
              );
            }
            const active = item === currentPage;
            return (
              // Keying the active button by page number remounts it whenever the
              // page changes, so the CSS "pop" animation re-triggers smoothly.
              <li key={item}>
                <button
                  key={active ? `active-${item}` : `page-${item}`}
                  type="button"
                  className={`rpp-item rpp-page${active ? " rpp-active" : ""}`}
                  onClick={() => goTo(item)}
                  aria-label={`${labels.page} ${item}`}
                  aria-current={active ? "page" : undefined}
                >
                  {renderItem ? renderItem(item, active) : item}
                </button>
              </li>
            );
          })}

        {showPrevNext && (
          <li>
            <button
              type="button"
              className="rpp-item rpp-nav rpp-next"
              onClick={() => goTo(currentPage + 1)}
              disabled={!hasNext}
              aria-label={labels.next}
            >
              ›
            </button>
          </li>
        )}
        {showFirstLast && (
          <li>
            <button
              type="button"
              className="rpp-item rpp-nav rpp-last"
              onClick={() => goTo(totalPages)}
              disabled={isLast}
              aria-label={labels.last}
            >
              »
            </button>
          </li>
        )}
      </ul>

      {showSummary && (
        <span className="rpp-summary" aria-live="polite">
          {labels.pageLabel} {currentPage} {labels.of} {totalPages}
        </span>
      )}

      {showJumpInput && (
        <span className="rpp-jump">
          <label className="rpp-sr-only" htmlFor="rpp-jump-input">
            {labels.jump}
          </label>
          <input
            id="rpp-jump-input"
            className="rpp-jump-input"
            type="number"
            min={1}
            max={totalPages}
            value={jumpValue}
            placeholder={`1-${totalPages}`}
            onChange={(e) => setJumpValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                submitJump();
              }
            }}
          />
          <button type="button" className="rpp-item rpp-jump-btn" onClick={submitJump}>
            {labels.jump}
          </button>
        </span>
      )}
    </nav>
  );
}
