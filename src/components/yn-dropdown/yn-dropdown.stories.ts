import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import "./yn-dropdown";
import "../yn-button/yn-button";
import "../yn-group-pick/yn-group-pick";
import "../yn-pick/yn-pick";

type Placement =
  | "top-start"
  | "top"
  | "top-end"
  | "bottom-start"
  | "bottom"
  | "bottom-end"
  | "left-start"
  | "left"
  | "left-end"
  | "right-start"
  | "right"
  | "right-end";

type Args = {
  placement: Placement;
  open: boolean;
  offset: number;
  motionDistance: number;
  panelOpenDistance: number;
  panelCloseDistance: number;
  viewportPadding: number;
  autoFlip: boolean;
  closeOnOutsideClick: boolean;
  panelMinWidth: string;
  panelRadius: string;
  panelPadding: string;
  panelShadow: string;
  trigger: string;
  content: string;
  closeIcon: string;
  close?: () => void;
  onOpenChange?: (open: boolean, placement: Placement) => void;
};

const categories = [
  { id: "Golf", color: "#b8d28a" },
  { id: "Urban", color: "#ef7d53" },
  { id: "Nature", color: "#d5c29f" },
  { id: "RePlastic", color: "#82a7d8" }
];

const meta = {
  title: "Components/YnDropdown",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "下拉弹层组件，默认插槽作为触发器，`content` 命名插槽承载弹层内容。通过 `placement` 指定固定弹出方向（当前版本不自动翻转方向）。\n\n动画说明：弹层按 `placement` 方向位移进出；触发器文本按同方向滑出；关闭图标从反方向进入；关闭时弹层朝按钮所在方向回收并淡出。\n\n关闭图标：默认内置 SVG，可通过 `close-icon` 命名插槽替换。\n\n样式隔离：组件使用 Shadow DOM，外部样式默认不穿透；请使用公开 CSS 变量定制。\n\nTree Shaking 导入：\n- 全量入口：`import \"yn-web-component/define\"`\n- 按需入口（推荐）：`import \"yn-web-component/components/yn-dropdown\"`"
      }
    }
  },
  args: {
    placement: "bottom-start",
    open: false,
    offset: 12,
    motionDistance: 14,
    panelOpenDistance: 16,
    panelCloseDistance: 20,
    viewportPadding: 12,
    autoFlip: false,
    closeOnOutsideClick: true,
    panelMinWidth: "280px",
    panelRadius: "12px",
    panelPadding: "12px",
    panelShadow: "0 12px 36px rgba(36, 31, 33, 0.18)",
    trigger: "默认触发器插槽",
    content: "下拉内容插槽",
    closeIcon: "关闭图标插槽"
  },
  argTypes: {
    placement: {
      control: "select",
      options: [
        "top-start",
        "top",
        "top-end",
        "bottom-start",
        "bottom",
        "bottom-end",
        "left-start",
        "left",
        "left-end",
        "right-start",
        "right",
        "right-end"
      ],
      description: "弹层固定弹出方向。",
      table: {
        defaultValue: { summary: '"bottom-start"' },
        type: { summary: "YnDropdownPlacement" }
      }
    },
    open: {
      control: "boolean",
      description: "是否展开下拉层。可用于受控场景，也可由组件内部点击触发器自动切换。",
      table: {
        defaultValue: { summary: "false" },
        type: { summary: "boolean" }
      }
    },
    offset: {
      control: { type: "number", min: 0, step: 1 },
      description: "触发器和弹层之间的间距（单位 px）。",
      table: {
        defaultValue: { summary: "12" },
        type: { summary: "number" }
      }
    },
    motionDistance: {
      control: { type: "number", min: 0, step: 1 },
      name: "motion-distance",
      description: "触发器文本滑出与关闭图标入场位移距离（单位 px）。",
      table: {
        defaultValue: { summary: "14" },
        type: { summary: "number" }
      }
    },
    panelOpenDistance: {
      control: { type: "number", min: 0, step: 1 },
      name: "panel-open-distance",
      description: "弹层打开时，从按钮方向进入的位移距离（单位 px）。",
      table: {
        defaultValue: { summary: "16" },
        type: { summary: "number" }
      }
    },
    panelCloseDistance: {
      control: { type: "number", min: 0, step: 1 },
      name: "panel-close-distance",
      description: "弹层关闭时，朝按钮所在方向回收的位移距离（单位 px）。",
      table: {
        defaultValue: { summary: "20" },
        type: { summary: "number" }
      }
    },
    viewportPadding: {
      control: { type: "number", min: 0, step: 1 },
      name: "viewport-padding",
      description: "保留字段：当前固定方向模式下不参与定位计算。",
      table: {
        defaultValue: { summary: "12" },
        type: { summary: "number" }
      }
    },
    autoFlip: {
      control: "boolean",
      name: "auto-flip",
      description: "保留字段：当前固定方向模式下不参与方向计算。",
      table: {
        defaultValue: { summary: "false" },
        type: { summary: "boolean" }
      }
    },
    closeOnOutsideClick: {
      control: "boolean",
      name: "close-on-outside-click",
      description: "点击组件外部区域时是否自动关闭。",
      table: {
        defaultValue: { summary: "true" },
        type: { summary: "boolean" }
      }
    },
    panelMinWidth: {
      control: "text",
      name: "--yn-dropdown-panel-min-width",
      description: "弹层最小宽度。",
      table: {
        category: "CSS Variables",
        defaultValue: { summary: "280px" },
        type: { summary: "string" }
      }
    },
    panelRadius: {
      control: "text",
      name: "--yn-dropdown-panel-radius",
      description: "弹层圆角。",
      table: {
        category: "CSS Variables",
        defaultValue: { summary: "12px" },
        type: { summary: "string" }
      }
    },
    panelPadding: {
      control: "text",
      name: "--yn-dropdown-panel-padding",
      description: "弹层内边距。",
      table: {
        category: "CSS Variables",
        defaultValue: { summary: "12px" },
        type: { summary: "string" }
      }
    },
    panelShadow: {
      control: "text",
      name: "--yn-dropdown-panel-shadow",
      description: "弹层阴影。",
      table: {
        category: "CSS Variables",
        defaultValue: { summary: "0 12px 36px rgba(36, 31, 33, 0.18)" },
        type: { summary: "string" }
      }
    },
    onOpenChange: {
      name: "open-change",
      control: false,
      action: "open-change",
      description: "打开状态变化时触发。`event.detail` 结构：`{ open: boolean; placement: YnDropdownPlacement }`。",
      table: {
        category: "Events",
        type: { summary: "CustomEvent<{ open: boolean; placement: YnDropdownPlacement }>" }
      }
    },
    close: {
      name: "close()",
      control: false,
      description: "交互方法：通过外部 JS 主动关闭弹层，例如 `document.querySelector(\"yn-dropdown\")?.close()`。",
      table: {
        category: "Interactions",
        type: { summary: "() => void" }
      }
    },
    trigger: {
      name: "default",
      control: false,
      description:
        "触发器插槽。可放入 `yn-button` 或任意自定义触发元素。示例：`<yn-dropdown><yn-button>筛选条件</yn-button></yn-dropdown>`。",
      table: {
        category: "Slots",
        defaultValue: { summary: "空" },
        type: { summary: "HTMLElement" }
      }
    },
    content: {
      name: "content",
      control: false,
      description:
        "下拉内容插槽。示例：`<div slot=\"content\">...</div>`；可放入表单、筛选项、菜单等任意结构。",
      table: {
        category: "Slots",
        defaultValue: { summary: "空" },
        type: { summary: "HTMLElement" }
      }
    },
    closeIcon: {
      name: "close-icon",
      control: false,
      description:
        "关闭图标插槽。未提供时使用内置关闭 SVG。示例：`<svg slot=\"close-icon\" ...>...</svg>`。",
      table: {
        category: "Slots",
        defaultValue: { summary: "内置关闭 SVG" },
        type: { summary: "HTMLElement" }
      }
    }
  }
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

