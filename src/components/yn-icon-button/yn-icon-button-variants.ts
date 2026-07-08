export type YnIconButtonHoverMode = "overlay" | "solid";

export type YnIconButtonVariantPreset = {
  bg: string;
  hoverBg: string;
  activeBg: string;
  color: string;
  border: string;
  hoverMode: YnIconButtonHoverMode;
};

export type YnIconButtonVariant =
  | "default"
  | "filled"
  | "primary"
  | "tonal"
  | "outlined"
  | "inverse"
  | "danger"
  | "success";

/** 行业常见 IconButton 配色（Material / iOS / 电商顶栏） */
export const YN_ICON_BUTTON_VARIANTS: Record<YnIconButtonVariant, YnIconButtonVariantPreset> = {
  /** 透明底 + hover 叠层（Header 工具区默认） */
  default: {
    bg: "transparent",
    hoverBg: "var(--yn-color-overlay-hover, rgba(36, 31, 33, 0.08))",
    activeBg: "var(--yn-color-overlay-active, rgba(36, 31, 33, 0.12))",
    color: "var(--yn-color-text, #241f21)",
    border: "transparent",
    hoverMode: "overlay",
  },
  /** 浅灰实心（工具栏 / 卡片内） */
  filled: {
    bg: "var(--yn-icon-button-filled-bg, var(--yn-color-bg-muted, #f3f4f6))",
    hoverBg: "var(--yn-icon-button-filled-hover-bg, var(--yn-color-bg-subtle, #e8eaed))",
    activeBg: "var(--yn-icon-button-filled-active-bg, #dcdfe3)",
    color: "var(--yn-color-text, #241f21)",
    border: "transparent",
    hoverMode: "solid",
  },
  /** 品牌主色实心 */
  primary: {
    bg: "var(--yn-icon-button-primary-bg, var(--yn-color-primary, #f76c46))",
    hoverBg: "var(--yn-icon-button-primary-hover-bg, var(--yn-color-primary-hover, #e45f3e))",
    activeBg: "var(--yn-icon-button-primary-active-bg, #d45632)",
    color: "var(--yn-icon-button-primary-color, var(--yn-color-on-primary, #241f21))",
    border: "transparent",
    hoverMode: "solid",
  },
  /** 主色浅底（Material tonal） */
  tonal: {
    bg: "var(--yn-icon-button-tonal-bg, color-mix(in srgb, var(--yn-color-primary, #f76c46) 14%, transparent))",
    hoverBg:
      "var(--yn-icon-button-tonal-hover-bg, color-mix(in srgb, var(--yn-color-primary, #f76c46) 22%, transparent))",
    activeBg:
      "var(--yn-icon-button-tonal-active-bg, color-mix(in srgb, var(--yn-color-primary, #f76c46) 30%, transparent))",
    color: "var(--yn-color-text, #241f21)",
    border: "transparent",
    hoverMode: "solid",
  },
  /** 描边（表单旁操作） */
  outlined: {
    bg: "transparent",
    hoverBg: "var(--yn-color-overlay-hover, rgba(36, 31, 33, 0.06))",
    activeBg: "var(--yn-color-overlay-active, rgba(36, 31, 33, 0.1))",
    color: "var(--yn-color-text, #241f21)",
    border: "var(--yn-icon-button-outlined-border, var(--yn-color-border, #eceef1))",
    hoverMode: "overlay",
  },
  /** 深色顶栏 / 反色背景 */
  inverse: {
    bg: "transparent",
    hoverBg: "var(--yn-icon-button-inverse-hover-bg, rgba(255, 255, 255, 0.12))",
    activeBg: "var(--yn-icon-button-inverse-active-bg, rgba(255, 255, 255, 0.18))",
    color: "var(--yn-icon-button-inverse-color, var(--yn-color-on-inverse, #ffffff))",
    border: "transparent",
    hoverMode: "overlay",
  },
  /** 危险操作 */
  danger: {
    bg: "transparent",
    hoverBg: "var(--yn-icon-button-danger-hover-bg, rgba(220, 38, 38, 0.1))",
    activeBg: "var(--yn-icon-button-danger-active-bg, rgba(220, 38, 38, 0.16))",
    color: "var(--yn-icon-button-danger-color, #dc2626)",
    border: "transparent",
    hoverMode: "overlay",
  },
  /** 成功 / 确认 */
  success: {
    bg: "transparent",
    hoverBg: "var(--yn-icon-button-success-hover-bg, rgba(22, 163, 74, 0.1))",
    activeBg: "var(--yn-icon-button-success-active-bg, rgba(22, 163, 74, 0.16))",
    color: "var(--yn-icon-button-success-color, #16a34a)",
    border: "transparent",
    hoverMode: "overlay",
  },
};

export function resolveIconButtonVariant(variant?: string): YnIconButtonVariantPreset {
  const key = (variant ?? "default") as YnIconButtonVariant;
  return YN_ICON_BUTTON_VARIANTS[key] ?? YN_ICON_BUTTON_VARIANTS.default;
}

export function variantStyleVars(variant?: string): string {
  const preset = resolveIconButtonVariant(variant);
  return [
    `--_yn-icon-button-bg:${preset.bg}`,
    `--_yn-icon-button-hover-bg:${preset.hoverBg}`,
    `--_yn-icon-button-active-bg:${preset.activeBg}`,
    `--_yn-icon-button-color:${preset.color}`,
    `--_yn-icon-button-border:${preset.border}`,
    `--_yn-icon-button-hover-mode:${preset.hoverMode}`,
  ].join(";");
}
