import { getCountryByCode, getStatesOfCountry } from "@countrystatecity/countries-browser";
import { LitElement, html, nothing, type PropertyValues } from "lit";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";
import { ynSearchCloseSvg } from "../../asset/svg";
import { customElement, property, state } from "lit/decorators.js";
import type { AddressSuggestion } from "./address-providers";
import {
  loadGoogleMaps,
  probePhotonReachable,
  resolveGooglePlace,
  searchGooglePlaces,
  searchPhoton,
} from "./address-providers";
import { checkoutAddressFormStyles } from "./checkout-address-styles";
import {
  enrichCountry,
  isChinaQuery,
  loadCountries,
  peekCountriesCache,
  searchDr5hnRegions,
} from "./dr5hn-region-service";
import type { Dr5hnRegionSuggestion, RegionSearchLevel } from "./dr5hn-region-types";
import { resolveCheckoutMessages } from "./messages";
import { isPostalRequiredForCountry, validateCheckoutAddress } from "./validation";
import {
  probeAddressProvider,
  type AddressProviderMode,
} from "./provider-probe";
import { filterByRegion, passesCountryFilter } from "./region-filter";
import type {
  YnCheckoutAddressChangeDetail,
  YnCheckoutAddressField,
  YnCheckoutAddressLocale,
  YnCheckoutAddressMessages,
  YnCheckoutAddressValidation,
  YnCheckoutAddressValue,
  YnCheckoutExcludeRegions,
  YnCheckoutProvider,
  YnCheckoutRegionFilter,
} from "./types";
import {
  CHECKOUT_FIELD_IDS,
  CHECKOUT_FOCUS_IDS,
  type CheckoutFieldSet,
} from "./field-ids";
import { buildRegionSummary, buildSearchLabel, isSameChangeDetail } from "./value-utils";

const DEBOUNCE_GOOGLE_MS = 280;
const DEBOUNCE_DR5HN_MS = 320;
type ViewMode = "booting" | "region" | "manual" | "checkout";

const PROVIDER_LABEL_KEY: Record<AddressProviderMode, keyof YnCheckoutAddressMessages> = {
  google: "providerGoogle",
  dr5hn: "providerDr5hn",
  manual: "providerManual",
  photon: "providerPhoton",
};

const PROVIDER_HINT_KEY: Record<AddressProviderMode, keyof YnCheckoutAddressMessages> = {
  google: "usageHintGoogle",
  dr5hn: "usageHintDr5hn",
  manual: "usageHintManual",
  photon: "usageHintPhoton",
};

/**
 * 跨境独立站结账地址：优先检测 Google API Key → 无 Key 或 Google 失败则探测 dr5hn CDN
 * → 再不可用则探测 Photon → 三者均不可用则 manual 手动填写（开放国家/地区、省/州、城市编辑）。
 * 运行中 dr5hn 搜索无匹配或失败时清空区域并降级 Photon 用同一关键词重搜；Photon 仍失败则切至 manual。
 * 分步表单（先地区摘要，再联系方式与详细地址）；内置校验；`change` 的 `detail` 为 `{ value, validation }`。
 * 统一 `YnCheckoutAddressValue` 保存、回显与受控 `.value`。
 *
 * 样式：`--yn-checkout-address-bg`（背景色）、`--yn-checkout-address-padding` 等。字体继承宿主，不内置 webfont。
 *
 * @fires change - 地址变化，`detail` 为 `{ value, validation }`
 *
 * @method validate - 执行内置校验，返回 `YnCheckoutAddressValidation`
 * @method reportValidity - 展示字段错误并聚焦第一项
 */
@customElement("yn-checkout-address")
export class YnCheckoutAddress extends LitElement {
  /** 为 true 时在表单下方展示 JSON 调试面板 */
  @property({ type: Boolean, reflect: true }) dev = false;

  @property({ type: Boolean }) disabled = false;

  /** 界面语言；文案可通过 `messages` 局部覆盖（适合店铺 i18n JSON 片段） */
  @property({ type: String }) locale: YnCheckoutAddressLocale = "en";

  /** 局部覆盖内置文案（与店铺 i18n JSON 片段对齐） */
  @property({ attribute: false }) messages?: Partial<YnCheckoutAddressMessages>;

  /**
   * 受控回显值。父组件更新 `.value` 时同步表单，不会重新探测或触发搜索。
   */
  @property({ attribute: false }) value: YnCheckoutAddressValue | null = null;

  /**
   * 排除的国家 / 省州 / 城市（由业务传入；未设置时不排除任何国家，含 CN）。
   */
  @property({ attribute: false }) excludeRegions?: YnCheckoutExcludeRegions;

  /** 非空时仅允许这些国家（ISO2） */
  @property({ attribute: false }) includeCountries?: string[];

  /** Google Maps Places API Key；未设时尝试构建环境变量 `VITE_GOOGLE_MAPS_API_KEY` */
  @property({ type: String, attribute: "google-maps-api-key" }) googleMapsApiKey = "";

  /** 为 true 时展示联系邮箱输入框 */
  @property({ type: Boolean, attribute: "show-email" }) showEmail = false;

  /** 为 true 且 showEmail 时邮箱必填 */
  @property({ type: Boolean, attribute: "email-required" }) emailRequired = false;

  @state() private viewMode: ViewMode = "booting";
  @state() private activeProvider: AddressProviderMode | null = null;
  @state() private probeReason = "";

  @state() private query = "";
  @state() private suggestions: AddressSuggestion[] = [];
  @state() private dr5hnSuggestions: Dr5hnRegionSuggestion[] = [];
  @state() private suggestionsOpen = false;
  @state() private searching = false;
  @state() private searchError = "";

