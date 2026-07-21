import { loadGoogleMaps, probePhotonReachable } from "./address-providers";
import { loadDr5hnModule } from "./dr5hn-loader";
import type { YnCheckoutRegionFilter } from "./types";

export type AddressProviderMode = "google" | "dr5hn" | "photon" | "manual";

export type ProviderProbeResult = {
  mode: AddressProviderMode;
  reason: string;
};

const PROBE_TIMEOUT_MS = 6500;

const withTimeout = <T>(task: Promise<T>, ms: number, signal?: AbortSignal): Promise<T> => {
  return new Promise<T>((resolve, reject) => {
    const timer = window.setTimeout(() => reject(new Error("probe-timeout")), ms);
    const onAbort = () => {
      window.clearTimeout(timer);
      reject(new DOMException("Aborted", "AbortError"));
    };
    if (signal?.aborted) {
      onAbort();
      return;
    }
    signal?.addEventListener("abort", onAbort, { once: true });

    task
      .then((value) => {
        window.clearTimeout(timer);
        signal?.removeEventListener("abort", onAbort);
        resolve(value);
      })
      .catch((error) => {
        window.clearTimeout(timer);
        signal?.removeEventListener("abort", onAbort);
        reject(error);
      });
  });
};

/** Google Maps API Key：属性优先，其次构建环境变量 */
export function resolveGoogleMapsApiKey(explicit?: string): string {
  const fromProp = explicit?.trim();
  if (fromProp) {
    return fromProp;
  }
  try {
    return import.meta.env.VITE_GOOGLE_MAPS_API_KEY?.trim() ?? "";
  } catch {
    return "";
  }
}

/**
 * dr5hn 数据根：属性优先，其次 `VITE_DR5HN_BASE_URL`。
 * 须指向含 `/data/countries.json` 的目录（与 `@countrystatecity/countries-browser` 的 `dist` 同结构）。
 */
export function resolveDr5hnBaseUrl(explicit?: string): string {
  const fromProp = explicit?.trim();
  if (fromProp) {
    return fromProp;
  }
  try {
    return import.meta.env.VITE_DR5HN_BASE_URL?.trim() ?? "";
  } catch {
    return "";
  }
}

type Dr5hnCountries = Awaited<
  ReturnType<typeof import("./dr5hn-region-service")["loadCountries"]>
>;

/**
 * 自建 baseURL（若配置）→ 默认 jsDelivr CDN → 失败则空数组。
 * 自建与官方 CDN 同属 dr5hn 链路，不是独立 provider。
 */
async function probeDr5hnCountries(
  regionFilter: YnCheckoutRegionFilter | undefined,
  baseUrl: string,
  signal?: AbortSignal,
): Promise<{ countries: Dr5hnCountries; source: "self-hosted" | "cdn" | "none" }> {
  const mod = await loadDr5hnModule();

  const tryLoad = async (url: string, source: "self-hosted" | "cdn") => {
    mod.applyDr5hnBaseUrl(url);
    const countries = await withTimeout(mod.loadCountries(regionFilter, true), PROBE_TIMEOUT_MS, signal);
    if (countries.length > 0) {
      return { countries, source };
    }
    return null;
  };

  if (baseUrl) {
    try {
      const hit = await tryLoad(baseUrl, "self-hosted");
      if (hit) {
        return hit;
      }
    } catch {
      /* 自建失败 → 默认 CDN */
    }
  }

  try {
    const hit = await tryLoad("", "cdn");
    if (hit) {
      return hit;
    }
  } catch {
    /* CDN 不可用 */
  }

  return { countries: [], source: "none" };
}

/**
 * 选源顺序：自建 dr5hn（可选）→ 默认 dr5hn CDN → Photon → Google（有 Key 且脚本可加载）→ manual。
 * 优先免费/自建源，减少 Google Places 额度消耗；dr5hn 与 Photon 探测并行。
 */
export async function probeAddressProvider(options?: {
  googleMapsApiKey?: string;
  dr5hnBaseUrl?: string;
  regionFilter?: YnCheckoutRegionFilter;
  signal?: AbortSignal;
}): Promise<ProviderProbeResult> {
  const signal = options?.signal;
  const key = resolveGoogleMapsApiKey(options?.googleMapsApiKey);
  const dr5hnBaseUrl = resolveDr5hnBaseUrl(options?.dr5hnBaseUrl);

  const dr5hnTask = probeDr5hnCountries(options?.regionFilter, dr5hnBaseUrl, signal).catch(() => ({
    countries: [] as Dr5hnCountries,
    source: "none" as const,
  }));

  const photonTask = withTimeout(probePhotonReachable(signal), PROBE_TIMEOUT_MS, signal).catch(
    () => false,
  );

  const [dr5hn, photonOk] = await Promise.all([dr5hnTask, photonTask]);

  if (dr5hn.countries.length > 0) {
    const reason =
      dr5hn.source === "self-hosted"
        ? "dr5hn self-hosted reachable"
        : dr5hnBaseUrl
          ? "dr5hn self-hosted unavailable; using default CDN"
          : "dr5hn region data reachable";
    return { mode: "dr5hn", reason };
  }

  if (photonOk) {
    return { mode: "photon", reason: "dr5hn unavailable; using Photon fallback" };
  }

  if (key) {
    try {
      await withTimeout(loadGoogleMaps(key), PROBE_TIMEOUT_MS, signal);
      return {
        mode: "google",
        reason: "dr5hn and Photon unavailable; Google Maps API key configured and script loaded",
      };
    } catch {
      /* Key 存在但脚本失败 → manual */
    }
  }

  const reason = key
    ? "dr5hn, Photon, and Google unavailable; manual region entry"
    : "dr5hn and Photon unavailable; no Google API key; manual region entry";

  return { mode: "manual", reason };
}
