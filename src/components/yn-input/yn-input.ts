import { LitElement, css, html, unsafeCSS } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { applyLitDsd, dedupeShadowDsdContent, ensureRenderRoot } from "../../lib/lit-dsd.js";
import { YN_INPUT_SHADOW_STYLES } from "./yn-input-styles.js";

const YN_INPUT_DSD_DEDUPE = [":scope > .field", ".field"] as const;

@customElement("yn-input")
export class YnInput extends LitElement {
  @property({ type: String }) value = "";
  @property({ type: String }) placeholder = "请输入内容";
  @property({ type: Boolean }) disabled = false;

  @state() private hasPrefixButton = false;
  @state() private hasSuffixButton = false;

  static styles = css`
    ${unsafeCSS(YN_INPUT_SHADOW_STYLES)}
  `;

  private hasSlotContent(slot: HTMLSlotElement) {
    return slot.assignedElements({ flatten: true }).length > 0;
  }

  private handlePrefixSlotChange = (event: Event) => {
    const slot = event.target as HTMLSlotElement;
    this.hasPrefixButton = this.hasSlotContent(slot);
  };

  private handleSuffixSlotChange = (event: Event) => {
    const slot = event.target as HTMLSlotElement;
    this.hasSuffixButton = this.hasSlotContent(slot);
  };

  override firstUpdated() {
    this.syncSlotButtons();
  }

  private syncSlotButtons() {
    const prefixSlot = this.renderRoot.querySelector<HTMLSlotElement>('slot[name="prefix-button"]');
    const suffixSlot = this.renderRoot.querySelector<HTMLSlotElement>('slot[name="suffix-button"]');
    if (prefixSlot) {
      this.hasPrefixButton = this.hasSlotContent(prefixSlot);
    }
    if (suffixSlot) {
      this.hasSuffixButton = this.hasSlotContent(suffixSlot);
    }
  }

  /** 处理输入事件并对外派发值变化。 */
  private handleInput(event: Event) {
    const nextValue = (event.target as HTMLInputElement).value;
    this.value = nextValue;
    this.dispatchEvent(
      new CustomEvent("yn-input", {
        detail: { value: this.value },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private emitButtonEvent(type: "yn-prefix-click" | "yn-suffix-click") {
    this.dispatchEvent(
      new CustomEvent(type, {
        detail: { value: this.value },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private handleDsdPrefixClick = () => {
    this.emitButtonEvent("yn-prefix-click");
  };

  private handleDsdSuffixClick = () => {
    this.emitButtonEvent("yn-suffix-click");
  };

  bootstrapFromDeclarativeShadow() {
    const root = this.shadowRoot;
    if (!root) return;
    dedupeShadowDsdContent(root, [...YN_INPUT_DSD_DEDUPE]);
    ensureRenderRoot(this);
    root.querySelector<HTMLInputElement>("input.input")?.addEventListener("input", this.handleInput);
    root
      .querySelector('slot[name="prefix-button"]')
      ?.addEventListener("slotchange", this.handlePrefixSlotChange);
    root
      .querySelector('slot[name="suffix-button"]')
      ?.addEventListener("slotchange", this.handleSuffixSlotChange);
    root.querySelector<HTMLButtonElement>(".action-prefix")?.addEventListener("click", this.handleDsdPrefixClick);
    root.querySelector<HTMLButtonElement>(".action-suffix")?.addEventListener("click", this.handleDsdSuffixClick);
    this.syncSlotButtons();
  }

  /** 渲染输入框。 */
  render() {
    const fieldClass = [
      "field",
      this.disabled ? "is-disabled" : "",
      this.hasPrefixButton ? "has-prefix" : "",
      this.hasSuffixButton ? "has-suffix" : "",
    ]
      .filter(Boolean)
      .join(" ");

    return html`
      <div class=${fieldClass}>
        ${this.hasPrefixButton
          ? html`
              <button
                class="action action-prefix"
                type="button"
                ?disabled=${this.disabled}
                aria-label="前置操作"
                @click=${() => this.emitButtonEvent("yn-prefix-click")}
              >
                <slot name="prefix-button" @slotchange=${this.handlePrefixSlotChange}></slot>
              </button>
            `
          : html`
              <slot
                name="prefix-button"
                hidden
                @slotchange=${this.handlePrefixSlotChange}
              ></slot>
            `}
        <input
          class="input"
          .value=${this.value}
          placeholder=${this.placeholder}
          ?disabled=${this.disabled}
          @input=${this.handleInput}
        />
        ${this.hasSuffixButton
          ? html`
              <button
                class="action action-suffix"
                type="button"
                ?disabled=${this.disabled}
                aria-label="后置操作"
                @click=${() => this.emitButtonEvent("yn-suffix-click")}
              >
                <slot name="suffix-button" @slotchange=${this.handleSuffixSlotChange}></slot>
              </button>
            `
          : html`
              <slot
                name="suffix-button"
                hidden
                @slotchange=${this.handleSuffixSlotChange}
              ></slot>
            `}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "yn-input": YnInput;
  }
}

applyLitDsd(YnInput, ".field", (el) => el.bootstrapFromDeclarativeShadow(), {
  dedupe: [...YN_INPUT_DSD_DEDUPE],
});
