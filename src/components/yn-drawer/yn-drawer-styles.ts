/** Shadow DOM styles — Lit + DSD SSR shared */
export const YN_DRAWER_SHADOW_STYLES = `
:host([hide-trigger]) {
      position: fixed;
      width: 0;
      height: 0;
      margin: 0;
      padding: 0;
      overflow: visible;
      border: 0;
      pointer-events: none;
    }

    :host([hide-trigger]) .trigger-wrap,
    :host([hide-trigger]) .trigger-wrap[hidden] {
      display: none !important;
    }

    :host([hide-trigger]) .drawer-popover {
      pointer-events: none;
    }

    :host([hide-trigger]) .drawer-popover:popover-open,
    :host([hide-trigger]) .drawer-popover[open] {
      pointer-events: auto;
    }

:host {
      --yn-drawer-z-index: 1500;
      --yn-drawer-width: 420px;
      --yn-drawer-bg: var(--yn-color-bg-elevated, #ffffff);
      --yn-drawer-shadow: 0 18px 48px rgba(36, 31, 33, 0.16),
        0 2px 8px rgba(36, 31, 33, 0.06);
      --yn-drawer-backdrop: rgba(18, 14, 16, 0.52);
      --yn-drawer-backdrop-blur: 2px;
      --yn-drawer-header-border: var(--yn-color-divider, rgba(36, 31, 33, 0.1));
      --yn-drawer-footer-border: transparent;
      --yn-drawer-title-color: var(--yn-color-text, #241f21);
      --yn-drawer-close-color: var(--yn-color-text, #241f21);
      --yn-drawer-close-hover-bg: var(--yn-color-overlay-hover, rgba(36, 31, 33, 0.08));
      --yn-drawer-content-color: var(--yn-color-text, #241f21);
      --yn-drawer-footer-bg: var(--yn-color-inverse-bg, #241f21);
      --yn-drawer-footer-color: rgba(255, 255, 255, 0.62);
      --yn-drawer-middle-bg: linear-gradient(
        135deg,
        var(--yn-color-primary, #f76c46) 0%,
        #f39a5c 42%,
        var(--yn-color-accent, #ddd967) 100%
      );
      --yn-drawer-middle-color: var(--yn-color-text, #241f21);
      --yn-drawer-middle-border: rgba(36, 31, 33, 0.18);
      --yn-drawer-top-border: rgba(36, 31, 33, 0.14);
      --yn-drawer-bottom-border: rgba(255, 255, 255, 0.1);
      --yn-drawer-panel-radius: 14px;
      --yn-drawer-panel-border-width: 1px;
      --yn-drawer-panel-gap: 8px;
      --yn-drawer-surface-padding: max(12px, env(safe-area-inset-top, 0px))
        max(12px, env(safe-area-inset-right, 0px))
        max(12px, env(safe-area-inset-bottom, 0px))
        max(12px, env(safe-area-inset-left, 0px));
      --yn-drawer-open-duration: 380ms;
      --yn-drawer-close-duration: 320ms;
      --yn-drawer-open-ease: cubic-bezier(0.22, 0.01, 0.35, 1);
      --yn-drawer-close-ease: cubic-bezier(0.55, 0.055, 0.675, 0.19);
      --yn-drawer-mobile-radius: 16px;
      --yn-drawer-mobile-shadow: var(--yn-color-shadow-lg, 0 -12px 36px rgba(36, 31, 33, 0.18));
      --yn-drawer-sheet-height: 90vh;
      --yn-drawer-trigger-bg: var(--yn-color-inverse-bg, #241f21);
      --yn-drawer-trigger-color: var(--yn-color-on-inverse, #ffffff);
      --yn-drawer-breakpoint: 1024px;
      --yn-drawer-body-padding: 20px 24px 28px;
      --yn-drawer-header-padding: 0 12px 0 20px;
      --yn-drawer-middle-padding: 22px 24px;
      --yn-drawer-footer-padding: 18px 24px;
      --yn-drawer-backdrop-extra-padding: 24px;
      display: block;
    }

    * {
      box-sizing: border-box;
    }

    .trigger-wrap {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .trigger-btn {
      border: 0;
      border-radius: 999px;
      padding: 10px 16px;
      background: var(--yn-drawer-trigger-bg);
      color: var(--yn-drawer-trigger-color);
      cursor: pointer;
      font-size: 14px;
      line-height: 1;
      letter-spacing: 0.01em;
      transition: opacity 160ms ease, transform 160ms ease;
    }

    .trigger-btn:hover {
      opacity: 0.92;
    }

    .trigger-btn:active {
      transform: scale(0.98);
    }

    .drawer-popover {
      margin: 0;
      padding: 0;
      border: 0;
      background: transparent;
      width: 100vw;
      max-width: 100vw;
      height: 100vh;
      max-height: 100dvh;
      inset: 0;
      overflow: hidden;
      z-index: var(--yn-drawer-z-index);
    }

    .drawer-popover::backdrop {
      background: transparent;
    }

    .drawer-surface {
      position: fixed;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: var(--yn-drawer-panel-gap);
      padding: var(--yn-drawer-surface-padding);
      pointer-events: none;
      /* 坠落退场时裁切位移，避免出现中间滚动条 */
      overflow: hidden;
    }

    .backdrop {
      position: absolute;
      inset: 0;
      background: var(--yn-drawer-backdrop);
      backdrop-filter: blur(var(--yn-drawer-backdrop-blur));
      -webkit-backdrop-filter: blur(var(--yn-drawer-backdrop-blur));
      opacity: 0;
      pointer-events: auto;
    }

    .backdrop-extra {
      display: none;
    }

    .panel {
      position: relative;
      width: min(100%, var(--yn-drawer-width));
      max-width: 100%;
      border: solid var(--yn-drawer-panel-border-width);
      border-radius: var(--yn-drawer-panel-radius);
      pointer-events: auto;
      contain: layout paint;
    }

    .panel--top {
      flex: 1 1 auto;
      min-height: 220px;
      max-height: 100%;
      background: var(--yn-drawer-bg);
      color: var(--yn-drawer-content-color);
      border-color: var(--yn-drawer-top-border);
      box-shadow: var(--yn-drawer-shadow);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      z-index: 3;
    }

    .panel--middle {
      flex: 0 0 auto;
      min-height: 120px;
      max-height: min(28vh, 220px);
      background: var(--yn-drawer-middle-bg);
      color: var(--yn-drawer-middle-color);
      border-color: var(--yn-drawer-middle-border);
      box-shadow: 0 10px 28px rgba(36, 31, 33, 0.12);
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: var(--yn-drawer-middle-padding);
      overflow: auto;
      z-index: 2;
    }

    .panel--middle.panel--empty {
      display: none;
    }

    .panel--bottom {
      flex: 0 0 auto;
      min-height: 72px;
      background: var(--yn-drawer-footer-bg);
      color: var(--yn-drawer-footer-color);
      border-color: var(--yn-drawer-bottom-border);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
      display: flex;
      align-items: center;
      padding: var(--yn-drawer-footer-padding);
      overflow: auto;
      z-index: 1;
    }

    .panel--bottom.panel--empty {
      display: none;
      border: 0;
      padding: 0;
      min-height: 0;
    }

    .header {
      min-height: 56px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: var(--yn-drawer-header-padding);
      flex-shrink: 0;
      background: color-mix(in srgb, var(--yn-drawer-bg) 92%, transparent);
    }

    .header-main {
      flex: 1;
      min-width: 0;
      display: flex;
      align-items: center;
    }

    .title {
      margin: 0;
      color: var(--yn-drawer-title-color);
      font-size: 15px;
      line-height: 1.3;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }

    .close-btn {
      flex-shrink: 0;
    }

    .body {
      flex: 1;
      min-height: 0;
      overflow: auto;
      padding: var(--yn-drawer-body-padding);
      scrollbar-width: thin;
      scrollbar-color: rgba(36, 31, 33, 0.22) transparent;
    }

    .body::-webkit-scrollbar {
      width: 8px;
    }

    .body::-webkit-scrollbar-thumb {
      background: rgba(36, 31, 33, 0.18);
      border-radius: 999px;
      border: 2px solid transparent;
      background-clip: content-box;
    }

    .header-actions {
      display: inline-flex;
      align-items: center;
      flex-shrink: 0;
      gap: 4px;
    }

    .header-actions:empty {
      display: none;
    }

    @media (min-width: 1024px) {
      :host {
        --yn-drawer-surface-padding: 16px;
        --yn-drawer-panel-gap: 10px;
      }

      :host([placement="right"]) .backdrop-extra:not(.backdrop-extra--empty),
      :host([placement="auto"]) .backdrop-extra:not(.backdrop-extra--empty) {
        display: flex;
        align-items: center;
        justify-content: center;
        position: absolute;
        inset: 0 auto 0 0;
        width: max(
          0px,
          calc(100% - min(100%, var(--yn-drawer-width)) - 32px)
        );
        z-index: 1;
        min-width: 0;
        padding: var(--yn-drawer-backdrop-extra-padding);
        pointer-events: auto;
        /* 不可用 auto：退场 y:110vh 会撑出滚动条 */
        overflow: hidden;
      }

      :host([placement="bottom"]) .backdrop-extra {
        display: none;
      }
    }

    @media (max-width: 1023px) {
      .panel {
        width: 100%;
        border-radius: calc(var(--yn-drawer-panel-radius) + 2px);
      }

      .panel--top {
        min-height: 180px;
      }

      .panel--middle {
        min-height: 108px;
        max-height: min(32vh, 200px);
      }

      .backdrop-extra {
        display: none;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .trigger-btn {
        transition: none;
      }
    }
`;
