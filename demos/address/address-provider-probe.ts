import { loadGoogleMaps } from "./address-providers";
import { loadCountries } from "./dr5hn-region-service";

export type AddressProviderMode = "google" | "dr5hn" | "photon";

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

/**
 * Resolve checkout address provider:
 * 1) Google Places when VITE_GOOGLE_MAPS_API_KEY is set and script loads
 * 2) dr5hn when CDN data is reachable
 * 3) Photon as last resort
 */
export async function probeAddressProvider(signal?: AbortSignal): Promise<ProviderProbeResult> {
  const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY?.trim();

  if (key) {
    try {
      await withTimeout(loadGoogleMaps(key), PROBE_TIMEOUT_MS, signal);
      return { mode: "google", reason: "检测到 VITE_GOOGLE_MAPS_API_KEY" };
    } catch {
      /* try dr5hn then photon */
    }
  }

  try {
    await withTimeout(loadCountries(), PROBE_TIMEOUT_MS, signal);
    return { mode: "dr5hn", reason: "dr5hn CDN 可访问" };
  } catch {
    /* photon */
  }

  return { mode: "photon", reason: "dr5hn 不可用，使用 Photon 兜底" };
}
