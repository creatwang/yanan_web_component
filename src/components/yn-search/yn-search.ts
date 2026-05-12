import { LitElement, css, html, unsafeCSS } from "lit";
import type { PropertyValues } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import tailwindStyles from "../../styles/tailwind.css?inline";

@customElement("yn-search")
export class YnSearch extends LitElement {
  @property({ type: Boolean, reflect: true }) close = false;
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ type: String }) placeholder = "O que estás à procura?";
  @property({ type: Number, attribute: "input-width" }) inputWidth = 514;

  @state()
  private open = false;

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

  private hover = false;
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
  private readonly UI_TRANSITION_MS = 220;
  private readonly UI_EASING = "cubic-bezier(0.4, 0, 1, 1)";
  private readonly easeOpen = this.cubicBezier(0.22, 0.01, 0.35, 1);
  private readonly easeClose = this.cubicBezier(0.55, 0.055, 0.675, 0.19);

  private lastFill = "";
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

  static styles = [
    unsafeCSS(tailwindStyles),
    css`
      :host {
        --bg-fill: rgba(255, 255, 255, 0);
        --yn-search-icon-color: #241f21;
        --yn-search-bg-active: rgba(255, 255, 255, 0.96);
        --yn-search-bg-idle: rgba(255, 255, 255, 0);
        display: inline-block;
      }

      @font-face {
        font-family: "Zimula";
        src: url("https://www.floema.com/_nuxt/Zimula-Variable.Cb2n2uX-.ttf") format("truetype");
        font-display: swap;
      }

      * {
        box-sizing: border-box;
      }

      .search-shell {
        position: relative;
        height: 38px;
      }

      .left-shape {
        position: absolute;
        top: 0;
        left: 0;
        width: 44px;
        height: 38px;
        fill: var(--bg-fill);
        transition: fill var(--yn-search-fill-duration, 260ms) var(--yn-search-fill-ease, cubic-bezier(0.2, 0, 0.2, 1));
      }

      .left-shape path {
        stroke: var(--bg-fill);
        stroke-width: 0.65;
        stroke-linejoin: round;
        stroke-linecap: round;
        transition:
          fill var(--yn-search-fill-duration, 260ms) var(--yn-search-fill-ease, cubic-bezier(0.2, 0, 0.2, 1)),
          stroke var(--yn-search-fill-duration, 260ms) var(--yn-search-fill-ease, cubic-bezier(0.2, 0, 0.2, 1));
      }

      .dynamic-wrap {
        position: absolute;
        top: 0;
        left: 44px;
        height: 38px;
        overflow: hidden;
        opacity: 1;
        pointer-events: none;
      }

      .search-shell.open .dynamic-wrap {
        opacity: 1;
        pointer-events: auto;
      }

      .shape {
        position: absolute;
        top: 0;
        left: 0;
        height: 38px;
        fill: var(--bg-fill);
        transition: fill var(--yn-search-fill-duration, 260ms) var(--yn-search-fill-ease, cubic-bezier(0.2, 0, 0.2, 1));
      }

      .shape path {
        stroke: var(--bg-fill);
        stroke-width: 0.65;
        stroke-linejoin: round;
        stroke-linecap: round;
        transition:
          fill var(--yn-search-fill-duration, 260ms) var(--yn-search-fill-ease, cubic-bezier(0.2, 0, 0.2, 1)),
          stroke var(--yn-search-fill-duration, 260ms) var(--yn-search-fill-ease, cubic-bezier(0.2, 0, 0.2, 1));
      }

      .toggle-btn {
        position: absolute;
        left: 0;
        top: 0;
        width: 44px;
        height: 38px;
        border: 0;
        background: transparent;
        color: var(--yn-search-icon-color);
        cursor: pointer;
        display: grid;
        place-items: center;
        z-index: 2;
      }

      .toggle-btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .icon {
        position: absolute;
        width: 20px;
        height: 20px;
        transition:
          opacity var(--yn-search-icon-duration, 260ms) var(--yn-search-icon-ease, cubic-bezier(0.2, 0.8, 0.2, 1)),
          transform var(--yn-search-icon-duration, 260ms) var(--yn-search-icon-ease, cubic-bezier(0.2, 0.8, 0.2, 1));
      }

      .icon.search {
        opacity: 1;
        transform: scale(1);
      }

      .icon.close {
        opacity: 0;
        transform: scale(0.7) rotate(-80deg);
      }

      .search-shell.open .toggle-btn .icon.search {
        opacity: 0;
        transform: scale(0.7) rotate(80deg);
      }

      .search-shell.open .toggle-btn .icon.close {
        opacity: 1;
        transform: scale(1) rotate(0deg);
      }

      .search-input {
        position: absolute;
        top: 0;
        left: 0;
        margin-left: 10px;
      }

      .search-input .inner {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 38px;
        padding: 2px 10px;
        pointer-events: none;
      }

      .search-shell.open .search-input .inner {
        pointer-events: auto;
      }

      .field {
        width: 100%;
        border: 0;
        outline: 0;
        background: transparent;
        color: #241f21b3;
        font-family: "Zimula", Arial, "PingFang SC", "Microsoft YaHei", sans-serif;
        font-size: clamp(12px, 10.83px + 100vw * 0.003, 16px);
        font-variation-settings: "cnct" 1000, "wght" 500;
        letter-spacing: -0.02em;
        line-height: 1.4em;
        caret-color: #241f21;
        padding-left: 3px;
        opacity: 0;
        transform: translateX(-10px);
        transition: none;
      }

      .search-shell.open .field {
        opacity: 1;
        transform: translateX(0px);
      }

      .field::placeholder {
        color: #241f2199;
      }

      .field::-webkit-calendar-picker-indicator {
        display: none !important;
        -webkit-appearance: none;
      }

      .datalist-slot {
        display: none;
      }

      @media only screen and (max-width: 1023px) {
        .field,
        .field::placeholder {
          font-size: 16px;
        }
      }
    `
  ];

  private get rectEndOpen() {
    return this.RECT_START_OPEN + Math.max(80, this.inputWidth);
  }

  private get dynamicWidth() {
    return this.GAP + Math.max(80, this.inputWidth);
  }

  private get shapeTAtButton() {
    return this.RETRACT_X / (this.rectEndOpen - this.RECT_START_OPEN);
  }

  connectedCallback() {
    super.connectedCallback();
    this.onToggle = this.onToggle.bind(this);
    this.onInput = this.onInput.bind(this);
    this.onInputKeydown = this.onInputKeydown.bind(this);
  }

  disconnectedCallback() {
    this.stopAnims();
    this.observeSourceDatalist(null);
    super.disconnectedCallback();
  }

  protected firstUpdated() {
    this.shellEl?.style.setProperty("--yn-search-fill-duration", `${this.UI_TRANSITION_MS}ms`);
    this.shellEl?.style.setProperty("--yn-search-fill-ease", this.UI_EASING);
    this.shellEl?.style.setProperty("--yn-search-icon-duration", `${this.UI_TRANSITION_MS}ms`);
    this.shellEl?.style.setProperty("--yn-search-icon-ease", this.UI_EASING);
    this.syncShell();
    this.syncFill();
    if (this.open) {
      this.dynamicWrapEl.style.opacity = "1";
      this.dynamicWrapEl.style.visibility = "visible";
      this.dynamicWrapEl.style.transform = "translateX(0px)";
      this.applyShape(1);
      this.syncInputToShape(1, true, this.rectEndOpen - this.RECT_START_OPEN);
    } else {
      this.applyShape(0);
      this.dynamicWrapEl.style.opacity = "1";
      this.dynamicWrapEl.style.visibility = "hidden";
      this.dynamicWrapEl.style.transform = `translateX(-${this.RETRACT_X}px)`;
      this.inputEl.style.opacity = "0";
      this.inputEl.style.transform = "translateX(-12px)";
      this.bridgeEl.setAttribute("d", "");
      this.rect1El.setAttribute("d", "");
    }
    if (this.value) this.inputEl.value = this.value;
    this.syncDatalistFromSlot();
    this.ready = true;
  }

  private getSourceDatalistFromSlot() {
    const assigned = this.datalistSlotEl?.assignedElements({ flatten: true }) ?? [];
    const source = assigned.find((node) => node instanceof HTMLDataListElement);
    return source ?? null;
  }

  private observeSourceDatalist(source: HTMLDataListElement | null) {
    if (this.observedDatalist === source) return;
    this.datalistObserver?.disconnect();
    this.observedDatalist = source;
    if (!source || typeof MutationObserver === "undefined") return;
    this.datalistObserver = new MutationObserver(() => this.syncDatalistFromSlot());
    this.datalistObserver.observe(source, { childList: true, subtree: true, attributes: true, characterData: true });
  }

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

  protected updated(changed: PropertyValues) {
    if (!this.ready) return;
    if (changed.has("inputWidth")) {
      if (this.open) {
        this.applyShape(1);
        this.syncInputToShape(1, true, this.rectEndOpen - this.RECT_START_OPEN);
      }
    }
    if (changed.has("open")) {
      this.syncShell();
      this.syncFill();
      this.stopAnims();
      this.animateShape(this.open);
    }
  }

  private syncFill() {
    const fill = this.open || this.hover ? "var(--yn-search-bg-active)" : "var(--yn-search-bg-idle)";
    if (fill === this.lastFill) return;
    this.lastFill = fill;
    this.shellEl?.style.setProperty("--bg-fill", fill);
    this.shapeEl?.style.setProperty("--bg-fill", fill);
    this.leftShapeEl?.style.setProperty("--bg-fill", fill);
  }

  private syncShell() {
    this.shellEl?.classList.toggle("open", this.open);
  }

  private stopAnims() {
    if (this.shapeRaf) {
      cancelAnimationFrame(this.shapeRaf);
      this.shapeRaf = 0;
    }
  }

  private setHover(hover: boolean) {
    this.hover = hover;
    this.syncFill();
  }

  private lerp(a: number, b: number, t: number) {
    return a + (b - a) * t;
  }

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

  private applyShape(t: number) {
    const startX = this.lerp(this.RECT_START_CLOSED, this.RECT_START_OPEN, t);
    const endX = this.lerp(this.RECT_START_CLOSED, this.rectEndOpen, t);
    this.applyShapeFromValues(t, startX, endX);
  }

  private syncInputToShape(t: number, opening: boolean, rectWidth = 0) {
    let p = 0;
    if (opening) {
      p = Math.max(0, Math.min(1, (rectWidth - 80) / 180));
    } else {
      p = Math.max(0, Math.min(1, (rectWidth - 220) / 180));
    }
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

  private animateShape(opening: boolean) {
    const duration = opening ? 620 : 500;
    const ease = opening ? this.easeOpen : this.easeClose;
    const start = performance.now();
    this.shellEl?.style.setProperty("--yn-search-icon-duration", `${this.UI_TRANSITION_MS}ms`);
    this.shellEl?.style.setProperty("--yn-search-icon-ease", this.UI_EASING);
    this.shellEl?.style.setProperty("--yn-search-fill-duration", `${this.UI_TRANSITION_MS}ms`);
    this.shellEl?.style.setProperty("--yn-search-fill-ease", this.UI_EASING);
    this.dynamicWrapEl.style.visibility = "visible";

    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const ep = ease(p);
      let t = 0;
      let x = 0;

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
          this.dynamicWrapEl.style.visibility = "hidden";
          if (this.lastBridgePath !== "") {
            this.bridgeEl.setAttribute("d", "");
            this.lastBridgePath = "";
          }
          if (this.lastRectPath !== "") {
            this.rect1El.setAttribute("d", "");
            this.lastRectPath = "";
          }
        }
      }
    };

    this.shapeRaf = requestAnimationFrame(tick);
  }

  private onInput(event: Event) {
    this.value = (event.target as HTMLInputElement).value;
    this.dispatchInputEvent();
  }

  private dispatchInputEvent() {
    this.dispatchEvent(
      new CustomEvent("input", {
        detail: { value: this.value },
        bubbles: true,
        composed: true
      })
    );
  }

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

  private onToggle() {
    if (this.disabled) return;
    if (!this.open) {
      this.open = true;
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
      return;
    }

    if (this.value) {
      this.value = "";
      if (this.inputEl) this.inputEl.value = "";
      this.dispatchInputEvent();
    }
    this.open = false;
  }

  render() {
    return html`
      <div
        id="searchShell"
        class="search-shell"
        style=${`width:${this.RECT_START_CLOSED + this.dynamicWidth}px;`}
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
          @mouseenter=${() => this.setHover(true)}
          @mouseleave=${() => this.setHover(false)}
        >
          <svg class="icon search" width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M4.36328 9.01777C4.36328 6.4477 6.44673 4.36426 9.01679 4.36426C11.5869 4.36426 13.6703 6.4477 13.6703 9.01777C13.6703 11.5878 11.5869 13.6713 9.01679 13.6713C6.44673 13.6713 4.36328 11.5878 4.36328 9.01777ZM9.01679 2.86426C5.6183 2.86426 2.86328 5.61928 2.86328 9.01777C2.86328 12.4163 5.6183 15.1713 9.01679 15.1713C10.0496 15.1713 11.0229 14.9168 11.8776 14.4673C12.4367 14.1731 13.1414 14.2027 13.5881 14.6495L15.8548 16.9162C16.1477 17.2091 16.6226 17.2091 16.9155 16.9162C17.2084 16.6233 17.2084 16.1484 16.9155 15.8555L14.6487 13.5887C14.202 13.142 14.1723 12.4374 14.4664 11.8783C14.9159 11.0237 15.1703 10.0504 15.1703 9.01777C15.1703 5.61928 12.4153 2.86426 9.01679 2.86426Z"
              fill="#241F21"
            />
          </svg>
          <svg class="icon close" width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M5.53033 4.46967C5.23744 4.17678 4.76256 4.17678 4.46967 4.46967C4.17678 4.76256 4.17678 5.23744 4.46967 5.53033L8.05741 9.11807C8.54556 9.60623 8.54556 10.3977 8.05741 10.8858L4.47068 14.4726C4.17779 14.7655 4.17779 15.2403 4.47068 15.5332C4.76357 15.8261 5.23845 15.8261 5.53134 15.5332L9.11807 11.9465C9.60623 11.4583 10.3977 11.4583 10.8858 11.9465L14.4726 15.5332C14.7655 15.8261 15.2403 15.8261 15.5332 15.5332C15.8261 15.2403 15.8261 14.7655 15.5332 14.4726L11.9465 10.8858C11.4583 10.3977 11.4583 9.60623 11.9465 9.11807L15.5342 5.53033C15.8271 5.23744 15.8271 4.76256 15.5342 4.46967C15.2413 4.17678 14.7665 4.17678 14.4736 4.46967L10.8858 8.05741C10.3977 8.54556 9.60623 8.54557 9.11807 8.05741L5.53033 4.46967Z"
              fill="#241F21"
            />
          </svg>
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
