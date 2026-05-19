/**
 * IDE 文档：HTML 属性、插槽、CSS 变量（`--yn-*`）。
 * 修改公开 API 后请同步并运行 `pnpm analyze`。
 *
 * @typedef {{ description?: string, values?: Record<string, string> }} AttrMeta
 * @typedef {{ name?: string, description: string }} SlotMeta
 * @typedef {{
 *   summary?: string;
 *   slots?: SlotMeta[];
 *   cssVariables?: Record<string, string>;
 *   attributes?: Record<string, AttrMeta>;
 * }} TagMeta
 */

/** @type {Record<string, TagMeta>} */
export default {
  "yn-button": {
    summary: "通用按钮。`variant` / `size` 控制外观；`loading` 为加载态。",
    slots: [
      { description: "按钮主文案（默认插槽）" },
      { name: "prefix-icon", description: "主文案前的图标（如 SVG）" },
      { name: "suffix-icon", description: "主文案后的图标" },
      { name: "loading", description: "`loading` 且 `loading-type` 非 left/center/right 时的自定义 loading 图标" }
    ],
    cssVariables: {
      "--yn-button-radius": "圆角",
      "--yn-button-bg": "背景色",
      "--yn-button-hover-bg": "悬停背景色",
      "--yn-button-color": "文字颜色",
      "--yn-button-content-gap": "图标与文案间距",
      "--yn-button-icon-size": "插槽图标尺寸",
      "--yn-button-loading-size": "loading 图标尺寸",
      "--yn-button-disabled-bg": "禁用背景",
      "--yn-button-disabled-color": "禁用文字色",
      "--yn-button-disabled-opacity": "禁用透明度"
    },
    attributes: {
      variant: {
        description: "按钮配色变体。",
        values: {
          primary: "主色实心（默认）",
          success: "成功 / 确认",
          warning: "警告",
          danger: "危险 / 删除",
          neutral: "中性灰",
          dark: "深色底",
          default: "浅底描边"
        }
      },
      size: {
        description: "按钮尺寸（内边距与字号）。",
        values: {
          mini: "最小",
          small: "小号",
          medium: "中号（默认）"
        }
      },
      "loading-type": {
        description: "`loading=true` 时加载图标位置。",
        values: {
          left: "左侧（默认）",
          center: "居中",
          right: "右侧"
        }
      },
      loading: { description: "是否显示加载动画并禁用点击。" },
      disabled: { description: "禁用按钮，不响应点击。" },
      "hit-slop": { description: "是否扩大可点击热区（默认 true）。" }
    }
  },
  "yn-pull-cord-switch": {
    summary:
      "抽绳开关：下拉绳端切换开/关。`fixed` 吸顶；`glow-up` 顶灯上扩。Shadow DOM，请用下方 CSS 变量覆写。",
    slots: [
      { description: "关闭态绳端内容（推荐 `yn-button`）" },
      { name: "activated", description: "开启态绳端内容（`slot=\"activated\"`）" }
    ],
    cssVariables: {
      "--yn-pull-cord-switch-height": "组件区域高度",
      "--yn-pull-cord-switch-z-index": "叠放层级",
      "--yn-pull-cord-switch-anchor-y": "锚点额外下移（相对画布高度比例，0=贴顶）",
      "--yn-pull-cord-switch-accent": "开启态顶灯光晕颜色",
      "--yn-pull-cord-switch-glow-up-bleed": "glow-up 时画布向上延展（px）",
      "--yn-pull-cord-switch-rope-start": "绳渐变起点色",
      "--yn-pull-cord-switch-rope-end": "绳渐变终点色",
      "--yn-pull-cord-switch-card-bg": "绳端卡片背景",
      "--yn-pull-cord-switch-card-border": "绳端卡片边框",
      "--yn-pull-cord-switch-card-color": "绳端卡片文字色",
      "--yn-pull-cord-switch-slot-transition-duration": "双插槽切换动画时长",
      "--yn-pull-cord-switch-slot-button-scale": "插槽内 yn-button 缩放",
      "--yn-pull-cord-switch-fixed-peek-transition-duration": "fixed 负偏移 hover 动画时长",
      "--yn-pull-cord-switch-disabled-opacity": "禁用透明度"
    },
    attributes: {
      checked: { description: "是否开启（绳端处于拉开/ON 状态）。" },
      "glow-up": {
        description: "开启且 checked 时，顶灯光向锚点上方对称扩散（默认仅向下）。"
      },
      variant: {
        description: "绳/卡片视觉主题。",
        values: {
          default: "深色工业风（默认）",
          floema: "浅色 Floema 风"
        }
      },
      size: {
        description: "绳端卡片与绳粗细（不控制绳长）。",
        values: {
          mini: "最小（默认）",
          small: "小号",
          medium: "中号"
        }
      },
      "rope-length": {
        description: "绳身长度（px），与 `size` 解耦，默认 260。"
      },
      fixed: { description: "吸附视口；配合 `fixed-x`、`top` 定位。" },
      "fixed-x": { description: "水平偏移（px，可负）；未设则居中。" },
      top: { description: "距视口顶部（px，可负）；仅 fixed 时有效。" },
      reverse: { description: "`fixed-x` 是否自视口右侧起算。" },
      "card-offset": { description: "绳端卡片距绳头间距（px，可为负）。" },
      "toggle-threshold": { description: "下拉切换阈值（px）；未设则随绳长缩放。" },
      "z-index": { description: "叠放层级（同步写入 CSS 变量）。" },
      disabled: { description: "禁用拖拽与切换。" }
    }
  },
  "yn-input": {
    summary: "文本输入框。通过 CSS 变量定制宽高与配色。",
    slots: [],
    cssVariables: {
      "--yn-input-width": "输入区域宽度",
      "--yn-input-height": "输入区域高度",
      "--yn-input-bg": "背景色",
      "--yn-input-color": "文字颜色",
      "--yn-input-placeholder-color": "占位符颜色",
      "--yn-input-border-color": "边框颜色",
      "--yn-input-focus-border-color": "聚焦边框颜色",
      "--yn-input-radius": "圆角"
    },
    attributes: {
      value: { description: "当前输入值。" },
      placeholder: { description: "占位提示文案。" },
      disabled: { description: "禁用输入。" }
    }
  },
  "yn-dropdown": {
    summary: "下拉浮层：默认插槽为触发器，`content` 插槽为面板内容。",
    slots: [
      { description: "触发器（如按钮）" },
      { name: "content", description: "下拉面板内容" },
      { name: "close-icon", description: "关闭图标（可选，默认内置 SVG）" }
    ],
    attributes: {
      placement: {
        description: "面板相对触发器的位置。",
        values: {
          "top-start": "上方 · 左对齐",
          top: "上方 · 居中",
          "top-end": "上方 · 右对齐",
          "bottom-start": "下方 · 左对齐（默认）",
          bottom: "下方 · 居中",
          "bottom-end": "下方 · 右对齐",
          "left-start": "左侧 · 上对齐",
          left: "左侧 · 居中",
          "left-end": "左侧 · 下对齐",
          "right-start": "右侧 · 上对齐",
          right: "右侧 · 居中",
          "right-end": "右侧 · 下对齐"
        }
      },
      open: { description: "面板是否展开（受控）。" },
      offset: { description: "触发器与面板间距（px）。" },
      "auto-flip": { description: "空间不足时是否自动翻转方位。" },
      "close-on-outside-click": { description: "点击外部是否关闭。" }
    }
  },
  "yn-toast": {
    summary: "顶部灵动岛提示；推荐 `YnToast.show()` / `success()` 等 API。",
    attributes: {
      type: {
        description: "提示类型（影响配色与图标）。",
        values: {
          success: "成功",
          info: "信息",
          warning: "警告",
          error: "错误"
        }
      },
      message: { description: "提示文案，支持 HTML 片段（仅可信内容）。" },
      persist: { description: "是否常驻不自动关闭。" }
    }
  }
};
