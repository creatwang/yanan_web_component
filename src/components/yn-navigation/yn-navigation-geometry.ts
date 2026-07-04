/** yn-navigation 几何计算 — 供 Lit render 与 Astro DSD 共用 */

export const NAV_GEOMETRY = {
  VIEWBOX_HEIGHT: 36.80397415161133,
  R: 12.513351211547853,
  TAB_HORIZONTAL_PADDING: 20,
  TAB_MIN_WIDTH: 64,
  PATH_OVERLAP: 0.35,
  SEAM_GAP: 20,
} as const;

export type NavigationLayout = {
  starts: number[];
  ends: number[];
  seamCenters: number[];
  totalWidth: number;
};

/** 无 DOM 时用字符宽度估算 tab 宽（SSR / 首帧 render） */
export function estimateLabelWidth(label: string): number {
  let width = 0;
  for (const ch of label) {
    width += /[\u4e00-\u9fff\u3040-\u30ff\uac00-\ud7af]/.test(ch) ? 13 : 8;
  }
  return width;
}

export function estimateTabWidth(label: string): number {
  return Math.max(
    NAV_GEOMETRY.TAB_MIN_WIDTH,
    estimateLabelWidth(label) + NAV_GEOMETRY.TAB_HORIZONTAL_PADDING * 2,
  );
}

export function buildRectPath(
  startX: number,
  endX: number,
  overlapStart = 0,
  overlapEnd = 0,
): string {
  const { VIEWBOX_HEIGHT, R } = NAV_GEOMETRY;
  const adjustedStart = startX - overlapStart;
  const adjustedEnd = endX + overlapEnd;
  const yTop = 0;
  const yBottom = VIEWBOX_HEIGHT;
  const yArcTop = R;
  const yArcBottom = VIEWBOX_HEIGHT - R;
  const leftInner = adjustedStart + R;
  const rightInner = adjustedEnd - R;
  return `M${adjustedStart} ${yArcTop} A${R} ${R} 0 0 1 ${leftInner} ${yTop} L${rightInner} ${yTop} A${R} ${R} 0 0 1 ${adjustedEnd} ${yArcTop} L${adjustedEnd} ${yArcBottom} A${R} ${R} 0 0 1 ${rightInner} ${yBottom} L${leftInner} ${yBottom} A${R} ${R} 0 0 1 ${adjustedStart} ${yArcBottom} Z`;
}

export function buildBridgeSegment(centerX: number, progress: number): string {
  const left = lerp(0.48203949, 11.11998719, progress);
  const control = lerp(0.21696813, 6.60909283, progress);
  const yTop = lerp(28.521157255933936, 29.429300665479314, progress);
  const yTopControl = lerp(28.11854174502602, 23.402951368449013, progress);
  const yBottom = lerp(8.282816895677392, 7.374673486132014, progress);
  const yBottomControl = lerp(8.685432406585305, 13.401022783162313, progress);

  const x0 = centerX - left;
  const x1 = centerX - control;
  const x2 = centerX + control;
  const x3 = centerX + left;

  return `M${x0} ${yTop} C${x1} ${yTopControl}, ${x2} ${yTopControl}, ${x3} ${yTop} L${x3} ${yBottom} C${x2} ${yBottomControl}, ${x1} ${yBottomControl}, ${x0} ${yBottom} Z`;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function getLayoutFromTabWidths(
  baseWidths: number[],
  seamProgress: number[] = [],
): NavigationLayout {
  const gaps = seamProgress.map((v) => v * NAV_GEOMETRY.SEAM_GAP);
  const starts: number[] = [];
  const ends: number[] = [];

  if (!baseWidths.length) {
    return { starts, ends, seamCenters: [], totalWidth: 0 };
  }

  starts[0] = 0;
  ends[0] = baseWidths[0];
  for (let i = 1; i < baseWidths.length; i += 1) {
    starts[i] = ends[i - 1] + (gaps[i - 1] ?? 0);
    ends[i] = starts[i] + baseWidths[i];
  }

  const seamCenters: number[] = [];
  for (let i = 0; i < baseWidths.length - 1; i += 1) {
    seamCenters.push((ends[i] + starts[i + 1]) / 2);
  }

  return { starts, ends, seamCenters, totalWidth: ends[ends.length - 1] };
}

/** 选中项两侧 seam 合并为 1（与 yn-navigation.mergeTabSeams 一致） */
export function buildActiveSeamProgress(itemCount: number, activeIndex: number): number[] {
  const progress = new Array(Math.max(0, itemCount - 1)).fill(0);
  if (activeIndex < 0) return progress;
  if (activeIndex > 0) progress[activeIndex - 1] = 1;
  if (activeIndex < itemCount - 1) progress[activeIndex] = 1;
  return progress;
}

export function computeNavigationShape(
  labels: string[],
  tabWidths?: number[],
  seamProgress?: number[],
): {
  layout: NavigationLayout;
  bridgeD: string;
  rectDs: string[];
} {
  const baseWidths = tabWidths?.length
    ? tabWidths
    : labels.map((label) => estimateTabWidth(label));
  const progress =
    seamProgress ?? new Array(Math.max(0, labels.length - 1)).fill(0);
  const layout = getLayoutFromTabWidths(baseWidths, progress);

  const bridgeD = layout.seamCenters
    .map((centerX, i) => buildBridgeSegment(centerX, progress[i] ?? 0))
    .join(" ");

  const rectDs = layout.starts.map((start, i) => {
    const overlapStart = i > 0 ? NAV_GEOMETRY.PATH_OVERLAP : 0;
    const overlapEnd = i < layout.starts.length - 1 ? NAV_GEOMETRY.PATH_OVERLAP : 0;
    return buildRectPath(layout.starts[i], layout.ends[i], overlapStart, overlapEnd);
  });

  return { layout, bridgeD, rectDs };
}

export function normalizeSeoPath(path: string): string {
  if (!path) return "/";
  const cleanPath = path.split("?")[0].split("#")[0];
  return cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`;
}
