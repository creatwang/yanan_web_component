import type { Meta, StoryObj } from "@storybook/web-components";
import { html, nothing } from "lit";
import { ifDefined } from "lit/directives/if-defined.js";
import { ref } from "lit/directives/ref.js";
import { repeat } from "lit/directives/repeat.js";
import "../yn-button/yn-button";
import "./yn-pull-cord-switch";
import type {
  YnPullCordSwitch,
  YnPullCordSwitchSize,
  YnPullCordSwitchVariant
} from "./yn-pull-cord-switch";
import {
  applyPullCordShellBackground,
  shellBackgroundFromVariant
} from "./pull-cord-shell-bg";
import { logicalToCssLeft, peekCssLeft, peekCssTop } from "./pull-cord-layout";

type Args = {
  checked: boolean;
  glowUp: boolean;
  disabled: boolean;
  fixed: boolean;
  fixedX?: number;
  top?: number;
  reverse: boolean;
  variant: YnPullCordSwitchVariant;
  size: YnPullCordSwitchSize;
  ropeLength: number;
  cardOffset?: number;
  zIndex: number;
  /** 锚点额外下移比例，映射 `--yn-pull-cord-switch-anchor-y`（0=天花板贴顶） */
  anchorY: number;
  /** `glow-up` 时画布向上延展（px），映射 `--yn-pull-cord-switch-glow-up-bleed` */
  glowUpBleed?: number;
  toggleThreshold?: number;
  styleOverride?: string;
  cardSlot?: string;
  activatedSlot?: string;
  slotTransitionDuration?: string;
  slotButtonScale?: number;
  fixedPeekTransitionDuration?: string;
  onChange?: (event: CustomEvent<{ checked: boolean }>) => void;
  onFixedMove?: (event: CustomEvent<{ x: number; reverse: boolean }>) => void;
};

type YnButtonVariant = "primary" | "success" | "neutral" | "dark" | "default";

const slotButtonVariant = (
  cordVariant: YnPullCordSwitchVariant,
  kind: "default" | "activated"
): YnButtonVariant => {
  if (kind === "activated") return "success";
  return cordVariant === "floema" ? "default" : "neutral";
};

const slotButtonSize = (cordSize: YnPullCordSwitchSize): "mini" | "small" | "medium" => {
  if (cordSize === "medium") return "small";
  return "mini";
};

const slotCardButton = (
  label: string,
  kind: "default" | "activated",
  cordVariant: YnPullCordSwitchVariant,
  cordSize: YnPullCordSwitchSize
) => html`
  <yn-button
    slot=${kind === "activated" ? "activated" : nothing}
    variant=${slotButtonVariant(cordVariant, kind)}
    size=${slotButtonSize(cordSize)}
    ?hit-slop=${false}
  >
    ${label}
  </yn-button>
`;

const cordInlineStyle = (args: Args) => {
  const parts: string[] = [];
  if (args.styleOverride) parts.push(args.styleOverride);
  if (args.slotTransitionDuration) {
    parts.push(`--yn-pull-cord-switch-slot-transition-duration:${args.slotTransitionDuration}`);
  }
  if (args.fixedPeekTransitionDuration) {
    parts.push(
      `--yn-pull-cord-switch-fixed-peek-transition-duration:${args.fixedPeekTransitionDuration}`
    );
  }
  if (
    args.slotButtonScale != null &&
    Number.isFinite(args.slotButtonScale) &&
    args.slotButtonScale !== 0.88
  ) {
    parts.push(`--yn-pull-cord-switch-slot-button-scale:${args.slotButtonScale}`);
  }
  if (args.anchorY != null && Number.isFinite(args.anchorY)) {
    parts.push(`--yn-pull-cord-switch-anchor-y:${args.anchorY}`);
  }
  if (args.glowUp && args.glowUpBleed != null && Number.isFinite(args.glowUpBleed)) {
    parts.push(`--yn-pull-cord-switch-glow-up-bleed:${args.glowUpBleed}px`);
  }
  return parts.length ? parts.join(";") : "";
};

