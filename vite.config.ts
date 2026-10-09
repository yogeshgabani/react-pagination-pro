import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

// The demo imports the library straight from source via this alias, so you can
// edit `src/**` and see changes hot-reload without a build step.
export default defineConfig({
  root: "demo",
  plugins: [react()],
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
});
