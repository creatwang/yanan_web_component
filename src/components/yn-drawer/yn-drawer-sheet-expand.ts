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
  const previousTouchAction = input.body.style.touchAction;

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
    startY = event.clientY;
    latestY = event.clientY;
    startedAtScrollTop = size === "expanded" && input.body.scrollTop === 0;
  };

  const onPointerMove = (event: PointerEvent) => {
    if (!enabled || startY === undefined) return;
    latestY = event.clientY;
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

  const onWheel = (event: WheelEvent) => {
    if (!enabled || size !== "peek" || !input.canExpand()) return;
    wheelDeltaY += event.deltaY;
    if (wheelResetTimer !== undefined) clearTimeout(wheelResetTimer);
    wheelResetTimer = setTimeout(resetWheel, WHEEL_RESET_MS);

    if (wheelDeltaY > EXPAND_THRESHOLD_PX) {
      setSize("expanded");
    }
  };

  const attach = () => {
    if (attached) return;
    attached = true;
    input.body.style.touchAction = "pan-y";
    input.body.addEventListener("pointerdown", onPointerDown);
    input.body.addEventListener("pointermove", onPointerMove);
    input.body.addEventListener("pointerup", onPointerUp);
    input.body.addEventListener("pointercancel", onPointerCancel);
    input.body.addEventListener("wheel", onWheel);
  };

  const detach = () => {
    if (!attached) return;
    attached = false;
    input.body.removeEventListener("pointerdown", onPointerDown);
    input.body.removeEventListener("pointermove", onPointerMove);
    input.body.removeEventListener("pointerup", onPointerUp);
    input.body.removeEventListener("pointercancel", onPointerCancel);
    input.body.removeEventListener("wheel", onWheel);
    resetPointer();
    resetWheel();
  };

  const setEnabled = (nextEnabled: boolean) => {
    enabled = nextEnabled;
    if (!enabled) {
      resetPointer();
      resetWheel();
    }
  };

  const dispose = () => {
    detach();
    input.body.style.touchAction = previousTouchAction;
  };

  return {
    attach,
    detach,
    setEnabled,
    setSize,
    getSize: () => size,
    dispose,
  };
}
