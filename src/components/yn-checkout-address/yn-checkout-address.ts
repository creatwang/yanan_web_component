import { getCountryByCode, getStatesOfCountry } from "@countrystatecity/countries-browser";
import { LitElement, html, nothing } from "lit";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";
import { ynSearchCloseSvg } from "../../asset/svg";
import { customElement, property, state } from "lit/decorators.js";
import type { AddressSuggestion } from "./address-providers";
import {
  loadGoogleMaps,
  resolveGooglePlace,
  searchGooglePlaces,
  searchPhoton,
} from "./address-providers";
import { checkoutAddressFormStyles } from "./checkout-address-styles";
import {
  enrichCountry,
  isChinaQuery,
  loadCountries,
  searchDr5hnRegions,
} from "./dr5hn-region-service";
import type { Dr5hnRegionSuggestion, RegionSearchLevel } from "./dr5hn-region-types";
import { resolveCheckoutMessages } from "./messages";
import {
  fieldToInputId,
  fieldToInputIdDr5hn,
  isPostalRequiredForCountry,
  validateCheckoutAddress,
} from "./validation";
import {
  probeAddressProvider,
  type AddressProviderMode,
} from "./provider-probe";
import { filterByRegion } from "./region-filter";
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
import { buildSearchLabel, isSameChangeDetail } from "./value-utils";

const DEBOUNCE_GOOGLE_MS = 280;
const DEBOUNCE_DR5HN_MS = 320;

type ProbePhase = "probing" | "ready" | "error";

