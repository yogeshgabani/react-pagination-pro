import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

export default defineConfig({
  plugins: [react()],
  // Mirrors the build-time stamp vite.config.ts injects for the demo footer.
  define: {
    __BUILD_DATE__: JSON.stringify(new Date().toISOString()),
  },
  resolve: {
    // Same alias as vite.config.ts so demo components can be smoke-tested.
    alias: {
      "react-next-pagination-pro/styles.css": resolve(import.meta.dirname, "src/styles/pagination.css"),
      "react-next-pagination-pro": resolve(import.meta.dirname, "src/index.ts"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    include: ["test/**/*.test.{ts,tsx}"],
  },
});
