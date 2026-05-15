import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import "./yn-icon-connect-button";
import { ynSignpostSvg } from "../../asset/svg";

type Args = {
  label: string;
  size: "mini" | "small" | "normal";
  icon: string;
  uppercase: boolean;
  link: string;
  disabled: boolean;
  backgroundColor: string;
  textColor: string;
  iconSlot?: string;
  labelSlot?: string;
  click?: (event: MouseEvent) => void;
};

const DEFAULT_ICON_SVG = ynSignpostSvg;

const meta = {
  title: "Components/YnIconConnectButton",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "带图标连接动画的按钮组件，支持尺寸、文案、图标及配色配置。\n\n图标/文案支持两种方式：\n1) 属性方式：`icon` 与 `label`。\n2) 插槽方式：`slot=\"icon\"` 与 `slot=\"label\"`（优先级高于属性回退）。\n\n`link` 有值时组件渲染为 `<a>`；无值时渲染为 `<button>`。\n\n样式隔离：组件使用 Shadow DOM，外部样式默认不穿透；可通过以下 CSS 变量定制：`--yn-icon-connect-button-bg`、`--yn-icon-connect-button-color`。\n\n插槽示例：\n```html\n<yn-icon-connect-button>\n  <svg slot=\"icon\" width=\"18\" height=\"18\" viewBox=\"0 0 18 18\">...</svg>\n  <span slot=\"label\">Custom Label</span>\n</yn-icon-connect-button>\n```"
      }
    }
  },
  args: {
    label: "VER PRODUTOS URBAN",
    size: "normal",
    icon: DEFAULT_ICON_SVG,
    uppercase: true,
    link: "",
    disabled: false,
    backgroundColor: "#ddd967",
    textColor: "#241f21"
  },
  argTypes: {
    label: {
      control: "text",
      description: "按钮文本（回退属性）。当存在 `slot=\"label\"` 时此属性不生效。",
      table: { defaultValue: { summary: "VER PRODUTOS URBAN" } }
    },
    size: {
      control: "radio",
      options: ["mini", "small", "normal"],
      description: "按钮尺寸。",
      table: { defaultValue: { summary: "normal" } }
    },
    icon: {
      control: "text",
      description: "图标内容（回退属性，可传文本或 SVG 字符串）。当存在 `slot=\"icon\"` 时此属性不生效。",
      table: { defaultValue: { summary: "<svg .../>" } }
    },
    uppercase: {
      control: "boolean",
      description: "是否启用默认大写转换。",
      table: { defaultValue: { summary: "true" } }
    },
    link: {
      control: "text",
      description: "链接地址。有值时渲染为 `<a>`，无值时渲染为 `<button>`。",
      table: { defaultValue: { summary: '""' } }
    },
    disabled: {
      control: "boolean",
      description: "是否禁用按钮交互。",
      table: { defaultValue: { summary: "false" } }
    },
    backgroundColor: {
      control: "color",
      name: "--yn-icon-connect-button-bg",
      description: "按钮背景色。",
      table: { category: "CSS Variables", defaultValue: { summary: "#ddd967" } }
    },
    textColor: {
      control: "color",
      name: "--yn-icon-connect-button-color",
      description: "文本和图标颜色。",
      table: { category: "CSS Variables", defaultValue: { summary: "#241f21" } }
    },
    iconSlot: {
      name: "icon",
      description:
        "命名插槽。用于自定义图标内容，优先级高于 `icon` 属性。最小示例：`<svg slot=\"icon\" ...>...</svg>`。",
      control: false,
      table: {
        category: "Slots",
        type: { summary: "<svg slot=\"icon\">...</svg>" }
      }
    },
    labelSlot: {
      name: "label",
      description:
        "命名插槽。用于自定义文案内容，优先级高于 `label` 属性。最小示例：`<span slot=\"label\">Custom Label</span>`。",
      control: false,
      table: {
        category: "Slots",
        type: { summary: "<span slot=\"label\">...</span>" }
      }
    },
    click: {
      name: "click",
      description: "点击组件时触发原生点击事件（`MouseEvent`）。",
      control: false,
      action: "click",
      table: {
        category: "Events",
        type: { summary: "MouseEvent" }
      }
    }
  }
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {
  render: (args: Args) => html`
    <yn-icon-connect-button
      label=${args.label}
      size=${args.size}
      icon=${args.icon}
      ?uppercase=${args.uppercase}
      .link=${args.link}
      ?disabled=${args.disabled}
      style=${`--yn-icon-connect-button-bg:${args.backgroundColor};--yn-icon-connect-button-color:${args.textColor};`}
      @click=${(event: Event) => args.click?.(event as MouseEvent)}
    ></yn-icon-connect-button>
  `,
  play: async ({ canvasElement, step }) => {
    const iconButtonEl = canvasElement.querySelector("yn-icon-connect-button");
    if (!(iconButtonEl instanceof HTMLElement) || !iconButtonEl.shadowRoot) return;

    const innerButton = iconButtonEl.shadowRoot.querySelector("button, a");
    if (!(innerButton instanceof HTMLElement)) return;

    await step("点击图标按钮触发 click 事件", async () => {
      let emitted = false;
      const onClick = () => {
        emitted = true;
      };
      iconButtonEl.addEventListener("click", onClick, { once: true });
      innerButton.click();
      if (!emitted) {
        throw new Error("点击后应触发 click 事件");
      }
    });
  }
};

export const SizeShowcase: Story = {
  args: {
    label: "BUTTON",
    size: "normal",
    icon: DEFAULT_ICON_SVG,
    uppercase: true,
    link: "",
    disabled: false,
    backgroundColor: "#ddd967",
    textColor: "#241f21"
  },
  render: (args: Args) => html`
    <div class="yn-flex yn-items-center yn-gap-4">
      <yn-icon-connect-button
        label="BUTTON"
        size="mini"
        icon=${args.icon}
        style=${`--yn-icon-connect-button-bg:${args.backgroundColor};--yn-icon-connect-button-color:${args.textColor};`}
        @click=${(event: Event) => args.click?.(event as MouseEvent)}
      ></yn-icon-connect-button>
      <yn-icon-connect-button
        label="BUTTON"
        size="small"
        icon=${args.icon}
        style=${`--yn-icon-connect-button-bg:${args.backgroundColor};--yn-icon-connect-button-color:${args.textColor};`}
        @click=${(event: Event) => args.click?.(event as MouseEvent)}
      ></yn-icon-connect-button>
      <yn-icon-connect-button
        label="BUTTON"
        size="normal"
        icon=${args.icon}
        style=${`--yn-icon-connect-button-bg:${args.backgroundColor};--yn-icon-connect-button-color:${args.textColor};`}
        @click=${(event: Event) => args.click?.(event as MouseEvent)}
      ></yn-icon-connect-button>
    </div>
  `
};
