import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import "../components/yn-input/yn-input";
import "../components/yn-quantity/yn-quantity";
import "../components/yn-button/yn-button";

const meta = {
  title: "Foundations/Theme",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `全局主题 token 定义于 \`src/styles/theme.css\`，通过 \`html[data-yn-theme="light|dark"]\` 或 Storybook 工具栏「主题」切换。

\`\`\`ts
import "yn-web-component/theme.css";
\`\`\`

各组件 \`--yn-*\` 变量默认引用 \`--yn-color-*\`，可在组件 \`style\` 上单独覆写。`
      }
    }
  }
} satisfies Meta;

export default meta;

type Story = StoryObj;

export const TokenPreview: Story = {
  name: "Token 预览",
  render: () => html`
    <div
      style="min-height:100vh;padding:32px;background:var(--yn-color-bg);color:var(--yn-color-text);display:grid;gap:24px;max-width:720px;"
    >
      <section>
        <h2 style="margin:0 0 12px;font-size:18px;">表面与文字</h2>
        <div style="display:grid;gap:8px;font-size:13px;line-height:1.6;">
          <div style="padding:12px;background:var(--yn-color-bg-elevated);border:1px solid var(--yn-color-border);border-radius:8px;">
            --yn-color-bg-elevated
          </div>
          <div style="padding:12px;background:var(--yn-color-surface);border:1px solid var(--yn-color-border);border-radius:8px;">
            --yn-color-surface
          </div>
          <p style="margin:0;color:var(--yn-color-text-muted);">--yn-color-text-muted</p>
        </div>
      </section>
      <section>
        <h2 style="margin:0 0 12px;font-size:18px;">组件示例</h2>
        <div style="display:flex;flex-wrap:wrap;align-items:center;gap:16px;">
          <yn-input placeholder="搜索…" style="--yn-input-font-family:inherit;"></yn-input>
          <yn-quantity .value=${2} style="--yn-quantity-font-family:inherit;"></yn-quantity>
          <yn-button variant="primary">Primary</yn-button>
          <yn-button variant="dark">Dark</yn-button>
        </div>
      </section>
    </div>
  `
};
