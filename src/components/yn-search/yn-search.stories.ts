import type { Meta, StoryObj } from "@storybook/web-components";
import { expect, userEvent, waitFor } from "@storybook/test";
import { html } from "lit";
import "./yn-search";
import type { YnSearchExpandDirection } from "./yn-search";

type Args = {
  inputWidth: number;
  placeholder: string;
  disabled: boolean;
  close: boolean;
  open: boolean;
  expandDirection: YnSearchExpandDirection;
  bgActive: string;
  bgIdle: string;
  fieldBg: string;
  iconColor: string;
  fieldColor: string;
  caretColor: string;
  placeholderColor: string;
  fillDuration: string;
  fillEase: string;
  iconDuration: string;
  iconEase: string;
  defaultSlot?: string;
  input?: (event: CustomEvent<{ value: string }>) => void;
  enter?: (event: CustomEvent<{ value: string }>) => void;
};

const cssVarStyle = (args: Args) =>
  `--yn-search-bg-active:${args.bgActive};--yn-search-bg-idle:${args.bgIdle};--yn-search-field-bg:${args.fieldBg};--yn-search-icon-color:${args.iconColor};--yn-search-field-color:${args.fieldColor};--yn-search-caret-color:${args.caretColor};--yn-search-placeholder-color:${args.placeholderColor};--yn-search-fill-duration:${args.fillDuration};--yn-search-fill-ease:${args.fillEase};--yn-search-icon-duration:${args.iconDuration};--yn-search-icon-ease:${args.iconEase};`;