  @state() private countryCode = "";
  @state() private countryName = "";
  @state() private stateCode: string | null = null;
  @state() private stateName: string | null = null;
  @state() private cityId: number | null = null;
  @state() private cityName = "";
  @state() private phonecode = "";
  @state() private currency = "";
  @state() private phoneNumber = "";
  @state() private email = "";
  @state() private line1 = "";
  @state() private line2 = "";
  @state() private postalCode = "";

  private googleReady = false;
  private debounceTimer: number | undefined;
  private abortController: AbortController | undefined;
  private probeAbort?: AbortController;
  @state() private dr5hnRegionLevel: RegionSearchLevel | null = null;
  @state() private showFieldErrors = false;
  @state() private regionEditing = false;
  /** 筛选刷新中：遮盖 manual，避免先闪手填再切回搜索 */
  @state() private filterRefreshing = false;

  private lastEmitted: YnCheckoutAddressChangeDetail | null = null;
  private probeGeneration = 0;
  private suppressEmit = false;
  private validationCache: YnCheckoutAddressValidation | null = null;
  private emitScheduled = false;

  private get msg() {
    return resolveCheckoutMessages(this.locale, this.messages);
  }

  private get regionFilter(): YnCheckoutRegionFilter {
    return {
      excludeRegions: this.excludeRegions,
      includeCountries: this.includeCountries,
    };
  }

  private get isDr5hnMode() {
    return this.activeProvider === "dr5hn";
  }

  private get isManualMode() {
    return this.activeProvider === "manual";
  }

  private get fieldSet(): CheckoutFieldSet {
    return this.isManualMode ? "manual" : this.isDr5hnMode ? "dr5hn" : "google";
  }

  private get fields() {
    return CHECKOUT_FIELD_IDS[this.fieldSet];
  }

  private get layerVis() {
    const vm = this.viewMode;
    const boot = vm === "booting";
    const manual = this.activeProvider === "manual";
    const ap = this.activeProvider;
    return {
      boot,
      main: !boot,
      provider: !boot && !manual && ap != null,
      manual: !boot && manual && !this.filterRefreshing,
      details: vm === "checkout",
      hint: !boot && !manual && ap != null && !this.regionConfirmed,
    };
  }

  private get regionConfirmed() {
    if (this.isManualMode) {
      return Boolean(this.countryCode.trim() && this.cityName.trim());
    }
    if (!this.countryCode.trim()) {
      return false;
    }
    if (this.isDr5hnMode) {
      return this.dr5hnRegionLevel === "city" && Boolean(this.cityId);
    }
    return Boolean(this.cityName.trim());
  }

  private get showRegionSearch() {
    return !this.regionConfirmed || this.regionEditing;
  }

  private syncViewEmit() {
    this.applyViewMode();
    this.emitChange();
  }

  private cancelProbeAndSearch() {
    this.probeGeneration += 1;
    this.probeAbort?.abort();
    this.abortController?.abort();
    window.clearTimeout(this.debounceTimer);
    this.searching = false;
    this.suggestionsOpen = false;
  }

  private startRegionEdit = () => {
    this.regionEditing = true;
    this.suggestionsOpen = false;
    this.updateComplete.then(() => {
      this.shadowRoot?.querySelector<HTMLInputElement>(`#${this.fields.region}`)?.focus();
    });
  };

  override connectedCallback() {
    super.connectedCallback();
    void this.runProbe();
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.probeAbort?.abort();
    this.abortController?.abort();
    window.clearTimeout(this.debounceTimer);
  }

  protected override update(changed: PropertyValues) {
    if (changed.size > 0) {
      this.validationCache = null;
    }
    super.update(changed);
  }

  override willUpdate(changed: Map<string, unknown>) {
    if (changed.has("value")) {
      if (this.value) {
        this.applyExternalValue(this.value);
      } else {
        this.resetFormForEmptyValue();
      }
    }
    if (changed.has("excludeRegions") || changed.has("includeCountries")) {
      this.applyRegionFilterChange();
    }
    if (changed.has("googleMapsApiKey")) {
      void this.runProbe();
    }
  }

  private clearDetailFields() {
    this.phoneNumber = "";
    this.email = "";
    this.line1 = "";
    this.line2 = "";
    this.postalCode = "";
  }

  /** 国家/地区筛选变更：不重新探测；中止进行中的搜索，避免降级到 manual 造成闪动 */
  private applyRegionFilterChange() {
    this.cancelProbeAndSearch();
    if (this.countryCode && !passesCountryFilter(this.countryCode, this.regionFilter)) {
      this.clearRegion();
      this.clearDetailFields();
      this.query = "";
      this.regionEditing = true;
      this.searchError = "";
      this.suggestions = [];
      this.dr5hnSuggestions = [];
    }

    const wasManual = this.isManualMode;
    if (this.activeProvider !== "dr5hn" && !wasManual) {
      this.syncViewEmit();
      return;
    }

    const recoverDr5hn = () => {
      this.activeProvider = "dr5hn";
      this.searchError = "";
      this.syncViewEmit();
    };

    if (wasManual) {
      const cached = peekCountriesCache(this.regionFilter);
      if (cached?.length) {
        recoverDr5hn();
        void loadCountries(this.regionFilter, true);
        return;
      }
      this.filterRefreshing = true;
      this.viewMode = "booting";
    } else {
      this.syncViewEmit();
    }

    void loadCountries(this.regionFilter, true)
      .then(async (countries) => {
        if (countries.length > 0) {
          if (wasManual) recoverDr5hn();
          return;
        }
        if (this.activeProvider === "dr5hn") {
          await this.degradeWhenDr5hnFilteredEmpty();
          this.syncViewEmit();
        }
      })
      .catch(() => this.syncViewEmit())
      .finally(() => {
        this.filterRefreshing = false;
      });
  }

