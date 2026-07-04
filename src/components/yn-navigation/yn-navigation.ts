import { LitElement, css, html, svg, unsafeCSS, type PropertyValues } from "lit";
import { customElement, property } from "lit/decorators.js";
import {
  NAV_GEOMETRY,
  buildBridgeSegment,
  buildRectPath,
  computeNavigationShape,
  estimateTabWidth,
  getLayoutFromTabWidths,
  type NavigationLayout,
} from "./yn-navigation-geometry.js";
import { YN_NAVIGATION_SHADOW_STYLES } from "./yn-navigation-styles.js";

type NavigationNode = Record<string, string>;

type LitUpdateHost = YnNavigation & {
  renderRoot?: ShadowRoot;
  isUpdatePending: boolean;
  _$AL: PropertyValues;
  _$EM?(): void;
};

/** Lit 2.x：shouldUpdate 为 false 时不会触发 firstUpdated/updated */
function finishUpdateWithoutRender(host: LitUpdateHost, changed: PropertyValues) {
  if (!host.renderRoot && host.shadowRoot) {
    host.renderRoot = host.shadowRoot;
  }
  const lifecycle = host as unknown as {
    firstUpdated(changed?: PropertyValues): void;
    updated(changed: PropertyValues): void;
  };
  if (!host.hasUpdated) {
    host.hasUpdated = true;
    lifecycle.firstUpdated(changed);
  }
  if (changed) {
    lifecycle.updated(changed);
  }
  if (typeof host._$EM === "function") {
    host._$EM();
  } else {
    host.isUpdatePending = false;
    host._$AL = new Map();
  }
}

@customElement("yn-navigation")
export class YnNavigation extends LitElement {
  @property({ attribute: false })
  items: NavigationNode = {
    PRODUTOS: "/produtos",
    SOBRE: "/sobre",
    SUSTENTABILIDADE: "/sustentabilidade",
    JORNAL: "/jornal"
  };

  @property({ type: String, reflect: true })
  active = "PRODUTOS";

  @property({ type: Boolean, attribute: "hit-slop", reflect: true })
  hitSlop = false;

  @property({ type: Boolean, attribute: "seo-mode", reflect: true })
  seoMode = false;

  @property({ type: String, attribute: "aria-label" })
  ariaLabel = "Primary navigation";

  /** SSR：首帧前通过 items-json 注入导航项，避免升级时闪回默认 items */
  @property({ type: String, attribute: "items-json" })
  itemsJson?: string;

  private focusedIndex = 0;

  private hoverIndex = -1;

  private bridgePath: SVGPathElement | null = null;
  private bridgeClipPath: SVGPathElement | null = null;
  private navRoot: HTMLElement | null = null;
  private svgRoot: SVGElement | null = null;
  private clipPath: SVGClipPathElement | null = null;
  private rectPaths: SVGPathElement[] = [];
  private rectClipPaths: SVGPathElement[] = [];
  private tabElements: HTMLElement[] = [];

  private baseStarts: number[] = [];
  private baseEnds: number[] = [];
  private baseWidths: number[] = [];
  private seamCount = 0;
  private seamProgress: number[] = [];
  private seamTarget: number[] = [];
  private seamAnimStart: number[] = [];
  private seamStartAt = 0;
  private seamRaf = 0;

  private glowRaf = 0;
  private pendingGlow: { clientX: number; clientY: number; rx: number; ry: number } | null = null;
  private currentLayout: NavigationLayout = { starts: [], ends: [], seamCenters: [], totalWidth: 1 };

  private lastBridgeD = "";
  private lastRectD: string[] = [];
  private lastTabMetrics: Array<{ left: number; width: number }> = [];
  private lastTotalWidth = -1;
  private lastGlowPoint: { x: number; y: number; rx: number; ry: number } | null = null;
  private resizeRaf = 0;
  private dsdInitialBootstrapped = false;
  private dsdRenderSkipped = false;
  private dsdGeometryBootstrapped = false;
  /** connected 时 Shadow 已含 .nav → 真 DSD（非 Lit 首次 render 产物） */
  private hadDeclarativeShadowOnConnect = false;
  private dsdPresenceChecked = false;

  /** 窗口尺寸变化时合并重算几何，避免连续触发抖动。 */
  private readonly onWindowResize = () => {
    if (this.resizeRaf) return;
    this.resizeRaf = requestAnimationFrame(() => {
      this.resizeRaf = 0;
      this.setupBaseGeometry();
      this.applyShape();
      this.refreshShapeTarget(true);
    });
  };

