import { LitElement, css, html, unsafeCSS } from "lit";
import type { PropertyValues } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";
import { ynSearchCloseSvg, ynSearchSvg } from "../../asset/svg";
import { applyLitDsd, dedupeShadowDsdContent, ensureRenderRoot } from "../../lib/lit-dsd.js";
import { YN_SEARCH_SHADOW_STYLES } from "./yn-search-styles.js";

@customElement("yn-search")
export class YnSearch extends LitElement {
  @property({ type: Boolean, reflect: true }) close = false;
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ type: String }) placeholder = "O que estás à procura?";
  @property({ type: Number, attribute: "input-width" }) inputWidth = 514;

  @state()
  private open = false;

  @state()
  private animating = false;

  @state()
  private value = "";

  @query("#searchShell")
  private shellEl!: HTMLDivElement;

  @query("#dynamicWrap")
  private dynamicWrapEl!: HTMLDivElement;

  @query("#shape")
  private shapeEl!: SVGSVGElement;

  @query("#leftShape")
  private leftShapeEl!: SVGSVGElement;

  @query("#bridge")
  private bridgeEl!: SVGPathElement;

  @query("#rect1")
  private rect1El!: SVGPathElement;

  @query("#searchInput")
  private inputEl!: HTMLInputElement;

  @query("#datalistSlot")
  private datalistSlotEl!: HTMLSlotElement;

  @query("#internalDatalist")
  private internalDatalistEl!: HTMLDataListElement;

  private shapeRaf = 0;
  private ready = false;
  private datalistObserver: MutationObserver | null = null;
  private observedDatalist: HTMLDataListElement | null = null;

  private readonly R = 12.920000000000002;
  private readonly RECT_START_CLOSED = 44;
  private readonly RECT_START_OPEN = 54;
  private readonly RETRACT_X = 31.08;
  private readonly TRANSITION_SPLIT = 0.82;
  private readonly GAP = 10;
  private readonly easeOpen = this.cubicBezier(0.22, 0.01, 0.35, 1);
  private readonly easeClose = this.cubicBezier(0.55, 0.055, 0.675, 0.19);

  private lastRectPath = "";
  private lastBridgePath = "";
  private lastDynamicTransform = "";
  private lastInputOpacity = "";
  private lastInputTransform = "";

  private readonly bridgeClosed = {
    x: [44, 44, 44, 44, 44, 44, 44, 44],
    y: [25.08, 25.08, 25.08, 25.08, 12.92, 12.92, 12.92, 12.92]
  };

  private readonly bridgeOpened = {
    x: [
      43.02922778103873, 46.440616756960296, 51.4593832430397, 54.87077221896127, 54.87077221896127,
      51.4593832430397, 46.440616756960296, 43.02922778103873
    ],
    y: [
      29.947286628412307, 25.10807502694411, 25.10807502694411, 29.947286628412307, 8.052713371587695,
      12.89192497305589, 12.89192497305589, 8.052713371587695
    ]
  };

  static styles = css`
    ${unsafeCSS(YN_SEARCH_SHADOW_STYLES)}
  `;

  private get rectEndOpen() {
    return this.RECT_START_OPEN + Math.max(80, this.inputWidth);
  }

  private get shellWidth() {
    return this.open || this.animating
      ? this.RECT_START_CLOSED + this.dynamicWidth
      : this.RECT_START_CLOSED;
  }

  private get dynamicWidth() {
    return this.GAP + Math.max(80, this.inputWidth);
  }

  private get shapeTAtButton() {
    return this.RETRACT_X / (this.rectEndOpen - this.RECT_START_OPEN);
  }

  /** 组件挂载时同步初始壳层状态。 */
  connectedCallback() {
    super.connectedCallback();
    this.onToggle = this.onToggle.bind(this);
    this.onInput = this.onInput.bind(this);
    this.onInputKeydown = this.onInputKeydown.bind(this);
  }

  /** 组件卸载时停止动画与观察器。 */
  disconnectedCallback() {
    this.stopAnims();
    this.observeSourceDatalist(null);
    super.disconnectedCallback();
  }

  /** 首次渲染后同步 datalist；收起态仅靠 CSS，不在此写 inline 隐藏样式。 */
  protected firstUpdated() {
    if (this.open) {
      this.applyShape(1);
      this.syncInputToShape(1, true, this.rectEndOpen - this.RECT_START_OPEN);
    } else {
      this.bridgeEl.setAttribute("d", "");
      this.rect1El.setAttribute("d", "");
    }
    if (this.value) this.inputEl.value = this.value;
    this.syncDatalistFromSlot();
  }

  bootstrapFromDeclarativeShadow() {
    const root = this.shadowRoot;
    if (!root) return;
    dedupeShadowDsdContent(root, "#searchShell");
    ensureRenderRoot(this);
    this.ensureDsdRefs();
    root.querySelector("#bridge")?.setAttribute("d", "");
    root.querySelector("#rect1")?.setAttribute("d", "");
    const inputEl = root.querySelector<HTMLInputElement>("#searchInput");
    if (this.value && inputEl) inputEl.value = this.value;
    root.querySelector("#toggleBtn")?.addEventListener("click", this.onToggle);
    inputEl?.addEventListener("input", this.onInput);
    inputEl?.addEventListener("keydown", this.onInputKeydown);
    root.querySelector("#datalistSlot")?.addEventListener("slotchange", this.onDatalistSlotChange);
    this.syncDatalistFromSlot();
    this.syncShellDom();
    this.ready = true;
  }

  /** DSD 首帧 @query 未注入，从 shadow 手动取 ref */
  private ensureDsdRefs(): boolean {
    const root = this.shadowRoot;
    if (!root) return false;
    if (!this.shellEl) this.shellEl = root.querySelector("#searchShell") as HTMLDivElement;
    if (!this.dynamicWrapEl) this.dynamicWrapEl = root.querySelector("#dynamicWrap") as HTMLDivElement;
    if (!this.shapeEl) this.shapeEl = root.querySelector("#shape") as SVGSVGElement;
    if (!this.leftShapeEl) this.leftShapeEl = root.querySelector("#leftShape") as SVGSVGElement;
    if (!this.bridgeEl) this.bridgeEl = root.querySelector("#bridge") as SVGPathElement;
    if (!this.rect1El) this.rect1El = root.querySelector("#rect1") as SVGPathElement;
    if (!this.inputEl) this.inputEl = root.querySelector("#searchInput") as HTMLInputElement;
    if (!this.datalistSlotEl) this.datalistSlotEl = root.querySelector("#datalistSlot") as HTMLSlotElement;
    if (!this.internalDatalistEl) {
      this.internalDatalistEl = root.querySelector("#internalDatalist") as HTMLDataListElement;
    }
    return Boolean(this.shellEl && this.bridgeEl && this.dynamicWrapEl && this.inputEl);
  }

  private syncShellDom() {
    if (!this.ensureDsdRefs()) return;
    this.shellEl.classList.toggle("open", this.open);
    this.shellEl.classList.toggle("animating", this.animating);
    this.shellEl.style.width = `${this.shellWidth}px`;
    const toggleBtn = this.shadowRoot?.querySelector("#toggleBtn");
    toggleBtn?.setAttribute("aria-label", this.open ? "close search" : "open search");
  }

  /** 动画结束后清掉 inline 样式，交回 CSS 控制显隐。 */
  private clearDynamicWrapInlineStyles() {
    this.dynamicWrapEl.style.removeProperty("display");
    this.dynamicWrapEl.style.removeProperty("visibility");
    this.dynamicWrapEl.style.removeProperty("transform");
    this.dynamicWrapEl.style.removeProperty("opacity");
    this.inputEl.style.removeProperty("opacity");
    this.inputEl.style.removeProperty("transform");
    this.lastDynamicTransform = "";
    this.lastInputOpacity = "";
    this.lastInputTransform = "";
  }

  /** 从 slot 中获取外部 datalist 源节点。 */
  private getSourceDatalistFromSlot() {
    const assigned = this.datalistSlotEl?.assignedElements({ flatten: true }) ?? [];
    const source = assigned.find((node) => node instanceof HTMLDataListElement);
    return source ?? null;
  }

  /** 监听外部 datalist 变化并同步到内部。 */
  private observeSourceDatalist(source: HTMLDataListElement | null) {
    if (this.observedDatalist === source) return;
    this.datalistObserver?.disconnect();
    this.observedDatalist = source;
    if (!source || typeof MutationObserver === "undefined") return;
    this.datalistObserver = new MutationObserver(() => this.syncDatalistFromSlot());
    this.datalistObserver.observe(source, { childList: true, subtree: true, attributes: true, characterData: true });
  }

  /** 将 slot datalist 内容同步到内部 datalist。 */
  private syncDatalistFromSlot() {
    const source = this.getSourceDatalistFromSlot();
    this.observeSourceDatalist(source);
    if (!this.internalDatalistEl) return;
    const nextHtml = source?.innerHTML ?? "";
    if (this.internalDatalistEl.innerHTML !== nextHtml) {
      this.internalDatalistEl.innerHTML = nextHtml;
    }
  }

  private onDatalistSlotChange = () => {
    this.syncDatalistFromSlot();
  };

  /** 监听属性变化并刷新动画、壳层与事件输出。 */
  protected updated(changed: PropertyValues) {
    // 跳过首次 updated：避免 open 从 undefined→false 误触发收起动画
    if (!this.ready) {
      this.ready = true;
      return;
    }
    if (changed.has("inputWidth")) {
      if (this.open) {
        this.applyShape(1);
        this.syncInputToShape(1, true, this.rectEndOpen - this.RECT_START_OPEN);
      }
    }
    if (changed.has("open") && changed.get("open") !== undefined) {
      this.stopAnims();
      this.syncShellDom();
      if (this.ensureDsdRefs()) {
        this.animateShape(this.open);
      }
    }
  }

  /** 停止所有进行中的形状动画 RAF。 */
  private stopAnims() {
    if (this.shapeRaf) {
      cancelAnimationFrame(this.shapeRaf);
      this.shapeRaf = 0;
    }
  }

  /** 线性插值工具。 */
  private lerp(a: number, b: number, t: number) {
    return a + (b - a) * t;
  }

  /** 生成 cubic-bezier easing 求值函数。 */
  private cubicBezier(x1: number, y1: number, x2: number, y2: number) {
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

  /** 构建矩形胶囊路径。 */
  private buildRectPath(startX: number, endX: number) {
    if (endX <= startX + 0.001) return `M${startX} 0L${startX} 0L${startX} 38L${startX} 38 Z`;
    const width = endX - startX;
    const rr = Math.min(this.R, width * 0.5);
    const topArc = rr;
    const bottomArc = 38 - rr;
    const leftInner = startX + rr;
    const rightInner = endX - rr;
    return `M${startX} ${topArc} A${rr} ${rr} 0 0 1 ${leftInner} 0 L${rightInner} 0 A${rr} ${rr} 0 0 1 ${endX} ${topArc} L${endX} ${bottomArc} A${rr} ${rr} 0 0 1 ${rightInner} 38 L${leftInner} 38 A${rr} ${rr} 0 0 1 ${startX} ${bottomArc} Z`;
  }

  /** 构建桥接路径，t 表示形态进度。 */
  private buildBridgePath(t: number) {
    const c = this.bridgeClosed;
    const o = this.bridgeOpened;
    const x0 = this.lerp(c.x[0], o.x[0], t);
    const x1 = this.lerp(c.x[1], o.x[1], t);
    const x2 = this.lerp(c.x[2], o.x[2], t);
    const x3 = this.lerp(c.x[3], o.x[3], t);
    const x4 = this.lerp(c.x[4], o.x[4], t);
    const x5 = this.lerp(c.x[5], o.x[5], t);
    const x6 = this.lerp(c.x[6], o.x[6], t);
    const x7 = this.lerp(c.x[7], o.x[7], t);

    const y0 = this.lerp(c.y[0], o.y[0], t);
    const y1 = this.lerp(c.y[1], o.y[1], t);
    const y2 = this.lerp(c.y[2], o.y[2], t);
    const y3 = this.lerp(c.y[3], o.y[3], t);
    const y4 = this.lerp(c.y[4], o.y[4], t);
    const y5 = this.lerp(c.y[5], o.y[5], t);
    const y6 = this.lerp(c.y[6], o.y[6], t);
    const y7 = this.lerp(c.y[7], o.y[7], t);
    return `M${x0} ${y0} C${x1} ${y1}, ${x2} ${y2}, ${x3} ${y3} L${x4} ${y4} C${x5} ${y5}, ${x6} ${y6}, ${x7} ${y7} Z`;
  }

  /** 按给定进度和区间写入路径数据。 */
  private applyShapeFromValues(t: number, startX: number, endX: number) {
    const rectPath = this.buildRectPath(startX, endX);
    if (rectPath !== this.lastRectPath) {
      this.rect1El.setAttribute("d", rectPath);
      this.lastRectPath = rectPath;
    }
    const bridgePath = this.buildBridgePath(t);
    if (bridgePath !== this.lastBridgePath) {
      this.bridgeEl.setAttribute("d", bridgePath);
      this.lastBridgePath = bridgePath;
    }
  }

  /** 依据当前宽度状态应用整体形状。 */
  private applyShape(t: number) {
    const startX = this.lerp(this.RECT_START_CLOSED, this.RECT_START_OPEN, t);
    const endX = this.lerp(this.RECT_START_CLOSED, this.rectEndOpen, t);
    this.applyShapeFromValues(t, startX, endX);
  }

  /** 根据形状进度同步输入框透明度与位移。 */
  private syncInputToShape(t: number, opening: boolean, rectWidth = 0) {
    const p = opening
      ? Math.max(0, Math.min(1, (rectWidth - 80) / 180))
      : Math.max(0, Math.min(1, (rectWidth - 220) / 180));
    const nextOpacity = String(p);
    const nextTransform = `translateX(${this.lerp(-12, 0, p)}px)`;
    if (nextOpacity !== this.lastInputOpacity) {
      this.inputEl.style.opacity = nextOpacity;
      this.lastInputOpacity = nextOpacity;
    }
    if (nextTransform !== this.lastInputTransform) {
      this.inputEl.style.transform = nextTransform;
      this.lastInputTransform = nextTransform;
    }
  }

  /** 执行开关阶段形状动画。 */
  private animateShape(opening: boolean) {
    if (!this.ensureDsdRefs()) return;
    const duration = opening ? 620 : 500;
    const ease = opening ? this.easeOpen : this.easeClose;
    const start = performance.now();
    this.animating = true;
    this.syncShellDom();
    this.dynamicWrapEl.style.visibility = "visible";

    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const ep = ease(p);
      let t: number;
      let x: number;

      if (opening) {
        if (ep < this.TRANSITION_SPLIT) {
          const local = ep / this.TRANSITION_SPLIT;
          t = this.lerp(0, this.shapeTAtButton, local);
          x = this.lerp(-this.RETRACT_X, 0, local);
        } else {
          const local = (ep - this.TRANSITION_SPLIT) / (1 - this.TRANSITION_SPLIT);
          t = this.lerp(this.shapeTAtButton, 1, local);
          x = 0;
        }
      } else if (ep < this.TRANSITION_SPLIT) {
        const local = ep / this.TRANSITION_SPLIT;
        t = this.lerp(1, this.shapeTAtButton, local);
        x = 0;
      } else {
        const local = (ep - this.TRANSITION_SPLIT) / (1 - this.TRANSITION_SPLIT);
        t = this.lerp(this.shapeTAtButton, 0, local);
        x = 0;
      }

      const currentStartX = this.lerp(this.RECT_START_CLOSED, this.RECT_START_OPEN, t);
      const currentEndX = this.lerp(this.RECT_START_CLOSED, this.rectEndOpen, t);
      const rectWidth = Math.max(0, currentEndX - currentStartX);
      this.applyShapeFromValues(t, currentStartX, currentEndX);
      this.syncInputToShape(t, opening, rectWidth);
      const nextTransform = `translateX(${x}px)`;
      if (nextTransform !== this.lastDynamicTransform) {
        this.dynamicWrapEl.style.transform = nextTransform;
        this.lastDynamicTransform = nextTransform;
      }
      if (p < 1) {
        this.shapeRaf = requestAnimationFrame(tick);
      } else {
        this.shapeRaf = 0;
        this.applyShape(opening ? 1 : 0);
        const endRectWidth = opening ? this.rectEndOpen - this.RECT_START_OPEN : 0;
        this.syncInputToShape(opening ? 1 : 0, opening, endRectWidth);
        if (this.lastDynamicTransform !== "translateX(0px)") {
          this.dynamicWrapEl.style.transform = "translateX(0px)";
          this.lastDynamicTransform = "translateX(0px)";
        }
        if (!opening) {
          if (this.lastBridgePath !== "") {
            this.bridgeEl.setAttribute("d", "");
            this.lastBridgePath = "";
          }
          if (this.lastRectPath !== "") {
            this.rect1El.setAttribute("d", "");
            this.lastRectPath = "";
          }
          this.clearDynamicWrapInlineStyles();
        }
        this.animating = false;
        this.syncShellDom();
      }
    };

    this.shapeRaf = requestAnimationFrame(tick);
  }

  /** 处理输入并同步组件值。 */
  private onInput(event: Event) {
    this.value = (event.target as HTMLInputElement).value;
    this.dispatchInputEvent();
  }

  /** 对外派发输入变化事件。 */
  private dispatchInputEvent() {
    this.dispatchEvent(
      new CustomEvent("input", {
        detail: { value: this.value },
        bubbles: true,
        composed: true
      })
    );
  }

  /** 处理输入框按键行为（回车等）。 */
  private onInputKeydown(event: KeyboardEvent) {
    if (event.key !== "Enter") return;
    this.dispatchEvent(
      new CustomEvent("enter", {
        detail: { value: this.value },
        bubbles: true,
        composed: true
      })
    );
  }

  /** 处理图标点击切换：展开、关闭或清空。 */
  private onToggle() {
    if (this.disabled) return;
    if (!this.open) {
      this.open = true;
      this.syncShellDom();
      if (this.ensureDsdRefs()) {
        this.stopAnims();
        this.animateShape(true);
      }
      setTimeout(() => this.inputEl?.focus(), 180);
      return;
    }

    if (this.close) {
      if (this.value) {
        this.value = "";
        if (this.inputEl) this.inputEl.value = "";
        this.dispatchInputEvent();
        this.inputEl?.focus();
        return;
      }
      this.open = false;
      this.syncShellDom();
      if (this.ensureDsdRefs()) {
        this.stopAnims();
        this.animateShape(false);
      }
      return;
    }

    if (this.value) {
      this.value = "";
      if (this.inputEl) this.inputEl.value = "";
      this.dispatchInputEvent();
    }
    this.open = false;
    this.syncShellDom();
    if (this.ensureDsdRefs()) {
      this.stopAnims();
      this.animateShape(false);
    }
  }

  /** 渲染搜索组件外壳、路径与输入区域。 */
  render() {
    return html`
      <div
        id="searchShell"
        class=${`search-shell${this.open ? " open" : ""}${this.animating ? " animating" : ""}`}
        style=${`width:${this.shellWidth}px;`}
      >
        <svg id="leftShape" class="left-shape" viewBox="0 0 44 38" data-meta-row-shape>
          <path
            d="M0 12.920000000000002 A12.920000000000002 12.920000000000002 0 0 1 12.920000000000002 0 L31.08 0 A12.920000000000002 12.920000000000002 0 0 1 44 12.920000000000002 L44 25.08 A12.920000000000002 12.920000000000002 0 0 1 31.08 38 L12.920000000000002 38 A12.920000000000002 12.920000000000002 0 0 1 0 25.08 Z"
          ></path>
        </svg>

        <div id="dynamicWrap" class="dynamic-wrap" style=${`width:${this.dynamicWidth}px;`}>
          <svg
            id="shape"
            class="shape"
            viewBox=${`44 0 ${this.dynamicWidth} 38`}
            style=${`width:${this.dynamicWidth}px;`}
            data-meta-row-shape
          >
            <path id="bridge" data-meta-row-shape-bridges d=""></path>
            <path id="rect1" data-meta-row-rect="1" d=""></path>
          </svg>

          <div class="search-input" style=${`width:${Math.max(80, this.inputWidth)}px;`}>
            <div class="inner">
              <input
                id="searchInput"
                class="field"
                .value=${this.value}
                list="internalDatalist"
                placeholder=${this.placeholder}
                ?disabled=${this.disabled}
                @input=${this.onInput}
                @keydown=${this.onInputKeydown}
              />
            </div>
          </div>
        </div>

        <button
          id="toggleBtn"
          class="toggle-btn"
          type="button"
          ?disabled=${this.disabled}
          aria-label=${this.open ? "close search" : "open search"}
          @click=${this.onToggle}
        >
          ${unsafeSVG(ynSearchSvg)}
          ${unsafeSVG(ynSearchCloseSvg)}
        </button>
        <slot id="datalistSlot" class="datalist-slot" @slotchange=${this.onDatalistSlotChange}></slot>
        <datalist id="internalDatalist"></datalist>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "yn-search": YnSearch;
  }
}

applyLitDsd(YnSearch, "#searchShell", (el) => el.bootstrapFromDeclarativeShadow());
