import type { YnCheckoutAddressChangeDetail, YnCheckoutAddressValue } from "./types";

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

const VALUE_KEYS: (keyof YnCheckoutAddressValue)[] = [
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
  return VALUE_KEYS.every((key) => a[key] === b[key]);
}

export function isSameChangeDetail(
  a: YnCheckoutAddressChangeDetail,
  b: YnCheckoutAddressChangeDetail | null | undefined,
): boolean {
  if (!b) {
    return false;
  }
  return (
    isSameCheckoutValue(a.value, b.value) &&
    a.validation.valid === b.validation.valid &&
    a.validation.errors.length === b.validation.errors.length
  );
}
