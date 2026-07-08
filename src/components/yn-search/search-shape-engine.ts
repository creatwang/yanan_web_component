export type SearchShapeDomRefs = {
  bridgeEl: SVGPathElement;
  rect1El: SVGPathElement;
  dynamicWrapEl: HTMLDivElement;
  inputEl: HTMLInputElement;
  shellEl: HTMLDivElement;
};

export type SearchShapeLayout = {
  expandLeft: boolean;
  inputWidth: number;
};

const R = 12.920000000000002;
const RECT_START_CLOSED = 44;
const RECT_START_OPEN = 54;
const RETRACT_X = 31.08;
const OPEN_LAYOUT_SPLIT = 0.22;
const TRANSITION_SPLIT = 0.82;
const GAP = 10;

const bridgeClosed = {
  x: [44, 44, 44, 44, 44, 44, 44, 44],
  y: [25.08, 25.08, 25.08, 25.08, 12.92, 12.92, 12.92, 12.92],
};

const bridgeOpened = {
  x: [
    43.02922778103873, 46.440616756960296, 51.4593832430397, 54.87077221896127, 54.87077221896127,
    51.4593832430397, 46.440616756960296, 43.02922778103873,
  ],
  y: [
    29.947286628412307, 25.10807502694411, 25.10807502694411, 29.947286628412307, 8.052713371587695,
    12.89192497305589, 12.89192497305589, 8.052713371587695,
  ],
};

const easeOpen = createCubicBezier(0.22, 0.01, 0.35, 1);
const easeClose = createCubicBezier(0.55, 0.055, 0.675, 0.19);

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function createCubicBezier(x1: number, y1: number, x2: number, y2: number) {
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;

  const sampleX = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sampleY = (t: number) => ((ay * t + by) * t + cy) * t;
  const sampleDX = (t: number) => (3 * ax * t + 2 * bx) * t + cx;

  const solveT = (x: number) => {
    let t = x;
    for (let i = 0; i < 7; i += 1) {
      const xEst = sampleX(t) - x;
      const d = sampleDX(t);
      if (Math.abs(xEst) < 1e-5) return t;
      if (Math.abs(d) < 1e-6) break;
      t -= xEst / d;
    }
    let t0 = 0;
    let t1 = 1;
    t = x;
    while (t0 < t1) {
      const xEst = sampleX(t);
      if (Math.abs(xEst - x) < 1e-5) return t;
      if (x > xEst) t0 = t;
      else t1 = t;
      t = (t1 - t0) * 0.5 + t0;
    }
    return t;
  };

  return (x: number) => sampleY(solveT(x));
}

function dynamicWidth(inputWidth: number) {
  return GAP + Math.max(80, inputWidth);
}

function rectEndOpen(inputWidth: number) {
  return RECT_START_OPEN + Math.max(80, inputWidth);
}

function mirrorShapeX(x: number, layout: SearchShapeLayout) {
  return RECT_START_CLOSED * 2 + dynamicWidth(layout.inputWidth) - x;
}

function buildRectPath(startX: number, endX: number) {
  if (endX <= startX + 0.001) return `M${startX} 0L${startX} 0L${startX} 38L${startX} 38 Z`;
  const width = endX - startX;
  const rr = Math.min(R, width * 0.5);
  const topArc = rr;
  const bottomArc = 38 - rr;
  const leftInner = startX + rr;
  const rightInner = endX - rr;
  return `M${startX} ${topArc} A${rr} ${rr} 0 0 1 ${leftInner} 0 L${rightInner} 0 A${rr} ${rr} 0 0 1 ${endX} ${topArc} L${endX} ${bottomArc} A${rr} ${rr} 0 0 1 ${rightInner} 38 L${leftInner} 38 A${rr} ${rr} 0 0 1 ${startX} ${bottomArc} Z`;
}

