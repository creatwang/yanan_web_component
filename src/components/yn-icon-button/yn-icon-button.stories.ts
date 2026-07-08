import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import "./yn-icon-button";

type Args = {
  label: string;
  variant: string;
  size: string;
  disabled: boolean;
  hitSlop: boolean;
  onClick?: (event: MouseEvent) => void;
};

const cartIcon = html`
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      fill="currentColor"
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M8.8999 7.5C8.8999 6.28498 9.88488 5.3 11.0999 5.3H12.8999C14.1149 5.3 15.0999 6.28498 15.0999 7.5C15.0999 7.77615 15.3238 8 15.5999 8C15.876 8 16.0999 7.77615 16.0999 7.5C16.0999 5.73269 14.6672 4.3 12.8999 4.3H11.0999C9.33259 4.3 7.8999 5.73269 7.8999 7.5C7.8999 7.77615 8.12376 8 8.3999 8C8.67604 8 8.8999 7.77615 8.8999 7.5ZM5.7998 15.6V9.39999H18.1998V15.6C18.1998 17.0359 17.0357 18.2 15.5998 18.2H8.39981C6.96387 18.2 5.7998 17.0359 5.7998 15.6ZM4.7998 9.29999C4.7998 8.80294 5.20275 8.39999 5.6998 8.39999H18.2998C18.7969 8.39999 19.1998 8.80294 19.1998 9.29999V15.6C19.1998 17.5882 17.588 19.2 15.5998 19.2H8.39981C6.41158 19.2 4.7998 17.5882 4.7998 15.6V9.29999Z"
    />
  </svg>
`;

const meta = {
  title: "Components/yn-icon-button",
  component: "yn-icon-button",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Flutter / Material 风格圆形图标按钮。\n\n配色：通过 `variant` 切换 default / filled / primary / tonal / outlined / inverse / danger / success；可用 `--yn-icon-button-bg`、`--yn-icon-button-hover-bg` 覆写。\n\n热区：`hit-slop=true`（默认）时四周各 +5px。\n\n事件：使用原生 `click`，在 `<yn-icon-button>` 上 `@click` 或 `addEventListener('click')` 监听（与 yn-button 相同）。`disabled=true` 时内部阻止冒泡。",
      },
    },
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "filled", "primary", "tonal", "outlined", "inverse", "danger", "success"],
    },
    size: { control: "select", options: ["small", "medium", "large"] },
    disabled: { control: "boolean" },
    hitSlop: { control: "boolean" },
    label: { control: "text" },
    onClick: {
      name: "click",
      description: "点击图标按钮时触发原生 click 事件（在 host 上监听）。",
      control: false,
      action: "click",
      table: {
        category: "Events",
        type: { summary: "MouseEvent" },
      },
    },
  },
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {
  args: { label: "购物车", variant: "default", size: "medium", hitSlop: true },
  render: (args) => html`
    <yn-icon-button
      label=${args.label}
      variant=${args.variant}
      size=${args.size}
      ?hit-slop=${args.hitSlop}
      ?disabled=${args.disabled}
      @click=${(event: Event) => args.onClick?.(event as MouseEvent)}
    >
      ${cartIcon}
    </yn-icon-button>
  `,
  play: async ({ canvasElement, step }) => {
    const host = canvasElement.querySelector("yn-icon-button");
    if (!(host instanceof HTMLElement) || !host.shadowRoot) return;

    const innerButton = host.shadowRoot.querySelector("button.icon-button");
    if (!(innerButton instanceof HTMLButtonElement)) return;

    await step("点击后 host 应收到原生 click", async () => {
      let emitted = false;
      host.addEventListener("click", () => {
        emitted = true;
      }, { once: true });
      innerButton.click();
      if (!emitted) {
        throw new Error("点击后应在 host 上触发 click");
      }
    });
  },
};

export const ClickHandler: Story = {
  name: "Click 点击事件",
  render: () => html`
    <div
      class="icon-button-click-demo"
      style="display:flex;flex-direction:column;align-items:center;gap:12px;padding:16px;"
    >
      <yn-icon-button
        label="打开购物车"
        variant="default"
        @click=${(event: Event) => {
          const root = (event.currentTarget as HTMLElement).closest(".icon-button-click-demo");
          const log = root?.querySelector("[data-click-log]");
          if (log) {
            log.textContent = `已触发 click · ${new Date().toLocaleTimeString()}`;
          }
        }}
      >
        ${cartIcon}
      </yn-icon-button>
      <p data-click-log style="margin:0;font-size:13px;color:#6f696b;">点击上方图标，验证 host 上的原生 click</p>
      <pre style="margin:0;padding:12px 14px;background:#f6f3ee;border-radius:8px;font-size:12px;line-height:1.5;">
&lt;yn-icon-button label="购物车" @click=\${openCart}&gt;
  &lt;CartIcon /&gt;
&lt;/yn-icon-button&gt;</pre
      >
    </div>
  `,
};

export const DisabledClick: Story = {
  name: "Disabled 禁用点击",
  render: () => html`
    <yn-icon-button label="不可用" variant="default" disabled @click=${() => console.log("不应触发")}>
      ${cartIcon}
    </yn-icon-button>
  `,
  play: async ({ canvasElement, step }) => {
    const host = canvasElement.querySelector("yn-icon-button");
    if (!(host instanceof HTMLElement) || !host.shadowRoot) return;
    const innerButton = host.shadowRoot.querySelector("button.icon-button");
    if (!(innerButton instanceof HTMLButtonElement)) return;

    await step("disabled 时不应向 host 冒泡 click", async () => {
      let emitted = false;
      host.addEventListener("click", () => {
        emitted = true;
      }, { once: true });
      innerButton.click();
      if (emitted) {
        throw new Error("disabled 时不应触发 host click");
      }
    });
  },
};

export const Variants: Story = {
  render: () => html`
    <div style="display:flex;flex-wrap:wrap;gap:12px;align-items:center;">
      <yn-icon-button label="default" variant="default">${cartIcon}</yn-icon-button>
      <yn-icon-button label="filled" variant="filled">${cartIcon}</yn-icon-button>
      <yn-icon-button label="primary" variant="primary">${cartIcon}</yn-icon-button>
      <yn-icon-button label="tonal" variant="tonal">${cartIcon}</yn-icon-button>
      <yn-icon-button label="outlined" variant="outlined">${cartIcon}</yn-icon-button>
      <yn-icon-button label="danger" variant="danger">${cartIcon}</yn-icon-button>
      <yn-icon-button label="success" variant="success">${cartIcon}</yn-icon-button>
    </div>
    <div style="margin-top:16px;padding:12px;background:#241f21;display:inline-flex;gap:12px;border-radius:8px;">
      <yn-icon-button label="inverse" variant="inverse">${cartIcon}</yn-icon-button>
    </div>
  `,
};

export const CustomColors: Story = {
  render: () => html`
    <yn-icon-button
      label="自定义配色"
      style="--yn-icon-button-bg:#eef2ff;--yn-icon-button-hover-bg:#c7d2fe;--yn-icon-button-color:#3730a3;"
    >
      ${cartIcon}
    </yn-icon-button>
  `,
};
