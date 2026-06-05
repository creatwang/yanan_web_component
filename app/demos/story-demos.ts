/**
 * 与 Storybook stories 对齐的 Demo 模板（markup / 样式 / 数据与 stories 一致）
 */
import { html, nothing } from "lit";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";
import { ref } from "lit/directives/ref.js";
import {
  ynSearchCloseSvg,
  ynSignpostSvg,
  ynSkuCartSvg
} from "../../src/asset/svg";
import type { YnSkuItem } from "../../src/components/yn-sku-selector/types";
import type { YnToast, YnToastType } from "../../src/components/yn-toast/yn-toast";
import {
  applyPullCordShellBackground,
  shellBackgroundFromVariant
} from "../../src/components/yn-pull-cord-switch/pull-cord-shell-bg";
import type {
  YnPullCordSwitchSize,
  YnPullCordSwitchVariant
} from "../../src/components/yn-pull-cord-switch/yn-pull-cord-switch";
import type { Locale } from "../i18n/locale";

export const FLOEMA_IMG =
  "https://www.floema.com/_ipx/f_webp&s_200x114/https:/cdn.sanity.io/images/535lnz3g/production/6adaaad4b7aff57360124f76b64839aafe0bf6bd-317x180.png";

export const EMPTY_CART_IMAGE =
  "https://images.ctfassets.net/wkwo8cyw934s/7bKPYF3SncuYK5c1Qb8sXD/5eceffb8fc843c0e50166c8fe0451dbd/Frame_4291-3.png";

export const NAV_ITEMS = {
  PRODUTOS: "/produtos",
  SOBRE: "/sobre",
  SUSTENTABILIDADE: "/sustentabilidade",
  JORNAL: "/jornal"
};

export const NAV_STYLE =
  "--yn-navigation-fill-color:#ffffff;--yn-navigation-text-color:#241f21;--yn-navigation-active-text-color:#241f21;--yn-navigation-indicator-color:#241f21;--yn-navigation-focus-color:#82b7ff;--yn-navigation-glow-color:#e9e77847;--yn-navigation-glow-fade:#e9e77800;";

export const DROPDOWN_CATEGORIES = [
  { id: "Golf", color: "#b8d28a" },
  { id: "Urban", color: "#ef7d53" },
  { id: "Nature", color: "#d5c29f" },
  { id: "RePlastic", color: "#82a7d8" }
];

export const GROUP_PICK_CATEGORIES = [
  { id: "Golf", color: "#b8d28a" },
  { id: "Urban", color: "#ef7d53" },
  { id: "Details", color: "#ece9e3" },
  { id: "Nature", color: "#d5c29f" },
  { id: "RePlastic", color: "#82a7d8" },
  { id: "Equipamento", color: "#f0f0f0" },
  { id: "Construção", color: "#f0f0f0" },
  { id: "Mobiliário", color: "#f0f0f0" },
  { id: "Sinalética", color: "#f0f0f0" }
];

