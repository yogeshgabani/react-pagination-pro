import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import type { BasePaginationProps } from "../types";
import { usePagination } from "../hooks/usePagination";
import { useResolvedDark } from "../hooks/useSystemDark";
import { themeToStyle } from "../utils/themeToStyle";
import { DEFAULT_LABELS } from "../variants";

export interface TablePaginationProps extends BasePaginationProps {
  /** Choices for the rows-per-page dropdown. Default [10, 25, 50, 100]. */
  pageSizeOptions?: number[];
  /** Called with the new page size when the user picks one. */
  onPageSizeChange?: (pageSize: number) => void;
  /** Show the rows-per-page dropdown. Default true. */
  showPageSizeSelect?: boolean;
  /** Show the "1 - 10 / 42" range label. Default true. */
  showRange?: boolean;
  /** Show the boxed "1 OF 5" page indicator. Default true. */
  showPageBox?: boolean;
}

/**
 * Data-grid footer pagination bar: a rows-per-page dropdown and an
 * "1 - 10 / 42" range summary on the left, and a boxed "1 OF 5" page
 * indicator (with an editable page input) plus Prev/Next on the right.
 *
 * @example
 * <TablePagination
 *   currentPage={page}
 *   pageSize={pageSize}
 *   totalItems={42}
 *   onPageChange={setPage}
 *   onPageSizeChange={setPageSize}
 * />
 */
