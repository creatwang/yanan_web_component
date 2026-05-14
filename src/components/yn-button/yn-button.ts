import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";

type ButtonVariant = "primary" | "success" | "warning" | "danger" | "neutral" | "dark" | "default";
type ButtonSize = "mini" | "small" | "medium";
type ButtonLoadingType = "left" | "center" | "right";

@customElement("yn-button")
export class YnButton extends LitElement {
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ type: String, reflect: true }) variant: ButtonVariant = "primary";
  @property({ type: String, reflect: true }) size: ButtonSize = "medium";
  @property({ type: Boolean, reflect: true }) loading = false;
  @property({ type: String, reflect: true, attribute: "loading-type" }) loadingType: ButtonLoadingType = "left";
  @property({ type: Boolean, reflect: true, attribute: "hit-slop" }) hitSlop = true;

  @state() private hasPrefixSlot = false;
  @state() private hasSuffixSlot = false;

  static styles = css`
    :host {
      display: inline-block;
    }

    .button {
      border: 0;
      background: transparent;
      padding: var(--_yn-button-padding, 12px 16px);
      min-height: var(--_yn-button-min-height, 41px);
      color: var(--_yn-button-color);
      font-size: 14px;
      font-weight: 500;
      line-height: 1.2;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      position: relative;
      transition: background-color 0.2s ease;
    }

    .bg {
      position: absolute;
      inset: 0;
      border-radius: var(--yn-button-radius, min(12px, 12px + 100vw * 0));
      background: var(--yn-button-bg, var(--_yn-button-bg));
      border: 0 solid transparent;
      box-shadow: none;
      opacity: 1;
      transform: scale(1);
      transition: background-color 0.2s ease, transform 0.2s ease, opacity 0.2s ease;
      pointer-events: none;
      z-index: 0;
    }

    .button.hit-slop::before {
      content: "";
      height: calc(100% + 10px);
      left: -5px;
      position: absolute;
      top: -5px;
      width: calc(100% + 10px);
    }

    .content {
      display: inline-flex;
      align-items: center;
      gap: var(--yn-button-content-gap, 6px);
      position: relative;
      z-index: 1;
    }

    .content.icon-only {
      justify-content: center;
      gap: var(--yn-button-icon-only-gap, var(--yn-button-content-gap, 6px));
    }

    .content.icon-only.single-icon {
      gap: 0;
    }

    .icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: var(--yn-button-icon-size, 1em);
      line-height: 1;
      flex-shrink: 0;
    }

    ::slotted(svg[slot="prefix-icon"]),
    ::slotted(svg[slot="suffix-icon"]) {
      width: var(--yn-button-icon-size, 1em);
      height: var(--yn-button-icon-size, 1em);
      display: block;
    }

    .slot-probe {
      display: none;
    }

    .loading-icon {
      width: var(--yn-button-loading-size, var(--_yn-button-loading-size, 18px));
      height: var(--yn-button-loading-size, var(--_yn-button-loading-size, 18px));
      animation: yn-button-loading-rotate 1s linear infinite;
      transform-origin: center;
      display: inline-block;
      line-height: 0;
    }

    .loading-icon svg {
      width: 100%;
      height: 100%;
      display: block;
    }

    .loading-custom {
      width: var(--yn-button-loading-size, var(--_yn-button-loading-size, 18px));
      height: var(--yn-button-loading-size, var(--_yn-button-loading-size, 18px));
      display: inline-flex;
      align-items: center;
      justify-content: center;
      line-height: 0;
    }

    .loading-custom ::slotted(svg) {
      width: 100%;
      height: 100%;
      display: block;
    }

    .loading-center {
      position: absolute;
      inset: 0;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      z-index: 2;
      pointer-events: none;
    }

    @keyframes yn-button-loading-rotate {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }

    .button:hover .bg {
      background: var(--btn-background-color-hover, var(--yn-button-hover-bg, var(--_yn-button-hover-bg)));
      opacity: 1;
      transform: scale(1.03);
    }

    :host([variant="default"]) .bg {
      border-color: #eceef1;
      box-shadow:
        0 1px 2px rgba(36, 31, 33, 0.06),
        0 6px 16px rgba(36, 31, 33, 0.08);
    }

    :host([variant="default"]) .button:hover .bg {
      box-shadow:
        0 2px 6px rgba(36, 31, 33, 0.1),
        0 12px 24px rgba(36, 31, 33, 0.14);
    }

    .button:disabled {
      cursor: not-allowed;
      color: var(--yn-button-disabled-color, var(--_yn-button-disabled-color));
    }

    .button:disabled .bg {
      background: var(--yn-button-disabled-bg, var(--_yn-button-disabled-bg));
      opacity: var(--yn-button-disabled-opacity, 1);
      transform: scale(1);
      box-shadow: none;
    }

    .button:disabled:hover .bg {
      background: var(--yn-button-disabled-bg, var(--_yn-button-disabled-bg));
      opacity: var(--yn-button-disabled-opacity, 1);
      transform: scale(1);
    }

  `;

  /** 获取当前 variant 的基础配色与 hover 配色。 */
  private getVariantColors() {
    switch (this.variant) {
      case "success":
        return {
          bg: "var(--yn-button-success-bg, #C6AF88)",
          hoverBg: "var(--yn-button-success-hover-bg, #B9A079)",
          color: "var(--yn-button-success-color, #241f21)"
        };
      case "warning":
        return {
          bg: "var(--yn-button-warning-bg, #85A1C5)",
          hoverBg: "var(--yn-button-warning-hover-bg, #7593B9)",
          color: "var(--yn-button-warning-color, #241f21)"
        };
      case "danger":
        return {
          bg: "var(--yn-button-danger-bg, #BACFA3)",
          hoverBg: "var(--yn-button-danger-hover-bg, #A9BE91)",
          color: "var(--yn-button-danger-color, #241f21)"
        };
      case "neutral":
        return {
          bg: "var(--yn-button-neutral-bg, #D2CDC4)",
          hoverBg: "var(--yn-button-neutral-hover-bg, #C1BCB3)",
          color: "var(--yn-button-neutral-color, #241f21)"
        };
      case "dark":
        return {
          bg: "var(--yn-button-dark-bg, #241f21)",
          hoverBg: "var(--yn-button-dark-hover-bg, rgba(36,31,33,.8))",
          color: "var(--yn-button-dark-color, #ffffff)"
        };
      case "default":
        return {
          bg: "var(--yn-button-default-bg, #ffffff)",
          hoverBg: "var(--yn-button-default-hover-bg, #f3f4f6)",
          color: "var(--yn-button-default-color, #241f21)"
        };
      case "primary":
      default:
        return {
          bg: "var(--yn-button-primary-bg, #F76C46)",
          hoverBg: "var(--yn-button-primary-hover-bg, #E45F3E)",
          color: "var(--yn-button-primary-color, #241f21)"
        };
    }
  }

  /** 获取按钮尺寸对应的内边距。 */
  private getSizePadding() {
    switch (this.size) {
      case "mini":
        return "3px 10px";
      case "small":
        return "8px 16px";
      case "medium":
      default:
        return "12px 16px";
    }
  }

  /** 获取按钮尺寸对应的最小高度。 */
  private getSizeMinHeight() {
    switch (this.size) {
      case "mini":
        return "23px";
      case "small":
        return "33px";
      case "medium":
      default:
        return "41px";
    }
  }

  /** 获取 loading 图标尺寸。 */
  private getSizeLoadingSize() {
    switch (this.size) {
      case "mini":
        return "14px";
      case "small":
        return "16px";
      case "medium":
      default:
        return "18px";
    }
  }

  /** 获取当前 variant 的禁用态配色。 */
  private getVariantDisabledColors() {
    switch (this.variant) {
      case "success":
        return {
          bg: "var(--yn-button-success-disabled-bg, #DDD2C1)",
          color: "var(--yn-button-success-disabled-color, #625949)"
        };
      case "warning":
        return {
          bg: "var(--yn-button-warning-disabled-bg, #C9D5E4)",
          color: "var(--yn-button-warning-disabled-color, #4D5F78)"
        };
      case "danger":
        return {
          bg: "var(--yn-button-danger-disabled-bg, #D4E2C8)",
          color: "var(--yn-button-danger-disabled-color, #53654A)"
        };
      case "neutral":
        return {
          bg: "var(--yn-button-neutral-disabled-bg, #E4E0D9)",
          color: "var(--yn-button-neutral-disabled-color, #67625A)"
        };
      case "dark":
        return {
          bg: "var(--yn-button-dark-disabled-bg, rgba(36,31,33,0.45))",
          color: "var(--yn-button-dark-disabled-color, rgba(255,255,255,0.85))"
        };
      case "default":
        return {
          bg: "var(--yn-button-default-disabled-bg, #f1f1f1)",
          color: "var(--yn-button-default-disabled-color, #8a8a8a)"
        };
      case "primary":
      default:
        return {
          bg: "var(--yn-button-primary-disabled-bg, #F3C1B4)",
          color: "var(--yn-button-primary-disabled-color, #7A4A40)"
        };
    }
  }

  /** 监听前置图标插槽变化并同步状态。 */
  private handlePrefixSlotChange(event: Event) {
    const slot = event.target as HTMLSlotElement;
    const hasAssigned = slot
      .assignedNodes({ flatten: true })
      .some((node) => node.nodeType !== Node.TEXT_NODE || (node.textContent?.trim() ?? "").length > 0);
    this.hasPrefixSlot = hasAssigned;
  }

  /** 监听后置图标插槽变化并同步状态。 */
  private handleSuffixSlotChange(event: Event) {
    const slot = event.target as HTMLSlotElement;
    const hasAssigned = slot
      .assignedNodes({ flatten: true })
      .some((node) => node.nodeType !== Node.TEXT_NODE || (node.textContent?.trim() ?? "").length > 0);
    this.hasSuffixSlot = hasAssigned;
  }

  /** 判断默认插槽是否存在可见内容。 */
  private hasDefaultSlotContent() {
    return Array.from(this.childNodes).some((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        return (node.textContent?.trim().length ?? 0) > 0;
      }
      if (node.nodeType === Node.ELEMENT_NODE) {
        const slotName = (node as HTMLElement).getAttribute("slot");
        return !slotName;
      }
      return false;
    });
  }

  /** 判断指定命名插槽是否有内容。 */
  private hasNamedSlotContent(slotName: string) {
    return Array.from(this.childNodes).some((node) => {
      if (node.nodeType !== Node.ELEMENT_NODE) return false;
      const el = node as HTMLElement;
      return el.getAttribute("slot") === slotName;
    });
  }

  /** 渲染内置 loading 图标。 */
  private renderLoadingIcon() {
    return html`
      <span class="icon loading-icon" aria-hidden="true">
        <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
          <path
            style="fill:#F4B2B0;"
            d="M371.148,167.139l-26.288-26.288c-5.035-5.035-5.035-13.201,0-18.236l50.359-50.359c5.035-5.035,13.201-5.035,18.236,0l26.288,26.288c5.035,5.035,5.035,13.201,0,18.236l-50.359,50.359C384.347,172.176,376.183,172.176,371.148,167.139z"
          />
          <path
            style="fill:#B3404A;"
            d="M380.265,185.653c-7.38,0-14.318-2.874-19.538-8.092l-26.288-26.288c-5.218-5.218-8.093-12.158-8.093-19.538c0-7.381,2.875-14.321,8.095-19.541l50.357-50.357c5.22-5.218,12.158-8.092,19.539-8.092c7.38,0,14.318,2.874,19.538,8.09l26.288,26.29c5.218,5.217,8.093,12.156,8.093,19.538c0,7.38-2.875,14.319-8.095,19.539l-50.357,50.357C394.586,182.779,387.647,185.653,380.265,185.653z M356.582,131.734l23.683,23.684l47.753-47.755l-23.681-23.684L356.582,131.734z"
          />
          <path
            style="fill:#F4B2B0;"
            d="M98.544,439.743l-26.288-26.288c-5.035-5.035-5.035-13.201,0-18.236l50.359-50.359c5.035-5.035,13.201-5.035,18.236,0l26.288,26.288c5.035,5.035,5.035,13.201,0,18.236l-50.359,50.359C111.745,444.778,103.581,444.778,98.544,439.743z"
          />
          <path
            style="fill:#B3404A;"
            d="M107.663,458.256c-7.38,0-14.318-2.874-19.538-8.092l-26.288-26.29c-5.218-5.217-8.093-12.156-8.093-19.538c0-7.38,2.875-14.319,8.095-19.539l50.357-50.357c5.218-5.218,12.158-8.093,19.539-8.093c7.38,0,14.318,2.874,19.538,8.092l26.288,26.288c5.218,5.218,8.093,12.158,8.093,19.539c0,7.38-2.875,14.319-8.095,19.539l-50.357,50.357C121.981,455.381,115.043,458.256,107.663,458.256z M83.98,404.336l23.681,23.684l47.755-47.755l-23.683-23.684L83.98,404.336z"
          />
          <path
            style="fill:#F4B2B0;"
            d="M344.859,371.148l26.288-26.288c5.035-5.035,13.201-5.035,18.236,0l50.359,50.359c5.035,5.035,5.035,13.201,0,18.236l-26.288,26.288c-5.035,5.035-13.201,5.035-18.236,0l-50.359-50.359C339.824,384.347,339.824,376.183,344.859,371.148z"
          />
          <path
            style="fill:#B3404A;"
            d="M404.337,458.256c-7.382,0-14.319-2.875-19.539-8.093l-50.359-50.359c-5.218-5.22-8.093-12.158-8.093-19.539s2.875-14.321,8.095-19.541l26.285-26.285c5.221-5.22,12.159-8.093,19.539-8.093c7.382,0,14.321,2.875,19.539,8.093l50.359,50.357c5.218,5.22,8.093,12.158,8.093,19.539s-2.875,14.321-8.095,19.541l-26.285,26.285C418.655,455.383,411.717,458.256,404.337,458.256z M356.582,380.265l47.755,47.755l23.681-23.684l-47.753-47.755L356.582,380.265z"
          />
          <path
            style="fill:#F4B2B0;"
            d="M72.257,98.544l26.288-26.288c5.035-5.035,13.201-5.035,18.236,0l50.359,50.359c5.035,5.035,5.035,13.201,0,18.236l-26.288,26.288c-5.035,5.035-13.201,5.035-18.236,0l-50.359-50.357C67.222,111.745,67.222,103.581,72.257,98.544z"
          />
          <path
            style="fill:#B3404A;"
            d="M131.735,185.653c-7.381,0-14.321-2.875-19.539-8.093l-50.359-50.357c-5.218-5.22-8.093-12.158-8.093-19.539c0-7.381,2.875-14.321,8.095-19.541l26.285-26.285c5.221-5.22,12.159-8.093,19.539-8.093c7.381,0,14.319,2.874,19.539,8.092l50.359,50.359c5.218,5.22,8.093,12.158,8.093,19.539c0,7.38-2.875,14.319-8.095,19.539l-26.285,26.285C146.051,182.779,139.113,185.653,131.735,185.653z M83.98,107.663l47.753,47.755l23.683-23.683l-47.753-47.756L83.98,107.663z"
          />
          <path
            style="fill:#B3404A;"
            d="M447.385,302.219h-34.234c-15.236,0-27.632-12.396-27.632-27.631v-37.177c0-15.236,12.396-27.631,27.632-27.631h71.217c15.236,0,27.632,12.396,27.632,27.631v37.177c0,8.139-6.599,14.736-14.736,14.736c-8.137,0-14.736-6.598-14.736-14.736v-35.335h-67.536v33.494h32.394c8.137,0,14.736,6.598,14.736,14.736C462.122,295.623,455.523,302.219,447.385,302.219z"
          />
          <path
            style="fill:#B3404A;"
            d="M98.849,302.219H27.632C12.396,302.219,0,289.823,0,274.589v-37.177c0-8.139,6.599-14.736,14.736-14.736s14.736,6.598,14.736,14.736v35.335h67.536v-33.494H64.267c-8.137,0-14.736-6.598-14.736-14.736c0-8.139,6.599-14.736,14.736-14.736h34.582c15.236,0,27.632,12.396,27.632,27.631v37.177C126.481,289.823,114.085,302.219,98.849,302.219z"
          />
          <path
            style="fill:#B3404A;"
            d="M274.589,512H237.41c-8.137,0-14.736-6.597-14.736-14.736s6.599-14.736,14.736-14.736h35.337v-67.536h-33.494v33.089c0,8.139-6.599,14.736-14.736,14.736s-14.736-6.597-14.736-14.736v-34.931c0-15.236,12.395-27.631,27.631-27.631h37.179c15.236,0,27.631,12.396,27.631,27.631v71.218C302.219,499.604,289.825,512,274.589,512z"
          />
          <path
            style="fill:#B3404A;"
            d="M274.589,126.481H237.41c-15.236,0-27.631-12.396-27.631-27.631v-71.22C209.779,12.395,222.174,0,237.41,0h37.179c8.137,0,14.736,6.598,14.736,14.736s-6.599,14.736-14.736,14.736h-35.337v67.536h33.494V64.795c0-8.139,6.599-14.736,14.736-14.736c8.137,0,14.736,6.598,14.736,14.736v34.054C302.219,114.085,289.825,126.481,274.589,126.481z"
          />
          <path
            style="fill:#B3404A;"
            d="M196.046,270.736h-18.618c-8.137,0-14.736-6.598-14.736-14.736c0-8.139,6.599-14.736,14.736-14.736h18.618c8.137,0,14.736,6.598,14.736,14.736C210.783,264.139,204.185,270.736,196.046,270.736z"
          />
          <path
            style="fill:#B3404A;"
            d="M265.309,270.736H246.69c-8.137,0-14.736-6.598-14.736-14.736c0-8.139,6.599-14.736,14.736-14.736h18.619c8.137,0,14.736,6.598,14.736,14.736C280.045,264.139,273.448,270.736,265.309,270.736z"
          />
          <path
            style="fill:#B3404A;"
            d="M334.57,270.736h-18.618c-8.137,0-14.736-6.598-14.736-14.736c0-8.139,6.599-14.736,14.736-14.736h18.618c8.137,0,14.736,6.598,14.736,14.736C349.307,264.139,342.709,270.736,334.57,270.736z"
          />
        </svg>
      </span>
    `;
  }

  /** 渲染自定义 loading 插槽内容。 */
  private renderCustomLoading(centered: boolean) {
    const className = centered ? "loading-custom" : "icon loading-custom";
    return html`<span class=${className} aria-hidden="true"><slot name="loading"></slot></span>`;
  }

  /** 渲染按钮主体、图标、文案与 loading 内容。 */
  render() {
    const colors = this.getVariantColors();
    const disabledColors = this.getVariantDisabledColors();
    const padding = this.getSizePadding();
    const minHeight = this.getSizeMinHeight();
    const loadingSize = this.getSizeLoadingSize();
    const styleVars = `
      --_yn-button-bg:${colors.bg};
      --_yn-button-hover-bg:${colors.hoverBg};
      --_yn-button-color:${colors.color};
      --_yn-button-padding:${padding};
      --_yn-button-min-height:${minHeight};
      --_yn-button-loading-size:${loadingSize};
      --_yn-button-disabled-bg:${disabledColors.bg};
      --_yn-button-disabled-color:${disabledColors.color};
    `;

    const showPrefix = this.hasPrefixSlot;
    const showSuffix = this.hasSuffixSlot;
    const hasDefaultContent = this.hasDefaultSlotContent();
    const showCenterLoading = this.loading && this.loadingType === "center";
    const showLeftLoading = this.loading && this.loadingType === "left";
    const showRightLoading = this.loading && this.loadingType === "right";
    const hasCustomLoading = this.hasNamedSlotContent("loading");
    const showLabel = hasDefaultContent;
    const showRenderedPrefix = !showCenterLoading && showPrefix && !showLeftLoading;
    const showRenderedSuffix = !showCenterLoading && showSuffix && !showRightLoading;
    const singleIconOnly = !showLabel && (showRenderedPrefix !== showRenderedSuffix || showCenterLoading || showLeftLoading || showRightLoading);
    const contentClass = showLabel ? "content" : `content icon-only${singleIconOnly ? " single-icon" : ""}`;
    const isDisabled = this.disabled || this.loading;

    return html`
      <button
        class=${`button${this.hitSlop ? " hit-slop" : ""}`}
        style=${styleVars}
        ?disabled=${isDisabled}
        aria-busy=${this.loading ? "true" : "false"}
      >
        <span class="bg" aria-hidden="true"></span>
        ${showCenterLoading
          ? html`<span class="loading-center" aria-hidden="true">
              ${hasCustomLoading ? this.renderCustomLoading(true) : this.renderLoadingIcon()}
            </span>`
          : ""}
        <span class=${contentClass}>
          ${!showCenterLoading && showLeftLoading
            ? hasCustomLoading
              ? this.renderCustomLoading(false)
              : this.renderLoadingIcon()
            : ""}
          ${showRenderedPrefix
            ? html`<span class="icon">
                <slot name="prefix-icon" @slotchange=${this.handlePrefixSlotChange}></slot>
              </span>`
            : html`<span class="slot-probe"><slot name="prefix-icon" @slotchange=${this.handlePrefixSlotChange}></slot></span>`}
          ${showLabel ? html`<span class="label"><slot></slot></span>` : ""}
          ${!showCenterLoading && showRightLoading
            ? hasCustomLoading
              ? this.renderCustomLoading(false)
              : this.renderLoadingIcon()
            : ""}
          ${showRenderedSuffix
            ? html`<span class="icon">
                <slot name="suffix-icon" @slotchange=${this.handleSuffixSlotChange}></slot>
              </span>`
            : html`<span class="slot-probe"><slot name="suffix-icon" @slotchange=${this.handleSuffixSlotChange}></slot></span>`}
        </span>
      </button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "yn-button": YnButton;
  }
}
