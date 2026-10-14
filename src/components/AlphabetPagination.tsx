import { useEffect, useRef, type KeyboardEvent } from "react";
import type { BasePaginationProps } from "../types";
import { useResolvedDark } from "../hooks/useSystemDark";
import { themeToStyle } from "../utils/themeToStyle";
import { DEFAULT_VARIANT } from "../variants";

/** "A" … "Z". */
export const ALPHABET: string[] = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));

export interface AlphabetPaginationProps
  extends Pick<
    BasePaginationProps,
    "variant" | "color" | "size" | "shape" | "dark" | "rtl" | "keyboard" | "theme" | "className"
  > {
  /** Active letter, or `null` for "All". */
  value: string | null;
  /** Called with the chosen letter, or `null` when "All" is chosen. */
  onChange?: (letter: string | null) => void;
  /** Letters to render, in order. Default A–Z; prepend "#" for a numbers bucket. */
  letters?: string[];
  /** Letters that have content. Others render disabled. Default: all enabled. */
  available?: string[];
  /** Prepend an "All" button that clears the filter. Default false. */
  showAll?: boolean;
  allLabel?: string;
  /** Accessible label for the nav landmark. Default "Alphabetical navigation". */
  ariaLabel?: string;
}

/**
 * A–Z letter bar for directories, glossaries, contacts and brand indexes.
 * Letters without content are disabled; arrow / Home / End keys skip them, and
 * typing a letter jumps straight to it. Renders with any built-in variant.
 */
export function AlphabetPagination({
  value,
  onChange,
  letters = ALPHABET,
  available,
  showAll = false,
  allLabel = "All",
  variant = DEFAULT_VARIANT,
  color = "blue",
  size = "md",
  shape = "rounded",
  dark = "auto",
  rtl = false,
  keyboard = true,
  theme,
  className,
  ariaLabel = "Alphabetical navigation",
}: AlphabetPaginationProps) {
  const isDark = useResolvedDark(dark);
  const enabled = new Set((available ?? letters).map((l) => l.toUpperCase()));
  const isEnabled = (l: string) => enabled.has(l.toUpperCase());

  // Navigable stops in order; `null` is the "All" button.
  const stops: (string | null)[] = [...(showAll ? [null] : []), ...letters.filter(isEnabled)];

  const listRef = useRef<HTMLUListElement>(null);
  // Set by keyboard navigation so focus moves with the selection instead of
  // staying on the letter the user started from.
  const focusActive = useRef(false);

  useEffect(() => {
    if (!focusActive.current) return;
    focusActive.current = false;
    listRef.current?.querySelector<HTMLElement>(".rpp-active")?.focus();
  }, [value]);

  const select = (next: string | null) => {
    if (next !== value) onChange?.(next);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (!keyboard || !stops.length) return;
    const step = rtl ? -1 : 1;
    const i = stops.indexOf(value);
    let next: string | null | undefined;
    if (e.key === "ArrowRight") next = stops[Math.min(stops.length - 1, i + step)] ?? stops[0];
    else if (e.key === "ArrowLeft") next = stops[Math.max(0, i - step)] ?? stops[0];
    else if (e.key === "Home") next = stops[0];
    else if (e.key === "End") next = stops[stops.length - 1];
    else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      // Type-to-jump: "m" selects M if it has content.
      next = letters.find((l) => l.toUpperCase() === e.key.toUpperCase() && isEnabled(l));
      if (next === undefined) return;
    } else return;
    e.preventDefault();
    if (next === value) return;
    if ((e.target as HTMLElement).classList.contains("rpp-page")) focusActive.current = true;
    onChange?.(next);
  };

  const rootClass = [
    "rpp",
    "rpp-alpha",
    `rpp-v-${variant}`,
    `rpp-c-${color}`,
    `rpp-s-${size}`,
    `rpp-shape-${shape}`,
    isDark ? "rpp-dark" : "",
    className || "",
  ]
    .filter(Boolean)
    .join(" ");

  const button = (letter: string | null) => {
    const active = letter === value;
    const disabled = letter !== null && !isEnabled(letter);
    return (
      // No remount-by-key here (unlike <Pagination />): adding .rpp-active
      // already replays the pop, and a remount would drop keyboard focus.
      <li key={letter ?? "__all"}>
        <button
          type="button"
          className={`rpp-item rpp-page${letter === null ? " rpp-alpha-all" : ""}${active ? " rpp-active" : ""}`}
          onClick={() => select(letter)}
          disabled={disabled}
          aria-current={active ? "true" : undefined}
        >
          {letter ?? allLabel}
        </button>
      </li>
    );
  };

  return (
    <nav
      className={rootClass}
      style={themeToStyle(theme)}
      aria-label={ariaLabel}
      dir={rtl ? "rtl" : undefined}
      onKeyDown={onKeyDown}
    >
      <ul ref={listRef} className="rpp-list">
        {showAll && button(null)}
        {letters.map(button)}
      </ul>
    </nav>
  );
}
