import { LitElement, css, html } from "lit";
import type { PropertyValues } from "lit";
import { customElement, property } from "lit/decorators.js";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";

type ButtonSize = "mini" | "small" | "normal";

type SizeToken = {
  height: number;
  iconSize: number;
  fontSize: number;
  paddingX: number;
  radius: number;
  hoverGap: number;
  safePad: number;
};

@customElement("yn-icon-connect-button")
export class YnIconConnectButton extends LitElement {
  @property({ type: String }) label = "VER PRODUTOS URBAN";
  @property({ type: String, reflect: true }) size: ButtonSize = "normal";
  @property({ type: Boolean }) disabled = false;
  @property({ type: Boolean, reflect: true }) uppercase = true;
  @property({ type: String }) link = "";
  @property({ type: String }) icon =
    '<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10.6208 6.8H14.6611L16.0324 4.51728C16.1311 4.35247 16.1311 4.14705 16.0324 3.98225L14.6611 1.69953H10.6208C10.3337 1.69953 10.1013 1.46719 10.1013 1.18008V0H8.40133V6.28055C8.40133 6.56767 8.16899 6.8 7.88188 6.8H3.44535L2.07402 9.08272C1.97533 9.24753 1.97533 9.45294 2.07402 9.61775L3.44535 11.9005H7.88188C8.16899 11.9005 8.40133 12.1328 8.40133 12.4199V15.3005H2.45133V17.0005H16.0513V15.3005H10.6208C10.3337 15.3005 10.1013 15.0681 10.1013 14.781V7.31991C10.1013 7.0328 10.3337 6.80047 10.6208 6.80047V6.8ZM13.6992 3.4L14.1294 4.11636C14.179 4.19853 14.179 4.30147 14.1294 4.38364L13.6992 5.1H10.1013V3.4H13.6992ZM4.40727 10.2L3.97708 9.48364C3.92749 9.40147 3.92749 9.29853 3.97708 9.21589L4.40727 8.49953H8.4018V10.1995H4.40727V10.2Z" fill="#241F21"/></svg>';

  static styles = css`
      :host {
        display: inline-block;
      }

      .btn {
        position: relative;
        border: 0;
        background: transparent;
        padding: 0;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        height: var(--btn-height, 32px);
        isolation: isolate;
        contain: layout paint;
        color: var(--yn-icon-connect-button-color, #241f21);
        width: max-content;
        text-decoration: none;
      }

      .btn:disabled,
      .btn.is-disabled {
        cursor: not-allowed;
        opacity: 0.6;
        pointer-events: none;
      }

      .svg-wrap {
        position: absolute;
        inset: 0;
        pointer-events: none;
        transform: translateZ(0);
        backface-visibility: hidden;
      }

      .svg {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        fill: var(--yn-icon-connect-button-bg, #ddd967);
        transform: translateZ(0);
        shape-rendering: geometricPrecision;
      }

      .svg path {
        stroke: var(--yn-icon-connect-button-bg, #ddd967);
        stroke-width: 0.65;
        stroke-linejoin: round;
        stroke-linecap: round;
      }

      .content {
        position: relative;
        z-index: 2;
        display: flex;
        align-items: center;
        white-space: nowrap;
        width: max-content;
      }

      .icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        margin-right: 0;
        transform: translateY(-1px);
        transition: transform 0.35s cubic-bezier(0.12, 1.2, 0.16, 2.35),
          margin-right 0.45s cubic-bezier(0.215, 0.61, 0.355, 1);
        line-height: 1;
      }

      .icon-svg {
        width: 18px;
        height: 18px;
        display: block;
      }

      .label {
        font-weight: 700;
        letter-spacing: 0.03em;
        text-transform: var(--yn-icon-connect-button-text-transform, uppercase);
        line-height: 1;
      }

      .btn:not(:disabled):not(.is-disabled):hover .icon,
      .btn:not(:disabled):not(.is-disabled):focus-visible .icon {
        transform: translateY(-1px) scale(1.12);
        margin-right: var(--icon-gap-hover, 16px);
      }

      .btn:focus-visible {
        outline: 2px solid #e8f0ff;
        outline-offset: 3px;
      }
    `;

  /** 首次渲染后同步 SVG 外形到当前内容尺寸。 */
  protected firstUpdated() {
    requestAnimationFrame(() => this.syncShapeToContent());
  }

  /** 相关属性变化后重算按钮外形。 */
  protected updated(changedProperties: PropertyValues<this>) {
    if (changedProperties.has("label") || changedProperties.has("size") || changedProperties.has("disabled") || changedProperties.has("link")) {
      requestAnimationFrame(() => this.syncShapeToContent());
    }
  }

