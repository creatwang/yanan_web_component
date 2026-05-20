import type { YnCheckoutRegionFilter } from "./types";

const normCode = (code: string) => code.trim().toUpperCase();

export function passesCountryFilter(
  countryCode: string,
  filter?: YnCheckoutRegionFilter,
): boolean {
  const code = normCode(countryCode);
  if (!code) {
    return false;
  }

  const include = filter?.includeCountries;
  if (include && include.length > 0) {
    const allow = new Set(include.map(normCode));
    if (!allow.has(code)) {
      return false;
    }
  }

  const excluded = filter?.excludeRegions?.countries;
  if (excluded && excluded.length > 0) {
    const block = new Set(excluded.map(normCode));
    if (block.has(code)) {
      return false;
    }
  }

  return true;
}

export function passesStateFilter(
  countryCode: string,
  stateCode: string | null,
  filter?: YnCheckoutRegionFilter,
): boolean {
  if (!passesCountryFilter(countryCode, filter)) {
    return false;
  }
  if (!stateCode) {
    return true;
  }
  const list = filter?.excludeRegions?.states;
  if (!list?.length) {
    return true;
  }
  const cc = normCode(countryCode);
  const sc = stateCode.trim().toUpperCase();
  return !list.some((e) => normCode(e.countryCode) === cc && e.stateCode.trim().toUpperCase() === sc);
}

export function passesCityFilter(
  countryCode: string,
  cityId: number | null,
  filter?: YnCheckoutRegionFilter,
): boolean {
  if (!passesCountryFilter(countryCode, filter)) {
    return false;
  }
  if (cityId == null) {
    return true;
  }
  const list = filter?.excludeRegions?.cities;
  if (!list?.length) {
    return true;
  }
  const cc = normCode(countryCode);
  return !list.some((e) => normCode(e.countryCode) === cc && e.cityId === cityId);
}

export function filterByRegion<T extends { countryCode: string }>(
  items: T[],
  filter?: YnCheckoutRegionFilter,
): T[] {
  if (!filter?.includeCountries?.length && !filter?.excludeRegions?.countries?.length) {
    return items;
  }
  return items.filter((item) => passesCountryFilter(item.countryCode, filter));
}

/** 常见中国大陆检索词，用于提示已排除 CN */
const CHINA_HINTS = ["beijing", "peking", "shanghai", "guangzhou", "shenzhen", "china", "北京", "上海"];

export function isChinaQuery(query: string, filter?: YnCheckoutRegionFilter) {
  const blocked = filter?.excludeRegions?.countries?.some((c) => normCode(c) === "CN");
  if (!blocked) {
    return false;
  }
  const q = query.trim().toLowerCase();
  return CHINA_HINTS.some((h) => q.includes(h));
}
