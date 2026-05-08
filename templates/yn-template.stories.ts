import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import "../src/components/yn-button";

/**
 * Storybook 模板：
 * - 复制后改成 yn-xxx.stories.ts
 * - 将示例组件替换为目标组件
 * - 至少保留 Default 和一个状态类示例
 */
type Args = {
  label: string;
  disabled: boolean;
};

const meta = {
  title: "Templates/YnTemplate",
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
    label: "模板按钮",
    disabled: false
  },
  render: (args: Args) =>
    html`<yn-button ?disabled=${args.disabled} label=${args.label}></yn-button>`
};

export const Disabled: Story = {
  args: {
    label: "不可用模板",
    disabled: true
  },
  render: (args: Args) =>
    html`<yn-button ?disabled=${args.disabled} label=${args.label}></yn-button>`
};
