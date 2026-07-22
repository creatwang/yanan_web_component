import "../../lib/lit-hydrate.js";
import { LitElement, css, html, unsafeCSS } from "lit";
import { customElement, property } from "lit/decorators.js";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";
import {
  YN_QUANTITY_MINUS_ICON,
  YN_QUANTITY_PLUS_ICON,
  YN_QUANTITY_SHADOW_STYLES,
} from "./yn-quantity-styles.js";

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/**
 * Floema 风格产品数量选择器：胶囊容器、细线描边与 Zimula 衬线数字。
 *
 * @fires change - 数量变化时触发，`detail.value` 为当前数量。
 */
@customElement("yn-quantity")
export class YnQuantity extends LitElement {
  @property({ type: Number }) value = 1;
  @property({ type: Number }) min = 1;
  @property({ type: Number }) max = 99;
  @property({ type: Number }) step = 1;
  @property({ type: Boolean, reflect: true }) disabled = false;

  static styles = css`
    ${unsafeCSS(YN_QUANTITY_SHADOW_STYLES)}
  `;

  private get boundedValue() {
    return clamp(this.value, this.min, this.max);
  }

  private emitChange(value: number) {
    this.dispatchEvent(
      new CustomEvent("change", {
        detail: { value },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private setValue(next: number) {
    const value = clamp(next, this.min, this.max);
    if (value === this.value) return;
    this.value = value;
    this.emitChange(value);
    this.syncDsdDom();
  }

  private handleDecrease = () => {
    this.setValue(this.boundedValue - this.step);
  };

  private handleIncrease = () => {
    this.setValue(this.boundedValue + this.step);
  };

  private handleInput(event: Event) {
    const raw = (event.target as HTMLInputElement).value;
    if (raw === "") return;
    const parsed = Number.parseInt(raw, 10);
    if (Number.isNaN(parsed)) return;
    this.setValue(parsed);
  }

  private handleBlur(event: Event) {
    const input = event.target as HTMLInputElement;
    input.value = String(this.boundedValue);
    if (this.value !== this.boundedValue) {
      this.value = this.boundedValue;
      this.emitChange(this.boundedValue);
    }
    this.syncDsdDom();
  }

  private syncDsdDom() {
    const root = this.shadowRoot;
    if (!root) return;
    const value = this.boundedValue;
    const atMin = value <= this.min;
    const atMax = value >= this.max;
    const input = root.querySelector<HTMLInputElement>("input.value");
    if (input) {
      input.value = String(value);
      input.disabled = this.disabled;
    }
    const decrease = root.querySelector<HTMLButtonElement>(".btn-decrease");
    const increase = root.querySelector<HTMLButtonElement>(".btn-increase");
    if (decrease) decrease.disabled = this.disabled || atMin;
    if (increase) increase.disabled = this.disabled || atMax;
    const stepper = root.querySelector(".stepper");
    stepper?.classList.toggle("is-disabled", this.disabled);
  }

  /**
   * 兼容旧 storefront rebootstrap。
   * 官方 hydrate 后事件由 Lit 模板绑定；此处仅同步 disabled / 边界态 DOM。
   */
  bootstrapFromDeclarativeShadow() {
    this.syncDsdDom();
  }

  render() {
    const value = this.boundedValue;
    const atMin = value <= this.min;
    const atMax = value >= this.max;

    return html`
      <div
        class="stepper ${this.disabled ? "is-disabled" : ""}"
        role="group"
        aria-label="数量"
      >
        <button
          type="button"
          class="btn btn-decrease"
          aria-label="减少数量"
          ?disabled=${this.disabled || atMin}
          @click=${this.handleDecrease}
        >
          ${unsafeSVG(YN_QUANTITY_MINUS_ICON)}
        </button>
        <div class="value-wrap">
          <input
            class="value"
            type="number"
            .value=${String(value)}
            min=${this.min}
            max=${this.max}
            step=${this.step}
            inputmode="numeric"
            aria-label="数量"
            ?disabled=${this.disabled}
            @input=${this.handleInput}
            @blur=${this.handleBlur}
          />
        </div>
        <button
          type="button"
          class="btn btn-increase"
          aria-label="增加数量"
          ?disabled=${this.disabled || atMax}
          @click=${this.handleIncrease}
        >
          ${unsafeSVG(YN_QUANTITY_PLUS_ICON)}
        </button>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "yn-quantity": YnQuantity;
  }
}