const meta = {
  title: "Components/YnSearch",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "可展开的搜索组件，点击按钮显示输入区域并支持搜索输入。\n\n样式隔离：组件使用 Shadow DOM，外部样式默认不穿透；可通过 CSS 变量定制样式。\n\n默认插槽支持传入 `datalist`，组件会自动把插槽内的 `option` 同步到内部 datalist 并完成 input 的 list 绑定。\n\n**关闭行为（`close` 默认 `true`）**：展开且有输入时，首次点击关闭按钮仅清空文本并派发 `input` 事件；再次点击才播放收起动画。\n\n**展开尺寸（`input-width`）**：控制输入区域宽度（px，最小 80）。展开总宽度 = `44 + 10 + input-width`。\n\n**默认展开（`open` 默认 `false`）**：设为 `true` 时初始即为展开态（无入场动画）。\n\n**展开方向（`expand-direction` 默认 `right`）**：`right` 向右展开并顶开右侧元素；`left` 向左展开并顶开左侧元素。\n\n示例：\n```html\nimport \"yn-web-component/components/yn-search\";\n\n<yn-search expand-direction=\"right\" input-width=\"240\" open></yn-search>\n```"
      }
    }
  },
  args: {
    inputWidth: 514,
    placeholder: "O que estás à procura?",
    disabled: false,
    close: true,
    open: false,
    expandDirection: "right",
    bgActive: "rgba(255, 255, 255, 0.96)",
    bgIdle: "rgba(255, 255, 255, 0)",
    fieldBg: "var(--bg-fill)",
    iconColor: "#241f21",
    fieldColor: "rgba(36, 31, 33, 0.7)",
    caretColor: "#241f21",
    placeholderColor: "rgba(36, 31, 33, 0.6)",
    fillDuration: "220ms",
    fillEase: "cubic-bezier(0.4, 0, 1, 1)",
    iconDuration: "220ms",
    iconEase: "cubic-bezier(0.4, 0, 1, 1)"
  },
  argTypes: {
    inputWidth: {
      control: { type: "number", min: 120, max: 700, step: 1 },
      description:
        "输入区域宽度（px，最小 80）。展开总宽度 = 44 + 10 + input-width（含按钮区与间距）。",
      table: { defaultValue: { summary: "514" } }
    },
    placeholder: {
      control: "text",
      description: "输入框占位文案。",
      table: { defaultValue: { summary: "O que estás à procura?" } }
    },
    disabled: {
      control: "boolean",
      description: "是否禁用组件交互。",
      table: { defaultValue: { summary: "false" } }
    },
    close: {
      control: "boolean",
      description:
        "关闭按钮两步行为。true（默认）：有值时首次点击仅清空并派发 input，无值时再收起；false：点击即清空并收起。",
      table: { defaultValue: { summary: "true" } }
    },
    open: {
      control: "boolean",
      description: "是否默认展开。true：初始为展开态；false（默认）：初始收起。",
      table: { defaultValue: { summary: "false" } }
    },
    expandDirection: {
      name: "expand-direction",
      control: "select",
      options: ["left", "right"],
      description: "输入框展开方向。right 向右展开（默认）；left 向左展开。",
      table: { defaultValue: { summary: "right" } }
    },
    bgActive: {
      control: "text",
      name: "--yn-search-bg-active",
      description: "展开/悬停时背景填充色。",
      table: { category: "CSS Variables", defaultValue: { summary: "rgba(255, 255, 255, 0.96)" } }
    },
    bgIdle: {
      control: "text",
      name: "--yn-search-bg-idle",
      description: "收起时背景填充色。",
      table: { category: "CSS Variables", defaultValue: { summary: "transparent" } }
    },
    fieldBg: {
      control: "text",
      name: "--yn-search-field-bg",
      description: "输入框背景色。默认跟随壳层 `--bg-fill`，可与 `--yn-search-bg-active` 保持一致。",
      table: { category: "CSS Variables", defaultValue: { summary: "var(--bg-fill)" } }
    },
    iconColor: {
      control: "color",
      name: "--yn-search-icon-color",
      description: "搜索/关闭图标颜色。",
      table: { category: "CSS Variables", defaultValue: { summary: "#241f21" } }
    },
    fieldColor: {
      control: "color",
      name: "--yn-search-field-color",
      description: "输入文字颜色。",
      table: { category: "CSS Variables", defaultValue: { summary: "rgba(36, 31, 33, 0.7)" } }
    },
    caretColor: {
      control: "color",
      name: "--yn-search-caret-color",
      description: "输入框光标颜色。",
      table: { category: "CSS Variables", defaultValue: { summary: "#241f21" } }
    },
    placeholderColor: {
      control: "color",
      name: "--yn-search-placeholder-color",
      description: "占位符文字颜色。",
      table: { category: "CSS Variables", defaultValue: { summary: "rgba(36, 31, 33, 0.6)" } }
    },
    fillDuration: {
      control: "text",
      name: "--yn-search-fill-duration",
      description: "背景 fill/stroke 过渡时长。",
      table: { category: "CSS Variables", defaultValue: { summary: "220ms" } }
    },
    fillEase: {
      control: "text",
      name: "--yn-search-fill-ease",
      description: "背景 fill/stroke 过渡曲线。",
      table: { category: "CSS Variables", defaultValue: { summary: "cubic-bezier(0.4, 0, 1, 1)" } }
    },
    iconDuration: {
      control: "text",
      name: "--yn-search-icon-duration",
      description: "图标切换过渡时长。",
      table: { category: "CSS Variables", defaultValue: { summary: "220ms" } }
    },
    iconEase: {
      control: "text",
      name: "--yn-search-icon-ease",
      description: "图标切换过渡曲线。",
      table: { category: "CSS Variables", defaultValue: { summary: "cubic-bezier(0.4, 0, 1, 1)" } }
    },
    defaultSlot: {
      name: "default",
      description:
        "默认插槽。传入 `datalist` 为输入框提供原生候选项。最小示例：`<datalist><option value=\"Sofa\"></option></datalist>`。",
      control: false,
      table: {
        category: "Slots",
        type: { summary: "<datalist><option value=\"...\"></option></datalist>" }
      }
    },
    input: {
      name: "input",
      description: "输入内容变化时触发（含清空时派发 `{ value: \"\" }`）。`event.detail` 结构：`{ value: string }`。",
      control: false,
      action: "input",
      table: {
        category: "Events",
        type: { summary: "CustomEvent<{ value: string }>" }
      }
    },
    enter: {
      name: "enter",
      description: "按下回车键时触发。`event.detail` 结构：`{ value: string }`。",
      control: false,
      action: "enter",
      table: {
        category: "Events",
        type: { summary: "CustomEvent<{ value: string }>" }
      }
    }
  }
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {
  render: (args: Args) => html`
    <div class="yn-bg-[#F2EFEA] yn-p-[10px]">
      <yn-search
        .inputWidth=${args.inputWidth}
        placeholder=${args.placeholder}
        ?disabled=${args.disabled}
        ?close=${args.close}
        ?open=${args.open}
        expand-direction=${args.expandDirection}
        style=${cssVarStyle(args)}
        @input=${(event: Event) => args.input?.(event as CustomEvent<{ value: string }>)}
        @enter=${(event: Event) => args.enter?.(event as CustomEvent<{ value: string }>)}
      >
        <datalist>
          <option value="Sofa"></option>
          <option value="Table"></option>
        </datalist>
      </yn-search>
    </div>
  `,
  play: async ({ canvasElement, step }) => {
    const searchEl = canvasElement.querySelector("yn-search");
    if (!(searchEl instanceof HTMLElement) || !searchEl.shadowRoot) return;

    const toggleBtn = searchEl.shadowRoot.querySelector<HTMLButtonElement>("#toggleBtn");
    const inputEl = searchEl.shadowRoot.querySelector<HTMLInputElement>("#searchInput");
    if (!(toggleBtn instanceof HTMLButtonElement) || !(inputEl instanceof HTMLInputElement)) return;

    await step("点击搜索按钮后展开输入区域", async () => {
      await userEvent.click(toggleBtn);
      await waitFor(() => {
        const shell = searchEl.shadowRoot?.querySelector("#searchShell");
        if (!(shell instanceof HTMLElement) || !shell.classList.contains("open")) {
          throw new Error("点击后搜索区域应为展开状态");
        }
      });
    });

    await step("输入文本后首次点击关闭按钮仅清空并派发 input", async () => {
      await userEvent.type(inputEl, "Sofa");
      let clearedValue = "pending";
      searchEl.addEventListener("input", (event: Event) => {
        clearedValue = (event as unknown as CustomEvent<{ value: string }>).detail.value;
      });
      await userEvent.click(toggleBtn);
      await waitFor(() => {
        expect(inputEl.value).toBe("");
        expect(clearedValue).toBe("");
        const shell = searchEl.shadowRoot?.querySelector("#searchShell");
        expect(shell?.classList.contains("open")).toBe(true);
      });
    });

    await step("再次点击关闭按钮后收起输入区域", async () => {
      await userEvent.click(toggleBtn);
      await waitFor(
        () => {
          const shell = searchEl.shadowRoot?.querySelector("#searchShell");
          if (shell?.classList.contains("open")) {
            throw new Error("再次点击后搜索区域应收起");
          }
        },
        { timeout: 1200 }
      );
    });
  }
};

