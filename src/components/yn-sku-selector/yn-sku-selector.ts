import { LitElement, css, html, nothing, unsafeCSS } from "lit";
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
  isSkuPurchasable,
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
import { YN_SKU_SELECTOR_STYLES } from "./yn-sku-selector-styles.js";

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

const parseStringArrayFromAttribute = (raw: string | null): string[] => {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim())
      .filter(Boolean);
  } catch {
    return [];
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

  @property({
    type: String,
    attribute: "loading-mode",
    converter: {
      fromAttribute: (value: string | null) => (value === "overlay" ? "overlay" : "icon"),
      toAttribute: (value: "icon" | "overlay") => value
    }
  })
  loadingMode: "icon" | "overlay" = "icon";

  @property({ type: String, attribute: "cart-icon" })
  cartIcon: YnSvgSource = ynSkuCartSvg;

  @property({ type: Boolean, attribute: "show-cart-icon" })
  showCartIcon = true;

  @property({ type: String, attribute: "incomplete-hint" })
  incompleteHint = "请选择 {label}";

  @property({ type: String, attribute: "sold-out-hint" })
  soldOutHint = "暂无库存";

  @property({ type: String, attribute: "no-price-hint" })
  noPriceHint = "暂无价格";

  @property({ type: Boolean, attribute: "show-stock" })
  showStock = false;

  @property({ type: String, attribute: "stock-label" })
  stockLabel = "库存";

  @property({ type: String, attribute: "stock-unlimited-label" })
  stockUnlimitedLabel = "现货";

  @property({ type: String, attribute: "stock-backorder-label" })
  stockBackorderLabel = "可预订";

  @property({
    attribute: "labels",
    converter: {
      fromAttribute: parseLabelsFromAttribute,
      toAttribute: (value: Record<string, string>) => JSON.stringify(value ?? {})
    }
  })
  labels: Record<string, string> = {};

  @property({
    attribute: "spec-key-whitelist",
    converter: {
      fromAttribute: parseStringArrayFromAttribute,
      toAttribute: (value: string[]) => JSON.stringify(value ?? [])
    }
  })
  specKeyWhitelist: string[] = [];

  @property({
    attribute: "spec-key-exclude",
    converter: {
      fromAttribute: parseStringArrayFromAttribute,
      toAttribute: (value: string[]) => JSON.stringify(value ?? [])
    }
  })
  specKeyExclude: string[] = [];

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
    ${unsafeCSS(YN_SKU_SELECTOR_STYLES)}
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
      const keys = this.specKeys;
      const normalized = this.normalizeCurs(keys);
      const group = buildGroupSpec(this.skus, keys);
      this.curs = normalized.map((cur, index) => {
        if (!cur) return "";
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
          styles[depth] = "opacity:0;transform:scale(0.98);";
          return;
        }
        const oRect = options.getBoundingClientRect();
        const aRect = active.getBoundingClientRect();
        styles[depth] = [
          `transform:translate3d(${aRect.left - oRect.left}px,${aRect.top - oRect.top}px,0) scale(1)`,
          `width:${aRect.width}px`,
          `height:${aRect.height}px`,
          "opacity:1"
        ].join(";");
      });
      this.indicatorStyles = styles;
    });
  }

  private get specKeys() {
    return getSpecKeys(this.skus, {
      whitelistKeys: this.specKeyWhitelist,
      excludeKeys: this.specKeyExclude
    });
  }

  private normalizeCurs(keys: string[]) {
    return Array.from({ length: keys.length }, (_, index) => this.curs[index] ?? "");
  }

  private toComparableSet(values: YnSkuSpecValue[] | undefined) {
    return new Set((values ?? []).map(toComparable));
  }

  private getSnapshot(): YnSkuChangeDetail {
    const keys = this.specKeys;
    const curs = this.normalizeCurs(keys);
    const selections = buildSelection(keys, curs);
    const sku = findMatchedSku(this.skus, keys, curs);
    const missingKeys = getMissingKeys(keys, curs);
    return {
      selections,
      sku,
      ready: missingKeys.length === 0 && sku != null && isSkuPurchasable(sku),
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
      if (
        snapshot.missingKeys.length === 0 &&
        snapshot.sku &&
        !isSkuPurchasable(snapshot.sku)
      ) {
        this.hint = this.resolveUnpurchasableHint(snapshot.sku);
      } else {
        this.hint = this.formatHint(snapshot.missingKeys);
      }
      return;
    }
    this.hint = "";
    this.emitSubmit(snapshot.sku, snapshot.selections);
  }

  private resolveUnpurchasableHint(sku: YnSkuItem) {
    if (sku.price == null || Number(sku.price) <= 0) {
      return this.noPriceHint;
    }
    return this.soldOutHint;
  }

  private handleOptionClick(depth: number, value: YnSkuSpecValue) {
    if (this.disabled || this.submitting) return;

    const keys = this.specKeys;
    const curs = this.normalizeCurs(keys);
    const groupHas = buildGroupHas(this.skus, keys, curs);
    const availableSet = this.toComparableSet(groupHas[depth]);
    const comparable = toComparable(value);
    if (!availableSet.has(comparable)) return;

    const next = [...curs];
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

  private formatStockText(sku: YnSkuItem | null | undefined) {
    if (!sku) return "—";

    const manageInventory = sku.manageInventory !== false;
    if (!manageInventory) return this.stockUnlimitedLabel;

    const stock = sku.stock;
    if (stock == null || Number.isNaN(stock)) return "—";

    const qty = Math.max(0, Math.floor(Number(stock)));
    if (qty <= 0 && sku.allowBackorder) {
      return `${qty}（${this.stockBackorderLabel}）`;
    }
    return String(qty);
  }

  private getStockClass(sku: YnSkuItem | null | undefined) {
    if (!sku || sku.manageInventory === false) return "";
    const stock = sku.stock;
    if (stock == null || Number.isNaN(stock)) return "";
    const qty = Math.max(0, Math.floor(Number(stock)));
    if (qty <= 0 && sku.allowBackorder) return "is-backorder";
    if (qty <= 0) return "is-empty";
    return "";
  }

  private handleSubmitClick() {
    this.trySubmit();
  }

  private renderSpecOptions() {
    const keys = this.specKeys;
    const curs = this.normalizeCurs(keys);
    const groupSpec = buildGroupSpec(this.skus, keys);
    const groupHas = buildGroupHas(this.skus, keys, curs);
    const availableSets = groupHas.map((values) => this.toComparableSet(values));
    return groupSpec.map(({ specKey, depth, list }) => html`
      <section class="section" data-depth=${depth} aria-label=${this.resolveLabel(specKey)}>
        ${!this.simple && this.shouldShowSpecLabel(specKey)
          ? html`<p class="label">${this.labels[specKey]}</p>`
          : nothing}
        <div class="options" role="listbox" aria-label=${this.resolveLabel(specKey)}>
          <div class="option-indicator" style=${this.indicatorStyles[depth] ?? "opacity:0;"}></div>
          ${list.map((value) => {
            const comparable = toComparable(value);
            const isActive = curs[depth] === comparable;
            const isAvailable = availableSets[depth]?.has(comparable) ?? false;
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
              ${this.showStock
                ? html`
                    <p
                      class="stock ${this.getStockClass(snapshot.sku)}"
                      aria-live="polite"
                    >
                      ${this.stockLabel}：${this.formatStockText(snapshot.sku)}
                    </p>
                  `
                : nothing}
              ${this.hint ? html`<p class="hint" role="alert">${this.hint}</p>` : html`<p class="hint" aria-hidden="true"></p>`}
              <yn-sku-cart-button
                .label=${this.submitLabel}
                loading-text=${this.loadingText}
                loading-mode=${this.loadingMode}
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

export type {
  YnSkuCartButtonLoadingMode,
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

export type { YnSkuGroupSpec } from "./sku-engine";
export {
  toComparable,
  getSpecKeys,
  buildGroupSpec,
  buildGroupHas,
  buildSelection,
  findMatchedSku,
  getMissingKeys,
  buildFirstAvailableCurs
} from "./sku-engine";

declare global {
  interface HTMLElementTagNameMap {
    "yn-sku-selector": YnSkuSelector;
  }
}
