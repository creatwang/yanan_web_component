import { defineConfig } from "vitest/config";

export default defineConfig({
  build: {
    lib: {
      entry: {
        index: "src/index.ts",
        define: "src/define.ts"
      },
      formats: ["es", "cjs"],
      fileName: (format, entryName) => {
        if (entryName === "index") {
          return format === "es" ? "index.js" : "index.cjs";
        }
        return format === "es" ? "define.js" : "define.cjs";
      }
    },
    rollupOptions: {
      external: ["lit"]
    }
  },
  test: {
    include: ["src/**/*.spec.ts"],
    globals: true,
    environment: "happy-dom"
  }
});
