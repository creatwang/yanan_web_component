import type { Meta, StoryObj } from "@storybook/web-components";
import { expect } from "@storybook/test";
import { html, nothing } from "lit";
import type { YnSkuSelector } from "./yn-sku-selector";
import type { YnSkuChangeDetail, YnSkuItem, YnSkuSubmitDetail, YnSkuSubmitEvent, YnSkuSubmitInstance } from "./types";
import "./yn-sku-selector";

const demoSkus = [
  { weight: "1kg", color: "红色", size: "37", price: 65, id: "1" },
  { weight: "1kg", color: "红色", size: "38", price: 65, id: "2" },
  { weight: "1kg", color: "黑色", size: "38", price: 68, id: "3" },
  { weight: "1kg", color: "黑色", size: "40", price: 68, id: "4" },
  { weight: "2kg", color: "黑色", size: "38", price: 72, id: "5" },
  { weight: "2kg", color: "黑色", size: "39", price: 72, id: "6" },
  { weight: "2kg", color: "白色", size: "38", price: 75, id: "7" },
  { weight: "2kg", color: "白色", size: "41", price: 75, id: "8" },
  { weight: "3kg", color: "白色", size: "39", price: 80, id: "9" },
  { weight: "3kg", color: "蓝色", size: "40", price: 82, id: "10" },
  { weight: "3kg", color: "蓝色", size: "42", price: 82, id: "11" }
];

const jerseySkus = [
  { size: "S", price: 65, id: "s" },
  { size: "M", price: 65, id: "m" },
  { size: "L", price: 65, id: "l" },
  { size: "XL", price: 65, id: "xl" },
  { size: "2XL", price: 65, id: "2xl" }
];

const euroIcon = `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 10h11M5 14h11M16 7a7 7 0 1 0 0 10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`;

const sleep = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms));

const mockAddToCart = async (skuId: string | number | undefined, delayMs = 1200) => {
  await sleep(delayMs);
  if (skuId == null) throw new Error("sku id missing");
  return { ok: true, skuId };
};

type Args = {
  skus: YnSkuItem[];
  currency: string;
  currencyIcon: string;
  simple: boolean;
  submitLabel: string;
  incompleteHint: string;
  labels: Record<string, string>;
  disabled: boolean;
  optionHeight: string;
  optionMinWidth: string;
  optionBorderColor: string;
  optionActiveBg: string;
  optionActiveColor: string;
  submitHeight: string;
  submitBg: string;
  submitColor: string;
  submitHoverBg: string;
  submitHoverColor: string;
  hintColor: string;
  onChange?: (event: CustomEvent<YnSkuChangeDetail>) => void;
  onSubmit?: (detail: YnSkuSubmitDetail, instance: YnSkuSubmitInstance) => void;
  title?: unknown;
};

const skuStyle = (args: Args) =>
  [
    `--yn-sku-selector-option-height:${args.optionHeight}`,
    `--yn-sku-selector-option-min-width:${args.optionMinWidth}`,
    `--yn-sku-selector-option-border-color:${args.optionBorderColor}`,
    `--yn-sku-selector-option-active-bg:${args.optionActiveBg}`,
    `--yn-sku-selector-option-active-color:${args.optionActiveColor}`,
    `--yn-sku-selector-submit-height:${args.submitHeight}`,
    `--yn-sku-selector-submit-bg:${args.submitBg}`,
    `--yn-sku-selector-submit-color:${args.submitColor}`,
    `--yn-sku-selector-submit-hover-bg:${args.submitHoverBg}`,
    `--yn-sku-selector-submit-hover-color:${args.submitHoverColor}`,
    `--yn-sku-selector-hint-color:${args.hintColor}`
  ].join(";");

const renderSkuSelector = (args: Args, title?: unknown, options?: { autoDone?: boolean }) => html`
  <yn-sku-selector
    .skus=${args.skus}
    currency=${args.currency}
    currency-icon=${args.currencyIcon}
    ?simple=${args.simple}
    submit-label=${args.submitLabel}
    incomplete-hint=${args.incompleteHint}
    .labels=${args.labels}
    ?disabled=${args.disabled}
    style=${skuStyle(args)}
    @change=${(event: Event) => args.onChange?.(event as CustomEvent<YnSkuChangeDetail>)}
    @submit=${(event: Event) => {
      const submitEvent = event as YnSkuSubmitEvent;
      args.onSubmit?.(submitEvent.detail, submitEvent.instance);
      if (options?.autoDone !== false) {
        submitEvent.instance.done();
      }
    }}
  >
    ${title ?? nothing}
  </yn-sku-selector>
`;

