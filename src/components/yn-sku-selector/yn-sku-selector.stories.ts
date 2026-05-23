import type { Meta, StoryObj } from "@storybook/web-components";
import { expect, fn } from "@storybook/test";
import { html, nothing } from "lit";
import { ref } from "lit/directives/ref.js";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";
import { ynSkuCartSvg } from "../../asset/svg";
import type { YnSkuSelector } from "./yn-sku-selector";
import type { YnSkuCartButton } from "./yn-sku-cart-button";
import type {
  YnSkuCartButtonLoadingMode,
  YnSkuChangeDetail,
  YnSkuInitDetail,
  YnSkuItem,
  YnSkuSubmitDetail,
  YnSkuSubmitEvent
} from "./types";
import "./yn-sku-selector";

const demoSkus = [
  { weight: "1kg", color: "红色", size: "37", price: 65, id: "1" },
  { weight: "1kg", color: "红色", size: "38", price: 65, id: "2" },
  { weight: "1kg", color: "黑色", size: "38", price: 68, id: "3" },
  { weight: "1kg", color: "黑色", size: "40", price: 68, id: "4" },
  { weight: "2kg", color: "黑色", size: "38", price: 72, id: "5" },
  { weight: "2kg", color: "黑色", size: "39", price: 72, id: "6" },
  { weight: "2kg", color: "白色", size: "38", price: 75, id: "7" },
  { weight: "2kg", color: "白色", size: "41", price: 75, id: "8" },
  { weight: "3kg", color: "白色", size: "39", price: 80, id: "9" },
  { weight: "3kg", color: "蓝色", size: "40", price: 82, id: "10" },
  { weight: "3kg", color: "蓝色", size: "42", price: 82, id: "11" }
];

const jerseySkus = [
  { size: "S", price: 65, id: "s" },
  { size: "M", price: 65, id: "m" },
  { size: "L", price: 65, id: "l" },
  { size: "XL", price: 65, id: "xl" },
  { size: "2XL", price: 65, id: "2xl" }
];

const skuWithChannelSkus = [
  { weight: "1kg", color: "红色", size: "37", channel: "online", price: 65, id: "1" },
  { weight: "1kg", color: "红色", size: "38", channel: "store", price: 65, id: "2" },
  { weight: "2kg", color: "黑色", size: "38", channel: "online", price: 72, id: "3" },
  { weight: "2kg", color: "白色", size: "41", channel: "store", price: 75, id: "4" }
];

const euroIcon = `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 10h11M5 14h11M16 7a7 7 0 1 0 0 10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`;

const defaultSubmitIcon = html`${unsafeSVG(
  ynSkuCartSvg.replace(/^<svg /, '<svg slot="submit-icon" ')
)}`;

const resolveSubmitIcon = (submitIcon?: unknown) => submitIcon ?? defaultSubmitIcon;

const sleep = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms));

const mockAddToCart = async (skuId: string | number | undefined, delayMs = 1200) => {
  await sleep(delayMs);
  if (skuId == null) throw new Error("sku id missing");
  return { ok: true, skuId };
};

type Args = {
  skus: YnSkuItem[];
  currency: string;
  currencyIcon: string;
  simple: boolean;
  pickOne: boolean;
  submitLabel: string;
  loadingText: string;
  loadingMode: YnSkuCartButtonLoadingMode;
  cartIcon: string;
  showCartIcon: boolean;
  incompleteHint: string;
  labels: Record<string, string>;
  specKeyWhitelist: string[];
  specKeyExclude: string[];
  disabled: boolean;
  rowHeight: string;
  rowGap: string;
  labelRowGap: string;
  optionMinWidth: string;
  optionBorderColor: string;
  optionActiveBg: string;
  optionActiveColor: string;
  submitHeight: string;
  submitMarginTop: string;
  submitOuterGap: string;
  submitInnerHeight: string;
  submitInsetColor: string;
  submitDividerColor: string;
  submitPriceWidth: string;
  priceFontWeight: string;
  submitBg: string;
  submitColor: string;
  hintColor: string;
  loadingSize: string;
  loadingIconSize: string;
  demoSubmitLoading: boolean;
  onChange?: ReturnType<typeof fn>;
  onInit?: ReturnType<typeof fn>;
  onSubmit?: ReturnType<typeof fn>;
  title?: unknown;
  submitIcon?: unknown;
};

const cssVarIfPresent = (name: string, value: string | undefined) => {
  const normalized = value?.trim();
  return normalized ? `${name}:${normalized}` : null;
};

const skuStyle = (args: Args) =>
  [
    `--yn-sku-selector-row-height:${args.rowHeight}`,
    `--yn-sku-selector-option-height:${args.rowHeight}`,
    `--yn-sku-selector-row-gap:${args.rowGap}`,
    `--yn-sku-selector-label-row-gap:${args.labelRowGap}`,
    `--yn-sku-selector-option-min-width:${args.optionMinWidth}`,
    `--yn-sku-selector-option-border-color:${args.optionBorderColor}`,
    `--yn-sku-selector-option-active-bg:${args.optionActiveBg}`,
    `--yn-sku-selector-option-active-color:${args.optionActiveColor}`,
    `--yn-sku-selector-submit-height:${args.submitHeight}`,
    `--yn-sku-selector-submit-margin-top:${args.submitMarginTop}`,
    `--yn-sku-selector-submit-outer-gap:${args.submitOuterGap}`,
    `--yn-sku-selector-submit-inner-height:${args.submitInnerHeight}`,
    `--yn-sku-selector-submit-inset-color:${args.submitInsetColor}`,
    `--yn-sku-selector-submit-divider-color:${args.submitDividerColor}`,
    `--yn-sku-selector-submit-price-width:${args.submitPriceWidth}`,
    `--yn-sku-selector-price-font-weight:${args.priceFontWeight}`,
    `--yn-sku-selector-submit-bg:${args.submitBg}`,
    `--yn-sku-selector-submit-color:${args.submitColor}`,
    `--yn-sku-selector-hint-color:${args.hintColor}`,
    cssVarIfPresent("--yn-sku-selector-submit-loading-size", args.loadingSize),
    cssVarIfPresent("--yn-sku-selector-submit-loading-icon-size", args.loadingIconSize)
  ]
    .filter((item): item is string => item != null)
    .join(";");

