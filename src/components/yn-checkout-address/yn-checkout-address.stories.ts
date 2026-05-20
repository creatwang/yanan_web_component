import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import type { YnCheckoutAddress } from "./yn-checkout-address";
import "./yn-checkout-address";
import { CHECKOUT_ADDRESS_COMPONENT_DOC_INTRO } from "./component-doc";
import type {
  YnCheckoutAddressChangeDetail,
  YnCheckoutAddressMessages,
  YnCheckoutAddressValue,
  YnCheckoutExcludeRegions,
} from "./types";

/** Story / 交互演示用的回显样例（与 ControlledEcho 一致） */
export const SAMPLE_ECHO_VALUE: YnCheckoutAddressValue = {
  provider: "dr5hn",
  probeReason: "story echo sample",
  countryCode: "AE",
  countryName: "United Arab Emirates",
  stateCode: "DU",
  stateName: "Dubai",
  cityName: "Dubai",
  cityId: 1,
  phonecode: "971",
  phoneNumber: "501234567",
  email: "buyer@example.com",
  line1: "Sheikh Zayed Rd 1",
  line2: "Floor 12",
  postalCode: "12345",
  currency: "AED",
  regionComplete: true,
  formReady: true,
  searchLabel: "Dubai, Dubai, United Arab Emirates",
};

type Args = {
  dev: boolean;
  disabled: boolean;
  locale: "en" | "zh-CN";
  googleMapsApiKey: string;
  excludeRegions?: YnCheckoutExcludeRegions;
  includeCountries?: string[];
  value: YnCheckoutAddressValue | null;
  messages?: Partial<YnCheckoutAddressMessages>;
  showEmail?: boolean;
  emailRequired?: boolean;
  onChange?: (event: CustomEvent<YnCheckoutAddressChangeDetail>) => void;
};

/** 所有 Controls 均绑定到此 render（勿漏 props） */
const renderCheckoutAddress = (args: Args) => html`
  <div
    style="background:var(--yn-color-bg,#f2efea);padding:24px;max-width:560px;margin:0 auto;"
  >
    <yn-checkout-address
      ?dev=${args.dev}
      ?disabled=${args.disabled}
      locale=${args.locale}
      .googleMapsApiKey=${args.googleMapsApiKey}
      .excludeRegions=${args.excludeRegions}
      .includeCountries=${args.includeCountries}
      .value=${args.value ?? null}
      .messages=${args.messages}
      ?show-email=${args.showEmail ?? false}
      ?email-required=${args.emailRequired ?? false}
      @change=${(event: Event) => args.onChange?.(event as CustomEvent<YnCheckoutAddressChangeDetail>)}
    ></yn-checkout-address>
  </div>
`;

const cloneEchoValue = (): YnCheckoutAddressValue => ({
  ...SAMPLE_ECHO_VALUE,
});

const findCheckoutHost = (from: Event | Element) => {
  const root =
    from instanceof Event
      ? (from.currentTarget as HTMLElement | null)?.closest("[data-echo-root]")
      : from.closest("[data-echo-root]");
  return root?.querySelector("yn-checkout-address") as YnCheckoutAddress | null;
};

const applyEchoToHost = (host: YnCheckoutAddress, updateArgs?: (patch: Partial<Args>) => void) => {
  const next = cloneEchoValue();
  host.setValue(next);
  host.dev = true;
  void updateArgs?.({ value: next, dev: true });
};

const clearEchoOnHost = (host: YnCheckoutAddress, updateArgs?: (patch: Partial<Args>) => void) => {
  host.setValue(null);
  void updateArgs?.({ value: null });
};