const renderAsyncSubmitDemo = (args: Args, title?: unknown) => html`
  <div data-async-demo style="padding:24px;max-width:420px;color:#000;">
    <p
      data-async-status
      style="margin:0 0 16px;font-size:13px;line-height:1.5;min-height:1.5em;color:#555;"
    >
      选齐规格后点击加购，将模拟约 1.2s 异步请求；请求完成前按钮保持 loading 且整组规格禁用。
    </p>
    <yn-sku-selector
      .skus=${args.skus}
      currency=${args.currency}
      currency-icon=${args.currencyIcon}
      ?simple=${args.simple}
      submit-label=${args.submitLabel}
      incomplete-hint=${args.incompleteHint}
      .labels=${args.labels}
      ?disabled=${args.disabled}
      style=${skuStyle(args)}
      @change=${(event: Event) => args.onChange?.(event as CustomEvent<YnSkuChangeDetail>)}
      @submit=${async (event: Event) => {
        const submitEvent = event as YnSkuSubmitEvent;
        args.onSubmit?.(submitEvent.detail, submitEvent.instance);
        const root = (event.currentTarget as HTMLElement).closest("[data-async-demo]");
        const status = root?.querySelector<HTMLElement>("[data-async-status]");
        if (status) status.textContent = "加购请求中…";
        try {
          const result = await mockAddToCart(submitEvent.detail.sku.id);
          if (status) status.textContent = `加购成功 · SKU ${result.skuId}`;
        } catch (error) {
          if (status) status.textContent = `加购失败 · ${(error as Error).message}`;
        } finally {
          submitEvent.instance.done();
        }
      }}
    >
      ${title ?? nothing}
    </yn-sku-selector>
    <pre
      data-async-code
      style="margin:20px 0 0;padding:14px;border:1px solid #ddd;border-radius:8px;font-size:11px;line-height:1.6;overflow:auto;background:#fafafa;"
    ><code>host.addEventListener("submit", async (event) => {
  const { detail, instance } = event;
  const { sku, selections } = detail;
  try {
    await fetch("/api/cart", {
      method: "POST",
      body: JSON.stringify({ sku, selections })
    });
  } finally {
    instance.done(); // 异步结束后取消 loading
  }
});</code></pre>
  </div>
`;

const componentDescription = `SKU 规格选择器：多维规格联动、加购校验、submit 异步回调与 simple 快速加购模式。

## 导入（Tree Shaking）

\`\`\`ts
// 推荐：按需入口
import { YnSkuSelector } from "yn-web-component/components/yn-sku-selector";

// 全量注册
import "yn-web-component/define";
\`\`\`

## 样式隔离

组件使用 **Shadow DOM**，外部样式默认不穿透；背景色等展示样式请由外部容器与 \`--yn-sku-selector-*\` CSS 变量决定。`;

