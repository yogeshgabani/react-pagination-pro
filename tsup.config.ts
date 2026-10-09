import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    styles: "src/styles/pagination.css",
  },
  format: ["esm", "cjs"],
  // Only generate type declarations for the JS entry (not the CSS).
  dts: { entry: "src/index.ts" },
  sourcemap: true,
  clean: true,
  // No `treeshake`: it re-bundles through Rollup, which strips the
  // "use client" banner below. esbuild already tree-shakes the bundle.
  external: ["react", "react-dom"],
  esbuildOptions(options) {
    options.banner = {
      js: '"use client";',
    };
  },
});
