import type { Meta, StoryObj } from "@storybook/web-components";
import { fn } from "@storybook/test";
import { html, render } from "lit";
import type { YnCheckoutAddress } from "./yn-checkout-address";
import "./yn-checkout-address";
import {
  CHECKOUT_ADDRESS_COMPONENT_DOC_INTRO,
  CHECKOUT_ADDRESS_METHODS_DOC,
  checkoutAddressMethodActionArgTypes,
} from "./component-doc";
import { SAMPLE_ECHO_VALUE } from "./yn-checkout-address.stories";
import type {
  YnCheckoutAddressChangeDetail,
  YnCheckoutAddressValidateResult,
  YnCheckoutAddressValue,
} from "./types";

type Args = {
  dev: boolean;
  locale: "en" | "zh-CN";
  showEmail: boolean;
  emailRequired: boolean;
  showWhatsapp: boolean;
  whatsappRequired: boolean;
  onChange?: (detail: YnCheckoutAddressChangeDetail) => void;
  onValidate?: (result: YnCheckoutAddressValidateResult) => void;
  onReportValidity?: (passed: boolean) => void;
  onSetValue?: (value: YnCheckoutAddressValue | null) => void;
};

const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

const formatValidationResult = (result: YnCheckoutAddressValidateResult) => {
  const status = result.valid ? "valid" : "invalid";
  const lines = result.errors.map((e) => `· ${e.field}: ${e.message}`);
  const base =
    lines.length > 0
      ? `validation: ${status}（${result.errors.length} 项）\n${lines.join("\n")}`
      : `validation: ${status} · formReady: ${result.formReady}`;
  return `${base}\nvalue.countryCode: ${result.value.countryCode || "—"}`;
};

const renderValidationResult = (root: HTMLElement, result: YnCheckoutAddressValidateResult) => {
  const slot = root.querySelector<HTMLElement>("[data-validate-result]");
  if (!slot) return;
  render(html`${formatValidationResult(result)}`, slot);
};

const getCheckoutHost = (root: HTMLElement) =>
  root.querySelector<YnCheckoutAddress>("#checkout-validation-demo");

const handleValidateSubmit = (root: HTMLElement, args: Args) => {
  const host = getCheckoutHost(root);
  if (!host) return;
  const result = host.validate();
  const passed = host.reportValidity();
  args.onValidate?.(result);
  args.onReportValidity?.(passed);
  renderValidationResult(root, result);
};

const handleFillValidSample = (root: HTMLElement, args: Args) => {
  const host = getCheckoutHost(root);
  if (!host) return;
  const sample: YnCheckoutAddressValue = {
    ...SAMPLE_ECHO_VALUE,
    email: "buyer@example.com",
    whatsapp: "501234567",
    regionComplete: true,
    formReady: true,
  };
  host.setValue(sample);
  args.onSetValue?.(sample);
  const validation = host.validate();
  args.onValidate?.(validation);
  renderValidationResult(root, validation);
};

const INTEGRATION_HTML = `<!-- 结账页：配送地址 -->
<section class="checkout-block">
  <h2>配送地址</h2>
  <yn-checkout-address
    id="shipping-address"
    locale="zh-CN"
    show-email
    email-required
    google-maps-api-key="\${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}"
  ></yn-checkout-address>
  <button type="button" id="place-order">提交订单</button>
</section>`;

const INTEGRATION_JS = `import '@yanan/yn-web-component/components/yn-checkout-address';
// 或全量：import '@yanan/yn-web-component/define';

const addressEl = document.getElementById('shipping-address');

addressEl.addEventListener('change', (event) => {
  const { value, validation, changedFields } = event.detail;
  orderBtn.disabled = !validation.formReady;
  checkoutDraft.shipping = value;
  // changedFields：相对上一次 change 的字段名，如选地区时 ['countryCode','cityName',…]
});

document.getElementById('place-order').addEventListener('click', () => {
  if (!addressEl.reportValidity()) return;
  const { valid, value } = addressEl.validate();
  if (!valid) return;
  submitOrder({ shippingAddress: value });
});

// 回显（订单编辑 / 草稿）
addressEl.value = savedShippingAddress;`;

