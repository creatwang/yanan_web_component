import { LitElement, css, html, unsafeCSS } from "lit";
import type { PropertyValues } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";
import { ynSearchCloseSvg, ynSearchSvg } from "../../asset/svg";
import { applyLitDsd, dedupeShadowDsdContent, ensureRenderRoot } from "../../lib/lit-dsd.js";
import {
  getSearchDynamicWidth,
  getSearchRectEndOpen,
  SEARCH_SHAPE_RECT_START_CLOSED,
  SEARCH_SHAPE_RECT_START_OPEN,
  SearchShapeEngine,
  type SearchShapeDomRefs,
  type SearchShapeLayout,
} from "./search-shape-engine.js";
import { YN_SEARCH_SHADOW_STYLES } from "./yn-search-styles.js";

export type YnSearchExpandDirection = "left" | "right";

const YN_SEARCH_DSD_DEDUPE = ["#searchShell"] as const;

@customElement("yn-search")
export class YnSearch extends LitElement {
  /** true：有值时首次点击仅清空并派发 input，再次点击才收起；false：点击即清空并收起。 */
  @property({ type: Boolean, reflect: true }) close = true;
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ type: String }) placeholder = "O que estás à procura?";
  @property({ type: Number, attribute: "input-width" }) inputWidth = 514;
  @property({ type: String, attribute: "expand-direction", reflect: true })
  expandDirection: YnSearchExpandDirection = "right";
  /** 是否默认展开。true：初始即为展开态（无入场动画）；false：初始收起。 */
  @property({ type: Boolean, reflect: true }) open = false;

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

  private readonly shapeEngine = new SearchShapeEngine();
  private ready = false;
  private datalistObserver: MutationObserver | null = null;
  private observedDatalist: HTMLDataListElement | null = null;
  private runtimeShellWidth: number | null = null;

  static styles = css`
    ${unsafeCSS(YN_SEARCH_SHADOW_STYLES)}
  `;

  private get shapeLayout(): SearchShapeLayout {
    return {
      expandLeft: this.expandDirection === "left",
      inputWidth: this.inputWidth,
    };
  }

  private get dynamicWidth() {
    return getSearchDynamicWidth(this.inputWidth);
  }

  private get rectEndOpen() {
    return getSearchRectEndOpen(this.inputWidth);
  }

  private get isExpandLeft() {
    return this.expandDirection === "left";
  }

  private get shellWidth() {
    if (this.runtimeShellWidth !== null) return this.runtimeShellWidth;
    if (this.open && !this.animating) {
      return SEARCH_SHAPE_RECT_START_CLOSED + this.dynamicWidth;
    }
    return SEARCH_SHAPE_RECT_START_CLOSED;
  }

  private getShapeRefs(): SearchShapeDomRefs | null {
    if (!this.ensureDsdRefs()) return null;
    return {
      bridgeEl: this.bridgeEl,
      rect1El: this.rect1El,
      dynamicWrapEl: this.dynamicWrapEl,
      inputEl: this.inputEl,
      shellEl: this.shellEl,
    };
  }

  connectedCallback() {
    super.connectedCallback();
    this.onToggle = this.onToggle.bind(this);
    this.onInput = this.onInput.bind(this);
    this.onInputKeydown = this.onInputKeydown.bind(this);
  }

  disconnectedCallback() {
    this.shapeEngine.stop();
    this.observeSourceDatalist(null);
    super.disconnectedCallback();
  }

  protected firstUpdated() {
    const refs = this.getShapeRefs();
    if (this.open && refs) {
      this.shapeEngine.applyShape(refs, this.shapeLayout, 1);
      this.shapeEngine.syncInputToShape(refs, this.shapeLayout, 1, true, this.rectEndOpen - SEARCH_SHAPE_RECT_START_OPEN);
      this.syncShellDom();
    } else if (refs) {
      refs.bridgeEl.setAttribute("d", "");
      refs.rect1El.setAttribute("d", "");
    }
    if (this.value) this.inputEl.value = this.value;
    this.syncDatalistFromSlot();
  }

  private getFieldValue() {
    return this.inputEl?.value ?? this.value;
  }

  private setFieldValue(next: string) {
    this.value = next;
    if (this.inputEl) this.inputEl.value = next;
  }

  bootstrapFromDeclarativeShadow() {
    const root = this.shadowRoot;
    if (!root) return;
    dedupeShadowDsdContent(root, [...YN_SEARCH_DSD_DEDUPE]);
    ensureRenderRoot(this);
    this.ensureDsdRefs();
    root.querySelector("#bridge")?.setAttribute("d", "");
    root.querySelector("#rect1")?.setAttribute("d", "");
    const toggleBtn = root.querySelector("#toggleBtn");
    const inputEl = root.querySelector<HTMLInputElement>("#searchInput");
    if (toggleBtn) toggleBtn.replaceWith(toggleBtn.cloneNode(true));
    if (inputEl) inputEl.replaceWith(inputEl.cloneNode(true));
    this.shellEl = root.querySelector("#searchShell") as HTMLDivElement;
    this.dynamicWrapEl = root.querySelector("#dynamicWrap") as HTMLDivElement;
    this.shapeEl = root.querySelector("#shape") as SVGSVGElement;
    this.leftShapeEl = root.querySelector("#leftShape") as SVGSVGElement;
    this.bridgeEl = root.querySelector("#bridge") as SVGPathElement;
    this.rect1El = root.querySelector("#rect1") as SVGPathElement;
    this.inputEl = root.querySelector("#searchInput") as HTMLInputElement;
    this.datalistSlotEl = root.querySelector("#datalistSlot") as HTMLSlotElement;
    this.internalDatalistEl = root.querySelector("#internalDatalist") as HTMLDataListElement;
    if (this.value && this.inputEl) this.inputEl.value = this.value;
    root.querySelector("#toggleBtn")?.addEventListener("click", this.onToggle);
    this.inputEl?.addEventListener("input", this.onInput);
    this.inputEl?.addEventListener("keydown", this.onInputKeydown);
    root.querySelector("#datalistSlot")?.addEventListener("slotchange", this.onDatalistSlotChange);
    this.syncDatalistFromSlot();
    const refs = this.getShapeRefs();
    if (this.open && refs) {
      this.shapeEngine.applyShape(refs, this.shapeLayout, 1);
      this.shapeEngine.syncInputToShape(refs, this.shapeLayout, 1, true, this.rectEndOpen - SEARCH_SHAPE_RECT_START_OPEN);
    }
    this.syncShellDom();
    this.ready = true;
  }

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
    this.shellEl.classList.toggle("layout-expanding", this.animating && this.open);
    this.shellEl.classList.toggle("expand-left", this.isExpandLeft);
    this.shellEl.classList.toggle("expand-right", !this.isExpandLeft);
    const width = `${this.shellWidth}px`;
    this.shellEl.style.width = width;
    this.style.width = width;
    if (this.isExpandLeft) {
      this.style.marginLeft = "auto";
    } else {
      this.style.removeProperty("margin-left");
    }
    const toggleBtn = this.shadowRoot?.querySelector("#toggleBtn");
    toggleBtn?.setAttribute("aria-label", this.open ? "close search" : "open search");
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
    if (!this.ready) {
      this.ready = true;
      return;
    }
    if (changed.has("expandDirection")) {
      if (this.expandDirection !== "left" && this.expandDirection !== "right") {
        this.expandDirection = "right";
      }
      this.syncShellDom();
    }
    if (changed.has("inputWidth")) {
      const refs = this.getShapeRefs();
      if (this.open && refs) {
        this.shapeEngine.applyShape(refs, this.shapeLayout, 1);
        this.shapeEngine.syncInputToShape(refs, this.shapeLayout, 1, true, this.rectEndOpen - SEARCH_SHAPE_RECT_START_OPEN);
        this.syncShellDom();
      }
    }
    if (changed.has("open") && !this.animating && changed.get("open") !== undefined) {
      const refs = this.getShapeRefs();
      if (!refs) return;
      if (this.open) {
        this.shapeEngine.applyShape(refs, this.shapeLayout, 1);
        this.shapeEngine.syncInputToShape(refs, this.shapeLayout, 1, true, this.rectEndOpen - SEARCH_SHAPE_RECT_START_OPEN);
      } else {
        refs.bridgeEl.setAttribute("d", "");
        refs.rect1El.setAttribute("d", "");
        this.shapeEngine.clearDynamicWrapInlineStyles(refs);
      }
      this.syncShellDom();
    }
  }

  private animateShape(opening: boolean) {
    const refs = this.getShapeRefs();
    if (!refs) return;
    this.shapeEngine.animate(refs, this.shapeLayout, opening, {
      onStart: (runtimeShellWidth) => {
        this.runtimeShellWidth = runtimeShellWidth;
        this.animating = true;
        this.syncShellDom();
      },
      onFrame: (runtimeShellWidth, layoutExpanding) => {
        this.runtimeShellWidth = runtimeShellWidth;
        if (layoutExpanding) {
          refs.shellEl.classList.add("layout-expanding");
        }
        this.syncShellDom();
      },
      onComplete: () => {
        this.runtimeShellWidth = null;
        this.animating = false;
        this.syncShellDom();
      },
    });
  }

  private onInput(event: Event) {
    this.setFieldValue((event.target as HTMLInputElement).value);
    this.dispatchInputEvent();
  }

  private dispatchInputEvent() {
    this.dispatchEvent(
      new CustomEvent("input", {
        detail: { value: this.value },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private onInputKeydown(event: KeyboardEvent) {
    if (event.key !== "Enter") return;
    event.preventDefault();
    const value = this.getFieldValue();
    if (value !== this.value) this.setFieldValue(value);
    this.dispatchEvent(
      new CustomEvent("enter", {
        detail: { value },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private beginAnimatedToggle(opening: boolean) {
    this.shapeEngine.stop();
    this.runtimeShellWidth = opening ? SEARCH_SHAPE_RECT_START_CLOSED : this.rectEndOpen;
    this.animating = true;
    this.open = opening;
    this.syncShellDom();
    this.animateShape(opening);
  }

  private onToggle() {
    if (this.disabled) return;
    if (!this.open) {
      if (this.getShapeRefs()) {
        this.beginAnimatedToggle(true);
      } else {
        this.open = true;
      }
      setTimeout(() => this.inputEl?.focus(), 180);
      return;
    }

    if (this.close) {
      if (this.getFieldValue()) {
        this.setFieldValue("");
        this.dispatchInputEvent();
        this.inputEl?.focus();
        return;
      }
      if (this.getShapeRefs()) {
        this.beginAnimatedToggle(false);
      } else {
        this.open = false;
      }
      return;
    }

    if (this.getFieldValue()) {
      this.setFieldValue("");
      this.dispatchInputEvent();
    }
    if (this.getShapeRefs()) {
      this.beginAnimatedToggle(false);
    } else {
      this.open = false;
    }
  }

  render() {
    return html`
      <div
        id="searchShell"
        class=${`search-shell expand-${this.isExpandLeft ? "left" : "right"}${this.open ? " open" : ""}${this.animating ? " animating" : ""}`}
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

applyLitDsd(YnSearch, "#searchShell", (el) => el.bootstrapFromDeclarativeShadow(), {
  dedupe: [...YN_SEARCH_DSD_DEDUPE],
});
