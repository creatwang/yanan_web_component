/** 绳长缩放 CSS 变量 + fixed 吸顶定位与水平拖动 */

export const DEFAULT_ROPE_LENGTH = 260;

const ROPE_MIN = 200;
const ROPE_MAX = 480;

const hostW = (host: HTMLElement) => host.offsetWidth || 0;

export function normalizeRopeLength(value: number | undefined) {
  if (value == null || !Number.isFinite(value)) return DEFAULT_ROPE_LENGTH;
  return Math.min(ROPE_MAX, Math.max(ROPE_MIN, Math.round(value)));
}

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

export const logicalToCssLeft = (logicalX: number, host: HTMLElement, reverse: boolean) => {
  const w = hostW(host);
  return reverse ? window.innerWidth - w - logicalX : logicalX;
};

export const cssLeftToLogical = (cssLeft: number, host: HTMLElement, reverse: boolean) => {
  const w = hostW(host);
  return reverse ? window.innerWidth - w - cssLeft : cssLeft;
};

export const centerLogical = (host: HTMLElement, reverse: boolean) =>
  cssLeftToLogical((window.innerWidth - hostW(host)) / 2, host, reverse);

export const peekCssLeft = (host: HTMLElement, reverse: boolean) =>
  reverse ? window.innerWidth - hostW(host) : 0;

export const peekCssTop = () => 0;

export const applyCssLeft = (host: HTMLElement, cssLeft: number) => {
  host.style.left = `${cssLeft}px`;
  host.style.transform = "none";
  host.style.removeProperty("right");
};

export const applyCssTop = (host: HTMLElement, cssTop: number) => {
  host.style.top = `${cssTop}px`;
};

export const clampLogicalX = (logicalX: number, host: HTMLElement) => {
  const w = hostW(host);
  return Math.min(window.innerWidth - w, Math.max(-(w - 1), logicalX));
};

const readCssLeft = (host: HTMLElement) => {
  const raw = host.style.left;
  if (raw.endsWith("px")) {
    const n = Number.parseFloat(raw);
    if (Number.isFinite(n)) return n;
  }
  return host.getBoundingClientRect().left;
};

export type PullCordFixedDragOptions = {
  host: HTMLElement;
  grip: HTMLElement;
  getReverse: () => boolean;
  getDisabled: () => boolean;
  onPositionChange: (logicalX: number) => void;
  onDragStateChange?: (dragging: boolean) => void;
};

export class PullCordFixedDrag {
  private readonly options: PullCordFixedDragOptions;
  private pointerId: number | null = null;
  private startClientX = 0;
  private startLogicalX = 0;

  private readonly onDown = (e: PointerEvent) => this.handleDown(e);
  private readonly onMove = (e: PointerEvent) => this.handleMove(e);
  private readonly onUp = (e: PointerEvent) => this.handleUp(e);

  constructor(options: PullCordFixedDragOptions) {
    this.options = options;
  }

  bind() {
    const { grip } = this.options;
    grip.addEventListener("pointerdown", this.onDown, { passive: false });
    grip.addEventListener("pointermove", this.onMove, { passive: false });
    grip.addEventListener("pointerup", this.onUp);
    grip.addEventListener("pointercancel", this.onUp);
  }

  unbind() {
    const { grip } = this.options;
    grip.removeEventListener("pointerdown", this.onDown);
    grip.removeEventListener("pointermove", this.onMove);
    grip.removeEventListener("pointerup", this.onUp);
    grip.removeEventListener("pointercancel", this.onUp);
  }

  applyLogical(logicalX: number, notify = false) {
    const { host } = this.options;
    const reverse = this.options.getReverse();
    const logical = clampLogicalX(logicalX, host);
    applyCssLeft(host, logicalToCssLeft(logical, host, reverse));
    if (notify) this.options.onPositionChange(logical);
    return logical;
  }

  center() {
    return this.applyLogical(centerLogical(this.options.host, this.options.getReverse()));
  }

  readLogical() {
    const { host } = this.options;
    return cssLeftToLogical(readCssLeft(host), host, this.options.getReverse());
  }

  private handleDown(e: PointerEvent) {
    if (this.options.getDisabled() || e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    this.pointerId = e.pointerId;
    this.options.grip.setPointerCapture(e.pointerId);
    this.options.onDragStateChange?.(true);
    this.startClientX = e.clientX;
    this.startLogicalX = this.readLogical();
  }

  private handleMove(e: PointerEvent) {
    if (e.pointerId !== this.pointerId) return;
    e.preventDefault();
    const { host } = this.options;
    const reverse = this.options.getReverse();
    const nextCss =
      logicalToCssLeft(this.startLogicalX, host, reverse) + (e.clientX - this.startClientX);
    this.applyLogical(cssLeftToLogical(nextCss, host, reverse), true);
  }

  private handleUp(e: PointerEvent) {
    if (e.pointerId !== this.pointerId) return;
    this.pointerId = null;
    this.options.onDragStateChange?.(false);
    try {
      this.options.grip.releasePointerCapture(e.pointerId);
    } catch {
      /* noop */
    }
  }
}