const INTEGRATION_TREE = `// 推荐按需导入（Tree Shaking）
import '@yanan/yn-web-component/components/yn-checkout-address';

import type {
  YnCheckoutAddressChangeDetail,
  YnCheckoutAddressValue,
} from '@yanan/yn-web-component';`;

const renderCheckoutValidation = (args: Args) => html`
  <div data-validation-demo class="checkout-demo">
    <header class="checkout-demo__head">
      <h1 class="checkout-demo__title">${args.locale === "zh-CN" ? "模拟结账" : "Checkout"}</h1>
      <p class="checkout-demo__lead">
        ${args.locale === "zh-CN"
          ? "先选地区，再填写联系方式与地址；字段分步展示，减少一眼要填很多的压迫感。"
          : "Pick a region first, then contact and address details appear step by step."}
      </p>
    </header>

    <section class="checkout-demo__card">
      <h2 class="checkout-demo__section">${args.locale === "zh-CN" ? "配送地址" : "Shipping"}</h2>
      <yn-checkout-address
        id="checkout-validation-demo"
        class="checkout-demo__address"
        ?dev=${args.dev}
        locale=${args.locale}
        ?show-email=${args.showEmail}
        ?email-required=${args.emailRequired}
        ?show-whatsapp=${args.showWhatsapp}
        ?whatsapp-required=${args.whatsappRequired}
        @change=${(event: Event) => {
          const detail = (event as CustomEvent<YnCheckoutAddressChangeDetail>).detail;
          args.onChange?.(detail);
          const root = (event.target as HTMLElement).closest<HTMLElement>("[data-validation-demo]");
          if (root) {
            renderValidationResult(root, { ...detail.validation, value: detail.value });
          }
        }}
      ></yn-checkout-address>

      <div class="checkout-demo__actions">
        <button
          type="button"
          class="checkout-demo__primary"
          data-testid="validate-submit"
          @click=${(e: Event) => {
            const root = (e.currentTarget as HTMLElement).closest<HTMLElement>("[data-validation-demo]");
            if (root) handleValidateSubmit(root, args);
          }}
        >
          ${args.locale === "zh-CN" ? "提交订单" : "Place order"}
        </button>
        <button
          type="button"
          class="checkout-demo__ghost"
          data-testid="echo-valid-value"
          @click=${(e: Event) => {
            const root = (e.currentTarget as HTMLElement).closest<HTMLElement>("[data-validation-demo]");
            if (root) handleFillValidSample(root, args);
          }}
        >
          ${args.locale === "zh-CN" ? "填入示例" : "Fill sample"}
        </button>
      </div>
      <p class="checkout-demo__status" data-validate-result data-testid="validate-result">
        validation: —
      </p>
    </section>

    <section class="checkout-demo__code">
      <h2 class="checkout-demo__section">
        ${args.locale === "zh-CN" ? "接入示例" : "Integration"}
      </h2>
      <p class="checkout-demo__code-lead">
        ${args.locale === "zh-CN"
          ? "在独立站结账页挂载组件，用 change / validate / reportValidity 与下单按钮联动。"
          : "Wire the component to your checkout with change, validate, and reportValidity."}
      </p>
      <details class="checkout-demo__snippet" open>
        <summary>HTML</summary>
        <pre><code>${INTEGRATION_HTML}</code></pre>
      </details>
      <details class="checkout-demo__snippet">
        <summary>JavaScript</summary>
        <pre><code>${INTEGRATION_JS}</code></pre>
      </details>
      <details class="checkout-demo__snippet">
        <summary>TypeScript / 按需导入</summary>
        <pre><code>${INTEGRATION_TREE}</code></pre>
      </details>
    </section>
  </div>
`;

