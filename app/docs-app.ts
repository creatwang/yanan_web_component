import { LitElement, html, nothing } from "lit";
import { customElement, state } from "lit/decorators.js";
import { getDocPage } from "./data";
import { DOC_DEMOS } from "./demos";
import { DOC_NAV } from "./nav";
import { getRouteFromHash, navigateTo, subscribeRoute } from "./router";
import type { ComponentDocPage, DocPage, GuideDocPage } from "./types";
import "./ui/code-block";
import "./ui/demo-panel";

const INTRO_FEATURES = [
  { title: "独立站电商", desc: "SKU、地址、购物车、结账链路组件化" },
  { title: "跨境地址", desc: "Google / dr5hn / Photon 多源降级" },
  { title: "Floema 视觉", desc: "暖纸色、圆角、细腻动效" },
  { title: "跨框架", desc: "Web Components，任意技术栈可用" },
  { title: "按需加载", desc: "组件级子路径，Tree Shaking 友好" },
  { title: "Shadow DOM", desc: "样式隔离，CSS 变量定制" }
];

@customElement("yn-docs-app")
export class YnDocsApp extends LitElement {
  @state() private route = getRouteFromHash();
  @state() private activeTocId = "";

  private unsubRoute?: () => void;
  private tocObserver?: IntersectionObserver;

  createRenderRoot() {
    return this;
  }

  connectedCallback() {
    super.connectedCallback();
    document.body.classList.add("docs-body");
    this.unsubRoute = subscribeRoute((route) => {
      this.route = route;
      this.setupTocObserver();
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.body.classList.remove("docs-body");
    this.unsubRoute?.();
    this.tocObserver?.disconnect();
  }

  updated() {
    this.setupTocObserver();
    window.scrollTo({ top: 0 });
  }

  private setupTocObserver() {
    this.tocObserver?.disconnect();
    const headings = this.querySelectorAll<HTMLElement>("[data-toc-id]");
    if (!headings.length) {
      this.activeTocId = "";
      return;
    }

    this.tocObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]?.target instanceof HTMLElement) {
          this.activeTocId = visible[0].target.dataset.tocId ?? "";
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0 }
    );

