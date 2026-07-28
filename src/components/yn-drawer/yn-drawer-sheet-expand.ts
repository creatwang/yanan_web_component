export type YnDrawerSheetSize = "peek" | "expanded";

export type YnDrawerSheetExpandController = {
  attach: () => void;
  detach: () => void;
  setEnabled: (enabled: boolean) => void;
  setSize: (size: YnDrawerSheetSize) => void;
  getSize: () => YnDrawerSheetSize;
  dispose: () => void;
};

const EXPAND_THRESHOLD_PX = 40;
const CLOSE_THRESHOLD_PX = 50;
const WHEEL_RESET_MS = 160;

/**
 * Sheet peek↔expanded 手势。
 * 监听挂在 stack（capture），避免只点到 slotted 内容时丢手势；
 * touch-action 由宿主 CSS（data-sheet-*）控制，因 touch-action 不继承。
 */
export function createYnDrawerSheetExpand(input: {
  stack: HTMLElement;
  body: HTMLElement;
  onSizeChange: (size: YnDrawerSheetSize) => void;
  onRequestClose: () => void;
  canExpand: () => boolean;
}): YnDrawerSheetExpandController {
  let attached = false;
  let enabled = false;
  let size: YnDrawerSheetSize = "peek";
  let startY: number | undefined;
  let latestY: number | undefined;
  let startedAtScrollTop = false;
  let wheelDeltaY = 0;
  let wheelResetTimer: ReturnType<typeof setTimeout> | undefined;
  const previousBodyTouchAction = input.body.style.touchAction;
  const previousStackTouchAction = input.stack.style.touchAction;

  /** 测试与无宿主 CSS 时的兜底；正式环境以 host CSS 为准 */
  const syncTouchAction = () => {
    if (!attached) return;
    if (!enabled) {
      input.body.style.touchAction = "";
      input.stack.style.touchAction = "";
      return;
    }
    if (size === "peek") {
      const action = input.canExpand() ? "none" : "pan-y";
      input.body.style.touchAction = action;
      input.stack.style.touchAction = action;
      return;
    }
    const action = input.body.scrollTop === 0 ? "pan-up" : "pan-y";
    input.body.style.touchAction = action;
    input.stack.style.touchAction = action;
  };

  const resetPointer = () => {
    startY = undefined;
    latestY = undefined;
    startedAtScrollTop = false;
  };

  const resetWheel = () => {
    wheelDeltaY = 0;
    if (wheelResetTimer !== undefined) {
      clearTimeout(wheelResetTimer);
      wheelResetTimer = undefined;
    }
  };

  const setSize = (nextSize: YnDrawerSheetSize) => {
    if (size === nextSize) return;
    size = nextSize;
    resetPointer();
    resetWheel();
    input.onSizeChange(nextSize);
    syncTouchAction();
  };

  const evaluatePointer = () => {
    if (!enabled || startY === undefined || latestY === undefined) return;
    const deltaY = latestY - startY;

    if (size === "peek") {
      if (deltaY < -EXPAND_THRESHOLD_PX && input.canExpand()) {
        setSize("expanded");
      }
      return;
    }

    if (
      startedAtScrollTop &&
      input.body.scrollTop === 0 &&
      deltaY > CLOSE_THRESHOLD_PX
    ) {
      resetPointer();
      input.onRequestClose();
    }
  };

  const onPointerDown = (event: PointerEvent) => {
    if (!enabled) return;
    syncTouchAction();
    startY = event.clientY;
    latestY = event.clientY;
    startedAtScrollTop = size === "expanded" && input.body.scrollTop === 0;
    try {
      input.stack.setPointerCapture(event.pointerId);
    } catch {
      /* ignore capture failures */
    }
  };

  const onPointerMove = (event: PointerEvent) => {
    if (!enabled || startY === undefined) return;
    latestY = event.clientY;
    if (size === "peek" && input.canExpand()) {
      event.preventDefault();
    } else if (
      size === "expanded" &&
      startedAtScrollTop &&
      input.body.scrollTop === 0 &&
      latestY - startY > 0
    ) {
      event.preventDefault();
    }
    evaluatePointer();
  };

  const onPointerUp = (event: PointerEvent) => {
    if (!enabled || startY === undefined) return;
    latestY = event.clientY;
    evaluatePointer();
    resetPointer();
  };

  const onPointerCancel = () => {
    resetPointer();
  };

  const onScroll = () => {
    if (startY === undefined) syncTouchAction();
  };

  const onWheel = (event: WheelEvent) => {
    if (!enabled || size !== "peek" || !input.canExpand()) return;
    // 触控板/滚轮向上浏览更多内容 → 展开（与手指上滑一致：deltaY 常为负）
    wheelDeltaY += event.deltaY;
    if (wheelResetTimer !== undefined) clearTimeout(wheelResetTimer);
    wheelResetTimer = setTimeout(resetWheel, WHEEL_RESET_MS);

    if (wheelDeltaY < -EXPAND_THRESHOLD_PX || wheelDeltaY > EXPAND_THRESHOLD_PX) {
      event.preventDefault();
      setSize("expanded");
    }
  };

  const attach = () => {
    if (attached) return;
    attached = true;
    syncTouchAction();
    const opts: AddEventListenerOptions = { capture: true };
    const moveOpts: AddEventListenerOptions = { capture: true, passive: false };
    input.stack.addEventListener("pointerdown", onPointerDown, opts);
    input.stack.addEventListener("pointermove", onPointerMove, moveOpts);
    input.stack.addEventListener("pointerup", onPointerUp, opts);
    input.stack.addEventListener("pointercancel", onPointerCancel, opts);
    input.body.addEventListener("scroll", onScroll);
    input.stack.addEventListener("wheel", onWheel, moveOpts);
  };

  const detach = () => {
    if (!attached) return;
    attached = false;
    const opts: AddEventListenerOptions = { capture: true };
    const moveOpts: AddEventListenerOptions = { capture: true, passive: false };
    input.stack.removeEventListener("pointerdown", onPointerDown, opts);
    input.stack.removeEventListener("pointermove", onPointerMove, moveOpts);
    input.stack.removeEventListener("pointerup", onPointerUp, opts);
    input.stack.removeEventListener("pointercancel", onPointerCancel, opts);
    input.body.removeEventListener("scroll", onScroll);
    input.stack.removeEventListener("wheel", onWheel, moveOpts);
    resetPointer();
    resetWheel();
  };

  const setEnabled = (nextEnabled: boolean) => {
    enabled = nextEnabled;
    if (!enabled) {
      resetPointer();
      resetWheel();
    }
    syncTouchAction();
  };

  const dispose = () => {
    detach();
    input.body.style.touchAction = previousBodyTouchAction;
    input.stack.style.touchAction = previousStackTouchAction;
  };

  return {
    attach,
    detach,
    setEnabled,
    setSize,
    getSize: () => size,
    dispose
  };
}
