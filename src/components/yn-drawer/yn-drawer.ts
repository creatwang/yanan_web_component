import "../../lib/lit-hydrate.js";
import { LitElement, css, html, nothing, unsafeCSS } from "lit";
import type { PropertyValues } from "lit";
import { customElement, property } from "lit/decorators.js";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";
import { ynClose20Svg } from "../../asset/svg";
import "../yn-icon-button/yn-icon-button.js";
import {
  createYnDrawerMotion,
  type YnDrawerMotionController
} from "./yn-drawer-motion.js";
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
  | "property";

export type YnDrawerLifecycleDetail = {
  open: boolean;
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
    const nextMeta =
      this.pendingActionMeta?.nextOpen === normalized
        ? this.pendingActionMeta
        : { nextOpen: normalized, source: "property" as const };
    this.pendingActionMeta = undefined;

    const beforeEventName = normalized ? "before-open" : "before-close";
    const canContinue = this.dispatchLifecycleEvent(beforeEventName, {
      open: normalized,
      source: nextMeta.source,
      payload: nextMeta.payload,
      triggerPayload: nextMeta.triggerPayload
    });
    if (!canContinue) return;

    this._open = normalized;
    this.pendingTransitionMeta = nextMeta;
    this.requestUpdate("open", oldValue);
    this.flushOpenTransition();
  }

  @property({ type: Number })
  width = 420;

  @property({ type: String, attribute: "title" })
  title = "";

  @property({ type: Boolean, attribute: "close-on-backdrop" })
  closeOnBackdrop = true;

  /**
   * 仅 API 打开（无 trigger 槽）时设为 true：不渲染默认 Open drawer 按钮，宿主不占布局。
   */
  @property({ type: Boolean, attribute: "hide-trigger", reflect: true })
  hideTrigger = false;

  /** `auto`：面板靠右叠放；`bottom` / `right` 保留属性兼容。 */
  @property({ type: String, reflect: true })
  placement: "auto" | "right" | "bottom" = "auto";

  /**
   * 保留属性兼容；面板高度由 top 面板 `flex: 1` 占据剩余空间。
   */
  @property({ type: String, attribute: "sheet-height", reflect: true })
  sheetHeight = "90vh";

  /** 中途打断关闭时的加速倍率（对应 basetest exit speed）。 */
  @property({ type: Number, attribute: "exit-speed" })
  exitSpeed = 1.5;

  /** 是否启用 GSAP easeReverse（打开用 back.out，反向关闭用 power3.in）。 */
  @property({ type: Boolean, attribute: "ease-reverse" })
  easeReverse = true;

  private getPopoverEl() {
    return this.shadowRoot?.querySelector("#drawerPopover") as HTMLElement | null;
  }

  private getSurfaceEl() {
    return this.shadowRoot?.querySelector(".drawer-surface") as HTMLElement | null;
  }

  private getBackdropEl() {
    return this.shadowRoot?.querySelector(".backdrop") as HTMLElement | null;
  }

  private getTriggerSlotEl() {
    return this.shadowRoot?.querySelector('slot[name="trigger"]') as HTMLSlotElement | null;
  }

  private getFooterSlotEl() {
    return this.shadowRoot?.querySelector('slot[name="footer"]') as HTMLSlotElement | null;
  }

  private getMiddleSlotEl() {
    return this.shadowRoot?.querySelector('slot[name="middle"]') as HTMLSlotElement | null;
  }

  private getBackdropExtraSlotEl() {
    return this.shadowRoot?.querySelector('slot[name="backdrop-extra"]') as
      | HTMLSlotElement
      | null;
  }

  private _open = false;
  private footerEmpty = true;
  private middleEmpty = true;
  private backdropExtraEmpty = true;
  private motion: YnDrawerMotionController | undefined;
  private activeLifecycleMeta: {
    source: YnDrawerLifecycleSource;
    payload?: unknown;
    triggerPayload?: unknown;
  } = { source: "property" };
  private pendingActionMeta:
    | {
        nextOpen: boolean;
        source: YnDrawerLifecycleSource;
        payload?: unknown;
        triggerPayload?: unknown;
      }
    | undefined;
  private pendingTransitionMeta:
    | {
        nextOpen: boolean;
        source: YnDrawerLifecycleSource;
        payload?: unknown;
        triggerPayload?: unknown;
      }
    | undefined;

  static styles = css`
    ${unsafeCSS(YN_DRAWER_SHADOW_STYLES)}
  `;

  connectedCallback() {
    super.connectedCallback();
    this.handleEscape = this.handleEscape.bind(this);
    this.syncSheetHeight();
  }

  disconnectedCallback() {
    this.motion?.dispose();
    this.motion = undefined;
    super.disconnectedCallback();
  }

  private bindTriggerSlotClicks() {
    const slot = this.shadowRoot?.querySelector('slot[name="trigger"]') as HTMLSlotElement | null;
    if (!slot) return;
    const bind = () => {
      slot.assignedElements({ flatten: true }).forEach((el) => {
        if (el instanceof HTMLElement && el.dataset.ynDrawerTriggerBound !== "1") {
          el.dataset.ynDrawerTriggerBound = "1";
          el.addEventListener("click", (event) => {
            event.stopPropagation();
            this.handleTriggerClick();
          });
        }
      });
    };
    bind();
    slot.addEventListener("slotchange", bind);
  }

  protected firstUpdated() {
    this.syncFooterEmptyState();
    this.syncMiddleEmptyState();
    this.syncBackdropExtraEmptyState();
    this.ensureMotion();
    this.syncPopoverState(true);
    this.bindTriggerSlotClicks();
    queueMicrotask(() => {
      this.syncFooterEmptyState();
      this.syncMiddleEmptyState();
      this.syncBackdropExtraEmptyState();
      this.refreshMotionPanels();
    });
  }

  /**
   * 兼容旧 storefront rebootstrap。
   */
  bootstrapFromDeclarativeShadow() {
    this.bindTriggerSlotClicks();
    queueMicrotask(() => this.bindTriggerSlotClicks());
    this.syncFooterEmptyState();
    this.syncMiddleEmptyState();
    this.syncBackdropExtraEmptyState();
    this.ensureMotion();
    this.syncPopoverState(true);
    queueMicrotask(() => {
      this.syncFooterEmptyState();
      this.syncMiddleEmptyState();
      this.syncBackdropExtraEmptyState();
      this.refreshMotionPanels();
    });
  }

  protected updated(changed: PropertyValues) {
    if (changed.has("width")) {
      this.style.setProperty("--yn-drawer-width", `${Math.max(260, this.width)}px`);
    }
    if (changed.has("sheetHeight")) {
      this.syncSheetHeight();
    }
    if (changed.has("exitSpeed")) {
      this.style.setProperty("--yn-drawer-exit-speed", String(this.exitSpeed));
    }
    if (changed.has("open")) {
      this.pendingTransitionMeta = undefined;
    }
    if (
      (changed.has("exitSpeed") || changed.has("easeReverse")) &&
      this.motion &&
      !this.open
    ) {
      this.motion.dispose();
      this.motion = undefined;
      this.ensureMotion();
    }
  }

  private flushOpenTransition() {
    const transitionMeta = this.pendingTransitionMeta;
    if (!transitionMeta) return;
    this.pendingTransitionMeta = undefined;
    this.syncPopoverState(false, transitionMeta);
    this.emitOpenChange(transitionMeta);
  }

  private syncSheetHeight() {
    const value = (this.sheetHeight || "90vh").trim();
    if (value.toLowerCase() === "auto") {
      this.style.removeProperty("--yn-drawer-sheet-height");
      return;
    }
    this.style.setProperty("--yn-drawer-sheet-height", value);
  }

  private emitOpenChange(meta: {
    source: YnDrawerLifecycleSource;
    payload?: unknown;
    triggerPayload?: unknown;
  }) {
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
    const event = new CustomEvent<YnDrawerLifecycleDetail>(name, {
      detail,
      bubbles: true,
      composed: true,
      cancelable: true
    });
    return this.dispatchEvent(event);
  }

  private emitLifecycleEvent(
    name: "after-open" | "after-close",
    detail: {
      source: YnDrawerLifecycleSource;
      payload?: unknown;
      triggerPayload?: unknown;
    }
  ) {
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

  private collectMotionPanels() {
    const root = this.shadowRoot;
    if (!root) return [] as HTMLElement[];
    const panels: HTMLElement[] = [];
    const top = root.querySelector<HTMLElement>(".panel--top");
    const middle = root.querySelector<HTMLElement>(".panel--middle");
    const bottom = root.querySelector<HTMLElement>(".panel--bottom");
    if (top) panels.push(top);
    if (middle && !middle.classList.contains("panel--empty")) panels.push(middle);
    if (bottom && !bottom.classList.contains("panel--empty")) panels.push(bottom);
    return panels;
  }

  private collectRecoItems(assigned: HTMLElement[]) {
    if (!assigned.length) return [] as HTMLElement[];
    if (assigned.length > 1) return assigned;

    const host = assigned[0];
    const marked = Array.from(
      host.querySelectorAll<HTMLElement>("[data-yn-drawer-reco]")
    );
    if (marked.length) return marked;

    const articles = Array.from(host.querySelectorAll<HTMLElement>("article"));
    if (articles.length) return articles;

    const kids = Array.from(host.children).filter(
      (node): node is HTMLElement => node instanceof HTMLElement
    );
    // 常见结构：标题 + 卡片行 → 错落卡片行内的子项
    const row = kids.find((el) => el.children.length > 1);
    if (row) {
      return Array.from(row.children).filter(
        (node): node is HTMLElement => node instanceof HTMLElement
      );
    }
    return kids;
  }

  private collectMotionExtras() {
    const root = this.shadowRoot?.querySelector<HTMLElement>(".backdrop-extra");
    if (!root || root.classList.contains("backdrop-extra--empty")) return null;

    const slot = this.getBackdropExtraSlotEl();
    const assigned = (slot?.assignedElements({ flatten: true }) ?? []).filter(
      (node): node is HTMLElement => node instanceof HTMLElement
    );
    if (!assigned.length) return null;

    return { root, items: this.collectRecoItems(assigned) };
  }

  private collectMotionTargets() {
    return {
      panels: this.collectMotionPanels(),
      extras: this.collectMotionExtras()
    };
  }

  private ensureMotion() {
    const surface = this.getSurfaceEl();
    const backdrop = this.getBackdropEl();
    if (!surface || !backdrop) return;
    if (this.motion) return;
    this.motion = createYnDrawerMotion(
      surface,
      backdrop,
      this.collectMotionTargets(),
      {
        onEnterComplete: () => {
          this.emitLifecycleEvent("after-open", this.activeLifecycleMeta);
        },
        onExitComplete: () => {
          const popoverEl = this.getPopoverEl();
          if (popoverEl?.matches(":popover-open")) {
            popoverEl.hidePopover();
          }
          this.emitLifecycleEvent("after-close", this.activeLifecycleMeta);
        }
      },
      {
        exitSpeed: this.exitSpeed,
        easeReverse: this.easeReverse
      }
    );
  }

  private refreshMotionPanels() {
    this.ensureMotion();
    this.motion?.rebuild(this.collectMotionTargets());
  }

  private syncPopoverState(
    initial: boolean,
    meta: {
      source: YnDrawerLifecycleSource;
      payload?: unknown;
      triggerPayload?: unknown;
    } = { source: "property" }
  ) {
    const popoverEl = this.getPopoverEl();
    if (!popoverEl) return;
    if (initial) {
      this.style.setProperty("--yn-drawer-width", `${Math.max(260, this.width)}px`);
      this.style.setProperty("--yn-drawer-exit-speed", String(this.exitSpeed));
    }
    this.activeLifecycleMeta = meta;
    this.ensureMotion();
    if (this.open) {
      this.showDrawerPopover(initial, meta);
      return;
    }
    this.hideDrawerPopover(initial, meta);
  }

  private showDrawerPopover(
    initial: boolean,
    meta: {
      source: YnDrawerLifecycleSource;
      payload?: unknown;
      triggerPayload?: unknown;
    }
  ) {
    const popoverEl = this.getPopoverEl();
    if (!popoverEl) return;
    this.activeLifecycleMeta = meta;
    if (!popoverEl.matches(":popover-open")) {
      popoverEl.showPopover();
    }
    this.ensureMotion();
    if (initial) {
      this.motion?.seekOpenImmediate();
      return;
    }
    this.motion?.open();
  }

  private hideDrawerPopover(
    immediate: boolean,
    meta: {
      source: YnDrawerLifecycleSource;
      payload?: unknown;
      triggerPayload?: unknown;
    }
  ) {
    const popoverEl = this.getPopoverEl();
    if (!popoverEl) return;
    this.activeLifecycleMeta = meta;
    if (!popoverEl.matches(":popover-open")) {
      // 初次挂载且本就关闭时不要派发 after-close，避免宿主/Story 重渲染死循环
      return;
    }
    if (immediate) {
      popoverEl.hidePopover();
      this.motion?.dispose();
      this.motion = undefined;
      this.ensureMotion();
      this.emitLifecycleEvent("after-close", meta);
      return;
    }
    this.ensureMotion();
    this.motion?.close();
  }

  private setOpenWithMeta(
    nextOpen: boolean,
    meta: {
      source: YnDrawerLifecycleSource;
      payload?: unknown;
      triggerPayload?: unknown;
    }
  ) {
    this.pendingActionMeta = { nextOpen, ...meta };
    this.open = nextOpen;
  }

  private getTriggerPayload() {
    const triggerEl = this.getTriggerSlotEl()?.assignedElements({ flatten: true })[0] as
      | (HTMLElement & { drawerLifecyclePayload?: unknown })
      | undefined;
    if (!triggerEl) return undefined;
    if (triggerEl.drawerLifecyclePayload !== undefined) {
      return triggerEl.drawerLifecyclePayload;
    }
    const rawPayload =
      triggerEl.getAttribute("drawer-payload") ??
      triggerEl.getAttribute("trigger-payload") ??
      triggerEl.getAttribute("data-drawer-payload");
    if (rawPayload == null || rawPayload === "") return undefined;
    try {
      return JSON.parse(rawPayload);
    } catch {
      return rawPayload;
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
    const triggerPayload = this.getTriggerPayload();
    this.setOpenWithMeta(!this.open, { source: "trigger", triggerPayload });
  };

  private handleCloseClick = () => {
    this.setOpenWithMeta(false, { source: "close-button" });
  };

  private handleBackdropClick = () => {
    if (!this.closeOnBackdrop) return;
    this.setOpenWithMeta(false, { source: "backdrop" });
  };

  private handleEscape(event: KeyboardEvent) {
    if (event.key !== "Escape" || !this.open) return;
    event.stopPropagation();
    this.setOpenWithMeta(false, { source: "escape" });
  }

  private slotHasMeaningfulContent(slotEl: HTMLSlotElement | undefined) {
    if (!slotEl) return false;
    const nodes = slotEl.assignedNodes({ flatten: true });
    return nodes.some((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        return Boolean(node.textContent?.trim());
      }
      if (node.nodeType === Node.ELEMENT_NODE) {
        return true;
      }
      return false;
    });
  }

  private syncFooterEmptyState() {
    this.footerEmpty = !this.slotHasMeaningfulContent(this.getFooterSlotEl() ?? undefined);
    this.shadowRoot
      ?.querySelector(".panel--bottom")
      ?.classList.toggle("panel--empty", this.footerEmpty);
  }

  private syncMiddleEmptyState() {
    this.middleEmpty = !this.slotHasMeaningfulContent(this.getMiddleSlotEl() ?? undefined);
    this.shadowRoot
      ?.querySelector(".panel--middle")
      ?.classList.toggle("panel--empty", this.middleEmpty);
  }

  private syncBackdropExtraEmptyState() {
    this.backdropExtraEmpty = !this.slotHasMeaningfulContent(
      this.getBackdropExtraSlotEl() ?? undefined
    );
    this.shadowRoot
      ?.querySelector(".backdrop-extra")
      ?.classList.toggle("backdrop-extra--empty", this.backdropExtraEmpty);
  }

  private handleFooterSlotChange = () => {
    this.syncFooterEmptyState();
    this.refreshMotionPanels();
  };

  private handleMiddleSlotChange = () => {
    this.syncMiddleEmptyState();
    this.refreshMotionPanels();
  };

  private handleBackdropExtraSlotChange = () => {
    this.syncBackdropExtraEmptyState();
    this.refreshMotionPanels();
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
              @slotchange=${this.handleBackdropExtraSlotChange}
            ></slot>
          </div>

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
            <slot name="middle" @slotchange=${this.handleMiddleSlotChange}></slot>
          </div>

          <footer
            class="panel panel--bottom ${this.footerEmpty ? "panel--empty" : ""}"
            @click=${(event: Event) => event.stopPropagation()}
          >
            <slot name="footer" @slotchange=${this.handleFooterSlotChange}></slot>
          </footer>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "yn-drawer": YnDrawer;
  }
}
