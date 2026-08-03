import "../../lib/lit-hydrate.js";
import { LitElement, css, html, unsafeCSS } from "lit";
import { customElement, property } from "lit/decorators.js";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";
import {
  YN_QUANTITY_MINUS_ICON,
  YN_QUANTITY_PLUS_ICON,
  YN_QUANTITY_SHADOW_STYLES,
  YN_QUANTITY_SPINNER_ICON,
} from "./yn-quantity-styles.js";

export type YnQuantityLoadingSide = "none" | "decrease" | "increase";

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/**
 * Floema 风格产品数量选择器：胶囊容器、细线描边与 Zimula 衬线数字。
 *
 * 按钮 native disabled 仅用于宿主 `disabled`。
 * `loading-side` 只换 spinner + 拦截连点，不用 disabled / not-allowed 光标。
 * min/max 边界仅拦截点击，不改变光标。
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
  @property({ type: String, reflect: true, attribute: "loading-side" })
  loadingSide: YnQuantityLoadingSide = "none";

  static styles = css`
    ${unsafeCSS(YN_QUANTITY_SHADOW_STYLES)}
  `;

  private get boundedValue() {
    return clamp(this.value, this.min, this.max);
  }

  private get isLoading() {
    return this.loadingSide !== "none";
  }

  private isDecreaseAtLimit() {
    return !this.disabled && !this.isLoading && this.boundedValue <= this.min;
  }

  private isIncreaseAtLimit() {
    return !this.disabled && !this.isLoading && this.boundedValue >= this.max;
  }

  private btnClass(side: "decrease" | "increase") {
    const loadingActive = this.loadingSide === side;
    return [
      "btn",
      side === "decrease" ? "btn-decrease" : "btn-increase",
      loadingActive ? "is-loading-active" : "",
    ]
      .filter(Boolean)
      .join(" ");
  }

  private renderBtnIcon(side: "decrease" | "increase", icon: string) {
    if (this.loadingSide === side) {
      return unsafeSVG(YN_QUANTITY_SPINNER_ICON);
    }
    return unsafeSVG(icon);
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
    if (this.disabled || this.isLoading) return;
    if (this.isDecreaseAtLimit()) return;
    this.setValue(this.boundedValue - this.step);
  };

  private handleIncrease = () => {
    if (this.disabled || this.isLoading) return;
    if (this.isIncreaseAtLimit()) return;
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
    const input = root.querySelector<HTMLInputElement>("input.value");
    if (input) {
      input.value = String(value);
      input.disabled = this.disabled;
    }
    const decrease = root.querySelector<HTMLButtonElement>(".btn-decrease");
    const increase = root.querySelector<HTMLButtonElement>(".btn-increase");
    if (decrease) {
      decrease.disabled = this.disabled;
      decrease.classList.toggle("is-loading-active", this.loadingSide === "decrease");
    }
    if (increase) {
      increase.disabled = this.disabled;
      increase.classList.toggle("is-loading-active", this.loadingSide === "increase");
    }
    const stepper = root.querySelector(".stepper");
    stepper?.classList.toggle("is-disabled", this.disabled);
  }

  bootstrapFromDeclarativeShadow() {
    this.syncDsdDom();
  }

  render() {
    const value = this.boundedValue;

    return html`
      <div
        class="stepper ${this.disabled ? "is-disabled" : ""}"
        role="group"
        aria-label="数量"
      >
        <button
          type="button"
          class=${this.btnClass("decrease")}
          aria-label="减少数量"
          aria-busy=${this.loadingSide === "decrease" ? "true" : "false"}
          ?disabled=${this.disabled}
          @click=${this.handleDecrease}
        >
          ${this.renderBtnIcon("decrease", YN_QUANTITY_MINUS_ICON)}
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
          class=${this.btnClass("increase")}
          aria-label="增加数量"
          aria-busy=${this.loadingSide === "increase" ? "true" : "false"}
          ?disabled=${this.disabled}
          @click=${this.handleIncrease}
        >
          ${this.renderBtnIcon("increase", YN_QUANTITY_PLUS_ICON)}
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
