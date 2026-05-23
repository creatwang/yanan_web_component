import { YN_SKU_META_KEYS, type YnSkuItem, type YnSkuSelection, type YnSkuSpecValue } from "./types";

export type YnSkuGroupSpec = {
  specKey: string;
  depth: number;
  list: YnSkuSpecValue[];
};

export const toComparable = (value: YnSkuSpecValue) => String(value);

export const getSpecKeys = (items: YnSkuItem[]): string[] => {
  if (!items.length) return [];
  return Object.keys(items[0]).filter((key) => !YN_SKU_META_KEYS.has(key));
};

export const buildGroupSpec = (items: YnSkuItem[], keys: string[]): YnSkuGroupSpec[] =>
  keys.map((specKey, depth) => ({
    specKey,
    depth,
    list: [...new Set(items.map((row) => row[specKey]).filter((value) => value !== undefined))] as YnSkuSpecValue[]
  }));

export const buildGroupHas = (items: YnSkuItem[], keys: string[], curs: string[]): YnSkuSpecValue[][] =>
  keys.map((_, depth) => {
    const key = keys[depth];
    const values = [...new Set(items.map((row) => row[key]).filter((value) => value !== undefined))] as YnSkuSpecValue[];
    return values.filter((target) =>
      items.some((row) =>
        curs.every((cur, depthIndex) => {
          const rowKey = keys[depthIndex];
          return depth === depthIndex || !cur || (toComparable(row[rowKey]!) === cur && toComparable(row[key]!) === toComparable(target));
        })
      )
    );
  });

export const buildSelection = (keys: string[], curs: string[]): YnSkuSelection => {
  const selections: YnSkuSelection = {};
  keys.forEach((key, index) => {
    const cur = curs[index];
    if (cur) {
      selections[key] = cur as YnSkuSpecValue;
    }
  });
  return selections;
};

export const findMatchedSku = (items: YnSkuItem[], keys: string[], curs: string[]): YnSkuItem | null => {
  if (!keys.length || !curs.every(Boolean)) return null;
  return (
    items.find((row) => keys.every((key, index) => toComparable(row[key]!) === curs[index])) ?? null
  );
};

export const getMissingKeys = (keys: string[], curs: string[]): string[] =>
  keys.filter((_, index) => !curs[index]);

/** 按规格维度顺序贪心选取第一组可用 SKU 组合 */
export const buildFirstAvailableCurs = (items: YnSkuItem[], keys: string[]): string[] => {
  if (!items.length || !keys.length) return [];

  const curs = Array.from({ length: keys.length }, () => "");
  for (let depth = 0; depth < keys.length; depth += 1) {
    const available = buildGroupHas(items, keys, curs)[depth];
    if (!available?.length) break;
    curs[depth] = toComparable(available[0]);
  }
  return curs;
};
