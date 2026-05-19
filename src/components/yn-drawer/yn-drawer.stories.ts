import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import "./yn-drawer";
import "../yn-button/yn-button";

const EMPTY_CART_IMAGE =
  "https://images.ctfassets.net/wkwo8cyw934s/7bKPYF3SncuYK5c1Qb8sXD/5eceffb8fc843c0e50166c8fe0451dbd/Frame_4291-3.png";

type Args = {
  open: boolean;
  width: number;
  title: string;
  placement: "auto" | "right" | "bottom";
  sheetHeight: string;
  closeOnBackdrop: boolean;
  zIndex: number;
  drawerBg: string;
  drawerShadow: string;
  backdropColor: string;
  headerBorder: string;
  footerBorder: string;
  titleColor: string;
  closeColor: string;
  closeHoverBg: string;
  contentColor: string;
  footerBg: string;
  openDuration: string;
  closeDuration: string;
  openEase: string;
  closeEase: string;
  trigger?: string;
  header?: string;
  content?: string;
  footer?: string;
  show?: (payload?: unknown) => void;
  close?: (payload?: unknown) => void;
  toggle?: (payload?: unknown) => void;
  onOpenChange?: (event: CustomEvent<{ open: boolean; source: string; payload?: unknown; triggerPayload?: unknown }>) => void;
  onBeforeOpen?: (event: CustomEvent<{ open: boolean; source: string; payload?: unknown; triggerPayload?: unknown }>) => void;
  onAfterOpen?: (event: CustomEvent<{ open: boolean; source: string; payload?: unknown; triggerPayload?: unknown }>) => void;
  onBeforeClose?: (event: CustomEvent<{ open: boolean; source: string; payload?: unknown; triggerPayload?: unknown }>) => void;
  onAfterClose?: (event: CustomEvent<{ open: boolean; source: string; payload?: unknown; triggerPayload?: unknown }>) => void;
};

