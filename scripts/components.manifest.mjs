/**
 * 组件库导出入口单一数据源。
 * 被 vite.config.ts、sync-package-entries.mjs 消费。
 */

/** @typedef {{ id: string; entry: string; types: string; defineImport: string }} ComponentManifest */

/** @type {ComponentManifest[]} */
export const COMPONENTS = [
  {
    id: "yn-button",
    entry: "src/components/yn-button/yn-button.ts",
    types: "dist/types/components/yn-button/yn-button.d.ts",
    defineImport: "./components/yn-button/yn-button",
  },
  {
    id: "yn-input",
    entry: "src/components/yn-input/yn-input.ts",
    types: "dist/types/components/yn-input/yn-input.d.ts",
    defineImport: "./components/yn-input/yn-input",
  },
  {
    id: "yn-navigation",
    entry: "src/components/yn-navigation/yn-navigation.ts",
    types: "dist/types/components/yn-navigation/yn-navigation.d.ts",
    defineImport: "./components/yn-navigation/yn-navigation",
  },
  {
    id: "yn-search",
    entry: "src/components/yn-search/yn-search.ts",
    types: "dist/types/components/yn-search/yn-search.d.ts",
    defineImport: "./components/yn-search/yn-search",
  },
  {
    id: "yn-group-pick",
    entry: "src/components/yn-group-pick/yn-group-pick.ts",
    types: "dist/types/components/yn-group-pick/yn-group-pick.d.ts",
    defineImport: "./components/yn-group-pick/yn-group-pick",
  },
  {
    id: "yn-pick",
    entry: "src/components/yn-pick/yn-pick.ts",
    types: "dist/types/components/yn-pick/yn-pick.d.ts",
    defineImport: "./components/yn-pick/yn-pick",
  },
  {
    id: "yn-dropdown",
    entry: "src/components/yn-dropdown/yn-dropdown.ts",
    types: "dist/types/components/yn-dropdown/yn-dropdown.d.ts",
    defineImport: "./components/yn-dropdown/yn-dropdown",
  },
  {
    id: "yn-dropdown-pick",
    entry: "src/components/yn-dropdown-pick/yn-dropdown-pick.ts",
    types: "dist/types/components/yn-dropdown-pick/yn-dropdown-pick.d.ts",
    defineImport: "./components/yn-dropdown-pick/yn-dropdown-pick",
  },
  {
    id: "yn-drawer",
    entry: "src/components/yn-drawer/yn-drawer.ts",
    types: "dist/types/components/yn-drawer/yn-drawer.d.ts",
    defineImport: "./components/yn-drawer/yn-drawer",
  },
  {
    id: "yn-toast",
    entry: "src/components/yn-toast/yn-toast.ts",
    types: "dist/types/components/yn-toast/yn-toast.d.ts",
    defineImport: "./components/yn-toast/yn-toast",
  },
  {
    id: "yn-cookie-notice",
    entry: "src/components/yn-cookie-notice/yn-cookie-notice.ts",
    types: "dist/types/components/yn-cookie-notice/yn-cookie-notice.d.ts",
    defineImport: "./components/yn-cookie-notice/yn-cookie-notice",
  },
  {
    id: "yn-icon-connect-button",
    entry: "src/components/yn-icon-connect-button.ts",
    types: "dist/types/components/yn-icon-connect-button.d.ts",
    defineImport: "./components/yn-icon-connect-button/yn-icon-connect-button",
  },
  {
    id: "yn-pull-cord-switch",
    entry: "src/components/yn-pull-cord-switch/yn-pull-cord-switch.ts",
    types: "dist/types/components/yn-pull-cord-switch/yn-pull-cord-switch.d.ts",
    defineImport: "./components/yn-pull-cord-switch/yn-pull-cord-switch",
  },
  {
    id: "yn-quantity",
    entry: "src/components/yn-quantity/yn-quantity.ts",
    types: "dist/types/components/yn-quantity/yn-quantity.d.ts",
    defineImport: "./components/yn-quantity/yn-quantity",
  },
  {
    id: "yn-checkout-address",
    entry: "src/components/yn-checkout-address/yn-checkout-address.ts",
    types: "dist/types/components/yn-checkout-address/yn-checkout-address.d.ts",
    defineImport: "./components/yn-checkout-address/yn-checkout-address",
  },
  {
    id: "yn-sku-selector",
    entry: "src/components/yn-sku-selector/yn-sku-selector.ts",
    types: "dist/types/components/yn-sku-selector/yn-sku-selector.d.ts",
    defineImport: "./components/yn-sku-selector/yn-sku-selector",
  },
];

