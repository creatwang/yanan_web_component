import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("yn-button")
export class YnButton extends LitElement {
  @property({ type: Boolean }) disabled = false;
  @property({ type: String }) label = "按钮";

  static styles = css`
    :host {
      display: inline-block;
    }

    .button {
      border: 0;
      border-radius: 6px;
      background: #2563eb;
      padding: 8px 16px;
      color: #ffffff;
      font-size: 14px;
      font-weight: 500;
      line-height: 1.2;
      cursor: pointer;
      transition: background-color 0.2s ease;
    }

    .button:hover {
      background: #1d4ed8;
    }

    .button:disabled {
      cursor: not-allowed;
      background: #94a3b8;
    }
  `;

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
      <button class="button" ?disabled=${this.disabled} @click=${this.handleClick}>
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
