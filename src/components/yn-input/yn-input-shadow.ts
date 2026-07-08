import { YN_INPUT_SHADOW_STYLES } from "./yn-input-styles.js";

export type YnInputShadowOptions = {
  value?: string;
  placeholder?: string;
  disabled?: boolean;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** 默认态 yn-input DSD（无前后置按钮，slot 保留供升级后注入） */
export function renderYnInputShadowHtml(options: YnInputShadowOptions = {}): string {
  const value = escapeHtml(options.value ?? "");
  const placeholder = escapeHtml(options.placeholder ?? "请输入内容");
  const disabled = options.disabled ? " disabled" : "";
  const fieldClass = options.disabled ? "field is-disabled" : "field";

  return `<style>${YN_INPUT_SHADOW_STYLES}</style><div class="${fieldClass}"><slot name="prefix-button" hidden></slot><input class="input" value="${value}" placeholder="${placeholder}"${disabled} /><slot name="suffix-button" hidden></slot></div>`;
}

export { YN_INPUT_SHADOW_STYLES };
