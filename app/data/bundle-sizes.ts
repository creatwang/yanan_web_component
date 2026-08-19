import type { L10nText } from "../i18n/locale";

/** 来自 `pnpm build` ESM 产物（v1.0.15，2026-08-19）。含分包时标注 total。 */
export type BundleSizeRow = {
  id: string;
  importPath: string;
  sizeKb: number;
  gzipKb: number;
  note?: L10nText;
};

export const BUNDLE_SIZES: BundleSizeRow[] = [
  { id: "yn-input", importPath: "components/yn-input", sizeKb: 0.18, gzipKb: 0.15 },
  { id: "yn-navigation", importPath: "components/yn-navigation", sizeKb: 0.19, gzipKb: 0.15 },
  { id: "yn-quantity", importPath: "components/yn-quantity", sizeKb: 0.22, gzipKb: 0.16 },
  { id: "yn-search", importPath: "components/yn-search", sizeKb: 0.24, gzipKb: 0.17 },
  { id: "yn-icon-button", importPath: "components/yn-icon-button", sizeKb: 0.27, gzipKb: 0.19 },
  { id: "yn-dropdown-pick", importPath: "components/yn-dropdown-pick", sizeKb: 0.28, gzipKb: 0.18 },
  { id: "yn-drawer", importPath: "components/yn-drawer", sizeKb: 0.28, gzipKb: 0.18 },
  { id: "yn-group-pick", importPath: "components/yn-group-pick", sizeKb: 4.58, gzipKb: 1.9 },
  { id: "yn-pick", importPath: "components/yn-pick", sizeKb: 7.13, gzipKb: 2.4 },
  { id: "yn-icon-connect-button", importPath: "components/yn-icon-connect-button", sizeKb: 11.31, gzipKb: 3.82 },
  { id: "yn-button", importPath: "components/yn-button", sizeKb: 14.25, gzipKb: 3.77 },
  { id: "yn-dropdown", importPath: "components/yn-dropdown", sizeKb: 16.65, gzipKb: 4.65 },
  { id: "yn-toast", importPath: "components/yn-toast", sizeKb: 23.17, gzipKb: 5.92 },
  { id: "yn-sku-selector", importPath: "components/yn-sku-selector", sizeKb: 26.62, gzipKb: 6.75,
    note: {
          "zh-CN": "首次注册约 0.44 kB；SKU 交互代码约 26.18 kB 会按需加载",
          "en": "Initial registration ~0.44 kB; SKU interaction code ~26.18 kB loads on demand"
    } },
  { id: "yn-cookie-notice", importPath: "components/yn-cookie-notice", sizeKb: 30.07, gzipKb: 8.57 },
  { id: "yn-pull-cord-switch", importPath: "components/yn-pull-cord-switch", sizeKb: 50.08, gzipKb: 12.47,
    note: {
          "zh-CN": "页面先加载约 32.44 kB（gzip 7.61 kB）；首次显示/交互时再加载绳子物理动画约 17.64 kB（gzip 4.86 kB）",
          "en": "Page initially loads ~32.44 kB (gzip 7.61 kB); rope physics animation loads on first render/interaction ~17.64 kB (gzip 4.86 kB)"
    } },
  { id: "yn-checkout-address", importPath: "components/yn-checkout-address", sizeKb: 79.51, gzipKb: 18.93,
    note: {
          "zh-CN": "页面先加载注册代码约 0.38 kB；地址表单核心约 79.13 kB 按需加载，Google/Photon/dr5hn 探测逻辑再按实际数据源懒加载",
          "en": "Page initially loads registration ~0.38 kB; address form core ~79.13 kB loads on demand, and Google/Photon/dr5hn provider logic lazy-loads based on the selected source"
    } }
];

export const BUNDLE_META = {
  builtAt: "2026-08-19",
  fullIifeKb: 588.43,
  fullIifeGzipKb: 158.92,
  defineKb: 0.64,
  indexExportKb: 3.21
} as const;
