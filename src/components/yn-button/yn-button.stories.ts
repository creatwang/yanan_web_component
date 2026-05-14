import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import "./yn-button";

type ButtonVariant = "primary" | "success" | "warning" | "danger" | "neutral" | "dark" | "default";
type ButtonSize = "mini" | "small" | "medium";
type ButtonLoadingType = "left" | "center" | "right";

type Args = {
  disabled: boolean;
  variant: ButtonVariant;
  size: ButtonSize;
  loading: boolean;
  loadingType: ButtonLoadingType;
  hitSlop: boolean;
  radius?: string;
  loadingSize?: string;
  bg?: string;
  hoverBg?: string;
  disabledBg?: string;
  disabledColor?: string;
  defaultSlot?: string;
  prefixIconSlot?: string;
  suffixIconSlot?: string;
  loadingSlot?: string;
  onClick?: (event: MouseEvent) => void;
};

const meta = {
  title: "Components/YnButton",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "基础按钮组件，支持语义色 `variant`、尺寸 `size`、加载态（`loading` + `loading-type`）、命中范围扩展（`hit-slop`）、前后图标与默认插槽文本。\n\n尺寸规则：\n- `medium`（默认）: `padding: 12px 16px`\n- `small`: `padding: 8px 16px`\n- `mini`: `padding: 3px 10px`\n\n加载规则：\n- `loading=true` 时按钮进入加载态并禁用点击。\n- `loading-type=\"left|center|right\"` 控制 loading 图标位置。\n- `loading-type=\"center\"` 时文本保持可见，loading 叠加居中展示。\n- 支持 `slot=\"loading\"` 自定义 loading（动画由业务侧自行添加）。\n\n命中规则：\n- `hit-slop=true`（默认）时，组件会通过 `::before` 扩展点击热区（四周各 +5px）。\n\n颜色策略：\n1) 通过 `variant` 控制语义状态（primary/success/warning/danger/neutral/dark/default）。\n2) 通过公开 CSS 变量覆盖具体色值。\n\n插槽优先级：\n- 文本通过默认插槽提供。\n- 前缀图标使用 `slot=\"prefix-icon\"`。\n- 后缀图标使用 `slot=\"suffix-icon\"`。\n\n事件：\n- 使用原生 `click` 事件。\n\n样式隔离：组件使用 Shadow DOM，外部样式默认不穿透，应通过公开 CSS 变量定制。"
      }
    }
  },
  args: {
    disabled: false,
    variant: "primary",
    size: "medium",
    loading: false,
    loadingType: "left",
    hitSlop: true,
    radius: "",
    loadingSize: "",
    bg: "",
    hoverBg: "",
    disabledBg: "",
    disabledColor: "",
    defaultSlot: "按钮",
    prefixIconSlot: "",
    suffixIconSlot: "",
    loadingSlot: ""
  },
  argTypes: {
    disabled: {
      control: "boolean",
      description: "是否禁用按钮。",
      table: { defaultValue: { summary: "false" } }
    },
    variant: {
      control: "radio",
      options: ["primary", "success", "warning", "danger", "neutral", "dark", "default"],
      description: "按钮语义色类型。用于选择组件内置颜色 token。",
      table: { defaultValue: { summary: "primary" } }
    },
    size: {
      control: "radio",
      options: ["mini", "small", "medium"],
      description: "按钮尺寸。`medium` 默认，控制组件内边距。",
      table: { defaultValue: { summary: "medium" } }
    },
    loading: {
      control: "boolean",
      description: "是否进入加载态。加载态下按钮禁用点击交互。",
      table: { defaultValue: { summary: "false" } }
    },
    loadingType: {
      name: "loading-type",
      control: "radio",
      options: ["left", "center", "right"],
      description: "加载图标位置，仅在 `loading=true` 时生效。",
      table: { defaultValue: { summary: "left" } }
    },
    hitSlop: {
      name: "hit-slop",
      control: "boolean",
      description: "是否开启命中范围扩展。开启后通过 `::before` 将点击热区向外扩展 5px。",
      table: { defaultValue: { summary: "true" } }
    },
    bg: {
      control: "color",
      name: "--yn-button-bg",
      description: "按钮背景色（直接覆盖当前 `variant` 的背景色）。",
      table: { category: "CSS Variables", defaultValue: { summary: "由 variant 决定（primary 默认 #F76C46）" } }
    },
    hoverBg: {
      control: "color",
      name: "--yn-button-hover-bg",
      description: "按钮悬停背景色（直接覆盖当前 `variant` 的 hover 背景色）。",
      table: { category: "CSS Variables", defaultValue: { summary: "由 variant 决定（primary 默认 #F76C46）" } }
    },
    disabledBg: {
      control: "color",
      name: "--yn-button-disabled-bg",
      description: "按钮禁用背景色。",
      table: { category: "CSS Variables", defaultValue: { summary: "由 variant 决定（primary 默认 #F3C1B4）" } }
    },
    disabledColor: {
      control: "color",
      name: "--yn-button-disabled-color",
      description: "按钮禁用文字颜色。",
      table: { category: "CSS Variables", defaultValue: { summary: "由 variant 决定（primary 默认 #7A4A40）" } }
    },
    radius: {
      control: "text",
      name: "--yn-button-radius",
      description: "按钮背景圆角。",
      table: { category: "CSS Variables", defaultValue: { summary: "min(12px, 12px + 100vw * 0)" } }
    },
    loadingSize: {
      control: "text",
      name: "--yn-button-loading-size",
      description: "loading 图标尺寸。未设置时按 size 自动映射（mini=14px, small=16px, medium=18px）。",
      table: { category: "CSS Variables", defaultValue: { summary: "size 自适应（14px/16px/18px）" } }
    },
    defaultSlot: {
      name: "(default)",
      description: "默认插槽。用于按钮文案内容，可放入文本或行内元素。",
      control: "text",
      table: {
        category: "Slots",
        type: { summary: "<yn-button>按钮文案</yn-button>" },
        defaultValue: { summary: "按钮" }
      }
    },
    prefixIconSlot: {
      name: "prefix-icon",
      description: "前缀图标插槽。可放入文本、SVG 或图标元素。",
      control: "text",
      table: {
        category: "Slots",
        type: { summary: "<span slot=\"prefix-icon\">☆</span>" },
        defaultValue: { summary: "未提供" }
      }
    },
    suffixIconSlot: {
      name: "suffix-icon",
      description: "后缀图标插槽。可放入文本、SVG 或图标元素。",
      control: "text",
      table: {
        category: "Slots",
        type: { summary: "<span slot=\"suffix-icon\">→</span>" },
        defaultValue: { summary: "未提供" }
      }
    },
    loadingSlot: {
      name: "loading",
      description: "加载插槽。用于自定义 loading 内容（动画需由开发者自行添加）。",
      control: "text",
      table: {
        category: "Slots",
        type: { summary: "<svg slot=\"loading\">...</svg>" },
        defaultValue: { summary: "未提供" }
      }
    },
    onClick: {
      name: "click",
      description: "点击按钮时触发原生点击事件。",
      control: false,
      action: "click",
      table: {
        category: "Events",
        type: { summary: "MouseEvent" }
      }
    }
  }
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

