import type { ComponentDocPage } from "../types";

function page(
  partial: Omit<ComponentDocPage, "kind" | "demoId"> & { demoId?: string }
): ComponentDocPage {
  return {
    kind: "component",
    demoId: partial.id,
    ...partial
  };
}

export const COMPONENT_PAGES: ComponentDocPage[] = [
  page({
    id: "yn-button",
    title: "Button 按钮",
    tag: "yn-button",
    className: "YnButton",
    importPath: "yn-web-component/components/yn-button",
    description: "基础按钮，支持语义色 variant、尺寸、加载态、热区扩展与图标插槽。",
    usageCode: `<yn-button variant="primary" @click=\${onClick}>保存</yn-button>`,
    props: [
      { name: "disabled", type: "boolean", default: "false", desc: "禁用点击" },
      { name: "variant", type: "primary | success | warning | danger | neutral | dark | default", default: "primary", desc: "语义色" },
      { name: "size", type: "mini | small | medium", default: "medium", desc: "尺寸" },
      { name: "loading", type: "boolean", default: "false", desc: "加载态" },
      { name: "loading-type", type: "left | center | right", default: "left", desc: "loading 图标位置" },
      { name: "hit-slop", type: "boolean", default: "true", desc: "四周扩展 5px 热区" }
    ],
    events: [{ name: "click", detail: "MouseEvent", desc: "点击（非 disabled/loading）" }],
    slots: [
      { name: "(default)", desc: "按钮文案" },
      { name: "prefix-icon", desc: "前缀图标" },
      { name: "suffix-icon", desc: "后缀图标" },
      { name: "loading", desc: "自定义 loading 内容" }
    ],
    cssVars: [
      { name: "--yn-button-bg", desc: "背景色" },
      { name: "--yn-button-hover-bg", desc: "悬停背景" },
      { name: "--yn-button-disabled-bg", desc: "禁用背景" },
      { name: "--yn-button-disabled-color", desc: "禁用文字色" },
      { name: "--yn-button-radius", desc: "圆角" },
      { name: "--yn-button-loading-size", desc: "loading 尺寸" }
    ]
  }),

  page({
    id: "yn-input",
    title: "Input 输入框",
    tag: "yn-input",
    className: "YnInput",
    importPath: "yn-web-component/components/yn-input",
    description: "Floema 风格圆角输入框，支持前后置按钮插槽。",
    usageCode: `<yn-input placeholder="搜索" @yn-input=\${onInput}></yn-input>`,
    props: [
      { name: "value", type: "string", default: '""', desc: "当前值" },
      { name: "placeholder", type: "string", default: '"请输入内容"', desc: "占位文案" },
      { name: "disabled", type: "boolean", default: "false", desc: "禁用" }
    ],
    events: [
      { name: "yn-input", detail: "{ value: string }", desc: "输入变化" },
      { name: "yn-prefix-click", detail: "{ value: string }", desc: "前置按钮点击" },
      { name: "yn-suffix-click", detail: "{ value: string }", desc: "后置按钮点击" }
    ],
    slots: [
      { name: "prefix-button", desc: "前置按钮图标" },
      { name: "suffix-button", desc: "后置按钮图标" }
    ],
    cssVars: [
      { name: "--yn-input-width", default: "320px", desc: "宽度" },
      { name: "--yn-input-height", default: "44px", desc: "高度" },
      { name: "--yn-input-bg", desc: "背景" },
      { name: "--yn-input-border-color", desc: "边框" },
      { name: "--yn-input-radius", default: "999px", desc: "圆角" }
    ]
  }),

  page({
    id: "yn-icon-connect-button",
    title: "Icon Connect 图标按钮",
    tag: "yn-icon-connect-button",
    className: "YnIconConnectButton",
    importPath: "yn-web-component/components/yn-icon-connect-button",
    description: "带图标连接动画的按钮或链接，视觉参考 Floema。",
    usageCode: `<!-- 1. 属性方式：label / icon / size -->
<yn-icon-connect-button
  label="VER PRODUTOS URBAN"
  size="normal"
  .icon=\${signpostSvg}
  style="
    --yn-icon-connect-button-bg: #ddd967;
    --yn-icon-connect-button-color: #241f21;
  "
  @click=\${onClick}
></yn-icon-connect-button>

<!-- 2. 链接模式：传入 link 后内部渲染为 <a> -->
<yn-icon-connect-button
  label="VER COLEÇÃO"
  link="/collections/urban"
  size="small"
></yn-icon-connect-button>

<!-- 3. 插槽方式：slot 优先于 label / icon 属性 -->
<yn-icon-connect-button size="mini">
  <svg slot="icon" width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
    <path d="M18 7.263V5.801L9.925 2.13A.49.49 0 0 1 9.637 1.684V.107H8.031V14.072a.49.49 0 0 1-.491.491H5.809A2.4 2.4 0 1 0 2.222 14.563H0v1.606h16.062v-1.606H9.637V11.38c0-.192.112-.367.288-.446L18 7.263Z" fill="currentColor" />
  </svg>
  <span slot="label">Custom Label</span>
</yn-icon-connect-button>

<!-- 4. 非大写文案 -->
<yn-icon-connect-button
  label="View products"
  .uppercase=\${false}
></yn-icon-connect-button>`,
    props: [
      { name: "label", type: "string", default: '"VER PRODUTOS URBAN"', desc: "文案（插槽回退）" },
      { name: "size", type: "mini | small | normal", default: "normal", desc: "尺寸" },
      { name: "icon", type: "string", default: "内置 SVG", desc: "图标 HTML" },
      { name: "uppercase", type: "boolean", default: "true", desc: "默认大写" },
      { name: "link", type: "string", default: '""', desc: "有值渲染 <a>，无值渲染 <button>" },
      { name: "disabled", type: "boolean", default: "false", desc: "禁用" }
    ],
    events: [{ name: "click", detail: "MouseEvent", desc: "点击" }],
    slots: [
      { name: "icon", desc: "自定义图标", priority: "优先于 icon 属性" },
      { name: "label", desc: "自定义文案", priority: "优先于 label 属性" }
    ],
    cssVars: [
      { name: "--yn-icon-connect-button-bg", default: "var(--yn-color-accent, #ddd967)", desc: "背景色" },
      { name: "--yn-icon-connect-button-color", default: "var(--yn-color-text, #241f21)", desc: "文本/图标色" },
      { name: "--yn-icon-connect-button-text-transform", default: "uppercase", desc: "文案大小写转换" }
    ],
    notes: [
      "mini / small / normal 会同时影响图标块尺寸、字体大小、左右 padding 与 hover 展开距离。",
      "slot=\"icon\" / slot=\"label\" 优先于 icon / label 属性；需要完全自定义图标时推荐使用插槽。",
      "link 有值时内部渲染为 <a>，无值时渲染为 <button>。"
    ]
  }),

  page({
    id: "yn-navigation",
    title: "Navigation 导航",
    tag: "yn-navigation",
    className: "YnNavigation",
    importPath: "yn-web-component/components/yn-navigation",
    description: "胶囊式导航，支持受控切换或 SEO 链接模式。",
    usageCode: `<yn-navigation .items=\${items} active="HOME" @change=\${onChange}></yn-navigation>`,
    props: [
      { name: "items", type: "Record<string, string>", default: "内置 4 项", desc: "key=文案，value=路径" },
      { name: "active", type: "string", default: '"PRODUTOS"', desc: "当前激活 key" },
      { name: "seo-mode", type: "boolean", default: "false", desc: "渲染 <a href>，不派发 change" },
      { name: "aria-label", type: "string", default: '"Primary navigation"', desc: "无障碍标签" },
      { name: "hit-slop", type: "boolean", default: "false", desc: "扩大热区" }
    ],
    events: [
      { name: "change", detail: "{ key: string; node: Record<string, string> }", desc: "切换项（非 seo 模式）" }
    ],
    slots: [],
    cssVars: [
      { name: "--yn-navigation-fill-color", desc: "背景填充" },
      { name: "--yn-navigation-text-color", desc: "文本色" },
      { name: "--yn-navigation-indicator-color", desc: "激活圆点" },
      { name: "--yn-navigation-glow-color", desc: "发光中心色" }
    ]
  }),

  page({
    id: "yn-search",
    title: "Search 搜索",
    tag: "yn-search",
    className: "YnSearch",
    importPath: "yn-web-component/components/yn-search",
    description: "可展开/收起的搜索框，支持 datalist 候选项。",
    usageCode: `<!-- 原生 datalist：保留浏览器原生输入建议行为。可优化搜索胶囊和外层容器样式；候选弹层由浏览器绘制。 -->
<div class="search-demo-stage">
  <yn-search
    .inputWidth=\${514}
    placeholder="O que estás à procura?"
    style="
      --yn-search-bg-active: rgba(255, 255, 255, 0.96);
      --yn-search-bg-idle: rgba(255, 255, 255, 0);
      --yn-search-icon-color: #241f21;
      --yn-search-field-color: #241f21;
      --yn-search-placeholder-color: rgba(36, 31, 33, 0.52);
      --yn-search-caret-color: #241f21;
      --yn-search-fill-duration: 220ms;
      --yn-search-fill-ease: cubic-bezier(0.4, 0, 1, 1);
      --yn-search-icon-duration: 220ms;
      --yn-search-icon-ease: cubic-bezier(0.4, 0, 1, 1);
    "
    @input=\${onInput}
    @enter=\${onSearch}
  >
    <datalist>
      <option value="Sofa"></option>
      <option value="Table"></option>
    </datalist>
  </yn-search>
</div>

<style>
  .search-demo-stage {
    background: #f2efea;
    padding: 10px;
  }
</style>`,
    props: [
      { name: "input-width", type: "number", default: "514", desc: "输入区宽度 px" },
      { name: "placeholder", type: "string", default: '"O que estás à procura?"', desc: "占位文案" },
      { name: "disabled", type: "boolean", default: "false", desc: "禁用" },
      { name: "close", type: "boolean", default: "false", desc: "收起行为策略" }
    ],
    events: [
      { name: "input", detail: "{ value: string }", desc: "输入变化" },
      { name: "enter", detail: "{ value: string }", desc: "按回车" }
    ],
    slots: [{ name: "(default)", desc: "datalist 候选项" }],
    cssVars: [
      { name: "--yn-search-bg-active", desc: "展开背景" },
      { name: "--yn-search-bg-idle", desc: "收起背景" },
      { name: "--yn-search-icon-color", desc: "图标色" },
      { name: "--yn-search-field-color", desc: "输入文本色" },
      { name: "--yn-search-placeholder-color", desc: "占位文本色" },
      { name: "--yn-search-caret-color", desc: "光标色" },
      { name: "--yn-search-fill-duration", default: "220ms", desc: "背景形变时长" },
      { name: "--yn-search-fill-ease", desc: "背景形变曲线" },
      { name: "--yn-search-icon-duration", default: "220ms", desc: "图标切换时长" },
      { name: "--yn-search-icon-ease", desc: "图标切换曲线" }
    ],
    notes: [
      "示例中的 `search-demo-stage` 是外层页面背景，不属于组件 Shadow DOM；如果复制到业务项目，需要自己提供等价容器样式。",
      "`datalist` 候选弹层由浏览器原生绘制，不是组件 DOM；Storybook 与文档站若浏览器、缩放、系统主题不同，候选弹层视觉可能不一致。组件主要负责 input 胶囊、图标和背景形变样式。"
    ]
  }),

  page({
    id: "yn-pick",
    title: "Pick 选项",
    tag: "yn-pick",
    className: "YnPick",
    importPath: "yn-web-component/components/yn-pick",
    description: "单个可选项，可独立使用或作为组/下拉的子项。",
    usageCode: `<yn-pick value="nature" ?selected=\${true}>Nature</yn-pick>`,
    props: [
      { name: "value", type: "string | number", default: '""', desc: "选项 id" },
      { name: "selected", type: "boolean", default: "false", desc: "是否选中" },
      { name: "border", type: "boolean", default: "true", desc: "覆盖边框动画" },
      { name: "selected-icon", type: "string", default: "内置 SVG", desc: "选中图标" },
      { name: "unselected-icon", type: "string", default: "内置 SVG", desc: "未选中图标" },
      { name: "show-unselected-icon", type: "boolean", default: "false", desc: "未选中时显示图标" }
    ],
    events: [
      { name: "toggle", detail: "{ id: string | number; flag: boolean }", desc: "点击切换" }
    ],
    slots: [{ name: "(default)", desc: "选项内容" }],
    cssVars: [
      { name: "--yn-pick-border-width", default: "2px", desc: "边框宽度" },
      { name: "--yn-pick-border-color", desc: "边框色" },
      { name: "--yn-pick-border-radius", default: "8px", desc: "圆角" }
    ]
  }),

  page({
    id: "yn-group-pick",
    title: "Group Pick 选项组",
    tag: "yn-group-pick",
    className: "YnGroupPick",
    importPath: "yn-web-component/components/yn-group-pick",
    description: "选项组容器，配合 yn-pick 实现单选或多选。",
    usageCode: `<yn-group-pick multiple .value=\${ids} @change=\${onChange}>...</yn-group-pick>`,
    props: [
      { name: "value", type: "string | number | array", default: '""', desc: "选中回显" },
      { name: "multiple", type: "boolean", default: "false", desc: "多选" },
      { name: "selected-icon", type: "string", default: "内置 SVG", desc: "组级选中图标" },
      { name: "unselected-icon", type: "string", default: '""', desc: "组级未选中图标" },
      { name: "show-unselected-icon", type: "boolean", default: "false", desc: "组级未选中显示图标" }
    ],
    events: [
      { name: "change", detail: "{ ids: array; flag: boolean }", desc: "子项点击" }
    ],
    slots: [{ name: "(default)", desc: "yn-pick 子项列表" }],
    cssVars: [{ name: "--yn-group-pick-gap", default: "12px", desc: "选项间距" }],
    notes: ["子 yn-pick 的图标相关属性优先于组级默认值。"]
  }),

  page({
    id: "yn-dropdown",
    title: "Dropdown 下拉",
    tag: "yn-dropdown",
    className: "YnDropdown",
    importPath: "yn-web-component/components/yn-dropdown",
    description: "通用下拉弹层。默认插槽为触发器，content 为面板。",
    usageCode: `<yn-dropdown><yn-button>筛选</yn-button><div slot="content">...</div></yn-dropdown>`,
    props: [
      { name: "placement", type: "12 方向", default: "bottom-start", desc: "固定弹出方向" },
      { name: "open", type: "boolean", default: "false", desc: "受控展开" },
      { name: "offset", type: "number", default: "12", desc: "间距 px" },
      { name: "close-on-outside-click", type: "boolean", default: "true", desc: "点外部关闭" }
    ],
    events: [
      { name: "open-change", detail: "{ open: boolean; placement }", desc: "开关变化" }
    ],
    slots: [
      { name: "(default)", desc: "触发器" },
      { name: "content", desc: "面板内容" },
      { name: "close-icon", desc: "关闭图标" }
    ],
    cssVars: [
      { name: "--yn-dropdown-panel-min-width", default: "280px", desc: "最小宽度" },
      { name: "--yn-dropdown-panel-radius", default: "12px", desc: "圆角" },
      { name: "--yn-dropdown-panel-shadow", desc: "阴影" }
    ],
    methods: [{ name: "close()", signature: "close(): void", desc: "主动关闭" }]
  }),

  page({
    id: "yn-dropdown-pick",
    title: "Dropdown Pick 下拉选择",
    tag: "yn-dropdown-pick",
    className: "YnDropdownPick",
    importPath: "yn-web-component/components/yn-dropdown-pick",
    description: "下拉单选器，插槽传入 yn-pick，选中即收起。",
    usageCode: `<yn-dropdown-pick value="en" button-display-field="code">...</yn-dropdown-pick>`,
    props: [
      { name: "value", type: "string | number", default: '""', desc: "当前选中" },
      { name: "value-field", type: "string", default: '"id"', desc: "值字段名" },
      { name: "button-display-field", type: "string", default: '"label"', desc: "按钮展示字段" },
      { name: "placeholder", type: "string", default: '"Select"', desc: "未选中占位" },
      { name: "disabled", type: "boolean", default: "false", desc: "禁用" }
    ],
    events: [
      { name: "change", detail: "{ id; node }", desc: "选中变化" },
      { name: "open-change", detail: "{ open: boolean }", desc: "展开变化" }
    ],
    slots: [{ name: "(default)", desc: "yn-pick 列表，建议 data-node JSON" }],
    cssVars: [
      { name: "--yn-dropdown-pick-panel-bg", desc: "面板背景" },
      { name: "--yn-dropdown-pick-panel-radius", desc: "圆角" },
      { name: "--yn-dropdown-pick-gap", desc: "选项间距" }
    ]
  }),

  page({
    id: "yn-quantity",
    title: "Quantity 数量",
    tag: "yn-quantity",
    className: "YnQuantity",
    importPath: "yn-web-component/components/yn-quantity",
    description: "Floema 风格数量选择器（减 / 输入 / 加）。",
    usageCode: `<yn-quantity .value=\${1} .min=\${1} .max=\${99} @change=\${onChange}></yn-quantity>`,
    props: [
      { name: "value", type: "number", default: "1", desc: "当前数量" },
      { name: "min", type: "number", default: "1", desc: "最小值" },
      { name: "max", type: "number", default: "99", desc: "最大值" },
      { name: "step", type: "number", default: "1", desc: "步进" },
      { name: "disabled", type: "boolean", default: "false", desc: "禁用" }
    ],
    events: [{ name: "change", detail: "{ value: number }", desc: "数量变化" }],
    slots: [],
    cssVars: [
      { name: "--yn-quantity-height", default: "44px", desc: "高度" },
      { name: "--yn-quantity-radius", default: "999px", desc: "圆角" },
      { name: "--yn-quantity-color", desc: "文字/图标色" }
    ]
  }),

  page({
    id: "yn-sku-selector",
    title: "SKU Selector 规格",
    tag: "yn-sku-selector",
    className: "YnSkuSelector",
    importPath: "yn-web-component/components/yn-sku-selector",
    description: "多维 SKU 规格联动、加购校验与 loading 反馈。",
    usageCode: `<yn-sku-selector .skus=\${skus} pick-one @submit=\${onSubmit}></yn-sku-selector>`,
    props: [
      { name: "skus", type: "YnSkuItem[]", default: "[]", desc: "SKU 列表" },
      { name: "currency", type: "string", default: '"€"', desc: "货币字符" },
      { name: "simple", type: "boolean", default: "false", desc: "仅规格，选齐自动 submit" },
      { name: "pick-one", type: "boolean", default: "false", desc: "默认选中首组可用 SKU" },
      { name: "submit-label", type: "string", default: '"ADD TO CART"', desc: "加购文案" },
      { name: "labels", type: "Record<string, string>", default: "{}", desc: "维度展示名" },
      { name: "disabled", type: "boolean", default: "false", desc: "禁用" }
    ],
    events: [
      { name: "change", detail: "{ selections, sku, ready, missingKeys }", desc: "规格变化" },
      { name: "init", detail: "同 change", desc: "pick-one 初始化" },
      { name: "submit", detail: "{ selections, sku } + instance", desc: "加购；instance.done() 结束 loading" }
    ],
    slots: [
      { name: "title", desc: "标题区" },
      { name: "submit-icon", desc: "加购图标", priority: "优先于 cart-icon" }
    ],
    cssVars: [
      { name: "--yn-sku-selector-row-height", default: "48px", desc: "规格行高" },
      { name: "--yn-sku-selector-submit-height", default: "64px", desc: "加购按钮高" },
      { name: "--yn-sku-selector-submit-bg", desc: "加购背景" },
      { name: "--yn-sku-selector-hint-color", desc: "校验提示色" }
    ]
  }),

  page({
    id: "yn-checkout-address",
    title: "Checkout Address 地址",
    tag: "yn-checkout-address",
    className: "YnCheckoutAddress",
    importPath: "yn-web-component/components/yn-checkout-address",
    description: "跨境结账地址：Google → dr5hn → Photon → manual 自动降级。",
    usageCode: `<yn-checkout-address locale="zh-CN" .value=\${addr} @change=\${onChange}></yn-checkout-address>`,
    props: [
      { name: "locale", type: '"en" | "zh-CN"', default: '"en"', desc: "界面语言" },
      { name: "google-maps-api-key", type: "string", default: '""', desc: "Google Key" },
      { name: "value", type: "YnCheckoutAddressValue | null", default: "null", desc: "受控回显" },
      { name: "show-email", type: "boolean", default: "false", desc: "展示邮箱" },
      { name: "show-whatsapp", type: "boolean", default: "false", desc: "展示 WhatsApp" },
      { name: "disabled", type: "boolean", default: "false", desc: "禁用" }
    ],
    events: [
      { name: "change", detail: "{ value, validation, changedFields }", desc: "地址变化" }
    ],
    slots: [],
    cssVars: [
      { name: "--yn-checkout-address-primary", desc: "主色" },
      { name: "--yn-checkout-address-field-height", default: "56px", desc: "输入框高度" },
      { name: "--yn-checkout-address-radius", default: "12px", desc: "圆角" }
    ],
    methods: [
      { name: "validate()", signature: "() => YnCheckoutAddressValidateResult", desc: "校验，不改 UI" },
      { name: "reportValidity()", signature: "() => boolean", desc: "标红并聚焦首项无效字段" },
      { name: "setValue(value)", signature: "(value) => void", desc: "编程式回显/清空" }
    ]
  }),

  page({
    id: "yn-drawer",
    title: "Drawer 抽屉",
    tag: "yn-drawer",
    className: "YnDrawer",
    importPath: "yn-web-component/components/yn-drawer",
    description: "响应式侧滑/底部抽屉，基于 Popover API；auto 模式下移动端为 bottom sheet，桌面端为右侧抽屉。",
    usageCode: `<yn-drawer placement="auto" sheet-height="auto" .width=\${420}>
  <yn-button slot="trigger" variant="default">购物车</yn-button>
  <span slot="header">Your bag</span>
  <div slot="header-actions">
    <yn-button size="mini" variant="neutral">收藏</yn-button>
  </div>
  <div slot="content">
    <p>Your bag is empty</p>
    <yn-button variant="default">Shop mens</yn-button>
  </div>
  <div slot="footer">
    <yn-button variant="dark">Checkout</yn-button>
  </div>
</yn-drawer>`,
    props: [
      { name: "open", type: "boolean", default: "false", desc: "受控开关" },
      { name: "width", type: "number", default: "420", desc: "宽度 px" },
      { name: "title", type: "string", default: '""', desc: "标题（header 插槽回退）" },
      { name: "placement", type: "auto | right | bottom", default: "auto", desc: "弹出方向" },
      { name: "sheet-height", type: "string", default: '"90vh"', desc: "底部高度" },
      { name: "close-on-backdrop", type: "boolean", default: "true", desc: "点遮罩关闭" }
    ],
    events: [
      { name: "open-change", detail: "{ open, source, payload }", desc: "开关变化" },
      { name: "before-open / after-open", detail: "同上", desc: "打开生命周期" },
      { name: "before-close / after-close", detail: "同上", desc: "关闭生命周期" }
    ],
    slots: [
      { name: "trigger", desc: "触发器" },
      { name: "header", desc: "头部", priority: "优先于 title" },
      { name: "header-actions", desc: "头部右侧操作" },
      { name: "content", desc: "主体" },
      { name: "footer", desc: "底部" }
    ],
    cssVars: [
      { name: "--yn-drawer-z-index", default: "1500", desc: "层级" },
      { name: "--yn-drawer-bg", desc: "面板背景" },
      { name: "--yn-drawer-backdrop", desc: "遮罩" }
    ],
    methods: [
      { name: "show(payload?)", signature: "show(payload?): void", desc: "打开" },
      { name: "close(payload?)", signature: "close(payload?): void", desc: "关闭" },
      { name: "toggle(payload?)", signature: "toggle(payload?): void", desc: "切换" }
    ],
    notes: [
      "placement=\"auto\" 时：窄屏（移动端）从底部滑入，宽屏从右侧滑入；若需要始终移动端样式，可显式设置 placement=\"bottom\"。",
      "移动端建议使用 sheet-height=\"auto\" 或 80vh/90vh，避免内容过高时遮挡关闭按钮。",
      "backdrop-extra 仅适合宽屏右侧抽屉推荐位，窄屏下应隐藏或降级为内容区模块。"
    ]
  }),

  page({
    id: "yn-toast",
    title: "Toast 提示",
    tag: "yn-toast",
    className: "YnToast",
    importPath: "yn-web-component/components/yn-toast",
    description: "灵动岛风格顶部反馈，支持 loading 形变与异步 callback。",
    usageCode: `const toast = document.querySelector("yn-toast");\nawait toast.success("保存成功");`,
    props: [
      { name: "type", type: "success | info | warning | error", default: "success", desc: "默认类型" },
      { name: "message", type: "string", default: '""', desc: "默认文案" },
      { name: "duration", type: "number", default: "2600", desc: "展示时长 ms" },
      { name: "persist", type: "boolean", default: "false", desc: "保持不自动关闭" }
    ],
    events: [
      { name: "show", detail: "{ type, message, source }", desc: "展示后" },
      { name: "close", detail: "{ type, message, source }", desc: "关闭时" }
    ],
    slots: [],
    cssVars: [
      { name: "--yn-toast-top", default: "26px", desc: "距顶部" },
      { name: "--yn-toast-bg", desc: "背景" },
      { name: "--yn-toast-success-color", desc: "success 球色" }
    ],
    methods: [
      { name: "show()", signature: "show(type?, message?, options?)", desc: "展示" },
      { name: "success() 等", signature: "success(message?)", desc: "快捷方法" },
      { name: "hide()", signature: "hide(source?)", desc: "关闭" }
    ]
  }),

  page({
    id: "yn-pull-cord-switch",
    title: "Pull Cord 抽绳开关",
    tag: "yn-pull-cord-switch",
    className: "YnPullCordSwitch",
    importPath: "yn-web-component/components/yn-pull-cord-switch",
    description: "Verlet 绳物理抽绳开关，支持 fixed 吸顶与双插槽内容切换。",
    usageCode: `<yn-pull-cord-switch @change=\${onChange}>\n  <yn-button>夜间</yn-button>\n  <yn-button slot="activated">日间</yn-button>\n</yn-pull-cord-switch>`,
    props: [
      { name: "checked", type: "boolean", default: "false", desc: "开关状态" },
      { name: "fixed", type: "boolean", default: "false", desc: "吸附视口顶部" },
      { name: "rope-length", type: "number", default: "260", desc: "绳长 px" },
      { name: "variant", type: "default | floema", default: "default", desc: "视觉变体" },
      { name: "size", type: "mini | small | medium", default: "mini", desc: "卡片/绳粗细" },
      { name: "disabled", type: "boolean", default: "false", desc: "禁用拖拽" }
    ],
    events: [
      { name: "change", detail: "{ checked: boolean }", desc: "拉过阈值切换" },
      { name: "fixed-move", detail: "{ x, reverse }", desc: "fixed 模式水平拖动" }
    ],
    slots: [
      { name: "(default)", desc: "关闭态绳端内容" },
      { name: "activated", desc: "开启态绳端内容" }
    ],
    cssVars: [
      { name: "--yn-pull-cord-switch-z-index", desc: "层级" },
      { name: "--yn-pull-cord-switch-accent", desc: "灯光强调色" }
    ],
    notes: ["组件不绘制区域背景；内嵌用法需外层容器同步背景色。"]
  })
];
