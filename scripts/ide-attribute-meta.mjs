/**
 * IDE 属性说明与枚举文案（HTML 补全悬停展示）。
 * 修改组件公开 API 后请同步此处，并运行 `pnpm analyze`。
 *
 * @typedef {{ description?: string, values?: Record<string, string> }} AttrMeta
 * @typedef {{ summary?: string, attributes?: Record<string, AttrMeta> }} TagMeta
 */

/** @type {Record<string, TagMeta>} */
export default {
  "yn-button": {
    summary: "通用按钮。用 `variant` 选配色、`size` 选尺寸；`loading` 为加载态。",
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
      loading: {
        description: "是否显示加载动画并禁用点击。"
      },
      disabled: {
        description: "禁用按钮，不响应点击。"
      },
      "hit-slop": {
        description: "是否扩大可点击热区（默认 true）。"
      }
    }
  },
  "yn-pull-cord-switch": {
    summary:
      "抽绳开关：下拉绳端切换开/关。支持 `fixed` 吸顶、`glow-up` 顶灯上扩；默认/activated 插槽放绳端按钮。",
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
      "z-index": { description: "叠放层级（写入 CSS 变量）。" },
      disabled: { description: "禁用拖拽与切换。" }
    }
  },
  "yn-input": {
    summary: "文本输入框。",
    attributes: {
      value: { description: "当前输入值。" },
      placeholder: { description: "占位提示文案。" },
      disabled: { description: "禁用输入。" }
    }
  },
  "yn-dropdown": {
    summary: "下拉浮层：触发器为默认插槽，面板为 `panel` 插槽。",
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
    summary: "顶部灵动岛式提示；也可用 `YnToast.show()` 等 API。",
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
