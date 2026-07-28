import "../../lib/lit-hydrate.js";
import { LitElement, css, html, nothing, unsafeCSS } from "lit";
import type { PropertyValues } from "lit";
import { customElement, property } from "lit/decorators.js";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";
import { ynClose20Svg } from "../../asset/svg";
import "../yn-icon-button/yn-icon-button.js";
import type { YnDrawerMotionController } from "./yn-drawer-motion.js";
import {
  resolveYnDrawerMotion,
  type YnDrawerMotionMode,
  type YnDrawerMotionProp
} from "./yn-drawer-motion-resolve.js";
import {
  createYnDrawerSheetExpand,
  type YnDrawerSheetExpandController,
  type YnDrawerSheetSize
} from "./yn-drawer-sheet-expand.js";
import { YN_DRAWER_SHADOW_STYLES } from "./yn-drawer-styles.js";

export type YnDrawerOpenChangeDetail = {
  open: boolean;
  source: YnDrawerLifecycleSource;
  payload?: unknown;
  triggerPayload?: unknown;
};

export type YnDrawerLifecycleSource =
  | "api"
  | "trigger"
  | "close-button"
  | "backdrop"
  | "escape"
  | "gesture"
  | "property";

export type YnDrawerLifecycleDetail = {
  open: boolean;
  source: YnDrawerLifecycleSource;
  payload?: unknown;
  triggerPayload?: unknown;
};

type LifecycleMeta = {
  source: YnDrawerLifecycleSource;
  payload?: unknown;
  triggerPayload?: unknown;
};

@customElement("yn-drawer")
export class YnDrawer extends LitElement {
  @property({ type: Boolean, reflect: true })
  get open() {
    return this._open;
  }

  set open(value: boolean) {
    const normalized = Boolean(value);
    const oldValue = this._open;
    if (oldValue === normalized) return;

    const meta =
      this.pendingActionMeta?.nextOpen === normalized
        ? this.pendingActionMeta
        : { nextOpen: normalized, source: "property" as const };
    this.pendingActionMeta = undefined;

    const ok = this.dispatchLifecycleEvent(normalized ? "before-open" : "before-close", {
      open: normalized,
      source: meta.source,
      payload: meta.payload,
      triggerPayload: meta.triggerPayload
    });
    if (!ok) return;

    this._open = normalized;
    this.pendingTransitionMeta = meta;
    this.requestUpdate("open", oldValue);
    this.flushOpenTransition();
  }

  @property({ type: Number })
  width = 420;

  @property({ type: String, attribute: "title" })
  title = "";

  @property({ type: Boolean, attribute: "close-on-backdrop" })
  closeOnBackdrop = true;

  @property({ type: Boolean, attribute: "hide-trigger", reflect: true })
  hideTrigger = false;

  @property({ type: String, reflect: true })
  placement: "auto" | "right" | "bottom" = "auto";

  @property({ type: String, reflect: true })
  motion: YnDrawerMotionProp = "auto";

  @property({ type: String, attribute: "sheet-expand", reflect: true })
  sheetExpand: "snap" | "none" = "snap";

  @property({ type: String, attribute: "sheet-height", reflect: true })
  sheetHeight = "100%";

  @property({ type: Number, attribute: "exit-speed" })
  exitSpeed = 1.5;

  @property({ type: Boolean, attribute: "ease-reverse" })
  easeReverse = true;

  private _open = false;
  private footerEmpty = true;
  private middleEmpty = true;
  private backdropExtraEmpty = true;

  private popoverEl: HTMLElement | null = null;
  private surfaceEl: HTMLElement | null = null;
  private backdropEl: HTMLElement | null = null;

