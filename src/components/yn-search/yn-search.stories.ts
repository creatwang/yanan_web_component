import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import "./yn-search";

type Args = {
  inputWidth: number;
  placeholder: string;
  disabled: boolean;
  close: boolean;
  bgActive: string;
  bgIdle: string;
  iconColor: string;
  fillDuration: string;
  fillEase: string;
  iconDuration: string;
  iconEase: string;
  defaultSlot?: string;
  input?: (event: CustomEvent<{ value: string }>) => void;
  enter?: (event: CustomEvent<{ value: string }>) => void;
};

const meta = {
  title: "Components/YnSearch",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "可展开的搜索组件，点击按钮显示输入区域并支持搜索输入。\n\n样式隔离：组件使用 Shadow DOM，外部样式默认不穿透；可通过以下 CSS 变量定制样式：\n- `--yn-search-bg-active`\n- `--yn-search-bg-idle`\n- `--yn-search-icon-color`\n- `--yn-search-fill-duration`\n- `--yn-search-fill-ease`\n- `--yn-search-icon-duration`\n- `--yn-search-icon-ease`\n\n默认插槽支持传入 `datalist`，组件会自动把插槽内的 `option` 同步到内部 datalist 并完成 input 的 list 绑定。\n\n示例：\n```html\n<yn-search style=\"--yn-search-bg-active:#fff;--yn-search-icon-color:#241f21;\">\n  <datalist>\n    <option value=\"Sofa\"></option>\n    <option value=\"Table\"></option>\n  </datalist>\n</yn-search>\n```"
      }
    }
  },
  args: {
    inputWidth: 514,
    placeholder: "O que estás à procura?",
    disabled: false,
    close: false,
    bgActive: "rgba(255, 255, 255, 0.96)",
    bgIdle: "rgba(255, 255, 255, 0)",
    iconColor: "#241f21",
    fillDuration: "220ms",
    fillEase: "cubic-bezier(0.4, 0, 1, 1)",
    iconDuration: "220ms",
    iconEase: "cubic-bezier(0.4, 0, 1, 1)"
  },
  argTypes: {
    inputWidth: {
      control: { type: "number", min: 120, max: 700, step: 1 },
      description: "输入区域宽度（不含左侧按钮区域宽度）。",
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
        "取消按钮行为开关。true: 有值先清空、无值才收起；false: 点击取消时直接清空并收起。",
      table: { defaultValue: { summary: "false" } }
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
      table: { category: "CSS Variables", defaultValue: { summary: "rgba(255, 255, 255, 0)" } }
    },
    iconColor: {
      control: "color",
      name: "--yn-search-icon-color",
      description: "搜索/关闭图标颜色。",
      table: { category: "CSS Variables", defaultValue: { summary: "#241f21" } }
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
      description: "默认插槽。可传入一个 `datalist`，为输入框提供原生候选项。",
      control: false,
      table: {
        category: "Slots",
        type: { summary: "<datalist><option value=\"...\"></option></datalist>" }
      }
    },
    input: {
      name: "input",
      description: "输入内容变化时触发。",
      control: false,
      action: "input",
      table: {
        category: "Events",
        type: { summary: "CustomEvent<{ value: string }>" }
      }
    },
    enter: {
      name: "enter",
      description: "按下回车键时触发。",
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
    <div style="background-color: #F2EFEA;padding: 10px;">
    <yn-search
      .inputWidth=${args.inputWidth}
      placeholder=${args.placeholder}
      ?disabled=${args.disabled}
      ?close=${args.close}
      style=${`--yn-search-bg-active:${args.bgActive};--yn-search-bg-idle:${args.bgIdle};--yn-search-icon-color:${args.iconColor};--yn-search-fill-duration:${args.fillDuration};--yn-search-fill-ease:${args.fillEase};--yn-search-icon-duration:${args.iconDuration};--yn-search-icon-ease:${args.iconEase};`}
      @input=${(event: Event) => args.input?.(event as CustomEvent<{ value: string }>)}
      @enter=${(event: Event) => args.enter?.(event as CustomEvent<{ value: string }>)}
    >
     <datalist>
      <option value="Sofa"></option>
      <option value="Table"></option>
    </datalist>  
    </yn-search>
    </div>
  `
};
