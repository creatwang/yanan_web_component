import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import type { YnQuantity } from "./yn-quantity";
import "../yn-button/yn-button";
import "./yn-quantity";

type Args = {
  value: number;
  min: number;
  max: number;
  step: number;
  disabled: boolean;
  onChange?: (event: CustomEvent<{ value: number }>) => void;
};

const productDemo = (args: Args) => html`
  <div
    style="background:var(--yn-color-bg,#f2efea);color:var(--yn-color-text,#241f21);min-height:100vh;padding:48px 24px;display:flex;justify-content:center;"
  >
    <article
      style="width:min(420px,100%);background:var(--yn-color-surface,rgba(255,255,255,0.35));border:1px solid var(--yn-color-border,rgba(36,31,33,0.12));border-radius:20px;padding:28px 24px 32px;backdrop-filter:blur(6px);"
    >
      <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;opacity:0.62;">
        Urban · Explore
      </p>
      <h1 style="margin:0 0 12px;font-size:28px;font-weight:400;line-height:1.15;letter-spacing:-0.02em;">
        Espreguiçadeira Sun Lounger Plaza
      </h1>
      <p style="margin:0 0 24px;font-size:15px;line-height:1.5;opacity:0.72;">
        Mobiliário urbano sustentável, pensado para integrar na paisagem com conforto e durabilidade.
      </p>
      <div style="display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:20px;">
        <span style="font-size:14px;opacity:0.7;">Quantidade</span>
        <yn-quantity
          .value=${args.value}
          .min=${args.min}
          .max=${args.max}
          .step=${args.step}
          ?disabled=${args.disabled}
          style="--yn-quantity-font-family:inherit;"
          @change=${(event: Event) => args.onChange?.(event as CustomEvent<{ value: number }>)}
        ></yn-quantity>
      </div>
      <yn-button variant="dark" style="width:100%;--yn-button-radius:999px;">
        Adicionar à lista de interesse
      </yn-button>
    </article>
  </div>
`;

const meta = {
  title: "Components/YnQuantity",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Floema 风格产品数量选择器：暖色半透明胶囊容器、细线描边、Zimula 衬线数字与极简加减按钮。\n\n事件：数量变化时触发 `change`，`event.detail` 为 `{ value: number }`。\n\n样式隔离：组件使用 Shadow DOM，外部样式默认不穿透；应通过公开 CSS 变量定制：\n- `--yn-quantity-width`\n- `--yn-quantity-height`\n- `--yn-quantity-bg`\n- `--yn-quantity-bg-hover`\n- `--yn-quantity-border-color`\n- `--yn-quantity-border-color-hover`\n- `--yn-quantity-color`\n- `--yn-quantity-muted-color`\n- `--yn-quantity-divider-color`\n- `--yn-quantity-button-size`\n- `--yn-quantity-button-bg-hover`\n- `--yn-quantity-button-bg-active`\n- `--yn-quantity-button-hover-radius`\n- `--yn-quantity-inner-gap`\n- `--yn-quantity-padding`\n- `--yn-quantity-radius`\n- `--yn-quantity-font-family`\n- `--yn-quantity-font-size`\n- `--yn-quantity-letter-spacing`\n- `--yn-quantity-value-min-width`"
      }
    }
  },
  args: {
    value: 1,
    min: 1,
    max: 99,
    step: 1,
    disabled: false
  },
  argTypes: {
    value: {
      control: { type: "number", min: 1 },
      description: "当前数量。",
      table: { defaultValue: { summary: "1" } }
    },
    min: {
      control: { type: "number", min: 0 },
      description: "最小可选数量。",
      table: { defaultValue: { summary: "1" } }
    },
    max: {
      control: { type: "number", min: 1 },
      description: "最大可选数量。",
      table: { defaultValue: { summary: "99" } }
    },
    step: {
      control: { type: "number", min: 1 },
      description: "每次加减的步进值。",
      table: { defaultValue: { summary: "1" } }
    },
    disabled: {
      control: "boolean",
      description: "是否禁用整个计数器。",
      table: { defaultValue: { summary: "false" } }
    },
    onChange: {
      name: "change",
      control: false,
      action: "change",
      description: "数量变化时触发。",
      table: {
        category: "Events",
        type: { summary: "CustomEvent<{ value: number }>" }
      }
    }
  },
  render: productDemo
} satisfies Meta<Args>;

export default meta;

type Story = StoryObj<Args>;

const getQuantityInput = (root: HTMLElement) => {
  const el = root.querySelector("yn-quantity");
  if (!(el instanceof HTMLElement)) return null;
  const input = (el as YnQuantity).shadowRoot?.querySelector<HTMLInputElement>(".value");
  return input ?? null;
};

const getQuantityButtons = (root: HTMLElement) => {
  const el = root.querySelector("yn-quantity");
  if (!(el instanceof HTMLElement)) return null;
  const shadow = (el as YnQuantity).shadowRoot;
  if (!shadow) return null;
  const buttons = shadow.querySelectorAll<HTMLButtonElement>(".btn");
  if (buttons.length < 2) return null;
  return { decrease: buttons[0], increase: buttons[1] };
};

export const ProductDemo: Story = {
  name: "产品页 Demo",
  play: async ({ canvasElement, step }) => {
    await step("点击加号，数量变为 2", async () => {
      const buttons = getQuantityButtons(canvasElement);
      const input = getQuantityInput(canvasElement);
      if (!buttons || !input) throw new Error("未找到 yn-quantity 内部控件");
      buttons.increase.click();
      if (Number(input.value) !== 2) throw new Error("加号后数量应为 2");
    });

    await step("点击减号，数量回到 1", async () => {
      const buttons = getQuantityButtons(canvasElement);
      const input = getQuantityInput(canvasElement);
      if (!buttons || !input) throw new Error("未找到 yn-quantity 内部控件");
      buttons.decrease.click();
      if (Number(input.value) !== 1) throw new Error("减号后数量应为 1");
    });
  }
};

export const Compact: Story = {
  name: "紧凑尺寸",
  render: (args) => html`
    <div style="background:var(--yn-color-bg,#f2efea);padding:24px;">
      <yn-quantity
        .value=${args.value}
        .min=${args.min}
        .max=${args.max}
        .step=${args.step}
        ?disabled=${args.disabled}
        style="--yn-quantity-height:36px;--yn-quantity-button-size:30px;--yn-quantity-font-size:14px;--yn-quantity-font-family:inherit;"
        @change=${(event: Event) => args.onChange?.(event as CustomEvent<{ value: number }>)}
      ></yn-quantity>
    </div>
  `
};