const shellStyle = (variant: YnPullCordSwitchVariant, checked: boolean) => `
  background: ${shellBackgroundFromVariant(variant, checked)};
  border-radius: var(--yn-pull-cord-switch-radius, 12px);
  overflow: visible;
  display: inline-block;
  width: 100%;
  max-width: min(100%, 400px);
  vertical-align: top;
  transition: background 0.45s cubic-bezier(0.22, 1, 0.36, 1);
`;

const syncShellFromLamp = (shell: Element | undefined, args: Args) => {
  if (!(shell instanceof HTMLElement)) return;
  const lamp = shell.querySelector("yn-pull-cord-switch");
  if (lamp instanceof HTMLElement) {
    applyPullCordShellBackground(shell, lamp, args.checked);
  }
};

const cordKey = (args: Args) =>
  [
    args.variant,
    args.size,
    args.ropeLength,
    args.fixed,
    args.cardSlot,
    args.activatedSlot,
    args.cardOffset ?? "",
    args.toggleThreshold ?? "",
    args.glowUp
  ].join("|");

const renderCord = (args: Args, updateArgs?: (patch: Partial<Args>) => void) =>
  repeat(
    [cordKey(args)],
    (k) => k,
    () => html`
  <yn-pull-cord-switch
    ?checked=${args.checked}
    ?glow-up=${args.glowUp}
    ?disabled=${args.disabled}
    ?fixed=${args.fixed}
    fixed-x=${ifDefined(args.fixedX)}
    top=${ifDefined(args.top)}
    ?reverse=${args.reverse}
    variant=${args.variant}
    size=${args.size}
    rope-length=${args.ropeLength}
    card-offset=${ifDefined(args.cardOffset)}
    z-index=${args.zIndex}
    toggle-threshold=${ifDefined(args.toggleThreshold)}
    style=${cordInlineStyle(args) || nothing}
    @change=${(event: Event) => {
      const detail = (event as CustomEvent<{ checked: boolean }>).detail;
      const lamp = event.target as HTMLElement;
      const shell = lamp.parentElement;
      if (shell?.classList.contains("pull-cord-shell")) {
        applyPullCordShellBackground(shell, lamp, detail.checked);
      }
      void updateArgs?.({ checked: detail.checked });
      args.onChange?.(event as CustomEvent<{ checked: boolean }>);
    }}
    @fixed-move=${(event: Event) => {
      const detail = (event as CustomEvent<{ x: number; reverse: boolean }>).detail;
      void updateArgs?.({ fixedX: detail.x });
      args.onFixedMove?.(event as CustomEvent<{ x: number; reverse: boolean }>);
    }}
  >
    ${args.cardSlot ? slotCardButton(args.cardSlot, "default", args.variant, args.size) : ""}
    ${args.activatedSlot
      ? slotCardButton(args.activatedSlot, "activated", args.variant, args.size)
      : ""}
  </yn-pull-cord-switch>
`
  );

const renderEmbedded = (args: Args, updateArgs?: (patch: Partial<Args>) => void) => html`
  <div
    class="pull-cord-shell"
    style=${shellStyle(args.variant, args.checked)}
    ${ref((el) => syncShellFromLamp(el, args))}
  >
    ${renderCord({ ...args, fixed: false }, updateArgs)}
  </div>
`;

/** fixed 全屏页：不使用 `.pull-cord-shell`，页面底为浅灰，主题由页面自身控制 */
const renderFixedPage = (args: Args, updateArgs?: (patch: Partial<Args>) => void) => html`
  <div style="min-height:100vh;background:#f4f4f5;color:#18181b;">
    <header
      style="
        position: sticky;
        top: 0;
        z-index: 100;
        padding: 14px 20px;
        background: rgba(255,255,255,0.92);
        border-bottom: 1px solid rgba(0,0,0,0.08);
        font-weight: 600;
        backdrop-filter: blur(12px);
      "
    >
      站点 Header · z-index 100
    </header>
    <main style="padding: 28px 20px; max-width: 640px;">
      <p style="margin:0;line-height:1.6;opacity:0.75;">
        fixed 吸顶：顶部条可水平拖动；负值 fixed-x / top 时 hover 滑出露出。绳端卡片与 change /
        fixed-move 事件与内嵌模式相同。
      </p>
    </main>
    ${renderCord({ ...args, fixed: true }, updateArgs)}
  </div>
`;

const waitFixedLayout = () =>
  new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });

