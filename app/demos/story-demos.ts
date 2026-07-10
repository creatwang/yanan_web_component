/**
 * 与 Storybook stories 对齐的 Demo 模板（markup / 样式 / 数据与 stories 一致）
 */
import { html, nothing } from "lit";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";
import { ref } from "lit/directives/ref.js";
import { getLocale } from "../i18n/locale";
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
  "--yn-search-bg-active:rgba(255, 255, 255, 0.96);--yn-search-bg-idle:rgba(255, 255, 255, 0);--yn-search-field-bg:var(--bg-fill);--yn-search-icon-color:#241f21;--yn-search-field-color:#241f21;--yn-search-placeholder-color:rgba(36, 31, 33, 0.52);--yn-search-caret-color:#241f21;--yn-search-fill-duration:220ms;--yn-search-fill-ease:cubic-bezier(0.4, 0, 1, 1);--yn-search-icon-duration:220ms;--yn-search-icon-ease:cubic-bezier(0.4, 0, 1, 1);";

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

const ICON_BUTTON_CART_SVG = html`
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      fill="currentColor"
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M8.8999 7.5C8.8999 6.28498 9.88488 5.3 11.0999 5.3H12.8999C14.1149 5.3 15.0999 6.28498 15.0999 7.5C15.0999 7.77615 15.3238 8 15.5999 8C15.876 8 16.0999 7.77615 16.0999 7.5C16.0999 5.73269 14.6672 4.3 12.8999 4.3H11.0999C9.33259 4.3 7.8999 5.73269 7.8999 7.5C7.8999 7.77615 8.12376 8 8.3999 8C8.67604 8 8.8999 7.77615 8.8999 7.5ZM5.7998 15.6V9.39999H18.1998V15.6C18.1998 17.0359 17.0357 18.2 15.5998 18.2H8.39981C6.96387 18.2 5.7998 17.0359 5.7998 15.6ZM4.7998 9.29999C4.7998 8.80294 5.20275 8.39999 5.6998 8.39999H18.2998C18.7969 8.39999 19.1998 8.80294 19.1998 9.29999V15.6C19.1998 17.5882 17.588 19.2 15.5998 19.2H8.39981C6.41158 19.2 4.7998 17.5882 4.7998 15.6V9.29999Z"
    />
  </svg>
`;

/** yn-icon-button Default */
export const storyIconButtonDefault = () => html`
  <yn-icon-button label="购物车" variant="default">${ICON_BUTTON_CART_SVG}</yn-icon-button>
`;

/** yn-icon-button ClickHandler */
export const storyIconButtonClick = () => html`
  <div
    class="icon-button-click-demo"
    style="display:flex;flex-direction:column;align-items:center;gap:12px;padding:8px 0;"
  >
    <yn-icon-button
      label="打开购物车"
      variant="default"
      @click=${(event: Event) => {
        const root = (event.currentTarget as HTMLElement).closest(".icon-button-click-demo");
        const log = root?.querySelector("[data-click-log]");
        if (log) {
          log.textContent = `已触发 click · ${new Date().toLocaleTimeString()}`;
        }
      }}
    >
      ${ICON_BUTTON_CART_SVG}
    </yn-icon-button>
    <p data-click-log style="margin:0;font-size:13px;color:#6f696b;">点击图标，在 host 上监听原生 click</p>
  </div>
`;

/** yn-icon-button Variants */
export const storyIconButtonVariants = () => html`
  <div style="display:flex;flex-wrap:wrap;gap:12px;align-items:center;">
    <yn-icon-button label="default" variant="default">${ICON_BUTTON_CART_SVG}</yn-icon-button>
    <yn-icon-button label="filled" variant="filled">${ICON_BUTTON_CART_SVG}</yn-icon-button>
    <yn-icon-button label="primary" variant="primary">${ICON_BUTTON_CART_SVG}</yn-icon-button>
    <yn-icon-button label="tonal" variant="tonal">${ICON_BUTTON_CART_SVG}</yn-icon-button>
    <yn-icon-button label="outlined" variant="outlined">${ICON_BUTTON_CART_SVG}</yn-icon-button>
    <yn-icon-button label="danger" variant="danger">${ICON_BUTTON_CART_SVG}</yn-icon-button>
    <yn-icon-button label="success" variant="success">${ICON_BUTTON_CART_SVG}</yn-icon-button>
  </div>
  <div style="margin-top:16px;padding:12px;background:#241f21;display:inline-flex;gap:12px;border-radius:8px;">
    <yn-icon-button label="inverse" variant="inverse">${ICON_BUTTON_CART_SVG}</yn-icon-button>
  </div>
`;

/** yn-icon-button Sizes */
export const storyIconButtonSizes = () => html`
  <div class="yn-flex yn-items-center yn-gap-3">
    <yn-icon-button size="small" label="small" variant="primary">${ICON_BUTTON_CART_SVG}</yn-icon-button>
    <yn-icon-button size="medium" label="medium" variant="primary">${ICON_BUTTON_CART_SVG}</yn-icon-button>
    <yn-icon-button size="large" label="large" variant="primary">${ICON_BUTTON_CART_SVG}</yn-icon-button>
  </div>
`;

const ICON_BUTTON_SVG_SNIPPET = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
  <path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd" d="M8.9 7.5C8.9 6.28 9.88 5.3 11.1 5.3H12.9C14.11 5.3 15.1 6.28 15.1 7.5C15.1 7.776 15.324 8 15.6 8C15.876 8 16.1 7.776 16.1 7.5C16.1 5.733 14.667 4.3 12.9 4.3H11.1C9.333 4.3 7.9 5.733 7.9 7.5C7.9 7.776 8.124 8 8.4 8C8.676 8 8.9 7.776 8.9 7.5ZM5.8 15.6V9.4H18.2V15.6C18.2 17.036 17.036 18.2 15.6 18.2H8.4C6.964 18.2 5.8 17.036 5.8 15.6V9.3C5.8 8.803 6.203 8.4 6.7 8.4H17.3C17.797 8.4 18.2 8.803 18.2 9.3V15.6C18.2 17.588 16.588 19.2 14.6 19.2H8.4C6.412 19.2 4.8 17.588 4.8 15.6V9.3Z"/>
</svg>`;

/** yn-icon-button 完整属性展示（嵌套 default slot 传 SVG） */
export const storyIconButtonPropsDemo = () => html`
  <div style="background:#f2efea;padding:24px;border-radius:12px;">
    <h4 style="margin:0 0 16px;font-size:14px;font-weight:600;">variant 配色</h4>
    <div class="yn-flex yn-items-center yn-gap-3 yn-flex-wrap yn-mb-6">
      <yn-icon-button label="default" variant="default">${ICON_BUTTON_CART_SVG}</yn-icon-button>
      <yn-icon-button label="filled" variant="filled">${ICON_BUTTON_CART_SVG}</yn-icon-button>
      <yn-icon-button label="primary" variant="primary">${ICON_BUTTON_CART_SVG}</yn-icon-button>
      <yn-icon-button label="outlined" variant="outlined">${ICON_BUTTON_CART_SVG}</yn-icon-button>
    </div>
    <h4 style="margin:0 0 16px;font-size:14px;font-weight:600;">size 尺寸</h4>
    <div class="yn-flex yn-items-center yn-gap-3 yn-flex-wrap yn-mb-6">
      <yn-icon-button size="small" label="small" variant="primary">${ICON_BUTTON_CART_SVG}</yn-icon-button>
      <yn-icon-button size="medium" label="medium" variant="primary">${ICON_BUTTON_CART_SVG}</yn-icon-button>
      <yn-icon-button size="large" label="large" variant="primary">${ICON_BUTTON_CART_SVG}</yn-icon-button>
    </div>
    <h4 style="margin:0 0 16px;font-size:14px;font-weight:600;">disabled 禁用</h4>
    <div class="yn-flex yn-items-center yn-gap-3 yn-flex-wrap yn-mb-6">
      <yn-icon-button label="可用" variant="primary">${ICON_BUTTON_CART_SVG}</yn-icon-button>
      <yn-icon-button label="禁用" variant="primary" disabled>${ICON_BUTTON_CART_SVG}</yn-icon-button>
    </div>
    <h4 style="margin:0 0 16px;font-size:14px;font-weight:600;">href 链接模式</h4>
    <div class="yn-flex yn-items-center yn-gap-3 yn-flex-wrap yn-mb-6">
      <yn-icon-button label="账户" href="/account" variant="default">${ICON_BUTTON_CART_SVG}</yn-icon-button>
    </div>
    <h4 style="margin:0 0 16px;font-size:14px;font-weight:600;">hit-slop 热区</h4>
    <div class="yn-flex yn-items-center yn-gap-3 yn-flex-wrap yn-mb-6">
      <yn-icon-button label="默认热区" variant="default" hit-slop>${ICON_BUTTON_CART_SVG}</yn-icon-button>
      <yn-icon-button label="无热区" variant="default" ?hit-slop=${false}>${ICON_BUTTON_CART_SVG}</yn-icon-button>
    </div>
    <h4 style="margin:0 0 16px;font-size:14px;font-weight:600;">CSS 变量覆写</h4>
    <yn-icon-button
      label="自定义配色"
      style="--yn-icon-button-bg:#eef2ff;--yn-icon-button-hover-bg:#c7d2fe;--yn-icon-button-color:#3730a3;"
    >
      ${ICON_BUTTON_CART_SVG}
    </yn-icon-button>
  </div>
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

