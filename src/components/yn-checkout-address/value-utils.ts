import {
  emptyCheckoutAddressValue,
  type YnCheckoutAddressChangeDetail,
  type YnCheckoutAddressValue,
  type YnCheckoutAddressValueKey,
} from "./types";

export function buildRegionSummary(
  parts: {
    searchLabel?: string;
    cityName?: string;
    stateName?: string | null;
    countryName?: string;
    countryCode?: string;
  },
): string {
  if (parts.searchLabel?.trim()) {
    return parts.searchLabel.trim();
  }
  const region = [parts.cityName, parts.stateName, parts.countryName].filter(Boolean).join(", ");
  if (region && parts.countryCode) {
    return `${region} (${parts.countryCode})`;
  }
  return region || parts.countryName || "";
}

export function buildSearchLabel(
  v: Pick<
    YnCheckoutAddressValue,
    "searchLabel" | "line1" | "cityName" | "stateName" | "countryName"
  >,
): string {
  if (v.searchLabel?.trim()) {
    return v.searchLabel.trim();
  }
  return [v.line1, v.cityName, v.stateName, v.countryName].filter(Boolean).join(", ");
}

export const CHECKOUT_VALUE_KEYS: YnCheckoutAddressValueKey[] = [
  "provider",
  "probeReason",
  "countryCode",
  "countryName",
  "stateCode",
  "stateName",
  "cityName",
  "cityId",
  "phonecode",
  "phoneNumber",
  "firstName",
  "lastName",
  "email",
  "line1",
  "line2",
  "postalCode",
  "notes",
  "currency",
  "regionComplete",
  "formReady",
  "searchLabel",
];

export function isSameCheckoutValue(
  a: YnCheckoutAddressValue,
  b: YnCheckoutAddressValue | null | undefined,
): boolean {
  if (!b) {
    return false;
  }
  return CHECKOUT_VALUE_KEYS.every((key) => a[key] === b[key]);
}

/** 对比两次 value，得到变更字段名（用于 `change` 的 `changedFields`） */
export function diffCheckoutValueKeys(
  prev: YnCheckoutAddressValue | null | undefined,
  next: YnCheckoutAddressValue,
): YnCheckoutAddressValueKey[] {
  const baseline =
    prev ??
    emptyCheckoutAddressValue(next.provider ?? null, next.probeReason ?? "");
  const changed: YnCheckoutAddressValueKey[] = [];
  for (const key of CHECKOUT_VALUE_KEYS) {
    if (baseline[key] !== next[key]) {
      changed.push(key);
    }
  }
  return changed;
}

function sameValidation(
  a: YnCheckoutAddressChangeDetail["validation"],
  b: YnCheckoutAddressChangeDetail["validation"],
): boolean {
  if (
    a.valid !== b.valid ||
    a.regionComplete !== b.regionComplete ||
    a.formReady !== b.formReady ||
    a.errors.length !== b.errors.length
  ) {
    return false;
  }
  for (let i = 0; i < a.errors.length; i += 1) {
    const left = a.errors[i];
    const right = b.errors[i];
    if (left.field !== right.field || left.code !== right.code) {
      return false;
    }
  }
  return true;
}

/** 用于 `change` 去重，避免重复派发相同 value + 校验快照 */
export function isSameChangeDetail(
  a: YnCheckoutAddressChangeDetail,
  b: YnCheckoutAddressChangeDetail | null | undefined,
): boolean {
  if (!b) {
    return false;
  }
  return isSameCheckoutValue(a.value, b.value) && sameValidation(a.validation, b.validation);
}