const meta = {
  title: "Components/YnPullCordSwitch",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "抽绳开关：向下拖拽绳端切换开/关，松手后 Verlet 多段绳弹性回弹。\n\n| 能力 | 属性 / 说明 |\n| --- | --- |\n| 绳长 | `rope-length`（px，默认 260），与 `size` 解耦 |\n| 绳端间距 | `card-offset`（px，可为负）：绳头到卡片锚点；负值时 fixed 的 hover 滑出关闭；未设则随绳长缩放 |\n| 视觉尺寸 | `size=\"mini\" \\| \"small\" \\| \"medium\"`：卡片、绳粗细、天花板宽度 |\n| 变体 | `variant=\"default\" \\| \"floema\"` |\n| 阈值 | `toggle-threshold` 可选；未设则随绳长缩放 |\n| 背景 | 组件不绘区域背景；外层 `div` + `applyPullCordShellBackground` |\n| 插槽 | 默认插槽 / `activated`：推荐 `yn-button`；无插槽时为内置 ON/OFF |\n| fixed | `fixed`、`fixed-x`（可负，hover 露出）、`top`（可负）、`reverse`、`fixed-move` |\n| 层级 | `z-index`（默认 `1`），或 CSS `--yn-pull-cord-switch-z-index` |\n| 锚点下移 | `--yn-pull-cord-switch-anchor-y`：额外下移比例，`0` 时天花板贴画布顶 |\n| 灯光上扩 | `glow-up`：开启且 checked 时顶灯向锚点上方对称扩散；`--yn-pull-cord-switch-glow-up-bleed` 控制画布向上延展（默认 72px） |\n| 事件 | `change` → `{ checked }` |\n\n**样式隔离**：Shadow DOM；通过 `--yn-pull-cord-switch-*` 覆写。\n\n**导入**：按需 `import \"yn-web-component/components/yn-pull-cord-switch\"`（推荐）。"
      }
    }
  },
  args: {
    checked: false,
    glowUp: false,
    disabled: false,
    fixed: false,
    reverse: false,
    variant: "default",
    size: "mini",
    ropeLength: 260,
    zIndex: 1,
    anchorY: 0,
    cardSlot: "",
    activatedSlot: "",
    slotTransitionDuration: "",
    fixedPeekTransitionDuration: ""
  },
  argTypes: {
    checked: {
      control: "boolean",
      description: "开关是否开启。",
      table: { defaultValue: { summary: "false" } }
    },
    glowUp: {
      control: "boolean",
      name: "glow-up",
      description:
        "开启且 `checked` 时，顶灯光在锚点处对称扩散（含向上）；未开启时仅向下半圆扩散。可用 `--yn-pull-cord-switch-glow-up-bleed` 调节向上延展的画布高度（默认 72px）。",
      table: { defaultValue: { summary: "false" } }
    },
    disabled: {
      control: "boolean",
      description: "是否禁用拖拽。",
      table: { defaultValue: { summary: "false" } }
    },
    fixed: {
      control: "boolean",
      description: "吸附视口顶部；未设 fixed-x 则水平居中。",
      table: { defaultValue: { summary: "false" } }
    },
    fixedX: {
      control: { type: "number", min: -400, max: 1200, step: 4 },
      name: "fixed-x",
      description: "逻辑水平偏移（可负，负值 hover 滑出）。未设则居中。",
      table: { defaultValue: { summary: "（居中）" } },
      if: { arg: "fixed", eq: true }
    },
    reverse: {
      control: "boolean",
      description: "fixed-x 自视口右侧起算。",
      table: { defaultValue: { summary: "false" } },
      if: { arg: "fixed", eq: true }
    },
    top: {
      control: { type: "number", min: -400, max: 240, step: 4 },
      description: "距视口顶部偏移（可负，负值 hover 向下滑出）。",
      table: { defaultValue: { summary: "0" } },
      if: { arg: "fixed", eq: true }
    },
    fixedPeekTransitionDuration: {
      control: "text",
      name: "--yn-pull-cord-switch-fixed-peek-transition-duration",
      description: "负值 fixed-x / top 时露出动画时长。",
      table: { category: "CSS Variables", defaultValue: { summary: "0.34s" } },
      if: { arg: "fixed", eq: true }
    },
    variant: {
      control: "select",
      options: ["default", "floema"],
      description: "视觉变体。",
      table: { defaultValue: { summary: "default" } }
    },
    size: {
      control: "select",
      options: ["mini", "small", "medium"],
      description: "绳端卡片与绳粗细（不控制绳长）。",
      table: { defaultValue: { summary: "mini" } }
    },
    ropeLength: {
      control: { type: "number", min: 200, max: 480, step: 10 },
      name: "rope-length",
      description: "绳子长度（px），默认 260。",
      table: { defaultValue: { summary: "260" } }
    },
    cardOffset: {
      control: { type: "number", min: -60, max: 80, step: 2 },
      name: "card-offset",
      description:
        "绳端卡片距绳头间距（px，可为负）。未设时随 `rope-length` 缩放；**负值时** fixed 模式下负 `fixed-x`/`top` 的 hover 滑出不可用。",
      table: { defaultValue: { summary: "（随绳长）" } }
    },
    zIndex: {
      control: { type: "number", min: 0, max: 9999, step: 1 },
      name: "z-index",
      description: "组件叠放层级（写入 `--yn-pull-cord-switch-z-index`）。fixed 模式下高于页面 Header 时可设为 `101` 等。",
      table: { defaultValue: { summary: "1" } }
    },
    anchorY: {
      control: { type: "number", min: 0, max: 0.25, step: 0.01 },
      name: "--yn-pull-cord-switch-anchor-y",
      description:
        "锚点额外下移（相对画布高度的比例）。`0` 时天花板条贴顶、无顶部留白；增大则整体下移（如 `0.08`）。",
      table: { category: "CSS Variables", defaultValue: { summary: "0" } }
    },
    glowUpBleed: {
      control: { type: "number", min: 40, max: 160, step: 4 },
      name: "--yn-pull-cord-switch-glow-up-bleed",
      description: "配合 `glow-up`：画布向上延展高度（px），避免顶灯在画布顶被裁切。",
      table: { category: "CSS Variables", defaultValue: { summary: "72px" } },
      if: { arg: "glowUp", eq: true }
    },
    toggleThreshold: {
      control: { type: "number", min: 40, max: 110, step: 2 },
      name: "toggle-threshold",
      description: "拉动阈值（px）；未设则随 rope-length 缩放。",
      table: { defaultValue: { summary: "（随 rope-length）" } }
    },
    styleOverride: {
      control: "text",
      description:
        "追加到组件 `style` 的 CSS（如 `--yn-pull-cord-switch-accent:rgba(...)`）。仅内嵌/全屏绳组件生效，不改页面壳背景。",
      table: { category: "CSS Variables", defaultValue: { summary: "（无）" } }
    },
    cardSlot: {
      control: "text",
      name: "(default)",
      description: "默认插槽（Story 渲染为 yn-button）。仅默认插槽时开/关同一按钮。",
      table: {
        category: "Slots",
        type: {
          summary: "yn-button",
          detail: `<yn-button variant="neutral" size="mini">夜间</yn-button>`
        },
        defaultValue: { summary: "（内置 ON/OFF）" }
      }
    },
    activatedSlot: {
      control: "text",
      name: "activated",
      description: "开启态插槽（yn-button slot=activated）。",
      table: {
        category: "Slots",
        type: {
          summary: "yn-button",
          detail: `<yn-button slot="activated" variant="success" size="mini">日间</yn-button>`
        },
        defaultValue: { summary: "（无）" }
      }
    },
    slotTransitionDuration: {
      control: "text",
      name: "--yn-pull-cord-switch-slot-transition-duration",
      description: "双插槽层切换动画时长；留空使用组件默认 0.28s。",
      table: { category: "CSS Variables", defaultValue: { summary: "0.28s" } }
    },
    slotButtonScale: {
      control: { type: "number", min: 0.6, max: 1, step: 0.02 },
      name: "--yn-pull-cord-switch-slot-button-scale",
      description: "插槽 yn-button 缩放；默认 0.88（控件留空则使用组件内置值）。",
      table: { category: "CSS Variables", defaultValue: { summary: "0.88" } }
    },
    onChange: {
      name: "change",
      action: "change",
      control: false,
      description: "拉过阈值切换时触发。",
      table: {
        category: "Events",
        type: { summary: "CustomEvent<{ checked: boolean }>" }
      }
    },
    onFixedMove: {
      name: "fixed-move",
      action: "fixed-move",
      control: false,
      description: "fixed 模式水平拖动时触发。",
      table: {
        category: "Events",
        type: { summary: "CustomEvent<{ x: number; reverse: boolean }>" }
      }
    }
  },
  render: (args, { updateArgs }) =>
    args.fixed
      ? renderFixedPage({ ...args, fixed: true }, updateArgs)
      : renderEmbedded(args, updateArgs)
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

