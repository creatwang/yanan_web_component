import { LitElement, css, html, unsafeCSS } from "lit";
import { customElement, property } from "lit/decorators.js";
import tailwindStyles from "../styles/tailwind.css?inline";

@customElement("yn-button")
export class YnButton extends LitElement {
  @property({ type: Boolean }) disabled = false;
  @property({ type: String }) label = "按钮";

  static styles = [
    unsafeCSS(tailwindStyles),
    css`
      :host {
        display: inline-block;
      }
    `
  ];

  private handleClick() {
    this.dispatchEvent(
      new CustomEvent("yn-click", {
        detail: { label: this.label },
        bubbles: true,
        composed: true
      })
    );
  }

  render() {
    return html`
      <button
        class="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
        ?disabled=${this.disabled}
        @click=${this.handleClick}
      >
        <slot>${this.label}</slot>
      </button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "yn-button": YnButton;
  }
}
