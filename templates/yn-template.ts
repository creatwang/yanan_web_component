import { LitElement, css, html, unsafeCSS } from "lit";
import { customElement, property } from "lit/decorators.js";
import tailwindStyles from "../src/styles/tailwind.css?inline";

/**
 * 组件模板：
 * 1. 复制此文件并重命名为 yn-xxx.ts
 * 2. 将 YnTemplate 重命名为 YnXxx
 * 3. 将标签名 yn-template 改为 yn-xxx
 */
@customElement("yn-template")
export class YnTemplate extends LitElement {
  @property({ type: String }) label = "模板组件";
  @property({ type: Boolean }) disabled = false;

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
      new CustomEvent("yn-template-click", {
        detail: { label: this.label },
        bubbles: true,
        composed: true
      })
    );
  }

  render() {
    return html`
      <button
        class="rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
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
    "yn-template": YnTemplate;
  }
}
