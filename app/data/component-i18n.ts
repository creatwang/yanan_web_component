import type { UsageExample } from "../types";
import type { L10nText } from "../i18n/locale";

export type L10nNote = L10nText;

export type DocShowcase = {
  id: string;
  title: L10nText;
  description: L10nText;
  storybookComponent: string;
  storybookStory: string;
  imageUrl?: string;
  demoVariant?: string;
  code?: L10nText;
};

export type ComponentI18n = {
  title: L10nText;
  description: L10nText;
  longDescription: L10nText;
  usageCode: L10nText;
  showcases: DocShowcase[];
  usageExamples?: UsageExample[];
  props: Array<{ name: string; type: string; default: string; desc: L10nText }>;
  events: Array<{ name: string; detail: string; desc: L10nText }>;
  slots: Array<{ name: string; desc: L10nText; priority?: L10nText }>;
  cssVars: Array<{ name: string; default?: string; desc: L10nText }>;
  methods?: Array<{ name: string; signature: string; desc: L10nText }>;
  notes?: L10nText[];
};

const FLOEMA_IMG =
  "https://www.floema.com/_ipx/f_webp&s_200x114/https:/cdn.sanity.io/images/535lnz3g/production/6adaaad4b7aff57360124f76b64839aafe0bf6bd-317x180.png";