const renderAddressWithEchoControls = (
  args: Args,
  updateArgs?: (patch: Partial<Args>) => void,
) => html`
  <div
    data-echo-root
    style="background:var(--yn-color-bg,#f2efea);padding:24px;max-width:640px;margin:0 auto;"
  >
    <div
      style="display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-bottom:12px;"
      role="toolbar"
      aria-label="value 回显演示"
    >
      <button
        type="button"
        data-testid="echo-value-btn"
        style="padding:8px 14px;border-radius:999px;border:1px solid var(--yn-color-border,rgba(36,31,33,.22));background:var(--yn-color-primary,#f76c46);color:#fff;font:inherit;font-size:13px;font-weight:600;cursor:pointer;"
        @click=${(e: Event) => {
          const host = findCheckoutHost(e);
          if (host) applyEchoToHost(host, updateArgs);
        }}
      >
        回显示例 value
      </button>
      <button
        type="button"
        data-testid="clear-value-btn"
        style="padding:8px 14px;border-radius:999px;border:1px solid var(--yn-color-border,rgba(36,31,33,.22));background:var(--yn-color-bg-elevated,#fff);font:inherit;font-size:13px;cursor:pointer;"
        @click=${(e: Event) => {
          const host = findCheckoutHost(e);
          if (host) clearEchoOnHost(host, updateArgs);
        }}
      >
        清空 value
      </button>
      <span style="font-size:12px;color:var(--yn-color-text-muted,rgba(36,31,33,.5);">
        模拟父组件写入 <code>.value</code>；右侧 Controls 改属性也会同步到组件
      </span>
    </div>
    ${args.value
      ? html`
          <pre
            style="margin:0 0 12px;padding:10px 12px;border-radius:10px;border:1px dashed var(--yn-color-border,rgba(36,31,33,.22));background:var(--yn-color-bg-muted,#f3efe7);font-size:11px;line-height:1.45;overflow:auto;max-height:160px;"
          >${JSON.stringify(args.value, null, 2)}</pre>
        `
      : html`
          <p
            style="margin:0 0 12px;font-size:12px;color:var(--yn-color-text-muted,rgba(36,31,33,.5);"
          >
            当前未绑定 value，点击上方按钮或在 Controls 里编辑 value
          </p>
        `}
    ${renderCheckoutAddress(args)}
  </div>
`;

const componentDescription = `${CHECKOUT_ADDRESS_COMPONENT_DOC_INTRO}

## Controls 说明

Storybook Controls 与组件属性一一对应；修改 \`googleMapsApiKey\`、\`excludeRegions\`、\`includeCountries\` 会**重新探测**数据源。

## 导入（Tree Shaking）

\`\`\`ts
import { YnCheckoutAddress, emptyCheckoutAddressValue } from "yn-web-component/components/yn-checkout-address";
import "yn-web-component/define";
import "yn-web-component/theme.css";
\`\`\`

## CSS 变量

| 变量 | 默认 | 说明 |
| --- | --- | --- |
| \`--yn-checkout-address-bg\` | \`transparent\` | 组件背景色 |
| \`--yn-checkout-address-padding\` | \`0\` | 内容区内边距（配合背景色） |
| \`--yn-checkout-address-field-height\` | \`44px\` | 输入框高度 |
| \`--yn-checkout-address-radius\` | \`12px\` | 圆角 |

组件使用 **Shadow DOM**；样式请用 \`--yn-checkout-address-*\` 或 \`--yn-color-*\` 覆盖（未列入 Controls，可在 Canvas 用 style 验证）。`;

