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
/** 并发拉取 states/cities，避免串行 CDN 请求过慢；限制连接数防止打满浏览器同域连接 */
const FETCH_CONCURRENCY = 4;

let countriesCache: ICountry[] | null = null;
let cacheFilterKey = "";
const statesRequestCache = new Map<string, Promise<IState[]>>();

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

/** 有限并发执行；signal 中止后不再启动新任务 */
async function runPool<T, R>(
  items: T[],
  limit: number,
  worker: (item: T) => Promise<R>,
  signal?: AbortSignal,
): Promise<R[]> {
  if (!items.length || signal?.aborted) {
    return [];
  }
  const size = Math.min(Math.max(1, limit), items.length);
  const out: R[] = new Array(items.length);
  let next = 0;

  const runWorker = async () => {
    while (next < items.length) {
      if (signal?.aborted) {
        return;
      }
      const index = next;
      next += 1;
      out[index] = await worker(items[index]);
    }
  };

  await Promise.all(Array.from({ length: size }, () => runWorker()));
  return out;
}

function clearStatesRequestCache() {
  statesRequestCache.clear();
}

function loadStatesOfCountry(countryCode: string, signal?: AbortSignal): Promise<IState[]> {
  const key = countryCode.toUpperCase();
  let pending = statesRequestCache.get(key);
  if (!pending) {
    pending = withRetry(() => getStatesOfCountry(key), signal).catch((error) => {
      statesRequestCache.delete(key);
      throw error;
    });
    statesRequestCache.set(key, pending);
  }
  return pending;
}

export function peekCountriesCache(filter?: YnCheckoutRegionFilter): ICountry[] | null {
  const key = filterKey(filter);
  if (cacheFilterKey === key && countriesCache != null) {
    return countriesCache;
  }
  return null;
}

export async function loadCountries(filter?: YnCheckoutRegionFilter, force = false) {
  const key = filterKey(filter);
  if (force || countriesCache === null || cacheFilterKey !== key) {
    clearStatesRequestCache();
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
  statesPrefetched?: IState[],
): Promise<Dr5hnRegionSuggestion[]> {
  const states = statesPrefetched ?? (await loadStatesOfCountry(country.iso2, signal));
  if (signal.aborted) return [];

  const q = norm(query);

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
  const eligible = scan.filter((s) => passesStateFilter(country.iso2, s.iso2, filter));
  if (!eligible.length || signal.aborted) {
    return [];
  }

  const batches = await runPool(
    eligible,
    FETCH_CONCURRENCY,
    async (state) => {
      if (signal.aborted) return [] as Dr5hnRegionSuggestion[];
      const cities = await withRetry(
        () => searchCitiesByName(country.iso2, state.iso2, query),
        signal,
      );
      return cities
        .slice(0, MAX_CITIES_PER_STATE)
        .filter((city) => passesCityFilter(country.iso2, city.id, filter))
        .map((city) => suggestion("city", country, state, city));
    },
    signal,
  );

  const out: Dr5hnRegionSuggestion[] = [];
  for (const batch of batches) {
    for (const item of batch) {
      out.push(item);
      if (out.length >= MAX_RESULTS) {
        return out;
      }
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

  const picked = pickCountries(query, countries);
  if (signal.aborted) {
    return results.sort(
      (a, b) =>
        ({ city: 0, state: 1, country: 2 }[a.level] - { city: 0, state: 1, country: 2 }[b.level]),
    );
  }

  const perCountry = await runPool(
    picked,
    FETCH_CONCURRENCY,
    async (country) => {
      if (signal.aborted) {
        return { states: [] as Dr5hnRegionSuggestion[], cities: [] as Dr5hnRegionSuggestion[] };
      }
      const rawStates = await loadStatesOfCountry(country.iso2, signal);
      const stateSuggestions: Dr5hnRegionSuggestion[] = [];
      for (const state of rawStates) {
        if (state.name.toLowerCase().includes(q)) {
          stateSuggestions.push(suggestion("state", country, state, null));
        }
      }
      const cities = await citiesInCountry(country, query, signal, filter, rawStates);
      return { states: stateSuggestions, cities };
    },
    signal,
  );

  for (const batch of perCountry) {
    for (const item of [...batch.states, ...batch.cities]) {
      push(item);
      if (results.length >= MAX_RESULTS) {
        break;
      }
    }
    if (results.length >= MAX_RESULTS) {
      break;
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
