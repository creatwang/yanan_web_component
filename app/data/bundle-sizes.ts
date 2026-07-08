import type { L10nText } from "../i18n/locale";

/** 来自 `pnpm build` ESM 产物（v1.0.9，2026-07-08）。含分包时标注 total。 */
export type BundleSizeRow = {
  id: string;
  importPath: string;
  sizeKb: number;
  gzipKb: number;
  note?: L10nText;
};

export const BUNDLE_SIZES: BundleSizeRow[] = [
  { id: "yn-quantity", importPath: "components/yn-quantity", sizeKb: 4.36, gzipKb: 1.51 },
  { id: "yn-group-pick", importPath: "components/yn-group-pick", sizeKb: 4.6, gzipKb: 1.92 },
  { id: "yn-input", importPath: "components/yn-input", sizeKb: 4.89, gzipKb: 1.55 },
  { id: "yn-pick", importPath: "components/yn-pick", sizeKb: 7.14, gzipKb: 2.42 },
  { id: "yn-icon-connect-button", importPath: "components/yn-icon-connect-button", sizeKb: 11.29, gzipKb: 3.82 },
  { id: "yn-drawer", importPath: "components/yn-drawer", sizeKb: 11.62, gzipKb: 3.18 },
  { id: "yn-dropdown-pick", importPath: "components/yn-dropdown-pick", sizeKb: 13.05, gzipKb: 4.19 },
  { id: "yn-button", importPath: "components/yn-button", sizeKb: 14.35, gzipKb: 3.7 },
  { id: "yn-dropdown", importPath: "components/yn-dropdown", sizeKb: 16.66, gzipKb: 4.67 },
  { id: "yn-search", importPath: "components/yn-search", sizeKb: 18.82, gzipKb: 5.17 },
  { id: "yn-toast", importPath: "components/yn-toast", sizeKb: 20.98, gzipKb: 5.27 },
  { id: "yn-navigation", importPath: "components/yn-navigation", sizeKb: 21.08, gzipKb: 6.72 },
  { id: "yn-sku-selector", importPath: "components/yn-sku-selector", sizeKb: 26.79, gzipKb: 6.8,
    note: {
          "zh-CN": "首次注册约 0.47 kB；SKU 交互代码约 26.32 kB 会按需加载",
          "en": "Initial registration ~0.47 kB; SKU interaction code ~26.32 kB loads on demand"
    } },
  { id: "yn-pull-cord-switch", importPath: "components/yn-pull-cord-switch", sizeKb: 49.81, gzipKb: 12.43,
    note: {
          "zh-CN": "页面先加载约 32.17 kB（gzip 7.57 kB）；首次显示/交互时再加载绳子物理动画约 17.64 kB（gzip 4.86 kB）",
          "en": "Page initially loads ~32.17 kB (gzip 7.57 kB); rope physics animation loads on first render/interaction ~17.64 kB (gzip 4.86 kB)"
    } },
  { id: "yn-checkout-address", importPath: "components/yn-checkout-address", sizeKb: 74.61, gzipKb: 17.98,
    note: {
          "zh-CN": "页面先加载注册代码约 0.34 kB；地址表单核心约 74.27 kB 按需加载，Google/Photon/dr5hn 探测逻辑再按实际数据源懒加载",
          "en": "Page initially loads registration ~0.34 kB; address form core ~74.27 kB loads on demand, and Google/Photon/dr5hn provider logic lazy-loads based on the selected source"
    } },
  { id: "yn-cookie-notice", importPath: "components/yn-cookie-notice", sizeKb: 167.17, gzipKb: 114.06 }
];

export const BUNDLE_META = {
  builtAt: "2026-07-08",
  fullIifeKb: 495.81,
  fullIifeGzipKb: 195.93,
  defineKb: 0.62,
  indexExportKb: 2.85
} as const;