const syncDemoSubmitLoading = (el: Element | undefined, args: Args) => {
  if (!el) return;
  void (async () => {
    const host =
      el instanceof HTMLElement && el.tagName === "YN-SKU-SELECTOR"
        ? (el as YnSkuSelector)
        : (el.querySelector("yn-sku-selector") as YnSkuSelector | null);
    if (!host) return;
    await host.updateComplete;
    const cart = host.shadowRoot?.querySelector("yn-sku-cart-button") as YnSkuCartButton | null;
    if (cart) cart.loading = args.demoSubmitLoading;
  })();
};

type SelectorEventHandlers = {
  onChange: (event: Event) => void;
  onInit: (event: Event) => void;
  onSubmit: (event: Event) => void;
};

const renderSelectorHost = (
  args: Args,
  handlers: SelectorEventHandlers,
  title?: unknown
) => html`
  <yn-sku-selector
    ${ref((el) => syncDemoSubmitLoading(el ?? undefined, args))}
    .skus=${args.skus}
    currency=${args.currency}
    currency-icon=${args.currencyIcon}
    ?simple=${args.simple}
    ?pick-one=${args.pickOne}
    submit-label=${args.submitLabel}
    loading-text=${args.loadingText}
    loading-mode=${args.loadingMode}
    incomplete-hint=${args.incompleteHint}
    .labels=${args.labels}
    .specKeyWhitelist=${args.specKeyWhitelist}
    .specKeyExclude=${args.specKeyExclude}
    .cartIcon=${args.cartIcon || ynSkuCartSvg}
    ?show-cart-icon=${args.showCartIcon}
    ?disabled=${args.disabled}
    style=${skuStyle(args)}
    @change=${handlers.onChange}
    @init=${handlers.onInit}
    @submit=${handlers.onSubmit}
  >
    ${title ?? nothing} ${resolveSubmitIcon(args.submitIcon)}
  </yn-sku-selector>
`;

const bindSkuEvents = (args: Args, options?: { autoDone?: boolean }) => ({
  onChange: (event: Event) => args.onChange?.(event as CustomEvent<YnSkuChangeDetail>),
  onInit: (event: Event) => args.onInit?.(event as CustomEvent<YnSkuInitDetail>),
  onSubmit: (event: Event) => {
    const submitEvent = event as YnSkuSubmitEvent;
    args.onSubmit?.(submitEvent.detail, submitEvent.instance);
    if (options?.autoDone !== false) {
      submitEvent.instance.done();
    }
  }
});

const renderSkuSelector = (args: Args, title?: unknown, options?: { autoDone?: boolean }) => {
  const events = bindSkuEvents(args, options);
  return renderSelectorHost(args, events, title);
};

const renderAsyncSubmitDemo = (args: Args, title?: unknown) => html`
  <div data-async-demo style="padding:24px;max-width:420px;color:#000;">
    <p
      data-async-status
      style="margin:0 0 16px;font-size:13px;line-height:1.5;min-height:1.5em;color:#555;"
    >
      选齐规格后点击加购，将模拟约 1.2s 异步请求；请求完成前按钮保持 loading 且整组规格禁用。
    </p>
    ${renderSelectorHost(
      args,
      {
        onChange: (event: Event) => args.onChange?.(event as CustomEvent<YnSkuChangeDetail>),
        onInit: (event: Event) => args.onInit?.(event as CustomEvent<YnSkuInitDetail>),
        onSubmit: async (event: Event) => {
          const submitEvent = event as YnSkuSubmitEvent;
          args.onSubmit?.(submitEvent.detail, submitEvent.instance);
          const root = (event.currentTarget as HTMLElement).closest("[data-async-demo]");
          const status = root?.querySelector<HTMLElement>("[data-async-status]");
          if (status) status.textContent = "加购请求中…";
          try {
            const result = await mockAddToCart(submitEvent.detail.sku.id);
            if (status) status.textContent = `加购成功 · SKU ${result.skuId}`;
          } catch (error) {
            if (status) status.textContent = `加购失败 · ${(error as Error).message}`;
          } finally {
            submitEvent.instance.done();
          }
        }
      },
      title
    )}
    <pre
      data-async-code
      style="margin:20px 0 0;padding:14px;border:1px solid #ddd;border-radius:8px;font-size:11px;line-height:1.6;overflow:auto;background:#fafafa;"
    ><code>host.addEventListener("submit", async (event) => {
  const { detail, instance } = event;
  const { sku, selections } = detail;
  try {
    await fetch("/api/cart", {
      method: "POST",
      body: JSON.stringify({ sku, selections })
    });
  } finally {
    instance.done(); // 异步结束后取消 loading
  }
});</code></pre>
  </div>
`;

const renderSelectorCard = (args: Args) => html`
  <div style="padding:24px;max-width:420px;color:#000;">${renderSkuSelector(args)}</div>
`;

const jerseyNoDrugAsyncTitle = html`<h1
  slot="title"
  style="margin:0 0 20px;font-size:clamp(24px,7vw,36px);font-weight:900;text-transform:uppercase;line-height:1;"
>
  Jersey - No Drug
</h1>`;