  private readonly HOVER_ANIM_MS = 320;
  private readonly SELECT_ANIM_MS = 240;
  private seamDurationMs = this.HOVER_ANIM_MS;

  static styles = css`
    ${unsafeCSS(YN_NAVIGATION_SHADOW_STYLES)}
  `;

  /** 连接 DOM 时尽早解析 SSR 注入的 items-json，并记录是否已有 DSD。 */
  connectedCallback() {
    this.captureDeclarativeShadowPresence();
    super.connectedCallback();
    this.hydrateItemsFromAttribute();
  }

  private captureDeclarativeShadowPresence() {
    if (this.dsdPresenceChecked) return;
    this.dsdPresenceChecked = true;
    this.hadDeclarativeShadowOnConnect = Boolean(this.shadowRoot?.querySelector(".nav"));
  }

  /** 复用 Declarative Shadow Root（Astro DSD SSR）。 */
  protected createRenderRoot(): HTMLElement | ShadowRoot {
    if (this.shadowRoot) {
      return this.shadowRoot;
    }
    return super.createRenderRoot() as ShadowRoot;
  }

  /** DSD 首帧已含完整 markup，跳过 Lit render；Lit 2.x 需手动补全更新生命周期。 */
  protected shouldUpdate(changed: PropertyValues): boolean {
    if (this.dsdInitialBootstrapped) {
      return false;
    }
    if (!this.dsdRenderSkipped && this.hasDeclarativeShadowContent()) {
      this.dsdInitialBootstrapped = true;
      this.dsdRenderSkipped = true;
      return false;
    }
    return super.shouldUpdate(changed);
  }

  protected performUpdate(): void {
    const changed = (this as unknown as LitUpdateHost)._$AL;
    if (!this.shouldUpdate(changed)) {
      if (this.dsdInitialBootstrapped && !this.dsdGeometryBootstrapped) {
        this.dsdGeometryBootstrapped = true;
        this.bootstrapFromDeclarativeShadow();
      }
      finishUpdateWithoutRender(this as unknown as LitUpdateHost, changed);
      return;
    }
    super.performUpdate();
  }

  private hasDeclarativeShadowContent(): boolean {
    return this.hadDeclarativeShadowOnConnect && Boolean(this.shadowRoot?.querySelector(".nav"));
  }

  /** 绑定 DSD 首帧 DOM：refs、几何、事件，不重绘 Shadow。 */
  private bootstrapFromDeclarativeShadow(): void {
    this.syncDomRefs();
    this.syncActiveItem();
    this.setupDynamicPaths();
    this.setupBaseGeometry();
    this.syncSeamStateFromIndices(this.resolveActiveIndex(), -1);
    this.bindDeclarativeShadowEvents();
    window.addEventListener("resize", this.onWindowResize, { passive: true });
  }

  /** 为 SSR 注入的 tab/nav 绑定与 Lit render 等价的交互。 */
  private bindDeclarativeShadowEvents(): void {
    this.navRoot?.addEventListener("keydown", (event) => this.onKeyDown(event as KeyboardEvent));
    this.navRoot?.addEventListener("pointerleave", () => this.onPointerLeave());
    this.getTabs().forEach((tab, index) => {
      tab.addEventListener("pointerenter", (event) =>
        this.onTabPointerEnter(index, event as PointerEvent),
      );
      tab.addEventListener("pointermove", (event) =>
        this.onTabPointerMove(event as PointerEvent),
      );
      if (!this.seoMode) {
        tab.addEventListener("click", () => this.onTabClick(index));
      }
    });
  }

  /** 首次渲染后初始化路径、几何与动画目标。 */
  protected firstUpdated() {
    if (this.dsdInitialBootstrapped) {
      return;
    }
    this.syncDomRefs();
    this.syncActiveItem();
    this.setupDynamicPaths();
    this.setupBaseGeometry();
    this.applyShape();
    this.refreshShapeTarget(true);
    window.addEventListener("resize", this.onWindowResize, { passive: true });
  }

