import { LitElement, css, html, svg } from "lit";
import { customElement, property } from "lit/decorators.js";

type NavigationLayout = {
  starts: number[];
  ends: number[];
  seamCenters: number[];
  totalWidth: number;
};

type NavigationNode = Record<string, string>;

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

  private readonly onWindowResize = () => {
    if (this.resizeRaf) return;
    this.resizeRaf = requestAnimationFrame(() => {
      this.resizeRaf = 0;
      this.setupBaseGeometry();
      this.applyShape();
      this.refreshShapeTarget(true);
    });
  };

  private readonly VIEWBOX_HEIGHT = 36.80397415161133;
  private readonly HOVER_ANIM_MS = 320;
  private readonly SELECT_ANIM_MS = 240;
  private readonly SEAM_GAP = 20;
  private readonly R = 12.513351211547853;
  private readonly PATH_OVERLAP = 0.35;
  private readonly TAB_HORIZONTAL_PADDING = 20;
  private readonly TAB_MIN_WIDTH = 64;
  private seamDurationMs = this.HOVER_ANIM_MS;

  static styles = css`
      :host {
        display: inline-block;
      }

      .nav {
        position: relative;
        width: 429px;
        height: 36.80397415161133px;
        user-select: none;
      }

      .shape {
        width: 100%;
        height: 100%;
        display: block;
        overflow: visible;
      }

      [data-meta-row-shape] [data-meta-row-shape-bridges],
      [data-meta-row-shape] [data-meta-row-rect] {
        fill: var(--yn-navigation-fill-color, #ffffff);
      }

      .tabs {
        position: absolute;
        inset: 0;
        margin: 0;
        padding: 0;
        list-style: none;
      }

      .tab-item {
        display: contents;
      }

      .tab {
        position: absolute;
        top: 0;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        border: 0;
        background: transparent;
        color: var(--yn-navigation-text-color, #241f21);
        font-size: 13px;
        font-weight: 700;
        letter-spacing: 0.02em;
        text-transform: uppercase;
        white-space: nowrap;
        cursor: pointer;
        line-height: 1;
        text-decoration: none;
        appearance: none;
        -webkit-appearance: none;
      }

      .tab.hit-slope::before {
        content: "";
        position: absolute;
        top: -20px;
        left: -20px;
        width: calc(100% + 40px);
        height: calc(100% + 40px);
      }

      .tab > span {
        position: relative;
        display: inline-block;
      }

      .tab[aria-selected="true"],
      .tab[aria-current="page"] {
        color: var(--yn-navigation-active-text-color, #241f21);
      }

      .tab[aria-selected="true"]::after,
      .tab[aria-current="page"]::after {
        content: "";
        position: absolute;
        left: 50%;
        bottom: 5px;
        width: 4px;
        height: 4px;
        margin-left: -2px;
        border-radius: 50%;
        background: var(--yn-navigation-indicator-color, #241f21);
      }

      .tab:focus-visible {
        outline: 2px solid var(--yn-navigation-focus-color, #82b7ff);
        outline-offset: 2px;
        border-radius: 12px;
      }
    `;

  protected firstUpdated() {
    this.syncDomRefs();

    this.syncActiveItem();
    this.setupDynamicPaths();
    this.setupBaseGeometry();
    this.applyShape();
    this.refreshShapeTarget(true);

    window.addEventListener("resize", this.onWindowResize, { passive: true });
  }

  protected updated(changed: Map<string, unknown>) {
    this.syncDomRefs();
    const itemsChanged = changed.has("items");
    const activeChanged = changed.has("active");
    const seoModeChanged = changed.has("seoMode");

    if (itemsChanged) {
      this.syncActiveItem();
      this.setupDynamicPaths();
      this.setupBaseGeometry();
    } else if (!this.rectPaths.length) {
      this.setupDynamicPaths();
    }

    if (!this.baseWidths.length) {
      this.setupBaseGeometry();
    }
    this.applyShape();

    if (itemsChanged || activeChanged || seoModeChanged) {
      this.syncActiveItem();
      this.refreshShapeTarget(itemsChanged, activeChanged ? this.SELECT_ANIM_MS : this.HOVER_ANIM_MS);
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.seamRaf) cancelAnimationFrame(this.seamRaf);
    if (this.glowRaf) cancelAnimationFrame(this.glowRaf);
    if (this.resizeRaf) cancelAnimationFrame(this.resizeRaf);
    window.removeEventListener("resize", this.onWindowResize);
  }

  private syncDomRefs() {
    this.navRoot = this.shadowRoot?.querySelector<HTMLElement>(".nav") ?? null;
    this.svgRoot = this.shadowRoot?.querySelector<SVGElement>(".shape") ?? null;
    this.bridgePath = this.shadowRoot?.querySelector<SVGPathElement>("[data-meta-row-shape-bridges]") ?? null;
    this.bridgeClipPath = this.shadowRoot?.querySelector<SVGPathElement>("[data-meta-row-shape-bridges-clip]") ?? null;
    this.clipPath = this.shadowRoot?.querySelector<SVGClipPathElement>("#metaClip") ?? null;
    this.tabElements = Array.from(this.shadowRoot?.querySelectorAll<HTMLElement>(".tab") ?? []);
  }

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

  private getItemEntries(): Array<[string, string]> {
    return Object.entries(this.items ?? {});
  }

  private getSeoPath(path: string) {
    if (!path) return "/";
    const cleanPath = path.split("?")[0].split("#")[0];
    return cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`;
  }

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

  private getActiveIndex() {
    if (this.seoMode) {
      return this.getSeoActiveIndex();
    }
    const index = this.getItemEntries().findIndex(([key]) => key === this.active);
    return index >= 0 ? index : -1;
  }

  private getTabs() {
    return this.tabElements;
  }

  private measureTabWidths() {
    const tabs = this.getTabs();
    tabs.forEach((tab) => {
      tab.style.left = "0px";
      tab.style.width = "auto";
    });
    return tabs.map((tab) => {
      const label = tab.querySelector("span");
      const labelWidth = Math.ceil(label?.getBoundingClientRect().width ?? 0);
      return Math.max(this.TAB_MIN_WIDTH, labelWidth + this.TAB_HORIZONTAL_PADDING * 2);
    });
  }

  private setupDynamicPaths() {
    this.rectPaths = Array.from(this.shadowRoot?.querySelectorAll<SVGPathElement>("[data-meta-row-rect]") ?? []);
    this.rectClipPaths = Array.from(this.shadowRoot?.querySelectorAll<SVGPathElement>("[data-meta-row-rect-clip]") ?? []);
    this.tabElements = Array.from(this.shadowRoot?.querySelectorAll<HTMLElement>(".tab") ?? []);
    this.lastRectD = [];
    this.lastBridgeD = "";
    this.lastTotalWidth = -1;
    this.lastTabMetrics = [];
  }

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

  private lerp(a: number, b: number, t: number) {
    return a + (b - a) * t;
  }

  private buildRectPath(startX: number, endX: number, overlapStart = 0, overlapEnd = 0) {
    const adjustedStart = startX - overlapStart;
    const adjustedEnd = endX + overlapEnd;
    const yTop = 0;
    const yBottom = this.VIEWBOX_HEIGHT;
    const yArcTop = this.R;
    const yArcBottom = this.VIEWBOX_HEIGHT - this.R;
    const leftInner = adjustedStart + this.R;
    const rightInner = adjustedEnd - this.R;
    return `M${adjustedStart} ${yArcTop} A${this.R} ${this.R} 0 0 1 ${leftInner} ${yTop} L${rightInner} ${yTop} A${this.R} ${this.R} 0 0 1 ${adjustedEnd} ${yArcTop} L${adjustedEnd} ${yArcBottom} A${this.R} ${this.R} 0 0 1 ${rightInner} ${yBottom} L${leftInner} ${yBottom} A${this.R} ${this.R} 0 0 1 ${adjustedStart} ${yArcBottom} Z`;
  }

  private getCurrentLayout() {
    const gaps = this.seamProgress.map((v) => v * this.SEAM_GAP);
    const starts: number[] = [];
    const ends: number[] = [];

    if (!this.baseWidths.length) {
      return { starts, ends, seamCenters: [], totalWidth: 0 };
    }

    starts[0] = 0;
    ends[0] = this.baseWidths[0];
    for (let i = 1; i < this.baseWidths.length; i += 1) {
      starts[i] = ends[i - 1] + gaps[i - 1];
      ends[i] = starts[i] + this.baseWidths[i];
    }

    const seamCenters: number[] = [];
    for (let i = 0; i < this.seamCount; i += 1) {
      seamCenters.push((ends[i] + starts[i + 1]) / 2);
    }

    return { starts, ends, seamCenters, totalWidth: ends[ends.length - 1] };
  }

  private buildBridgeSegment(centerX: number, progress: number) {
    const left = this.lerp(0.48203949, 11.11998719, progress);
    const control = this.lerp(0.21696813, 6.60909283, progress);
    const yTop = this.lerp(28.521157255933936, 29.429300665479314, progress);
    const yTopControl = this.lerp(28.11854174502602, 23.402951368449013, progress);
    const yBottom = this.lerp(8.282816895677392, 7.374673486132014, progress);
    const yBottomControl = this.lerp(8.685432406585305, 13.401022783162313, progress);

    const x0 = centerX - left;
    const x1 = centerX - control;
    const x2 = centerX + control;
    const x3 = centerX + left;

    return `M${x0} ${yTop} C${x1} ${yTopControl}, ${x2} ${yTopControl}, ${x3} ${yTop} L${x3} ${yBottom} C${x2} ${yBottomControl}, ${x1} ${yBottomControl}, ${x0} ${yBottom} Z`;
  }

  private applyShape() {
    if (!this.navRoot || !this.svgRoot || !this.bridgePath || !this.bridgeClipPath) return;

    const layout = this.getCurrentLayout();
    this.currentLayout = layout;
    const bridgeD = layout.seamCenters.map((centerX, i) => this.buildBridgeSegment(centerX, this.seamProgress[i])).join(" ");

    if (bridgeD !== this.lastBridgeD) {
      this.bridgePath.setAttribute("d", bridgeD);
      this.bridgeClipPath.setAttribute("d", bridgeD);
      this.lastBridgeD = bridgeD;
    }

    this.rectPaths.forEach((path, i) => {
      const overlapStart = i > 0 ? this.PATH_OVERLAP : 0;
      const overlapEnd = i < this.rectPaths.length - 1 ? this.PATH_OVERLAP : 0;
      const d = this.buildRectPath(layout.starts[i], layout.ends[i], overlapStart, overlapEnd);
      if (this.lastRectD[i] !== d) {
        path.setAttribute("d", d);
        this.lastRectD[i] = d;
      }
    });

    this.rectClipPaths.forEach((path, i) => {
      const overlapStart = i > 0 ? this.PATH_OVERLAP : 0;
      const overlapEnd = i < this.rectClipPaths.length - 1 ? this.PATH_OVERLAP : 0;
      const d = this.lastRectD[i] ?? this.buildRectPath(layout.starts[i], layout.ends[i], overlapStart, overlapEnd);
      if (path.getAttribute("d") !== d) {
        path.setAttribute("d", d);
      }
    });

    if (layout.totalWidth !== this.lastTotalWidth) {
      this.svgRoot.setAttribute("viewBox", `0 0 ${layout.totalWidth} ${this.VIEWBOX_HEIGHT}`);
      this.navRoot.style.width = `${layout.totalWidth}px`;
      this.navRoot.style.height = `${this.VIEWBOX_HEIGHT}px`;
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

  private animateSeams = (timestamp: number) => {
    const elapsed = Math.min(1, (timestamp - this.seamStartAt) / this.seamDurationMs);
    const eased = 1 - Math.pow(1 - elapsed, 3);
    this.seamProgress = this.seamProgress.map((_, i) => this.lerp(this.seamAnimStart[i], this.seamTarget[i], eased));
    this.applyShape();

    if (elapsed < 1) {
      this.seamRaf = requestAnimationFrame(this.animateSeams);
    } else {
      this.seamRaf = 0;
    }
  };

  private mergeTabSeams(next: number[], tabIndex: number) {
    const itemCount = this.getItemEntries().length;
    if (tabIndex < 0) return;
    if (tabIndex > 0) next[tabIndex - 1] = 1;
    if (tabIndex < itemCount - 1) next[tabIndex] = 1;
  }

  private buildSeamTarget(activeTabIndex: number, hoverTabIndex: number) {
    const next = new Array(this.seamCount).fill(0);
    this.mergeTabSeams(next, activeTabIndex);
    this.mergeTabSeams(next, hoverTabIndex);
    return next;
  }

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

  private refreshShapeTarget(instant = false, durationMs = this.HOVER_ANIM_MS) {
    const active = this.getActiveIndex();
    const hover = this.hoverIndex >= 0 && this.hoverIndex !== active ? this.hoverIndex : -1;
    if (instant) {
      this.syncSeamStateFromIndices(active, hover);
      return;
    }
    this.setSeamTargetFromIndices(active, hover, durationMs);
  }

  private toViewBoxPoint(clientX: number, clientY: number) {
    const rect = this.navRoot?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    const width = this.currentLayout.totalWidth || rect.width || 1;
    const x = ((clientX - rect.left) / rect.width) * width;
    const y = ((clientY - rect.top) / rect.height) * this.VIEWBOX_HEIGHT;
    return { x, y };
  }

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

  private requestGlow(clientX: number, clientY: number, rx = 46, ry = 15) {
    this.pendingGlow = { clientX, clientY, rx, ry };
    if (this.glowRaf) return;
    this.glowRaf = requestAnimationFrame(this.flushGlow);
  }

  private hideGlow() {
    const glow = this.shadowRoot?.querySelector<SVGEllipseElement>("#glow");
    if (!glow) return;
    glow.setAttribute("rx", "0");
    glow.setAttribute("ry", "0");
    this.lastGlowPoint = null;
  }

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

  private onTabClick(index: number) {
    if (this.seoMode) return;
    this.setActiveByIndex(index, true);
  }

  private onTabPointerEnter(index: number, event: PointerEvent) {
    this.hoverIndex = index === this.getActiveIndex() ? -1 : index;
    this.refreshShapeTarget(false, this.HOVER_ANIM_MS);
    this.requestGlow(event.clientX, event.clientY);
  }

  private onTabPointerMove(event: PointerEvent) {
    this.requestGlow(event.clientX, event.clientY);
  }

  private onPointerLeave() {
    this.hoverIndex = -1;
    this.hideGlow();
    this.refreshShapeTarget(false, this.HOVER_ANIM_MS);
  }

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

  render() {
    const entries = this.getItemEntries();
    if (!entries.length) return html``;

    const activeIndex = this.getActiveIndex();

    const tabListRole = this.seoMode ? "list" : "tablist";

    return html`
      <nav class="nav" aria-label=${this.ariaLabel} @keydown=${this.onKeyDown} @pointerleave=${this.onPointerLeave}>
        <svg class="shape" viewBox="0 0 429.09088134765625 36.80397415161133" data-meta-row-shape>
          <path data-meta-row-shape-bridges d=""></path>
          ${entries.map((_, index) => svg`<path data-meta-row-rect=${String(index)} d=""></path>`)}
          <defs>
            <radialGradient id="metaGlow" cx="50%" cy="50%" r="50%">
              <stop offset="20%" stop-color="var(--yn-navigation-glow-color, #e9e77847)"></stop>
              <stop offset="100%" stop-color="var(--yn-navigation-glow-fade, #e9e77800)"></stop>
            </radialGradient>
            <clipPath id="metaClip" clipPathUnits="userSpaceOnUse">
              <path data-meta-row-shape-bridges-clip d=""></path>
              ${entries.map((_, index) => svg`<path data-meta-row-rect-clip=${String(index)} d=""></path>`)}
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
