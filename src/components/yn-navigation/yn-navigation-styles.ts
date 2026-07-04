/** Shadow DOM 样式 — Lit 组件与 DSD SSR 共用，避免重复维护 */
export const YN_NAVIGATION_SHADOW_STYLES = `
:host {
  display: inline-block;
  --yn-navigation-fill-color: var(--yn-color-bg-elevated, #ffffff);
  --yn-navigation-text-color: var(--yn-color-text, #241f21);
  --yn-navigation-active-text-color: var(--yn-color-text, #241f21);
  --yn-navigation-indicator-color: var(--yn-color-text, #241f21);
  --yn-navigation-focus-color: var(--yn-color-focus-outline, #82b7ff);
  --yn-navigation-glow-color: var(--yn-color-nav-glow, #e9e77847);
  --yn-navigation-glow-fade: var(--yn-color-nav-glow-fade, #e9e77800);
}
.nav {
  position: relative;
  user-select: none;
}
.shape {
  width: 100%;
  height: 100%;
  display: block;
  overflow: visible;
}
[data-meta-row-shape] [data-meta-row-shape-bridges],
[data-meta-row-shape] [data-meta-row-rect] {
  fill: var(--yn-navigation-fill-color, #ffffff);
}
.tabs {
  position: absolute;
  inset: 0;
  margin: 0;
  padding: 0;
  list-style: none;
}
.tab-item {
  display: contents;
}
.tab {
  position: absolute;
  top: 0;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--yn-navigation-text-color, #241f21);
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  white-space: nowrap;
  cursor: pointer;
  line-height: 1;
  text-decoration: none;
  appearance: none;
  -webkit-appearance: none;
}
.tab.hit-slope::before {
  content: "";
  position: absolute;
  top: -20px;
  left: -20px;
  width: calc(100% + 40px);
  height: calc(100% + 40px);
}
.tab > span {
  position: relative;
  display: inline-block;
}
.tab[aria-selected="true"],
.tab[aria-current="page"] {
  color: var(--yn-navigation-active-text-color, #241f21);
}
.tab[aria-selected="true"]::after,
.tab[aria-current="page"]::after {
  content: "";
  position: absolute;
  left: 50%;
  bottom: 5px;
  width: 4px;
  height: 4px;
  margin-left: -2px;
  border-radius: 50%;
  background: var(--yn-navigation-indicator-color, #241f21);
}
.tab:focus-visible {
  outline: 2px solid var(--yn-navigation-focus-color, #82b7ff);
  outline-offset: 2px;
  border-radius: 12px;
}
slot[name="seo-fallback"] {
  display: block;
}
`.trim();

/** light DOM SEO 层建议 class（由页面全局 CSS 做视觉隐藏，链接仍在 DOM 树中） */
export const YN_NAVIGATION_SEO_FALLBACK_CLASS = "yn-navigation-seo-fallback";

export const YN_NAVIGATION_SEO_FALLBACK_LIGHT_STYLES = `
.${YN_NAVIGATION_SEO_FALLBACK_CLASS} {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
.${YN_NAVIGATION_SEO_FALLBACK_CLASS} ul {
  list-style: none;
  margin: 0;
  padding: 0;
}
`.trim();