  /** 从 items-json 属性同步导航项（SSR 场景）。 */
  private hydrateItemsFromAttribute() {
    if (!this.itemsJson) return;
    try {
      const parsed = JSON.parse(this.itemsJson) as NavigationNode;
      if (parsed && typeof parsed === "object") {
        this.items = parsed;
      }
    } catch {
      /* ignore malformed JSON */
    }
  }

  /** 响应属性变化并按需刷新形状与动画状态。 */
  protected updated(changed: PropertyValues) {
    if (!changed) return;
    if (changed.has("itemsJson")) {
      this.hydrateItemsFromAttribute();
    }
    this.syncDomRefs();
    const itemsChanged = changed.has("items");
    const activeChanged = changed.has("active");
    const seoModeChanged = changed.has("seoMode");
    let geometryChanged = false;

    if (itemsChanged) {
      this.syncActiveItem();
      this.setupDynamicPaths();
      this.setupBaseGeometry();
      geometryChanged = true;
    } else if (!this.rectPaths.length) {
      this.setupDynamicPaths();
      geometryChanged = true;
    }

    if (!this.baseWidths.length) {
      this.setupBaseGeometry();
      geometryChanged = true;
    }

    if (geometryChanged) {
      this.applyShape();
    }

    if (itemsChanged || activeChanged || seoModeChanged) {
      this.syncActiveItem();
      this.refreshShapeTarget(itemsChanged, activeChanged ? this.SELECT_ANIM_MS : this.HOVER_ANIM_MS);
    }
  }

