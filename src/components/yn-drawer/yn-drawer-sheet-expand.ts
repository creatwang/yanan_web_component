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
const DISMISS_LOCK_PX = 8;
const WHEEL_RESET_MS = 160;

/**
 * Sheet 手势分工：
 * - peek：capture + touch-action none → 上滑展开 / 下滑关闭
 * - expanded：绝不 capture（否则原生滚动失效）
 *   - scrollTop===0：touch-action pan-up → 上滑滚内容，下滑由 JS 关闭
 *   - scrollTop>0：touch-action pan-y → 双向滚动
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
  /** expanded 顶部已确认是「下拉关闭」手势后，才 preventDefault */
  let dismissLocked = false;
  let activePointerId: number | undefined;
  let wheelDeltaY = 0;
  let wheelResetTimer: ReturnType<typeof setTimeout> | undefined;
  const previousBodyTouchAction = input.body.style.touchAction;
  const previousStackTouchAction = input.stack.style.touchAction;

  const atBodyTop = () => input.body.scrollTop <= 0;

  const applyTouchAction = (action: string) => {
    input.body.style.touchAction = action;
    input.stack.style.touchAction = action;
    if (size === "expanded") {
      input.stack.toggleAttribute("data-sheet-at-top", action === "pan-up");
    } else {
      input.stack.removeAttribute("data-sheet-at-top");
    }
  };

  const clearInlineTouchAction = () => {
    input.body.style.touchAction = "";
    input.stack.style.touchAction = "";
    input.stack.removeAttribute("data-sheet-at-top");
  };

  const syncTouchAction = () => {
    if (!attached) return;
    if (!enabled) {
      clearInlineTouchAction();
      return;
    }
    if (size === "peek") {
      applyTouchAction(input.canExpand() ? "none" : "pan-y");
      return;
    }
    applyTouchAction(atBodyTop() ? "pan-up" : "pan-y");
  };

  const resetGesture = () => {
    startY = undefined;
    latestY = undefined;
    startedAtScrollTop = false;
    dismissLocked = false;
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
    resetGesture();
    resetWheel();
    input.onSizeChange(nextSize);
    syncTouchAction();
  };

  const dismiss = () => {
    resetGesture();
    input.onRequestClose();
  };

  const onScroll = () => {
    // 用户已经开始滚内容，取消关闭手势跟踪
    if (!atBodyTop()) {
      dismissLocked = false;
      startedAtScrollTop = false;
    }
    syncTouchAction();
  };

  const trackMove = (clientY: number): { deltaY: number; shouldPrevent: boolean } => {
    latestY = clientY;
    const deltaY = clientY - (startY ?? clientY);

    if (size === "peek") {
      return { deltaY, shouldPrevent: true };
    }

    // expanded：只有顶部明确下拉才拦截；上滑交给浏览器滚动
    if (startedAtScrollTop && atBodyTop() && deltaY > DISMISS_LOCK_PX) {
      dismissLocked = true;
    }
    if (dismissLocked && atBodyTop() && deltaY > 0) {
      return { deltaY, shouldPrevent: true };
    }
    return { deltaY, shouldPrevent: false };
  };

  const evaluate = () => {
    if (!enabled || startY === undefined || latestY === undefined) return;
    const deltaY = latestY - startY;

    if (size === "peek") {
      if (deltaY < -EXPAND_THRESHOLD_PX && input.canExpand()) {
        setSize("expanded");
        return;
      }
      if (deltaY > DISMISS_THRESHOLD_PX) {
        dismiss();
      }
      return;
    }

    if (
      (startedAtScrollTop || dismissLocked) &&
      atBodyTop() &&
      deltaY > DISMISS_THRESHOLD_PX
    ) {
      dismiss();
    }
  };

  const onPointerDown = (event: PointerEvent) => {
    if (!enabled) return;
    // 移动端由 touch* 处理，避免 pointer+touch 双通道互相打断滚动
    if (event.pointerType === "touch") return;

    syncTouchAction();
    startY = event.clientY;
    latestY = event.clientY;
    activePointerId = event.pointerId;
    startedAtScrollTop = size === "expanded" && atBodyTop();
    dismissLocked = false;

    if (size === "peek") {
      try {
        input.stack.setPointerCapture(event.pointerId);
      } catch {
        /* ignore */
      }
    }
    // expanded：绝不 capture
  };

  const onPointerMove = (event: PointerEvent) => {
    if (!enabled || startY === undefined) return;
    if (event.pointerType === "touch") return;
    if (activePointerId !== undefined && event.pointerId !== activePointerId) {
      return;
    }

    const { shouldPrevent } = trackMove(event.clientY);
    if (shouldPrevent) event.preventDefault();
    evaluate();
  };

  const onPointerUp = (event: PointerEvent) => {
    if (!enabled || startY === undefined) return;
    if (event.pointerType === "touch") return;
    if (activePointerId !== undefined && event.pointerId !== activePointerId) {
      return;
    }
    latestY = event.clientY;
    evaluate();
    resetGesture();
    syncTouchAction();
  };

  const onPointerCancel = (event: PointerEvent) => {
    if (event.pointerType === "touch") return;
    resetGesture();
    syncTouchAction();
  };

  const onTouchStart = (event: TouchEvent) => {
    if (!enabled || event.touches.length !== 1) return;
    const touch = event.touches[0];
    if (!touch) return;
    syncTouchAction();
    startY = touch.clientY;
    latestY = touch.clientY;
    startedAtScrollTop = size === "expanded" && atBodyTop();
    dismissLocked = false;
    activePointerId = undefined;
  };

  const onTouchMove = (event: TouchEvent) => {
    if (!enabled || startY === undefined || event.touches.length !== 1) return;
    const touch = event.touches[0];
    if (!touch) return;

    const { shouldPrevent } = trackMove(touch.clientY);
    if (shouldPrevent) event.preventDefault();
    evaluate();
  };

  const onTouchEnd = () => {
    if (!enabled || startY === undefined) return;
    evaluate();
    resetGesture();
    syncTouchAction();
  };

  const onWheel = (event: WheelEvent) => {
    if (!enabled) return;

    if (size === "peek") {
      if (!input.canExpand()) return;
      wheelDeltaY += event.deltaY;
      if (wheelResetTimer !== undefined) clearTimeout(wheelResetTimer);
      wheelResetTimer = setTimeout(resetWheel, WHEEL_RESET_MS);
      if (wheelDeltaY < -EXPAND_THRESHOLD_PX) {
        event.preventDefault();
        setSize("expanded");
      }
      return;
    }

    // expanded：滚轮只负责滚动，不关闭（避免顶部无法滚进内容）
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
    input.stack.addEventListener("touchstart", onTouchStart, opts);
    input.stack.addEventListener("touchmove", onTouchMove, moveOpts);
    input.stack.addEventListener("touchend", onTouchEnd, opts);
    input.stack.addEventListener("touchcancel", onTouchEnd, opts);
    input.stack.addEventListener("wheel", onWheel, moveOpts);
    input.body.addEventListener("scroll", onScroll, { passive: true });
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
    input.stack.removeEventListener("touchstart", onTouchStart, opts);
    input.stack.removeEventListener("touchmove", onTouchMove, moveOpts);
    input.stack.removeEventListener("touchend", onTouchEnd, opts);
    input.stack.removeEventListener("touchcancel", onTouchEnd, opts);
    input.stack.removeEventListener("wheel", onWheel, moveOpts);
    input.body.removeEventListener("scroll", onScroll);
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
    input.body.style.touchAction = previousBodyTouchAction;
    input.stack.style.touchAction = previousStackTouchAction;
    input.stack.removeAttribute("data-sheet-at-top");
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
