import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";
import "./yn-group-pick";
import "../yn-pick/yn-pick";

type PickId = string | number;

type Args = {
  value: PickId[] | PickId;
  multiple: boolean;
  selectedIcon: string;
  unselectedIcon: string;
  showUnselectedIcon: boolean;
  gap: string;
  slot: string;
  change?: (ids: PickId[], flag: boolean) => void;
};

const defaultSelectedIcon = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
<path d="M10 18C14.4182 18 18 14.4182 18 10C18 5.58172 14.4182 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4182 5.58172 18 10 18Z" fill="#241F21"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M14.1207 8.02566L8.86034 13.0355L6 10.3114L7.03448 9.22517L8.17069 10.3073C8.5569 10.6751 9.16379 10.6751 9.55 10.3073L13.0862 6.93945L14.1207 8.02566Z" fill="white"/>
</svg>`;

const sideIcon = `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M18 7.26325V5.80121L9.92465 2.13027C9.74931 2.05086 9.63688 1.87597 9.63688 1.68368V0.107422H8.03074V14.072C8.03074 14.3432 7.81123 14.5627 7.53997 14.5627H5.80934C6.23007 14.0934 6.4701 13.4585 6.41745 12.7688C6.3251 11.5592 5.32482 10.5973 4.11307 10.5492C2.74027 10.4947 1.60659 11.5958 1.60659 12.9566C1.60659 13.5732 1.83948 14.1362 2.22184 14.5627H0V16.1689H16.0615V14.5627H9.63688V11.3803C9.63688 11.1881 9.74931 11.0132 9.92465 10.9337L18 7.26325ZM4.01537 12.1535C4.4584 12.1535 4.81844 12.514 4.81844 12.9566C4.81844 13.3992 4.4584 13.7597 4.01537 13.7597C3.57234 13.7597 3.21229 13.3992 3.21229 12.9566C3.21229 12.514 3.57234 12.1535 4.01537 12.1535ZM14.744 6.97861L9.63688 9.29994V3.76364L14.744 6.08497C15.1277 6.25941 15.1277 6.80416 14.744 6.97861Z" fill="#241F21"></path></svg>`;

const categories = [
  { id: "Golf", color: "#b8d28a" },
  { id: "Urban", color: "#ef7d53" },
  { id: "Details", color: "#ece9e3" },
  { id: "Nature", color: "#d5c29f" },
  { id: "RePlastic", color: "#82a7d8" },
  { id: "Equipamento", color: "#f0f0f0" },
  { id: "Construção", color: "#f0f0f0" },
  { id: "Mobiliário", color: "#f0f0f0" },
  { id: "Sinalética", color: "#f0f0f0" }
];

const meta = {
  title: "Components/YnGroupPick",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "选项组组件，和 `yn-pick` 子组件配合使用。支持单选/多选、回显、组级默认 `selected-icon`、`unselected-icon` 与 `show-unselected-icon`。\n\n优先级：子项 `yn-pick` 显式设置时优先生效；未显式设置时回退到 `yn-group-pick` 的组级默认值。\n\n样式隔离：组件使用 Shadow DOM，外部样式默认不穿透；推荐通过公开属性与 CSS 变量定制。\n\nTree Shaking 导入：\n- 全量入口：`import \"yn-web-component/define\"`\n- 按需入口（推荐）：`import \"yn-web-component/components/yn-group-pick\"` 与 `import \"yn-web-component/components/yn-pick\"`"
      }
    }
  },
  args: {
    value: "",
    multiple: false,
    selectedIcon: defaultSelectedIcon,
    unselectedIcon: "",
    showUnselectedIcon: false,
    gap: "12px",
    slot: "yn-pick 列表"
  },
  argTypes: {
    value: {
      control: "object",
      description: "选中值回显。可传 `string`、`number` 或数组；`multiple=false` 时建议传单值，`multiple=true` 时建议传数组。",
      table: {
        defaultValue: { summary: '""' },
        type: { summary: "string | number | Array<string | number>" }
      }
    },
    multiple: {
      control: "boolean",
      description: "是否多选。`false` 时同一时间只能选中一个 `yn-pick`；`true` 时可选中多个。",
      table: {
        defaultValue: { summary: "false" },
        type: { summary: "boolean" }
      }
    },
    selectedIcon: {
      control: "text",
      name: "selected-icon",
      description: "组选中图标默认值。仅对子项未显式设置 `selected-icon` 的 `yn-pick` 生效。",
      table: {
        defaultValue: { summary: "内置勾选 SVG" },
        type: { summary: "string" }
      }
    },
    unselectedIcon: {
      control: "text",
      name: "unselected-icon",
      description: "组未选中图标默认值。仅对子项未显式设置 `unselected-icon` 的 `yn-pick` 生效。",
      table: {
        defaultValue: { summary: '""' },
        type: { summary: "string" }
      }
    },
    showUnselectedIcon: {
      control: "boolean",
      name: "show-unselected-icon",
      description: "组未选中图标显示开关默认值。仅对子项未显式设置 `show-unselected-icon` 的 `yn-pick` 生效。",
      table: {
        defaultValue: { summary: "false" },
        type: { summary: "boolean" }
      }
    },
    gap: {
      control: "text",
      name: "--yn-group-pick-gap",
      description: "选项间距 CSS 变量。",
      table: {
        category: "CSS Variables",
        defaultValue: { summary: "12px" },
        type: { summary: "string" }
      }
    },
    change: {
      name: "change",
      control: false,
      action: "change",
      description: "点击任意 `yn-pick` 后触发。`event.detail` 结构：`{ ids: Array<string | number>; flag: boolean }`，`ids` 为当前选中 id 集合，`flag` 为当前点击项是否为选中状态。",
      table: {
        category: "Events",
        type: { summary: "CustomEvent<{ ids: Array<string | number>; flag: boolean }>" }
      }
    },
    slot: {
      name: "default",
      control: false,
      description: "插入 `yn-pick` 子组件列表。",
      table: {
        category: "Slots",
        type: { summary: "yn-pick[]" }
      }
    }
  }
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