const meta = {
  title: "Components/YnCheckoutAddress",
  component: "yn-checkout-address",
  tags: ["autodocs"],
  parameters: {
    docs: { description: { component: componentDescription } },
  },
  args: {
    dev: false,
    disabled: false,
    locale: "en",
    googleMapsApiKey: "",
    excludeRegions: undefined,
    includeCountries: undefined,
    value: null,
    messages: undefined,
  },
  argTypes: {
    dev: {
      control: "boolean",
      description: "为 true 时在表单下方展示 JSON 调试面板。",
      table: { defaultValue: { summary: "false" } },
    },
    disabled: {
      control: "boolean",
      description: "禁用交互。",
      table: { defaultValue: { summary: "false" } },
    },
    locale: {
      description: "界面语言（内置 en / zh-CN）。",
      control: "select",
      options: ["en", "zh-CN"],
      table: { defaultValue: { summary: "en" } },
    },
    googleMapsApiKey: {
      name: "google-maps-api-key",
      control: "text",
      description:
        "Google Maps Places API Key。修改后会重新探测；未设时尝试 VITE_GOOGLE_MAPS_API_KEY。",
      table: { defaultValue: { summary: '""' } },
    },
    excludeRegions: {
      description:
        "排除区域：`{ countries?: string[], states?: { countryCode, stateCode }[], cities?: { countryCode, cityId }[] }`。修改后重新探测。",
      control: "object",
      table: { defaultValue: { summary: "undefined" } },
    },
    includeCountries: {
      description: "仅允许的国家 ISO2 数组，如 `[\"AE\",\"SA\"]`。修改后重新探测。",
      control: "object",
      table: { defaultValue: { summary: "undefined" } },
    },
    value: {
      description:
        "受控回显值（YnCheckoutAddressValue）。在 Controls 中编辑会同步表单。",
      control: "object",
      table: { defaultValue: { summary: "null" } },
    },
    messages: {
      description:
        "局部覆盖文案。顶部指引：`usageHintDr5hn` / `usageHintGoogle` / `usageHintPhoton`，或统一 `usageHint`。",
      control: "object",
      table: {
        category: "Internationalization",
        defaultValue: { summary: "undefined" },
      },
    },
    onChange: {
      name: "change",
      control: false,
      action: "change",
      description:
        "地址变化。`CustomEvent<YnCheckoutAddressChangeDetail>`，含 value 与 validation。",
      table: {
        category: "Events",
        type: { summary: "CustomEvent<YnCheckoutAddressChangeDetail>" },
      },
    },
    showEmail: {
      name: "show-email",
      control: "boolean",
      description: "展示联系邮箱输入框。",
      table: { defaultValue: { summary: "false" } },
    },
    emailRequired: {
      name: "email-required",
      control: "boolean",
      description: "邮箱必填（需同时开启 show-email）。",
      table: { defaultValue: { summary: "false" } },
    },
  },
  render: renderCheckoutAddress,
} satisfies Meta<Args>;

export default meta;

type Story = StoryObj<Args>;

const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

const playProbeComplete: NonNullable<Story["play"]> = async ({ canvasElement, step }) => {
  const host = canvasElement.querySelector("yn-checkout-address") as YnCheckoutAddress | null;
  if (!host?.shadowRoot) return;

  await step("探测完成后应出现搜索框", async () => {
    for (let i = 0; i < 40; i += 1) {
      const input = host.shadowRoot?.querySelector('input[type="search"]');
      if (input) return;
      await wait(300);
    }
    throw new Error("探测超时：未找到搜索框");
  });
};

export const Default: Story = {
  name: "默认",
  play: playProbeComplete,
};

export const DevPanel: Story = {
  name: "调试面板",
  args: { dev: true, locale: "zh-CN" },
  play: playProbeComplete,
};

export const CustomBackground: Story = {
  name: "自定义背景",
  args: { locale: "zh-CN", dev: false },
  render: (args) => html`
    <div style="padding:24px;background:#e8e4dc;">
      <yn-checkout-address
        style="--yn-checkout-address-bg:#fffaf2;--yn-checkout-address-padding:16px;--yn-checkout-address-radius:16px;display:block;"
        ?dev=${args.dev}
        ?disabled=${args.disabled}
        locale=${args.locale}
        .googleMapsApiKey=${args.googleMapsApiKey}
        .excludeRegions=${args.excludeRegions}
        .includeCountries=${args.includeCountries}
        .value=${args.value ?? null}
        .messages=${args.messages}
        @change=${(event: Event) =>
          args.onChange?.(event as CustomEvent<YnCheckoutAddressChangeDetail>)}
      ></yn-checkout-address>
    </div>
  `,
  parameters: {
    docs: {
      description: {
        story: "通过 `--yn-checkout-address-bg` 设置结账地址区域背景，可配合 `padding` 与 `radius`。",
      },
    },
  },
  play: playProbeComplete,
};

export const ExcludeChina: Story = {
  name: "排除中国大陆",
  args: {
    excludeRegions: { countries: ["CN"] },
    locale: "zh-CN",
  },
  parameters: {
    docs: {
      description: {
        story: "跨境常用：`excludeRegions.countries` 含 `CN`。",
      },
    },
  },
  play: playProbeComplete,
};

export const IncludeGcc: Story = {
  name: "仅 GCC 国家",
  args: {
    includeCountries: ["AE", "SA", "KW", "QA", "BH", "OM"],
    locale: "en",
  },
  play: playProbeComplete,
};

