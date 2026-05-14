import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("yn-input")
export class YnInput extends LitElement {
  @property({ type: String }) value = "";
  @property({ type: String }) placeholder = "请输入内容";
  @property({ type: Boolean }) disabled = false;

  static styles = css`
    :host {
      display: inline-block;
    }

    .input {
      min-width: 14rem;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      background: #ffffff;
      padding: 8px 12px;
      color: #0f172a;
      font-size: 14px;
      line-height: 1.2;
      outline: none;
      transition:
        border-color 0.2s ease,
        box-shadow 0.2s ease,
        background-color 0.2s ease;
    }

    .input:focus {
      border-color: #3b82f6;
      box-shadow: 0 0 0 2px #bfdbfe;
    }

    .input:disabled {
      cursor: not-allowed;
      background: #f1f5f9;
    }
  `;

  /** 处理输入事件并对外派发值变化。 */
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

  /** 渲染输入框。 */
  render() {
    return html`
      <input class="input" .value=${this.value} placeholder=${this.placeholder} ?disabled=${this.disabled} @input=${this.handleInput} />
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "yn-input": YnInput;
  }
}
