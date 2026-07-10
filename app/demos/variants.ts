import { html } from "lit";
import type { DemoRenderer } from "../types";
import {
  storyButtonPropsDemo,
  storyButtonEventLog,
  storyIconButtonEventLog,
  storyIconButtonPropsDemo,
  storyInputPropsDemo,
  storyInputEventLog,
  storyPickEventLog,
  storyGroupPickEventLog,
  storyNavigationEventLog,
  storySearchEventLog,
  storyDropdownEventLog,
  storyDropdownPropsDemo,
  storyDropdownPickEventLog,
  storyQuantityEventLog,
  storySkuEventLog,
  storyDrawerEventLog,
  storyDrawerSlotsDemo,
  storyToastEventLog,
  storyPullCordEventLog,
  storyCheckoutAddressEventLog,
  storyIconConnectEventLog,
  storyIconConnectPropsDemo,
  storyCookieNoticeEventLog,
  storySkuCartButtonEventLog,
  storyDropdownPickPropsDemo,
  storyQuantityPropsDemo,
  storyCheckoutAddressPropsDemo,
  storySkuPropsDemo,
  storyPickPropsDemo,
  storyGroupPickPropsDemo,
  storyToastPropsDemo,
  storyPullCordPropsDemo,
  storyCookieNoticePropsDemo,
  storySkuCartButtonPropsDemo,
} from "./story-demos";

/** 展示形式 Live Demo（与 Storybook story 一一对应；外层由 docs-app 统一包裹 yn-docs-demo） */
export const DOC_VARIANT_DEMOS: Record<string, DemoRenderer> = {
  "yn-button-variants": () => html`<yn-docs-button-demo variant="variants"></yn-docs-button-demo>`,
  "yn-button-sizes": () => html`<yn-docs-button-demo variant="sizes"></yn-docs-button-demo>`,
  "yn-button-loading": () => html`<yn-docs-button-demo variant="loading"></yn-docs-button-demo>`,

  "yn-icon-button-click": () => html`<yn-docs-icon-button-demo variant="click"></yn-docs-icon-button-demo>`,
  "yn-icon-button-variants": () => html`<yn-docs-icon-button-demo variant="variants"></yn-docs-icon-button-demo>`,
  "yn-icon-button-sizes": () => html`<yn-docs-icon-button-demo variant="sizes"></yn-docs-icon-button-demo>`,

  "yn-input-default": () => html`<yn-docs-input-demo variant="default"></yn-docs-input-demo>`,
  "yn-input-prefix": () => html`<yn-docs-input-demo variant="prefix"></yn-docs-input-demo>`,
  "yn-input-suffix": () => html`<yn-docs-input-demo variant="suffix"></yn-docs-input-demo>`,
  "yn-input-slotted": () => html`<yn-docs-input-demo variant="both"></yn-docs-input-demo>`,

  "yn-icon-connect-sizes": () => html`<yn-docs-icon-connect-demo></yn-docs-icon-connect-demo>`,

  "yn-navigation-controlled": () => html`<yn-docs-navigation-demo variant="controlled"></yn-docs-navigation-demo>`,
  "yn-navigation-dark": () => html`<yn-docs-navigation-demo variant="dark"></yn-docs-navigation-demo>`,
  "yn-navigation-seo": () => html`<yn-docs-navigation-demo variant="seo"></yn-docs-navigation-demo>`,

  "yn-search-default": () => html`<yn-docs-search-demo variant="default"></yn-docs-search-demo>`,
  "yn-search-expand-right": () => html`<yn-docs-search-demo variant="expand-right"></yn-docs-search-demo>`,
  "yn-search-expand-left": () => html`<yn-docs-search-demo variant="expand-left"></yn-docs-search-demo>`,
  "yn-search-default-open": () => html`<yn-docs-search-demo variant="default-open"></yn-docs-search-demo>`,

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
  "yn-pull-cord-sizes": () => html`<yn-docs-pull-cord-demo variant="sizes"></yn-docs-pull-cord-demo>`,
  "yn-pull-cord-fixed-header": () => html`<yn-docs-pull-cord-demo variant="fixed-header"></yn-docs-pull-cord-demo>`,

  // ─ 属性展示 & 事件日志变体（直接返回 story 内容，不再内嵌 yn-docs-demo） ──
  "yn-button-props-demo": storyButtonPropsDemo,
  "yn-button-event-log": storyButtonEventLog,
  "yn-icon-button-event-log": storyIconButtonEventLog,
  "yn-icon-button-props-demo": storyIconButtonPropsDemo,
  "yn-input-props-demo": storyInputPropsDemo,
  "yn-input-event-log": storyInputEventLog,
  "yn-pick-event-log": storyPickEventLog,
  "yn-group-pick-event-log": storyGroupPickEventLog,
  "yn-navigation-event-log": storyNavigationEventLog,
  "yn-search-event-log": storySearchEventLog,
  "yn-dropdown-event-log": storyDropdownEventLog,
  "yn-dropdown-props-demo": storyDropdownPropsDemo,
  "yn-dropdown-pick-event-log": storyDropdownPickEventLog,
  "yn-quantity-event-log": storyQuantityEventLog,
  "yn-sku-event-log": storySkuEventLog,
  "yn-drawer-event-log": storyDrawerEventLog,
  "yn-drawer-slots": storyDrawerSlotsDemo,
  "yn-toast-event-log": storyToastEventLog,
  "yn-pull-cord-event-log": storyPullCordEventLog,
  "yn-checkout-address-event-log": storyCheckoutAddressEventLog,
  "yn-icon-connect-event-log": storyIconConnectEventLog,
  "yn-icon-connect-props-demo": storyIconConnectPropsDemo,

  // ── Cookie Notice ──────────────────────────
  "yn-cookie-notice-default": () => html`<yn-docs-cookie-notice-demo variant="default"></yn-docs-cookie-notice-demo>`,
  "yn-cookie-notice-settings": () => html`<yn-docs-cookie-notice-demo variant="settings"></yn-docs-cookie-notice-demo>`,
  "yn-cookie-notice-event-log": storyCookieNoticeEventLog,

  // ── Props demo variants ──────────────────────────
  "yn-dropdown-pick-props-demo": storyDropdownPickPropsDemo,
  "yn-quantity-props-demo": storyQuantityPropsDemo,
  "yn-checkout-address-props-demo": storyCheckoutAddressPropsDemo,
  "yn-sku-props-demo": storySkuPropsDemo,
  "yn-pick-props-demo": storyPickPropsDemo,
  "yn-group-pick-props-demo": storyGroupPickPropsDemo,
  "yn-toast-props-demo": storyToastPropsDemo,
  "yn-pull-cord-props-demo": storyPullCordPropsDemo,
  "yn-cookie-notice-props-demo": storyCookieNoticePropsDemo,
  "yn-sku-cart-button-props-demo": storySkuCartButtonPropsDemo,

  // ── SKU Cart Button ──────────────────────────
  "yn-sku-cart-button-default": () => html`<yn-docs-sku-cart-button-demo variant="default"></yn-docs-sku-cart-button-demo>`,
  "yn-sku-cart-button-loading": () => html`<yn-docs-sku-cart-button-demo variant="loading"></yn-docs-sku-cart-button-demo>`,
  "yn-sku-cart-button-event-log": storySkuCartButtonEventLog,
};
