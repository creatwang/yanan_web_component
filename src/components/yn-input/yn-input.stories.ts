import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";
import { ynSearchCloseSvg, ynSignpostSvg } from "../../asset/svg";
import "./yn-input";

type Args = {
  value: string;
  placeholder: string;
  disabled: boolean;
  variant: "default" | "floating";
  label: string;
  type: string;
  name: string;
  required: boolean;
  error: boolean;
  errorMessage: string;
  autocomplete: string;
  revealLabel: string;
  concealLabel: string;
  width: string;
  height: string;
  background: string;
  backgroundHover: string;
  backgroundFocus: string;
  borderColor: string;
  borderColorHover: string;
  borderColorFocus: string;
  color: string;
  placeholderColor: string;
  backgroundDisabled: string;
  disabledColor: string;
  focusRing: string;
  radius: string;
  padding: string;
  buttonSize: string;
  buttonColor: string;
  buttonBgHover: string;
  fontFamily: string;
  fontSize: string;
  letterSpacing: string;
  prefixButtonSlot?: string;
  suffixButtonSlot?: string;
  onYnInput?: (event: CustomEvent<{ value: string }>) => void;
  onPrefixClick?: (event: CustomEvent<{ value: string }>) => void;
  onSuffixClick?: (event: CustomEvent<{ value: string }>) => void;
};

const renderInput = (args: Args) => html`
  <div style="background:#f2efea;padding:24px;">
    <yn-input
      .value=${args.value}
      placeholder=${args.placeholder}
      ?disabled=${args.disabled}
      variant=${args.variant ?? "default"}
      label=${args.label ?? ""}
      type=${args.type ?? "text"}
      name=${args.name ?? ""}
      ?required=${args.required}
      ?error=${args.error}
      error-message=${args.errorMessage ?? ""}
      autocomplete=${args.autocomplete ?? ""}
      reveal-label=${args.revealLabel ?? "Show"}
      conceal-label=${args.concealLabel ?? "Hide"}
      style=${`--yn-input-width:${args.width};--yn-input-height:${args.height};--yn-input-bg:${args.background};--yn-input-bg-hover:${args.backgroundHover};--yn-input-bg-focus:${args.backgroundFocus};--yn-input-bg-disabled:${args.backgroundDisabled};--yn-input-border-color:${args.borderColor};--yn-input-border-color-hover:${args.borderColorHover};--yn-input-border-color-focus:${args.borderColorFocus};--yn-input-color:${args.color};--yn-input-placeholder-color:${args.placeholderColor};--yn-input-disabled-color:${args.disabledColor};--yn-input-focus-ring:${args.focusRing};--yn-input-radius:${args.radius};--yn-input-padding:${args.padding};--yn-input-button-size:${args.buttonSize};--yn-input-button-color:${args.buttonColor};--yn-input-button-bg-hover:${args.buttonBgHover};--yn-input-font-family:${args.fontFamily};--yn-input-font-size:${args.fontSize};--yn-input-letter-spacing:${args.letterSpacing};`}
      @yn-input=${(event: Event) => args.onYnInput?.(event as CustomEvent<{ value: string }>)}
      @yn-prefix-click=${(event: Event) => args.onPrefixClick?.(event as CustomEvent<{ value: string }>)}
      @yn-suffix-click=${(event: Event) => args.onSuffixClick?.(event as CustomEvent<{ value: string }>)}
    >
      ${args.prefixButtonSlot ? html`<span slot="prefix-button">${unsafeSVG(args.prefixButtonSlot)}</span>` : ""}
      ${args.suffixButtonSlot ? html`<span slot="suffix-button">${unsafeSVG(args.suffixButtonSlot)}</span>` : ""}
    </yn-input>
  </div>
`;

