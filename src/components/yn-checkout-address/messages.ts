import type { YnCheckoutAddressLocale, YnCheckoutAddressMessages } from "./types";

/**
 * 默认文案：跨境独立站结账场景（收货地址 / 配送地址）。
 * 店铺可通过 `locale` + `messages` Partial 覆盖任意字段。
 */
export const CHECKOUT_ADDRESS_MESSAGES: Record<
  YnCheckoutAddressLocale,
  YnCheckoutAddressMessages
> = {
  en: {
    probing: "Loading address service…",
    usageHintGoogle:
      "Search street, building, or landmark. Choose a suggestion to fill country/region, state, city, and dial code—then enter your contact number and address details.",
    usageHintDr5hn:
      "Search country, state/province, or city. Choose a list item tagged Country, State, or City to confirm your delivery region—then enter your contact number and address details.",
    usageHintPhoton:
      "Search your delivery address and choose a suggestion. Country/region and dial code will be filled in—then enter your contact number and address details.",
    usageHintManual:
      "Address lookup is unavailable. Enter country/region, state/province, and city manually, then complete contact and address details.",
    activeProvider: "Data source:",
    providerGoogle: "Google Places",
    providerDr5hn: "Region lookup",
    providerPhoton: "Address lookup (fallback)",
    providerManual: "Manual entry",
    servicesUnavailable: "All address services are unavailable. Please enter region manually.",
    manualCountryCodeLabel: "Country code",
    manualCountryCodePlaceholder: "ISO code, e.g. US",
    probeFailed: "Could not load address service.",
    probeFailedFallback: "Using fallback address lookup.",
    retryProbe: "Try again",
    addressSearchLabel: "Find address",
    addressSearchPlaceholder: "Street, building, or landmark",
    regionSearchLabel: "Country / state / city",
    regionSearchPlaceholder: "Search country, state, or city",
    searchClear: "Clear search",
    searching: "Searching…",
    searchFailed: "Search unavailable. Please try again.",
    regionSearchNoResults: "No matches. Try another country, state, or city.",
    regionSearchChinaExcluded:
      "This store does not ship to mainland China (CN). Try another country or city.",
    regionSearchCountryOnly:
      "Country/region selected. Keep typing a city and choose an item tagged City.",
    regionSearchStateOnly:
      "State/province selected. Keep typing a city and choose an item tagged City.",
    regionSearchLevelCity: "City",
    regionSearchLevelState: "State / province",
    regionSearchLevelCountry: "Country / region",
    regionEdit: "Change region",
    sectionRegion: "Delivery region",
    sectionContact: "Contact number",
    sectionContactDetails: "Contact details",
    sectionAddress: "Address details",
    country: "Country / region",
    state: "State / province",
    cityDistrict: "City",
    empty: "—",
    phoneDial: "Dial code",
    phonePrefixEmpty: "—",
    phoneNumber: "Mobile number",
    phonePlaceholder: "Local number without dial code",
    detailAddress: "Detailed address",
    detailAddress2: "Address line 2 (optional)",
    detailAddress2Placeholder: "Apt, suite, unit, etc.",
    detailAddressPlaceholder: "Street, building no., district",
    postal: "ZIP / postal code",
    postalPlaceholder: "Optional",
    postalPlaceholderRequired: "Required",
    fieldMarkRequired: "Required",
    fieldMarkOptional: "Optional",
    dr5hnSubmitHint:
      "Choose a City-tagged result and complete contact number and detailed address to continue checkout.",
    dr5hnFallbackToPhoton:
      "Region lookup had no matches. Switched to address search—please try again.",
    devPanelTitle: "Shipping address (debug)",
    email: "Email",
    emailPlaceholder: "name@example.com",
    errorRegionRequired: "Select a delivery country/region and city.",
    errorManualRegionIncomplete:
      "Enter country/region, state/province, and city.",
    errorRegionCityLevel: "Choose a list item tagged City to confirm delivery region.",
    errorRegionNotAllowed: "Delivery is not available for this country/region.",
    errorPhoneRequired: "Enter a mobile number.",
    errorPhoneInvalid: "Enter a valid mobile number (6–15 digits).",
    errorLine1Required: "Enter your detailed address.",
    errorLine1TooShort: "Detailed address is too short.",
    errorPostalRequired: "ZIP / postal code is required for this country.",
    errorEmailRequired: "Enter your email address.",
    errorEmailInvalid: "Enter a valid email address.",
    validateSubmitLabel: "Place order (validate)",
    validateSummaryTitle: "Please fix the following:",
  },
  "zh-CN": {
    probing: "正在加载地址服务…",
    usageHintGoogle:
      "请搜索街道、小区或门牌号，选择匹配建议后自动填充国家/地区、省/州、城市与电话区号，再填写联系电话与详细地址。",
    usageHintDr5hn:
      "请搜索国家/省/州/城市，在列表中选择带「国家」「省/州」或「城市」标记的项以确认收货地区，再填写联系电话与详细地址。",
    usageHintPhoton:
      "请搜索配送地址并选择建议，系统将自动填充收货地区与电话区号，再填写联系电话与详细地址。",
    usageHintManual:
      "地址联想服务暂不可用，请手动填写国家/地区、省/州、城市，并继续填写联系方式与详细地址。",
    activeProvider: "当前数据源：",
    providerGoogle: "Google Places",
    providerDr5hn: "国家/地区联想",
    providerPhoton: "地址联想（兜底）",
    providerManual: "手动填写",
    servicesUnavailable: "地址服务均不可用，请手动填写收货地区。",
    manualCountryCodeLabel: "国家代码",
    manualCountryCodePlaceholder: "如 US、AE",
    probeFailed: "地址服务加载失败。",
    probeFailedFallback: "已切换为备用地址联想。",
    retryProbe: "重试",
    addressSearchLabel: "搜索地址",
    addressSearchPlaceholder: "街道、小区或门牌号",
    regionSearchLabel: "国家/省/州/城市",
    regionSearchPlaceholder: "搜索国家、省/州或城市",
    searchClear: "清空搜索",
    searching: "搜索中…",
    searchFailed: "搜索失败，请稍后重试。",
    regionSearchNoResults: "未找到匹配项，请换一个国家/省/州/城市关键词。",
    regionSearchChinaExcluded:
      "本店暂不支持配送至中国大陆（CN），请搜索其他国家或城市。",
    regionSearchCountryOnly:
      "已选国家/地区。请继续输入城市名，并选择带「城市」标记的项。",
    regionSearchStateOnly:
      "已选省/州。请继续输入城市名，并选择带「城市」标记的项。",
    regionSearchLevelCity: "城市",
    regionSearchLevelState: "省/州",
    regionSearchLevelCountry: "国家/地区",
    regionEdit: "修改地区",
    sectionRegion: "收货地区",
    sectionContact: "联系电话",
    sectionContactDetails: "联系方式",
    sectionAddress: "详细地址",
    country: "国家/地区",
    state: "省/州",
    cityDistrict: "城市",
    empty: "—",
    phoneDial: "电话区号",
    phonePrefixEmpty: "—",
    phoneNumber: "手机号码",
    phonePlaceholder: "仅填写号码，不含区号",
    detailAddress: "详细地址",
    detailAddress2: "地址补充（选填）",
    detailAddress2Placeholder: "楼层、门牌、单元等",
    detailAddressPlaceholder: "街道、门牌号、小区等",
    postal: "邮政编码",
    postalPlaceholder: "选填",
    postalPlaceholderRequired: "必填",
    fieldMarkRequired: "必填",
    fieldMarkOptional: "选填",
    dr5hnSubmitHint:
      "请选择带「城市」标记的结果，并填写联系电话与详细地址后即可继续结账。",
    dr5hnFallbackToPhoton:
      "国家/地区联想无匹配，已切换为地址搜索，请重新尝试。",
    devPanelTitle: "收货地址（调试）",
    email: "联系邮箱",
    emailPlaceholder: "name@example.com",
    errorRegionRequired: "请选择收货国家/地区与城市。",
    errorManualRegionIncomplete: "请填写国家/地区、省/州与城市。",
    errorRegionCityLevel: "请选择列表中带「城市」标记的项以确认收货地区。",
    errorRegionNotAllowed: "该地区不在可配送范围内。",
    errorPhoneRequired: "请填写手机号码。",
    errorPhoneInvalid: "请输入有效的手机号码（6–15 位数字）。",
    errorLine1Required: "请填写详细地址。",
    errorLine1TooShort: "详细地址过短，请补充门牌或街道信息。",
    errorPostalRequired: "该国家/地区需填写邮政编码。",
    errorEmailRequired: "请填写联系邮箱。",
    errorEmailInvalid: "请输入有效的邮箱地址。",
    validateSubmitLabel: "提交订单（校验）",
    validateSummaryTitle: "请修正以下信息：",
  },
};

export function resolveCheckoutMessages(
  locale: YnCheckoutAddressLocale,
  override?: Partial<YnCheckoutAddressMessages>,
): YnCheckoutAddressMessages {
  return { ...CHECKOUT_ADDRESS_MESSAGES[locale], ...override };
}
