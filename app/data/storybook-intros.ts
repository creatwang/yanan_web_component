import type { DocShowcase } from "./component-i18n";
import type { L10nText } from "../i18n/locale";

const IMG = {
  floemaNature:
    "https://www.floema.com/_ipx/f_webp&s_200x114/https:/cdn.sanity.io/images/535lnz3g/production/6adaaad4b7aff57360124f76b64839aafe0bf6bd-317x180.png"
};

/** 各组件 Storybook component 描述摘要（中英） */
export const STORYBOOK_INTROS: Record<string, L10nText> = {
  "yn-input": {
    "zh-CN":
      "Floema 风格输入框：暖色半透明背景、细线边框、胶囊圆角。默认无前后置按钮，仅传入 `prefix-button` / `suffix-button` 插槽时渲染。事件 `yn-input`、`yn-prefix-click`、`yn-suffix-click` 的 detail 均为 `{ value }`。",
    en: "Floema-style input with warm translucent surface and pill radius. Prefix/suffix buttons render only when slotted. Events: `yn-input`, `yn-prefix-click`, `yn-suffix-click`."
  },
  "yn-icon-connect-button": {
    "zh-CN":
      "带图标连接动画的按钮/链接。`icon`/`label` 属性或 `slot=\"icon\"`/`slot=\"label\"`（插槽优先）。`link` 有值渲染 `<a>`，无值渲染 `<button>`。",
    en: "Animated icon connect button/link. Props or slots for icon/label (slots win). Renders `<a>` when `link` is set."
  },
  "yn-navigation": {
    "zh-CN":
      "胶囊导航。`seo-mode=false` 受控切换（button + change）；`seo-mode=true` 渲染 `<a href>` 并按 URL 匹配激活项，不派发 change。",
    en: "Pill navigation. Controlled mode with `change`, or SEO link mode with `<a href>` and URL-based active state."
  },
  "yn-search": {
    "zh-CN":
      "可展开搜索。默认插槽传入 `<datalist>` 提供原生候选项。支持 `input` / `enter` 事件与多项 `--yn-search-*` 动效变量。",
    en: "Expandable search with optional `<datalist>` in default slot. `input` and `enter` events; motion via `--yn-search-*` variables."
  },
  "yn-dropdown": {
    "zh-CN":
      "通用下拉弹层：默认插槽为触发器，`content` 为面板。12 方向 `placement`（当前不自动翻转）。弹层/触发器/关闭图标联动位移动画。",
    en: "Dropdown overlay: default slot = trigger, `content` = panel. 12 `placement` values with coordinated motion."
  },
  "yn-dropdown-pick": {
    "zh-CN":
      "独立下拉单选器，插槽传入 `yn-pick`；每项建议 `data-node` JSON。选中即收起，按钮文案由 `button-display-field` 映射。",
    en: "Standalone dropdown select using `yn-pick` children with `data-node` JSON. Closes on select; label from `button-display-field`."
  },
  "yn-quantity": {
    "zh-CN": "Floema 风格数量步进器：减号 / 数字输入 / 加号，受控 `value`，`min`/`max`/`step` 约束。",
    en: "Floema-style stepper with minus/input/plus, controlled `value`, `min`/`max`/`step`."
  },
  "yn-sku-selector": {
    "zh-CN":
      "多维 SKU 联动：库存/价格/缺货态、`pick-one` 默认选中、`simple` 选齐自动 submit、`submit` 异步 + `instance.done()` 结束 loading。",
    en: "Multi-dimension SKU matrix with stock/price states, `pick-one`, `simple` auto-submit, async `submit` with `instance.done()`."
  },
  "yn-checkout-address": {
    "zh-CN":
      "跨境地址：Google → dr5hn → Photon → manual 降级；分步表单；`validate()` / `reportValidity()`；`change` 含 validation 与 changedFields。",
    en: "Cross-border address with provider fallback chain; stepped form; `validate()` / `reportValidity()`; rich `change` detail."
  },
  "yn-drawer": {
    "zh-CN":
      "Popover 抽屉：`placement=auto` 窄屏底部/宽屏右侧。生命周期 before/after open/close 可 preventDefault。`backdrop-extra` 宽屏遮罩左侧扩展区。",
    en: "Popover drawer: bottom on narrow, right on wide. Lifecycle hooks with preventDefault. `backdrop-extra` for wide-screen promos."
  },
  "yn-toast": {
    "zh-CN":
      "灵动岛顶部反馈：loading 双弧 → 状态形变。支持 `show(callback)` + `instance.done()`、遮罩、success/info/warning/error 快捷方法。",
    en: "Dynamic Island toast: loading arcs morph to status. Callback API with `instance.done()`, optional mask, shortcut methods."
  },
  "yn-pull-cord-switch": {
    "zh-CN":
      "Verlet 绳物理抽绳开关。`rope-length` 与 `size` 解耦；双插槽 default/activated；`fixed` 吸顶与 `fixed-move`。组件不绘区域背景。",
    en: "Verlet rope pull-cord toggle. `rope-length` independent of `size`; dual slots; optional `fixed` viewport mode. No shell background."
  }
};

