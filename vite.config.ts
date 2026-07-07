import { readFileSync } from "node:fs";
import { defineConfig } from "vitest/config";

const pkg = JSON.parse(readFileSync("./package.json", "utf8")) as { version: string };

export default defineConfig({
  define: {
    "import.meta.env.VITE_PACKAGE_VERSION": JSON.stringify(pkg.version)
  },
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
        "components/yn-toast": "src/components/yn-toast/yn-toast.ts",
        "components/yn-cookie-notice": "src/components/yn-cookie-notice/yn-cookie-notice.ts",
        "components/yn-pull-cord-switch": "src/components/yn-pull-cord-switch/yn-pull-cord-switch.ts",
        "components/yn-quantity": "src/components/yn-quantity/yn-quantity.ts",
        "components/yn-checkout-address": "src/components/yn-checkout-address/yn-checkout-address.ts",
        "components/yn-sku-selector": "src/components/yn-sku-selector/yn-sku-selector.ts",
        "ssr/yn-navigation-shadow": "src/components/yn-navigation/yn-navigation-shadow.ts",
        "ssr/yn-search-shadow": "src/components/yn-search/yn-search-shadow.ts",
        "ssr/yn-dropdown-pick-shadow": "src/components/yn-dropdown-pick/yn-dropdown-pick-shadow.ts",
        "ssr/yn-drawer-shadow": "src/components/yn-drawer/yn-drawer-shadow.ts",
        "ssr/yn-button-shadow": "src/components/yn-button/yn-button-shadow.ts"
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
      external: ["lit"],
    },
  },
  test: {
    include: ["src/**/*.spec.ts"],
    globals: true,
    environment: "happy-dom"
  }
});
