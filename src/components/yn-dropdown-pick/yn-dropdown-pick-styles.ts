/** Shadow DOM styles — Lit + DSD SSR shared */
export const YN_DROPDOWN_PICK_SHADOW_STYLES = `
:host {
      display: inline-block;
      position: relative;
      --yn-dropdown-pick-panel-bg: var(--yn-color-bg, #f2efea);
      --yn-dropdown-pick-panel-radius: 12px;
      --yn-dropdown-pick-panel-padding: 6px;
      --yn-dropdown-pick-gap: 6px;
      --yn-dropdown-pick-item-selected-bg: var(--yn-color-bg-muted, #e6e1d8);
      --yn-dropdown-pick-item-content-right-space: 34px;
      --yn-dropdown-pick-button-radius: 10px;
      --yn-dropdown-pick-trigger-font-size: 12px;
      --yn-dropdown-pick-trigger-font-weight: 600;
      --yn-dropdown-pick-shadow: var(--yn-color-shadow-md, 0 10px 24px rgba(36, 31, 33, 0.14));
      --yn-dropdown-pick-button-bg: var(--yn-color-surface, #f8f6f2);
      --yn-dropdown-pick-button-color: var(--yn-color-text, #241f21);
      --yn-dropdown-pick-open-button-bg: var(--yn-color-inverse-bg, #241f21);
      --yn-dropdown-pick-open-button-color: var(--yn-color-on-inverse, #ffffff);
      --yn-dropdown-pick-item-hover-bg: var(--yn-color-surface-hover, #ebe7df);
      --yn-dropdown-pick-check-bg: var(--yn-color-inverse-bg, #241f21);
      --yn-dropdown-pick-check-color: var(--yn-color-on-inverse, #ffffff);
    }

    .root {
      position: relative;
      display: inline-block;
    }

    .trigger {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      border: none;
      border-radius: var(--yn-dropdown-pick-button-radius, 10px);
      padding: 6px 10px;
      min-height: 28px;
      cursor: pointer;
      background: var(--_btn-bg);
      color: var(--_btn-color);
      transition: background-color 180ms ease, color 180ms ease;
      font-size: var(--yn-dropdown-pick-trigger-font-size, 12px);
      font-weight: var(--yn-dropdown-pick-trigger-font-weight, 600);
      line-height: 1;
      white-space: nowrap;
    }

    .trigger:disabled {
      opacity: 0.55;
      cursor: not-allowed;
    }

    .caret {
      width: 10px;
      height: 10px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transform: rotate(0deg);
      transition: transform 180ms ease;
      transform-origin: center;
    }

    .caret.open {
      transform: rotate(180deg);
    }

    .panel {
      position: absolute;
      top: calc(100% + 8px);
      right: 0;
      min-width: var(--_panel-min-width);
      padding: var(--yn-dropdown-pick-panel-padding, 6px);
      border-radius: var(--yn-dropdown-pick-panel-radius, 12px);
      background: var(--yn-dropdown-pick-panel-bg, #f2efea);
      box-shadow: var(--yn-dropdown-pick-shadow, 0 10px 24px rgba(36, 31, 33, 0.14));
      opacity: 0;
      transform: translate3d(0, -8px, 0);
      visibility: hidden;
      pointer-events: none;
      transition: transform 220ms cubic-bezier(0.22, 0.78, 0.24, 1), opacity 220ms cubic-bezier(0.22, 0.78, 0.24, 1);
      z-index: 1200;
    }

    .panel.open {
      opacity: 1;
      transform: translate3d(0, 0, 0);
      visibility: visible;
      pointer-events: auto;
    }

    .pick-list {
      display: flex;
      flex-direction: column;
      gap: var(--yn-dropdown-pick-gap, 6px);
    }

    ::slotted(yn-pick) {
      display: block;
      width: 100%;
    }
`;
