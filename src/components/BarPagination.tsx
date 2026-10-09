import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import type { BasePaginationProps, PageItem } from "../types";
import { ELLIPSIS } from "../types";
import { usePagination } from "../hooks/usePagination";
import { useResolvedDark } from "../hooks/useSystemDark";
import { themeToStyle } from "../utils/themeToStyle";
import { DEFAULT_LABELS } from "../variants";

/** How the range summary reads. */
export type BarTotalFormat = "range" | "showing" | "page";

/** Where the numbered pages sit relative to the side clusters. */
export type BarLayout = "split" | "spread" | "center" | "end";

export interface BarPaginationProps extends BasePaginationProps {
  /** Show a summary like "1 - 10 / 35". Default true. */
  showTotal?: boolean;
  /** Summary wording: `"range"` → "1 - 10 / 35", `"showing"` → "Showing 1-10 of
   *  35", `"page"` → "Page 2 of 10". Default "range". */
  totalFormat?: BarTotalFormat;
  /** Show the numbered page buttons (with ellipsis). Default true. */
  showPageNumbers?: boolean;
  /** Show First / Last (« ») buttons. Default false. */
  showFirstLast?: boolean;
  /** Show Prev / Next buttons. Default true. */
  showPrevNext?: boolean;
  /** Render Prev/Next as labelled text buttons ("← Previous" / "Next →")
   *  instead of bare arrows. Default false. */
  navLabels?: boolean;
  /** Show the rows-per-page dropdown. Default false. */
  showPageSize?: boolean;
  /** Choices for the rows-per-page dropdown. Default [10, 20, 30, 50]. */
  pageSizeOptions?: number[];
  /** Called with the new page size when the user picks one. */
  onPageSizeChange?: (pageSize: number) => void;
  /** Show a "Go to page [input] [Go]" control. Default false. */
  showGoto?: boolean;
  /** Arrangement of the clusters. Default "split". */
  layout?: BarLayout;
}

/**
 * A toolbar / data-grid **footer bar** that composes a range summary, an
 * optional rows-per-page dropdown, numbered pages with First/Prev/Next/Last,
 * and an optional "Go to page" input — arranged in a single responsive row.
 *
 * Every piece is a toggle, so one component reproduces the common table-footer
 * layouts (summary left, pages right; page-size + pages + go-to spread across;
 * etc.).
 *
 * @example
 * <BarPagination
 *   currentPage={page}
 *   pageSize={pageSize}
 *   totalItems={350}
 *   onPageChange={setPage}
 *   onPageSizeChange={setPageSize}
 *   showPageSize
 *   showGoto
 *   variant="bar-clean"
 * />
 */