const meta = {
  title: "Components/YnInput",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Floema 风格的输入框组件，使用暖色半透明背景、细线边框和胶囊圆角，支持受控 value、占位文案、禁用状态。\n\n" +
          "**变体**：通过 `variant` 属性切换——`default`（标准胶囊输入框，支持前后置按钮插槽）和 `floating`（浮动标签输入框，label 初始在输入框内，聚焦或有值时上浮；密码字段自动显示切换按钮）。\n\n" +
          "**密码切换**：`variant=\"floating\"` + `type=\"password\"` 时自动显示密码可见切换按钮，支持 `reveal-label` / `conceal-label` 自定义按钮文案。\n\n" +
          "**错误态**：`error` + `error-message` 显示红色边框与错误提示（仅 floating 变体）。\n\n" +
          "**前后置按钮**：传入 `prefix-button` / `suffix-button` 插槽时渲染对应可点击按钮（仅 default 变体）。\n\n" +
          "事件：`yn-input`（输入变化）、`yn-prefix-click`（前置按钮）、`yn-suffix-click`（后置按钮），`detail` 均为 `{ value: string }`。\n\n" +
          "样式隔离：Shadow DOM，通过 CSS 变量定制外观。"
      }
    }
  },
  args: {
    value: "",
    placeholder: "请输入内容",
    disabled: false,
    variant: "default",
    label: "",
    type: "text",
    name: "",
    required: false,
    error: false,
    errorMessage: "",
    autocomplete: "",
    revealLabel: "Show",
    concealLabel: "Hide",
    width: "320px",
    height: "44px",
    background: "rgba(255, 255, 255, 0.62)",
    backgroundHover: "rgba(255, 255, 255, 0.86)",
    backgroundFocus: "#fffaf2",
    borderColor: "rgba(36, 31, 33, 0.22)",
    borderColorHover: "rgba(36, 31, 33, 0.52)",
    borderColorFocus: "#241f21",
    color: "#241f21",
    placeholderColor: "rgba(36, 31, 33, 0.48)",
    backgroundDisabled: "rgba(232, 225, 214, 0.76)",
    disabledColor: "rgba(36, 31, 33, 0.42)",
    focusRing: "rgba(36, 31, 33, 0.12)",
    radius: "999px",
    padding: "0 14px",
    buttonSize: "28px",
    buttonColor: "#241f21",
    buttonBgHover: "rgba(36, 31, 33, 0.08)",
    fontFamily: '"Zimula", ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
    fontSize: "16px",
    letterSpacing: "-0.01em",
    prefixButtonSlot: "",
    suffixButtonSlot: ""
  },
  argTypes: {
    value: {
      control: "text",
      description: "输入框当前值。",
      table: { defaultValue: { summary: '""' } }
    },
    variant: {
      control: "select",
      options: ["default", "floating"],
      description:
        "输入框变体。`default` 为标准胶囊输入框，支持前后置按钮插槽；`floating` 为浮动标签输入框，`label` 初始在输入框内，聚焦或有值时上浮，且密码字段自动显示切换按钮。",
      table: { defaultValue: { summary: "default" } }
    },
    label: {
      control: "text",
      description: "浮动标签文案。仅在 `variant=\"floating\"` 时生效，作为输入框内的浮动标签显示。",
      table: { defaultValue: { summary: '""' } }
    },
    type: {
      control: "text",
      description:
        '输入框类型，支持所有原生 `<input>` 类型。`variant="floating"` 时 `type="password"` 会自动显示密码切换按钮。',
      table: { defaultValue: { summary: "text" } }
    },
    name: {
      control: "text",
      description: "输入框 `name` 属性，用于表单提交。",
      table: { defaultValue: { summary: '""' } }
    },
    required: {
      control: "boolean",
      description: "是否必填（原生 `required` 属性）。",
      table: { defaultValue: { summary: "false" } }
    },
    error: {
      control: "boolean",
      description: "是否显示错误状态。`variant=\"floating\"` 时显示红色边框；错误文案通过 `error-message` 设置。",
      table: { defaultValue: { summary: "false" } }
    },
    errorMessage: {
      control: "text",
      name: "error-message",
      description: "错误提示文案。仅在 `error=true` 且 `variant=\"floating\"` 时显示在输入框下方。",
      table: { defaultValue: { summary: '""' } }
    },
    autocomplete: {
      control: "text",
      description: "输入框 `autocomplete` 属性，用于浏览器自动填充。",
      table: { defaultValue: { summary: '""' } }
    },
    revealLabel: {
      control: "text",
      name: "reveal-label",
      description: "密码切换按钮的「显示密码」文案（仅 `variant=\"floating\"` + `type=\"password\"` 时生效）。",
      table: { defaultValue: { summary: '"Show"' } }
    },
    concealLabel: {
      control: "text",
      name: "conceal-label",
      description: "密码切换按钮的「隐藏密码」文案（仅 `variant=\"floating\"` + `type=\"password\"` 时生效）。",
      table: { defaultValue: { summary: '"Hide"' } }
    },
    placeholder: {
      control: "text",
      description: "输入框占位文案。`variant=\"default\"` 时作为原生 placeholder；`variant=\"floating\"` 时无效（使用 `label` 替代）。",
      table: { defaultValue: { summary: "请输入内容" } }
    },
    disabled: {
      control: "boolean",
      description: "是否禁用输入框。",
      table: { defaultValue: { summary: "false" } }
    },
    width: {
      control: "text",
      name: "--yn-input-width",
      description: "输入框宽度（仅 `variant=\"default\"` 时生效；floating 默认 100%）。",
      table: { category: "CSS Variables", defaultValue: { summary: "320px" } }
    },
    height: {
      control: "text",
      name: "--yn-input-height",
      description: "输入框高度。",
      table: { category: "CSS Variables", defaultValue: { summary: "44px" } }
    },
    background: {
      control: "text",
      name: "--yn-input-bg",
      description: "默认背景色。",
      table: { category: "CSS Variables", defaultValue: { summary: "rgba(255, 255, 255, 0.62)" } }
    },
    backgroundHover: {
      control: "text",
      name: "--yn-input-bg-hover",
      description: "悬停时背景色。",
      table: { category: "CSS Variables", defaultValue: { summary: "rgba(255, 255, 255, 0.86)" } }
    },
    backgroundFocus: {
      control: "color",
      name: "--yn-input-bg-focus",
      description: "聚焦时背景色。",
      table: { category: "CSS Variables", defaultValue: { summary: "#fffaf2" } }
    },
    borderColor: {
      control: "text",
      name: "--yn-input-border-color",
      description: "默认边框色。",
      table: { category: "CSS Variables", defaultValue: { summary: "rgba(36, 31, 33, 0.22)" } }
    },
    borderColorHover: {
      control: "text",
      name: "--yn-input-border-color-hover",
      description: "悬停时边框色。",
      table: { category: "CSS Variables", defaultValue: { summary: "rgba(36, 31, 33, 0.52)" } }
    },
    borderColorFocus: {
      control: "color",
      name: "--yn-input-border-color-focus",
      description: "聚焦时边框色。",
      table: { category: "CSS Variables", defaultValue: { summary: "#241f21" } }
    },
    color: {
      control: "color",
      name: "--yn-input-color",
      description: "输入文本颜色。",
      table: { category: "CSS Variables", defaultValue: { summary: "#241f21" } }
    },
    placeholderColor: {
      control: "text",
      name: "--yn-input-placeholder-color",
      description: "占位文案颜色。",
      table: { category: "CSS Variables", defaultValue: { summary: "rgba(36, 31, 33, 0.48)" } }
    },
    focusRing: {
      control: "text",
      name: "--yn-input-focus-ring",
      description: "聚焦外圈阴影颜色。",
      table: { category: "CSS Variables", defaultValue: { summary: "rgba(36, 31, 33, 0.12)" } }
    },
    backgroundDisabled: {
      control: false,
      name: "--yn-input-bg-disabled",
      description: "禁用状态背景色。",
      table: { category: "CSS Variables", defaultValue: { summary: "rgba(232, 225, 214, 0.76)" } }
    },
    disabledColor: {
      control: false,
      name: "--yn-input-disabled-color",
      description: "禁用状态文本颜色。",
      table: { category: "CSS Variables", defaultValue: { summary: "rgba(36, 31, 33, 0.42)" } }
    },
    radius: {
      control: false,
      name: "--yn-input-radius",
      description: "输入框圆角。",
      table: { category: "CSS Variables", defaultValue: { summary: "999px" } }
    },
    padding: {
      control: false,
      name: "--yn-input-padding",
      description: "输入框内边距。",
      table: { category: "CSS Variables", defaultValue: { summary: "0 14px" } }
    },
    buttonSize: {
      control: false,
      name: "--yn-input-button-size",
      description: "前置/后置按钮尺寸。",
      table: { category: "CSS Variables", defaultValue: { summary: "28px" } }
    },
    buttonColor: {
      control: "color",
      name: "--yn-input-button-color",
      description: "前置/后置按钮图标颜色。",
      table: { category: "CSS Variables", defaultValue: { summary: "#241f21" } }
    },
    buttonBgHover: {
      control: "text",
      name: "--yn-input-button-bg-hover",
      description: "前置/后置按钮悬停与键盘聚焦背景色。",
      table: { category: "CSS Variables", defaultValue: { summary: "rgba(36, 31, 33, 0.08)" } }
    },
    fontFamily: {
      control: false,
      name: "--yn-input-font-family",
      description: "输入框字体栈。",
      table: {
        category: "CSS Variables",
        defaultValue: { summary: '"Zimula", ui-serif, Georgia, Cambria, "Times New Roman", Times, serif' }
      }
    },
    fontSize: {
      control: false,
      name: "--yn-input-font-size",
      description: "输入框字号。",
      table: { category: "CSS Variables", defaultValue: { summary: "16px" } }
    },
    letterSpacing: {
      control: false,
      name: "--yn-input-letter-spacing",
      description: "输入文本字距。",
      table: { category: "CSS Variables", defaultValue: { summary: "-0.01em" } }
    },
    prefixButtonSlot: {
      name: "prefix-button",
      description:
        "可选前置按钮插槽（仅 `variant=\"default\"`）。未传入时不渲染前置按钮。最小示例：`<span slot=\"prefix-button\">...</span>`。",
      control: false,
      table: {
        category: "Slots",
        type: { summary: '<span slot="prefix-button">...</span>' }
      }
    },
    suffixButtonSlot: {
      name: "suffix-button",
      description:
        "可选后置按钮插槽（仅 `variant=\"default\"`）。未传入时不渲染后置按钮。最小示例：`<span slot=\"suffix-button\">...</span>`。",
      control: false,
      table: {
        category: "Slots",
        type: { summary: '<span slot="suffix-button">...</span>' }
      }
    },
    onYnInput: {
      name: "yn-input",
      description: "输入内容变化时触发。`event.detail` 结构：`{ value: string }`。",
      control: false,
      action: "yn-input",
      table: {
        category: "Events",
        type: { summary: "CustomEvent<{ value: string }>" }
      }
    },
    onPrefixClick: {
      name: "yn-prefix-click",
      description: "前置按钮点击时触发。`event.detail` 结构：`{ value: string }`。",
      control: false,
      action: "yn-prefix-click",
      table: {
        category: "Events",
        type: { summary: "CustomEvent<{ value: string }>" }
      }
    },
    onSuffixClick: {
      name: "yn-suffix-click",
      description: "后置按钮点击时触发。`event.detail` 结构：`{ value: string }`。",
      control: false,
      action: "yn-suffix-click",
      table: {
        category: "Events",
        type: { summary: "CustomEvent<{ value: string }>" }
      }
    }
  }
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

