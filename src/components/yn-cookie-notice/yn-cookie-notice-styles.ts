/** Shadow DOM styles for yn-cookie-notice */
export const YN_COOKIE_NOTICE_STYLES = `
:host {
  --yn-cookie-notice-bg: #fff;
  --yn-cookie-notice-border-color: #eedfdf;
  --yn-cookie-notice-inner-border-color: #000;
  --yn-cookie-notice-accent-color: #ed3833;
  --yn-cookie-notice-text-color: #000;
  --yn-cookie-notice-muted-color: rgba(0, 0, 0, 0.9);
  --yn-cookie-notice-close-hover-color: #fff;
  --yn-cookie-notice-button-text-color: #fff;
  --yn-cookie-notice-z-index: 1000;
  --yn-cookie-notice-bottom: 1.6em;
  --yn-cookie-notice-right: 1.6em;
  --yn-cookie-notice-width: 34.3em;
  --yn-cookie-notice-font-family: Inter, system-ui, sans-serif;
  --yn-cookie-notice-enter-duration: 0.8s;
  --yn-cookie-notice-enter-ease: cubic-bezier(0.75, 0, 0.25, 1);
  --yn-cookie-notice-settings-duration: 0.45s;
  --yn-cookie-notice-settings-ease: cubic-bezier(0.22, 1, 0.36, 1);
  position: fixed;
  bottom: var(--yn-cookie-notice-bottom);
  right: var(--yn-cookie-notice-right);
  z-index: var(--yn-cookie-notice-z-index);
  font-family: var(--yn-cookie-notice-font-family);
  color: var(--yn-cookie-notice-text-color);
  display: block;
  box-sizing: border-box;
}

:host([hidden]) {
  display: none !important;
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

button {
  cursor: pointer;
  border: none;
  background: none;
  font: inherit;
  color: inherit;
  padding: 0;
}

ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

img {
  max-width: 100%;
  display: block;
}

.panel {
  background: var(--yn-cookie-notice-bg);
  border: 0.5px solid var(--yn-cookie-notice-border-color);
  font-size: 10px;
  padding: 1.6em;
  pointer-events: none;
  position: relative;
  transform: rotate(-90deg) translate(5em, 20em);
  transform-origin: right top;
  transition:
    transform var(--yn-cookie-notice-enter-duration) var(--yn-cookie-notice-enter-ease),
    visibility 0s linear 0.5s;
  visibility: hidden;
  width: var(--yn-cookie-notice-width);
}

.panel.visible {
  pointer-events: auto;
  transform: rotate(0) translate(0);
  transition:
    transform var(--yn-cookie-notice-enter-duration) var(--yn-cookie-notice-enter-ease),
    visibility 0s;
  visibility: visible;
}

.panel__holder {
  bottom: 10.1em;
  display: flex;
  left: 30em;
  pointer-events: none;
  position: absolute;
  width: 17.4em;
  z-index: 5;
}

.panel__inner {
  border: 1px dashed var(--yn-cookie-notice-inner-border-color);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  position: relative;
}

.panel__close {
  height: 3.2em;
  position: absolute;
  right: 0.3em;
  top: 0.6em;
  transition: color 0.5s 0.2s;
  width: 3.2em;
  z-index: 5;
}

.panel__close svg {
  height: 100%;
  width: 100%;
}

.panel__close:hover {
  color: var(--yn-cookie-notice-close-hover-color);
  transition: color 0.5s;
}

.panel__header {
  display: flex;
  flex-direction: column;
  padding: 2.6em 1.6em 1.6em;
}

.panel__title {
  font-size: 1.8em;
  font-weight: 600;
  line-height: 1.6em;
  margin: 0 0 1.6em;
  font-style: normal;
  text-transform: uppercase;
}

.panel__text {
  display: flex;
  flex-direction: column;
  font-size: 1.1em;
  font-weight: 500;
  letter-spacing: -0.04em;
  line-height: 1.1em;
  margin: 0 0 4em;
  padding-right: 0.6em;
  text-transform: uppercase;
}

.panel__text ::slotted(strong),
.panel__text strong {
  color: var(--yn-cookie-notice-accent-color);
}

.panel__text-line:last-child {
  margin-left: auto;
}

.panel__actions {
  align-items: flex-end;
  display: flex;
  justify-content: space-between;
}

.panel__button-group {
  display: flex;
  flex-direction: column;
  gap: 0.8em;
}

.action-button {
  align-items: center;
  display: flex;
  font-size: 1.3em;
  font-weight: 600;
  gap: 0.2em;
  height: 2.6em;
  justify-content: center;
  line-height: 1.3em;
  padding-top: 0.2em;
  text-transform: uppercase;
  transition: opacity 0.4s;
  width: 13.3em;
}

.action-button strong {
  font-weight: 100;
}

.action-button__label {
  position: relative;
}

.action-button--primary {
  background: var(--yn-cookie-notice-button-bg) center / 100% 100% no-repeat;
  color: var(--yn-cookie-notice-button-text-color);
  position: relative;
}

.settings-toggle {
  display: flex;
  gap: 0.2em;
  align-items: center;
}

.settings-toggle__label {
  font-size: 1.3em;
  font-weight: 600;
  letter-spacing: 0.08em;
  line-height: 1.3em;
  position: relative;
  text-transform: uppercase;
}

.settings-toggle__label::after {
  background: currentColor;
  bottom: 0;
  content: "";
  height: 1px;
  left: 0;
  position: absolute;
  right: 0;
  transform-origin: left;
  transition: transform 0.4s;
}

.settings-toggle svg {
  flex-shrink: 0;
  height: 1em;
  transition: transform 0.4s;
  width: 1em;
}

.settings-toggle:hover .settings-toggle__label::after {
  transform: scaleX(0);
}

.settings-toggle.active svg {
  transform: rotate(180deg);
}

.panel__body {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows var(--yn-cookie-notice-settings-duration) var(--yn-cookie-notice-settings-ease);
}

.panel__body.open {
  grid-template-rows: 1fr;
}

.panel__body-inner {
  overflow: hidden;
}

.panel__settings {
  border-top: 1px dashed var(--yn-cookie-notice-inner-border-color);
  display: flex;
  flex-direction: column;
  gap: 1.6em;
  padding: 1.6em;
}

.pref-list {
  display: flex;
  flex-direction: column;
  gap: 1.4em;
}

.pref-list li {
  display: flex;
  flex-direction: column;
  gap: 0.35em;
}

.pref-list li p {
  color: var(--yn-cookie-notice-muted-color);
  font-size: 1em;
  font-weight: 300;
  letter-spacing: -0.04em;
  line-height: 1.2em;
  margin: 0 0 0 2.8em;
}

.checkbox {
  align-items: center;
  cursor: pointer;
  display: flex;
  gap: 0.6em;
  position: relative;
}

.checkbox:hover .checkbox__box img:first-child {
  opacity: 0;
}

.checkbox:hover .checkbox__box img:nth-child(2) {
  opacity: 1;
}

.checkbox.disabled {
  pointer-events: none;
  cursor: default;
}

.checkbox.disabled .checkbox__box {
  filter: grayscale(1);
  opacity: 0.5;
}

.checkbox__input {
  inset: 0;
  margin: 0;
  opacity: 0;
  position: absolute;
  z-index: 5;
}

.checkbox__box {
  display: flex;
  flex-shrink: 0;
  height: 1.8em;
  position: relative;
  width: 1.8em;
}

.checkbox__box img {
  inset: 0;
  position: absolute;
  transition: opacity 0.3s;
  z-index: 1;
}

.checkbox__box img:nth-of-type(2) {
  opacity: 0;
  z-index: 3;
}

.checkbox__box img:nth-of-type(3) {
  opacity: 0;
  z-index: 2;
}

.checkbox.checked .checkbox__box img:first-of-type,
.checkbox__input:checked + .checkbox__box img:first-of-type {
  opacity: 0;
}

.checkbox.checked .checkbox__box img:nth-of-type(2),
.checkbox__input:checked + .checkbox__box img:nth-of-type(2) {
  opacity: 0;
}

.checkbox.checked .checkbox__box img:nth-of-type(3),
.checkbox__input:checked + .checkbox__box img:nth-of-type(3) {
  opacity: 1;
}

.checkbox__text {
  font-size: 1.5em;
  font-weight: 500;
  letter-spacing: -0.04em;
  line-height: 1.5em;
  margin-top: 0.25em;
  text-transform: uppercase;
}

.checkbox__text small {
  color: var(--yn-cookie-notice-muted-color);
  font-size: 0.67em;
  font-weight: 300;
  letter-spacing: -0.04em;
  line-height: 1.2em;
  text-transform: none;
}

.settings-actions {
  align-items: center;
  display: flex;
  gap: 2.4em;
  justify-content: flex-end;
}

.settings-cancel {
  font-size: 1.3em;
  font-weight: 600;
  letter-spacing: 0.08em;
  line-height: 1.3em;
  position: relative;
  text-transform: uppercase;
}

.settings-cancel::after {
  background: currentColor;
  bottom: 0;
  content: "";
  height: 1px;
  left: 0;
  position: absolute;
  right: 0;
  transform-origin: left;
  transition: transform 0.4s;
}

.settings-cancel:hover::after {
  transform: scaleX(0);
}

@media (min-width: 768px) {
  :host {
    --yn-cookie-notice-bottom: 3.2em;
    --yn-cookie-notice-right: 15.5em;
    --yn-cookie-notice-width: 45.8em;
  }

  .panel__holder {
    left: 41.3em;
    width: 21.4em;
  }

  .panel__close {
    right: 0.6em;
    top: 1.6em;
  }

  .panel__text {
    margin-bottom: 7.4em;
    width: 28em;
  }

  .panel__actions {
    align-items: center;
  }

  .panel__button-group {
    align-items: center;
    flex-direction: row;
    gap: 1.1em;
  }
}

@media (min-width: 1024px) {
  :host {
    --yn-cookie-notice-bottom: 4.9em;
    --yn-cookie-notice-right: 3.5em;
  }

  .panel__holder {
    bottom: 12.3em;
    width: 21.4em;
  }
}
`;
