import type { DocShowcase } from "./component-i18n";
import type { L10nText } from "../i18n/locale";

const IMG = {
  floemaNature:
    "https://www.floema.com/_ipx/f_webp&s_200x114/https:/cdn.sanity.io/images/535lnz3g/production/6adaaad4b7aff57360124f76b64839aafe0bf6bd-317x180.png"
};

/** 各组件 Storybook component 描述摘要（中英） */
export const STORYBOOK_INTROS: Record<string, L10nText> = {
  "yn-icon-button": {
    "zh-CN":
      "圆形图标按钮：`variant` 切换配色，`hit-slop` 扩展热区，`--yn-icon-button-bg` / `--yn-icon-button-hover-bg` 覆写背景。事件为原生 `click`，在 host 上监听。",
    en: "Circular icon button: `variant` palettes, `hit-slop` tap target, CSS var overrides. Native `click` on the host."
  },
  "yn-input": {
    "zh-CN":
      "Floema 风格输入框：暖色半透明背景、细线边框、胶囊圆角。默认无前后置按钮，仅传入 `prefix-button` / `suffix-button` 插槽时渲染。",
    en: "Floema-style input with warm translucent surface and pill radius. Prefix/suffix buttons render only when slotted."
  },
  "yn-icon-connect-button": {
    "zh-CN":
      "带图标连接动画的按钮/链接。悬停时图标与文案有连接动效。`icon`/`label` 属性或插槽（插槽优先）。",
    en: "Animated icon connect button/link with hover motion. Props or slots for icon/label (slots win)."
  },
  "yn-navigation": {
    "zh-CN":
      "胶囊导航，激活项带**指示器滑动**与**发光（glow）**动画。受控模式点击切换 `active`；`seo-mode` 渲染 `<a href>`。",
    en: "Pill nav with **sliding indicator** and **glow** animation. Controlled `active` or SEO `<a href>` mode."
  },
  "yn-search": {
    "zh-CN":
      "可展开搜索，支持 `expand-direction` 左右展开、`open` 默认展开、`close` 两步关闭。默认插槽可传 `<datalist>` 候选项；Shadow DOM 隔离，请用 CSS 变量定制。",
    en: "Expandable search with left/right expand, default-open, and two-step close. Optional `<datalist>`; style via CSS variables (Shadow DOM)."
  },
  "yn-dropdown": {
    "zh-CN":
      "下拉弹层：触发器文本滑出、面板定向位移、关闭图标反方向进入。点击触发器查看完整动画。",
    en: "Dropdown with trigger slide, panel motion, and close icon animation. Click trigger to preview."
  },
  "yn-dropdown-pick": {
    "zh-CN": "下拉单选器，按钮展开/收起有颜色联动，选中项右侧勾选图标。",
    en: "Dropdown select with button color transition and check icon on selection."
  },
  "yn-quantity": {
    "zh-CN": "Floema 风格数量步进器，悬停/聚焦有背景与边框过渡。",
    en: "Floema stepper with hover/focus surface transitions."
  },
  "yn-sku-selector": {
    "zh-CN":
      "多维 SKU 联动：规格按钮选中反色、加购按钮 loading 形变、`simple` 模式选齐自动 submit。",
    en: "SKU matrix with selection invert, submit loading, and `simple` auto-submit mode."
  },
  "yn-checkout-address": {
    "zh-CN":
      "跨境地址分步表单。完整校验流程（reportValidity / validate）见 Storybook CheckoutValidation。",
    en: "Stepped cross-border address form. Full validation flow in Storybook CheckoutValidation."
  },
  "yn-drawer": {
    "zh-CN":
      "抽屉基于 Popover：`placement=\"auto\"` 时窄屏从底部滑入（移动端 bottom sheet），宽屏从右侧滑入，带遮罩与生命周期事件。",
    en: "Popover drawer: bottom sheet on narrow, right panel on wide, with backdrop."
  },
  "yn-toast": {
    "zh-CN":
      "灵动岛反馈：loading 双弧加速 → 状态球形变。点击下方按钮查看动画。",
    en: "Dynamic Island toast: loading arcs morph to status. Click buttons below to preview."
  },
  "yn-pull-cord-switch": {
    "zh-CN":
      "Verlet 绳物理：拖拽绳端过阈值切换。fixed 贴 Header 时加 `rope-pass-through` 避免挡搜索。",
    en: "Verlet rope physics. Use `rope-pass-through` on fixed header cords so glow canvas does not block clicks."
  },
  "yn-cookie-notice": {
    "zh-CN":
      "GDPR 风格 Cookie 同意横幅：accept/reject/settings 三态，偏好分类勾选，cookie 持久化。",
    en: "GDPR-style cookie consent banner with accept/reject/settings, preference categories, and cookie persistence."
  },
  "yn-sku-cart-button": {
    "zh-CN":
      "加购按钮：左文案 + 竖线 + 右价格，三种 loading 模式（icon / overlay / text）。",
    en: "Cart button: label | divider | price. Three loading modes: icon, overlay, text."
  }
};

