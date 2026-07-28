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
const DISMISS_THRESHOLD_PX = 50;
const WHEEL_RESET_MS = 160;

type GestureTarget = HTMLElement;

/**
 * 手势与滚动拆开：
 * - peek：在 stack 上监听（上滑展开 / 下滑关闭），body 不滚
 * - expanded：只在 handle（header）上下滑关闭；body 纯原生滚动，不挂任何手势
 */
export function createYnDrawerSheetExpand(input: {
  stack: HTMLElement;
  body: HTMLElement;
  /** 展开后的关闭手势区，通常是 header */
  handle: HTMLElement;
  onSizeChange: (size: YnDrawerSheetSize) => void;
  onRequestClose: () => void;
  canExpand: () => boolean;
}): YnDrawerSheetExpandController {
  let attached = false;
  let enabled = false;
  let size: YnDrawerSheetSize = "peek";
  let startY: number | undefined;
  let latestY: number | undefined;
  let activePointerId: number | undefined;
  let wheelDeltaY = 0;
  let wheelResetTimer: ReturnType<typeof setTimeout> | undefined;
  const previousBodyTouchAction = input.body.style.touchAction;
  const previousStackTouchAction = input.stack.style.touchAction;
  const previousHandleTouchAction = input.handle.style.touchAction;

  const gestureRoot = (): GestureTarget =>
    size === "expanded" ? input.handle : input.stack;

  const applyPeekTouchAction = () => {
    const action = input.canExpand() ? "none" : "pan-y";
    input.stack.style.touchAction = action;
    input.body.style.touchAction = action;
    input.handle.style.touchAction = action;
    input.stack.removeAttribute("data-sheet-at-top");
  };

  const applyExpandedTouchAction = () => {
    // body 完全交给浏览器滚动
    input.body.style.touchAction = "pan-y";
    input.stack.style.touchAction = "pan-y";
    // 只有把手拦截手势
    input.handle.style.touchAction = "none";
    input.stack.removeAttribute("data-sheet-at-top");
  };

  const clearInlineTouchAction = () => {
    input.body.style.touchAction = previousBodyTouchAction;
    input.stack.style.touchAction = previousStackTouchAction;
    input.handle.style.touchAction = previousHandleTouchAction;
    input.stack.removeAttribute("data-sheet-at-top");
  };

  const syncTouchAction = () => {
    if (!attached) return;
    if (!enabled) {
      clearInlineTouchAction();
      return;
    }
    if (size === "peek") applyPeekTouchAction();
    else applyExpandedTouchAction();
  };

  const resetGesture = () => {
    startY = undefined;
    latestY = undefined;
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
    const prevRoot = gestureRoot();
    size = nextSize;
    resetGesture();
    resetWheel();
    input.onSizeChange(nextSize);
    syncTouchAction();
    // 切换监听根节点
    if (attached && enabled) {
      unbindRoot(prevRoot);
      bindRoot(gestureRoot());
    }
  };

  const dismiss = () => {
    resetGesture();
    input.onRequestClose();
  };

  const evaluate = () => {
    if (!enabled || startY === undefined || latestY === undefined) return;
    const deltaY = latestY - startY;

    if (size === "peek") {
      if (deltaY < -EXPAND_THRESHOLD_PX && input.canExpand()) {
        setSize("expanded");
        return;
      }
      if (deltaY > DISMISS_THRESHOLD_PX) dismiss();
      return;
    }

    // expanded：仅把手下滑关闭
    if (deltaY > DISMISS_THRESHOLD_PX) dismiss();
  };

  const onPointerDown = (event: PointerEvent) => {
    if (!enabled) return;
    if (event.pointerType === "touch") return;
    startY = event.clientY;
    latestY = event.clientY;
    activePointerId = event.pointerId;
    try {
      gestureRoot().setPointerCapture(event.pointerId);
    } catch {
      /* ignore */
    }
  };

  const onPointerMove = (event: PointerEvent) => {
    if (!enabled || startY === undefined) return;
    if (event.pointerType === "touch") return;
    if (activePointerId !== undefined && event.pointerId !== activePointerId) return;
    latestY = event.clientY;
    event.preventDefault();
    evaluate();
  };

  const onPointerUp = (event: PointerEvent) => {
    if (!enabled || startY === undefined) return;
    if (event.pointerType === "touch") return;
    if (activePointerId !== undefined && event.pointerId !== activePointerId) return;
    latestY = event.clientY;
    evaluate();
    resetGesture();
  };

  const onPointerCancel = (event: PointerEvent) => {
    if (event.pointerType === "touch") return;
    resetGesture();
  };

  const onTouchStart = (event: TouchEvent) => {
    if (!enabled || event.touches.length !== 1) return;
    const touch = event.touches[0];
    if (!touch) return;
    startY = touch.clientY;
    latestY = touch.clientY;
    activePointerId = undefined;
  };

  const onTouchMove = (event: TouchEvent) => {
    if (!enabled || startY === undefined || event.touches.length !== 1) return;
    const touch = event.touches[0];
    if (!touch) return;
    latestY = touch.clientY;
    event.preventDefault();
    evaluate();
  };

  const onTouchEnd = () => {
    if (!enabled || startY === undefined) return;
    evaluate();
    resetGesture();
  };

  const onWheel = (event: WheelEvent) => {
    if (!enabled || size !== "peek" || !input.canExpand()) return;
    wheelDeltaY += event.deltaY;
    if (wheelResetTimer !== undefined) clearTimeout(wheelResetTimer);
    wheelResetTimer = setTimeout(resetWheel, WHEEL_RESET_MS);
    if (wheelDeltaY < -EXPAND_THRESHOLD_PX) {
      event.preventDefault();
      setSize("expanded");
    }
  };

  const bindRoot = (root: GestureTarget) => {
    const opts: AddEventListenerOptions = { capture: true };
    const moveOpts: AddEventListenerOptions = { capture: true, passive: false };
    root.addEventListener("pointerdown", onPointerDown, opts);
    root.addEventListener("pointermove", onPointerMove, moveOpts);
    root.addEventListener("pointerup", onPointerUp, opts);
    root.addEventListener("pointercancel", onPointerCancel, opts);
    root.addEventListener("touchstart", onTouchStart, opts);
    root.addEventListener("touchmove", onTouchMove, moveOpts);
    root.addEventListener("touchend", onTouchEnd, opts);
    root.addEventListener("touchcancel", onTouchEnd, opts);
    if (root === input.stack) {
      root.addEventListener("wheel", onWheel, moveOpts);
    }
  };

  const unbindRoot = (root: GestureTarget) => {
    const opts: AddEventListenerOptions = { capture: true };
    const moveOpts: AddEventListenerOptions = { capture: true, passive: false };
    root.removeEventListener("pointerdown", onPointerDown, opts);
    root.removeEventListener("pointermove", onPointerMove, moveOpts);
    root.removeEventListener("pointerup", onPointerUp, opts);
    root.removeEventListener("pointercancel", onPointerCancel, opts);
    root.removeEventListener("touchstart", onTouchStart, opts);
    root.removeEventListener("touchmove", onTouchMove, moveOpts);
    root.removeEventListener("touchend", onTouchEnd, opts);
    root.removeEventListener("touchcancel", onTouchEnd, opts);
    root.removeEventListener("wheel", onWheel, moveOpts);
  };

  const attach = () => {
    if (attached) return;
    attached = true;
    syncTouchAction();
    bindRoot(gestureRoot());
  };

  const detach = () => {
    if (!attached) return;
    attached = false;
    unbindRoot(input.stack);
    unbindRoot(input.handle);
    resetGesture();
    resetWheel();
  };

  const setEnabled = (nextEnabled: boolean) => {
    enabled = nextEnabled;
    if (!enabled) {
      resetGesture();
      resetWheel();
    }
    syncTouchAction();
  };

  const dispose = () => {
    detach();
    clearInlineTouchAction();
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
