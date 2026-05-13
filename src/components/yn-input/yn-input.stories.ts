import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import "./yn-input";

type Args = {
  value: string;
  placeholder: string;
  disabled: boolean;
  input?: (event: InputEvent) => void;
  change?: (event: Event) => void;
};

const meta = {
  title: "Components/YnInput",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "基础输入框组件，支持受控 value、占位文案和禁用状态。\n\n样式隔离：组件使用 Shadow DOM，外部样式默认不穿透。当前版本未暴露可配置 CSS 变量。"
      }
    }
  },
  args: {
    value: "",
    placeholder: "请输入关键词",
    disabled: false
  },
  argTypes: {
    value: {
      control: "text",
      description: "输入框当前值。",
      table: { defaultValue: { summary: '""' } }
    },
    placeholder: {
      control: "text",
      description: "输入框占位文案。",
      table: { defaultValue: { summary: "请输入关键词" } }
    },
    disabled: {
      control: "boolean",
      description: "是否禁用输入框。",
      table: { defaultValue: { summary: "false" } }
    },
    input: {
      name: "input",
      description: "输入内容变化时触发。",
      control: false,
      action: "input",
      table: {
        category: "Events",
        type: { summary: "InputEvent" }
      }
    },
    change: {
      name: "change",
      description: "输入框失焦且值变化后触发。",
      control: false,
      action: "change",
      table: {
        category: "Events",
        type: { summary: "Event" }
      }
    }
  }
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {
  render: (args: Args) =>
    html`<yn-input
      .value=${args.value}
      placeholder=${args.placeholder}
      ?disabled=${args.disabled}
      @input=${(event: Event) => args.input?.(event as InputEvent)}
      @change=${(event: Event) => args.change?.(event)}
    ></yn-input>`,
  play: async ({ canvasElement, step }) => {
    const inputEl = canvasElement.querySelector("yn-input");
    if (!(inputEl instanceof HTMLElement) || !inputEl.shadowRoot) return;

    const innerInput = inputEl.shadowRoot.querySelector("input");
    if (!(innerInput instanceof HTMLInputElement)) return;

    await step("输入文本后组件 value 更新", async () => {
      innerInput.value = "storybook interaction";
      innerInput.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
      if ((inputEl as HTMLElement & { value?: string }).value !== "storybook interaction") {
        throw new Error("输入后 yn-input.value 未更新");
      }
    });
  }
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
      @input=${(event: Event) => args.input?.(event as InputEvent)}
      @change=${(event: Event) => args.change?.(event)}
    ></yn-input>`
};
