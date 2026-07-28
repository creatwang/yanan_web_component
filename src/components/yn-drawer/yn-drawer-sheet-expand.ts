export type YnDrawerSheetSize = "peek" | "expanded";

export type YnDrawerSheetCloseOptions = {
  /** 跟手关闭动画已到位，宿主跳过再次退场 */
  dragSettled?: boolean;
};

export type YnDrawerSheetExpandController = {
  attach: () => void;
  detach: () => void;
  setEnabled: (enabled: boolean) => void;
  setSize: (size: YnDrawerSheetSize) => void;
  getSize: () => YnDrawerSheetSize;
  dispose: () => void;
};

const EXPAND_PX = 40;
const DISMISS_RATIO = 0.22;
const DISMISS_MIN = 96;
const DISMISS_MAX = 180;
const DISMISS_FLICK = 0.65;
const DISMISS_LOCK = 8;
const SETTLE_MS = 280;
const SPRING_MS = 320;

type Zone = "body" | "chrome" | "other";

/** peek 上滑展开；下拉 / 顶下拉 / chrome 下拉跟手关闭 */
export function createYnDrawerSheetExpand(input: {
  stack: HTMLElement;
  body: HTMLElement;
  chrome: HTMLElement[];
  backdrop?: HTMLElement | null;
  onSizeChange: (size: YnDrawerSheetSize) => void;
  onRequestClose: (options?: YnDrawerSheetCloseOptions) => void;
  canExpand: () => boolean;
}): YnDrawerSheetExpandController {
  let attached = false;
  let enabled = false;
  let size: YnDrawerSheetSize = "peek";
  let startY = 0;
  let tracking = false;
  let zone: Zone = "other";
  let atTopOnStart = false;
  let dismissLocked = false;
  let pointerId: number | undefined;
  let dragY = 0;
  let settling = false;
  let lastY = 0;
  let lastTs = 0;
  let velocityY = 0;
  let stackH = 1;
  let settleTimer = 0;

  const prevTouch = {
    body: input.body.style.touchAction,
    stack: input.stack.style.touchAction,
    chrome: input.chrome.map((el) => el.style.touchAction)
  };

  const atTop = () => input.body.scrollTop <= 0;

  const zoneOf = (event: Event): Zone => {
    const path = event.composedPath();
    if (path.includes(input.body)) return "body";
    if (input.chrome.some((el) => path.includes(el))) return "chrome";
    const t = event.target;
    if (t instanceof Node) {
      if (input.body.contains(t)) return "body";
      if (input.chrome.some((el) => el.contains(t))) return "chrome";
    }
    return "other";
  };

  const setTouches = (action: string | null) => {
    const apply = (el: HTMLElement, value: string) => {
      el.style.touchAction = value;
    };
    if (action == null) {
      apply(input.body, prevTouch.body);
      apply(input.stack, prevTouch.stack);
      input.chrome.forEach((el, i) => apply(el, prevTouch.chrome[i] ?? ""));
      return;
    }
    apply(input.stack, action);
    apply(input.body, action);
    input.chrome.forEach((el) => apply(el, action));
  };

  const syncTouch = () => {
    if (!attached) return;
    if (!enabled) {
      setTouches(null);
      return;
    }
    if (size === "peek") {
      setTouches(input.canExpand() ? "none" : "pan-y");
      return;
    }
    input.body.style.touchAction = "pan-y";
    input.stack.style.touchAction = "manipulation";
    input.chrome.forEach((el) => {
      el.style.touchAction = "none";
    });
  };

  const paintDrag = (y: number) => {
    dragY = Math.max(0, y);
    const progress = Math.min(1, dragY / (stackH * 0.45));
    input.stack.style.transition = "none";
    input.stack.style.transform = `translate3d(0,${dragY}px,0)`;
    if (input.backdrop) {
      input.backdrop.style.transition = "none";
      input.backdrop.style.opacity = String(1 - progress * 0.9);
    }
  };

  const clearDrag = () => {
    dragY = 0;
    velocityY = 0;
    settling = false;
    if (settleTimer) {
      window.clearTimeout(settleTimer);
      settleTimer = 0;
    }
    input.stack.style.transition = "";
    input.stack.style.transform = "";
    if (input.backdrop) {
      input.backdrop.style.transition = "";
      input.backdrop.style.opacity = "";
    }
  };

  const threshold = () =>
    Math.min(DISMISS_MAX, Math.max(DISMISS_MIN, stackH * DISMISS_RATIO));

  const settle = () => {
    if (dragY <= 0 || settling) return;
    settling = true;
    const close = dragY >= threshold() || velocityY >= DISMISS_FLICK;
    const ms = close ? SETTLE_MS : SPRING_MS;
    const ease = close ? "ease-in" : "cubic-bezier(0.22,1,0.36,1)";
    const y = close ? stackH * 1.12 : 0;

    input.stack.style.transition = `transform ${ms}ms ${ease}`;
    input.stack.style.transform = `translate3d(0,${y}px,0)`;
    if (input.backdrop) {
      input.backdrop.style.transition = `opacity ${ms}ms ${ease}`;
      input.backdrop.style.opacity = close ? "0" : "1";
    }

    settleTimer = window.setTimeout(() => {
      settleTimer = 0;
      if (close) {
        dragY = 0;
        velocityY = 0;
        settling = false;
        input.onRequestClose({ dragSettled: true });
        return;
      }
      clearDrag();
      syncTouch();
    }, ms + 16);
  };

  const resetGesture = () => {
    if (pointerId !== undefined) {
      try {
        if (input.stack.hasPointerCapture?.(pointerId)) {
          input.stack.releasePointerCapture(pointerId);
        }
      } catch {
        /* ignore */
      }
    }
    tracking = false;
    zone = "other";
    atTopOnStart = false;
    dismissLocked = false;
    pointerId = undefined;
  };

  const setSize = (next: YnDrawerSheetSize) => {
    if (size === next) return;
    size = next;
    clearDrag();
    resetGesture();
    input.onSizeChange(next);
    syncTouch();
  };

  const begin = (clientY: number, nextZone: Zone, id?: number) => {
    if (settling) return;
    if (dragY > 0) clearDrag();
    tracking = true;
    startY = clientY;
    zone = nextZone;
    atTopOnStart = size === "expanded" && nextZone === "body" && atTop();
    dismissLocked = false;
    pointerId = id;
    lastY = clientY;
    lastTs = performance.now();
    velocityY = 0;
    stackH = Math.max(input.stack.getBoundingClientRect().height, 1);
  };

  const trackVel = (clientY: number) => {
    const now = performance.now();
    const dt = now - lastTs;
    // 过滤同帧合成事件，避免瞬时超大速度误触发甩出关闭
    if (dt >= 8 && dt < 120) velocityY = (clientY - lastY) / dt;
    lastY = clientY;
    lastTs = now;
  };

  const move = (clientY: number): boolean => {
    if (!tracking || settling) return false;
    trackVel(clientY);
    const dy = clientY - startY;

    if (size === "peek") {
      if (dy < 0) {
        if (dragY > 0) paintDrag(0);
        if (dy < -EXPAND_PX && zone === "body" && input.canExpand()) {
          setSize("expanded");
        }
        return true;
      }
      if (zone === "body" || zone === "chrome") {
        paintDrag(dy);
        return true;
      }
      return true;
    }

    if (zone === "chrome") {
      if (dy > 0) {
        paintDrag(dy);
        return true;
      }
      if (dragY > 0) paintDrag(0);
      return false;
    }

    if (zone === "body") {
      if (dy <= 0 || !atTop()) {
        dismissLocked = false;
        if (dragY > 0 && dy <= 0) paintDrag(0);
        return false;
      }
      if ((atTopOnStart || atTop()) && dy > DISMISS_LOCK) dismissLocked = true;
      if (dismissLocked) {
        paintDrag(dy);
        return true;
      }
    }
    return false;
  };

  const end = () => {
    if (!tracking || settling) return;
    settle();
    resetGesture();
    if (!settling) syncTouch();
  };

  const onPointerDown = (event: PointerEvent) => {
    if (!enabled || event.pointerType === "touch") return;
    const z = zoneOf(event);
    if (size === "expanded" && z === "other") return;
    begin(event.clientY, z, event.pointerId);
    if (size === "peek" || z === "chrome") {
      try {
        input.stack.setPointerCapture(event.pointerId);
      } catch {
        /* ignore */
      }
    }
  };

  const onPointerMove = (event: PointerEvent) => {
    if (!enabled || !tracking || event.pointerType === "touch") return;
    if (pointerId !== undefined && event.pointerId !== pointerId) return;
    if (move(event.clientY)) event.preventDefault();
  };

  const onPointerUp = (event: PointerEvent) => {
    if (!enabled || !tracking || event.pointerType === "touch") return;
    if (pointerId !== undefined && event.pointerId !== pointerId) return;
    trackVel(event.clientY);
    end();
  };

  const onPointerCancel = (event: PointerEvent) => {
    if (event.pointerType === "touch") return;
    if (dragY > 0) settle();
    resetGesture();
    syncTouch();
  };

  const onTouchStart = (event: TouchEvent) => {
    if (!enabled || event.touches.length !== 1) return;
    const touch = event.touches[0];
    if (!touch) return;
    const z = zoneOf(event);
    if (size === "expanded" && z === "other") return;
    begin(touch.clientY, z);
  };

  const onTouchMove = (event: TouchEvent) => {
    if (!enabled || !tracking || event.touches.length !== 1) return;
    const touch = event.touches[0];
    if (!touch) return;
    if (move(touch.clientY)) event.preventDefault();
  };

  const onTouchEnd = () => {
    if (!enabled || !tracking) return;
    end();
  };

  const onScroll = () => {
    if (!atTop()) {
      dismissLocked = false;
      atTopOnStart = false;
    }
  };

  const bind = (on: boolean) => {
    const opts: AddEventListenerOptions = { capture: true };
    const moveOpts: AddEventListenerOptions = { capture: true, passive: false };
    const fn = on ? "addEventListener" : "removeEventListener";
    input.stack[fn]("pointerdown", onPointerDown, opts);
    input.stack[fn]("pointermove", onPointerMove, moveOpts);
    input.stack[fn]("pointerup", onPointerUp, opts);
    input.stack[fn]("pointercancel", onPointerCancel, opts);
    input.stack[fn]("touchstart", onTouchStart, opts);
    input.stack[fn]("touchmove", onTouchMove, moveOpts);
    input.stack[fn]("touchend", onTouchEnd, opts);
    input.stack[fn]("touchcancel", onTouchEnd, opts);
    if (on) input.body.addEventListener("scroll", onScroll, { passive: true });
    else input.body.removeEventListener("scroll", onScroll);
  };

  return {
    attach() {
      if (attached) return;
      attached = true;
      syncTouch();
      bind(true);
    },
    detach() {
      if (!attached) return;
      attached = false;
      bind(false);
      clearDrag();
      resetGesture();
    },
    setEnabled(next) {
      enabled = next;
      if (!enabled) {
        clearDrag();
        resetGesture();
      }
      syncTouch();
    },
    setSize,
    getSize: () => size,
    dispose() {
      if (attached) {
        attached = false;
        bind(false);
      }
      clearDrag();
      resetGesture();
      setTouches(null);
    }
  };
}
