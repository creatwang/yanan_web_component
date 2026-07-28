export type YnDrawerMotionMode = "side" | "sheet";
export type YnDrawerMotionProp = "auto" | "side" | "sheet";
export type YnDrawerPlacement = "auto" | "right" | "bottom";
/** snap=吸附手势；none=固定高度可滚；auto=粗指针 snap / 细指针 none */
export type YnDrawerSheetExpandProp = "snap" | "none" | "auto";
export type YnDrawerSheetExpandMode = "snap" | "none";

const DEFAULT_BREAKPOINT = 1024;

export function resolveYnDrawerMotion(input: {
  motion: YnDrawerMotionProp;
  placement: YnDrawerPlacement;
  viewportWidth: number;
  breakpoint?: number;
}): YnDrawerMotionMode {
  if (input.motion === "side" || input.motion === "sheet") return input.motion;
  if (input.placement === "right") return "side";
  if (input.placement === "bottom") return "sheet";
  const bp = input.breakpoint ?? DEFAULT_BREAKPOINT;
  return input.viewportWidth < bp ? "sheet" : "side";
}

/** 细指针（鼠标）默认关掉 snap，避免手势层锁滚动/挡点击；触控保留吸附。
 *  调用方应传 any-pointer:coarse（或等价），不要只用 pointer:coarse。 */
export function resolveYnDrawerSheetExpand(input: {
  sheetExpand: YnDrawerSheetExpandProp;
  /** true = 设备具备粗指针（触控） */
  prefersGestures: boolean;
}): YnDrawerSheetExpandMode {
  if (input.sheetExpand === "snap" || input.sheetExpand === "none") {
    return input.sheetExpand;
  }
  return input.prefersGestures ? "snap" : "none";
}
