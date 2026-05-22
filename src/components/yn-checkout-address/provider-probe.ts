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
 * 选源顺序：Google（有 Key 且脚本可加载）→ dr5hn（国家表非空）→ Photon → manual。
 * dr5hn 与 Photon 探测并行，缩短无 Google 时的首屏等待。
 */
export async function probeAddressProvider(options?: {
  googleMapsApiKey?: string;
  regionFilter?: YnCheckoutRegionFilter;
  signal?: AbortSignal;
}): Promise<ProviderProbeResult> {
  const signal = options?.signal;
  const key = resolveGoogleMapsApiKey(options?.googleMapsApiKey);
  let googleAttempted = false;

  if (key) {
    googleAttempted = true;
    try {
      await withTimeout(loadGoogleMaps(key), PROBE_TIMEOUT_MS, signal);
      return { mode: "google", reason: "Google Maps API key configured and script loaded" };
    } catch {
      /* 有 Key 但加载失败 → 继续探测 dr5hn / Photon */
    }
  }

  const dr5hnTask = withTimeout(
    loadDr5hnModule().then((m) => m.loadCountries(options?.regionFilter)),
    PROBE_TIMEOUT_MS,
    signal,
  ).catch(() => [] as Awaited<ReturnType<typeof import("./dr5hn-region-service")["loadCountries"]>>);

  const photonTask = withTimeout(probePhotonReachable(signal), PROBE_TIMEOUT_MS, signal).catch(
    () => false,
  );

  const [countries, photonOk] = await Promise.all([dr5hnTask, photonTask]);

  if (countries.length > 0) {
    const reason = googleAttempted
      ? "Google Places unavailable; dr5hn region data reachable"
      : "No Google API key; dr5hn region data reachable";
    return { mode: "dr5hn", reason };
  }

  if (photonOk) {
    const reason = googleAttempted
      ? "Google and dr5hn unavailable; using Photon fallback"
      : key
        ? "dr5hn unavailable; using Photon fallback"
        : "No Google API key and dr5hn unavailable; using Photon fallback";
    return { mode: "photon", reason };
  }

  const reason = googleAttempted
    ? "Google, dr5hn, and Photon unavailable; manual region entry"
    : key
      ? "dr5hn and Photon unavailable; manual region entry"
      : "No Google API key; dr5hn and Photon unavailable; manual region entry";

  return { mode: "manual", reason };
}