export const DEMO_SKUS: YnSkuItem[] = [
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

export const JERSEY_SKUS: YnSkuItem[] = [
  { size: "S", price: 65, id: "s" },
  { size: "M", price: 65, id: "m" },
  { size: "L", price: 65, id: "l" },
  { size: "XL", price: 65, id: "xl" },
  { size: "2XL", price: 65, id: "2xl" }
];

const LANGUAGE_NODES = [
  { id: "en", label: "English", code: "EN", native: "English" },
  { id: "pt", label: "Português", code: "PT", native: "Português" },
  { id: "es", label: "Español", code: "ES", native: "Español" }
];

const INPUT_STYLE =
  "--yn-input-width:320px;--yn-input-height:44px;--yn-input-bg:rgba(255, 255, 255, 0.62);--yn-input-bg-hover:rgba(255, 255, 255, 0.86);--yn-input-bg-focus:#fffaf2;--yn-input-bg-disabled:rgba(232, 225, 214, 0.76);--yn-input-border-color:rgba(36, 31, 33, 0.22);--yn-input-border-color-hover:rgba(36, 31, 33, 0.52);--yn-input-border-color-focus:#241f21;--yn-input-color:#241f21;--yn-input-placeholder-color:rgba(36, 31, 33, 0.48);--yn-input-disabled-color:rgba(36, 31, 33, 0.42);--yn-input-focus-ring:rgba(36, 31, 33, 0.12);--yn-input-radius:999px;--yn-input-padding:0 14px;--yn-input-button-size:28px;--yn-input-button-color:#241f21;--yn-input-button-bg-hover:rgba(36, 31, 33, 0.08);--yn-input-font-family:\"Zimula\", ui-serif, Georgia, Cambria, \"Times New Roman\", Times, serif;--yn-input-font-size:16px;--yn-input-letter-spacing:-0.01em;";

const SEARCH_STYLE =
  "--yn-search-bg-active:rgba(255, 255, 255, 0.96);--yn-search-bg-idle:rgba(255, 255, 255, 0);--yn-search-icon-color:#241f21;--yn-search-field-color:#241f21;--yn-search-placeholder-color:rgba(36, 31, 33, 0.52);--yn-search-caret-color:#241f21;--yn-search-fill-duration:220ms;--yn-search-fill-ease:cubic-bezier(0.4, 0, 1, 1);--yn-search-icon-duration:220ms;--yn-search-icon-ease:cubic-bezier(0.4, 0, 1, 1);";

const DROPDOWN_PANEL_STYLE =
  "--yn-dropdown-panel-min-width:280px;--yn-dropdown-panel-radius:12px;--yn-dropdown-panel-padding:12px;--yn-dropdown-panel-shadow:0 12px 36px rgba(36, 31, 33, 0.18);";

const DRAWER_STYLE =
  "--yn-drawer-z-index:1500;--yn-drawer-bg:#ffffff;--yn-drawer-shadow:-12px 0 36px rgba(36, 31, 33, 0.18);--yn-drawer-backdrop:rgba(12, 10, 11, 0.36);--yn-drawer-header-border:transparent;--yn-drawer-footer-border:rgba(36, 31, 33, 0.08);--yn-drawer-title-color:#241f21;--yn-drawer-close-color:#241f21;--yn-drawer-close-hover-bg:rgba(36, 31, 33, 0.08);--yn-drawer-content-color:#241f21;--yn-drawer-footer-bg:#ffffff;--yn-drawer-body-padding:0 16px 20px;--yn-drawer-open-duration:380ms;--yn-drawer-close-duration:320ms;--yn-drawer-open-ease:cubic-bezier(0.22, 0.01, 0.35, 1);--yn-drawer-close-ease:cubic-bezier(0.55, 0.055, 0.675, 0.19);";

const TOAST_STYLE =
  "--yn-toast-top:calc(var(--docs-header-h, 56px) + 26px);--yn-toast-z-index:1600;--yn-toast-height:36px;--yn-toast-bg:rgba(246, 241, 230, 0.92);--yn-toast-text-color:#20231d;--yn-toast-success-color:#667a48;--yn-toast-info-color:#5f6f86;--yn-toast-warning-color:#b87d55;--yn-toast-error-color:#9a4f43;--yn-toast-paper-color:#f3eddf;--yn-toast-max-width:90vw;--yn-toast-message-padding:0 14px 0 6px;--yn-toast-message-font-size:0.8rem;--yn-toast-message-letter-spacing:0.18em;--yn-toast-mask-bg:rgba(32, 35, 29, 0.18);--yn-toast-shadow:inset 0 0 0 1px rgba(255, 255, 255, 0.48), inset 0 -1px 0 rgba(32, 35, 29, 0.06), 0 18px 45px rgba(62, 55, 42, 0.14), 0 5px 16px rgba(62, 55, 42, 0.08);";

const SKU_STYLE =
  "--yn-sku-selector-row-height:48px;--yn-sku-selector-option-height:48px;--yn-sku-selector-row-gap:24px;--yn-sku-selector-label-row-gap:12px;--yn-sku-selector-option-min-width:52px;--yn-sku-selector-option-border-color:#000;--yn-sku-selector-option-active-bg:#000;--yn-sku-selector-option-active-color:#fff;--yn-sku-selector-submit-height:64px;--yn-sku-selector-submit-margin-top:24px;--yn-sku-selector-submit-outer-gap:10px;--yn-sku-selector-submit-inner-height:44px;--yn-sku-selector-submit-inset-color:#ffffff;--yn-sku-selector-submit-divider-color:#ffffff;--yn-sku-selector-submit-price-width:auto;--yn-sku-selector-price-font-weight:400;--yn-sku-selector-submit-bg:#000;--yn-sku-selector-submit-color:#fff;--yn-sku-selector-hint-color:#c0392b;--yn-sku-selector-submit-loading-icon-size:24px;";

const CART_SVG = html`${unsafeSVG(ynSkuCartSvg.replace(/^<svg /, '<svg slot="submit-icon" '))}`;

/** yn-button Default */
export const storyButtonDefault = () => html`
  <yn-button variant="primary">按钮</yn-button>
`;

/** yn-button Variants */
export const storyButtonVariants = () => html`
  <div class="yn-flex yn-items-center yn-gap-3 yn-flex-wrap">
    <yn-button variant="primary">主色按钮</yn-button>
    <yn-button variant="success">成功按钮</yn-button>
    <yn-button variant="warning">警告按钮</yn-button>
    <yn-button variant="danger">危险按钮</yn-button>
    <yn-button variant="neutral">中性色按钮</yn-button>
    <yn-button variant="dark">深色按钮</yn-button>
    <yn-button variant="default">默认白色</yn-button>
  </div>
`;

/** yn-button Sizes */
export const storyButtonSizes = () => html`
  <div class="yn-flex yn-items-center yn-gap-3">
    <yn-button size="mini" variant="primary">Mini 按钮</yn-button>
    <yn-button size="small" variant="primary">Small 按钮</yn-button>
    <yn-button size="medium" variant="primary">Medium 按钮</yn-button>
  </div>
`;

/** yn-button LoadingShowcase */
export const storyButtonLoading = () => html`
  <yn-button variant="primary" loading loading-type="left">提交中</yn-button>
`;

/** yn-input SlottedButtons */
export const storyInputDefault = () => html`
  <div style="background:#f2efea;padding:24px;">
    <yn-input placeholder="请输入内容" style=${INPUT_STYLE}></yn-input>
  </div>
`;

export const storyInputPrefix = () => html`
  <div style="background:#f2efea;padding:24px;">
    <yn-input placeholder="仅前缀按钮" style=${INPUT_STYLE}>
      <span slot="prefix-button">${unsafeSVG(ynSignpostSvg)}</span>
    </yn-input>
  </div>
`;

export const storyInputSuffix = () => html`
  <div style="background:#f2efea;padding:24px;">
    <yn-input placeholder="仅后缀按钮" style=${INPUT_STYLE}>
      <span slot="suffix-button">${unsafeSVG(ynSearchCloseSvg)}</span>
    </yn-input>
  </div>
`;

export const storyInputSlotted = () => html`
  <div style="background:#f2efea;padding:24px;">
    <yn-input placeholder="带自定义前后按钮" style=${INPUT_STYLE}>
      <span slot="prefix-button">${unsafeSVG(ynSignpostSvg)}</span>
      <span slot="suffix-button">${unsafeSVG(ynSearchCloseSvg)}</span>
    </yn-input>
  </div>
`;

/** yn-icon-connect-button SizeShowcase */
export const storyIconConnectSizes = () => html`
  <div class="yn-flex yn-items-center yn-gap-4">
    <yn-icon-connect-button
      label="BUTTON"
      size="mini"
      .icon=${ynSignpostSvg}
      style="--yn-icon-connect-button-bg:#ddd967;--yn-icon-connect-button-color:#241f21;"
    ></yn-icon-connect-button>
    <yn-icon-connect-button
      label="BUTTON"
      size="small"
      .icon=${ynSignpostSvg}
      style="--yn-icon-connect-button-bg:#ddd967;--yn-icon-connect-button-color:#241f21;"
    ></yn-icon-connect-button>
    <yn-icon-connect-button
      label="BUTTON"
      size="normal"
      .icon=${ynSignpostSvg}
      style="--yn-icon-connect-button-bg:#ddd967;--yn-icon-connect-button-color:#241f21;"
    ></yn-icon-connect-button>
  </div>
`;

export const storyNavigationInner = (
  active: string,
  hitSlop: boolean,
  seoMode: boolean,
  onChange?: (e: Event) => void
) => html`
  <div class="yn-bg-[#F2EFEA] yn-p-[10px]">
    <yn-navigation
      .items=${NAV_ITEMS}
      .active=${active}
      .seoMode=${seoMode}
      aria-label="Primary navigation"
      ?hit-slop=${hitSlop}
      @change=${onChange}
      style=${NAV_STYLE}
    ></yn-navigation>
  </div>
`;

/** yn-search Default */
export const storySearchDefault = () => html`
  <div class="yn-bg-[#F2EFEA] yn-p-[10px]">
    <yn-search
      .inputWidth=${514}
      placeholder="O que estás à procura?"
      style=${SEARCH_STYLE}
    >
      <datalist>
        <option value="Sofa"></option>
        <option value="Table"></option>
      </datalist>
    </yn-search>
  </div>
`;

/** yn-pick Default */
export const storyPickDefault = () => html`
  <yn-pick value="nature" style="--yn-pick-border-width:2px;--yn-pick-border-color:#000000;--yn-pick-border-radius:8px;">
    <div
      class="yn-box-border yn-flex yn-h-[100px] yn-w-[180px] yn-items-end yn-rounded-lg yn-bg-[#d5c29f] yn-p-3 yn-text-2xl yn-font-bold yn-text-[#241f21]"
    >
      Nature
    </div>
  </yn-pick>
`;

export const renderGroupPickCard = (item: { id: string; color: string }) => html`
  <yn-pick .value=${item.id} ?border=${true}>
    <div
      class="yn-box-border yn-flex yn-flex-col yn-min-w-[104px] yn-items-end yn-gap-[6px] yn-rounded-lg yn-px-3 yn-py-[10px] yn-text-[22px] yn-font-bold yn-leading-none yn-text-[#241f21]"
      style=${`background:${item.color};`}
    >
      <div class="yn-w-full yn-overflow-hidden yn-rounded-lg">
        <img src=${FLOEMA_IMG} alt="Nature sample" class="yn-block yn-h-full yn-w-full yn-object-cover" />
      </div>
      <div>
        <span class="yn-inline-flex yn-h-[18px] yn-w-[18px] yn-items-center yn-justify-center"
          >${unsafeSVG(ynSignpostSvg)}</span
        >
        <span class="yn-text-base yn-font-bold yn-leading-none">${item.id}</span>
      </div>
    </div>
  </yn-pick>
`;

/** yn-group-pick Default */
export const storyGroupPickDefault = () => html`
  <div class="yn-grid yn-gap-4 yn-rounded-xl yn-bg-[#efede8] yn-p-6">
    <yn-group-pick style="--yn-group-pick-gap:12px;">
      ${GROUP_PICK_CATEGORIES.map((item) => renderGroupPickCard(item))}
    </yn-group-pick>
  </div>
`;

/** yn-group-pick Multiple */
export const storyGroupPickMultiple = () => html`
  <div class="yn-grid yn-gap-4 yn-rounded-xl yn-bg-[#efede8] yn-p-6">
    <yn-group-pick multiple .value=${["Urban", "Nature"]} style="--yn-group-pick-gap:8px;">
      ${GROUP_PICK_CATEGORIES.map((item) => renderGroupPickCard(item))}
    </yn-group-pick>
  </div>
`;

export const renderDropdownContent = () => html`
  <div class="yn-rounded-2xl yn-bg-[#efede8] yn-p-3">
    <yn-group-pick value="Nature" style="--yn-group-pick-gap:8px;">
      ${DROPDOWN_CATEGORIES.map(
        (item) => html`
          <yn-pick .value=${item.id} ?border=${true}>
            <div
              class="yn-box-border yn-flex yn-min-w-[104px] yn-items-end yn-rounded-lg yn-px-3 yn-py-[10px] yn-text-base yn-font-bold yn-leading-none yn-text-[#241f21]"
              style=${`background:${item.color};`}
            >
              ${item.id}
            </div>
          </yn-pick>
        `
      )}
    </yn-group-pick>
  </div>
`;

/** yn-dropdown Default */
export const storyDropdownDefault = () => html`
  <div class="yn-flex yn-min-h-[380px] yn-items-start yn-justify-center yn-pt-12">
    <yn-dropdown placement="bottom-start" style=${DROPDOWN_PANEL_STYLE}>
      <yn-button variant="default">筛选条件</yn-button>
      <div slot="content">${renderDropdownContent()}</div>
    </yn-dropdown>
  </div>
`;

/** yn-dropdown CustomCloseIcon */
export const storyDropdownCustomClose = () => html`
  <div class="yn-flex yn-min-h-[380px] yn-items-start yn-justify-center yn-pt-12">
    <yn-dropdown placement="right-start" style=${DROPDOWN_PANEL_STYLE}>
      <yn-button variant="default">更多选项</yn-button>
      <svg slot="close-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="10.5" stroke="#241f21" />
        <path d="M8 8L16 16M16 8L8 16" stroke="#241f21" stroke-width="1.8" stroke-linecap="round" />
      </svg>
      <div slot="content">${renderDropdownContent()}</div>
    </yn-dropdown>
  </div>
`;

const renderLanguagePicks = () =>
  LANGUAGE_NODES.map(
    (item) => html`
      <yn-pick value=${item.id} data-node=${JSON.stringify(item)}>
        <div
          class="yn-flex yn-min-h-[34px] yn-items-center yn-rounded-[8px] yn-px-3 yn-py-[9px] yn-text-[13px] yn-font-medium yn-leading-[1.2] yn-text-[#241f21]"
        >
          ${item.label}
        </div>
      </yn-pick>
    `
  );

/** yn-dropdown-pick Default */
export const storyDropdownPickDefault = () => html`
  <div class="yn-min-h-[220px] yn-bg-[#efede8] yn-p-8 yn-flex yn-justify-end" style="width:100%;">
    <yn-dropdown-pick
      value="en"
      value-field="id"
      button-display-field="code"
      placeholder="Language"
      button-bg="#f8f6f2"
      button-color="#241f21"
      open-button-bg="#241f21"
      open-button-color="#ffffff"
      panel-min-width="132px"
      ?show-selected-icon=${true}
      style="--yn-dropdown-pick-panel-bg:#f2efea;--yn-dropdown-pick-panel-radius:12px;--yn-dropdown-pick-panel-padding:6px;--yn-dropdown-pick-gap:6px;"
    >
      ${renderLanguagePicks()}
    </yn-dropdown-pick>
  </div>
`;

/** yn-quantity ProductDemo */
export const storyQuantityProduct = () => html`
  <div
    style="background:var(--yn-color-bg,#f2efea);color:var(--yn-color-text,#241f21);min-height:360px;padding:48px 24px;display:flex;justify-content:center;"
  >
    <article
      style="width:min(420px,100%);background:var(--yn-color-surface,rgba(255,255,255,0.35));border:1px solid var(--yn-color-border);border-radius:20px;padding:28px 24px 32px;"
    >
      <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;opacity:0.62;">
        Urban · Explore
      </p>
      <h1 style="margin:0 0 12px;font-size:28px;font-weight:400;line-height:1.15;">
        Espreguiçadeira Sun Lounger Plaza
      </h1>
      <p style="margin:0 0 24px;font-size:15px;line-height:1.5;opacity:0.72;">
        Mobiliário urbano sustentável, pensado para integrar na paisagem.
      </p>
      <div style="display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:20px;">
        <span style="font-size:14px;opacity:0.7;">Quantidade</span>
        <yn-quantity value="1" min="1" max="99" style="--yn-quantity-font-family:inherit;"></yn-quantity>
      </div>
      <yn-button variant="dark" style="width:100%;--yn-button-radius:999px;">
        Adicionar à lista de interesse
      </yn-button>
    </article>
  </div>
`;

const renderSkuHost = (
  skus: YnSkuItem[],
  opts: { pickOne?: boolean; simple?: boolean; labels?: Record<string, string> },
  title?: ReturnType<typeof html>
) => html`
  <yn-sku-selector
    .skus=${skus}
    currency="€"
    submit-label="ADD TO CART"
    ?pick-one=${opts.pickOne ?? false}
    ?simple=${opts.simple ?? false}
    .labels=${opts.labels ?? { weight: "Weight", color: "Color", size: "Size" }}
    .cartIcon=${ynSkuCartSvg}
    ?show-cart-icon=${true}
    style=${SKU_STYLE}
    @submit=${(e: CustomEvent & { instance?: { done: () => void } }) => e.instance?.done()}
  >
    ${title ?? nothing} ${CART_SVG}
  </yn-sku-selector>
`;

/** yn-sku-selector PickOne */
export const storySkuPickOne = () => html`
  <div style="padding:0 24px 24px;max-width:480px;color:#000;">
    ${renderSkuHost(
      DEMO_SKUS,
      { pickOne: true, labels: { weight: "Weight", color: "Color", size: "Size" } },
      html`<h1
        slot="title"
        style="margin:0 0 8px;font-size:clamp(28px,8vw,48px);font-weight:900;text-transform:uppercase;line-height:1;"
      >
        Jersey - Select
      </h1>`
    )}
  </div>
`;

/** yn-sku-selector SimpleMode */
export const storySkuSimple = () => html`
  <div style="padding:16px;max-width:320px;color:#000;border:1px solid #000;">
    <p style="margin:0 0 12px;font-size:14px;font-weight:700;">Jersey - No Drug</p>
    ${renderSkuHost(JERSEY_SKUS, { simple: true })}
  </div>
`;

/** yn-checkout-address Default */
export const storyCheckoutAddress = () => html`
  <div style="background:var(--yn-color-bg,#f2efea);padding:24px;max-width:560px;margin:0 auto;">
    <yn-checkout-address locale="en"></yn-checkout-address>
  </div>
`;

const cartTriggerButton = () => html`
  <yn-button slot="trigger" variant="default" drawer-payload='{"scene":"cart","entry":"header-button"}'>
    <svg class="yn-size-6" slot="prefix-icon" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M8.8999 7.5C8.8999 6.28498 9.88488 5.3 11.0999 5.3H12.8999C14.1149 5.3 15.0999 6.28498 15.0999 7.5C15.0999 7.77615 15.3238 8 15.5999 8C15.876 8 16.0999 7.77615 16.0999 7.5C16.0999 5.73269 14.6672 4.3 12.8999 4.3H11.0999C9.33259 4.3 7.8999 5.73269 7.8999 7.5C7.8999 7.77615 8.12376 8 8.3999 8C8.67604 8 8.8999 7.77615 8.8999 7.5ZM5.7998 15.6V9.39999H18.1998V15.6C18.1998 17.0359 17.0357 18.2 15.5998 18.2H8.39981C6.96387 18.2 5.7998 17.0359 5.7998 15.6ZM4.7998 9.29999C4.7998 8.80294 5.20275 8.39999 5.6998 8.39999H18.2998C18.7969 8.39999 19.1998 8.80294 19.1998 9.29999V15.6C19.1998 17.5882 17.588 19.2 15.5998 19.2H8.39981C6.41158 19.2 4.7998 17.5882 4.7998 15.6V9.29999Z"
        fill="currentColor"
      ></path>
    </svg>
    购物车
  </yn-button>
`;

const cartDrawerContent = () => html`
  <span slot="header" class="yn-text-sm yn-font-bold yn-uppercase yn-tracking-[0.04em] yn-text-[#241f21]">
    Your bag
  </span>
  <div slot="header-actions" class="yn-flex yn-items-center">
    <div class="yn-flex yn-items-center yn-rounded-full yn-bg-[#f3f3f3] yn-p-1" role="group" aria-label="Bag or wishlist">
      <button
        type="button"
        class="yn-flex yn-h-9 yn-w-9 yn-items-center yn-justify-center yn-rounded-full yn-bg-[#241f21] yn-text-white"
        aria-pressed="true"
      >
        <svg class="yn-size-5" fill="none" viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M8.8999 7.5C8.8999 6.28498 9.88488 5.3 11.0999 5.3H12.8999C14.1149 5.3 15.0999 6.28498 15.0999 7.5C15.0999 7.77615 15.3238 8 15.5999 8C15.876 8 16.0999 7.77615 16.0999 7.5C16.0999 5.73269 14.6672 4.3 12.8999 4.3H11.0999C9.33259 4.3 7.8999 5.73269 7.8999 7.5C7.8999 7.77615 8.12376 8 8.3999 8C8.67604 8 8.8999 7.77615 8.8999 7.5ZM5.7998 15.6V9.39999H18.1998V15.6C18.1998 17.0359 17.0357 18.2 15.5998 18.2H8.39981C6.96387 18.2 5.7998 17.0359 5.7998 15.6ZM4.7998 9.29999C4.7998 8.80294 5.20275 8.39999 5.6998 8.39999H18.2998C18.7969 8.39999 19.1998 8.80294 19.1998 9.29999V15.6C19.1998 17.5882 17.588 19.2 15.5998 19.2H8.39981C6.41158 19.2 4.7998 17.5882 4.7998 15.6V9.29999Z"
            fill="currentColor"
          />
        </svg>
      </button>
      <button
        type="button"
        class="yn-flex yn-h-9 yn-w-9 yn-items-center yn-justify-center yn-rounded-full yn-text-[#241f21]"
        aria-pressed="false"
      >
        <svg class="yn-size-5" fill="none" viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M12 20.5s-6.5-4.08-6.5-9.02C5.5 8.46 8.46 5.5 12 5.5s6.5 2.96 6.5 5.98c0 4.94-6.5 9.02-6.5 9.02Z"
            stroke="currentColor"
            stroke-width="1.6"
          />
        </svg>
      </button>
    </div>
  </div>
  <div slot="content" class="yn-flex yn-flex-col yn-items-center yn-pb-2 yn-text-center">
    <img
      src=${EMPTY_CART_IMAGE}
      alt=""
      width="280"
      height="200"
      class="yn-block yn-h-auto yn-w-full yn-max-w-[280px]"
      decoding="async"
    />
    <h3 class="yn-mt-6 yn-text-base yn-font-bold yn-uppercase yn-tracking-[0.04em] yn-text-[#241f21]">
      Your bag is empty
    </h3>
    <p class="yn-mt-2 yn-text-sm yn-text-[#6f696b]">There are no products in your bag</p>
    <div class="yn-mt-8 yn-flex yn-w-full yn-flex-col yn-gap-3">
      <yn-button variant="default" class="yn-w-full">Shop mens</yn-button>
      <yn-button variant="default" class="yn-w-full">Shop womens</yn-button>
    </div>
  </div>
`;

/** yn-drawer CartDrawer */
export const storyDrawerCart = () => html`
  <div class="yn-min-h-[520px] yn-bg-[#f5f1ea] yn-p-6">
    <yn-drawer placement="auto" sheet-height="auto" .width=${420} style=${DRAWER_STYLE}>
      ${cartTriggerButton()} ${cartDrawerContent()}
    </yn-drawer>
  </div>
`;

/** yn-drawer CartDrawerDesktop */
export const storyDrawerDesktop = () => html`
  <div class="yn-min-h-[640px] yn-bg-[#f5f1ea] yn-p-6">
    <yn-drawer placement="auto" sheet-height="auto" .width=${420} style=${DRAWER_STYLE}>
      <div slot="backdrop-extra" class="yn-flex yn-gap-4">
        <div class="yn-w-40 yn-rounded-xl yn-bg-white yn-p-4 yn-shadow-md">
          <div class="yn-h-24 yn-rounded-lg yn-bg-[#f3efe7]"></div>
          <p class="yn-mt-3 yn-text-sm yn-font-bold">Essential Tee</p>
          <p class="yn-mt-1 yn-text-xs yn-text-[#6f696b]">EUR 24.00</p>
        </div>
        <div class="yn-w-40 yn-rounded-xl yn-bg-white yn-p-4 yn-shadow-md">
          <div class="yn-h-24 yn-rounded-lg yn-bg-[#f3efe7]"></div>
          <p class="yn-mt-3 yn-text-sm yn-font-bold">Training Shorts</p>
          <p class="yn-mt-1 yn-text-xs yn-text-[#6f696b]">EUR 32.00</p>
        </div>
      </div>
      <yn-button slot="trigger" variant="default">购物车</yn-button>
      ${cartDrawerContent()}
    </yn-drawer>
  </div>
`;

const sleep = (ms: number) => new Promise<void>((r) => window.setTimeout(r, ms));

const getToastRoot = (event: Event) => (event.currentTarget as HTMLElement).closest(".toast-demo-root");
const getToast = (event: Event) => getToastRoot(event)?.querySelector("yn-toast") as YnToast | null;

const showToast = (event: Event, type: YnToastType, message?: string) => {
  void getToast(event)?.[type](message);
};

/** yn-toast ApiUsage / Default renderDemo */
export const storyToastApi = () => html`
  <div
    class="toast-demo-root yn-min-h-[520px] yn-overflow-hidden yn-rounded-[28px] yn-p-8"
    style="background:linear-gradient(135deg,#efe8d8 0%,#e8e1d0 48%,#d8d1bd 100%);"
  >
    <yn-toast type="success" message="success!" style=${TOAST_STYLE}></yn-toast>
    <div class="yn-flex yn-flex-col yn-items-center yn-justify-center yn-gap-5 yn-pt-28">
      <div class="yn-flex yn-flex-wrap yn-items-center yn-justify-center yn-gap-3">
        <yn-button variant="default" @click=${(e: Event) => showToast(e, "success", "success!")}>Success</yn-button>
        <yn-button variant="default" @click=${(e: Event) => showToast(e, "info", "info!")}>Info</yn-button>
        <yn-button variant="default" @click=${(e: Event) => showToast(e, "warning", "warning!")}>Warning</yn-button>
        <yn-button variant="default" @click=${(e: Event) => showToast(e, "error", "error!")}>Error</yn-button>
        <yn-button variant="default" @click=${(e: Event) => showToast(e, "warning", "")}>Only Icon</yn-button>
        <yn-button
          variant="default"
          @click=${(e: Event) =>
            void getToast(e)?.success('saved <strong>successfully</strong> <span style="color:#667a48;">100%</span>')}
          >HTML Message</yn-button
        >
        <yn-button
          variant="default"
          @click=${async (e: Event) => {
            await getToast(e)?.info((instance) => {
              instance.done("同步任务完成");
              return "同步返回：张三";
            });
          }}
          >Sync Callback</yn-button
        >
        <yn-button
          variant="default"
          @click=${async (e: Event) => {
            await getToast(e)?.success(async (instance) => {
              await sleep(1200);
              instance.done("异步保存成功（无遮罩）");
            });
          }}
          >Async Callback</yn-button
        >
        <yn-button
          variant="default"
          @click=${async (e: Event) => {
            await getToast(e)?.success(async (instance) => {
              await sleep(1200);
              instance.done("异步保存成功（带遮罩）");
            }, true);
          }}
          >Async Callback + Mask</yn-button
        >
        <yn-button variant="default" @click=${(e: Event) => getToast(e)?.hide()}>API Close</yn-button>
      </div>
      <p class="yn-max-w-md yn-text-center yn-text-sm yn-leading-6 yn-text-[#5f584d]">
        点击按钮查看 success/info/warning/error、HTML message、sync/async callback 与状态球形变动画。
      </p>
    </div>
  </div>
`;

const shellStyle = (variant: YnPullCordSwitchVariant, checked: boolean) => `
  background: ${shellBackgroundFromVariant(variant, checked)};
  border-radius: var(--yn-pull-cord-switch-radius, 12px);
  overflow: visible;
  display: inline-block;
  width: 100%;
  max-width: min(100%, 400px);
  vertical-align: top;
  transition: background 0.45s cubic-bezier(0.22, 1, 0.36, 1);
`;

const syncShell = (shell: Element | undefined, checked: boolean) => {
  if (!(shell instanceof HTMLElement)) return;
  const lamp = shell.querySelector("yn-pull-cord-switch");
  if (lamp instanceof HTMLElement) applyPullCordShellBackground(shell, lamp, checked);
};

/** yn-pull-cord-switch Slots */
export const storyPullCordSlots = () => html`
  <div
    class="pull-cord-shell"
    style=${shellStyle("default", false)}
    ${ref((el) => syncShell(el, false))}
  >
    <yn-pull-cord-switch
      rope-length="260"
      variant="default"
      ?hit-slop=${false}
      @change=${(e: Event) => {
        const checked = (e as CustomEvent<{ checked: boolean }>).detail.checked;
        const lamp = e.target as HTMLElement;
        const shell = lamp.parentElement;
        if (shell?.classList.contains("pull-cord-shell")) {
          applyPullCordShellBackground(shell, lamp, checked);
        }
      }}
    >
      <yn-button size="mini" variant="neutral" ?hit-slop=${false}>夜间</yn-button>
      <yn-button slot="activated" size="mini" variant="success" ?hit-slop=${false}>日间</yn-button>
    </yn-pull-cord-switch>
  </div>
`;

export type DocsThemeMode = "light" | "dark";

/** yn-pull-cord-switch docs theme switch: Storybook shell + real docs theme application */
export const storyPullCordThemeSwitch = (
  theme: DocsThemeMode,
  onThemeChange: (theme: DocsThemeMode, event: Event) => void,
  locale: Locale = "zh-CN"
) => {
  const isLight = theme === "light";
  const isNight = theme === "dark";
  const variant: YnPullCordSwitchVariant = isLight ? "floema" : "default";
  const zh = locale === "zh-CN";

  return html`
    <section class="docs-theme-switcher" data-theme-mode=${theme}>
      <div class="docs-theme-switcher__copy">
        <p class="docs-theme-switcher__eyebrow">${zh ? "Yanan 独立站主题" : "Yanan storefront theme"}</p>
        <h3>
          ${isLight
            ? zh
              ? "白天模式 · Floema 暖纸色"
              : "Day mode · Floema paper tone"
            : zh
              ? "黑夜模式 · 沉浸式商品浏览"
              : "Night mode · Immersive browsing"}
        </h3>
        <p>
          ${isLight
            ? zh
              ? "适合品牌首页、商品详情和结账流程，保持轻盈、温暖、可读。"
              : "Best for brand homepages, PDPs, and checkout flows with a warm readable surface."
            : zh
              ? "适合活动页、灵感页和沉浸式陈列，突出图像、动效与焦点内容。"
              : "Best for campaign pages and immersive merchandising where imagery and motion lead."}
        </p>
      </div>

      <div
        class="pull-cord-shell docs-theme-switcher__cord"
        style=${shellStyle(variant, isNight)}
        ${ref((el) => syncShell(el, isNight))}
      >
        <yn-pull-cord-switch
          .checked=${isNight}
          variant=${variant}
          size="medium"
          rope-length="260"
          ?hit-slop=${false}
          @change=${(event: Event) => {
            const checked = (event as CustomEvent<{ checked: boolean }>).detail.checked;
            const lamp = event.target as HTMLElement;
            const shell = lamp.parentElement;
            if (shell?.classList.contains("pull-cord-shell")) {
              applyPullCordShellBackground(shell, lamp, checked);
            }
            onThemeChange(checked ? "dark" : "light", event);
          }}
        >
          <yn-button size="small" variant="default" ?hit-slop=${false}>${zh ? "白天" : "Day"}</yn-button>
          <yn-button slot="activated" size="small" variant="success" ?hit-slop=${false}>${zh ? "黑夜" : "Night"}</yn-button>
        </yn-pull-cord-switch>
      </div>
    </section>
  `;
};

const pullCordEmbedded = (size: YnPullCordSwitchSize) => html`
  <div
    class="pull-cord-shell"
    style=${shellStyle("default", false)}
    ${ref((el) => syncShell(el, false))}
  >
    <yn-pull-cord-switch
      size=${size}
      rope-length="260"
      variant="default"
      ?hit-slop=${false}
      @change=${(e: Event) => {
        const checked = (e as CustomEvent<{ checked: boolean }>).detail.checked;
        const lamp = e.target as HTMLElement;
        const shell = lamp.parentElement;
        if (shell?.classList.contains("pull-cord-shell")) {
          applyPullCordShellBackground(shell, lamp, checked);
        }
      }}
    >
      <yn-button size="mini" variant="neutral" ?hit-slop=${false}>${size}</yn-button>
    </yn-pull-cord-switch>
  </div>
`;

/** yn-pull-cord-switch Sizes */
export const storyPullCordSizes = () => html`
  <div
    style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;padding:8px;align-items:end;"
  >
    ${(["mini", "small", "medium"] as const).map(
      (size) => html`
        <div>
          <p style="margin:0 0 8px;font-size:12px;font-weight:600;color:#666;">size=${size}</p>
          ${pullCordEmbedded(size)}
        </div>
      `
    )}
  </div>
`;
