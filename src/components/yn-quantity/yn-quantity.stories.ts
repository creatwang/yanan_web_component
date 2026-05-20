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
  width: string;
  height: string;
  background: string;
  backgroundHover: string;
  backgroundFocus: string;
  borderColor: string;
  borderColorHover: string;
  borderColorFocus: string;
  focusRing: string;
  color: string;
  mutedColor: string;
  dividerColor: string;
  buttonSize: string;
  buttonBgHover: string;
  buttonBgActive: string;
  buttonHoverRadius: string;
  innerGap: string;
  padding: string;
  radius: string;
  fontFamily: string;
  fontSize: string;
  letterSpacing: string;
  valueMinWidth: string;
  onChange?: (event: CustomEvent<{ value: number }>) => void;
};

const quantityStyle = (args: Args) =>
  [
    `--yn-quantity-width:${args.width}`,
    `--yn-quantity-height:${args.height}`,
    `--yn-quantity-bg:${args.background}`,
    `--yn-quantity-bg-hover:${args.backgroundHover}`,
    `--yn-quantity-bg-focus:${args.backgroundFocus}`,
    `--yn-quantity-border-color:${args.borderColor}`,
    `--yn-quantity-border-color-hover:${args.borderColorHover}`,
    `--yn-quantity-border-color-focus:${args.borderColorFocus}`,
    `--yn-quantity-focus-ring:${args.focusRing}`,
    `--yn-quantity-color:${args.color}`,
    `--yn-quantity-muted-color:${args.mutedColor}`,
    `--yn-quantity-divider-color:${args.dividerColor}`,
    `--yn-quantity-button-size:${args.buttonSize}`,
    `--yn-quantity-button-bg-hover:${args.buttonBgHover}`,
    `--yn-quantity-button-bg-active:${args.buttonBgActive}`,
    `--yn-quantity-button-hover-radius:${args.buttonHoverRadius}`,
    `--yn-quantity-inner-gap:${args.innerGap}`,
    `--yn-quantity-padding:${args.padding}`,
    `--yn-quantity-radius:${args.radius}`,
    `--yn-quantity-font-family:${args.fontFamily}`,
    `--yn-quantity-font-size:${args.fontSize}`,
    `--yn-quantity-letter-spacing:${args.letterSpacing}`,
    `--yn-quantity-value-min-width:${args.valueMinWidth}`
  ].join(";");

const renderQuantity = (args: Args) => html`
  <div
    style="background:var(--yn-color-bg,#f2efea);padding:24px;display:flex;align-items:center;justify-content:center;min-height:120px;"
  >
    <yn-quantity
      .value=${args.value}
      .min=${args.min}
      .max=${args.max}
      .step=${args.step}
      ?disabled=${args.disabled}
      style=${quantityStyle(args)}
      @change=${(event: Event) => args.onChange?.(event as CustomEvent<{ value: number }>)}
    ></yn-quantity>
  </div>
`;

const componentDescription = `Floema 风格产品数量选择器：胶囊容器、细线描边、加减按钮与居中数字输入。

## 导入（Tree Shaking）

\`\`\`ts
// 推荐：按需入口
import { YnQuantity } from "yn-web-component/components/yn-quantity";

// 全量注册
import "yn-web-component/define";

// 全局主题（浅色 / 深色）
import "yn-web-component/theme.css";
\`\`\`

## 属性

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| \`value\` | \`number\` | \`1\` | 当前数量 |
| \`min\` | \`number\` | \`1\` | 最小值 |
| \`max\` | \`number\` | \`99\` | 最大值 |
| \`step\` | \`number\` | \`1\` | 步进 |
| \`disabled\` | \`boolean\` | \`false\` | 禁用 |

## 事件

- \`change\`：数量变化时触发，\`event.detail\` 为 \`{ value: number }\`。

## 主题

组件默认通过 \`--yn-color-*\` 全局 token 配色（见 Storybook 工具栏「主题」或 \`html[data-yn-theme]\`）。可用 \`--yn-quantity-*\` 覆盖组件级样式。

## 样式隔离

组件使用 **Shadow DOM**，外部样式默认不穿透；请通过公开 CSS 变量定制。`;