const componentDescription = `SKU 规格选择器：多维规格联动、加购校验、submit 异步回调与 simple 快速加购模式。

## 导入（Tree Shaking）

\`\`\`ts
// 推荐：按需入口
import { YnSkuSelector } from "yn-web-component/components/yn-sku-selector";

// 全量注册
import "yn-web-component/define";
\`\`\`

## 布局 CSS 变量

| 变量 | 默认值 | 说明 |
| --- | --- | --- |
| \`--yn-sku-selector-row-height\` | \`48px\` | 每一行规格按钮高度 |
| \`--yn-sku-selector-label-row-gap\` | \`12px\` | label 与下方 SKU 按钮行间距 |
| \`--yn-sku-selector-row-gap\` | \`24px\` | 相邻规格维度行间距 |
| \`--yn-sku-selector-submit-margin-top\` | \`24px\` | 规格区与加购按钮区间距 |
| \`--yn-sku-selector-submit-loading-size\` | \`-\` | loading spinner 通用尺寸（icon/overlay 都可生效） |
| \`--yn-sku-selector-submit-loading-icon-size\` | \`24px\` | icon loading 模式下 spinner 尺寸 |

兼容旧名：\`--yn-sku-selector-option-height\`、\`--yn-sku-selector-label-gap\`、\`--yn-sku-selector-section-gap\`。

## 样式隔离

组件使用 **Shadow DOM**，外部样式默认不穿透；背景色等展示样式请由外部容器与 \`--yn-sku-selector-*\` CSS 变量决定。

## 插槽

- \`title\`：标题区域（simple 模式不渲染）
- \`submit-icon\`：加购按钮左侧 SVG 图标；未填充时回退 \`cart-icon\` 属性

## pick-one

非 simple 模式下设置 \`pick-one\` 后，组件会按规格维度顺序贪心选中第一组可用 SKU，并在初始化完成后触发 \`init\` 事件（detail 与 \`change\` 一致）。

## 规格维度白名单 / 排除

- \`spec-key-whitelist\`：仅白名单字段参与规格组合（并按白名单顺序计算）
- \`spec-key-exclude\`：在默认排除字段（\`price/id/stock/skuId\`）基础上追加排除

当白名单与排除同时设置时，最终结果会先应用白名单，再过滤排除项。

## 获取第一组有效 SKU 组合（推荐用法）

组件内已内置算法。业务侧通常不需要手写 SKU 组合计算，直接开启 \`pick-one\` 并监听 \`init\` 即可拿到第一组可用组合与命中 SKU。

\`\`\`ts
const el = document.querySelector("yn-sku-selector");
el?.setAttribute("pick-one", "");
el?.addEventListener("init", (event) => {
  const detail = (event as CustomEvent<{
    selections: Record<string, string | number>;
    sku: { id?: string | number; price?: number } | null;
    ready: boolean;
    missingKeys: string[];
  }>).detail;

  // 第一组有效组合（如 { weight: "1kg", color: "红色", size: "37" }）
  console.log("selections", detail.selections);
  // 命中的完整 SKU（如 id=1）
  console.log("sku", detail.sku);
});
\`\`\`

若你的示例数据是文档中的演示数据，第一组有效组合会命中 \`weight=1kg, color=红色, size=37\`（SKU id 为 \`1\`）。

## SKU 算法 API 用法（源码侧）

常用算法能力已对外暴露（既可从总入口，也可从组件子路径导入）：

\`\`\`ts
// 总入口
import {
  getSpecKeys,
  buildGroupSpec,
  buildGroupHas,
  buildSelection,
  findMatchedSku,
  getMissingKeys,
  buildFirstAvailableCurs,
  toComparable
} from "yn-web-component";

// 或组件子路径（推荐 Tree Shaking）
import {
  getSpecKeys,
  buildGroupSpec,
  buildGroupHas,
  buildSelection,
  findMatchedSku,
  getMissingKeys,
  buildFirstAvailableCurs,
  toComparable
} from "yn-web-component/components/yn-sku-selector";
\`\`\`

### API 说明

- \`getSpecKeys(items, options?)\`
  - 作用：提取规格维度 key（支持白名单/排除语义）
  - \`options.whitelistKeys?: string[]\`：仅这些字段参与，且按数组顺序返回
  - \`options.excludeKeys?: string[]\`：在默认元数据字段外追加排除
  - 返回：如 \`["weight", "color", "size"]\`（顺序取决于对象字段顺序）

- \`buildGroupSpec(items, keys)\`
  - 作用：按维度构建规格分组与候选值列表
  - 返回：\`{ specKey, depth, list }[]\`，常用于渲染规格 UI

- \`buildGroupHas(items, keys, curs)\`
  - 作用：基于当前已选 \`curs\` 计算每个维度当前可选值
  - 返回：二维数组，\`[depth] => 可选值列表\`

- \`buildSelection(keys, curs)\`
  - 作用：把 \`keys + curs\` 转成对象结构
  - 返回：如 \`{ weight: "1kg", color: "红色" }\`

- \`findMatchedSku(items, keys, curs)\`
  - 作用：在所有维度都已选齐时匹配完整 SKU
  - 返回：命中的 SKU；若未选齐或无匹配则为 \`null\`

- \`getMissingKeys(keys, curs)\`
  - 作用：返回尚未选择的维度 key
  - 返回：如 \`["size"]\`

- \`buildFirstAvailableCurs(items, keys)\`
  - 作用：按维度顺序贪心选取第一组可用组合
  - 返回：如 \`["1kg", "红色", "37"]\`

- \`toComparable(value)\`
  - 作用：统一比较值（当前实现为 \`String(value)\`），用于规避 string/number 比较差异

### 常见调用流程

最常见场景：拿第一组可用组合 + 命中 SKU。

\`\`\`ts
const keys = getSpecKeys(skus, {
  // 可选：白名单（只参与这些字段）
  // whitelistKeys: ["weight", "color", "size"],
  // 可选：额外排除字段
  // excludeKeys: ["region", "channel"]
});
// 通常为 ["weight", "color", "size"]（取决于对象字段顺序）

const curs = buildFirstAvailableCurs(skus, keys);
// 例如 ["1kg", "红色", "37"]

const firstSku = findMatchedSku(skus, keys, curs);
// 命中的完整 SKU（示例数据下 id=1）
\`\`\`

返回关系说明：

- \`keys\`：规格维度顺序（用于后续算法统一索引）
- \`curs\`：按 \`keys\` 顺序的首组可用值数组
- \`firstSku\`：当 \`curs\` 选齐时命中的完整 SKU；否则为 \`null\`

### 注意事项

- \`keys\` 顺序会直接影响“第一组可用组合”的结果；如需稳定，请保证 SKU 数据字段顺序一致。
- \`buildFirstAvailableCurs\` 是“贪心首组”策略，不代表价格最低/库存最高。
- 若你只是使用组件，仍推荐优先 \`pick-one + init\`；若要自定义流程、服务端预计算或独立算法复用，再直接调用这些 API。`;

