import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";
import pkg from "./package.json";
import { PAGINATION_VARIANTS } from "./src/variants";
import { ogImage } from "./scripts/vite-plugin-og";

const demoDir = resolve(import.meta.dirname, "demo");

// The demo imports the library straight from source via this alias, so you can
// edit `src/**` and see changes hot-reload without a build step.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, demoDir, "VITE_");
  // Open Graph needs an absolute URL. Netlify provides one per deploy: the
  // primary domain in production, the preview's own URL elsewhere.
  const { CONTEXT, URL, DEPLOY_PRIME_URL } = process.env;
  const siteUrl =
    env.VITE_SITE_URL || (CONTEXT === "production" ? URL : DEPLOY_PRIME_URL) || URL || undefined;
  const variants = PAGINATION_VARIANTS.length;

  return {
    root: "demo",
    plugins: [
      react(),
      ogImage({
        title: `react-next-pagination-pro — ${variants}+ pagination components for React & Next.js`,
        description:
          `Modern, accessible pagination for React & Next.js: ${variants}+ UI variants, headless hooks, ` +
          `cursor / load-more / URL sync, keyboard & ARIA, dark mode, RTL and TypeScript.`,
        alt: `react-next-pagination-pro — ${variants}+ UI variants for React & Next.js`,
        siteUrl,
        card: { variantCount: variants, version: pkg.version },
      }),
    ],
    // Stamped at build time so the footer's "Last updated" needs no maintenance.
    define: {
      __BUILD_DATE__: JSON.stringify(new Date().toISOString()),
    },
    resolve: {
      alias: {
        "react-next-pagination-pro/styles.css": resolve(import.meta.dirname, "src/styles/pagination.css"),
        "react-next-pagination-pro": resolve(import.meta.dirname, "src/index.ts"),
      },
    },
    server: {
      port: 5188,
      open: false,
    },
  };
});