  private motionController: YnDrawerMotionController | undefined;
  /** GSAP 懒加载；关闭态不拉取 gsap */
  private motionBoot: Promise<YnDrawerMotionController> | undefined;
  private lastAppliedMotionMode: YnDrawerMotionMode | undefined;
  private motionDirty = true;
  private sheetExpandController: YnDrawerSheetExpandController | undefined;
  private sheetExpandResizeObserver: ResizeObserver | undefined;
  private motionBreakpointQuery: MediaQueryList | undefined;
  private motionBreakpointUsesLegacyListener = false;
  /** 跟手下拉关闭动画已完成，退场走 immediate，避免再播一次 GSAP */
  private sheetDragSettledClose = false;

  private activeLifecycleMeta: LifecycleMeta = { source: "property" };
  private pendingActionMeta: (LifecycleMeta & { nextOpen: boolean }) | undefined;
  private pendingTransitionMeta: (LifecycleMeta & { nextOpen: boolean }) | undefined;

  static styles = css`
    ${unsafeCSS(YN_DRAWER_SHADOW_STYLES)}
  `;

  connectedCallback() {
    super.connectedCallback();
    this.bindMotionBreakpoint();
    this.syncSheetHeight();
    this.syncMotionHostAttrs();
  }

  disconnectedCallback() {
    this.unbindMotionBreakpoint();
    this.sheetExpandResizeObserver?.disconnect();
    this.sheetExpandResizeObserver = undefined;
    this.sheetExpandController?.dispose();
    this.sheetExpandController = undefined;
    this.motionController?.dispose();
    this.motionController = undefined;
    this.motionBoot = undefined;
    this.lastAppliedMotionMode = undefined;
    super.disconnectedCallback();
  }

  protected firstUpdated() {
    this.cacheEls();
    this.syncSlotEmptyStates();
    this.bindTriggerSlotClicks();
    this.syncPopoverState(true);
    // 插槽分配偶发滞后一帧
    queueMicrotask(() => {
      this.syncSlotEmptyStates();
      this.motionDirty = true;
    });
  }

  bootstrapFromDeclarativeShadow() {
    this.cacheEls();
    this.bindTriggerSlotClicks();
    queueMicrotask(() => this.bindTriggerSlotClicks());
    this.syncSlotEmptyStates();
    this.syncPopoverState(true);
    queueMicrotask(() => {
      this.syncSlotEmptyStates();
      this.motionDirty = true;
    });
  }

  protected updated(changed: PropertyValues) {
    if (changed.has("width")) {
      this.style.setProperty("--yn-drawer-width", `${Math.max(260, this.width)}px`);
    }
    if (changed.has("sheetHeight")) this.syncSheetHeight();
    if (changed.has("motion") || changed.has("placement") || changed.has("sheetExpand")) {
      this.onMotionConfigChange();
    } else if (changed.has("open")) {
      this.syncMotionHostAttrs();
    }
    if (changed.has("open")) this.pendingTransitionMeta = undefined;

    if (changed.has("exitSpeed") || changed.has("easeReverse")) {
      this.motionController?.setOptions({
        exitSpeed: this.exitSpeed,
        easeReverse: this.easeReverse
      });
    }
  }

  private cacheEls() {
    const root = this.shadowRoot;
    this.popoverEl = root?.querySelector("#drawerPopover") ?? null;
    this.surfaceEl = root?.querySelector(".drawer-surface") ?? null;
    this.backdropEl = root?.querySelector(".backdrop") ?? null;
  }

  private flushOpenTransition() {
    const meta = this.pendingTransitionMeta;
    if (!meta) return;
    this.pendingTransitionMeta = undefined;
    this.syncPopoverState(false, meta);
    this.emitOpenChange(meta);
  }

  private syncSheetHeight() {
    const value = (this.sheetHeight || "100%").trim();
    if (value.toLowerCase() === "auto") {
      this.style.removeProperty("--yn-drawer-sheet-height");
      return;
    }
    this.style.setProperty("--yn-drawer-sheet-height", value);
  }

