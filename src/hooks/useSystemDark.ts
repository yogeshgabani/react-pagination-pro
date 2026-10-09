import { useEffect, useState } from "react";

/**
 * Tracks the OS/browser `prefers-color-scheme: dark` preference and re-renders
 * when the user switches their system theme. SSR-safe: returns `false` during
 * server render, then syncs to the real value on mount.
 */
export function useSystemDark(): boolean {
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window === "undefined" || !window.matchMedia) return false;
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (e: MediaQueryListEvent) => setIsDark(e.matches);
    // Sync immediately in case the preference changed before mount.
    setIsDark(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return isDark;
}

/**
 * Resolves a `dark` prop that may be a boolean or `"auto"` into a concrete
 * boolean. `"auto"` (and `undefined`) follow the system color scheme; an
 * explicit boolean always wins.
 */
export function useResolvedDark(dark: boolean | "auto" | undefined): boolean {
  const systemDark = useSystemDark();
  if (dark === undefined || dark === "auto") return systemDark;
  return dark;
}
