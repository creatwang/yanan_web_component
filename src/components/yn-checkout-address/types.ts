/** 地址数据源：探测完成后为 google | dr5hn | photon；探测中为 null。 */
export type YnCheckoutProvider = "google" | "dr5hn" | "photon" | "manual" | null;

/**
 * 结账地址统一值（Google / dr5hn / Photon 保存、回显、编辑均使用此结构）。
 * 绑定 `.value` 回显时不会重新探测或重搜；用户编辑仅更新字段并触发 `change`。
 */
export type YnCheckoutAddressValue = {
  provider: YnCheckoutProvider;
  /** 探测说明（仅 dev 或调试时有用，业务可忽略） */
  probeReason: string;
  countryCode: string;
  countryName: string;
  stateCode: string | null;
  stateName: string | null;
  cityName: string;
  cityId: number | null;
  phonecode: string;
  phoneNumber: string;
  firstName: string;
  lastName: string;
  /** 联系邮箱；需 `show-email` 才展示输入框 */
  email: string;
  /** WhatsApp 号码；需 `show-whatsapp` 才展示输入框 */
  whatsapp: string;
  line1: string;
  line2: string;
  postalCode: string;
  /** 订单备注（选填） */
  notes: string;
  currency: string;
  /** 国家+城市已选定（dr5hn 需城市级；Google/Photon 有国家与城市名即可） */
  regionComplete: boolean;
  /**
   * 软就绪：主要必填已填，可用于预启用下单按钮。
   * 硬校验以 `validate().valid` 为准（含邮编、邮箱等）。
   */
  formReady: boolean;
  /** 搜索框展示文案，回显时优先使用；未设则按地区字段拼接 */
  searchLabel?: string;
};

export type YnCheckoutAddressField =
  | "region"
  | "firstName"
  | "lastName"
  | "phoneNumber"
  | "line1"
  | "postalCode"
  | "email"
  | "whatsapp";

export type YnCheckoutAddressErrorCode =
  | "REGION_REQUIRED"
  | "REGION_CITY_LEVEL_REQUIRED"
  | "REGION_NOT_ALLOWED"
  | "FIRST_NAME_REQUIRED"
  | "LAST_NAME_REQUIRED"
  | "PHONE_REQUIRED"
  | "PHONE_INVALID"
  | "LINE1_REQUIRED"
  | "LINE1_TOO_SHORT"
  | "POSTAL_REQUIRED"
  | "EMAIL_REQUIRED"
  | "EMAIL_INVALID"
  | "WHATSAPP_REQUIRED"
  | "WHATSAPP_INVALID";

export type YnCheckoutAddressValidationError = {
  field: YnCheckoutAddressField;
  code: YnCheckoutAddressErrorCode;
  message: string;
};

export type YnCheckoutAddressValidation = {
  valid: boolean;
  regionComplete: boolean;
  formReady: boolean;
  errors: YnCheckoutAddressValidationError[];
};

/** `YnCheckoutAddressValue` 中参与 diff / `changedFields` 的字段 */
export type YnCheckoutAddressValueKey = keyof Pick<
  YnCheckoutAddressValue,
  | "provider"
  | "probeReason"
  | "countryCode"
  | "countryName"
  | "stateCode"
  | "stateName"
  | "cityName"
  | "cityId"
  | "phonecode"
  | "phoneNumber"
  | "firstName"
  | "lastName"
  | "email"
  | "whatsapp"
  | "line1"
  | "line2"
  | "postalCode"
  | "notes"
  | "currency"
  | "regionComplete"
  | "formReady"
  | "searchLabel"
>;

/** `validate()` 返回值：校验结果 + 当前地址快照 */
export type YnCheckoutAddressValidateResult = YnCheckoutAddressValidation & {
  value: YnCheckoutAddressValue;
};

/** `change` 事件 detail */
export type YnCheckoutAddressChangeDetail = {
  value: YnCheckoutAddressValue;
  validation: YnCheckoutAddressValidation;
  /** 相对上一次 `change` 的 value 字段名；首次派发为相对空表单的差异 */
  changedFields: YnCheckoutAddressValueKey[];
};

/** 排除国家 / 省州 / 城市（ISO2 与 dr5hn cityId） */
export type YnCheckoutExcludeRegions = {
  countries?: string[];
  states?: Array<{ countryCode: string; stateCode: string }>;
  cities?: Array<{ countryCode: string; cityId: number }>;
};

export type YnCheckoutRegionFilter = {
  excludeRegions?: YnCheckoutExcludeRegions;
  /** 非空时仅允许列表内国家（ISO2，大小写不敏感） */
  includeCountries?: string[];
};

