import type { Meta, StoryObj } from "@storybook/web-components";
import { expect, userEvent, waitFor } from "@storybook/test";
import { html } from "lit";
import "./yn-cookie-notice";
import { YnCookieNotice } from "./yn-cookie-notice";
import type { YnCookieNoticePreferenceChangeDetail } from "./yn-cookie-notice";

type Args = {
  storageKey: string;
  autoShowDelay: number;
  autoShow: boolean;
  visible: boolean;
  maxAge: number;
  defaultFunctional: boolean;
  defaultAnalytics: boolean;
  defaultMarketing: boolean;
  title: string;
  policyLine1: string;
  policyLine2: string;
  bg: string;
  borderColor: string;
  accentColor: string;
  zIndex: number;
  titleSlot?: string;
  policySlot?: string;
  preferenceChange?: (event: CustomEvent<YnCookieNoticePreferenceChangeDetail>) => void;
};

const cssVarStyle = (args: Args) =>
  `--yn-cookie-notice-bg:${args.bg};--yn-cookie-notice-border-color:${args.borderColor};--yn-cookie-notice-accent-color:${args.accentColor};--yn-cookie-notice-z-index:${args.zIndex};`;

const meta = {
  title: "Components/YnCookieNotice",
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Cookie 同意横幅，支持接受/拒绝全部、分类偏好设置与 `document.cookie` 持久化（Google Consent Mode 等业务集成可监听 `preference-change` 事件）。\n\n**样式隔离**：组件使用 Shadow DOM，外部样式默认不穿透；请通过 CSS 变量定制。\n\n**按需导入（推荐 Tree Shaking）**：\n```ts\nimport \"yn-web-component/components/yn-cookie-notice\";\n```\n\n默认在无历史同意记录时约 `800ms` 后从右下角旋转滑入。同意记录写入 `storage-key`（默认 `cookie_consent_v1`）。\n\n公开方法：`show()`、`hide()`、`openSettings()`、`resetConsent()`、`getPreferences()`、`setPreferences()`。"
      }
    }
  },
  args: {
    storageKey: "storybook_cookie_consent_v1",
    autoShowDelay: 800,
    autoShow: true,
    visible: false,
    maxAge: 31536000,
    defaultFunctional: false,
    defaultAnalytics: false,
    defaultMarketing: true,
    title: "We use cookies to improve your experience",
    policyLine1: "By continuing, you",
    policyLine2: "cookie policy.",
    bg: "#ffffff",
    borderColor: "#eedfdf",
    accentColor: "#ed3833",
    zIndex: 1000
  },
  argTypes: {
    storageKey: {
      name: "storage-key",
      control: "text",
      description: "写入 document.cookie 的键名。",
      table: { defaultValue: { summary: "cookie_consent_v1" } }
    },
    autoShowDelay: {
      name: "auto-show-delay",
      control: { type: "number", min: 0, max: 5000, step: 100 },
      description: "无历史同意时自动显示的延迟（ms）。",
      table: { defaultValue: { summary: "800" } }
    },
    autoShow: {
      name: "auto-show",
      control: "boolean",
      description: "是否在无历史同意记录时自动弹出。",
      table: { defaultValue: { summary: "true" } }
    },
    visible: {
      control: "boolean",
      description: "是否显示横幅。",
      table: { defaultValue: { summary: "false" } }
    },
    maxAge: {
      name: "max-age",
      control: { type: "number", min: 0, step: 86400 },
      description: "同意 Cookie 的 Max-Age（秒）。",
      table: { defaultValue: { summary: "31536000" } }
    },
    defaultFunctional: {
      name: "default-functional",
      control: "boolean",
      description: "无历史记录时 Functional 默认值。",
      table: { defaultValue: { summary: "false" } }
    },
    defaultAnalytics: {
      name: "default-analytics",
      control: "boolean",
      description: "无历史记录时 Analytics 默认值。",
      table: { defaultValue: { summary: "false" } }
    },
    defaultMarketing: {
      name: "default-marketing",
      control: "boolean",
      description: "无历史记录时 Marketing 默认值。",
      table: { defaultValue: { summary: "true" } }
    },
    title: {
      control: "text",
      description: "横幅标题（可被 title 插槽覆盖）。",
      table: { defaultValue: { summary: "We use cookies to improve your experience" } }
    },
    policyLine1: {
      name: "policy-line-1",
      control: "text",
      description: "政策文案第一行（可被 policy 插槽覆盖）。",
      table: { defaultValue: { summary: "By continuing, you" } }
    },
    policyLine2: {
      name: "policy-line-2",
      control: "text",
      description: "政策文案第二行（可被 policy 插槽覆盖）。",
      table: { defaultValue: { summary: "cookie policy." } }
    },
    bg: {
      control: "color",
      name: "--yn-cookie-notice-bg",
      description: "横幅背景色。",
      table: { category: "CSS Variables", defaultValue: { summary: "#ffffff" } }
    },
    borderColor: {
      control: "color",
      name: "--yn-cookie-notice-border-color",
      description: "外边框颜色。",
      table: { category: "CSS Variables", defaultValue: { summary: "#eedfdf" } }
    },
    accentColor: {
      control: "color",
      name: "--yn-cookie-notice-accent-color",
      description: "政策强调色。",
      table: { category: "CSS Variables", defaultValue: { summary: "#ed3833" } }
    },
    zIndex: {
      control: { type: "number", min: 1, max: 99999, step: 1 },
      name: "--yn-cookie-notice-z-index",
      description: "叠放层级。",
      table: { category: "CSS Variables", defaultValue: { summary: "1000" } }
    },
    titleSlot: {
      name: "title",
      control: false,
      description: "标题插槽。最小示例：`<p slot=\"title\">自定义标题</p>`。",
      table: { category: "Slots", type: { summary: "HTMLElement" } }
    },
    policySlot: {
      name: "policy",
      control: false,
      description: "政策说明插槽。最小示例：`<p slot=\"policy\">自定义政策文案</p>`。",
      table: { category: "Slots", type: { summary: "HTMLElement" } }
    },
    preferenceChange: {
      name: "preference-change",
      control: false,
      action: "preference-change",
      description:
        "偏好变化时触发。`event.detail` 结构：`{ prefs: { necessary, functional, analytics, marketing, v, ts }, source, changedKey }`。",
      table: {
        category: "Events",
        type: { summary: "CustomEvent<YnCookieNoticePreferenceChangeDetail>" }
      }
    }
  }
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

