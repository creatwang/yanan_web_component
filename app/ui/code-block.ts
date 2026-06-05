import { LitElement, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";

@customElement("yn-docs-code")
export class YnDocsCode extends LitElement {
  @property({ type: String }) code = "";
  @property({ type: String }) lang = "html";
  @state() private copied = false;

  createRenderRoot() {
    return this;
  }

  private async copy() {
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
    return html`
      <div class="docs-code-wrap">
        <div class="docs-code-header">
          <span class="docs-code-lang">${this.lang}</span>
          <button class="docs-code-copy" type="button" @click=${this.copy}>
            ${this.copied ? "已复制" : "复制"}
          </button>
        </div>
        <pre class="docs-code-block"><code>${this.code}</code></pre>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "yn-docs-code": YnDocsCode;
  }
}
