/** fixed 模式：逻辑坐标 ↔ CSS 定位 + 顶部水平拖动 */

const hostWidth = (host: HTMLElement) => host.offsetWidth || 0;

export const logicalToCssLeft = (logicalX: number, host: HTMLElement, reverse: boolean) => {
  const w = hostWidth(host);
  return reverse ? window.innerWidth - w - logicalX : logicalX;
};

export const cssLeftToLogical = (cssLeft: number, host: HTMLElement, reverse: boolean) => {
  const w = hostWidth(host);
  return reverse ? window.innerWidth - w - cssLeft : cssLeft;
};

export const centerLogical = (host: HTMLElement, reverse: boolean) => {
  const cssLeft = (window.innerWidth - hostWidth(host)) / 2;
  return cssLeftToLogical(cssLeft, host, reverse);
};

export const peekCssLeft = (host: HTMLElement, reverse: boolean) => {
  const w = hostWidth(host);
  return reverse ? window.innerWidth - w : 0;
};

export const peekCssTop = () => 0;

export const applyCssLeft = (host: HTMLElement, cssLeft: number) => {
  host.style.left = `${cssLeft}px`;
  host.style.transform = "none";
  host.style.removeProperty("right");
};

export const applyCssTop = (host: HTMLElement, cssTop: number) => {
  host.style.top = `${cssTop}px`;
};

const readCssLeft = (host: HTMLElement) => {
  const raw = host.style.left;
  if (raw.endsWith("px")) {
    const n = Number.parseFloat(raw);
    if (Number.isFinite(n)) return n;
  }
  return host.getBoundingClientRect().left;
};

export const clampLogicalX = (logicalX: number, host: HTMLElement) => {
  const w = hostWidth(host);
  return Math.min(window.innerWidth - w, Math.max(-(w - 1), logicalX));
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
    const reverse = this.options.getReverse();
    const logical = clampLogicalX(logicalX, this.options.host);
    applyCssLeft(this.options.host, logicalToCssLeft(logical, this.options.host, reverse));
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