const meta = {
  title: "Components/YnDrawer",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "抽屉组件，基于原生 popover 封装。`placement=\"auto\"` 时窄屏自底部上滑，宽屏自右侧滑入；可用 `placement=\"bottom\"` 强制底部弹出。底部高度由 `sheet-height` 控制，默认 `90vh`；设为 `auto` 时高度随内容（`translateY(100%)` 按面板高度滑入）。\n\n生命周期事件：`before-open`、`after-open`、`before-close`、`after-close`。其中 `before-*` 事件可 `event.preventDefault()` 阻止状态变更。\n\n方法调用：`show(payload?)`、`close(payload?)`、`toggle(payload?)`，传入参数会透传到生命周期事件的 `event.detail.payload`。\n\n触发器参数：`trigger` 插槽节点支持 `drawer-payload`（支持 JSON 字符串）/ `trigger-payload` / `data-drawer-payload` 属性，也会透传到生命周期事件的 `event.detail.triggerPayload`。\n\n插槽优先级：`header` 插槽优先，未传入时回退到 `title` 属性文案。\n\n样式隔离：组件使用 Shadow DOM，外部样式默认不穿透；请使用公开 CSS 变量定制。\n\nTree Shaking 导入：\n- 全量入口：`import \"yn-web-component/define\"`\n- 按需入口（推荐）：`import \"yn-web-component/components/yn-drawer\"`"
      }
    }
  },
  args: {
    open: false,
    width: 420,
    title: "",
    placement: "auto",
    sheetHeight: "90vh",
    closeOnBackdrop: true,
    zIndex: 1500,
    drawerBg: "#ffffff",
    drawerShadow: "-12px 0 36px rgba(36, 31, 33, 0.18)",
    backdropColor: "rgba(12, 10, 11, 0.36)",
    headerBorder: "rgba(36, 31, 33, 0.08)",
    footerBorder: "rgba(36, 31, 33, 0.08)",
    titleColor: "#241f21",
    closeColor: "#241f21",
    closeHoverBg: "rgba(36, 31, 33, 0.08)",
    contentColor: "#241f21",
    footerBg: "#ffffff",
    openDuration: "380ms",
    closeDuration: "320ms",
    openEase: "cubic-bezier(0.22, 0.01, 0.35, 1)",
    closeEase: "cubic-bezier(0.55, 0.055, 0.675, 0.19)",
    trigger: "购物车按钮触发抽屉",
    header: "头部区域插槽",
    content: "中间内容区域插槽",
    footer: "底部区域插槽"
  },
  argTypes: {
    open: {
      control: "boolean",
      description: "是否打开抽屉（受控属性）。",
      table: {
        defaultValue: { summary: "false" },
        type: { summary: "boolean" }
      }
    },
    width: {
      control: { type: "number", min: 260, step: 1 },
      description: "抽屉宽度（单位 px，最小值 260）。",
      table: {
        defaultValue: { summary: "420" },
        type: { summary: "number" }
      }
    },
    title: {
      control: "text",
      description: "抽屉标题文案。当 `header` 插槽为空时作为回退显示。",
      table: {
        defaultValue: { summary: '""' },
        type: { summary: "string" }
      }
    },
    closeOnBackdrop: {
      name: "close-on-backdrop",
      control: "boolean",
      description: "点击遮罩层是否关闭抽屉。",
      table: {
        defaultValue: { summary: "true" },
        type: { summary: "boolean" }
      }
    },
    placement: {
      control: "select",
      options: ["auto", "right", "bottom"],
      description: "弹出方向：`auto` 窄屏底部 / 宽屏右侧；`bottom` 始终底部；`right` 始终右侧。",
      table: {
        defaultValue: { summary: "auto" },
        type: { summary: '"auto" | "right" | "bottom"' }
      }
    },
    sheetHeight: {
      name: "sheet-height",
      control: "text",
      description:
        "底部弹出时面板高度。默认 `90vh`；`auto` 为随内容高度（关闭态 `translateY(100%)` 按面板自身高度滑入/滑出）；也可传 `60vh`、`420px` 等 CSS 长度。",
      table: {
        defaultValue: { summary: "90vh" },
        type: { summary: "string" }
      }
    },
    onOpenChange: {
      name: "open-change",
      control: false,
      action: "open-change",
      description: "抽屉开关状态变化时触发。`event.detail` 结构：`{ open, source, payload?, triggerPayload? }`。",
      table: {
        category: "Events",
        type: { summary: "CustomEvent<{ open: boolean; source: string; payload?: unknown; triggerPayload?: unknown }>" }
      }
    },
    onBeforeOpen: {
      name: "before-open",
      control: false,
      action: "before-open",
      description: "打开前触发，可 `event.preventDefault()` 阻止打开。",
      table: {
        category: "Events",
        type: { summary: "CustomEvent<{ open: true; source: string; payload?: unknown; triggerPayload?: unknown }>" }
      }
    },
    onAfterOpen: {
      name: "after-open",
      control: false,
      action: "after-open",
      description: "打开动画完成后触发。",
      table: {
        category: "Events",
        type: { summary: "CustomEvent<{ open: true; source: string; payload?: unknown; triggerPayload?: unknown }>" }
      }
    },
    onBeforeClose: {
      name: "before-close",
      control: false,
      action: "before-close",
      description: "关闭前触发，可 `event.preventDefault()` 阻止关闭。",
      table: {
        category: "Events",
        type: { summary: "CustomEvent<{ open: false; source: string; payload?: unknown; triggerPayload?: unknown }>" }
      }
    },
    onAfterClose: {
      name: "after-close",
      control: false,
      action: "after-close",
      description: "关闭动画完成后触发。",
      table: {
        category: "Events",
        type: { summary: "CustomEvent<{ open: false; source: string; payload?: unknown; triggerPayload?: unknown }>" }
      }
    },
    show: {
      name: "show(payload?)",
      control: false,
      description: "交互方法：打开抽屉，并将 payload 透传到生命周期事件。",
      table: {
        category: "Interactions",
        type: { summary: "(payload?: unknown) => void" }
      }
    },
    close: {
      name: "close(payload?)",
      control: false,
      description: "交互方法：关闭抽屉，并将 payload 透传到生命周期事件。",
      table: {
        category: "Interactions",
        type: { summary: "(payload?: unknown) => void" }
      }
    },
    toggle: {
      name: "toggle(payload?)",
      control: false,
      description: "交互方法：切换抽屉开关，并将 payload 透传到生命周期事件。",
      table: {
        category: "Interactions",
        type: { summary: "(payload?: unknown) => void" }
      }
    },
    trigger: {
      name: "trigger",
      control: false,
      description:
        "触发器插槽。支持为触发节点添加 `drawer-payload`（支持 JSON）/ `trigger-payload` / `data-drawer-payload` 属性，并透传到生命周期回调的 `event.detail.triggerPayload`。",
      table: {
        category: "Slots",
        defaultValue: { summary: "内置 Open drawer 按钮" },
        type: { summary: "HTMLElement" }
      }
    },
    header: {
      name: "header",
      control: false,
      description: "头部插槽。优先级高于 `title` 属性；可放标题、副标题或自定义头部结构。",
      table: {
        category: "Slots",
        defaultValue: { summary: "回退为 title 属性文案" },
        type: { summary: "HTMLElement" }
      }
    },
    content: {
      name: "content",
      control: false,
      description: "中间内容插槽。用于承载商品列表、表单等主体内容。",
      table: {
        category: "Slots",
        defaultValue: { summary: "空" },
        type: { summary: "HTMLElement" }
      }
    },
    footer: {
      name: "footer",
      control: false,
      description: "底部插槽。常用于放置结算按钮、辅助说明等操作区内容。",
      table: {
        category: "Slots",
        defaultValue: { summary: "空" },
        type: { summary: "HTMLElement" }
      }
    },
    zIndex: {
      name: "--yn-drawer-z-index",
      control: { type: "number", min: 1, step: 1 },
      description: "抽屉层级。",
      table: {
        category: "CSS Variables",
        defaultValue: { summary: "1500" },
        type: { summary: "number" }
      }
    },
    drawerBg: {
      name: "--yn-drawer-bg",
      control: "color",
      description: "抽屉面板背景色。",
      table: {
        category: "CSS Variables",
        defaultValue: { summary: "#ffffff" },
        type: { summary: "color" }
      }
    },
    drawerShadow: {
      name: "--yn-drawer-shadow",
      control: "text",
      description: "抽屉面板阴影。",
      table: {
        category: "CSS Variables",
        defaultValue: { summary: "-12px 0 36px rgba(36, 31, 33, 0.18)" },
        type: { summary: "string" }
      }
    },
    backdropColor: {
      name: "--yn-drawer-backdrop",
      control: "text",
      description: "遮罩层背景色。",
      table: {
        category: "CSS Variables",
        defaultValue: { summary: "rgba(12, 10, 11, 0.36)" },
        type: { summary: "string" }
      }
    },
    headerBorder: {
      name: "--yn-drawer-header-border",
      control: "text",
      description: "头部下边框颜色。",
      table: {
        category: "CSS Variables",
        defaultValue: { summary: "rgba(36, 31, 33, 0.08)" },
        type: { summary: "string" }
      }
    },
    footerBorder: {
      name: "--yn-drawer-footer-border",
      control: "text",
      description: "底部上边框颜色。",
      table: {
        category: "CSS Variables",
        defaultValue: { summary: "rgba(36, 31, 33, 0.08)" },
        type: { summary: "string" }
      }
    },
    titleColor: {
      name: "--yn-drawer-title-color",
      control: "color",
      description: "标题文字颜色。",
      table: {
        category: "CSS Variables",
        defaultValue: { summary: "#241f21" },
        type: { summary: "color" }
      }
    },
    closeColor: {
      name: "--yn-drawer-close-color",
      control: "color",
      description: "关闭按钮图标颜色。",
      table: {
        category: "CSS Variables",
        defaultValue: { summary: "#241f21" },
        type: { summary: "color" }
      }
    },
    closeHoverBg: {
      name: "--yn-drawer-close-hover-bg",
      control: "text",
      description: "关闭按钮 hover 背景色。",
      table: {
        category: "CSS Variables",
        defaultValue: { summary: "rgba(36, 31, 33, 0.08)" },
        type: { summary: "string" }
      }
    },
    contentColor: {
      name: "--yn-drawer-content-color",
      control: "color",
      description: "抽屉正文文字颜色。",
      table: {
        category: "CSS Variables",
        defaultValue: { summary: "#241f21" },
        type: { summary: "color" }
      }
    },
    footerBg: {
      name: "--yn-drawer-footer-bg",
      control: "color",
      description: "底部区域背景色。",
      table: {
        category: "CSS Variables",
        defaultValue: { summary: "#ffffff" },
        type: { summary: "color" }
      }
    },
    openDuration: {
      name: "--yn-drawer-open-duration",
      control: "text",
      description: "打开动画时长。",
      table: {
        category: "CSS Variables",
        defaultValue: { summary: "380ms" },
        type: { summary: "string" }
      }
    },
    closeDuration: {
      name: "--yn-drawer-close-duration",
      control: "text",
      description: "关闭动画时长。",
      table: {
        category: "CSS Variables",
        defaultValue: { summary: "320ms" },
        type: { summary: "string" }
      }
    },
    openEase: {
      name: "--yn-drawer-open-ease",
      control: "text",
      description: "打开动画缓动曲线。",
      table: {
        category: "CSS Variables",
        defaultValue: { summary: "cubic-bezier(0.22, 0.01, 0.35, 1)" },
        type: { summary: "string" }
      }
    },
    closeEase: {
      name: "--yn-drawer-close-ease",
      control: "text",
      description: "关闭动画缓动曲线。",
      table: {
        category: "CSS Variables",
        defaultValue: { summary: "cubic-bezier(0.55, 0.055, 0.675, 0.19)" },
        type: { summary: "string" }
      }
    }
  }
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;
const wait = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms));

