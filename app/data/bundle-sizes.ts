import type { L10nText } from "../i18n/locale";

/** 来自 `pnpm build` ESM 产物（v1.0.4）。含分包时标注 total。 */
export type BundleSizeRow = {
  id: string;
  importPath: string;
  sizeKb: number;
  gzipKb: number;
  note?: L10nText;
};

export const BUNDLE_SIZES: BundleSizeRow[] = [
  { id: "yn-pick", importPath: "components/yn-pick", sizeKb: 3.96, gzipKb: 1.65 },
  { id: "yn-group-pick", importPath: "components/yn-group-pick", sizeKb: 4.71, gzipKb: 1.97 },
  { id: "yn-input", importPath: "components/yn-input", sizeKb: 8.41, gzipKb: 2.39 },
  { id: "yn-quantity", importPath: "components/yn-quantity", sizeKb: 8.66, gzipKb: 2.48 },
  { id: "yn-icon-connect-button", importPath: "components/yn-icon-connect-button", sizeKb: 11.61, gzipKb: 3.92 },
  { id: "yn-button", importPath: "components/yn-button", sizeKb: 13.79, gzipKb: 3.46 },
  { id: "yn-dropdown-pick", importPath: "components/yn-dropdown-pick", sizeKb: 14.88, gzipKb: 4.54 },
  { id: "yn-dropdown", importPath: "components/yn-dropdown", sizeKb: 17.06, gzipKb: 4.78 },
  { id: "yn-drawer", importPath: "components/yn-drawer", sizeKb: 18.92, gzipKb: 4.6 },
  { id: "yn-search", importPath: "components/yn-search", sizeKb: 20.46, gzipKb: 5.98 },
  { id: "yn-toast", importPath: "components/yn-toast", sizeKb: 21.53, gzipKb: 5.42 },
  { id: "yn-navigation", importPath: "components/yn-navigation", sizeKb: 21.74, gzipKb: 6.91 },
  {
    id: "yn-sku-selector",
    importPath: "components/yn-sku-selector",
    sizeKb: 25.4,
    gzipKb: 6.33,
    note: {
      "zh-CN": "入口 0.48 kB + 分包 24.92 kB",
      en: "entry 0.48 kB + chunk 24.92 kB"
    }
  },
  { id: "yn-pull-cord-switch", importPath: "components/yn-pull-cord-switch", sizeKb: 50.53, gzipKb: 12.03 },
  {
    id: "yn-checkout-address",
    importPath: "components/yn-checkout-address",
    sizeKb: 77.96,
    gzipKb: 18.54,
    note: {
      "zh-CN": "入口 0.41 kB + 核心分包 77.55 kB；provider/probe/dr5hn 逻辑按需懒加载",
      en: "entry 0.41 kB + core chunk 77.55 kB; provider/probe/dr5hn logic lazy-loads on demand"
    }
  }
];

export const BUNDLE_META = {
  builtAt: "2026-06-06",
  fullIifeKb: 316.28,
  fullIifeGzipKb: 76.79,
  defineKb: 0.59,
  indexExportKb: 2.45
} as const;