export const STORYBOOK_SHOWCASES: Record<string, DocShowcase[]> = {
  "yn-input": [
    {
      id: "slotted-buttons",
      title: { "zh-CN": "前后置按钮", en: "Prefix/suffix buttons" },
      description: {
        "zh-CN": "传入插槽后显示可点击图标按钮，触发 yn-prefix-click / yn-suffix-click。",
        en: "Slotted icon buttons fire yn-prefix-click / yn-suffix-click."
      },
      storybookComponent: "YnInput",
      storybookStory: "SlottedButtons",
      demoVariant: "yn-input-slotted"
    }
  ],
  "yn-icon-connect-button": [
    {
      id: "sizes",
      title: { "zh-CN": "尺寸展示", en: "Size showcase" },
      description: { "zh-CN": "mini / small / normal 三档尺寸。", en: "mini, small, normal sizes." },
      storybookComponent: "YnIconConnectButton",
      storybookStory: "SizeShowcase",
      demoVariant: "yn-icon-connect-sizes"
    }
  ],
  "yn-navigation": [
    {
      id: "seo",
      title: { "zh-CN": "SEO 链接模式", en: "SEO link mode" },
      description: {
        "zh-CN": "seo-mode 渲染真实链接，利于收录。",
        en: "seo-mode renders real anchors for crawlers."
      },
      storybookComponent: "YnNavigation",
      storybookStory: "Default"
    },
    {
      id: "controlled",
      title: { "zh-CN": "受控切换", en: "Controlled mode" },
      description: { "zh-CN": "非 SEO 模式派发 change 事件。", en: "Non-SEO mode emits change." },
      storybookComponent: "YnNavigation",
      storybookStory: "NonSeoControlled"
    }
  ],
  "yn-dropdown": [
    {
      id: "custom-close",
      title: { "zh-CN": "自定义关闭图标", en: "Custom close icon" },
      description: { "zh-CN": "close-icon 插槽替换内置 SVG。", en: "Replace close icon via slot." },
      storybookComponent: "YnDropdown",
      storybookStory: "CustomCloseIcon"
    }
  ],
  "yn-quantity": [
    {
      id: "product",
      title: { "zh-CN": "商品详情场景", en: "Product detail" },
      description: {
        "zh-CN": "Storybook ProductDemo：与 yn-button 组合的商品加购条。",
        en: "Storybook ProductDemo with yn-button add-to-list row."
      },
      storybookComponent: "YnQuantity",
      storybookStory: "ProductDemo",
      demoVariant: "yn-quantity-product"
    }
  ],
  "yn-sku-selector": [
    {
      id: "pick-one",
      title: { "zh-CN": "默认选中", en: "Pick one" },
      description: { "zh-CN": "pick-one 初始化触发 init。", en: "pick-one fires init on mount." },
      storybookComponent: "YnSkuSelector",
      storybookStory: "PickOne"
    },
    {
      id: "simple",
      title: { "zh-CN": "Simple 模式", en: "Simple mode" },
      description: { "zh-CN": "仅规格按钮，选齐自动 submit。", en: "Spec buttons only; auto submit when complete." },
      storybookComponent: "YnSkuSelector",
      storybookStory: "SimpleMode"
    },
    {
      id: "async",
      title: { "zh-CN": "异步加购", en: "Async submit" },
      description: {
        "zh-CN": "submit 回调内 await 后 instance.done()。",
        en: "Await in submit handler then instance.done()."
      },
      storybookComponent: "YnSkuSelector",
      storybookStory: "AsyncSubmit"
    }
  ],
  "yn-checkout-address": [
    {
      id: "validation",
      title: { "zh-CN": "结账校验演示", en: "Checkout validation" },
      description: {
        "zh-CN": "reportValidity 标红 + validate 硬校验完整流程。",
        en: "Full reportValidity + validate flow."
      },
      storybookComponent: "YnCheckoutAddress",
      storybookStory: "CheckoutValidation"
    }
  ],
  "yn-drawer": [
    {
      id: "cart",
      title: { "zh-CN": "购物车抽屉", en: "Cart drawer" },
      description: {
        "zh-CN": "移动端 sheet-height=auto 随内容高度。",
        en: "Mobile cart with sheet-height=auto."
      },
      storybookComponent: "YnDrawer",
      storybookStory: "CartDrawer"
    },
    {
      id: "backdrop-extra",
      title: { "zh-CN": "遮罩扩展推荐位", en: "Backdrop extra" },
      description: {
        "zh-CN": "宽屏右侧抽屉时 backdrop-extra 展示推荐商品。",
        en: "Wide-screen promo area in backdrop-extra slot."
      },
      storybookComponent: "YnDrawer",
      storybookStory: "CartDrawerDesktop"
    }
  ],
  "yn-toast": [
    {
      id: "api",
      title: { "zh-CN": "API 用法", en: "API usage" },
      description: {
        "zh-CN": "show / success / callback + done / hide 全矩阵。",
        en: "Full show / shortcut / callback / hide matrix."
      },
      storybookComponent: "YnToast",
      storybookStory: "ApiUsage"
    }
  ],
  "yn-pull-cord-switch": [
    {
      id: "slots",
      title: { "zh-CN": "双插槽绳端", en: "Dual slot cord ends" },
      description: {
        "zh-CN": "default / activated 切换不同 yn-button。",
        en: "Swap yn-button via default / activated slots."
      },
      storybookComponent: "YnPullCordSwitch",
      storybookStory: "Slots"
    },
    {
      id: "fixed",
      title: { "zh-CN": "Fixed 吸顶", en: "Fixed mode" },
      description: {
        "zh-CN": "吸附视口顶部，支持负 fixed-x hover 露出。",
        en: "Viewport-fixed with negative fixed-x peek."
      },
      storybookComponent: "YnPullCordSwitch",
      storybookStory: "Fixed"
    }
  ]
};

export { IMG as SHOWCASE_IMAGES };