  /** 组件卸载时清理 RAF 与全局事件。 */
  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.seamRaf) cancelAnimationFrame(this.seamRaf);
    if (this.glowRaf) cancelAnimationFrame(this.glowRaf);
    if (this.resizeRaf) cancelAnimationFrame(this.resizeRaf);
    window.removeEventListener("resize", this.onWindowResize);
  }

  /** 同步缓存 Shadow DOM 关键节点引用。 */
  private syncDomRefs() {
    this.navRoot = this.shadowRoot?.querySelector<HTMLElement>(".nav") ?? null;
    this.svgRoot = this.shadowRoot?.querySelector<SVGElement>(".shape") ?? null;
    this.bridgePath = this.shadowRoot?.querySelector<SVGPathElement>("[data-meta-row-shape-bridges]") ?? null;
    this.bridgeClipPath = this.shadowRoot?.querySelector<SVGPathElement>("[data-meta-row-shape-bridges-clip]") ?? null;
    this.clipPath = this.shadowRoot?.querySelector<SVGClipPathElement>("#metaClip") ?? null;
    this.tabElements = Array.from(this.shadowRoot?.querySelectorAll<HTMLElement>(".tab") ?? []);
  }

  /** 根据当前模式同步激活项与焦点索引。 */
  private syncActiveItem() {
    const entries = this.getItemEntries();
    if (!entries.length) {
      this.focusedIndex = -1;
      return;
    }

    if (this.seoMode) {
      this.focusedIndex = this.getActiveIndex();
      return;
    }

    const currentIndex = entries.findIndex(([key]) => key === this.active);
    this.focusedIndex = currentIndex >= 0 ? currentIndex : 0;
  }

  /** 获取导航项键值对列表。 */
  private getItemEntries(): Array<[string, string]> {
    return Object.entries(this.items ?? {});
  }

  /** 归一化 SEO 路径，去除 query/hash 并保证斜杠前缀。 */
  private getSeoPath(path: string) {
    if (!path) return "/";
    const cleanPath = path.split("?")[0].split("#")[0];
    return cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`;
  }

  /** 在 SEO 模式下根据当前 URL 推导激活项索引。 */
  private getSeoActiveIndex() {
    const entries = this.getItemEntries();
    if (!entries.length || typeof window === "undefined") return -1;
    const pathname = this.getSeoPath(window.location.pathname).toLowerCase();
    let bestMatchIndex = -1;
    let bestLength = -1;
    entries.forEach(([, href], index) => {
      const normalizedHref = this.getSeoPath(href).toLowerCase();
      if (pathname.includes(normalizedHref) && normalizedHref.length > bestLength) {
        bestLength = normalizedHref.length;
        bestMatchIndex = index;
      }
    });
    return bestMatchIndex;
  }

  /** 获取当前激活索引（SEO 路径匹配，回退 SSR active 属性）。 */
  private getActiveIndex() {
    return this.resolveActiveIndex();
  }

  /** 解析激活 tab：SEO 路径优先，否则 active 属性（SSR 注入）。 */
  private resolveActiveIndex() {
    if (this.seoMode) {
      const seoIndex = this.getSeoActiveIndex();
      if (seoIndex >= 0) return seoIndex;
    }
    const index = this.getItemEntries().findIndex(([key]) => key === this.active);
    return index >= 0 ? index : -1;
  }

  /** 获取可交互标签元素集合。 */
  private getTabs() {
    return this.tabElements;
  }

  /** 测量标签文本宽度并计算每项基础宽度。 */
  private measureTabWidths() {
    const tabs = this.getTabs();
    tabs.forEach((tab) => {
      tab.style.left = "0px";
      tab.style.width = "auto";
    });
    return tabs.map((tab) => {
      const label = tab.querySelector("span");
      const labelWidth = Math.ceil(label?.getBoundingClientRect().width ?? 0);
      return Math.max(
        NAV_GEOMETRY.TAB_MIN_WIDTH,
        labelWidth + NAV_GEOMETRY.TAB_HORIZONTAL_PADDING * 2,
      );
    });
  }

  /** 初始化可变路径节点与缓存状态。 */
  private setupDynamicPaths() {
    this.rectPaths = Array.from(this.shadowRoot?.querySelectorAll<SVGPathElement>("[data-meta-row-rect]") ?? []);
    this.rectClipPaths = Array.from(this.shadowRoot?.querySelectorAll<SVGPathElement>("[data-meta-row-rect-clip]") ?? []);
    this.tabElements = Array.from(this.shadowRoot?.querySelectorAll<HTMLElement>(".tab") ?? []);
    this.lastRectD = [];
    this.lastBridgeD = "";
    this.lastTotalWidth = -1;
    this.lastTabMetrics = [];
  }

  /** 根据标签宽度建立基础起止坐标与缝隙状态。 */
  private setupBaseGeometry() {
    this.baseWidths = this.measureTabWidths();
    this.baseStarts = [];
    this.baseEnds = [];
    let cursor = 0;

    this.baseWidths.forEach((width) => {
      this.baseStarts.push(cursor);
      cursor += width;
      this.baseEnds.push(cursor);
    });

    this.seamCount = Math.max(0, this.getItemEntries().length - 1);
    this.seamProgress = new Array(this.seamCount).fill(0);
    this.seamTarget = new Array(this.seamCount).fill(0);
    this.seamAnimStart = new Array(this.seamCount).fill(0);
  }

  /** 基于当前缝隙进度计算实时布局结果。 */
  private getCurrentLayout() {
    return getLayoutFromTabWidths(this.baseWidths, this.seamProgress);
  }

  /** 将当前布局与桥接路径应用到 SVG 与 tab 样式。 */
  private applyShape() {
    if (!this.navRoot || !this.svgRoot || !this.bridgePath || !this.bridgeClipPath) return;

    const layout = this.getCurrentLayout();
    this.currentLayout = layout;
    const bridgeD = layout.seamCenters
      .map((centerX, i) => buildBridgeSegment(centerX, this.seamProgress[i] ?? 0))
      .join(" ");

    if (bridgeD !== this.lastBridgeD) {
      this.bridgePath.setAttribute("d", bridgeD);
      this.bridgeClipPath.setAttribute("d", bridgeD);
      this.lastBridgeD = bridgeD;
    }

    this.rectPaths.forEach((path, i) => {
      const overlapStart = i > 0 ? NAV_GEOMETRY.PATH_OVERLAP : 0;
      const overlapEnd = i < this.rectPaths.length - 1 ? NAV_GEOMETRY.PATH_OVERLAP : 0;
      const d = buildRectPath(layout.starts[i], layout.ends[i], overlapStart, overlapEnd);
      if (this.lastRectD[i] !== d) {
        path.setAttribute("d", d);
        this.lastRectD[i] = d;
      }
    });

    this.rectClipPaths.forEach((path, i) => {
      const overlapStart = i > 0 ? NAV_GEOMETRY.PATH_OVERLAP : 0;
      const overlapEnd = i < this.rectClipPaths.length - 1 ? NAV_GEOMETRY.PATH_OVERLAP : 0;
      const d =
        this.lastRectD[i] ?? buildRectPath(layout.starts[i], layout.ends[i], overlapStart, overlapEnd);
      if (path.getAttribute("d") !== d) {
        path.setAttribute("d", d);
      }
    });

    if (layout.totalWidth !== this.lastTotalWidth) {
      this.svgRoot.setAttribute(
        "viewBox",
        `0 0 ${layout.totalWidth} ${NAV_GEOMETRY.VIEWBOX_HEIGHT}`,
      );
      this.navRoot.style.width = `${layout.totalWidth}px`;
      this.navRoot.style.height = `${NAV_GEOMETRY.VIEWBOX_HEIGHT}px`;
      this.lastTotalWidth = layout.totalWidth;
    }

    this.getTabs().forEach((tab, i) => {
      const left = layout.starts[i];
      const width = layout.ends[i] - layout.starts[i];
      const prev = this.lastTabMetrics[i];
      const leftValue = `${left}px`;
      const widthValue = `${width}px`;
      const styleOutdated = tab.style.left !== leftValue || tab.style.width !== widthValue;
      if (!prev || prev.left !== left || prev.width !== width || styleOutdated) {
        tab.style.left = `${left}px`;
        tab.style.width = `${width}px`;
        this.lastTabMetrics[i] = { left, width };
      }
    });
  }

  /** 缝隙动画帧函数，驱动 seamProgress 过渡。 */
  private animateSeams = (timestamp: number) => {
    const elapsed = Math.min(1, (timestamp - this.seamStartAt) / this.seamDurationMs);
    const eased = 1 - Math.pow(1 - elapsed, 3);
    this.seamProgress = this.seamProgress.map((_, i) => {
      const start = this.seamAnimStart[i] ?? 0;
      const target = this.seamTarget[i] ?? 0;
      return start + (target - start) * eased;
    });
    this.applyShape();

    if (elapsed < 1) {
      this.seamRaf = requestAnimationFrame(this.animateSeams);
    } else {
      this.seamRaf = 0;
    }
  };

  /** 将某个 tab 对应的左右缝隙标记为打开。 */
  private mergeTabSeams(next: number[], tabIndex: number) {
    const itemCount = this.getItemEntries().length;
    if (tabIndex < 0) return;
    if (tabIndex > 0) next[tabIndex - 1] = 1;
    if (tabIndex < itemCount - 1) next[tabIndex] = 1;
  }

  /** 根据激活与悬停索引构建目标缝隙数组。 */
  private buildSeamTarget(activeTabIndex: number, hoverTabIndex: number) {
    const next = new Array(this.seamCount).fill(0);
    this.mergeTabSeams(next, activeTabIndex);
    this.mergeTabSeams(next, hoverTabIndex);
    return next;
  }

  /** 以动画方式切换到新的缝隙目标状态。 */
  private setSeamTargetFromIndices(activeTabIndex: number, hoverTabIndex: number, durationMs = this.HOVER_ANIM_MS) {
    const next = this.buildSeamTarget(activeTabIndex, hoverTabIndex);

    const unchanged = next.every((value, index) => value === this.seamTarget[index]);
    if (unchanged) return;

    this.seamDurationMs = durationMs;
    this.seamAnimStart = [...this.seamProgress];
    this.seamTarget = next;
    this.seamStartAt = performance.now();
    if (this.seamRaf) cancelAnimationFrame(this.seamRaf);
    this.seamRaf = requestAnimationFrame(this.animateSeams);
  }

  /** 立即同步缝隙状态，不经过动画。 */
  private syncSeamStateFromIndices(activeTabIndex: number, hoverTabIndex: number) {
    const next = this.buildSeamTarget(activeTabIndex, hoverTabIndex);
    if (this.seamRaf) {
      cancelAnimationFrame(this.seamRaf);
      this.seamRaf = 0;
    }
    this.seamTarget = [...next];
    this.seamProgress = [...next];
    this.seamAnimStart = [...next];
    this.applyShape();
  }

  /** 按当前 active/hover 刷新目标形状状态。 */
  private refreshShapeTarget(instant = false, durationMs = this.HOVER_ANIM_MS) {
    const active = this.getActiveIndex();
    const hover = this.hoverIndex >= 0 && this.hoverIndex !== active ? this.hoverIndex : -1;
    if (instant) {
      this.syncSeamStateFromIndices(active, hover);
      return;
    }
    this.setSeamTargetFromIndices(active, hover, durationMs);
  }

  /** 将鼠标坐标转换到 SVG viewBox 坐标系。 */
  private toViewBoxPoint(clientX: number, clientY: number) {
    const rect = this.navRoot?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    const width = this.currentLayout.totalWidth || rect.width || 1;
    const x = ((clientX - rect.left) / rect.width) * width;
    const y = ((clientY - rect.top) / rect.height) * NAV_GEOMETRY.VIEWBOX_HEIGHT;
    return { x, y };
  }

  /** 更新高光椭圆位置与半径。 */
  private showGlow(clientX: number, clientY: number, rx = 46, ry = 15) {
    const point = this.toViewBoxPoint(clientX, clientY);
    const samePoint =
      this.lastGlowPoint &&
      Math.abs(this.lastGlowPoint.x - point.x) < 0.1 &&
      Math.abs(this.lastGlowPoint.y - point.y) < 0.1 &&
      this.lastGlowPoint.rx === rx &&
      this.lastGlowPoint.ry === ry;
    if (samePoint) return;

    const glow = this.shadowRoot?.querySelector<SVGEllipseElement>("#glow");
    if (!glow) return;

    glow.setAttribute("cx", String(point.x));
    glow.setAttribute("cy", String(point.y));
    glow.setAttribute("rx", String(rx));
    glow.setAttribute("ry", String(ry));
    this.lastGlowPoint = { x: point.x, y: point.y, rx, ry };
  }

  /** RAF 节流批处理高光更新。 */
  private flushGlow = () => {
    if (!this.pendingGlow) {
      this.glowRaf = 0;
      return;
    }
    const { clientX, clientY, rx, ry } = this.pendingGlow;
    this.showGlow(clientX, clientY, rx, ry);
    this.pendingGlow = null;
    this.glowRaf = 0;
  };

  /** 请求一次高光刷新（同帧内合并）。 */
  private requestGlow(clientX: number, clientY: number, rx = 46, ry = 15) {
    this.pendingGlow = { clientX, clientY, rx, ry };
    if (this.glowRaf) return;
    this.glowRaf = requestAnimationFrame(this.flushGlow);
  }

  /** 隐藏高光效果并清理缓存点位。 */
  private hideGlow() {
    const glow = this.shadowRoot?.querySelector<SVGEllipseElement>("#glow");
    if (!glow) return;
    glow.setAttribute("rx", "0");
    glow.setAttribute("ry", "0");
    this.lastGlowPoint = null;
  }

  /** 根据索引切换激活项并按需派发 change 事件。 */
  private setActiveByIndex(index: number, emitEvent: boolean) {
    const entries = this.getItemEntries();
    if (index < 0 || index >= entries.length) return;
    const [nextKey] = entries[index];
    if (!this.seoMode && nextKey === this.active) return;

    this.focusedIndex = index;
    if (!this.seoMode) {
      this.refreshShapeTarget(false, this.SELECT_ANIM_MS);
    }

    if (!emitEvent || this.seoMode) return;
    this.dispatchEvent(
      new CustomEvent<{ key: string; node: NavigationNode }>("change", {
        detail: {
          key: nextKey,
          node: { ...this.items }
        },
        bubbles: true,
        composed: true
      })
    );
  }

  /** 点击标签时触发激活切换。 */
  private onTabClick(index: number) {
    if (this.seoMode) return;
    this.setActiveByIndex(index, true);
  }

  /** 指针进入标签时更新 hover 与高光。 */
  private onTabPointerEnter(index: number, event: PointerEvent) {
    this.hoverIndex = index === this.getActiveIndex() ? -1 : index;
    this.refreshShapeTarget(false, this.HOVER_ANIM_MS);
    this.requestGlow(event.clientX, event.clientY);
  }

  /** 指针移动时更新高光位置。 */
  private onTabPointerMove(event: PointerEvent) {
    this.requestGlow(event.clientX, event.clientY);
  }

  /** 指针离开导航时重置 hover 与高光。 */
  private onPointerLeave() {
    this.hoverIndex = -1;
    this.hideGlow();
    this.refreshShapeTarget(false, this.HOVER_ANIM_MS);
  }

  /** 键盘导航处理：方向键、Home/End、Enter/Space。 */
  private onKeyDown(event: KeyboardEvent) {
    const itemCount = this.getItemEntries().length;
    if (!itemCount || this.seoMode) return;

    const max = itemCount - 1;
    let nextIndex = this.focusedIndex < 0 ? 0 : this.focusedIndex;

    if (event.key === "ArrowRight") {
      nextIndex = nextIndex >= max ? 0 : nextIndex + 1;
    } else if (event.key === "ArrowLeft") {
      nextIndex = nextIndex <= 0 ? max : nextIndex - 1;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = max;
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      this.setActiveByIndex(nextIndex, true);
      return;
    } else {
      return;
    }

    event.preventDefault();
    this.focusedIndex = nextIndex;
    this.requestUpdate();
    this.getTabs()[nextIndex]?.focus();
  }

  /** 渲染导航外壳、SVG 形状与 tab 列表。首帧即输出完整路径，避免升级前空白。 */
  render() {
    const entries = this.getItemEntries();
    if (!entries.length) return html``;

    const activeIndex = this.getActiveIndex();
    const labels = entries.map(([label]) => label);
    const tabWidths =
      this.baseWidths.length === entries.length
        ? this.baseWidths
        : labels.map((label) => estimateTabWidth(label));
    const { layout, bridgeD, rectDs } = computeNavigationShape(
      labels,
      tabWidths,
      this.seamProgress,
    );

    const tabListRole = this.seoMode ? "list" : "tablist";
    const { VIEWBOX_HEIGHT } = NAV_GEOMETRY;

    return html`
      <slot name="seo-fallback"></slot>
      <nav
        class="nav"
        aria-label=${this.ariaLabel}
        style="width:${layout.totalWidth}px;height:${VIEWBOX_HEIGHT}px"
        @keydown=${this.onKeyDown}
        @pointerleave=${this.onPointerLeave}
      >
        <svg class="shape" viewBox="0 0 ${layout.totalWidth} ${VIEWBOX_HEIGHT}" data-meta-row-shape>
          <path data-meta-row-shape-bridges d=${bridgeD}></path>
          ${entries.map((_, index) => svg`<path data-meta-row-rect=${String(index)} d=${rectDs[index] ?? ""}></path>`)}
          <defs>
            <radialGradient id="metaGlow" cx="50%" cy="50%" r="50%">
              <stop offset="20%" stop-color="var(--yn-navigation-glow-color, #e9e77847)"></stop>
              <stop offset="100%" stop-color="var(--yn-navigation-glow-fade, #e9e77800)"></stop>
            </radialGradient>
            <clipPath id="metaClip" clipPathUnits="userSpaceOnUse">
              <path data-meta-row-shape-bridges-clip d=${bridgeD}></path>
              ${entries.map((_, index) => svg`<path data-meta-row-rect-clip=${String(index)} d=${rectDs[index] ?? ""}></path>`)}
            </clipPath>
          </defs>
          <g clip-path="url(#metaClip)">
            <ellipse id="glow" cx="0" cy="0" rx="0" ry="0" fill="url(#metaGlow)" style="mix-blend-mode:difference;"></ellipse>
          </g>
        </svg>

        <ul class="tabs" role=${tabListRole}>
          ${entries.map(
            ([label, href], index) => html`
              <li class="tab-item">
                ${this.seoMode
                  ? html`
                      <a
                        class=${`tab ${this.hitSlop ? "hit-slope" : ""}`}
                        href=${this.getSeoPath(href)}
                        aria-current=${index === activeIndex ? "page" : "false"}
                        tabindex="0"
                        style="left:${layout.starts[index]}px;width:${layout.ends[index] - layout.starts[index]}px"
                        @pointerenter=${(event: PointerEvent) => this.onTabPointerEnter(index, event)}
                        @pointermove=${this.onTabPointerMove}
                      >
                        <span>${label}</span>
                      </a>
                    `
                  : html`
                      <button
                        class=${`tab ${this.hitSlop ? "hit-slope" : ""}`}
                        type="button"
                        role="tab"
                        aria-selected=${index === activeIndex ? "true" : "false"}
                        tabindex=${index === this.focusedIndex ? "0" : "-1"}
                        style="left:${layout.starts[index]}px;width:${layout.ends[index] - layout.starts[index]}px"
                        @click=${() => this.onTabClick(index)}
                        @pointerenter=${(event: PointerEvent) => this.onTabPointerEnter(index, event)}
                        @pointermove=${this.onTabPointerMove}
                      >
                        <span>${label}</span>
                      </button>
                    `}
              </li>
            `
          )}
        </ul>
      </nav>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "yn-navigation": YnNavigation;
  }
}
