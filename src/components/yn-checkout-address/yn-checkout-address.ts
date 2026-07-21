import { LitElement, html, nothing, type PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { AddressSuggestion } from "./address-providers";
import { checkoutAddressFormStyles } from "./checkout-address-styles";
import { renderFloatField } from "./checkout-address-field-templates";
import {
  renderCheckoutSkeleton,
  renderDevPanel,
  renderManualBanner,
  renderManualRegionSection,
  renderRegionStep,
  renderShippingSection,
  type CheckoutAddressViewHost,
} from "./checkout-address-views";
import { loadDr5hnModule, peekDr5hnModule } from "./dr5hn-loader";
import type { Dr5hnRegionSuggestion, RegionSearchLevel } from "./dr5hn-region-types";
import { resolveCheckoutMessages } from "./messages";
import { isPostalRequiredForCountry, validateCheckoutAddress } from "./validation";
import type { AddressProviderMode } from "./provider-probe";
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
  buildSearchLabel,
  diffCheckoutValueKeys,
  isSameChangeDetail,
} from "./value-utils";

const DEBOUNCE_GOOGLE_MS = 280;
const DEBOUNCE_DR5HN_MS = 320;
type ViewMode = "booting" | "region" | "manual" | "checkout";
type AddressProvidersModule = typeof import("./address-providers");
type ProviderProbeModule = typeof import("./provider-probe");

let addressProvidersModulePromise: Promise<AddressProvidersModule> | null = null;
let providerProbeModulePromise: Promise<ProviderProbeModule> | null = null;

const loadAddressProvidersModule = () => {
  addressProvidersModulePromise ??= import("./address-providers");
  return addressProvidersModulePromise;
};

