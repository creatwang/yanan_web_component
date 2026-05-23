export type YnSkuCartButtonLoadingMode = "icon" | "overlay";

export type YnSkuSpecValue = string | number;

export type YnSkuItem = {
  price?: number;
  id?: string | number;
  stock?: number;
  [specKey: string]: YnSkuSpecValue | undefined;
};

export type YnSkuSelection = Record<string, YnSkuSpecValue>;

export type YnSkuChangeDetail = {
  /** 当前各维度已选值（未选中的维度不在对象中） */
  selections: YnSkuSelection;
  /** 全部维度选齐且匹配到 SKU 时为完整 SKU，否则为 null */
  sku: YnSkuItem | null;
  /** 是否满足加购条件（全部规格已选且匹配到 SKU） */
  ready: boolean;
  /** 尚未选择的规格维度 key 列表 */
  missingKeys: string[];
};

/** pick-one 初始化完成时 `init` 事件的 detail，结构与 change 一致 */
export type YnSkuInitDetail = YnSkuChangeDetail;

export type YnSkuSubmitDetail = {
  selections: YnSkuSelection;
  sku: YnSkuItem;
};

export type YnSkuSubmitInstance = {
  done: () => void;
};

export type YnSkuSubmitHandler = (
  detail: YnSkuSubmitDetail,
  instance: YnSkuSubmitInstance
) => void | Promise<void>;

export interface YnSkuSubmitEvent extends CustomEvent<YnSkuSubmitDetail> {
  instance: YnSkuSubmitInstance;
}

export const YN_SKU_META_KEYS = new Set(["price", "id", "stock", "skuId"]);
