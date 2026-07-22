import { html } from "lit";
import { renderLitElementShadowHtml } from "../../lib/lit-ssr-shadow.js";
import "./yn-search.js";

export type YnSearchShadowOptions = {
  placeholder?: string;
  inputWidth?: number;
  disabled?: boolean;
  expandDirection?: "left" | "right";
};

/**
 * Lit SSR 生成 yn-search 的 Declarative Shadow Root（含 lit-part，供官方 hydrate）。
 */
export function renderYnSearchShadowHtml(options: YnSearchShadowOptions = {}): string {
  const placeholder = options.placeholder ?? "";
  const inputWidth = options.inputWidth ?? 514;
  const expandDirection = options.expandDirection === "left" ? "left" : "right";

  return renderLitElementShadowHtml(html`
    <yn-search
      placeholder=${placeholder}
      input-width=${inputWidth}
      expand-direction=${expandDirection}
      ?disabled=${Boolean(options.disabled)}
    ></yn-search>
  `);
}

export { YN_SEARCH_SHADOW_STYLES } from "./yn-search-styles.js";
