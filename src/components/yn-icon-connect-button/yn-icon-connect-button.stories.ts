import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import "./yn-icon-connect-button";

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

const DEFAULT_ICON_SVG =
  '<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10.6208 6.8H14.6611L16.0324 4.51728C16.1311 4.35247 16.1311 4.14705 16.0324 3.98225L14.6611 1.69953H10.6208C10.3337 1.69953 10.1013 1.46719 10.1013 1.18008V0H8.40133V6.28055C8.40133 6.56767 8.16899 6.8 7.88188 6.8H3.44535L2.07402 9.08272C1.97533 9.24753 1.97533 9.45294 2.07402 9.61775L3.44535 11.9005H7.88188C8.16899 11.9005 8.40133 12.1328 8.40133 12.4199V15.3005H2.45133V17.0005H16.0513V15.3005H10.6208C10.3337 15.3005 10.1013 15.0681 10.1013 14.781V7.31991C10.1013 7.0328 10.3337 6.80047 10.6208 6.80047V6.8ZM13.6992 3.4L14.1294 4.11636C14.179 4.19853 14.179 4.30147 14.1294 4.38364L13.6992 5.1H10.1013V3.4H13.6992ZM4.40727 10.2L3.97708 9.48364C3.92749 9.40147 3.92749 9.29853 3.97708 9.21589L4.40727 8.49953H8.4018V10.1995H4.40727V10.2Z" fill="#241F21"/></svg>';

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
      description: "命名插槽。用于自定义图标内容，优先级高于 `icon` 属性。",
      control: false,
      table: {
        category: "Slots",
        type: { summary: "<svg slot=\"icon\">...</svg>" }
      }
    },
    labelSlot: {
      name: "label",
      description: "命名插槽。用于自定义文案内容，优先级高于 `label` 属性。",
      control: false,
      table: {
        category: "Slots",
        type: { summary: "<span slot=\"label\">...</span>" }
      }
    },
    click: {
      name: "click",
      description: "点击组件时触发原生点击事件。",
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
      ?uppercase=${args.uppercase}
      .link=${args.link}
      ?disabled=${args.disabled}
      style=${`--yn-icon-connect-button-bg:${args.backgroundColor};--yn-icon-connect-button-color:${args.textColor};`}
    ></yn-icon-connect-button>
  `
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