  private syncMotionHostAttrs() {
    const mode = this.getResolvedMotion();
    this.setAttribute("data-yn-motion", mode);
    if (mode !== "sheet") {
      this.sheetExpandController?.setEnabled(false);
      this.removeAttribute("data-sheet-size");
      this.removeAttribute("data-sheet-can-expand");
      return;
    }
    if (!this.getAttribute("data-sheet-size")) {
      this.setAttribute("data-sheet-size", "peek");
    }
    this.syncSheetCanExpandAttr();
  }

  private syncSheetCanExpandAttr() {
    if (this.getResolvedMotion() !== "sheet" || this.sheetExpand !== "snap") {
      this.setAttribute("data-sheet-can-expand", "false");
      return;
    }
    const stack = this.shadowRoot?.querySelector<HTMLElement>(".drawer-stack");
    const body = this.shadowRoot?.querySelector<HTMLElement>(".body");
    if (!stack || !body) {
      this.setAttribute("data-sheet-can-expand", "false");
      return;
    }
    this.setAttribute(
      "data-sheet-can-expand",
      this.canExpandSheet(stack, body) ? "true" : "false"
    );
  }

  private bindMotionBreakpoint() {
    if (this.motionBreakpointQuery || typeof window.matchMedia !== "function") return;
    const query = window.matchMedia("(min-width: 1024px)");
    this.motionBreakpointQuery = query;
    if (typeof query.addEventListener === "function") {
      query.addEventListener("change", this.handleMotionBreakpointChange);
      return;
    }
    if (typeof query.addListener === "function") {
      query.addListener(this.handleMotionBreakpointChange);
      this.motionBreakpointUsesLegacyListener = true;
    }
  }

  private unbindMotionBreakpoint() {
    const query = this.motionBreakpointQuery;
    if (!query) return;
    if (this.motionBreakpointUsesLegacyListener) {
      query.removeListener?.(this.handleMotionBreakpointChange);
    } else {
      query.removeEventListener?.("change", this.handleMotionBreakpointChange);
    }
    this.motionBreakpointQuery = undefined;
    this.motionBreakpointUsesLegacyListener = false;
  }

  private handleMotionBreakpointChange = () => {
    this.onMotionConfigChange();
  };

  private ensureSheetExpandController() {
    if (this.sheetExpandController) return this.sheetExpandController;
    const stack = this.shadowRoot?.querySelector<HTMLElement>(".drawer-stack");
    const body = this.shadowRoot?.querySelector<HTMLElement>(".body");
    const header = this.shadowRoot?.querySelector<HTMLElement>(".header");
    const middle = this.shadowRoot?.querySelector<HTMLElement>(".panel--middle");
    const bottom = this.shadowRoot?.querySelector<HTMLElement>(".panel--bottom");
    if (!stack || !body || !header) return undefined;

    const chrome = [header, middle, bottom].filter(
      (el): el is HTMLElement =>
        el instanceof HTMLElement && !el.classList.contains("panel--empty")
    );
    const backdrop =
      this.backdropEl ?? this.shadowRoot?.querySelector<HTMLElement>(".backdrop");

    this.sheetExpandController = createYnDrawerSheetExpand({
      stack,
      body,
      chrome,
      backdrop,
      onSizeChange: (size) => {
        this.setAttribute("data-sheet-size", size);
        this.syncSheetCanExpandAttr();
      },
      onRequestClose: (options) => {
        if (options?.dragSettled) this.sheetDragSettledClose = true;
        this.setOpenWithMeta(false, { source: "gesture" });
      },
      canExpand: () => this.canExpandSheet(stack, body),
      getPeekHeightPx: () => this.resolveSheetPeekHeightPx(),
      getExpandedHeightPx: () => this.resolveSheetExpandedHeightPx()
    });
    this.sheetExpandController.setSize(
      this.getAttribute("data-sheet-size") === "expanded" ? "expanded" : "peek"
    );

    if (!this.sheetExpandResizeObserver && typeof ResizeObserver !== "undefined") {
      this.sheetExpandResizeObserver = new ResizeObserver(() => {
        this.syncSheetCanExpandAttr();
      });
      this.sheetExpandResizeObserver.observe(stack);
      this.sheetExpandResizeObserver.observe(body);
    }

    return this.sheetExpandController;
  }

