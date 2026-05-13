import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";

const DEFAULT_SELECTED_ICON = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
<path d="M10 18C14.4182 18 18 14.4182 18 10C18 5.58172 14.4182 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4182 5.58172 18 10 18Z" fill="#241F21"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M14.1207 8.02566L8.86034 13.0355L6 10.3114L7.03448 9.22517L8.17069 10.3073C8.5569 10.6751 9.16379 10.6751 9.55 10.3073L13.0862 6.93945L14.1207 8.02566Z" fill="white"/>
</svg>`;
const DEFAULT_CLOSE_ICON = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
<path d="M10 18C14.4182 18 18 14.4182 18 10C18 5.58172 14.4182 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4182 5.58172 18 10 18Z" fill="none" stroke="#241F21" stroke-width="1.5"/>
</svg>`;

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
  selectedIcon = DEFAULT_SELECTED_ICON;

  @property({ type: String, attribute: "unselected-icon" })
  unselectedIcon = DEFAULT_CLOSE_ICON;

  @property({ type: Boolean, attribute: "show-unselected-icon", reflect: true })
  showUnselectedIcon = false;

  static styles = css`
      :host {
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
        border: var(--yn-pick-border-width, 2px) solid var(--yn-pick-border-color, #000000);
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

  private emitToggle(nextSelected: boolean) {
    this.dispatchEvent(
      new CustomEvent<{ id: string | number; flag: boolean }>("toggle", {
        detail: { id: this.value, flag: nextSelected },
        bubbles: true,
        composed: true
      })
    );
  }

  private handleClick() {
    const nextSelected = !this.selected;
    this.selected = nextSelected;
    this.emitToggle(nextSelected);
  }

  private handleKeydown(event: KeyboardEvent) {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    const nextSelected = !this.selected;
    this.selected = nextSelected;
    this.emitToggle(nextSelected);
  }

  private renderIcon(iconText: string) {
    const source = iconText?.trim() ?? "";
    if (!source) return html``;
    if (source.startsWith("<svg")) {
      return html`${unsafeSVG(source)}`;
    }
    return html`${source}`;
  }

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
