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
  argTypes: {
    label: { control: "text" },
    size: { control: "radio", options: ["mini", "small", "normal"] },
    icon: { control: "text" },
    disabled: { control: "boolean" },
    backgroundColor: { control: "color" },
    textColor: { control: "color" }
  }
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {
  args: {
    label: "VER PRODUTOS URBAN",
    size: "normal",
    icon: "↗",
    disabled: false,
    backgroundColor: "#ddd967",
    textColor: "#241f21"
  },
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