  /** dr5hn 在当前筛选下无国家：尝试 Photon，最后才 manual */
  private async degradeWhenDr5hnFilteredEmpty() {
    try {
      if (await probePhotonReachable()) {
        this.activeProvider = "photon";
        this.probeReason = this.msg.dr5hnFallbackToPhoton;
        await this.syncGoogleMode("photon");
        return;
      }
    } catch {
      /* manual */
    }
    this.activeProvider = "manual";
    this.probeReason = this.msg.servicesUnavailable;
    this.googleReady = false;
  }

  /** 探测开始时原子重置：只保留 booting 视图 */
  private beginBooting() {
    this.viewMode = "booting";
    this.activeProvider = null;
    this.probeReason = "";
    this.googleReady = false;
    this.searching = false;
    this.suggestionsOpen = false;
    this.searchError = "";
    this.regionEditing = false;
    this.showFieldErrors = false;
    this.validationCache = null;
    this.clearRegion();
    this.clearDetailFields();
    this.query = "";
  }

  private applyViewMode(skipIfBooting = false) {
    if (skipIfBooting && this.viewMode === "booting") return;
    if (!this.activeProvider) {
      this.viewMode = "booting";
      return;
    }
    if (this.isManualMode) {
      this.viewMode = this.regionConfirmed ? "checkout" : "manual";
      return;
    }
    this.viewMode = this.regionConfirmed ? "checkout" : "region";
  }

  private resetFormForEmptyValue() {
    this.suppressEmit = true;
    this.query = "";
    this.clearRegion();
    this.clearDetailFields();
    this.dr5hnRegionLevel = null;
    this.suggestions = [];
    this.dr5hnSuggestions = [];
    this.suggestionsOpen = false;
    this.searchError = "";
    this.lastEmitted = null;
    this.applyViewMode(true);
  }

  /** 受控回显：父组件写入 .value 时调用（与 attribute 变更等效） */
  setValue(v: YnCheckoutAddressValue | null) {
    this.value = v;
  }

  private applyExternalValue(v: YnCheckoutAddressValue) {
    this.suppressEmit = true;
    const provider = v.provider as AddressProviderMode | null;
    if (provider) {
      this.activeProvider = provider;
    }
    this.probeReason = v.probeReason || this.probeReason;
    this.countryCode = v.countryCode;
    this.countryName = v.countryName;
    this.stateCode = v.stateCode;
    this.stateName = v.stateName;
    this.cityId = v.cityId;
    this.dr5hnRegionLevel = v.cityId != null ? "city" : null;
    this.cityName = v.cityName;
    this.phonecode = v.phonecode;
    this.currency = v.currency;
    this.phoneNumber = v.phoneNumber;
    this.email = v.email ?? "";
    this.line1 = v.line1;
    this.line2 = v.line2;
    this.postalCode = v.postalCode;
    this.query = buildSearchLabel(v);
    this.lastEmitted = null;
    this.suggestionsOpen = false;
    this.regionEditing = false;
    this.applyViewMode(true);
  }

  private async runProbe() {
    const generation = ++this.probeGeneration;
    const hadProvider = this.activeProvider != null;
    if (!hadProvider) {
      this.beginBooting();
    } else {
      this.probeAbort?.abort();
    }
    this.probeAbort = new AbortController();

    try {
      const result = await probeAddressProvider({
        googleMapsApiKey: this.googleMapsApiKey,
        regionFilter: this.regionFilter,
        signal: this.probeAbort.signal,
      });
      if (generation !== this.probeGeneration) {
        return;
      }
      if (result.mode === "manual") {
        this.activeProvider = "manual";
        this.probeReason = result.reason;
        this.googleReady = false;
      } else {
        this.activeProvider = result.mode;
        this.probeReason = result.reason;
        if (result.mode === "dr5hn") {
          await loadCountries(this.regionFilter);
        }
        if (result.mode === "google" || result.mode === "photon") {
          await this.syncGoogleMode(result.mode);
        }
      }
      if (this.value) {
        this.applyExternalValue(this.value);
        if (
          this.countryCode &&
          !passesCountryFilter(this.countryCode, this.regionFilter)
        ) {
          this.clearRegion();
          this.query = "";
        }
      }
      this.syncViewEmit();
    } catch (error) {
      if ((error as Error).name === "AbortError" || generation !== this.probeGeneration) {
        return;
      }
      this.activeProvider = "manual";
      this.probeReason = this.msg.probeFailed;
      this.googleReady = false;
      this.syncViewEmit();
    }
  }

  private enterManualMode(reason: string) {
    if (this.filterRefreshing) return;
    this.activeProvider = "manual";
    this.probeReason = reason;
    this.searching = false;
    this.suggestionsOpen = false;
    this.googleReady = false;
    this.dr5hnRegionLevel = null;
    this.cityId = null;
    this.stateCode = null;
    this.syncViewEmit();
  }

  private resolveGoogleKey() {
    const key = this.googleMapsApiKey.trim();
    if (key) {
      return key;
    }
    try {
      return import.meta.env.VITE_GOOGLE_MAPS_API_KEY?.trim() ?? "";
    } catch {
      return "";
    }
  }

  private async syncGoogleMode(mode: "google" | "photon") {
    this.googleReady = false;
    if (mode === "google") {
      const key = this.resolveGoogleKey();
      if (key) {
        try {
          await loadGoogleMaps(key);
          this.googleReady = true;
        } catch {
          this.activeProvider = "photon";
        }
      } else {
        this.activeProvider = "photon";
      }
    }
  }

