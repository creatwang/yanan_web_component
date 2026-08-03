/** r=30 → 周长 ≈ 188 */
const C = 188;

/**
 * 弧段伸缩 + 旋转（SVG SMIL）。
 * 旋转放在外层 `<g>`，dash 动画在 `<circle>`，减少同元素 transform+属性混算。
 */
export const ynStrokeSpinnerSvg = `<svg aria-hidden="true" focusable="false" class="spinner" viewBox="0 0 66 66" xmlns="http://www.w3.org/2000/svg"><g><animateTransform attributeName="transform" type="rotate" from="0 33 33" to="360 33 33" dur="1.4s" repeatCount="indefinite"/><circle class="path" fill="none" stroke-width="6" cx="33" cy="33" r="30" stroke-linecap="round" stroke-dasharray="16 ${C - 16}" stroke-dashoffset="0"><animate attributeName="stroke-dasharray" values="16 ${C - 16};${C - 2} 2;16 ${C - 16}" keyTimes="0;0.5;1" dur="1.4s" repeatCount="indefinite" calcMode="spline" keySplines="0.65 0 0.35 1;0.65 0 0.35 1"/><animate attributeName="stroke-dashoffset" values="0;-40;-${C}" keyTimes="0;0.5;1" dur="1.4s" repeatCount="indefinite" calcMode="spline" keySplines="0.65 0 0.35 1;0.65 0 0.35 1"/></circle></g></svg>`;

/** 减少动态效果：固定弧长 + 慢速旋转 */
export const ynStrokeSpinnerSvgReduced = `<svg aria-hidden="true" focusable="false" class="spinner" viewBox="0 0 66 66" xmlns="http://www.w3.org/2000/svg"><g><animateTransform attributeName="transform" type="rotate" from="0 33 33" to="360 33 33" dur="2.8s" repeatCount="indefinite"/><circle class="path" fill="none" stroke-width="6" cx="33" cy="33" r="30" stroke-linecap="round" stroke-dasharray="80 ${C - 80}"/></g></svg>`;