export const CartDrawer: Story = {
  args: {
    sheetHeight: "auto"
  },
  parameters: {
    viewport: { defaultViewport: "mobile1" },
    docs: {
      description: {
        story:
          "移动端空购物车：`sheet-height=\"auto\"` 高度随内容；空状态图与参考稿一致。`placement=auto` 时宽屏为右侧抽屉。"
      }
    }
  },
  render: (args) => html`
    <div class="yn-min-h-[520px] yn-bg-[#f5f1ea] yn-p-6">
      <yn-drawer
        ?open=${args.open}
        .width=${args.width}
        .title=${args.title}
        placement=${args.placement}
        sheet-height=${args.sheetHeight}
        .closeOnBackdrop=${args.closeOnBackdrop}
        style=${`--yn-drawer-z-index:${args.zIndex};--yn-drawer-bg:${args.drawerBg};--yn-drawer-shadow:${args.drawerShadow};--yn-drawer-backdrop:${args.backdropColor};--yn-drawer-header-border:transparent;--yn-drawer-footer-border:${args.footerBorder};--yn-drawer-title-color:${args.titleColor};--yn-drawer-close-color:${args.closeColor};--yn-drawer-close-hover-bg:${args.closeHoverBg};--yn-drawer-content-color:${args.contentColor};--yn-drawer-footer-bg:${args.footerBg};--yn-drawer-body-padding:0 16px 20px;--yn-drawer-open-duration:${args.openDuration};--yn-drawer-close-duration:${args.closeDuration};--yn-drawer-open-ease:${args.openEase};--yn-drawer-close-ease:${args.closeEase};`}
        @open-change=${(event: Event) =>
          args.onOpenChange?.(
            event as CustomEvent<{ open: boolean; source: string; payload?: unknown; triggerPayload?: unknown }>
          )}
        @before-open=${(event: Event) =>
          args.onBeforeOpen?.(
            event as CustomEvent<{ open: boolean; source: string; payload?: unknown; triggerPayload?: unknown }>
          )}
        @after-open=${(event: Event) =>
          args.onAfterOpen?.(
            event as CustomEvent<{ open: boolean; source: string; payload?: unknown; triggerPayload?: unknown }>
          )}
        @before-close=${(event: Event) =>
          args.onBeforeClose?.(
            event as CustomEvent<{ open: boolean; source: string; payload?: unknown; triggerPayload?: unknown }>
          )}
        @after-close=${(event: Event) =>
          args.onAfterClose?.(
            event as CustomEvent<{ open: boolean; source: string; payload?: unknown; triggerPayload?: unknown }>
          )}
      >
        <yn-button slot="trigger" variant="default" drawer-payload='{"scene":"cart","entry":"header-button"}'>
          <svg class="yn-size-6" slot="prefix-icon" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M8.8999 7.5C8.8999 6.28498 9.88488 5.3 11.0999 5.3H12.8999C14.1149 5.3 15.0999 6.28498 15.0999 7.5C15.0999 7.77615 15.3238 8 15.5999 8C15.876 8 16.0999 7.77615 16.0999 7.5C16.0999 5.73269 14.6672 4.3 12.8999 4.3H11.0999C9.33259 4.3 7.8999 5.73269 7.8999 7.5C7.8999 7.77615 8.12376 8 8.3999 8C8.67604 8 8.8999 7.77615 8.8999 7.5ZM5.7998 15.6V9.39999H18.1998V15.6C18.1998 17.0359 17.0357 18.2 15.5998 18.2H8.39981C6.96387 18.2 5.7998 17.0359 5.7998 15.6ZM4.7998 9.29999C4.7998 8.80294 5.20275 8.39999 5.6998 8.39999H18.2998C18.7969 8.39999 19.1998 8.80294 19.1998 9.29999V15.6C19.1998 17.5882 17.588 19.2 15.5998 19.2H8.39981C6.41158 19.2 4.7998 17.5882 4.7998 15.6V9.29999Z"
              fill="currentColor"
            ></path>
          </svg>
          购物车
        </yn-button>

        <span
          slot="header"
          class="yn-text-sm yn-font-bold yn-uppercase yn-tracking-[0.04em] yn-text-[#241f21]"
        >
          Your bag
        </span>

        <div slot="header-actions" class="yn-flex yn-items-center">
          <div
            class="yn-flex yn-items-center yn-rounded-full yn-bg-[#f3f3f3] yn-p-1"
            role="group"
            aria-label="Bag or wishlist"
          >
            <button
              type="button"
              class="yn-flex yn-h-9 yn-w-9 yn-items-center yn-justify-center yn-rounded-full yn-bg-[#241f21] yn-text-white"
              aria-pressed="true"
            >
              <svg class="yn-size-5" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M8.8999 7.5C8.8999 6.28498 9.88488 5.3 11.0999 5.3H12.8999C14.1149 5.3 15.0999 6.28498 15.0999 7.5C15.0999 7.77615 15.3238 8 15.5999 8C15.876 8 16.0999 7.77615 16.0999 7.5C16.0999 5.73269 14.6672 4.3 12.8999 4.3H11.0999C9.33259 4.3 7.8999 5.73269 7.8999 7.5C7.8999 7.77615 8.12376 8 8.3999 8C8.67604 8 8.8999 7.77615 8.8999 7.5ZM5.7998 15.6V9.39999H18.1998V15.6C18.1998 17.0359 17.0357 18.2 15.5998 18.2H8.39981C6.96387 18.2 5.7998 17.0359 5.7998 15.6ZM4.7998 9.29999C4.7998 8.80294 5.20275 8.39999 5.6998 8.39999H18.2998C18.7969 8.39999 19.1998 8.80294 19.1998 9.29999V15.6C19.1998 17.5882 17.588 19.2 15.5998 19.2H8.39981C6.41158 19.2 4.7998 17.5882 4.7998 15.6V9.29999Z"
                  fill="currentColor"
                />
              </svg>
            </button>
            <button
              type="button"
              class="yn-flex yn-h-9 yn-w-9 yn-items-center yn-justify-center yn-rounded-full yn-text-[#241f21]"
              aria-pressed="false"
            >
              <svg class="yn-size-5" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M12 20.5s-6.5-4.08-6.5-9.02C5.5 8.46 8.46 5.5 12 5.5s6.5 2.96 6.5 5.98c0 4.94-6.5 9.02-6.5 9.02Z"
                  stroke="currentColor"
                  stroke-width="1.6"
                />
              </svg>
            </button>
          </div>
        </div>

        <div slot="content" class="yn-flex yn-flex-col yn-items-center yn-pb-2 yn-text-center">
          <img
            src=${EMPTY_CART_IMAGE}
            alt=""
            width="280"
            height="200"
            class="yn-block yn-h-auto yn-w-full yn-max-w-[280px]"
            decoding="async"
          />
          <h3 class="yn-mt-6 yn-text-base yn-font-bold yn-uppercase yn-tracking-[0.04em] yn-text-[#241f21]">
            Your bag is empty
          </h3>
          <p class="yn-mt-2 yn-text-sm yn-text-[#6f696b]">There are no products in your bag</p>
          <div class="yn-mt-8 yn-flex yn-w-full yn-flex-col yn-gap-3">
            <yn-button variant="default" class="yn-w-full">Shop mens</yn-button>
            <yn-button variant="default" class="yn-w-full">Shop womens</yn-button>
          </div>
        </div>

      </yn-drawer>
    </div>
  `,
  play: async ({ canvasElement, step }) => {
    const drawer = canvasElement.querySelector("yn-drawer") as (HTMLElement & { show: () => void }) | null;
    if (!drawer?.shadowRoot) return;
    const trigger = canvasElement.querySelector('yn-button[slot="trigger"]') as HTMLElement | null;

    await step("点击 trigger，触发 before-open / after-open / open-change", async () => {
      trigger?.click();
      await wait(420);
    });

    await step("点击关闭按钮，触发 before-close / after-close / open-change", async () => {
      const closeBtn = drawer.shadowRoot?.querySelector<HTMLButtonElement>(".close-btn");
      closeBtn?.click();
      await wait(360);
    });

    await step("再次打开后点击遮罩，触发 backdrop 关闭链路", async () => {
      trigger?.click();
      await wait(420);
      const backdrop = drawer.shadowRoot?.querySelector<HTMLElement>(".backdrop");
      backdrop?.click();
      await wait(360);
    });

    await step("再次打开后按 Escape，触发 escape 关闭链路", async () => {
      trigger?.click();
      await wait(420);
      const popover = drawer.shadowRoot?.querySelector<HTMLElement>("#drawerPopover");
      popover?.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
      await wait(360);
    });
  }
};