export const PushRightSiblings: Story = {
  name: "顶开右侧元素",
  args: {
    inputWidth: 240,
    expandDirection: "right"
  },
  parameters: {
    docs: {
      description: {
        story:
          "在 flex 布局中，`expand-direction=\"right\"` 时搜索左缘保持不动：阶段一只做按钮形态过渡，阶段二壳层宽度同步增长并逐步顶开右侧元素。可通过 `--yn-search-field-bg` 让输入区背景与壳层一致。\n\n```html\n<div style=\"display:flex;align-items:center;gap:12px;\">\n  <yn-search expand-direction=\"right\" input-width=\"240\"></yn-search>\n  <button type=\"button\">Cart</button>\n</div>\n```"
      }
    }
  },
  render: (args: Args) => html`
    <div
      class="yn-bg-[#F2EFEA] yn-p-[16px] yn-flex yn-items-center yn-gap-[12px]"
      style="width: fit-content;"
    >
      <yn-search
        .inputWidth=${args.inputWidth}
        placeholder=${args.placeholder}
        ?disabled=${args.disabled}
        ?close=${args.close}
        ?open=${args.open}
        expand-direction=${args.expandDirection}
        style=${cssVarStyle(args)}
        @input=${(event: Event) => args.input?.(event as CustomEvent<{ value: string }>)}
        @enter=${(event: Event) => args.enter?.(event as CustomEvent<{ value: string }>)}
      ></yn-search>
      <button
        type="button"
        data-testid="cart-btn"
        class="yn-h-[38px] yn-px-[16px] yn-rounded-[8px] yn-border yn-border-[#241f21]/20 yn-bg-white"
      >
        Cart
      </button>
      <span data-testid="menu-label" class="yn-text-[14px] yn-text-[#241f21]">Menu</span>
    </div>
  `,
  play: async ({ canvasElement, step }) => {
    const searchEl = canvasElement.querySelector("yn-search");
    const cartBtn = canvasElement.querySelector("[data-testid='cart-btn']");
    if (!(searchEl instanceof HTMLElement) || !searchEl.shadowRoot || !(cartBtn instanceof HTMLElement)) {
      return;
    }

    const toggleBtn = searchEl.shadowRoot.querySelector<HTMLButtonElement>("#toggleBtn");
    if (!(toggleBtn instanceof HTMLButtonElement)) return;

    const initialLeft = cartBtn.getBoundingClientRect().left;
    const searchLeftBefore = searchEl.getBoundingClientRect().left;

    await step("展开首帧：搜索左缘不动、Cart 不被瞬时顶开", async () => {
      await userEvent.click(toggleBtn);
      await waitFor(
        () => {
          const shell = searchEl.shadowRoot?.querySelector<HTMLElement>("#searchShell");
          if (!shell?.classList.contains("animating") && !shell?.classList.contains("open")) {
            throw new Error("搜索动画未启动");
          }
        },
        { timeout: 500 },
      );
      expect(searchEl.getBoundingClientRect().left).toBeCloseTo(searchLeftBefore, 0);
      expect(searchEl.getBoundingClientRect().width).toBeLessThan(80);
      expect(cartBtn.getBoundingClientRect().left).toBeCloseTo(initialLeft, 0);
    });

    await step("展开搜索框后右侧 Cart 按钮被逐步顶开", async () => {
      await waitFor(
        () => {
          const shell = searchEl.shadowRoot?.querySelector<HTMLElement>("#searchShell");
          if (!shell?.classList.contains("open")) {
            throw new Error("搜索框未展开");
          }
          const nextLeft = cartBtn.getBoundingClientRect().left;
          if (nextLeft <= initialLeft + 40) {
            throw new Error("右侧元素未被明显顶开");
          }
        },
        { timeout: 1200 }
      );
    });
  }
};

