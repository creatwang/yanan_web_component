import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import "./yn-dropdown-pick";
import "../yn-pick/yn-pick";

type NodeItem = Record<string, unknown>;

type Args = {
  value: string | number;
  valueField: string;
  buttonDisplayField: string;
  placeholder: string;
  closeOnOutsideClick: boolean;
  buttonBg: string;
  buttonColor: string;
  openButtonBg: string;
  openButtonColor: string;
  panelMinWidth: string;
  showSelectedIcon: boolean;
  panelBg: string;
  panelRadius: string;
  panelPadding: string;
  gap: string;
  defaultSlot?: string;
  onChange?: (event: CustomEvent<{ id: string | number | ""; node: NodeItem | null }>) => void;
  onOpenChange?: (event: CustomEvent<{ open: boolean }>) => void;
};

const languageNodes: NodeItem[] = [
  { id: "en", label: "English", code: "EN", native: "English" },
  { id: "pt", label: "Português", code: "PT", native: "Português" },
  { id: "es", label: "Español", code: "ES", native: "Español" }
];

const renderLanguagePicks = () =>
  languageNodes.map(
    (item) => html`
      <yn-pick value=${String(item.id)} data-node=${JSON.stringify(item)}>
        <div class="yn-flex yn-min-h-[34px] yn-items-center yn-rounded-[8px] yn-px-3 yn-py-[9px] yn-text-[13px] yn-font-medium yn-leading-[1.2] yn-text-[#241f21]">
          ${String(item.label)}
        </div>
      </yn-pick>
    `
  );