/**
 * 组件内置语言枚举：只保留 en / zh-CN。
 * 其它语言通过宿主传入的 `messages` 提供，不要在此扩展。
 */
export type YnCheckoutAddressLocale = "en" | "zh-CN";

export type YnCheckoutAddressMessages = {
  probing: string;
  /**
   * 表单顶部用户指引（可通过 messages 覆盖）。
   * 若设置 `usageHint`，则忽略分数据源的三条指引。
   */
  usageHint?: string;
  /** Google Places 模式下的使用说明 */
  usageHintGoogle: string;
  /** dr5hn：搜索国家/省/州/城市并选择带标记项的指引 */
  usageHintDr5hn: string;
  /** Photon 地址搜索模式下的使用说明 */
  usageHintPhoton: string;
  /** 全部联想不可用时的手动填写指引 */
  usageHintManual: string;
  /** 用户主动选择手动填写时的指引 */
  usageHintManualChosen: string;
  /** 搜索模式下切换到手填的入口文案 */
  enterManualEntry: string;
  /** 手填模式下切回地址搜索的入口文案 */
  useAddressSearch: string;
  /** 仅 dev 面板展示：数据源标签 */
  activeProvider: string;
  providerGoogle: string;
  providerDr5hn: string;
  providerPhoton: string;
  providerManual: string;
  servicesUnavailable: string;
  manualCountryCodeLabel: string;
  manualCountryCodePlaceholder: string;
  probeFailed: string;
  probeFailedFallback: string;
  retryProbe: string;
  addressSearchLabel: string;
  addressSearchPlaceholder: string;
  regionSearchLabel: string;
  regionSearchPlaceholder: string;
  searchClear: string;
  searching: string;
  searchFailed: string;
  regionSearchNoResults: string;
  regionSearchChinaExcluded: string;
  regionSearchCountryOnly: string;
  regionSearchStateOnly: string;
  regionSearchLevelCity: string;
  regionSearchLevelState: string;
  regionSearchLevelCountry: string;
  regionEdit: string;
  sectionRegion: string;
  sectionContact: string;
  /** 同时展示邮箱与电话时的区块标题 */
  sectionContactDetails: string;
  sectionAddress: string;
  /** 步骤 2：街道与联系方式（Isaac Yuen 式：地区确认后再填配送地址） */
  sectionShipping: string;
  /** Address line 2 下方说明（公寓、单元等，选填） */
  line2Helper: string;
  country: string;
  state: string;
  cityDistrict: string;
  empty: string;
  phoneDial: string;
  phonePrefixEmpty: string;
  /** 已自动带出区号时的手机号标签 */
  phoneNumber: string;
  /** 无区号（前缀为 —）时：引导用户自行填写含国际区号的号码 */
  phoneNumberEnterDial: string;
  phonePlaceholder: string;
  firstName: string;
  lastName: string;
  notes: string;
  notesPlaceholder: string;
  detailAddress: string;
  detailAddress2: string;
  detailAddress2Placeholder: string;
  detailAddressPlaceholder: string;
  postal: string;
  postalPlaceholder: string;
  postalPlaceholderRequired: string;
  fieldMarkRequired: string;
  fieldMarkOptional: string;
  dr5hnSubmitHint: string;
  /** dr5hn 无匹配数据时降级 Photon 的说明 */
  dr5hnFallbackToPhoton: string;
  devPanelTitle: string;
  email: string;
  emailPlaceholder: string;
  whatsapp: string;
  whatsappPlaceholder: string;
  errorRegionRequired: string;
  errorManualRegionIncomplete: string;
  errorRegionCityLevel: string;
  errorRegionNotAllowed: string;
  errorFirstNameRequired: string;
  errorLastNameRequired: string;
  errorPhoneRequired: string;
  errorPhoneInvalid: string;
  errorLine1Required: string;
  errorLine1TooShort: string;
  errorPostalRequired: string;
  errorEmailRequired: string;
  errorEmailInvalid: string;
  errorWhatsappRequired: string;
  errorWhatsappInvalid: string;
  validateSubmitLabel: string;
  validateSummaryTitle: string;
};

export const emptyCheckoutAddressValue = (
  provider: YnCheckoutProvider = null,
  probeReason = "",
): YnCheckoutAddressValue => ({
  provider,
  probeReason,
  countryCode: "",
  countryName: "",
  stateCode: null,
  stateName: null,
  cityName: "",
  cityId: null,
  phonecode: "",
  phoneNumber: "",
  firstName: "",
  lastName: "",
  email: "",
  whatsapp: "",
  line1: "",
  line2: "",
  postalCode: "",
  notes: "",
  currency: "",
  regionComplete: false,
  formReady: false,
  searchLabel: "",
});