export const ExpandLeft: Story = {
  name: "向左展开",
  args: {
    inputWidth: 240,
    expandDirection: "left"
  },
  parameters: {
    docs: {
      description: {
        story:
          "设置 `expand-direction=\"left\"` 时搜索框向左展开，右缘保持不动并逐步顶开左侧 Brand。展开总宽度 = 44 + 10 + input-width。"
      }
    }
  },
  render: (args: Args) => html`
    <div
      class="yn-bg-[#F2EFEA] yn-p-[16px] yn-flex yn-items-center yn-justify-end yn-gap-[12px]"
      style="width: fit-content; margin-left: auto;"
    >
      <span data-testid="brand-label" class="yn-text-[14px] yn-text-[#241f21]">Brand</span>
      <yn-search
        .inputWidth=${args.inputWidth}
        placeholder=${args.placeholder}
        ?disabled=${args.disabled}
        ?close=${args.close}
        ?open=${args.open}
        expand-direction=${args.expandDirection}
        style=${cssVarStyle(args)}
        @input=${(event: Event) => args.input?.(event as CustomEvent<{ value: string }>)}
        @enter=${(event: Event) => args.enter?.(event as CustomEvent<{ value: string }>)}
      ></yn-search>
    </div>
  `,
  play: async ({ canvasElement, step }) => {
    const searchEl = canvasElement.querySelector("yn-search");
    const brand = canvasElement.querySelector("[data-testid='brand-label']");
    if (!(searchEl instanceof HTMLElement) || !searchEl.shadowRoot || !(brand instanceof HTMLElement)) {
      return;
    }

    const toggleBtn = searchEl.shadowRoot.querySelector<HTMLButtonElement>("#toggleBtn");
    if (!(toggleBtn instanceof HTMLButtonElement)) return;

    const rightBefore = searchEl.getBoundingClientRect().right;
    const brandLeftBefore = brand.getBoundingClientRect().left;

    await step("向左展开时右缘不动、Brand 被逐步顶开", async () => {
      await userEvent.click(toggleBtn);
      await waitFor(
        () => {
          const shell = searchEl.shadowRoot?.querySelector<HTMLElement>("#searchShell");
          if (!shell?.classList.contains("open")) {
            throw new Error("搜索框未展开");
          }
          expect(searchEl.getBoundingClientRect().right).toBeCloseTo(rightBefore, 0);
          expect(brand.getBoundingClientRect().left).toBeLessThan(brandLeftBefore - 20);
        },
        { timeout: 1200 }
      );
    });
  }
};

export const DefaultOpen: Story = {
  name: "默认展开",
  args: {
    open: true,
    inputWidth: 240
  },
  parameters: {
    docs: {
      description: {
        story: "设置 `open` 为 `true` 时，组件初始即为展开态，不播放入场动画。"
      }
    }
  },
  render: (args: Args) => html`
    <div class="yn-bg-[#F2EFEA] yn-p-[10px]">
      <yn-search
        .inputWidth=${args.inputWidth}
        placeholder=${args.placeholder}
        ?disabled=${args.disabled}
        ?close=${args.close}
        ?open=${args.open}
        expand-direction=${args.expandDirection}
        style=${cssVarStyle(args)}
        @input=${(event: Event) => args.input?.(event as CustomEvent<{ value: string }>)}
        @enter=${(event: Event) => args.enter?.(event as CustomEvent<{ value: string }>)}
      ></yn-search>
    </div>
  `,
  play: async ({ canvasElement, step }) => {
    const searchEl = canvasElement.querySelector("yn-search");
    if (!(searchEl instanceof HTMLElement) || !searchEl.shadowRoot) return;

    await step("初始即为展开态", async () => {
      const shell = searchEl.shadowRoot?.querySelector("#searchShell");
      expect(shell?.classList.contains("open")).toBe(true);
      expect(Number.parseFloat(getComputedStyle(searchEl).width)).toBeGreaterThan(200);
    });
  }
};
