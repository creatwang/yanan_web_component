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
};

export type ComponentI18n = {
  title: L10nText;
  description: L10nText;
  longDescription: L10nText;
  usageCode: L10nText;
  showcases: DocShowcase[];
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
  "yn-button": {
    title: { "zh-CN": "Button 按钮", en: "Button" },
    description: {
      "zh-CN": "基础按钮：语义色 variant、尺寸、加载态、热区扩展与图标插槽。",
      en: "Semantic variants, sizes, loading states, hit-slop, and icon slots."
    },
    longDescription: {
      "zh-CN":
        "支持 `variant` 语义色（primary / success / warning / danger / neutral / dark / default）、三种 `size`、`loading` + `loading-type` 控制加载图标位置、`hit-slop` 扩展热区。颜色策略：先用 variant 表达语义，再用 `--yn-button-*` 覆写品牌色。事件为原生 `click`。",
      en:
        "Supports semantic `variant`, three `size` levels, `loading` with `loading-type`, and `hit-slop`. Use variants for intent, `--yn-button-*` for branding. Fires native `click`."
    },
    usageCode: {
      "zh-CN": `<yn-button variant="primary" @click=\${onClick}>保存</yn-button>`,
      en: `<yn-button variant="primary" @click=\${onClick}>Save</yn-button>`
    },
    showcases: [
      {
        id: "variants",
        title: { "zh-CN": "语义色变体", en: "Semantic variants" },
        description: {
          "zh-CN": "primary / success / warning / danger / neutral / dark 等语义色一览。",
          en: "All semantic color variants in one row."
        },
        storybookComponent: "YnButton",
        storybookStory: "Variants",
        demoVariant: "yn-button-variants"
      },
      {
        id: "sizes",
        title: { "zh-CN": "尺寸", en: "Sizes" },
        description: {
          "zh-CN": "mini / small / medium 三种 padding 规格。",
          en: "mini, small, and medium padding scales."
        },
        storybookComponent: "YnButton",
        storybookStory: "Sizes",
        demoVariant: "yn-button-sizes"
      },
      {
        id: "loading",
        title: { "zh-CN": "加载态", en: "Loading" },
        description: {
          "zh-CN": "loading-type 左/中/右；支持 slot=\"loading\" 自定义动画。",
          en: "loading-type left/center/right; custom `loading` slot."
        },
        storybookComponent: "YnButton",
        storybookStory: "LoadingShowcase",
        demoVariant: "yn-button-loading"
      }
    ],
    props: [
      { name: "disabled", type: "boolean", default: "false", desc: { "zh-CN": "禁用点击", en: "Disable clicks" } },
      { name: "variant", type: "primary | … | default", default: "primary", desc: { "zh-CN": "语义色", en: "Semantic color" } },
      { name: "size", type: "mini | small | medium", default: "medium", desc: { "zh-CN": "尺寸", en: "Size" } },
      { name: "loading", type: "boolean", default: "false", desc: { "zh-CN": "加载态", en: "Loading state" } },
      { name: "loading-type", type: "left | center | right", default: "left", desc: { "zh-CN": "loading 位置", en: "Loading position" } },
      { name: "hit-slop", type: "boolean", default: "true", desc: { "zh-CN": "热区 +5px", en: "+5px hit area" } }
    ],
    events: [{ name: "click", detail: "MouseEvent", desc: { "zh-CN": "点击", en: "Click" } }],
    slots: [
      { name: "(default)", desc: { "zh-CN": "按钮文案", en: "Label" } },
      { name: "prefix-icon", desc: { "zh-CN": "前缀图标", en: "Prefix icon" } },
      { name: "suffix-icon", desc: { "zh-CN": "后缀图标", en: "Suffix icon" } },
      { name: "loading", desc: { "zh-CN": "自定义 loading", en: "Custom loading" } }
    ],
    cssVars: [
      { name: "--yn-button-bg", desc: { "zh-CN": "背景色", en: "Background" } },
      { name: "--yn-button-hover-bg", desc: { "zh-CN": "悬停背景", en: "Hover background" } },
      { name: "--yn-button-radius", desc: { "zh-CN": "圆角", en: "Radius" } }
    ]
  },

  "yn-input": {
    title: { "zh-CN": "Input 输入框", en: "Input" },
    description: {
      "zh-CN": "Floema 风格圆角输入框，支持可选前后置按钮插槽。",
      en: "Floema-style rounded input with optional prefix/suffix button slots."
    },
    longDescription: {
      "zh-CN":
        "默认不渲染前缀或后缀按钮；只有传入 `prefix-button` / `suffix-button` 插槽时才显示对应按钮。输入变化触发 `yn-input`，前后按钮点击分别触发 `yn-prefix-click` / `yn-suffix-click`，事件 detail 均为 `{ value }`。",
      en:
        "Prefix/suffix buttons are not rendered by default; they appear only when `prefix-button` / `suffix-button` slots are provided. Input changes emit `yn-input`; button clicks emit `yn-prefix-click` / `yn-suffix-click`, all with `{ value }` detail."
    },
    usageCode: {
      "zh-CN": `<yn-input placeholder="请输入内容" @yn-input=\${onInput}></yn-input>

<yn-input placeholder="仅前缀按钮" @yn-prefix-click=\${onPrefixClick}>
  <span slot="prefix-button">⌘</span>
</yn-input>

<yn-input placeholder="仅后缀按钮" @yn-suffix-click=\${onSuffixClick}>
  <span slot="suffix-button">×</span>
</yn-input>

<yn-input placeholder="前后置按钮" @yn-prefix-click=\${onPrefixClick} @yn-suffix-click=\${onSuffixClick}>
  <span slot="prefix-button">⌘</span>
  <span slot="suffix-button">×</span>
</yn-input>`,
      en: `<yn-input placeholder="Search" @yn-input=\${onInput}></yn-input>

<yn-input placeholder="Prefix only" @yn-prefix-click=\${onPrefixClick}>
  <span slot="prefix-button">⌘</span>
</yn-input>

<yn-input placeholder="Suffix only" @yn-suffix-click=\${onSuffixClick}>
  <span slot="suffix-button">×</span>
</yn-input>

<yn-input placeholder="Prefix and suffix" @yn-prefix-click=\${onPrefixClick} @yn-suffix-click=\${onSuffixClick}>
  <span slot="prefix-button">⌘</span>
  <span slot="suffix-button">×</span>
</yn-input>`
    },
    showcases: [],
    props: [
      { name: "value", type: "string", default: '""', desc: { "zh-CN": "当前值", en: "Current value" } },
      { name: "placeholder", type: "string", default: '"请输入内容"', desc: { "zh-CN": "占位文案", en: "Placeholder" } },
      { name: "disabled", type: "boolean", default: "false", desc: { "zh-CN": "禁用输入", en: "Disable input" } }
    ],
    events: [
      { name: "yn-input", detail: "{ value: string }", desc: { "zh-CN": "输入变化", en: "Input value changed" } },
      { name: "yn-prefix-click", detail: "{ value: string }", desc: { "zh-CN": "前置按钮点击", en: "Prefix button clicked" } },
      { name: "yn-suffix-click", detail: "{ value: string }", desc: { "zh-CN": "后置按钮点击", en: "Suffix button clicked" } }
    ],
    slots: [
      { name: "prefix-button", desc: { "zh-CN": "前置按钮图标；未传则不渲染按钮", en: "Prefix icon button; not rendered when omitted" } },
      { name: "suffix-button", desc: { "zh-CN": "后置按钮图标；未传则不渲染按钮", en: "Suffix icon button; not rendered when omitted" } }
    ],
    cssVars: [
      { name: "--yn-input-width", default: "320px", desc: { "zh-CN": "输入框宽度", en: "Input width" } },
      { name: "--yn-input-height", default: "44px", desc: { "zh-CN": "输入框高度", en: "Input height" } },
      { name: "--yn-input-bg", desc: { "zh-CN": "背景色", en: "Background" } },
      { name: "--yn-input-border-color", desc: { "zh-CN": "边框色", en: "Border color" } },
      { name: "--yn-input-radius", default: "999px", desc: { "zh-CN": "圆角", en: "Radius" } },
      { name: "--yn-input-button-size", default: "28px", desc: { "zh-CN": "前后按钮尺寸", en: "Prefix/suffix button size" } }
    ],
    notes: [
      {
        "zh-CN": "按钮插槽可放 SVG、图标字体或普通文本；外部样式不穿透 Shadow DOM，建议通过公开 CSS 变量定制。",
        en: "Button slots accept SVG, icon fonts, or text. External styles do not pierce Shadow DOM; use public CSS variables for theming."
      }
    ]
  },

  "yn-pick": {
    title: { "zh-CN": "Pick 选项", en: "Pick" },
    description: {
      "zh-CN": "单个可选项；默认插槽可包裹任意自定义布局（色块、图片、卡片）。",
      en: "Single option; default slot accepts any custom layout (cards, images, blocks)."
    },
    longDescription: {
      "zh-CN":
        "插槽内容放入相对定位容器 `wrap`，选中图标固定在右上角。`border` 控制覆盖边框动画。**核心能力：默认插槽支持任意 HTML**——色块、图片、复合卡片均可，选中态仅叠加边框与角标，不限制你的设计。与 `yn-group-pick` 组合时，子项图标配置优先于组级默认。",
      en:
        "Slot content lives in a `wrap` container; selection icon pins top-right. **Key feature: the default slot accepts any HTML**—color blocks, images, rich cards. Selection adds border + badge only. Child icon props override group defaults."
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
        description: {
          "zh-CN": "Storybook Default：180×100 色块 + 粗体文案，选中后边框覆盖动画。",
          en: "Storybook Default: colored block with bold label and border overlay."
        },
        storybookComponent: "YnPick",
        storybookStory: "Default",
        demoVariant: "yn-pick-color-card"
      },
      {
        id: "image-card",
        title: { "zh-CN": "图片 + 文案卡片", en: "Image + label card" },
        description: {
          "zh-CN": "可嵌 Floema 商品图 + 系列名，适合系列/分类筛选（见 Group Pick）。",
          en: "Product image + series name—ideal for collection filters (see Group Pick)."
        },
        storybookComponent: "YnGroupPick",
        storybookStory: "Default",
        imageUrl: FLOEMA_IMG,
        demoVariant: "yn-pick-image-card"
      }
    ],
    props: [
      { name: "value", type: "string | number", default: '""', desc: { "zh-CN": "选项 id", en: "Option id" } },
      { name: "selected", type: "boolean", default: "false", desc: { "zh-CN": "是否选中", en: "Selected" } },
      { name: "border", type: "boolean", default: "true", desc: { "zh-CN": "覆盖边框", en: "Border overlay" } },
      { name: "show-unselected-icon", type: "boolean", default: "false", desc: { "zh-CN": "未选中显示图标", en: "Icon when unselected" } }
    ],
    events: [
      {
        name: "toggle",
        detail: "{ id, flag }",
        desc: { "zh-CN": "点击切换；flag 为点击后状态", en: "Toggle; flag is new state" }
      }
    ],
    slots: [
      {
        name: "(default)",
        desc: {
          "zh-CN": "任意 HTML（图片、文本、自定义布局）",
          en: "Any HTML (images, text, custom layouts)"
        }
      }
    ],
    cssVars: [
      { name: "--yn-pick-border-width", default: "2px", desc: { "zh-CN": "边框宽", en: "Border width" } },
      { name: "--yn-pick-border-color", desc: { "zh-CN": "边框色", en: "Border color" } },
      { name: "--yn-pick-border-radius", default: "8px", desc: { "zh-CN": "圆角", en: "Radius" } }
    ]
  },

  "yn-group-pick": {
    title: { "zh-CN": "Group Pick 选项组", en: "Group Pick" },
    description: {
      "zh-CN": "单选/多选容器；子 yn-pick 可嵌 Floema 风格图片卡片。",
      en: "Single/multi select; child yn-pick cards with Floema-style imagery."
    },
    longDescription: {
      "zh-CN":
        "配合 `yn-pick` 子项使用。Storybook 主示例为 Golf / Urban / Nature / RePlastic 四色卡片，可含商品图与角标。支持 `multiple`、`value` 回显、组级默认图标；子项显式配置优先。",
      en:
        "Works with `yn-pick` children. Storybook demo uses Golf/Urban/Nature/RePlastic cards with optional product images. Supports `multiple`, controlled `value`, group-level icons."
    },
    usageCode: {
      "zh-CN": `<yn-group-pick multiple .value=\${["Urban", "Nature"]} @change=\${onChange} style="--yn-group-pick-gap:8px;">
  <yn-pick value="Golf">
    <div class="category-card category-card--golf">Golf</div>
  </yn-pick>
  <yn-pick value="Urban">
    <div class="category-card category-card--urban">Urban</div>
  </yn-pick>
  <yn-pick value="Nature">
    <div class="category-card category-card--nature">Nature</div>
  </yn-pick>
</yn-group-pick>`,
      en: `<yn-group-pick multiple .value=\${["Urban", "Nature"]} @change=\${onChange} style="--yn-group-pick-gap:8px;">
  <yn-pick value="Golf">
    <div class="category-card category-card--golf">Golf</div>
  </yn-pick>
  <yn-pick value="Urban">
    <div class="category-card category-card--urban">Urban</div>
  </yn-pick>
  <yn-pick value="Nature">
    <div class="category-card category-card--nature">Nature</div>
  </yn-pick>
</yn-group-pick>`
    },
    showcases: [
      {
        id: "category-cards",
        title: { "zh-CN": "系列分类卡片", en: "Category cards" },
        description: {
          "zh-CN": "四色系列 + 可选 Floema 商品图，多选回显。",
          en: "Four color-coded series with optional Floema product image."
        },
        storybookComponent: "YnGroupPick",
        storybookStory: "Default",
        imageUrl: FLOEMA_IMG,
        demoVariant: "yn-group-pick-cards"
      },
      {
        id: "multiple",
        title: { "zh-CN": "多选模式（multiple）", en: "Multiple selection" },
        description: {
          "zh-CN": "`multiple` 开启后 `value` 使用数组；点击子项后 `change.detail` 返回当前 ids 与当前点击项 flag。",
          en: "With `multiple`, `value` is an array; `change.detail` returns current ids and the clicked flag."
        },
        storybookComponent: "YnGroupPick",
        storybookStory: "Multiple",
        demoVariant: "yn-group-pick-multiple"
      }
    ],
    props: [
      { name: "value", type: "string | number | array", default: '""', desc: { "zh-CN": "选中回显", en: "Selected values" } },
      { name: "multiple", type: "boolean", default: "false", desc: { "zh-CN": "多选", en: "Multiple" } }
    ],
    events: [
      { name: "change", detail: "{ ids, flag }", desc: { "zh-CN": "子项点击", en: "Child clicked" } }
    ],
    slots: [{ name: "(default)", desc: { "zh-CN": "yn-pick 列表", en: "yn-pick children" } }],
    cssVars: [{ name: "--yn-group-pick-gap", default: "12px", desc: { "zh-CN": "间距", en: "Gap" } }],
    notes: [
      {
        "zh-CN": "子 yn-pick 的图标相关属性优先于组级默认值。",
        en: "Child yn-pick icon props override group defaults."
      }
    ]
  }
};

/** 为尚未单独扩写的组件生成最小 i18n（从 component-pages 迁移后可逐步替换） */
export function getComponentI18n(id: string): ComponentI18n | undefined {
  return COMPONENT_I18N[id];
}