const buildStyleVars = (args: Args) => {
  const vars: string[] = [];
  if (args.bg) vars.push(`--yn-button-bg:${args.bg}`);
  if (args.hoverBg) vars.push(`--yn-button-hover-bg:${args.hoverBg}`);
  if (args.disabledBg) vars.push(`--yn-button-disabled-bg:${args.disabledBg}`);
  if (args.disabledColor) vars.push(`--yn-button-disabled-color:${args.disabledColor}`);
  if (args.radius) vars.push(`--yn-button-radius:${args.radius}`);
  if (args.loadingSize) vars.push(`--yn-button-loading-size:${args.loadingSize}`);
  return vars.join(";");
};

export const Default: Story = {
  render: (args: Args) =>
    html`<yn-button
      ?disabled=${args.disabled}
      variant=${args.variant}
      size=${args.size}
      ?loading=${args.loading}
      loading-type=${args.loadingType}
      ?hit-slop=${args.hitSlop}
      style=${buildStyleVars(args)}
      @click=${(event: Event) => args.onClick?.(event as MouseEvent)}
    >
      ${args.prefixIconSlot ? html`<span slot="prefix-icon">${args.prefixIconSlot}</span>` : ""}
      ${args.defaultSlot ?? ""}
      ${args.suffixIconSlot ? html`<span slot="suffix-icon">${args.suffixIconSlot}</span>` : ""}
      ${args.loadingSlot ? html`<span slot="loading">${args.loadingSlot}</span>` : ""}
    </yn-button>`,
  play: async ({ canvasElement, step }) => {
    const buttonEl = canvasElement.querySelector("yn-button");
    if (!(buttonEl instanceof HTMLElement) || !buttonEl.shadowRoot) return;

    const innerButton = buttonEl.shadowRoot.querySelector("button");
    if (!(innerButton instanceof HTMLButtonElement)) return;

    await step("点击按钮触发 click 事件", async () => {
      let emitted = false;
      const onClick = () => {
        emitted = true;
      };
      buttonEl.addEventListener("click", onClick, { once: true });
      innerButton.click();
      if (!emitted) {
        throw new Error("点击后应触发 click");
      }
    });
  }
};

