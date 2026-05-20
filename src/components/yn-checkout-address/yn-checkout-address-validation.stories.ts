import type { Meta, StoryObj } from "@storybook/web-components";
import { html, render } from "lit";
import type { YnCheckoutAddress } from "./yn-checkout-address";
import "./yn-checkout-address";
import { SAMPLE_ECHO_VALUE } from "./yn-checkout-address.stories";
import type { YnCheckoutAddressChangeDetail, YnCheckoutAddressValidation } from "./types";

type Args = {
  dev: boolean;
  locale: "en" | "zh-CN";
  showEmail: boolean;
  emailRequired: boolean;
  onChange?: (event: CustomEvent<YnCheckoutAddressChangeDetail>) => void;
};

const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

const formatValidationResult = (validation: YnCheckoutAddressValidation) => {
  const status = validation.valid ? "valid" : "invalid";
  const lines = validation.errors.map((e) => `· ${e.field}: ${e.message}`);
  return lines.length > 0
    ? `validation: ${status}（${validation.errors.length} 项）\n${lines.join("\n")}`
    : `validation: ${status} · formReady: ${validation.formReady}`;
};

const renderValidationResult = (root: HTMLElement, validation: YnCheckoutAddressValidation) => {
  const slot = root.querySelector<HTMLElement>("[data-validate-result]");
  if (!slot) return;
  render(html`${formatValidationResult(validation)}`, slot);
};

const getCheckoutHost = (root: HTMLElement) =>
  root.querySelector<YnCheckoutAddress>("#checkout-validation-demo");

const handleValidateSubmit = (root: HTMLElement) => {
  const host = getCheckoutHost(root);
  if (!host) return;
  const validation = host.validate();
  host.reportValidity();
  renderValidationResult(root, validation);
};

const handleFillValidSample = (root: HTMLElement) => {
  const host = getCheckoutHost(root);
  if (!host) return;
  host.setValue({
    ...SAMPLE_ECHO_VALUE,
    email: "buyer@example.com",
    regionComplete: true,
    formReady: true,
  });
  host.dev = true;
  const validation = host.validate();
  renderValidationResult(root, validation);
};

const renderCheckoutValidation = (args: Args) => html`
  <div
    data-validation-demo
    style="background:var(--yn-color-bg,#f2efea);padding:24px;max-width:680px;margin:0 auto;"
  >
    <p style="margin:0 0 16px;font-size:13px;line-height:1.55;color:var(--yn-color-text-muted,rgba(36,31,33,.55));">
      模拟结账页：点「提交订单」调用 <code>reportValidity()</code>；点「填入合法示例」写入
      <code>.value</code>。下方会实时显示校验结果。
    </p>
    <yn-checkout-address
      id="checkout-validation-demo"
      style="--yn-checkout-address-bg:#fffaf2;--yn-checkout-address-padding:16px;--yn-checkout-address-radius:16px;display:block;"
      ?dev=${args.dev}
      locale=${args.locale}
      show-email
      email-required
      @change=${(event: Event) => {
        const detail = (event as CustomEvent<YnCheckoutAddressChangeDetail>).detail;
        args.onChange?.(event as CustomEvent<YnCheckoutAddressChangeDetail>);
        const root = (event.target as HTMLElement).closest<HTMLElement>("[data-validation-demo]");
        if (root) renderValidationResult(root, detail.validation);
      }}
    ></yn-checkout-address>
    <div style="margin-top:16px;display:flex;flex-wrap:wrap;gap:10px;align-items:center;">
      <button
        type="button"
        data-testid="validate-submit"
        style="padding:10px 18px;border-radius:999px;border:0;background:var(--yn-color-primary,#f76c46);color:#fff;font:inherit;font-weight:600;cursor:pointer;"
        @click=${(e: Event) => {
          const root = (e.currentTarget as HTMLElement).closest<HTMLElement>("[data-validation-demo]");
          if (root) handleValidateSubmit(root);
        }}
      >
        ${args.locale === "zh-CN" ? "提交订单（校验）" : "Place order (validate)"}
      </button>
      <button
        type="button"
        data-testid="echo-valid-value"
        style="padding:10px 18px;border-radius:999px;border:1px solid var(--yn-color-border,rgba(36,31,33,.22));background:#fff;font:inherit;cursor:pointer;"
        @click=${(e: Event) => {
          const root = (e.currentTarget as HTMLElement).closest<HTMLElement>("[data-validation-demo]");
          if (root) handleFillValidSample(root);
        }}
      >
        ${args.locale === "zh-CN" ? "填入合法示例" : "Fill valid sample"}
      </button>
    </div>
    <div
      data-validate-result
      data-testid="validate-result"
      style="margin-top:14px;font-size:12px;line-height:1.6;color:var(--yn-color-text,#241f21);white-space:pre-wrap;"
    >
      validation: —（填写或点击按钮后更新）
    </div>
  </div>
`;

const meta = {
  title: "Components/YnCheckoutAddress",
  component: "yn-checkout-address",
  parameters: {
    docs: {
      description: {
        component:
          "完整校验演示见 **结账校验（完整演示）** story：`validate()` / `reportValidity()`、邮箱、dr5hn 城市级、按国家邮编。",
      },
    },
  },
} satisfies Meta<Args>;

export default meta;

type Story = StoryObj<Args>;

export const CheckoutValidation: Story = {
  name: "结账校验（完整演示）",
  args: {
    dev: true,
    locale: "zh-CN",
    showEmail: true,
    emailRequired: true,
  },
  render: renderCheckoutValidation,
  argTypes: {
    dev: {
      control: "boolean",
      description: "展示 value + validation 调试 JSON。",
      table: { defaultValue: { summary: "true" } },
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
      description: "邮箱必填并校验格式。",
      table: { defaultValue: { summary: "true" } },
    },
    onChange: {
      name: "change",
      control: false,
      action: "change",
      description: "`CustomEvent<{ value, validation }>`",
      table: {
        category: "Events",
        type: { summary: "CustomEvent<YnCheckoutAddressChangeDetail>" },
      },
    },
  },
  parameters: {
    docs: {
      description: {
        story: `### 操作说明
1. 直接点 **提交订单（校验）** → 应显示 invalid 与字段错误
2. 点 **填入合法示例** → 应显示 valid
3. 修改表单字段时，下方结果随 \`change\` 更新`,
      },
    },
  },
  play: async ({ canvasElement, step }) => {
    const root = canvasElement.querySelector<HTMLElement>("[data-validation-demo]");
    const host = root?.querySelector("#checkout-validation-demo") as YnCheckoutAddress | null;
    const submitBtn = canvasElement.querySelector<HTMLButtonElement>('[data-testid="validate-submit"]');
    const echoBtn = canvasElement.querySelector<HTMLButtonElement>('[data-testid="echo-valid-value"]');

    if (!host?.shadowRoot || !submitBtn || !root) return;

    await step("等待地址服务就绪", async () => {
      for (let i = 0; i < 40; i += 1) {
        if (host.shadowRoot?.querySelector('input[type="search"]')) return;
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
