import { css } from "lit";

/** 结账地址表单样式，对齐 theme.css（--yn-*），组件级可用 --yn-checkout-address-* 覆盖 */
export const checkoutAddressFormStyles = css`
  :host {
    display: block;
    min-width: 0;
    max-width: 100%;
    background: var(--yn-checkout-address-bg, transparent);
    color: var(--yn-checkout-address-color, var(--yn-color-text, #241f21));
    font-family: inherit;
  }

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  .stack {
    display: grid;
    gap: clamp(14px, 2.5vw, 18px);
    min-width: 0;
    padding: var(--yn-checkout-address-padding, 0);
    border-radius: inherit;
  }

  .layer[hidden] {
    display: none !important;
  }

  .form-panel {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 14px 16px;
    border-radius: var(--yn-checkout-address-radius, 14px);
    border: 1px solid var(--yn-color-divider, rgba(36, 31, 33, 0.12));
    background: var(--yn-color-bg-elevated, #fff);
    min-width: 0;
  }

  .form-panel--region {
    padding: 16px;
  }

  .panel-title {
    margin: 0;
    font-size: 0.9375rem;
    font-weight: 600;
    line-height: 1.35;
    letter-spacing: -0.01em;
    text-transform: none;
    color: var(--yn-checkout-address-color, var(--yn-color-text, #241f21));
  }

  .field-label {
    font-size: 0.8125rem;
    font-weight: 500;
    letter-spacing: normal;
    text-transform: none;
    color: var(--yn-color-text-subtle, #6f696b);
  }

  .banner--hint {
    margin: 0;
  }

  .region-summary {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    min-width: 0;
  }

  .region-summary__main {
    min-width: 0;
    flex: 1;
  }

  .region-summary__kicker {
    display: block;
    margin-bottom: 4px;
    font-size: 0.75rem;
    font-weight: 500;
    color: var(--yn-color-text-muted, rgba(36, 31, 33, 0.48));
  }

  .region-summary__value {
    margin: 0;
    font-size: 0.9375rem;
    font-weight: 600;
    line-height: 1.45;
    overflow-wrap: anywhere;
    word-break: break-word;
  }

  .region-summary__edit {
    flex-shrink: 0;
    padding: 6px 12px;
    border: 0;
    border-radius: 999px;
    background: var(--yn-color-bg-muted, #f3efe7);
    color: var(--yn-checkout-address-color, var(--yn-color-text, #241f21));
    font: inherit;
    font-size: 0.8125rem;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 180ms ease;
  }

  .region-summary__edit:hover:not(:disabled) {
    background: var(--yn-color-overlay-hover, rgba(36, 31, 33, 0.08));
  }

  .region-summary__edit:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .fields-secondary {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
    min-width: 0;
  }

  @media (max-width: 520px) {
    .fields-secondary {
      grid-template-columns: minmax(0, 1fr);
    }
  }

  .field--compact-postal .hint--error {
    grid-column: 1 / -1;
  }

  .contact-section {
    display: flex;
    flex-direction: column;
    gap: 12px;
    min-width: 0;
  }

  .banner {
    padding: 10px 14px;
    border-radius: 14px;
    border: 1px solid var(--yn-color-divider, rgba(36, 31, 33, 0.14));
    background: var(--yn-color-bg-muted, #f3efe7);
    color: var(--yn-color-text-subtle, #6f696b);
    font-size: 0.8125rem;
    line-height: 1.55;
    word-break: break-word;
  }

  .banner strong {
    color: var(--yn-checkout-address-color, var(--yn-color-text, #241f21));
    font-weight: 700;
  }

  .banner--warn {
    border-color: var(--yn-color-warning, #b87d55);
    background: rgba(184, 125, 85, 0.1);
  }

  .banner--warn .retry {
    margin-top: 10px;
  }

  .retry {
    display: inline-flex;
    align-items: center;
    padding: 8px 14px;
    border-radius: 999px;
    border: 1px solid var(--yn-color-border, rgba(36, 31, 33, 0.22));
    background: var(--yn-color-bg-elevated, #fff);
    color: inherit;
    font: inherit;
    font-size: 0.8125rem;
    font-weight: 600;
    cursor: pointer;
  }

  .retry:hover {
    border-color: var(--yn-color-border-strong, rgba(36, 31, 33, 0.52));
  }

  .manual-region {
    display: flex;
    flex-direction: column;
    gap: clamp(10px, 2vw, 14px);
    min-width: 0;
  }

  .dev-meta {
    margin: 6px 0 0;
    font-size: 0.6875rem;
    line-height: 1.45;
    color: var(--yn-color-text-muted, rgba(36, 31, 33, 0.48));
    word-break: break-word;
  }

  .section-title {
    margin: 0 0 10px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--yn-color-divider, rgba(36, 31, 33, 0.14));
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--yn-checkout-address-color, var(--yn-color-text, #241f21));
  }

  .address-section,
  .contact-section {
    display: flex;
    flex-direction: column;
    gap: clamp(10px, 2vw, 14px);
    min-width: 0;
  }

  .address-section > .section-title,
  .contact-section > .section-title {
    margin-bottom: 4px;
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

  .field {
    display: flex;
    flex-direction: column;
    gap: 6px;
    min-width: 0;
  }

  label {
    font-size: 0.6875rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--yn-color-text-muted, rgba(36, 31, 33, 0.48));
  }

  .field-mark {
    margin-inline-start: 0.35em;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: none;
  }

  .field-mark--required {
    color: var(--yn-color-text-subtle, #6f696b);
  }

  .field-mark--optional {
    color: var(--yn-color-text-muted, rgba(36, 31, 33, 0.42));
    font-weight: 500;
  }

  .search-wrap {
    position: relative;
    z-index: 2;
    min-width: 0;
  }

  .search-field {
    position: relative;
    display: flex;
    align-items: center;
    min-width: 0;
  }

  .search-field__input {
    width: 100%;
    padding-right: 44px;
  }

  .search-field__clear {
    position: absolute;
    right: 6px;
    top: 50%;
    transform: translateY(-50%);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    padding: 0;
    border: 0;
    border-radius: 999px;
    background: transparent;
    color: var(--yn-checkout-address-color, var(--yn-color-text, #241f21));
    cursor: pointer;
    transition: background-color 180ms ease;
  }

  .search-field__clear:hover {
    background: var(--yn-color-overlay-hover, rgba(36, 31, 33, 0.08));
  }

  .search-field__clear:focus-visible {
    outline: 2px solid var(--yn-color-border-focus, #241f21);
    outline-offset: 2px;
  }

  .search-field__clear svg {
    display: block;
    width: 20px;
    height: 20px;
    pointer-events: none;
  }

  .search-field__clear svg path {
    fill: currentColor;
  }

  input {
    width: 100%;
    min-width: 0;
    height: var(--yn-checkout-address-field-height, 44px);
    padding: 0 14px;
    border-radius: var(--yn-checkout-address-radius, 12px);
    border: 1px solid var(--yn-color-border, rgba(36, 31, 33, 0.22));
    background: var(--yn-color-bg-elevated, #fff);
    color: var(--yn-checkout-address-color, var(--yn-color-text, #241f21));
    font: inherit;
    font-size: 0.9375rem;
    outline: none;
    transition:
      border-color 180ms ease,
      box-shadow 180ms ease;
  }

  input::placeholder {
    color: var(--yn-color-text-muted, rgba(36, 31, 33, 0.48));
  }

  input:hover:not(:disabled) {
    border-color: var(--yn-color-border-strong, rgba(36, 31, 33, 0.52));
  }

  input:focus {
    border-color: var(--yn-color-border-focus, #241f21);
    box-shadow: 0 0 0 3px var(--yn-color-focus-ring, rgba(36, 31, 33, 0.12));
  }

  input:disabled {
    background: var(--yn-color-surface-disabled, rgba(232, 225, 214, 0.76));
    color: var(--yn-color-text-disabled, rgba(36, 31, 33, 0.42));
    cursor: not-allowed;
  }

  input.input--invalid {
    border-color: var(--yn-color-error, #9a4f43);
  }

  input.input--invalid:focus {
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--yn-color-error, #9a4f43) 22%, transparent);
  }

  .validate-summary {
    margin: 0;
    padding: 10px 12px;
    border-radius: var(--yn-checkout-address-radius, 12px);
    border: 1px solid color-mix(in srgb, var(--yn-color-error, #9a4f43) 35%, transparent);
    background: color-mix(in srgb, var(--yn-color-error, #9a4f43) 8%, transparent);
    font-size: 0.8125rem;
    line-height: 1.5;
  }

  .validate-summary ul {
    margin: 6px 0 0;
    padding-left: 1.1rem;
  }

  .dropdown {
    position: absolute;
    z-index: 20;
    top: calc(100% + 6px);
    left: 0;
    right: 0;
    max-width: 100%;
    margin: 0;
    padding: 6px;
    list-style: none;
    border-radius: var(--yn-checkout-address-radius, 12px);
    border: 1px solid var(--yn-color-divider, rgba(36, 31, 33, 0.14));
    background: var(--yn-color-bg-elevated, #fff);
    box-shadow: var(--yn-color-shadow-md, 0 12px 36px rgba(36, 31, 33, 0.18));
    max-height: min(280px, 50dvh);
    overflow-x: hidden;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }

  .dropdown button {
    width: 100%;
    max-width: 100%;
    border: 0;
    background: transparent;
    text-align: left;
    padding: 10px 12px;
    border-radius: 8px;
    font: inherit;
    font-size: 0.875rem;
    line-height: 1.4;
    color: var(--yn-checkout-address-color, var(--yn-color-text, #241f21));
    cursor: pointer;
    overflow-wrap: anywhere;
    word-break: break-word;
  }

  .dropdown button:hover,
  .dropdown button:focus-visible {
    background: var(--yn-color-overlay-hover, rgba(36, 31, 33, 0.08));
    outline: none;
  }

  .dropdown .meta {
    display: block;
    margin-top: 4px;
    font-size: 0.6875rem;
    color: var(--yn-color-text-muted, rgba(36, 31, 33, 0.48));
  }

  .grid-2,
  .grid-3 {
    display: grid;
    gap: clamp(10px, 2vw, 14px);
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

  .readonly {
    min-height: var(--yn-checkout-address-field-height, 44px);
    display: flex;
    align-items: center;
    padding: 8px 14px;
    border-radius: var(--yn-checkout-address-radius, 12px);
    border: 1px solid var(--yn-color-divider, rgba(36, 31, 33, 0.14));
    background: var(--yn-color-surface, rgba(255, 255, 255, 0.62));
    font-size: 0.875rem;
    line-height: 1.45;
    overflow-wrap: anywhere;
    word-break: break-word;
    min-width: 0;
  }

  .phone-input {
    display: flex;
    align-items: stretch;
    width: 100%;
    min-width: 0;
    min-height: var(--yn-checkout-address-field-height, 44px);
    border-radius: var(--yn-checkout-address-radius, 12px);
    border: 1px solid var(--yn-color-border, rgba(36, 31, 33, 0.22));
    background: var(--yn-color-bg-elevated, #fff);
    overflow: hidden;
    transition:
      border-color 180ms ease,
      box-shadow 180ms ease;
  }

  .phone-input:hover:not(:has(.phone-input__control:disabled)) {
    border-color: var(--yn-color-border-strong, rgba(36, 31, 33, 0.52));
  }

  .phone-input:focus-within {
    border-color: var(--yn-color-border-focus, #241f21);
    box-shadow: 0 0 0 3px var(--yn-color-focus-ring, rgba(36, 31, 33, 0.12));
  }

  .phone-input--invalid {
    border-color: var(--yn-color-error, #9a4f43);
  }

  .phone-input--invalid:focus-within {
    box-shadow: 0 0 0 3px rgba(154, 79, 67, 0.18);
  }

  .phone-input:has(.phone-input__control:disabled) {
    background: var(--yn-color-surface-disabled, rgba(232, 225, 214, 0.76));
    cursor: not-allowed;
  }

  .phone-input__prefix {
    display: flex;
    align-items: center;
    flex-shrink: 0;
    padding: 0 12px;
    border-right: 1px solid var(--yn-color-divider, rgba(36, 31, 33, 0.14));
    background: var(--yn-color-surface, rgba(255, 255, 255, 0.62));
    font-size: 0.9375rem;
    font-weight: 600;
    line-height: 1;
    color: var(--yn-checkout-address-color, var(--yn-color-text, #241f21));
    white-space: nowrap;
    user-select: none;
  }

  .phone-input__prefix--empty {
    font-weight: 500;
    color: var(--yn-color-text-muted, rgba(36, 31, 33, 0.48));
  }

  .phone-input:has(.phone-input__control:disabled) .phone-input__prefix {
    color: var(--yn-color-text-disabled, rgba(36, 31, 33, 0.42));
  }

  .phone-input__control {
    flex: 1;
    min-width: 0;
    width: auto;
    height: auto;
    min-height: 100%;
    border: none;
    border-radius: 0;
    background: transparent;
    box-shadow: none;
    padding-left: 12px;
  }

  .phone-input__control:hover:not(:disabled),
  .phone-input__control:focus {
    border-color: transparent;
    box-shadow: none;
  }

  .phone-input__control:disabled {
    background: transparent;
  }

  .hint {
    margin: 0;
    font-size: 0.75rem;
    line-height: 1.45;
    color: var(--yn-color-text-muted, rgba(36, 31, 33, 0.48));
    overflow-wrap: anywhere;
  }

  .hint--error {
    color: var(--yn-color-error, #9a4f43);
  }

  .hint--warn {
    color: var(--yn-color-warning, #b87d55);
  }

  .dev-panel {
    margin-top: 12px;
    padding: 12px 14px;
    border-radius: var(--yn-checkout-address-radius, 12px);
    border: 1px dashed var(--yn-color-border, rgba(36, 31, 33, 0.22));
    background: var(--yn-color-bg-muted, #f3efe7);
    font-size: 0.75rem;
    line-height: 1.5;
    overflow: auto;
    max-height: 240px;
  }

  .dev-panel pre {
    margin: 8px 0 0;
    white-space: pre-wrap;
    word-break: break-word;
    font-family: ui-monospace, monospace;
    font-size: 0.6875rem;
  }

  .skeleton-stack {
    min-width: 0;
  }

  .skeleton-hint {
    margin: 0 0 12px;
    font-size: 0.8125rem;
    color: var(--yn-color-text-muted, rgba(36, 31, 33, 0.48));
  }

  .skeleton-panel {
    pointer-events: none;
  }

  .skeleton-line {
    border-radius: var(--yn-checkout-address-radius, 12px);
    background: linear-gradient(
      90deg,
      var(--yn-color-bg-muted, #f3efe7) 0%,
      var(--yn-color-surface-hover, rgba(255, 255, 255, 0.86)) 50%,
      var(--yn-color-bg-muted, #f3efe7) 100%
    );
    background-size: 200% 100%;
    animation: yn-checkout-address-shimmer 1.15s ease-in-out infinite;
  }

  .skeleton-line--label {
    width: 38%;
    height: 12px;
    margin-bottom: 8px;
    border-radius: 6px;
  }

  .skeleton-line--field {
    height: var(--yn-checkout-address-field-height, 44px);
  }

  .form-panel--details {
    animation: yn-checkout-address-panel-in 220ms ease;
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
      transform: translateY(6px);
    }
    to {
      opacity: 1;
      transform: none;
    }
  }

  .error-box {
    padding: 12px 14px;
    border-radius: 12px;
    border: 1px solid color-mix(in srgb, var(--yn-color-warning, #b87d55) 40%, transparent);
    background: color-mix(in srgb, var(--yn-color-warning, #b87d55) 12%, transparent);
    font-size: 0.8125rem;
    line-height: 1.5;
  }

  .retry {
    margin-top: 10px;
    border: 0;
    padding: 8px 14px;
    border-radius: 999px;
    background: var(--yn-color-primary, #f76c46);
    color: var(--yn-color-on-inverse, #fff);
    font: inherit;
    font-size: 0.8125rem;
    font-weight: 600;
    cursor: pointer;
  }
`;
