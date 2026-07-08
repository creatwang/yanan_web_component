import { LitElement, css, html, unsafeCSS } from "lit";
import { customElement, property } from "lit/decorators.js";
import { applyLitDsd, dedupeShadowDsdContent, ensureRenderRoot } from "../../lib/lit-dsd.js";
import { YN_ICON_BUTTON_SHADOW_STYLES } from "./yn-icon-button-styles.js";
import {
  resolveIconButtonVariant,
  variantStyleVars,
  type YnIconButtonVariant,
} from "./yn-icon-button-variants.js";

const YN_ICON_BUTTON_DSD_DEDUPE = [":scope > .icon-button", ".icon-button"] as const;

export type YnIconButtonSize = "small" | "medium" | "large";
export type YnIconButtonType = "button" | "submit" | "reset";

/**
 * Flutter / Material 风格圆形图标按钮：可配置默认/hover 背景、variant 配色、hit-slop 热区。
 *
 * @slot - 图标内容（SVG 或任意行内元素）
 * @fires click - 点击（非 disabled）
 */
@customElement("yn-icon-button")
export class YnIconButton extends LitElement {
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ type: String, reflect: true }) size: YnIconButtonSize = "medium";
  @property({ type: String, reflect: true }) variant: YnIconButtonVariant = "default";
  @property({ type: String, reflect: true }) type: YnIconButtonType = "button";
  @property({ type: Boolean, reflect: true, attribute: "hit-slop" }) hitSlop = true;
  /** 无障碍标签，同时作为 title */
  @property({ type: String, reflect: true }) label = "";
  /** 有值时渲染为 `<a>`，否则为 `<button>` */
  @property({ type: String }) href = "";

  static styles = css`
    ${unsafeCSS(YN_ICON_BUTTON_SHADOW_STYLES)}
  `;

  private get buttonLabel() {
    return this.label.trim() || "图标按钮";
  }

  private get controlClass() {
    return `icon-button${this.hitSlop ? " hit-slop" : ""}`;
  }

  connectedCallback() {
    super.connectedCallback();
    this.syncVariantDataset();
  }

  private syncVariantDataset() {
    const preset = resolveIconButtonVariant(this.variant);
    this.dataset.hoverMode = preset.hoverMode;
  }

  bootstrapFromDeclarativeShadow() {
    const root = this.shadowRoot;
    if (!root) return;
    dedupeShadowDsdContent(root, [...YN_ICON_BUTTON_DSD_DEDUPE]);
    ensureRenderRoot(this);
    this.syncVariantDataset();
    this.syncDsdDom();
    this.bindDsdControl();
  }

  private bindDsdControl() {
    const root = this.shadowRoot;
    if (!root) return;
    const control = root.querySelector<HTMLButtonElement | HTMLAnchorElement>(".icon-button");
    if (!control || control.dataset.bound === "true") return;
    control.dataset.bound = "true";
    control.addEventListener("click", (event) => {
      if (this.disabled) {
        event.preventDefault();
        event.stopPropagation();
      }
    });
  }

  private syncDsdDom() {
    const root = this.shadowRoot;
    if (!root) return;
    const control = root.querySelector<HTMLButtonElement | HTMLAnchorElement>(".icon-button");
    if (!control) return;
    control.className = this.controlClass;
    control.setAttribute("aria-label", this.buttonLabel);
    control.setAttribute("title", this.buttonLabel);
    control.setAttribute("style", variantStyleVars(this.variant));
    if (control instanceof HTMLButtonElement) {
      control.disabled = this.disabled;
      control.type = this.type;
    } else {
      control.setAttribute("aria-disabled", this.disabled ? "true" : "false");
      if (this.disabled) {
        control.removeAttribute("href");
      } else if (this.href) {
        control.setAttribute("href", this.href);
      }
    }
  }

  updated(changed: Map<string, unknown>) {
    if (changed.has("variant")) {
      this.syncVariantDataset();
    }
    if (
      changed.has("disabled") ||
      changed.has("label") ||
      changed.has("type") ||
      changed.has("href") ||
      changed.has("hitSlop") ||
      changed.has("variant")
    ) {
      this.syncDsdDom();
    }
  }

  private renderInner() {
    return html`
      <span class="bg" aria-hidden="true"></span>
      <span class="hover-surface" aria-hidden="true"></span>
      <span class="ripple-surface" aria-hidden="true"></span>
      <span class="icon"><slot></slot></span>
    `;
  }

  private renderControl() {
    const className = this.controlClass;
    const style = variantStyleVars(this.variant);

    if (this.href && !this.disabled) {
      return html`
        <a
          class=${className}
          style=${style}
          href=${this.href}
          aria-label=${this.buttonLabel}
          title=${this.buttonLabel}
          @click=${this.handleClick}
        >
          ${this.renderInner()}
        </a>
      `;
    }

    return html`
      <button
        class=${className}
        style=${style}
        type=${this.type}
        ?disabled=${this.disabled}
        aria-label=${this.buttonLabel}
        title=${this.buttonLabel}
        @click=${this.handleClick}
      >
        ${this.renderInner()}
      </button>
    `;
  }

  private handleClick = (event: Event) => {
    if (this.disabled) {
      event.preventDefault();
      event.stopPropagation();
    }
  };

  render() {
    return this.renderControl();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "yn-icon-button": YnIconButton;
  }
}

applyLitDsd(YnIconButton, ".icon-button", (el) => el.bootstrapFromDeclarativeShadow(), {
  dedupe: [...YN_ICON_BUTTON_DSD_DEDUPE],
});

export type { YnIconButtonVariant } from "./yn-icon-button-variants.js";
