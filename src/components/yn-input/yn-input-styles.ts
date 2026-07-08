/** Shadow DOM styles — Lit + DSD SSR shared */
export const YN_INPUT_SHADOW_STYLES = `
:host {
  --yn-input-width: 320px;
  --yn-input-height: 44px;
  --yn-input-bg: var(--yn-color-surface, rgba(255, 255, 255, 0.62));
  --yn-input-bg-hover: var(--yn-color-surface-hover, rgba(255, 255, 255, 0.86));
  --yn-input-bg-focus: var(--yn-color-surface-focus, #fffaf2);
  --yn-input-bg-disabled: var(--yn-color-surface-disabled, rgba(232, 225, 214, 0.76));
  --yn-input-border-color: var(--yn-color-border, rgba(36, 31, 33, 0.22));
  --yn-input-border-color-hover: var(--yn-color-border-strong, rgba(36, 31, 33, 0.52));
  --yn-input-border-color-focus: var(--yn-color-border-focus, #241f21);
  --yn-input-color: var(--yn-color-text, #241f21);
  --yn-input-placeholder-color: var(--yn-color-text-muted, rgba(36, 31, 33, 0.48));
  --yn-input-disabled-color: var(--yn-color-text-disabled, rgba(36, 31, 33, 0.42));
  --yn-input-focus-ring: var(--yn-color-focus-ring, rgba(36, 31, 33, 0.12));
  --yn-input-radius: 999px;
  --yn-input-padding: 0 14px;
  --yn-input-padding-with-action: 0 6px;
  --yn-input-field-padding-x: 8px;
  --yn-input-action-gap: 4px;
  --yn-input-button-size: 28px;
  --yn-input-button-color: var(--yn-color-text, #241f21);
  --yn-input-button-bg-hover: var(--yn-color-overlay-hover, rgba(36, 31, 33, 0.08));
  --yn-input-font-family:
    "Zimula", ui-serif, Georgia, Cambria, "Times New Roman", Times, serif;
  --yn-input-font-size: 16px;
  --yn-input-letter-spacing: -0.01em;
  display: inline-block;
}

@font-face {
  font-family: "Zimula";
  src: url("https://www.floema.com/_nuxt/Zimula-Variable.Cb2n2uX-.ttf") format("truetype");
  font-display: swap;
}

* {
  box-sizing: border-box;
}

.field {
  width: var(--yn-input-width);
  min-width: 0;
  height: var(--yn-input-height);
  display: inline-flex;
  align-items: center;
  gap: var(--yn-input-action-gap);
  border: 1px solid var(--yn-input-border-color);
  border-radius: var(--yn-input-radius);
  background: var(--yn-input-bg);
  padding: 0 var(--yn-input-field-padding-x);
  overflow: hidden;
  transition:
    border-color 220ms cubic-bezier(0.4, 0, 1, 1),
    box-shadow 220ms cubic-bezier(0.4, 0, 1, 1),
    background-color 220ms cubic-bezier(0.4, 0, 1, 1);
}

.field:hover:not(.is-disabled) {
  border-color: var(--yn-input-border-color-hover);
  background: var(--yn-input-bg-hover);
}

.field:focus-within {
  border-color: var(--yn-input-border-color-focus);
  background: var(--yn-input-bg-focus);
  box-shadow: 0 0 0 3px var(--yn-input-focus-ring);
}

.field.is-disabled {
  border-color: transparent;
  background: var(--yn-input-bg-disabled);
}

.field.has-prefix .input,
.field.has-suffix .input {
  padding: var(--yn-input-padding-with-action);
}

.input {
  width: 100%;
  min-width: 0;
  height: 100%;
  flex: 1;
  border: 0;
  background: transparent;
  padding: var(--yn-input-padding);
  color: var(--yn-input-color);
  font-family: var(--yn-input-font-family);
  font-size: var(--yn-input-font-size);
  letter-spacing: var(--yn-input-letter-spacing);
  line-height: 1;
  outline: none;
  -webkit-appearance: none;
  appearance: none;
}

.input::placeholder {
  color: var(--yn-input-placeholder-color);
  opacity: 1;
}

.input:disabled {
  cursor: not-allowed;
  background: transparent;
  color: var(--yn-input-disabled-color);
}

.action-prefix {
  margin-inline-start: 2px;
}

.action-suffix {
  margin-inline-end: 2px;
}

.action {
  width: var(--yn-input-button-size);
  height: var(--yn-input-button-size);
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: var(--yn-input-button-color);
  padding: 0;
  cursor: pointer;
  transition:
    background-color 180ms ease,
    opacity 180ms ease;
}

.action:hover:not(:disabled),
.action:focus-visible {
  background: var(--yn-input-button-bg-hover);
  outline: none;
}

.action:disabled {
  cursor: not-allowed;
  opacity: 0.42;
}

::slotted(svg[slot="prefix-button"]),
::slotted(svg[slot="suffix-button"]) {
  width: 20px;
  height: 20px;
  display: block;
}
`;