export const STORYBOOK_SHOWCASES: Record<string, DocShowcase[]> = {
  "yn-input": [
    {
      id: "default",
      title: { "zh-CN": "无插槽", en: "No slots" },
      description: {
        "zh-CN": "默认无前后置按钮，仅显示输入区域。",
        en: "Default input with no prefix or suffix buttons."
      },
      storybookComponent: "YnInput",
      storybookStory: "Default",
      demoVariant: "yn-input-default"
    },
    {
      id: "prefix-only",
      title: { "zh-CN": "仅前缀按钮", en: "Prefix only" },
      description: {
        "zh-CN": "只传入 `prefix-button` 插槽。",
        en: "Only the `prefix-button` slot is provided."
      },
      storybookComponent: "YnInput",
      storybookStory: "SlottedButtons",
      demoVariant: "yn-input-prefix"
    },
    {
      id: "suffix-only",
      title: { "zh-CN": "仅后缀按钮", en: "Suffix only" },
      description: {
        "zh-CN": "只传入 `suffix-button` 插槽。",
        en: "Only the `suffix-button` slot is provided."
      },
      storybookComponent: "YnInput",
      storybookStory: "SlottedButtons",
      demoVariant: "yn-input-suffix"
    },
    {
      id: "slotted-buttons",
      title: { "zh-CN": "前后置按钮", en: "Prefix/suffix buttons" },
      description: {
        "zh-CN": "传入插槽后显示可点击图标按钮。",
        en: "Slotted icon buttons on both ends."
      },
      storybookComponent: "YnInput",
      storybookStory: "SlottedButtons",
      demoVariant: "yn-input-slotted"
    },
    {
      id: "filled",
      title: { "zh-CN": "已填值", en: "Filled value" },
      description: { "zh-CN": "受控 value 回显。", en: "Controlled value display." },
      storybookComponent: "YnInput",
      storybookStory: "Filled",
      demoVariant: "yn-input-slotted"
    }
  ],
  "yn-icon-connect-button": [
    {
      id: "sizes",
      title: { "zh-CN": "尺寸展示", en: "Size showcase" },
      description: {
        "zh-CN": "mini / small / normal；悬停查看连接动画。",
        en: "mini, small, normal — hover for connect animation."
      },
      storybookComponent: "YnIconConnectButton",
      storybookStory: "SizeShowcase",
      demoVariant: "yn-icon-connect-sizes"
    }
  ],
  "yn-navigation": [
    {
      id: "controlled",
      title: { "zh-CN": "受控切换（默认）", en: "Controlled (default)" },
      description: {
        "zh-CN": "点击导航项，观察指示器滑动与 glow 动画。",
        en: "Click tabs to see indicator slide and glow."
      },
      storybookComponent: "YnNavigation",
      storybookStory: "Default",
      demoVariant: "yn-navigation-controlled"
    },
    {
      id: "dark",
      title: { "zh-CN": "深色背景", en: "Dark background" },
      description: {
        "zh-CN": "Storybook DarkBackground：深底 + 白胶囊对比。",
        en: "Storybook DarkBackground on dark surface."
      },
      storybookComponent: "YnNavigation",
      storybookStory: "DarkBackground",
      demoVariant: "yn-navigation-dark"
    },
    {
      id: "seo",
      title: { "zh-CN": "SEO / SSR 首屏", en: "SEO / SSR first paint" },
      description: {
        "zh-CN": "seo-mode 渲染 `<a href>`；Astro 侧配合 renderYnNavigationShadowHtml + items-json 首屏完整展示。",
        en: "seo-mode anchors; use renderYnNavigationShadowHtml + items-json for DSD SSR."
      },
      storybookComponent: "YnNavigation",
      storybookStory: "Default",
      demoVariant: "yn-navigation-seo"
    }
  ],
  "yn-search": [
    {
      id: "native-datalist",
      title: { "zh-CN": "原生 datalist 候选", en: "Native datalist suggestions" },
      description: {
        "zh-CN": "点击放大镜图标展开输入区；有值时首次点击关闭按钮仅清空，再次点击才收起。候选弹层由浏览器原生绘制。",
        en: "Click icon to expand. Two-step close when `close` is true. Suggestion popup is native browser UI."
      },
      storybookComponent: "YnSearch",
      storybookStory: "Default",
      demoVariant: "yn-search-default"
    },
    {
      id: "expand-right-push",
      title: { "zh-CN": "向右展开顶开兄弟", en: "Expand right and push siblings" },
      description: {
        "zh-CN": "`expand-direction=\"right\"` 时左缘固定，壳层宽度同步增长并逐步顶开右侧 Cart/Menu。",
        en: "With `expand-direction=\"right\"`, left edge stays fixed while width grows and pushes right siblings."
      },
      storybookComponent: "YnSearch",
      storybookStory: "PushRightSiblings",
      demoVariant: "yn-search-expand-right"
    },
    {
      id: "expand-left",
      title: { "zh-CN": "向左展开", en: "Expand left" },
      description: {
        "zh-CN": "`expand-direction=\"left\"` 时右缘固定，向左展开并顶开左侧 Brand。",
        en: "With `expand-direction=\"left\"`, right edge stays fixed while expanding left."
      },
      storybookComponent: "YnSearch",
      storybookStory: "ExpandLeft",
      demoVariant: "yn-search-expand-left"
    },
    {
      id: "default-open",
      title: { "zh-CN": "默认展开", en: "Default open" },
      description: {
        "zh-CN": "设置 `open` 为 `true` 时初始即为展开态，不播放入场动画。",
        en: "Set `open` to start expanded without entry animation."
      },
      storybookComponent: "YnSearch",
      storybookStory: "DefaultOpen",
      demoVariant: "yn-search-default-open"
    }
  ],
  "yn-dropdown": [
    {
      id: "default",
      title: { "zh-CN": "分类筛选", en: "Category filter" },
      description: {
        "zh-CN": "含 yn-group-pick 内容；点击「筛选条件」查看弹层动画。",
        en: "With yn-group-pick panel; click trigger for motion."
      },
      storybookComponent: "YnDropdown",
      storybookStory: "Default",
      demoVariant: "yn-dropdown-default"
    },
    {
      id: "custom-close",
      title: { "zh-CN": "自定义关闭图标", en: "Custom close icon" },
      description: {
        "zh-CN": "close-icon 插槽 + right-start 方向。",
        en: "close-icon slot with right-start placement."
      },
      storybookComponent: "YnDropdown",
      storybookStory: "CustomCloseIcon",
      demoVariant: "yn-dropdown-custom-close"
    }
  ],
  "yn-dropdown-pick": [
    {
      id: "default",
      title: { "zh-CN": "语言选择", en: "Language select" },
      description: {
        "zh-CN": "按钮展示 code 字段，选中即收起。",
        en: "Button shows code field; closes on select."
      },
      storybookComponent: "YnDropdownPick",
      storybookStory: "Default",
      demoVariant: "yn-dropdown-pick-default"
    }
  ],
  "yn-quantity": [
    {
      id: "product",
      title: { "zh-CN": "商品详情场景", en: "Product detail" },
      description: {
        "zh-CN": "Storybook ProductDemo 布局。",
        en: "Storybook ProductDemo layout."
      },
      storybookComponent: "YnQuantity",
      storybookStory: "ProductDemo",
      demoVariant: "yn-quantity-product"
    }
  ],
  "yn-sku-selector": [
    {
      id: "pick-one",
      title: { "zh-CN": "球衣尺码（pick-one）", en: "Jersey sizes (pick-one)" },
      description: {
        "zh-CN": "默认选中首组可用 SKU。",
        en: "Default first available SKU selected."
      },
      storybookComponent: "YnSkuSelector",
      storybookStory: "PickOne",
      demoVariant: "yn-sku-default"
    },
    {
      id: "simple",
      title: { "zh-CN": "Simple 模式", en: "Simple mode" },
      description: {
        "zh-CN": "多维规格，选齐自动触发 submit。",
        en: "Multi-spec; auto submit when complete."
      },
      storybookComponent: "YnSkuSelector",
      storybookStory: "SimpleMode",
      demoVariant: "yn-sku-simple"
    }
  ],
  "yn-checkout-address": [
    {
      id: "default",
      title: { "zh-CN": "地址表单", en: "Address form" },
      description: {
        "zh-CN": "分步地区 + 联系信息。完整校验见 Storybook。",
        en: "Stepped region + contact fields."
      },
      storybookComponent: "YnCheckoutAddress",
      storybookStory: "Default",
      demoVariant: "yn-checkout-address-default"
    },
    {
      id: "validation",
      title: { "zh-CN": "结账校验演示", en: "Checkout validation" },
      description: {
        "zh-CN": "完整 validate / reportValidity 仅 Storybook 可交互演示。",
        en: "Full validate flow in Storybook only."
      },
      storybookComponent: "YnCheckoutAddress",
      storybookStory: "CheckoutValidation",
      demoVariant: "yn-checkout-address-default"
    }
  ],
  "yn-drawer": [
    {
      id: "cart",
      title: { "zh-CN": "购物车抽屉", en: "Cart drawer" },
      description: {
        "zh-CN": "移动端 bottom sheet：sheet-height=auto，内容高度自适应；桌面宽屏会自动切到右侧抽屉。",
        en: "sheet-height=auto; click to open."
      },
      storybookComponent: "YnDrawer",
      storybookStory: "CartDrawer",
      demoVariant: "yn-drawer-cart"
    },
    {
      id: "backdrop-extra",
      title: { "zh-CN": "遮罩扩展推荐位", en: "Backdrop extra" },
      description: {
        "zh-CN": "宽屏右侧抽屉 + backdrop-extra 插槽。",
        en: "Wide right drawer with backdrop-extra slot."
      },
      storybookComponent: "YnDrawer",
      storybookStory: "CartDrawerDesktop",
      demoVariant: "yn-drawer-desktop"
    }
  ],
  "yn-toast": [
    {
      id: "api",
      title: { "zh-CN": "四种状态", en: "Four states" },
      description: {
        "zh-CN": "点击 success/info/warning/error 查看形变动画。",
        en: "Click buttons to preview morph animation."
      },
      storybookComponent: "YnToast",
      storybookStory: "ApiUsage",
      demoVariant: "yn-toast-api"
    }
  ],
  "yn-pull-cord-switch": [
    {
      id: "slots",
      title: { "zh-CN": "双插槽绳端", en: "Dual slot cord ends" },
      description: {
        "zh-CN": "拖拽绳端切换；default / activated 不同按钮。",
        en: "Drag cord; swap buttons via slots."
      },
      storybookComponent: "YnPullCordSwitch",
      storybookStory: "Slots",
      demoVariant: "yn-pull-cord-slots"
    },
    {
      id: "sizes",
      title: { "zh-CN": "三种尺寸", en: "Three sizes" },
      description: {
        "zh-CN": "mini / small / medium，绳长相同。",
        en: "mini, small, medium at same rope length."
      },
      storybookComponent: "YnPullCordSwitch",
      storybookStory: "Sizes",
      demoVariant: "yn-pull-cord-sizes"
    },
    {
      id: "fixed-header",
      title: { "zh-CN": "Header 主题绳", en: "Fixed header theme cord" },
      description: {
        "zh-CN": "fixed + rope-pass-through：不挡 Header 搜索（storefront 同款）。",
        en: "fixed + rope-pass-through for header theme toggle without blocking search."
      },
      storybookComponent: "YnPullCordSwitch",
      storybookStory: "FixedStorefrontHeader",
      demoVariant: "yn-pull-cord-fixed-header"
    }
  ],
  "yn-cookie-notice": [
    {
      id: "default",
      title: { "zh-CN": "自动弹出", en: "Auto show" },
      description: {
        "zh-CN": "无同意记录时自动弹出横幅，支持 accept/reject/settings。",
        en: "Auto-shows banner when no consent record. Accept/reject/settings flow."
      },
      storybookComponent: "YnCookieNotice",
      storybookStory: "Default",
      demoVariant: "yn-cookie-notice-default"
    },
    {
      id: "settings",
      title: { "zh-CN": "偏好设置面板", en: "Settings panel" },
      description: {
        "zh-CN": "展开偏好设置面板，可勾选 functional / analytics / marketing。",
        en: "Expanded settings with functional/analytics/marketing checkboxes."
      },
      storybookComponent: "YnCookieNotice",
      storybookStory: "WithSettings",
      demoVariant: "yn-cookie-notice-settings"
    }
  ],
  "yn-sku-cart-button": [
    {
      id: "default",
      title: { "zh-CN": "默认状态", en: "Default states" },
      description: {
        "zh-CN": "默认 / 隐藏图标 / 禁用三种状态。",
        en: "Default, hidden icon, and disabled states."
      },
      storybookComponent: "YnSkuCartButton",
      storybookStory: "Default",
      demoVariant: "yn-sku-cart-button-default"
    },
    {
      id: "loading",
      title: { "zh-CN": "Loading 模式", en: "Loading modes" },
      description: {
        "zh-CN": "icon / overlay / text 三种 loading 展示方式。",
        en: "icon, overlay, and text loading display modes."
      },
      storybookComponent: "YnSkuCartButton",
      storybookStory: "LoadingModes",
      demoVariant: "yn-sku-cart-button-loading"
    }
  ]
};

export { IMG as SHOWCASE_IMAGES };
