import { defineConfig } from "vite";

export default defineConfig({
  build: {
    outDir: "dist",
    emptyOutDir: false,
    lib: {
      entry: "src/index.ts",
      name: "YnWebComponent",
      formats: ["umd", "iife"],
      fileName: (format) => {
        if (format === "umd") return "index.umd.js";
        return "index.iife.js";
      }
    },
    rollupOptions: {
      external: ["lit"],
      output: {
        globals: {
          lit: "lit"
        }
      }
    }
  }
});