const renderNotice = (args: Args) => html`
  <div style="min-height:100vh;background:#f5f0ee;padding:24px;">
    <p style="font-family:Inter,system-ui,sans-serif;font-size:14px;color:#333;">
      Cookie 横幅固定在右下角。Story 使用独立 storage-key，刷新后若已同意可点下方按钮重置。
    </p>
    <button
      type="button"
      id="cookie-reset-btn"
      style="margin-top:12px;padding:8px 16px;border:1px solid #000;background:#fff;cursor:pointer;"
      @click=${() => {
        document.cookie = `${encodeURIComponent(args.storageKey)}=; Max-Age=0; Path=/`;
        location.reload();
      }}
    >
      清除同意记录并重载
    </button>
    <yn-cookie-notice
      storage-key=${args.storageKey}
      auto-show-delay=${args.autoShowDelay}
      ?auto-show=${args.autoShow}
      ?visible=${args.visible}
      max-age=${args.maxAge}
      ?default-functional=${args.defaultFunctional}
      ?default-analytics=${args.defaultAnalytics}
      ?default-marketing=${args.defaultMarketing}
      title=${args.title}
      policy-line-1=${args.policyLine1}
      policy-line-2=${args.policyLine2}
      style=${cssVarStyle(args)}
      @preference-change=${(event: Event) =>
        args.preferenceChange?.(event as CustomEvent<YnCookieNoticePreferenceChangeDetail>)}
    ></yn-cookie-notice>
  </div>
`;