type PlayContext = Parameters<NonNullable<Story["play"]>>[0];

const runInputValueStep = async (canvasElement: ParentNode, step: PlayContext["step"]) => {
  const inputEl = canvasElement.querySelector("yn-input");
  if (!(inputEl instanceof HTMLElement) || !inputEl.shadowRoot) return;

  const innerInput = inputEl.shadowRoot.querySelector("input");
  if (!(innerInput instanceof HTMLInputElement)) return;

  await step("输入文本：更新组件 value 并派发 yn-input", async () => {
    let inputValue = "";
    inputEl.addEventListener(
      "yn-input",
      (event) => {
        inputValue = (event as CustomEvent<{ value: string }>).detail.value;
      },
      { once: true }
    );

    innerInput.value = "storybook interaction";
    innerInput.dispatchEvent(new Event("input", { bubbles: true, composed: true }));

    if ((inputEl as HTMLElement & { value?: string }).value !== "storybook interaction") {
      throw new Error("输入后 yn-input.value 未更新");
    }
    if (inputValue !== "storybook interaction") {
      throw new Error("yn-input 事件未携带当前 value");
    }
  });
};

const playInputValue: NonNullable<Story["play"]> = async ({ canvasElement, step }) => {
  await runInputValueStep(canvasElement, step);
};