const renderContent = () => html`
  <div class="yn-rounded-2xl yn-bg-[#efede8] yn-p-3">
    <yn-group-pick value="Nature" style="--yn-group-pick-gap:8px;">
      ${categories.map(
        (item) => html`
          <yn-pick .value=${item.id} ?border=${true}>
            <div
              class="yn-box-border yn-flex yn-min-w-[104px] yn-items-end yn-rounded-lg yn-px-3 yn-py-[10px] yn-text-base yn-font-bold yn-leading-none yn-text-[#241f21]"
              style=${`background:${item.color};`}
            >
              ${item.id}
            </div>
          </yn-pick>
        `
      )}
    </yn-group-pick>
  </div>
`;

export const Default: Story = {
  render: (args) => html`
    <div class="yn-flex yn-min-h-[380px] yn-items-start yn-justify-center yn-pt-12">
      <yn-dropdown
        .placement=${args.placement}
        .offset=${args.offset}
        .motionDistance=${args.motionDistance}
        .panelOpenDistance=${args.panelOpenDistance}
        .panelCloseDistance=${args.panelCloseDistance}
        .viewportPadding=${args.viewportPadding}
        .autoFlip=${args.autoFlip}
        .closeOnOutsideClick=${args.closeOnOutsideClick}
        style=${`--yn-dropdown-panel-min-width:${args.panelMinWidth};--yn-dropdown-panel-radius:${args.panelRadius};--yn-dropdown-panel-padding:${args.panelPadding};--yn-dropdown-panel-shadow:${args.panelShadow};`}
        @open-change=${(event: Event) => {
          if (!(event instanceof CustomEvent)) return;
          const detail = event.detail as { open: boolean; placement: Placement };
          args.onOpenChange?.(detail.open, detail.placement);
        }}
      >
        <yn-button variant="default">筛选条件</yn-button>
        <div slot="content">${renderContent()}</div>
      </yn-dropdown>
    </div>
  `,
  play: async ({ canvasElement, step }) => {
    const dropdown = canvasElement.querySelector("yn-dropdown") as HTMLElement | null;
    if (!dropdown?.shadowRoot) return;

    await step("点击触发器打开下拉", async () => {
      const trigger = dropdown.shadowRoot?.querySelector<HTMLElement>(".trigger");
      if (!trigger) return;
      trigger.click();
    });

    await step("点击关闭图标收起下拉", async () => {
      const closeButton = dropdown.shadowRoot?.querySelector<HTMLElement>(".close-icon");
      if (!closeButton) return;
      closeButton.click();
    });
  }
};

