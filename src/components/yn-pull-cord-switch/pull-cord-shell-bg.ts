import type { YnPullCordSwitchVariant } from "./yn-pull-cord-switch";

/** 与组件 :host variant 预设一致，供未挂载时回退。 */
const SHELL_GRADIENT_PRESETS: Record<
  YnPullCordSwitchVariant,
  { off: [string, string]; on: [string, string] }
> = {
  default: {
    off: ["#1a1d24", "#12141a"],
    on: ["#2a2830", "#15141a"]
  },
  floema: {
    off: ["#ebe4d4", "#e2dacd"],
    on: ["#f2e8cf", "#e5d6b4"]
  }
};

/** 根据组件上的 `--yn-pull-cord-switch-bg-*` 生成包裹层线性渐变。 */
export function buildPullCordShellBackground(
  lamp: HTMLElement,
  checked = lamp.hasAttribute("checked")
): string {
  const style = getComputedStyle(lamp);
  const top = style
    .getPropertyValue(checked ? "--yn-pull-cord-switch-bg-on-top" : "--yn-pull-cord-switch-bg-top")
    .trim();
  const bottom = style
    .getPropertyValue(
      checked ? "--yn-pull-cord-switch-bg-on-bottom" : "--yn-pull-cord-switch-bg-bottom"
    )
    .trim();
  if (top && bottom) {
    return `linear-gradient(180deg, ${top} 0%, ${bottom} 100%)`;
  }
  const variant = (lamp.getAttribute("variant") ?? "default") as YnPullCordSwitchVariant;
  const preset = SHELL_GRADIENT_PRESETS[variant] ?? SHELL_GRADIENT_PRESETS.default;
  const [fallbackTop, fallbackBottom] = checked ? preset.on : preset.off;
  return `linear-gradient(180deg, ${fallbackTop} 0%, ${fallbackBottom} 100%)`;
}

/** 将渐变背景应用到包裹 `yn-pull-cord-switch` 的外层容器（通常在 change 回调中调用）。 */
export function applyPullCordShellBackground(
  shell: HTMLElement,
  lamp: HTMLElement,
  checked?: boolean
): void {
  shell.style.background = buildPullCordShellBackground(lamp, checked);
}

export function shellBackgroundFromVariant(
  variant: YnPullCordSwitchVariant,
  checked: boolean
): string {
  const preset = SHELL_GRADIENT_PRESETS[variant];
  const [top, bottom] = checked ? preset.on : preset.off;
  return `linear-gradient(180deg, ${top} 0%, ${bottom} 100%)`;
}
