import { LitElement, html, nothing } from "lit";
import { customElement, state } from "lit/decorators.js";
import { getDocPage, getBundleTableRows } from "./data";
import { getDemoRenderer } from "./demos";
import { getLocale, setLocale, type Locale } from "./i18n/locale";
import { NAV, ui } from "./i18n/messages";
import { applyDocumentSeo } from "./seo";
import { docHref, getRouteFromLocation, navigateTo, subscribeRoute } from "./router";
import type { GuideDocPage } from "./types";
import type { ResolvedComponentPage } from "./data/resolve";
import { BUNDLE_META } from "./data/bundle-sizes";
import "./ui/code-block";
import "./ui/demo-panel";

const INTRO_FEATURES = [
  { title: { "zh-CN": "独立站电商", en: "DTC commerce" }, desc: { "zh-CN": "SKU、地址、购物车、结账", en: "SKU, address, cart, checkout" } },
  { title: { "zh-CN": "跨境地址", en: "Cross-border" }, desc: { "zh-CN": "Google / dr5hn / Photon 降级", en: "Multi-provider fallback" } },
  { title: { "zh-CN": "Floema 视觉", en: "Floema look" }, desc: { "zh-CN": "暖纸色、圆角、细腻动效", en: "Warm paper, radius, motion" } },
  { title: { "zh-CN": "跨框架", en: "Framework-free" }, desc: { "zh-CN": "Web Components 标准", en: "Standards-based WC" } },
  { title: { "zh-CN": "按需加载", en: "Tree-shaking" }, desc: { "zh-CN": "组件级子路径", en: "Per-component imports" } },
  { title: { "zh-CN": "Shadow DOM", en: "Shadow DOM" }, desc: { "zh-CN": "CSS 变量定制", en: "`--yn-*` theming" } }
] as const;

type DocsThemeMode = "light" | "dark";

const getStoredTheme = (): DocsThemeMode => {
  const stored = window.localStorage.getItem("yn-docs-theme");
  return stored === "dark" ? "dark" : "light";
};

@customElement("yn-docs-app")
export class YnDocsApp extends LitElement {
  @state() private route = getRouteFromLocation();
  @state() private locale: Locale = getLocale();
  @state() private activeTocId = "";
  @state() private theme: DocsThemeMode = getStoredTheme();
  @state() private themeCordDocked = false;

  private unsubRoute?: () => void;
  private tocObserver?: IntersectionObserver;
  private onExternalThemeChange = (event: Event) => {
    const theme = (event as CustomEvent<{ theme?: DocsThemeMode }>).detail?.theme;
    if (theme === "light" || theme === "dark") {
      this.theme = theme;
    }
  };
  private onScroll = () => {
    const scrollTop =
      window.scrollY ||
      window.pageYOffset ||
      document.documentElement.scrollTop ||
      document.body.scrollTop ||
      0;
    const docked = scrollTop > 72;
    if (docked !== this.themeCordDocked) {
      this.themeCordDocked = docked;
    }
  };

  createRenderRoot() {
    return this;
  }

  connectedCallback() {
    super.connectedCallback();
    document.body.classList.add("docs-body");
    this.applyDocsTheme(this.theme, false);
    window.addEventListener("yn-docs-theme-change", this.onExternalThemeChange);
    window.addEventListener("scroll", this.onScroll, { passive: true });
    document.addEventListener("scroll", this.onScroll, { passive: true, capture: true });
    document.body.addEventListener("scroll", this.onScroll, { passive: true });
    this.onScroll();
    this.unsubRoute = subscribeRoute((route) => {
      if (route !== this.route) {
        window.scrollTo({ top: 0, behavior: "auto" });
        this.themeCordDocked = false;
      }
      this.route = route;
      applyDocumentSeo(route, this.locale);
      requestAnimationFrame(() => this.setupTocObserver());
    });
    applyDocumentSeo(this.route, this.locale);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.body.classList.remove("docs-body");
    window.removeEventListener("yn-docs-theme-change", this.onExternalThemeChange);
    window.removeEventListener("scroll", this.onScroll);
    document.removeEventListener("scroll", this.onScroll, { capture: true });
    document.body.removeEventListener("scroll", this.onScroll);
    this.unsubRoute?.();
    this.tocObserver?.disconnect();
  }

