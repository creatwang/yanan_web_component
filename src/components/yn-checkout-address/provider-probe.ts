import { loadGoogleMaps } from "./address-providers";

import { loadCountries } from "./dr5hn-region-service";

import type { YnCheckoutRegionFilter } from "./types";



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



function resolveGoogleKey(explicit?: string) {

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

 * 选源顺序（保持不变）：

 * 1) 有 Google Places API Key 且脚本可加载 → google

 * 2) 无 Key 或 Google 失败 → 探测 dr5hn（CDN 国家表可拉取且过滤后非空）

 * 3) dr5hn 不可用 → photon

 *

 * 运行时：若已走 dr5hn 但单次搜索无数据/失败，由组件降级 photon（见 switchToPhotonFromDr5hn）。

 */

export async function probeAddressProvider(options?: {

  googleMapsApiKey?: string;

  regionFilter?: YnCheckoutRegionFilter;

  signal?: AbortSignal;

}): Promise<ProviderProbeResult> {

  const signal = options?.signal;

  const key = resolveGoogleKey(options?.googleMapsApiKey);

  let googleAttempted = false;



  if (key) {

    googleAttempted = true;

    try {

      await withTimeout(loadGoogleMaps(key), PROBE_TIMEOUT_MS, signal);

      return { mode: "google", reason: "Google Maps API key configured and script loaded" };

    } catch {

      /* 有 Key 但加载失败 → 继续探测 dr5hn */

    }

  }



  try {

    const countries = await withTimeout(

      loadCountries(options?.regionFilter),

      PROBE_TIMEOUT_MS,

      signal,

    );

    if (countries.length === 0) {

      throw new Error("dr5hn-empty-after-filter");

    }

    const reason = googleAttempted

      ? "Google Places unavailable; dr5hn region data reachable"

      : "No Google API key; dr5hn region data reachable";

    return { mode: "dr5hn", reason };

  } catch {

    /* photon */

  }



  const reason = googleAttempted

    ? "Google and dr5hn unavailable; using Photon fallback"

    : key

      ? "dr5hn unavailable; using Photon fallback"

      : "No Google API key and dr5hn unavailable; using Photon fallback";



  return { mode: "photon", reason };

}


