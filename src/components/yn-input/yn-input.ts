import { LitElement, css, html, unsafeCSS } from "lit";
import { customElement, property } from "lit/decorators.js";
import tailwindStyles from "../../styles/tailwind.css?inline";

@customElement("yn-input")
export class YnInput extends LitElement {
  @property({ type: String }) value = "";
  @property({ type: String }) placeholder = "请输入内容";
  @property({ type: Boolean }) disabled = false;

  static styles = [
    unsafeCSS(tailwindStyles),
    css`
      :host {
        display: inline-block;
      }
    `
  ];

  private handleInput(event: Event) {
    const nextValue = (event.target as HTMLInputElement).value;
    this.value = nextValue;
    this.dispatchEvent(
      new CustomEvent("yn-input", {
        detail: { value: this.value },
        bubbles: true,
        composed: true
      })
    );
  }

  render() {
    return html`
      <input
        class="min-w-56 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:bg-slate-100"
        .value=${this.value}
        placeholder=${this.placeholder}
        ?disabled=${this.disabled}
        @input=${this.handleInput}
      />
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "yn-input": YnInput;
  }
}