const meta = {
  title: "Components/YnSkuSelector",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: componentDescription
      }
    }
  },
  args: {
    skus: demoSkus,
    currency: "€",
    currencyIcon: "",
    simple: false,
    submitLabel: "ADD TO CART",
    incompleteHint: "请选择 {label}",
    labels: { weight: "Weight", color: "Color", size: "Size" },
    disabled: false,
    optionHeight: "44px",
    optionMinWidth: "44px",
    optionBorderColor: "#000",
    optionActiveBg: "#000",
    optionActiveColor: "#fff",
    submitHeight: "52px",
    submitBg: "#000",
    submitColor: "#fff",
    submitHoverBg: "transparent",
    submitHoverColor: "#000",
    hintColor: "#c0392b"
  },
  argTypes: {
    skus: {
      control: "object",
      description: "SKU 列表。规格字段为动态 key；`price` / `id` / `stock` / `skuId` 为元数据字段。",
      table: { defaultValue: { summary: "[]" } }
    },
    currency: {
      control: "text",
      description: "价格货币字符，展示在按钮价格后（未设置 currency-icon 时）。",
      table: { defaultValue: { summary: "€" } }
    },
    currencyIcon: {
      control: "text",
      name: "currency-icon",
      description: "货币 SVG 图标字符串；设置后价格旁展示图标而非 currency 文本。",
      table: { defaultValue: { summary: '""' } }
    },
    simple: {
      control: "boolean",
      description: "简单模式：仅展示规格按钮，无 title / 提示 / 加购按钮；选齐规格后自动触发 submit。",
      table: { defaultValue: { summary: "false" } }
    },
    submitLabel: {
      control: "text",
      name: "submit-label",
      description: "加购按钮文案。",
      table: { defaultValue: { summary: "ADD TO CART" } }
    },
    incompleteHint: {
      control: "text",
      name: "incomplete-hint",
      description: "未选齐规格时点击加购的提示模板，`{label}` 会被替换为首个未选维度的 label（无 labels 映射时使用规格 key）。",
      table: { defaultValue: { summary: "请选择 {label}" } }
    },
    labels: {
      control: "object",
      description: "规格维度展示名映射；不传或某 key 未配置时，对应维度标签不展示。",
      table: { defaultValue: { summary: "{}" } }
    },
    disabled: {
      control: "boolean",
      description: "禁用整个选择器。",
      table: { defaultValue: { summary: "false" } }
    },
    optionHeight: {
      control: "text",
      name: "--yn-sku-selector-option-height",
      description: "规格按钮高度。",
      table: { category: "CSS Variables", defaultValue: { summary: "44px" } }
    },
    optionMinWidth: {
      control: "text",
      name: "--yn-sku-selector-option-min-width",
      description: "规格按钮最小宽度。",
      table: { category: "CSS Variables", defaultValue: { summary: "44px" } }
    },
    optionBorderColor: {
      control: "color",
      name: "--yn-sku-selector-option-border-color",
      description: "规格按钮边框颜色。",
      table: { category: "CSS Variables", defaultValue: { summary: "currentColor" } }
    },
    optionActiveBg: {
      control: "color",
      name: "--yn-sku-selector-option-active-bg",
      description: "选中规格按钮背景。",
      table: { category: "CSS Variables", defaultValue: { summary: "currentColor" } }
    },
    optionActiveColor: {
      control: "color",
      name: "--yn-sku-selector-option-active-color",
      description: "选中规格按钮文字颜色。",
      table: { category: "CSS Variables", defaultValue: { summary: "#fff" } }
    },
    submitHeight: {
      control: "text",
      name: "--yn-sku-selector-submit-height",
      description: "加购按钮高度。",
      table: { category: "CSS Variables", defaultValue: { summary: "52px" } }
    },
    submitBg: {
      control: "color",
      name: "--yn-sku-selector-submit-bg",
      description: "加购按钮背景。",
      table: { category: "CSS Variables", defaultValue: { summary: "currentColor" } }
    },
    submitColor: {
      control: "color",
      name: "--yn-sku-selector-submit-color",
      description: "加购按钮文字颜色。",
      table: { category: "CSS Variables", defaultValue: { summary: "#fff" } }
    },
    submitHoverBg: {
      control: "text",
      name: "--yn-sku-selector-submit-hover-bg",
      description: "加购按钮悬停背景。",
      table: { category: "CSS Variables", defaultValue: { summary: "transparent" } }
    },
    submitHoverColor: {
      control: "color",
      name: "--yn-sku-selector-submit-hover-color",
      description: "加购按钮悬停文字颜色。",
      table: { category: "CSS Variables", defaultValue: { summary: "currentColor" } }
    },
    hintColor: {
      control: "color",
      name: "--yn-sku-selector-hint-color",
      description: "校验提示文字颜色。",
      table: { category: "CSS Variables", defaultValue: { summary: "#c0392b" } }
    },
    onChange: {
      name: "change",
      control: false,
      action: "change",
      description: "规格变更时触发，返回当前选中数据与是否可加购。",
      table: {
        category: "Events",
        type: {
          summary: "CustomEvent<{ selections: Record<string, string | number>; sku: object | null; ready: boolean; missingKeys: string[] }>"
        }
      }
    },
    onSubmit: {
      name: "submit",
      control: false,
      action: "submit",
      description: "满足加购条件时触发；`instance` 为事件第二参数（`event.instance`），异步结束后调用 `instance.done()`。",
      table: {
        category: "Events",
        type: {
          summary: "YnSkuSubmitEvent — detail: { selections, sku }; event.instance: { done(): void }"
        }
      }
    },
    title: {
      description: "标题区域，可放置任意标题元素。simple 模式下不渲染。",
      table: { category: "Slots" }
    }
  },
  render: (args) =>
    html`
      <div style="padding:24px;max-width:480px;color:#000;">
        ${renderSkuSelector(
          args,
          html`<h1 slot="title" style="margin:0 0 8px;font-size:clamp(28px,8vw,48px);font-weight:900;text-transform:uppercase;line-height:1;letter-spacing:-0.04em;">Jersey - Select</h1>`
        )}
      </div>
    `
} satisfies Meta<Args>;

