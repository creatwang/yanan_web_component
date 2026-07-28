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
/** iOS sheet 风格吸附曲线 */
const HEIGHT_EASE = "cubic-bezier(0.32, 0.72, 0, 1)";

type Zone = "body" | "chrome" | "other";
type DragMode = "none" | "translate" | "height-collapse" | "height-expand";

/**
 * peek 上滑 → 跟手拉高到封顶（expanded，铺满 surface 内容区）；
 * expanded 顶下拉 / chrome 下拉 → 滚动区跟手缩回 peek；
 * peek 下拉 → 整抽屉跟手关闭。
 */
export function createYnDrawerSheetExpand(input: {
  stack: HTMLElement;
  body: HTMLElement;
  chrome: HTMLElement[];
  backdrop?: HTMLElement | null;
  onSizeChange: (size: YnDrawerSheetSize) => void;
  onRequestClose: (options?: YnDrawerSheetCloseOptions) => void;
  canExpand: () => boolean;
  getPeekHeightPx?: () => number;
  getExpandedHeightPx?: () => number;
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
  let dragMode: DragMode = "none";
  let settling = false;
  let lastY = 0;
  let lastTs = 0;
  let velocityY = 0;
  let stackH = 1;
  /** 手势起点实测高度：上滑展开必须以它为基准，不能用 CSS peek 估值，否则跟手整体偏移 */
  let startH = 1;
  let peekH = 1;
  let expandedH = 1;
  let settleTimer = 0;
  let currentH = 1;
  /** 离开 peek 前实测高度；收缩应对齐它，避免矮内容落到 78vh 再跳回 */
  let cachedPeekH = 0;
  let bodyOverflowLocked = false;

  const prevTouch = {
    body: input.body.style.touchAction,
    stack: input.stack.style.touchAction,
    chrome: input.chrome.map((el) => el.style.touchAction)
  };

  const atTop = () => input.body.scrollTop <= 0;

  const rememberPeekH = () => {
    const h = input.stack.getBoundingClientRect().height;
    if (h > 0) cachedPeekH = h;
  };

  const collapseMinH = () => {
    if (cachedPeekH <= 0) return peekH;
    // 实测 peek 已含 max-height 约束；仅在明确有 CSS 封顶时再截断
    const cap = input.getPeekHeightPx?.() ?? 0;
    return cap > 0 ? Math.min(cachedPeekH, cap) : cachedPeekH;
  };

  const lockBodyScroll = () => {
    if (bodyOverflowLocked) return;
    bodyOverflowLocked = true;
    input.body.scrollTop = 0;
    input.body.style.overflow = "hidden";
  };

  const unlockBodyScroll = () => {
    if (!bodyOverflowLocked) return;
    bodyOverflowLocked = false;
    input.body.style.overflow = "";
  };

  const isInteractiveTarget = (event: Event) => {
    for (const node of event.composedPath()) {
      if (!(node instanceof Element)) continue;
      const tag = node.tagName;
      if (
        tag === "BUTTON" ||
        tag === "A" ||
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT" ||
        tag === "YN-ICON-BUTTON" ||
        tag === "YN-BUTTON" ||
        tag === "YN-QUANTITY"
      ) {
        return true;
      }
      if (node.getAttribute?.("role") === "button") return true;
    }
    return false;
  };

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

  const resolvePeekH = () => {
    const fromCb = input.getPeekHeightPx?.() ?? 0;
    return fromCb > 0 ? fromCb : Math.max(stackH * 0.78, 1);
  };

  const resolveExpandedH = () => {
    const fromCb = input.getExpandedHeightPx?.() ?? 0;
    if (fromCb > 0) return fromCb;
    return typeof window !== "undefined"
      ? Math.max(window.innerHeight, stackH)
      : Math.max(stackH, 1);
  };

  const clearInlineHeight = () => {
    input.stack.style.height = "";
    input.stack.style.maxHeight = "";
  };

  const setHeightNow = (h: number) => {
    currentH = h;
    input.stack.style.transition = "none";
    input.stack.style.height = `${h}px`;
    input.stack.style.maxHeight = `${h}px`;
  };

  const settleDurationMs = (from: number, to: number) => {
    const dist = Math.abs(to - from);
    const pxPerMs = Math.max(Math.abs(velocityY), 0.35);
    return Math.min(420, Math.max(220, dist / pxPerMs));
  };

  const paintDrag = (y: number) => {
    dragY = Math.max(0, y);

    // expanded → peek：收缩滚动区高度
    if (dragMode === "height-collapse") {
      lockBodyScroll();
      setHeightNow(Math.min(stackH, Math.max(collapseMinH(), stackH - dragY)));
      return;
    }

    // peek → expanded：从按下时实测高度跟手拉高（与手指位移 1:1）
    if (dragMode === "height-expand") {
      setHeightNow(Math.min(expandedH, startH + dragY));
      return;
    }

    // peek → close：整抽屉跟手平移
    dragMode = "translate";
    const progress = Math.min(1, dragY / (stackH * 0.45));
    input.stack.style.transition = "none";
    input.stack.style.transform = `translate3d(0,${dragY}px,0)`;
    if (input.backdrop) {
      input.backdrop.style.transition = "none";
      input.backdrop.style.opacity = String(1 - progress * 0.9);
    }
  };

  const clearDragPaint = (opts?: { restoreBackdrop?: boolean }) => {
    input.stack.style.transition = "";
    input.stack.style.transform = "";
    input.stack.style.willChange = "";
    clearInlineHeight();
    unlockBodyScroll();
    if (!input.backdrop) return;
    // 高度手势不改遮罩；清空 inline opacity 会回到 CSS opacity:0，展开后遮罩会消失
    if (opts?.restoreBackdrop === false) return;
    input.backdrop.style.transition = "";
    input.backdrop.style.opacity = "1";
  };

  const clearDrag = () => {
    dragY = 0;
    dragMode = "none";
    velocityY = 0;
    settling = false;
    if (settleTimer) {
      window.clearTimeout(settleTimer);
      settleTimer = 0;
    }
    clearDragPaint();
  };

  const threshold = () =>
    Math.min(DISMISS_MAX, Math.max(DISMISS_MIN, stackH * DISMISS_RATIO));

  const applySize = (next: YnDrawerSheetSize) => {
    if (size === next) return;
    size = next;
    input.onSizeChange(next);
    syncTouch();
  };

  /** 从当前跟手高度连续动画到目标，再交给 CSS 档位，避免松手跳变 */
  const animateHeightTo = (targetPx: number, nextSize: YnDrawerSheetSize) => {
    settling = true;
    const from = currentH || input.stack.getBoundingClientRect().height;
    setHeightNow(from);
    void input.stack.offsetHeight;
    const ms = settleDurationMs(from, targetPx);
    input.stack.style.willChange = "height";
    input.stack.style.transition = `height ${ms}ms ${HEIGHT_EASE}, max-height ${ms}ms ${HEIGHT_EASE}`;
    input.stack.style.height = `${targetPx}px`;
    input.stack.style.maxHeight = `${targetPx}px`;
    currentH = targetPx;

    settleTimer = window.setTimeout(() => {
      settleTimer = 0;
      applySize(nextSize);
      // 先钉在目标像素，再清 inline，减少切到 CSS 时的闪一下
      input.stack.style.transition = "none";
      input.stack.style.height = `${targetPx}px`;
      input.stack.style.maxHeight = `${targetPx}px`;
      void input.stack.offsetHeight;
      dragY = 0;
      dragMode = "none";
      velocityY = 0;
      settling = false;
      clearDragPaint({ restoreBackdrop: false });
      syncTouch();
    }, ms + 20);
  };

  const animateTranslateSettle = (opts: {
    toY: number;
    backdropOpacity: string;
    ms: number;
    ease: string;
    onDone: () => void;
  }) => {
    settling = true;
    input.stack.style.transition = `transform ${opts.ms}ms ${opts.ease}`;
    input.stack.style.transform = `translate3d(0,${opts.toY}px,0)`;
    if (input.backdrop) {
      input.backdrop.style.transition = `opacity ${opts.ms}ms ${opts.ease}`;
      input.backdrop.style.opacity = opts.backdropOpacity;
    }
    settleTimer = window.setTimeout(() => {
      settleTimer = 0;
      opts.onDone();
    }, opts.ms + 16);
  };

  const settle = () => {
    if (dragY <= 0 || settling) return;
    const pass = dragY >= threshold() || velocityY >= DISMISS_FLICK;

    // peek 上滑跟手拉高 → expanded 封顶
    if (dragMode === "height-expand") {
      const base = startH > 0 ? startH : peekH;
      const travel = Math.max(expandedH - base, 1);
      const passExpand =
        dragY >= Math.min(Math.max(travel * 0.35, EXPAND_PX), 96) ||
        velocityY <= -DISMISS_FLICK;
      animateHeightTo(passExpand ? expandedH : base, passExpand ? "expanded" : "peek");
      return;
    }

    // 第一段：expanded → peek（高度跟手，不关抽屉）
    if (size === "expanded" || dragMode === "height-collapse") {
      const targetPeek = collapseMinH();
      const heightTravel = Math.max(stackH - targetPeek, 1);
      const passCollapse =
        dragY >= heightTravel * 0.5 || velocityY >= DISMISS_FLICK;
      animateHeightTo(passCollapse ? targetPeek : stackH, passCollapse ? "peek" : "expanded");
      return;
    }

    // 第二段：peek → close（整抽屉跟手平移）
    if (pass) {
      animateTranslateSettle({
        toY: stackH * 1.12,
        backdropOpacity: "0",
        ms: SETTLE_MS,
        ease: "ease-in",
        onDone: () => {
          dragY = 0;
          dragMode = "none";
          velocityY = 0;
          settling = false;
          input.onRequestClose({ dragSettled: true });
        }
      });
      return;
    }

    animateTranslateSettle({
      toY: 0,
      backdropOpacity: "1",
      ms: SPRING_MS,
      ease: HEIGHT_EASE,
      onDone: () => {
        dragY = 0;
        dragMode = "none";
        velocityY = 0;
        settling = false;
        clearDragPaint();
        syncTouch();
      }
    });
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
    if (size === "peek" && next === "expanded") rememberPeekH();
    clearDrag();
    resetGesture();
    applySize(next);
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
    startH = stackH;
    peekH = resolvePeekH();
    expandedH = resolveExpandedH();
    currentH = stackH;
    dragMode = "none";
    if (size === "peek") rememberPeekH();
    input.stack.style.willChange = "height, transform";
  };

  const trackVel = (clientY: number) => {
    const now = performance.now();
    const dt = now - lastTs;
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
        if (dragMode === "translate" && dragY > 0) paintDrag(0);
        if (zone === "body" && input.canExpand()) {
          dragMode = "height-expand";
          paintDrag(-dy);
          return true;
        }
        return true;
      }
      if (zone === "body" || zone === "chrome") {
        dragMode = "translate";
        paintDrag(dy);
        return true;
      }
      return true;
    }

    // expanded：第一段收缩滚动区（改高度）
    if (zone === "chrome") {
      if (dy > 0) {
        dragMode = "height-collapse";
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
      // 已在顶部：尽快接手高度收缩，避免和橡皮筋滚动抢一手导致卡顿
      const lockPx = atTopOnStart ? 2 : DISMISS_LOCK;
      if ((atTopOnStart || atTop()) && dy > lockPx) dismissLocked = true;
      if (dismissLocked) {
        dragMode = "height-collapse";
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
    // 关闭按钮 / 结算等控件：不要 capture，否则 click 丢失、抽屉关不掉
    if (isInteractiveTarget(event)) return;
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
    if (isInteractiveTarget(event)) return;
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
