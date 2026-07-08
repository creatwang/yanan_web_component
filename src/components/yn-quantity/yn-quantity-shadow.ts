import {
  YN_QUANTITY_MINUS_ICON,
  YN_QUANTITY_PLUS_ICON,
  YN_QUANTITY_SHADOW_STYLES,
} from "./yn-quantity-styles.js";

export type YnQuantityShadowOptions = {
  value?: number;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/** 默认态 yn-quantity DSD（与 Lit 首帧结构一致） */
export function renderYnQuantityShadowHtml(options: YnQuantityShadowOptions = {}): string {
  const min = options.min ?? 1;
  const max = options.max ?? 99;
  const step = options.step ?? 1;
  const value = clamp(options.value ?? 1, min, max);
  const disabled = options.disabled;
  const atMin = value <= min;
  const atMax = value >= max;
  const stepperClass = disabled ? "stepper is-disabled" : "stepper";
  const minusDisabled = disabled || atMin ? " disabled" : "";
  const plusDisabled = disabled || atMax ? " disabled" : "";
  const inputDisabled = disabled ? " disabled" : "";

  return `<style>${YN_QUANTITY_SHADOW_STYLES}</style><div class="${stepperClass}" role="group" aria-label="数量"><button type="button" class="btn btn-decrease" aria-label="减少数量"${minusDisabled}>${YN_QUANTITY_MINUS_ICON}</button><div class="value-wrap"><input class="value" type="number" value="${value}" min="${min}" max="${max}" step="${step}" inputmode="numeric" aria-label="数量"${inputDisabled} /></div><button type="button" class="btn btn-increase" aria-label="增加数量"${plusDisabled}>${YN_QUANTITY_PLUS_ICON}</button></div>`;
}

export { YN_QUANTITY_SHADOW_STYLES, YN_QUANTITY_MINUS_ICON, YN_QUANTITY_PLUS_ICON };
