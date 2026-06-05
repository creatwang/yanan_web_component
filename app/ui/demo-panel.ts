import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { TemplateResult } from "lit";

@customElement("yn-docs-demo")
export class YnDocsDemo extends LitElement {
  @property({ attribute: false }) renderDemo?: () => TemplateResult;
  @property({ type: String }) align: "center" | "left" | "column" = "center";
  @property({ type: String }) label = "Preview";
  @property({ type: Boolean }) tall = false;

  createRenderRoot() {
    return this;
  }

  render() {
    const alignClass =
      this.align === "left"
        ? "docs-demo__preview--left"
        : this.align === "column"
          ? "docs-demo__preview--column"
          : "";
    const tallClass = this.tall ? "docs-demo__preview--tall" : "";

    return html`
      <div class="docs-demo ${this.tall ? "docs-demo--tall" : ""}">
        <div class="docs-demo__preview ${alignClass} ${tallClass}">
          ${this.renderDemo?.() ?? ""}
        </div>
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