  /** 获取当前 size 对应的尺寸令牌。 */
  private getSizeToken(): SizeToken {
    switch (this.size) {
      case "mini":
        return {
          height: 36,
          iconSize: 36,
          fontSize: 12,
          paddingX: 12,
          radius: 13,
          hoverGap: 12,
          safePad: 4
        };
      case "small":
        return {
          height: 40,
          iconSize: 40,
          fontSize: 13,
          paddingX: 14,
          radius: 14,
          hoverGap: 14,
          safePad: 4
        };
      case "normal":
      default:
        return {
          height: 44,
          iconSize: 44,
          fontSize: 14,
          paddingX: 16,
          radius: 15,
          hoverGap: 16,
          safePad: 4
        };
    }
  }

  /** 构建左侧圆角块路径。 */
  private buildLeftPath(iconSize: number): string {
    const s = iconSize / 44;
    const r = 14.96 * s;
    const inner = 29.04 * s;
    return `M0 ${r} A${r} ${r} 0 0 1 ${r} 0 L${inner} 0 A${r} ${r} 0 0 1 ${iconSize} ${r} L${iconSize} ${inner} A${r} ${r} 0 0 1 ${inner} ${iconSize} L${r} ${iconSize} A${r} ${r} 0 0 1 0 ${inner} Z`;
  }

  /** 构建右侧可延展矩形路径。 */
  private buildRightPath(startX: number, totalWidth: number, scale: number): string {
    const r = 14.8909375 * scale;
    const yTopArc = 14.9846875 * scale;
    const yBottomArc = 28.9996875 * scale;
    const yTop = 0.09375 * scale;
    const yBottom = 43.890625 * scale;
    const leftInner = startX + r;
    const rightInner = totalWidth - r;
    return `M${startX} ${yTopArc} A${r} ${r} 0 0 1 ${leftInner} ${yTop} L${rightInner} ${yTop} A${r} ${r} 0 0 1 ${totalWidth} ${yTopArc} L${totalWidth} ${yBottomArc} A${r} ${r} 0 0 1 ${rightInner} ${yBottom} L${leftInner} ${yBottom} A${r} ${r} 0 0 1 ${startX} ${yBottomArc} Z`;
  }

  /** 构建中间桥接路径（hover/normal 两态）。 */
  private buildBridgePath(iconSize: number, scale: number, hovered: boolean): string {
    const relX = hovered
      ? [-1.81852211, 3.49944227, 12.41483738, 17.71995921, 17.71655325, 12.41329441, 3.49790041, -1.82193752]
      : [-1.2498674, -0.57586628, 0.48534482, 1.15833017, 1.15396508, 0.481334, -0.57988394, -1.25424138];
    const y = hovered
      ? [35.09065849, 27.90771427, 27.91013134, 35.05123287, 8.93772806, 16.08021324, 16.08628633, 8.9047296]
      : [34.28546539, 33.28423269, 33.26394132, 34.25913786, 9.73169462, 10.72713063, 10.70903226, 9.70803952];
    const x = relX.map((v) => iconSize + v * scale);
    const ys = y.map((v) => v * scale);
    return `M${x[0]} ${ys[0]} C${x[1]} ${ys[1]},${x[2]} ${ys[2]},${x[3]} ${ys[3]} L${x[4]} ${ys[4]} C${x[5]} ${ys[5]},${x[6]} ${ys[6]},${x[7]} ${ys[7]} Z`;
  }

  /** 根据文本宽度与状态同步 SVG 路径及动画 values。 */
  private syncShapeToContent() {
    const btn = this.shadowRoot?.querySelector<HTMLElement>(".btn");
    const svg = this.shadowRoot?.querySelector<SVGElement>(".svg");
    const labelEl = this.shadowRoot?.querySelector<HTMLElement>(".label");
    const leftRect = this.shadowRoot?.querySelector<SVGPathElement>("#leftRect");
    const bridge = this.shadowRoot?.querySelector<SVGPathElement>("#bridge");
    const rightRect = this.shadowRoot?.querySelector<SVGPathElement>("#rightRect");
    const rectIn = this.shadowRoot?.querySelector<SVGAnimateElement>("#rectIn");
    const rectOut = this.shadowRoot?.querySelector<SVGAnimateElement>("#rectOut");
    const bridgeIn = this.shadowRoot?.querySelector<SVGAnimateElement>("#bridgeIn");
    const bridgeOut = this.shadowRoot?.querySelector<SVGAnimateElement>("#bridgeOut");

    if (!btn || !svg || !labelEl || !leftRect || !bridge || !rightRect || !rectIn || !rectOut || !bridgeIn || !bridgeOut) {
      return;
    }

    const token = this.getSizeToken();
    const scale = token.height / 44;
    const labelWidth = Math.ceil(labelEl.getBoundingClientRect().width);
    const widthStart = Math.max(token.iconSize + token.paddingX * 2 + 8, token.iconSize + labelWidth + token.safePad);
    const widthEnd = widthStart + token.hoverGap;
    const leftPath = this.buildLeftPath(token.iconSize);
    const rectStart = this.buildRightPath(token.iconSize, widthStart, scale);
    const rectEnd = this.buildRightPath(token.iconSize + token.hoverGap, widthEnd, scale);
    const bridgeStart = this.buildBridgePath(token.iconSize, scale, false);
    const bridgeEnd = this.buildBridgePath(token.iconSize, scale, true);

    svg.setAttribute("viewBox", `0 0 ${widthEnd} ${token.height}`);
    btn.style.width = `${widthEnd}px`;

    const interactive = !this.disabled;
    const hovered = interactive && btn.matches(":hover");

    leftRect.setAttribute("d", leftPath);
    bridge.setAttribute("d", hovered ? bridgeEnd : bridgeStart);
    rightRect.setAttribute("d", hovered ? rectEnd : rectStart);
    bridgeIn.setAttribute("values", `${bridgeStart};${bridgeEnd}`);
    bridgeOut.setAttribute("values", `${bridgeEnd};${bridgeStart}`);
    rectIn.setAttribute("values", `${rectStart};${rectEnd}`);
    rectOut.setAttribute("values", `${rectEnd};${rectStart}`);
  }

