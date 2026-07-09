import { LitElement, css, html, nothing, svg, unsafeCSS } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { applyLitDsd, dedupeShadowDsdContent, ensureRenderRoot } from "../../lib/lit-dsd.js";
import { YN_INPUT_SHADOW_STYLES } from "./yn-input-styles.js";

const YN_INPUT_DSD_DEDUPE = [":scope > .field", ":scope > .field-wrap", ".field"] as const;
let ynInputIdCounter = 0;

@customElement("yn-input")
export class YnInput extends LitElement {
  @property({ type: String }) value = "";
  @property({ type: String }) placeholder = "请输入内容";
  @property({ type: Boolean }) disabled = false;
  @property({ type: String, reflect: true }) variant: "default" | "floating" = "default";
  @property({ type: String }) label = "";
  @property({ type: String, reflect: true }) type = "text";
  @property({ type: String, reflect: true }) name = "";
  @property({ type: Boolean, reflect: true }) required = false;
  @property({ type: Boolean, reflect: true }) error = false;
  @property({ type: String, attribute: "error-message" }) errorMessage = "";
  @property({ type: String }) autocomplete = "";

  @state() private hasPrefixButton = false;
  @state() private hasSuffixButton = false;
  @state() private focused = false;
  @state() private passwordVisible = false;

  private readonly inputId = `yn-input-${++ynInputIdCounter}`;

  static styles = css`
    ${unsafeCSS(YN_INPUT_SHADOW_STYLES)}
  `;

  private hasSlotContent(slot: HTMLSlotElement) {
    return slot.assignedElements({ flatten: true }).length > 0;
  }

  private get isFloating() {
    return this.variant === "floating";
  }

  private get isPasswordField() {
    return this.type === "password";
  }

  private get showPasswordToggle() {
    return this.isFloating && this.isPasswordField;
  }

  private get resolvedInputType() {
    if (!this.isPasswordField) return this.type;
    return this.passwordVisible ? "text" : "password";
  }

  private get isLabelActive() {
    return this.focused || this.value.length > 0;
  }

  private handlePrefixSlotChange = (event: Event) => {
    const slot = event.target as HTMLSlotElement;
    this.hasPrefixButton = this.hasSlotContent(slot);
  };

  private handleSuffixSlotChange = (event: Event) => {
    const slot = event.target as HTMLSlotElement;
    this.hasSuffixButton = this.hasSlotContent(slot);
  };

  private handleFocus = () => {
    this.focused = true;
  };

  private handleBlur = () => {
    this.focused = false;
  };

  private togglePasswordVisibility = () => {
    this.passwordVisible = !this.passwordVisible;
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

  private wireInput(input: HTMLInputElement | null) {
    if (!input) return;
    input.removeEventListener("input", this.handleInput);
    input.removeEventListener("focus", this.handleFocus);
    input.removeEventListener("blur", this.handleBlur);
    input.addEventListener("input", this.handleInput);
    input.addEventListener("focus", this.handleFocus);
    input.addEventListener("blur", this.handleBlur);
  }

  bootstrapFromDeclarativeShadow() {
    const root = this.shadowRoot;
    if (!root) return;
    dedupeShadowDsdContent(root, [...YN_INPUT_DSD_DEDUPE]);
    ensureRenderRoot(this);
    this.wireInput(root.querySelector<HTMLInputElement>("input.input"));
    root
      .querySelector('slot[name="prefix-button"]')
      ?.addEventListener("slotchange", this.handlePrefixSlotChange);
    root
      .querySelector('slot[name="suffix-button"]')
      ?.addEventListener("slotchange", this.handleSuffixSlotChange);
    root.querySelector<HTMLButtonElement>(".action-prefix")?.addEventListener("click", this.handleDsdPrefixClick);
    root.querySelector<HTMLButtonElement>(".action-suffix")?.addEventListener("click", this.handleDsdSuffixClick);
    root
      .querySelector<HTMLButtonElement>(".password-toggle")
      ?.addEventListener("click", this.togglePasswordVisibility);
    this.syncSlotButtons();
    this.focused = root.querySelector<HTMLInputElement>("input.input") === document.activeElement;
  }

  private renderPasswordToggle() {
    if (!this.showPasswordToggle) return nothing;

    return html`
      <button
        class="password-toggle"
        type="button"
        ?disabled=${this.disabled}
        aria-label=${this.passwordVisible ? "Hide password" : "Show password"}
        @click=${this.togglePasswordVisibility}
      >
        <svg
          class="password-toggle__icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          aria-hidden="true"
        >
          ${this.passwordVisible
            ? svg`
                <path d="M3 3l18 18"></path>
                <path
                  d="M10.58 10.58a2 2 0 0 0 2.84 2.84M9.88 5.09A10.94 10.94 0 0 1 12 5c5.52 0 10 4.48 10 7a11.2 11.2 0 0 1-2.12 2.88M6.1 6.1A11.18 11.18 0 0 0 2 12c0 2.52 4.48 7 10 7 1.57 0 3.05-.35 4.36-.98"
                ></path>
              `
            : svg`
                <path
                  d="M2 12s4.48-7 10-7 10 7 10 7-4.48 7-10 7S2 12 2 12Z"
                ></path>
                <circle cx="12" cy="12" r="3"></circle>
              `}
        </svg>
      </button>
    `;
  }

  private renderFloatingField() {
    const fieldClass = [
      "field",
      "field--floating",
      this.disabled ? "is-disabled" : "",
      this.isLabelActive ? "is-active" : "",
      this.error ? "is-error" : "",
      this.showPasswordToggle ? "has-password-toggle" : "",
    ]
      .filter(Boolean)
      .join(" ");

    return html`
      <div class="field-wrap field-wrap--floating">
        <div class=${fieldClass}>
          <label class="float-label" for=${this.inputId}>${this.label}</label>
          <input
            id=${this.inputId}
            class="input"
            .value=${this.value}
            type=${this.resolvedInputType}
            name=${this.name || nothing}
            ?required=${this.required}
            ?disabled=${this.disabled}
            autocomplete=${this.autocomplete || nothing}
            @input=${this.handleInput}
            @focus=${this.handleFocus}
            @blur=${this.handleBlur}
          />
          ${this.renderPasswordToggle()}
        </div>
        <p class="field-error" ?hidden=${!this.error || !this.errorMessage}>${this.errorMessage}</p>
      </div>
    `;
  }

  private renderDefaultField() {
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
          type=${this.type}
          name=${this.name || nothing}
          ?required=${this.required}
          ?disabled=${this.disabled}
          autocomplete=${this.autocomplete || nothing}
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

  /** 渲染输入框。 */
  render() {
    return this.isFloating ? this.renderFloatingField() : this.renderDefaultField();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "yn-input": YnInput;
  }
}

applyLitDsd(YnInput, ".field, .field-wrap", (el) => el.bootstrapFromDeclarativeShadow(), {
  dedupe: [...YN_INPUT_DSD_DEDUPE],
});