export const Disabled: Story = {
  args: {
    defaultSlot: "不可用按钮",
    disabled: true,
    prefixIconSlot: "🔒"
  },
  render: (args: Args) =>
    html`<yn-button
      ?disabled=${args.disabled}
      variant=${args.variant}
      size=${args.size}
      ?loading=${args.loading}
      loading-type=${args.loadingType}
      ?hit-slop=${args.hitSlop}
      style=${buildStyleVars(args)}
      @click=${(event: Event) => args.onClick?.(event as MouseEvent)}
    >
      ${args.prefixIconSlot ? html`<span slot="prefix-icon">${args.prefixIconSlot}</span>` : ""}
      ${args.defaultSlot ?? ""}
      ${args.suffixIconSlot ? html`<span slot="suffix-icon">${args.suffixIconSlot}</span>` : ""}
      ${args.loadingSlot ? html`<span slot="loading">${args.loadingSlot}</span>` : ""}
    </yn-button>`
};

export const Variants: Story = {
  render: (args: Args) => html`
    <div class="yn-flex yn-items-center yn-gap-3">
      <yn-button variant="primary" size=${args.size} ?disabled=${args.disabled} ?loading=${args.loading} loading-type=${args.loadingType} ?hit-slop=${args.hitSlop} style=${buildStyleVars(args)} @click=${(event: Event) =>
        args.onClick?.(event as MouseEvent)}>主色按钮</yn-button>
      <yn-button variant="success" size=${args.size} ?disabled=${args.disabled} ?loading=${args.loading} loading-type=${args.loadingType} ?hit-slop=${args.hitSlop} style=${buildStyleVars(args)} @click=${(event: Event) =>
        args.onClick?.(event as MouseEvent)}>成功按钮</yn-button>
      <yn-button variant="warning" size=${args.size} ?disabled=${args.disabled} ?loading=${args.loading} loading-type=${args.loadingType} ?hit-slop=${args.hitSlop} style=${buildStyleVars(args)} @click=${(event: Event) =>
        args.onClick?.(event as MouseEvent)}>警告按钮</yn-button>
      <yn-button variant="danger" size=${args.size} ?disabled=${args.disabled} ?loading=${args.loading} loading-type=${args.loadingType} ?hit-slop=${args.hitSlop} style=${buildStyleVars(args)} @click=${(event: Event) =>
        args.onClick?.(event as MouseEvent)}>危险按钮</yn-button>
      <yn-button variant="neutral" size=${args.size} ?disabled=${args.disabled} ?loading=${args.loading} loading-type=${args.loadingType} ?hit-slop=${args.hitSlop} style=${buildStyleVars(args)} @click=${(event: Event) =>
        args.onClick?.(event as MouseEvent)}>中性色按钮</yn-button>
      <yn-button variant="dark" size=${args.size} ?disabled=${args.disabled} ?loading=${args.loading} loading-type=${args.loadingType} ?hit-slop=${args.hitSlop} style=${buildStyleVars(args)} @click=${(event: Event) =>
        args.onClick?.(event as MouseEvent)}>深色按钮</yn-button>
      <yn-button variant="default" size=${args.size} ?disabled=${args.disabled} ?loading=${args.loading} loading-type=${args.loadingType} ?hit-slop=${args.hitSlop} style=${buildStyleVars(args)} @click=${(event: Event) =>
        args.onClick?.(event as MouseEvent)}>默认白色</yn-button>
    </div>
  `
};

