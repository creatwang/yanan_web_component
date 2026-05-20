import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";
import { ynSearchCloseSvg, ynSignpostSvg } from "../../asset/svg";
import "./yn-input";

type Args = {
  value: string;
  placeholder: string;
  disabled: boolean;
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
          "Floema 风格的输入框组件，使用暖色半透明背景、细线边框和胶囊圆角，支持受控 value、占位文案、禁用状态。\n\n**默认无前后置图标**；仅在传入 `prefix-button` / `suffix-button` 插槽时渲染对应按钮。\n\n事件：输入变化时触发 `yn-input`；前置按钮点击触发 `yn-prefix-click`；后置按钮点击触发 `yn-suffix-click`。三个事件的 `event.detail` 均为 `{ value: string }`。\n\n插槽：`prefix-button`、`suffix-button` 为可选；传入后显示可点击按钮，插槽内容即按钮图标。\n\n样式隔离：组件使用 Shadow DOM，外部样式默认不穿透；应通过公开 CSS 变量定制样式：\n- `--yn-input-width`\n- `--yn-input-height`\n- `--yn-input-bg`\n- `--yn-input-bg-hover`\n- `--yn-input-bg-focus`\n- `--yn-input-bg-disabled`\n- `--yn-input-border-color`\n- `--yn-input-border-color-hover`\n- `--yn-input-border-color-focus`\n- `--yn-input-color`\n- `--yn-input-placeholder-color`\n- `--yn-input-disabled-color`\n- `--yn-input-focus-ring`\n- `--yn-input-radius`\n- `--yn-input-padding`\n- `--yn-input-button-size`\n- `--yn-input-button-color`\n- `--yn-input-button-bg-hover`\n- `--yn-input-font-family`\n- `--yn-input-font-size`\n- `--yn-input-letter-spacing`\n\n示例：\n```html\n<yn-input @yn-prefix-click=\"...\" @yn-suffix-click=\"...\">\n  <span slot=\"prefix-button\">...</span>\n  <span slot=\"suffix-button\">...</span>\n</yn-input>\n```"
      }
    }
  },
  args: {
    value: "",
    placeholder: "请输入内容",
    disabled: false,
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
    placeholder: {
      control: "text",
      description: "输入框占位文案。",
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
      description: "输入框宽度。",
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
        "可选前置按钮插槽。未传入时不渲染前置按钮。最小示例：`<span slot=\"prefix-button\">...</span>`。",
      control: false,
      table: {
        category: "Slots",
        type: { summary: '<span slot="prefix-button">...</span>' }
      }
    },
    suffixButtonSlot: {
      name: "suffix-button",
      description:
        "可选后置按钮插槽。未传入时不渲染后置按钮。最小示例：`<span slot=\"suffix-button\">...</span>`。",
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

export const SlottedButtons: Story = {
  args: {
    placeholder: "带自定义前后按钮",
    prefixButtonSlot: ynSignpostSvg,
    suffixButtonSlot: ynSearchCloseSvg
  },
  render: renderInput,
  play: playSlottedButtonInteractions
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
