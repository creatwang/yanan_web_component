import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import "./yn-button";

type Args = {
  label: string;
  disabled: boolean;
};

const meta = {
  title: "Components/YnButton",
  tags: ["autodocs"],
  argTypes: {
    label: { control: "text" },
    disabled: { control: "boolean" }
  }
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {
  args: {
    label: "提交",
    disabled: false
  },
  render: (args: Args) =>
    html`<yn-button ?disabled=${args.disabled} label=${args.label}></yn-button>`
};

export const Disabled: Story = {
  args: {
    label: "不可用",
    disabled: true
  },
  render: (args: Args) =>
    html`<yn-button ?disabled=${args.disabled} label=${args.label}></yn-button>`
};