export const Sizes: Story = {
  args: {
    variant: "primary"
  },
  render: (args: Args) => html`
    <div class="yn-flex yn-items-center yn-gap-3">
      <yn-button size="mini" variant=${args.variant} ?disabled=${args.disabled} ?loading=${args.loading} loading-type=${args.loadingType} ?hit-slop=${args.hitSlop} style=${buildStyleVars(args)} @click=${(event: Event) =>
        args.onClick?.(event as MouseEvent)}>Mini 按钮</yn-button>
      <yn-button size="small" variant=${args.variant} ?disabled=${args.disabled} ?loading=${args.loading} loading-type=${args.loadingType} ?hit-slop=${args.hitSlop} style=${buildStyleVars(args)} @click=${(event: Event) =>
        args.onClick?.(event as MouseEvent)}>Small 按钮</yn-button>
      <yn-button size="medium" variant=${args.variant} ?disabled=${args.disabled} ?loading=${args.loading} loading-type=${args.loadingType} ?hit-slop=${args.hitSlop} style=${buildStyleVars(args)} @click=${(event: Event) =>
        args.onClick?.(event as MouseEvent)}>Medium 按钮</yn-button>
    </div>
  `
};

export const WithIcons: Story = {
  args: {
    defaultSlot: "下载文件"
  },
  render: (args: Args) => html`
    <div class="yn-flex yn-items-center yn-gap-3">
      <yn-button
        variant=${args.variant}
        size=${args.size}
        ?disabled=${args.disabled}
        ?loading=${args.loading}
        loading-type=${args.loadingType}
        ?hit-slop=${args.hitSlop}
        style=${buildStyleVars(args)}
        @click=${(event: Event) => args.onClick?.(event as MouseEvent)}
      >
        ${args.defaultSlot ?? ""}
        <span slot="prefix-icon">⬇</span>
        <span slot="suffix-icon">→</span>
      </yn-button>
      <yn-button
        variant=${args.variant}
        size=${args.size}
        ?disabled=${args.disabled}
        ?loading=${args.loading}
        loading-type=${args.loadingType}
        ?hit-slop=${args.hitSlop}
        style=${buildStyleVars(args)}
        @click=${(event: Event) => args.onClick?.(event as MouseEvent)}
      >
        ${args.defaultSlot ?? ""}
        <span slot="prefix-icon">★</span>
        <span slot="suffix-icon">↗</span>
      </yn-button>
    </div>
  `
};

export const PrefixIconOnlyCentered: Story = {
  args: {
    defaultSlot: "",
    variant: "primary"
  },
  render: (args: Args) => html`
    <yn-button
      variant=${args.variant}
      size=${args.size}
      ?disabled=${args.disabled}
      ?loading=${args.loading}
      loading-type=${args.loadingType}
      ?hit-slop=${args.hitSlop}
      style=${buildStyleVars(args)}
      @click=${(event: Event) => args.onClick?.(event as MouseEvent)}
    >
      <svg slot="prefix-icon" width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M18 7.26325V5.80121L9.92465 2.13027C9.74931 2.05086 9.63688 1.87597 9.63688 1.68368V0.107422H8.03074V14.072C8.03074 14.3432 7.81123 14.5627 7.53997 14.5627H5.80934C6.23007 14.0934 6.4701 13.4585 6.41745 12.7688C6.3251 11.5592 5.32482 10.5973 4.11307 10.5492C2.74027 10.4947 1.60659 11.5958 1.60659 12.9566C1.60659 13.5732 1.83948 14.1362 2.22184 14.5627H0V16.1689H16.0615V14.5627H9.63688V11.3803C9.63688 11.1881 9.74931 11.0132 9.92465 10.9337L18 7.26325ZM4.01537 12.1535C4.4584 12.1535 4.81844 12.514 4.81844 12.9566C4.81844 13.3992 4.4584 13.7597 4.01537 13.7597C3.57234 13.7597 3.21229 13.3992 3.21229 12.9566C3.21229 12.514 3.57234 12.1535 4.01537 12.1535ZM14.744 6.97861L9.63688 9.29994V3.76364L14.744 6.08497C15.1277 6.25941 15.1277 6.80416 14.744 6.97861Z"
          fill="#241F21"
        />
      </svg>
    </yn-button>
  `
};

export const LoadingShowcase: Story = {
  args: {
    defaultSlot: "提交中",
    loading: true,
    loadingType: "left"
  },
  render: (args: Args) => html`
    <yn-button
      variant=${args.variant}
      size=${args.size}
      ?disabled=${args.disabled}
      ?loading=${args.loading}
      loading-type=${args.loadingType}
      ?hit-slop=${args.hitSlop}
      style=${buildStyleVars(args)}
    >
      ${args.defaultSlot ?? ""}
    </yn-button>
  `
};

