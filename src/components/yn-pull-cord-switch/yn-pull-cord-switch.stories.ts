import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import "./yn-pull-cord-switch";
import type { YnPullCordSwitchSize, YnPullCordSwitchVariant } from "./yn-pull-cord-switch";
import {
  applyPullCordShellBackground,
  shellBackgroundFromVariant
} from "./pull-cord-shell-bg";

type Args = {
  checked: boolean;
  disabled: boolean;
  variant: YnPullCordSwitchVariant;
  size: YnPullCordSwitchSize;
  toggleThreshold?: number;
  heightOverride?: string;
  cardSlot?: string;
  onChange?: (event: CustomEvent<{ checked: boolean }>) => void;
};

const shellShellStyle = (variant: YnPullCordSwitchVariant, checked: boolean) => `
  background: ${shellBackgroundFromVariant(variant, checked)};
  border-radius: var(--yn-pull-cord-switch-radius, 12px);
  overflow: hidden;
  transition: background 0.45s cubic-bezier(0.22, 1, 0.36, 1);
`;

const renderSwitch = (args: Args, updateArgs?: (patch: Partial<Args>) => void) => html`
  <div class="pull-cord-shell" style=${shellShellStyle(args.variant, args.checked)}>
    <yn-pull-cord-switch
      ?checked=${args.checked}
      ?disabled=${args.disabled}
      variant=${args.variant}
      size=${args.size}
      .toggleThreshold=${args.toggleThreshold}
      style=${args.heightOverride ? `--yn-pull-cord-switch-height:${args.heightOverride};` : ""}
      @change=${(event: Event) => {
        const detail = (event as CustomEvent<{ checked: boolean }>).detail;
        const shell = (event.target as HTMLElement).parentElement;
        if (shell) {
          applyPullCordShellBackground(shell, event.target as HTMLElement, detail.checked);
        }
        void updateArgs?.({ checked: detail.checked });
        args.onChange?.(event as CustomEvent<{ checked: boolean }>);
      }}
    >
      ${args.cardSlot ? html`<span>${args.cardSlot}</span>` : ""}
    </yn-pull-cord-switch>
  </div>
`;

const meta = {
  title: "Components/YnPullCordSwitch",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "抽绳开关：向下拖拽绳端卡片切换开/关，松手后绳子以 Verlet 多段物理弹性回弹。\n\n**尺寸**：`size=\"mini\" | \"small\" | \"medium\"`（默认 `mini`），联动高度、绳长、卡片与拉动阈值。\n\n**变体**：`variant=\"default\"` 为深色工作室风格；`variant=\"floema\"` 为项目 Floema 暖色预设。仍可通过 CSS 变量微调。\n\n**背景（外部容器）**：组件 **不绘制** 开关区域背景；Canvas 仅绘制天花板、锚点、开灯光晕、绳子与连接线。请用外层 `div` 包裹组件，在 `change` 回调里设置包裹层 `background`（可读取组件上的 `--yn-pull-cord-switch-bg-top/bottom` 与 `bg-on-*`）。工具函数：`applyPullCordShellBackground(shell, lamp, checked)`。\n\n**事件**：拉过阈值触发 `change`，`event.detail` 为 `{ checked: boolean }`。\n\n**插槽**：默认插槽内容渲染在绳端卡片内；未提供插槽时显示内置 ON/OFF 回退文案（插槽优先）。\n\n**样式隔离**：组件使用 Shadow DOM，外部样式默认不穿透。公开 CSS 变量见各变体；常用：\n- `--yn-pull-cord-switch-height` / `--yn-pull-cord-switch-radius`\n- `--yn-pull-cord-switch-bg-top` / `--yn-pull-cord-switch-bg-bottom`（及 `bg-on-*`，供外层背景使用）\n- `--yn-pull-cord-switch-accent` / `--yn-pull-cord-switch-vignette`\n- `--yn-pull-cord-switch-card-*` 系列\n\n**Tree Shaking 导入**：\n- 全量：`import \"yn-web-component/define\"`\n- 按需（推荐）：`import \"yn-web-component/components/yn-pull-cord-switch\"`"
      }
    }
  },
  args: {
    checked: false,
    disabled: false,
    variant: "default",
    size: "mini",
    cardSlot: ""
  },
  argTypes: {
    checked: {
      control: "boolean",
      description: "开关是否开启。",
      table: { defaultValue: { summary: "false" } }
    },
    disabled: {
      control: "boolean",
      description: "是否禁用拖拽交互。",
      table: { defaultValue: { summary: "false" } }
    },
    variant: {
      control: "select",
      options: ["default", "floema"],
      description:
        "视觉变体。`default` 深色；`floema` 内置暖色 Floema 主题，无需手动配置全套 CSS 变量。",
      table: { defaultValue: { summary: "default" } }
    },
    size: {
      control: "select",
      options: ["mini", "small", "medium"],
      description: "尺寸。默认 `mini`（260px 高）；`medium` 为最大尺寸（360px）。",
      table: { defaultValue: { summary: "mini" } }
    },
    toggleThreshold: {
      control: { type: "number", min: 40, max: 110, step: 2 },
      name: "toggle-threshold",
      description: "拉动阈值（px）。未设置时使用当前 size 内置值（mini 为 52，medium 为 72）。",
      table: { defaultValue: { summary: "（随 size）" } }
    },
    heightOverride: {
      control: "text",
      name: "--yn-pull-cord-switch-height",
      description: "可选：覆写组件高度（一般无需设置，由 size 决定）。",
      table: { category: "CSS Variables", defaultValue: { summary: "（随 size）" } }
    },
    cardSlot: {
      control: "text",
      description: "默认插槽卡片内容（留空使用内置 ON/OFF）。",
      table: { category: "Slots", defaultValue: { summary: "（内置 ON/OFF）" } }
    },
    onChange: {
      name: "change",
      action: "change",
      control: false,
      description: "拉过阈值切换时触发。",
      table: {
        category: "Events",
        type: { summary: "CustomEvent<{ checked: boolean }>" }
      }
    }
  },
  render: (args, { updateArgs }) => renderSwitch(args, updateArgs)
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