  private providerLabel(mode: AddressProviderMode) {
    return this.msg[PROVIDER_LABEL_KEY[mode]];
  }

  private usageHintForProvider(mode: AddressProviderMode) {
    return this.msg.usageHint?.trim() || this.msg[PROVIDER_HINT_KEY[mode]];
  }

  private buildValidateInput() {
    return {
      provider: this.activeProvider,
      isDr5hn: this.isDr5hnMode,
      isManual: this.isManualMode,
      countryCode: this.countryCode,
      countryName: this.countryName,
      stateName: this.stateName,
      cityName: this.cityName,
      cityId: this.cityId,
      dr5hnRegionLevel: this.dr5hnRegionLevel,
      phoneNumber: this.phoneNumber,
      line1: this.line1,
      postalCode: this.postalCode,
      email: this.email,
      showEmail: this.showEmail,
      emailRequired: this.emailRequired,
      regionFilter: this.regionFilter,
      messages: this.msg,
    };
  }

  private getValidation(force = false): YnCheckoutAddressValidation {
    if (force || !this.validationCache) {
      this.validationCache = validateCheckoutAddress(this.buildValidateInput());
    }
    return this.validationCache;
  }

  /** 执行内置校验（提交订单前调用） */
  validate(): YnCheckoutAddressValidation {
    return this.getValidation(true);
  }