const playDefault: NonNullable<Story["play"]> = async ({ canvasElement, step }) => {
  const shell = canvasElement.querySelector(".pull-cord-shell");
  const el = canvasElement.querySelector("yn-pull-cord-switch");
  const root = el instanceof HTMLElement ? el.shadowRoot : null;
  if (!root || !(el instanceof HTMLElement)) return;

  await step("挂载与外部背景壳", async () => {
    if (!root.querySelector("canvas.rope")) throw new Error("未找到绳子 canvas");
    if (!shell) throw new Error("非 fixed 模式应有 .pull-cord-shell");
    if (el.fixed) throw new Error("Default 不应为 fixed 模式");
  });

  await step("无插槽时为内置 OFF", async () => {
    if (el.getAttribute("data-card-mode") !== "fallback") {
      throw new Error("应为 fallback 模式");
    }
    if (root.querySelector(".card__label")?.textContent?.trim() !== "OFF") {
      throw new Error("默认应为 OFF 文案");
    }
  });
};

const playSlots: NonNullable<Story["play"]> = async ({ canvasElement, step }) => {
  const el = canvasElement.querySelector("yn-pull-cord-switch") as YnPullCordSwitch | null;
  const root = el?.shadowRoot;
  if (!el || !root) throw new Error("未找到组件");
  await el.updateComplete;

  await step("双插槽模式", async () => {
    if (el.getAttribute("data-card-mode") !== "dual-slot") {
      throw new Error("应为 dual-slot 模式");
    }
    if (root.querySelector(".card__label")) throw new Error("不应渲染内置 ON/OFF");
  });

  await step("关闭态：默认插槽 yn-button", async () => {
    const layer = root.querySelector(".card__layer--active");
    if (!layer?.querySelector('slot:not([name])')) {
      throw new Error("关闭时应激活默认插槽层");
    }
    if (el.querySelector("yn-button:not([slot])")?.textContent?.trim() !== "夜间") {
      throw new Error("关闭态应显示夜间按钮");
    }
  });

  await step("开启态：activated 插槽 yn-button", async () => {
    el.checked = true;
    await el.updateComplete;
    const layer = root.querySelector(".card__layer--active");
    if (!layer?.querySelector('slot[name="activated"]')) {
      throw new Error("开启时应激活 activated 插槽层");
    }
    if (el.querySelector('yn-button[slot="activated"]')?.textContent?.trim() !== "日间") {
      throw new Error("开启态应显示日间按钮");
    }
  });
};