  private canExpandSheet(stack: HTMLElement, _body: HTMLElement) {
    if (this.sheetExpand !== "snap") return false;
    if (this.getAttribute("data-sheet-size") === "expanded") return false;

    const expandedCap = this.resolveSheetExpandedHeightPx();
    if (expandedCap <= 0) return false;

    // 当前可视高度仍明显低于封顶 → 允许上滑展开（含空车矮内容）
    const current = stack.getBoundingClientRect().height;
    return current < expandedCap * 0.98;
  }

  private getSheetSurfaceAvailableHeightPx() {
    const surface =
      this.surfaceEl ?? this.shadowRoot?.querySelector<HTMLElement>(".drawer-surface");
    if (!(surface instanceof HTMLElement)) return 0;
    return Math.max(surface.clientHeight, 0);
  }

  private resolveSheetPeekHeightPx() {
    const raw = this.resolveCssLengthPx(
      getComputedStyle(this).getPropertyValue("--yn-drawer-sheet-peek-height").trim(),
      0.78
    );
    const available = this.getSheetSurfaceAvailableHeightPx();
    return available > 0 ? Math.min(raw, available) : raw;
  }

  private resolveSheetExpandedHeightPx() {
    const available = this.getSheetSurfaceAvailableHeightPx();
    const fromVar = getComputedStyle(this)
      .getPropertyValue("--yn-drawer-sheet-height")
      .trim();
    // 默认 / 100%：铺满 surface 内容区，上下空隙由 padding 负责
    if (!fromVar || fromVar === "100%") {
      if (available > 0) return available;
      return typeof window !== "undefined" ? window.innerHeight : 0;
    }
    const raw = this.resolveCssLengthPx(fromVar, 1);
    return available > 0 ? Math.min(raw, available) : raw;
  }

  private resolveCssLengthPx(value: string, fallbackVhRatio: number) {
    const raw = value.trim();
    if (!raw) {
      return typeof window !== "undefined"
        ? window.innerHeight * fallbackVhRatio
        : 0;
    }
    const amount = Number.parseFloat(raw);
    if (!Number.isFinite(amount)) {
      return typeof window !== "undefined"
        ? window.innerHeight * fallbackVhRatio
        : 0;
    }
    if (raw.endsWith("%")) {
      const available = this.getSheetSurfaceAvailableHeightPx();
      if (available > 0) return (available * amount) / 100;
      return typeof window !== "undefined"
        ? (window.innerHeight * amount) / 100
        : 0;
    }
    if (raw.endsWith("px")) return amount;
    if (raw.endsWith("vh") || raw.endsWith("dvh")) {
      return (window.innerHeight * amount) / 100;
    }
    return 0;
  }

  private syncSheetExpandEnabled() {
    const isSheet = this.getResolvedMotion() === "sheet";
    if (!isSheet || this.sheetExpand !== "snap") {
      this.sheetExpandController?.setEnabled(false);
      if (isSheet && this.sheetExpand === "none") this.setSheetSize("peek");
      return;
    }
    this.sheetExpandController?.setEnabled(true);
  }

  private attachSheetExpand() {
    const controller = this.ensureSheetExpandController();
    if (!controller) return;
    this.syncSheetCanExpandAttr();
    controller.setEnabled(
      this.getResolvedMotion() === "sheet" && this.sheetExpand === "snap"
    );
    controller.attach();
  }

