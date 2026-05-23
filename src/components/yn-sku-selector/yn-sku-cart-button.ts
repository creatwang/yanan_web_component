import { LitElement, css, html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";
import type { YnSvgSource } from "../../asset/svg";
import { ynSkuCartSvg, ynSkuLoadingSvg } from "../../asset/svg";

/**
 * SKU 加购按钮：外黑边 + 白框 + 左文案区 | 竖线 | 右价格区。
 *
 * @slot icon - 左侧图标；未填充时回退 `cart-icon` 属性
 *
 * loading 两种模式：
 * - 默认（未设置 loading-text）：左侧区域半透明 + spinner，价格区不受影响
 * - 文本模式（设置 loading-text）：左侧文案替换为 loading-text，不显示 spinner
 *
 * @fires click - 点击加购时触发
 */
@customElement("yn-sku-cart-button")
export class YnSkuCartButton extends LitElement {
  @property({ type: String })
  label = "ADD TO CART";

  @property({ type: String })
  price = "—";

  @property({ type: String, attribute: "cart-icon" })
  cartIcon: YnSvgSource = ynSkuCartSvg;

  @property({ type: String, attribute: "currency-icon" })
  currencyIcon = "";

  @property({ type: Boolean, attribute: "show-cart-icon" })
  showCartIcon = true;

  @property({ type: Boolean, reflect: true })
  loading = false;

  /** 设置后 loading 时左侧文案替换为该文本；未设置则使用默认 spinner 模式 */
  @property({ type: String, attribute: "loading-text" })
  loadingText = "";

  @property({ type: Boolean, reflect: true })
  disabled = false;

  private get loadingTextMode() {
    return this.loading && this.loadingText.trim().length > 0;
  }

  private get loadingSpinnerMode() {
    return this.loading && !this.loadingTextMode;
  }

  static styles = css`
    :host {
      display: inline-block;
      width: auto;
      max-width: 100%;
      min-width: 0;
      font-family: inherit;
      color: inherit;
    }

    .submit {
      position: relative;
      width: auto;
      max-width: 100%;
      min-height: var(--yn-sku-selector-submit-height, 64px);
      padding: var(--yn-sku-selector-submit-outer-gap, 10px);
      border: 0;
      background: var(--yn-sku-selector-submit-bg, #000);
      color: var(--yn-sku-selector-submit-color, #fff);
      font-family: inherit;
      cursor: pointer;
      display: inline-block;
      user-select: none;
      -webkit-user-select: none;
    }

    .submit:disabled:not(.is-loading) {
      opacity: var(--yn-sku-selector-submit-disabled-opacity, 0.55);
      cursor: not-allowed;
    }

    .submit.is-loading {
      cursor: not-allowed;
    }

    .submit-inner {
      display: inline-flex;
      align-items: stretch;
      width: auto;
      max-width: 100%;
      min-height: var(--yn-sku-selector-submit-inner-height, 44px);
      border: var(--yn-sku-selector-submit-inset-width, 1px) solid
        var(--yn-sku-selector-submit-inset-color, #fff);
      background: var(--yn-sku-selector-submit-inner-bg, #000);
    }

    .submit-main {
      position: relative;
      flex: 0 1 auto;
      align-self: stretch;
      min-width: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--yn-sku-selector-submit-main-padding, 0 18px);
      font-size: var(--yn-sku-selector-submit-font-size, 15px);
      font-weight: var(--yn-sku-selector-submit-font-weight, 800);
      letter-spacing: var(--yn-sku-selector-submit-letter-spacing, 0.02em);
      text-transform: uppercase;
      line-height: 1;
      isolation: isolate;
    }

    .submit-main-content {
      position: relative;
      z-index: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--yn-sku-selector-submit-gap, 12px);
      min-width: 0;
      max-width: 100%;
    }

    .submit.is-loading-spinner .submit-main-content {
      opacity: 0.35;
    }

    .submit-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: var(--yn-sku-selector-cart-icon-size, 24px);
      height: var(--yn-sku-selector-cart-icon-size, 24px);
      flex-shrink: 0;
    }

    .submit-icon :is(svg),
    .submit-icon ::slotted(svg) {
      width: 100%;
      height: 100%;
      display: block;
    }

    .submit-icon ::slotted(*) {
      display: block;
      max-width: 100%;
      max-height: 100%;
    }

    .submit-label {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .submit-divider {
      width: var(--yn-sku-selector-submit-divider-width, 1px);
      flex: 0 0 var(--yn-sku-selector-submit-divider-width, 1px);
      align-self: stretch;
      background: var(--yn-sku-selector-submit-divider-color, #fff);
    }

    .submit-spinner-overlay {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: none;
      z-index: 2;
      transform: translateZ(1px);
    }

    .submit-spinner-overlay svg {
      width: 1.25em;
      height: 1.25em;
      display: block;
    }

    .submit-price {
      flex: 0 0 auto;
      width: var(--yn-sku-selector-submit-price-width, auto);
      min-width: var(--yn-sku-selector-submit-price-min-width, 0);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      padding: var(--yn-sku-selector-submit-price-padding, 0 14px);
      font-size: var(--yn-sku-selector-price-font-size, 17px);
      font-weight: var(--yn-sku-selector-price-font-weight, 400);
      letter-spacing: 0;
      text-transform: none;
      white-space: nowrap;
    }

    .currency-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 1em;
      height: 1em;
      flex-shrink: 0;
    }

    .currency-icon :is(svg) {
      width: 100%;
      height: 100%;
      display: block;
    }
  `;

  private renderCartIcon() {
    const fallback = this.cartIcon ? unsafeSVG(this.cartIcon) : nothing;
    return html`<slot name="icon">${fallback}</slot>`;
  }

  render() {
    const displayLabel = this.loadingTextMode ? this.loadingText : this.label;
    const showIcon = this.showCartIcon;

    return html`
      <button
        type="button"
        class="submit ${this.loading ? "is-loading" : ""} ${this.loadingSpinnerMode ? "is-loading-spinner" : ""} ${this.loadingTextMode ? "is-loading-text" : ""}"
        ?disabled=${this.disabled || this.loading}
      >
        <div class="submit-inner">
          <span class="submit-main">
            <span class="submit-main-content">
              ${showIcon ? html`<span class="submit-icon">${this.renderCartIcon()}</span>` : nothing}
              <span class="submit-label">${displayLabel}</span>
            </span>
            ${this.loadingSpinnerMode
              ? html`<span class="submit-spinner-overlay">${unsafeSVG(ynSkuLoadingSvg)}</span>`
              : nothing}
          </span>
          <span class="submit-divider" aria-hidden="true"></span>
          <span class="submit-price">
            ${this.price}
            ${this.currencyIcon ? html`<span class="currency-icon">${unsafeSVG(this.currencyIcon)}</span>` : nothing}
          </span>
        </div>
      </button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "yn-sku-cart-button": YnSkuCartButton;
  }
}
