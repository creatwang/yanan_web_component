import { html } from "lit";
import type { DemoRenderer } from "../types";
import { DOC_VARIANT_DEMOS } from "./variants";

const jerseySkus = [
  { size: "S", price: 65, id: "s" },
  { size: "M", price: 65, id: "m" },
  { size: "L", price: 65, id: "l" },
  { size: "XL", price: 65, id: "xl" }
];

export const DOC_DEMOS: Record<string, DemoRenderer> = {
  "yn-button": () => html`
    <yn-button variant="primary">保存</yn-button>
    <yn-button variant="danger">删除</yn-button>
    <yn-button variant="neutral" size="small">次要操作</yn-button>
  `,

  "yn-input": () => html`
    <yn-input
      placeholder="搜索商品…"
      style="--yn-input-width: 280px;"
    ></yn-input>
  `,

  "yn-icon-connect-button": () => html`
    <yn-icon-connect-button label="查看系列" size="normal"></yn-icon-connect-button>
  `,

  "yn-navigation": () => html`
    <yn-navigation
      .items=${{ PRODUTOS: "products", URBAN: "urban", NATURE: "nature" }}
      active="URBAN"
      style="max-width: 100%;"
    ></yn-navigation>
  `,

  "yn-search": () => html`
    <yn-search
      placeholder="你在找什么？"
      .inputWidth=${360}
    ></yn-search>
  `,

  "yn-pick": () => html`
    <yn-pick value="nature" ?selected=${true}>
      <div style="padding: 12px 20px; font-size: 14px;">Nature</div>
    </yn-pick>
    <yn-pick value="urban">
      <div style="padding: 12px 20px; font-size: 14px;">Urban</div>
    </yn-pick>
  `,

  "yn-group-pick": () => html`
    <yn-group-pick multiple .value=${["golf", "urban"]}>
      <yn-pick value="golf"><div style="padding: 10px 16px;">Golf</div></yn-pick>
      <yn-pick value="urban"><div style="padding: 10px 16px;">Urban</div></yn-pick>
      <yn-pick value="nature"><div style="padding: 10px 16px;">Nature</div></yn-pick>
    </yn-group-pick>
  `,

  "yn-dropdown": () => html`
    <yn-dropdown placement="bottom-start">
      <yn-button variant="neutral" size="small">筛选</yn-button>
      <div slot="content" style="padding: 4px 0; font-size: 14px;">
        <div style="padding: 8px 4px;">Golf</div>
        <div style="padding: 8px 4px;">Urban</div>
        <div style="padding: 8px 4px;">Nature</div>
      </div>
    </yn-dropdown>
  `,

  "yn-dropdown-pick": () => html`
    <yn-dropdown-pick
      value="en"
      button-display-field="code"
      placeholder="Language"
    >
      <yn-pick
        value="en"
        data-node=${'{"id":"en","code":"EN","label":"English"}'}
      >English</yn-pick>
      <yn-pick
        value="zh"
        data-node=${'{"id":"zh","code":"ZH","label":"中文"}'}
      >中文</yn-pick>
    </yn-dropdown-pick>
  `,

  "yn-quantity": () => html`
    <yn-quantity value="1" min="1" max="10"></yn-quantity>
  `,

  "yn-sku-selector": () => html`
    <yn-sku-selector
      .skus=${jerseySkus}
      pick-one
      currency="€"
      .labels=${{ size: "尺码" }}
      style="max-width: 420px;"
    ></yn-sku-selector>
  `,

  "yn-checkout-address": () => html`
    <yn-checkout-address
      locale="zh-CN"
      style="max-width: 480px; --yn-checkout-address-padding: 0;"
    ></yn-checkout-address>
  `,

  "yn-drawer": () => html`
    <yn-drawer placement="auto" sheet-height="auto">
      <yn-button slot="trigger" variant="dark" size="small">打开抽屉</yn-button>
      <span slot="header">Your bag</span>
      <div slot="content" style="font-size: 14px; line-height: 1.6;">
        购物车内容预览区域。
      </div>
    </yn-drawer>
  `,

  "yn-toast": () => html`
    <yn-button
      variant="primary"
      size="small"
      @click=${() => {
        const el = document.querySelector("yn-toast") as HTMLElement & {
          success?: (msg: string) => void;
        };
        el?.success?.("已加入购物车");
      }}
    >显示 Toast</yn-button>
    <yn-toast></yn-toast>
  `,

  "yn-pull-cord-switch": () => html`
    <yn-pull-cord-switch rope-length="180" style="min-height: 200px;">
      <yn-button size="mini" variant="neutral">夜间</yn-button>
      <yn-button slot="activated" size="mini" variant="success">日间</yn-button>
    </yn-pull-cord-switch>
  `,

  ...DOC_VARIANT_DEMOS
};

export function getDemoRenderer(id: string): DemoRenderer | undefined {
  return DOC_DEMOS[id];
}