  setSheetSize(size: YnDrawerSheetSize) {
    const isSheet = this.getResolvedMotion() === "sheet";
    const nextSize =
      isSheet && this.sheetExpand === "snap" ? size : ("peek" as const);
    if (isSheet) this.setAttribute("data-sheet-size", nextSize);
    else this.removeAttribute("data-sheet-size");
    this.sheetExpandController?.setSize(nextSize);
    this.syncSheetCanExpandAttr();
  }

  private emitOpenChange(meta: LifecycleMeta) {
    this.dispatchEvent(
      new CustomEvent<YnDrawerOpenChangeDetail>("open-change", {
        detail: {
          open: this.open,
          source: meta.source,
          payload: meta.payload,
          triggerPayload: meta.triggerPayload
        },
        bubbles: true,
        composed: true
      })
    );
  }

  private dispatchLifecycleEvent(
    name: "before-open" | "before-close",
    detail: YnDrawerLifecycleDetail
  ) {
    return this.dispatchEvent(
      new CustomEvent<YnDrawerLifecycleDetail>(name, {
        detail,
        bubbles: true,
        composed: true,
        cancelable: true
      })
    );
  }

  private emitLifecycleEvent(name: "after-open" | "after-close", detail: LifecycleMeta) {
    this.dispatchEvent(
      new CustomEvent<YnDrawerLifecycleDetail>(name, {
        detail: {
          open: this.open,
          source: detail.source,
          payload: detail.payload,
          triggerPayload: detail.triggerPayload
        },
        bubbles: true,
        composed: true
      })
    );
  }

  private collectMotionTargets() {
    const root = this.shadowRoot;
    const panels: HTMLElement[] = [];
    if (!root) {
      return { panels, reco: [] as HTMLElement[], recoRoot: null, stack: null };
    }

    const stack = root.querySelector<HTMLElement>(".drawer-stack");
    const top = root.querySelector<HTMLElement>(".panel--top");
    const middle = root.querySelector<HTMLElement>(".panel--middle");
    const bottom = root.querySelector<HTMLElement>(".panel--bottom");
    if (top) panels.push(top);
    if (middle && !middle.classList.contains("panel--empty")) panels.push(middle);
    if (bottom && !bottom.classList.contains("panel--empty")) panels.push(bottom);

    const recoRoot = root.querySelector<HTMLElement>(".backdrop-extra");
    if (!recoRoot || recoRoot.classList.contains("backdrop-extra--empty")) {
      return { panels, reco: [] as HTMLElement[], recoRoot: null, stack };
    }

    const slot = root.querySelector<HTMLSlotElement>('slot[name="backdrop-extra"]');
    const assigned = (slot?.assignedElements({ flatten: true }) ?? []).filter(
      (n): n is HTMLElement => n instanceof HTMLElement
    );

    return {
      panels,
      reco: collectRecoCards(assigned),
      recoRoot,
      stack
    };
  }

  getResolvedMotion(): YnDrawerMotionMode {
    const viewportWidth =
      typeof window !== "undefined" ? window.innerWidth : 1024;
    return resolveYnDrawerMotion({
      motion: this.motion,
      placement: this.placement,
      viewportWidth
    });
  }

  private onMotionConfigChange() {
    this.syncMotionHostAttrs();
    const nextMode = this.getResolvedMotion();
    if (this.lastAppliedMotionMode && this.lastAppliedMotionMode !== nextMode) {
      this.motionController?.dispose();
      this.motionController = undefined;
      this.motionBoot = undefined;
      this.lastAppliedMotionMode = undefined;
      this.motionDirty = true;

      if (this.open) {
        void this.ensureMotion().then((motion) => {
          if (motion && this.open && this.getResolvedMotion() === nextMode) {
            motion.seekOpenImmediate();
          }
        });
      }
    }
    this.syncSheetExpandEnabled();
  }

