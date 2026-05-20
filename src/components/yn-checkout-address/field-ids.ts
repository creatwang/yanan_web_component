/** 表单字段 id（google / dr5hn / manual 三套，避免渲染层硬编码分散） */
export const CHECKOUT_FIELD_IDS = {
  google: { phone: "yn-ca-phone", line1: "yn-ca-line1", line2: "yn-ca-line2", zip: "yn-ca-zip" },
  dr5hn: { phone: "yn-ca-d-phone", line1: "yn-ca-d-line1", line2: "yn-ca-d-line2", zip: "yn-ca-d-zip" },
  manual: { phone: "yn-ca-m-phone", line1: "yn-ca-m-line1", line2: "yn-ca-m-line2", zip: "yn-ca-m-zip" },
} as const;