const renderMainDemo = (args: Args) => {
  const onChange = (event: Event) => {
    if (!(event instanceof CustomEvent)) return;
    const detail = event.detail as { ids: PickId[]; flag: boolean };
    args.change?.(detail.ids, detail.flag);
  };

  return html`
    <div class="yn-grid yn-gap-4 yn-rounded-xl yn-bg-[#efede8] yn-p-6">
      <yn-group-pick
        .value=${args.value}
        .multiple=${args.multiple}
        selected-icon=${args.selectedIcon}
        unselected-icon=${args.unselectedIcon}
        .showUnselectedIcon=${args.showUnselectedIcon}
        style=${`--yn-group-pick-gap:${args.gap};`}
        @change=${onChange}
      >
        ${categories.map(
          (item) => html`
            <yn-pick .value=${item.id} ?border=${true}>
              <div
                class="yn-box-border yn-flex yn-flex-col yn-min-w-[104px] yn-items-end yn-gap-[6px] yn-rounded-lg yn-px-3 yn-py-[10px] yn-text-[22px] yn-font-bold yn-leading-none yn-text-[#241f21]"
                style=${`background:${item.color};`}
              >
                <div class="yn-w-full yn-overflow-hidden yn-rounded-lg">
                  <img
                    src="https://www.floema.com/_ipx/f_webp&s_200x114/https:/cdn.sanity.io/images/535lnz3g/production/6adaaad4b7aff57360124f76b64839aafe0bf6bd-317x180.png"
                    alt="Nature sample"
                    class="yn-block yn-h-full yn-w-full yn-object-cover"
                  />
                </div>
                <div>
                  <span
                    class="yn-inline-flex yn-h-[18px] yn-w-[18px] yn-items-center yn-justify-center"
                    >${unsafeSVG(sideIcon)}</span
                  >
                  <span class="yn-text-base yn-font-bold yn-leading-none">${item.id}</span>
                </div>
              </div>
            </yn-pick>
          `
        )}
      </yn-group-pick>
    </div>
  `;
};

export const Default: Story = {
  render: (args) => renderMainDemo(args),
  play: async ({ canvasElement, step }) => {
    const groupEl = canvasElement.querySelector("yn-group-pick");
    if (!(groupEl instanceof HTMLElement)) return;

    const firstPick = groupEl.querySelector("yn-pick");
    if (!(firstPick instanceof HTMLElement) || !firstPick.shadowRoot) return;

    const clickable = firstPick.shadowRoot.querySelector(".wrap");
    if (!(clickable instanceof HTMLElement)) return;

    await step("点击选项后组选中值更新", async () => {
      clickable.click();
      await (groupEl as HTMLElement & { updateComplete?: Promise<unknown> }).updateComplete;
      if ((groupEl as HTMLElement & { value?: string | number | Array<string | number> }).value !== "Golf") {
        throw new Error("点击后 yn-group-pick.value 应更新为 Golf");
      }
    });
  }
};

export const Multiple: Story = {
  args: {
    value: ["Urban", "Nature"],
    multiple: true,
    selectedIcon: defaultSelectedIcon,
    unselectedIcon: "",
    showUnselectedIcon: false,
    gap: "8px"
  },
  render: (args) => renderMainDemo(args)
};

export const AttributeUsage: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "纯 HTML attribute 写法示例：`multiple` 直接写布尔属性，`value` 用 JSON 字符串回显多选值。适合非 Lit 属性绑定场景。"
      }
    }
  },
  render: () => html`
    <div class="yn-grid yn-gap-3 yn-rounded-xl yn-bg-[#efede8] yn-p-6">
      <yn-group-pick multiple value='["Urban","Nature"]' style="--yn-group-pick-gap:8px;">
        ${categories.map(
          (item) => html`
            <yn-pick value=${item.id} border>
              <div
                class="yn-box-border yn-flex yn-flex-col yn-min-w-[104px] yn-items-end yn-gap-[6px] yn-rounded-lg yn-px-3 yn-py-[10px] yn-text-[22px] yn-font-bold yn-leading-none yn-text-[#241f21]"
                style=${`background:${item.color};`}
              >
                <div class="yn-w-full yn-overflow-hidden yn-rounded-lg">
                  <img
                    src="https://www.floema.com/_ipx/f_webp&s_200x114/https:/cdn.sanity.io/images/535lnz3g/production/6adaaad4b7aff57360124f76b64839aafe0bf6bd-317x180.png"
                    alt="Nature sample"
                    class="yn-block yn-h-full yn-w-full yn-object-cover"
                  />
                </div>
                <div>
                  <span
                    class="yn-inline-flex yn-h-[18px] yn-w-[18px] yn-items-center yn-justify-center"
                    >${unsafeSVG(sideIcon)}</span
                  >
                  <span class="yn-text-base yn-font-bold yn-leading-none">${item.id}</span>
                </div>
              </div>
            </yn-pick>
          `
        )}
      </yn-group-pick>
      <code
        >&lt;yn-group-pick multiple value='["Urban","Nature"]'&gt;...&lt;/yn-group-pick&gt;</code
      >
    </div>
  `
};