    headings.forEach((h) => this.tocObserver?.observe(h));
  }

  private renderSidebar() {
    return html`
      <aside class="docs-sidebar">
        <a class="docs-sidebar__brand" href="#/introduction" @click=${(e: Event) => {
          e.preventDefault();
          navigateTo("introduction");
        }}>
          <h1 class="docs-sidebar__title">yn-web-component</h1>
          <p class="docs-sidebar__subtitle">独立站 · Floema 风格</p>
        </a>
        ${DOC_NAV.map(
          (group) => html`
            <div class="docs-nav-group">
              <p class="docs-nav-group__title">${group.title}</p>
              ${group.items.map(
                (item) => html`
                  <a
                    class="docs-nav-link ${this.route === item.id ? "is-active" : ""}"
                    href="#/${item.id}"
                    @click=${(e: Event) => {
                      e.preventDefault();
                      navigateTo(item.id);
                    }}
                  >${item.label}</a>
                `
              )}
            </div>
          `
        )}
      </aside>
    `;
  }

  private renderToc(page: DocPage) {
    const items =
      page.kind === "component"
        ? [
            { id: "preview", title: "Preview" },
            { id: "usage", title: "Usage" },
            { id: "props", title: "属性" },
            ...(page.events.length ? [{ id: "events", title: "事件" }] : []),
            ...(page.slots.length ? [{ id: "slots", title: "插槽" }] : []),
            ...(page.cssVars.length ? [{ id: "css-vars", title: "CSS 变量" }] : []),
            ...(page.methods?.length ? [{ id: "methods", title: "方法" }] : [])
          ]
        : page.sections.map((s) => ({ id: s.id, title: s.title }));

    if (!items.length) return nothing;

    return html`
      <nav class="docs-toc" aria-label="On this page">
        <p class="docs-toc__title">On this page</p>
        ${items.map(
          (item) => html`
            <a
              class="docs-toc__link ${this.activeTocId === item.id ? "is-active" : ""}"
              href="#${item.id}"
            >${item.title}</a>
          `
        )}
      </nav>
    `;
  }

  private renderTable(
    headers: string[],
    rows: Array<Array<string | ReturnType<typeof html>>>
  ) {
    return html`
      <table>
        <thead>
          <tr>${headers.map((h) => html`<th>${h}</th>`)}</tr>
        </thead>
        <tbody>
          ${rows.map(
            (row) => html`<tr>${row.map((cell) => html`<td>${cell}</td>`)}</tr>`
          )}
        </tbody>
      </table>
    `;
  }

  private renderComponentPage(page: ComponentDocPage) {
    const demo = DOC_DEMOS[page.demoId];
    const demoAlign =
      page.id === "yn-checkout-address" || page.id === "yn-sku-selector"
        ? "column"
        : page.id === "yn-navigation" || page.id === "yn-group-pick"
          ? "left"
          : "center";

    return html`
      <article class="prose">
        <h1>${page.title}</h1>
        <p class="lead">${page.description}</p>
        <p>
          标签 <code>${page.tag}</code> · 类名 <code>${page.className}</code>
        </p>

        <h2 id="preview" data-toc-id="preview">Preview</h2>
        <yn-docs-demo
          .renderDemo=${demo}
          align=${demoAlign}
          label="Live Preview"
        ></yn-docs-demo>

        <h2 id="usage" data-toc-id="usage">Usage</h2>
        <p>按需导入：</p>
        <yn-docs-code
          lang="ts"
          .code=${`import { ${page.className} } from "${page.importPath}";`}
        ></yn-docs-code>
        <p>模板示例：</p>
        <yn-docs-code lang="html" .code=${page.usageCode}></yn-docs-code>

        <h2 id="props" data-toc-id="props">属性</h2>
        ${page.props.length
          ? this.renderTable(
              ["属性", "类型", "默认值", "说明"],
              page.props.map((p) => [
                html`<span class="api-name">${p.name}</span>`,
                p.type,
                p.default,
                p.desc
              ])
            )
          : html`<p>无公开属性。</p>`}

        ${page.events.length
          ? html`
              <h2 id="events" data-toc-id="events">事件</h2>
              ${this.renderTable(
                ["事件", "detail", "说明"],
                page.events.map((e) => [
                  html`<span class="api-name">${e.name}</span>`,
                  e.detail,
                  e.desc
                ])
              )}
            `
          : nothing}

        ${page.slots.length
          ? html`
              <h2 id="slots" data-toc-id="slots">插槽</h2>
              ${this.renderTable(
                ["插槽", "说明", "优先级"],
                page.slots.map((s) => [
                  html`<span class="api-name">${s.name}</span>`,
                  s.desc,
                  s.priority ?? "—"
                ])
              )}
            `
          : nothing}

        ${page.cssVars.length
          ? html`
              <h2 id="css-vars" data-toc-id="css-vars">CSS 变量</h2>
              <blockquote>
                组件使用 Shadow DOM，外部样式默认不穿透。请通过公开 CSS 变量在宿主元素上定制。
              </blockquote>
              ${this.renderTable(
                ["变量", "默认值", "说明"],
                page.cssVars.map((v) => [
                  html`<span class="api-name">${v.name}</span>`,
                  v.default ?? "—",
                  v.desc
                ])
              )}
            `
          : nothing}

        ${page.methods?.length
          ? html`
              <h2 id="methods" data-toc-id="methods">公开方法</h2>
              ${this.renderTable(
                ["方法", "签名", "说明"],
                page.methods.map((m) => [
                  html`<span class="api-name">${m.name}</span>`,
                  m.signature,
                  m.desc
                ])
              )}
            `
          : nothing}

        ${page.notes?.length
          ? html`
              <h2 data-toc-id="notes">说明</h2>
              <ul>
                ${page.notes.map((n) => html`<li>${n}</li>`)}
              </ul>
            `
          : nothing}
      </article>
    `;
  }

  private renderGuidePage(page: GuideDocPage) {
    return html`
      <article class="prose">
        <h1>${page.title}</h1>
        <p class="lead">${page.description}</p>

        ${page.id === "introduction"
          ? html`
              <div class="docs-cards">
                ${INTRO_FEATURES.map(
                  (f) => html`
                    <div class="docs-card">
                      <h4>${f.title}</h4>
                      <p>${f.desc}</p>
                    </div>
                  `
                )}
              </div>
            `
          : nothing}

        ${page.sections.map((section) => html`
          <h2 id=${section.id} data-toc-id=${section.id}>${section.title}</h2>
          ${section.id === "features" && page.id === "introduction"
            ? html`
                <ul>
                  <li><strong>为电商而生</strong> — 覆盖浏览、选购、加购、结账核心链路</li>
                  <li><strong>跨境开箱即用</strong> — 地址多数据源自动降级</li>
                  <li><strong>品牌可定制</strong> — <code>variant</code> 语义层 + <code>--yn-*</code> 视觉层</li>
                  <li><strong>跨框架复用</strong> — React / Vue / Angular / 原生均可</li>
                  <li><strong>工程化完备</strong> — Storybook + 测试 + 按需导出</li>
                </ul>
              `
            : section.body
              ? html`<p>${section.body}</p>`
              : nothing}
          ${section.code
            ? html`<yn-docs-code lang=${section.lang ?? "ts"} .code=${section.code}></yn-docs-code>`
            : nothing}
        `)}
      </article>
    `;
  }

  render() {
    const page = getDocPage(this.route);

    return html`
      <div class="docs-app">
        ${this.renderSidebar()}
        <div class="docs-main-wrap">
          <header class="docs-header">
            <span class="docs-header__path">
              Docs / <strong>${page?.title ?? "未找到"}</strong>
            </span>
            <div class="docs-header__links">
              <a href="http://localhost:6006" target="_blank" rel="noopener noreferrer" title="需先运行 pnpm storybook">Storybook</a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
              >GitHub</a>
            </div>
          </header>
          <div class="docs-body-grid">
            <main class="docs-content">
              ${page
                ? page.kind === "component"
                  ? this.renderComponentPage(page)
                  : this.renderGuidePage(page)
                : html`
                    <article class="prose">
                      <h1>页面未找到</h1>
                      <p>请从左侧导航选择文档页面。</p>
                    </article>
                  `}
            </main>
            ${page ? this.renderToc(page) : nothing}
          </div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "yn-docs-app": YnDocsApp;
  }
}
