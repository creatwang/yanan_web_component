import { html } from "lit";
import type { DemoRenderer } from "../types";

/** 展示形式 Live Demo（与 Storybook story 一一对应） */
export const DOC_VARIANT_DEMOS: Record<string, DemoRenderer> = {
  "yn-button-variants": () => html`<yn-docs-button-demo variant="variants"></yn-docs-button-demo>`,
  "yn-button-sizes": () => html`<yn-docs-button-demo variant="sizes"></yn-docs-button-demo>`,
  "yn-button-loading": () => html`<yn-docs-button-demo variant="loading"></yn-docs-button-demo>`,

  "yn-input-default": () => html`<yn-docs-input-demo variant="default"></yn-docs-input-demo>`,
  "yn-input-prefix": () => html`<yn-docs-input-demo variant="prefix"></yn-docs-input-demo>`,
  "yn-input-suffix": () => html`<yn-docs-input-demo variant="suffix"></yn-docs-input-demo>`,
  "yn-input-slotted": () => html`<yn-docs-input-demo variant="both"></yn-docs-input-demo>`,

  "yn-icon-connect-sizes": () => html`<yn-docs-icon-connect-demo></yn-docs-icon-connect-demo>`,

  "yn-navigation-controlled": () => html`<yn-docs-navigation-demo variant="controlled"></yn-docs-navigation-demo>`,
  "yn-navigation-dark": () => html`<yn-docs-navigation-demo variant="dark"></yn-docs-navigation-demo>`,
  "yn-navigation-seo": () => html`<yn-docs-navigation-demo variant="seo"></yn-docs-navigation-demo>`,

  "yn-search-default": () => html`<yn-docs-search-demo></yn-docs-search-demo>`,

  "yn-pick-color-card": () => html`<yn-docs-pick-demo variant="default"></yn-docs-pick-demo>`,
  "yn-pick-image-card": () => html`<yn-docs-pick-demo variant="image"></yn-docs-pick-demo>`,

  "yn-group-pick-cards": () => html`<yn-docs-group-pick-demo variant="default"></yn-docs-group-pick-demo>`,
  "yn-group-pick-multiple": () => html`<yn-docs-group-pick-demo variant="multiple"></yn-docs-group-pick-demo>`,

  "yn-dropdown-default": () => html`<yn-docs-dropdown-demo variant="default"></yn-docs-dropdown-demo>`,
  "yn-dropdown-custom-close": () => html`<yn-docs-dropdown-demo variant="custom-close"></yn-docs-dropdown-demo>`,

  "yn-dropdown-pick-default": () => html`<yn-docs-dropdown-pick-demo></yn-docs-dropdown-pick-demo>`,

  "yn-quantity-product": () => html`<yn-docs-quantity-demo></yn-docs-quantity-demo>`,

  "yn-sku-default": () => html`<yn-docs-sku-demo mode="default"></yn-docs-sku-demo>`,
  "yn-sku-simple": () => html`<yn-docs-sku-demo mode="simple"></yn-docs-sku-demo>`,

  "yn-checkout-address-default": () => html`<yn-docs-checkout-address-demo></yn-docs-checkout-address-demo>`,

  "yn-drawer-cart": () => html`<yn-docs-drawer-demo variant="cart"></yn-docs-drawer-demo>`,
  "yn-drawer-desktop": () => html`<yn-docs-drawer-demo variant="desktop"></yn-docs-drawer-demo>`,

  "yn-toast-api": () => html`<yn-docs-toast-demo></yn-docs-toast-demo>`,

  "yn-pull-cord-slots": () => html`<yn-docs-pull-cord-demo variant="slots"></yn-docs-pull-cord-demo>`,
  "yn-pull-cord-sizes": () => html`<yn-docs-pull-cord-demo variant="sizes"></yn-docs-pull-cord-demo>`
};