type YnDrawerWithMethods = HTMLElement & {
  show: (payload?: unknown) => void;
  close: (payload?: unknown) => void;
};

export const PreventCloseBeforeSave: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "演示 `before-close` 拦截关闭：未勾选“已保存”前，点击遮罩/关闭按钮/ESC/API 关闭都会被阻止；勾选后允许关闭。"
      }
    }
  },
  render: (args) => {
    let saved = false;

    const onToggleSaved = (event: Event) => {
      saved = (event.target as HTMLInputElement).checked;
    };

    const onBeforeClose = (event: Event) => {
      args.onBeforeClose?.(
        event as CustomEvent<{ open: boolean; source: string; payload?: unknown; triggerPayload?: unknown }>
      );
      if (saved) return;
      event.preventDefault();
    };

    const openByApi = (event: Event) => {
      const root = (event.currentTarget as HTMLElement).closest(".drawer-demo-root");
      const drawer = root?.querySelector("yn-drawer") as YnDrawerWithMethods | null;
      drawer?.show({ action: "open-by-api", from: "demo-toolbar" });
    };

    const closeByApi = (event: Event) => {
      const root = (event.currentTarget as HTMLElement).closest(".drawer-demo-root");
      const drawer = root?.querySelector("yn-drawer") as YnDrawerWithMethods | null;
      drawer?.close({ action: "close-by-api", from: "demo-toolbar" });
    };

    return html`
      <div class="drawer-demo-root yn-min-h-[560px] yn-bg-[#f5f1ea] yn-p-6">
        <div class="yn-mb-4 yn-flex yn-items-center yn-gap-2">
          <yn-button variant="outline" @click=${openByApi}>API 打开（带 payload）</yn-button>
          <yn-button variant="outline" @click=${closeByApi}>API 关闭（带 payload）</yn-button>
          <label class="yn-ml-2 yn-inline-flex yn-items-center yn-gap-2 yn-text-sm yn-text-[#241f21]">
            <input type="checkbox" @change=${onToggleSaved} />
            我已保存，允许关闭
          </label>
        </div>
        <yn-drawer
          ?open=${args.open}
          .width=${args.width}
          .title=${args.title}
          placement=${args.placement}
          sheet-height=${args.sheetHeight}
          .closeOnBackdrop=${args.closeOnBackdrop}
          style=${`--yn-drawer-z-index:${args.zIndex};--yn-drawer-bg:${args.drawerBg};--yn-drawer-shadow:${args.drawerShadow};--yn-drawer-backdrop:${args.backdropColor};--yn-drawer-header-border:${args.headerBorder};--yn-drawer-footer-border:${args.footerBorder};--yn-drawer-title-color:${args.titleColor};--yn-drawer-close-color:${args.closeColor};--yn-drawer-close-hover-bg:${args.closeHoverBg};--yn-drawer-content-color:${args.contentColor};--yn-drawer-footer-bg:${args.footerBg};--yn-drawer-open-duration:${args.openDuration};--yn-drawer-close-duration:${args.closeDuration};--yn-drawer-open-ease:${args.openEase};--yn-drawer-close-ease:${args.closeEase};`}
          @open-change=${(event: Event) =>
            args.onOpenChange?.(
              event as CustomEvent<{ open: boolean; source: string; payload?: unknown; triggerPayload?: unknown }>
            )}
          @before-open=${(event: Event) =>
            args.onBeforeOpen?.(
              event as CustomEvent<{ open: boolean; source: string; payload?: unknown; triggerPayload?: unknown }>
            )}
          @after-open=${(event: Event) =>
            args.onAfterOpen?.(
              event as CustomEvent<{ open: boolean; source: string; payload?: unknown; triggerPayload?: unknown }>
            )}
          @before-close=${onBeforeClose}
          @after-close=${(event: Event) =>
            args.onAfterClose?.(
              event as CustomEvent<{ open: boolean; source: string; payload?: unknown; triggerPayload?: unknown }>
            )}
        >
          <yn-button slot="trigger" variant="default" drawer-payload='{"scene":"cart","entry":"guarded-trigger"}'>
            <span class="yn-inline-flex yn-items-center yn-gap-2">
              <span>购物车（未保存前不可关闭）</span>
            </span>
          </yn-button>
          <div slot="header" class="yn-flex yn-flex-col">
            <strong class="yn-text-base yn-leading-6">关闭前校验示例</strong>
            <span class="yn-text-xs yn-text-[#6f696b]">请先勾选“我已保存，允许关闭”</span>
          </div>
          <div slot="content" class="yn-space-y-3">
            <p class="yn-text-sm yn-text-[#241f21]">当前 story 在 before-close 阶段执行拦截。</p>
            <p class="yn-text-sm yn-text-[#6f696b]">可在 Actions 面板观察生命周期事件和 payload/triggerPayload。</p>
          </div>
          <div slot="footer" class="yn-flex yn-justify-end">
            <yn-button variant="default" @click=${(event: Event) => closeByApi(event)}>尝试关闭（API）</yn-button>
          </div>
        </yn-drawer>
      </div>
    `;
  },
  play: async ({ canvasElement, step }) => {
    const drawer = canvasElement.querySelector("yn-drawer") as
      | (HTMLElement & { show: (payload?: unknown) => void; close: (payload?: unknown) => void })
      | null;
    if (!drawer?.shadowRoot) return;

    await step("API 打开（带 payload），触发 before-open / after-open / open-change", async () => {
      drawer.show({ action: "play-open" });
      await wait(420);
    });

    await step("未勾选保存时尝试关闭，被 before-close 拦截", async () => {
      drawer.close({ action: "play-close-blocked" });
      await wait(220);
    });

    await step("勾选允许关闭后，再次 API 关闭成功", async () => {
      const checkbox = canvasElement.querySelector<HTMLInputElement>('input[type="checkbox"]');
      if (checkbox && !checkbox.checked) {
        checkbox.click();
      }
      drawer.close({ action: "play-close-allowed" });
      await wait(360);
    });
  }
};
