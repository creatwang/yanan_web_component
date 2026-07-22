import { html } from "lit";
import { renderLitElementShadowHtml } from "../../lib/lit-ssr-shadow.js";
import "./yn-navigation.js";
import {
  YN_NAVIGATION_SEO_FALLBACK_CLASS,
  YN_NAVIGATION_SEO_FALLBACK_LIGHT_STYLES,
} from "./yn-navigation-styles.js";
import { normalizeSeoPath } from "./yn-navigation-geometry.js";

export { YN_NAVIGATION_SEO_FALLBACK_CLASS, YN_NAVIGATION_SEO_FALLBACK_LIGHT_STYLES };

export type YnNavigationShadowItem = {
  label: string;
  href: string;
};

export type YnNavigationShadowOptions = {
  items: YnNavigationShadowItem[];
  activeLabel: string;
  ariaLabel?: string;
  seoMode?: boolean;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Lit SSR 生成 yn-navigation 的 Declarative Shadow Root（含 lit-part，供官方 hydrate）。
 */
export function renderYnNavigationShadowHtml(options: YnNavigationShadowOptions): string {
  const { items, activeLabel, ariaLabel = "Primary navigation", seoMode = true } = options;
  if (!items.length) return "";

  const itemsRecord = Object.fromEntries(items.map((item) => [item.label, item.href]));

  return renderLitElementShadowHtml(html`
    <yn-navigation
      .items=${itemsRecord}
      active=${activeLabel}
      aria-label=${ariaLabel}
      ?seo-mode=${seoMode}
    ></yn-navigation>
  `);
}

/** light DOM SEO 链接层（slot="seo-fallback"），与 DSD/WC 视觉层并存 */
export function renderYnNavigationSeoFallbackHtml(options: YnNavigationShadowOptions): string {
  const { items, activeLabel, ariaLabel = "Primary navigation" } = options;
  if (!items.length) return "";

  const links = items
    .map((item) => {
      const href = escapeHtml(normalizeSeoPath(item.href));
      const label = escapeHtml(item.label);
      const isActive = item.label === activeLabel;
      const current = isActive ? ' aria-current="page"' : "";
      return `<li><a href="${href}"${current}>${label}</a></li>`;
    })
    .join("");

  return `<nav slot="seo-fallback" class="${YN_NAVIGATION_SEO_FALLBACK_CLASS}" aria-label="${escapeHtml(ariaLabel)}"><ul>${links}</ul></nav>`;
}

export { YN_NAVIGATION_SHADOW_STYLES } from "./yn-navigation-styles.js";