  /** 展示校验错误并聚焦第一个无效字段 */
  reportValidity(): boolean {
    const validation = this.getValidation(true);
    this.showFieldErrors = true;
    this.requestUpdate();
    if (validation.valid) {
      return true;
    }
    const map = CHECKOUT_FOCUS_IDS[this.fieldSet];
    const first = validation.errors[0];
    if (first) {
      const id =
        first.field === "region" && !this.isManualMode ? this.fields.region : map[first.field];
      const el = this.shadowRoot?.querySelector<HTMLElement>(`#${id}`);
      el?.focus();
      el?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
    return false;
  }

  private buildValue(validation?: YnCheckoutAddressValidation): YnCheckoutAddressValue {
    const provider = (this.activeProvider ?? null) as YnCheckoutProvider;
    const v = validation ?? this.getValidation();

    return {
      provider,
      probeReason: this.probeReason,
      countryCode: this.countryCode,
      countryName: this.countryName,
      stateCode: this.stateCode,
      stateName: this.stateName,
      cityName: this.cityName.trim(),
      cityId: this.cityId,
      phonecode: this.phonecode,
      phoneNumber: this.phoneNumber.trim(),
      email: this.email.trim(),
      line1: this.line1.trim(),
      line2: this.line2.trim(),
      postalCode: this.postalCode.trim(),
      currency: this.currency,
      regionComplete: v.regionComplete,
      formReady: v.formReady,
      searchLabel: this.query.trim() || undefined,
    };
  }

  private buildChangeDetail(): YnCheckoutAddressChangeDetail {
    const validation = this.getValidation();
    return {
      value: this.buildValue(validation),
      validation,
    };
  }

  private emitChangeNow() {
    if (this.suppressEmit) {
      this.suppressEmit = false;
      return;
    }
    const detail = this.buildChangeDetail();
    if (isSameChangeDetail(detail, this.lastEmitted)) {
      return;
    }
    this.lastEmitted = {
      value: { ...detail.value },
      validation: {
        ...detail.validation,
        errors: [...detail.validation.errors],
      },
    };
    this.dispatchEvent(
      new CustomEvent<YnCheckoutAddressChangeDetail>("change", {
        detail,
        bubbles: true,
        composed: true,
      }),
    );
  }

  private emitChange() {
    if (this.suppressEmit) {
      this.suppressEmit = false;
      return;
    }
    if (this.emitScheduled) {
      return;
    }
    this.emitScheduled = true;
    queueMicrotask(() => {
      this.emitScheduled = false;
      this.emitChangeNow();
    });
  }

  private fieldError(field: YnCheckoutAddressField) {
    if (!this.showFieldErrors) {
      return nothing;
    }
    const err = this.getValidation().errors.find((e) => e.field === field);
    return err ? html`<p class="hint hint--error" role="alert">${err.message}</p>` : nothing;
  }

  private inputClass(field: YnCheckoutAddressField) {
    if (!this.showFieldErrors) {
      return "";
    }
    const invalid = this.getValidation().errors.some((e) => e.field === field);
    return invalid ? "input--invalid" : "";
  }

  private renderEmailFields(options?: { hideVisibleLabel?: boolean }) {
    if (!this.showEmail) {
      return nothing;
    }
    const labelClass = options?.hideVisibleLabel ? "visually-hidden" : "";
    return html`
      <div class="field field--email">
        <label class=${labelClass} for="yn-ca-email">${this.msg.email}</label>
        <input
          id="yn-ca-email"
          type="email"
          autocomplete="email"
          placeholder=${this.msg.emailPlaceholder}
          aria-label=${options?.hideVisibleLabel ? this.msg.email : nothing}
          ?disabled=${this.disabled}
          class=${this.inputClass("email")}
          .value=${this.email}
          @input=${this.handleFieldInput("email")}
        />
        ${this.fieldError("email")}
      </div>
    `;
  }

  private isPostalRequired() {
    return isPostalRequiredForCountry(this.countryCode);
  }

  private renderPostalField(inputId: string, options?: { compact?: boolean }) {
    const required = this.isPostalRequired();
    const mark = required ? this.msg.fieldMarkRequired : this.msg.fieldMarkOptional;
    const placeholder = required
      ? `${this.msg.postal}（${this.msg.postalPlaceholderRequired}）`
      : `${this.msg.postal}（${this.msg.postalPlaceholder}）`;

    if (options?.compact) {
      return html`
        <div class="field field--compact-postal">
          <input
            id=${inputId}
            autocomplete="postal-code"
            placeholder=${placeholder}
            aria-label=${this.msg.postal}
            ?disabled=${this.disabled}
            ?required=${required}
            aria-required=${required ? "true" : "false"}
            class=${this.inputClass("postalCode")}
            .value=${this.postalCode}
            @input=${this.handleFieldInput("postalCode")}
          />
          ${this.fieldError("postalCode")}
        </div>
      `;
    }

    return html`
      <div class="field">
        <label class="field-label" for=${inputId}>
          ${this.msg.postal}
          <span class="field-mark ${required ? "field-mark--required" : "field-mark--optional"}"
            >${mark}</span
          >
        </label>
        <input
          id=${inputId}
          autocomplete="postal-code"
          placeholder=${placeholder}
          ?disabled=${this.disabled}
          ?required=${required}
          aria-required=${required ? "true" : "false"}
          class=${this.inputClass("postalCode")}
          .value=${this.postalCode}
          @input=${this.handleFieldInput("postalCode")}
        />
        ${this.fieldError("postalCode")}
      </div>
    `;
  }

  private phoneInputWrapClass() {
    const base = "phone-input";
    if (!this.showFieldErrors) {
      return base;
    }
    const invalid = this.getValidation().errors.some((e) => e.field === "phoneNumber");
    return invalid ? `${base} phone-input--invalid` : base;
  }

  private renderContactSection(phoneInputId: string) {
    const phonePrefix = this.phonecode ? `+${this.phonecode}` : this.msg.phonePrefixEmpty;
    const sectionTitle = this.showEmail ? this.msg.sectionContactDetails : this.msg.sectionContact;
    const phoneDisabled =
      this.disabled || (!this.isManualMode && this.activeProvider === "dr5hn" && !this.phonecode);

    return html`
      <div class="contact-section" aria-labelledby="yn-ca-contact-heading">
        <h3 id="yn-ca-contact-heading" class="panel-title">${sectionTitle}</h3>
        ${this.renderEmailFields({ hideVisibleLabel: this.showEmail })}
        <div class="field field--phone">
          <label class="field-label" for=${phoneInputId}>${this.msg.phoneNumber}</label>
          <div class=${this.phoneInputWrapClass()}>
            ${this.phonecode
              ? html`<span
                  id="${phoneInputId}-prefix"
                  class="phone-input__prefix"
                  aria-label="${this.msg.phoneDial} ${phonePrefix}"
                  >${phonePrefix}</span
                >`
              : html`<span class="phone-input__prefix phone-input__prefix--empty" aria-hidden="true"
                  >${phonePrefix}</span
                >`}
            <input
              id=${phoneInputId}
              class="phone-input__control"
              type="tel"
              inputmode="numeric"
              autocomplete="tel-national"
              placeholder=${this.msg.phonePlaceholder}
              aria-describedby=${this.phonecode ? `${phoneInputId}-prefix` : nothing}
              ?disabled=${phoneDisabled}
              .value=${this.phoneNumber}
              @input=${this.handleFieldInput("phone")}
            />
          </div>
          ${this.fieldError("phoneNumber")}
        </div>
      </div>
    `;
  }

  private clearRegion() {
    this.countryCode = "";
    this.countryName = "";
    this.stateCode = null;
    this.stateName = null;
    this.cityId = null;
    this.cityName = "";
    this.phonecode = "";
    this.currency = "";
    this.dr5hnRegionLevel = null;
  }

  private async resolveStateCode(country: string, name: string | null) {
    if (!country || !name) {
      return null;
    }
    try {
      const states = await getStatesOfCountry(country);
      const hit =
        states.find((s) => s.iso2 === name || s.name === name) ??
        states.find((s) => name.includes(s.name) || s.name.includes(name));
      return hit?.iso2 ?? null;
    } catch {
      return null;
    }
  }

  private async applyCountryMeta(code: string) {
    if (!code) {
      return;
    }
    try {
      const meta = await getCountryByCode(code);
      if (meta) {
        this.phonecode = meta.phonecode;
        this.currency = meta.currency;
        this.countryName = meta.name;
      }
    } catch {
      /* optional */
    }
  }

  private async applyGoogleSuggestion(suggestion: AddressSuggestion) {
    let resolved = suggestion;
    const useGoogle =
      this.activeProvider === "google" && this.googleReady && !suggestion.id.startsWith("photon-");

    if (useGoogle) {
      try {
        const detail = await resolveGooglePlace(suggestion.id);
        if (detail) {
          resolved = { ...detail, label: suggestion.label };
        }
      } catch {
        /* keep list row */
      }
    }

    if (!filterByRegion([resolved], this.regionFilter).length) {
      this.searchError = this.msg.regionSearchNoResults;
      return;
    }

    this.line1 = resolved.line1;
    this.cityName = resolved.city;
    this.stateName = resolved.stateName;
    this.postalCode = resolved.postalCode;
    this.countryCode = resolved.countryCode;
    this.countryName = resolved.countryName;
    this.stateCode = await this.resolveStateCode(resolved.countryCode, resolved.stateName);
    await this.applyCountryMeta(resolved.countryCode);
    this.query = resolved.label;
    this.suggestionsOpen = false;
    this.searchError = "";
    this.regionEditing = false;
    this.syncViewEmit();
  }

  private applyDr5hnRegion(item: Dr5hnRegionSuggestion) {
    this.countryCode = item.countryCode;
    this.countryName = item.countryName;
    this.stateCode = item.stateCode;
    this.stateName = item.stateName;
    this.cityId = item.cityId;
    this.cityName = item.cityName;
    this.dr5hnRegionLevel = item.level;
    this.phonecode = item.phonecode;
    this.currency = item.currency;
    this.query = item.label;
    this.suggestionsOpen = false;
    this.regionEditing = item.level !== "city";
    this.searchError =
      item.level === "country"
        ? this.msg.regionSearchCountryOnly
        : item.level === "state"
          ? this.msg.regionSearchStateOnly
          : "";
    this.syncViewEmit();
    void enrichCountry(item.countryCode, item).then((meta) => {
      this.countryName = meta.countryName;
      this.phonecode = meta.phonecode;
      this.currency = meta.currency;
      this.emitChange();
    });
  }

  private scheduleSearch(value: string) {
    window.clearTimeout(this.debounceTimer);
    this.abortController?.abort();

    const minLen = this.isDr5hnMode ? 2 : 3;
    if (value.trim().length < minLen) {
      this.suggestions = [];
      this.dr5hnSuggestions = [];
      this.suggestionsOpen = false;
      this.searching = false;
      return;
    }

    const ms = this.isDr5hnMode ? DEBOUNCE_DR5HN_MS : DEBOUNCE_GOOGLE_MS;
    this.debounceTimer = window.setTimeout(() => {
      void this.runSearch(value.trim());
    }, ms);
  }

  /** dr5hn 无数据或请求失败：清空已选区域并切到 Photon，用同一关键词重搜 */
  private async switchToPhotonFromDr5hn(query: string, signal: AbortSignal) {
    if (this.activeProvider !== "dr5hn" || signal.aborted) {
      return;
    }

    this.clearRegion();
    this.dr5hnSuggestions = [];
    this.suggestions = [];
    this.suggestionsOpen = false;
    this.activeProvider = "photon";
    this.probeReason = this.msg.dr5hnFallbackToPhoton;
    await this.syncGoogleMode("photon");
    this.searchError = "";
    this.emitChange();

    if (query.trim().length < 3) {
      return;
    }

    try {
      const items = await searchPhoton(query, signal);
      if (signal.aborted) {
        return;
      }
      this.suggestions = filterByRegion(items, this.regionFilter);
      this.suggestionsOpen = this.suggestions.length > 0;
      if (this.suggestions.length === 0) {
        this.searchError = this.msg.searchFailed;
      }
    } catch {
      if (!signal.aborted) {
        this.enterManualMode(this.msg.servicesUnavailable);
      }
    }
  }

  private async runAddressSearch(value: string, signal: AbortSignal) {
    try {
      let items: AddressSuggestion[] = [];
      if (this.activeProvider === "google" && this.googleReady) {
        items = await searchGooglePlaces(value, this.countryCode || undefined);
      } else {
        items = await searchPhoton(value, signal);
      }
      if (signal.aborted) {
        return;
      }
      this.suggestions = filterByRegion(items, this.regionFilter);
      this.suggestionsOpen = this.suggestions.length > 0;
      if (this.suggestions.length === 0) {
        this.searchError = this.msg.searchFailed;
      }
    } catch {
      if (!signal.aborted) {
        this.enterManualMode(this.msg.servicesUnavailable);
      }
    }
  }

  private async runSearch(value: string) {
    this.searching = true;
    this.searchError = "";
    this.abortController = new AbortController();
    const signal = this.abortController.signal;

    try {
      if (this.isDr5hnMode) {
        try {
          this.dr5hnSuggestions = await searchDr5hnRegions(value, signal, this.regionFilter);
        } catch {
          if (!signal.aborted) {
            await this.switchToPhotonFromDr5hn(value, signal);
          }
          return;
        }

        if (signal.aborted) {
          return;
        }

        if (this.dr5hnSuggestions.length === 0) {
          await this.switchToPhotonFromDr5hn(value, signal);
          return;
        }

        this.suggestionsOpen = true;
        if (isChinaQuery(value, this.regionFilter)) {
          this.searchError = this.msg.regionSearchChinaExcluded;
        }
      } else {
        await this.runAddressSearch(value, signal);
      }
    } catch {
      if (!signal.aborted) {
        if (this.activeProvider === "dr5hn") {
          await this.switchToPhotonFromDr5hn(value, signal);
          return;
        }
        if (this.activeProvider === "photon" || this.activeProvider === "google") {
          this.enterManualMode(this.msg.servicesUnavailable);
        } else {
          this.searchError = this.msg.searchFailed;
          this.suggestions = [];
          this.dr5hnSuggestions = [];
          this.suggestionsOpen = false;
        }
      }
    } finally {
      if (!signal.aborted) {
        this.searching = false;
      }
    }
  }

  private handleSearchInput = (event: Event) => {
    const input = event.target as HTMLInputElement;
    this.query = input.value;
    if (this.isDr5hnMode) {
      this.clearRegion();
      this.searchError = "";
      this.emitChange();
    }
    this.scheduleSearch(input.value);
  };

  private clearSearch = () => {
    this.query = "";
    this.searchError = "";
    this.suggestions = [];
    this.dr5hnSuggestions = [];
    this.suggestionsOpen = false;
    this.regionEditing = true;
    this.clearRegion();
    this.syncViewEmit();
    this.shadowRoot?.querySelector<HTMLInputElement>(`#${this.fields.region}`)?.focus();
  };

  private onManualField =
    (field: "countryName" | "countryCode" | "stateName" | "cityName") => (event: Event) => {
      const input = event.target as HTMLInputElement;
      if (field === "countryName") {
        this.countryName = input.value;
      } else if (field === "countryCode") {
        const code = input.value.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 2);
        input.value = code;
        this.countryCode = code;
        void this.applyCountryMeta(code);
      } else if (field === "stateName") {
        this.stateName = input.value;
        this.stateCode = null;
      } else {
        this.cityName = input.value;
        this.cityId = null;
        this.dr5hnRegionLevel = null;
      }
      this.syncViewEmit();
    };