/** yn-icon-connect-button 属性展示 */
export const storyIconConnectPropsDemo = () => html`
  <div style="background:#f2efea;padding:24px;display:flex;flex-direction:column;gap:20px;">
    <div>
      <p style="margin:0 0 12px;font-size:13px;font-weight:600;">size 尺寸</p>
      ${storyIconConnectSizes()}
    </div>
    <div>
      <p style="margin:0 0 12px;font-size:13px;font-weight:600;">link 链接模式</p>
      <yn-icon-connect-button
        label="VIEW PRODUCTS"
        size="normal"
        link="/products"
        .icon=${ynSignpostSvg}
        style="--yn-icon-connect-button-bg:#ddd967;--yn-icon-connect-button-color:#241f21;"
      ></yn-icon-connect-button>
    </div>
    <div>
      <p style="margin:0 0 12px;font-size:13px;font-weight:600;">disabled 禁用</p>
      <yn-icon-connect-button
        label="DISABLED"
        size="normal"
        disabled
        .icon=${ynSignpostSvg}
        style="--yn-icon-connect-button-bg:#ddd967;--yn-icon-connect-button-color:#241f21;"
      ></yn-icon-connect-button>
    </div>
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

/** yn-search 向右展开顶开兄弟 */
export const storySearchExpandRight = () => html`
  <div class="yn-bg-[#F2EFEA] yn-p-[16px] yn-flex yn-items-center yn-gap-[12px]" style="width:fit-content;">
    <yn-search expand-direction="right" .inputWidth=${240} placeholder="Search" style=${SEARCH_STYLE}></yn-search>
    <button
      type="button"
      class="yn-h-[38px] yn-px-[16px] yn-rounded-[8px] yn-border yn-border-[#241f21]/20 yn-bg-white"
    >
      Cart
    </button>
    <span class="yn-text-[14px] yn-text-[#241f21]">Menu</span>
  </div>
`;

/** yn-search 向左展开 */
export const storySearchExpandLeft = () => html`
  <div
    class="yn-bg-[#F2EFEA] yn-p-[16px] yn-flex yn-items-center yn-justify-end yn-gap-[12px]"
    style="width:fit-content;margin-left:auto;"
  >
    <span class="yn-text-[14px] yn-text-[#241f21]">Brand</span>
    <yn-search expand-direction="left" .inputWidth=${240} placeholder="Search" style=${SEARCH_STYLE}></yn-search>
  </div>
`;

/** yn-search 默认展开 */
export const storySearchDefaultOpen = () => html`
  <div class="yn-bg-[#F2EFEA] yn-p-[10px]">
    <yn-search open .inputWidth=${240} placeholder="O que estás à procura?" style=${SEARCH_STYLE}></yn-search>
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

/** yn-dropdown 嵌套插槽组合（trigger + content + close-icon） */
export const storyDropdownPropsDemo = () => html`
  <div style="background:#f2efea;padding:24px;display:flex;flex-direction:column;gap:32px;">
    <div>
      <p style="margin:0 0 12px;font-size:13px;font-weight:600;">默认：yn-button 触发 + yn-group-pick 面板</p>
      ${storyDropdownDefault()}
    </div>
    <div>
      <p style="margin:0 0 12px;font-size:13px;font-weight:600;">close-icon 插槽 + right-start</p>
      ${storyDropdownCustomClose()}
    </div>
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

/** yn-dropdown-pick 属性展示（嵌套 yn-pick + data-node） */
export const storyDropdownPickPropsDemo = () => html`
  <div style="background:#f2efea;padding:24px;display:flex;flex-direction:column;gap:28px;">
    <div>
      <p style="margin:0 0 12px;font-size:13px;font-weight:600;">默认：value + button-display-field + 嵌套 yn-pick</p>
      ${storyDropdownPickDefault()}
    </div>
    <div class="yn-min-h-[120px] yn-bg-[#efede8] yn-p-8 yn-flex yn-flex-col yn-items-end" style="width:100%;">
      <p style="margin:0 0 12px;font-size:13px;font-weight:600;width:100%;">disabled 禁用</p>
      <yn-dropdown-pick
        value="en"
        disabled
        value-field="id"
        button-display-field="code"
        placeholder="Language"
        button-bg="#f8f6f2"
        button-color="#241f21"
        panel-min-width="132px"
        style="--yn-dropdown-pick-panel-bg:#f2efea;--yn-dropdown-pick-panel-radius:12px;--yn-dropdown-pick-panel-padding:6px;"
      >
        ${renderLanguagePicks()}
      </yn-dropdown-pick>
    </div>
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

/** yn-quantity 属性展示 */
export const storyQuantityPropsDemo = () => html`
  <div style="background:#f2efea;padding:24px;display:flex;flex-direction:column;gap:20px;align-items:flex-start;">
    <div>
      <p style="margin:0 0 8px;font-size:13px;font-weight:600;">默认 min=1 max=99</p>
      <yn-quantity value="1" min="1" max="99" style="--yn-quantity-font-family:inherit;"></yn-quantity>
    </div>
    <div>
      <p style="margin:0 0 8px;font-size:13px;font-weight:600;">边界 max=5</p>
      <yn-quantity value="5" min="1" max="5" style="--yn-quantity-font-family:inherit;"></yn-quantity>
    </div>
    <div>
      <p style="margin:0 0 8px;font-size:13px;font-weight:600;">step=2</p>
      <yn-quantity value="2" min="2" max="10" step="2" style="--yn-quantity-font-family:inherit;"></yn-quantity>
    </div>
    <div>
      <p style="margin:0 0 8px;font-size:13px;font-weight:600;">disabled 禁用</p>
      <yn-quantity value="3" min="1" max="99" disabled style="--yn-quantity-font-family:inherit;"></yn-quantity>
    </div>
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

/** yn-sku-selector 属性展示 */
export const storySkuPropsDemo = () => html`
  <div style="background:#f2efea;padding:24px;display:flex;flex-direction:column;gap:32px;">
    <div>
      <p style="margin:0 0 12px;font-size:13px;font-weight:600;">pick-one 自动选中 + title 插槽</p>
      ${storySkuPickOne()}
    </div>
    <div>
      <p style="margin:0 0 12px;font-size:13px;font-weight:600;">simple 选齐自动 submit</p>
      ${storySkuSimple()}
    </div>
  </div>
`;

/** yn-checkout-address Default */
export const storyCheckoutAddress = () => html`
  <div style="background:var(--yn-color-bg,#f2efea);padding:24px;max-width:560px;margin:0 auto;">
    <yn-checkout-address locale="en"></yn-checkout-address>
  </div>
`;

/** yn-checkout-address 属性展示 */
export const storyCheckoutAddressPropsDemo = () => html`
  <div style="background:#f2efea;padding:24px;display:flex;flex-direction:column;gap:32px;">
    <div>
      <p style="margin:0 0 12px;font-size:13px;font-weight:600;">locale="zh-CN" + show-email + show-whatsapp</p>
      <yn-checkout-address locale="zh-CN" show-email show-whatsapp email-required whatsapp-required></yn-checkout-address>
    </div>
    <div>
      <p style="margin:0 0 12px;font-size:13px;font-weight:600;">locale="en" 默认</p>
      <yn-checkout-address locale="en"></yn-checkout-address>
    </div>
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

/** yn-drawer 完整插槽组合（trigger / header / header-actions / content / backdrop-extra） */
export const storyDrawerSlotsDemo = () => storyDrawerCart();

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

