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
    id: "yn-icon-button",
    title: "IconButton 图标按钮",
    tag: "yn-icon-button",
    className: "YnIconButton",
    importPath: "yn-web-component/components/yn-icon-button",
    description:
      "Flutter / Material 风格圆形图标按钮：variant 配色、可覆盖默认/hover 背景、hit-slop 热区、按下 ripple。默认插槽传入 SVG 或任意图标元素。",
    usageCode: `import { renderYnIconButtonShadowHtml } from "yn-web-component/ssr/yn-icon-button"
import CartIcon from "./CartIcon.astro"

// 1. 点击事件：原生 click，在 host 上监听（与 yn-button 相同）
function openCart() {
  console.log("open cart drawer")
}

<yn-icon-button label="购物车" variant="default" @click=\${openCart}>
  <CartIcon />
</yn-icon-button>

// Lit / 客户端
html\`<yn-icon-button label="关闭" @click=\${onClose}>\${closeIcon}</yn-icon-button>\`

// 原生 DOM
document.querySelector("yn-icon-button")?.addEventListener("click", (event) => {
  if ((event.target as HTMLElement).closest("yn-icon-button")?.hasAttribute("disabled")) return
  onIconClick(event)
})

// 2. SSR + DSD 首屏（图标走 default slot）
const shadowHtml = renderYnIconButtonShadowHtml({
  label: "购物车",
  variant: "default",
  hitSlop: true,
})

<yn-icon-button label="购物车" variant="default" hit-slop @click=\${openCart}>
  <CartIcon />
  <template shadowrootmode="open" set:html={shadowHtml} />
</yn-icon-button>

// 3. 链接模式：设置 href 后内部渲染 <a>，仍监听 host 的 click
<yn-icon-button label="账户" href="/account" variant="default" @click=\${trackNav}>
  <AccountIcon />
</yn-icon-button>`,
    props: [
      { name: "label", type: "string", default: '"图标按钮"', desc: "aria-label / title（必填语义）" },
      { name: "variant", type: "default | filled | primary | tonal | outlined | inverse | danger | success", default: "default", desc: "行业常见配色预设" },
      { name: "size", type: "small | medium | large", default: "medium", desc: "按钮与图标尺寸" },
      { name: "hit-slop", type: "boolean", default: "true", desc: "四周各扩展 5px 点击热区" },
      { name: "disabled", type: "boolean", default: "false", desc: "禁用" },
      { name: "type", type: "button | submit | reset", default: "button", desc: "原生 button 类型" },
      { name: "href", type: "string", default: '""', desc: "有值时渲染为链接" },
    ],
    events: [
      {
        name: "click",
        detail: "MouseEvent",
        desc: "原生点击事件，在 `<yn-icon-button>` 上监听；`disabled=true` 时内部阻止冒泡且不触发。`href` 链接模式同样可用。",
      },
    ],
    slots: [{ name: "(default)", desc: "图标内容（SVG 等）" }],
    cssVars: [
      { name: "--yn-icon-button-size", default: "2.5rem", desc: "圆形按钮直径" },
      { name: "--yn-icon-button-icon-size", default: "1.25rem", desc: "图标尺寸" },
      { name: "--yn-icon-button-bg", desc: "默认背景色（覆盖 variant）" },
      { name: "--yn-icon-button-hover-bg", desc: "悬停背景/叠层色（覆盖 variant）" },
      { name: "--yn-icon-button-active-bg", desc: "按下 ripple 色" },
      { name: "--yn-icon-button-color", desc: "图标颜色" },
      { name: "--yn-icon-button-border-color", desc: "描边色（outlined 等）" },
      { name: "--yn-icon-button-focus-ring", desc: "焦点环" },
      { name: "--yn-icon-button-primary-bg", desc: "primary variant 背景" },
      { name: "--yn-icon-button-filled-bg", desc: "filled variant 背景" },
    ],
    notes: [
      "事件为原生 `click`，在 host 上使用 `@click` / `addEventListener('click')` 监听，无需自定义事件名。",
      "`disabled=true` 时内部 `button` 禁用且阻止冒泡；`href` 链接模式在 disabled 时会移除 href。",
      "`hit-slop` 通过 `::before` 扩展热区，不影响视觉尺寸，适合顶栏小图标。",
    ],
  }),

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
    description: "Floema 风格圆角输入框，支持前后置按钮插槽与 Astro DSD 首屏 SSR。",
    usageCode: `import { renderYnInputShadowHtml } from "yn-web-component/ssr/yn-input"

const shadowHtml = renderYnInputShadowHtml({ placeholder: "搜索", value: "" })

<yn-input placeholder="搜索">
  <template shadowrootmode="open" set:html={shadowHtml} />
</yn-input>`,
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
    ],
    notes: [
      "首屏 SSR：renderYnInputShadowHtml（yn-web-component/ssr/yn-input）生成 DSD Shadow，与 Lit 组件共用样式。",
      "前后置按钮通过 slot 注入；SSR 首帧默认无按钮，升级后 slotchange 自动同步。"
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
    description: "胶囊式导航，支持受控切换、SEO 链接模式、Astro DSD 首屏 SSR 与 light DOM seo-fallback 链接层。",
    usageCode: `import {
  renderYnNavigationShadowHtml,
  YN_NAVIGATION_SEO_FALLBACK_LIGHT_STYLES,
} from "yn-web-component/ssr/yn-navigation"

const shadowHtml = renderYnNavigationShadowHtml({
  items: [{ label: "首页", href: "/zh/" }],
  activeLabel: "首页",
  seoMode: true,
})

<style is:global set:html={YN_NAVIGATION_SEO_FALLBACK_LIGHT_STYLES}></style>
<yn-navigation seo-mode items-json='{"首页":"/zh/"}' active="首页">
  <template shadowrootmode="open" set:html={shadowHtml} />
  <nav slot="seo-fallback" class="yn-navigation-seo-fallback" aria-label="站点导航">
    <ul><li><a href="/zh/" aria-current="page">首页</a></li></ul>
  </nav>
</yn-navigation>`,
    props: [
      { name: "items", type: "Record<string, string>", default: "内置 4 项", desc: "key=文案，value=路径" },
      { name: "items-json", type: "string", default: "—", desc: "SSR JSON 预注入 items" },
      { name: "active", type: "string", default: '"PRODUTOS"', desc: "当前激活 key" },
      { name: "seo-mode", type: "boolean", default: "false", desc: "渲染 <a href>，不派发 change" },
      { name: "aria-label", type: "string", default: '"Primary navigation"', desc: "无障碍标签" },
      { name: "hit-slop", type: "boolean", default: "false", desc: "扩大热区" }
    ],
    events: [
      { name: "change", detail: "{ key: string; node: Record<string, string> }", desc: "切换项（非 seo 模式）" }
    ],
    slots: [{ name: "seo-fallback", desc: "light DOM SEO 链接层（nav > ul > a），建议视觉隐藏" }],
    cssVars: [
      { name: "--yn-navigation-fill-color", desc: "背景填充" },
      { name: "--yn-navigation-text-color", desc: "文本色" },
      { name: "--yn-navigation-indicator-color", desc: "激活圆点" },
      { name: "--yn-navigation-glow-color", desc: "发光中心色" }
    ],
    notes: [
      "首屏 SSR：renderYnNavigationShadowHtml（DSD）+ light DOM slot=\"seo-fallback\" 真实链接。",
      "SEO 层使用 yn-navigation-seo-fallback 视觉隐藏，链接仍在 light DOM。",
      "items-json 与两层链接 href 需保持一致。"
    ]
  }),

  page({
    id: "yn-search",
    title: "Search 搜索",
    tag: "yn-search",
    className: "YnSearch",
    importPath: "yn-web-component/components/yn-search",
    description:
      "可展开/收起的搜索框，支持 datalist 候选项。支持 `expand-direction` 左右展开、`open` 默认展开、`close` 两步关闭。组件使用 Shadow DOM，外部样式默认不穿透。",
    usageCode: `<!-- 推荐按需导入：import "yn-web-component/components/yn-search"; -->
<div class="search-demo-stage">
  <yn-search
    expand-direction="right"
    input-width="240"
    placeholder="O que estás à procura?"
    style="
      --yn-search-bg-active: rgba(255, 255, 255, 0.96);
      --yn-search-bg-idle: rgba(255, 255, 255, 0);
      --yn-search-field-bg: var(--bg-fill);
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
      {
        name: "input-width",
        type: "number",
        default: "514",
        desc: "输入区宽度 px（最小 80）；展开总宽度 = 44 + 10 + input-width"
      },
      { name: "placeholder", type: "string", default: '"O que estás à procura?"', desc: "占位文案" },
      { name: "disabled", type: "boolean", default: "false", desc: "禁用交互" },
      {
        name: "close",
        type: "boolean",
        default: "true",
        desc: "true：有值时首次点击仅清空并派发 input，无值再收起；false：点击即清空并收起"
      },
      { name: "open", type: "boolean", default: "false", desc: "true：初始展开（无入场动画）" },
      {
        name: "expand-direction",
        type: '"left" | "right"',
        default: '"right"',
        desc: "right 向右顶开右侧元素；left 向左顶开左侧元素"
      }
    ],
    events: [
      { name: "input", detail: "{ value: string }", desc: "输入变化（含清空）" },
      { name: "enter", detail: "{ value: string }", desc: "按回车" }
    ],
    slots: [{ name: "(default)", desc: "datalist 候选项" }],
    cssVars: [
      { name: "--yn-search-bg-active", desc: "展开/悬停壳层背景" },
      { name: "--yn-search-bg-idle", desc: "收起壳层背景" },
      { name: "--yn-search-field-bg", default: "var(--bg-fill)", desc: "输入框背景（建议与壳层一致）" },
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
      "组件使用 Shadow DOM 样式隔离；示例中的 `search-demo-stage` 是外层页面背景，不属于组件 Shadow DOM。",
      "展开总宽度 = 44（按钮）+ 10（间距）+ input-width。`expand-direction=\"right\"` 时左缘固定、逐步顶开右侧兄弟；`left` 时右缘固定、逐步顶开左侧兄弟。",
      "`datalist` 候选弹层由浏览器原生绘制，不是组件 DOM；Storybook 与文档站若浏览器、缩放、系统主题不同，候选弹层视觉可能不一致。"
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
    description: "Floema 风格数量选择器（减 / 输入 / 加），支持 Astro DSD 首屏 SSR。",
    usageCode: `import { renderYnQuantityShadowHtml } from "yn-web-component/ssr/yn-quantity"

const shadowHtml = renderYnQuantityShadowHtml({ value: 1, min: 1, max: 99 })

<yn-quantity value="1" min="1" max="99">
  <template shadowrootmode="open" set:html={shadowHtml} />
</yn-quantity>`,
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
    ],
    notes: [
      "首屏 SSR：renderYnQuantityShadowHtml（yn-web-component/ssr/yn-quantity）生成 DSD stepper 首帧。"
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
    description: "跨境结账地址：自建 dr5hn → CDN → Photon → Google → manual 自动降级。",
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
    usageCode: `<yn-pull-cord-switch fixed reverse glow-up rope-pass-through\n  size="mini" rope-length="220" fixed-x="-12" top="52" z-index="101"\n  @change=\${onThemeChange}>\n  <yn-button size="mini">日间</yn-button>\n  <yn-button slot="activated" size="mini" variant="success">夜间</yn-button>\n</yn-pull-cord-switch>`,
    props: [
      { name: "checked", type: "boolean", default: "false", desc: "开关状态" },
      { name: "fixed", type: "boolean", default: "false", desc: "吸附视口顶部" },
      { name: "rope-pass-through", type: "boolean", default: "false", desc: "绳身 canvas 穿透点击（fixed 贴 Header 推荐）" },
      { name: "rope-length", type: "number", default: "260", desc: "绳长 px" },
      { name: "fixed-x", type: "number", default: "居中", desc: "水平偏移，可负值 peek" },
      { name: "top", type: "number", default: "0", desc: "距顶偏移，可负值 peek" },
      { name: "reverse", type: "boolean", default: "false", desc: "fixed-x 自右侧起算" },
      { name: "glow-up", type: "boolean", default: "false", desc: "顶灯向上扩散" },
      { name: "variant", type: "default | floema", default: "default", desc: "视觉变体" },
      { name: "size", type: "mini | small | medium", default: "mini", desc: "卡片/绳粗细" },
      { name: "z-index", type: "number", default: "1", desc: "叠放层级" },
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
    notes: [
      "组件不绘制区域背景；内嵌用法需外层容器同步背景色。",
      "fixed 贴站点 Header 时务必加 rope-pass-through，避免光晕 canvas 挡住搜索。"
    ]
  }),

  page({
    id: "yn-cookie-notice",
    title: "Cookie Notice 隐私通知",
    tag: "yn-cookie-notice",
    className: "YnCookieNotice",
    importPath: "yn-web-component/components/yn-cookie-notice",
    description: "GDPR 风格 Cookie 同意横幅，支持 accept/reject/settings 三态、偏好分类勾选与 cookie 持久化。",
    usageCode: `<yn-cookie-notice\n  storage-key="cookie_consent_v1"\n  auto-show\n  auto-show-delay="800"\n  @preference-change=\${onPrefsChange}>\n</yn-cookie-notice>`,
    props: [
      { name: "storage-key", type: "string", default: '"cookie_consent_v1"', desc: "cookie 键名" },
      { name: "auto-show-delay", type: "number", default: "800", desc: "自动弹出延迟 ms" },
      { name: "visible", type: "boolean", default: "false", desc: "受控显示状态" },
      { name: "auto-show", type: "boolean", default: "true", desc: "无记录时自动弹出" },
      { name: "max-age", type: "number", default: "31536000", desc: "Cookie 有效期（秒）" },
      { name: "default-functional", type: "boolean", default: "false", desc: "默认勾选 functional" },
      { name: "default-analytics", type: "boolean", default: "false", desc: "默认勾选 analytics" },
      { name: "default-marketing", type: "boolean", default: "true", desc: "默认勾选 marketing" },
      { name: "title", type: "string", default: '"We use cookies to improve your experience"', desc: "标题文案" },
      { name: "policy-line-1", type: "string", default: '"By continuing, you"', desc: "政策文案行1" },
      { name: "policy-line-2", type: "string", default: '"cookie policy."', desc: "政策文案行2" }
    ],
    events: [
      { name: "preference-change", detail: "{ prefs, source, changedKey }", desc: "偏好变化（accept-all / reject-all / save / close / checkbox-change）" }
    ],
    slots: [
      { name: "title", desc: "自定义标题" },
      { name: "policy", desc: "自定义政策文案" }
    ],
    cssVars: [],
    methods: [
      { name: "show()", signature: "show(): void", desc: "手动显示横幅" },
      { name: "hide()", signature: "hide(): void", desc: "隐藏横幅" },
      { name: "openSettings()", signature: "openSettings(): void", desc: "展开偏好设置面板" },
      { name: "resetConsent()", signature: "resetConsent(): void", desc: "清除同意记录并重新显示" },
      { name: "getPreferences()", signature: "getPreferences(): YnCookieNoticePreferences", desc: "读取当前偏好" },
      { name: "setPreferences()", signature: "setPreferences(prefs): void", desc: "编程式设置偏好" }
    ]
  }),

  page({
    id: "yn-sku-cart-button",
    title: "SKU Cart Button 加购按钮",
    tag: "yn-sku-cart-button",
    className: "YnSkuCartButton",
    importPath: "yn-web-component/components/yn-sku-cart-button",
    description: "黑底白框加购按钮，左文案区 + 竖线 + 右价格区，支持三种 loading 模式。",
    usageCode: `<yn-sku-cart-button\n  label="ADD TO CART"\n  price="€29.00"\n  @click=\${onSubmit}>\n</yn-sku-cart-button>`,
    props: [
      { name: "label", type: "string", default: '"ADD TO CART"', desc: "按钮文案" },
      { name: "price", type: "string", default: '"—"', desc: "价格文案" },
      { name: "cart-icon", type: "YnSvgSource", default: "内置 SVG", desc: "购物车图标" },
      { name: "currency-icon", type: "string", default: '""', desc: "货币图标 SVG" },
      { name: "show-cart-icon", type: "boolean", default: "true", desc: "显示购物车图标" },
      { name: "loading", type: "boolean", default: "false", desc: "加载态" },
      { name: "loading-text", type: "string", default: '""', desc: "loading 替换文案（优先于 loading-mode）" },
      { name: "loading-mode", type: "icon | overlay", default: "icon", desc: "spinner 展示方式" },
      { name: "disabled", type: "boolean", default: "false", desc: "禁用点击" }
    ],
    events: [
      { name: "click", detail: "MouseEvent", desc: "点击加购" }
    ],
    slots: [
      { name: "icon", desc: "自定义图标（优先于 cart-icon）" }
    ],
    cssVars: [
      { name: "--yn-sku-selector-submit-bg", default: "#000", desc: "外框背景" },
      { name: "--yn-sku-selector-submit-color", default: "#fff", desc: "文字色" },
      { name: "--yn-sku-selector-submit-height", default: "64px", desc: "按钮高度" },
      { name: "--yn-sku-selector-submit-inner-height", default: "44px", desc: "内框高度" },
      { name: "--yn-sku-selector-submit-divider-width", default: "1px", desc: "竖线宽度" },
      { name: "--yn-sku-selector-submit-divider-color", default: "#fff", desc: "竖线颜色" },
      { name: "--yn-sku-selector-submit-loading-size", default: "18px", desc: "loading spinner 大小" }
    ]
  })
];