  private handleFieldInput =
    (field: "line1" | "line2" | "postalCode" | "phone" | "email") => (event: Event) => {
      const input = event.target as HTMLInputElement;
      if (field === "line1") this.line1 = input.value;
      if (field === "line2") this.line2 = input.value;
      if (field === "postalCode") this.postalCode = input.value;
      if (field === "phone") this.phoneNumber = input.value.replace(/\D/g, "");
      if (field === "email") this.email = input.value;
      this.emitChange();
    };

  private dr5hnLevelLabel(level: Dr5hnRegionSuggestion["level"]) {
    const key =
      level === "city"
        ? "regionSearchLevelCity"
        : level === "state"
          ? "regionSearchLevelState"
          : "regionSearchLevelCountry";
    return this.msg[key];
  }

  private renderSkeleton() {
    return html`
      <div class="stack skeleton-stack" aria-busy="true" aria-live="polite">
        <p class="skeleton-hint">${this.msg.probing}</p>
        <div class="form-panel form-panel--region skeleton-panel">
          <div class="skeleton-line skeleton-line--label"></div>
          <div class="skeleton-line skeleton-line--field"></div>
        </div>
      </div>
    `;
  }

  private renderRegionSummary() {
    return html`
      <div class="region-summary">
        <div class="region-summary__main">
          <span class="region-summary__kicker">${this.msg.sectionRegion}</span>
          <p class="region-summary__value">
            ${buildRegionSummary({
              searchLabel: this.query,
              cityName: this.cityName,
              stateName: this.stateName,
              countryName: this.countryName,
              countryCode: this.countryCode,
            })}
          </p>
        </div>
        <button
          type="button"
          class="region-summary__edit"
          ?disabled=${this.disabled}
          @click=${this.startRegionEdit}
        >
          ${this.msg.regionEdit}
        </button>
      </div>
    `;
  }