  private applyDocsTheme(theme: DocsThemeMode, notify = true) {
    this.theme = theme;
    document.documentElement.setAttribute("data-yn-theme", theme);
    window.localStorage.setItem("yn-docs-theme", theme);
    if (notify) {
      window.dispatchEvent(new CustomEvent("yn-docs-theme-change", { detail: { theme } }));
    }
  }

  private switchLocale(locale: Locale) {
    setLocale(locale);
    this.locale = locale;
    applyDocumentSeo(this.route, locale);
    window.dispatchEvent(new CustomEvent("yn-docs-locale-change", { detail: { locale } }));
    requestAnimationFrame(() => this.setupTocObserver());
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
          const id = visible[0].target.dataset.tocId ?? "";
          if (id !== this.activeTocId) this.activeTocId = id;
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0 }
    );

    headings.forEach((h) => this.tocObserver?.observe(h));
  }

  private t(key: Parameters<typeof ui>[0]) {
    return ui(key, this.locale);
  }

  private renderLangSwitch() {
    return html`
      <yn-dropdown-pick
        class="docs-lang-pick"
        .value=${this.locale}
        value-field="id"
        button-display-field="code"
        placeholder="Language"
        button-bg="rgba(255,255,255,0.56)"
        button-color="var(--yn-color-text)"
        open-button-bg="var(--yn-color-text)"
        open-button-color="var(--yn-color-bg)"
        panel-min-width="132px"
        ?show-selected-icon=${true}
        style="--yn-dropdown-pick-panel-bg:var(--yn-color-bg);--yn-dropdown-pick-panel-radius:12px;--yn-dropdown-pick-panel-padding:6px;--yn-dropdown-pick-gap:6px;"
        @change=${(event: CustomEvent<{ id: Locale | "" }>) => {
          if (event.detail.id === "zh-CN" || event.detail.id === "en") {
            this.switchLocale(event.detail.id);
          }
        }}
      >
        <yn-pick value="zh-CN" data-node=${JSON.stringify({ id: "zh-CN", label: "简体中文", code: "中文" })}>
          <div class="docs-lang-pick__item">简体中文</div>
        </yn-pick>
        <yn-pick value="en" data-node=${JSON.stringify({ id: "en", label: "English", code: "EN" })}>
          <div class="docs-lang-pick__item">English</div>
        </yn-pick>
      </yn-dropdown-pick>
    `;
  }

  private renderHeaderThemeSwitch() {
    const checked = this.theme === "light";

    return html`
      <yn-button
        class="docs-header-theme-trigger"
        variant="default"
        size="mini"
        aria-label=${this.t("themeToggle")}
        @click=${() => this.applyDocsTheme(checked ? "dark" : "light")}
      >
        ${checked ? this.t("themeLight") : this.t("themeDark")}
      </yn-button>
    `;
  }

  private renderFixedThemeCord() {
    const checked = this.theme === "dark";
    const top = this.themeCordDocked ? -32 : 52;

    return html`
      <yn-pull-cord-switch
        class="docs-fixed-theme-cord"
        .checked=${checked}
        fixed
        reverse
        .fixedX=${-24}
        .top=${top}
        .zIndex=${10}
        glow-up
        variant="default"
        size="mini"
        rope-length="220"
        ?hit-slop=${false}
        @change=${(event: CustomEvent<{ checked: boolean }>) => {
          this.applyDocsTheme(event.detail.checked ? "dark" : "light");
        }}
      >
        <yn-button size="mini" variant="default" ?hit-slop=${false}>${this.t("themeLight")}</yn-button>
        <yn-button slot="activated" size="mini" variant="success" ?hit-slop=${false}>${this.t("themeDark")}</yn-button>
      </yn-pull-cord-switch>
    `;
  }

  private renderSidebar() {
    const loc = this.locale;
    return html`
      <aside class="docs-sidebar">
        <a
          class="docs-sidebar__brand"
          href=${docHref("introduction")}
          @click=${(e: Event) => {
            e.preventDefault();
            navigateTo("introduction");
          }}
        >
          <h1 class="docs-sidebar__title">yn-web-component</h1>
          <p class="docs-sidebar__subtitle">${this.t("brandSubtitle")}</p>
        </a>
        ${NAV.map(
          (group) => html`
            <div class="docs-nav-group">
              <p class="docs-nav-group__title">${group.title[loc]}</p>
              ${group.items.map(
                (item) => html`
                  <a
                    class="docs-nav-link ${this.route === item.id ? "is-active" : ""}"
                    href=${docHref(item.id)}
                    @click=${(e: Event) => {
                      e.preventDefault();
                      navigateTo(item.id);
                    }}
                  >${item.label[loc]}</a>
                `
              )}
            </div>
          `
        )}
      </aside>
    `;
  }

  private tocItems(page: ReturnType<typeof getDocPage>) {
    if (!page) return [];
    if (page.kind === "component") {
      const p = page as ResolvedComponentPage;
      return [
        { id: "intro", title: this.t("intro") },
        { id: "preview", title: this.t("preview") },
        ...(p.showcases.length ? [{ id: "showcases", title: this.t("showcases") }] : []),
        { id: "usage", title: this.t("usage") },
        { id: "props", title: this.t("props") },
        ...(p.events.length ? [{ id: "events", title: this.t("events") }] : []),
        ...(p.slots.length ? [{ id: "slots", title: this.t("slots") }] : []),
        ...(p.cssVars.length ? [{ id: "css-vars", title: this.t("cssVars") }] : []),
        ...(p.methods?.length ? [{ id: "methods", title: this.t("methods") }] : []),
        ...(p.bundleSize ? [{ id: "bundle", title: this.t("bundleSize") }] : [])
      ];
    }
    return page.sections.map((s) => ({ id: s.id, title: s.title }));
  }

  private renderToc(page: NonNullable<ReturnType<typeof getDocPage>>) {
    const items = this.tocItems(page);
    if (!items.length) return nothing;

    return html`
      <nav class="docs-toc" aria-label=${this.t("onThisPage")}>
        <p class="docs-toc__title">${this.t("onThisPage")}</p>
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

  private renderPreviewHint(pageId: string) {
    const hints: Partial<Record<string, { "zh-CN": string; en: string }>> = {
      "yn-navigation": {
        "zh-CN": "提示：点击导航项查看指示器滑动与发光动画。",
        en: "Tip: click tabs to see indicator slide and glow."
      },
      "yn-dropdown": {
        "zh-CN": "提示：点击「筛选条件」打开弹层，查看位移动画。",
        en: "Tip: click the trigger to open the panel animation."
      },
      "yn-drawer": {
        "zh-CN": "提示：点击「打开购物车」查看抽屉滑入动画。",
        en: "Tip: click to open the drawer slide animation."
      },
      "yn-search": {
        "zh-CN": "提示：点击搜索图标展开输入区。",
        en: "Tip: click the search icon to expand."
      },
      "yn-toast": {
        "zh-CN": "提示：点击下方按钮触发灵动岛反馈动画。",
        en: "Tip: click buttons below to trigger toast morph."
      },
      "yn-pull-cord-switch": {
        "zh-CN": "提示：拖拽绳端过阈值切换，松手弹性回弹。",
        en: "Tip: drag the cord past threshold and release."
      },
      "yn-sku-selector": {
        "zh-CN": "提示：选择规格后点击加购，观察 loading 形变。",
        en: "Tip: pick specs and submit to see loading morph."
      }
    };

    const hint = hints[pageId];
    if (!hint) return nothing;

    return html`
      <p style="margin:-12px 0 20px;font-size:13px;color:var(--yn-color-text-subtle);">
        ${this.locale === "zh-CN" ? hint["zh-CN"] : hint.en}
      </p>
    `;
  }

  private renderShowcases(page: ResolvedComponentPage) {
    if (!page.showcases.length) return nothing;

    return html`
      <h2 id="showcases" data-toc-id="showcases">${this.t("showcases")}</h2>
      ${page.showcases.map(
        (s) => html`
          <div class="docs-showcase">
            <div class="docs-showcase__head">
              <h3>${s.title}</h3>
              <a
                class="docs-showcase__sb"
                href=${s.storybookHref}
                target="_blank"
                rel="noopener noreferrer"
              >${this.t("viewInStorybook")} →</a>
            </div>
            <p>${s.description}</p>
            ${s.imageUrl
              ? html`<img class="docs-showcase__img" src=${s.imageUrl} alt=${s.title} loading="lazy" />`
              : nothing}
            ${s.demoVariant && getDemoRenderer(s.demoVariant)
              ? html`
                  <yn-docs-demo
                    .renderDemo=${getDemoRenderer(s.demoVariant)}
                    align="left"
                    label=${this.t("livePreview")}
                    .tall=${s.demoVariant.includes("dropdown") || s.demoVariant.includes("drawer") || s.demoVariant.includes("toast") || s.demoVariant.includes("pull-cord") || s.demoVariant.includes("quantity")}
                  ></yn-docs-demo>
                `
              : html`<p class="docs-showcase__hint">${this.t("viewInStorybook")} →</p>`}
          </div>
        `
      )}
    `;
  }

  private renderComponentPage(page: ResolvedComponentPage) {
    const demo = getDemoRenderer(page.demoId);
    const demoAlign =
      page.id === "yn-checkout-address" || page.id === "yn-sku-selector"
        ? "column"
        : page.id === "yn-navigation" || page.id === "yn-group-pick" || page.id === "yn-pick"
          ? "left"
          : "center";

    return html`
      <article class="prose">
        <h1>${page.title}</h1>
        <p class="lead">${page.description}</p>
        <p>
          ${this.t("tagClass")} <code>${page.tag}</code> · ${this.t("className")}
          <code>${page.className}</code>
        </p>

        <h2 id="intro" data-toc-id="intro">${this.t("intro")}</h2>
        <p>${page.longDescription}</p>

        <h2 id="preview" data-toc-id="preview">${this.t("preview")}</h2>
        <yn-docs-demo
          .renderDemo=${demo}
          align=${demoAlign}
          label=${this.t("livePreview")}
          .tall=${page.id === "yn-dropdown" || page.id === "yn-drawer" || page.id === "yn-toast" || page.id === "yn-pull-cord-switch"}
        ></yn-docs-demo>
        ${this.renderPreviewHint(page.id)}

        ${this.renderShowcases(page)}

        <h2 id="usage" data-toc-id="usage">${this.t("usage")}</h2>
        <p>${this.t("importOnDemand")}</p>
        <yn-docs-code
          lang="ts"
          .code=${`import { ${page.className} } from "${page.importPath}";`}
          .locale=${this.locale}
        ></yn-docs-code>
        <p>${this.t("templateExample")}</p>
        <yn-docs-code lang="html" .code=${page.usageCode} .locale=${this.locale}></yn-docs-code>

        <h2 id="props" data-toc-id="props">${this.t("props")}</h2>
        ${page.props.length
          ? this.renderTable(
              [this.t("colProp"), this.t("colType"), this.t("colDefault"), this.t("colDesc")],
              page.props.map((p) => [
                html`<span class="api-name">${p.name}</span>`,
                p.type,
                p.default,
                p.desc
              ])
            )
          : html`<p>${this.t("noProps")}</p>`}

        ${page.events.length
          ? html`
              <h2 id="events" data-toc-id="events">${this.t("events")}</h2>
              ${this.renderTable(
                [this.t("colEvent"), this.t("colDetail"), this.t("colDesc")],
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
              <h2 id="slots" data-toc-id="slots">${this.t("slots")}</h2>
              ${this.renderTable(
                [this.t("colSlot"), this.t("colDesc"), this.t("colPriority")],
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
              <h2 id="css-vars" data-toc-id="css-vars">${this.t("cssVars")}</h2>
              <blockquote>${this.t("shadowHint")}</blockquote>
              ${this.renderTable(
                [this.t("colVar"), this.t("colDefault"), this.t("colDesc")],
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
              <h2 id="methods" data-toc-id="methods">${this.t("methods")}</h2>
              ${this.renderTable(
                [this.t("colMethod"), this.t("colSignature"), this.t("colDesc")],
                page.methods.map((m) => [
                  html`<span class="api-name">${m.name}</span>`,
                  m.signature,
                  m.desc
                ])
              )}
            `
          : nothing}

        ${page.bundleSize
          ? html`
              <h2 id="bundle" data-toc-id="bundle">${this.t("bundleSize")}</h2>
              <p>
                ESM <strong>${page.bundleSize.sizeKb.toFixed(2)} kB</strong>
                (gzip ${page.bundleSize.gzipKb.toFixed(2)} kB)
                ${page.bundleSize.note ? html` — ${page.bundleSize.note}` : nothing}
              </p>
            `
          : nothing}

        ${page.notes?.length
          ? html`
              <h2 id="notes" data-toc-id="notes">${this.t("notes")}</h2>
              <ul>${page.notes.map((n) => html`<li>${n}</li>`)}</ul>
            `
          : nothing}
      </article>
    `;
  }

  private renderBundleGuide(page: GuideDocPage) {
    const rows = getBundleTableRows(this.locale);
    return html`
      <article class="prose">
        <h1>${page.title}</h1>
        <p class="lead">${page.description}</p>
        ${page.sections.map((section) => html`
          <h2 id=${section.id} data-toc-id=${section.id}>${section.title}</h2>
          ${section.body ? html`<p>${section.body}</p>` : nothing}
        `)}
        ${this.renderTable(
          [
            this.t("bundleComponent"),
            this.t("bundleImport"),
            this.t("bundleEsSize"),
            this.t("bundleGzip"),
            this.t("bundleNote")
          ],
          rows.map((r) => [
            html`<span class="api-name">${r.id}</span>`,
            r.importPath,
            r.size,
            r.gzip,
            r.note
          ])
        )}
        <p>
          ${this.t("bundleFull")}: <strong>${BUNDLE_META.fullIifeKb} kB</strong>
          (gzip ${BUNDLE_META.fullIifeGzipKb} kB) · ${this.t("bundleBuiltAt")}:
          ${BUNDLE_META.builtAt}
        </p>
      </article>
    `;
  }

  private renderGuidePage(page: GuideDocPage) {
    if (page.id === "bundle-size") return this.renderBundleGuide(page);

    const loc = this.locale;
    const featuresZh = loc === "zh-CN";

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
                      <h4>${f.title[loc]}</h4>
                      <p>${f.desc[loc]}</p>
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
                  ${featuresZh
                    ? html`
                        <li><strong>为电商而生</strong> — 浏览、选购、加购、结账</li>
                        <li><strong>跨境开箱即用</strong> — 地址多源降级</li>
                        <li><strong>品牌可定制</strong> — variant + --yn-*</li>
                        <li><strong>跨框架复用</strong> — 任意技术栈</li>
                        <li><strong>工程化完备</strong> — Storybook + 测试</li>
                      `
                    : html`
                        <li><strong>Commerce-first</strong> — full storefront flows</li>
                        <li><strong>Cross-border</strong> — address provider fallback</li>
                        <li><strong>On-brand</strong> — variants + CSS variables</li>
                        <li><strong>Framework-free</strong> — any stack</li>
                        <li><strong>Production-ready</strong> — Storybook + tests</li>
                      `}
                </ul>
              `
            : section.body
              ? html`<p>${section.body}</p>`
              : nothing}
          ${section.code
            ? html`<yn-docs-code lang=${section.lang ?? "ts"} .code=${section.code} .locale=${this.locale}></yn-docs-code>`
            : nothing}
        `)}
      </article>
    `;
  }

  render() {
    const page = getDocPage(this.route, this.locale);

    return html`
      <div class="docs-app">
        ${this.renderSidebar()}
        <div class="docs-main-wrap">
          <header class="docs-header">
            <span class="docs-header__path">
              ${this.t("docs")} / <strong>${page?.title ?? this.t("notFound")}</strong>
            </span>
            <div class="docs-header__links">
              ${this.renderHeaderThemeSwitch()}
              ${this.renderLangSwitch()}
              <a href="http://localhost:6006" target="_blank" rel="noopener noreferrer">${this.t("storybook")}</a>
            </div>
          </header>
          <div class="docs-body-grid">
            <main class="docs-content">
              ${page
                ? page.kind === "component"
                  ? this.renderComponentPage(page as ResolvedComponentPage)
                  : this.renderGuidePage(page)
                : html`
                    <article class="prose">
                      <h1>${this.t("notFound")}</h1>
                      <p>${this.t("notFoundHint")}</p>
                    </article>
                  `}
            </main>
            ${page ? this.renderToc(page) : nothing}
          </div>
        </div>
      </div>
      ${this.renderFixedThemeCord()}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "yn-docs-app": YnDocsApp;
  }
}