const meta = {
  title: "Components/YnCheckoutAddress",
  component: "yn-checkout-address",
  parameters: {
    docs: {
      description: {
        component: `${CHECKOUT_ADDRESS_COMPONENT_DOC_INTRO}

完整校验与结账页接入见 **结账校验（完整演示）** story（含 \`validate()\` / \`reportValidity()\` 与底部接入代码）。

${CHECKOUT_ADDRESS_METHODS_DOC}`,
      },
    },
  },
} satisfies Meta<Args>;

export default meta;

type Story = StoryObj<Args>;

export const CheckoutValidation: Story = {
  name: "结账校验（完整演示）",
  args: {
    dev: false,
    locale: "zh-CN",
    showEmail: true,
    emailRequired: true,
    showWhatsapp: false,
    whatsappRequired: false,
    onChange: fn(),
    onValidate: fn(),
    onReportValidity: fn(),
    onSetValue: fn(),
  },
  render: renderCheckoutValidation,
  argTypes: {
    dev: {
      control: "boolean",
      description: "为 true 时在表单下方展示 JSON 调试面板。",
      table: { defaultValue: { summary: "false" } },
    },
    locale: {
      control: "select",
      options: ["en", "zh-CN"],
      table: { defaultValue: { summary: "zh-CN" } },
    },
    showEmail: {
      name: "show-email",
      control: "boolean",
      description: "展示联系邮箱字段。",
      table: { defaultValue: { summary: "true" } },
    },
    emailRequired: {
      name: "email-required",
      control: "boolean",
      description: "邮箱必填（需同时开启 show-email）。",
      table: { defaultValue: { summary: "true" } },
    },
    showWhatsapp: {
      name: "show-whatsapp",
      control: "boolean",
      description: "展示 WhatsApp 输入框。",
      table: { defaultValue: { summary: "false" } },
    },
    whatsappRequired: {
      name: "whatsapp-required",
      control: "boolean",
      description: "WhatsApp 必填（需同时开启 show-whatsapp）。",
      table: { defaultValue: { summary: "false" } },
    },
    onChange: {
      name: "change",
      control: false,
      action: "change",
      description:
        "表单值或校验变化时触发。Actions 记录 `detail`：`{ value, validation, changedFields }`。",
      table: {
        category: "Events",
        type: { summary: "CustomEvent<YnCheckoutAddressChangeDetail>" },
      },
    },
    ...checkoutAddressMethodActionArgTypes,
  },
  parameters: {
    docs: {
      description: {
        story: `### 交互
1. 先完成**地区搜索** → 出现联系方式、详细地址面板；输入时 **Actions → change** 会记录 \`detail\`（含 \`changedFields\`）
2. **提交订单** → Actions 记录 **validate** / **reportValidity** 返回值
3. **填入示例** → Actions 记录 **setValue** 与 **validate**（\`setValue\` 不会自动触发 \`change\` 事件）

### 接入
Story 底部提供 HTML / JS / 按需导入示例，可直接复制到结账页。`,
      },
    },
    layout: "padded",
  },
  decorators: [
    (story) => html`
      <style>
        .checkout-demo {
          max-width: 640px;
          margin: 0 auto;
          padding: 8px 0 32px;
          font-family: inherit;
          color: var(--yn-color-text, #241f21);
        }
        .checkout-demo__head {
          margin-bottom: 20px;
        }
        .checkout-demo__title {
          margin: 0 0 8px;
          font-size: 1.5rem;
          font-weight: 700;
          letter-spacing: -0.02em;
        }
        .checkout-demo__lead {
          margin: 0;
          font-size: 0.875rem;
          line-height: 1.55;
          color: var(--yn-color-text-muted, rgba(36, 31, 33, 0.55));
        }
        .checkout-demo__card {
          padding: 20px;
          border-radius: 20px;
          background: var(--yn-color-bg, #f2efea);
          border: 1px solid var(--yn-color-divider, rgba(36, 31, 33, 0.1));
        }
        .checkout-demo__section {
          margin: 0 0 14px;
          font-size: 1rem;
          font-weight: 600;
        }
        .checkout-demo__address {
          display: block;
          --yn-checkout-address-bg: transparent;
          --yn-checkout-address-padding: 0;
          --yn-checkout-address-radius: 14px;
        }
        .checkout-demo__actions {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 18px;
        }
        .checkout-demo__primary {
          padding: 11px 22px;
          border: 0;
          border-radius: 999px;
          background: var(--yn-color-primary, #f76c46);
          color: #fff;
          font: inherit;
          font-weight: 600;
          cursor: pointer;
        }
        .checkout-demo__ghost {
          padding: 11px 18px;
          border-radius: 999px;
          border: 1px solid var(--yn-color-border, rgba(36, 31, 33, 0.22));
          background: #fff;
          font: inherit;
          cursor: pointer;
        }
        .checkout-demo__status {
          margin: 14px 0 0;
          font-size: 0.75rem;
          line-height: 1.55;
          color: var(--yn-color-text-muted, rgba(36, 31, 33, 0.55));
          white-space: pre-wrap;
        }
        .checkout-demo__code {
          margin-top: 28px;
        }
        .checkout-demo__code-lead {
          margin: 0 0 12px;
          font-size: 0.8125rem;
          line-height: 1.55;
          color: var(--yn-color-text-muted, rgba(36, 31, 33, 0.55));
        }
        .checkout-demo__snippet {
          margin-bottom: 10px;
          border-radius: 12px;
          border: 1px solid var(--yn-color-divider, rgba(36, 31, 33, 0.12));
          background: var(--yn-color-bg-elevated, #fff);
          overflow: hidden;
        }
        .checkout-demo__snippet summary {
          padding: 10px 14px;
          font-size: 0.8125rem;
          font-weight: 600;
          cursor: pointer;
          list-style: none;
        }
        .checkout-demo__snippet summary::-webkit-details-marker {
          display: none;
        }
        .checkout-demo__snippet pre {
          margin: 0;
          padding: 12px 14px 14px;
          overflow: auto;
          font-size: 0.6875rem;
          line-height: 1.5;
          background: var(--yn-color-bg-muted, #f3efe7);
        }
        .checkout-demo__snippet code {
          font-family: ui-monospace, "Cascadia Code", monospace;
          white-space: pre;
        }
      </style>
      ${story()}
    `,
  ],
  play: async ({ canvasElement, step }) => {
    const root = canvasElement.querySelector<HTMLElement>("[data-validation-demo]");
    const host = root?.querySelector("#checkout-validation-demo") as YnCheckoutAddress | null;
    const submitBtn = canvasElement.querySelector<HTMLButtonElement>('[data-testid="validate-submit"]');
    const echoBtn = canvasElement.querySelector<HTMLButtonElement>('[data-testid="echo-valid-value"]');

    if (!host?.shadowRoot || !submitBtn || !root) return;

    await step("等待地址服务就绪", async () => {
      for (let i = 0; i < 40; i += 1) {
        if (
          host.shadowRoot?.querySelector(".float-field__input") ||
          host.shadowRoot?.querySelector(".checkout-step") ||
          host.shadowRoot?.querySelector(".checkout-card")
        ) {
          return;
        }
        await wait(300);
      }
      throw new Error("探测超时");
    });

    await step("空表单提交应校验失败并展示错误", async () => {
      submitBtn.click();
      await wait(400);
      if (host.reportValidity()) throw new Error("空表单不应通过校验");
      if (!host.shadowRoot?.querySelector(".hint--error")) throw new Error("应展示字段级错误");
      const text = root.querySelector("[data-validate-result]")?.textContent ?? "";
      if (!text.includes("invalid")) throw new Error("结果区应显示 invalid");
    });

    await step("填入合法示例后应通过校验", async () => {
      echoBtn?.click();
      await wait(500);
      if (!host.validate().valid) throw new Error("合法示例应通过 validate()");
      if (!host.reportValidity()) throw new Error("reportValidity 应返回 true");
      const text = root.querySelector("[data-validate-result]")?.textContent ?? "";
      if (!text.includes("valid")) throw new Error("结果区应显示 valid");
    });
  },
};
