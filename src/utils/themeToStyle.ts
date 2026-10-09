import type { CSSProperties } from "react";
import type { PaginationTheme } from "../types";

/** Maps the `theme` prop onto the component's CSS custom properties. */
export function themeToStyle(theme?: PaginationTheme): CSSProperties {
  if (!theme) return {};
  const map: Record<keyof PaginationTheme, string> = {
    primary: "--rpp-primary",
    onPrimary: "--rpp-on-primary",
    activeBg: "--rpp-active-bg",
    surface: "--rpp-surface",
    surfaceHover: "--rpp-surface-hover",
    text: "--rpp-text",
    muted: "--rpp-muted",
    border: "--rpp-border",
    // --rpp-radius-user outranks shape/variant radii (see pagination.css),
    // so an explicit theme radius always wins.
    radius: "--rpp-radius-user",
    gap: "--rpp-gap",
    fontSize: "--rpp-font-size",
  };
  const style: Record<string, string> = {};
  (Object.keys(theme) as (keyof PaginationTheme)[]).forEach((k) => {
    const v = theme[k];
    if (v != null) style[map[k]] = v;
  });
  return style as CSSProperties;
}