function buildBridgePath(t: number, layout: SearchShapeLayout) {
  const mirror = layout.expandLeft;
  const c = bridgeClosed;
  const o = bridgeOpened;
  const x0 = lerp(c.x[0], o.x[0], t);
  const x1 = lerp(c.x[1], o.x[1], t);
  const x2 = lerp(c.x[2], o.x[2], t);
  const x3 = lerp(c.x[3], o.x[3], t);
  const x4 = lerp(c.x[4], o.x[4], t);
  const x5 = lerp(c.x[5], o.x[5], t);
  const x6 = lerp(c.x[6], o.x[6], t);
  const x7 = lerp(c.x[7], o.x[7], t);
  const y0 = lerp(c.y[0], o.y[0], t);
  const y1 = lerp(c.y[1], o.y[1], t);
  const y2 = lerp(c.y[2], o.y[2], t);
  const y3 = lerp(c.y[3], o.y[3], t);
  const y4 = lerp(c.y[4], o.y[4], t);
  const y5 = lerp(c.y[5], o.y[5], t);
  const y6 = lerp(c.y[6], o.y[6], t);
  const y7 = lerp(c.y[7], o.y[7], t);
  const mx = (x: number) => (mirror ? mirrorShapeX(x, layout) : x);
  return `M${mx(x0)} ${y0} C${mx(x1)} ${y1}, ${mx(x2)} ${y2}, ${mx(x3)} ${y3} L${mx(x4)} ${y4} C${mx(x5)} ${y5}, ${mx(x6)} ${y6}, ${mx(x7)} ${y7} Z`;
}

function resolveLayoutShellWidth(opening: boolean, easedProgress: number, currentEndX: number) {
  if (opening && easedProgress < OPEN_LAYOUT_SPLIT) {
    return RECT_START_CLOSED;
  }
  return Math.max(RECT_START_CLOSED, currentEndX);
}

function shapeTAtButton(inputWidth: number) {
  return RETRACT_X / (rectEndOpen(inputWidth) - RECT_START_OPEN);
}

function retractSign(layout: SearchShapeLayout) {
  return layout.expandLeft ? 1 : -1;
}

export class SearchShapeEngine {
  private lastRectPath = "";
  private lastBridgePath = "";
  private lastDynamicTransform = "";
  private lastInputOpacity = "";
  private lastInputTransform = "";
  private shapeRaf = 0;

  stop() {
    if (this.shapeRaf) {
      cancelAnimationFrame(this.shapeRaf);
      this.shapeRaf = 0;
    }
  }

  clearDynamicWrapInlineStyles(refs: SearchShapeDomRefs) {
    refs.dynamicWrapEl.style.removeProperty("display");
    refs.dynamicWrapEl.style.removeProperty("visibility");
    refs.dynamicWrapEl.style.removeProperty("transform");
    refs.dynamicWrapEl.style.removeProperty("opacity");
    refs.inputEl.style.removeProperty("opacity");
    refs.inputEl.style.removeProperty("transform");
    this.lastDynamicTransform = "";
    this.lastInputOpacity = "";
    this.lastInputTransform = "";
  }

  applyShapeFromValues(
    refs: SearchShapeDomRefs,
    layout: SearchShapeLayout,
    t: number,
    startX: number,
    endX: number,
  ) {
    const rectStartX = layout.expandLeft ? mirrorShapeX(endX, layout) : startX;
    const rectEndX = layout.expandLeft ? mirrorShapeX(startX, layout) : endX;
    const rectPath = buildRectPath(rectStartX, rectEndX);
    if (rectPath !== this.lastRectPath) {
      refs.rect1El.setAttribute("d", rectPath);
      this.lastRectPath = rectPath;
    }
    const bridgePath = buildBridgePath(t, layout);
    if (bridgePath !== this.lastBridgePath) {
      refs.bridgeEl.setAttribute("d", bridgePath);
      this.lastBridgePath = bridgePath;
    }
  }

  applyShape(refs: SearchShapeDomRefs, layout: SearchShapeLayout, t: number) {
    const startX = lerp(RECT_START_CLOSED, RECT_START_OPEN, t);
    const endX = lerp(RECT_START_CLOSED, rectEndOpen(layout.inputWidth), t);
    this.applyShapeFromValues(refs, layout, t, startX, endX);
  }

  syncInputToShape(
    refs: SearchShapeDomRefs,
    layout: SearchShapeLayout,
    t: number,
    opening: boolean,
    rectWidth = 0,
  ) {
    const p = opening
      ? Math.max(0, Math.min(1, (rectWidth - 80) / 180))
      : Math.max(0, Math.min(1, (rectWidth - 220) / 180));
    const nextOpacity = String(p);
    const nextTransform = `translateX(${lerp(retractSign(layout) * 12, 0, p)}px)`;
    if (nextOpacity !== this.lastInputOpacity) {
      refs.inputEl.style.opacity = nextOpacity;
      this.lastInputOpacity = nextOpacity;
    }
    if (nextTransform !== this.lastInputTransform) {
      refs.inputEl.style.transform = nextTransform;
      this.lastInputTransform = nextTransform;
    }
  }

