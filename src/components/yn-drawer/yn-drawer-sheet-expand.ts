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
const COLLAPSE_THRESHOLD_PX = 50;
const WHEEL_RESET_MS = 160;

/**
 * Sheet peek↔expanded 手势。
 * - peek：capture + 上滑展开 / 下滑关闭
 * - expanded：不 capture，交给 body 原生滚动；仅在 scrollTop===0 时下滑收回到 peek
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
  let activePointerId: number | undefined;
  let wheelDeltaY = 0;
  let wheelResetTimer: ReturnType<typeof setTimeout> | undefined;
  const previousBodyTouchAction = input.body.style.touchAction;
  const previousStackTouchAction = input.stack.style.touchAction;

  const clearInlineTouchAction = () => {
    input.body.style.touchAction = "";
    input.stack.style.touchAction = "";
  };

  /** peek 需要 none；expanded 清掉 inline，交给 CSS `pan-y` 以允许双向滚动 */
  const syncTouchAction = () => {
    if (!attached) return;
    if (!enabled) {
      clearInlineTouchAction();
      return;
    }
    if (size === "peek") {
      const action = input.canExpand() ? "none" : "pan-y";
      input.body.style.touchAction = action;
      input.stack.style.touchAction = action;
      return;
    }
    clearInlineTouchAction();
  };

  const resetPointer = () => {
    startY = undefined;
    latestY = undefined;
    startedAtScrollTop = false;
    activePointerId = undefined;
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
        return;
      }
      if (deltaY > COLLAPSE_THRESHOLD_PX) {
        resetPointer();
        input.onRequestClose();
      }
      return;
    }

    // expanded：仅顶部继续下拉 → 收回 peek
    if (
      startedAtScrollTop &&
      input.body.scrollTop <= 0 &&
      deltaY > COLLAPSE_THRESHOLD_PX
    ) {
      setSize("peek");
    }
  };

  const onPointerDown = (event: PointerEvent) => {
    if (!enabled) return;
    syncTouchAction();
    startY = event.clientY;
    latestY = event.clientY;
    activePointerId = event.pointerId;
    startedAtScrollTop = size === "expanded" && input.body.scrollTop <= 0;

    // 仅 peek 捕获：expanded 捕获会抢走 body 的原生滚动
    if (size === "peek") {
      try {
        input.stack.setPointerCapture(event.pointerId);
      } catch {
        /* ignore */
      }
    }
  };

  const onPointerMove = (event: PointerEvent) => {
    if (!enabled || startY === undefined) return;
    if (activePointerId !== undefined && event.pointerId !== activePointerId) {
      return;
    }
    latestY = event.clientY;
    const deltaY = latestY - startY;

    if (size === "peek") {
      event.preventDefault();
      evaluatePointer();
      return;
    }

    // expanded 顶部下拉：阻止页面/内部抢手势，用于收回 peek
    if (startedAtScrollTop && input.body.scrollTop <= 0 && deltaY > 0) {
      event.preventDefault();
      evaluatePointer();
    }
  };

  const onPointerUp = (event: PointerEvent) => {
    if (!enabled || startY === undefined) return;
    if (activePointerId !== undefined && event.pointerId !== activePointerId) {
      return;
    }
    latestY = event.clientY;
    evaluatePointer();
    resetPointer();
  };

  const onPointerCancel = () => {
    resetPointer();
  };

  const onWheel = (event: WheelEvent) => {
    if (!enabled) return;

    if (size === "peek" && input.canExpand()) {
      wheelDeltaY += event.deltaY;
      if (wheelResetTimer !== undefined) clearTimeout(wheelResetTimer);
      wheelResetTimer = setTimeout(resetWheel, WHEEL_RESET_MS);
      if (
        wheelDeltaY < -EXPAND_THRESHOLD_PX ||
        wheelDeltaY > EXPAND_THRESHOLD_PX
      ) {
        event.preventDefault();
        setSize("expanded");
      }
      return;
    }

    if (
      size === "expanded" &&
      input.body.scrollTop <= 0 &&
      event.deltaY < 0
    ) {
      // 顶部继续向上滚（触控板语义常为收起）→ 收回 peek
      wheelDeltaY += event.deltaY;
      if (wheelResetTimer !== undefined) clearTimeout(wheelResetTimer);
      wheelResetTimer = setTimeout(resetWheel, WHEEL_RESET_MS);
      if (wheelDeltaY < -COLLAPSE_THRESHOLD_PX) {
        event.preventDefault();
        setSize("peek");
      }
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
