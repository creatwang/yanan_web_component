import {
  YN_ICON_BUTTON_SHADOW_STYLES,
  YN_ICON_BUTTON_SIZE_VARS,
} from "./yn-icon-button-styles.js";
import { variantStyleVars, type YnIconButtonVariant } from "./yn-icon-button-variants.js";

export type YnIconButtonShadowOptions = {
  size?: "small" | "medium" | "large";
  variant?: YnIconButtonVariant;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  label?: string;
  href?: string;
  hitSlop?: boolean;
};

function sizeStyleVars(size: NonNullable<YnIconButtonShadowOptions["size"]>) {
  const preset = YN_ICON_BUTTON_SIZE_VARS[size];
  return `--_yn-icon-button-size:${preset.size};--_yn-icon-button-icon-size:${preset.icon};`;
}

function renderControlMarkup(options: YnIconButtonShadowOptions, tag: "button" | "a", attrs: string) {
  const size = options.size ?? "medium";
  const variant = options.variant ?? "default";
  const hitSlop = options.hitSlop !== false;
  const className = `icon-button${hitSlop ? " hit-slop" : ""}`;
  const style = `${sizeStyleVars(size)}${variantStyleVars(variant)}`;
  const inner = `<span class="bg" aria-hidden="true"></span><span class="hover-surface" aria-hidden="true"></span><span class="ripple-surface" aria-hidden="true"></span><span class="icon"><slot></slot></span>`;
  return `<style>${YN_ICON_BUTTON_SHADOW_STYLES}</style><${tag} class="${className}" style="${style}"${attrs}>${inner}</${tag}>`;
}

/** 默认态 yn-icon-button DSD（图标走 default slot） */
export function renderYnIconButtonShadowHtml(options: YnIconButtonShadowOptions = {}): string {
  const label = (options.label ?? "图标按钮").replace(/"/g, "&quot;");
  const disabled = options.disabled;
  const href = options.href?.trim();

  if (href && !disabled) {
    return renderControlMarkup(
      options,
      "a",
      ` href="${href.replace(/"/g, "&quot;")}" aria-label="${label}" title="${label}"`,
    );
  }

  const type = options.type ?? "button";
  const disabledAttr = disabled ? " disabled" : "";
  return renderControlMarkup(
    options,
    "button",
    ` type="${type}" aria-label="${label}" title="${label}"${disabledAttr}`,
  );
}

export { YN_ICON_BUTTON_SHADOW_STYLES };
export { YN_ICON_BUTTON_VARIANTS, type YnIconButtonVariant } from "./yn-icon-button-variants.js";