export const Default: Story = {
  render: renderNotice,
  play: async ({ canvasElement, step, args }) => {
    const resetBtn = canvasElement.querySelector("#cookie-reset-btn");
    resetBtn?.addEventListener("click", () => {
      document.cookie = "storybook_cookie_consent_v1=; Max-Age=0; Path=/";
      location.reload();
    });

    const notice = canvasElement.querySelector("yn-cookie-notice");
    if (!(notice instanceof HTMLElement)) return;

    await step("无历史同意时自动显示横幅", async () => {
      document.cookie = `${encodeURIComponent(args.storageKey)}=; Max-Age=0; Path=/`;
      if (notice instanceof YnCookieNotice) {
        notice.resetConsent();
      }
      await waitFor(
        () => {
          if (!notice.hasAttribute("visible")) {
            throw new Error("横幅应自动显示");
          }
        },
        { timeout: 2000 }
      );
    });

    await step("点击 accept cookies 后隐藏横幅", async () => {
      const acceptBtn = notice.shadowRoot?.querySelector<HTMLButtonElement>(
        ".panel__button-group .action-button:first-child"
      );
      if (!acceptBtn) throw new Error("缺少 accept 按钮");
      await userEvent.click(acceptBtn);
      await waitFor(() => {
        if (notice.hasAttribute("visible")) {
          throw new Error("接受后横幅应隐藏");
        }
      });
    });
  }
};

export const SettingsPanel: Story = {
  name: "偏好设置面板",
  args: {
    visible: true,
    autoShow: false
  },
  render: renderNotice,
  play: async ({ canvasElement, step }) => {
    const notice = canvasElement.querySelector("yn-cookie-notice");
    if (!(notice instanceof YnCookieNotice) || !notice.shadowRoot) return;

    await step("展开 cookies settings 面板", async () => {
      const root = notice.shadowRoot;
      const toggle = root.querySelector<HTMLButtonElement>(".settings-toggle");
      if (!toggle) throw new Error("缺少 settings 按钮");
      await userEvent.click(toggle);
      await waitFor(() => {
        const body = root.querySelector(".panel__body.open");
        if (!body) throw new Error("设置面板应展开");
      });
    });

    await step("勾选 Analytics 并保存", async () => {
      const root = notice.shadowRoot;
      if (!root) throw new Error("missing shadow root");
      const analytics = root.querySelector<HTMLInputElement>(
        '.pref-list li:nth-child(3) input[type="checkbox"]'
      );
      if (!analytics) throw new Error("缺少 Analytics 选项");
      analytics.click();
      const saveBtn = root.querySelector<HTMLButtonElement>(".settings-actions .action-button");
      if (!saveBtn) throw new Error("缺少保存按钮");
      await userEvent.click(saveBtn);
      expect(notice.hasAttribute("visible")).toBe(false);
    });
  }
};

const manualControlClick = (method: "show" | "openSettings" | "resetConsent") => (e: Event) => {
  const container = (e.currentTarget as HTMLElement).closest("div")!;
  const notice = container.querySelector<YnCookieNotice>("yn-cookie-notice");
  if (notice) notice[method]();
};

export const ManualControl: Story = {
  name: "手动控制",
  args: {
    autoShow: false,
    visible: false
  },
  render: (args: Args) => html`
    <div style="min-height:100vh;background:#f5f0ee;padding:24px;display:flex;gap:12px;flex-wrap:wrap;">
      <button type="button" id="show-btn" style="padding:8px 16px;border:1px solid #000;background:#fff;cursor:pointer;" @click=${manualControlClick("show")}>显示</button>
      <button type="button" id="settings-btn" style="padding:8px 16px;border:1px solid #000;background:#fff;cursor:pointer;" @click=${manualControlClick("openSettings")}>打开设置</button>
      <button type="button" id="reset-btn" style="padding:8px 16px;border:1px solid #000;background:#fff;cursor:pointer;" @click=${manualControlClick("resetConsent")}>重置同意</button>
      ${renderNotice(args)}
    </div>
  `,
  play: async ({ canvasElement, step }) => {
    const notice = canvasElement.querySelector("yn-cookie-notice") as YnCookieNotice | null;
    if (!notice) return;

    await step("调用 show() 显示横幅", async () => {
      canvasElement.querySelector<HTMLButtonElement>("#show-btn")?.click();
      notice.show();
      await waitFor(() => {
        if (!notice.hasAttribute("visible")) throw new Error("应显示");
      });
    });

    await step("调用 openSettings() 展开设置", async () => {
      canvasElement.querySelector<HTMLButtonElement>("#settings-btn")?.click();
      notice.openSettings();
      await waitFor(() => {
        const body = notice.shadowRoot?.querySelector(".panel__body.open");
        if (!body) throw new Error("设置面板应展开");
      });
    });
  }
};
