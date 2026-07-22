/**
 * 用 @lit-labs/ssr 渲染 LitElement，并抽出 Declarative Shadow Root 内部 HTML（含 lit-part 标记）。
 * 仅用于 Node / Astro SSR 路径，勿打进浏览器包。
 * @see https://lit.dev/docs/ssr/server-usage/
 */
import "@lit-labs/ssr";
import { render } from "@lit-labs/ssr";
import { collectResultSync } from "@lit-labs/ssr/lib/render-result.js";
import type { TemplateResult } from "lit";

/**
 * ssr-dom-shim 未实现 getRootNode；嵌套 LitElement 绑定事件时会调用它。
 * 通过 litServerRoot 拿到 shim HTMLElement 原型并补齐（返回 null → SSR 回退 eventTarget）。
 */
const litServerRoot = (globalThis as { litServerRoot?: object }).litServerRoot;
const ssrHtmlElementProto = litServerRoot
  ? (Object.getPrototypeOf(litServerRoot) as { getRootNode?: () => unknown })
  : undefined;
if (ssrHtmlElementProto && typeof ssrHtmlElementProto.getRootNode !== "function") {
  ssrHtmlElementProto.getRootNode = () => null;
}

const SHADOW_TEMPLATE_RE =
  /<template\b[^>]*\bshadowroot(?:mode)?\s*=\s*["']open["'][^>]*>([\s\S]*?)<\/template>/i;

export function extractOpenShadowContent(ssrElementHtml: string): string {
  const matched = ssrElementHtml.match(SHADOW_TEMPLATE_RE);
  if (!matched?.[1]) {
    throw new Error(
      "[yn-web-component] Lit SSR output missing open Declarative Shadow Root template",
    );
  }
  return matched[1];
}

/** 渲染含单个自定义元素的 TemplateResult，返回其 DSD 内部 HTML */
export function renderLitElementShadowHtml(template: TemplateResult): string {
  const html = collectResultSync(render(template));
  return extractOpenShadowContent(html);
}
