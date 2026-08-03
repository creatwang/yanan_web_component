import "../../lib/lit-hydrate.js";
import { LitElement, css, html, nothing, unsafeCSS } from "lit";
import type { PropertyValues } from "lit";
import { customElement, property } from "lit/decorators.js";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";
import { ynClose20Svg } from "../../asset/svg";
import "../yn-icon-button/yn-icon-button.js";
import {
  createYnDrawerAnimator,
  type YnDrawerAnimator,
} from "./yn-drawer-animate.js";
import {
  resolveYnDrawerMotion,
  type YnDrawerMotionMode,
  type YnDrawerMotionProp,
} from "./yn-drawer-motion-resolve.js";
import {
  YN_DRAWER_GLOBAL_STYLES,
  YN_DRAWER_SHADOW_STYLES,
} from "./yn-drawer-styles.js";

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

let globalStylesInjected = false;
let scrollLockCount = 0;

function ensureGlobalStyles() {
  if (globalStylesInjected || typeof document === "undefined") return;
  globalStylesInjected = true;
  const style = document.createElement("style");
  style.setAttribute("data-yn-drawer", "");
  style.textContent = YN_DRAWER_GLOBAL_STYLES;
  document.head.appendChild(style);
}

function lockHostScroll() {
  scrollLockCount += 1;
  if (scrollLockCount !== 1) return;
  document.documentElement.classList.add("yn-drawer-scroll-locked");
  document.dispatchEvent(
    new CustomEvent("yn-drawer-scroll-lock", {
      bubbles: true,
      detail: { locked: true },
    }),
  );
}