const meta = {
  title: "Components/YnSkuSelector",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: componentDescription
      }
    }
  },
  args: {
    skus: demoSkus,
    currency: "€",
    currencyIcon: "",
    simple: false,
    pickOne: false,
    submitLabel: "ADD TO CART",
    loadingText: "",
    loadingMode: "icon",
    cartIcon: "",
    showCartIcon: true,
    incompleteHint: "请选择 {label}",
    labels: { weight: "Weight", color: "Color", size: "Size" },
    specKeyWhitelist: [],
    specKeyExclude: [],
    disabled: false,
    rowHeight: "48px",
    rowGap: "24px",
    labelRowGap: "12px",
    optionMinWidth: "52px",
    optionBorderColor: "#000",
    optionActiveBg: "#000",
    optionActiveColor: "#fff",
    submitHeight: "64px",
    submitMarginTop: "24px",
    submitOuterGap: "10px",
    submitInnerHeight: "44px",
    submitInsetColor: "#ffffff",
    submitDividerColor: "#ffffff",
    submitPriceWidth: "auto",
    priceFontWeight: "400",
    submitBg: "#000",
    submitColor: "#fff",
    hintColor: "#c0392b",
    loadingSize: "",
    loadingIconSize: "24px",
    demoSubmitLoading: false,
    onChange: fn(),
    onInit: fn(),
    onSubmit: fn()
  },
  argTypes: {
    skus: {
      control: "object",
      description:
        "SKU 列表。规格字段为动态 key；`price` / `id` / `stock` / `skuId` 为元数据字段。",
      table: { defaultValue: { summary: "[]" } }
    },
    currency: {
      control: "text",
      description: "价格货币字符，展示在按钮价格后（未设置 currency-icon 时）。",
      table: { defaultValue: { summary: "€" } }
    },
    currencyIcon: {
      control: "text",
      name: "currency-icon",
      description: "货币 SVG 图标字符串；设置后价格旁展示图标而非 currency 文本。",
      table: { defaultValue: { summary: '""' } }
    },
    simple: {
      control: "boolean",
      description:
        "简单模式：仅展示规格按钮，无 title / 提示 / 加购按钮；选齐规格后自动触发 submit。",
      table: { defaultValue: { summary: "false" } }
    },
    pickOne: {
      control: "boolean",
      name: "pick-one",
      description: "非 simple 模式下默认选中第一组可用 SKU，初始化完成后触发 init 事件。",
      table: { defaultValue: { summary: "false" } }
    },
    submitLabel: {
      control: "text",
      name: "submit-label",
      description: "加购按钮文案。",
      table: { defaultValue: { summary: "ADD TO CART" } }
    },
    loadingText: {
      control: "text",
      name: "loading-text",
      description: "加购 loading 文案；设置后进入文本替换模式（优先级高于 loading-mode）。",
      table: { defaultValue: { summary: '""' } }
    },
    loadingMode: {
      control: "select",
      name: "loading-mode",
      options: ["icon", "overlay"],
      description:
        "默认 spinner 展示方式：`icon` 替换图标位；`overlay` 左侧区域半透明 + 居中 spinner。",
      table: { defaultValue: { summary: "icon" } }
    },
    cartIcon: {
      control: "text",
      name: "cart-icon",
      description: "加购按钮默认购物车 SVG；留空时使用内置 `ynSkuCartSvg`。",
      table: { defaultValue: { summary: "ynSkuCartSvg" } }
    },
    showCartIcon: {
      control: "boolean",
      name: "show-cart-icon",
      description: "是否展示加购按钮左侧图标。",
      table: { defaultValue: { summary: "true" } }
    },
    incompleteHint: {
      control: "text",
      name: "incomplete-hint",
      description:
        "未选齐规格时点击加购的提示模板，`{label}` 会被替换为首个未选维度的 label（无 labels 映射时使用规格 key）。",
      table: { defaultValue: { summary: "请选择 {label}" } }
    },
    labels: {
      control: "object",
      description: "规格维度展示名映射；不传或某 key 未配置时，对应维度标签不展示。",
      table: { defaultValue: { summary: "{}" } }
    },
    specKeyWhitelist: {
      control: "object",
      name: "spec-key-whitelist",
      description:
        "规格维度白名单（按数组顺序生效）；设置后仅这些字段参与 SKU 组合计算。",
      table: { defaultValue: { summary: "[]" } }
    },
    specKeyExclude: {
      control: "object",
      name: "spec-key-exclude",
      description:
        "规格维度排除名单；在默认排除字段（price/id/stock/skuId）基础上追加排除。",
      table: { defaultValue: { summary: "[]" } }
    },
    disabled: {
      control: "boolean",
      description: "禁用整个选择器。",
      table: { defaultValue: { summary: "false" } }
    },
    rowHeight: {
      control: "text",
      name: "--yn-sku-selector-row-height",
      description: "每一行规格按钮的高度。",
      table: { category: "CSS Variables", defaultValue: { summary: "48px" } }
    },
    rowGap: {
      control: "text",
      name: "--yn-sku-selector-row-gap",
      description: "相邻规格维度行之间的间距。",
      table: { category: "CSS Variables", defaultValue: { summary: "24px" } }
    },
    labelRowGap: {
      control: "text",
      name: "--yn-sku-selector-label-row-gap",
      description: "规格 label 与下方 SKU 按钮行之间的间距。",
      table: { category: "CSS Variables", defaultValue: { summary: "12px" } }
    },
    optionMinWidth: {
      control: "text",
      name: "--yn-sku-selector-option-min-width",
      description: "规格按钮最小宽度。",
      table: { category: "CSS Variables", defaultValue: { summary: "44px" } }
    },
    optionBorderColor: {
      control: "color",
      name: "--yn-sku-selector-option-border-color",
      description: "规格按钮边框颜色。",
      table: { category: "CSS Variables", defaultValue: { summary: "currentColor" } }
    },
    optionActiveBg: {
      control: "color",
      name: "--yn-sku-selector-option-active-bg",
      description: "选中规格按钮背景。",
      table: { category: "CSS Variables", defaultValue: { summary: "currentColor" } }
    },
    optionActiveColor: {
      control: "color",
      name: "--yn-sku-selector-option-active-color",
      description: "选中规格按钮文字颜色。",
      table: { category: "CSS Variables", defaultValue: { summary: "#fff" } }
    },
    submitHeight: {
      control: "text",
      name: "--yn-sku-selector-submit-height",
      description: "加购按钮整体高度（含内描边留白）。",
      table: { category: "CSS Variables", defaultValue: { summary: "64px" } }
    },
    submitMarginTop: {
      control: "text",
      name: "--yn-sku-selector-submit-margin-top",
      description: "规格区与加购按钮（含校验提示）之间的上间距。",
      table: { category: "CSS Variables", defaultValue: { summary: "24px" } }
    },
    submitOuterGap: {
      control: "text",
      name: "--yn-sku-selector-submit-outer-gap",
      description: "白框外的黑色外圈留白（双层边框效果）。",
      table: { category: "CSS Variables", defaultValue: { summary: "10px" } }
    },
    submitInnerHeight: {
      control: "text",
      name: "--yn-sku-selector-submit-inner-height",
      description: "白框内内容区高度。",
      table: { category: "CSS Variables", defaultValue: { summary: "44px" } }
    },
    submitInsetColor: {
      control: "color",
      name: "--yn-sku-selector-submit-inset-color",
      description: "内描边颜色。",
      table: { category: "CSS Variables", defaultValue: { summary: "#fff" } }
    },
    submitDividerColor: {
      control: "color",
      name: "--yn-sku-selector-submit-divider-color",
      description: "价格区分隔线颜色。",
      table: { category: "CSS Variables", defaultValue: { summary: "#fff" } }
    },
    submitPriceWidth: {
      control: "text",
      name: "--yn-sku-selector-submit-price-width",
      description: "价格区宽度；默认随内容自适应。",
      table: { category: "CSS Variables", defaultValue: { summary: "auto" } }
    },
    priceFontWeight: {
      control: "text",
      name: "--yn-sku-selector-price-font-weight",
      description: "价格字重（参考站为较细体）。",
      table: { category: "CSS Variables", defaultValue: { summary: "400" } }
    },
    submitBg: {
      control: "color",
      name: "--yn-sku-selector-submit-bg",
      description: "加购按钮背景。",
      table: { category: "CSS Variables", defaultValue: { summary: "currentColor" } }
    },
    submitColor: {
      control: "color",
      name: "--yn-sku-selector-submit-color",
      description: "加购按钮文字与图标颜色。",
      table: { category: "CSS Variables", defaultValue: { summary: "#fff" } }
    },
    hintColor: {
      control: "color",
      name: "--yn-sku-selector-hint-color",
      description: "校验提示文字颜色。",
      table: { category: "CSS Variables", defaultValue: { summary: "#c0392b" } }
    },
    loadingSize: {
      control: "text",
      name: "--yn-sku-selector-submit-loading-size",
      description:
        "loading spinner 通用尺寸别名。icon/overlay 均可生效；会被对应模式专用变量覆盖。",
      table: { category: "CSS Variables", defaultValue: { summary: "未设置（按模式回退）" } }
    },
    loadingIconSize: {
      control: "text",
      name: "--yn-sku-selector-submit-loading-icon-size",
      description:
        "icon loading 模式下 spinner 尺寸。优先级高于 `--yn-sku-selector-submit-loading-size`；可开启 `demoSubmitLoading` 预览。",
      table: { category: "CSS Variables", defaultValue: { summary: "24px" } }
    },
    demoSubmitLoading: {
      control: "boolean",
      description:
        "Storybook 预览：强制加购按钮进入 loading，便于调节 loading spinner 相关 CSS 变量。",
      table: { category: "CSS Variables", defaultValue: { summary: "false" } }
    },
    onChange: {
      name: "change",
      control: false,
      action: "change",
      description: "规格变更时触发，返回当前选中数据与是否可加购。",
      table: {
        category: "Events",
        type: {
          summary:
            "CustomEvent<{ selections: Record<string, string | number>; sku: object | null; ready: boolean; missingKeys: string[] }>"
        }
      }
    },
    onInit: {
      name: "init",
      control: false,
      action: "init",
      description: "pick-one 模式下初始化默认选中完成后触发，detail 与 change 一致。",
      table: {
        category: "Events",
        type: {
          summary:
            "CustomEvent<{ selections: Record<string, string | number>; sku: object | null; ready: boolean; missingKeys: string[] }>"
        }
      }
    },
    onSubmit: {
      name: "submit",
      control: false,
      action: "submit",
      description:
        "满足加购条件时触发；`instance` 为事件第二参数（`event.instance`），异步结束后调用 `instance.done()`。",
      table: {
        category: "Events",
        type: {
          summary:
            "YnSkuSubmitEvent — detail: { selections, sku }; event.instance: { done(): void }"
        }
      }
    },
    title: {
      description: "标题区域，可放置任意标题元素。simple 模式下不渲染。",
      table: { category: "Slots" }
    },
    submitIcon: {
      name: "submit-icon",
      description:
        "加购按钮左侧图标；Story 示例默认使用内置购物袋 SVG（与 `cart-icon` 默认一致），未填充时回退 `cart-icon` 属性。",
      table: { category: "Slots" }
    }
  },
  render: (args) => html`
    <div style="padding:24px;max-width:480px;color:#000;">
      ${renderSkuSelector(
        args,
        html`<h1
          slot="title"
          style="margin:0 0 8px;font-size:clamp(28px,8vw,48px);font-weight:900;text-transform:uppercase;line-height:1;letter-spacing:-0.04em;"
        >
          Jersey - Select
        </h1>`
      )}
    </div>
  `
} satisfies Meta<Args>;