/** Storefront 风格 fixed 主题绳（rope-pass-through） */
export const storyPullCordFixedHeader = () => html`
  <div style="min-height:420px;background:#fafaf9;color:#18181b;position:relative;">
    <header
      style="
        position: sticky;
        top: 0;
        z-index: 100;
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 20px;
        background: rgba(255,255,255,0.92);
        border-bottom: 1px solid rgba(0,0,0,0.06);
        font-weight: 600;
      "
    >
      <span>${getLocale() === "zh-CN" ? "跨境商城" : "Storefront"}</span>
      <button
        type="button"
        style="margin-left:auto;padding:6px 12px;border:1px solid #ddd;border-radius:8px;background:#fff;cursor:pointer;"
      >
        ${getLocale() === "zh-CN" ? "搜索" : "Search"}
      </button>
    </header>
    <yn-pull-cord-switch
      fixed
      reverse
      glow-up
      rope-pass-through
      size="mini"
      rope-length="220"
      fixed-x="-12"
      top="52"
      z-index="101"
      variant="default"
      ?hit-slop=${false}
    >
      <yn-button size="mini" variant="default" ?hit-slop=${false}>${getLocale() === "zh-CN" ? "日间" : "Day"}</yn-button>
      <yn-button slot="activated" size="mini" variant="success" ?hit-slop=${false}>${getLocale() === "zh-CN" ? "夜间" : "Night"}</yn-button>
    </yn-pull-cord-switch>
    <p style="margin:24px 20px 0;max-width:520px;line-height:1.6;opacity:0.75;font-size:14px;">
      ${getLocale() === "zh-CN"
        ? "与 storefront BaseLayout 相同：`rope-pass-through` 让绳身 canvas 不挡 Header 搜索。"
        : "Same as storefront BaseLayout: `rope-pass-through` keeps the glow canvas from blocking header search."}
    </p>
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

// ── Event-log helper ──────────────────────────────────────────────

const EVENT_LOG_STYLE = `
  margin-top:12px;
  padding:8px 12px;
  background:rgba(36,31,33,0.06);
  border-radius:8px;
  font-size:12px;
  font-family:ui-monospace,monospace;
  line-height:1.6;
  max-height:180px;
  overflow-y:auto;
  color:#241f21;
`;

/**
 * 通用事件日志包装器：渲染组件内容，监听指定事件，
 * 在预览下方同时展示事件数据 + console.log
 */
export function withEventLog(
  content: ReturnType<typeof html>,
  eventMap: Record<string, string>,
  extraAttr?: string
) {
  return html`
    <div
      ${ref((el) => {
        if (!el || (el as any).__eventLogAttached) return;
        (el as any).__eventLogAttached = true;
        const root = el as HTMLElement;
        for (const [eventName, detailLabel] of Object.entries(eventMap)) {
          root.addEventListener(eventName, ((e: Event) => {
            const ce = e as CustomEvent;
            const detail = ce.detail ?? {};
            let detailStr: string;
            try {
              detailStr = JSON.stringify(detail, null, 1);
            } catch {
              detailStr = String(detail);
            }
            const logLine = `[${eventName}] detail: ${detailStr}`;
            console.log(logLine);
            const log = root.querySelector('[data-event-log]');
            if (log) {
              const entry = document.createElement('div');
              entry.textContent = logLine;
              log.appendChild(entry);
              log.scrollTop = log.scrollHeight;
            }
          }) as EventListener);
        }
      })}
      ${extraAttr ? extraAttr : ''}
    >
      ${content}
      <div style=${EVENT_LOG_STYLE} data-event-log><em style="opacity:0.5;">事件日志将显示在此处...</em></div>
    </div>
  `;
}

/** yn-button 事件日志 */
export const storyButtonEventLog = () => withEventLog(
  html`<yn-button variant="primary">点击我</yn-button>`,
  { click: "MouseEvent" }
);

/** yn-icon-button 事件日志 */
export const storyIconButtonEventLog = () => withEventLog(
  html`<yn-icon-button label="购物车" variant="default">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd" d="M8.8999 7.5C8.8999 6.28498 9.88488 5.3 11.0999 5.3H12.8999C14.1149 5.3 15.0999 6.28498 15.0999 7.5C15.0999 7.77615 15.3238 8 15.5999 8C15.876 8 16.0999 7.77615 16.0999 7.5C16.0999 5.73269 14.6672 4.3 12.8999 4.3H11.0999C9.33259 4.3 7.8999 5.73269 7.8999 7.5C7.8999 7.77615 8.12376 8 8.3999 8C8.67604 8 8.8999 7.77615 8.8999 7.5ZM5.7998 15.6V9.39999H18.1998V15.6C18.1998 17.0359 17.0357 18.2 15.5998 18.2H8.39981C6.96387 18.2 5.7998 17.0359 5.7998 15.6ZM4.7998 9.29999C4.7998 8.80294 5.20275 8.39999 5.6998 8.39999H18.2998C18.7969 8.39999 19.1998 8.80294 19.1998 9.29999V15.6C19.1998 17.5882 17.588 19.2 15.5998 19.2H8.39981C6.41158 19.2 4.7998 17.5882 4.7998 15.6V9.29999Z"/>
    </svg>
  </yn-icon-button>`,
  { click: "MouseEvent" }
);

/** yn-input 事件日志（全部事件） */
export const storyInputEventLog = () => withEventLog(
  html`
    <yn-input
      placeholder="输入内容查看事件..."
      style=${INPUT_STYLE}
    >
      <span slot="prefix-button">${unsafeSVG(ynSignpostSvg)}</span>
      <span slot="suffix-button">${unsafeSVG(ynSearchCloseSvg)}</span>
    </yn-input>
  `,
  { "yn-input": "{value}", "yn-prefix-click": "{value}", "yn-suffix-click": "{value}" }
);

/** yn-pick 事件日志 */
export const storyPickEventLog = () => withEventLog(
  html`
    <yn-pick value="nature" style="--yn-pick-border-width:2px;--yn-pick-border-color:#000000;--yn-pick-border-radius:8px;">
      <div style="padding:12px 20px;background:#d5c29f;border-radius:8px;font-size:18px;font-weight:bold;">Nature</div>
    </yn-pick>
  `,
  { toggle: "{id, flag}" }
);

/** yn-group-pick 事件日志 */
export const storyGroupPickEventLog = () => withEventLog(
  html`
    <yn-group-pick style="--yn-group-pick-gap:12px;">
      ${GROUP_PICK_CATEGORIES.map((item) => html`
        <yn-pick .value=${item.id} ?border=${true}>
          <div style="padding:8px 16px;background:${item.color};border-radius:8px;font-weight:bold;">${item.id}</div>
        </yn-pick>
      `)}
    </yn-group-pick>
  `,
  { change: "{ids, flag}" }
);

/** yn-navigation 事件日志 */
export const storyNavigationEventLog = () => withEventLog(
  html`<div class="yn-bg-[#F2EFEA] yn-p-[10px]">
    <yn-navigation
      .items=${{ PRODUTOS: "/produtos", SOBRE: "/sobre", SUSTENTABILIDADE: "/sustentabilidade", JORNAL: "/jornal" }}
      active="PRODUTOS"
      aria-label="Primary navigation"
      style=${NAV_STYLE}
    ></yn-navigation>
  </div>`,
  { change: "{key, node}" }
);

/** yn-search 事件日志 */
export const storySearchEventLog = () => withEventLog(
  html`<div class="yn-bg-[#F2EFEA] yn-p-[10px]">
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
  </div>`,
  { input: "{value}", enter: "{value}" }
);

/** yn-dropdown 事件日志 */
export const storyDropdownEventLog = () => withEventLog(
  html`<div class="yn-flex yn-min-h-[280px] yn-items-start yn-justify-center yn-pt-12">
    <yn-dropdown placement="bottom-start" style=${DROPDOWN_PANEL_STYLE}>
      <yn-button variant="default">筛选条件</yn-button>
      <div slot="content">${renderDropdownContent()}</div>
    </yn-dropdown>
  </div>`,
  { "open-change": "{open, placement}" }
);

/** yn-dropdown-pick 事件日志 */
export const storyDropdownPickEventLog = () => withEventLog(
  html`<div class="yn-min-h-[220px] yn-bg-[#efede8] yn-p-8 yn-flex yn-justify-end" style="width:100%;">
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
      ${LANGUAGE_NODES.map((item) => html`
        <yn-pick value=${item.id} data-node=${JSON.stringify(item)}>
          <div style="padding:8px 12px;">${item.label}</div>
        </yn-pick>
      `)}
    </yn-dropdown-pick>
  </div>`,
  { change: "{id, node}", "open-change": "{open}" }
);

/** yn-quantity 事件日志 */
export const storyQuantityEventLog = () => withEventLog(
  html`
    <div style="padding:24px;background:#f2efea;display:flex;flex-direction:column;align-items:flex-start;gap:12px;">
      <yn-quantity value="1" min="1" max="99" style="--yn-quantity-font-family:inherit;"></yn-quantity>
    </div>
  `,
  { change: "{value}" }
);

/** yn-sku-selector 事件日志 */
export const storySkuEventLog = () => withEventLog(
  html`
    <div style="padding:16px;max-width:320px;color:#000;">
      <yn-sku-selector
        .skus=${DEMO_SKUS}
        currency="€"
        submit-label="ADD TO CART"
        pick-one
        .labels=${{ weight: "Weight", color: "Color", size: "Size" }}
        .cartIcon=${ynSkuCartSvg}
        ?show-cart-icon=${true}
        style=${SKU_STYLE}
        @submit=${(e: CustomEvent & { instance?: { done: () => void } }) => e.instance?.done()}
      >
        ${CART_SVG}
      </yn-sku-selector>
    </div>
  `,
  { change: "{selections, sku, ready, missingKeys}", submit: "{selections, sku}", init: "{selections, sku}" }
);

/** yn-drawer 事件日志 */
export const storyDrawerEventLog = () => withEventLog(
  html`<div class="yn-min-h-[360px] yn-bg-[#f5f1ea] yn-p-6">
    <yn-drawer placement="auto" sheet-height="auto" .width=${420} style=${DRAWER_STYLE}>
      <yn-button slot="trigger" variant="default">打开购物车</yn-button>
      <span slot="header" class="yn-text-sm yn-font-bold yn-uppercase">Your bag</span>
      <div slot="content" class="yn-p-8 yn-text-center">
        <p>购物车是空的</p>
      </div>
    </yn-drawer>
  </div>`,
  { "open-change": "{open, source, payload}", "before-open": "{open}", "after-open": "{open}", "before-close": "{open}", "after-close": "{open}" }
);

/** yn-toast 事件日志 */
export const storyToastEventLog = () => withEventLog(
  html`
    <div class="yn-min-h-[360px] yn-overflow-hidden yn-rounded-[28px] yn-p-8" style="background:linear-gradient(135deg,#efe8d8 0%,#e8e1d0 48%,#d8d1bd 100%);">
      <yn-toast type="success" message="success!" style=${TOAST_STYLE}></yn-toast>
      <div class="yn-flex yn-flex-col yn-items-center yn-justify-center yn-gap-4 yn-pt-20">
        <div class="yn-flex yn-flex-wrap yn-gap-3">
          <yn-button variant="default" @click=${(e: Event) => {
            const toast = (e.currentTarget as HTMLElement).closest('[data-event-root]')?.querySelector('yn-toast') as any;
            toast?.success?.('success!');
          }}>Success</yn-button>
          <yn-button variant="default" @click=${(e: Event) => {
            const toast = (e.currentTarget as HTMLElement).closest('[data-event-root]')?.querySelector('yn-toast') as any;
            toast?.info?.('info!');
          }}>Info</yn-button>
          <yn-button variant="default" @click=${(e: Event) => {
            const toast = (e.currentTarget as HTMLElement).closest('[data-event-root]')?.querySelector('yn-toast') as any;
            toast?.warning?.('warning!');
          }}>Warning</yn-button>
          <yn-button variant="default" @click=${(e: Event) => {
            const toast = (e.currentTarget as HTMLElement).closest('[data-event-root]')?.querySelector('yn-toast') as any;
            toast?.error?.('error!');
          }}>Error</yn-button>
        </div>
      </div>
    </div>
  `,
  { show: "{type, message, source}", close: "{type, message, source}" },
  'data-event-root=""'
);

/** yn-pull-cord-switch 事件日志 */
export const storyPullCordEventLog = () => withEventLog(
  html`
    <div class="pull-cord-shell" style=${shellStyle("default", false)} ${ref((el) => syncShell(el, false))}>
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
        <yn-button size="mini" variant="neutral" ?hit-slop=${false}>关闭</yn-button>
        <yn-button slot="activated" size="mini" variant="success" ?hit-slop=${false}>开启</yn-button>
      </yn-pull-cord-switch>
    </div>
  `,
  { change: "{checked}", "fixed-move": "{x, reverse}" }
);

/** yn-checkout-address 事件日志 */
export const storyCheckoutAddressEventLog = () => withEventLog(
  html`<div style="background:var(--yn-color-bg,#f2efea);padding:24px;max-width:560px;margin:0 auto;">
    <yn-checkout-address locale="en"></yn-checkout-address>
  </div>`,
  { change: "{value, validation, changedFields}" }
);

/** yn-icon-connect-button 事件日志 */
export const storyIconConnectEventLog = () => withEventLog(
  html`
    <yn-icon-connect-button
      label="VER PRODUTOS"
      size="normal"
      .icon=${ynSignpostSvg}
      style="--yn-icon-connect-button-bg:#ddd967;--yn-icon-connect-button-color:#241f21;"
    ></yn-icon-connect-button>
  `,
  { click: "MouseEvent" }
);

/** yn-button 完整属性展示 */
export const storyButtonPropsDemo = () => html`
  <div style="background:#f2efea;padding:24px;border-radius:12px;">
    <h4 style="margin:0 0 16px;font-size:14px;font-weight:600;">variant 语义色</h4>
    <div class="yn-flex yn-items-center yn-gap-3 yn-flex-wrap yn-mb-6">
      <yn-button variant="primary">Primary</yn-button>
      <yn-button variant="success">Success</yn-button>
      <yn-button variant="warning">Warning</yn-button>
      <yn-button variant="danger">Danger</yn-button>
      <yn-button variant="neutral">Neutral</yn-button>
      <yn-button variant="dark">Dark</yn-button>
      <yn-button variant="default">Default</yn-button>
    </div>
    <h4 style="margin:0 0 16px;font-size:14px;font-weight:600;">size 尺寸</h4>
    <div class="yn-flex yn-items-center yn-gap-3 yn-flex-wrap yn-mb-6">
      <yn-button size="mini" variant="primary">Mini</yn-button>
      <yn-button size="small" variant="primary">Small</yn-button>
      <yn-button size="medium" variant="primary">Medium</yn-button>
    </div>
    <h4 style="margin:0 0 16px;font-size:14px;font-weight:600;">loading 加载态</h4>
    <div class="yn-flex yn-items-center yn-gap-3 yn-flex-wrap yn-mb-6">
      <yn-button variant="primary" loading loading-type="left">提交中</yn-button>
      <yn-button variant="primary" loading loading-type="center">提交中</yn-button>
      <yn-button variant="primary" loading loading-type="right">提交中</yn-button>
    </div>
    <h4 style="margin:0 0 16px;font-size:14px;font-weight:600;">disabled 禁用</h4>
    <div class="yn-flex yn-items-center yn-gap-3 yn-flex-wrap">
      <yn-button variant="primary" disabled>禁用按钮</yn-button>
      <yn-button variant="dark" disabled>禁用按钮</yn-button>
    </div>
  </div>
