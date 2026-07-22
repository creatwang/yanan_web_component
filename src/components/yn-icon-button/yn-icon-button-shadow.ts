import { html, nothing } from "lit";
import { renderLitElementShadowHtml } from "../../lib/lit-ssr-shadow.js";
import "./yn-icon-button.js";
import type { YnIconButtonVariant } from "./yn-icon-button-variants.js";

export type YnIconButtonShadowOptions = {
  size?: "small" | "medium" | "large";
  variant?: YnIconButtonVariant;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  label?: string;
  href?: string;
  hitSlop?: boolean;
};

/**
 * Lit SSR 生成 yn-icon-button 的 Declarative Shadow Root（含 lit-part，供官方 hydrate）。
 */
export function renderYnIconButtonShadowHtml(options: YnIconButtonShadowOptions = {}): string {
  const size = options.size ?? "medium";
  const variant = options.variant ?? "default";
  const type = options.type ?? "button";
  const hitSlop = options.hitSlop !== false;
  const label = options.label ?? "";

  return renderLitElementShadowHtml(html`
    <yn-icon-button
      size=${size}
      variant=${variant}
      type=${type}
      label=${label || nothing}
      href=${options.href || nothing}
      ?disabled=${Boolean(options.disabled)}
      ?hit-slop=${hitSlop}
    ></yn-icon-button>
  `);
}

export { YN_ICON_BUTTON_SHADOW_STYLES } from "./yn-icon-button-styles.js";
export { YN_ICON_BUTTON_VARIANTS, type YnIconButtonVariant } from "./yn-icon-button-variants.js";
