import { html, nothing } from "lit";
import { renderLitElementShadowHtml } from "../../lib/lit-ssr-shadow.js";
import "./yn-drawer.js";

export type YnDrawerShadowOptions = {
  title?: string;
};

/**
 * Lit SSR 生成 yn-drawer 的 Declarative Shadow Root（含 lit-part，供官方 hydrate）。
 */
export function renderYnDrawerShadowHtml(options: YnDrawerShadowOptions = {}): string {
  return renderLitElementShadowHtml(html`
    <yn-drawer title=${options.title || nothing}></yn-drawer>
  `);
}

export { YN_DRAWER_SHADOW_STYLES } from "./yn-drawer-styles.js";
