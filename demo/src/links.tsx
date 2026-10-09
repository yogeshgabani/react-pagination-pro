import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

/* Single source of truth for every outbound URL — all of it comes from
   `demo/.env` (see .env.example). An empty value becomes `undefined`, which
   makes the link render as a "Coming soon" button instead of a dead link. */
const env = import.meta.env;
const val = (v?: string) => (v && v.trim() ? v.trim() : undefined);

export const LINKS = {
  github: val(env.VITE_GITHUB_URL),
  npm: val(env.VITE_NPM_URL),
  author: val(env.VITE_AUTHOR_URL),
  whatsapp: val(env.VITE_WHATSAPP_URL),
  instagram: val(env.VITE_INSTAGRAM_URL),
  facebook: val(env.VITE_FACEBOOK_URL),
  youtube: val(env.VITE_YOUTUBE_URL),
  x: val(env.VITE_X_URL),
  linkedin: val(env.VITE_LINKEDIN_URL),
} as const;

/** Falls back to the build-time stamp, so it stays current with no upkeep. */
export const LAST_UPDATED = val(env.VITE_LAST_UPDATED) ?? __BUILD_DATE__;

export const AUTHOR = val(env.VITE_AUTHOR_NAME) ?? "Yogesh Gabani";

/* ---------- "Coming soon" dialog, shared by the header and the footer ---------- */
const ComingSoonCtx = createContext<(label: string) => void>(() => {});

/** Opens the shared "Coming soon" dialog for an unconfigured link. */
export const useComingSoon = () => useContext(ComingSoonCtx);

export function ComingSoonProvider({ children }: { children: ReactNode }) {
  const [soon, setSoon] = useState<string | null>(null);

  // Esc closes the dialog, matching the variant preview modal.
  useEffect(() => {
    if (!soon) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSoon(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [soon]);

  return (
    <ComingSoonCtx.Provider value={setSoon}>
      {children}
      {soon &&
        createPortal(
          <div className="soon-overlay" onClick={() => setSoon(null)}>
            <div
              className="soon"
              role="dialog"
              aria-modal="true"
              aria-label="Coming soon"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="soon-mark" aria-hidden="true">🚧</span>
              <h3>Coming soon</h3>
              <p>
                <b>{soon}</b> isn’t live yet — it’ll be linked here as soon as it’s published.
              </p>
              <button type="button" className="soon-btn" onClick={() => setSoon(null)} autoFocus>
                Got it
              </button>
            </div>
          </div>,
          document.body,
        )}
    </ComingSoonCtx.Provider>
  );
}

/**
 * Renders an `<a>` when `url` is configured, otherwise a button that opens the
 * shared "Coming soon" dialog. Keeps every call site free of null-checks.
 */
export function SiteLink({
  url,
  label,
  className,
  title,
  children,
}: {
  url?: string;
  /** Human name used in the "Coming soon" copy and as the accessible label. */
  label: string;
  className?: string;
  title?: string;
  children: ReactNode;
}) {
  const openSoon = useComingSoon();
  const name = title ?? label;
  return url ? (
    <a className={className} href={url} target="_blank" rel="noreferrer" title={name} aria-label={name}>
      {children}
    </a>
  ) : (
    <button
      type="button"
      className={className}
      onClick={() => openSoon(label)}
      title={`${name} — coming soon`}
      aria-label={`${name} — coming soon`}
    >
      {children}
    </button>
  );
}