const meta = {
  title: "Components/YnQuantity",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: componentDescription
      }
    }
  },
  args: {
    value: 1,
    min: 1,
    max: 99,
    step: 1,
    disabled: false,
    width: "auto",
    height: "44px",
    background: "rgba(255, 255, 255, 0.62)",
    backgroundHover: "rgba(255, 255, 255, 0.86)",
    backgroundFocus: "#fffaf2",
    borderColor: "rgba(36, 31, 33, 0.22)",
    borderColorHover: "rgba(36, 31, 33, 0.52)",
    borderColorFocus: "#241f21",
    focusRing: "rgba(36, 31, 33, 0.12)",
    color: "#241f21",
    mutedColor: "rgba(36, 31, 33, 0.42)",
    dividerColor: "rgba(36, 31, 33, 0.14)",
    buttonSize: "32px",
    buttonBgHover: "rgba(36, 31, 33, 0.08)",
    buttonBgActive: "rgba(36, 31, 33, 0.14)",
    buttonHoverRadius: "999px",
    innerGap: "6px",
    padding: "4px 6px",
    radius: "999px",
    fontFamily: "inherit",
    fontSize: "16px",
    letterSpacing: "-0.01em",
    valueMinWidth: "2.5ch"
  },
  argTypes: {
    value: {
      control: { type: "number", min: 0 },
      description: "当前数量。",
      table: { defaultValue: { summary: "1" } }
    },
    min: {
      control: { type: "number", min: 0 },
      description: "最小可选数量；到达后减号禁用。",
      table: { defaultValue: { summary: "1" } }
    },
    max: {
      control: { type: "number", min: 1 },
      description: "最大可选数量；到达后加号禁用。",
      table: { defaultValue: { summary: "99" } }
    },
    step: {
      control: { type: "number", min: 1 },
      description: "每次点击加减的步进值。",
      table: { defaultValue: { summary: "1" } }
    },
    disabled: {
      control: "boolean",
      description: "是否禁用整个计数器。",
      table: { defaultValue: { summary: "false" } }
    },
    width: {
      control: "text",
      name: "--yn-quantity-width",
      description: "容器宽度。",
      table: { category: "CSS Variables", defaultValue: { summary: "auto" } }
    },
    height: {
      control: "text",
      name: "--yn-quantity-height",
      description: "容器高度。",
      table: { category: "CSS Variables", defaultValue: { summary: "44px" } }
    },
    background: {
      control: "text",
      name: "--yn-quantity-bg",
      description: "容器背景（默认引用 `--yn-color-surface`）。",
      table: { category: "CSS Variables", defaultValue: { summary: "rgba(255, 255, 255, 0.62)" } }
    },
    backgroundHover: {
      control: "text",
      name: "--yn-quantity-bg-hover",
      description: "容器悬停背景。",
      table: { category: "CSS Variables", defaultValue: { summary: "rgba(255, 255, 255, 0.86)" } }
    },
    backgroundFocus: {
      control: "color",
      name: "--yn-quantity-bg-focus",
      description: "聚焦时容器背景（与 yn-input 一致）。",
      table: { category: "CSS Variables", defaultValue: { summary: "#fffaf2" } }
    },
    borderColor: {
      control: "text",
      name: "--yn-quantity-border-color",
      description: "边框颜色。",
      table: { category: "CSS Variables", defaultValue: { summary: "rgba(36, 31, 33, 0.22)" } }
    },
    borderColorHover: {
      control: "text",
      name: "--yn-quantity-border-color-hover",
      description: "悬停边框颜色。",
      table: { category: "CSS Variables", defaultValue: { summary: "rgba(36, 31, 33, 0.52)" } }
    },
    borderColorFocus: {
      control: "color",
      name: "--yn-quantity-border-color-focus",
      description: "聚焦边框颜色。",
      table: { category: "CSS Variables", defaultValue: { summary: "#241f21" } }
    },
    focusRing: {
      control: "text",
      name: "--yn-quantity-focus-ring",
      description: "聚焦外圈阴影颜色（`box-shadow: 0 0 0 3px`）。",
      table: { category: "CSS Variables", defaultValue: { summary: "rgba(36, 31, 33, 0.12)" } }
    },
    color: {
      control: "color",
      name: "--yn-quantity-color",
      description: "数字与图标颜色。",
      table: { category: "CSS Variables", defaultValue: { summary: "#241f21" } }
    },
    mutedColor: {
      control: "text",
      name: "--yn-quantity-muted-color",
      description: "禁用按钮图标颜色。",
      table: { category: "CSS Variables", defaultValue: { summary: "rgba(36, 31, 33, 0.42)" } }
    },
    dividerColor: {
      control: "text",
      name: "--yn-quantity-divider-color",
      description: "数字区两侧分隔线颜色。",
      table: { category: "CSS Variables", defaultValue: { summary: "rgba(36, 31, 33, 0.14)" } }
    },
    buttonSize: {
      control: "text",
      name: "--yn-quantity-button-size",
      description: "加减按钮尺寸。",
      table: { category: "CSS Variables", defaultValue: { summary: "32px" } }
    },
    buttonBgHover: {
      control: "text",
      name: "--yn-quantity-button-bg-hover",
      description: "按钮悬停圆形高亮背景。",
      table: { category: "CSS Variables", defaultValue: { summary: "rgba(36, 31, 33, 0.08)" } }
    },
    buttonBgActive: {
      control: "text",
      name: "--yn-quantity-button-bg-active",
      description: "按钮按下背景。",
      table: { category: "CSS Variables", defaultValue: { summary: "rgba(36, 31, 33, 0.14)" } }
    },
    buttonHoverRadius: {
      control: "text",
      name: "--yn-quantity-button-hover-radius",
      description: "按钮悬停高亮圆角。",
      table: { category: "CSS Variables", defaultValue: { summary: "999px" } }
    },
    innerGap: {
      control: "text",
      name: "--yn-quantity-inner-gap",
      description: "按钮与数字区间距。",
      table: { category: "CSS Variables", defaultValue: { summary: "6px" } }
    },
    padding: {
      control: "text",
      name: "--yn-quantity-padding",
      description: "容器内边距。",
      table: { category: "CSS Variables", defaultValue: { summary: "4px 6px" } }
    },
    radius: {
      control: "text",
      name: "--yn-quantity-radius",
      description: "容器圆角。",
      table: { category: "CSS Variables", defaultValue: { summary: "999px" } }
    },
    fontFamily: {
      control: "text",
      name: "--yn-quantity-font-family",
      description: "数字字体栈；`inherit` 可跟随页面字体。",
      table: {
        category: "CSS Variables",
        defaultValue: { summary: "Zimula, ui-serif, …（组件内置，可被 inherit 覆盖）" }
      }
    },
    fontSize: {
      control: "text",
      name: "--yn-quantity-font-size",
      description: "数字字号。",
      table: { category: "CSS Variables", defaultValue: { summary: "16px" } }
    },
    letterSpacing: {
      control: "text",
      name: "--yn-quantity-letter-spacing",
      description: "数字字距。",
      table: { category: "CSS Variables", defaultValue: { summary: "-0.01em" } }
    },
    valueMinWidth: {
      control: "text",
      name: "--yn-quantity-value-min-width",
      description: "数字区最小宽度。",
      table: { category: "CSS Variables", defaultValue: { summary: "2.5ch" } }
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
  render: renderQuantity
} satisfies Meta<Args>;

export default meta;

type Story = StoryObj<Args>;

const getQuantityInput = (root: HTMLElement) => {
  const el = root.querySelector("yn-quantity");
  if (!(el instanceof HTMLElement)) return null;
  return (el as YnQuantity).shadowRoot?.querySelector<HTMLInputElement>(".value") ?? null;
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

const playQuantityInteractions: NonNullable<Story["play"]> = async ({ canvasElement, step }) => {
  await step("点击加号：数量变为 2 并派发 change", async () => {
    const quantity = canvasElement.querySelector("yn-quantity");
    const buttons = getQuantityButtons(canvasElement);
    const input = getQuantityInput(canvasElement);
    if (!quantity || !buttons || !input) throw new Error("未找到 yn-quantity");

    let detail = -1;
    quantity.addEventListener(
      "change",
      (event) => {
        detail = (event as CustomEvent<{ value: number }>).detail.value;
      },
      { once: true }
    );

    buttons.increase.click();
    if (Number(input.value) !== 2) throw new Error("加号后输入框值应为 2");
    if (detail !== 2) throw new Error("change 事件 detail.value 应为 2");
  });

  await step("点击减号：数量回到 1", async () => {
    const buttons = getQuantityButtons(canvasElement);
    const input = getQuantityInput(canvasElement);
    if (!buttons || !input) throw new Error("未找到 yn-quantity");
    buttons.decrease.click();
    if (Number(input.value) !== 1) throw new Error("减号后输入框值应为 1");
  });
};

export const Default: Story = {
  play: playQuantityInteractions
};

export const Disabled: Story = {
  name: "禁用",
  args: {
    disabled: true,
    value: 3
  }
};

export const ProductDemo: Story = {
  name: "产品页 Demo",
  render: (args) => html`
    <div
      style="background:var(--yn-color-bg,#f2efea);color:var(--yn-color-text,#241f21);min-height:100vh;padding:48px 24px;display:flex;justify-content:center;"
    >
      <article
        style="width:min(420px,100%);background:var(--yn-color-surface,rgba(255,255,255,0.35));border:1px solid var(--yn-color-border);border-radius:20px;padding:28px 24px 32px;"
      >
        <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;opacity:0.62;">
          Urban · Explore
        </p>
        <h1 style="margin:0 0 12px;font-size:28px;font-weight:400;line-height:1.15;">
          Espreguiçadeira Sun Lounger Plaza
        </h1>
        <p style="margin:0 0 24px;font-size:15px;line-height:1.5;opacity:0.72;">
          Mobiliário urbano sustentável, pensado para integrar na paisagem.
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
  `,
  play: playQuantityInteractions
};

export const Compact: Story = {
  name: "紧凑尺寸",
  args: {
    height: "36px",
    buttonSize: "30px",
    fontSize: "14px",
    fontFamily: "inherit"
  }
};
