import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import "./yn-input";

type Args = {
  value: string;
  placeholder: string;
  disabled: boolean;
};

const meta = {
  title: "Components/YnInput",
  tags: ["autodocs"],
  argTypes: {
    value: { control: "text" },
    placeholder: { control: "text" },
    disabled: { control: "boolean" }
  }
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {
  args: {
    value: "",
    placeholder: "请输入关键词",
    disabled: false
  },
  render: (args: Args) =>
    html`<yn-input
      .value=${args.value}
      placeholder=${args.placeholder}
      ?disabled=${args.disabled}
    ></yn-input>`
};

export const Filled: Story = {
  args: {
    value: "已输入内容",
    placeholder: "请输入关键词",
    disabled: false
  },
  render: (args: Args) =>
    html`<yn-input
      .value=${args.value}
      placeholder=${args.placeholder}
      ?disabled=${args.disabled}
    ></yn-input>`
};