  private async ensureMotion() {
    if (this.motionController) {
      if (this.motionDirty) {
        this.motionController.setTargets(this.collectMotionTargets());
        this.motionDirty = false;
      }
      return this.motionController;
    }

    if (!this.motionBoot) {
      const surface = this.surfaceEl ?? this.shadowRoot?.querySelector(".drawer-surface");
      const backdrop = this.backdropEl ?? this.shadowRoot?.querySelector(".backdrop");
      if (!(surface instanceof HTMLElement) || !(backdrop instanceof HTMLElement)) {
        return undefined;
      }

      this.surfaceEl = surface;
      this.backdropEl = backdrop;
      const mode = this.getResolvedMotion();
      this.lastAppliedMotionMode = mode;

      this.motionBoot = import("./yn-drawer-motion.js").then(({ createYnDrawerMotion }) => {
        this.motionController = createYnDrawerMotion(
          surface,
          backdrop,
          this.collectMotionTargets(),
          {
            onEnterComplete: () => {
              this.attachSheetExpand();
              this.emitLifecycleEvent("after-open", this.activeLifecycleMeta);
            },
            onExitComplete: () => {
              this.sheetExpandController?.detach();
              if (this.popoverEl?.matches(":popover-open")) {
                this.popoverEl.hidePopover();
              }
              this.setSheetSize("peek");
              this.emitLifecycleEvent("after-close", this.activeLifecycleMeta);
            }
          },
          {
            exitSpeed: this.exitSpeed,
            easeReverse: this.easeReverse,
            mode
          }
        );
        this.motionDirty = false;
        return this.motionController;
      });
    }

    return this.motionBoot;
  }

  private syncPopoverState(initial: boolean, meta: LifecycleMeta = { source: "property" }) {
    if (!this.popoverEl) this.cacheEls();
    const popoverEl = this.popoverEl;
    if (!popoverEl) return;

    if (initial) {
      this.style.setProperty("--yn-drawer-width", `${Math.max(260, this.width)}px`);
    }

    this.activeLifecycleMeta = meta;
    if (this.open) {
      void this.showDrawerPopover(initial, meta);
      return;
    }
    this.hideDrawerPopover(initial, meta);
  }

  private async showDrawerPopover(initial: boolean, meta: LifecycleMeta) {
    const popoverEl = this.popoverEl;
    if (!popoverEl) return;
    this.activeLifecycleMeta = meta;

    if (!popoverEl.matches(":popover-open")) {
      popoverEl.showPopover();
    }

    const motion = await this.ensureMotion();
    if (!motion || !this.open) return;

    if (initial) motion.seekOpenImmediate();
    else motion.open();
  }

  private hideDrawerPopover(immediate: boolean, meta: LifecycleMeta) {
    this.sheetExpandController?.detach();
    const popoverEl = this.popoverEl;
    if (!popoverEl || !popoverEl.matches(":popover-open")) return;

    this.activeLifecycleMeta = meta;
    const skipExitMotion = immediate || this.sheetDragSettledClose;
    this.sheetDragSettledClose = false;

    if (skipExitMotion) {
      popoverEl.hidePopover();
      this.motionController?.dispose();
      this.motionController = undefined;
      this.motionBoot = undefined;
      this.lastAppliedMotionMode = undefined;
      this.motionDirty = true;
      this.setSheetSize("peek");
      this.emitLifecycleEvent("after-close", meta);
      return;
    }

    if (this.motionController) {
      this.motionController.close();
      return;
    }

    // 动画模块尚未加载完就关闭：直接收起
    popoverEl.hidePopover();
    this.emitLifecycleEvent("after-close", meta);
  }

  private setOpenWithMeta(nextOpen: boolean, meta: LifecycleMeta) {
    this.pendingActionMeta = { nextOpen, ...meta };
    this.open = nextOpen;
  }

