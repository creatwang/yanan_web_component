import { defineConfig } from "vitest/config";

export default defineConfig({
  build: {
    lib: {
      entry: {
        index: "src/index.ts",
        define: "src/define.ts",
        "components/yn-button": "src/components/yn-button/yn-button.ts",
        "components/yn-input": "src/components/yn-input/yn-input.ts",
        "components/yn-navigation": "src/components/yn-navigation/yn-navigation.ts",
        "components/yn-search": "src/components/yn-search/yn-search.ts",
        "components/yn-icon-connect-button": "src/components/yn-icon-connect-button.ts"
      },
      formats: ["es", "cjs"],
      fileName: (format, entryName) => {
        if (entryName === "index") {
          return format === "es" ? "index.js" : "index.cjs";
        }
        if (entryName === "define") {
          return format === "es" ? "define.js" : "define.cjs";
        }
        return format === "es" ? `${entryName}.js` : `${entryName}.cjs`;
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
