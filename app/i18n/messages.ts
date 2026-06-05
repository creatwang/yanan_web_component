import type { Locale } from "./locale";
import type { L10nText } from "./locale";
import { lt } from "./locale";

export const UI: Record<string, L10nText> = {
  brandSubtitle: { "zh-CN": "独立站 · Floema 风格", en: "DTC Storefront · Floema Style" },
  docs: { "zh-CN": "文档", en: "Docs" },
  notFound: { "zh-CN": "页面未找到", en: "Page not found" },
  notFoundHint: { "zh-CN": "请从左侧导航选择文档页面。", en: "Pick a page from the sidebar." },
  onThisPage: { "zh-CN": "本页目录", en: "On this page" },
  preview: { "zh-CN": "预览", en: "Preview" },
  livePreview: { "zh-CN": "在线预览", en: "Live Preview" },
  usage: { "zh-CN": "用法", en: "Usage" },
  importOnDemand: { "zh-CN": "按需导入：", en: "On-demand import:" },
  templateExample: { "zh-CN": "模板示例：", en: "Template example:" },
  props: { "zh-CN": "属性", en: "Properties" },
  events: { "zh-CN": "事件", en: "Events" },
  slots: { "zh-CN": "插槽", en: "Slots" },
  cssVars: { "zh-CN": "CSS 变量", en: "CSS Variables" },
  methods: { "zh-CN": "公开方法", en: "Methods" },
  notes: { "zh-CN": "说明", en: "Notes" },
  showcases: { "zh-CN": "展示形式", en: "Showcases" },
  intro: { "zh-CN": "详细介绍", en: "Overview" },
  shadowHint: {
    "zh-CN": "组件使用 Shadow DOM，外部样式默认不穿透。请通过公开 CSS 变量在宿主元素上定制。",
    en: "Components use Shadow DOM. Override via public `--yn-*` CSS variables on the host."
  },
  tagClass: { "zh-CN": "标签", en: "Tag" },
  className: { "zh-CN": "类名", en: "Class" },
  colProp: { "zh-CN": "属性", en: "Property" },
  colType: { "zh-CN": "类型", en: "Type" },
  colDefault: { "zh-CN": "默认值", en: "Default" },
  colDesc: { "zh-CN": "说明", en: "Description" },
  colEvent: { "zh-CN": "事件", en: "Event" },
  colDetail: { "zh-CN": "detail", en: "detail" },
  colSlot: { "zh-CN": "插槽", en: "Slot" },
  colPriority: { "zh-CN": "优先级", en: "Priority" },
  colVar: { "zh-CN": "变量", en: "Variable" },
  colMethod: { "zh-CN": "方法", en: "Method" },
  colSignature: { "zh-CN": "签名", en: "Signature" },
  viewInStorybook: { "zh-CN": "在 Storybook 中查看", en: "View in Storybook" },
  copy: { "zh-CN": "复制", en: "Copy" },
  copied: { "zh-CN": "已复制", en: "Copied" },
  langZh: { "zh-CN": "中文", en: "中文" },
  langEn: { "zh-CN": "EN", en: "EN" },
  storybook: { "zh-CN": "组件预览", en: "Storybook" },
  themeLight: { "zh-CN": "白天", en: "Day" },
  themeDark: { "zh-CN": "黑夜", en: "Night" },
  themeToggle: { "zh-CN": "切换昼夜主题", en: "Toggle day/night theme" },
  bundleSize: { "zh-CN": "打包体积", en: "Bundle size" },
  bundleSizePage: { "zh-CN": "打包体积", en: "Bundle Size" },
  bundleBuiltAt: { "zh-CN": "构建时间", en: "Built at" },
  bundleComponent: { "zh-CN": "组件", en: "Component" },
  bundleImport: { "zh-CN": "子路径", en: "Subpath" },
  bundleEsSize: { "zh-CN": "ESM 体积", en: "ESM size" },
  bundleGzip: { "zh-CN": "gzip", en: "gzip" },
  bundleFull: { "zh-CN": "全量 IIFE", en: "Full IIFE" },
  bundleNote: { "zh-CN": "说明", en: "Note" },
  noProps: { "zh-CN": "无公开属性。", en: "No public properties." }
};

export const NAV: Array<{
  title: L10nText;
  items: Array<{ id: string; label: L10nText }>;
}> = [
  {
    title: { "zh-CN": "开始", en: "Getting Started" },
    items: [
      { id: "introduction", label: { "zh-CN": "介绍", en: "Introduction" } },
      { id: "installation", label: { "zh-CN": "安装与导入", en: "Installation" } },
      { id: "bundle-size", label: { "zh-CN": "打包体积", en: "Bundle Size" } }
    ]
  },
  {
    title: { "zh-CN": "基础", en: "Basic" },
    items: [
      { id: "yn-button", label: { "zh-CN": "Button 按钮", en: "Button" } },
      { id: "yn-input", label: { "zh-CN": "Input 输入框", en: "Input" } },
      { id: "yn-icon-connect-button", label: { "zh-CN": "Icon Connect", en: "Icon Connect" } }
    ]
  },
  {
    title: { "zh-CN": "导航与搜索", en: "Navigation" },
    items: [
      { id: "yn-navigation", label: { "zh-CN": "Navigation 导航", en: "Navigation" } },
      { id: "yn-search", label: { "zh-CN": "Search 搜索", en: "Search" } }
    ]
  },
  {
    title: { "zh-CN": "选择与下拉", en: "Selection" },
    items: [
      { id: "yn-pick", label: { "zh-CN": "Pick 选项", en: "Pick" } },
      { id: "yn-group-pick", label: { "zh-CN": "Group Pick", en: "Group Pick" } },
      { id: "yn-dropdown", label: { "zh-CN": "Dropdown 下拉", en: "Dropdown" } },
      { id: "yn-dropdown-pick", label: { "zh-CN": "Dropdown Pick", en: "Dropdown Pick" } }
    ]
  },
  {
    title: { "zh-CN": "电商", en: "Commerce" },
    items: [
      { id: "yn-quantity", label: { "zh-CN": "Quantity 数量", en: "Quantity" } },
      { id: "yn-sku-selector", label: { "zh-CN": "SKU Selector", en: "SKU Selector" } },
      { id: "yn-checkout-address", label: { "zh-CN": "Checkout Address", en: "Checkout Address" } }
    ]
  },
  {
    title: { "zh-CN": "反馈与布局", en: "Feedback" },
    items: [
      { id: "yn-drawer", label: { "zh-CN": "Drawer 抽屉", en: "Drawer" } },
      { id: "yn-toast", label: { "zh-CN": "Toast 提示", en: "Toast" } },
      { id: "yn-pull-cord-switch", label: { "zh-CN": "Pull Cord 抽绳", en: "Pull Cord" } }
    ]
  }
];

export function ui(key: keyof typeof UI, locale: Locale): string {
  return lt(UI[key], locale);
}
