/**
 * Lit 官方 hydrate 补丁入口。
 * 必须在任何 `lit` / LitElement 导入之前执行（同模块内写在首行 import）。
 * @see https://lit.dev/docs/ssr/client-usage/
 */
import "@lit-labs/ssr-client/lit-element-hydrate-support.js";