export const ControlledEcho: Story = {
  name: "受控回显",
  args: {
    value: SAMPLE_ECHO_VALUE,
    dev: true,
    locale: "en",
  },
  parameters: {
    docs: {
      description: {
        story: "初始 args 带 value；也可在 Controls 里改 value 观察回显。",
      },
    },
  },
  play: async ({ canvasElement, step }) => {
    const host = canvasElement.querySelector("yn-checkout-address") as YnCheckoutAddress | null;
    if (!host?.shadowRoot) return;

    await step("回显后应展示手机号", async () => {
      for (let i = 0; i < 30; i += 1) {
        const phone = host.shadowRoot?.querySelector<HTMLInputElement>(
          "#yn-ca-d-phone, #yn-ca-phone",
        );
        if (phone?.value.includes("501234567")) return;
        await wait(200);
      }
      throw new Error("回显手机号未出现");
    });
  },
};

export const CustomMessages: Story = {
  name: "自定义文案",
  args: {
    locale: "en",
    dev: true,
    messages: {
      usageHintDr5hn:
        "Search country, state, or city (e.g. Dubai). Pick a tagged list item, then add contact number and shipping address.",
      regionSearchPlaceholder: "Country, state, or city",
    },
  },
  parameters: {
    docs: {
      description: {
        story: "通过 Controls 修改 `messages` 可即时看到 placeholder / label 变化。",
      },
    },
  },
  play: async (context) => {
    const { canvasElement, step } = context;
    const host = canvasElement.querySelector("yn-checkout-address") as YnCheckoutAddress | null;
    if (!host?.shadowRoot) return;
    await playProbeComplete(context);
    await step("自定义 placeholder 应生效", async () => {
      const input = host.shadowRoot?.querySelector<HTMLInputElement>('input[type="search"]');
      const ph = input?.getAttribute("placeholder") ?? "";
      if (ph.includes("Country, state, or city") || ph.includes("country")) return;
      throw new Error(`messages 未生效，placeholder=${ph}`);
    });
  },
};

export const Interactions: Story = {
  name: "交互",
  args: { locale: "zh-CN", dev: false, value: null },
  parameters: {
    docs: {
      description: {
        story:
          "工具栏按钮 + 右侧 Controls 均可改属性；`googleMapsApiKey` / 区域过滤变更会重新探测。",
      },
    },
  },
  render: (args, { updateArgs }) => renderAddressWithEchoControls(args, updateArgs),
  play: async (context) => {
    const { canvasElement, step } = context;
    const host = canvasElement.querySelector("yn-checkout-address") as YnCheckoutAddress | null;
    if (!host?.shadowRoot) return;

    await playProbeComplete(context);

    await step("点击「回显示例 value」按钮", async () => {
      const btn = canvasElement.querySelector<HTMLButtonElement>('[data-testid="echo-value-btn"]');
      if (!btn) throw new Error("未找到回显按钮");
      btn.click();
      await wait(200);
      if (!host.value?.countryCode) {
        host.setValue(cloneEchoValue());
        host.dev = true;
      }
      await wait(300);
    });

    await step("回显后搜索框应展示 searchLabel", async () => {
      for (let i = 0; i < 25; i += 1) {
        const search = host.shadowRoot?.querySelector<HTMLInputElement>('input[type="search"]');
        if (search?.value.includes("Dubai")) return;
        await wait(200);
      }
      throw new Error("回显后搜索框未展示示例地址文案");
    });

    await step("回显后应展示示例手机号", async () => {
      for (let i = 0; i < 25; i += 1) {
        const phone = host.shadowRoot?.querySelector<HTMLInputElement>(
          "#yn-ca-d-phone, #yn-ca-phone",
        );
        if (phone?.value.includes("501234567")) return;
        await wait(200);
      }
      throw new Error("回显后未找到示例手机号");
    });

    await step("dev 面板应展示回显后的 JSON（含 provider）", async () => {
      for (let i = 0; i < 20; i += 1) {
        const pre = host.shadowRoot?.querySelector(".dev-panel pre");
        if (pre?.textContent?.includes("provider") && pre.textContent.includes("501234567")) {
          return;
        }
        await wait(200);
      }
      throw new Error("dev 面板未展示回显 JSON");
    });
  },
};
