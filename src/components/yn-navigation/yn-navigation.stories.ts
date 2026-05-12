import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import "./yn-navigation";

type Args = {
  items: Record<string, string>;
  active: string;
  seoMode: boolean;
  ariaLabel: string;
  hitSlop: boolean;
  fillColor: string;
  textColor: string;
  activeTextColor: string;
  indicatorColor: string;
  focusColor: string;
  glowColor: string;
  glowFade: string;
  change?: (event: CustomEvent<{ key: string; node: Record<string, string> }>) => void;
};

const defaultItems = {
  PRODUTOS: "/produtos",
  SOBRE: "/sobre",
  SUSTENTABILIDADE: "/sustentabilidade",
  JORNAL: "/jornal"
};

const meta = {
  title: "Components/YnNavigation",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "导航胶囊组件，用于在多项导航中展示和切换当前激活项。seoMode=false 时为受控切换模式（button + change 事件）；seoMode=true 时为 SEO 链接模式（a 标签 + href 跳转，不派发 change）。\n\n样式隔离：组件使用 Shadow DOM，外部样式默认不穿透；可通过以下 CSS 变量定制：`--yn-navigation-fill-color`、`--yn-navigation-text-color`、`--yn-navigation-active-text-color`、`--yn-navigation-indicator-color`、`--yn-navigation-focus-color`、`--yn-navigation-glow-color`、`--yn-navigation-glow-fade`。"
      }
    }
  },
  args: {
    items: defaultItems,
    active: "PRODUTOS",
    seoMode: false,
    ariaLabel: "Primary navigation",
    hitSlop: true,
    fillColor: "#ffffff",
    textColor: "#241f21",
    activeTextColor: "#241f21",
    indicatorColor: "#241f21",
    focusColor: "#82b7ff",
    glowColor: "#e9e77847",
    glowFade: "#e9e77800"
  },
  argTypes: {
    items: {
      control: "object",
      description:
        "导航数据对象。key 表示展示文案/唯一标识；value 在 seoMode=false 时作为变更上下文透传，在 seoMode=true 时作为链接地址 href（会被规范化为以 / 开头的路径）。",
      table: {
        defaultValue: {
          summary: '{ PRODUTOS: "/produtos", SOBRE: "/sobre", SUSTENTABILIDADE: "/sustentabilidade", JORNAL: "/jornal" }'
        },
        type: { summary: "Record<string, string>" }
      }
    },
    active: {
      control: "text",
      description: "当前激活导航项 key。seoMode=false 时由外部受控；seoMode=true 时以当前 URL 路径匹配 items.value 自动决定激活项。",
      table: {
        defaultValue: { summary: "PRODUTOS" },
        type: { summary: "string" }
      }
    },
    seoMode: {
      control: "boolean",
      description:
        "是否启用 SEO 模式。开启后：1) 选项渲染为 <a href>；2) 激活项由 window.location.pathname 与 items.value 最长匹配决定；3) 禁用组件内部 change 派发，交互以浏览器导航为主。",
      table: {
        defaultValue: { summary: "false" },
        type: { summary: "boolean" }
      }
    },
    ariaLabel: {
      control: "text",
      description: "导航区域的 aria-label。",
      table: {
        defaultValue: { summary: "Primary navigation" },
        type: { summary: "string" }
      }
    },
    hitSlop: {
      control: "boolean",
      description: "是否增加可点击热区。",
      table: {
        defaultValue: { summary: "true" },
        type: { summary: "boolean" }
      }
    },
    fillColor: {
      control: "color",
      name: "--yn-navigation-fill-color",
      description: "背景填充颜色。",
      table: {
        category: "CSS Variables",
        defaultValue: { summary: "#ffffff" },
        type: { summary: "string" }
      }
    },
    textColor: {
      control: "color",
      name: "--yn-navigation-text-color",
      description: "普通文本颜色。",
      table: {
        category: "CSS Variables",
        defaultValue: { summary: "#241f21" },
        type: { summary: "string" }
      }
    },
    activeTextColor: {
      control: "color",
      name: "--yn-navigation-active-text-color",
      description: "激活项文本颜色。",
      table: {
        category: "CSS Variables",
        defaultValue: { summary: "#241f21" },
        type: { summary: "string" }
      }
    },
    indicatorColor: {
      control: "color",
      name: "--yn-navigation-indicator-color",
      description: "激活项圆点颜色。",
      table: {
        category: "CSS Variables",
        defaultValue: { summary: "#241f21" },
        type: { summary: "string" }
      }
    },
    focusColor: {
      control: "color",
      name: "--yn-navigation-focus-color",
      description: "键盘 focus 描边颜色。",
      table: {
        category: "CSS Variables",
        defaultValue: { summary: "#82b7ff" },
        type: { summary: "string" }
      }
    },
    glowColor: {
      control: "text",
      name: "--yn-navigation-glow-color",
      description: "发光中心颜色。",
      table: {
        category: "CSS Variables",
        defaultValue: { summary: "#e9e77847" },
        type: { summary: "string" }
      }
    },
    glowFade: {
      control: "text",
      name: "--yn-navigation-glow-fade",
      description: "发光边缘渐隐颜色。",
      table: {
        category: "CSS Variables",
        defaultValue: { summary: "#e9e77800" },
        type: { summary: "string" }
      }
    },
    change: {
      name: "change",
      description:
        "导航项切换时触发（仅 seoMode=false）。回调参数 event.detail: { key, node }，其中 key 为当前选中项 key，node 为完整的 items 快照。",
      control: false,
      table: {
        category: "Events",
        type: { summary: "CustomEvent<{ key: string; node: Record<string, string> }>" }
      }
    }
  }
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

