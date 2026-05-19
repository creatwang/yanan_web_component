import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";
import type { YnSvgSource } from "../../asset/svg";
import { ynPickSelectedSvg, ynPickUnselectedSvg } from "../../asset/svg";

const parsePrimitiveValue = (raw: string | null): string | number => {
  if (raw === null) return "";
  const value = raw.trim();
  if (value === "") return "";
  if (/^-?\d+(\.\d+)?$/.test(value)) {
    return Number(value);
  }
  return value;
};

@customElement("yn-pick")
export class YnPick extends LitElement {
  @property({
    attribute: "value",
    converter: {
      fromAttribute: (value) => parsePrimitiveValue(value),
      toAttribute: (value) => String(value ?? "")
    }
  })
  value: string | number = "";

  @property({ type: Boolean, reflect: true })
  selected = false;

  @property({ type: Boolean, reflect: true })
  border = true;

  @property({ type: String, attribute: "selected-icon" })
  selectedIcon: YnSvgSource = ynPickSelectedSvg;

  @property({ type: String, attribute: "unselected-icon" })
  unselectedIcon: YnSvgSource = ynPickUnselectedSvg;

  @property({ type: Boolean, attribute: "show-unselected-icon", reflect: true })
  showUnselectedIcon = false;

  static styles = css`
      :host {
        --yn-pick-border-color: var(--yn-color-border-focus, #241f21);
        display: inline-block;
      }

      .wrap {
        position: relative;
        display: inline-block;
        cursor: pointer;
      }

      .wrap.with-border::after {
        content: "";
        position: absolute;
        inset: 0;
        pointer-events: none;
        border: var(--yn-pick-border-width, 2px) solid var(--yn-pick-border-color, var(--yn-color-border-focus, #241f21));
        border-radius: var(--yn-pick-border-radius, 8px);
        box-sizing: border-box;
      }

      .slot-wrap {
        position: relative;
        display: inline-block;
      }

      .icon {
        position: absolute;
        top: 6px;
        right: 6px;
        z-index: 2;
        width: 20px;
        height: 20px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
    `;

  /** 派发选中状态切换事件。 */
  private emitToggle(nextSelected: boolean) {
    this.dispatchEvent(
      new CustomEvent<{ id: string | number; flag: boolean }>("toggle", {
        detail: { id: this.value, flag: nextSelected },
        bubbles: true,
        composed: true
      })
    );
  }

  /** 处理点击切换选中态。 */
  private handleClick() {
    const nextSelected = !this.selected;
    this.selected = nextSelected;
    this.emitToggle(nextSelected);
  }

  /** 处理键盘 Enter/Space 切换选中态。 */
  private handleKeydown(event: KeyboardEvent) {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    const nextSelected = !this.selected;
    this.selected = nextSelected;
    this.emitToggle(nextSelected);
  }

  /** 渲染图标字符串（支持 SVG 文本）。 */
  private renderIcon(iconText: string) {
    const source = iconText?.trim() ?? "";
    if (!source) return html``;
    if (source.startsWith("<svg")) {
      return html`${unsafeSVG(source)}`;
    }
    return html`${source}`;
  }

  /** 渲染 pick 容器、状态图标与插槽内容。 */
  render() {
    const classes = [
      "wrap",
      this.border ? "with-border" : "",
      this.selected ? "selected" : ""
    ]
      .filter(Boolean)
      .join(" ");

    return html`
      <div class=${classes} role="button" tabindex="0" @click=${this.handleClick} @keydown=${this.handleKeydown}>
        ${this.selected
          ? html`<span class="icon selected" aria-hidden="true">${this.renderIcon(this.selectedIcon)}</span>`
          : this.showUnselectedIcon && this.unselectedIcon
            ? html`<span class="icon unselected" aria-hidden="true">${this.renderIcon(this.unselectedIcon)}</span>`
            : null}
        <div class="slot-wrap">
          <slot></slot>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "yn-pick": YnPick;
  }
}