const loadProviderProbeModule = () => {
  providerProbeModulePromise ??= import("./provider-probe");
  return providerProbeModulePromise;
};

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
 * 跨境独立站结账地址：优先探测自建 dr5hn（可选）→ 默认 dr5hn CDN → Photon → Google（有 Key 且脚本可加载）
 * → 均不可用则 manual 手动填写（开放国家/地区、省/州、城市编辑）。
 * 运行中 dr5hn 搜索无匹配或失败时清空区域并降级 Photon 用同一关键词重搜；Photon 仍失败则切至 manual。
 * `allow-manual-entry` 为 true 时可在搜索与手填间双向切换。
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

  /**
   * 内置兜底语言：仅 `en` | `zh-CN`，默认 `en`。
   * 新语言请走 `messages`，勿再扩展此枚举。缺 key 时回落 `en`。
   */
  @property({ type: String }) locale: YnCheckoutAddressLocale = "en";

  /**
   * 宿主主文案（推荐传全量）。合并顺序：内置 en → 内置 locale → 本对象。
   * 品牌/多语言字典应放在店面 i18n，而不是改组件。
   */
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

  /**
   * dr5hn 地区 JSON 根地址（自建/本地 CDN）。
   * 须指向含 `/data/countries.json` 的目录；未设时用 `VITE_DR5HN_BASE_URL`，再回退官方 jsDelivr。
   * 探测顺序：自建 → 默认 CDN → Photon → Google → manual。
   */
  @property({ type: String, attribute: "dr5hn-base-url" }) dr5hnBaseUrl = "";

  /** 为 true 时展示联系邮箱输入框 */
  @property({ type: Boolean, attribute: "show-email" }) showEmail = false;

  /** 为 true 且 showEmail 时邮箱必填 */
  @property({ type: Boolean, attribute: "email-required" }) emailRequired = false;

  /** 为 true 时展示 WhatsApp 输入框 */
  @property({ type: Boolean, attribute: "show-whatsapp" }) showWhatsapp = false;

  /** 为 true 且 showWhatsapp 时 WhatsApp 必填 */
  @property({ type: Boolean, attribute: "whatsapp-required" }) whatsappRequired = false;

  /**
   * 为 true 时提供「手动填写 / 使用地址搜索」双向切换入口。
   * 默认 false：仅在服务不可用时被迫进入 manual。
   */
  @property({ type: Boolean, attribute: "allow-manual-entry", reflect: true })
  allowManualEntry = false;

  @state() private viewMode: ViewMode = "booting";
  @state() private activeProvider: AddressProviderMode | null = null;
  @state() private probeReason = "";
  /** 用户主动选手填（非服务降级） */
  @state() private manualEntryUserChosen = false;

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
  @state() private whatsapp = "";
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
  /** 最近一次探测成功的非 manual 数据源，用于切回搜索 */
  private lastProbedProvider: Exclude<AddressProviderMode, "manual"> | null = null;
  /** 国家元数据请求代数：避免慢请求覆盖更新后的区号 */
  private countryMetaRequestId = 0;
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
    const showManual = !boot && manual && !this.filterRefreshing;
    return {
      boot,
      main: !boot,
      provider: !boot && !manual && ap != null && vm === "region",
      // 手填：地区 + 联系方式 + 详细地址一次全部展开（不再分步）
      manual: showManual,
      details: showManual || vm === "checkout",
    };
  }

  private get regionConfirmed() {
    if (this.isManualMode) {
      return Boolean(
        this.countryCode.trim() &&
          this.countryName.trim() &&
          this.stateName?.trim() &&
          this.cityName.trim(),
      );
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

  /** dr5hn / Photon：选中国家或州省即可进入配送步骤；Google 需有城市或州省；手填始终展开全部字段 */
  private get canShowShippingStep() {
    if (this.isManualMode) {
      return true;
    }
    if (!this.countryCode.trim()) {
      return false;
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
    if (this.isManualMode) {
      // 手填已全部展开：聚焦地区字段即可
      this.emitChange();
      this.updateComplete.then(() => {
        this.shadowRoot?.querySelector<HTMLInputElement>("#yn-ca-m-country-name")?.focus();
      });
      return;
    }
    this.syncViewEmit();
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
    if (changed.has("googleMapsApiKey") || changed.has("dr5hnBaseUrl")) {
      void this.runProbe();
    }
  }

  private clearDetailFields() {
    this.firstName = "";
    this.lastName = "";
    this.phoneNumber = "";
    this.email = "";
    this.whatsapp = "";
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
      const { probePhotonReachable } = await loadAddressProvidersModule();
      if (await probePhotonReachable()) {
        this.activeProvider = "photon";
        this.lastProbedProvider = "photon";
        this.manualEntryUserChosen = false;
        this.probeReason = this.msg.dr5hnFallbackToPhoton;
        await this.syncGoogleMode("photon");
        return;
      }
    } catch {
      /* manual */
    }
    this.enterManualMode(this.msg.servicesUnavailable);
  }

  /** 探测开始时原子重置：只保留 booting 视图 */
  private beginBooting() {
    this.viewMode = "booting";
    this.activeProvider = null;
    this.probeReason = "";
    this.manualEntryUserChosen = false;
    this.lastProbedProvider = null;
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
      // 手填模式固定展开全部字段；viewMode 仅用于 data-view / 非手填分支
      this.viewMode = "checkout";
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
    this.whatsapp = v.whatsapp ?? "";
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
      const { probeAddressProvider } = await loadProviderProbeModule();
      const result = await probeAddressProvider({
        googleMapsApiKey: this.googleMapsApiKey,
        dr5hnBaseUrl: this.dr5hnBaseUrl,
        regionFilter: this.regionFilter,
        signal: this.probeAbort.signal,
      });
      if (generation !== this.probeGeneration) {
        return;
      }
      if (result.mode === "manual") {
        this.activeProvider = "manual";
        this.probeReason = result.reason;
        this.manualEntryUserChosen = false;
        this.googleReady = false;
      } else {
        this.activeProvider = result.mode;
        this.lastProbedProvider = result.mode;
        this.manualEntryUserChosen = false;
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
      this.manualEntryUserChosen = false;
      this.googleReady = false;
      this.syncViewEmit();
    }
  }

  private enterManualMode(reason: string, opts?: { userChosen?: boolean }) {
    if (this.filterRefreshing && !opts?.userChosen) return;
    if (
      this.activeProvider &&
      this.activeProvider !== "manual"
    ) {
      this.lastProbedProvider = this.activeProvider;
    }
    this.activeProvider = "manual";
    this.probeReason = reason;
    this.manualEntryUserChosen = Boolean(opts?.userChosen);
    this.searching = false;
    this.suggestionsOpen = false;
    this.googleReady = false;
    this.dr5hnRegionLevel = null;
    this.cityId = null;
    this.stateCode = null;
    this.regionEditing = true;
    this.syncViewEmit();
  }

  /** 用户主动切换到手填（需 allow-manual-entry） */
  private chooseManualEntry = () => {
    if (!this.allowManualEntry || this.disabled) return;
    this.query = "";
    this.searchError = "";
    this.suggestions = [];
    this.dr5hnSuggestions = [];
    this.suggestionsOpen = false;
    this.clearRegion();
    this.enterManualMode(this.msg.usageHintManualChosen, { userChosen: true });
  };

  /** 从手填切回地址搜索（优先恢复上次探测成功的 provider） */
  private returnToAddressSearch = async () => {
    if (!this.allowManualEntry || this.disabled) return;
    this.query = "";
    this.searchError = "";
    this.suggestions = [];
    this.dr5hnSuggestions = [];
    this.suggestionsOpen = false;
    this.clearRegion();
    this.manualEntryUserChosen = false;
    this.regionEditing = true;
    this.showFieldErrors = false;
    this.validationCache = null;

    const target = this.lastProbedProvider;
    if (target) {
      this.activeProvider = target;
      this.probeReason = "";
      try {
        if (target === "dr5hn") {
          const dr5hn = await loadDr5hnModule();
          await dr5hn.loadCountries(this.regionFilter);
        } else {
          await this.syncGoogleMode(target);
        }
      } catch {
        await this.runProbe();
        return;
      }
      this.syncViewEmit();
      return;
    }
    await this.runProbe();
  };

  private async syncGoogleMode(mode: "google" | "photon") {
    this.googleReady = false;
    if (mode === "google") {
      const { loadGoogleMaps } = await loadAddressProvidersModule();
      const { resolveGoogleMapsApiKey } = await loadProviderProbeModule();
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
      whatsapp: this.whatsapp,
      showWhatsapp: this.showWhatsapp,
      whatsappRequired: this.whatsappRequired,
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
      whatsapp: this.whatsapp.trim(),
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

  private get viewHost(): CheckoutAddressViewHost {
    return this as unknown as CheckoutAddressViewHost;
  }

  /** Flutter / Material 式上浮 label 字段由 checkout-address-field-templates 渲染 */
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
    return renderFloatField(this.viewHost, {
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

  private renderWhatsappFields() {
    if (!this.showWhatsapp) {
      return nothing;
    }
    const label = this.whatsappRequired
      ? `${this.msg.whatsapp} *`
      : `${this.msg.whatsapp} (${this.msg.fieldMarkOptional})`;
    return renderFloatField(this.viewHost, {
      id: "yn-ca-whatsapp",
      label,
      value: this.whatsapp,
      type: "tel",
      inputmode: "numeric",
      autocomplete: "tel",
      errorField: "whatsapp",
      invalidField: "whatsapp",
      disabled: this.disabled,
      onInput: this.handleFieldInput("whatsapp"),
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
    return renderFloatField(this.viewHost, {
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
    const hasDial = Boolean(this.phonecode);
    const phonePrefix = hasDial ? `+${this.phonecode}` : this.msg.phonePrefixEmpty;
    const phoneLabel = hasDial ? this.msg.phoneNumber : this.msg.phoneNumberEnterDial;
    const phoneDisabled =
      this.disabled || (!this.isManualMode && this.activeProvider === "dr5hn" && !this.phonecode);
    const phoneInvalid = this.inputClass("phoneNumber");

    return html`
        <div class="float-field float-field--phone">
          <div class="float-field__control ${this.phoneControlClass()}">
            <label class="float-field__label" for=${phoneInputId}>
              ${phoneLabel}<span class="float-field__required" aria-hidden="true">*</span>
            </label>
            ${hasDial
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
                inputmode=${hasDial ? "numeric" : "tel"}
                autocomplete=${hasDial ? "tel-national" : "tel"}
                placeholder=" "
                aria-required="true"
                aria-describedby=${hasDial ? `${phoneInputId}-prefix` : nothing}
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
    const requestId = ++this.countryMetaRequestId;
    const key = code.trim().toUpperCase();
    // 先清空，避免国家代码变更后仍显示上一次区号
    this.phonecode = "";
    if (key.length !== 2) {
      return;
    }
    try {
      const dr5hn = await loadDr5hnModule();
      const meta = await dr5hn.fetchCountryMeta(key);
      if (requestId !== this.countryMetaRequestId) {
        return;
      }
      if (meta) {
        this.phonecode = meta.phonecode;
        this.currency = meta.currency;
        this.countryName = meta.name;
      }
    } catch {
      /* 查不到则保持区号为空 */
    }
  }

  private async applyGoogleSuggestion(suggestion: AddressSuggestion) {
    let resolved = suggestion;
    const useGoogle =
      this.activeProvider === "google" && this.googleReady && !suggestion.id.startsWith("photon-");

    if (useGoogle) {
      try {
        const { resolveGooglePlace } = await loadAddressProvidersModule();
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
    this.lastProbedProvider = "photon";
    this.manualEntryUserChosen = false;
    this.probeReason = this.msg.dr5hnFallbackToPhoton;
    await this.syncGoogleMode("photon");
    this.searchError = "";
    this.emitChange();

    if (query.trim().length < 3) {
      return;
    }

    try {
      const { searchPhoton } = await loadAddressProvidersModule();
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
      const { searchGooglePlaces, searchPhoton } = await loadAddressProvidersModule();
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
      void this.handleManualFieldInput(field, event);
    };

  private async handleManualFieldInput(
    field: "countryName" | "countryCode" | "stateName" | "cityName",
    event: Event,
  ) {
    const input = event.target as HTMLInputElement;
    if (field === "countryName") {
      this.countryName = input.value;
    } else if (field === "countryCode") {
      const code = input.value.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 2);
      input.value = code;
      this.countryCode = code;
      await this.applyCountryMeta(code);
    } else if (field === "stateName") {
      this.stateName = input.value;
      this.stateCode = null;
    } else {
      this.cityName = input.value;
      this.cityId = null;
      this.dr5hnRegionLevel = null;
    }
    this.syncViewEmit();
  }

  private handleFieldInput =
    (
      field:
        | "firstName"
        | "lastName"
        | "line1"
        | "line2"
        | "postalCode"
        | "phone"
        | "email"
        | "whatsapp"
        | "notes",
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
      if (field === "whatsapp") this.whatsapp = input.value;
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

  private renderCheckoutDetails() {
    const { firstName, lastName, phone, line1, line2, zip, notes } = this.fields;
    return renderShippingSection(
      this.viewHost,
      firstName,
      lastName,
      phone,
      line1,
      line2,
      zip,
      notes,
    );
  }

  static styles = checkoutAddressFormStyles;

  /** 固定 DOM 结构，用 hidden / data-view 控制显隐，避免切换筛选时整块挂载/卸载导致闪动 */
  override render() {
    const L = this.layerVis;
    const host = this.viewHost;

    return html`
      <div class="checkout-address" data-view=${this.viewMode}>
        <div class="layer layer-booting" ?hidden=${!L.boot}>${renderCheckoutSkeleton(host)}</div>
        <div class="stack layer layer-main" ?hidden=${!L.main}>
          <div class="layer layer-provider" ?hidden=${!L.provider}>
            ${renderRegionStep(host)}
          </div>
          <div class="layer layer-manual" ?hidden=${!L.manual}>
            ${renderManualBanner(host)}${renderManualRegionSection(host)}
          </div>
          <div class="layer layer-details" ?hidden=${!L.details} ?inert=${!L.details}>
            ${this.renderCheckoutDetails()}
          </div>
          ${renderDevPanel(host)}
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
export { CHECKOUT_ADDRESS_MESSAGES, resolveCheckoutMessages } from "./messages";

declare global {
  interface HTMLElementTagNameMap {
    "yn-checkout-address": YnCheckoutAddress;
  }
}
