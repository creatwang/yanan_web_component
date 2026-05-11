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
  argTypes: {
    active: { control: "text" },
    seoMode: { control: "boolean" },
    ariaLabel: { control: "text" },
    hitSlop: { control: "boolean" },
    fillColor: { control: "color" },
    textColor: { control: "color" },
    activeTextColor: { control: "color" }
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
    <yn-navigation
      .items=${args.items}
      .active=${args.active}
      .seoMode=${false}
      aria-label=${args.ariaLabel}
      ?hit-slop=${args.hitSlop}
      @change=${onChange}
      style=${`--yn-navigation-fill-color:${args.fillColor};--yn-navigation-text-color:${args.textColor};--yn-navigation-active-text-color:${args.activeTextColor};`}
    ></yn-navigation>
  `;
};

export const Default: Story = {
  args: {
    items: defaultItems,
    active: "PRODUTOS",
    seoMode: false,
    ariaLabel: "Primary navigation",
    hitSlop: true,
    fillColor: "#ffffff",
    textColor: "#241f21",
    activeTextColor: "#241f21"
  },
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
    activeTextColor: "#241f21"
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
    activeTextColor: "#241f21"
  },
  render: (args: Args) => renderControlledNavigation(args)
};
