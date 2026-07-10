import { LitElement, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { TemplateResult } from "lit";

@customElement("yn-docs-demo")
export class YnDocsDemo extends LitElement {
  @property({ attribute: false }) renderDemo?: () => TemplateResult;
  @property({ type: String }) align: "center" | "left" | "column" = "center";
  @property({ type: String }) label = "Preview";
  @property({ type: Boolean }) tall = false;
  @property({ type: String }) code = "";
  @property({ type: String }) codeLang = "html";
  @state() private showCode = false;
  @state() private copied = false;

  createRenderRoot() {
    return this;
  }

  private toggleCode() {
    this.showCode = !this.showCode;
  }

  private async copyCode() {
    if (!this.code) return;
    try {
      await navigator.clipboard.writeText(this.code);
      this.copied = true;
      window.setTimeout(() => {
        this.copied = false;
      }, 1600);
    } catch {
      /* ignore */
    }
  }

  render() {
    const alignClass =
      this.align === "left"
        ? "docs-demo__preview--left"
        : this.align === "column"
          ? "docs-demo__preview--column"
          : "";
    const tallClass = this.tall ? "docs-demo__preview--tall" : "";
    const hasCode = !!this.code;

    return html`
      <div class="docs-demo ${this.tall ? "docs-demo--tall" : ""}">
        <div class="docs-demo__preview ${alignClass} ${tallClass}">
          ${this.renderDemo?.() ?? ""}
        </div>
        ${hasCode
          ? html`
              <div class="docs-demo__code-toggle">
                <button
                  class="docs-demo__code-btn"
                  type="button"
                  @click=${this.toggleCode}
                  title=${this.showCode ? "Hide code" : "Show code"}
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="16 18 22 12 16 6"></polyline>
                    <polyline points="8 6 2 12 8 18"></polyline>
                  </svg>
                  ${this.showCode ? "Hide code" : "Show code"}
                </button>
                ${this.showCode
                  ? html`
                      <button
                        class="docs-demo__copy-btn"
                        type="button"
                        @click=${this.copyCode}
                        title=${this.copied ? "Copied!" : "Copy code"}
                      >
                        ${this.copied
                          ? html`
                              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="20 6 9 17 4 12"></polyline>
                              </svg>
                              Copied!
                            `
                          : html`
                              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                              </svg>
                              Copy
                            `}
                      </button>
                    `
                  : nothing}
              </div>
              ${this.showCode
                ? html`
                    <div class="docs-demo__code-block">
                      <pre><code class="language-${this.codeLang}">${this.code}</code></pre>
                    </div>
                  `
                : nothing}
            `
          : nothing}
        <div class="docs-demo__label">${this.label}</div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "yn-docs-demo": YnDocsDemo;
  }
}
