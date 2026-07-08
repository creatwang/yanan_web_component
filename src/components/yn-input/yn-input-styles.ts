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

/* ── floating label variant (auth / form fields) ── */

:host([variant="floating"]) {
  display: block;
  width: 100%;
  --yn-input-width: 100%;
  --yn-input-height: var(--yn-input-float-height, 3.5rem);
  --yn-input-radius: var(--yn-input-float-radius, 2px);
  --yn-input-bg: var(--yn-input-float-bg, #fff);
  --yn-input-bg-hover: var(--yn-input-float-bg, #fff);
  --yn-input-bg-focus: var(--yn-input-float-bg, #fff);
  --yn-input-border-color: var(--yn-input-float-border-color, #c8c8c8);
  --yn-input-border-color-hover: var(--yn-input-float-border-color-hover, #9a9a9a);
  --yn-input-border-color-focus: var(--yn-input-float-border-color-focus, #5c5c5c);
  --yn-input-focus-ring: transparent;
  --yn-input-font-family: var(
    --yn-input-float-font-family,
    "DM Sans",
    ui-sans-serif,
    system-ui,
    sans-serif
  );
  --yn-input-font-size: var(--yn-input-float-font-size, 1rem);
  --yn-input-field-padding-x: 0;
}

.field-wrap--floating {
  width: 100%;
}

.field--floating {
  position: relative;
  display: block;
  height: var(--yn-input-height);
  padding: 0;
  overflow: visible;
}

.field--floating:focus-within {
  box-shadow: none;
}

.field--floating.is-error {
  border-color: var(--yn-input-error-border-color, #c41e3a);
}

.field--floating.is-error:focus-within {
  border-color: var(--yn-input-error-border-color, #c41e3a);
}

.field--floating .float-label {
  position: absolute;
  left: var(--yn-input-float-label-inset-x, 0.875rem);
  top: 50%;
  z-index: 1;
  margin: 0;
  max-width: calc(100% - 1.75rem);
  overflow: hidden;
  color: var(--yn-input-float-label-color, rgba(36, 31, 33, 0.62));
  font-family: var(--yn-input-font-family);
  font-size: var(--yn-input-float-label-size, 1rem);
  font-weight: 400;
  letter-spacing: var(--yn-input-letter-spacing);
  line-height: 1.2;
  pointer-events: none;
  text-overflow: ellipsis;
  transform: translateY(-50%);
  transform-origin: left top;
  transition:
    top 180ms cubic-bezier(0.4, 0, 0.2, 1),
    transform 180ms cubic-bezier(0.4, 0, 0.2, 1),
    font-size 180ms cubic-bezier(0.4, 0, 0.2, 1),
    color 180ms cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
}

.field--floating.is-active .float-label {
  top: var(--yn-input-float-label-active-top, 0.55rem);
  color: var(--yn-input-float-label-active-color, rgba(36, 31, 33, 0.72));
  font-size: var(--yn-input-float-label-active-size, 0.6875rem);
  transform: translateY(0) scale(1);
}

.field--floating .input {
  position: relative;
  z-index: 2;
  height: 100%;
  padding:
    var(--yn-input-float-input-padding-top, 1.35rem)
    var(--yn-input-float-input-padding-end, 0.875rem)
    var(--yn-input-float-input-padding-bottom, 0.45rem)
    var(--yn-input-float-input-padding-start, 0.875rem);
  line-height: 1.35;
}

.field--floating.has-password-toggle .input {
  padding-inline-end: calc(var(--yn-input-float-input-padding-end, 0.875rem) + 3.5rem);
}

.field--floating .password-toggle {
  position: absolute;
  top: 50%;
  right: 0.75rem;
  z-index: 3;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  border: 0;
  background: transparent;
  color: var(--yn-input-float-toggle-color, rgba(36, 31, 33, 0.72));
  font-family: var(--yn-input-font-family);
  font-size: var(--yn-input-float-toggle-size, 0.8125rem);
  letter-spacing: 0.01em;
  line-height: 1;
  padding: 0.25rem;
  transform: translateY(-50%);
  cursor: pointer;
}

.field--floating .password-toggle:hover,
.field--floating .password-toggle:focus-visible {
  color: var(--yn-input-color);
  outline: none;
}

.field--floating .password-toggle__icon {
  width: 1rem;
  height: 1rem;
  flex: 0 0 auto;
}

.field-error {
  margin: 0.35rem 0 0;
  color: var(--yn-input-error-color, #c41e3a);
  font-family: var(--yn-input-font-family);
  font-size: var(--yn-input-error-font-size, 0.75rem);
  line-height: 1.35;
}

.field-error[hidden] {
  display: none;
}
`;