`;

/** yn-input 完整属性展示 */
export const storyInputPropsDemo = () => html`
  <div style="background:#f2efea;padding:24px;display:flex;flex-direction:column;gap:16px;">
    <div>
      <p style="margin:0 0 8px;font-size:13px;font-weight:600;">基本（无插槽）</p>
      <yn-input placeholder="请输入内容" style=${INPUT_STYLE}></yn-input>
    </div>
    <div>
      <p style="margin:0 0 8px;font-size:13px;font-weight:600;">前缀按钮</p>
      <yn-input placeholder="仅前缀" style=${INPUT_STYLE}>
        <span slot="prefix-button">${unsafeSVG(ynSignpostSvg)}</span>
      </yn-input>
    </div>
    <div>
      <p style="margin:0 0 8px;font-size:13px;font-weight:600;">后缀按钮</p>
      <yn-input placeholder="仅后缀" style=${INPUT_STYLE}>
        <span slot="suffix-button">${unsafeSVG(ynSearchCloseSvg)}</span>
      </yn-input>
    </div>
    <div>
      <p style="margin:0 0 8px;font-size:13px;font-weight:600;">前后置按钮（完整）</p>
      <yn-input placeholder="带自定义前后按钮" style=${INPUT_STYLE}>
        <span slot="prefix-button">${unsafeSVG(ynSignpostSvg)}</span>
        <span slot="suffix-button">${unsafeSVG(ynSearchCloseSvg)}</span>
      </yn-input>
    </div>
    <div>
      <p style="margin:0 0 8px;font-size:13px;font-weight:600;">disabled 禁用</p>
      <yn-input placeholder="已禁用" disabled style=${INPUT_STYLE}></yn-input>
    </div>
  </div>
`;

const COOKIE_NOTICE_STYLE = `position:relative;min-height:520px;background:#f2efea;border-radius:28px;overflow:hidden;`;

/** yn-pick 属性展示 */
export const storyPickPropsDemo = () => html`
  <div style="background:#efede8;padding:24px;display:flex;flex-wrap:wrap;gap:16px;align-items:flex-start;">
    <div>
      <p style="margin:0 0 8px;font-size:13px;font-weight:600;">selected + border 边框动画</p>
      ${storyPickDefault()}
    </div>
    <div>
      <p style="margin:0 0 8px;font-size:13px;font-weight:600;">show-unselected-icon 未选中图标</p>
      <yn-pick value="urban" show-unselected-icon style="--yn-pick-border-width:2px;--yn-pick-border-color:#000;--yn-pick-border-radius:8px;">
        <div
          class="yn-box-border yn-flex yn-h-[100px] yn-w-[180px] yn-items-end yn-rounded-lg yn-bg-[#ef7d53] yn-p-3 yn-text-2xl yn-font-bold yn-text-[#241f21]"
        >
          Urban
        </div>
      </yn-pick>
    </div>
    <div>
      <p style="margin:0 0 8px;font-size:13px;font-weight:600;">border=false 无边框</p>
      <yn-pick value="golf" ?border=${false}>
        <div
          class="yn-flex yn-h-[80px] yn-w-[120px] yn-items-center yn-justify-center yn-rounded-lg yn-bg-[#b8d28a] yn-font-bold yn-text-[#241f21]"
        >
          Golf
        </div>
      </yn-pick>
    </div>
  </div>
`;

