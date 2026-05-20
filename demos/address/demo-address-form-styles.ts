import { css } from "lit";

/** Shared checkout form styles aligned with src/styles/theme.css (--yn-*). */
export const demoAddressFormStyles = css`
  :host {
    display: block;
    min-width: 0;
    max-width: 100%;
    color: var(--yn-color-text, #241f21);
    font-family:
      "Zimula",
      ui-serif,
      Georgia,
      "PingFang SC",
      "Microsoft YaHei",
      sans-serif;
  }

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  .stack {
    display: grid;
    gap: clamp(12px, 2.5vw, 16px);
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
    color: var(--yn-color-text, #241f21);
    font-weight: 700;
  }

  .section-title {
    margin: 0;
    font-size: 0.6875rem;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--yn-color-text-muted, rgba(36, 31, 33, 0.48));
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

  .search-wrap {
    position: relative;
    z-index: 2;
    min-width: 0;
  }

  input {
    width: 100%;
    min-width: 0;
    height: var(--yn-demo-field-height, 44px);
    padding: 0 14px;
    border-radius: var(--yn-demo-radius, 12px);
    border: 1px solid var(--yn-color-border, rgba(36, 31, 33, 0.22));
    background: var(--yn-color-bg-elevated, #fff);
    color: var(--yn-color-text, #241f21);
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
    border-radius: var(--yn-demo-radius, 12px);
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
    color: var(--yn-color-text, #241f21);
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
    min-height: var(--yn-demo-field-height, 44px);
    display: flex;
    align-items: center;
    padding: 8px 14px;
    border-radius: var(--yn-demo-radius, 12px);
    border: 1px solid var(--yn-color-divider, rgba(36, 31, 33, 0.14));
    background: var(--yn-color-surface, rgba(255, 255, 255, 0.62));
    font-size: 0.875rem;
    line-height: 1.45;
    overflow-wrap: anywhere;
    word-break: break-word;
    min-width: 0;
  }

  .phone-row {
    display: grid;
    grid-template-columns: minmax(72px, 5.5rem) minmax(0, 1fr);
    gap: 10px;
    align-items: end;
    min-width: 0;
  }

  @media (max-width: 400px) {
    .phone-row {
      grid-template-columns: minmax(0, 1fr);
    }
  }

  .phone-prefix {
    min-height: var(--yn-demo-field-height, 44px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 8px;
    border-radius: var(--yn-demo-radius, 12px);
    border: 1px solid var(--yn-color-divider, rgba(36, 31, 33, 0.14));
    background: var(--yn-color-surface, rgba(255, 255, 255, 0.62));
    font-size: 0.9375rem;
    font-weight: 600;
    color: var(--yn-color-text, #241f21);
    white-space: nowrap;
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
`;