export function TablePagination(props: TablePaginationProps) {
  const {
    onPageChange,
    onPageSizeChange,
    pageSize = 10,
    totalItems,
    pageSizeOptions = [10, 25, 50, 100],
    showPageSizeSelect = true,
    showRange = true,
    showPageBox = true,
    showPrevNext = true,
    variant = "table-footer",
    color = "blue",
    size = "md",
    dark = "auto",
    rtl = false,
    theme,
    className,
    ariaLabel = "Table pagination",
    labels: labelOverrides,
  } = props;

  const labels = { ...DEFAULT_LABELS, ...labelOverrides };
  const isDark = useResolvedDark(dark);
  const { currentPage, totalPages, hasPrev, hasNext, startItem, endItem, clamp } =
    usePagination(props);

  // Local draft while the user types into the page box; null = not editing.
  const [pageDraft, setPageDraft] = useState<string | null>(null);

  // Custom rows-per-page dropdown (no native <select> so it can be styled).
  const [sizeOpen, setSizeOpen] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  // Auto-flip: open upward when the trigger sits near the bottom of the screen.
  const [dropUp, setDropUp] = useState(false);
  const selectRef = useRef<HTMLSpanElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Close when clicking anywhere outside the dropdown.
  useEffect(() => {
    if (!sizeOpen) return;
    const onOutside = (e: PointerEvent) => {
      if (!selectRef.current?.contains(e.target as Node)) setSizeOpen(false);
    };
    document.addEventListener("pointerdown", onOutside);
    return () => document.removeEventListener("pointerdown", onOutside);
  }, [sizeOpen]);

  // Measure the open list against the viewport and flip it above the trigger
  // when there isn't enough room below (typical for footers at page bottom).
  useLayoutEffect(() => {
    if (!sizeOpen) return;
    const btn = selectRef.current?.getBoundingClientRect();
    const listHeight = listRef.current?.offsetHeight ?? 0;
    if (!btn) return;
    const spaceBelow = window.innerHeight - btn.bottom;
    const spaceAbove = btn.top;
    setDropUp(spaceBelow < listHeight + 8 && spaceAbove > spaceBelow);
  }, [sizeOpen]);

  const toggleSize = () => {
    setSizeOpen((o) => !o);
    setHighlight(pageSizeOptions.indexOf(pageSize));
  };

  const pickSize = (opt: number) => {
    setSizeOpen(false);
    if (opt !== pageSize) onPageSizeChange?.(opt);
  };

  const onSizeKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (!sizeOpen) {
      if (["Enter", " ", "ArrowDown", "ArrowUp"].includes(e.key)) {
        e.preventDefault();
        toggleSize();
      }
      return;
    }
    switch (e.key) {
      case "ArrowDown":
        setHighlight((h) => Math.min(h + 1, pageSizeOptions.length - 1));
        break;
      case "ArrowUp":
        setHighlight((h) => Math.max(h - 1, 0));
        break;
      case "Enter":
      case " ":
        if (highlight >= 0) pickSize(pageSizeOptions[highlight]);
        break;
      case "Escape":
        setSizeOpen(false);
        break;
      default:
        return;
    }
    e.preventDefault();
  };

  const goTo = (page: number) => {
    const next = clamp(page);
    if (next !== currentPage) onPageChange?.(next);
  };

  const commitDraft = () => {
    if (pageDraft !== null) {
      const n = parseInt(pageDraft, 10);
      if (!Number.isNaN(n)) goTo(n);
    }
    setPageDraft(null);
  };

  const onDraftKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      commitDraft();
    } else if (e.key === "Escape") {
      setPageDraft(null);
    }
  };

  const rootClass = [
    "rpp",
    "rpp-table",
    `rpp-v-${variant}`,
    `rpp-c-${color}`,
    `rpp-s-${size}`,
    isDark ? "rpp-dark" : "",
    className || "",
  ]
    .filter(Boolean)
    .join(" ");

  const total = totalItems ?? totalPages * pageSize;

  return (
    <nav
      className={rootClass}
      style={themeToStyle(theme)}
      aria-label={ariaLabel}
      dir={rtl ? "rtl" : undefined}
    >
      {/* Inner wrapper so a container query on the nav can rewrap/center it. */}
      <div className="rpp-table-inner">
      <div className="rpp-table-left">
        {showPageSizeSelect && (
          <span className="rpp-select" ref={selectRef}>
            <button
              type="button"
              className="rpp-select-btn"
              aria-haspopup="listbox"
              aria-expanded={sizeOpen}
              aria-label={labels.rowsPerPage}
              onClick={toggleSize}
              onKeyDown={onSizeKeyDown}
            >
              {pageSize}
              <svg
                className="rpp-select-chevron"
                width="10"
                height="10"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M4 6l4 4 4-4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            {sizeOpen && (
              <ul
                ref={listRef}
                className={`rpp-select-list${dropUp ? " rpp-select-list-up" : ""}`}
                role="listbox"
                aria-label={labels.rowsPerPage}
              >
                {pageSizeOptions.map((opt, i) => (
                  <li
                    key={opt}
                    role="option"
                    aria-selected={opt === pageSize}
                    className={`rpp-select-opt${opt === pageSize ? " is-selected" : ""}${
                      i === highlight ? " is-hi" : ""
                    }`}
                    onClick={() => pickSize(opt)}
                    onMouseMove={() => setHighlight(i)}
                  >
                    {opt}
                  </li>
                ))}
              </ul>
            )}
          </span>
        )}
        {showRange && (
          <span className="rpp-range" aria-live="polite">
            {startItem} - {Math.min(endItem, total)} / {total}
          </span>
        )}
      </div>

      <div className="rpp-table-right">
        {showPrevNext && (
          <button
            type="button"
            className="rpp-item rpp-nav rpp-prev"
            onClick={() => goTo(currentPage - 1)}
            disabled={!hasPrev}
            aria-label={labels.previous}
          >
            ‹
          </button>
        )}
        {showPageBox && (
          <span className="rpp-pagebox">
            <input
              className="rpp-pagebox-input"
              type="text"
              inputMode="numeric"
              value={pageDraft ?? String(currentPage)}
              onChange={(e) => setPageDraft(e.target.value)}
              onBlur={commitDraft}
              onKeyDown={onDraftKeyDown}
              aria-label={labels.jump}
            />
            <span className="rpp-pagebox-of">{labels.of}</span>
            <span className="rpp-pagebox-total">{totalPages}</span>
          </span>
        )}
        {showPrevNext && (
          <button
            type="button"
            className="rpp-item rpp-nav rpp-next"
            onClick={() => goTo(currentPage + 1)}
            disabled={!hasNext}
            aria-label={labels.next}
          >
            ›
          </button>
        )}
      </div>
      </div>
    </nav>
  );
}