export default meta;

type Story = StoryObj<Args>;

const getHost = (root: HTMLElement) =>
  root.querySelector("yn-sku-selector") as YnSkuSelector | null;

const getCartButton = (host: YnSkuSelector) => {
  const cart = host.shadowRoot?.querySelector("yn-sku-cart-button") as YnSkuCartButton | null;
  return cart?.shadowRoot?.querySelector<HTMLButtonElement>(".submit") ?? null;
};

const getCartHost = (host: YnSkuSelector) =>
  host.shadowRoot?.querySelector("yn-sku-cart-button") as YnSkuCartButton | null;

const clickOption = (host: YnSkuSelector, label: string) => {
  const btn = [...(host.shadowRoot?.querySelectorAll<HTMLButtonElement>(".option") ?? [])].find(
    (node) => node.querySelector(".option-label")?.textContent?.trim() === label
  );
  if (!btn) throw new Error(`option ${label} not found`);
  btn.click();
};

const playJerseyInteractions: NonNullable<Story["play"]> = async ({
  canvasElement,
  step,
  args
}) => {
  const host = getHost(canvasElement);
  if (!host?.shadowRoot) return;

  await step("未选齐时点击加购应展示提示", async () => {
    getCartButton(host)?.click();
    await host.updateComplete;
    expect((host.shadowRoot?.querySelector(".hint")?.textContent ?? "").length).toBeGreaterThan(0);
  });

  await step("选择尺码后 change.ready 为 true", async () => {
    clickOption(host, "M");
    await host.updateComplete;
    await expect(args.onChange).toHaveBeenCalled();
    const changeEvent = args.onChange!.mock.calls.at(-1)?.[0] as CustomEvent<YnSkuChangeDetail>;
    expect(changeEvent.detail.ready).toBe(true);
    expect(changeEvent.detail.sku?.id).toBe("m");
  });

  await step("选齐后 submit 触发", async () => {
    getCartButton(host)?.click();
    await host.updateComplete;
    await expect(args.onSubmit).toHaveBeenCalled();
    const submitCall = args.onSubmit!.mock.calls.at(-1);
    expect((submitCall?.[0] as YnSkuSubmitDetail).sku.id).toBe("m");
  });
};