const playFixed: NonNullable<Story["play"]> = async ({ canvasElement, step }) => {
  const el = canvasElement.querySelector("yn-pull-cord-switch") as YnPullCordSwitch | null;
  if (!el) throw new Error("未找到组件");
  await el.updateComplete;
  await waitFixedLayout();

  await step("fixed 模式", async () => {
    if (!el.fixed) throw new Error("应为 fixed 模式");
    if (el.getAttribute("data-card-mode") !== "dual-slot") {
      throw new Error("应为 dual-slot 模式");
    }
  });

  const fixedX = el.fixedX;
  if (fixedX != null && fixedX < 0) {
    const restLeft = logicalToCssLeft(fixedX, el, el.reverse);
    const peekLeft = peekCssLeft(el, el.reverse);
    await step("负 fixed-x：藏边与 hover 露出", async () => {
      if (!el.hasAttribute("data-fixed-peekable")) {
        throw new Error("负值 fixed-x 应设置 data-fixed-peekable");
      }
      if (Math.abs(Number.parseFloat(el.style.left) - restLeft) > 2) {
        throw new Error(`初始 left 应为 ${restLeft}px，实际为 ${el.style.left}`);
      }
      el.dispatchEvent(new PointerEvent("pointerenter", { bubbles: true }));
      if (Math.abs(Number.parseFloat(el.style.left) - peekLeft) > 2) {
        throw new Error(`移入后 left 应为 ${peekLeft}px，实际为 ${el.style.left}`);
      }
      el.dispatchEvent(new PointerEvent("pointerleave", { bubbles: true }));
      if (Math.abs(Number.parseFloat(el.style.left) - restLeft) > 2) {
        throw new Error(`移出后 left 应恢复为 ${restLeft}px，实际为 ${el.style.left}`);
      }
    });
  }

  const top = el.top;
  if (top != null && top < 0) {
    await step("负 top：藏顶与 hover 露出", async () => {
      if (!el.hasAttribute("data-fixed-peekable")) {
        throw new Error("负值 top 应设置 data-fixed-peekable");
      }
      if (el.style.top !== `${top}px`) {
        throw new Error(`初始 top 应为 ${top}px，实际为 ${el.style.top}`);
      }
      el.dispatchEvent(new PointerEvent("pointerenter", { bubbles: true }));
      if (el.style.top !== `${peekCssTop()}px`) {
        throw new Error(`移入后 top 应为 0px，实际为 ${el.style.top}`);
      }
      el.dispatchEvent(new PointerEvent("pointerleave", { bubbles: true }));
      if (el.style.top !== `${top}px`) {
        throw new Error(`移出后 top 应恢复为 ${top}px，实际为 ${el.style.top}`);
      }
    });
  }
};

