import { ynClose20Svg } from "../../asset/svg/index.js";
import { YN_DRAWER_SHADOW_STYLES } from "./yn-drawer-styles.js";

export type YnDrawerShadowOptions = {
  title?: string;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** 关闭态 yn-drawer DSD（trigger slot + 隐藏 popover 结构） */
export function renderYnDrawerShadowHtml(options: YnDrawerShadowOptions = {}): string {
  const title = escapeHtml(options.title ?? "Drawer");
  const ariaLabel = escapeHtml(options.title ?? "Drawer");

  return `<style>${YN_DRAWER_SHADOW_STYLES}</style><span class="trigger-wrap"><slot name="trigger"></slot></span><div id="drawerPopover" class="drawer-popover" popover="manual"><div class="drawer-surface"><div class="backdrop"></div><div class="backdrop-extra backdrop-extra--empty"><slot name="backdrop-extra"></slot></div><aside class="panel" role="dialog" aria-modal="true" aria-label="${ariaLabel}"><header class="header"><div class="header-main"><slot name="header"><h2 class="title">${title}</h2></slot></div><div class="header-actions"><slot name="header-actions"></slot></div><button class="close-btn" type="button" aria-label="Close drawer">${ynClose20Svg}</button></header><div class="body"><slot name="content"></slot></div><footer class="footer footer--empty"><slot name="footer"></slot></footer></aside></div></div>`;
}

export { YN_DRAWER_SHADOW_STYLES };
