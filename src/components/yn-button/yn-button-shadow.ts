import { html } from "lit";
import { renderLitElementShadowHtml } from "../../lib/lit-ssr-shadow.js";
import "./yn-button.js";

export type YnButtonShadowOptions = {
  variant?: "primary" | "success" | "warning" | "danger" | "neutral" | "dark" | "default";
  size?: "mini" | "small" | "medium";
  disabled?: boolean;
  loading?: boolean;
  hitSlop?: boolean;
};

/** 从 yn-button.ts static styles 提取，供外部复用 */
export const YN_BUTTON_SHADOW_STYLES = `
:host { display: inline-block; }
.button { border: 0; background: transparent; padding: var(--_yn-button-padding, 12px 16px); min-height: var(--_yn-button-min-height, 41px); color: var(--_yn-button-color); font-size: 14px; font-weight: 500; line-height: 1.2; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; position: relative; transition: background-color 0.2s ease; }
.bg { position: absolute; inset: 0; border-radius: var(--yn-button-radius, min(12px, 12px + 100vw * 0)); background: var(--yn-button-bg, var(--_yn-button-bg)); border: 0 solid transparent; box-shadow: none; opacity: 1; transform: scale(1); transition: background-color 0.2s ease, transform 0.2s ease, opacity 0.2s ease; pointer-events: none; z-index: 0; }
.button.hit-slop::before { content: ""; height: calc(100% + 10px); left: -5px; position: absolute; top: -5px; width: calc(100% + 10px); }
.content { display: inline-flex; align-items: center; gap: var(--yn-button-content-gap, 6px); position: relative; z-index: 1; }
:host([variant="default"]) .bg { border-color: var(--yn-color-border, #eceef1); box-shadow: var(--yn-color-shadow-sm); }
:host([variant="default"]) .button:hover .bg { box-shadow: var(--yn-color-shadow-md); }
.button:hover .bg { background: var(--btn-background-color-hover, var(--yn-button-hover-bg, var(--_yn-button-hover-bg))); opacity: 1; transform: scale(1.03); }
.button:disabled { cursor: not-allowed; color: var(--yn-button-disabled-color, var(--_yn-button-disabled-color)); }
.button:disabled .bg { background: var(--yn-button-disabled-bg, var(--_yn-button-disabled-bg)); opacity: var(--yn-button-disabled-opacity, 1); transform: scale(1); box-shadow: none; }
`;

/**
 * Lit SSR 生成 yn-button 的 Declarative Shadow Root（含 lit-part，供官方 hydrate）。
 */
export function renderYnButtonShadowHtml(options: YnButtonShadowOptions = {}): string {
  const variant = options.variant ?? "primary";
  const size = options.size ?? "medium";
  const hitSlop = options.hitSlop !== false;

  return renderLitElementShadowHtml(html`
    <yn-button
      variant=${variant}
      size=${size}
      ?disabled=${Boolean(options.disabled)}
      ?loading=${Boolean(options.loading)}
      ?hit-slop=${hitSlop}
    ></yn-button>
  `);
}