function unlockHostScroll() {
  if (scrollLockCount <= 0) return;
  scrollLockCount -= 1;
  if (scrollLockCount > 0) return;
  document.documentElement.classList.remove("yn-drawer-scroll-locked");
  document.dispatchEvent(
    new CustomEvent("yn-drawer-scroll-lock", {
      bubbles: true,
      detail: { locked: false },
    }),
  );
}

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
      triggerPayload: meta.triggerPayload,
    });
    if (!ok) return;

    this._open = normalized;
    this.pendingTransitionMeta = meta;
    this.requestUpdate("open", oldValue);
    void this.flushTransition();
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

  @property({ type: String, attribute: "sheet-height", reflect: true })
  sheetHeight = "100%";

  @property({ type: Number, attribute: "exit-speed" })
  exitSpeed = 1.5;

  @property({ type: Boolean, attribute: "ease-reverse" })
  easeReverse = true;

  private _open = false;
  private layerVisible = false;
  private footerEmpty = true;
  private middleEmpty = true;
  private backdropExtraEmpty = true;
  private skipInitialAnimation = false;

  private layerEl: HTMLElement | null = null;
  private surfaceEl: HTMLElement | null = null;
  private backdropEl: HTMLElement | null = null;
  private animator: YnDrawerAnimator | undefined;
  private lastAppliedMotionMode: YnDrawerMotionMode | undefined;

  private motionBreakpointQuery: MediaQueryList | undefined;
  private motionBreakpointUsesLegacyListener = false;

  private activeLifecycleMeta: LifecycleMeta = { source: "property" };
  private pendingActionMeta: (LifecycleMeta & { nextOpen: boolean }) | undefined;
  private pendingTransitionMeta: (LifecycleMeta & { nextOpen: boolean }) | undefined;

  static styles = css`
    ${unsafeCSS(YN_DRAWER_SHADOW_STYLES)}
  `;

  connectedCallback() {
    super.connectedCallback();
    ensureGlobalStyles();
    this.bindMotionBreakpoint();
    this.syncSheetHeight();
    this.syncMotionHostAttrs();
    this.skipInitialAnimation = this.hasAttribute("open");
  }

  disconnectedCallback() {
    this.unbindMotionBreakpoint();
    if (this._open) {
      this._open = false;
      this.layerVisible = false;
      unlockHostScroll();
    }
    this.animator?.dispose();
    this.animator = undefined;
    this.lastAppliedMotionMode = undefined;
    super.disconnectedCallback();
  }

  protected firstUpdated() {
    this.cacheEls();
    this.syncSlotEmptyStates();
    this.bindTriggerSlotClicks();
    this.ensureAnimator();
    queueMicrotask(() => {
      this.syncSlotEmptyStates();
      this.refreshAnimatorTargets();
    });

    if (this._open && !this.layerVisible && !this.pendingTransitionMeta) {
      const meta = { source: "property" as const };
      this.activeLifecycleMeta = meta;
      this.emitOpenChange(meta);
      void this.presentOpen(this.skipInitialAnimation, meta);
      this.skipInitialAnimation = false;
    }
  }

  bootstrapFromDeclarativeShadow() {
    this.cacheEls();
    this.bindTriggerSlotClicks();
    queueMicrotask(() => this.bindTriggerSlotClicks());
    this.syncSlotEmptyStates();
    this.ensureAnimator();
    queueMicrotask(() => {
      this.syncSlotEmptyStates();
      this.refreshAnimatorTargets();
    });
  }

  protected updated(changed: PropertyValues) {
    if (changed.has("width")) {
      this.style.setProperty("--yn-drawer-width", `${Math.max(260, this.width)}px`);
    }
    if (changed.has("sheetHeight")) this.syncSheetHeight();
    if (changed.has("motion") || changed.has("placement")) {
      this.onMotionConfigChange();
    } else if (changed.has("open")) {
      this.syncMotionHostAttrs();
    }
    if (changed.has("exitSpeed") || changed.has("easeReverse")) {
      this.animator?.setOptions({
        exitSpeed: this.exitSpeed,
        easeReverse: this.easeReverse,
      });
    }
  }

  private cacheEls() {
    const root = this.shadowRoot;
    this.layerEl = root?.querySelector(".drawer-layer") ?? null;
    this.surfaceEl = root?.querySelector(".drawer-surface") ?? null;
    this.backdropEl = root?.querySelector(".backdrop") ?? null;
  }

  private async flushTransition() {
    const meta = this.pendingTransitionMeta;
    if (!meta) return;
    this.pendingTransitionMeta = undefined;
    this.activeLifecycleMeta = meta;
    this.emitOpenChange(meta);

    if (this.open) {
      await this.presentOpen(this.skipInitialAnimation, meta);
    } else {
      await this.presentClose(this.skipInitialAnimation, meta);
    }
    this.skipInitialAnimation = false;
  }

  private ensureAnimator() {
    if (this.animator) return this.animator;
    const surface = this.surfaceEl;
    const backdrop = this.backdropEl;
    if (!(surface instanceof HTMLElement) || !(backdrop instanceof HTMLElement)) {
      return undefined;
    }

    const mode = this.getResolvedMotion();
    this.lastAppliedMotionMode = mode;
    this.animator = createYnDrawerAnimator(
      surface,
      backdrop,
      this.collectMotionTargets(),
      {
        onEnterComplete: () => {
          this.emitLifecycleEvent("after-open", this.activeLifecycleMeta);
        },
        onExitComplete: () => {
          this.layerVisible = false;
          this.requestUpdate();
          unlockHostScroll();
          this.emitLifecycleEvent("after-close", this.activeLifecycleMeta);
        },
      },
      {
        exitSpeed: this.exitSpeed,
        easeReverse: this.easeReverse,
        mode,
      },
    );
    return this.animator;
  }

  private refreshAnimatorTargets() {
    this.animator?.setTargets(this.collectMotionTargets());
  }

  private async presentOpen(initial: boolean, meta: LifecycleMeta) {
    this.activeLifecycleMeta = meta;

    if (!this.surfaceEl) {
      await this.updateComplete;
      this.cacheEls();
    }

    const animator = this.ensureAnimator();
    if (!animator) return;

    animator.setOptions({
      exitSpeed: this.exitSpeed,
      easeReverse: this.easeReverse,
      mode: this.getResolvedMotion(),
    });
    animator.setTargets(this.collectMotionTargets());

    this.layerVisible = true;
    await this.updateComplete;

    lockHostScroll();

    if (initial) {
      animator.seekOpenImmediate();
      this.emitLifecycleEvent("after-open", meta);
      return;
    }

    animator.open();
  }

  private async presentClose(initial: boolean, meta: LifecycleMeta) {
    this.activeLifecycleMeta = meta;

    if (initial || !this.animator) {
      this.layerVisible = false;
      await this.updateComplete;
      unlockHostScroll();
      this.emitLifecycleEvent("after-close", meta);
      return;
    }

    this.animator.close();
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
    this.setAttribute("data-yn-motion", this.getResolvedMotion());
  }

  private bindMotionBreakpoint() {
    if (this.motionBreakpointQuery || typeof window.matchMedia !== "function") return;
    const query = window.matchMedia("(min-width: 1024px)");
    this.motionBreakpointQuery = query;
    if (typeof query.addEventListener === "function") {
      query.addEventListener("change", this.handleMotionMediaChange);
      return;
    }
    if (typeof query.addListener === "function") {
      query.addListener(this.handleMotionMediaChange);
      this.motionBreakpointUsesLegacyListener = true;
    }
  }

  private unbindMotionBreakpoint() {
    const query = this.motionBreakpointQuery;
    if (!query) return;
    if (this.motionBreakpointUsesLegacyListener) {
      query.removeListener?.(this.handleMotionMediaChange);
    } else {
      query.removeEventListener?.("change", this.handleMotionMediaChange);
    }
    this.motionBreakpointQuery = undefined;
    this.motionBreakpointUsesLegacyListener = false;
  }

  private handleMotionMediaChange = () => {
    this.onMotionConfigChange();
  };

  private emitOpenChange(meta: LifecycleMeta) {
    this.dispatchEvent(
      new CustomEvent<YnDrawerOpenChangeDetail>("open-change", {
        detail: {
          open: this.open,
          source: meta.source,
          payload: meta.payload,
          triggerPayload: meta.triggerPayload,
        },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private dispatchLifecycleEvent(
    name: "before-open" | "before-close",
    detail: YnDrawerLifecycleDetail,
  ) {
    return this.dispatchEvent(
      new CustomEvent<YnDrawerLifecycleDetail>(name, {
        detail,
        bubbles: true,
        composed: true,
        cancelable: true,
      }),
    );
  }

  private emitLifecycleEvent(name: "after-open" | "after-close", detail: LifecycleMeta) {
    this.dispatchEvent(
      new CustomEvent<YnDrawerLifecycleDetail>(name, {
        detail: {
          open: this.open,
          source: detail.source,
          payload: detail.payload,
          triggerPayload: detail.triggerPayload,
        },
        bubbles: true,
        composed: true,
      }),
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
      (n): n is HTMLElement => n instanceof HTMLElement,
    );

    return {
      panels,
      reco: collectRecoCards(assigned),
      recoRoot,
      stack,
    };
  }

  getResolvedMotion(): YnDrawerMotionMode {
    const viewportWidth =
      typeof window !== "undefined" ? window.innerWidth : 1024;
    return resolveYnDrawerMotion({
      motion: this.motion,
      placement: this.placement,
      viewportWidth,
    });
  }

  private onMotionConfigChange() {
    this.syncMotionHostAttrs();
    const nextMode = this.getResolvedMotion();
    if (this.lastAppliedMotionMode && this.lastAppliedMotionMode !== nextMode) {
      this.animator?.dispose();
      this.animator = undefined;
      this.lastAppliedMotionMode = undefined;

      if (this.open) {
        this.ensureAnimator();
        this.animator?.seekOpenImmediate();
        this.emitLifecycleEvent("after-open", this.activeLifecycleMeta);
      }
    } else {
      this.animator?.setOptions({ mode: nextMode });
    }
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
      triggerPayload: this.getTriggerPayload(),
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
      if (node.nodeType !== Node.ELEMENT_NODE) return false;
      const el = node as HTMLElement;
      return !el.hidden && !el.hasAttribute("hidden");
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

  private onSlotChange = (name: "footer" | "middle" | "backdrop-extra") => {
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

    if (this.open) this.refreshAnimatorTargets();
  };

  render() {
    return html`
      <span
        class="trigger-wrap"
        ?hidden=${this.hideTrigger}
        @click=${this.handleTriggerClick}
      >
        <slot name="trigger">
          ${this.hideTrigger
            ? nothing
            : html`<button class="trigger-btn" type="button">Open drawer</button>`}
        </slot>
      </span>

      <div
        class="drawer-layer"
        ?hidden=${!this.layerVisible}
        aria-hidden=${this.layerVisible ? "false" : "true"}
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
              @slotchange=${() => this.onSlotChange("backdrop-extra")}
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
                <slot name="content"></slot>
              </div>
            </aside>

            <div
              class="panel panel--middle ${this.middleEmpty ? "panel--empty" : ""}"
              @click=${(event: Event) => event.stopPropagation()}
            >
              <slot name="middle" @slotchange=${() => this.onSlotChange("middle")}></slot>
            </div>

            <footer
              class="panel panel--bottom ${this.footerEmpty ? "panel--empty" : ""}"
              @click=${(event: Event) => event.stopPropagation()}
            >
              <slot name="footer" @slotchange=${() => this.onSlotChange("footer")}></slot>
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
    (n): n is HTMLElement => n instanceof HTMLElement,
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