export function BarPagination(props: BarPaginationProps) {
  const {
    onPageChange,
    onPageSizeChange,
    pageSize = 10,
    totalItems,
    pageSizeOptions = [10, 20, 30, 50],
    showTotal = true,
    totalFormat = "range",
    showPageNumbers = true,
    showFirstLast = false,
    showPrevNext = true,
    navLabels = false,
    showPageSize = false,
    showGoto = false,
    layout = "split",
    variant = "bar-clean",
    color = "blue",
    size = "md",
    dark = "auto",
    rtl = false,
    theme,
    className,
    ariaLabel = "Pagination",
    labels: labelOverrides,
  } = props;

  const labels = { ...DEFAULT_LABELS, ...labelOverrides };
  const isDark = useResolvedDark(dark);
  const { items, currentPage, totalPages, hasPrev, hasNext, isFirst, isLast, startItem, endItem, clamp } =
    usePagination(props);

  const goTo = (page: number) => {
    const next = clamp(page);
    if (next !== currentPage) onPageChange?.(next);
  };

  // ---- Go-to input ----
  const [gotoValue, setGotoValue] = useState("");
  const submitGoto = () => {
    const n = parseInt(gotoValue, 10);
    if (!Number.isNaN(n)) goTo(n);
    setGotoValue("");
  };
  const onGotoKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      submitGoto();
    }
  };

  // ---- Custom rows-per-page dropdown (styled, no native <select>) ----
  const [sizeOpen, setSizeOpen] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const [dropUp, setDropUp] = useState(false);
  const selectRef = useRef<HTMLSpanElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (!sizeOpen) return;
    const onOutside = (e: PointerEvent) => {
      if (!selectRef.current?.contains(e.target as Node)) setSizeOpen(false);
    };
    document.addEventListener("pointerdown", onOutside);
    return () => document.removeEventListener("pointerdown", onOutside);
  }, [sizeOpen]);

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

  const total = totalItems ?? totalPages * pageSize;
  const rangeStart = startItem;
  const rangeEnd = Math.min(endItem, total);

  const summaryText =
    totalFormat === "page"
      ? `${labels.pageLabel} ${currentPage} ${labels.of} ${totalPages}`
      : totalFormat === "showing"
        ? `${labels.showing} ${rangeStart}-${rangeEnd} ${labels.of} ${total}`
        : `${rangeStart} - ${rangeEnd} / ${total}`;

  const rootClass = [
    "rpp",
    "rpp-bar",
    `rpp-bar-${layout}`,
    `rpp-v-${variant}`,
    `rpp-c-${color}`,
    `rpp-s-${size}`,
    isDark ? "rpp-dark" : "",
    className || "",
  ]
    .filter(Boolean)
    .join(" ");

  const sizeSelect = showPageSize && (
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
        <svg className="rpp-select-chevron" width="10" height="10" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
              className={`rpp-select-opt${opt === pageSize ? " is-selected" : ""}${i === highlight ? " is-hi" : ""}`}
              onClick={() => pickSize(opt)}
              onMouseMove={() => setHighlight(i)}
            >
              {opt}
            </li>
          ))}
        </ul>
      )}
    </span>
  );

  const gotoControl = showGoto && (
    <span className="rpp-goto">
      <span className="rpp-goto-label">{labels.goto}</span>
      {/* Input + Go wrap as one unit, so a narrow bar never strands "Go". */}
      <span className="rpp-goto-field">
        <input
          className="rpp-goto-input"
          type="text"
          inputMode="numeric"
          value={gotoValue}
          placeholder={String(currentPage)}
          onChange={(e) => setGotoValue(e.target.value)}
          onKeyDown={onGotoKeyDown}
          aria-label={labels.goto}
        />
        <button type="button" className="rpp-item rpp-goto-btn" onClick={submitGoto}>
          {labels.go}
        </button>
      </span>
    </span>
  );

  // The numbered pages + nav arrows, rendered as one list.
  const pages = (
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
            className={`rpp-item rpp-nav rpp-prev${navLabels ? " rpp-nav-labelled" : ""}`}
            onClick={() => goTo(currentPage - 1)}
            disabled={!hasPrev}
            aria-label={labels.previous}
          >
            {navLabels ? <>‹ {labels.previous.replace(/ page$/i, "")}</> : "‹"}
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
            <li key={item}>
              <button
                key={active ? `active-${item}` : `page-${item}`}
                type="button"
                className={`rpp-item rpp-page${active ? " rpp-active" : ""}`}
                onClick={() => goTo(item)}
                aria-label={`${labels.page} ${item}`}
                aria-current={active ? "page" : undefined}
              >
                {item}
              </button>
            </li>
          );
        })}
      {showPrevNext && (
        <li>
          <button
            type="button"
            className={`rpp-item rpp-nav rpp-next${navLabels ? " rpp-nav-labelled" : ""}`}
            onClick={() => goTo(currentPage + 1)}
            disabled={!hasNext}
            aria-label={labels.next}
          >
            {navLabels ? <>{labels.next.replace(/ page$/i, "")} ›</> : "›"}
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
  );

  // Left cluster: summary + rows-per-page. Right cluster: go-to.
  const hasLeft = showTotal || showPageSize;
  const hasRight = showGoto;

  return (
    <nav
      className={rootClass}
      style={themeToStyle(theme)}
      aria-label={ariaLabel}
      dir={rtl ? "rtl" : undefined}
    >
      <div className="rpp-bar-inner">
        {hasLeft && (
          <div className="rpp-bar-start">
            {showPageSize && sizeSelect}
            {showTotal && (
              <span className="rpp-bar-total" aria-live="polite">
                {summaryText}
              </span>
            )}
          </div>
        )}
        <div className="rpp-bar-main">{pages}</div>
        {hasRight && <div className="rpp-bar-end">{gotoControl}</div>}
      </div>
    </nav>
  );
}