  private bindTriggerSlotClicks() {
    const slot = this.shadowRoot?.querySelector<HTMLSlotElement>('slot[name="trigger"]');
    if (!slot) return;

    const bind = () => {
      for (const el of slot.assignedElements({ flatten: true })) {
        if (!(el instanceof HTMLElement) || el.dataset.ynDrawerTriggerBound === "1") continue;
        el.dataset.ynDrawerTriggerBound = "1";
        el.addEventListener("click", (event) => {
          event.stopPropagation();
          this.handleTriggerClick();
        });
      }
    };

    bind();
    slot.addEventListener("slotchange", bind);
  }

  private getTriggerPayload() {
    const slot = this.shadowRoot?.querySelector<HTMLSlotElement>('slot[name="trigger"]');
    const triggerEl = slot?.assignedElements({ flatten: true })[0] as
      | (HTMLElement & { drawerLifecyclePayload?: unknown })
      | undefined;
    if (!triggerEl) return undefined;
    if (triggerEl.drawerLifecyclePayload !== undefined) {
      return triggerEl.drawerLifecyclePayload;
    }
    const raw =
      triggerEl.getAttribute("drawer-payload") ??
      triggerEl.getAttribute("trigger-payload") ??
      triggerEl.getAttribute("data-drawer-payload");
    if (raw == null || raw === "") return undefined;
    try {
      return JSON.parse(raw);
    } catch {
      return raw;
    }
  }

  close(payload?: unknown) {
    if (!this.open) return;
    this.setOpenWithMeta(false, { source: "api", payload });
  }

  show(payload?: unknown) {
    if (this.open) return;
    this.setOpenWithMeta(true, { source: "api", payload });
  }

  toggle(payload?: unknown) {
    this.setOpenWithMeta(!this.open, { source: "api", payload });
  }

  private handleTriggerClick = () => {
    this.setOpenWithMeta(!this.open, {
      source: "trigger",
      triggerPayload: this.getTriggerPayload()
    });
  };

  private handleCloseClick = () => {
    this.setOpenWithMeta(false, { source: "close-button" });
  };

  private handleBackdropClick = () => {
    if (!this.closeOnBackdrop) return;
    this.setOpenWithMeta(false, { source: "backdrop" });
  };

  private handleEscape = (event: KeyboardEvent) => {
    if (event.key !== "Escape" || !this.open) return;
    event.stopPropagation();
    this.setOpenWithMeta(false, { source: "escape" });
  };

  private slotHasContent(name: string) {
    const slot = this.shadowRoot?.querySelector<HTMLSlotElement>(`slot[name="${name}"]`);
    if (!slot) return false;
    return slot.assignedNodes({ flatten: true }).some((node) => {
      if (node.nodeType === Node.TEXT_NODE) return Boolean(node.textContent?.trim());
      return node.nodeType === Node.ELEMENT_NODE;
    });
  }

  private syncSlotEmptyStates() {
    this.footerEmpty = !this.slotHasContent("footer");
    this.middleEmpty = !this.slotHasContent("middle");
    this.backdropExtraEmpty = !this.slotHasContent("backdrop-extra");

    this.shadowRoot
      ?.querySelector(".panel--bottom")
      ?.classList.toggle("panel--empty", this.footerEmpty);
    this.shadowRoot
      ?.querySelector(".panel--middle")
      ?.classList.toggle("panel--empty", this.middleEmpty);
    this.shadowRoot
      ?.querySelector(".backdrop-extra")
      ?.classList.toggle("backdrop-extra--empty", this.backdropExtraEmpty);
  }

