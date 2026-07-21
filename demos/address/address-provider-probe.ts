import { loadCountries } from "./dr5hn-region-service";

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

/**
 * Demo 选源（与组件一致的省额度意图）：
 * dr5hn → Photon（demo 无独立 Photon 探测，失败后直接用 Photon；Google 见正式组件探测）。
 */
export async function probeAddressProvider(signal?: AbortSignal): Promise<ProviderProbeResult> {
  try {
    await withTimeout(loadCountries(), PROBE_TIMEOUT_MS, signal);
    return { mode: "dr5hn", reason: "dr5hn CDN 可访问" };
  } catch {
    /* photon */
  }

  return { mode: "photon", reason: "dr5hn 不可用，使用 Photon 兜底" };
}
