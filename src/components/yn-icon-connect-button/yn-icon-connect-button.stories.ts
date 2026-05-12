import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import "./yn-icon-connect-button";

type Args = {
  label: string;
  size: "mini" | "small" | "normal";
  icon: string;
  disabled: boolean;
  backgroundColor: string;
  textColor: string;
};

const meta = {
  title: "Components/YnIconConnectButton",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "带图标连接动画的按钮组件，支持尺寸、文案、图标及配色配置。\n\n样式隔离：组件使用 Shadow DOM，外部样式默认不穿透；可通过以下 CSS 变量定制：`--yn-icon-connect-button-bg`、`--yn-icon-connect-button-color`。"
      }
    }
  },
  args: {
    label: "VER PRODUTOS URBAN",
    size: "normal",
    icon: "↗",
    disabled: false,
    backgroundColor: "#ddd967",
    textColor: "#241f21"
  },
  argTypes: {
    label: {
      control: "text",
      description: "按钮文本。",
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
      description: "图标文本或符号。",
      table: { defaultValue: { summary: "↗" } }
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
    click: {
      name: "click",
      description: "点击按钮时触发。",
      control: false,
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
      ?disabled=${args.disabled}
      style=${`--yn-icon-connect-button-bg:${args.backgroundColor};--yn-icon-connect-button-color:${args.textColor};`}
    ></yn-icon-connect-button>
  `
};

export const SizeShowcase: Story = {
  args: {
    label: "BUTTON",
    size: "normal",
    icon: "↗",
    disabled: false,
    backgroundColor: "#ddd967",
    textColor: "#241f21"
  },
  render: (args: Args) => html`
    <div style="display:flex;gap:16px;align-items:center;">
      <yn-icon-connect-button
        label="BUTTON"
        size="mini"
        icon=${args.icon}
        style=${`--yn-icon-connect-button-bg:${args.backgroundColor};--yn-icon-connect-button-color:${args.textColor};`}
      ></yn-icon-connect-button>
      <yn-icon-connect-button
        label="BUTTON"
        size="small"
        icon=${args.icon}
        style=${`--yn-icon-connect-button-bg:${args.backgroundColor};--yn-icon-connect-button-color:${args.textColor};`}
      ></yn-icon-connect-button>
      <yn-icon-connect-button
        label="BUTTON"
        size="normal"
        icon=${args.icon}
        style=${`--yn-icon-connect-button-bg:${args.backgroundColor};--yn-icon-connect-button-color:${args.textColor};`}
      ></yn-icon-connect-button>
    </div>
  `
};