  private renderSearch() {
    const searchId = this.fields.region;
    const label = this.isDr5hnMode
      ? this.msg.regionSearchLabel
      : this.msg.addressSearchLabel;
    const placeholder = this.isDr5hnMode
      ? this.msg.regionSearchPlaceholder
      : this.msg.addressSearchPlaceholder;

    const showClear = Boolean(this.query.trim()) && !this.disabled;

    return html`
      <div class="field search-wrap">
        <label class="field-label" for=${searchId}>${label}</label>
        <div class="search-field">
          <input
            id=${searchId}
            class="search-field__input ${this.inputClass("region")}"
            type="text"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded=${this.suggestionsOpen ? "true" : "false"}
            autocomplete="off"
            placeholder=${placeholder}
            ?disabled=${this.disabled}
            .value=${this.query}
            @input=${this.handleSearchInput}
          />
          ${showClear
            ? html`
                <button
                  type="button"
                  class="search-field__clear"
                  aria-label=${this.msg.searchClear}
                  @click=${this.clearSearch}
                >
                  ${unsafeSVG(ynSearchCloseSvg)}
                </button>
              `
            : nothing}
        </div>
        ${this.fieldError("region")}
        ${this.searching ? html`<p class="hint">${this.msg.searching}</p>` : nothing}
        ${this.searchError
          ? html`<p class="hint ${this.isDr5hnMode ? "hint--warn" : "hint--error"}">${this.searchError}</p>`
          : nothing}
        ${this.suggestionsOpen
          ? html`
              <ul class="dropdown" role="listbox">
                ${this.isDr5hnMode
                  ? this.dr5hnSuggestions.map(
                      (item) => html`
                        <li>
                          <button type="button" @click=${() => this.applyDr5hnRegion(item)}>
                            ${item.label}
                            <span class="meta">${this.dr5hnLevelLabel(item.level)}</span>
                          </button>
                        </li>
                      `,
                    )
                  : this.suggestions.map(
                      (item) => html`
                        <li>
                          <button type="button" @click=${() => void this.applyGoogleSuggestion(item)}>
                            ${item.label}
                          </button>
                        </li>
                      `,
                    )}
              </ul>
            `
          : nothing}
      </div>
    `;
  }

  private renderRegionPanel() {
    return html`
      <section class="form-panel form-panel--region">
        ${this.showRegionSearch ? this.renderSearch() : this.renderRegionSummary()}
      </section>
    `;
  }

  private renderAddressPanel(line1Id: string, line2Id: string, zipId: string) {
    return html`
      <section class="form-panel form-panel--address">
        <h3 class="panel-title">${this.msg.sectionAddress}</h3>
        <div class="field">
          <input
            id=${line1Id}
            autocomplete="address-line1"
            aria-label=${this.msg.detailAddress}
            placeholder=${this.msg.detailAddressPlaceholder}
            ?disabled=${this.disabled}
            class=${this.inputClass("line1")}
            .value=${this.line1}
            @input=${this.handleFieldInput("line1")}
          />
          ${this.fieldError("line1")}
        </div>
        <div class="fields-secondary">
          <input
            id=${line2Id}
            autocomplete="address-line2"
            aria-label=${this.msg.detailAddress2}
            placeholder=${this.msg.detailAddress2Placeholder}
            ?disabled=${this.disabled}
            .value=${this.line2}
            @input=${this.handleFieldInput("line2")}
          />
          ${this.renderPostalField(zipId, { compact: true })}
        </div>
      </section>
    `;
  }