  animate(
    refs: SearchShapeDomRefs,
    layout: SearchShapeLayout,
    opening: boolean,
    hooks: {
      onStart: (runtimeShellWidth: number) => void;
      onFrame: (runtimeShellWidth: number, layoutExpanding: boolean) => void;
      onComplete: (opening: boolean) => void;
    },
  ) {
    const duration = opening ? 620 : 500;
    const ease = opening ? easeOpen : easeClose;
    const start = performance.now();
    hooks.onStart(opening ? RECT_START_CLOSED : rectEndOpen(layout.inputWidth));
    refs.dynamicWrapEl.style.visibility = opening ? "hidden" : "visible";

    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const ep = ease(p);
      let t: number;
      let currentStartX: number;
      let currentEndX: number;

      if (opening) {
        if (ep < OPEN_LAYOUT_SPLIT) {
          t = 0;
          currentStartX = RECT_START_CLOSED;
          currentEndX = RECT_START_CLOSED;
        } else {
          const local = (ep - OPEN_LAYOUT_SPLIT) / (1 - OPEN_LAYOUT_SPLIT);
          t = 1;
          currentStartX = RECT_START_OPEN;
          currentEndX = lerp(RECT_START_OPEN + 30, rectEndOpen(layout.inputWidth), local);
        }
      } else if (ep < TRANSITION_SPLIT) {
        const local = ep / TRANSITION_SPLIT;
        t = lerp(1, shapeTAtButton(layout.inputWidth), local);
        currentStartX = lerp(RECT_START_CLOSED, RECT_START_OPEN, t);
        currentEndX = lerp(RECT_START_CLOSED, rectEndOpen(layout.inputWidth), t);
      } else {
        const local = (ep - TRANSITION_SPLIT) / (1 - TRANSITION_SPLIT);
        t = lerp(shapeTAtButton(layout.inputWidth), 0, local);
        currentStartX = lerp(RECT_START_CLOSED, RECT_START_OPEN, t);
        currentEndX = lerp(RECT_START_CLOSED, rectEndOpen(layout.inputWidth), t);
      }

      const rectWidth = Math.max(0, currentEndX - currentStartX);
      const runtimeShellWidth = resolveLayoutShellWidth(opening, ep, currentEndX);
      const layoutExpanding = opening && ep >= OPEN_LAYOUT_SPLIT;
      if (layoutExpanding) {
        refs.dynamicWrapEl.style.visibility = "visible";
      }
      this.applyShapeFromValues(refs, layout, t, currentStartX, currentEndX);
      this.syncInputToShape(refs, layout, t, opening, rectWidth);
      hooks.onFrame(runtimeShellWidth, layoutExpanding);

      const nextTransform = "translateX(0px)";
      if (nextTransform !== this.lastDynamicTransform) {
        refs.dynamicWrapEl.style.transform = nextTransform;
        this.lastDynamicTransform = nextTransform;
      }

      if (p < 1) {
        this.shapeRaf = requestAnimationFrame(tick);
        return;
      }

      this.shapeRaf = 0;
      this.applyShape(refs, layout, opening ? 1 : 0);
      const endRectWidth = opening ? rectEndOpen(layout.inputWidth) - RECT_START_OPEN : 0;
      this.syncInputToShape(refs, layout, opening ? 1 : 0, opening, endRectWidth);
      if (!opening) {
        if (this.lastBridgePath !== "") {
          refs.bridgeEl.setAttribute("d", "");
          this.lastBridgePath = "";
        }
        if (this.lastRectPath !== "") {
          refs.rect1El.setAttribute("d", "");
          this.lastRectPath = "";
        }
        this.clearDynamicWrapInlineStyles(refs);
      }
      hooks.onComplete(opening);
    };

    this.shapeRaf = requestAnimationFrame(tick);
  }
}

export function getSearchDynamicWidth(inputWidth: number) {
  return dynamicWidth(inputWidth);
}

export function getSearchRectEndOpen(inputWidth: number) {
  return rectEndOpen(inputWidth);
}

export const SEARCH_SHAPE_RECT_START_CLOSED = RECT_START_CLOSED;
export const SEARCH_SHAPE_RECT_START_OPEN = RECT_START_OPEN;
