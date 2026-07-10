/** Shadow DOM styles — Lit + DSD SSR shared */
export const YN_SEARCH_SHADOW_STYLES = `
:host {
        --yn-search-bg-active: var(--yn-color-surface-hover, rgba(255, 255, 255, 0.96));
        --yn-search-bg-idle: transparent;
        --yn-search-icon-color: var(--yn-color-text, #241f21);
        --yn-search-field-bg: var(--bg-fill, transparent);
        --yn-search-field-color: var(--yn-color-text-muted, rgba(36, 31, 33, 0.7));
        --yn-search-caret-color: var(--yn-color-text, #241f21);
        --yn-search-placeholder-color: var(--yn-color-text-muted, rgba(36, 31, 33, 0.6));
        --yn-search-fill-duration: 220ms;
        --yn-search-fill-ease: cubic-bezier(0.4, 0, 1, 1);
        --yn-search-icon-duration: 220ms;
        --yn-search-icon-ease: cubic-bezier(0.4, 0, 1, 1);
        display: inline-block;
        vertical-align: top;
        overflow: visible;
        flex-shrink: 0;
        max-width: 100%;
      }

      :host([expand-direction="right"]) {
        align-self: flex-start;
      }

      :host([expand-direction="left"]) {
        display: inline-flex;
        justify-content: flex-end;
        align-self: flex-start;
        margin-left: auto;
        overflow: hidden;
      }

      @font-face {
        font-family: "Zimula";
        src: url("https://www.floema.com/_nuxt/Zimula-Variable.Cb2n2uX-.ttf") format("truetype");
        font-display: swap;
      }

      * {
        box-sizing: border-box;
      }

      .search-shell {
        position: relative;
        height: 38px;
        --bg-fill: var(--yn-search-bg-idle);
        overflow: hidden;
      }

      .search-shell.animating {
        overflow: visible;
      }

      .search-shell.expand-left {
        overflow: hidden;
      }

      .search-shell.expand-left.animating:not(.layout-expanding) {
        overflow: visible;
      }

      .search-shell.expand-left.animating.layout-expanding {
        overflow: hidden;
      }

      .search-shell.open.animating:not(.layout-expanding) .dynamic-wrap {
        visibility: hidden;
      }

      .search-shell:not(.open):not(.animating) .dynamic-wrap {
        display: none;
      }

      .search-shell.open .dynamic-wrap,
      .search-shell.animating .dynamic-wrap {
        display: block;
      }

      .search-shell.open,
      .search-shell:has(.toggle-btn:hover),
      .search-shell:has(.toggle-btn:focus-visible) {
        --bg-fill: var(--yn-search-bg-active);
      }

      .left-shape {
        position: absolute;
        top: 0;
        left: 0;
        width: 44px;
        height: 38px;
        fill: var(--bg-fill);
        transition: fill var(--yn-search-fill-duration, 260ms) var(--yn-search-fill-ease, cubic-bezier(0.2, 0, 0.2, 1));
      }

      .left-shape path {
        stroke: var(--bg-fill);
        stroke-width: 0.65;
        stroke-linejoin: round;
        stroke-linecap: round;
        transition:
          fill var(--yn-search-fill-duration, 260ms) var(--yn-search-fill-ease, cubic-bezier(0.2, 0, 0.2, 1)),
          stroke var(--yn-search-fill-duration, 260ms) var(--yn-search-fill-ease, cubic-bezier(0.2, 0, 0.2, 1));
      }

      .dynamic-wrap {
        position: absolute;
        top: 0;
        left: 44px;
        height: 38px;
        overflow: hidden;
        opacity: 1;
        pointer-events: none;
      }

      .search-shell.open .dynamic-wrap {
        opacity: 1;
        pointer-events: auto;
      }

      .shape {
        position: absolute;
        top: 0;
        left: 0;
        height: 38px;
        fill: var(--bg-fill);
        transition: fill var(--yn-search-fill-duration, 260ms) var(--yn-search-fill-ease, cubic-bezier(0.2, 0, 0.2, 1));
      }

      .shape path {
        stroke: var(--bg-fill);
        stroke-width: 0.65;
        stroke-linejoin: round;
        stroke-linecap: round;
        transition:
          fill var(--yn-search-fill-duration, 260ms) var(--yn-search-fill-ease, cubic-bezier(0.2, 0, 0.2, 1)),
          stroke var(--yn-search-fill-duration, 260ms) var(--yn-search-fill-ease, cubic-bezier(0.2, 0, 0.2, 1));
      }

      .search-shell.expand-left .toggle-btn {
        left: auto;
        right: 0;
      }

      .search-shell.expand-left .left-shape {
        left: auto;
        right: 0;
        transform: scaleX(-1);
      }

      .search-shell.expand-left .dynamic-wrap {
        left: auto;
        right: 44px;
      }

      .search-shell.expand-left .search-input {
        margin-left: 10px;
        margin-right: 0;
      }

      .search-shell.expand-left.open:not(.animating) .field {
        opacity: 1;
        transform: translateX(0px);
      }

      .search-shell.expand-left.animating .field {
        opacity: 0;
        transform: translateX(0px);
      }

      .search-shell.expand-left:not(.open):not(.animating) .field {
        opacity: 0;
        transform: translateX(0px);
      }

      .toggle-btn {
        position: absolute;
        left: 0;
        top: 0;
        width: 44px;
        height: 38px;
        border: 0;
        background: transparent;
        color: var(--yn-search-icon-color);
        cursor: pointer;
        display: grid;
        place-items: center;
        z-index: 2;
      }

      .toggle-btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .icon {
        position: absolute;
        width: 20px;
        height: 20px;
        transition:
          opacity var(--yn-search-icon-duration, 260ms) var(--yn-search-icon-ease, cubic-bezier(0.2, 0.8, 0.2, 1)),
          transform var(--yn-search-icon-duration, 260ms) var(--yn-search-icon-ease, cubic-bezier(0.2, 0.8, 0.2, 1));
      }

      .icon.search {
        opacity: 1;
        transform: scale(1);
      }

      .icon.close {
        opacity: 0;
        transform: scale(0.7) rotate(-80deg);
      }

      .search-shell.open .toggle-btn .icon.search {
        opacity: 0;
        transform: scale(0.7) rotate(80deg);
      }

      .search-shell.open .toggle-btn .icon.close {
        opacity: 1;
        transform: scale(1) rotate(0deg);
      }

      .search-input {
        position: absolute;
        top: 0;
        left: 0;
        margin-left: 10px;
      }

      .search-input .inner {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 38px;
        padding: 2px 10px;
        pointer-events: none;
        background: var(--yn-search-field-bg, transparent);
        border-radius: inherit;
      }

      .search-shell.open .search-input .inner {
        pointer-events: auto;
      }

      .field {
        width: 100%;
        border: 0;
        outline: 0;
        background: var(--yn-search-field-bg, transparent);
        color: var(--yn-search-field-color, var(--yn-color-text-muted, #241f21b3));
        font-family: "Zimula", Arial, "PingFang SC", "Microsoft YaHei", sans-serif;
        font-size: clamp(12px, 10.83px + 100vw * 0.003, 16px);
        font-variation-settings: "cnct" 1000, "wght" 500;
        letter-spacing: -0.02em;
        line-height: 1.4em;
        caret-color: var(--yn-search-caret-color, var(--yn-color-text, #241f21));
        padding-left: 3px;
        opacity: 0;
        transform: translateX(-10px);
        transition: none;
      }

      .search-shell:not(.open):not(.animating) .field {
        opacity: 0;
        transform: translateX(-12px);
      }

      .search-shell.open .field {
        opacity: 1;
        transform: translateX(0px);
      }

      .field::placeholder {
        color: var(--yn-search-placeholder-color, var(--yn-color-text-muted, #241f2199));
      }

      .field::-webkit-calendar-picker-indicator {
        display: none !important;
        -webkit-appearance: none;
      }

      .datalist-slot {
        display: none;
      }

      @media only screen and (max-width: 1023px) {
        .field,
        .field::placeholder {
          font-size: 16px;
        }
      }
`;
