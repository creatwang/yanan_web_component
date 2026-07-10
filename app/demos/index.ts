import { html } from "lit";
import type { DemoRenderer } from "../types";
import { DOC_VARIANT_DEMOS } from "./variants";

export const DOC_DEMOS: Record<string, DemoRenderer> = {
  "yn-button": () => html`<yn-docs-button-demo variant="default"></yn-docs-button-demo>`,
  "yn-icon-button": () => html`<yn-docs-icon-button-demo variant="default"></yn-docs-icon-button-demo>`,
  "yn-input": () => html`<yn-docs-input-demo></yn-docs-input-demo>`,
  "yn-icon-connect-button": () => html`<yn-docs-icon-connect-demo></yn-docs-icon-connect-demo>`,
  "yn-navigation": () => html`<yn-docs-navigation-demo variant="controlled"></yn-docs-navigation-demo>`,
  "yn-search": () => html`<yn-docs-search-demo></yn-docs-search-demo>`,
  "yn-pick": DOC_VARIANT_DEMOS["yn-pick-color-card"],
  "yn-group-pick": DOC_VARIANT_DEMOS["yn-group-pick-cards"],
  "yn-dropdown": DOC_VARIANT_DEMOS["yn-dropdown-default"],
  "yn-dropdown-pick": DOC_VARIANT_DEMOS["yn-dropdown-pick-default"],
  "yn-quantity": DOC_VARIANT_DEMOS["yn-quantity-product"],
  "yn-sku-selector": DOC_VARIANT_DEMOS["yn-sku-default"],
  "yn-checkout-address": DOC_VARIANT_DEMOS["yn-checkout-address-default"],
  "yn-drawer": DOC_VARIANT_DEMOS["yn-drawer-cart"],
  "yn-toast": DOC_VARIANT_DEMOS["yn-toast-api"],
  "yn-pull-cord-switch": () => html`<yn-docs-pull-cord-demo variant="theme"></yn-docs-pull-cord-demo>`,
  "yn-cookie-notice": DOC_VARIANT_DEMOS["yn-cookie-notice-default"],
  "yn-sku-cart-button": DOC_VARIANT_DEMOS["yn-sku-cart-button-default"],
  ...DOC_VARIANT_DEMOS
};

export function getDemoRenderer(id: string): DemoRenderer | undefined {
  return DOC_DEMOS[id];
}