const playDefaultInteractions: NonNullable<Story["play"]> = async ({
  canvasElement,
  step,
  args
}) => {
  const host = getHost(canvasElement);
  if (!host?.shadowRoot) return;

  await step("未选齐时点击加购应展示提示", async () => {
    getCartButton(host)?.click();
    await host.updateComplete;
    const hint = host.shadowRoot?.querySelector(".hint")?.textContent ?? "";
    expect(hint.length).toBeGreaterThan(0);
  });

  await step("选齐规格后 change.ready 为 true", async () => {
    clickOption(host, "1kg");
    clickOption(host, "红色");
    clickOption(host, "37");
    await host.updateComplete;
    await expect(args.onChange).toHaveBeenCalled();
    const changeEvent = args.onChange!.mock.calls.at(-1)?.[0] as CustomEvent<YnSkuChangeDetail>;
    expect(changeEvent.detail.ready).toBe(true);
  });

  await step("选齐后 submit 触发", async () => {
    getCartButton(host)?.click();
    await host.updateComplete;
    await expect(args.onSubmit).toHaveBeenCalled();
    const submitCall = args.onSubmit!.mock.calls.at(-1);
    expect((submitCall?.[0] as YnSkuSubmitDetail).sku.id).toBe("1");
  });
};

export const Default: Story = {
  play: playDefaultInteractions
};

export const PickOne: Story = {
  name: "Pick One 默认选中",
  args: {
    pickOne: true,
    labels: { weight: "Weight", color: "Color", size: "Size" }
  },
  render: (args) => html`
    <p style="margin:0 0 12px;padding:0 24px;font-size:13px;color:#555;max-width:480px;">
      开启 <code>pick-one</code> 后，组件挂载时会默认选中第一组可用 SKU，并在初始化完成后触发
      <code>init</code> 事件。
    </p>
    <div style="padding:0 24px 24px;max-width:480px;color:#000;">
      ${renderSkuSelector(
        args,
        html`<h1
          slot="title"
          style="margin:0 0 8px;font-size:clamp(28px,8vw,48px);font-weight:900;text-transform:uppercase;line-height:1;"
        >
          Jersey - Select
        </h1>`
      )}
    </div>
  `,
  play: async ({ canvasElement, step, args }) => {
    const host = getHost(canvasElement);
    if (!host) return;

    await step("init 事件回传第一组可用 SKU", async () => {
      await host.updateComplete;
      await expect(args.onInit).toHaveBeenCalled();
      const initEvent = args.onInit!.mock.calls.at(-1)?.[0] as CustomEvent<YnSkuInitDetail>;
      expect(initEvent.detail.ready).toBe(true);
      expect(initEvent.detail.sku?.id).toBe("1");
      expect(initEvent.detail.selections).toEqual({ weight: "1kg", color: "红色", size: "37" });

      const activeLabels = [
        ...(host.shadowRoot?.querySelectorAll<HTMLButtonElement>(".option.active") ?? [])
      ].map((node) => node.querySelector(".option-label")?.textContent?.trim());
      expect(activeLabels).toEqual(["1kg", "红色", "37"]);
      expect(
        getCartHost(host)?.shadowRoot?.querySelector(".submit-price")?.textContent?.trim()
      ).toContain("65.00");
    });
  }
};