  private renderDetailsPanels(phoneId: string, line1Id: string, line2Id: string, zipId: string) {
    return html`
      <section class="form-panel form-panel--contact form-panel--details">
        ${this.renderContactSection(phoneId)}
      </section>
      <div class="form-panel--details">${this.renderAddressPanel(line1Id, line2Id, zipId)}</div>
    `;
  }

  private renderCheckoutDetails() {
    const { phone, line1, line2, zip } = this.fields;
    return this.renderDetailsPanels(phone, line1, line2, zip);
  }

  private renderDevPanel() {
    if (!this.dev) {
      return nothing;
    }
    const detail = this.buildChangeDetail();
    const mode = this.activeProvider;
    return html`
      <aside class="dev-panel" aria-label=${this.msg.devPanelTitle}>
        <strong>${this.msg.devPanelTitle}</strong>
        <p class="dev-meta">
          ${this.msg.activeProvider}
          ${mode ? this.providerLabel(mode) : "—"} · ${this.probeReason}
        </p>
        <p class="dev-meta">
          valid: ${detail.validation.valid} · formReady: ${detail.value.formReady} · errors:
          ${detail.validation.errors.length}
        </p>
        <pre>${JSON.stringify(detail, null, 2)}</pre>
      </aside>
    `;
  }

  private renderManualBanner() {
    return html`
      <div class="banner banner--warn">
        <p>${this.usageHintForProvider("manual")}</p>
        <button type="button" class="retry" @click=${() => void this.runProbe()}>
          ${this.msg.retryProbe}
        </button>
      </div>
    `;
  }

  private renderManualRegionSection() {
    return html`
      <section class="form-panel form-panel--region manual-region" aria-labelledby="yn-ca-manual-region-heading">
        <h3 id="yn-ca-manual-region-heading" class="panel-title">${this.msg.sectionRegion}</h3>
        <div class="field">
          <label class="field-label" for="yn-ca-m-country-name">${this.msg.country}</label>
          <input
            id="yn-ca-m-country-name"
            type="text"
            autocomplete="country-name"
            ?disabled=${this.disabled}
            .value=${this.countryName}
            @input=${this.onManualField("countryName")}
          />
        </div>
        <div class="grid-3">
          <div class="field">
            <label class="field-label" for="yn-ca-m-country-code">${this.msg.manualCountryCodeLabel}</label>
            <input
              id="yn-ca-m-country-code"
              type="text"
              inputmode="text"
              autocomplete="off"
              maxlength="2"
              placeholder=${this.msg.manualCountryCodePlaceholder}
              ?disabled=${this.disabled}
              class=${this.inputClass("region")}
              .value=${this.countryCode}
              @input=${this.onManualField("countryCode")}
            />
          </div>
          <div class="field">
            <label class="field-label" for="yn-ca-m-state">${this.msg.state}</label>
            <input
              id="yn-ca-m-state"
              type="text"
              autocomplete="address-level1"
              ?disabled=${this.disabled}
              .value=${this.stateName ?? ""}
              @input=${this.onManualField("stateName")}
            />
          </div>
          <div class="field">
            <label class="field-label" for="yn-ca-m-city">${this.msg.cityDistrict}</label>
            <input
              id="yn-ca-m-city"
              type="text"
              autocomplete="address-level2"
              ?disabled=${this.disabled}
              .value=${this.cityName}
              @input=${this.onManualField("cityName")}
            />
          </div>
        </div>
        ${this.fieldError("region")}
      </section>
    `;
  }

  static styles = checkoutAddressFormStyles;

  /** 固定 DOM 结构，用 hidden / data-view 控制显隐，避免切换筛选时整块挂载/卸载导致闪动 */
  override render() {
    const L = this.layerVis;
    const ap = this.activeProvider;

    return html`
      <div class="checkout-address" data-view=${this.viewMode}>
        <div class="layer layer-booting" ?hidden=${!L.boot}>${this.renderSkeleton()}</div>
        <div class="stack layer layer-main" ?hidden=${!L.main}>
          <div class="layer layer-provider" ?hidden=${!L.provider}>
            ${L.hint && ap
              ? html`<p class="banner banner--hint">${this.usageHintForProvider(ap)}</p>`
              : nothing}
            ${this.renderRegionPanel()}
          </div>
          <div class="layer layer-manual" ?hidden=${!L.manual}>
            ${this.renderManualBanner()}${this.renderManualRegionSection()}
          </div>
          <div class="layer layer-details" ?hidden=${!L.details} ?inert=${!L.details}>
            ${this.renderCheckoutDetails()}
          </div>
          ${this.renderDevPanel()}
        </div>
      </div>
    `;
  }
}

export type {
  YnCheckoutAddressChangeDetail,
  YnCheckoutAddressField,
  YnCheckoutAddressErrorCode,
  YnCheckoutAddressLocale,
  YnCheckoutAddressMessages,
  YnCheckoutAddressValidation,
  YnCheckoutAddressValidationError,
  YnCheckoutAddressValue,
  YnCheckoutExcludeRegions,
  YnCheckoutProvider,
  YnCheckoutRegionFilter,
} from "./types";
export {
  validateCheckoutAddress,
  POSTAL_REQUIRED_COUNTRIES,
  isPostalRequiredForCountry,
} from "./validation";
export { emptyCheckoutAddressValue } from "./types";

declare global {
  interface HTMLElementTagNameMap {
    "yn-checkout-address": YnCheckoutAddress;
  }
}
