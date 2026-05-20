import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";

const minusIcon = `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
<path d="M2.25 6H9.75" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
</svg>`;

const plusIcon = `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
<path d="M6 2.25V9.75M2.25 6H9.75" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
</svg>`;

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
    :host {
      --yn-quantity-width: auto;
      --yn-quantity-height: 44px;
      --yn-quantity-bg: var(--yn-color-surface, rgba(255, 255, 255, 0.62));
      --yn-quantity-bg-hover: var(--yn-color-surface-hover, rgba(255, 255, 255, 0.86));
      --yn-quantity-bg-focus: var(--yn-color-surface-focus, #fffaf2);
      --yn-quantity-border-color: var(--yn-color-border, rgba(36, 31, 33, 0.22));
      --yn-quantity-border-color-hover: var(--yn-color-border-strong, rgba(36, 31, 33, 0.52));
      --yn-quantity-border-color-focus: var(--yn-color-border-focus, #241f21);
      --yn-quantity-focus-ring: var(--yn-color-focus-ring, rgba(36, 31, 33, 0.12));
      --yn-quantity-color: var(--yn-color-text, #241f21);
      --yn-quantity-muted-color: var(--yn-color-text-disabled, rgba(36, 31, 33, 0.42));
      --yn-quantity-divider-color: var(--yn-color-divider, rgba(36, 31, 33, 0.14));
      --yn-quantity-button-size: 32px;
      --yn-quantity-button-bg-hover: var(--yn-color-overlay-hover, rgba(36, 31, 33, 0.08));
      --yn-quantity-button-bg-active: var(--yn-color-overlay-active, rgba(36, 31, 33, 0.14));
      --yn-quantity-button-hover-radius: 999px;
      --yn-quantity-inner-gap: 6px;
      --yn-quantity-padding: 4px 6px;
      --yn-quantity-radius: 999px;
      --yn-quantity-font-family:
        "Zimula", ui-serif, Georgia, Cambria, "Times New Roman", Times, serif;
      --yn-quantity-font-size: 16px;
      --yn-quantity-letter-spacing: -0.01em;
      --yn-quantity-value-min-width: 2.5ch;
      display: inline-block;
    }

    @font-face {
      font-family: "Zimula";
      src: url("https://www.floema.com/_nuxt/Zimula-Variable.Cb2n2uX-.ttf") format("truetype");
      font-display: swap;
    }

    * {
      box-sizing: border-box;
    }

    .stepper {
      display: inline-flex;
      align-items: center;
      gap: var(--yn-quantity-inner-gap);
      width: var(--yn-quantity-width);
      min-width: 0;
      height: var(--yn-quantity-height);
      padding: var(--yn-quantity-padding);
      border: 1px solid var(--yn-quantity-border-color);
      border-radius: var(--yn-quantity-radius);
      background: var(--yn-quantity-bg);
      overflow: hidden;
      transition:
        border-color 220ms cubic-bezier(0.4, 0, 1, 1),
        box-shadow 220ms cubic-bezier(0.4, 0, 1, 1),
        background-color 220ms cubic-bezier(0.4, 0, 1, 1);
    }

    .stepper:hover:not(.is-disabled) {
      border-color: var(--yn-quantity-border-color-hover);
      background: var(--yn-quantity-bg-hover);
    }

    .stepper:focus-within:not(.is-disabled) {
      border-color: var(--yn-quantity-border-color-focus);
      background: var(--yn-quantity-bg-focus);
      box-shadow: 0 0 0 3px var(--yn-quantity-focus-ring);
    }

    .stepper.is-disabled {
      opacity: 0.72;
      pointer-events: none;
    }

    .btn {
      position: relative;
      width: var(--yn-quantity-button-size);
      height: var(--yn-quantity-button-size);
      flex: 0 0 var(--yn-quantity-button-size);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: 0;
      background: transparent;
      color: var(--yn-quantity-color);
      padding: 0;
      cursor: pointer;
    }

    .btn::before {
      content: "";
      position: absolute;
      inset: 0;
      border-radius: var(--yn-quantity-button-hover-radius);
      background: transparent;
      transition:
        background-color 180ms ease,
        transform 160ms ease;
    }

    .btn:hover:not(:disabled)::before {
      background: var(--yn-quantity-button-bg-hover);
    }

    .btn:active:not(:disabled)::before {
      background: var(--yn-quantity-button-bg-active);
      transform: scale(0.94);
    }

    .btn:focus-visible::before {
      outline: 2px solid var(--yn-quantity-color);
      outline-offset: 0;
    }

    .btn svg {
      position: relative;
      z-index: 1;
    }

    .btn:disabled {
      color: var(--yn-quantity-muted-color);
      cursor: not-allowed;
    }

    .value-wrap {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: var(--yn-quantity-value-min-width);
      flex: 1 1 auto;
      padding: 0 4px;
    }

    .value-wrap::before,
    .value-wrap::after {
      content: "";
      position: absolute;
      top: 22%;
      bottom: 22%;
      width: 1px;
      background: var(--yn-quantity-divider-color);
    }

    .value-wrap::before {
      left: 0;
    }

    .value-wrap::after {
      right: 0;
    }

    .value {
      width: 100%;
      min-width: var(--yn-quantity-value-min-width);
      border: 0;
      background: transparent;
      color: var(--yn-quantity-color);
      font-family: var(--yn-quantity-font-family);
      font-size: var(--yn-quantity-font-size);
      letter-spacing: var(--yn-quantity-letter-spacing);
      line-height: 1;
      text-align: center;
      font-variant-numeric: tabular-nums;
      padding: 0;
      outline: none;
      -moz-appearance: textfield;
      appearance: textfield;
    }

    .value::-webkit-outer-spin-button,
    .value::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }

    .value:disabled {
      color: var(--yn-quantity-muted-color);
    }
  `;

  private get boundedValue() {
    return clamp(this.value, this.min, this.max);
  }

  private emitChange(value: number) {
    this.dispatchEvent(
      new CustomEvent("change", {
        detail: { value },
        bubbles: true,
        composed: true
      })
    );
  }

  private setValue(next: number) {
    const value = clamp(next, this.min, this.max);
    if (value === this.value) return;
    this.value = value;
    this.emitChange(value);
  }

  private handleDecrease() {
    this.setValue(this.boundedValue - this.step);
  }

  private handleIncrease() {
    this.setValue(this.boundedValue + this.step);
  }

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
          class="btn"
          aria-label="减少数量"
          ?disabled=${this.disabled || atMin}
          @click=${this.handleDecrease}
        >
          ${unsafeSVG(minusIcon)}
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
          class="btn"
          aria-label="增加数量"
          ?disabled=${this.disabled || atMax}
          @click=${this.handleIncrease}
        >
          ${unsafeSVG(plusIcon)}
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