const playPullCordInteractions: NonNullable<Story["play"]> = async ({ canvasElement, step }) => {
  const shell = canvasElement.querySelector(".pull-cord-shell");
  const el = canvasElement.querySelector("yn-pull-cord-switch");
  const root = el instanceof HTMLElement ? el.shadowRoot : null;
  if (!root) return;

  await step("组件已挂载", async () => {
    const canvas = root.querySelector("canvas.rope");
    if (!canvas) {
      throw new Error("未找到绳子 canvas");
    }
    if (!shell) {
      throw new Error("未找到外部包裹层 .pull-cord-shell");
    }
  });

  await step("默认关闭态文案", async () => {
    const label = root.querySelector(".card__label");
    if (label?.textContent?.trim() !== "OFF") {
      throw new Error("默认应为 OFF 文案");
    }
  });
};

export const Default: Story = {
  args: { variant: "default" },
  play: playPullCordInteractions
};

export const Floema: Story = {
  name: "Floema",
  args: { variant: "floema", size: "medium" },
  play: playPullCordInteractions,
  parameters: {
    docs: {
      description: {
        story: "使用 `variant=\"floema\"` 即可应用暖色预设，一般只需再设置高度等布局变量。"
      }
    }
  }
};

export const Sizes: Story = {
  name: "尺寸对比",
  render: (args, ctx) => html`
    <div
      style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;padding:8px;align-items:end;"
    >
      ${(["mini", "small", "medium"] as const).map(
        (size) => html`
          <div>
            <p style="margin:0 0 8px;font-size:12px;font-weight:600;color:#666;">${size}</p>
            ${renderSwitch({ ...args, size }, ctx.updateArgs)}
          </div>
        `
      )}
    </div>
  `
};

export const FloemaScene: Story = {
  name: "Floema 工作室场景",
  args: { variant: "floema", size: "medium" },
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        story: "与 `demos/pull-cord-switch-demo.html` 相同：`variant=\"floema\"` + 页面布局。"
      }
    }
  },
  render: (args, ctx) => html`
    <div
      style="
        min-height: 100vh;
        padding: 32px 20px;
        background:
          radial-gradient(circle at 14% 12%, rgba(184, 125, 85, 0.24), transparent 32%),
          linear-gradient(160deg, #efe8d8 0%, #e8e1d0 46%, #d8d1bd 100%);
        font-family: Inter, system-ui, sans-serif;
        color: #20231d;
      "
    >
      <div style="max-width: 400px; margin: 0 auto 18px; text-align: center;">
        <p
          style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#586247;"
        >
          variant=floema
        </p>
        <h2
          style="margin:0;font-family:Georgia,serif;font-weight:400;font-size:2rem;letter-spacing:-0.04em;"
        >
          工作室吊灯
        </h2>
      </div>
      <div
        style="max-width:400px;margin:0 auto;border-radius:28px;overflow:hidden;box-shadow:0 28px 80px rgba(64,56,42,0.14);"
      >
        ${renderSwitch(args, ctx.updateArgs)}
      </div>
    </div>
  `
};

