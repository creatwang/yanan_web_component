import { html } from "lit";
import { renderLitElementShadowHtml } from "../../lib/lit-ssr-shadow.js";
import "./yn-quantity.js";

export type YnQuantityShadowOptions = {
  value?: number;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
};

/**
 * Lit SSR 生成 yn-quantity 的 Declarative Shadow Root（含 lit-part，供官方 hydrate）。
 */
export function renderYnQuantityShadowHtml(options: YnQuantityShadowOptions = {}): string {
  const min = options.min ?? 1;
  const max = options.max ?? 99;
  const step = options.step ?? 1;
  const value = options.value ?? 1;

  return renderLitElementShadowHtml(html`
    <yn-quantity
      value=${value}
      min=${min}
      max=${max}
      step=${step}
      ?disabled=${Boolean(options.disabled)}
    ></yn-quantity>
  `);
}

export {
  YN_QUANTITY_SHADOW_STYLES,
  YN_QUANTITY_MINUS_ICON,
  YN_QUANTITY_PLUS_ICON,
} from "./yn-quantity-styles.js";
