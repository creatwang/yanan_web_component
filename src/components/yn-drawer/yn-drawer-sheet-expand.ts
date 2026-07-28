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

/**
 * Sheet peek↔expanded 手势。
 * - peek：touch-action none + capture；上滑展开，下滑关闭
 * - expanded 且 scrollTop===0：touch-action pan-up（允许上滑滚内容，下滑交给 JS 关闭）
 * - expanded 且已滚动：touch-action pan-y（双向滚动）
 *
 * 注意：expanded 全程 pan-y 时浏览器会吞掉下拉并 pointercancel，导致无法关闭。
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
    // expanded：顶部用 pan-up，让下拉不被浏览器当成滚动吞掉
    applyTouchAction(atBodyTop() ? "pan-up" : "pan-y");
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

  const dismiss = () => {
    resetPointer();
    input.onRequestClose();
  };

  const evaluatePointer = () => {
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

    // expanded 顶部下拉 → 直接关闭
    if (startedAtScrollTop && atBodyTop() && deltaY > DISMISS_THRESHOLD_PX) {
      dismiss();
    }
  };

  const onPointerDown = (event: PointerEvent) => {
    if (!enabled) return;
    syncTouchAction();
    startY = event.clientY;
    latestY = event.clientY;
    activePointerId = event.pointerId;
    startedAtScrollTop = size === "expanded" && atBodyTop();

    // peek 全程捕获；expanded 仅在顶部捕获下拉，避免抢走中部滚动
    if (size === "peek" || startedAtScrollTop) {
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

    if (startedAtScrollTop && atBodyTop() && deltaY > 0) {
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
    syncTouchAction();
  };

  const onPointerCancel = () => {
    resetPointer();
    syncTouchAction();
  };

  const onScroll = () => {
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
    activePointerId = undefined;
  };

  const onTouchMove = (event: TouchEvent) => {
    if (!enabled || startY === undefined || event.touches.length !== 1) return;
    const touch = event.touches[0];
    if (!touch) return;
    latestY = touch.clientY;
    const deltaY = latestY - startY;

    if (size === "peek") {
      event.preventDefault();
      evaluatePointer();
      return;
    }

    if (startedAtScrollTop && atBodyTop() && deltaY > 0) {
      event.preventDefault();
      evaluatePointer();
    }
  };

  const onTouchEnd = () => {
    if (!enabled || startY === undefined) return;
    evaluatePointer();
    resetPointer();
    syncTouchAction();
  };

  const onWheel = (event: WheelEvent) => {
    if (!enabled) return;

    if (size === "peek") {
      if (event.deltaY > DISMISS_THRESHOLD_PX) {
        event.preventDefault();
        dismiss();
        return;
      }
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

    // expanded 顶部：滚轮向下（deltaY>0）关闭
    if (atBodyTop() && event.deltaY > DISMISS_THRESHOLD_PX) {
      event.preventDefault();
      dismiss();
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
