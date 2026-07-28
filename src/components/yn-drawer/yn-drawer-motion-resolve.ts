export type YnDrawerMotionMode = "side" | "sheet";
export type YnDrawerMotionProp = "auto" | "side" | "sheet";
export type YnDrawerPlacement = "auto" | "right" | "bottom";

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