export const WithoutSpecLabels: Story = {
  name: "无规格标签",
  args: {
    labels: {},
    incompleteHint: "请选择 {label}"
  },
  render: renderSelectorCard,
  play: playDefaultInteractions
};

export const JerseyStyle: Story = {
  name: "Jersey 单维规格",
  args: {
    skus: jerseySkus,
    labels: {},
    submitLabel: "Add to cart"
  },
  render: (args) => html`
    <div style="padding:32px 24px;max-width:480px;color:#000;">
      ${renderSkuSelector(
        args,
        html`<h1
          slot="title"
          style="margin:0 0 28px;font-size:clamp(32px,9vw,48px);font-weight:900;text-transform:uppercase;line-height:0.95;letter-spacing:-0.03em;"
        >
          Jersey - No Drug
        </h1>`
      )}
    </div>
  `,
  play: playJerseyInteractions
};

export const CurrencyIcon: Story = {
  name: "货币 SVG",
  args: {
    skus: jerseySkus,
    labels: { size: "Size" },
    currency: "",
    currencyIcon: euroIcon
  },
  render: renderSelectorCard,
  play: async ({ canvasElement, step, args }) => {
    const host = getHost(canvasElement);
    if (!host?.shadowRoot) return;

    await step("价格区展示货币 SVG", async () => {
      clickOption(host, "M");
      await host.updateComplete;
      await expect(args.onChange).toHaveBeenCalled();
      expect(getCartHost(host)?.shadowRoot?.querySelector(".currency-icon svg")).toBeTruthy();
    });
  }
};

export const SimpleMode: Story = {
  name: "Simple 快速加购",
  args: {
    simple: true,
    skus: jerseySkus
  },
  render: (args) => html`
    <div style="padding:16px;max-width:320px;color:#000;border:1px solid #000;">
      <p style="margin:0 0 12px;font-size:14px;font-weight:700;">Jersey - No Drug</p>
      ${renderSkuSelector(args)}
    </div>
  `,
  play: async ({ canvasElement, step, args }) => {
    const host = getHost(canvasElement);
    if (!host?.shadowRoot) return;

    await step("simple 模式选齐后自动 submit", async () => {
      clickOption(host, "M");
      await host.updateComplete;
      await expect(args.onSubmit).toHaveBeenCalled();
    });
  }
};

export const ListItemCompact: Story = {
  name: "列表项紧凑",
  args: {
    simple: true,
    skus: jerseySkus,
    rowHeight: "40px",
    optionMinWidth: "40px"
  },
  render: (args) => html`
    <div style="padding:16px;display:grid;gap:12px;max-width:360px;color:#000;">
      ${[1, 2].map(
        (index) => html`
          <article
            style="display:flex;align-items:center;justify-content:space-between;gap:12px;border:1px solid #000;padding:12px;"
          >
            <div style="min-width:0;">
              <p style="margin:0;font-size:13px;font-weight:700;">Product ${index}</p>
              <p style="margin:4px 0 0;font-size:12px;opacity:0.7;">65.00 €</p>
            </div>
            <div style="flex:1;min-width:0;max-width:220px;">${renderSkuSelector(args)}</div>
          </article>
        `
      )}
    </div>
  `,
  play: async ({ canvasElement, step, args }) => {
    const host = canvasElement.querySelector("yn-sku-selector") as YnSkuSelector | null;
    if (!host?.shadowRoot) return;

    await step("列表项内 simple 选择器可触发 submit", async () => {
      clickOption(host, "S");
      await host.updateComplete;
      await expect(args.onSubmit).toHaveBeenCalled();
    });
  }
};

export const SpecKeyWhitelistExclude: Story = {
  name: "规格白名单与排除",
  args: {
    skus: skuWithChannelSkus,
    labels: { weight: "Weight", size: "Size", channel: "Channel" },
    specKeyWhitelist: ["weight", "size", "channel"],
    specKeyExclude: ["channel"],
    submitLabel: "Add to cart"
  },
  render: (args) => html`
    <div style="padding:24px;max-width:520px;color:#000;">
      <p style="margin:0 0 12px;font-size:13px;line-height:1.6;color:#555;">
        白名单先限定参与维度（weight/size/channel），再通过排除名单去掉 channel，最终只保留
        Weight 与 Size 两组规格。
      </p>
      ${renderSkuSelector(args)}
    </div>
  `,
  parameters: {
    docs: {
      description: {
        story:
          "演示 `spec-key-whitelist` 与 `spec-key-exclude` 叠加规则：先按白名单筛选，再按排除名单过滤。"
      }
    }
  },
  play: async ({ canvasElement, step }) => {
    const host = getHost(canvasElement);
    if (!host?.shadowRoot) return;

    await step("仅渲染 Weight 与 Size 两组规格", async () => {
      await host.updateComplete;
      const labels = [...host.shadowRoot.querySelectorAll<HTMLElement>(".label")].map((node) =>
        node.textContent?.trim()
      );
      expect(labels).toEqual(["Weight", "Size"]);
      expect(host.shadowRoot.querySelectorAll(".section").length).toBe(2);
    });
  }
};

