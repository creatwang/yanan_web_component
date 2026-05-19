import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";
import { ynButtonLoadingSvg } from "../../asset/svg";

type ButtonVariant = "primary" | "success" | "warning" | "danger" | "neutral" | "dark" | "default";
type ButtonSize = "mini" | "small" | "medium";
type ButtonLoadingType = "left" | "center" | "right";

/**
 * 通用按钮：通过 `variant`、`size` 控制外观，`loading` 显示加载态。
 *
 * @slot - 按钮主文案
 * @slot prefix-icon - 主文案前的图标
 * @slot suffix-icon - 主文案后的图标
 * @slot loading - 自定义 loading 图标
 */
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
      border-color: var(--yn-color-border, #eceef1);
      box-shadow: var(--yn-color-shadow-sm);
    }

    :host([variant="default"]) .button:hover .bg {
      box-shadow: var(--yn-color-shadow-md);
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
          color: "var(--yn-button-success-color, var(--yn-color-text, #241f21))"
        };
      case "warning":
        return {
          bg: "var(--yn-button-warning-bg, #85A1C5)",
          hoverBg: "var(--yn-button-warning-hover-bg, #7593B9)",
          color: "var(--yn-button-warning-color, var(--yn-color-text, #241f21))"
        };
      case "danger":
        return {
          bg: "var(--yn-button-danger-bg, #BACFA3)",
          hoverBg: "var(--yn-button-danger-hover-bg, #A9BE91)",
          color: "var(--yn-button-danger-color, var(--yn-color-text, #241f21))"
        };
      case "neutral":
        return {
          bg: "var(--yn-button-neutral-bg, #D2CDC4)",
          hoverBg: "var(--yn-button-neutral-hover-bg, #C1BCB3)",
          color: "var(--yn-button-neutral-color, var(--yn-color-text, #241f21))"
        };
      case "dark":
        return {
          bg: "var(--yn-button-dark-bg, var(--yn-color-inverse-bg, #241f21))",
          hoverBg: "var(--yn-button-dark-hover-bg, var(--yn-color-inverse-bg-hover, rgba(36, 31, 33, 0.8)))",
          color: "var(--yn-button-dark-color, var(--yn-color-on-inverse, #ffffff))"
        };
      case "default":
        return {
          bg: "var(--yn-button-default-bg, var(--yn-color-bg-elevated, #ffffff))",
          hoverBg: "var(--yn-button-default-hover-bg, var(--yn-color-bg-muted, #f3f4f6))",
          color: "var(--yn-button-default-color, var(--yn-color-text, #241f21))"
        };
      case "primary":
      default:
        return {
          bg: "var(--yn-button-primary-bg, var(--yn-color-primary, #f76c46))",
          hoverBg: "var(--yn-button-primary-hover-bg, var(--yn-color-primary-hover, #e45f3e))",
          color: "var(--yn-button-primary-color, var(--yn-color-text, #241f21))"
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
          bg: "var(--yn-button-dark-disabled-bg, var(--yn-color-inverse-bg-hover, rgba(36, 31, 33, 0.45)))",
          color: "var(--yn-button-dark-disabled-color, var(--yn-color-on-inverse, rgba(255, 255, 255, 0.85)))"
        };
      case "default":
        return {
          bg: "var(--yn-button-default-disabled-bg, var(--yn-color-disabled-bg, #f1f1f1))",
          color: "var(--yn-button-default-disabled-color, var(--yn-color-disabled-text, #8a8a8a))"
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
        ${unsafeSVG(ynButtonLoadingSvg)}
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