export const CustomLoadingSlot: Story = {
  args: {
    defaultSlot: "提交中",
    loading: true,
    loadingType: "center"
  },
  render: (args: Args) => html`
    <yn-button
      variant=${args.variant}
      size=${args.size}
      ?disabled=${args.disabled}
      ?loading=${args.loading}
      loading-type=${args.loadingType}
      ?hit-slop=${args.hitSlop}
      style=${buildStyleVars(args)}
    >
      <span style="color:#ffffff;">${args.defaultSlot ?? ""}</span>
      <svg slot="loading" width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <path
          fill="#555"
          fill-rule="evenodd"
          d="M11,16 C12.1045695,16 13,16.8954305 13,18 C13,19.1045695 12.1045695,20 11,20 C9.8954305,20 9,19.1045695 9,18 C9,16.8954305 9.8954305,16 11,16 Z M4.74123945,13 C6.12195133,13 7.24123945,14.1192881 7.24123945,15.5 C7.24123945,16.8807119 6.12195133,18 4.74123945,18 C3.36052758,18 2.24123945,16.8807119 2.24123945,15.5 C2.24123945,14.1192881 3.36052758,13 4.74123945,13 Z M16.3193286,13.5 C17.4238981,13.5 18.3193286,14.3954305 18.3193286,15.5 C18.3193286,16.6045695 17.4238981,17.5 16.3193286,17.5 C15.2147591,17.5 14.3193286,16.6045695 14.3193286,15.5 C14.3193286,14.3954305 15.2147591,13.5 16.3193286,13.5 Z M18.5,9.31854099 C19.3284271,9.31854099 20,9.99011387 20,10.818541 C20,11.6469681 19.3284271,12.318541 18.5,12.318541 C17.6715729,12.318541 17,11.6469681 17,10.818541 C17,9.99011387 17.6715729,9.31854099 18.5,9.31854099 Z M2.5,6 C3.88071187,6 5,7.11928813 5,8.5 C5,9.88071187 3.88071187,11 2.5,11 C1.11928813,11 0,9.88071187 0,8.5 C0,7.11928813 1.11928813,6 2.5,6 Z M17.7857894,5.20724734 C18.3380741,5.20724734 18.7857894,5.65496259 18.7857894,6.20724734 C18.7857894,6.75953209 18.3380741,7.20724734 17.7857894,7.20724734 C17.2335046,7.20724734 16.7857894,6.75953209 16.7857894,6.20724734 C16.7857894,5.65496259 17.2335046,5.20724734 17.7857894,5.20724734 Z M8,0 C9.65685425,0 11,1.34314575 11,3 C11,4.65685425 9.65685425,6 8,6 C6.34314575,6 5,4.65685425 5,3 C5,1.34314575 6.34314575,0 8,0 Z M15.5,3 C15.7761424,3 16,3.22385763 16,3.5 C16,3.77614237 15.7761424,4 15.5,4 C15.2238576,4 15,3.77614237 15,3.5 C15,3.22385763 15.2238576,3 15.5,3 Z"
        />
      </svg>
    </yn-button>
  `
};

export const DisabledPaletteShowcase: Story = {
  render: (args: Args) => html`
    <div class="yn-flex yn-items-center yn-gap-3">
      <yn-button variant="primary" size=${args.size} ?disabled=${true} style=${buildStyleVars(args)}>主色禁用</yn-button>
      <yn-button variant="success" size=${args.size} ?disabled=${true} style=${buildStyleVars(args)}>成功禁用</yn-button>
      <yn-button variant="warning" size=${args.size} ?disabled=${true} style=${buildStyleVars(args)}>警告禁用</yn-button>
      <yn-button variant="danger" size=${args.size} ?disabled=${true} style=${buildStyleVars(args)}>危险禁用</yn-button>
      <yn-button variant="neutral" size=${args.size} ?disabled=${true} style=${buildStyleVars(args)}>中性禁用</yn-button>
      <yn-button variant="dark" size=${args.size} ?disabled=${true} style=${buildStyleVars(args)}>深色禁用</yn-button>
      <yn-button variant="default" size=${args.size} ?disabled=${true} style=${buildStyleVars(args)}>默认白色禁用</yn-button>
    </div>
  `
};