/** 内嵌模式：内置卡片、变体/尺寸/绳长/禁用等均由 Controls 调节 */
export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "内嵌用法：外层 `.pull-cord-shell` 在 `change` 时更新背景。可切换 `variant`、`size`、`rope-length`、`checked`、`disabled`；`styleOverride` 可覆写 CSS 变量。"
      }
    }
  },
  play: playDefault
};

/** 插槽：默认 + activated 双 yn-button（亦可在 Default 中填 cardSlot / activatedSlot） */
export const Slots: Story = {
  args: {
    cardSlot: "夜间",
    activatedSlot: "日间"
  },
  parameters: {
    docs: {
      description: {
        story:
          "仅默认插槽时开/关同一按钮；同时提供 `activated` 时关/开切换不同 yn-button 并带过渡。插槽内容优先于内置 ON/OFF。"
      }
    }
  },
  play: playSlots
};

/** 同一绳长下对比 mini / small / medium 视觉尺寸 */
export const Sizes: Story = {
  parameters: {
    controls: { exclude: ["size", "ropeLength"] },
    docs: {
      description: {
        story:
          "三列均为 `rope-length=260`，仅 `size` 不同：卡片与绳粗细变化，绳长不变。"
      }
    }
  },
  render: (args, ctx) => html`
    <div
      style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;padding:8px;align-items:end;"
    >
      ${(["mini", "small", "medium"] as const).map(
        (size) => html`
          <div>
            <p style="margin:0 0 8px;font-size:12px;font-weight:600;color:#666;">size=${size}</p>
            ${renderEmbedded({ ...args, size }, ctx.updateArgs)}
          </div>
        `
      )}
    </div>
  `
};

/** fixed 吸顶：负 fixed-x + 负 top 演示 peek；其余 fixed 参数用 Controls */
export const Fixed: Story = {
  args: {
    fixed: true,
    fixedX: -40,
    top: -32,
    reverse: false,
    zIndex: 101,
    glowUp: true,
    checked: true,
    cardSlot: "夜间",
    activatedSlot: "日间"
  },
  render: (args, ctx) => renderFixedPage({ ...args, fixed: true }, ctx.updateArgs),
  parameters: {
    layout: "fullscreen",
    controls: { exclude: ["fixed"] },
    docs: {
      description: {
        story:
          "全屏页含 sticky Header，**不使用** `.pull-cord-shell` 背景壳（页面底 `#f4f4f5`）。预设负 `fixed-x` 与负 `top` 以演示 hover 滑出；`variant=floema` 仅影响绳/按钮配色，不改变页面底色。"
      }
    }
  },
  play: playFixed
};
