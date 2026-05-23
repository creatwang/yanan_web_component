import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";
import { ynSkuCartSvg, ynSkuLoadingSvg } from "../../asset/svg";
import type { YnSvgSource } from "../../asset/svg";
import "./yn-sku-cart-button";
import {
  buildGroupHas,
  buildGroupSpec,
  buildFirstAvailableCurs,
  buildSelection,
  findMatchedSku,
  getMissingKeys,
  getSpecKeys,
  toComparable
} from "./sku-engine";
import type {
  YnSkuChangeDetail,
  YnSkuInitDetail,
  YnSkuItem,
  YnSkuSelection,
  YnSkuSpecValue,
  YnSkuSubmitDetail,
  YnSkuSubmitEvent,
  YnSkuSubmitHandler,
  YnSkuSubmitInstance
} from "./types";

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
 * @slot submit-icon - 加购按钮左侧图标，转发至 yn-sku-cart-button 的 icon 插槽；未填充时回退 cart-icon 属性
 *
 * @fires change - 每次规格变更时触发
 * @fires init - pick-one 模式下初始化默认选中完成后触发，detail 与 change 一致
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

  /** 非 simple 模式下默认选中第一组可用 SKU，并在初始化完成后触发 init 事件 */
  @property({ type: Boolean, attribute: "pick-one", reflect: true })
  pickOne = false;

  @property({ type: String, attribute: "submit-label" })
  submitLabel = "ADD TO CART";

  @property({ type: String, attribute: "loading-text" })
  loadingText = "";

  @property({ type: String, attribute: "cart-icon" })
  cartIcon: YnSvgSource = ynSkuCartSvg;

  @property({ type: Boolean, attribute: "show-cart-icon" })
  showCartIcon = true;

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
  @state() private indicatorStyles: Record<number, string> = {};

  private indicatorObserver?: ResizeObserver;
  private hasAppliedPickOne = false;
  private hasEmittedInit = false;
  private pendingPickOneInit = false;

  static styles = css`
    :host {
      display: block;
      width: 100%;
      min-width: 0;
      color: var(--yn-sku-selector-color, #000);
      font-family: var(--yn-sku-selector-font-family, inherit);
      -webkit-tap-highlight-color: transparent;
    }

    * {
      box-sizing: border-box;
    }

    .title {
      margin-bottom: var(--yn-sku-selector-title-gap, 28px);
    }

    .section {
      margin-bottom: var(--yn-sku-selector-row-gap, var(--yn-sku-selector-section-gap, 24px));
    }

    .section:last-of-type {
      margin-bottom: 0;
    }

    .label {
      margin: 0 0 var(--yn-sku-selector-label-row-gap, var(--yn-sku-selector-label-gap, 12px));
      font-size: var(--yn-sku-selector-label-font-size, 11px);
      font-weight: var(--yn-sku-selector-label-font-weight, 600);
      letter-spacing: var(--yn-sku-selector-label-letter-spacing, 0.14em);
      text-transform: uppercase;
      color: var(--yn-sku-selector-label-color, currentColor);
      line-height: 1.2;
      word-break: break-word;
    }

    .options {
      position: relative;
      display: flex;
      flex-wrap: wrap;
      align-items: stretch;
      gap: 0;
      width: 100%;
      min-width: 0;
      margin-left: 1px;
      margin-top: 1px;
    }

    .option-indicator {
      position: absolute;
      top: 0;
      left: 0;
      z-index: 0;
      background: var(--yn-sku-selector-option-active-bg, #000);
      opacity: 0;
      pointer-events: none;
      transition:
        transform var(--yn-sku-selector-option-transition-duration, 0.28s)
          var(--yn-sku-selector-option-transition-ease, cubic-bezier(0.4, 0, 0.2, 1)),
        width var(--yn-sku-selector-option-transition-duration, 0.28s)
          var(--yn-sku-selector-option-transition-ease, cubic-bezier(0.4, 0, 0.2, 1)),
        height var(--yn-sku-selector-option-transition-duration, 0.28s)
          var(--yn-sku-selector-option-transition-ease, cubic-bezier(0.4, 0, 0.2, 1)),
        opacity 0.18s ease;
    }

    .option {
      position: relative;
      z-index: 1;
      flex: 0 1 auto;
      min-width: var(--yn-sku-selector-option-min-width, 52px);
      max-width: 100%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: var(--yn-sku-selector-row-height, var(--yn-sku-selector-option-height, 48px));
      height: var(--yn-sku-selector-row-height, var(--yn-sku-selector-option-height, 48px));
      padding: var(--yn-sku-selector-option-padding, 0 18px);
      margin: -1px 0 0 -1px;
      border: var(--yn-sku-selector-option-border-width, 1px) solid
        var(--yn-sku-selector-option-border-color, currentColor);
      background: var(--yn-sku-selector-option-bg, #fff);
      color: var(--yn-sku-selector-option-color, currentColor);
      font-family: inherit;
      font-size: var(--yn-sku-selector-option-font-size, 14px);
      font-weight: var(--yn-sku-selector-option-font-weight, 700);
      line-height: 1;
      text-transform: uppercase;
      cursor: pointer;
      transition: color var(--yn-sku-selector-option-transition-duration, 0.28s)
        var(--yn-sku-selector-option-transition-ease, cubic-bezier(0.4, 0, 0.2, 1));
      user-select: none;
      -webkit-user-select: none;
    }

    .option.active {
      color: var(--yn-sku-selector-option-active-color, #fff);
      background: transparent;
    }

    .option.unavailable {
      opacity: var(--yn-sku-selector-option-disabled-opacity, 0.28);
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

    .hint {
      min-height: var(--yn-sku-selector-hint-min-height, 1.2em);
      margin: var(--yn-sku-selector-hint-margin, 0 0 12px);
      font-size: var(--yn-sku-selector-hint-font-size, 12px);
      line-height: 1.4;
      color: var(--yn-sku-selector-hint-color, #c0392b);
      word-break: break-word;
    }

    .submit-wrap {
      display: block;
      width: fit-content;
      max-width: 100%;
      margin-top: var(--yn-sku-selector-submit-margin-top, 24px);
    }
  `;

  connectedCallback() {
    super.connectedCallback();
    this.indicatorObserver = new ResizeObserver(() => this.syncIndicators());
    this.indicatorObserver.observe(this);
  }

  disconnectedCallback() {
    this.indicatorObserver?.disconnect();
    super.disconnectedCallback();
  }

  protected firstUpdated() {
    this.syncIndicators();
  }

  protected willUpdate(changed: Map<string, unknown>) {
    if (!this.simple && this.pickOne && this.skus.length && this.specKeys.length) {
      const shouldApply =
        !this.hasAppliedPickOne || changed.has("skus") || (changed.has("pickOne") && this.pickOne);
      if (shouldApply) {
        this.curs = buildFirstAvailableCurs(this.skus, this.specKeys);
        this.hasAppliedPickOne = true;
        if (!this.hasEmittedInit) {
          this.pendingPickOneInit = true;
        }
      }
    } else if (changed.has("pickOne") && !this.pickOne) {
      this.hasAppliedPickOne = false;
      this.pendingPickOneInit = false;
    }

    if (changed.has("skus") && (this.simple || !this.pickOne)) {
      this.ensureCursLength();
      this.curs = this.curs.map((cur, index) => {
        if (!cur) return "";
        const group = buildGroupSpec(this.skus, this.specKeys);
        const values = group[index]?.list.map(toComparable) ?? [];
        return values.includes(cur) ? cur : "";
      });
    }
  }

  protected updated(changed: Map<string, unknown>) {
    if (this.pendingPickOneInit) {
      this.pendingPickOneInit = false;
      this.hasEmittedInit = true;
      this.emitInit();
    }

    if (changed.has("curs") || changed.has("skus") || changed.has("simple")) {
      this.syncIndicators();
    }
  }

  private syncIndicators() {
    requestAnimationFrame(() => {
      const styles: Record<number, string> = {};
      this.shadowRoot?.querySelectorAll<HTMLElement>(".section[data-depth]").forEach((section) => {
        const depth = Number(section.dataset.depth);
        if (Number.isNaN(depth)) return;
        const options = section.querySelector(".options");
        const active = section.querySelector<HTMLElement>(".option.active:not(.unavailable)");
        if (!options || !active) {
          styles[depth] = "opacity:0;";
          return;
        }
        const oRect = options.getBoundingClientRect();
        const aRect = active.getBoundingClientRect();
        styles[depth] = [
          `transform:translate3d(${aRect.left - oRect.left}px,${aRect.top - oRect.top}px,0)`,
          `width:${aRect.width}px`,
          `height:${aRect.height}px`,
          "opacity:1"
        ].join(";");
      });
      this.indicatorStyles = styles;
    });
  }

  private get specKeys() {
    return getSpecKeys(this.skus);
  }

  private ensureCursLength() {
    const len = this.specKeys.length;
    if (this.curs.length === len) return;
    this.curs = Array.from({ length: len }, (_, index) => this.curs[index] ?? "");
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

  private emitInit() {
    this.dispatchEvent(
      new CustomEvent<YnSkuInitDetail>("init", {
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

  private formatPriceText(price: number | undefined) {
    if (price == null || Number.isNaN(price)) return "—";
    return this.formatDisplayPrice(price);
  }

  private handleSubmitClick() {
    this.trySubmit();
  }

  private renderSpecOptions() {
    const keys = this.specKeys;
    this.ensureCursLength();
    const groupSpec = buildGroupSpec(this.skus, keys);
    const groupHas = buildGroupHas(this.skus, keys, this.curs);
    return groupSpec.map(({ specKey, depth, list }) => html`
      <section class="section" data-depth=${depth} aria-label=${this.resolveLabel(specKey)}>
        ${!this.simple && this.shouldShowSpecLabel(specKey)
          ? html`<p class="label">${this.labels[specKey]}</p>`
          : nothing}
        <div class="options" role="listbox" aria-label=${this.resolveLabel(specKey)}>
          <div class="option-indicator" style=${this.indicatorStyles[depth] ?? "opacity:0;"}></div>
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
                ${isLoading ? html`<span class="option-spinner">${unsafeSVG(ynSkuLoadingSvg)}</span>` : nothing}
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
              <yn-sku-cart-button
                .label=${this.submitLabel}
                loading-text=${this.loadingText}
                .price=${this.formatPriceText(displayPrice)}
                .cartIcon=${this.cartIcon}
                currency-icon=${this.currencyIcon}
                ?show-cart-icon=${this.showCartIcon}
                ?loading=${this.submitting}
                ?disabled=${this.disabled}
                @click=${this.handleSubmitClick}
              >
                <slot name="submit-icon" slot="icon"></slot>
              </yn-sku-cart-button>
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