const playAsyncSubmit: NonNullable<Story["play"]> = async ({ canvasElement, step, args }) => {
  const host = getHost(canvasElement);
  if (!host?.shadowRoot) return;

  await step("选齐规格并提交，异步期间保持 loading", async () => {
    clickOption(host, "M");
    await host.updateComplete;

    getCartButton(host)?.click();
    await host.updateComplete;

    await expect(args.onSubmit).toHaveBeenCalled();
    expect(getCartHost(host)?.loading).toBe(true);
    expect(getCartButton(host)?.disabled).toBe(true);
    expect(host.shadowRoot?.querySelector<HTMLButtonElement>(".option")?.disabled).toBe(true);

    await sleep(1300);
    await host.updateComplete;

    expect(getCartHost(host)?.loading).toBe(false);
    expect(getCartButton(host)?.disabled).toBe(false);

    const status = canvasElement.querySelector("[data-async-status]")?.textContent ?? "";
    expect(status).toContain("加购成功");
  });
};

export const AsyncSubmit: Story = {
  name: "异步加购",
  args: {
    skus: jerseySkus,
    labels: { size: "Size" },
    submitLabel: "Add to cart",
    loadingSize: "24px",
    submitMarginTop: "0px",
    loadingIconSize: "10px"
  },
  render: (args) => renderAsyncSubmitDemo(args, jerseyNoDrugAsyncTitle),
  parameters: {
    docs: {
      description: {
        story:
          "演示 `submit` 异步回调：请求完成前按钮与规格组保持 loading / 禁用，调用 `instance.done()` 后恢复。示例内使用 `mockAddToCart` 模拟约 1.2s 网络延迟。"
      }
    }
  },
  play: playAsyncSubmit
};

const playAsyncSubmitSimple: NonNullable<Story["play"]> = async ({ canvasElement, step, args }) => {
  const host = getHost(canvasElement);
  if (!host?.shadowRoot) return;

  await step("simple 模式选齐后自动异步 submit", async () => {
    clickOption(host, "L");
    await host.updateComplete;

    await expect(args.onSubmit).toHaveBeenCalled();
    const loadingOption = [
      ...(host.shadowRoot?.querySelectorAll<HTMLButtonElement>(".option") ?? [])
    ].find((node) => node.classList.contains("is-loading"));
    expect(loadingOption).toBeTruthy();
    expect(
      host.shadowRoot?.querySelector<HTMLButtonElement>(".option:not(.is-loading)")?.disabled
    ).toBe(true);

    await sleep(1300);
    await host.updateComplete;

    expect(host.shadowRoot?.querySelector(".option.is-loading")).toBe(null);
    expect(host.shadowRoot?.querySelector<HTMLButtonElement>(".option")?.disabled).toBe(false);

    const status = canvasElement.querySelector("[data-async-status]")?.textContent ?? "";
    expect(status).toContain("加购成功");
  });
};

export const AsyncSubmitSimple: Story = {
  name: "Simple 异步加购",
  args: {
    simple: true,
    skus: jerseySkus,
    labels: { size: "Size" }
  },
  render: (args) => renderAsyncSubmitDemo(args),
  parameters: {
    docs: {
      description: {
        story:
          "simple 模式下选齐规格即触发 `submit`；loading 落在最后点击的规格按钮上，异步请求期间整组规格禁用，`instance.done()` 后恢复。"
      }
    }
  },
  play: playAsyncSubmitSimple
};

export const AsyncSubmitLoadingOverlay: Story = {
  name: "异步加购（覆盖层 loading）",
  args: {
    skus: jerseySkus,
    labels: { size: "Size" },
    submitLabel: "Add to cart",
    loadingMode: "overlay",
    demoSubmitLoading: true,
    pickOne: true
  },
  render: (args) => renderAsyncSubmitDemo(args, jerseyNoDrugAsyncTitle),
  parameters: {
    docs: {
      description: {
        story:
          '设置 `loading-mode="overlay"` 后，异步请求期间保留购物车图标与文案，左侧区域半透明并由居中 spinner 覆盖。'
      }
    }
  },
  play: playAsyncSubmit
};

export const AsyncSubmitLoadingText: Story = {
  name: "异步加购（文本 loading）",
  args: {
    skus: jerseySkus,
    labels: { size: "Size" },
    submitLabel: "Add to cart",
    loadingText: "ADDING..."
  },
  render: (args) => renderAsyncSubmitDemo(args, jerseyNoDrugAsyncTitle),
  parameters: {
    docs: {
      description: {
        story:
          "设置 `loading-text` 后，异步请求期间左侧按钮文案替换为 loading 文本（如 ADDING...），价格区保持正常显示；未设置时回退为默认 spinner 模式。"
      }
    }
  },
  play: async ({ canvasElement, step, args }) => {
    const host = getHost(canvasElement);
    if (!host?.shadowRoot) return;

    await step("loading 时左侧文案替换为 ADDING...", async () => {
      clickOption(host, "M");
      await host.updateComplete;

      getCartButton(host)?.click();
      await host.updateComplete;

      await expect(args.onSubmit).toHaveBeenCalled();
      const cartHost = getCartHost(host);
      expect(cartHost?.loading).toBe(true);
      expect(cartHost?.shadowRoot?.querySelector(".submit-label")?.textContent).toBe("ADDING...");
      expect(cartHost?.shadowRoot?.querySelector(".submit-spinner-overlay")).toBe(null);
      expect(cartHost?.shadowRoot?.querySelector(".submit-price")?.textContent?.trim()).toContain(
        "65.00"
      );

      await sleep(1300);
      await host.updateComplete;

      expect(getCartHost(host)?.loading).toBe(false);
      expect(getCartHost(host)?.shadowRoot?.querySelector(".submit-label")?.textContent).toBe(
        "Add to cart"
      );
    });
  }
};