  /** 链接模式下阻止 disabled 状态跳转。 */
  private handleAnchorClick(event: MouseEvent) {
    if (!this.disabled) return;
    event.preventDefault();
    event.stopPropagation();
  }

  /** 渲染默认图标或 SVG 字符串图标。 */
  private renderIconFallback() {
    const iconText = this.icon?.trim() ?? "";
    if (!iconText) return html``;
    if (iconText.startsWith("<svg")) {
      return html`${unsafeSVG(iconText)}`;
    }
    return html`${iconText}`;
  }

  /** 渲染链接/按钮两种形态及内部动画结构。 */
  render() {
    const token = this.getSizeToken();
    const hostStyle = `
      --btn-height:${token.height}px;
      --icon-size:${token.iconSize}px;
      --label-padding-x:${token.paddingX}px;
      --label-font-size:${token.fontSize}px;
      --icon-gap-hover:${token.hoverGap}px;
      --yn-icon-connect-button-text-transform:${this.uppercase ? "uppercase" : "none"};
    `;
    const content = html`
        <span class="svg-wrap">
          <svg class="svg" viewBox="0 0 220 44" preserveAspectRatio="none" aria-hidden="true">
            <path id="bridge" d=""></path>
            <path id="leftRect" d=""></path>
            <path id="rightRect" d="">
              <animate
                id="rectIn"
                attributeName="d"
                begin="btn.mouseenter;btn.focusin"
                dur="0.45s"
                fill="freeze"
                restart="always"
                calcMode="spline"
                keySplines=".215 .61 .355 1"
                keyTimes="0;1"
                values=""
              ></animate>
              <animate
                id="rectOut"
                attributeName="d"
                begin="btn.mouseleave;btn.focusout"
                dur="0.45s"
                fill="freeze"
                restart="always"
                calcMode="spline"
                keySplines=".215 .61 .355 1"
                keyTimes="0;1"
                values=""
              ></animate>
            </path>
            <animate
              id="bridgeIn"
              href="#bridge"
              attributeName="d"
              begin="btn.mouseenter;btn.focusin"
              dur="0.45s"
              fill="freeze"
              restart="always"
              calcMode="spline"
              keySplines=".215 .61 .355 1"
              keyTimes="0;1"
              values=""
            ></animate>
            <animate
              id="bridgeOut"
              href="#bridge"
              attributeName="d"
              begin="btn.mouseleave;btn.focusout"
              dur="0.45s"
              fill="freeze"
              restart="always"
              calcMode="spline"
              keySplines=".215 .61 .355 1"
              keyTimes="0;1"
              values=""
            ></animate>
          </svg>
        </span>
        <span class="content" aria-hidden="true" style=${`height:${token.height}px;`}>
          <span class="icon" style=${`width:${token.iconSize}px;`}>
            <slot name="icon">${this.renderIconFallback()}</slot>
          </span>
          <span class="label" style=${`padding:0 ${token.paddingX}px;font-size:${token.fontSize}px;`}>
            <slot name="label">${this.label}</slot>
          </span>
        </span>
    `;

    if (this.link) {
      return html`
        <a
          id="btn"
          class=${`btn ${this.disabled ? "is-disabled" : ""}`}
          style=${hostStyle}
          href=${this.link}
          aria-label=${this.label}
          aria-disabled=${this.disabled ? "true" : "false"}
          tabindex=${this.disabled ? "-1" : "0"}
          @click=${this.handleAnchorClick}
        >
          ${content}
        </a>
      `;
    }

    return html`
      <button
        id="btn"
        class="btn"
        style=${hostStyle}
        type="button"
        ?disabled=${this.disabled}
        aria-label=${this.label}
      >
        ${content}
      </button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "yn-icon-connect-button": YnIconConnectButton;
  }
}