/**
 * 跨境独立站结账地址：优先 Google Key → 探测 dr5hn → Photon；
 * dr5hn 搜索无匹配或失败时清空区域并运行时降级 Photon。
 * 统一 `YnCheckoutAddressValue` 用于保存、回显与编辑。
 *
 * 样式：`--yn-checkout-address-bg`（背景色）、`--yn-checkout-address-padding` 等。
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

  @state() private phase: ProbePhase = "probing";
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

  private lastEmitted: YnCheckoutAddressChangeDetail | null = null;
  private suppressEmit = false;

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

  override connectedCallback() {
    super.connectedCallback();
    if (this.value) {
      this.applyExternalValue(this.value);
    }
    void this.runProbe();
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.probeAbort?.abort();
    this.abortController?.abort();
    window.clearTimeout(this.debounceTimer);
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
      void loadCountries(this.regionFilter, true);
      if (this.phase === "ready") {
        void this.runProbe();
      }
    }
    if (changed.has("googleMapsApiKey")) {
      void this.runProbe();
    }
  }

  private resetFormForEmptyValue() {
    this.suppressEmit = true;
    this.query = "";
    this.clearRegion();
    this.line1 = "";
    this.line2 = "";
    this.postalCode = "";
    this.phoneNumber = "";
    this.email = "";
    this.dr5hnRegionLevel = null;
    this.suggestions = [];
    this.dr5hnSuggestions = [];
    this.suggestionsOpen = false;
    this.searchError = "";
    this.lastEmitted = null;
  }

  /** 受控回显：父组件写入 .value 时调用（与 attribute 变更等效） */
  setValue(v: YnCheckoutAddressValue | null) {
    this.value = v;
  }

  private hasEchoValue() {
    return Boolean(this.value?.countryCode?.trim());
  }

  private applyExternalValue(v: YnCheckoutAddressValue) {
    this.suppressEmit = true;
    this.activeProvider = (v.provider as AddressProviderMode) ?? this.activeProvider;
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
  }

  private async runProbe() {
    this.phase = "probing";
    this.probeAbort?.abort();
    this.probeAbort = new AbortController();

    try {
      const result = await probeAddressProvider({
        googleMapsApiKey: this.googleMapsApiKey,
        regionFilter: this.regionFilter,
        signal: this.probeAbort.signal,
      });
      this.activeProvider = result.mode;
      this.probeReason = result.reason;
      this.phase = "ready";
      if (result.mode === "dr5hn") {
        void loadCountries(this.regionFilter);
      }
      if (result.mode === "google" || result.mode === "photon") {
        void this.syncGoogleMode(result.mode);
      }
      if (this.value) {
        this.applyExternalValue(this.value);
      } else {
        this.emitChange();
      }
    } catch (error) {
      if ((error as Error).name === "AbortError") {
        return;
      }
      this.phase = "error";
      this.activeProvider = "photon";
      this.probeReason = this.msg.probeFailedFallback;
      void this.syncGoogleMode("photon");
      this.emitChange();
    }
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
    if (mode === "google") return this.msg.providerGoogle;
    if (mode === "dr5hn") return this.msg.providerDr5hn;
    return this.msg.providerPhoton;
  }

  /** 表单顶部用户指引（可通过 messages.usageHint* 或 usageHint 覆盖） */
  private usageHintForProvider(mode: AddressProviderMode) {
    if (this.msg.usageHint?.trim()) {
      return this.msg.usageHint.trim();
    }
    if (mode === "google") return this.msg.usageHintGoogle;
    if (mode === "dr5hn") return this.msg.usageHintDr5hn;
    return this.msg.usageHintPhoton;
  }

  private buildValidateInput() {
    return {
      provider: this.activeProvider,
      isDr5hn: this.isDr5hnMode,
      countryCode: this.countryCode,
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

  /** 执行内置校验（提交订单前调用） */
  validate(): YnCheckoutAddressValidation {
    return validateCheckoutAddress(this.buildValidateInput());
  }

  /** 展示校验错误并聚焦第一个无效字段 */
  reportValidity(): boolean {
    const validation = this.validate();
    this.showFieldErrors = true;
    this.requestUpdate();
    if (validation.valid) {
      return true;
    }
    const map = this.isDr5hnMode ? fieldToInputIdDr5hn : fieldToInputId;
    const first = validation.errors[0];
    if (first) {
      const id = map[first.field];
      const searchId = this.isDr5hnMode ? "yn-ca-region" : "yn-ca-address";
      const el = this.shadowRoot?.querySelector<HTMLElement>(
        first.field === "region" ? `#${searchId}` : `#${id}`,
      );
      el?.focus();
      el?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
    return false;
  }

  private buildValue(validation?: YnCheckoutAddressValidation): YnCheckoutAddressValue {
    const provider = (this.activeProvider ?? null) as YnCheckoutProvider;
    const v = validation ?? this.validate();

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
    const validation = this.validate();
    return {
      value: this.buildValue(validation),
      validation,
    };
  }

  private emitChange() {
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

  private fieldError(field: YnCheckoutAddressField) {
    if (!this.showFieldErrors) {
      return nothing;
    }
    const err = this.validate().errors.find((e) => e.field === field);
    return err ? html`<p class="hint hint--error" role="alert">${err.message}</p>` : nothing;
  }

  private inputClass(field: YnCheckoutAddressField) {
    if (!this.showFieldErrors) {
      return "";
    }
    const invalid = this.validate().errors.some((e) => e.field === field);
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

  private renderPostalField(inputId: string) {
    const required = this.isPostalRequired();
    const mark = required ? this.msg.fieldMarkRequired : this.msg.fieldMarkOptional;
    const placeholder = required ? this.msg.postalPlaceholderRequired : this.msg.postalPlaceholder;

    return html`
      <div class="field">
        <label for=${inputId}>
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
    const invalid = this.validate().errors.some((e) => e.field === "phoneNumber");
    return invalid ? `${base} phone-input--invalid` : base;
  }

  private renderContactSection(phoneInputId: string) {
    const phonePrefix = this.phonecode ? `+${this.phonecode}` : this.msg.phonePrefixEmpty;
    const sectionTitle = this.showEmail ? this.msg.sectionContactDetails : this.msg.sectionContact;
    const phoneDisabled = this.disabled || (this.activeProvider === "dr5hn" && !this.phonecode);

    return html`
      <section class="contact-section" aria-labelledby="yn-ca-contact-heading">
        <p id="yn-ca-contact-heading" class="section-title">${sectionTitle}</p>
        ${this.renderEmailFields({ hideVisibleLabel: this.showEmail })}
        <div class="field field--phone">
          <label for=${phoneInputId}>${this.msg.phoneNumber}</label>
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
      </section>
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
    this.emitChange();
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
    this.searchError =
      item.level === "country"
        ? this.msg.regionSearchCountryOnly
        : item.level === "state"
          ? this.msg.regionSearchStateOnly
          : "";
    this.emitChange();
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

    const items = await searchPhoton(query, signal);
    if (signal.aborted) {
      return;
    }
    this.suggestions = filterByRegion(items, this.regionFilter);
    this.suggestionsOpen = this.suggestions.length > 0;
    if (this.suggestions.length === 0) {
      this.searchError = this.msg.searchFailed;
    }
  }

  private async runAddressSearch(value: string, signal: AbortSignal) {
    let items: AddressSuggestion[] = [];
    if (this.activeProvider === "google" && this.googleReady) {
      items = await searchGooglePlaces(value, this.countryCode || undefined);
    } else {
      items = await searchPhoton(value, signal);
    }
    this.suggestions = filterByRegion(items, this.regionFilter);
    this.suggestionsOpen = this.suggestions.length > 0;
    if (this.suggestions.length === 0) {
      this.searchError = this.msg.searchFailed;
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
        this.searchError = this.msg.searchFailed;
        this.suggestions = [];
        this.dr5hnSuggestions = [];
        this.suggestionsOpen = false;
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
    this.clearRegion();
    this.emitChange();
    const searchId = this.isDr5hnMode ? "yn-ca-region" : "yn-ca-address";
    this.shadowRoot?.querySelector<HTMLInputElement>(`#${searchId}`)?.focus();
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
    if (level === "city") return this.msg.regionSearchLevelCity;
    if (level === "state") return this.msg.regionSearchLevelState;
    return this.msg.regionSearchLevelCountry;
  }

  private renderSkeleton() {
    return html`
      <div class="skeleton-stack" aria-busy="true" aria-live="polite">
        <p class="skeleton-hint">${this.msg.probing}</p>
        <div class="skeleton-line skeleton-line--banner"></div>
        <div class="skeleton-line skeleton-line--short"></div>
        <div class="skeleton-line skeleton-line--field"></div>
        <div class="skeleton-grid-2">
          <div class="skeleton-line skeleton-line--field"></div>
          <div class="skeleton-line skeleton-line--field"></div>
        </div>
        <div class="skeleton-line skeleton-line--field"></div>
      </div>
    `;
  }

  private renderSearch() {
    const searchId = this.isDr5hnMode ? "yn-ca-region" : "yn-ca-address";
    const label = this.isDr5hnMode
      ? this.msg.regionSearchLabel
      : this.msg.addressSearchLabel;
    const placeholder = this.isDr5hnMode
      ? this.msg.regionSearchPlaceholder
      : this.msg.addressSearchPlaceholder;

    const showClear = Boolean(this.query.trim()) && !this.disabled;

    return html`
      <div class="field search-wrap">
        <label for=${searchId}>${label}</label>
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

  private renderGoogleFields() {
    const hasRegion = Boolean(this.countryCode);

    if (!hasRegion) {
      return nothing;
    }

    return html`
      <div class="grid-2">
        <div class="field">
          <label>${this.msg.cityDistrict}</label>
          <div class="readonly">${this.cityName || this.msg.empty}</div>
        </div>
        <div class="field">
          <label>${this.msg.state}</label>
          <div class="readonly">
            ${this.stateName ?? this.msg.empty}${this.stateCode ? ` (${this.stateCode})` : ""}
          </div>
        </div>
      </div>
      <div class="field">
        <label>${this.msg.country}</label>
        <div class="readonly">${this.countryName} (${this.countryCode})</div>
      </div>
      <section class="address-section" aria-labelledby="yn-ca-address-heading">
        <p id="yn-ca-address-heading" class="section-title">${this.msg.sectionAddress}</p>
        <div class="field">
          <input
            id="yn-ca-line1"
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
        <div class="grid-2">
          <div class="field">
            <label for="yn-ca-line2">${this.msg.detailAddress2}</label>
            <input
              id="yn-ca-line2"
              placeholder=${this.msg.detailAddress2Placeholder}
              ?disabled=${this.disabled}
              .value=${this.line2}
              @input=${this.handleFieldInput("line2")}
            />
          </div>
          ${this.renderPostalField("yn-ca-zip")}
        </div>
      </section>
      ${this.renderContactSection("yn-ca-phone")}
    `;
  }

  private renderDr5hnFields() {
    const hasRegion = Boolean(this.countryCode);

    if (!hasRegion) {
      return nothing;
    }

    return html`
      <p class="section-title">${this.msg.sectionRegion}</p>
      <div class="grid-3">
        <div class="field">
          <label>${this.msg.country}</label>
          <div class="readonly">${this.countryName} (${this.countryCode})</div>
        </div>
        <div class="field">
          <label>${this.msg.state}</label>
          <div class="readonly">
            ${this.stateName ?? this.msg.empty}${this.stateCode ? ` (${this.stateCode})` : ""}
          </div>
        </div>
        <div class="field">
          <label>${this.msg.cityDistrict}</label>
          <div class="readonly">${this.cityName || this.msg.empty}</div>
        </div>
      </div>

      ${this.renderContactSection("yn-ca-d-phone")}

      <section class="address-section" aria-labelledby="yn-ca-d-address-heading">
        <p id="yn-ca-d-address-heading" class="section-title">${this.msg.sectionAddress}</p>
        <div class="field">
          <input
            id="yn-ca-d-line1"
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
        <div class="grid-2">
          <div class="field">
            <label for="yn-ca-d-line2">${this.msg.detailAddress2}</label>
            <input
              id="yn-ca-d-line2"
              autocomplete="address-line2"
              placeholder=${this.msg.detailAddress2Placeholder}
              ?disabled=${this.disabled}
              .value=${this.line2}
              @input=${this.handleFieldInput("line2")}
            />
          </div>
          ${this.renderPostalField("yn-ca-d-zip")}
        </div>
        <p class="hint">${this.msg.dr5hnSubmitHint}</p>
      </section>
    `;
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

  private renderForm() {
    const mode = this.activeProvider;
    if (!mode) {
      return nothing;
    }

    return html`
      <div class="stack">
        <p class="banner">${this.usageHintForProvider(mode)}</p>
        ${this.renderSearch()}
        ${this.isDr5hnMode ? this.renderDr5hnFields() : this.renderGoogleFields()}
        ${this.renderDevPanel()}
      </div>
    `;
  }

  static styles = checkoutAddressFormStyles;

  override render() {
    if (this.phase === "probing" && !this.hasEchoValue()) {
      return this.renderSkeleton();
    }

    if (this.phase === "error") {
      return html`
        <div class="error-box">
          ${this.msg.probeFailed}
          <button type="button" class="retry" @click=${() => void this.runProbe()}>
            ${this.msg.retryProbe}
          </button>
        </div>
        ${this.renderForm()}
      `;
    }

    return this.renderForm();
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
