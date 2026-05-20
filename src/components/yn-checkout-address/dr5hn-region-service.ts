import {
  getAllCitiesOfCountry,
  getCountries,
  getCountryByCode,
  getStatesOfCountry,
  searchCitiesByName,
  type ICity,
  type ICountry,
  type IState,
} from "@countrystatecity/countries-browser";
import {
  isChinaQuery,
  passesCityFilter,
  passesCountryFilter,
  passesStateFilter,
} from "./region-filter";
import type { Dr5hnRegionSuggestion, RegionSearchLevel } from "./dr5hn-region-types";
import type { YnCheckoutRegionFilter } from "./types";

const POPULAR_CODES = ["AE", "SA", "US", "GB", "DE", "FR", "AU", "SG", "JP", "KR"];
const MAX_RESULTS = 10;
const MAX_STATES = 6;
const MAX_CITIES_PER_STATE = 4;
const RETRY_ATTEMPTS = 2;
const RETRY_DELAY_MS = 400;

let countriesCache: ICountry[] | null = null;
let cacheFilterKey = "";

const filterKey = (filter?: YnCheckoutRegionFilter) =>
  JSON.stringify({
    include: filter?.includeCountries?.map((c) => c.toUpperCase()).sort(),
    excludeCountries: filter?.excludeRegions?.countries?.map((c) => c.toUpperCase()).sort(),
  });

const norm = (v: string) => v.trim().toLowerCase();

async function withRetry<T>(task: () => Promise<T>, signal?: AbortSignal): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= RETRY_ATTEMPTS; attempt += 1) {
    if (signal?.aborted) {
      throw new DOMException("Aborted", "AbortError");
    }
    try {
      return await task();
    } catch (error) {
      lastError = error;
      if (signal?.aborted) {
        throw error;
      }
      if (attempt < RETRY_ATTEMPTS) {
        await new Promise((resolve) => window.setTimeout(resolve, RETRY_DELAY_MS * (attempt + 1)));
      }
    }
  }
  throw lastError;
}

export async function loadCountries(filter?: YnCheckoutRegionFilter, force = false) {
  const key = filterKey(filter);
  if (force || countriesCache === null || cacheFilterKey !== key) {
    const all = await withRetry(() => getCountries());
    countriesCache = all.filter((c) => passesCountryFilter(c.iso2, filter));
    cacheFilterKey = key;
  }
  return countriesCache;
}

function suggestion(
  level: RegionSearchLevel,
  country: ICountry,
  state: IState | null,
  city: ICity | null,
): Dr5hnRegionSuggestion {
  const cityName = city?.name ?? "";
  const stateName = state?.name ?? null;
  const label =
    level === "country"
      ? `${country.emoji} ${country.name} (+${country.phonecode})`
      : [cityName, stateName, country.name].filter(Boolean).join(", ");

  return {
    id: `${level}-${country.iso2}-${state?.iso2 ?? ""}-${city?.id ?? ""}`,
    label,
    level,
    countryCode: country.iso2,
    countryName: country.name,
    stateCode: state?.iso2 ?? null,
    stateName,
    cityId: city?.id ?? null,
    cityName,
    phonecode: country.phonecode,
    currency: country.currency,
  };
}

function pickCountries(query: string, countries: ICountry[]) {
  const q = norm(query);
  const matched = countries.filter(
    (c) => c.name.toLowerCase().includes(q) || c.iso2.toLowerCase() === q,
  );
  const popular = POPULAR_CODES.map((code) => countries.find((c) => c.iso2 === code)).filter(
    (c): c is ICountry => Boolean(c),
  );
  const map = new Map<string, ICountry>();
  [...matched, ...popular].forEach((c) => map.set(c.iso2, c));
  return [...map.values()].slice(0, 5);
}

async function citiesInCountry(
  country: ICountry,
  query: string,
  signal: AbortSignal,
  filter?: YnCheckoutRegionFilter,
): Promise<Dr5hnRegionSuggestion[]> {
  const states = await withRetry(() => getStatesOfCountry(country.iso2), signal);
  if (signal.aborted) return [];

  const q = norm(query);
  const out: Dr5hnRegionSuggestion[] = [];

  if (states.length === 0) {
    const all = await withRetry(() => getAllCitiesOfCountry(country.iso2), signal);
    return all
      .filter((c) => c.name.toLowerCase().includes(q))
      .filter((c) => passesCityFilter(country.iso2, c.id, filter))
      .slice(0, MAX_RESULTS)
      .map((c) => suggestion("city", country, null, c));
  }

  const stateHits = states.filter(
    (s) =>
      s.name.toLowerCase().includes(q) && passesStateFilter(country.iso2, s.iso2, filter),
  );
  const scan = stateHits.length > 0 ? stateHits.slice(0, MAX_STATES) : states.slice(0, 4);

  for (const state of scan) {
    if (signal.aborted) break;
    if (!passesStateFilter(country.iso2, state.iso2, filter)) {
      continue;
    }
    const cities = await withRetry(
      () => searchCitiesByName(country.iso2, state.iso2, query),
      signal,
    );
    for (const city of cities.slice(0, MAX_CITIES_PER_STATE)) {
      if (!passesCityFilter(country.iso2, city.id, filter)) {
        continue;
      }
      out.push(suggestion("city", country, state, city));
      if (out.length >= MAX_RESULTS) return out;
    }
  }
  return out;
}

export async function searchDr5hnRegions(
  query: string,
  signal: AbortSignal,
  filter?: YnCheckoutRegionFilter,
) {
  const q = norm(query);
  if (q.length < 2) return [];

  const countries = await loadCountries(filter);
  if (signal.aborted) return [];

  const results: Dr5hnRegionSuggestion[] = [];
  const seen = new Set<string>();
  const push = (item: Dr5hnRegionSuggestion) => {
    if (!passesCountryFilter(item.countryCode, filter)) return;
    if (!passesStateFilter(item.countryCode, item.stateCode, filter)) return;
    if (!passesCityFilter(item.countryCode, item.cityId, filter)) return;
    if (seen.has(item.id) || results.length >= MAX_RESULTS) return;
    seen.add(item.id);
    results.push(item);
  };

  for (const country of countries) {
    if (country.name.toLowerCase().includes(q)) {
      push(suggestion("country", country, null, null));
    }
  }

  for (const country of pickCountries(query, countries)) {
    if (signal.aborted) break;
    const states = await withRetry(() => getStatesOfCountry(country.iso2), signal);
    for (const state of states) {
      if (state.name.toLowerCase().includes(q)) {
        push(suggestion("state", country, state, null));
      }
    }
    for (const item of await citiesInCountry(country, query, signal, filter)) {
      push(item);
    }
  }

  return results.sort(
    (a, b) =>
      ({ city: 0, state: 1, country: 2 }[a.level] - { city: 0, state: 1, country: 2 }[b.level]),
  );
}

export async function enrichCountry(code: string, item: Dr5hnRegionSuggestion) {
  try {
    const meta = await withRetry(() => getCountryByCode(code));
    if (!meta) return item;
    return {
      ...item,
      countryName: meta.name,
      phonecode: meta.phonecode,
      currency: meta.currency,
    };
  } catch {
    return item;
  }
}

export { isChinaQuery };
