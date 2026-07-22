import { html, nothing } from "lit";
import { renderLitElementShadowHtml } from "../../lib/lit-ssr-shadow.js";
import "./yn-dropdown-pick.js";

export type YnDropdownPickShadowOptions = {
  buttonText: string;
  buttonBg?: string;
  buttonColor?: string;
  panelMinWidth?: string;
  disabled?: boolean;
  value?: string | number;
  valueField?: string;
  buttonDisplayField?: string;
  placeholder?: string;
};

/**
 * Lit SSR 生成 yn-dropdown-pick 的 Declarative Shadow Root（含 lit-part，供官方 hydrate）。
 */
export function renderYnDropdownPickShadowHtml(options: YnDropdownPickShadowOptions): string {
  const value = options.value ?? "";
  const placeholder = options.placeholder ?? options.buttonText ?? "Select";
  const valueField = options.valueField ?? "id";
  const buttonDisplayField = options.buttonDisplayField ?? "code";
  const panelMinWidth = options.panelMinWidth ?? "132px";
  const disabled = Boolean(options.disabled);

  return renderLitElementShadowHtml(html`
    <yn-dropdown-pick
      value=${String(value)}
      value-field=${valueField}
      button-display-field=${buttonDisplayField}
      placeholder=${placeholder}
      panel-min-width=${panelMinWidth}
      button-bg=${options.buttonBg || nothing}
      button-color=${options.buttonColor || nothing}
      ?disabled=${disabled}
    ></yn-dropdown-pick>
  `);
}

export { YN_DROPDOWN_PICK_SHADOW_STYLES } from "./yn-dropdown-pick-styles.js";
