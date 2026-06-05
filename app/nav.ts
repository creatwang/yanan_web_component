import type { NavGroup } from "./types";

export const DOC_NAV: NavGroup[] = [
  {
    title: "开始",
    items: [
      { id: "introduction", label: "介绍" },
      { id: "installation", label: "安装与导入" }
    ]
  },
  {
    title: "基础",
    items: [
      { id: "yn-button", label: "Button 按钮" },
      { id: "yn-input", label: "Input 输入框" },
      { id: "yn-icon-connect-button", label: "Icon Connect 图标按钮" }
    ]
  },
  {
    title: "导航与搜索",
    items: [
      { id: "yn-navigation", label: "Navigation 导航" },
      { id: "yn-search", label: "Search 搜索" }
    ]
  },
  {
    title: "选择与下拉",
    items: [
      { id: "yn-pick", label: "Pick 选项" },
      { id: "yn-group-pick", label: "Group Pick 选项组" },
      { id: "yn-dropdown", label: "Dropdown 下拉" },
      { id: "yn-dropdown-pick", label: "Dropdown Pick 下拉选择" }
    ]
  },
  {
    title: "电商",
    items: [
      { id: "yn-quantity", label: "Quantity 数量" },
      { id: "yn-sku-selector", label: "SKU Selector 规格" },
      { id: "yn-checkout-address", label: "Checkout Address 地址" }
    ]
  },
  {
    title: "反馈与布局",
    items: [
      { id: "yn-drawer", label: "Drawer 抽屉" },
      { id: "yn-toast", label: "Toast 提示" },
      { id: "yn-pull-cord-switch", label: "Pull Cord 抽绳开关" }
    ]
  }
];
