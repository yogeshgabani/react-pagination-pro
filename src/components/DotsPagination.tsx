import { useCallback, useEffect, useRef, type CSSProperties, type KeyboardEvent } from "react";
import type { BasePaginationProps } from "../types";
import { usePagination } from "../hooks/usePagination";
import { useResolvedDark } from "../hooks/useSystemDark";
import { themeToStyle } from "../utils/themeToStyle";
import { DEFAULT_LABELS } from "../variants";

/** How the active dot is drawn. */
export type DotsEffect = "expand" | "scale" | "slide" | "line";

export interface DotsPaginationProps
  extends Pick<
    BasePaginationProps,
    | "currentPage"
    | "totalPages"
    | "totalItems"
    | "pageSize"
    | "onPageChange"
    | "color"
    | "size"
    | "dark"
    | "rtl"
    | "showPrevNext"
    | "keyboard"
    | "theme"
    | "className"
    | "ariaLabel"
    | "labels"
  > {
  /**
   * Active-dot effect: `expand` stretches it into a pill, `scale` grows it,
   * `slide` glides one indicator between dots, `line` uses story-style bars.
   * Default "expand".
   */
  effect?: DotsEffect;
  /**
   * Most dots shown at once. Beyond this the row becomes a sliding window whose
   * edge dots shrink (Instagram-style). Pass `Infinity` to always show all. Default 7.
   */
  maxDots?: number;
}

/** Index range [start, end] of the visible window of dots, 1-based and inclusive. */
function dotWindow(current: number, total: number, maxDots: number): [number, number] {
  const size = Math.max(1, Math.floor(maxDots));
  if (total <= size) return [1, total];
  const start = Math.min(Math.max(1, current - Math.floor(size / 2)), total - size + 1);
  return [start, start + size - 1];
}

/**
 * Carousel / slider / onboarding-style dot pagination with four active-dot
 * effects and an auto-shrinking window for long ranges. Each dot is a real
 * button with a 24px hit area, `aria-current`, and arrow / Home / End keys.
 */
export function DotsPagination(props: DotsPaginationProps) {
  const {
    onPageChange,
    effect = "expand",
    maxDots = 7,
    color = "blue",
    size = "md",
    dark = "auto",
    rtl = false,
    showPrevNext = false,
    keyboard = true,
    theme,
    className,
    ariaLabel = "Pagination",
    labels: labelOverrides,
  } = props;

  const labels = { ...DEFAULT_LABELS, ...labelOverrides };
  const isDark = useResolvedDark(dark);
  const { currentPage, totalPages, hasPrev, hasNext, clamp } = usePagination(props);
  const [start, end] = dotWindow(currentPage, totalPages, maxDots);

  const trackRef = useRef<HTMLUListElement>(null);
  // Set by keyboard navigation so focus follows the active dot — otherwise it
  // would be lost when the focused dot slides out of the window and unmounts.
  const focusActive = useRef(false);

  useEffect(() => {
    if (!focusActive.current) return;
    focusActive.current = false;
    trackRef.current?.querySelector<HTMLElement>(".rpp-dot-active")?.focus();
  }, [currentPage]);

  const goTo = useCallback(
    (page: number) => {
      const next = clamp(page);
      if (next !== currentPage) onPageChange?.(next);
    },
    [clamp, currentPage, onPageChange],
  );

  const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (!keyboard) return;
    const step = rtl ? -1 : 1;
    const target: Record<string, number> = {
      ArrowRight: currentPage + step,
      ArrowLeft: currentPage - step,
      Home: 1,
      End: totalPages,
    };
    if (!(e.key in target)) return;
    e.preventDefault();
    const next = clamp(target[e.key]);
    if (next === currentPage) return;
    if ((e.target as HTMLElement).classList.contains("rpp-dot")) focusActive.current = true;
    onPageChange?.(next);
  };

  const rootClass = [
    "rpp",
    "rpp-dots",
    `rpp-dots-${effect}`,
    `rpp-c-${color}`,
    `rpp-s-${size}`,
    isDark ? "rpp-dark" : "",
    className || "",
  ]
    .filter(Boolean)
    .join(" ");

  const dots: number[] = [];
  for (let p = start; p <= end; p++) dots.push(p);

  /** Edge dots shrink when more pages exist beyond that side of the window. */
  const edgeClass = (p: number) => {
    const fromStart = start > 1 ? p - start : Infinity;
    const fromEnd = end < totalPages ? end - p : Infinity;
    const d = Math.min(fromStart, fromEnd);
    return d === 0 ? " rpp-dot-far" : d === 1 ? " rpp-dot-near" : "";
  };

  const arrow = (dir: "prev" | "next") => (
    <button
      type="button"
      className={`rpp-item rpp-nav rpp-${dir}`}
      onClick={() => goTo(currentPage + (dir === "prev" ? -1 : 1))}
      disabled={dir === "prev" ? !hasPrev : !hasNext}
      aria-label={dir === "prev" ? labels.previous : labels.next}
    >
      {dir === "prev" ? "‹" : "›"}
    </button>
  );

  return (
    <nav
      className={rootClass}
      style={themeToStyle(theme)}
      aria-label={ariaLabel}
      dir={rtl ? "rtl" : undefined}
      onKeyDown={onKeyDown}
    >
      {showPrevNext && arrow("prev")}
      <ul
        ref={trackRef}
        className="rpp-dots-track"
        style={{ "--rpp-dot-i": currentPage - start } as CSSProperties}
      >
        {dots.map((p) => {
          const active = p === currentPage;
          return (
            <li key={p}>
              <button
                type="button"
                className={`rpp-dot${active ? " rpp-dot-active" : edgeClass(p)}`}
                onClick={() => goTo(p)}
                aria-label={`${labels.page} ${p}`}
                aria-current={active ? "page" : undefined}
              />
            </li>
          );
        })}
        {effect === "slide" && <li className="rpp-dots-indicator" aria-hidden="true" />}
      </ul>
      {showPrevNext && arrow("next")}
    </nav>
  );
}