  private onMotionSlotChange = (name: "footer" | "middle" | "backdrop-extra") => {
    if (name === "footer") this.footerEmpty = !this.slotHasContent("footer");
    if (name === "middle") this.middleEmpty = !this.slotHasContent("middle");
    if (name === "backdrop-extra") {
      this.backdropExtraEmpty = !this.slotHasContent("backdrop-extra");
    }

    if (name === "footer") {
      this.shadowRoot
        ?.querySelector(".panel--bottom")
        ?.classList.toggle("panel--empty", this.footerEmpty);
    } else if (name === "middle") {
      this.shadowRoot
        ?.querySelector(".panel--middle")
        ?.classList.toggle("panel--empty", this.middleEmpty);
    } else {
      this.shadowRoot
        ?.querySelector(".backdrop-extra")
        ?.classList.toggle("backdrop-extra--empty", this.backdropExtraEmpty);
    }

    this.motionDirty = true;
    // 仅打开时同步目标，避免关闭态反复 rebuild
    if (this.open && this.motionController) {
      this.motionController.setTargets(this.collectMotionTargets());
      this.motionDirty = false;
    }
  };

  render() {
    return html`
      <span class="trigger-wrap" ?hidden=${this.hideTrigger} @click=${this.handleTriggerClick}>
        <slot name="trigger">
          ${this.hideTrigger
            ? nothing
            : html`<button class="trigger-btn" type="button">Open drawer</button>`}
        </slot>
      </span>
      <div
        id="drawerPopover"
        class="drawer-popover"
        popover="manual"
        @keydown=${this.handleEscape}
      >
        <div class="drawer-surface">
          <div class="backdrop" @click=${this.handleBackdropClick}></div>
          <div
            class="backdrop-extra ${this.backdropExtraEmpty ? "backdrop-extra--empty" : ""}"
            @click=${(event: Event) => event.stopPropagation()}
          >
            <slot
              name="backdrop-extra"
              @slotchange=${() => this.onMotionSlotChange("backdrop-extra")}
            ></slot>
          </div>

          <div class="drawer-stack">
            <aside
              class="panel panel--top"
              role="dialog"
              aria-modal="true"
              aria-label=${this.title || "Drawer"}
              @click=${(event: Event) => event.stopPropagation()}
            >
              <header class="header">
                <div class="header-main">
                  <slot name="header">
                    <h2 class="title">${this.title}</h2>
                  </slot>
                </div>
                <div class="header-actions">
                  <slot name="header-actions"></slot>
                </div>
                <yn-icon-button
                  class="close-btn"
                  size="small"
                  label="Close drawer"
                  @click=${this.handleCloseClick}
                >
                  ${unsafeSVG(ynClose20Svg)}
                </yn-icon-button>
              </header>
                <div class="body">
                <slot
                  name="content"
                  @slotchange=${() => this.syncSheetCanExpandAttr()}
                ></slot>
              </div>
            </aside>

            <div
              class="panel panel--middle ${this.middleEmpty ? "panel--empty" : ""}"
              @click=${(event: Event) => event.stopPropagation()}
            >
              <slot name="middle" @slotchange=${() => this.onMotionSlotChange("middle")}></slot>
            </div>

            <footer
              class="panel panel--bottom ${this.footerEmpty ? "panel--empty" : ""}"
              @click=${(event: Event) => event.stopPropagation()}
            >
              <slot name="footer" @slotchange=${() => this.onMotionSlotChange("footer")}></slot>
            </footer>
          </div>
        </div>
      </div>
    `;
  }
}

function collectRecoCards(assigned: HTMLElement[]) {
  if (!assigned.length) return [] as HTMLElement[];
  if (assigned.length > 1) return assigned;

  const host = assigned[0];
  const marked = host.querySelectorAll<HTMLElement>("[data-yn-drawer-reco]");
  if (marked.length) return Array.from(marked);

  const articles = host.querySelectorAll<HTMLElement>("article");
  if (articles.length) return Array.from(articles);

  const kids = Array.from(host.children).filter(
    (n): n is HTMLElement => n instanceof HTMLElement
  );
  const row = kids.find((el) => el.children.length > 1);
  if (row) {
    return Array.from(row.children).filter((n): n is HTMLElement => n instanceof HTMLElement);
  }
  return kids;
}

declare global {
  interface HTMLElementTagNameMap {
    "yn-drawer": YnDrawer;
  }
}