export const Variants: Story = {
  name: "变体对比",
  render: (args, ctx) => html`
    <div
      style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px;padding:8px;"
    >
      <div>
        <p style="margin:0 0 8px;font-size:12px;font-weight:600;color:#666;">default</p>
        ${renderSwitch({ ...args, variant: "default", checked: false }, ctx.updateArgs)}
      </div>
      <div>
        <p style="margin:0 0 8px;font-size:12px;font-weight:600;color:#666;">floema</p>
        ${renderSwitch({ ...args, variant: "floema", checked: true }, ctx.updateArgs)}
      </div>
    </div>
  `
};

export const Checked: Story = {
  args: { checked: true, variant: "default" }
};

export const CustomCard: Story = {
  args: { variant: "floema", cardSlot: "卧室灯" }
};

export const CustomAccent: Story = {
  name: "覆写单个变量",
  args: { variant: "floema", size: "medium" },
  render: (args, ctx) => html`
    <div class="pull-cord-shell" style=${shellShellStyle(args.variant, args.checked)}>
      <yn-pull-cord-switch
        ?checked=${args.checked}
        variant=${args.variant}
        size=${args.size}
        style="--yn-pull-cord-switch-accent:rgba(255,140,90,0.45);"
        @change=${(event: Event) => {
          const detail = (event as CustomEvent<{ checked: boolean }>).detail;
          const shell = (event.target as HTMLElement).parentElement;
          if (shell) {
            applyPullCordShellBackground(shell, event.target as HTMLElement, detail.checked);
          }
          void ctx.updateArgs({ checked: detail.checked });
          args.onChange?.(event as CustomEvent<{ checked: boolean }>);
        }}
      ></yn-pull-cord-switch>
    </div>
  `,
  parameters: {
    docs: {
      description: {
        story: "在 `variant=\"floema\"` 基础上仅覆写 `--yn-pull-cord-switch-accent` 等少量变量。"
      }
    }
  }
};

export const Disabled: Story = {
  args: { disabled: true, checked: true, variant: "floema" }
};

export const ExternalBackground: Story = {
  name: "外部包裹层背景",
  args: {
    variant: "floema",
    size: "medium"
  },
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        story:
          "推荐用法：用 `div.pull-cord-shell` 包裹组件，在 `change` 里调用 `applyPullCordShellBackground(shell, lamp, detail.checked)` 同步包裹层渐变。本示例外层页面另有花纹底，包裹层仍随开关切换 Floema 预设色。"
      }
    }
  },
  render: (args, { updateArgs }) => html`
    <div
      style="
        min-height: 100vh;
        padding: 32px 20px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 16px;
        font-family: Inter, system-ui, sans-serif;
        background:
          repeating-linear-gradient(
            -12deg,
            rgba(88, 98, 71, 0.06) 0 12px,
            transparent 12px 24px
          ),
          linear-gradient(165deg, #efe8d8 0%, #e0d6c4 50%, #d0c6b2 100%);
      "
    >
      <p style="margin:0;font-size:12px;color:#586247;font-weight:600;">
        花纹为页面底 · .pull-cord-shell 在 change 回调中更新背景
      </p>
      <div
        class="pull-cord-shell"
        style="
          width: min(100%, 400px);
          border-radius: 28px;
          overflow: hidden;
          box-shadow: 0 24px 64px rgba(64, 56, 42, 0.12);
          ${shellShellStyle(args.variant, args.checked)}
        "
      >
        <yn-pull-cord-switch
          ?checked=${args.checked}
          ?disabled=${args.disabled}
          variant=${args.variant}
          size=${args.size}
          @change=${(event: Event) => {
            const detail = (event as CustomEvent<{ checked: boolean }>).detail;
            const lamp = event.target as HTMLElement;
            const shell = lamp.parentElement;
            if (shell) {
              applyPullCordShellBackground(shell, lamp, detail.checked);
            }
            void updateArgs({ checked: detail.checked });
            args.onChange?.(event as CustomEvent<{ checked: boolean }>);
          }}
        ></yn-pull-cord-switch>
      </div>
    </div>
  `,
  play: async ({ canvasElement, step }) => {
    const shell = canvasElement.querySelector(".pull-cord-shell") as HTMLElement | null;
    const lamp = canvasElement.querySelector("yn-pull-cord-switch") as HTMLElement | null;
    await step("初始化包裹层背景", async () => {
      if (!shell || !lamp) {
        throw new Error("缺少 shell 或组件");
      }
      applyPullCordShellBackground(shell, lamp, lamp.hasAttribute("checked"));
    });
  }
};
