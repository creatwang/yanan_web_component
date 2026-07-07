import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import "./yn-pick";
import { ynPickSelectedSvg, ynPickUnselectedSvg } from "../../asset/svg";

type Args = {
  value: string | number;
  selected: boolean;
  border: boolean;
  selectedIcon: string;
  unselectedIcon: string;
  showUnselectedIcon: boolean;
  borderWidth: string;
  borderColor: string;
  borderRadius: string;
  iconDuration: string;
  iconEase: string;
  slot: string;
  toggle?: (id: string | number, flag: boolean) => void;
};

const defaultSelectedIcon = ynPickSelectedSvg;
const defaultUnselectedIcon = ynPickUnselectedSvg;

const meta = {
  title: "Components/YnPick",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "单个可选项组件，通常作为 `yn-group-pick` 子项使用。默认插槽内容会放入相对定位容器 `wrap` 内，图标固定在右上角。\n\n图标规则：`selected=true` 时展示 `selected-icon`；`selected=false` 时仅在 `show-unselected-icon=true` 下展示 `unselected-icon`。\n\n图标动画：选中时从中心点放大入场（`scale(0)→scale(1)`），取消选中时缩小至点并消失（`scale(1)→scale(0)`）。可通过 `--yn-pick-icon-duration` / `--yn-pick-icon-ease` 调整。\n\n组合使用优先级：当和 `yn-group-pick` 组合时，若子项 `yn-pick` 显式设置了 `selected-icon` / `unselected-icon` / `show-unselected-icon`，则子项配置优先；否则回退到父组件组级默认值。\n\n状态边界说明：组件点击后会先在内部切换 `selected` 并派发 `toggle`。若父层采用受控模式并在事件后写回 `selected`，最终显示以父层传入值为准。\n\n样式隔离：组件使用 Shadow DOM，外部样式默认不穿透；可通过公开 CSS 变量配置边框。\n\nTree Shaking 导入：\n- 全量入口：`import \"yn-web-component/define\"`\n- 按需入口（推荐）：`import \"yn-web-component/components/yn-pick\"`"
      }
    }
  },
  args: {
    value: "",
    selected: false,
    border: true,
    selectedIcon: defaultSelectedIcon,
    unselectedIcon: defaultUnselectedIcon,
    showUnselectedIcon: false,
    borderWidth: "2px",
    borderColor: "#000000",
    borderRadius: "8px",
    iconDuration: "220ms",
    iconEase: "cubic-bezier(0.22, 1, 0.36, 1)",
    slot: "默认插槽内容"
  },
  argTypes: {
    value: {
      control: "text",
      description: "选项 id，用于 `yn-group-pick` 汇总选中结果。",
      table: {
        defaultValue: { summary: '""' },
        type: { summary: "string | number" }
      }
    },
    selected: {
      control: "boolean",
      description: "是否选中。选中后会在右上角展示图标。",
      table: {
        defaultValue: { summary: "false" },
        type: { summary: "boolean" }
      }
    },
    border: {
      control: "boolean",
      description: "是否显示覆盖在插槽内容上的边框伪元素。",
      table: {
        defaultValue: { summary: "true" },
        type: { summary: "boolean" }
      }
    },
    selectedIcon: {
      control: "text",
      name: "selected-icon",
      description: "选中图标 SVG 字符串。",
      table: {
        defaultValue: { summary: "内置勾选 SVG" },
        type: { summary: "string" }
      }
    },
    unselectedIcon: {
      control: "text",
      name: "unselected-icon",
      description: "未选中状态图标 SVG 字符串。用于未选中态展示（需开启 `show-unselected-icon`）。",
      table: {
        defaultValue: { summary: "内置描边圆环 SVG" },
        type: { summary: "string" }
      }
    },
    showUnselectedIcon: {
      control: "boolean",
      name: "show-unselected-icon",
      description: "未选中状态是否显示 unselected-icon。默认不显示。",
      table: {
        defaultValue: { summary: "false" },
        type: { summary: "boolean" }
      }
    },
    borderWidth: {
      control: "text",
      name: "--yn-pick-border-width",
      description: "边框宽度。",
      table: {
        category: "CSS Variables",
        defaultValue: { summary: "2px" },
        type: { summary: "string" }
      }
    },
    borderColor: {
      control: "color",
      name: "--yn-pick-border-color",
      description: "边框颜色。",
      table: {
        category: "CSS Variables",
        defaultValue: { summary: "#000000" },
        type: { summary: "string" }
      }
    },
    borderRadius: {
      control: "text",
      name: "--yn-pick-border-radius",
      description: "边框圆角。",
      table: {
        category: "CSS Variables",
        defaultValue: { summary: "8px" },
        type: { summary: "string" }
      }
    },
    iconDuration: {
      control: "text",
      name: "--yn-pick-icon-duration",
      description: "选中/取消图标缩放动画时长。",
      table: {
        category: "CSS Variables",
        defaultValue: { summary: "220ms" },
        type: { summary: "string" }
      }
    },
    iconEase: {
      control: "text",
      name: "--yn-pick-icon-ease",
      description: "选中图标入场缓动曲线。",
      table: {
        category: "CSS Variables",
        defaultValue: { summary: "cubic-bezier(0.22, 1, 0.36, 1)" },
        type: { summary: "string" }
      }
    },
    toggle: {
      name: "toggle",
      control: false,
      action: "toggle",
      description: "点击选项时触发。`event.detail` 结构：`{ id: string | number; flag: boolean }`，`flag` 表示当前点击后是否为选中状态。",
      table: {
        category: "Events",
        type: { summary: "CustomEvent<{ id: string | number; flag: boolean }>" }
      }
    },
    slot: {
      name: "default",
      control: false,
      description: "选项内容插槽。支持任意 HTML（图片、文本、自定义布局）。",
      table: {
        category: "Slots",
        type: { summary: "HTMLElement" }
      }
    }
  }
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {
  render: (args) => html`
    <yn-pick
      .value=${args.value}
      .selected=${args.selected}
      .border=${args.border}
      selected-icon=${args.selectedIcon}
      unselected-icon=${args.unselectedIcon}
      .showUnselectedIcon=${args.showUnselectedIcon}
      style=${`--yn-pick-border-width:${args.borderWidth};--yn-pick-border-color:${args.borderColor};--yn-pick-border-radius:${args.borderRadius};--yn-pick-icon-duration:${args.iconDuration};--yn-pick-icon-ease:${args.iconEase};`}
      @toggle=${(event: Event) => {
        if (!(event instanceof CustomEvent)) return;
        const detail = event.detail as { id: string | number; flag: boolean };
        args.toggle?.(detail.id, detail.flag);
      }}
    >
      <div class="yn-box-border yn-flex yn-h-[100px] yn-w-[180px] yn-items-end yn-rounded-lg yn-bg-[#d5c29f] yn-p-3 yn-text-2xl yn-font-bold yn-text-[#241f21]">
        Nature
      </div>
    </yn-pick>
  `,
  play: async ({ canvasElement, step }) => {
    const pick = canvasElement.querySelector("yn-pick");
    if (!(pick instanceof HTMLElement) || !pick.shadowRoot) return;

    const clickable = pick.shadowRoot.querySelector(".wrap");
    if (!(clickable instanceof HTMLElement)) return;

    await step("点击选项后变为选中", async () => {
      clickable.click();
      await new Promise((resolve) => setTimeout(resolve, 0));
      if (!(pick as HTMLElement & { selected?: boolean }).selected) {
        throw new Error("点击后 selected 应为 true");
      }
      const icon = pick.shadowRoot?.querySelector(".icon.selected");
      if (!(icon instanceof HTMLElement)) {
        throw new Error("选中后应显示 selected 图标");
      }
    });

    await step("再次点击后图标播放离场动画", async () => {
      clickable.click();
      await new Promise((resolve) => setTimeout(resolve, 0));
      if ((pick as HTMLElement & { selected?: boolean }).selected) {
        throw new Error("再次点击后 selected 应为 false");
      }
      const leavingIcon = pick.shadowRoot?.querySelector(".icon.selected.anim-out");
      if (!(leavingIcon instanceof HTMLElement)) {
        throw new Error("取消选中时应触发 anim-out 离场动画");
      }
    });
  }
};