const meta = {
  title: "Components/YnDropdownPick",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "独立下拉选择器（不复用 `yn-dropdown`/`yn-button`）。通过默认插槽传入 `yn-pick` 选项，实现单选、选中即收起、按钮颜色联动和按钮文案字段映射。\n\n数据建议：每个 `yn-pick` 用 `data-node` 传入完整节点 JSON，组件会在 `change` 事件中回传 `event.detail.node`。"
      }
    }
  },
  args: {
    value: "en",
    valueField: "id",
    buttonDisplayField: "code",
    placeholder: "Language",
    closeOnOutsideClick: true,
    buttonBg: "#f8f6f2",
    buttonColor: "#241f21",
    openButtonBg: "#241f21",
    openButtonColor: "#ffffff",
    panelMinWidth: "132px",
    showSelectedIcon: true,
    panelBg: "#f2efea",
    panelRadius: "12px",
    panelPadding: "6px",
    gap: "6px"
  },
  argTypes: {
    value: {
      control: "text",
      description: "默认选中值（单选）。",
      table: { defaultValue: { summary: '"en"' } }
    },
    valueField: {
      name: "value-field",
      control: "text",
      description: "节点值字段名（匹配 `value`）。",
      table: { defaultValue: { summary: "id" } }
    },
    buttonDisplayField: {
      name: "button-display-field",
      control: "text",
      description: "按钮文案展示字段名。",
      table: { defaultValue: { summary: "code" } }
    },
    placeholder: {
      control: "text",
      description: "未选中时按钮占位文案。",
      table: { defaultValue: { summary: "Language" } }
    },
    closeOnOutsideClick: {
      name: "close-on-outside-click",
      control: "boolean",
      description: "点击外部时是否关闭。",
      table: { defaultValue: { summary: "true" } }
    },
    buttonBg: {
      name: "button-bg",
      control: "color",
      description: "收起态按钮背景色。",
      table: { defaultValue: { summary: "#f8f6f2" } }
    },
    buttonColor: {
      name: "button-color",
      control: "color",
      description: "收起态按钮文字色。",
      table: { defaultValue: { summary: "#241f21" } }
    },
    openButtonBg: {
      name: "open-button-bg",
      control: "color",
      description: "展开态按钮背景色。",
      table: { defaultValue: { summary: "#241f21" } }
    },
    openButtonColor: {
      name: "open-button-color",
      control: "color",
      description: "展开态按钮文字色。",
      table: { defaultValue: { summary: "#ffffff" } }
    },
    panelMinWidth: {
      name: "panel-min-width",
      control: "text",
      description: "面板最小宽度。",
      table: { defaultValue: { summary: "132px" } }
    },
    showSelectedIcon: {
      name: "show-selected-icon",
      control: "boolean",
      description: "是否显示选中项右侧勾选图标。关闭后仅保留选中背景。",
      table: { defaultValue: { summary: "true" } }
    },
    panelBg: {
      name: "--yn-dropdown-pick-panel-bg",
      control: "color",
      description: "面板背景色。",
      table: { category: "CSS Variables", defaultValue: { summary: "#f2efea" } }
    },
    panelRadius: {
      name: "--yn-dropdown-pick-panel-radius",
      control: "text",
      description: "面板圆角。",
      table: { category: "CSS Variables", defaultValue: { summary: "12px" } }
    },
    panelPadding: {
      name: "--yn-dropdown-pick-panel-padding",
      control: "text",
      description: "面板内边距。",
      table: { category: "CSS Variables", defaultValue: { summary: "6px" } }
    },
    gap: {
      name: "--yn-dropdown-pick-gap",
      control: "text",
      description: "选项垂直间距。",
      table: { category: "CSS Variables", defaultValue: { summary: "6px" } }
    },
    onChange: {
      name: "change",
      control: false,
      action: "change",
      description: "选中变化时触发。`event.detail`：`{ id, node }`。",
      table: {
        category: "Events",
        type: { summary: "CustomEvent<{ id: string | number | \"\"; node: Record<string, unknown> | null }>" }
      }
    },
    onOpenChange: {
      name: "open-change",
      control: false,
      action: "open-change",
      description: "展开状态变化时触发。`event.detail`：`{ open: boolean }`。",
      table: {
        category: "Events",
        type: { summary: "CustomEvent<{ open: boolean }>" }
      }
    },
    defaultSlot: {
      name: "default",
      control: false,
      description: "默认插槽：直接传入 `yn-pick` 列表（建议每项设置 `data-node`）。",
      table: {
        category: "Slots",
        type: { summary: "<yn-pick value=\"en\" data-node='{\"id\":\"en\",\"code\":\"EN\"}'>...</yn-pick>" }
      }
    }
  }
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {
  render: (args) => html`
    <div class="yn-min-h-[220px] yn-bg-[#efede8] yn-p-8 yn-flex yn-justify-end">
      <yn-dropdown-pick
        .value=${args.value}
        value-field=${args.valueField}
        button-display-field=${args.buttonDisplayField}
        placeholder=${args.placeholder}
        ?close-on-outside-click=${args.closeOnOutsideClick}
        button-bg=${args.buttonBg}
        button-color=${args.buttonColor}
        open-button-bg=${args.openButtonBg}
        open-button-color=${args.openButtonColor}
        panel-min-width=${args.panelMinWidth}
        ?show-selected-icon=${args.showSelectedIcon}
        style=${`--yn-dropdown-pick-panel-bg:${args.panelBg};--yn-dropdown-pick-panel-radius:${args.panelRadius};--yn-dropdown-pick-panel-padding:${args.panelPadding};--yn-dropdown-pick-gap:${args.gap};`}
        @change=${(event: Event) => args.onChange?.(event as CustomEvent<{ id: string | number | ""; node: NodeItem | null }>)}
        @open-change=${(event: Event) => args.onOpenChange?.(event as CustomEvent<{ open: boolean }>)}
      >
        ${renderLanguagePicks()}
      </yn-dropdown-pick>
    </div>
  `
};

export const DisplayNative: Story = {
  args: {
    value: "pt",
    buttonDisplayField: "native"
  },
  render: (args) => html`
    <div class="yn-min-h-[220px] yn-bg-[#efede8] yn-p-8 yn-flex yn-justify-end">
      <yn-dropdown-pick
        .value=${args.value}
        value-field=${args.valueField}
        button-display-field=${args.buttonDisplayField}
        placeholder=${args.placeholder}
        ?close-on-outside-click=${args.closeOnOutsideClick}
        button-bg=${args.buttonBg}
        button-color=${args.buttonColor}
        open-button-bg=${args.openButtonBg}
        open-button-color=${args.openButtonColor}
        panel-min-width=${args.panelMinWidth}
        ?show-selected-icon=${args.showSelectedIcon}
        style=${`--yn-dropdown-pick-panel-bg:${args.panelBg};--yn-dropdown-pick-panel-radius:${args.panelRadius};--yn-dropdown-pick-panel-padding:${args.panelPadding};--yn-dropdown-pick-gap:${args.gap};`}
      >
        ${renderLanguagePicks()}
      </yn-dropdown-pick>
    </div>
  `
};