export default meta;

type Story = StoryObj<Args>;

const getHost = (root: HTMLElement) => root.querySelector("yn-sku-selector") as YnSkuSelector | null;

const clickOption = (host: YnSkuSelector, label: string) => {
  const btn = [...(host.shadowRoot?.querySelectorAll<HTMLButtonElement>(".option") ?? [])].find(
    (node) => node.querySelector(".option-label")?.textContent?.trim() === label
  );
  if (!btn) throw new Error(`option ${label} not found`);
  btn.click();
};

const playDefaultInteractions: NonNullable<Story["play"]> = async ({ canvasElement, step }) => {
  const host = getHost(canvasElement);
  if (!host?.shadowRoot) return;

  await step("未选齐时点击加购应展示提示", async () => {
    host.shadowRoot?.querySelector<HTMLButtonElement>(".submit")?.click();
    await host.updateComplete;
    const hint = host.shadowRoot?.querySelector(".hint")?.textContent ?? "";
    expect(hint.length).toBeGreaterThan(0);
  });

  await step("选齐规格后 change.ready 为 true", async () => {
    let ready = false;
    host.addEventListener(
      "change",
      (event) => {
        ready = (event as CustomEvent<YnSkuChangeDetail>).detail.ready;
      },
      { once: true }
    );
    clickOption(host, "1kg");
    clickOption(host, "红色");
    clickOption(host, "37");
    await host.updateComplete;
    expect(ready).toBe(true);
  });

  await step("选齐后 submit 触发且 done 后取消 loading", async () => {
    let loading = false;
    host.addEventListener(
      "submit",
      (event) => {
        loading = host.shadowRoot?.querySelector(".submit")?.classList.contains("is-loading") ?? false;
        (event as unknown as YnSkuSubmitEvent).instance.done();
      },
      { once: true }
    );
    host.shadowRoot?.querySelector<HTMLButtonElement>(".submit")?.click();
    await host.updateComplete;
    expect(loading).toBe(true);
    await host.updateComplete;
    expect(host.shadowRoot?.querySelector(".submit")?.classList.contains("is-loading")).toBe(false);
  });
};

export const Default: Story = {
  play: playDefaultInteractions
};

export const WithoutSpecLabels: Story = {
  name: "无规格标签",
  args: {
    labels: {},
    incompleteHint: "请选择 {label}"
  },
  render: (args) => html`
    <div style="padding:24px;max-width:420px;color:#000;">
      ${renderSkuSelector(args)}
    </div>
  `
};

export const JerseyStyle: Story = {
  name: "Jersey 单维规格",
  args: {
    skus: jerseySkus,
    labels: { size: "Size" },
    submitLabel: "Add to cart"
  },
  render: (args) => html`
    <div style="padding:24px;max-width:420px;color:#000;">
      ${renderSkuSelector(
        args,
        html`<h1 slot="title" style="margin:0 0 24px;font-size:clamp(28px,8vw,40px);font-weight:900;text-transform:uppercase;line-height:1;">Jersey - No Drug</h1>`
      )}
    </div>
  `,
  play: playDefaultInteractions
};

export const CurrencyIcon: Story = {
  name: "货币 SVG",
  args: {
    skus: jerseySkus,
    labels: { size: "Size" },
    currency: "",
    currencyIcon: euroIcon
  },
  render: (args) => html`
    <div style="padding:24px;max-width:420px;color:#000;">
      ${renderSkuSelector(args)}
    </div>
  `
};

export const SimpleMode: Story = {
  name: "Simple 快速加购",
  args: {
    simple: true,
    skus: jerseySkus
  },
  render: (args) => html`
    <div style="padding:16px;max-width:320px;color:#000;border:1px solid #000;">
      <p style="margin:0 0 12px;font-size:14px;font-weight:700;">Jersey - No Drug</p>
      ${renderSkuSelector(args)}
    </div>
  `,
  play: async ({ canvasElement, step }) => {
    const host = getHost(canvasElement);
    if (!host?.shadowRoot) return;

    await step("simple 模式选齐后自动 submit", async () => {
      let submitted = false;
      host.addEventListener(
        "submit",
        (event) => {
          submitted = true;
          (event as unknown as YnSkuSubmitEvent).instance.done();
        },
        { once: true }
      );
      clickOption(host, "M");
      await host.updateComplete;
      expect(submitted).toBe(true);
    });
  }
};

