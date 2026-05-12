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
  parameters: {
    docs: {
      description: {
        component:
          "基础按钮组件，支持文本展示与禁用状态。\n\n样式隔离：组件使用 Shadow DOM，外部样式默认不穿透。当前版本未暴露可配置 CSS 变量。"
      }
    }
  },
  args: {
    label: "提交",
    disabled: false
  },
  argTypes: {
    label: {
      control: "text",
      description: "按钮文案。",
      table: { defaultValue: { summary: "提交" } }
    },
    disabled: {
      control: "boolean",
      description: "是否禁用按钮。",
      table: { defaultValue: { summary: "false" } }
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
