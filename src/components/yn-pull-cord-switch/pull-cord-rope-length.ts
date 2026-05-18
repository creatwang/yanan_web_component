/** 默认绳长（与原先 `size="mini"` 一致，单位 px） */
export const DEFAULT_ROPE_LENGTH = 260;

const MIN = 200;
const MAX = 480;

/** 按 mini 基准等比缩放绳子物理与容器高度 */
export function resolveRopeLengthVars(length: number) {
  const ropeLength = normalizeRopeLength(length);
  const r = ropeLength / DEFAULT_ROPE_LENGTH;
  const scale = (base: number, min: number) => Math.max(min, Math.round(base * r));
  return {
    height: ropeLength,
    fixedHeight: scale(220, 160),
    segmentCount: Math.min(14, Math.max(4, Math.round(8 * r))),
    segmentLen: scale(10, 6),
    cardOffset: scale(20, 12),
    maxPull: scale(84, 40),
    toggleThreshold: scale(52, 32),
    fixedMaxPull: scale(72, 36),
    fixedToggleThreshold: scale(44, 28)
  };
}

export function normalizeRopeLength(value: number | undefined) {
  if (value == null || !Number.isFinite(value)) return DEFAULT_ROPE_LENGTH;
  return Math.min(MAX, Math.max(MIN, Math.round(value)));
}

export function applyRopeLengthVars(
  host: HTMLElement,
  length: number,
  overrides?: { cardOffset?: number }
) {
  const v = resolveRopeLengthVars(length);
  const fixed = host.hasAttribute("fixed");
  const cardOff =
    overrides?.cardOffset != null && Number.isFinite(overrides.cardOffset)
      ? overrides.cardOffset
      : v.cardOffset;
  const s = host.style;
  s.setProperty("--yn-pull-cord-switch-height", `${v.height}px`);
  s.setProperty("--yn-pull-cord-switch-fixed-height", `${v.fixedHeight}px`);
  s.setProperty("--yn-pull-cord-switch-segment-count", String(v.segmentCount));
  s.setProperty("--yn-pull-cord-switch-segment-len", `${v.segmentLen}px`);
  s.setProperty("--yn-pull-cord-switch-card-offset", `${cardOff}px`);
  s.setProperty("--yn-pull-cord-switch-max-pull", `${fixed ? v.fixedMaxPull : v.maxPull}px`);
  s.setProperty(
    "--yn-pull-cord-switch-toggle-threshold",
    `${fixed ? v.fixedToggleThreshold : v.toggleThreshold}px`
  );
}
