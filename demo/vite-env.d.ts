/// <reference types="vite/client" />

declare module "*.css";
declare module "react-next-pagination-pro/styles.css";

/** ISO timestamp stamped in by Vite at build time (see vite.config.ts). */
declare const __BUILD_DATE__: string;

/** Demo site config — see `.env.example`. Every value is optional; a missing
 *  link renders as a "Coming soon" button instead of navigating. */
interface ImportMetaEnv {
  readonly VITE_GITHUB_URL?: string;
  readonly VITE_NPM_URL?: string;
  readonly VITE_AUTHOR_NAME?: string;
  readonly VITE_AUTHOR_URL?: string;
  readonly VITE_WHATSAPP_URL?: string;
  readonly VITE_INSTAGRAM_URL?: string;
  readonly VITE_FACEBOOK_URL?: string;
  readonly VITE_YOUTUBE_URL?: string;
  readonly VITE_X_URL?: string;
  readonly VITE_LINKEDIN_URL?: string;
  /** Overrides the build-date stamp shown in the "Last updated" card. */
  readonly VITE_LAST_UPDATED?: string;
  /** Counter namespace, e.g. "react-next-pagination-pro". Unset => counters off. */
  readonly VITE_COUNTER_NAMESPACE?: string;
  /** Counter service base URL. Defaults to https://abacus.jasoncameron.dev. */
  readonly VITE_COUNTER_API?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
