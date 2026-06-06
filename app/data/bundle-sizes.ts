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
  { id: "yn-navigation", importPath: "components/yn-navigation", sizeKb: 21.79, gzipKb: 6.93 },
  {
    id: "yn-sku-selector",
    importPath: "components/yn-sku-selector",
    sizeKb: 25.4,
    gzipKb: 6.33,
    note: {
      "zh-CN": "首次注册约 0.48 kB；SKU 交互代码约 24.92 kB 会按需加载",
      en: "Initial registration ~0.48 kB; SKU interaction code ~24.92 kB loads on demand"
    }
  },
  {
    id: "yn-pull-cord-switch",
    importPath: "components/yn-pull-cord-switch",
    sizeKb: 51.01,
    gzipKb: 12.73,
    note: {
      "zh-CN": "页面先加载约 32.95 kB（gzip 7.75 kB）；首次显示/交互时再加载绳子物理动画约 18.06 kB（gzip 4.98 kB）",
      en: "Page initially loads ~32.95 kB (gzip 7.75 kB); rope physics animation loads on first render/interaction ~18.06 kB (gzip 4.98 kB)"
    }
  },
  {
    id: "yn-checkout-address",
    importPath: "components/yn-checkout-address",
    sizeKb: 77.96,
    gzipKb: 18.54,
    note: {
      "zh-CN": "页面先加载注册代码约 0.41 kB；地址表单核心约 77.55 kB 按需加载，Google/Photon/dr5hn 探测逻辑再按实际数据源懒加载",
      en: "Page initially loads registration ~0.41 kB; address form core ~77.55 kB loads on demand, and Google/Photon/dr5hn provider logic lazy-loads based on the selected source"
    }
  }
];

export const BUNDLE_META = {
  builtAt: "2026-06-06",
  fullIifeKb: 316.80,
  fullIifeGzipKb: 76.93,
  defineKb: 0.59,
  indexExportKb: 2.45
} as const;
