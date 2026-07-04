export type YnButtonShadowOptions = {
  variant?: "primary" | "success" | "warning" | "danger" | "neutral" | "dark" | "default";
  size?: "mini" | "small" | "medium";
  disabled?: boolean;
  loading?: boolean;
  hitSlop?: boolean;
};

type VariantColors = { bg: string; hoverBg: string; color: string; disabledBg: string; disabledColor: string };

const VARIANT_COLORS: Record<NonNullable<YnButtonShadowOptions["variant"]>, VariantColors> = {
  success: {
    bg: "var(--yn-button-success-bg, #C6AF88)",
    hoverBg: "var(--yn-button-success-hover-bg, #B9A079)",
    color: "var(--yn-button-success-color, var(--yn-color-text, #241f21))",
    disabledBg: "var(--yn-button-success-disabled-bg, #DDD2C1)",
    disabledColor: "var(--yn-button-success-disabled-color, #625949)",
  },
  warning: {
    bg: "var(--yn-button-warning-bg, #85A1C5)",
    hoverBg: "var(--yn-button-warning-hover-bg, #7593B9)",
    color: "var(--yn-button-warning-color, var(--yn-color-text, #241f21))",
    disabledBg: "var(--yn-button-warning-disabled-bg, #C9D5E4)",
    disabledColor: "var(--yn-button-warning-disabled-color, #4D5F78)",
  },
  danger: {
    bg: "var(--yn-button-danger-bg, #BACFA3)",
    hoverBg: "var(--yn-button-danger-hover-bg, #A9BE91)",
    color: "var(--yn-button-danger-color, var(--yn-color-text, #241f21))",
    disabledBg: "var(--yn-button-danger-disabled-bg, #D4E2C8)",
    disabledColor: "var(--yn-button-danger-disabled-color, #53654A)",
  },
  neutral: {
    bg: "var(--yn-button-neutral-bg, #D2CDC4)",
    hoverBg: "var(--yn-button-neutral-hover-bg, #C1BCB3)",
    color: "var(--yn-button-neutral-color, var(--yn-color-text, #241f21))",
    disabledBg: "var(--yn-button-neutral-disabled-bg, #E4E0D9)",
    disabledColor: "var(--yn-button-neutral-disabled-color, #67625A)",
  },
  dark: {
    bg: "var(--yn-button-dark-bg, var(--yn-color-inverse-bg, #241f21))",
    hoverBg: "var(--yn-button-dark-hover-bg, var(--yn-color-inverse-bg-hover, rgba(36, 31, 33, 0.8)))",
    color: "var(--yn-button-dark-color, var(--yn-color-on-inverse, #ffffff))",
    disabledBg: "var(--yn-button-dark-disabled-bg, var(--yn-color-inverse-bg-hover, rgba(36, 31, 33, 0.45)))",
    disabledColor: "var(--yn-button-dark-disabled-color, var(--yn-color-on-inverse, rgba(255, 255, 255, 0.85)))",
  },
  default: {
    bg: "var(--yn-button-default-bg, var(--yn-color-bg-elevated, #ffffff))",
    hoverBg: "var(--yn-button-default-hover-bg, var(--yn-color-bg-muted, #f3f4f6))",
    color: "var(--yn-button-default-color, var(--yn-color-text, #241f21))",
    disabledBg: "var(--yn-button-default-disabled-bg, var(--yn-color-disabled-bg, #f1f1f1))",
    disabledColor: "var(--yn-button-default-disabled-color, var(--yn-color-disabled-text, #8a8a8a))",
  },
  primary: {
    bg: "var(--yn-button-primary-bg, var(--yn-color-primary, #f76c46))",
    hoverBg: "var(--yn-button-primary-hover-bg, var(--yn-color-primary-hover, #e45f3e))",
    color: "var(--yn-button-primary-color, var(--yn-color-text, #241f21))",
    disabledBg: "var(--yn-button-primary-disabled-bg, #F3C1B4)",
    disabledColor: "var(--yn-button-primary-disabled-color, #7A4A40)",
  },
};

const SIZE_PADDING: Record<NonNullable<YnButtonShadowOptions["size"]>, string> = {
  mini: "3px 10px",
  small: "8px 16px",
  medium: "12px 16px",
};

const SIZE_MIN_HEIGHT: Record<NonNullable<YnButtonShadowOptions["size"]>, string> = {
  mini: "23px",
  small: "33px",
  medium: "41px",
};

const SIZE_LOADING: Record<NonNullable<YnButtonShadowOptions["size"]>, string> = {
  mini: "14px",
  small: "16px",
  medium: "18px",
};

/** 从 yn-button.ts static styles 提取，供 DSD SSR 与 Lit 共用 */
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

function styleVars(options: YnButtonShadowOptions): string {
  const variant = options.variant ?? "primary";
  const size = options.size ?? "medium";
  const colors = VARIANT_COLORS[variant];
  return [
    `--_yn-button-bg:${colors.bg}`,
    `--_yn-button-hover-bg:${colors.hoverBg}`,
    `--_yn-button-color:${colors.color}`,
    `--_yn-button-padding:${SIZE_PADDING[size]}`,
    `--_yn-button-min-height:${SIZE_MIN_HEIGHT[size]}`,
    `--_yn-button-loading-size:${SIZE_LOADING[size]}`,
    `--_yn-button-disabled-bg:${colors.disabledBg}`,
    `--_yn-button-disabled-color:${colors.disabledColor}`,
  ].join(";");
}

/** 关闭态 yn-button DSD（label 走 default slot） */
export function renderYnButtonShadowHtml(options: YnButtonShadowOptions = {}): string {
  const hitSlop = options.hitSlop !== false ? " hit-slop" : "";
  const disabled = options.disabled || options.loading ? " disabled" : "";
  const ariaBusy = options.loading ? ' aria-busy="true"' : "";
  const vars = styleVars(options);
  return `<style>${YN_BUTTON_SHADOW_STYLES}</style><button class="button${hitSlop}" style="${vars}" type="button"${disabled}${ariaBusy}><span class="bg" aria-hidden="true"></span><span class="content"><span class="label"><slot></slot></span></span></button><span class="slot-probe" hidden><slot name="prefix-icon"></slot></span><span class="slot-probe" hidden><slot name="suffix-icon"></slot></span>`;
}
