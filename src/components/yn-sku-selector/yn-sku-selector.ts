import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";
import {
  buildGroupHas,
  buildGroupSpec,
  buildSelection,
  findMatchedSku,
  getMissingKeys,
  getSpecKeys,
  toComparable
} from "./sku-engine";
import type {
  YnSkuChangeDetail,
  YnSkuItem,
  YnSkuSelection,
  YnSkuSpecValue,
  YnSkuSubmitDetail,
  YnSkuSubmitEvent,
  YnSkuSubmitHandler,
  YnSkuSubmitInstance
} from "./types";

const loadingSvg = `<svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true">
<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-dasharray="42 20">
<animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.75s" repeatCount="indefinite"/>
</circle>
</svg>`;

const parseSkusFromAttribute = (raw: string | null): YnSkuItem[] => {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as YnSkuItem[]) : [];
  } catch {
    return [];
  }
};

const parseLabelsFromAttribute = (raw: string | null): Record<string, string> => {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? (parsed as Record<string, string>) : {};
  } catch {
    return {};
  }
};

const formatPrice = (price: number) => price.toFixed(2);

/**
 * SKU 规格选择器：支持多维规格联动、加购校验与 simple 快速加购模式。
 *
 * @slot title - 标题区域，simple 模式下不渲染
 *
 * @fires change - 每次规格变更时触发
 * @fires submit - 满足加购条件时触发；`event.detail` 为 `{ sku, selections }`，`event.instance.done()` 结束 loading
 */
@customElement("yn-sku-selector")
export class YnSkuSelector extends LitElement {
  @property({
    attribute: "skus",
    converter: {
      fromAttribute: parseSkusFromAttribute,
      toAttribute: (value: YnSkuItem[]) => JSON.stringify(value ?? [])
    }
  })
  skus: YnSkuItem[] = [];

  @property({ type: String })
  currency = "€";

  @property({ type: String, attribute: "currency-icon" })
  currencyIcon = "";

  @property({ type: Boolean, reflect: true })
  simple = false;

  @property({ type: String, attribute: "submit-label" })
  submitLabel = "ADD TO CART";

  @property({ type: String, attribute: "incomplete-hint" })
  incompleteHint = "请选择 {label}";

  @property({
    attribute: "labels",
    converter: {
      fromAttribute: parseLabelsFromAttribute,
      toAttribute: (value: Record<string, string>) => JSON.stringify(value ?? {})
    }
  })
  labels: Record<string, string> = {};

  @property({ type: Boolean, reflect: true })
  disabled = false;

  /** submit 回调：`(detail, instance) => void`，异步结束后调用 `instance.done()` */
  @property({ attribute: false })
  onSubmit?: YnSkuSubmitHandler;

  @state() private curs: string[] = [];
  @state() private hint = "";
  @state() private submitting = false;
  @state() private loadingDepth = -1;
  @state() private loadingValue = "";

