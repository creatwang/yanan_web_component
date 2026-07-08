import { YN_INPUT_SHADOW_STYLES } from "./yn-input-styles.js";

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
  revealLabel?: string;
  concealLabel?: string;
  inputId?: string;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderPasswordToggle(revealLabel: string) {
  return `<button class="password-toggle" type="button" aria-label="${escapeHtml(revealLabel)}"><span class="password-toggle__label">${escapeHtml(revealLabel)}</span><svg class="password-toggle__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M2 12s4.48-7 10-7 10 7 10 7-4.48 7-10 7S2 12 2 12Z"></path><circle cx="12" cy="12" r="3"></circle></svg></button>`;
}

function renderFloatingField(options: YnInputShadowOptions): string {
  const value = escapeHtml(options.value ?? "");
  const label = escapeHtml(options.label ?? "");
  const type = escapeHtml(options.type ?? "text");
  const name = options.name ? ` name="${escapeHtml(options.name)}"` : "";
  const required = options.required ? " required" : "";
  const disabled = options.disabled ? " disabled" : "";
  const autocomplete = options.autocomplete ? ` autocomplete="${escapeHtml(options.autocomplete)}"` : "";
  const inputId = escapeHtml(options.inputId ?? "yn-input-ssr");
  const revealLabel = options.revealLabel ?? "Show";
  const errorMessage = escapeHtml(options.errorMessage ?? "");
  const hasValue = value.length > 0;
  const isPassword = type === "password";

  const fieldClass = [
    "field",
    "field--floating",
    options.disabled ? "is-disabled" : "",
    hasValue ? "is-active" : "",
    options.error ? "is-error" : "",
    isPassword ? "has-password-toggle" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const passwordToggle = isPassword ? renderPasswordToggle(revealLabel) : "";
  const errorHidden = !options.error || !errorMessage ? " hidden" : "";

  return `<div class="field-wrap field-wrap--floating"><div class="${fieldClass}"><label class="float-label" for="${inputId}">${label}</label><input id="${inputId}" class="input" value="${value}" type="${type}"${name}${required}${disabled}${autocomplete} />${passwordToggle}</div><p class="field-error"${errorHidden}>${errorMessage}</p></div>`;
}

/** 默认态 yn-input DSD（无前后置按钮，slot 保留供升级后注入） */
export function renderYnInputShadowHtml(options: YnInputShadowOptions = {}): string {
  if (options.variant === "floating") {
    return `<style>${YN_INPUT_SHADOW_STYLES}</style>${renderFloatingField(options)}`;
  }

  const value = escapeHtml(options.value ?? "");
  const placeholder = escapeHtml(options.placeholder ?? "请输入内容");
  const disabled = options.disabled ? " disabled" : "";
  const fieldClass = options.disabled ? "field is-disabled" : "field";

  return `<style>${YN_INPUT_SHADOW_STYLES}</style><div class="${fieldClass}"><slot name="prefix-button" hidden></slot><input class="input" value="${value}" placeholder="${placeholder}"${disabled} /><slot name="suffix-button" hidden></slot></div>`;
}

export { YN_INPUT_SHADOW_STYLES };