export const ListItemCompact: Story = {
  name: "列表项紧凑",
  args: {
    simple: true,
    skus: jerseySkus,
    optionHeight: "40px",
    optionMinWidth: "40px"
  },
  render: (args) => html`
    <div style="padding:16px;display:grid;gap:12px;max-width:360px;color:#000;">
      ${[1, 2].map(
        (index) => html`
          <article style="display:flex;align-items:center;justify-content:space-between;gap:12px;border:1px solid #000;padding:12px;">
            <div style="min-width:0;">
              <p style="margin:0;font-size:13px;font-weight:700;">Product ${index}</p>
              <p style="margin:4px 0 0;font-size:12px;opacity:0.7;">65.00 €</p>
            </div>
            <div style="flex:1;min-width:0;max-width:220px;">
              ${renderSkuSelector(args)}
            </div>
          </article>
        `
      )}
    </div>
  `
};

const playAsyncSubmit: NonNullable<Story["play"]> = async ({ canvasElement, step }) => {
  const host = getHost(canvasElement);
  if (!host?.shadowRoot) return;

  await step("选齐规格并提交，异步期间保持 loading", async () => {
    clickOption(host, "M");
    await host.updateComplete;

    host.shadowRoot?.querySelector<HTMLButtonElement>(".submit")?.click();
    await host.updateComplete;

    expect(host.shadowRoot?.querySelector(".submit")?.classList.contains("is-loading")).toBe(true);
    expect(host.shadowRoot?.querySelector<HTMLButtonElement>(".submit")?.disabled).toBe(true);
    expect(host.shadowRoot?.querySelector<HTMLButtonElement>(".option")?.disabled).toBe(true);

    await sleep(1300);
    await host.updateComplete;

    expect(host.shadowRoot?.querySelector(".submit")?.classList.contains("is-loading")).toBe(false);
    expect(host.shadowRoot?.querySelector<HTMLButtonElement>(".submit")?.disabled).toBe(false);

    const status = canvasElement.querySelector("[data-async-status]")?.textContent ?? "";
    expect(status).toContain("加购成功");
  });
};

export const AsyncSubmit: Story = {
  name: "异步加购",
  args: {
    skus: jerseySkus,
    labels: { size: "Size" },
    submitLabel: "Add to cart"
  },
  render: (args) =>
    renderAsyncSubmitDemo(
      args,
      html`<h1 slot="title" style="margin:0 0 20px;font-size:clamp(24px,7vw,36px);font-weight:900;text-transform:uppercase;line-height:1;">Jersey - No Drug</h1>`
    ),
  parameters: {
    docs: {
      description: {
        story:
          "演示 `submit` 异步回调：请求完成前按钮与规格组保持 loading / 禁用，调用 `instance.done()` 后恢复。示例内使用 `mockAddToCart` 模拟约 1.2s 网络延迟。"
      }
    }
  },
  play: playAsyncSubmit
};

const playAsyncSubmitSimple: NonNullable<Story["play"]> = async ({ canvasElement, step }) => {
  const host = getHost(canvasElement);
  if (!host?.shadowRoot) return;

  await step("simple 模式选齐后自动异步 submit", async () => {
    clickOption(host, "L");
    await host.updateComplete;

    const loadingOption = [...(host.shadowRoot?.querySelectorAll<HTMLButtonElement>(".option") ?? [])].find((node) =>
      node.classList.contains("is-loading")
    );
    expect(loadingOption).toBeTruthy();
    expect(host.shadowRoot?.querySelector<HTMLButtonElement>(".option:not(.is-loading)")?.disabled).toBe(true);

    await sleep(1300);
    await host.updateComplete;

    expect(host.shadowRoot?.querySelector(".option.is-loading")).toBe(null);
    expect(host.shadowRoot?.querySelector<HTMLButtonElement>(".option")?.disabled).toBe(false);

    const status = canvasElement.querySelector("[data-async-status]")?.textContent ?? "";
    expect(status).toContain("加购成功");
  });
};

export const AsyncSubmitSimple: Story = {
  name: "Simple 异步加购",
  args: {
    simple: true,
    skus: jerseySkus,
    labels: { size: "Size" }
  },
  render: (args) => renderAsyncSubmitDemo(args),
  parameters: {
    docs: {
      description: {
        story:
          "simple 模式下选齐规格即触发 `submit`；loading 落在最后点击的规格按钮上，异步请求期间整组规格禁用，`instance.done()` 后恢复。"
      }
    }
  },
  play: playAsyncSubmitSimple
};
