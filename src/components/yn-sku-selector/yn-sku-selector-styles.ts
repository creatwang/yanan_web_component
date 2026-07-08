/** Shadow DOM styles for yn-sku-selector */
export const YN_SKU_SELECTOR_STYLES = `
:host {
  display: block;
  width: 100%;
  min-width: 0;
  color: var(--yn-sku-selector-color, #000);
  font-family: var(--yn-sku-selector-font-family, inherit);
  -webkit-tap-highlight-color: transparent;
}

* {
  box-sizing: border-box;
}

.title {
  margin-bottom: var(--yn-sku-selector-title-gap, 28px);
}

.section {
  margin-bottom: var(--yn-sku-selector-row-gap, var(--yn-sku-selector-section-gap, 24px));
}

.section:last-of-type {
  margin-bottom: 0;
}

.label {
  margin: 0 0 var(--yn-sku-selector-label-row-gap, var(--yn-sku-selector-label-gap, 12px));
  font-size: var(--yn-sku-selector-label-font-size, 11px);
  font-weight: var(--yn-sku-selector-label-font-weight, 600);
  letter-spacing: var(--yn-sku-selector-label-letter-spacing, 0.14em);
  text-transform: uppercase;
  color: var(--yn-sku-selector-label-color, currentColor);
  line-height: 1.2;
  word-break: break-word;
}

.options {
  position: relative;
  display: flex;
  flex-wrap: wrap;
  align-items: stretch;
  gap: 0;
  width: 100%;
  min-width: 0;
  margin-left: 1px;
  margin-top: 1px;
}

.option-indicator {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 0;
  background: var(--yn-sku-selector-option-active-bg, #000);
  opacity: 0;
  pointer-events: none;
  will-change: transform, width, height, opacity;
  transition:
    transform var(--yn-sku-selector-option-transition-duration, 0.22s)
      var(--yn-sku-selector-option-transition-ease, cubic-bezier(0.22, 1, 0.36, 1)),
    width var(--yn-sku-selector-option-transition-duration, 0.22s)
      var(--yn-sku-selector-option-transition-ease, cubic-bezier(0.22, 1, 0.36, 1)),
    height var(--yn-sku-selector-option-transition-duration, 0.22s)
      var(--yn-sku-selector-option-transition-ease, cubic-bezier(0.22, 1, 0.36, 1)),
    opacity 0.16s ease-out;
}

.option {
  position: relative;
  z-index: 1;
  flex: 0 1 auto;
  min-width: var(--yn-sku-selector-option-min-width, 52px);
  max-width: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: var(--yn-sku-selector-row-height, var(--yn-sku-selector-option-height, 48px));
  height: var(--yn-sku-selector-row-height, var(--yn-sku-selector-option-height, 48px));
  padding: var(--yn-sku-selector-option-padding, 0 18px);
  margin: -1px 0 0 -1px;
  border: var(--yn-sku-selector-option-border-width, 1px) solid
    var(--yn-sku-selector-option-border-color, currentColor);
  background: var(--yn-sku-selector-option-bg, #fff);
  color: var(--yn-sku-selector-option-color, currentColor);
  font-family: inherit;
  font-size: var(--yn-sku-selector-option-font-size, 14px);
  font-weight: var(--yn-sku-selector-option-font-weight, 700);
  line-height: 1;
  text-transform: uppercase;
  cursor: pointer;
  transition: color var(--yn-sku-selector-option-transition-duration, 0.28s)
    var(--yn-sku-selector-option-transition-ease, cubic-bezier(0.4, 0, 0.2, 1));
  user-select: none;
  -webkit-user-select: none;
}

.option.active {
  color: var(--yn-sku-selector-option-active-color, #fff);
  background: transparent;
}

.option.unavailable {
  opacity: var(--yn-sku-selector-option-disabled-opacity, 0.28);
  cursor: not-allowed;
  text-decoration: line-through;
}

.option:disabled,
.option.is-loading {
  cursor: wait;
}

.option.is-loading .option-label {
  visibility: hidden;
}

.option-spinner {
  position: absolute;
  inset: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.hint {
  min-height: var(--yn-sku-selector-hint-min-height, 1.2em);
  margin: var(--yn-sku-selector-hint-margin, 0 0 12px);
  font-size: var(--yn-sku-selector-hint-font-size, 12px);
  line-height: 1.4;
  color: var(--yn-sku-selector-hint-color, #c0392b);
  word-break: break-word;
}

.submit-wrap {
  display: block;
  width: fit-content;
  max-width: 100%;
  margin-top: var(--yn-sku-selector-submit-margin-top, 24px);
}

.stock {
  margin: 0 0 var(--yn-sku-selector-stock-margin, 12px);
  font-size: var(--yn-sku-selector-stock-font-size, 13px);
  line-height: 1.4;
  color: var(--yn-sku-selector-stock-color, currentColor);
  word-break: break-word;
}

.stock.is-empty {
  color: var(--yn-sku-selector-stock-empty-color, #c0392b);
}

.stock.is-backorder {
  color: var(--yn-sku-selector-stock-backorder-color, var(--yn-sku-selector-stock-color, currentColor));
}
`;