/** yn-group-pick 属性展示 */
export const storyGroupPickPropsDemo = () => html`
  <div style="display:flex;flex-direction:column;gap:24px;">
    <div>
      <p style="margin:0 0 12px;font-size:13px;font-weight:600;">单选（默认）</p>
      ${storyGroupPickDefault()}
    </div>
    <div>
      <p style="margin:0 0 12px;font-size:13px;font-weight:600;">multiple 多选 + value 数组</p>
      ${storyGroupPickMultiple()}
    </div>
  </div>
`;

/** yn-toast 属性展示（四种 type + 编程 API） */
export const storyToastPropsDemo = storyToastApi;

/** yn-pull-cord-switch 属性展示 */
export const storyPullCordPropsDemo = () => html`
  <div style="display:flex;flex-direction:column;gap:32px;padding:8px;">
    <div>
      <p style="margin:0 0 12px;font-size:13px;font-weight:600;">default / activated 双插槽</p>
      ${storyPullCordSlots()}
    </div>
    <div>
      <p style="margin:0 0 12px;font-size:13px;font-weight:600;">size: mini / small / medium</p>
      ${storyPullCordSizes()}
    </div>
  </div>
`;

/** yn-cookie-notice 属性展示 */
export const storyCookieNoticePropsDemo = () => html`
  <div style="display:flex;flex-direction:column;gap:24px;">
    <div>
      <p style="margin:0 0 12px;font-size:13px;font-weight:600;">auto-show + auto-show-delay</p>
      ${storyCookieNoticeDefault()}
    </div>
    <div>
      <p style="margin:0 0 12px;font-size:13px;font-weight:600;">visible 受控显示 + 偏好面板</p>
      ${storyCookieNoticeSettings()}
    </div>
  </div>
`;

/** yn-sku-cart-button 属性展示 */
export const storySkuCartButtonPropsDemo = () => html`
  <div style="display:flex;flex-direction:column;gap:32px;">
    ${storySkuCartButtonDefault()}
    ${storySkuCartButtonLoading()}
  </div>
`;

/** yn-cookie-notice Default */
export const storyCookieNoticeDefault = () => html`
  <div style=${COOKIE_NOTICE_STYLE}>
    <yn-cookie-notice storage-key="doc_demo_cookie_v1" auto-show auto-show-delay="300"></yn-cookie-notice>
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:520px;gap:12px;">
      <p style="margin:0;font-size:14px;color:#6f696b;">Cookie 横幅将在 300ms 后自动弹出</p>
      <yn-button variant="default" @click=${(e: Event) => {
        const root = (e.currentTarget as HTMLElement).closest("div");
        const notice = root?.querySelector("yn-cookie-notice") as any;
        notice?.resetConsent?.();
      }}>重置并重新弹出</yn-button>
    </div>
  </div>
`;

/** yn-cookie-notice WithSettings */
export const storyCookieNoticeSettings = () => html`
  <div style=${COOKIE_NOTICE_STYLE}>
    <yn-cookie-notice storage-key="doc_demo_settings_v1" auto-show-delay="999999" visible>
    </yn-cookie-notice>
  </div>
`;

/** yn-sku-cart-button Default */
export const storySkuCartButtonDefault = () => html`
  <div style="display:flex;flex-direction:column;gap:16px;max-width:360px;">
    <p style="margin:0;font-size:13px;font-weight:600;">默认状态</p>
    <yn-sku-cart-button label="ADD TO CART" price="€29.00"></yn-sku-cart-button>
    <p style="margin:0;font-size:13px;font-weight:600;">隐藏图标</p>
    <yn-sku-cart-button label="ADD TO CART" price="€29.00" ?show-cart-icon=${false}></yn-sku-cart-button>
    <p style="margin:0;font-size:13px;font-weight:600;">禁用</p>
    <yn-sku-cart-button label="ADD TO CART" price="€29.00" disabled></yn-sku-cart-button>
  </div>
`;

/** yn-sku-cart-button LoadingModes */
export const storySkuCartButtonLoading = () => html`
  <div style="display:flex;flex-direction:column;gap:16px;max-width:360px;">
    <p style="margin:0;font-size:13px;font-weight:600;">loading-mode="icon"（默认）</p>
    <yn-sku-cart-button label="ADD TO CART" price="€29.00" loading loading-mode="icon"></yn-sku-cart-button>
    <p style="margin:0;font-size:13px;font-weight:600;">loading-mode="overlay"</p>
    <yn-sku-cart-button label="ADD TO CART" price="€29.00" loading loading-mode="overlay"></yn-sku-cart-button>
    <p style="margin:0;font-size:13px;font-weight:600;">loading-text 文案替换</p>
    <yn-sku-cart-button label="ADD TO CART" price="€29.00" loading loading-text="ADDING..."></yn-sku-cart-button>
  </div>
`;

/** yn-sku-cart-button EventLog */
export const storySkuCartButtonEventLog = () => withEventLog(
  html`<yn-sku-cart-button label="ADD TO CART" price="€65.00"></yn-sku-cart-button>`,
  { click: "MouseEvent" }
);

/** yn-cookie-notice EventLog */
export const storyCookieNoticeEventLog = () => withEventLog(
  html`<div style="position:relative;min-height:400px;background:#f2efea;border-radius:20px;overflow:hidden;">
    <yn-cookie-notice storage-key="doc_event_cookie_v1" auto-show auto-show-delay="300"></yn-cookie-notice>
  </div>`,
  { "preference-change": "{ prefs, source, changedKey }" },
  'data-event-root=""'
);

// ── Demo Code Map ──────────────────────────────────────────────
// 每个 demoVariant 对应的 HTML 代码字符串（用于 Show Code 功能）

