import { LitElement, html, nothing, type TemplateResult, type PropertyValues } from "lit";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";
import { ynSearchCloseSvg, ynSearchSvg } from "../../asset/svg";
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
import { loadDr5hnModule, peekDr5hnModule } from "./dr5hn-loader";
import type { Dr5hnRegionSuggestion, RegionSearchLevel } from "./dr5hn-region-types";
import { resolveCheckoutMessages } from "./messages";
import { isPostalRequiredForCountry, validateCheckoutAddress } from "./validation";
import {
  probeAddressProvider,
  resolveGoogleMapsApiKey,
  type AddressProviderMode,
} from "./provider-probe";
import { filterByRegion, isChinaQuery, passesCountryFilter } from "./region-filter";
import type {
  YnCheckoutAddressChangeDetail,
  YnCheckoutAddressField,
  YnCheckoutAddressLocale,
  YnCheckoutAddressMessages,
  YnCheckoutAddressValidateResult,
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
import {
  buildRegionSummary,
  buildSearchLabel,
  diffCheckoutValueKeys,
  isSameChangeDetail,
} from "./value-utils";

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
 * 分步表单（先地区摘要，再联系方式与详细地址）；内置校验；`change` 的 `detail` 为 `{ value, validation, changedFields }`。
 * 统一 `YnCheckoutAddressValue` 保存、回显与受控 `.value`。
 *
 * 样式：`--yn-checkout-address-bg`（背景色）、`--yn-checkout-address-padding` 等。字体继承宿主，不内置 webfont。
 *
 * @fires change - 地址变化，`detail` 为 `{ value, validation, changedFields }`
 *
 * @method validate - 执行内置校验（不标红界面）。返回 `{ valid, regionComplete, formReady, errors, value }`
 * @method reportValidity - 标红无效字段并聚焦第一项。返回 `true` 通过 / `false` 未通过
 * @method setValue - 编程式写入 `.value`（`null` 清空）；不重新探测、不触发搜索
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
  @state() private firstName = "";
  @state() private lastName = "";
  @state() private phoneNumber = "";
  @state() private email = "";
  @state() private notes = "";
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
  private invalidFieldSet = new Set<YnCheckoutAddressField>();
  private msgLocale = "";
  private msgOverride: Partial<YnCheckoutAddressMessages> | undefined;
  private msgResolved = resolveCheckoutMessages("en");

  private get msg() {
    if (this.locale !== this.msgLocale || this.messages !== this.msgOverride) {
      this.msgLocale = this.locale;
      this.msgOverride = this.messages;
      this.msgResolved = resolveCheckoutMessages(this.locale, this.messages);
    }
    return this.msgResolved;
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

  /** dr5hn：单框搜国家/省/市；Photon / Google 为配送地址搜索（标签与指引文案不同） */
  private get isDr5hnRegionSearch() {
    return this.isDr5hnMode;
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
      provider: !boot && !manual && ap != null && vm === "region",
      manual: !boot && manual && !this.filterRefreshing,
      details: vm === "checkout",
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
      return (
        this.dr5hnRegionLevel === "city" &&
        Boolean(this.cityName.trim()) &&
        this.cityId != null
      );
    }
    return Boolean(this.cityName.trim() || this.stateName?.trim());
  }

  /** dr5hn / Photon：选中国家或州省即可进入配送步骤；Google 需有城市或州省 */
  private get canShowShippingStep() {
    if (!this.countryCode.trim()) {
      return false;
    }
    if (this.isManualMode) {
      return this.regionConfirmed;
    }
    if (this.isDr5hnMode) {
      return true;
    }
    return this.regionConfirmed;
  }

  /** 在配送卡片内展示地区搜索（修改地区 / 尚未选到城市级） */
  private get showInlineRegionSearch() {
    if (this.isManualMode || this.viewMode !== "checkout") {
      return false;
    }
    return this.regionEditing || !this.regionConfirmed;
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
    if (this.isManualMode && this.regionConfirmed) {
      this.viewMode = "manual";
      this.emitChange();
    } else {
      this.syncViewEmit();
    }
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
    this.firstName = "";
    this.lastName = "";
    this.phoneNumber = "";
    this.email = "";
    this.line1 = "";
    this.line2 = "";
    this.postalCode = "";
    this.notes = "";
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
      const cached = peekDr5hnModule()?.peekCountriesCache(this.regionFilter);
      if (cached?.length) {
        recoverDr5hn();
        void loadDr5hnModule().then((m) => m.loadCountries(this.regionFilter, true));
        return;
      }
      this.filterRefreshing = true;
      this.viewMode = "booting";
    } else {
      this.syncViewEmit();
    }

    void loadDr5hnModule()
      .then((m) => m.loadCountries(this.regionFilter, true))
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
    this.invalidFieldSet.clear();
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
      this.viewMode =
        this.regionEditing || !this.regionConfirmed
          ? "manual"
          : "checkout";
      return;
    }
    this.viewMode = this.canShowShippingStep ? "checkout" : "region";
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

  /**
   * 受控回显：父组件写入 `.value` 时调用（与设置 `value` 属性等效）。
   * 不会重新探测数据源，不会触发地区/地址搜索。
   *
   * @param v 完整 `YnCheckoutAddressValue`；`null` 清空表单
   */
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
    this.firstName = v.firstName ?? "";
    this.lastName = v.lastName ?? "";
    this.phoneNumber = v.phoneNumber;
    this.email = v.email ?? "";
    this.line1 = v.line1;
    this.line2 = v.line2;
    this.postalCode = v.postalCode;
    this.notes = v.notes ?? "";
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
          const dr5hn = await loadDr5hnModule();
          await dr5hn.loadCountries(this.regionFilter);
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

  private async syncGoogleMode(mode: "google" | "photon") {
    this.googleReady = false;
    if (mode === "google") {
      const key = resolveGoogleMapsApiKey(this.googleMapsApiKey);
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
      firstName: this.firstName,
      lastName: this.lastName,
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
      if (this.showFieldErrors) {
        this.invalidFieldSet = new Set(this.validationCache.errors.map((e) => e.field));
      }
    }
    return this.validationCache;
  }

  /**
   * 执行内置校验（提交订单前调用）。
   * 不标红字段；若需展示错误请再调用 `reportValidity()`。
   *
   * @returns 校验结果与当前地址 `{ valid, regionComplete, formReady, errors, value }`
   */
  validate(): YnCheckoutAddressValidateResult {
    const validation = this.getValidation(true);
    return {
      ...validation,
      value: this.buildValue(validation),
    };
  }

  /**
   * 展示校验错误并聚焦第一个无效字段（类似原生 `reportValidity()`）。
   *
   * @returns `true` 当前通过校验；`false` 已展示错误，应阻止提交
   */
  reportValidity(): boolean {
    this.showFieldErrors = true;
    const validation = this.getValidation(true);
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
      firstName: this.firstName.trim(),
      lastName: this.lastName.trim(),
      phoneNumber: this.phoneNumber.trim(),
      email: this.email.trim(),
      line1: this.line1.trim(),
      line2: this.line2.trim(),
      postalCode: this.postalCode.trim(),
      notes: this.notes.trim(),
      currency: this.currency,
      regionComplete: v.regionComplete,
      formReady: v.formReady,
      searchLabel: this.query.trim() || undefined,
    };
  }

  private buildChangeDetail(): YnCheckoutAddressChangeDetail {
    const validation = this.getValidation();
    const value = this.buildValue(validation);
    return {
      value,
      validation,
      changedFields: diffCheckoutValueKeys(this.lastEmitted?.value, value),
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
      changedFields: [...detail.changedFields],
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

  /** Flutter / Material 式上浮 label（`placeholder=" "` + label 置于 input 之后） */
  private renderFloatField(opts: {
    id: string;
    label: string;
    value: string;
    onInput: (event: Event) => void;
    errorField?: YnCheckoutAddressField;
    invalidField?: YnCheckoutAddressField;
    disabled?: boolean;
    autocomplete?: string;
    inputmode?: string;
    type?: string;
    maxlength?: number;
    controlClass?: string;
    trailing?: TemplateResult;
    helper?: string;
  }) {
    const invalid = opts.invalidField ? this.inputClass(opts.invalidField) : "";
    return html`
      <div class="float-field ${opts.trailing ? "float-field--has-trailing" : ""}">
        <div class="float-field__control ${opts.controlClass ?? ""}">
          <input
            id=${opts.id}
            type=${opts.type ?? "text"}
            placeholder=" "
            autocomplete=${opts.autocomplete ?? "off"}
            inputmode=${opts.inputmode ?? nothing}
            maxlength=${opts.maxlength ?? nothing}
            ?disabled=${opts.disabled}
            class=${invalid}
            .value=${opts.value}
            @input=${opts.onInput}
          />
          <label class="float-field__label" for=${opts.id}>${opts.label}</label>
          ${opts.trailing ?? nothing}
        </div>
        ${opts.helper ? html`<p class="field-helper">${opts.helper}</p>` : nothing}
        ${opts.errorField ? this.fieldError(opts.errorField) : nothing}
      </div>
    `;
  }

  private renderFloatTextarea(opts: {
    id: string;
    label: string;
    value: string;
    onInput: (event: Event) => void;
    disabled?: boolean;
    maxlength?: number;
    helper?: string;
  }) {
    return html`
      <div class="float-field float-field--multiline">
        <div class="float-field__control float-field__control--textarea">
          <label class="float-field__label" for=${opts.id}>${opts.label}</label>
          <textarea
            id=${opts.id}
            class="float-field__textarea"
            placeholder=" "
            rows="3"
            maxlength=${opts.maxlength ?? 500}
            ?disabled=${opts.disabled}
            .value=${opts.value}
            @input=${opts.onInput}
          ></textarea>
        </div>
        ${opts.helper ? html`<p class="field-helper">${opts.helper}</p>` : nothing}
      </div>
    `;
  }

  private fieldError(field: YnCheckoutAddressField) {
    if (!this.showFieldErrors) {
      return nothing;
    }
    const err = this.getValidation().errors.find((e) => e.field === field);
    return err ? html`<p class="hint hint--error" role="alert">${err.message}</p>` : nothing;
  }

  private inputClass(field: YnCheckoutAddressField) {
    return this.showFieldErrors && this.invalidFieldSet.has(field) ? "input--invalid" : "";
  }

  private renderEmailFields() {
    if (!this.showEmail) {
      return nothing;
    }
    return this.renderFloatField({
      id: "yn-ca-email",
      label: this.msg.email,
      value: this.email,
      type: "email",
      autocomplete: "email",
      errorField: "email",
      invalidField: "email",
      disabled: this.disabled,
      onInput: this.handleFieldInput("email"),
    });
  }

  private isPostalRequired() {
    return isPostalRequiredForCountry(this.countryCode);
  }

  private renderPostalField(inputId: string) {
    const required = this.isPostalRequired();
    const label = required
      ? `${this.msg.postal} *`
      : `${this.msg.postal} (${this.msg.fieldMarkOptional})`;
    return this.renderFloatField({
      id: inputId,
      label,
      value: this.postalCode,
      autocomplete: "postal-code",
      errorField: "postalCode",
      invalidField: "postalCode",
      disabled: this.disabled,
      onInput: this.handleFieldInput("postalCode"),
    });
  }

  private phoneControlClass() {
    const invalid = this.showFieldErrors && this.invalidFieldSet.has("phoneNumber");
    return `float-field__control--phone${invalid ? " float-field__control--invalid" : ""}`;
  }

  private renderPhoneField(phoneInputId: string) {
    const phonePrefix = this.phonecode ? `+${this.phonecode}` : this.msg.phonePrefixEmpty;
    const phoneDisabled =
      this.disabled || (!this.isManualMode && this.activeProvider === "dr5hn" && !this.phonecode);
    const phoneInvalid = this.inputClass("phoneNumber");

    return html`
        <div class="float-field float-field--phone">
          <div class="float-field__control ${this.phoneControlClass()}">
            <label class="float-field__label" for=${phoneInputId}>
              ${this.msg.phoneNumber}<span class="float-field__required" aria-hidden="true">*</span>
            </label>
            ${this.phonecode
              ? html`<span
                  id="${phoneInputId}-prefix"
                  class="float-field__prefix"
                  aria-label="${this.msg.phoneDial} ${phonePrefix}"
                  >${phonePrefix}</span
                >`
              : html`<span class="float-field__prefix float-field__prefix--empty" aria-hidden="true"
                  >${phonePrefix}</span
                >`}
            <div class="float-field__inner">
              <input
                id=${phoneInputId}
                class=${`float-field__input ${phoneInvalid}`}
                type="tel"
                inputmode="numeric"
                autocomplete="tel-national"
                placeholder=" "
                aria-required="true"
                aria-describedby=${this.phonecode ? `${phoneInputId}-prefix` : nothing}
                ?disabled=${phoneDisabled}
                .value=${this.phoneNumber}
                @input=${this.handleFieldInput("phone")}
              />
            </div>
          </div>
          ${this.fieldError("phoneNumber")}
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
    const dr5hn = await loadDr5hnModule();
    return dr5hn.resolveStateIso(country, name);
  }

  private async applyCountryMeta(code: string) {
    if (!code) {
      return;
    }
    try {
      const dr5hn = await loadDr5hnModule();
      const meta = await dr5hn.fetchCountryMeta(code);
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

    this.line1 = resolved.line1.trim();
    this.cityName = resolved.city.trim();
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
    void loadDr5hnModule()
      .then((m) => m.enrichCountry(item.countryCode, item))
      .then((meta) => {
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
          const dr5hn = await loadDr5hnModule();
          this.dr5hnSuggestions = await dr5hn.searchDr5hnRegions(
            value,
            signal,
            this.regionFilter,
          );
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
      const hadRegion = Boolean(this.countryCode);
      this.clearRegion();
      this.searchError = "";
      if (hadRegion) {
        this.emitChange();
      }
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
    (
      field: "firstName" | "lastName" | "line1" | "line2" | "postalCode" | "phone" | "email" | "notes",
    ) =>
    (event: Event) => {
      const input = event.target as HTMLInputElement | HTMLTextAreaElement;
      if (field === "firstName") this.firstName = input.value;
      if (field === "lastName") this.lastName = input.value;
      if (field === "line1") this.line1 = input.value;
      if (field === "line2") this.line2 = input.value;
      if (field === "postalCode") this.postalCode = input.value;
      if (field === "phone") this.phoneNumber = input.value.replace(/\D/g, "");
      if (field === "email") this.email = input.value;
      if (field === "notes") this.notes = input.value;
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
        <div class="checkout-step skeleton-panel">
          <div class="skeleton-line skeleton-line--label"></div>
          <div class="skeleton-line skeleton-line--field"></div>
        </div>
      </div>
    `;
  }

  private regionSummaryText() {
    return buildRegionSummary({
      searchLabel: this.query,
      cityName: this.cityName,
      stateName: this.stateName,
      countryName: this.countryName,
      countryCode: this.countryCode,
    });
  }

  /** 已确认地区：紧凑条，避免再占一整张卡片（结账 UX 常见模式） */
  private renderRegionChip() {
    return html`
      <div class="region-chip">
        <div class="region-chip__body">
          <span class="region-chip__step" aria-hidden="true">1</span>
          <div class="region-chip__text">
            <span class="region-chip__label">${this.msg.sectionRegion}</span>
            <p class="region-chip__value">${this.regionSummaryText()}</p>
          </div>
        </div>
        <button
          type="button"
          class="region-chip__edit"
          ?disabled=${this.disabled}
          @click=${this.startRegionEdit}
        >
          ${this.msg.regionEdit}
        </button>
      </div>
    `;
  }

  /** 步骤 1：仅搜索/选择配送地区（联想优先） */
  private renderRegionStep() {
    const mode = this.activeProvider!;
    return html`
      <section class="checkout-step checkout-step--region">
        <header class="step-header">
          <span class="step-badge" aria-hidden="true">1</span>
          <div class="step-header__body">
            <h2 class="step-title">${this.msg.sectionRegion}</h2>
            <p class="step-lead">${this.usageHintForProvider(mode)}</p>
          </div>
        </header>
        ${this.renderSearch()}
      </section>
    `;
  }

  private renderSearch() {
    const searchId = this.fields.region;
    const label = this.isDr5hnRegionSearch
      ? this.msg.regionSearchLabel
      : this.msg.addressSearchLabel;

    const showClear = Boolean(this.query.trim()) && !this.disabled;

    return html`
      <div class="float-field float-field--search search-wrap">
        <div class="float-field__control float-field__control--search">
          <input
            id=${searchId}
            class=${`float-field__input ${this.inputClass("region")}`}
            type="text"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded=${this.suggestionsOpen ? "true" : "false"}
            autocomplete="off"
            placeholder=" "
            ?disabled=${this.disabled}
            .value=${this.query}
            @input=${this.handleSearchInput}
          />
          <label class="float-field__label" for=${searchId}>${label}</label>
          ${showClear
            ? html`
                <button
                  type="button"
                  class="search-field__trailing search-field__clear"
                  aria-label=${this.msg.searchClear}
                  @click=${this.clearSearch}
                >
                  ${unsafeSVG(ynSearchCloseSvg)}
                </button>
              `
            : html`
                <span class="search-field__trailing search-field__hint" aria-hidden="true">
                  ${unsafeSVG(ynSearchSvg)}
                </span>
              `}
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

  /**
   * 步骤 2：街道 + 联系（文章建议：Line1 主地址、Line2 明确 apt/unit、邮编独立一行）
   */
  private renderShippingSection(
    firstNameId: string,
    lastNameId: string,
    phoneId: string,
    line1Id: string,
    line2Id: string,
    zipId: string,
    notesId: string,
  ) {
    return html`
      <section class="checkout-card" aria-labelledby="yn-ca-shipping-title">
        ${this.renderRegionChip()}
        ${this.showInlineRegionSearch && this.activeProvider === "photon"
          ? html`<p class="step-lead step-lead--inline">${this.msg.usageHintPhoton}</p>`
          : nothing}
        ${this.showInlineRegionSearch && this.isDr5hnMode
          ? html`<p class="step-lead step-lead--inline">${this.msg.usageHintDr5hn}</p>`
          : nothing}
        ${this.showInlineRegionSearch ? this.renderSearch() : nothing}
        <header class="step-header step-header--inset">
          <span class="step-badge" aria-hidden="true">2</span>
          <h2 id="yn-ca-shipping-title" class="step-title">${this.msg.sectionShipping}</h2>
        </header>
        <div class="field-stack">
          <div class="grid-2">
            ${this.renderFloatField({
              id: firstNameId,
              label: `${this.msg.firstName} *`,
              value: this.firstName,
              autocomplete: "given-name",
              errorField: "firstName",
              invalidField: "firstName",
              disabled: this.disabled,
              onInput: this.handleFieldInput("firstName"),
            })}
            ${this.renderFloatField({
              id: lastNameId,
              label: `${this.msg.lastName} *`,
              value: this.lastName,
              autocomplete: "family-name",
              errorField: "lastName",
              invalidField: "lastName",
              disabled: this.disabled,
              onInput: this.handleFieldInput("lastName"),
            })}
          </div>
          ${this.renderEmailFields()}
          ${this.renderPhoneField(phoneId)}
          ${this.renderFloatField({
            id: line1Id,
            label: `${this.msg.detailAddress} *`,
            value: this.line1,
            autocomplete: "address-line1",
            errorField: "line1",
            invalidField: "line1",
            disabled: this.disabled,
            onInput: this.handleFieldInput("line1"),
          })}
          ${this.renderFloatField({
            id: line2Id,
            label: `${this.msg.detailAddress2} (${this.msg.fieldMarkOptional})`,
            value: this.line2,
            autocomplete: "address-line2",
            helper: this.msg.line2Helper,
            disabled: this.disabled,
            onInput: this.handleFieldInput("line2"),
          })}
          ${this.renderPostalField(zipId)}
          ${this.renderFloatTextarea({
            id: notesId,
            label: this.msg.notes,
            helper: `${this.msg.fieldMarkOptional} · ${this.msg.notesPlaceholder}`,
            value: this.notes,
            disabled: this.disabled,
            onInput: this.handleFieldInput("notes"),
          })}
        </div>
      </section>
    `;
  }

  private renderCheckoutDetails() {
    const { firstName, lastName, phone, line1, line2, zip, notes } = this.fields;
    return this.renderShippingSection(firstName, lastName, phone, line1, line2, zip, notes);
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
      <section class="checkout-step checkout-card manual-region" aria-labelledby="yn-ca-manual-region-heading">
        <header class="step-header">
          <span class="step-badge" aria-hidden="true">1</span>
          <h2 id="yn-ca-manual-region-heading" class="step-title">${this.msg.sectionRegion}</h2>
        </header>
        ${this.renderFloatField({
          id: "yn-ca-m-country-name",
          label: this.msg.country,
          value: this.countryName,
          autocomplete: "country-name",
          disabled: this.disabled,
          onInput: this.onManualField("countryName"),
        })}
        <div class="grid-3">
          ${this.renderFloatField({
            id: "yn-ca-m-country-code",
            label: this.msg.manualCountryCodePlaceholder,
            value: this.countryCode,
            maxlength: 2,
            invalidField: "region",
            errorField: "region",
            disabled: this.disabled,
            onInput: this.onManualField("countryCode"),
          })}
          ${this.renderFloatField({
            id: "yn-ca-m-state",
            label: this.msg.state,
            value: this.stateName ?? "",
            autocomplete: "address-level1",
            disabled: this.disabled,
            onInput: this.onManualField("stateName"),
          })}
          ${this.renderFloatField({
            id: "yn-ca-m-city",
            label: this.msg.cityDistrict,
            value: this.cityName,
            autocomplete: "address-level2",
            disabled: this.disabled,
            onInput: this.onManualField("cityName"),
          })}
        </div>
        ${this.fieldError("region")}
      </section>
    `;
  }

  static styles = checkoutAddressFormStyles;

  /** 固定 DOM 结构，用 hidden / data-view 控制显隐，避免切换筛选时整块挂载/卸载导致闪动 */
  override render() {
    const L = this.layerVis;

    return html`
      <div class="checkout-address" data-view=${this.viewMode}>
        <div class="layer layer-booting" ?hidden=${!L.boot}>${this.renderSkeleton()}</div>
        <div class="stack layer layer-main" ?hidden=${!L.main}>
          <div class="layer layer-provider" ?hidden=${!L.provider}>
            ${this.renderRegionStep()}
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
  YnCheckoutAddressValidateResult,
  YnCheckoutAddressValidation,
  YnCheckoutAddressValueKey,
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
