/** ynStrokeSpinnerSvg 宿主样式（动画在 SVG SMIL 内） */
const SPINNER_HOST = `
  display: block;
  width: var(--yn-stroke-spinner-size, 14px);
  height: var(--yn-stroke-spinner-size, 14px);
  contain: strict;
  pointer-events: none;
`;

export const YN_STROKE_SPINNER_BTN_RULES = `
.btn .spinner {
  ${SPINNER_HOST}
}

.btn .spinner .path {
  stroke: currentColor;
}
`;
