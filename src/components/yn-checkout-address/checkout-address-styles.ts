import { css } from "lit";

/**
 * 结账地址 — Floema 配色 + Flutter 式上浮 label
 * 参考 https://www.floema.com/（暖灰底、#241f21 字；主色默认偏灰褐，避免过艳橙）
 */
export const checkoutAddressFormStyles = css`
  :host {
    display: block;
    min-width: 0;
    max-width: 100%;
    background: var(--yn-checkout-address-bg, transparent);
    color: var(--yn-checkout-address-color, var(--flo-on-surface, #241f21));
    font-family: inherit;
    /* Floema palette（可用 --yn-checkout-address-* 覆盖） */
    --flo-bg: var(--yn-checkout-address-bg-muted, #f2efea);
    --flo-surface: var(--yn-checkout-address-surface, #f9f8f6);
    --flo-card: var(--yn-checkout-address-card-bg, #ffffff);
    --flo-primary: var(--yn-checkout-address-primary, #8a7468);
    --flo-primary-hover: var(--yn-color-primary-hover, #75655a);
    --flo-primary-soft: color-mix(in srgb, var(--flo-primary) 12%, transparent);
    --flo-on-surface: var(--yn-checkout-address-color, #241f21);
    --flo-muted: var(--yn-checkout-address-label, #7a716d);
    --flo-outline: var(--yn-checkout-address-outline, #d2cdc4);
    --flo-outline-strong: var(--yn-checkout-address-outline-strong, #beb9b0);
    --flo-divider: var(--yn-checkout-address-divider, #ebe7df);
    --flo-error: var(--yn-color-error, #9a4f43);
    --flo-shadow: var(
      --yn-color-shadow-sm,
      0 1px 2px rgba(36, 31, 33, 0.05),
      0 2px 8px rgba(36, 31, 33, 0.06)
    );
    --flo-radius-card: var(--yn-checkout-address-radius, 12px);
    --flo-radius-field: 8px;
    --flo-field-min-height: var(--yn-checkout-address-field-height, 56px);
    --flo-label-rest: 1rem;
    --flo-label-float: 0.75rem;
  }

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  .stack {
    display: grid;
    gap: 16px;
    min-width: 0;
    padding: var(--yn-checkout-address-padding, 0);
  }

  .layer[hidden] {
    display: none !important;
  }

  .layer-manual {
    display: grid;
    gap: 16px;
    min-width: 0;
  }

  .checkout-step,
  .checkout-card {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 20px;
    border-radius: var(--flo-radius-card);
    border: 1px solid var(--flo-divider);
    background: var(--flo-card);
    box-shadow: var(--flo-shadow);
    min-width: 0;
  }

  .checkout-step--region {
    gap: 20px;
  }

  .step-header {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    min-width: 0;
  }

  .step-header--inset {
    padding-top: 12px;
    border-top: 1px solid var(--flo-divider);
    margin-top: 4px;
  }

  .step-header__body {
    flex: 1;
    min-width: 0;
  }

  .step-badge {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: color-mix(in srgb, var(--flo-primary) 10%, var(--flo-card));
    color: var(--flo-primary);
    font-size: 0.8125rem;
    font-weight: 600;
    line-height: 1;
  }

  .step-title {
    margin: 0;
    font-size: 1.0625rem;
    font-weight: 500;
    line-height: 1.35;
    color: var(--flo-on-surface);
  }

  .step-lead {
    margin: 6px 0 0;
    font-size: 0.875rem;
    line-height: 1.5;
    color: var(--flo-muted);
  }

  .step-lead--inline {
    margin: 0 0 12px;
  }

  .region-chip {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--flo-divider);
    min-width: 0;
  }

  .region-chip__body {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    flex: 1;
    min-width: 0;
  }

  .region-chip__step {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: color-mix(in srgb, var(--flo-primary) 12%, transparent);
    color: var(--flo-primary);
    font-size: 0.75rem;
    font-weight: 600;
  }

  .region-chip__text {
    flex: 1;
    min-width: 0;
  }

  .region-chip__label {
    display: block;
    margin-bottom: 4px;
    font-size: var(--flo-label-float);
    font-weight: 500;
    color: var(--flo-muted);
  }

  .region-chip__value {
    margin: 0;
    font-size: 0.9375rem;
    line-height: 1.45;
    color: var(--flo-on-surface);
    overflow-wrap: anywhere;
    word-break: break-word;
  }

  .region-chip__edit {
    flex-shrink: 0;
    padding: 6px 10px;
    border: 0;
    border-radius: var(--flo-radius-field);
    background: transparent;
    color: var(--flo-primary);
    font: inherit;
    font-size: 0.8125rem;
    font-weight: 500;
    cursor: pointer;
  }

  .region-chip__edit:hover:not(:disabled) {
    background: color-mix(in srgb, var(--flo-primary) 10%, transparent);
  }

  .region-chip__edit:focus-visible {
    outline: 2px solid var(--flo-primary);
    outline-offset: 2px;
  }

  .region-chip__edit:disabled {
    opacity: 0.38;
    cursor: not-allowed;
  }

  .field-stack {
    display: flex;
    flex-direction: column;
    gap: 14px;
    min-width: 0;
  }

  .field-helper {
    margin: 4px 0 0 12px;
    font-size: 0.75rem;
    line-height: 1.4;
    color: var(--flo-muted);
  }

  .panel-title {
    margin: 0;
    font-size: 1.0625rem;
    font-weight: 500;
    line-height: 1.4;
    color: var(--flo-on-surface);
  }

  .banner--hint {
    margin: 0;
  }

  .manual-region .grid-3 {
    margin-top: 4px;
  }

  .banner {
    padding: 14px 16px;
    border-radius: var(--flo-radius-card);
    border: 1px solid var(--flo-divider);
    background: var(--flo-surface);
    color: var(--flo-muted);
    font-size: 0.875rem;
    line-height: 1.5;
    word-break: break-word;
  }

  .banner--warn {
    border-color: color-mix(in srgb, var(--yn-color-warning, #a68b6b) 35%, transparent);
    background: color-mix(in srgb, var(--yn-color-warning, #b87d55) 10%, var(--flo-card));
  }

  .visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  /* —— Material Outlined：label 上浮到顶边并“切开”描边 —— */
  .float-field {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
  }

  .float-field__control {
    position: relative;
    display: flex;
    align-items: stretch;
    min-height: var(--flo-field-min-height);
    border: 1px solid var(--flo-outline);
    border-radius: var(--flo-radius-field);
    background: var(--flo-card);
    /* 焦点态用外圈 box-shadow 模拟 2px 描边，避免 border-width 变化挤动布局 */
    box-shadow: 0 0 0 0 transparent;
    transition:
      border-color 200ms cubic-bezier(0.4, 0, 0.2, 1),
      box-shadow 200ms cubic-bezier(0.4, 0, 0.2, 1);
  }

  .float-field__control:hover:not(:has(input:disabled)):not(:has(textarea:disabled)) {
    border-color: var(--flo-outline-strong);
  }

  .float-field__control:focus-within {
    border-color: var(--flo-primary);
    box-shadow: 0 0 0 1px var(--flo-primary);
  }

  .float-field__control--invalid,
  .float-field__control:has(.input--invalid) {
    border-color: var(--flo-error);
  }

  .float-field__control--invalid:focus-within,
  .float-field__control:has(.input--invalid:focus-within) {
    border-color: var(--flo-error);
    box-shadow: 0 0 0 1px var(--flo-error);
  }

  .float-field__inner {
    position: relative;
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: center;
  }

  .float-field__input,
  .float-field__textarea,
  .float-field__control > input,
  .float-field__control > textarea {
    flex: 1;
    width: 100%;
    min-width: 0;
    height: auto;
    min-height: calc(var(--flo-field-min-height) - 2px);
    margin: 0;
    padding: 16px;
    border: 0;
    border-radius: calc(var(--flo-radius-field) - 2px);
    background: transparent;
    color: var(--flo-on-surface);
    font: inherit;
    font-size: var(--flo-label-rest);
    line-height: 1.5;
    outline: none;
    box-shadow: none;
  }

  /* 静止：label 在框内居中 */
  .float-field__label {
    position: absolute;
    z-index: 1;
    left: 12px;
    top: 50%;
    margin: 0;
    max-width: calc(100% - 24px);
    padding: 0 4px;
    font-size: var(--flo-label-rest);
    font-weight: 400;
    line-height: 1.2;
    color: var(--flo-muted);
    background: transparent;
    pointer-events: none;
    transform: translateY(-50%);
    transform-origin: left center;
    transition:
      top 200ms cubic-bezier(0.4, 0, 0.2, 1),
      transform 200ms cubic-bezier(0.4, 0, 0.2, 1),
      font-size 200ms cubic-bezier(0.4, 0, 0.2, 1),
      color 200ms cubic-bezier(0.4, 0, 0.2, 1),
      background-color 200ms cubic-bezier(0.4, 0, 0.2, 1);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .float-field__required {
    color: inherit;
  }

  /* 多行备注：label 始终在顶边切口（避免空态时 label 垂直居中显得空荡） */
  .float-field--multiline .float-field__control--textarea {
    align-items: stretch;
    min-height: 0;
  }

  .float-field--multiline .float-field__control--textarea > .float-field__label {
    left: 10px;
    top: 0;
    max-width: calc(100% - 20px);
    transform: translateY(-50%) scale(0.92);
    font-size: var(--flo-label-float);
    color: var(--flo-muted);
    background: var(--flo-card);
  }

  .float-field--multiline .float-field__control--textarea:focus-within > .float-field__label {
    color: var(--flo-primary);
  }

  .float-field--multiline .float-field__textarea {
    display: block;
    width: 100%;
    min-height: 96px;
    max-height: min(220px, 40dvh);
    margin: 0;
    padding: 22px 14px 12px;
    resize: vertical;
    line-height: 1.5;
  }

  /* 上浮：label 坐在顶边上，背景遮住描边 */
  .float-field__control:focus-within > .float-field__label,
  .float-field__control:has(> input:not(:placeholder-shown)) > .float-field__label,
  .float-field__control:has(> textarea:not(:placeholder-shown)) > .float-field__label,
  .float-field__control:has(.float-field__input:not(:placeholder-shown)) > .float-field__label,
  .float-field__control:has(.float-field__textarea:not(:placeholder-shown)) > .float-field__label,
  .float-field__input:focus ~ .float-field__label,
  .float-field__input:not(:placeholder-shown) ~ .float-field__label,
  .float-field__textarea:focus ~ .float-field__label,
  .float-field__textarea:not(:placeholder-shown) ~ .float-field__label {
    top: 0;
    transform: translateY(-50%) scale(0.92);
    font-size: var(--flo-label-float);
    color: var(--flo-primary);
    background: var(--flo-card);
  }

  .float-field__control:has(> input:not(:focus):not(:placeholder-shown)) > .float-field__label,
  .float-field__control:has(> textarea:not(:focus):not(:placeholder-shown)) > .float-field__label,
  .float-field__control:has(.float-field__input:not(:focus):not(:placeholder-shown)) > .float-field__label,
  .float-field__control:has(.float-field__textarea:not(:focus):not(:placeholder-shown)) > .float-field__label,
  .float-field__input:not(:focus):not(:placeholder-shown) ~ .float-field__label,
  .float-field__textarea:not(:focus):not(:placeholder-shown) ~ .float-field__label {
    color: var(--flo-muted);
  }

  .float-field__control:has(input:disabled) > .float-field__label {
    color: color-mix(in srgb, var(--flo-muted) 60%, transparent);
    background: color-mix(in srgb, var(--flo-bg) 65%, var(--flo-card));
  }

  .float-field__input:disabled,
  .float-field__control > input:disabled {
    color: color-mix(in srgb, var(--flo-on-surface) 42%, transparent);
    cursor: not-allowed;
  }

  .float-field__control:has(input:disabled) {
    background: color-mix(in srgb, var(--flo-bg) 65%, var(--flo-card));
    border-color: var(--flo-divider);
  }

  /* 电话：label 在整框顶边，区号在框内 */
  .float-field__control--phone {
    flex-wrap: nowrap;
    padding-top: 0;
  }

  /* 有区号前缀时 label 始终在顶边（与 Material leading 一致） */
  .float-field__control--phone > .float-field__label {
    left: 10px;
    top: 0;
    transform: translateY(-50%) scale(0.92);
    font-size: var(--flo-label-float);
    background: var(--flo-card);
    color: var(--flo-muted);
  }

  .float-field__control--phone:focus-within > .float-field__label {
    color: var(--flo-primary);
  }

  .float-field__prefix {
    display: flex;
    align-items: center;
    align-self: stretch;
    flex-shrink: 0;
    padding: 0 12px;
    margin-top: 8px;
    border-right: 1px solid var(--flo-divider);
    font-size: var(--flo-label-rest);
    font-weight: 500;
    color: var(--flo-on-surface);
    user-select: none;
  }

  .float-field__control--phone:focus-within .float-field__prefix,
  .float-field__control--phone:has(.float-field__input:not(:placeholder-shown)) .float-field__prefix {
    margin-top: 7px;
  }

  .float-field__prefix--empty {
    font-weight: 400;
    color: var(--flo-muted);
  }

  .float-field__control--phone .float-field__inner .float-field__input {
    padding-left: 12px;
    border-radius: 0 calc(var(--flo-radius-field) - 2px) calc(var(--flo-radius-field) - 2px) 0;
  }

  /* 搜索 + 清除 */
  .float-field--search {
    position: relative;
    z-index: 2;
  }

  .float-field__control--search .float-field__input {
    padding-right: 48px;
  }

  .search-field__trailing {
    position: absolute;
    right: 4px;
    top: 50%;
    z-index: 1;
    transform: translateY(-50%);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    flex-shrink: 0;
  }

  .search-field__trailing svg {
    display: block;
    width: 20px;
    height: 20px;
    pointer-events: none;
  }

  .search-field__trailing svg path {
    fill: currentColor;
  }

  .search-field__hint {
    color: color-mix(in srgb, var(--flo-muted) 88%, transparent);
    pointer-events: none;
  }

  .search-field__clear {
    padding: 0;
    border: 0;
    border-radius: 50%;
    background: transparent;
    color: var(--flo-muted);
    cursor: pointer;
    transition:
      background-color 180ms ease,
      color 180ms ease;
  }

  .search-field__clear:hover {
    background: color-mix(in srgb, var(--flo-on-surface) 8%, transparent);
    color: var(--flo-on-surface);
  }

  .search-field__clear:focus-visible {
    outline: 2px solid var(--flo-primary);
    outline-offset: 1px;
  }

  .hint {
    margin: 0;
    padding-left: 12px;
    font-size: var(--flo-label-float);
    line-height: 1.4;
    color: var(--flo-muted);
    overflow-wrap: anywhere;
  }

  .hint--error {
    color: var(--flo-error);
  }

  .hint--warn {
    color: var(--yn-color-warning, #b87d55);
  }

  .dropdown {
    position: absolute;
    z-index: 20;
    top: calc(100% + 4px);
    left: 0;
    right: 0;
    margin: 0;
    padding: 6px 0;
    list-style: none;
    border-radius: var(--flo-radius-field);
    border: 1px solid var(--flo-divider);
    background: var(--flo-card);
    box-shadow: var(--yn-color-shadow-md, 0 8px 24px rgba(36, 31, 33, 0.12));
    max-height: min(280px, 50dvh);
    overflow: auto;
  }

  .dropdown button {
    width: 100%;
    border: 0;
    background: transparent;
    text-align: left;
    padding: 12px 16px;
    font: inherit;
    font-size: 0.875rem;
    line-height: 1.45;
    color: var(--flo-on-surface);
    cursor: pointer;
    transition: background-color 150ms ease;
  }

  .dropdown button:hover,
  .dropdown button:focus-visible {
    background: var(--flo-primary-soft);
    outline: none;
  }

  .dropdown .meta {
    display: block;
    margin-top: 2px;
    font-size: 0.75rem;
    color: var(--flo-muted);
  }

  .grid-2,
  .grid-3 {
    display: grid;
    gap: 12px;
    min-width: 0;
  }

  .grid-2 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .grid-3 {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  @media (max-width: 720px) {
    .grid-3 {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 520px) {
    .grid-2,
    .grid-3 {
      grid-template-columns: minmax(0, 1fr);
    }
  }

  .dev-panel {
    margin-top: 8px;
    padding: 16px;
    border-radius: var(--flo-radius-card);
    border: 1px dashed var(--flo-outline);
    background: var(--flo-surface);
    font-size: 0.75rem;
    line-height: 1.5;
    overflow: auto;
    max-height: 240px;
  }

  .dev-meta {
    margin: 6px 0 0;
    font-size: 0.6875rem;
    color: var(--flo-muted);
  }

  .dev-panel pre {
    margin: 8px 0 0;
    white-space: pre-wrap;
    word-break: break-word;
    font-family: ui-monospace, monospace;
    font-size: 0.6875rem;
  }

  .skeleton-hint {
    margin: 0 0 16px;
    font-size: 0.875rem;
    color: var(--flo-muted);
  }

  .skeleton-panel {
    pointer-events: none;
    border: 1px solid var(--flo-divider);
    box-shadow: var(--flo-shadow);
    padding: 20px;
    border-radius: var(--flo-radius-card);
    background: var(--flo-card);
  }

  .skeleton-line {
    border-radius: var(--flo-radius-field);
    background: linear-gradient(
      90deg,
      var(--flo-divider) 0%,
      var(--flo-surface) 50%,
      var(--flo-divider) 100%
    );
    background-size: 200% 100%;
    animation: yn-checkout-address-shimmer 1.15s ease-in-out infinite;
  }

  .skeleton-line--label {
    width: 38%;
    height: 12px;
    margin-bottom: 8px;
  }

  .skeleton-line--field {
    height: var(--flo-field-min-height);
  }

  .layer-details > .checkout-card {
    animation: yn-checkout-address-panel-in 280ms cubic-bezier(0.4, 0, 0.2, 1);
  }

  @keyframes yn-checkout-address-shimmer {
    0% {
      background-position: 100% 0;
    }
    100% {
      background-position: -100% 0;
    }
  }

  @keyframes yn-checkout-address-panel-in {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 1;
      transform: none;
    }
  }

  .banner__actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px 16px;
    margin-top: 12px;
  }

  .retry {
    display: inline-flex;
    align-items: center;
    min-height: 40px;
    padding: 10px 22px;
    border: 0;
    border-radius: 999px;
    background: var(--flo-primary);
    color: #fff;
    font: inherit;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 180ms ease;
  }

  .retry:hover {
    background: var(--flo-primary-hover);
  }

  .retry:focus-visible {
    outline: 2px solid var(--flo-primary);
    outline-offset: 2px;
  }

  .mode-switch {
    display: inline-flex;
    align-items: center;
    margin-top: 8px;
    padding: 0;
    border: 0;
    background: none;
    color: var(--flo-primary);
    font: inherit;
    font-size: 0.8125rem;
    font-weight: 500;
    text-decoration: underline;
    text-underline-offset: 0.15em;
    cursor: pointer;
  }

  .mode-switch--banner {
    margin-top: 0;
  }

  .mode-switch:hover {
    color: var(--flo-primary-hover);
  }

  .mode-switch:focus-visible {
    outline: 2px solid var(--flo-primary);
    outline-offset: 2px;
    border-radius: 4px;
  }
`;