  static styles = css`
    :host {
      display: block;
      width: 100%;
      min-width: 0;
      color: var(--yn-sku-selector-color, inherit);
      font-family: var(--yn-sku-selector-font-family, inherit);
      -webkit-tap-highlight-color: transparent;
    }

    * {
      box-sizing: border-box;
    }

    .title {
      margin-bottom: var(--yn-sku-selector-title-gap, 24px);
    }

    .section {
      margin-bottom: var(--yn-sku-selector-section-gap, 20px);
    }

    .section:last-of-type {
      margin-bottom: 0;
    }

    .label {
      margin: 0 0 var(--yn-sku-selector-label-gap, 10px);
      font-size: var(--yn-sku-selector-label-font-size, 11px);
      font-weight: var(--yn-sku-selector-label-font-weight, 600);
      letter-spacing: var(--yn-sku-selector-label-letter-spacing, 0.14em);
      text-transform: uppercase;
      color: var(--yn-sku-selector-label-color, currentColor);
      line-height: 1.2;
      word-break: break-word;
    }

    .options {
      display: flex;
      flex-wrap: wrap;
      gap: var(--yn-sku-selector-options-gap, 0);
      width: 100%;
      min-width: 0;
    }

    .option {
      flex: var(--yn-sku-selector-option-flex, 1 1 0);
      min-width: var(--yn-sku-selector-option-min-width, 44px);
      max-width: 100%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: var(--yn-sku-selector-option-height, 44px);
      padding: var(--yn-sku-selector-option-padding, 0 10px);
      border: var(--yn-sku-selector-option-border-width, 2px) solid var(--yn-sku-selector-option-border-color, currentColor);
      background: var(--yn-sku-selector-option-bg, transparent);
      color: var(--yn-sku-selector-option-color, currentColor);
      font-family: inherit;
      font-size: var(--yn-sku-selector-option-font-size, clamp(12px, 3.2vw, 14px));
      font-weight: var(--yn-sku-selector-option-font-weight, 600);
      line-height: 1.1;
      text-transform: uppercase;
      cursor: pointer;
      transition:
        background-color 0.15s ease,
        color 0.15s ease,
        opacity 0.15s ease;
      user-select: none;
      -webkit-user-select: none;
      position: relative;
    }

    .options:not(.options--gap) .option:not(:last-child) {
      margin-right: calc(var(--yn-sku-selector-option-border-width, 2px) * -1);
    }

    .options:not(.options--gap) .option:not(:first-child) {
      border-left-width: 0;
    }

    .option.active {
      background: var(--yn-sku-selector-option-active-bg, currentColor);
      color: var(--yn-sku-selector-option-active-color, var(--yn-sku-selector-option-bg, #fff));
      z-index: 1;
    }

    .option.unavailable {
      opacity: var(--yn-sku-selector-option-disabled-opacity, 0.32);
      cursor: not-allowed;
      text-decoration: line-through;
    }

    .option:disabled,
    .option.is-loading {
      cursor: wait;
    }

    .option.is-loading .option-label {
      visibility: hidden;
    }

    .option-spinner {
      position: absolute;
      inset: 0;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    @media (hover: hover) {
      .option:not(.unavailable):not(:disabled):not(.active):hover {
        background: var(--yn-sku-selector-option-hover-bg, currentColor);
        color: var(--yn-sku-selector-option-hover-color, var(--yn-sku-selector-option-bg, #fff));
        z-index: 1;
      }
    }

    .option:active:not(.unavailable):not(:disabled) {
      background: var(--yn-sku-selector-option-active-bg, currentColor);
      color: var(--yn-sku-selector-option-active-color, var(--yn-sku-selector-option-bg, #fff));
      z-index: 1;
    }

    .hint {
      min-height: var(--yn-sku-selector-hint-min-height, 1.2em);
      margin: var(--yn-sku-selector-hint-margin, 0 0 10px);
      font-size: var(--yn-sku-selector-hint-font-size, 12px);
      line-height: 1.4;
      color: var(--yn-sku-selector-hint-color, #c0392b);
      word-break: break-word;
    }

    .submit-wrap {
      position: relative;
      display: block;
      margin-top: var(--yn-sku-selector-submit-margin-top, 20px);
    }

    .submit {
      position: relative;
      width: 100%;
      min-height: var(--yn-sku-selector-submit-height, 52px);
      padding: var(--yn-sku-selector-submit-padding, 0 16px);
      border: var(--yn-sku-selector-submit-border-width, 2px) solid var(--yn-sku-selector-submit-border-color, currentColor);
      background: var(--yn-sku-selector-submit-bg, currentColor);
      color: var(--yn-sku-selector-submit-color, var(--yn-sku-selector-option-bg, #fff));
      font-family: inherit;
      font-size: var(--yn-sku-selector-submit-font-size, clamp(13px, 3.4vw, 15px));
      font-weight: var(--yn-sku-selector-submit-font-weight, 700);
      letter-spacing: var(--yn-sku-selector-submit-letter-spacing, 0.06em);
      text-transform: uppercase;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: var(--yn-sku-selector-submit-gap, 10px);
      transition:
        background-color 0.15s ease,
        color 0.15s ease,
        opacity 0.15s ease;
      user-select: none;
      -webkit-user-select: none;
    }

    .submit:disabled {
      opacity: var(--yn-sku-selector-submit-disabled-opacity, 0.55);
      cursor: not-allowed;
    }

    @media (hover: hover) {
      .submit:not(:disabled):hover {
        background: var(--yn-sku-selector-submit-hover-bg, transparent);
        color: var(--yn-sku-selector-submit-hover-color, currentColor);
      }
    }

    .submit:active:not(:disabled) {
      background: var(--yn-sku-selector-submit-hover-bg, transparent);
      color: var(--yn-sku-selector-submit-hover-color, currentColor);
    }

    .submit.is-loading .submit-label,
    .submit.is-loading .submit-price {
      opacity: 0.35;
    }

    .submit-spinner {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: none;
      z-index: 1;
    }

    .submit-spinner svg {
      width: 1.25em;
      height: 1.25em;
      display: block;
    }

    .submit-price {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: var(--yn-sku-selector-price-font-size, 1.05em);
      font-weight: var(--yn-sku-selector-price-font-weight, 500);
      letter-spacing: 0;
      text-transform: none;
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

  private get specKeys() {
    return getSpecKeys(this.skus);
  }

  private ensureCursLength() {
    const len = this.specKeys.length;
    if (this.curs.length === len) return;
    this.curs = Array.from({ length: len }, (_, index) => this.curs[index] ?? "");
  }

  protected willUpdate(changed: Map<string, unknown>) {
    if (changed.has("skus")) {
      this.ensureCursLength();
      this.curs = this.curs.map((cur, index) => {
        if (!cur) return "";
        const group = buildGroupSpec(this.skus, this.specKeys);
        const values = group[index]?.list.map(toComparable) ?? [];
        return values.includes(cur) ? cur : "";
      });
    }
  }

  private getSnapshot(): YnSkuChangeDetail {
    const keys = this.specKeys;
    this.ensureCursLength();
    const selections = buildSelection(keys, this.curs);
    const sku = findMatchedSku(this.skus, keys, this.curs);
    const missingKeys = getMissingKeys(keys, this.curs);
    return {
      selections,
      sku,
      ready: missingKeys.length === 0 && sku != null,
      missingKeys
    };
  }

  private resolveLabel(key: string) {
    return this.labels[key] ?? key;
  }

  private shouldShowSpecLabel(specKey: string) {
    return Object.prototype.hasOwnProperty.call(this.labels, specKey);
  }

  private formatHint(missingKeys: string[]) {
    if (!missingKeys.length || !this.incompleteHint) return "";
    const label = this.resolveLabel(missingKeys[0]);
    return this.incompleteHint.replaceAll("{label}", label);
  }

  private formatDisplayPrice(price: number) {
    const amount = formatPrice(price);
    if (this.currencyIcon) return amount;
    return this.currency ? `${amount} ${this.currency}`.trim() : amount;
  }

  private emitChange() {
    this.dispatchEvent(
      new CustomEvent<YnSkuChangeDetail>("change", {
        detail: this.getSnapshot(),
        bubbles: true,
        composed: true
      })
    );
  }

  private finishSubmit() {
    this.submitting = false;
    this.loadingDepth = -1;
    this.loadingValue = "";
  }

  private emitSubmit(sku: YnSkuItem, selections: YnSkuSelection) {
    let settled = false;
    const detail: YnSkuSubmitDetail = { sku, selections };
    const instance: YnSkuSubmitInstance = {
      done: () => {
        if (settled) return;
        settled = true;
        this.finishSubmit();
      }
    };

    this.submitting = true;
    void this.onSubmit?.(detail, instance);

    const event = new CustomEvent<YnSkuSubmitDetail>("submit", {
      detail,
      bubbles: true,
      composed: true
    }) as YnSkuSubmitEvent;
    event.instance = instance;
    this.dispatchEvent(event);
  }

  private trySubmit(snapshot = this.getSnapshot()) {
    if (this.submitting || this.disabled) return;
    if (!snapshot.ready || !snapshot.sku) {
      this.hint = this.formatHint(snapshot.missingKeys);
      return;
    }
    this.hint = "";
    this.emitSubmit(snapshot.sku, snapshot.selections);
  }

  private handleOptionClick(depth: number, value: YnSkuSpecValue) {
    if (this.disabled || this.submitting) return;

    const keys = this.specKeys;
    const groupHas = buildGroupHas(this.skus, keys, this.curs);
    const comparable = toComparable(value);
    if (!groupHas[depth]?.some((item) => toComparable(item) === comparable)) return;

    this.ensureCursLength();
    const next = [...this.curs];
    next[depth] = next[depth] === comparable ? "" : comparable;
    this.curs = next;
    this.hint = "";
    this.emitChange();

    if (this.simple) {
      const snapshot = this.getSnapshot();
      if (snapshot.ready && snapshot.sku) {
        this.loadingDepth = depth;
        this.loadingValue = comparable;
        this.emitSubmit(snapshot.sku, snapshot.selections);
      }
    }
  }

  private handleSubmitClick() {
    this.trySubmit();
  }

  private renderCurrencyIcon() {
    if (!this.currencyIcon) return nothing;
    return html`<span class="currency-icon" aria-hidden="true">${unsafeSVG(this.currencyIcon)}</span>`;
  }

  private renderPrice(price: number | undefined) {
    if (price == null || Number.isNaN(price)) {
      return html`<span class="submit-price">—</span>`;
    }
    return html`
      <span class="submit-price">
        ${this.formatDisplayPrice(price)}
        ${this.currencyIcon ? this.renderCurrencyIcon() : nothing}
      </span>
    `;
  }

  private renderSpecOptions() {
    const keys = this.specKeys;
    this.ensureCursLength();
    const groupSpec = buildGroupSpec(this.skus, keys);
    const groupHas = buildGroupHas(this.skus, keys, this.curs);
    return groupSpec.map(({ specKey, depth, list }) => html`
      <section class="section" aria-label=${this.resolveLabel(specKey)}>
        ${!this.simple && this.shouldShowSpecLabel(specKey)
          ? html`<p class="label">${this.labels[specKey]}</p>`
          : nothing}
        <div class="options" role="listbox" aria-label=${this.resolveLabel(specKey)}>
          ${list.map((value) => {
            const comparable = toComparable(value);
            const isActive = this.curs[depth] === comparable;
            const isAvailable = groupHas[depth]?.some((item) => toComparable(item) === comparable) ?? false;
            const isLoading =
              this.submitting && this.loadingDepth === depth && this.loadingValue === comparable;
            const classes = [
              "option",
              isActive ? "active" : "",
              !isAvailable ? "unavailable" : "",
              isLoading ? "is-loading" : ""
            ]
              .filter(Boolean)
              .join(" ");

            return html`
              <button
                type="button"
                class=${classes}
                role="option"
                aria-selected=${isActive}
                aria-disabled=${!isAvailable || this.submitting || this.disabled}
                ?disabled=${!isAvailable || this.submitting || this.disabled}
                @click=${() => this.handleOptionClick(depth, value)}
              >
                <span class="option-label">${value}</span>
                ${isLoading ? html`<span class="option-spinner">${unsafeSVG(loadingSvg)}</span>` : nothing}
              </button>
            `;
          })}
        </div>
      </section>
    `);
  }

  render() {
    const snapshot = this.getSnapshot();
    const displayPrice = snapshot.sku?.price;

    return html`
      ${!this.simple
        ? html`
            <div class="title">
              <slot name="title"></slot>
            </div>
          `
        : nothing}
      ${this.renderSpecOptions()}
      ${!this.simple
        ? html`
            <div class="submit-wrap">
              ${this.hint ? html`<p class="hint" role="alert">${this.hint}</p>` : html`<p class="hint" aria-hidden="true"></p>`}
              <button
                type="button"
                class="submit ${this.submitting ? "is-loading" : ""}"
                ?disabled=${this.disabled || this.submitting}
                @click=${this.handleSubmitClick}
              >
                <span class="submit-label">${this.submitLabel}</span>
                ${this.renderPrice(displayPrice)}
                ${this.submitting ? html`<span class="submit-spinner">${unsafeSVG(loadingSvg)}</span>` : nothing}
              </button>
            </div>
          `
        : nothing}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "yn-sku-selector": YnSkuSelector;
  }
}