export const DEMO_CODE_MAP: Record<string, string> = {
  // yn-button
  "yn-button-variants": `<yn-button variant="primary">主色按钮</yn-button>
<yn-button variant="success">成功按钮</yn-button>
<yn-button variant="warning">警告按钮</yn-button>
<yn-button variant="danger">危险按钮</yn-button>
<yn-button variant="neutral">中性色按钮</yn-button>
<yn-button variant="dark">深色按钮</yn-button>
<yn-button variant="default">默认白色</yn-button>`,

  "yn-button-sizes": `<yn-button size="mini" variant="primary">Mini 按钮</yn-button>
<yn-button size="small" variant="primary">Small 按钮</yn-button>
<yn-button size="medium" variant="primary">Medium 按钮</yn-button>`,

  "yn-button-loading": `<yn-button variant="primary" loading loading-type="left">提交中</yn-button>`,

  // yn-icon-button
  "yn-icon-button-click": `<yn-icon-button label="打开购物车" variant="default" @click="handleClick">
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path fill="currentColor" d="M8.9 7.5C8.9 6.28 9.88 5.3 11.1 5.3H12.9C14.11 5.3 15.1 6.28 15.1 7.5"/>
  </svg>
</yn-icon-button>`,

  "yn-icon-button-variants": `<yn-icon-button label="default" variant="default">${ICON_BUTTON_SVG_SNIPPET}</yn-icon-button>
<yn-icon-button label="filled" variant="filled">${ICON_BUTTON_SVG_SNIPPET}</yn-icon-button>
<yn-icon-button label="primary" variant="primary">${ICON_BUTTON_SVG_SNIPPET}</yn-icon-button>
<yn-icon-button label="tonal" variant="tonal">${ICON_BUTTON_SVG_SNIPPET}</yn-icon-button>
<yn-icon-button label="outlined" variant="outlined">${ICON_BUTTON_SVG_SNIPPET}</yn-icon-button>
<yn-icon-button label="danger" variant="danger">${ICON_BUTTON_SVG_SNIPPET}</yn-icon-button>
<yn-icon-button label="success" variant="success">${ICON_BUTTON_SVG_SNIPPET}</yn-icon-button>
<yn-icon-button label="inverse" variant="inverse">${ICON_BUTTON_SVG_SNIPPET}</yn-icon-button>`,

  "yn-icon-button-sizes": `<yn-icon-button size="small" label="small" variant="primary">${ICON_BUTTON_SVG_SNIPPET}</yn-icon-button>
<yn-icon-button size="medium" label="medium" variant="primary">${ICON_BUTTON_SVG_SNIPPET}</yn-icon-button>
<yn-icon-button size="large" label="large" variant="primary">${ICON_BUTTON_SVG_SNIPPET}</yn-icon-button>`,

  "yn-icon-button-props-demo": `<yn-icon-button label="primary" variant="primary">${ICON_BUTTON_SVG_SNIPPET}</yn-icon-button>
<yn-icon-button label="禁用" variant="primary" disabled>${ICON_BUTTON_SVG_SNIPPET}</yn-icon-button>
<yn-icon-button label="账户" href="/account" variant="default">${ICON_BUTTON_SVG_SNIPPET}</yn-icon-button>
<yn-icon-button label="无热区" variant="default" ?hit-slop=\${false}>${ICON_BUTTON_SVG_SNIPPET}</yn-icon-button>
<yn-icon-button
  label="自定义配色"
  style="--yn-icon-button-bg:#eef2ff;--yn-icon-button-hover-bg:#c7d2fe;--yn-icon-button-color:#3730a3;"
>${ICON_BUTTON_SVG_SNIPPET}</yn-icon-button>`,

  // yn-input
  "yn-input-default": `<yn-input placeholder="请输入内容"></yn-input>`,

  "yn-input-prefix": `<yn-input placeholder="仅前缀按钮">
  <span slot="prefix-button">⌘</span>
</yn-input>`,

  "yn-input-suffix": `<yn-input placeholder="仅后缀按钮">
  <span slot="suffix-button">×</span>
</yn-input>`,

  "yn-input-slotted": `<yn-input placeholder="带自定义前后按钮">
  <span slot="prefix-button">⌘</span>
  <span slot="suffix-button">×</span>
</yn-input>`,

  // yn-icon-connect-button
  "yn-icon-connect-sizes": `<yn-icon-connect-button label="BUTTON" size="mini"></yn-icon-connect-button>
<yn-icon-connect-button label="BUTTON" size="small"></yn-icon-connect-button>
<yn-icon-connect-button label="BUTTON" size="normal"></yn-icon-connect-button>`,

  // yn-navigation
  "yn-navigation-controlled": `<yn-navigation
  .items=${'{ PRODUTOS: "/produtos", SOBRE: "/sobre" }'}
  active="PRODUTOS"
  aria-label="Primary navigation"
></yn-navigation>`,

  "yn-navigation-dark": `<yn-navigation
  .items=${'{ PRODUTOS: "/produtos", SOBRE: "/sobre" }'}
  active="PRODUTOS"
  style="--yn-navigation-fill-color:#1a1a1a;--yn-navigation-text-color:#fff;"
></yn-navigation>`,

  "yn-navigation-seo": `<yn-navigation
  .items=${'{ PRODUTOS: "/produtos", SOBRE: "/sobre" }'}
  active="PRODUTOS"
  seo-mode
  aria-label="Primary navigation"
></yn-navigation>`,

  // yn-search
  "yn-search-default": `<yn-search placeholder="O que estás à procura?">
  <datalist>
    <option value="Sofa"></option>
    <option value="Table"></option>
  </datalist>
</yn-search>`,

  "yn-search-expand-right": `<div style="display:flex;align-items:center;gap:12px;width:fit-content;">
  <yn-search expand-direction="right" input-width="240" placeholder="Search"></yn-search>
  <button type="button">Cart</button>
  <span>Menu</span>
</div>`,

  "yn-search-expand-left": `<div style="display:flex;align-items:center;justify-content:flex-end;gap:12px;width:fit-content;margin-left:auto;">
  <span>Brand</span>
  <yn-search expand-direction="left" input-width="240" placeholder="Search"></yn-search>
</div>`,

  "yn-search-default-open": `<yn-search open input-width="240" placeholder="O que estás à procura?"></yn-search>`,

  "yn-dropdown-props-demo": `<yn-dropdown placement="bottom-start">
  <yn-button variant="default">筛选条件</yn-button>
  <div slot="content">
    <yn-group-pick>
      <yn-pick value="Nature">Nature</yn-pick>
    </yn-group-pick>
  </div>
</yn-dropdown>

<yn-dropdown placement="right-start">
  <yn-button variant="default">更多选项</yn-button>
  <svg slot="close-icon" width="24" height="24" viewBox="0 0 24 24">...</svg>
  <div slot="content">Panel content</div>
</yn-dropdown>`,

  "yn-icon-connect-props-demo": `<yn-icon-connect-button label="BUTTON" size="mini"></yn-icon-connect-button>
<yn-icon-connect-button label="BUTTON" size="small"></yn-icon-connect-button>
<yn-icon-connect-button label="BUTTON" size="normal"></yn-icon-connect-button>
<yn-icon-connect-button label="VIEW PRODUCTS" size="normal" link="/products"></yn-icon-connect-button>
<yn-icon-connect-button label="DISABLED" size="normal" disabled></yn-icon-connect-button>`,

  "yn-drawer-slots": `<yn-drawer placement="auto" sheet-height="auto" width="420">
  <yn-button slot="trigger" variant="default" drawer-payload='{"scene":"cart"}'>购物车</yn-button>
  <span slot="header">Your bag</span>
  <div slot="header-actions"><!-- 头部操作 --></div>
  <div slot="content">Drawer content</div>
  <div slot="footer">Footer actions</div>
</yn-drawer>`,

  // yn-pick
  "yn-pick-color-card": `<yn-pick value="nature">
  <div style="padding:12px 20px;background:#d5c29f;border-radius:8px;font-size:18px;font-weight:bold;">
    Nature
  </div>
</yn-pick>`,

  "yn-pick-image-card": `<yn-pick value="nature">
  <img src="image.jpg" alt="Nature" style="width:180px;height:100px;object-fit:cover;border-radius:8px;"/>
</yn-pick>`,

  // yn-group-pick
  "yn-group-pick-cards": `<yn-group-pick>
  <yn-pick value="Golf">
    <div style="padding:8px 16px;background:#b8d28a;border-radius:8px;font-weight:bold;">Golf</div>
  </yn-pick>
  <yn-pick value="Urban">
    <div style="padding:8px 16px;background:#ef7d53;border-radius:8px;font-weight:bold;">Urban</div>
  </yn-pick>
</yn-group-pick>`,

  "yn-group-pick-multiple": `<yn-group-pick multiple value=${'["Urban", "Nature"]'}>
  <yn-pick value="Golf">
    <div style="padding:8px 16px;background:#b8d28a;border-radius:8px;font-weight:bold;">Golf</div>
  </yn-pick>
  <yn-pick value="Urban">
    <div style="padding:8px 16px;background:#ef7d53;border-radius:8px;font-weight:bold;">Urban</div>
  </yn-pick>
</yn-group-pick>`,

  // yn-dropdown
  "yn-dropdown-default": `<yn-dropdown placement="bottom-start">
  <yn-button variant="default">筛选条件</yn-button>
  <div slot="content">
    <!-- dropdown content -->
  </div>
</yn-dropdown>`,

  "yn-dropdown-custom-close": `<yn-dropdown placement="right-start">
  <yn-button variant="default">更多选项</yn-button>
  <svg slot="close-icon" width="24" height="24" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10.5" stroke="#241f21"/>
    <path d="M8 8L16 16M16 8L8 16" stroke="#241f21" stroke-width="1.8"/>
  </svg>
  <div slot="content">
    <!-- dropdown content -->
  </div>
</yn-dropdown>`,

  // yn-dropdown-pick
  "yn-dropdown-pick-default": `<yn-dropdown-pick
  value="en"
  value-field="id"
  button-display-field="code"
  placeholder="Language"
>
  <yn-pick value="en" data-node='{"id":"en","label":"English"}'>
    <div style="padding:8px 12px;">English</div>
  </yn-pick>
  <yn-pick value="pt" data-node='{"id":"pt","label":"Português"}'>
    <div style="padding:8px 12px;">Português</div>
  </yn-pick>
</yn-dropdown-pick>`,

  // yn-quantity
  "yn-quantity-product": `<yn-quantity value="1" min="1" max="99"></yn-quantity>`,

  // yn-sku-selector
  "yn-sku-default": `<yn-sku-selector\n  .skus=\${skusArray}\n  currency="€"\n  submit-label="ADD TO CART"\n  pick-one\n></yn-sku-selector>`,

  "yn-sku-simple": `<yn-sku-selector\n  .skus=\${skusArray}\n  currency="€"\n  submit-label="ADD TO CART"\n  simple\n></yn-sku-selector>`,

  // yn-checkout-address
  "yn-checkout-address-default": `<yn-checkout-address locale="en"></yn-checkout-address>`,

  // yn-drawer
  "yn-drawer-cart": `<yn-drawer placement="auto" sheet-height="auto" width="420">
  <yn-button slot="trigger" variant="default">购物车</yn-button>
  <span slot="header" class="yn-text-sm yn-font-bold">Your bag</span>
  <div slot="content">
    <!-- drawer content -->
  </div>
</yn-drawer>`,

  "yn-drawer-desktop": `<yn-drawer placement="auto" sheet-height="auto" width="420">
  <yn-button slot="trigger" variant="default">购物车</yn-button>
  <span slot="header" class="yn-text-sm yn-font-bold">Your bag</span>
  <div slot="content">
    <!-- drawer content -->
  </div>
</yn-drawer>`,

  // yn-toast
  "yn-toast-api": `<yn-toast type="success" message="success!"></yn-toast>

<!-- 在 JS 中调用 -->
<script>
  toast.success('saved successfully');
  toast.info('info message');
  toast.warning('warning!');
  toast.error('error!');
</script>`,

  // yn-pull-cord-switch
  "yn-pull-cord-slots": `<yn-pull-cord-switch rope-length="260" variant="default">
  <yn-button size="mini" variant="neutral">夜间</yn-button>
  <yn-button slot="activated" size="mini" variant="success">日间</yn-button>
</yn-pull-cord-switch>`,

  "yn-pull-cord-sizes": `<yn-pull-cord-switch size="mini" rope-length="260" variant="default">
  <yn-button size="mini" variant="neutral">mini</yn-button>
</yn-pull-cord-switch>

<yn-pull-cord-switch size="small" rope-length="260" variant="default">
  <yn-button size="mini" variant="neutral">small</yn-button>
</yn-pull-cord-switch>

<yn-pull-cord-switch size="medium" rope-length="260" variant="default">
  <yn-button size="mini" variant="neutral">medium</yn-button>
</yn-pull-cord-switch>`,

  "yn-pull-cord-fixed-header": `<yn-pull-cord-switch
  fixed
  reverse
  glow-up
  rope-pass-through
  size="mini"
  rope-length="220"
  fixed-x="-12"
  top="52"
  z-index="101"
  variant="default"
>
  <yn-button size="mini" variant="default">日间</yn-button>
  <yn-button slot="activated" size="mini" variant="success">夜间</yn-button>
</yn-pull-cord-switch>`,

  // yn-cookie-notice
  "yn-cookie-notice-default": `<yn-cookie-notice
  storage-key="consent_v1"
  auto-show
  auto-show-delay="1000"
></yn-cookie-notice>`,

  "yn-cookie-notice-settings": `<yn-cookie-notice
  storage-key="consent_v1"
  auto-show-delay="999999"
  visible
></yn-cookie-notice>`,

  // yn-sku-cart-button
  "yn-sku-cart-button-default": `<yn-sku-cart-button label="ADD TO CART" price="€29.00"></yn-sku-cart-button>

<!-- 隐藏图标 -->
<yn-sku-cart-button label="ADD TO CART" price="€29.00" show-cart-icon="false"></yn-sku-cart-button>

<!-- 禁用 -->
<yn-sku-cart-button label="ADD TO CART" price="€29.00" disabled></yn-sku-cart-button>`,

  "yn-sku-cart-button-loading": `<yn-sku-cart-button label="ADD TO CART" price="€29.00" loading loading-mode="icon"></yn-sku-cart-button>

<yn-sku-cart-button label="ADD TO CART" price="€29.00" loading loading-mode="overlay"></yn-sku-cart-button>

<yn-sku-cart-button label="ADD TO CART" price="€29.00" loading loading-text="ADDING..."></yn-sku-cart-button>`,

  // ── Event log variants ──────────────────────────
  "yn-button-props-demo": `<yn-button variant="primary">主色</yn-button>
<yn-button variant="success">成功</yn-button>
<yn-button variant="warning">警告</yn-button>
<yn-button variant="danger">危险</yn-button>
<yn-button variant="neutral">中性</yn-button>
<yn-button variant="dark">深色</yn-button>
<yn-button variant="default" hit-slop>默认</yn-button>
<yn-button loading loading-type="center">加载中</yn-button>`,

  "yn-button-event-log": `<!-- 模板 -->
<yn-button variant="primary" @click=${'{onClick}'}>点击我</yn-button>

<!-- 事件处理 -->
<script>
  function onClick(event) {
    // event: MouseEvent
    console.log('按钮被点击', event);
  }
</script>`,

  "yn-icon-button-event-log": `<!-- 模板 -->
<yn-icon-button label="购物车" variant="default" @click=${'{onClick}'}>
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path fill="currentColor" d="M8.9 7.5C8.9 6.28 9.88 5.3 11.1 5.3H12.9C14.11 5.3 15.1 6.28 15.1 7.5"/>
  </svg>
</yn-icon-button>

<!-- 事件处理 -->
<script>
  function onClick(event) {
    // event: MouseEvent
    console.log('图标按钮被点击', event);
  }
</script>`,

  "yn-input-props-demo": `<yn-input placeholder="请输入内容"></yn-input>
<yn-input variant="floating" label="邮箱" type="email" required></yn-input>
<yn-input placeholder="搜索" error error-message="必填">
  <span slot="suffix-button">×</span>
</yn-input>`,

  "yn-input-event-log": `<!-- 模板 -->
<yn-input placeholder="输入内容查看事件..." @yn-input=${'{onInput}'} @yn-prefix-click=${'{onPrefix}'} @yn-suffix-click=${'{onSuffix}'}>
  <span slot="prefix-button">⌘</span>
  <span slot="suffix-button">×</span>
</yn-input>

<!-- 事件处理 -->
<script>
  function onInput(event) {
    // event.detail: { value: string }
    console.log('输入值变化:', event.detail.value);
  }
  function onPrefix(event) {
    // 前缀按钮点击
    console.log('前缀按钮被点击');
  }
  function onSuffix(event) {
    // 后缀按钮点击
    console.log('后缀按钮被点击');
  }
</script>`,

  "yn-pick-event-log": `<!-- 模板 -->
<yn-pick value="nature" @toggle=${'{onToggle}'}>
  <div style="padding:12px 20px;background:#d5c29f;border-radius:8px;font-size:18px;font-weight:bold;">Nature</div>
</yn-pick>

<!-- 事件处理 -->
<script>
  function onToggle(event) {
    // event.detail: { id: string, flag: boolean }
    console.log('选项切换:', event.detail.id, '选中:', event.detail.flag);
  }
</script>`,

  "yn-group-pick-event-log": `<!-- 模板 -->
<yn-group-pick @change=${'{onChange}'}>
  <yn-pick value="Golf">
    <div style="padding:8px 16px;background:#b8d28a;border-radius:8px;font-weight:bold;">Golf</div>
  </yn-pick>
  <yn-pick value="Urban">
    <div style="padding:8px 16px;background:#ef7d53;border-radius:8px;font-weight:bold;">Urban</div>
  </yn-pick>
</yn-group-pick>

<!-- 事件处理 -->
<script>
  function onChange(event) {
    // event.detail: { ids: string[], flag: boolean }
    console.log('选中项变化:', event.detail.ids, '选中:', event.detail.flag);
  }
</script>`,

  "yn-navigation-event-log": `<!-- 模板 -->
<yn-navigation
  .items=${'{ PRODUTOS: "/produtos", SOBRE: "/sobre" }'}
  active="PRODUTOS"
  @click=${'{onNavClick}'}
></yn-navigation>

<!-- 事件处理 -->
<script>
  function onNavClick(event) {
    // event: MouseEvent，通过 event.target 获取点击的导航项
    const item = event.target.closest('yn-navigation')?.active;
    console.log('导航切换:', item);
  }
</script>`,

  "yn-search-event-log": `<!-- 模板 -->
<yn-search placeholder="搜索..." @input=${'{onInput}'} @enter=${'{onEnter}'}>
  <datalist>
    <option value="Sofa"></option>
    <option value="Table"></option>
  </datalist>
</yn-search>

<!-- 事件处理 -->
<script>
  function onInput(event) {
    // event.detail: { value: string }
    console.log('搜索输入:', event.detail.value);
  }
  function onEnter(event) {
    // event.detail: { value: string }
    console.log('搜索提交:', event.detail.value);
  }
</script>`,

  "yn-dropdown-event-log": `<!-- 模板 -->
<yn-dropdown placement="bottom-start" @open-change=${'{onOpenChange}'}>
  <yn-button variant="default">筛选条件</yn-button>
  <div slot="content">Dropdown content</div>
</yn-dropdown>

<!-- 事件处理 -->
<script>
  function onOpenChange(event) {
    // event.detail: { open: boolean; placement: string }
    console.log('下拉状态:', event.detail.open ? '打开' : '关闭', '方向:', event.detail.placement);
  }
</script>`,

  "yn-dropdown-pick-event-log": `<!-- 模板 -->
<yn-dropdown-pick
  value="en"
  value-field="id"
  button-display-field="code"
  placeholder="Language"
  @change=${'{onChange}'}
>
  <yn-pick value="en" data-node='{"id":"en","label":"English"}'>
    <div style="padding:8px 12px;">English</div>
  </yn-pick>
  <yn-pick value="pt" data-node='{"id":"pt","label":"Português"}'>
    <div style="padding:8px 12px;">Português</div>
  </yn-pick>
</yn-dropdown-pick>

<!-- 事件处理 -->
<script>
  function onChange(event) {
    // event.detail: { id: string }
    console.log('选中语言:', event.detail.id);
  }
</script>`,

  "yn-quantity-event-log": `<!-- 模板 -->
<yn-quantity value="1" min="1" max="99" @change=${'{onChange}'}></yn-quantity>

<!-- 事件处理 -->
<script>
  function onChange(event) {
    // event.detail: { value: number }
    console.log('数量变化:', event.detail.value);
  }
</script>`,

  "yn-sku-event-log": `<!-- 模板 -->
<yn-sku-selector
  .skus=${'{skusArray}'}
  currency="€"
  submit-label="ADD TO CART"
  @submit=${'{onSubmit}'}
  @change=${'{onChange}'}
></yn-sku-selector>

<!-- 事件处理 -->
<script>
  function onChange(event) {
    // event.detail: { selections: object, sku: object|null, ready: boolean, missingKeys: string[] }
    console.log('规格变化:', event.detail.selections, '已选齐:', event.detail.ready);
  }
  function onSubmit(event) {
    // event.detail: { selections: object, sku: object } + instance.done()
    console.log('加购提交:', event.detail.sku);
    event.detail.instance.done();
  }
</script>`,

  "yn-drawer-event-log": `<!-- 模板 -->
<yn-drawer placement="auto" sheet-height="auto" width="420" @open-change=${'{onOpenChange}'}>
  <yn-button slot="trigger" variant="default">购物车</yn-button>
  <span slot="header">Your bag</span>
  <div slot="content">Drawer content</div>
</yn-drawer>

<!-- 事件处理 -->
<script>
  function onOpenChange(event) {
    // event.detail: { open: boolean; source: string; payload?: any }
    console.log('抽屉状态:', event.detail.open ? '打开' : '关闭', '来源:', event.detail.source);
  }
</script>`,

  "yn-toast-event-log": `<!-- 模板 -->
<yn-button variant="primary" @click=${'{showToast}'}>触发 Toast</yn-button>

<!-- 事件处理 -->
<script>
  function showToast(event) {
    // 调用 toast 方法
    const toast = document.querySelector('yn-toast');
    toast.success('保存成功');
    toast.info('提示信息');
    toast.warning('警告信息');
    toast.error('错误信息');
  }
</script>`,

  "yn-pull-cord-event-log": `<!-- 模板 -->
<yn-pull-cord-switch rope-length="260" variant="default" @change=${'{onChange}'}>
  <yn-button size="mini" variant="neutral">夜间</yn-button>
  <yn-button slot="activated" size="mini" variant="success">日间</yn-button>
</yn-pull-cord-switch>

<!-- 事件处理 -->
<script>
  function onChange(event) {
    // event.detail: { checked: boolean }
    console.log('开关状态:', event.detail.checked ? '开启' : '关闭');
  }
</script>`,

  "yn-checkout-address-event-log": `<!-- 模板 -->
<yn-checkout-address locale="en" @change=${'{onChange}'}></yn-checkout-address>

<!-- 事件处理 -->
<script>
  function onChange(event) {
    // event.detail: { value: object, validation: object, changedFields: string[] }
    console.log('地址变化:', event.detail.value, '校验:', event.detail.validation);
  }
</script>`,

  "yn-icon-connect-event-log": `<!-- 模板 -->
<yn-icon-connect-button label="BUTTON" size="normal" @click=${'{onClick}'}></yn-icon-connect-button>

<!-- 事件处理 -->
<script>
  function onClick(event) {
    // event: MouseEvent
    console.log('连接按钮被点击', event);
  }
</script>`,

  "yn-cookie-notice-event-log": `<!-- 模板 -->
<yn-cookie-notice
  storage-key="consent_v1"
  auto-show
  auto-show-delay="1000"
  @preference-change=${'{onPreferenceChange}'}
></yn-cookie-notice>

<!-- 事件处理 -->
<script>
  function onPreferenceChange(event) {
    // event.detail: { functional: boolean, analytics: boolean, marketing: boolean }
    console.log('偏好设置变化:', event.detail);
  }
</script>`,

  "yn-sku-cart-button-event-log": `<!-- 模板 -->
<yn-sku-cart-button label="ADD TO CART" price="€29.00" @click=${'{onClick}'}></yn-sku-cart-button>

<!-- 事件处理 -->
<script>
  function onClick(event) {
    // event: MouseEvent
    console.log('加购按钮被点击', event);
  }
</script>`,

  "yn-dropdown-pick-props-demo": `<yn-dropdown-pick value="en" button-display-field="code" placeholder="Language">
  <yn-pick value="en" data-node='{"id":"en","code":"EN","label":"English"}'>EN</yn-pick>
  <yn-pick value="pt" data-node='{"id":"pt","code":"PT","label":"Português"}'>PT</yn-pick>
</yn-dropdown-pick>

<yn-dropdown-pick value="en" disabled button-display-field="code">
  ...
</yn-dropdown-pick>`,

  "yn-quantity-props-demo": `<yn-quantity value="1" min="1" max="99"></yn-quantity>
<yn-quantity value="5" min="1" max="5"></yn-quantity>
<yn-quantity value="2" min="2" max="10" step="2"></yn-quantity>
<yn-quantity value="3" disabled></yn-quantity>`,

  "yn-checkout-address-props-demo": `<yn-checkout-address locale="zh-CN" show-email show-whatsapp email-required></yn-checkout-address>
<yn-checkout-address locale="en"></yn-checkout-address>`,

  "yn-sku-props-demo": `<yn-sku-selector .skus=\${skusArray} currency="€" pick-one submit-label="ADD TO CART"></yn-sku-selector>
<yn-sku-selector .skus=\${skusArray} currency="€" simple submit-label="ADD TO CART"></yn-sku-selector>`,

  "yn-pick-props-demo": `<yn-pick value="nature" selected border>
  <div style="background:#d5c29f;padding:12px;border-radius:8px;">Nature</div>
</yn-pick>
<yn-pick value="urban" show-unselected-icon border>...</yn-pick>
<yn-pick value="golf" ?border=\${false}>...</yn-pick>`,

  "yn-group-pick-props-demo": `<yn-group-pick>
  <yn-pick value="Golf">Golf</yn-pick>
  <yn-pick value="Urban">Urban</yn-pick>
</yn-group-pick>

<yn-group-pick multiple .value=\${["Urban", "Nature"]}>
  ...
</yn-group-pick>`,

  "yn-toast-props-demo": `<yn-toast type="success" message="success!"></yn-toast>

<yn-button @click=\${() => YnToast.success('保存成功')}>Success</yn-button>
<yn-button @click=\${() => YnToast.info('提示')}>Info</yn-button>
<yn-button @click=\${() => YnToast.warning('警告')}>Warning</yn-button>
<yn-button @click=\${() => YnToast.error('错误')}>Error</yn-button>`,

  "yn-pull-cord-props-demo": `<yn-pull-cord-switch rope-length="260" variant="default">
  <yn-button size="mini" variant="neutral">夜间</yn-button>
  <yn-button slot="activated" size="mini" variant="success">日间</yn-button>
</yn-pull-cord-switch>

<yn-pull-cord-switch size="mini" rope-length="260">...</yn-pull-cord-switch>
<yn-pull-cord-switch size="small" rope-length="260">...</yn-pull-cord-switch>
<yn-pull-cord-switch size="medium" rope-length="260">...</yn-pull-cord-switch>`,

  "yn-cookie-notice-props-demo": `<yn-cookie-notice storage-key="consent_v1" auto-show auto-show-delay="1000"></yn-cookie-notice>

<yn-cookie-notice storage-key="consent_v1" visible></yn-cookie-notice>`,

  "yn-sku-cart-button-props-demo": `<yn-sku-cart-button label="ADD TO CART" price="€29.00"></yn-sku-cart-button>
<yn-sku-cart-button label="ADD TO CART" price="€29.00" show-cart-icon="false"></yn-sku-cart-button>
<yn-sku-cart-button label="ADD TO CART" price="€29.00" disabled></yn-sku-cart-button>
<yn-sku-cart-button label="ADD TO CART" price="€29.00" loading loading-mode="icon"></yn-sku-cart-button>
<yn-sku-cart-button label="ADD TO CART" price="€29.00" loading loading-mode="overlay"></yn-sku-cart-button>`
};

/** 获取 demoVariant 对应的代码字符串 */
export function getDemoCode(variant: string): string | undefined {
  return DEMO_CODE_MAP[variant];
}
