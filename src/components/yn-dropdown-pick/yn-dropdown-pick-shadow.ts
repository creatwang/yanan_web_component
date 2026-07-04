import { ynDropdownPickChevronUpSvg } from "../../asset/svg/index.js";
import { YN_DROPDOWN_PICK_SHADOW_STYLES } from "./yn-dropdown-pick-styles.js";

export type YnDropdownPickShadowOptions = {
  buttonText: string;
  buttonBg?: string;
  buttonColor?: string;
  panelMinWidth?: string;
  disabled?: boolean;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** 收起态 yn-dropdown-pick DSD（panel 关闭，slot 保留 light DOM picks） */
export function renderYnDropdownPickShadowHtml(options: YnDropdownPickShadowOptions): string {
  const buttonText = escapeHtml(options.buttonText);
  const buttonBg = options.buttonBg ?? "var(--yn-dropdown-pick-button-bg, var(--yn-color-surface, #f8f6f2))";
  const buttonColor =
    options.buttonColor ?? "var(--yn-dropdown-pick-button-color, var(--yn-color-text, #241f21))";
  const panelMinWidth = options.panelMinWidth ?? "132px";
  const disabled = options.disabled ? " disabled" : "";
  const styleVars = `--_btn-bg:${buttonBg};--_btn-color:${buttonColor};--_panel-min-width:${panelMinWidth};`;

  return `<style>${YN_DROPDOWN_PICK_SHADOW_STYLES}</style><div class="root" style="${styleVars}"><button class="trigger" type="button"${disabled}><span>${buttonText}</span><span class="caret">${ynDropdownPickChevronUpSvg}</span></button><div class="panel"><div class="pick-list"><slot></slot></div></div></div>`;
}

export { YN_DROPDOWN_PICK_SHADOW_STYLES };
