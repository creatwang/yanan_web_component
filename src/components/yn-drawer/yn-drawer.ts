import { LitElement, css, html, unsafeCSS } from "lit";
import type { PropertyValues } from "lit";
import { customElement, property } from "lit/decorators.js";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";
import { ynClose20Svg } from "../../asset/svg";
import "../yn-icon-button/yn-icon-button.js";
import { applyLitDsd, dedupeShadowDsdContent, ensureRenderRoot } from "../../lib/lit-dsd.js";
import { YN_DRAWER_SHADOW_STYLES } from "./yn-drawer-styles.js";

const YN_DRAWER_DSD_DEDUPE = ["#drawerPopover", ".trigger-wrap"] as const;

export type YnDrawerOpenChangeDetail = {
  open: boolean;
  source: YnDrawerLifecycleSource;
  payload?: unknown;
  triggerPayload?: unknown;
};

export type YnDrawerLifecycleSource = "api" | "trigger" | "close-button" | "backdrop" | "escape" | "property";

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

  /** `auto`锛氱獎灞忓簳閮ㄥ脊鍑猴紝瀹藉睆鍙充晶婊戝叆锛沗bottom` / `right` 鍙己鍒舵寚瀹氭柟鍚?*/
  @property({ type: String, reflect: true })
  placement: "auto" | "right" | "bottom" = "auto";

  /**
   * 搴曢儴寮瑰嚭鏃堕潰鏉块珮搴︺€傞粯璁?`90vh`锛涜涓?`auto` 鏃堕珮搴﹂殢鍐呭锛屽叧闂€佷粛鐢?`translateY(100%)` 鏁存婊戝叆/婊戝嚭銆?   * 涔熷彲浼犱换鎰?CSS 闀垮害锛堝 `60vh`銆乣420px`锛夛紝浼氬悓姝ュ埌 `--yn-drawer-sheet-height`銆?   */
  @property({ type: String, attribute: "sheet-height", reflect: true })
  sheetHeight = "90vh";

  private getPopoverEl() {
    return this.shadowRoot?.querySelector("#drawerPopover") as HTMLElement | null;
  }

  private getTriggerSlotEl() {
    return this.shadowRoot?.querySelector('slot[name="trigger"]') as HTMLSlotElement | null;
  }

  private getFooterSlotEl() {
    return this.shadowRoot?.querySelector('slot[name="footer"]') as HTMLSlotElement | null;
  }

  private getBackdropExtraSlotEl() {
    return this.shadowRoot?.querySelector('slot[name="backdrop-extra"]') as HTMLSlotElement | null;
  }

  private _open = false;
  private footerEmpty = true;
  private backdropExtraEmpty = true;
  private closeTimer = 0;
  private openTimer = 0;
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
    if (this.closeTimer) {
      window.clearTimeout(this.closeTimer);
      this.closeTimer = 0;
    }
    if (this.openTimer) {
      window.clearTimeout(this.openTimer);
      this.openTimer = 0;
    }
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
    this.syncBackdropExtraEmptyState();
    this.syncPopoverState(true);
    this.bindTriggerSlotClicks();
  }

  bootstrapFromDeclarativeShadow() {
    const root = this.shadowRoot;
    if (!root) return;
    dedupeShadowDsdContent(root, [...YN_DRAWER_DSD_DEDUPE]);
    ensureRenderRoot(this);
    const triggerSlot = root.querySelector('slot[name="trigger"]') as HTMLSlotElement | null;
    const hasSlottedTrigger = (triggerSlot?.assignedElements({ flatten: true }).length ?? 0) > 0;
    if (!hasSlottedTrigger) {
      root.querySelector(".trigger-wrap")?.addEventListener("click", this.handleTriggerClick);
    }
    this.bindTriggerSlotClicks();
    queueMicrotask(() => this.bindTriggerSlotClicks());
    root.querySelector(".close-btn")?.addEventListener("click", this.handleCloseClick);
    root.querySelector(".backdrop")?.addEventListener("click", this.handleBackdropClick);
    root.querySelector("#drawerPopover")?.addEventListener("keydown", this.handleEscape as EventListener);
    root.querySelector('slot[name="footer"]')?.addEventListener("slotchange", this.handleFooterSlotChange);
    root.querySelector('slot[name="backdrop-extra"]')?.addEventListener("slotchange", this.handleBackdropExtraSlotChange);
    this.syncFooterEmptyState();
    this.syncBackdropExtraEmptyState();
    this.syncPopoverState(true);
  }


  protected updated(changed: PropertyValues) {
    if (changed.has("width")) {
      this.style.setProperty("--yn-drawer-width", `${Math.max(260, this.width)}px`);
    }
    if (changed.has("sheetHeight")) {
      this.syncSheetHeight();
    }
    if (changed.has("open")) {
      this.pendingTransitionMeta = undefined;
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

  private emitOpenChange(meta: { source: YnDrawerLifecycleSource; payload?: unknown; triggerPayload?: unknown }) {
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

  private dispatchLifecycleEvent(name: "before-open" | "before-close", detail: YnDrawerLifecycleDetail) {
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
    detail: { source: YnDrawerLifecycleSource; payload?: unknown; triggerPayload?: unknown }
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

  private getMotionDuration(cssVarName: "--yn-drawer-open-duration" | "--yn-drawer-close-duration", fallbackMs: number) {
    const value = getComputedStyle(this).getPropertyValue(cssVarName).trim();
    if (!value) return fallbackMs;
    const parsed = parseFloat(value);
    if (!Number.isFinite(parsed) || parsed < 0) return fallbackMs;
    if (value.endsWith("ms")) return parsed;
    if (value.endsWith("s")) return parsed * 1000;
    return fallbackMs;
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
    if (this.closeTimer) {
      window.clearTimeout(this.closeTimer);
      this.closeTimer = 0;
    }
    if (this.openTimer) {
      window.clearTimeout(this.openTimer);
      this.openTimer = 0;
    }
    if (initial) {
      this.style.setProperty("--yn-drawer-width", `${Math.max(260, this.width)}px`);
    }
    if (this.open) {
      this.showDrawerPopover(meta);
      return;
    }
    this.hideDrawerPopover(initial, meta);
  }

  private showDrawerPopover(meta: { source: YnDrawerLifecycleSource; payload?: unknown; triggerPayload?: unknown }) {
    const popoverEl = this.getPopoverEl();
    if (!popoverEl) return;
    if (!popoverEl.matches(":popover-open")) {
      popoverEl.showPopover();
    }
    popoverEl.classList.remove("closing");
    popoverEl.classList.remove("visible");
    requestAnimationFrame(() => {
      popoverEl.classList.add("visible");
    });
    const openDuration = this.getMotionDuration("--yn-drawer-open-duration", 380);
    this.openTimer = window.setTimeout(() => {
      this.emitLifecycleEvent("after-open", meta);
      this.openTimer = 0;
    }, openDuration);
  }

  private hideDrawerPopover(
    immediate: boolean,
    meta: { source: YnDrawerLifecycleSource; payload?: unknown; triggerPayload?: unknown }
  ) {
    const popoverEl = this.getPopoverEl();
    if (!popoverEl || !popoverEl.matches(":popover-open")) return;
    if (immediate) {
      popoverEl.classList.remove("visible");
      popoverEl.classList.remove("closing");
      popoverEl.hidePopover();
      this.emitLifecycleEvent("after-close", meta);
      return;
    }
    popoverEl.classList.remove("visible");
    popoverEl.classList.add("closing");
    const closeDuration = this.getMotionDuration("--yn-drawer-close-duration", 320);
    this.closeTimer = window.setTimeout(() => {
      popoverEl.hidePopover();
      popoverEl.classList.remove("closing");
      this.emitLifecycleEvent("after-close", meta);
      this.closeTimer = 0;
    }, closeDuration);
  }

  private setOpenWithMeta(
    nextOpen: boolean,
    meta: { source: YnDrawerLifecycleSource; payload?: unknown; triggerPayload?: unknown }
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
  }

  private syncBackdropExtraEmptyState() {
    this.backdropExtraEmpty = !this.slotHasMeaningfulContent(this.getBackdropExtraSlotEl() ?? undefined);
  }

  private handleFooterSlotChange = () => {
    this.syncFooterEmptyState();
  };

  private handleBackdropExtraSlotChange = () => {
    this.syncBackdropExtraEmptyState();
  };

  render() {
    return html`
      <span class="trigger-wrap" @click=${this.handleTriggerClick}>
        <slot name="trigger">
          <button class="trigger-btn" type="button">Open drawer</button>
        </slot>
      </span>
      <div id="drawerPopover" class="drawer-popover" popover="manual" @keydown=${this.handleEscape}>
        <div class="drawer-surface">
          <div class="backdrop" @click=${this.handleBackdropClick}></div>
          <div
            class="backdrop-extra ${this.backdropExtraEmpty ? "backdrop-extra--empty" : ""}"
            @click=${(event: Event) => event.stopPropagation()}
          >
            <slot name="backdrop-extra" @slotchange=${this.handleBackdropExtraSlotChange}></slot>
          </div>
          <aside class="panel" role="dialog" aria-modal="true" aria-label=${this.title || "Drawer"} @click=${(event: Event) => event.stopPropagation()}>
            <header class="header">
              <div class="header-main">
                <slot name="header">
                  <h2 class="title">${this.title}</h2>
                </slot>
              </div>
              <div class="header-actions">
                <slot name="header-actions"></slot>
              </div>
              <yn-icon-button class="close-btn" size="small" label="Close drawer" @click=${this.handleCloseClick}>
                ${unsafeSVG(ynClose20Svg)}
              </yn-icon-button>
            </header>
            <div class="body">
              <slot name="content"></slot>
            </div>
            <footer class="footer ${this.footerEmpty ? "footer--empty" : ""}">
              <slot name="footer" @slotchange=${this.handleFooterSlotChange}></slot>
            </footer>
          </aside>
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

applyLitDsd(YnDrawer, "#drawerPopover", (el) => el.bootstrapFromDeclarativeShadow(), {
  dedupe: [...YN_DRAWER_DSD_DEDUPE],
});