/** @typedef {{ exportSubpath: string; viteKey: string; entry: string; types: string }} SsrManifest */

/** @type {SsrManifest[]} */
export const SSR_ENTRIES = [
  {
    exportSubpath: "./ssr/yn-navigation",
    viteKey: "ssr/yn-navigation-shadow",
    entry: "src/components/yn-navigation/yn-navigation-shadow.ts",
    types: "dist/types/ssr/yn-navigation-shadow.d.ts",
  },
  {
    exportSubpath: "./ssr/yn-search",
    viteKey: "ssr/yn-search-shadow",
    entry: "src/components/yn-search/yn-search-shadow.ts",
    types: "dist/types/components/yn-search/yn-search-shadow.d.ts",
  },
  {
    exportSubpath: "./ssr/yn-dropdown-pick",
    viteKey: "ssr/yn-dropdown-pick-shadow",
    entry: "src/components/yn-dropdown-pick/yn-dropdown-pick-shadow.ts",
    types: "dist/types/components/yn-dropdown-pick/yn-dropdown-pick-shadow.d.ts",
  },
  {
    exportSubpath: "./ssr/yn-drawer",
    viteKey: "ssr/yn-drawer-shadow",
    entry: "src/components/yn-drawer/yn-drawer-shadow.ts",
    types: "dist/types/components/yn-drawer/yn-drawer-shadow.d.ts",
  },
  {
    exportSubpath: "./ssr/yn-button",
    viteKey: "ssr/yn-button-shadow",
    entry: "src/components/yn-button/yn-button-shadow.ts",
    types: "dist/types/components/yn-button/yn-button-shadow.d.ts",
  },
  {
    exportSubpath: "./ssr/yn-input",
    viteKey: "ssr/yn-input-shadow",
    entry: "src/components/yn-input/yn-input-shadow.ts",
    types: "dist/types/components/yn-input/yn-input-shadow.d.ts",
  },
  {
    exportSubpath: "./ssr/yn-quantity",
    viteKey: "ssr/yn-quantity-shadow",
    entry: "src/components/yn-quantity/yn-quantity-shadow.ts",
    types: "dist/types/components/yn-quantity/yn-quantity-shadow.d.ts",
  },
];

/** @returns {Record<string, string>} */
export function buildViteLibEntries() {
  /** @type {Record<string, string>} */
  const entries = {
    index: "src/index.ts",
    define: "src/define.ts",
    "asset/svg": "src/asset/svg/index.ts",
  };
  for (const component of COMPONENTS) {
    entries[`components/${component.id}`] = component.entry;
  }
  for (const ssr of SSR_ENTRIES) {
    entries[ssr.viteKey] = ssr.entry;
  }
  return entries;
}

/** @returns {Record<string, unknown>} */
export function buildPackageComponentExports() {
  /** @type {Record<string, unknown>} */
  const exports = {
    ".": {
      types: "./dist/types/index.d.ts",
      import: "./dist/index.js",
      require: "./dist/index.cjs",
    },
    "./define": {
      types: "./dist/types/define.d.ts",
      import: "./dist/define.js",
      require: "./dist/define.cjs",
    },
    "./theme.css": "./src/styles/theme.css",
    "./asset/svg": {
      types: "./dist/types/asset/svg/index.d.ts",
      import: "./dist/asset/svg.js",
      require: "./dist/asset/svg.cjs",
    },
  };

  for (const component of COMPONENTS) {
    exports[`./components/${component.id}`] = {
      types: `./${component.types}`,
      import: `./dist/components/${component.id}.js`,
      require: `./dist/components/${component.id}.cjs`,
    };
  }

  for (const ssr of SSR_ENTRIES) {
    const fileName = ssr.viteKey.split("/").pop();
    exports[ssr.exportSubpath] = {
      types: `./${ssr.types}`,
      import: `./dist/ssr/${fileName}.js`,
      require: `./dist/ssr/${fileName}.cjs`,
    };
  }

  exports["./umd"] = { default: "./dist/index.umd.js" };
  exports["./iife"] = { default: "./dist/index.iife.js" };
  return exports;
}

/** @returns {string} */
export function buildDefineSource() {
  const lines = COMPONENTS.map(
    (component) => `import "${component.defineImport}";`,
  );
  return `${lines.join("\n")}\n`;
}
