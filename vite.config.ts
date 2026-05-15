import { defineConfig } from "vitest/config";

export default defineConfig({
  build: {
    lib: {
      entry: {
        index: "src/index.ts",
        define: "src/define.ts",
        "asset/svg": "src/asset/svg/index.ts",
        "components/yn-button": "src/components/yn-button/yn-button.ts",
        "components/yn-input": "src/components/yn-input/yn-input.ts",
        "components/yn-navigation": "src/components/yn-navigation/yn-navigation.ts",
        "components/yn-search": "src/components/yn-search/yn-search.ts",
        "components/yn-icon-connect-button": "src/components/yn-icon-connect-button.ts",
        "components/yn-group-pick": "src/components/yn-group-pick/yn-group-pick.ts",
        "components/yn-pick": "src/components/yn-pick/yn-pick.ts",
        "components/yn-dropdown": "src/components/yn-dropdown/yn-dropdown.ts",
        "components/yn-dropdown-pick": "src/components/yn-dropdown-pick/yn-dropdown-pick.ts",
        "components/yn-drawer": "src/components/yn-drawer/yn-drawer.ts",
        "components/yn-toast": "src/components/yn-toast/yn-toast.ts"
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