const playSlottedButtonInteractions: NonNullable<Story["play"]> = async ({ canvasElement, step }) => {
  await runInputValueStep(canvasElement, step);

  const inputEl = canvasElement.querySelector("yn-input");
  if (!(inputEl instanceof HTMLElement) || !inputEl.shadowRoot) return;

  const prefixButton = inputEl.shadowRoot.querySelector<HTMLButtonElement>(".action-prefix");
  const suffixButton = inputEl.shadowRoot.querySelector<HTMLButtonElement>(".action-suffix");
  if (!(prefixButton instanceof HTMLButtonElement) || !(suffixButton instanceof HTMLButtonElement)) {
    throw new Error("带插槽示例应渲染前后置按钮");
  }

  await step("点击前置按钮：派发 yn-prefix-click", async () => {
    let prefixValue = "";
    inputEl.addEventListener(
      "yn-prefix-click",
      (event) => {
        prefixValue = (event as CustomEvent<{ value: string }>).detail.value;
      },
      { once: true }
    );

    prefixButton.click();

    if (prefixValue !== "storybook interaction") {
      throw new Error("yn-prefix-click 事件未携带当前 value");
    }
  });

  await step("点击后置按钮：派发 yn-suffix-click", async () => {
    let suffixValue = "";
    inputEl.addEventListener(
      "yn-suffix-click",
      (event) => {
        suffixValue = (event as CustomEvent<{ value: string }>).detail.value;
      },
      { once: true }
    );

    suffixButton.click();

    if (suffixValue !== "storybook interaction") {
      throw new Error("yn-suffix-click 事件未携带当前 value");
    }
  });
};

