import {
  ynDropdownPickChevronUpSvg,
  ynSearchCloseSvg,
  ynSearchSvg,
  ynClose20Svg,
} from "../../asset/svg/index.js";
import { YN_SEARCH_SHADOW_STYLES } from "./yn-search-styles.js";

export type YnSearchShadowOptions = {
  placeholder?: string;
  inputWidth?: number;
  disabled?: boolean;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** 收起态 yn-search DSD（与 Lit 首帧一致） */
export function renderYnSearchShadowHtml(options: YnSearchShadowOptions = {}): string {
  const placeholder = escapeHtml(options.placeholder ?? "");
  const inputWidth = Math.max(80, options.inputWidth ?? 514);
  const dynamicWidth = 10 + inputWidth;
  const disabled = options.disabled ? " disabled" : "";

  return `<style>${YN_SEARCH_SHADOW_STYLES}</style><div id="searchShell" class="search-shell" style="width:44px;"><svg id="leftShape" class="left-shape" viewBox="0 0 44 38" data-meta-row-shape><path d="M0 12.920000000000002 A12.920000000000002 12.920000000000002 0 0 1 12.920000000000002 0 L31.08 0 A12.920000000000002 12.920000000000002 0 0 1 44 12.920000000000002 L44 25.08 A12.920000000000002 12.920000000000002 0 0 1 31.08 38 L12.920000000000002 38 A12.920000000000002 12.920000000000002 0 0 1 0 25.08 Z"></path></svg><div id="dynamicWrap" class="dynamic-wrap" style="width:${dynamicWidth}px;"><svg id="shape" class="shape" viewBox="44 0 ${dynamicWidth} 38" style="width:${dynamicWidth}px;" data-meta-row-shape><path id="bridge" data-meta-row-shape-bridges d=""></path><path id="rect1" data-meta-row-rect="1" d=""></path></svg><div class="search-input" style="width:${inputWidth}px;"><div class="inner"><input id="searchInput" class="field" value="" list="internalDatalist" placeholder="${placeholder}"${disabled} /></div></div></div><button id="toggleBtn" class="toggle-btn" type="button" aria-label="open search"${disabled}>${ynSearchSvg}${ynSearchCloseSvg}</button><slot id="datalistSlot" class="datalist-slot"></slot><datalist id="internalDatalist"></datalist></div>`;
}

export { YN_SEARCH_SHADOW_STYLES };
