/**
 * dr5hn 区域数据（@countrystatecity/countries-browser）按需加载。
 * Google / Photon 路径不触发此 chunk，减小结账地址组件首包体积。
 */

type Dr5hnModule = typeof import("./dr5hn-region-service");

let cached: Dr5hnModule | null = null;
let loading: Promise<Dr5hnModule> | null = null;

/** 已加载则同步返回，否则动态 import */
export function loadDr5hnModule(): Promise<Dr5hnModule> {
  if (cached) {
    return Promise.resolve(cached);
  }
  loading ??= import("./dr5hn-region-service").then((mod) => {
    cached = mod;
    return mod;
  });
  return loading;
}

/** 探测/筛选预热后，避免重复 import */
export function peekDr5hnModule(): Dr5hnModule | null {
  return cached;
}