// ── default 变体 ──

export const Default: Story = {
  render: renderInput,
  play: playInputValue
};

export const Filled: Story = {
  args: {
    value: "已输入内容",
    placeholder: "请输入内容",
    disabled: false
  },
  render: renderInput
};

export const Disabled: Story = {
  name: "禁用态",
  args: {
    disabled: true,
    placeholder: "已禁用",
    value: "不可编辑"
  },
  render: renderInput
};

export const SlottedButtons: Story = {
  args: {
    placeholder: "带自定义前后按钮",
    prefixButtonSlot: ynSignpostSvg,
    suffixButtonSlot: ynSearchCloseSvg
  },
  render: renderInput,
  play: playSlottedButtonInteractions
};

export const PrefixOnly: Story = {
  name: "仅前置按钮",
  args: {
    placeholder: "仅前置按钮",
    prefixButtonSlot: ynSignpostSvg
  },
  render: renderInput
};

export const SuffixOnly: Story = {
  name: "仅后置按钮",
  args: {
    placeholder: "仅后置按钮",
    suffixButtonSlot: ynSearchCloseSvg
  },
  render: renderInput
};

export const Interactions: Story = {
  args: {
    placeholder: "在 Interactions 面板查看步骤",
    prefixButtonSlot: ynSignpostSvg,
    suffixButtonSlot: ynSearchCloseSvg
  },
  render: renderInput,
  play: playSlottedButtonInteractions
};

// ── floating 变体 ──

export const Floating: Story = {
  name: "浮动标签",
  args: {
    variant: "floating",
    label: "Email Address",
    value: "",
    required: true
  },
  render: renderInput
};

export const FloatingFilled: Story = {
  name: "浮动标签（有值）",
  args: {
    variant: "floating",
    label: "Email Address",
    value: "user@example.com"
  },
  render: renderInput
};

export const FloatingPassword: Story = {
  name: "浮动标签密码",
  args: {
    variant: "floating",
    label: "Password",
    type: "password"
  },
  render: renderInput
};

export const FloatingPasswordCustomLabel: Story = {
  name: "密码切换自定义文案",
  args: {
    variant: "floating",
    label: "密码",
    type: "password",
    revealLabel: "显示",
    concealLabel: "隐藏"
  },
  render: renderInput
};

export const FloatingWithError: Story = {
  name: "浮动标签错误态",
  args: {
    variant: "floating",
    label: "Email Address",
    value: "invalid-email",
    error: true,
    errorMessage: "Please enter a valid email address"
  },
  render: renderInput
};

export const FloatingDisabled: Story = {
  name: "浮动标签禁用",
  args: {
    variant: "floating",
    label: "Email Address",
    value: "user@example.com",
    disabled: true
  },
  render: renderInput
};

export const FloatingEmail: Story = {
  name: "浮动标签邮箱",
  args: {
    variant: "floating",
    label: "Email Address",
    type: "email",
    autocomplete: "email",
    required: true
  },
  render: renderInput
};
