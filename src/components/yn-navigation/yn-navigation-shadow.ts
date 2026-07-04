import {
  NAV_GEOMETRY,
  buildActiveSeamProgress,
  computeNavigationShape,
  normalizeSeoPath,
} from "./yn-navigation-geometry.js";
import {
  YN_NAVIGATION_SHADOW_STYLES,
  YN_NAVIGATION_SEO_FALLBACK_CLASS,
  YN_NAVIGATION_SEO_FALLBACK_LIGHT_STYLES,
} from "./yn-navigation-styles.js";

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
 * 生成 Declarative Shadow DOM 内容。
 * Astro / SSR 框架嵌入 `<template shadowrootmode="open" set:html={...} />` 即可首屏展示完整导航。
 */
export function renderYnNavigationShadowHtml(options: YnNavigationShadowOptions): string {
  const { items, activeLabel, ariaLabel = "Primary navigation", seoMode = true } = options;
  if (!items.length) return "";

  const labels = items.map((item) => item.label);
  const activeIndex = labels.findIndex((label) => label === activeLabel);
  const seamProgress = buildActiveSeamProgress(labels.length, activeIndex);
  const { layout, bridgeD, rectDs } = computeNavigationShape(labels, undefined, seamProgress);
  const { VIEWBOX_HEIGHT } = NAV_GEOMETRY;

  const rectPaths = rectDs
    .map((d, index) => `<path data-meta-row-rect="${index}" d="${d}"></path>`)
    .join("");

  const rectClips = rectDs
    .map((d, index) => `<path data-meta-row-rect-clip="${index}" d="${d}"></path>`)
    .join("");

  const tabs = items
    .map((item, index) => {
      const left = layout.starts[index];
      const width = layout.ends[index] - layout.starts[index];
      const href = escapeHtml(normalizeSeoPath(item.href));
      const label = escapeHtml(item.label);
      const isActive = index === activeIndex;
      if (seoMode) {
        return `<li class="tab-item"><a class="tab" href="${href}" aria-current="${isActive ? "page" : "false"}" tabindex="0" style="left:${left}px;width:${width}px"><span>${label}</span></a></li>`;
      }
      return `<li class="tab-item"><button class="tab" type="button" role="tab" aria-selected="${isActive ? "true" : "false"}" tabindex="${isActive ? "0" : "-1"}" style="left:${left}px;width:${width}px"><span>${label}</span></button></li>`;
    })
    .join("");

  const navStyle = `width:${layout.totalWidth}px;height:${VIEWBOX_HEIGHT}px`;

  return `<style>${YN_NAVIGATION_SHADOW_STYLES}</style><slot name="seo-fallback"></slot><nav class="nav" aria-label="${escapeHtml(ariaLabel)}" style="${navStyle}"><svg class="shape" viewBox="0 0 ${layout.totalWidth} ${VIEWBOX_HEIGHT}" data-meta-row-shape><path data-meta-row-shape-bridges d="${bridgeD}"></path>${rectPaths}<defs><radialGradient id="metaGlow" cx="50%" cy="50%" r="50%"><stop offset="20%" stop-color="var(--yn-navigation-glow-color, #e9e77847)"></stop><stop offset="100%" stop-color="var(--yn-navigation-glow-fade, #e9e77800)"></stop></radialGradient><clipPath id="metaClip" clipPathUnits="userSpaceOnUse"><path data-meta-row-shape-bridges-clip d="${bridgeD}"></path>${rectClips}</clipPath></defs><g clip-path="url(#metaClip)"><ellipse id="glow" cx="0" cy="0" rx="0" ry="0" fill="url(#metaGlow)" style="mix-blend-mode:difference;"></ellipse></g></svg><ul class="tabs" role="${seoMode ? "list" : "tablist"}">${tabs}</ul></nav>`;
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
