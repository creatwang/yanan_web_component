import { html } from "lit";
import { renderLitElementShadowHtml } from "../../lib/lit-ssr-shadow.js";
import "./yn-input.js";

export type YnInputShadowOptions = {
  value?: string;
  placeholder?: string;
  disabled?: boolean;
  variant?: "default" | "floating";
  label?: string;
  type?: string;
  name?: string;
  required?: boolean;
  error?: boolean;
  errorMessage?: string;
  autocomplete?: string;
};

/**
 * Lit SSR 生成 yn-input 的 Declarative Shadow Root（含 lit-part，供官方 hydrate）。
 */
export function renderYnInputShadowHtml(options: YnInputShadowOptions = {}): string {
  const variant = options.variant ?? "default";
  const type = options.type ?? "text";

  return renderLitElementShadowHtml(html`
    <yn-input
      .value=${options.value ?? ""}
      .placeholder=${options.placeholder ?? "请输入内容"}
      .variant=${variant}
      .label=${options.label ?? ""}
      .type=${type}
      .name=${options.name ?? ""}
      .autocomplete=${options.autocomplete ?? ""}
      .errorMessage=${options.errorMessage ?? ""}
      .disabled=${Boolean(options.disabled)}
      .required=${Boolean(options.required)}
      .error=${Boolean(options.error)}
    ></yn-input>
  `);
}

export { YN_INPUT_SHADOW_STYLES } from "./yn-input-styles.js";