const renderControlledNavigation = (args: Args) => {
  const onChange = (event: Event) => {
    const detail = (event as CustomEvent<{ key: string; node: Record<string, string> }>).detail;
    console.log("detail", detail);
    const target = event.currentTarget as HTMLElement & { active: string };
    target.active = detail.key;
  };

  return html`
  <div style="background-color: #F2EFEA;padding: 10px;">
    <yn-navigation
      .items=${args.items}
      .active=${args.active}
      .seoMode=${args.seoMode}
      aria-label=${args.ariaLabel}
      ?hit-slop=${args.hitSlop}
      @change=${onChange}
      style=${`--yn-navigation-fill-color:${args.fillColor};--yn-navigation-text-color:${args.textColor};--yn-navigation-active-text-color:${args.activeTextColor};--yn-navigation-indicator-color:${args.indicatorColor};--yn-navigation-focus-color:${args.focusColor};--yn-navigation-glow-color:${args.glowColor};--yn-navigation-glow-fade:${args.glowFade};`}
    ></yn-navigation>
  </div>
  `;
};

export const Default: Story = {
  render: (args: Args) => renderControlledNavigation(args)
};

export const DarkBackground: Story = {
  args: {
    items: defaultItems,
    active: "SOBRE",
    seoMode: false,
    ariaLabel: "Primary navigation",
    hitSlop: true,
    fillColor: "#ffffff",
    textColor: "#241f21",
    activeTextColor: "#241f21",
    indicatorColor: "#241f21",
    focusColor: "#82b7ff",
    glowColor: "#e9e77847",
    glowFade: "#e9e77800"
  },
  render: (args: Args) => html`
    <div style="background:#2f2521;padding:16px;border-radius:12px;display:inline-block;">
      ${renderControlledNavigation(args)}
    </div>
  `
};

export const NonSeoControlled: Story = {
  args: {
    items: defaultItems,
    active: "PRODUTOS",
    seoMode: false,
    ariaLabel: "Primary navigation",
    hitSlop: true,
    fillColor: "#ffffff",
    textColor: "#241f21",
    activeTextColor: "#241f21",
    indicatorColor: "#241f21",
    focusColor: "#82b7ff",
    glowColor: "#e9e77847",
    glowFade: "#e9e77800"
  },
  render: (args: Args) => renderControlledNavigation(args)
};