export const COMPONENT_I18N: Record<string, ComponentI18n> = {
  "yn-icon-button": {
    title: { "zh-CN": "IconButton 图标按钮", en: "IconButton" },
    description: {
      "zh-CN": "圆形图标按钮：variant 配色、size 尺寸、hit-slop 热区、href 链接模式。",
      en: "Circular icon button with variants, sizes, hit-slop, and link mode."
    },
    longDescription: {
      "zh-CN": "Flutter / Material 风格圆形图标按钮。通过 `variant` 切换配色（default / filled / primary / tonal / outlined / inverse / danger / success），`size` 控制大小（small / medium / large）。`hit-slop` 默认开启，四周各扩展 5px 点击热区。`href` 有值时渲染为链接。事件为原生 `click`。",
      en: "Material/Flutter circular icon button. Variants: default, filled, primary, tonal, outlined, inverse, danger, success. Sizes: small, medium, large. `hit-slop` extends tap target by 5px. `href` renders as link. Native `click`."
    },
    usageCode: {
      "zh-CN": `<yn-icon-button label="购物车" variant="default" @click=\${openCart}>
  <CartIcon />
</yn-icon-button>`,
      en: `<yn-icon-button label="Cart" variant="default" @click=\${openCart}>
  <CartIcon />
</yn-icon-button>`
    },
    showcases: [
      {
        id: "variants",
        title: { "zh-CN": "配色变体", en: "Color variants" },
        description: { "zh-CN": "default / filled / primary / tonal / outlined / inverse / danger / success。", en: "All variant options." },
        storybookComponent: "Components/yn-icon-button",
        storybookStory: "Variants",
        demoVariant: "yn-icon-button-variants"
      },
      {
        id: "sizes",
        title: { "zh-CN": "尺寸", en: "Sizes" },
        description: { "zh-CN": "small / medium / large 三种规格。", en: "small, medium, large." },
        storybookComponent: "Components/yn-icon-button",
        storybookStory: "Default",
        demoVariant: "yn-icon-button-sizes"
      },
      {
        id: "click",
        title: { "zh-CN": "点击事件", en: "Click handling" },
        description: { "zh-CN": "在 host 上监听原生 `click`。", en: "Listen for native `click` on the host." },
        storybookComponent: "Components/yn-icon-button",
        storybookStory: "ClickHandler",
        demoVariant: "yn-icon-button-click"
      }
    ],
    usageExamples: [
      {
        title: { "zh-CN": "完整属性展示", en: "All properties" },
        code: {
          "zh-CN": `<!-- 图标通过 default slot 嵌套传入 -->
<yn-icon-button label="主色" variant="primary">
  <CartIcon />
</yn-icon-button>
<yn-icon-button label="禁用" variant="primary" disabled>
  <CartIcon />
</yn-icon-button>
<yn-icon-button label="账户" href="/account" variant="default">
  <AccountIcon />
</yn-icon-button>
<yn-icon-button label="无热区" variant="default" ?hit-slop=\${false}>
  <CartIcon />
</yn-icon-button>
<yn-icon-button
  label="自定义配色"
  style="--yn-icon-button-bg:#eef2ff;--yn-icon-button-hover-bg:#c7d2fe;--yn-icon-button-color:#3730a3;"
>
  <CartIcon />
</yn-icon-button>`,
          en: `<!-- Icon nested via default slot -->
<yn-icon-button label="Primary" variant="primary">
  <CartIcon />
</yn-icon-button>
<yn-icon-button label="Disabled" variant="primary" disabled>
  <CartIcon />
</yn-icon-button>
<yn-icon-button label="Account" href="/account" variant="default">
  <AccountIcon />
</yn-icon-button>
<yn-icon-button label="No hit-slop" variant="default" ?hit-slop=\${false}>
  <CartIcon />
</yn-icon-button>
<yn-icon-button
  label="Custom colors"
  style="--yn-icon-button-bg:#eef2ff;--yn-icon-button-hover-bg:#c7d2fe;--yn-icon-button-color:#3730a3;"
>
  <CartIcon />
</yn-icon-button>`
        },
        demoVariant: "yn-icon-button-props-demo"
      },
      {
        title: { "zh-CN": "点击事件日志", en: "Click event log" },
        code: {
          "zh-CN": `<!-- 模板 -->
<yn-icon-button label="购物车" variant="default" @click=\${onClick}>
  <CartIcon />
</yn-icon-button>

<!-- 事件处理 -->
<script>
  function onClick(event) {
    // event: MouseEvent
    console.log('图标按钮被点击', event);
  }
</script>`,
          en: `<!-- Template -->
<yn-icon-button label="Cart" variant="default" @click=\${onClick}>
  <CartIcon />
</yn-icon-button>

<!-- Event handler -->
<script>
  function onClick(event) {
    // event: MouseEvent
    console.log('Icon button clicked', event);
  }
</script>`
        },
        demoVariant: "yn-icon-button-event-log"
      }
    ],
    props: [
      { name: "disabled", type: "boolean", default: "false", desc: { "zh-CN": "禁用交互", en: "Disable interaction" } },
      { name: "size", type: "small | medium | large", default: "medium", desc: { "zh-CN": "尺寸", en: "Size" } },
      { name: "variant", type: "default | filled | primary | tonal | outlined | inverse | danger | success", default: "default", desc: { "zh-CN": "配色预设", en: "Color preset" } },
      { name: "type", type: "button | submit | reset", default: "button", desc: { "zh-CN": "原生 button 类型", en: "Native button type" } },
      { name: "hit-slop", type: "boolean", default: "true", desc: { "zh-CN": "热区扩展 +5px", en: "Expand tap target +5px" } },
      { name: "label", type: "string", default: '""', desc: { "zh-CN": "aria-label / title", en: "aria-label / title" } },
      { name: "href", type: "string", default: '""', desc: { "zh-CN": "有值时渲染为链接", en: "Render as link when set" } }
    ],
    events: [
      { name: "click", detail: "MouseEvent", desc: { "zh-CN": "原生点击；disabled 时不触发", en: "Native click; blocked when disabled" } }
    ],
    slots: [{ name: "(default)", desc: { "zh-CN": "图标 SVG 等", en: "Icon SVG, etc." } }],
    cssVars: [
      { name: "--yn-icon-button-size", default: "2.5rem", desc: { "zh-CN": "圆形按钮直径", en: "Button diameter" } },
      { name: "--yn-icon-button-icon-size", default: "1.25rem", desc: { "zh-CN": "图标尺寸", en: "Icon size" } },
      { name: "--yn-icon-button-bg", desc: { "zh-CN": "默认背景", en: "Default background" } },
      { name: "--yn-icon-button-hover-bg", desc: { "zh-CN": "悬停背景", en: "Hover background" } },
      { name: "--yn-icon-button-active-bg", desc: { "zh-CN": "按下 ripple 色", en: "Active ripple color" } },
      { name: "--yn-icon-button-color", desc: { "zh-CN": "图标颜色", en: "Icon color" } },
      { name: "--yn-icon-button-border-color", desc: { "zh-CN": "描边色（outlined）", en: "Border color (outlined)" } },
      { name: "--yn-icon-button-focus-ring", desc: { "zh-CN": "焦点环", en: "Focus ring" } },
      { name: "--yn-icon-button-hover-scale", default: "1", desc: { "zh-CN": "悬停缩放", en: "Hover scale" } },
      { name: "--yn-icon-button-disabled-opacity", default: "0.45", desc: { "zh-CN": "禁用透明度", en: "Disabled opacity" } }
    ],
    notes: [
      { "zh-CN": "事件为原生 `click`，在 host 上使用 `@click` 监听。", en: "Native `click` on the host." }
    ]
  },

  "yn-button": {
    title: { "zh-CN": "Button 按钮", en: "Button" },
    description: {
      "zh-CN": "语义色 variant、三种 size、loading 加载态、hit-slop 热区与多个图标插槽。",
      en: "Semantic variants, three sizes, loading state, hit-slop, and icon slots."
    },
    longDescription: {
      "zh-CN": "支持 `variant` 语义色（primary / success / warning / danger / neutral / dark / default）、三种 `size`（mini / small / medium）、`loading` + `loading-type` 控制加载图标位置（left / center / right）、`hit-slop` 扩展热区。颜色策略：先用 variant 表达语义，再用 `--yn-button-*` 覆写品牌色。事件为原生 `click`。",
      en: "Semantic variants, three sizes, loading state with position control, hit-slop, and icon slots. Native `click`."
    },
    usageCode: {
      "zh-CN": `<yn-button variant="primary" @click=\${onClick}>保存</yn-button>`,
      en: `<yn-button variant="primary" @click=\${onClick}>Save</yn-button>`
    },
    showcases: [
      {
        id: "variants",
        title: { "zh-CN": "语义色变体", en: "Semantic variants" },
        description: { "zh-CN": "primary / success / warning / danger / neutral / dark 等。", en: "All semantic variants." },
        storybookComponent: "YnButton",
        storybookStory: "Variants",
        demoVariant: "yn-button-variants"
      },
      {
        id: "sizes",
        title: { "zh-CN": "尺寸", en: "Sizes" },
        description: { "zh-CN": "mini / small / medium 三种规格。", en: "mini, small, medium." },
        storybookComponent: "YnButton",
        storybookStory: "Sizes",
        demoVariant: "yn-button-sizes"
      },
      {
        id: "loading",
        title: { "zh-CN": "加载态", en: "Loading" },
        description: { "zh-CN": "loading-type 左/中/右，支持自定义 loading 插槽。", en: "loading-type left/center/right; custom loading slot." },
        storybookComponent: "YnButton",
        storybookStory: "LoadingShowcase",
        demoVariant: "yn-button-loading"
      }
    ],
    usageExamples: [
      {
        title: { "zh-CN": "语义色 + 加载态", en: "Variants + loading" },
        code: {
          "zh-CN": `<yn-button variant="primary">主色</yn-button>
<yn-button variant="success">成功</yn-button>
<yn-button variant="warning">警告</yn-button>
<yn-button variant="danger">危险</yn-button>
<yn-button variant="neutral">中性</yn-button>
<yn-button variant="dark">深色</yn-button>
<yn-button variant="default" hit-slop>默认</yn-button>
<yn-button loading loading-type="center">加载中</yn-button>`,
          en: `<yn-button variant="primary">Primary</yn-button>
<yn-button variant="success">Success</yn-button>
<yn-button variant="warning">Warning</yn-button>
<yn-button variant="danger">Danger</yn-button>
<yn-button variant="neutral">Neutral</yn-button>
<yn-button variant="dark">Dark</yn-button>
<yn-button variant="default" hit-slop>Default</yn-button>
<yn-button loading loading-type="center">Loading</yn-button>`
        },
        demoVariant: "yn-button-props-demo"
      },
      {
        title: { "zh-CN": "点击事件日志", en: "Click event log" },
        code: {
          "zh-CN": `<!-- 模板 -->
<yn-button variant="primary" @click=\${onClick}>点击我</yn-button>

<!-- 事件处理 -->
<script>
  function onClick(event) {
    // event: MouseEvent
    console.log('按钮被点击', event);
  }
</script>`,
          en: `<!-- Template -->
<yn-button variant="primary" @click=\${onClick}>Click me</yn-button>

<!-- Event handler -->
<script>
  function onClick(event) {
    // event: MouseEvent
    console.log('Button clicked', event);
  }
</script>`
        },
        demoVariant: "yn-button-event-log"
      }
    ],
    props: [
      { name: "disabled", type: "boolean", default: "false", desc: { "zh-CN": "禁用点击", en: "Disable clicks" } },
      { name: "variant", type: "primary | success | warning | danger | neutral | dark | default", default: "primary", desc: { "zh-CN": "语义色", en: "Semantic color" } },
      { name: "size", type: "mini | small | medium", default: "medium", desc: { "zh-CN": "尺寸", en: "Size" } },
      { name: "loading", type: "boolean", default: "false", desc: { "zh-CN": "加载态", en: "Loading state" } },
      { name: "loading-type", type: "left | center | right", default: "left", desc: { "zh-CN": "loading 位置", en: "Loading position" } },
      { name: "hit-slop", type: "boolean", default: "true", desc: { "zh-CN": "热区 +5px", en: "+5px hit area" } }
    ],
    events: [{ name: "click", detail: "MouseEvent", desc: { "zh-CN": "点击（非 disabled/loading）", en: "Click (not disabled/loading)" } }],
    slots: [
      { name: "(default)", desc: { "zh-CN": "按钮文案", en: "Label" } },
      { name: "prefix-icon", desc: { "zh-CN": "前缀图标", en: "Prefix icon" } },
      { name: "suffix-icon", desc: { "zh-CN": "后缀图标", en: "Suffix icon" } },
      { name: "loading", desc: { "zh-CN": "自定义 loading 图标", en: "Custom loading icon" } }
    ],
    cssVars: [
      { name: "--yn-button-bg", desc: { "zh-CN": "背景色", en: "Background" } },
      { name: "--yn-button-hover-bg", desc: { "zh-CN": "悬停背景", en: "Hover background" } },
      { name: "--yn-button-disabled-bg", desc: { "zh-CN": "禁用背景", en: "Disabled background" } },
      { name: "--yn-button-disabled-color", desc: { "zh-CN": "禁用文字色", en: "Disabled text color" } },
      { name: "--yn-button-radius", desc: { "zh-CN": "圆角", en: "Radius" } },
      { name: "--yn-button-loading-size", desc: { "zh-CN": "loading 图标尺寸", en: "Loading icon size" } },
      { name: "--yn-button-content-gap", desc: { "zh-CN": "图标与文案间距", en: "Icon-text gap" } }
    ]
  },

  "yn-input": {
    title: { "zh-CN": "Input 输入框", en: "Input" },
    description: {
      "zh-CN": "Floema 风格圆角输入框，支持 variant（default/floating）、前后置按钮插槽、password 切换。",
      en: "Floema-style rounded input with default/floating variant, prefix/suffix slots, password toggle."
    },
    longDescription: {
      "zh-CN": "支持两种 `variant`：`default`（圆角+placeholder）和 `floating`（上浮 label+password 切换）。`type` 支持 text/password 等；`error`/`error-message` 展示校验错误。输入变化触发 `yn-input`，前后按钮点击触发 `yn-prefix-click` / `yn-suffix-click`。",
      en: "Two variants: default (rounded + placeholder) and floating (float label + password toggle). `type`, `error`/`error-message` supported. Emits `yn-input`, `yn-prefix-click`, `yn-suffix-click`."
    },
    usageCode: {
      "zh-CN": `<yn-input placeholder="请输入内容" @yn-input=\${onInput}></yn-input>
<yn-input variant="floating" label="邮箱" type="email" required></yn-input>
<yn-input placeholder="搜索" error error-message="必填">
  <span slot="suffix-button">×</span>
</yn-input>`,
      en: `<yn-input placeholder="Search" @yn-input=\${onInput}></yn-input>
<yn-input variant="floating" label="Email" type="email" required></yn-input>
<yn-input placeholder="Search" error error-message="Required">
  <span slot="suffix-button">×</span>
</yn-input>`
    },
    showcases: [
      {
        id: "default",
        title: { "zh-CN": "无插槽", en: "No slots" },
        description: { "zh-CN": "默认无前后置按钮，仅显示输入区域。", en: "Default input with no prefix or suffix buttons." },
        storybookComponent: "YnInput",
        storybookStory: "Default",
        demoVariant: "yn-input-default"
      },
      {
        id: "prefix-only",
        title: { "zh-CN": "仅前缀按钮", en: "Prefix only" },
        description: { "zh-CN": "只传入 `prefix-button` 插槽。", en: "Only the `prefix-button` slot is provided." },
        storybookComponent: "YnInput",
        storybookStory: "SlottedButtons",
        demoVariant: "yn-input-prefix"
      },
      {
        id: "suffix-only",
        title: { "zh-CN": "仅后缀按钮", en: "Suffix only" },
        description: { "zh-CN": "只传入 `suffix-button` 插槽。", en: "Only the `suffix-button` slot is provided." },
        storybookComponent: "YnInput",
        storybookStory: "SlottedButtons",
        demoVariant: "yn-input-suffix"
      },
      {
        id: "slotted-buttons",
        title: { "zh-CN": "前后置按钮", en: "Prefix/suffix buttons" },
        description: { "zh-CN": "传入插槽后显示可点击图标按钮。", en: "Slotted icon buttons on both ends." },
        storybookComponent: "YnInput",
        storybookStory: "SlottedButtons",
        demoVariant: "yn-input-slotted"
      }
    ],
    usageExamples: [
      {
        title: { "zh-CN": "完整属性展示", en: "All properties" },
        code: {
          "zh-CN": `<yn-input placeholder="默认"></yn-input>
<yn-input variant="floating" label="邮箱" type="email" required></yn-input>
<yn-input placeholder="搜索" disabled value="禁用"></yn-input>
<yn-input placeholder="错误示例" error error-message="必填"></yn-input>
<yn-input placeholder="前缀">
  <span slot="prefix-button">⌘</span>
</yn-input>
<yn-input type="password" variant="floating" label="密码"></yn-input>`,
          en: `<yn-input placeholder="Default"></yn-input>
<yn-input variant="floating" label="Email" type="email" required></yn-input>
<yn-input placeholder="Search" disabled value="Disabled"></yn-input>
<yn-input placeholder="Error" error error-message="Required"></yn-input>
<yn-input placeholder="Prefix">
  <span slot="prefix-button">⌘</span>
</yn-input>
<yn-input type="password" variant="floating" label="Password"></yn-input>`
        },
        demoVariant: "yn-input-props-demo"
      },
      {
        title: { "zh-CN": "事件日志", en: "Event log" },
        code: {
          "zh-CN": `<!-- 模板 -->
<yn-input @yn-input=\${onInput} @yn-prefix-click=\${onPrefix} @yn-suffix-click=\${onSuffix}>
  <span slot="prefix-button"></span>
  <span slot="suffix-button">×</span>
</yn-input>

<!-- 事件处理 -->
<script>
  function onInput(event) {
    // event.detail: { value: string }
    console.log('输入值:', event.detail.value);
  }
  function onPrefix(event) {
    console.log('前缀按钮点击');
  }
  function onSuffix(event) {
    console.log('后缀按钮点击');
  }
</script>`,
          en: `<!-- Template -->
<yn-input @yn-input=\${onInput} @yn-prefix-click=\${onPrefix} @yn-suffix-click=\${onSuffix}>
  <span slot="prefix-button"></span>
  <span slot="suffix-button">×</span>
</yn-input>

<!-- Event handlers -->
<script>
  function onInput(event) {
    // event.detail: { value: string }
    console.log('Input value:', event.detail.value);
  }
  function onPrefix(event) {
    console.log('Prefix button clicked');
  }
  function onSuffix(event) {
    console.log('Suffix button clicked');
  }
</script>`
        },
        demoVariant: "yn-input-event-log"
      }
    ],
    props: [
      { name: "value", type: "string", default: '""', desc: { "zh-CN": "当前值", en: "Current value" } },
      { name: "placeholder", type: "string", default: '"请输入内容"', desc: { "zh-CN": "占位文案", en: "Placeholder" } },
      { name: "disabled", type: "boolean", default: "false", desc: { "zh-CN": "禁用输入", en: "Disable input" } },
      { name: "variant", type: "default | floating", default: "default", desc: { "zh-CN": "样式变体（默认/浮动 label）", en: "Variant (default/floating)" } },
      { name: "label", type: "string", default: '""', desc: { "zh-CN": "浮动 label 文案（floating 模式）", en: "Floating label text" } },
      { name: "type", type: "string", default: '"text"', desc: { "zh-CN": "输入类型（text/password/email 等）", en: "Input type (text/password/email)" } },
      { name: "name", type: "string", default: '""', desc: { "zh-CN": "原生 name 属性", en: "Native name attribute" } },
      { name: "required", type: "boolean", default: "false", desc: { "zh-CN": "必填", en: "Required" } },
      { name: "error", type: "boolean", default: "false", desc: { "zh-CN": "展示错误态", en: "Show error state" } },
      { name: "error-message", type: "string", default: '""', desc: { "zh-CN": "错误提示文案", en: "Error message" } },
      { name: "autocomplete", type: "string", default: '""', desc: { "zh-CN": "自动完成", en: "Autocomplete" } }
    ],
    events: [
      { name: "yn-input", detail: "{ value: string }", desc: { "zh-CN": "输入值变化", en: "Input value changed" } },
      { name: "yn-prefix-click", detail: "{ value: string }", desc: { "zh-CN": "前置按钮点击", en: "Prefix button clicked" } },
      { name: "yn-suffix-click", detail: "{ value: string }", desc: { "zh-CN": "后置按钮点击", en: "Suffix button clicked" } }
    ],
    slots: [
      { name: "prefix-button", desc: { "zh-CN": "前置按钮图标", en: "Prefix icon button" } },
      { name: "suffix-button", desc: { "zh-CN": "后置按钮图标", en: "Suffix icon button" } }
    ],
    cssVars: [
      { name: "--yn-input-width", default: "320px", desc: { "zh-CN": "宽度", en: "Width" } },
      { name: "--yn-input-height", default: "44px", desc: { "zh-CN": "高度", en: "Height" } },
      { name: "--yn-input-bg", desc: { "zh-CN": "背景色", en: "Background" } },
      { name: "--yn-input-border-color", desc: { "zh-CN": "边框色", en: "Border color" } },
      { name: "--yn-input-radius", default: "999px", desc: { "zh-CN": "圆角", en: "Radius" } },
      { name: "--yn-input-button-size", default: "28px", desc: { "zh-CN": "前后按钮尺寸", en: "Prefix/suffix button size" } },
      { name: "--yn-input-placeholder-color", desc: { "zh-CN": "占位文本色", en: "Placeholder color" } },
      { name: "--yn-input-focus-ring", desc: { "zh-CN": "焦点环", en: "Focus ring" } },
      { name: "--yn-input-color", desc: { "zh-CN": "输入文本色", en: "Input text color" } }
    ]
  },

  "yn-icon-connect-button": {
    title: { "zh-CN": "IconConnect 图标连接按钮", en: "Icon Connect Button" },
    description: {
      "zh-CN": "带图标连接动画的按钮或链接，属性与插槽可互换，支持链接模式。",
      en: "Button/link with icon connect animation; props/slots interchangeable, link mode."
    },
    longDescription: {
      "zh-CN": "支持三种 `size`（mini / small / normal）控制图标块、字体和 hover 展开距离。`uppercase` 控制大写。`link` 有值时渲染为 `<a>`。`icon` / `label` 属性可通过同名插槽覆盖。",
      en: "Three sizes control icon block, font, and hover expansion. `uppercase` toggles case. `link` renders `<a>`. Slots override icon/label props."
    },
    usageCode: {
      "zh-CN": `<yn-icon-connect-button label="VER PRODUTOS URBAN" size="normal" icon="..." @click=\${onClick}></yn-icon-connect-button>`,
      en: `<yn-icon-connect-button label="VER PRODUTOS URBAN" size="normal" icon="..." @click=\${onClick}></yn-icon-connect-button>`
    },
    showcases: [
      {
        id: "sizes",
        title: { "zh-CN": "尺寸展示", en: "Size showcase" },
        description: { "zh-CN": "mini / small / normal；悬停查看连接动画。", en: "mini, small, normal — hover for connect animation." },
        storybookComponent: "YnIconConnectButton",
        storybookStory: "SizeShowcase",
        demoVariant: "yn-icon-connect-sizes"
      }
    ],
    usageExamples: [
      {
        title: { "zh-CN": "尺寸 / 链接 / 禁用", en: "Sizes / link / disabled" },
        code: {
          "zh-CN": `<yn-icon-connect-button label="BUTTON" size="mini"></yn-icon-connect-button>
<yn-icon-connect-button label="BUTTON" size="small"></yn-icon-connect-button>
<yn-icon-connect-button label="BUTTON" size="normal"></yn-icon-connect-button>
<yn-icon-connect-button label="VIEW PRODUCTS" size="normal" link="/products"></yn-icon-connect-button>
<yn-icon-connect-button label="DISABLED" size="normal" disabled></yn-icon-connect-button>`,
          en: `<yn-icon-connect-button label="BUTTON" size="mini"></yn-icon-connect-button>
<yn-icon-connect-button label="BUTTON" size="small"></yn-icon-connect-button>
<yn-icon-connect-button label="BUTTON" size="normal"></yn-icon-connect-button>
<yn-icon-connect-button label="VIEW PRODUCTS" size="normal" link="/products"></yn-icon-connect-button>
<yn-icon-connect-button label="DISABLED" size="normal" disabled></yn-icon-connect-button>`
        },
        demoVariant: "yn-icon-connect-props-demo"
      },
      {
        title: { "zh-CN": "点击事件", en: "Click event" },
        code: {
          "zh-CN": `<!-- 模板 -->
<yn-icon-connect-button label="VER PRODUTOS" size="normal" @click=\${onClick}></yn-icon-connect-button>

<!-- 事件处理 -->
<script>
  function onClick(event) {
    // event: MouseEvent
    console.log('连接按钮被点击', event);
  }
</script>`,
          en: `<!-- Template -->
<yn-icon-connect-button label="VER PRODUTOS" size="normal" @click=\${onClick}></yn-icon-connect-button>

<!-- Event handler -->
<script>
  function onClick(event) {
    // event: MouseEvent
    console.log('Icon connect button clicked', event);
  }
</script>`
        },
        demoVariant: "yn-icon-connect-event-log"
      }
    ],
    props: [
      { name: "label", type: "string", default: '"VER PRODUTOS URBAN"', desc: { "zh-CN": "文案", en: "Label text" } },
      { name: "size", type: "mini | small | normal", default: "normal", desc: { "zh-CN": "尺寸", en: "Size" } },
      { name: "disabled", type: "boolean", default: "false", desc: { "zh-CN": "禁用", en: "Disabled" } },
      { name: "uppercase", type: "boolean", default: "true", desc: { "zh-CN": "大写转换", en: "Uppercase transform" } },
      { name: "link", type: "string", default: '""', desc: { "zh-CN": "链接 URL（有值渲染 <a>）", en: "Link URL (renders <a>)" } },
      { name: "icon", type: "string", default: "内置 SVG", desc: { "zh-CN": "图标 HTML", en: "Icon HTML" } }
    ],
    events: [{ name: "click", detail: "MouseEvent", desc: { "zh-CN": "点击", en: "Click" } }],
    slots: [
      { name: "icon", desc: { "zh-CN": "自定义图标，优先于 icon 属性", en: "Custom icon, overrides icon prop" }, priority: { "zh-CN": "优先于 icon 属性", en: "Overrides icon prop" } },
      { name: "label", desc: { "zh-CN": "自定义文案，优先于 label 属性", en: "Custom label, overrides label prop" }, priority: { "zh-CN": "优先于 label 属性", en: "Overrides label prop" } }
    ],
    cssVars: [
      { name: "--yn-icon-connect-button-bg", default: "var(--yn-color-accent, #ddd967)", desc: { "zh-CN": "背景色", en: "Background" } },
      { name: "--yn-icon-connect-button-color", default: "var(--yn-color-text, #241f21)", desc: { "zh-CN": "文本/图标色", en: "Text/icon color" } },
      { name: "--yn-icon-connect-button-text-transform", default: "uppercase", desc: { "zh-CN": "文案大小写", en: "Text transform" } }
    ]
  },

  "yn-navigation": {
    title: { "zh-CN": "Navigation 导航", en: "Navigation" },
    description: {
      "zh-CN": "胶囊式 SVG 导航，支持受控切换、SEO 链接模式与 DSD SSR。",
      en: "Capsule SVG navigation with controlled switching, SEO mode, and DSD SSR."
    },
    longDescription: {
      "zh-CN": "通过 `items` 配置导航项（key=文案 value=路径），`active` 受控激活。`seo-mode` 开启后渲染 `<a>` 链接，适合 SSR。`hit-slop` 扩大点击热区。`items-json` 用于 SSR 预注入。发光跟随指针移动。",
      en: "Configure items via `items` Record, control with `active`. `seo-mode` renders `<a>` links for SSR. `hit-slop` expands area. Glow follows pointer."
    },
    usageCode: {
      "zh-CN": `<yn-navigation .items=\${navItems} active="PRODUTOS" @change=\${onChange}></yn-navigation>`,
      en: `<yn-navigation .items=\${navItems} active="PRODUTOS" @change=\${onChange}></yn-navigation>`
    },
    showcases: [
      {
        id: "controlled",
        title: { "zh-CN": "受控切换（默认）", en: "Controlled (default)" },
        description: { "zh-CN": "点击导航项，观察指示器滑动与 glow 动画。", en: "Click tabs to see indicator slide and glow." },
        storybookComponent: "YnNavigation",
        storybookStory: "Default",
        demoVariant: "yn-navigation-controlled"
      },
      {
        id: "dark",
        title: { "zh-CN": "深色背景", en: "Dark background" },
        description: { "zh-CN": "深底 + 白胶囊对比，可配合 `hit-slop`。", en: "Dark surface with light capsule contrast." },
        storybookComponent: "YnNavigation",
        storybookStory: "DarkBackground",
        demoVariant: "yn-navigation-dark"
      },
      {
        id: "seo",
        title: { "zh-CN": "SEO / SSR 首屏", en: "SEO / SSR first paint" },
        description: { "zh-CN": "`seo-mode` 渲染 `<a href>`，配合 DSD 首屏。", en: "seo-mode anchors with DSD SSR." },
        storybookComponent: "YnNavigation",
        storybookStory: "Default",
        demoVariant: "yn-navigation-seo"
      }
    ],
    usageExamples: [
      {
        title: { "zh-CN": "change 事件日志", en: "Change event log" },
        code: {
          "zh-CN": `<!-- 模板 -->
<yn-navigation
  .items=\${{ PRODUTOS: "/produtos", SOBRE: "/sobre" }}
  active="PRODUTOS"
  @change=\${onChange}
></yn-navigation>

<!-- 事件处理 -->
<script>
  function onChange(event) {
    // event.detail: { key: string; node: Record<string, string> }
    console.log('导航切换:', event.detail.key);
  }
</script>`,
          en: `<!-- Template -->
<yn-navigation
  .items=\${{ PRODUTOS: "/produtos", SOBRE: "/sobre" }}
  active="PRODUTOS"
  @change=\${onChange}
></yn-navigation>

<!-- Event handler -->
<script>
  function onChange(event) {
    // event.detail: { key: string; node: Record<string, string> }
    console.log('Nav changed:', event.detail.key);
  }
</script>`
        },
        demoVariant: "yn-navigation-event-log"
      }
    ],
    props: [
      { name: "items", type: "Record<string, string>", default: "内置 4 项", desc: { "zh-CN": "key=文案, value=路径", en: "key=label, value=path" } },
      { name: "active", type: "string", default: '"PRODUTOS"', desc: { "zh-CN": "当前激活项 key", en: "Active item key" } },
      { name: "hit-slop", type: "boolean", default: "false", desc: { "zh-CN": "扩大点击热区", en: "Expand click area" } },
      { name: "seo-mode", type: "boolean", default: "false", desc: { "zh-CN": "渲染 <a> 链接，不派发 change", en: "Render <a> links, no change event" } },
      { name: "aria-label", type: "string", default: '"Primary navigation"', desc: { "zh-CN": "无障碍标签", en: "ARIA label" } },
      { name: "items-json", type: "string", default: "—", desc: { "zh-CN": "SSR JSON 预注入", en: "SSR JSON pre-inject" } }
    ],
    events: [
      { name: "change", detail: "{ key: string; node: Record<string, string> }", desc: { "zh-CN": "导航项切换", en: "Navigation item changed" } }
    ],
    slots: [
      { name: "seo-fallback", desc: { "zh-CN": "light DOM SEO 链接层", en: "Light DOM SEO fallback links" } }
    ],
    cssVars: [
      { name: "--yn-navigation-fill-color", desc: { "zh-CN": "背景填充色", en: "Fill color" } },
      { name: "--yn-navigation-text-color", desc: { "zh-CN": "文本色", en: "Text color" } },
      { name: "--yn-navigation-active-text-color", desc: { "zh-CN": "激活文本色", en: "Active text color" } },
      { name: "--yn-navigation-indicator-color", desc: { "zh-CN": "激活指示色", en: "Indicator color" } },
      { name: "--yn-navigation-glow-color", desc: { "zh-CN": "发光色", en: "Glow color" } },
      { name: "--yn-navigation-focus-color", desc: { "zh-CN": "焦点色", en: "Focus color" } }
    ]
  },

  "yn-search": {
    title: { "zh-CN": "Search 搜索", en: "Search" },
    description: {
      "zh-CN": "可展开/收起的 SVG 形状搜索框，支持 datalist 候选项与双向展开方向。",
      en: "Expandable/collapsible SVG shape search input with datalist support and dual expand direction."
    },
    longDescription: {
      "zh-CN": "`close` 控制两步关闭行为（有值先清空再收起）。`expand-direction` 左右展开。`open` 默认展开。`input-width` 控制输入区宽度。内置 SVG 形状动画。支持 `<datalist>` 候选。",
      en: "`close` controls two-step close (clear first then collapse). `expand-direction` left/right. `open` initially expanded. `input-width` controls field width. Built-in shape animation."
    },
    usageCode: {
      "zh-CN": `<yn-search expand-direction="right" input-width="240" placeholder="O que estás à procura?" @input=\${onInput} @enter=\${onSearch}>
  <datalist><option value="Sofa"></option></datalist>
</yn-search>`,
      en: `<yn-search expand-direction="right" input-width="240" placeholder="Search..." @input=\${onInput} @enter=\${onSearch}>
  <datalist><option value="Sofa"></option></datalist>
</yn-search>`
    },
    showcases: [
      {
        id: "native-datalist",
        title: { "zh-CN": "原生 datalist 候选", en: "Native datalist suggestions" },
        description: { "zh-CN": "默认插槽传入 `<datalist>`；两步关闭行为见 `close` 属性。", en: "Default slot `<datalist>`; two-step close via `close`." },
        storybookComponent: "YnSearch",
        storybookStory: "Default",
        demoVariant: "yn-search-default"
      },
      {
        id: "expand-right-push",
        title: { "zh-CN": "向右展开顶开兄弟", en: "Expand right and push siblings" },
        description: { "zh-CN": "`expand-direction=\"right\"` 顶开右侧 flex 兄弟。", en: "`expand-direction=\"right\"` pushes right siblings." },
        storybookComponent: "YnSearch",
        storybookStory: "PushRightSiblings",
        demoVariant: "yn-search-expand-right"
      },
      {
        id: "expand-left",
        title: { "zh-CN": "向左展开", en: "Expand left" },
        description: { "zh-CN": "`expand-direction=\"left\"` 顶开左侧 Brand。", en: "`expand-direction=\"left\"` pushes left siblings." },
        storybookComponent: "YnSearch",
        storybookStory: "ExpandLeft",
        demoVariant: "yn-search-expand-left"
      },
      {
        id: "default-open",
        title: { "zh-CN": "默认展开", en: "Default open" },
        description: { "zh-CN": "`open=true` 初始展开，无入场动画。", en: "`open=true` starts expanded without entry animation." },
        storybookComponent: "YnSearch",
        storybookStory: "DefaultOpen",
        demoVariant: "yn-search-default-open"
      }
    ],
    usageExamples: [
      {
        title: { "zh-CN": "input / enter 事件", en: "Input & enter events" },
        code: {
          "zh-CN": `<!-- 模板 -->
<yn-search placeholder="搜索..." @input=\${onInput} @enter=\${onEnter}>
  <datalist>
    <option value="Sofa"></option>
    <option value="Table"></option>
  </datalist>
</yn-search>

<!-- 事件处理 -->
<script>
  function onInput(event) {
    // event.detail: { value: string }
    console.log('搜索输入:', event.detail.value);
  }
  function onEnter(event) {
    // event.detail: { value: string }
    console.log('搜索提交:', event.detail.value);
  }
</script>`,
          en: `<!-- Template -->
<yn-search placeholder="Search..." @input=\${onInput} @enter=\${onEnter}>
  <datalist>
    <option value="Sofa"></option>
    <option value="Table"></option>
  </datalist>
</yn-search>

<!-- Event handlers -->
<script>
  function onInput(event) {
    // event.detail: { value: string }
    console.log('Search input:', event.detail.value);
  }
  function onEnter(event) {
    // event.detail: { value: string }
    console.log('Search submitted:', event.detail.value);
  }
</script>`
        },
        demoVariant: "yn-search-event-log"
      }
    ],
    props: [
      { name: "close", type: "boolean", default: "true", desc: { "zh-CN": "两步关闭（有值先清空）", en: "Two-step close" } },
      { name: "disabled", type: "boolean", default: "false", desc: { "zh-CN": "禁用", en: "Disabled" } },
      { name: "placeholder", type: "string", default: '"O que estás à procura?"', desc: { "zh-CN": "占位文案", en: "Placeholder" } },
      { name: "input-width", type: "number", default: "514", desc: { "zh-CN": "输入区宽度 px", en: "Input area width px" } },
      { name: "expand-direction", type: '"left" | "right"', default: '"right"', desc: { "zh-CN": "展开方向", en: "Expand direction" } },
      { name: "open", type: "boolean", default: "false", desc: { "zh-CN": "默认展开", en: "Initially open" } }
    ],
    events: [
      { name: "input", detail: "{ value: string }", desc: { "zh-CN": "输入变化（含清空）", en: "Input changed (including clear)" } },
      { name: "enter", detail: "{ value: string }", desc: { "zh-CN": "按回车", en: "Enter pressed" } }
    ],
    slots: [
      { name: "(default)", desc: { "zh-CN": "datalist 候选项", en: "datalist options" } }
    ],
    cssVars: [
      { name: "--yn-search-bg-active", desc: { "zh-CN": "展开/悬停背景", en: "Active/hover background" } },
      { name: "--yn-search-bg-idle", desc: { "zh-CN": "收起背景", en: "Idle background" } },
      { name: "--yn-search-field-bg", default: "var(--bg-fill)", desc: { "zh-CN": "输入框背景", en: "Field background" } },
      { name: "--yn-search-icon-color", desc: { "zh-CN": "图标色", en: "Icon color" } },
      { name: "--yn-search-field-color", desc: { "zh-CN": "输入文本色", en: "Field text color" } },
      { name: "--yn-search-placeholder-color", desc: { "zh-CN": "占位文本色", en: "Placeholder color" } },
      { name: "--yn-search-caret-color", desc: { "zh-CN": "光标色", en: "Caret color" } },
      { name: "--yn-search-fill-duration", default: "220ms", desc: { "zh-CN": "背景形变时长", en: "Fill animation duration" } },
      { name: "--yn-search-icon-duration", default: "220ms", desc: { "zh-CN": "图标切换时长", en: "Icon animation duration" } }
    ]
  },

  "yn-dropdown": {
    title: { "zh-CN": "Dropdown 下拉", en: "Dropdown" },
    description: {
      "zh-CN": "通用下拉弹层，支持 12 方向 placement、触发器位移动画与面板形变动画。",
      en: "General dropdown popover with 12-direction placement, trigger motion, and panel morph."
    },
    longDescription: {
      "zh-CN": "`placement` 支持 12 方向（top/bottom/left/right + start/center/end）。`offset` 间距。`close-on-outside-click` 外部点击关闭。ESC 快捷关闭。`auto-flip` 自动翻转防止溢出。面板带有形变和透明度动画。",
      en: "12-direction placement. Offset spacing, outside-click close, ESC close, auto-flip. Panel morph animation."
    },
    usageCode: {
      "zh-CN": `<yn-dropdown placement="bottom-start" @open-change=\${onOpenChange}>
  <yn-button>筛选</yn-button>
  <div slot="content"><yn-pick value="a">选项 A</yn-pick></div>
</yn-dropdown>`,
      en: `<yn-dropdown placement="bottom-start" @open-change=\${onOpenChange}>
  <yn-button>Filter</yn-button>
  <div slot="content"><yn-pick value="a">Option A</yn-pick></div>
</yn-dropdown>`
    },
    showcases: [
      {
        id: "default",
        title: { "zh-CN": "分类筛选", en: "Category filter" },
        description: { "zh-CN": "嵌套 yn-button 触发器 + yn-group-pick 面板。", en: "Nested yn-button trigger + yn-group-pick panel." },
        storybookComponent: "YnDropdown",
        storybookStory: "Default",
        demoVariant: "yn-dropdown-default"
      },
      {
        id: "custom-close",
        title: { "zh-CN": "自定义关闭图标", en: "Custom close icon" },
        description: { "zh-CN": "`close-icon` 插槽 + `right-start` 方向。", en: "`close-icon` slot with right-start placement." },
        storybookComponent: "YnDropdown",
        storybookStory: "CustomCloseIcon",
        demoVariant: "yn-dropdown-custom-close"
      }
    ],
    usageExamples: [
      {
        title: { "zh-CN": "嵌套插槽组合", en: "Nested slot composition" },
        code: {
          "zh-CN": `<yn-dropdown placement="bottom-start">
  <yn-button variant="default">筛选条件</yn-button>
  <div slot="content">
    <yn-group-pick>
      <yn-pick value="Nature"><div>Nature</div></yn-pick>
    </yn-group-pick>
  </div>
</yn-dropdown>

<yn-dropdown placement="right-start">
  <yn-button variant="default">更多选项</yn-button>
  <svg slot="close-icon">...</svg>
  <div slot="content">Panel content</div>
</yn-dropdown>`,
          en: `<yn-dropdown placement="bottom-start">
  <yn-button variant="default">Filter</yn-button>
  <div slot="content">
    <yn-group-pick>
      <yn-pick value="Nature"><div>Nature</div></yn-pick>
    </yn-group-pick>
  </div>
</yn-dropdown>

<yn-dropdown placement="right-start">
  <yn-button variant="default">More</yn-button>
  <svg slot="close-icon">...</svg>
  <div slot="content">Panel content</div>
</yn-dropdown>`
        },
        demoVariant: "yn-dropdown-props-demo"
      },
      {
        title: { "zh-CN": "开关事件", en: "Open/close event" },
        code: {
          "zh-CN": `<!-- 模板 -->
<yn-dropdown placement="bottom-start" @open-change=\${onOpenChange}>
  <yn-button variant="default">筛选条件</yn-button>
  <div slot="content">Dropdown content</div>
</yn-dropdown>

<!-- 事件处理 -->
<script>
  function onOpenChange(event) {
    // event.detail: { open: boolean; placement: string }
    console.log('下拉状态:', event.detail.open ? '打开' : '关闭');
  }
</script>`,
          en: `<!-- Template -->
<yn-dropdown placement="bottom-start" @open-change=\${onOpenChange}>
  <yn-button variant="default">Filter</yn-button>
  <div slot="content">Dropdown content</div>
</yn-dropdown>

<!-- Event handler -->
<script>
  function onOpenChange(event) {
    // event.detail: { open: boolean; placement: string }
    console.log('Dropdown state:', event.detail.open ? 'open' : 'closed');
  }
</script>`
        },
        demoVariant: "yn-dropdown-event-log"
      }
    ],
    props: [
      { name: "placement", type: "12 方向", default: "bottom-start", desc: { "zh-CN": "弹出方向", en: "Placement" } },
      { name: "open", type: "boolean", default: "false", desc: { "zh-CN": "受控展开", en: "Controlled open" } },
      { name: "offset", type: "number", default: "12", desc: { "zh-CN": "间距 px", en: "Offset px" } },
      { name: "motion-distance", type: "number", default: "14", desc: { "zh-CN": "触发器位移距离 px", en: "Trigger motion distance px" } },
      { name: "panel-open-distance", type: "number", default: "16", desc: { "zh-CN": "面板展开位移", en: "Panel open shift" } },
      { name: "panel-close-distance", type: "number", default: "20", desc: { "zh-CN": "面板关闭位移", en: "Panel close shift" } },
      { name: "viewport-padding", type: "number", default: "12", desc: { "zh-CN": "视口边距", en: "Viewport padding" } },
      { name: "auto-flip", type: "boolean", default: "false", desc: { "zh-CN": "自动翻转防溢出", en: "Auto-flip" } },
      { name: "close-on-outside-click", type: "boolean", default: "true", desc: { "zh-CN": "点外部关闭", en: "Close on outside click" } }
    ],
    events: [
      { name: "open-change", detail: "{ open: boolean; placement }", desc: { "zh-CN": "开关变化", en: "Open state changed" } }
    ],
    slots: [
      { name: "(default)", desc: { "zh-CN": "触发器内容", en: "Trigger content" } },
      { name: "content", desc: { "zh-CN": "面板内容", en: "Panel content" } },
      { name: "close-icon", desc: { "zh-CN": "关闭图标", en: "Close icon" } }
    ],
    cssVars: [
      { name: "--yn-dropdown-panel-min-width", default: "280px", desc: { "zh-CN": "面板最小宽度", en: "Panel min width" } },
      { name: "--yn-dropdown-panel-radius", default: "12px", desc: { "zh-CN": "面板圆角", en: "Panel radius" } },
      { name: "--yn-dropdown-panel-shadow", desc: { "zh-CN": "面板阴影", en: "Panel shadow" } },
      { name: "--yn-dropdown-panel-bg", desc: { "zh-CN": "面板背景", en: "Panel background" } },
      { name: "--yn-dropdown-z-index", default: "1200", desc: { "zh-CN": "层级", en: "Z-index" } },
      { name: "--yn-dropdown-panel-padding", default: "12px", desc: { "zh-CN": "面板内边距", en: "Panel padding" } }
    ],
    methods: [
      { name: "close()", signature: "close(): void", desc: { "zh-CN": "主动关闭下拉", en: "Close the dropdown" } }
    ]
  },

  "yn-dropdown-pick": {
    title: { "zh-CN": "Dropdown Pick 下拉选择", en: "Dropdown Pick" },
    description: {
      "zh-CN": "下拉单选器，插槽传入 yn-pick，选中即收起。支持自定义触发按钮样式。",
      en: "Dropdown single selector with yn-pick children, auto-close on select. Custom trigger styling."
    },
    longDescription: {
      "zh-CN": "`value` 受控当前选中。`value-field` / `button-display-field` 控制数据映射。`button-bg` / `button-color` / `open-button-bg` / `open-button-color` 自定义触发按钮颜色。`show-selected-icon` 控制选中勾选。子项通过 `data-node` JSON 传递完整数据。",
      en: "Controlled `value`. `value-field`/`button-display-field` for data mapping. Custom trigger colors. `show-selected-icon` for checkmark. Children pass data via `data-node` JSON."
    },
    usageCode: {
      "zh-CN": `<yn-dropdown-pick value="en" button-display-field="code">
  <yn-pick value="en" data-node='{"code":"EN","label":"English"}'>EN</yn-pick>
  <yn-pick value="zh" data-node='{"code":"ZH","label":"中文"}'>ZH</yn-pick>
</yn-dropdown-pick>`,
      en: `<yn-dropdown-pick value="en" button-display-field="code">
  <yn-pick value="en" data-node='{"code":"EN","label":"English"}'>EN</yn-pick>
  <yn-pick value="zh" data-node='{"code":"ZH","label":"中文"}'>ZH</yn-pick>
</yn-dropdown-pick>`
    },
    showcases: [
      {
        id: "default",
        title: { "zh-CN": "语言选择", en: "Language select" },
        description: { "zh-CN": "按钮展示 code 字段，选中即收起。", en: "Button shows code field; closes on select." },
        storybookComponent: "YnDropdownPick",
        storybookStory: "Default",
        demoVariant: "yn-dropdown-pick-default"
      }
    ],
    usageExamples: [
      {
        title: { "zh-CN": "value / disabled / 嵌套 yn-pick", en: "Value, disabled & nested yn-pick" },
        code: {
          "zh-CN": `<yn-dropdown-pick value="en" button-display-field="code" placeholder="Language">
  <yn-pick value="en" data-node='{"id":"en","code":"EN"}'>EN</yn-pick>
  <yn-pick value="pt" data-node='{"id":"pt","code":"PT"}'>PT</yn-pick>
</yn-dropdown-pick>

<yn-dropdown-pick value="en" disabled>...</yn-dropdown-pick>`,
          en: `<yn-dropdown-pick value="en" button-display-field="code" placeholder="Language">
  <yn-pick value="en" data-node='{"id":"en","code":"EN"}'>EN</yn-pick>
  <yn-pick value="pt" data-node='{"id":"pt","code":"PT"}'>PT</yn-pick>
</yn-dropdown-pick>

<yn-dropdown-pick value="en" disabled>...</yn-dropdown-pick>`
        },
        demoVariant: "yn-dropdown-pick-props-demo"
      },
      {
        title: { "zh-CN": "选中与展开事件", en: "Change & open-change events" },
        code: {
          "zh-CN": `<!-- 模板 -->
<yn-dropdown-pick
  value="en"
  value-field="id"
  button-display-field="code"
  placeholder="Language"
  @change=\${onChange}
  @open-change=\${onOpenChange}
>
  <yn-pick value="en" data-node='{"id":"en","label":"English"}'>
    <div style="padding:8px 12px;">English</div>
  </yn-pick>
  <yn-pick value="pt" data-node='{"id":"pt","label":"Português"}'>
    <div style="padding:8px 12px;">Português</div>
  </yn-pick>
</yn-dropdown-pick>

<!-- 事件处理 -->
<script>
  function onChange(event) {
    // event.detail: { id: string; node: object }
    console.log('选中:', event.detail.id);
  }
  function onOpenChange(event) {
    // event.detail: { open: boolean }
    console.log('展开状态:', event.detail.open);
  }
</script>`,
          en: `<!-- Template -->
<yn-dropdown-pick
  value="en"
  value-field="id"
  button-display-field="code"
  placeholder="Language"
  @change=\${onChange}
  @open-change=\${onOpenChange}
>
  <yn-pick value="en" data-node='{"id":"en","label":"English"}'>
    <div style="padding:8px 12px;">English</div>
  </yn-pick>
  <yn-pick value="pt" data-node='{"id":"pt","label":"Português"}'>
    <div style="padding:8px 12px;">Português</div>
  </yn-pick>
</yn-dropdown-pick>

<!-- Event handlers -->
<script>
  function onChange(event) {
    // event.detail: { id: string; node: object }
    console.log('Selected:', event.detail.id);
  }
  function onOpenChange(event) {
    // event.detail: { open: boolean }
    console.log('Open state:', event.detail.open);
  }
</script>`
        },
        demoVariant: "yn-dropdown-pick-event-log"
      }
    ],
    props: [
      { name: "value", type: "string | number", default: '""', desc: { "zh-CN": "当前选中值", en: "Current value" } },
      { name: "value-field", type: "string", default: '"id"', desc: { "zh-CN": "值字段名", en: "Value field name" } },
      { name: "button-display-field", type: "string", default: '"label"', desc: { "zh-CN": "按钮展示字段", en: "Button display field" } },
      { name: "placeholder", type: "string", default: '"Select"', desc: { "zh-CN": "未选中占位", en: "Placeholder" } },
      { name: "disabled", type: "boolean", default: "false", desc: { "zh-CN": "禁用", en: "Disabled" } },
      { name: "close-on-outside-click", type: "boolean", default: "true", desc: { "zh-CN": "点外部关闭", en: "Close on outside click" } },
      { name: "show-selected-icon", type: "boolean", default: "true", desc: { "zh-CN": "选中显示勾选图标", en: "Show selected check icon" } },
      { name: "button-bg", type: "string", default: "CSS 变量", desc: { "zh-CN": "触发按钮背景色", en: "Trigger button background" } },
      { name: "button-color", type: "string", default: "CSS 变量", desc: { "zh-CN": "触发按钮文字色", en: "Trigger button color" } },
      { name: "open-button-bg", type: "string", default: "CSS 变量", desc: { "zh-CN": "展开时按钮背景", en: "Open button background" } },
      { name: "open-button-color", type: "string", default: "CSS 变量", desc: { "zh-CN": "展开时按钮文字色", en: "Open button color" } },
      { name: "panel-min-width", type: "string", default: '"132px"', desc: { "zh-CN": "面板最小宽度", en: "Panel min width" } }
    ],
    events: [
      { name: "change", detail: "{ id; node }", desc: { "zh-CN": "选中变化", en: "Selection changed" } },
      { name: "open-change", detail: "{ open: boolean }", desc: { "zh-CN": "展开变化", en: "Open state changed" } }
    ],
    slots: [
      { name: "(default)", desc: { "zh-CN": "yn-pick 列表", en: "yn-pick children" } }
    ],
    cssVars: [
      { name: "--yn-dropdown-pick-panel-bg", desc: { "zh-CN": "面板背景", en: "Panel background" } },
      { name: "--yn-dropdown-pick-panel-radius", default: "12px", desc: { "zh-CN": "面板圆角", en: "Panel radius" } },
      { name: "--yn-dropdown-pick-gap", default: "6px", desc: { "zh-CN": "选项间距", en: "Item gap" } },
      { name: "--yn-dropdown-pick-button-radius", default: "10px", desc: { "zh-CN": "按钮圆角", en: "Button radius" } },
      { name: "--yn-dropdown-pick-item-hover-bg", desc: { "zh-CN": "选项悬停背景", en: "Item hover background" } },
      { name: "--yn-dropdown-pick-item-selected-bg", desc: { "zh-CN": "选项选中背景", en: "Item selected background" } },
      { name: "--yn-dropdown-pick-check-bg", desc: { "zh-CN": "勾选图标背景", en: "Check icon background" } },
      { name: "--yn-dropdown-pick-check-color", desc: { "zh-CN": "勾选图标色", en: "Check icon color" } }
    ]
  },

  "yn-pick": {
    title: { "zh-CN": "Pick 选项", en: "Pick" },
    description: {
      "zh-CN": "单个可选项，支持自定义图标和边框动画，默认插槽可包裹任意自定义布局。",
      en: "Single option with custom icons and border animation; default slot accepts any layout."
    },
    longDescription: {
      "zh-CN": "插槽内容放入相对定位容器，选中图标固定在右上角。`selected-icon` / `unselected-icon` 自定义选中/未选中图标。`show-unselected-icon` 控制未选中时显示。`border` 控制覆盖边框动画。与 `yn-group-pick` / `yn-dropdown-pick` 组合使用。",
      en: "Slot content in relative container, selection icon top-right. Custom icons via `selected-icon`/`unselected-icon`. `show-unselected-icon` for unselected state. Border overlay animation."
    },
    usageCode: {
      "zh-CN": `<yn-pick value="nature" ?selected=\${true}>
  <div style="padding:12px 20px;background:#d5c29f;border-radius:8px;">Nature</div>
</yn-pick>`,
      en: `<yn-pick value="nature" ?selected=\${true}>
  <div style="padding:12px 20px;background:#d5c29f;border-radius:8px;">Nature</div>
</yn-pick>`
    },
    showcases: [
      {
        id: "color-card",
        title: { "zh-CN": "色块卡片", en: "Color block card" },
        description: { "zh-CN": "Storybook Default 展示。", en: "Storybook Default showcase." },
        storybookComponent: "YnPick",
        storybookStory: "Default",
        demoVariant: "yn-pick-color-card"
      },
      {
        id: "image-card",
        title: { "zh-CN": "图片卡片", en: "Image card" },
        description: { "zh-CN": "带商品图与 signpost 图标的卡片选项。", en: "Card option with product image and signpost icon." },
        storybookComponent: "YnPick",
        storybookStory: "ImageCard",
        imageUrl: FLOEMA_IMG,
        demoVariant: "yn-pick-image-card"
      }
    ],
    usageExamples: [
      {
        title: { "zh-CN": "border / selected / 图标", en: "Border, selected & icons" },
        code: {
          "zh-CN": `<yn-pick value="nature" selected border>
  <div style="background:#d5c29f;padding:12px;border-radius:8px;">Nature</div>
</yn-pick>
<yn-pick value="urban" show-unselected-icon border>...</yn-pick>
<yn-pick value="golf" ?border=\${false}>...</yn-pick>`,
          en: `<yn-pick value="nature" selected border>
  <div style="background:#d5c29f;padding:12px;border-radius:8px;">Nature</div>
</yn-pick>
<yn-pick value="urban" show-unselected-icon border>...</yn-pick>
<yn-pick value="golf" ?border=\${false}>...</yn-pick>`
        },
        demoVariant: "yn-pick-props-demo"
      },
      {
        title: { "zh-CN": "toggle 事件日志", en: "Toggle event log" },
        code: {
          "zh-CN": `<!-- 模板 -->
<yn-pick value="nature" @toggle=\${onToggle}>
  <div>Nature</div>
</yn-pick>

<!-- 事件处理 -->
<script>
  function onToggle(event) {
    // event.detail: { id: string, flag: boolean }
    console.log('选项:', event.detail.id, '选中:', event.detail.flag);
  }
</script>`,
          en: `<!-- Template -->
<yn-pick value="nature" @toggle=\${onToggle}>
  <div>Nature</div>
</yn-pick>

<!-- Event handler -->
<script>
  function onToggle(event) {
    // event.detail: { id: string, flag: boolean }
    console.log('Option:', event.detail.id, 'Selected:', event.detail.flag);
  }
</script>`
        },
        demoVariant: "yn-pick-event-log"
      }
    ],
    props: [
      { name: "value", type: "string | number", default: '""', desc: { "zh-CN": "选项 id", en: "Option id" } },
      { name: "selected", type: "boolean", default: "false", desc: { "zh-CN": "是否选中", en: "Selected" } },
      { name: "border", type: "boolean", default: "true", desc: { "zh-CN": "覆盖边框动画", en: "Border overlay" } },
      { name: "selected-icon", type: "string", default: "内置 SVG", desc: { "zh-CN": "选中图标", en: "Selected icon" } },
      { name: "unselected-icon", type: "string", default: "内置 SVG", desc: { "zh-CN": "未选中图标", en: "Unselected icon" } },
      { name: "show-unselected-icon", type: "boolean", default: "false", desc: { "zh-CN": "未选中显示图标", en: "Show icon when unselected" } }
    ],
    events: [
      { name: "toggle", detail: "{ id: string | number; flag: boolean }", desc: { "zh-CN": "点击切换", en: "Toggle click" } }
    ],
    slots: [
      { name: "(default)", desc: { "zh-CN": "任意 HTML（图片、文本、自定义布局）", en: "Any HTML (images, text, custom layouts)" } }
    ],
    cssVars: [
      { name: "--yn-pick-border-width", default: "2px", desc: { "zh-CN": "边框宽", en: "Border width" } },
      { name: "--yn-pick-border-color", desc: { "zh-CN": "边框色", en: "Border color" } },
      { name: "--yn-pick-border-radius", default: "8px", desc: { "zh-CN": "圆角", en: "Radius" } },
      { name: "--yn-pick-icon-duration", default: "220ms", desc: { "zh-CN": "图标动画时长", en: "Icon animation duration" } }
    ]
  },

  "yn-group-pick": {
    title: { "zh-CN": "Group Pick 选项组", en: "Group Pick" },
    description: {
      "zh-CN": "单选/多选容器；配合 yn-pick 实现选项组，支持组级默认图标。",
      en: "Single/multi-select container for yn-pick children with group-level icon defaults."
    },
    longDescription: {
      "zh-CN": "`multiple` 开启多选，`value` 使用数组。`selected-icon` / `unselected-icon` / `show-unselected-icon` 作为子项默认值，子项显式配置优先。`change.detail` 返回当前 ids。",
      en: "`multiple` enables multi-select, `value` is array. Group-level icon defaults; child overrides. `change.detail` returns ids."
    },
    usageCode: {
      "zh-CN": `<yn-group-pick multiple .value=\${["Urban", "Nature"]} @change=\${onChange}>
  <yn-pick value="Golf"><div style="background:#b8d28a">Golf</div></yn-pick>
  <yn-pick value="Urban"><div style="background:#ef7d53">Urban</div></yn-pick>
</yn-group-pick>`,
      en: `<yn-group-pick multiple .value=\${["Urban", "Nature"]} @change=\${onChange}>
  <yn-pick value="Golf"><div style="background:#b8d28a">Golf</div></yn-pick>
  <yn-pick value="Urban"><div style="background:#ef7d53">Urban</div></yn-pick>
</yn-group-pick>`
    },
    showcases: [
      {
        id: "category-cards",
        title: { "zh-CN": "系列分类卡片", en: "Category cards" },
        description: { "zh-CN": "四色系列可选商品图，多选回显。", en: "Four color-coded series, multi-select." },
        storybookComponent: "YnGroupPick",
        storybookStory: "Default",
        imageUrl: FLOEMA_IMG,
        demoVariant: "yn-group-pick-cards"
      },
      {
        id: "multiple",
        title: { "zh-CN": "多选模式", en: "Multiple selection" },
        description: { "zh-CN": "`multiple` 开启多选。", en: "`multiple` enables multi-select." },
        storybookComponent: "YnGroupPick",
        storybookStory: "Multiple",
        demoVariant: "yn-group-pick-multiple"
      }
    ],
    usageExamples: [
      {
        title: { "zh-CN": "单选 / 多选", en: "Single / multiple" },
        code: {
          "zh-CN": `<yn-group-pick>
  <yn-pick value="Golf">Golf</yn-pick>
  <yn-pick value="Urban">Urban</yn-pick>
</yn-group-pick>

<yn-group-pick multiple .value=\${["Urban", "Nature"]}>
  ...
</yn-group-pick>`,
          en: `<yn-group-pick>
  <yn-pick value="Golf">Golf</yn-pick>
  <yn-pick value="Urban">Urban</yn-pick>
</yn-group-pick>

<yn-group-pick multiple .value=\${["Urban", "Nature"]}>
  ...
</yn-group-pick>`
        },
        demoVariant: "yn-group-pick-props-demo"
      },
      {
        title: { "zh-CN": "change 事件日志", en: "Change event log" },
        code: {
          "zh-CN": `<!-- 模板 -->
<yn-group-pick @change=\${onChange}>
  <yn-pick value="Golf">Golf</yn-pick>
  <yn-pick value="Urban">Urban</yn-pick>
</yn-group-pick>

<!-- 事件处理 -->
<script>
  function onChange(event) {
    // event.detail: { ids: string[], flag: boolean }
    console.log('选中项:', event.detail.ids, '选中:', event.detail.flag);
  }
</script>`,
          en: `<!-- Template -->
<yn-group-pick @change=\${onChange}>
  <yn-pick value="Golf">Golf</yn-pick>
  <yn-pick value="Urban">Urban</yn-pick>
</yn-group-pick>

<!-- Event handler -->
<script>
  function onChange(event) {
    // event.detail: { ids: string[], flag: boolean }
    console.log('Selected:', event.detail.ids, 'Flag:', event.detail.flag);
  }
</script>`
        },
        demoVariant: "yn-group-pick-event-log"
      }
    ],
    props: [
      { name: "value", type: "string | number | array", default: '""', desc: { "zh-CN": "选中回显", en: "Selected values" } },
      { name: "multiple", type: "boolean", default: "false", desc: { "zh-CN": "多选", en: "Multiple" } },
      { name: "selected-icon", type: "string", default: "内置 SVG", desc: { "zh-CN": "组级选中图标", en: "Group selected icon" } },
      { name: "unselected-icon", type: "string", default: '""', desc: { "zh-CN": "组级未选中图标", en: "Group unselected icon" } },
      { name: "show-unselected-icon", type: "boolean", default: "false", desc: { "zh-CN": "组级未选中显示图标", en: "Group show unselected icon" } }
    ],
    events: [
      { name: "change", detail: "{ ids: array; flag: boolean }", desc: { "zh-CN": "子项点击", en: "Child clicked" } }
    ],
    slots: [
      { name: "(default)", desc: { "zh-CN": "yn-pick 子项列表", en: "yn-pick children" } }
    ],
    cssVars: [
      { name: "--yn-group-pick-gap", default: "12px", desc: { "zh-CN": "选项间距", en: "Item gap" } }
    ],
    notes: [
      { "zh-CN": "子 yn-pick 的图标属性优先于组级默认值。", en: "Child yn-pick icon props override group defaults." }
    ]
  },

  "yn-drawer": {
    title: { "zh-CN": "Drawer 抽屉", en: "Drawer" },
    description: {
      "zh-CN": "抽屉/Sheet 弹层，支持右侧和底部弹出，含完整生命周期事件。",
      en: "Drawer/sheet overlay with right/bottom placement and lifecycle events."
    },
    longDescription: {
      "zh-CN": "支持三种 `placement`：`auto`（自动判断）、`right`（桌面端右侧抽屉）、`bottom`（移动端底部 Sheet）。`width` 控制抽屉宽度，`sheet-height` 控制底部高度。`close-on-backdrop` 控制背景点击关闭。完整的生命周期事件：`before-open` / `after-open` / `before-close` / `after-close`。提供 `show()` / `close()` / `toggle()` 方法。",
      en: "Three placement modes: auto, right (desktop drawer), bottom (mobile sheet). Full lifecycle events: before-open, after-open, before-close, after-close. Programmatic show/close/toggle methods."
    },
    usageCode: {
      "zh-CN": `<yn-drawer @open-change=\${onOpenChange}>\n  <yn-button slot="trigger">打开</yn-button>\n  <div slot="content">抽屉内容</div>\n</yn-drawer>`,
      en: `<yn-drawer @open-change=\${onOpenChange}>\n  <yn-button slot="trigger">Open</yn-button>\n  <div slot="content">Drawer content</div>\n</yn-drawer>`
    },
    showcases: [
      {
        id: "cart",
        title: { "zh-CN": "购物车抽屉", en: "Cart drawer" },
        description: { "zh-CN": "trigger / header / header-actions / content 插槽组合。", en: "trigger, header, header-actions, and content slots." },
        storybookComponent: "YnDrawer",
        storybookStory: "CartDrawer",
        demoVariant: "yn-drawer-cart"
      },
      {
        id: "backdrop-extra",
        title: { "zh-CN": "遮罩扩展推荐位", en: "Backdrop extra" },
        description: { "zh-CN": "宽屏右侧抽屉 + `backdrop-extra` 插槽。", en: "Wide right drawer with `backdrop-extra` slot." },
        storybookComponent: "YnDrawer",
        storybookStory: "CartDrawerDesktop",
        demoVariant: "yn-drawer-desktop"
      }
    ],
    usageExamples: [
      {
        title: { "zh-CN": "完整插槽组合", en: "Full slot composition" },
        code: {
          "zh-CN": `<yn-drawer placement="auto" sheet-height="auto" width="420" @open-change=\${onOpenChange}>
  <yn-button slot="trigger" variant="default" drawer-payload='{"scene":"cart"}'>购物车</yn-button>
  <span slot="header">Your bag</span>
  <div slot="header-actions"><!-- 头部操作 --></div>
  <div slot="content">Drawer content</div>
  <div slot="footer">Footer actions</div>
</yn-drawer>`,
          en: `<yn-drawer placement="auto" sheet-height="auto" width="420" @open-change=\${onOpenChange}>
  <yn-button slot="trigger" variant="default" drawer-payload='{"scene":"cart"}'>Cart</yn-button>
  <span slot="header">Your bag</span>
  <div slot="header-actions"><!-- header actions --></div>
  <div slot="content">Drawer content</div>
  <div slot="footer">Footer actions</div>
</yn-drawer>`
        },
        demoVariant: "yn-drawer-slots"
      },
      {
        title: { "zh-CN": "开关变化事件", en: "Open-change event" },
        code: {
          "zh-CN": `<!-- 模板 -->
<yn-drawer placement="auto" sheet-height="auto" width="420" @open-change=\${onOpenChange}>
  <yn-button slot="trigger" variant="default">购物车</yn-button>
  <span slot="header">Your bag</span>
  <div slot="content">Drawer content</div>
</yn-drawer>

<!-- 事件处理 -->
<script>
  function onOpenChange(event) {
    // event.detail: { open: boolean; source: string; payload?: any }
    console.log('抽屉状态:', event.detail.open ? '打开' : '关闭', '来源:', event.detail.source);
  }
</script>`,
          en: `<!-- Template -->
<yn-drawer placement="auto" sheet-height="auto" width="420" @open-change=\${onOpenChange}>
  <yn-button slot="trigger" variant="default">Cart</yn-button>
  <span slot="header">Your bag</span>
  <div slot="content">Drawer content</div>
</yn-drawer>

<!-- Event handler -->
<script>
  function onOpenChange(event) {
    // event.detail: { open: boolean; source: string; payload?: any }
    console.log('Drawer state:', event.detail.open ? 'open' : 'closed', 'Source:', event.detail.source);
  }
</script>`
        },
        demoVariant: "yn-drawer-event-log"
      }
    ],
    props: [
      { name: "open", type: "boolean", default: "false", desc: { "zh-CN": "受控展开", en: "Controlled open" } },
      { name: "width", type: "number | string", default: "380", desc: { "zh-CN": "抽屉宽度 px", en: "Drawer width px" } },
      { name: "title", type: "string", default: '""', desc: { "zh-CN": "标题文案", en: "Title text" } },
      { name: "close-on-backdrop", type: "boolean", default: "true", desc: { "zh-CN": "点背景关闭", en: "Close on backdrop" } },
      { name: "placement", type: "auto | right | bottom", default: "auto", desc: { "zh-CN": "弹出位置", en: "Placement" } },
      { name: "sheet-height", type: "number | string", default: "80vh", desc: { "zh-CN": "底部 Sheet 高度", en: "Sheet height" } }
    ],
    events: [
      { name: "open-change", detail: "{ open: boolean }", desc: { "zh-CN": "开关变化", en: "Open state changed" } },
      { name: "before-open", detail: "void", desc: { "zh-CN": "展开前触发", en: "Before open" } },
      { name: "before-close", detail: "void", desc: { "zh-CN": "关闭前触发", en: "Before close" } },
      { name: "after-open", detail: "void", desc: { "zh-CN": "展开后触发", en: "After open" } },
      { name: "after-close", detail: "void", desc: { "zh-CN": "关闭后触发", en: "After close" } }
    ],
    slots: [
      { name: "trigger", desc: { "zh-CN": "触发器内容", en: "Trigger content" } },
      { name: "header", desc: { "zh-CN": "自定义头部", en: "Custom header" } },
      { name: "header-actions", desc: { "zh-CN": "头部操作区", en: "Header actions" } },
      { name: "content", desc: { "zh-CN": "抽屉主体内容", en: "Drawer body" } },
      { name: "footer", desc: { "zh-CN": "底部内容", en: "Footer content" } },
      { name: "backdrop-extra", desc: { "zh-CN": "背景额外内容", en: "Backdrop extra content" } }
    ],
    cssVars: [
      { name: "--yn-drawer-width", default: "380px", desc: { "zh-CN": "抽屉宽度", en: "Drawer width" } },
      { name: "--yn-drawer-sheet-height", default: "80vh", desc: { "zh-CN": "Sheet 高度", en: "Sheet height" } },
      { name: "--yn-drawer-open-duration", default: "320ms", desc: { "zh-CN": "展开动画时长", en: "Open duration" } },
      { name: "--yn-drawer-close-duration", default: "260ms", desc: { "zh-CN": "关闭动画时长", en: "Close duration" } }
    ],
    methods: [
      { name: "close", signature: "close(payload?): void", desc: { "zh-CN": "关闭抽屉", en: "Close the drawer" } },
      { name: "show", signature: "show(payload?): void", desc: { "zh-CN": "展开抽屉", en: "Open the drawer" } },
      { name: "toggle", signature: "toggle(payload?): void", desc: { "zh-CN": "切换开关", en: "Toggle open state" } }
    ]
  },

  "yn-toast": {
    title: { "zh-CN": "Toast 轻提示", en: "Toast" },
    description: {
      "zh-CN": "胶囊式轻提示，支持 loading → success 双阶段动画，可编程调用。",
      en: "Capsule toast with loading → success two-phase animation, programmable API."
    },
    longDescription: {
      "zh-CN": "支持 4 种 `type`：success / info / warning / error。`duration` 控制显示时长，`loading-duration` 控制 loading 阶段时长。`persist` 为 true 时不会自动关闭。通过静态方法 `YnToast.success()` / `info()` / `warning()` / `error()` 可编程调用，返回 controller 支持 `.done()` / `.hide()`。支持向上滑动手势关闭。",
      en: "Four types: success, info, warning, error. Duration and loading-duration control timing. persist keeps toast visible. Static API: YnToast.success/info/warning/error with controller.done()/hide(). Swipe-to-dismiss."
    },
    usageCode: {
      "zh-CN": `<yn-toast type="success" message="保存成功"></yn-toast>\n\n<!-- 编程调用 -->\n<yn-button @click=\${() => YnToast.success('操作完成')}>点击</yn-button>`,
      en: `<yn-toast type="success" message="Saved"></yn-toast>\n\n<!-- Programmatic -->\n<yn-button @click=\${() => YnToast.success('Done')}>Click</yn-button>`
    },
    showcases: [
      {
        id: "api",
        title: { "zh-CN": "四种状态", en: "Four states" },
        description: { "zh-CN": "点击 success/info/warning/error 查看形变动画。", en: "Click buttons to preview morph animation." },
        storybookComponent: "YnToast",
        storybookStory: "ApiUsage",
        demoVariant: "yn-toast-api"
      }
    ],
    usageExamples: [
      {
        title: { "zh-CN": "type / message / 编程 API", en: "Type, message & programmatic API" },
        code: {
          "zh-CN": `<yn-toast type="success" message="success!"></yn-toast>

<yn-button @click=\${() => YnToast.success('保存成功')}>Success</yn-button>
<yn-button @click=\${() => YnToast.info('提示')}>Info</yn-button>
<yn-button @click=\${() => YnToast.warning('警告')}>Warning</yn-button>
<yn-button @click=\${() => YnToast.error('错误')}>Error</yn-button>`,
          en: `<yn-toast type="success" message="success!"></yn-toast>

<yn-button @click=\${() => YnToast.success('Saved')}>Success</yn-button>
<yn-button @click=\${() => YnToast.info('Info')}>Info</yn-button>
<yn-button @click=\${() => YnToast.warning('Warning')}>Warning</yn-button>
<yn-button @click=\${() => YnToast.error('Error')}>Error</yn-button>`
        },
        demoVariant: "yn-toast-props-demo"
      },
      {
        title: { "zh-CN": "show / close 事件", en: "Show & close events" },
        code: {
          "zh-CN": `<!-- 模板 -->
<yn-button variant="primary" @click=\${showToast}>触发 Toast</yn-button>

<!-- 事件处理 -->
<script>
  function showToast() {
    // 通过静态方法调用
    YnToast.success('保存成功');
    YnToast.info('提示信息');
    YnToast.warning('警告信息');
    YnToast.error('错误信息');
  }
</script>`,
          en: `<!-- Template -->
<yn-button variant="primary" @click=\${showToast}>Trigger Toast</yn-button>

<!-- Event handler -->
<script>
  function showToast() {
    // Call via static methods
    YnToast.success('Saved successfully');
    YnToast.info('Info message');
    YnToast.warning('Warning!');
    YnToast.error('Error!');
  }
</script>`
        },
        demoVariant: "yn-toast-event-log"
      }
    ],
    props: [
      { name: "type", type: "success | info | warning | error", default: "success", desc: { "zh-CN": "提示类型", en: "Toast type" } },
      { name: "message", type: "string", default: '""', desc: { "zh-CN": "提示文案", en: "Message text" } },
      { name: "duration", type: "number", default: "2600", desc: { "zh-CN": "显示时长 ms", en: "Display duration ms" } },
      { name: "loading-duration", type: "number", default: "1400", desc: { "zh-CN": "loading 阶段时长 ms", en: "Loading phase duration ms" } },
      { name: "persist", type: "boolean", default: "false", desc: { "zh-CN": "持续显示不自动关闭", en: "Persist, no auto-close" } }
    ],
    events: [
      { name: "show", detail: "YnToastDetail", desc: { "zh-CN": "显示时触发", en: "Shown" } },
      { name: "close", detail: "YnToastDetail", desc: { "zh-CN": "关闭时触发", en: "Closed" } }
    ],
    slots: [],
    cssVars: [
      { name: "--yn-toast-height", default: "36px", desc: { "zh-CN": "胶囊高度", en: "Pill height" } },
      { name: "--yn-toast-ball-size", default: "32px", desc: { "zh-CN": "图标球尺寸", en: "Icon ball size" } },
      { name: "--yn-toast-bg", desc: { "zh-CN": "胶囊背景", en: "Pill background" } },
      { name: "--yn-toast-text-color", desc: { "zh-CN": "文本色", en: "Text color" } },
      { name: "--yn-toast-success-color", desc: { "zh-CN": "success 色", en: "Success color" } },
      { name: "--yn-toast-info-color", desc: { "zh-CN": "info 色", en: "Info color" } },
      { name: "--yn-toast-warning-color", desc: { "zh-CN": "warning 色", en: "Warning color" } },
      { name: "--yn-toast-error-color", desc: { "zh-CN": "error 色", en: "Error color" } },
      { name: "--yn-toast-paper-color", desc: { "zh-CN": "纸色（对勾）", en: "Paper color (checkmark)" } },
      { name: "--yn-toast-max-width", default: "90vw", desc: { "zh-CN": "最大宽度", en: "Max width" } },
      { name: "--yn-toast-top", default: "26px", desc: { "zh-CN": "距顶部距离", en: "Distance from top" } },
      { name: "--yn-toast-z-index", default: "1600", desc: { "zh-CN": "层级", en: "Z-index" } },
      { name: "--yn-toast-ease", desc: { "zh-CN": "缓动曲线", en: "Easing curve" } },
      { name: "--yn-toast-mask-bg", desc: { "zh-CN": "遮罩背景", en: "Mask background" } },
      { name: "--yn-toast-shadow", desc: { "zh-CN": "阴影", en: "Shadow" } }
    ],
    methods: [
      { name: "YnToast.success", signature: "YnToast.success(msg?, opts?): YnToastShortcutController", desc: { "zh-CN": "显示 success toast", en: "Show success toast" } },
      { name: "YnToast.info", signature: "YnToast.info(msg?, opts?): YnToastShortcutController", desc: { "zh-CN": "显示 info toast", en: "Show info toast" } },
      { name: "YnToast.warning", signature: "YnToast.warning(msg?, opts?): YnToastShortcutController", desc: { "zh-CN": "显示 warning toast", en: "Show warning toast" } },
      { name: "YnToast.error", signature: "YnToast.error(msg?, opts?): YnToastShortcutController", desc: { "zh-CN": "显示 error toast", en: "Show error toast" } },
      { name: "YnToast.show", signature: "YnToast.show(opts?): YnToastController", desc: { "zh-CN": "通用显示方法", en: "General show method" } },
      { name: "done", signature: "done(type?, msg?, opts?): void", desc: { "zh-CN": "结束 loading 并切换类型", en: "End loading and switch type" } },
      { name: "hide", signature: "hide(): void", desc: { "zh-CN": "隐藏 toast", en: "Hide toast" } }
    ]
  },

  "yn-cookie-notice": {
    title: { "zh-CN": "Cookie Notice 同意横幅", en: "Cookie Notice" },
    description: {
      "zh-CN": "GDPR Cookie 同意横幅，支持三类偏好设置与自动/手动弹出。",
      en: "GDPR cookie consent banner with three preference categories and auto/manual display."
    },
    longDescription: {
      "zh-CN": "三类 Cookie 偏好：functional / analytics / marketing，necessary 恒开启。`auto-show` / `auto-show-delay` 控制自动弹出时机。`storage-key` 写入 document.cookie 保存同意记录。提供 `show()` / `hide()` / `openSettings()` / `resetConsent()` / `getPreferences()` / `setPreferences()` 方法。`preference-change` 事件携带完整偏好和触发来源。",
      en: "Three cookie categories: functional, analytics, marketing. necessary always true. Auto-show with delay. Storage via document.cookie. Methods: show, hide, openSettings, resetConsent, getPreferences, setPreferences. preference-change event with full prefs and source."
    },
    usageCode: {
      "zh-CN": `<yn-cookie-notice storage-key="consent_v1" auto-show auto-show-delay="1000"\n  @preference-change=\${onPrefChange}></yn-cookie-notice>`,
      en: `<yn-cookie-notice storage-key="consent_v1" auto-show auto-show-delay="1000"\n  @preference-change=\${onPrefChange}></yn-cookie-notice>`
    },
    showcases: [
      {
        id: "default",
        title: { "zh-CN": "自动弹出", en: "Auto show" },
        description: { "zh-CN": "无同意记录时自动弹出横幅。", en: "Auto-shows banner when no consent record." },
        storybookComponent: "YnCookieNotice",
        storybookStory: "Default",
        demoVariant: "yn-cookie-notice-default"
      },
      {
        id: "settings",
        title: { "zh-CN": "偏好设置", en: "Settings panel" },
        description: { "zh-CN": "展开偏好设置面板，勾选分类。", en: "Expanded settings with checkboxes." },
        storybookComponent: "YnCookieNotice",
        storybookStory: "WithSettings",
        demoVariant: "yn-cookie-notice-settings"
      }
    ],
    usageExamples: [
      {
        title: { "zh-CN": "auto-show / visible / 偏好默认值", en: "Auto-show, visible & defaults" },
        code: {
          "zh-CN": `<yn-cookie-notice storage-key="consent_v1" auto-show auto-show-delay="1000"></yn-cookie-notice>

<yn-cookie-notice storage-key="consent_v1" visible default-functional default-analytics></yn-cookie-notice>`,
          en: `<yn-cookie-notice storage-key="consent_v1" auto-show auto-show-delay="1000"></yn-cookie-notice>

<yn-cookie-notice storage-key="consent_v1" visible default-functional default-analytics></yn-cookie-notice>`
        },
        demoVariant: "yn-cookie-notice-props-demo"
      },
      {
        title: { "zh-CN": "偏好变化事件", en: "Preference change event" },
        code: {
          "zh-CN": `<!-- 模板 -->
<yn-cookie-notice
  storage-key="consent_v1"
  auto-show
  auto-show-delay="1000"
  @preference-change=\${onPreferenceChange}
></yn-cookie-notice>

<!-- 事件处理 -->
<script>
  function onPreferenceChange(event) {
    // event.detail: { functional: boolean, analytics: boolean, marketing: boolean, source: string }
    console.log('偏好设置变化:', event.detail);
  }
</script>`,
          en: `<!-- Template -->
<yn-cookie-notice
  storage-key="consent_v1"
  auto-show
  auto-show-delay="1000"
  @preference-change=\${onPreferenceChange}
></yn-cookie-notice>

<!-- Event handler -->
<script>
  function onPreferenceChange(event) {
    // event.detail: { functional, analytics, marketing, source }
    console.log('Preferences changed:', event.detail);
  }
</script>`
        },
        demoVariant: "yn-cookie-notice-event-log"
      }
    ],
    props: [
      { name: "storage-key", type: "string", default: '"cookie_consent_v1"', desc: { "zh-CN": "cookie 键名", en: "Cookie key name" } },
      { name: "auto-show-delay", type: "number", default: "800", desc: { "zh-CN": "自动弹出延迟 ms", en: "Auto-show delay ms" } },
      { name: "visible", type: "boolean", default: "false", desc: { "zh-CN": "受控显示状态", en: "Controlled visibility" } },
      { name: "auto-show", type: "boolean", default: "true", desc: { "zh-CN": "无记录时自动弹出", en: "Auto-show when no consent" } },
      { name: "max-age", type: "number", default: "31536000", desc: { "zh-CN": "cookie 有效期秒", en: "Cookie max-age seconds" } },
      { name: "default-functional", type: "boolean", default: "false", desc: { "zh-CN": "functional 默认值", en: "Functional default" } },
      { name: "default-analytics", type: "boolean", default: "false", desc: { "zh-CN": "analytics 默认值", en: "Analytics default" } },
      { name: "default-marketing", type: "boolean", default: "true", desc: { "zh-CN": "marketing 默认值", en: "Marketing default" } },
      { name: "title", type: "string", default: '"We use cookies..."', desc: { "zh-CN": "横幅标题", en: "Banner title" } },
      { name: "policy-line-1", type: "string", default: '"By continuing, you"', desc: { "zh-CN": "政策第 1 行", en: "Policy line 1" } },
      { name: "policy-line-2", type: "string", default: '"cookie policy."', desc: { "zh-CN": "政策第 2 行", en: "Policy line 2" } }
    ],
    events: [
      { name: "preference-change", detail: "YnCookieNoticePreferenceChangeDetail", desc: { "zh-CN": "偏好变化（含 source）", en: "Preference changed (with source)" } }
    ],
    slots: [
      { name: "title", desc: { "zh-CN": "自定义标题", en: "Custom title" } },
      { name: "policy", desc: { "zh-CN": "自定义政策文案", en: "Custom policy text" } }
    ],
    cssVars: [],
    methods: [
      { name: "show", signature: "show(): void", desc: { "zh-CN": "手动显示横幅", en: "Show banner manually" } },
      { name: "hide", signature: "hide(): void", desc: { "zh-CN": "隐藏横幅", en: "Hide banner" } },
      { name: "openSettings", signature: "openSettings(): void", desc: { "zh-CN": "展开偏好设置面板", en: "Open settings panel" } },
      { name: "resetConsent", signature: "resetConsent(): void", desc: { "zh-CN": "清除记录重新弹出", en: "Clear consent and re-show" } },
      { name: "getPreferences", signature: "getPreferences(): YnCookieNoticePreferences", desc: { "zh-CN": "获取当前偏好", en: "Get current preferences" } },
      { name: "setPreferences", signature: "setPreferences(prefs): void", desc: { "zh-CN": "同步偏好到表单", en: "Sync prefs to form" } }
    ]
  },

  "yn-pull-cord-switch": {
    title: { "zh-CN": "Pull Cord Switch 拉绳开关", en: "Pull Cord Switch" },
    description: {
      "zh-CN": "物理拉绳开关，向下拖拽切换开/关，支持 fixed 固定定位与 floema 日光主题。",
      en: "Physical pull-cord switch with drag-to-toggle, fixed positioning, and floema theme."
    },
    longDescription: {
      "zh-CN": "基于 Canvas 的物理模拟拉绳开关。`checked` 控制开关状态。`variant` 支持 `default`（夜色）和 `floema`（日光）主题。`size` 三种规格（mini / small / medium）。`fixed` 模式固定在视口，`fixed-x` / `top` 控制位置。`glow-up` 启用向上光晕。`rope-length` 控制绳长。支持 `activated` 插槽区分开/关态。",
      en: "Canvas-based physics pull-cord switch. checked state. default/floema themes. three sizes. fixed mode with viewport positioning. glow-up for upward glow. rope-length control. activated slot for on/off states."
    },
    usageCode: {
      "zh-CN": `<yn-pull-cord-switch @change=\${onToggle}></yn-pull-cord-switch>\n<yn-pull-cord-switch variant="floema" size="small" glow-up>\n  <yn-button>OFF</yn-button>\n  <yn-button slot="activated">ON</yn-button>\n</yn-pull-cord-switch>`,
      en: `<yn-pull-cord-switch @change=\${onToggle}></yn-pull-cord-switch>\n<yn-pull-cord-switch variant="floema" size="small" glow-up>\n  <yn-button>OFF</yn-button>\n  <yn-button slot="activated">ON</yn-button>\n</yn-pull-cord-switch>`
    },
    showcases: [
      {
        id: "slots",
        title: { "zh-CN": "双插槽绳端", en: "Dual slot cord ends" },
        description: { "zh-CN": "拖拽绳端切换；default / activated 不同按钮。", en: "Drag cord; swap buttons via slots." },
        storybookComponent: "YnPullCordSwitch",
        storybookStory: "Slots",
        demoVariant: "yn-pull-cord-slots"
      },
      {
        id: "sizes",
        title: { "zh-CN": "三种尺寸", en: "Three sizes" },
        description: { "zh-CN": "mini / small / medium，绳长相同。", en: "mini, small, medium at same rope length." },
        storybookComponent: "YnPullCordSwitch",
        storybookStory: "Sizes",
        demoVariant: "yn-pull-cord-sizes"
      },
      {
        id: "fixed-header",
        title: { "zh-CN": "Header 主题绳", en: "Fixed header theme cord" },
        description: { "zh-CN": "fixed + rope-pass-through：不挡 Header 搜索。", en: "fixed + rope-pass-through for header theme toggle." },
        storybookComponent: "YnPullCordSwitch",
        storybookStory: "FixedStorefrontHeader",
        demoVariant: "yn-pull-cord-fixed-header"
      }
    ],
    usageExamples: [
      {
        title: { "zh-CN": "插槽 / size / rope-length", en: "Slots, size & rope-length" },
        code: {
          "zh-CN": `<yn-pull-cord-switch rope-length="260" variant="default">
  <yn-button size="mini" variant="neutral">夜间</yn-button>
  <yn-button slot="activated" size="mini" variant="success">日间</yn-button>
</yn-pull-cord-switch>

<yn-pull-cord-switch size="mini" rope-length="260">...</yn-pull-cord-switch>
<yn-pull-cord-switch size="small" rope-length="260">...</yn-pull-cord-switch>
<yn-pull-cord-switch size="medium" rope-length="260">...</yn-pull-cord-switch>`,
          en: `<yn-pull-cord-switch rope-length="260" variant="default">
  <yn-button size="mini" variant="neutral">Night</yn-button>
  <yn-button slot="activated" size="mini" variant="success">Day</yn-button>
</yn-pull-cord-switch>

<yn-pull-cord-switch size="mini" rope-length="260">...</yn-pull-cord-switch>
<yn-pull-cord-switch size="small" rope-length="260">...</yn-pull-cord-switch>
<yn-pull-cord-switch size="medium" rope-length="260">...</yn-pull-cord-switch>`
        },
        demoVariant: "yn-pull-cord-props-demo"
      },
      {
        title: { "zh-CN": "开关变化事件", en: "Change event" },
        code: {
          "zh-CN": `<!-- 模板 -->
<yn-pull-cord-switch rope-length="260" variant="default" @change=\${onChange}>
  <yn-button size="mini" variant="neutral">夜间</yn-button>
  <yn-button slot="activated" size="mini" variant="success">日间</yn-button>
</yn-pull-cord-switch>

<!-- 事件处理 -->
<script>
  function onChange(event) {
    // event.detail: { checked: boolean }
    console.log('开关状态:', event.detail.checked ? '开启' : '关闭');
  }
</script>`,
          en: `<!-- Template -->
<yn-pull-cord-switch rope-length="260" variant="default" @change=\${onChange}>
  <yn-button size="mini" variant="neutral">Night</yn-button>
  <yn-button slot="activated" size="mini" variant="success">Day</yn-button>
</yn-pull-cord-switch>

<!-- Event handler -->
<script>
  function onChange(event) {
    // event.detail: { checked: boolean }
    console.log('Switch state:', event.detail.checked ? 'on' : 'off');
  }
</script>`
        },
        demoVariant: "yn-pull-cord-event-log"
      }
    ],
    props: [
      { name: "checked", type: "boolean", default: "false", desc: { "zh-CN": "开关状态", en: "Checked state" } },
      { name: "glow-up", type: "boolean", default: "false", desc: { "zh-CN": "向上光晕扩散", en: "Upward glow spread" } },
      { name: "disabled", type: "boolean", default: "false", desc: { "zh-CN": "禁用交互", en: "Disabled" } },
      { name: "fixed", type: "boolean", default: "false", desc: { "zh-CN": "固定定位模式", en: "Fixed positioning mode" } },
      { name: "reverse", type: "boolean", default: "false", desc: { "zh-CN": "镜像方向", en: "Mirror direction" } },
      { name: "variant", type: "default | floema", default: "default", desc: { "zh-CN": "主题风格", en: "Theme variant" } },
      { name: "size", type: "mini | small | medium", default: "mini", desc: { "zh-CN": "尺寸", en: "Size" } },
      { name: "rope-length", type: "number", default: "内置默认", desc: { "zh-CN": "绳子长度 px", en: "Rope length px" } },
      { name: "fixed-x", type: "number", default: "居中", desc: { "zh-CN": "fixed 模式水平位置", en: "Fixed horizontal position" } },
      { name: "top", type: "number", default: "—", desc: { "zh-CN": "fixed 模式垂直偏移", en: "Fixed vertical offset" } },
      { name: "toggle-threshold", type: "number", default: "52", desc: { "zh-CN": "切换阈值 px", en: "Toggle threshold px" } },
      { name: "card-offset", type: "number", default: "随 rope-length 缩放", desc: { "zh-CN": "绳端卡片间距", en: "Card offset from rope end" } },
      { name: "z-index", type: "number", default: "1", desc: { "zh-CN": "层级", en: "Z-index" } },
      { name: "rope-pass-through", type: "boolean", default: "false", desc: { "zh-CN": "绳身穿透指针事件", en: "Rope canvas pointer pass-through" } }
    ],
    events: [
      { name: "change", detail: "{ checked: boolean }", desc: { "zh-CN": "开关变化", en: "Checked state changed" } },
      { name: "fixed-move", detail: "{ x: number; reverse: boolean }", desc: { "zh-CN": "fixed 模式拖拽结束", en: "Fixed mode drag end" } }
    ],
    slots: [
      { name: "(default)", desc: { "zh-CN": "关闭态绳端内容（如 yn-button）", en: "Off-state cord end content" } },
      { name: "activated", desc: { "zh-CN": "开启态绳端内容", en: "On-state cord end content" } }
    ],
    cssVars: [
      { name: "--yn-pull-cord-switch-height", default: "260px", desc: { "zh-CN": "组件高度", en: "Component height" } },
      { name: "--yn-pull-cord-switch-card-width", desc: { "zh-CN": "卡片宽度", en: "Card width" } },
      { name: "--yn-pull-cord-switch-card-height", desc: { "zh-CN": "卡片高度", en: "Card height" } },
      { name: "--yn-pull-cord-switch-card-radius", desc: { "zh-CN": "卡片圆角", en: "Card radius" } },
      { name: "--yn-pull-cord-switch-card-bg", desc: { "zh-CN": "卡片背景", en: "Card background" } },
      { name: "--yn-pull-cord-switch-card-border", desc: { "zh-CN": "卡片边框", en: "Card border" } },
      { name: "--yn-pull-cord-switch-card-color", desc: { "zh-CN": "卡片文字色", en: "Card text color" } },
      { name: "--yn-pull-cord-switch-card-shadow", desc: { "zh-CN": "卡片阴影", en: "Card shadow" } },
      { name: "--yn-pull-cord-switch-card-bg-on", desc: { "zh-CN": "开启态卡片背景", en: "On-state card background" } },
      { name: "--yn-pull-cord-switch-card-border-on", desc: { "zh-CN": "开启态卡片边框", en: "On-state card border" } },
      { name: "--yn-pull-cord-switch-card-color-on", desc: { "zh-CN": "开启态文字色", en: "On-state text color" } },
      { name: "--yn-pull-cord-switch-accent", desc: { "zh-CN": "强调色（光晕）", en: "Accent color (glow)" } },
      { name: "--yn-pull-cord-switch-rope-start", desc: { "zh-CN": "绳子起始色", en: "Rope start color" } },
      { name: "--yn-pull-cord-switch-rope-end", desc: { "zh-CN": "绳子结束色", en: "Rope end color" } },
      { name: "--yn-pull-cord-switch-z-index", default: "1", desc: { "zh-CN": "层级", en: "Z-index" } }
    ]
  },

  "yn-quantity": {
    title: { "zh-CN": "Quantity 数量选择器", en: "Quantity" },
    description: {
      "zh-CN": "Floema 风格胶囊数量选择器，带细线描边与衬线数字。",
      en: "Floema-style capsule quantity stepper with fine borders and serif numerals."
    },
    longDescription: {
      "zh-CN": "胶囊容器包裹减号 / 数字 / 加号。`value` 当前数量受控，`min` / `max` / `step` 控制范围和步进。`disabled` 禁用交互。达到上下限时对应按钮自动禁用。支持 DSD SSR。",
      en: "Capsule container with minus / number / plus. Controlled value with min/max/step. Auto-disable buttons at bounds. DSD SSR support."
    },
    usageCode: {
      "zh-CN": `<yn-quantity .value=\${1} min=\${1} max=\${99} @change=\${onChange}></yn-quantity>`,
      en: `<yn-quantity .value=\${1} min=\${1} max=\${99} @change=\${onChange}></yn-quantity>`
    },
    showcases: [
      {
        id: "product",
        title: { "zh-CN": "商品详情场景", en: "Product detail" },
        description: { "zh-CN": "Storybook ProductDemo 布局。", en: "Storybook ProductDemo layout." },
        storybookComponent: "YnQuantity",
        storybookStory: "ProductDemo",
        demoVariant: "yn-quantity-product"
      }
    ],
    usageExamples: [
      {
        title: { "zh-CN": "min / max / step / disabled", en: "Min, max, step & disabled" },
        code: {
          "zh-CN": `<yn-quantity value="1" min="1" max="99"></yn-quantity>
<yn-quantity value="5" min="1" max="5"></yn-quantity>
<yn-quantity value="2" min="2" max="10" step="2"></yn-quantity>
<yn-quantity value="3" disabled></yn-quantity>`,
          en: `<yn-quantity value="1" min="1" max="99"></yn-quantity>
<yn-quantity value="5" min="1" max="5"></yn-quantity>
<yn-quantity value="2" min="2" max="10" step="2"></yn-quantity>
<yn-quantity value="3" disabled></yn-quantity>`
        },
        demoVariant: "yn-quantity-props-demo"
      },
      {
        title: { "zh-CN": "数量变化事件", en: "Change event" },
        code: {
          "zh-CN": `<!-- 模板 -->
<yn-quantity value="1" min="1" max="99" @change=\${onChange}></yn-quantity>

<!-- 事件处理 -->
<script>
  function onChange(event) {
    // event.detail: { value: number }
    console.log('数量变化:', event.detail.value);
  }
</script>`,
          en: `<!-- Template -->
<yn-quantity value="1" min="1" max="99" @change=\${onChange}></yn-quantity>

<!-- Event handler -->
<script>
  function onChange(event) {
    // event.detail: { value: number }
    console.log('Quantity changed:', event.detail.value);
  }
</script>`
        },
        demoVariant: "yn-quantity-event-log"
      }
    ],
    props: [
      { name: "value", type: "number", default: "1", desc: { "zh-CN": "当前数量", en: "Current value" } },
      { name: "min", type: "number", default: "1", desc: { "zh-CN": "最小值", en: "Minimum value" } },
      { name: "max", type: "number", default: "99", desc: { "zh-CN": "最大值", en: "Maximum value" } },
      { name: "step", type: "number", default: "1", desc: { "zh-CN": "步进值", en: "Step increment" } },
      { name: "disabled", type: "boolean", default: "false", desc: { "zh-CN": "禁用交互", en: "Disabled" } }
    ],
    events: [
      { name: "change", detail: "{ value: number }", desc: { "zh-CN": "数量变化", en: "Value changed" } }
    ],
    slots: [],
    cssVars: []
  },

  "yn-checkout-address": {
    title: { "zh-CN": "Checkout Address 结账地址", en: "Checkout Address" },
    description: {
      "zh-CN": "跨境独立站结账地址表单，自动探测 Google/dr5hn/Photon/manual 数据源。",
      en: "Cross-border checkout address form with auto-probing Google/dr5hn/Photon/manual providers."
    },
    longDescription: {
      "zh-CN": "分步表单：先选地区（自动探测 Google API → dr5hn CDN → Photon → manual 手动填写），再填写联系方式与详细地址。内置校验（reportValidity），`value` 受控回显。`locale` 切换界面语言，`messages` 局部覆盖文案。支持 `excludeRegions` / `includeCountries` 过滤可选国家。`show-email` / `show-whatsapp` 控制联系字段。",
      en: "Step form: region selection (auto-probe Google → dr5hn → Photon → manual), then contact + address. Built-in validation. Controlled value. locale + messages i18n. Region filtering. Email/whatsapp fields."
    },
    usageCode: {
      "zh-CN": `<yn-checkout-address locale="en" @change=\${onAddressChange}></yn-checkout-address>`,
      en: `<yn-checkout-address locale="en" @change=\${onAddressChange}></yn-checkout-address>`
    },
    showcases: [
      {
        id: "default",
        title: { "zh-CN": "地址表单", en: "Address form" },
        description: { "zh-CN": "分步地区 + 联系信息。", en: "Stepped region + contact fields." },
        storybookComponent: "YnCheckoutAddress",
        storybookStory: "Default",
        demoVariant: "yn-checkout-address-default"
      },
      {
        id: "validation",
        title: { "zh-CN": "结账校验演示", en: "Checkout validation" },
        description: { "zh-CN": "完整 validate / reportValidity 见 Storybook。", en: "Full validate flow in Storybook." },
        storybookComponent: "YnCheckoutAddress",
        storybookStory: "CheckoutValidation",
        demoVariant: "yn-checkout-address-default"
      }
    ],
    usageExamples: [
      {
        title: { "zh-CN": "locale / show-email / show-whatsapp", en: "Locale & contact fields" },
        code: {
          "zh-CN": `<yn-checkout-address locale="zh-CN" show-email show-whatsapp email-required></yn-checkout-address>
<yn-checkout-address locale="en"></yn-checkout-address>`,
          en: `<yn-checkout-address locale="zh-CN" show-email show-whatsapp email-required></yn-checkout-address>
<yn-checkout-address locale="en"></yn-checkout-address>`
        },
        demoVariant: "yn-checkout-address-props-demo"
      },
      {
        title: { "zh-CN": "地址变化事件", en: "Change event" },
        code: {
          "zh-CN": `<!-- 模板 -->
<yn-checkout-address locale="en" @change=\${onChange}></yn-checkout-address>

<!-- 事件处理 -->
<script>
  function onChange(event) {
    // event.detail: { value: object, validation: object, changedFields: string[] }
    console.log('地址变化:', event.detail.value, '校验:', event.detail.validation);
  }
</script>`,
          en: `<!-- Template -->
<yn-checkout-address locale="en" @change=\${onChange}></yn-checkout-address>

<!-- Event handler -->
<script>
  function onChange(event) {
    // event.detail: { value, validation, changedFields }
    console.log('Address changed:', event.detail.value, 'Validation:', event.detail.validation);
  }
</script>`
        },
        demoVariant: "yn-checkout-address-event-log"
      }
    ],
    props: [
      { name: "dev", type: "boolean", default: "false", desc: { "zh-CN": "显示调试面板", en: "Show dev panel" } },
      { name: "disabled", type: "boolean", default: "false", desc: { "zh-CN": "禁用表单", en: "Disable form" } },
      { name: "locale", type: "string", default: '"en"', desc: { "zh-CN": "界面语言", en: "UI locale" } },
      { name: "messages", type: "Partial<YnCheckoutAddressMessages>", default: "—", desc: { "zh-CN": "局部覆盖文案", en: "Override messages" } },
      { name: "value", type: "YnCheckoutAddressValue | null", default: "null", desc: { "zh-CN": "受控回显值", en: "Controlled value" } },
      { name: "exclude-regions", type: "YnCheckoutExcludeRegions", default: "—", desc: { "zh-CN": "排除的国家/省州/城市", en: "Excluded regions" } },
      { name: "include-countries", type: "string[]", default: "全部", desc: { "zh-CN": "仅允许的国家 ISO2", en: "Allowed countries ISO2" } },
      { name: "google-maps-api-key", type: "string", default: '""', desc: { "zh-CN": "Google Maps API Key", en: "Google Maps API Key" } },
      { name: "show-email", type: "boolean", default: "false", desc: { "zh-CN": "显示邮箱输入", en: "Show email field" } },
      { name: "email-required", type: "boolean", default: "false", desc: { "zh-CN": "邮箱必填", en: "Email required" } },
      { name: "show-whatsapp", type: "boolean", default: "false", desc: { "zh-CN": "显示 WhatsApp 输入", en: "Show whatsapp field" } },
      { name: "whatsapp-required", type: "boolean", default: "false", desc: { "zh-CN": "WhatsApp 必填", en: "WhatsApp required" } }
    ],
    events: [
      { name: "change", detail: "{ value, validation, changedFields }", desc: { "zh-CN": "地址变化", en: "Address changed" } }
    ],
    slots: [],
    cssVars: [
      { name: "--yn-checkout-address-bg", desc: { "zh-CN": "背景色", en: "Background" } },
      { name: "--yn-checkout-address-padding", desc: { "zh-CN": "内边距", en: "Padding" } }
    ],
    methods: [
      { name: "validate", signature: "validate(): YnCheckoutAddressValidateResult", desc: { "zh-CN": "执行校验（不标红界面）", en: "Validate without showing errors" } },
      { name: "reportValidity", signature: "reportValidity(): boolean", desc: { "zh-CN": "标红无效字段并聚焦", en: "Show errors and focus first" } },
      { name: "setValue", signature: "setValue(value: YnCheckoutAddressValue | null): void", desc: { "zh-CN": "编程式写入值", en: "Programmatic value set" } }
    ]
  },

  "yn-sku-selector": {
    title: { "zh-CN": "SKU Selector 规格选择器", en: "SKU Selector" },
    description: {
      "zh-CN": "多维规格选择器，支持联动、加购校验与 simple 快速加购模式。",
      en: "Multi-dimensional spec selector with linkage, purchase validation, and simple quick-buy mode."
    },
    longDescription: {
      "zh-CN": "`skus` 传入 SKU 数据数组（含 specs / price / stock / allowBackorder 等）。`simple` 模式选中即触发 submit；非 simple 模式显示加购按钮。`pick-one` 自动选中第一组可用规格。`labels` 自定义规格组名，`spec-key-whitelist` / `spec-key-exclude` 过滤规格。`incomplete-hint` / `sold-out-hint` / `no-price-hint` 自定义提示文案。`loading-mode` 支持 icon / overlay。`onSubmit` 回调通过 `instance.done()` 结束 loading。",
      en: "skus array with specs/price/stock/allowBackorder. simple mode auto-submits; non-simple shows cart button. pick-one auto-selects first available. labels for spec names. spec-key-whitelist/exclude for filtering. Custom hint texts. loading-mode icon/overlay. onSubmit callback with instance.done()."
    },
    usageCode: {
      "zh-CN": "<yn-sku-selector .skus=\${skuList} currency=\"€\" submit-label=\"ADD TO CART\" @submit=\${onSubmit} @change=\${onChange}></yn-sku-selector>",
      en: "<yn-sku-selector .skus=\${skuList} currency=\"€\" submit-label=\"ADD TO CART\" @submit=\${onSubmit} @change=\${onChange}></yn-sku-selector>"
    },
    showcases: [
      {
        id: "pick-one",
        title: { "zh-CN": "球衣尺码（pick-one）", en: "Jersey sizes (pick-one)" },
        description: { "zh-CN": "默认选中首组可用 SKU。", en: "Default first available SKU selected." },
        storybookComponent: "YnSkuSelector",
        storybookStory: "PickOne",
        demoVariant: "yn-sku-default"
      },
      {
        id: "simple",
        title: { "zh-CN": "Simple 模式", en: "Simple mode" },
        description: { "zh-CN": "多维规格，选齐自动触发 submit。", en: "Multi-spec; auto submit when complete." },
        storybookComponent: "YnSkuSelector",
        storybookStory: "SimpleMode",
        demoVariant: "yn-sku-simple"
      }
    ],
    usageExamples: [
      {
        title: { "zh-CN": "pick-one / simple / submit-label", en: "Pick-one, simple & submit-label" },
        code: {
          "zh-CN": `<yn-sku-selector .skus=\${skusArray} currency="€" pick-one submit-label="ADD TO CART"></yn-sku-selector>
<yn-sku-selector .skus=\${skusArray} currency="€" simple submit-label="ADD TO CART"></yn-sku-selector>`,
          en: `<yn-sku-selector .skus=\${skusArray} currency="€" pick-one submit-label="ADD TO CART"></yn-sku-selector>
<yn-sku-selector .skus=\${skusArray} currency="€" simple submit-label="ADD TO CART"></yn-sku-selector>`
        },
        demoVariant: "yn-sku-props-demo"
      },
      {
        title: { "zh-CN": "规格变化与加购事件", en: "Change & submit events" },
        code: {
          "zh-CN": `<!-- 模板 -->
<yn-sku-selector
  .skus=\${skusArray}
  currency="€"
  submit-label="ADD TO CART"
  @change=\${onChange}
  @submit=\${onSubmit}
></yn-sku-selector>

<!-- 事件处理 -->
<script>
  function onChange(event) {
    // event.detail: { selections: object, sku: object|null, ready: boolean, missingKeys: string[] }
    console.log('规格变化:', event.detail.selections, '已选齐:', event.detail.ready);
  }
  function onSubmit(event) {
    // event.detail: { selections: object, sku: object } + instance.done()
    console.log('加购提交:', event.detail.sku);
    event.detail.instance.done();
  }
</script>`,
          en: `<!-- Template -->
<yn-sku-selector
  .skus=\${skusArray}
  currency="€"
  submit-label="ADD TO CART"
  @change=\${onChange}
  @submit=\${onSubmit}
></yn-sku-selector>

<!-- Event handlers -->
<script>
  function onChange(event) {
    // event.detail: { selections, sku, ready, missingKeys }
    console.log('Specs changed:', event.detail.selections, 'Ready:', event.detail.ready);
  }
  function onSubmit(event) {
    // event.detail: { selections, sku } + instance.done()
    console.log('Submit:', event.detail.sku);
    event.detail.instance.done();
  }
</script>`
        },
        demoVariant: "yn-sku-event-log"
      }
    ],
    props: [
      { name: "skus", type: "YnSkuItem[]", default: "[]", desc: { "zh-CN": "SKU 数据数组", en: "SKU data array" } },
      { name: "currency", type: "string", default: '€', desc: { "zh-CN": "货币符号", en: "Currency symbol" } },
      { name: "currency-icon", type: "string", default: '""', desc: { "zh-CN": "货币图标 SVG", en: "Currency icon SVG" } },
      { name: "simple", type: "boolean", default: "false", desc: { "zh-CN": "快速加购模式", en: "Simple quick-buy mode" } },
      { name: "pick-one", type: "boolean", default: "false", desc: { "zh-CN": "自动选中首个可用规格", en: "Auto-select first available" } },
      { name: "submit-label", type: "string", default: '"ADD TO CART"', desc: { "zh-CN": "加购按钮文案", en: "Submit button label" } },
      { name: "loading-text", type: "string", default: '""', desc: { "zh-CN": "loading 替换文案", en: "Loading replacement text" } },
      { name: "loading-mode", type: "icon | overlay", default: "icon", desc: { "zh-CN": "loading 展示方式", en: "Loading display mode" } },
      { name: "cart-icon", type: "YnSvgSource", default: "内置购物车", desc: { "zh-CN": "加购按钮图标", en: "Cart button icon" } },
      { name: "show-cart-icon", type: "boolean", default: "true", desc: { "zh-CN": "显示购物车图标", en: "Show cart icon" } },
      { name: "incomplete-hint", type: "string", default: '"请选择 {label}"', desc: { "zh-CN": "未选完提示文案", en: "Incomplete selection hint" } },
      { name: "sold-out-hint", type: "string", default: '"暂无库存"', desc: { "zh-CN": "售罄提示", en: "Sold out hint" } },
      { name: "no-price-hint", type: "string", default: '"暂无价格"', desc: { "zh-CN": "无价格提示", en: "No price hint" } },
      { name: "show-stock", type: "boolean", default: "false", desc: { "zh-CN": "显示库存数", en: "Show stock count" } },
      { name: "stock-label", type: "string", default: '"库存"', desc: { "zh-CN": "库存标签", en: "Stock label" } },
      { name: "stock-unlimited-label", type: "string", default: '"现货"', desc: { "zh-CN": "不限库存文案", en: "Unlimited stock text" } },
      { name: "stock-backorder-label", type: "string", default: '"可预订"', desc: { "zh-CN": "可预订文案", en: "Backorder text" } },
      { name: "labels", type: "Record<string, string>", default: "{}", desc: { "zh-CN": "规格组名映射", en: "Spec group name mapping" } },
      { name: "spec-key-whitelist", type: "string[]", default: "[]", desc: { "zh-CN": "仅显示这些规格组", en: "Show only these spec keys" } },
      { name: "spec-key-exclude", type: "string[]", default: "[]", desc: { "zh-CN": "排除这些规格组", en: "Exclude these spec keys" } },
      { name: "disabled", type: "boolean", default: "false", desc: { "zh-CN": "禁用交互", en: "Disabled" } },
      { name: "on-submit", type: "YnSkuSubmitHandler", default: "—", desc: { "zh-CN": "加购回调函数", en: "Submit callback" } }
    ],
    events: [
      { name: "change", detail: "YnSkuChangeDetail", desc: { "zh-CN": "规格变更", en: "Spec changed" } },
      { name: "init", detail: "YnSkuInitDetail", desc: { "zh-CN": "pick-one 初始化完成", en: "pick-one init complete" } },
      { name: "submit", detail: "YnSkuSubmitDetail", desc: { "zh-CN": "加购触发（含 instance.done）", en: "Submit triggered (with instance.done)" } }
    ],
    slots: [
      { name: "title", desc: { "zh-CN": "标题区域（simple 模式不渲染）", en: "Title area (hidden in simple mode)" } },
      { name: "submit-icon", desc: { "zh-CN": "加购按钮左侧图标", en: "Cart button left icon" } }
    ],
    cssVars: [
      { name: "--yn-sku-selector-submit-bg", default: "#000", desc: { "zh-CN": "加购按钮背景", en: "Submit button background" } },
      { name: "--yn-sku-selector-submit-color", default: "#fff", desc: { "zh-CN": "加购按钮文字色", en: "Submit button color" } },
      { name: "--yn-sku-selector-submit-height", default: "64px", desc: { "zh-CN": "加购按钮高度", en: "Submit button height" } },
      { name: "--yn-sku-selector-submit-font-size", default: "15px", desc: { "zh-CN": "加购字体大小", en: "Submit font size" } },
      { name: "--yn-sku-selector-price-font-size", default: "17px", desc: { "zh-CN": "价格字体大小", en: "Price font size" } },
      { name: "--yn-sku-selector-cart-icon-size", default: "24px", desc: { "zh-CN": "购物车图标大小", en: "Cart icon size" } }
    ]
  },

  "yn-sku-cart-button": {
    title: { "zh-CN": "SKU Cart Button 加购按钮", en: "SKU Cart Button" },
    description: {
      "zh-CN": "黑底白框加购按钮，左文案区 + 竖线 + 右价格区，支持三种 loading 模式。",
      en: "Dark-border white-inset cart button with label | divider | price, three loading modes."
    },
    longDescription: {
      "zh-CN": "`label` 左侧文案，`price` 右侧价格。`loading` 开启加载态；`loading-text` 设置后替换文案（优先级高于 loading-mode）。`loading-mode` 支持 `icon`（替换图标）和 `overlay`（覆盖层 spinner）。`cart-icon` 自定义左侧图标，`show-cart-icon` 控制显示。`currency-icon` 货币图标。",
      en: "Left label + divider + right price. loading with loading-text replacement or loading-mode icon/overlay. cart-icon custom icon, show-cart-icon toggle. currency-icon for currency symbol."
    },
    usageCode: {
      "zh-CN": "<yn-sku-cart-button label=\"ADD TO CART\" price=\"€29.00\" @click=\${onSubmit}></yn-sku-cart-button>",
      en: "<yn-sku-cart-button label=\"ADD TO CART\" price=\"\u20ac29.00\" @click=\${onSubmit}></yn-sku-cart-button>"
    },
    showcases: [
      {
        id: "default",
        title: { "zh-CN": "默认状态", en: "Default states" },
        description: { "zh-CN": "默认 / 隐藏图标 / 禁用。", en: "Default, hidden icon, disabled." },
        storybookComponent: "YnSkuCartButton",
        storybookStory: "Default",
        demoVariant: "yn-sku-cart-button-default"
      },
      {
        id: "loading",
        title: { "zh-CN": "Loading 模式", en: "Loading modes" },
        description: { "zh-CN": "icon / overlay / text 三种 loading。", en: "icon, overlay, text loading modes." },
        storybookComponent: "YnSkuCartButton",
        storybookStory: "LoadingModes",
        demoVariant: "yn-sku-cart-button-loading"
      }
    ],
    usageExamples: [
      {
        title: { "zh-CN": "label / price / loading / disabled", en: "Label, price, loading & disabled" },
        code: {
          "zh-CN": `<yn-sku-cart-button label="ADD TO CART" price="€29.00"></yn-sku-cart-button>
<yn-sku-cart-button label="ADD TO CART" price="€29.00" show-cart-icon="false"></yn-sku-cart-button>
<yn-sku-cart-button label="ADD TO CART" price="€29.00" disabled></yn-sku-cart-button>
<yn-sku-cart-button label="ADD TO CART" price="€29.00" loading loading-mode="icon"></yn-sku-cart-button>
<yn-sku-cart-button label="ADD TO CART" price="€29.00" loading loading-mode="overlay"></yn-sku-cart-button>`,
          en: `<yn-sku-cart-button label="ADD TO CART" price="€29.00"></yn-sku-cart-button>
<yn-sku-cart-button label="ADD TO CART" price="€29.00" show-cart-icon="false"></yn-sku-cart-button>
<yn-sku-cart-button label="ADD TO CART" price="€29.00" disabled></yn-sku-cart-button>
<yn-sku-cart-button label="ADD TO CART" price="€29.00" loading loading-mode="icon"></yn-sku-cart-button>
<yn-sku-cart-button label="ADD TO CART" price="€29.00" loading loading-mode="overlay"></yn-sku-cart-button>`
        },
        demoVariant: "yn-sku-cart-button-props-demo"
      },
      {
        title: { "zh-CN": "点击加购事件", en: "Click event" },
        code: {
          "zh-CN": `<!-- 模板 -->
<yn-sku-cart-button label="ADD TO CART" price="€29.00" @click=\${onClick}></yn-sku-cart-button>

<!-- 事件处理 -->
<script>
  function onClick(event) {
    // event: MouseEvent
    console.log('加购按钮被点击', event);
  }
</script>`,
          en: `<!-- Template -->
<yn-sku-cart-button label="ADD TO CART" price="€29.00" @click=\${onClick}></yn-sku-cart-button>

<!-- Event handler -->
<script>
  function onClick(event) {
    // event: MouseEvent
    console.log('Cart button clicked', event);
  }
</script>`
        },
        demoVariant: "yn-sku-cart-button-event-log"
      }
    ],
    props: [
      { name: "label", type: "string", default: '"ADD TO CART"', desc: { "zh-CN": "按钮文案", en: "Button label" } },
      { name: "price", type: "string", default: '"—"', desc: { "zh-CN": "价格文案", en: "Price text" } },
      { name: "cart-icon", type: "YnSvgSource", default: "内置 SVG", desc: { "zh-CN": "购物车图标", en: "Cart icon" } },
      { name: "currency-icon", type: "string", default: '""', desc: { "zh-CN": "货币图标 SVG", en: "Currency icon SVG" } },
      { name: "show-cart-icon", type: "boolean", default: "true", desc: { "zh-CN": "显示购物车图标", en: "Show cart icon" } },
      { name: "loading", type: "boolean", default: "false", desc: { "zh-CN": "加载态", en: "Loading state" } },
      { name: "loading-text", type: "string", default: '""', desc: { "zh-CN": "loading 替换文案（优先于 loading-mode）", en: "Loading text (overrides loading-mode)" } },
      { name: "loading-mode", type: "icon | overlay", default: "icon", desc: { "zh-CN": "spinner 展示方式", en: "Spinner display mode" } },
      { name: "disabled", type: "boolean", default: "false", desc: { "zh-CN": "禁用点击", en: "Disabled" } }
    ],
    events: [
      { name: "click", detail: "MouseEvent", desc: { "zh-CN": "点击加购", en: "Click to add to cart" } }
    ],
    slots: [
      { name: "icon", desc: { "zh-CN": "自定义图标（优先于 cart-icon）", en: "Custom icon (overrides cart-icon)" } }
    ],
    cssVars: [
      { name: "--yn-sku-selector-submit-bg", default: "#000", desc: { "zh-CN": "外框背景", en: "Outer background" } },
      { name: "--yn-sku-selector-submit-color", default: "#fff", desc: { "zh-CN": "文字色", en: "Text color" } },
      { name: "--yn-sku-selector-submit-height", default: "64px", desc: { "zh-CN": "按钮高度", en: "Button height" } },
      { name: "--yn-sku-selector-submit-inner-height", default: "44px", desc: { "zh-CN": "内框高度", en: "Inner height" } },
      { name: "--yn-sku-selector-submit-divider-width", default: "1px", desc: { "zh-CN": "竖线宽度", en: "Divider width" } },
      { name: "--yn-sku-selector-submit-divider-color", default: "#fff", desc: { "zh-CN": "竖线颜色", en: "Divider color" } },
      { name: "--yn-sku-selector-submit-loading-size", default: "18px", desc: { "zh-CN": "loading spinner 大小", en: "Loading spinner size" } }
    ]
  }
};