export const CustomCloseIcon: Story = {
  args: {
    placement: "right-start"
  },
  render: (args) => html`
    <div class="yn-flex yn-min-h-[380px] yn-items-start yn-justify-center yn-pt-12">
      <yn-dropdown
        .placement=${args.placement}
        .offset=${args.offset}
        .motionDistance=${args.motionDistance}
        .panelOpenDistance=${args.panelOpenDistance}
        .panelCloseDistance=${args.panelCloseDistance}
        .viewportPadding=${args.viewportPadding}
        .autoFlip=${args.autoFlip}
        .closeOnOutsideClick=${args.closeOnOutsideClick}
        style=${`--yn-dropdown-panel-min-width:${args.panelMinWidth};--yn-dropdown-panel-radius:${args.panelRadius};--yn-dropdown-panel-padding:${args.panelPadding};--yn-dropdown-panel-shadow:${args.panelShadow};`}
        @open-change=${(event: Event) => {
          if (!(event instanceof CustomEvent)) return;
          const detail = event.detail as { open: boolean; placement: Placement };
          args.onOpenChange?.(detail.open, detail.placement);
        }}
      >
        <yn-button variant="default">更多选项</yn-button>
        <svg slot="close-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="10.5" stroke="#241f21" />
          <path d="M8 8L16 16M16 8L8 16" stroke="#241f21" stroke-width="1.8" stroke-linecap="round" />
        </svg>
        <div slot="content">${renderContent()}</div>
      </yn-dropdown>
    </div>
  `
};
