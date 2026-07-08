/** Shadow DOM styles — Lit + DSD SSR shared */
export const YN_DRAWER_SHADOW_STYLES = `
:host {
      --yn-drawer-z-index: 1500;
      --yn-drawer-width: 420px;
      --yn-drawer-bg: var(--yn-color-bg-elevated, #ffffff);
      --yn-drawer-shadow: var(--yn-color-shadow-md, -12px 0 36px rgba(36, 31, 33, 0.18));
      --yn-drawer-backdrop: var(--yn-color-backdrop, rgba(12, 10, 11, 0.36));
      --yn-drawer-header-border: var(--yn-color-divider, rgba(36, 31, 33, 0.08));
      --yn-drawer-footer-border: var(--yn-color-divider, rgba(36, 31, 33, 0.08));
      --yn-drawer-title-color: var(--yn-color-text, #241f21);
      --yn-drawer-close-color: var(--yn-color-text, #241f21);
      --yn-drawer-close-hover-bg: var(--yn-color-overlay-hover, rgba(36, 31, 33, 0.08));
      --yn-drawer-content-color: var(--yn-color-text, #241f21);
      --yn-drawer-footer-bg: var(--yn-color-bg-elevated, #ffffff);
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
      --yn-drawer-body-padding: 16px;
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
    }

    .drawer-popover {
      margin: 0;
      padding: 0;
      border: 0;
      background: transparent;
      width: 100vw;
      max-width: 100vw;
      height: 100vh;
      max-height: 100vh;
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
      justify-content: flex-end;
      align-items: stretch;
      pointer-events: none;
    }

    .backdrop {
      position: absolute;
      inset: 0;
      background: var(--yn-drawer-backdrop);
      opacity: 0;
      transition: opacity var(--yn-drawer-open-duration) var(--yn-drawer-open-ease);
      pointer-events: none;
    }

    .panel {
      position: relative;
      width: min(100vw, var(--yn-drawer-width));
      max-width: 100vw;
      height: 100vh;
      background: var(--yn-drawer-bg);
      box-shadow: var(--yn-drawer-shadow);
      color: var(--yn-drawer-content-color);
      transform: translateX(100%);
      opacity: 0;
      pointer-events: auto;
      display: flex;
      flex-direction: column;
      transition:
        transform var(--yn-drawer-open-duration) var(--yn-drawer-open-ease),
        opacity var(--yn-drawer-open-duration) var(--yn-drawer-open-ease);
      will-change: transform, opacity;
    }

    .drawer-popover.visible .backdrop {
      opacity: 1;
      pointer-events: auto;
    }

    .drawer-popover.visible .panel {
      transform: translateX(0);
      opacity: 1;
    }

    .drawer-popover.closing .backdrop {
      transition-duration: var(--yn-drawer-close-duration);
      transition-timing-function: var(--yn-drawer-close-ease);
      opacity: 0;
      pointer-events: none;
    }

    .drawer-popover.closing .panel {
      transition-duration: var(--yn-drawer-close-duration);
      transition-timing-function: var(--yn-drawer-close-ease);
      transform: translateX(100%);
      opacity: 0;
    }

    .backdrop-extra {
      display: none;
    }

    /* 宽屏右侧抽屉：遮罩区左侧展示 backdrop-extra（不替代遮罩层） */
    @media (min-width: 1024px) {
      :host([placement="right"]) .drawer-surface,
      :host([placement="auto"]) .drawer-surface {
        display: grid;
        grid-template-columns: 1fr min(var(--yn-drawer-width), 100vw);
        grid-template-rows: 1fr;
        align-items: stretch;
        justify-content: initial;
      }

      :host([placement="right"]) .backdrop,
      :host([placement="auto"]) .backdrop {
        grid-column: 1 / -1;
        grid-row: 1;
      }

      :host([placement="right"]) .backdrop-extra:not(.backdrop-extra--empty),
      :host([placement="auto"]) .backdrop-extra:not(.backdrop-extra--empty) {
        display: flex;
        align-items: center;
        justify-content: center;
        grid-column: 1;
        grid-row: 1;
        z-index: 1;
        min-width: 0;
        padding: var(--yn-drawer-backdrop-extra-padding);
        pointer-events: auto;
        overflow: auto;
      }

      :host([placement="right"]) .panel,
      :host([placement="auto"]) .panel {
        grid-column: 2;
        grid-row: 1;
        position: relative;
        width: 100%;
        max-width: none;
      }

      :host([placement="bottom"]) .backdrop-extra {
        display: none;
      }
    }

    /* 窄屏 / placement=bottom：底部弹出，高度随内容 */
    @media (max-width: 1023px) {
      :host([placement="bottom"]),
      :host([placement="auto"]) {
        .drawer-surface {
          align-items: flex-end;
          justify-content: center;
        }

        .panel {
          width: 100%;
          max-width: 100vw;
          height: var(--yn-drawer-sheet-height);
          max-height: min(95vh, 100dvh);
          transform: translateY(100%);
          opacity: 1;
          border-radius: var(--yn-drawer-mobile-radius) var(--yn-drawer-mobile-radius) 0 0;
          box-shadow: var(--yn-drawer-mobile-shadow);
          transition: transform var(--yn-drawer-open-duration) var(--yn-drawer-open-ease);
        }

        :host([sheet-height="auto"]) .panel {
          height: auto;
        }

        .drawer-popover.visible .panel {
          transform: translateY(0);
        }

        .drawer-popover.closing .panel {
          transform: translateY(100%);
          opacity: 1;
          transition: transform var(--yn-drawer-close-duration) var(--yn-drawer-close-ease);
        }

        .body {
          flex: 1;
          min-height: 0;
          overflow: auto;
        }

        :host([sheet-height="auto"]) .body {
          flex: 0 1 auto;
          overflow: visible;
        }

        .footer--empty {
          display: none;
        }
      }
    }

    @media (min-width: 1024px) {
      :host([placement="bottom"]) .drawer-surface {
        align-items: flex-end;
        justify-content: center;
      }

      :host([placement="bottom"]) .panel {
        width: 100%;
        height: var(--yn-drawer-sheet-height);
        max-height: min(95vh, 100dvh);
        transform: translateY(100%);
        border-radius: var(--yn-drawer-mobile-radius) var(--yn-drawer-mobile-radius) 0 0;
      }

      :host([placement="bottom"][sheet-height="auto"]) .panel {
        height: auto;
      }

      :host([placement="bottom"]) .body {
        flex: 1;
        min-height: 0;
        overflow: auto;
      }

      :host([placement="bottom"][sheet-height="auto"]) .body {
        flex: 0 1 auto;
        overflow: visible;
      }

      :host([placement="bottom"]) .drawer-popover.visible .panel {
        transform: translateY(0);
      }

      :host([placement="bottom"]) .drawer-popover.closing .panel {
        transform: translateY(100%);
      }
    }

    .header {
      height: 56px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 0 12px 0 16px;
      border-bottom: 1px solid var(--yn-drawer-header-border);
      flex-shrink: 0;
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
      font-size: 18px;
      line-height: 1.3;
      font-weight: 600;
    }

    .close-btn {
      flex-shrink: 0;
    }

    .body {
      flex: 1;
      min-height: 0;
      overflow: auto;
      padding: var(--yn-drawer-body-padding);
    }

    .header-actions {
      display: inline-flex;
      align-items: center;
      flex-shrink: 0;
    }

    .header-actions:empty {
      display: none;
    }

    .footer {
      border-top: 1px solid var(--yn-drawer-footer-border);
      background: var(--yn-drawer-footer-bg);
      padding: 12px 16px;
      flex-shrink: 0;
    }

    .footer--empty {
      display: none;
      border: 0;
      padding: 0;
    }
`;
