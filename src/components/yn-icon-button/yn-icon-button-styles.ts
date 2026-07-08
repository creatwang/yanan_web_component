/** Flutter / Material IconButton：透明/实心底、hover、ripple、hit-slop */
export const YN_ICON_BUTTON_SHADOW_STYLES = `
:host {
  display: inline-flex;
  vertical-align: middle;
  --_yn-icon-button-size: var(--yn-icon-button-size, 2.5rem);
  --_yn-icon-button-icon-size: var(--yn-icon-button-icon-size, 1.25rem);
  --_yn-icon-button-bg: transparent;
  --_yn-icon-button-hover-bg: var(--yn-color-overlay-hover, rgba(36, 31, 33, 0.08));
  --_yn-icon-button-active-bg: var(--yn-color-overlay-active, rgba(36, 31, 33, 0.12));
  --_yn-icon-button-color: var(--yn-color-text, #241f21);
  --_yn-icon-button-border: transparent;
  --_yn-icon-button-hover-mode: overlay;
}

.icon-button {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: var(--_yn-icon-button-size);
  height: var(--_yn-icon-button-size);
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: var(--yn-icon-button-color, var(--_yn-icon-button-color));
  cursor: pointer;
  overflow: hidden;
  isolation: isolate;
  text-decoration: none;
  -webkit-tap-highlight-color: transparent;
  transition: transform 120ms cubic-bezier(0.2, 0, 0, 1);
}

.icon-button.hit-slop::before {
  content: "";
  position: absolute;
  top: -5px;
  left: -5px;
  width: calc(100% + 10px);
  height: calc(100% + 10px);
  border-radius: inherit;
  pointer-events: auto;
}

.bg {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: var(--yn-icon-button-bg, var(--_yn-icon-button-bg));
  border: 1px solid var(--yn-icon-button-border-color, var(--_yn-icon-button-border));
  box-sizing: border-box;
  pointer-events: none;
  z-index: 0;
  transition: background-color 200ms cubic-bezier(0.2, 0, 0, 1);
}

.hover-surface {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: var(--yn-icon-button-hover-bg, var(--_yn-icon-button-hover-bg));
  opacity: 0;
  pointer-events: none;
  z-index: 1;
  transition: opacity 200ms cubic-bezier(0.2, 0, 0, 1);
}

.ripple-surface {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: var(--yn-icon-button-active-bg, var(--_yn-icon-button-active-bg));
  opacity: 0;
  transform: scale(0.35);
  pointer-events: none;
  z-index: 1;
}

.icon-button:hover:not(:disabled) .hover-surface,
.icon-button:focus-visible:not(:disabled) .hover-surface {
  opacity: 1;
}

:host([data-hover-mode="solid"]) .icon-button:hover:not(:disabled) .bg,
:host([data-hover-mode="solid"]) .icon-button:focus-visible:not(:disabled) .bg {
  background: var(--yn-icon-button-hover-bg, var(--_yn-icon-button-hover-bg));
}

:host([data-hover-mode="solid"]) .icon-button:hover:not(:disabled) .hover-surface,
:host([data-hover-mode="solid"]) .icon-button:focus-visible:not(:disabled) .hover-surface {
  opacity: 0;
}

.icon-button:active:not(:disabled) {
  transform: scale(0.94);
}

.icon-button:active:not(:disabled) .ripple-surface {
  animation: yn-icon-button-ripple 420ms cubic-bezier(0.2, 0, 0, 1);
}

.icon-button:focus-visible {
  outline: 2px solid var(--yn-icon-button-focus-ring, var(--yn-color-focus-ring, #241f21));
  outline-offset: 2px;
}

.icon-button:disabled {
  cursor: not-allowed;
  opacity: var(--yn-icon-button-disabled-opacity, 0.45);
  transform: none;
}

.icon-button:disabled .hover-surface,
.icon-button:disabled .ripple-surface {
  opacity: 0;
  animation: none;
}

.icon {
  position: relative;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 0;
  width: var(--_yn-icon-button-icon-size);
  height: var(--_yn-icon-button-icon-size);
}

.icon ::slotted(svg) {
  display: block;
  width: 100%;
  height: 100%;
}

.icon ::slotted(*) {
  max-width: 100%;
  max-height: 100%;
}

:host([size="small"]) {
  --_yn-icon-button-size: var(--yn-icon-button-size, 2rem);
  --_yn-icon-button-icon-size: var(--yn-icon-button-icon-size, 1rem);
}

:host([size="large"]) {
  --_yn-icon-button-size: var(--yn-icon-button-size, 3rem);
  --_yn-icon-button-icon-size: var(--yn-icon-button-icon-size, 1.5rem);
}

@keyframes yn-icon-button-ripple {
  from {
    opacity: 1;
    transform: scale(0.35);
  }
  to {
    opacity: 0;
    transform: scale(1);
  }
}
`;

export const YN_ICON_BUTTON_SIZE_VARS: Record<"small" | "medium" | "large", { size: string; icon: string }> = {
  small: { size: "2rem", icon: "1rem" },
  medium: { size: "2.5rem", icon: "1.25rem" },
  large: { size: "3rem", icon: "1.5rem" },
};
