import { LitElement, css, html } from "lit";
import type { PropertyValues } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";
import { ynClose20Svg } from "../../asset/svg";

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
  }

  @property({ type: Number })
  width = 420;

  @property({ type: String, attribute: "title" })
  title = "";

  @property({ type: Boolean, attribute: "close-on-backdrop" })
  closeOnBackdrop = true;

  /** `auto`：窄屏底部弹出，宽屏右侧滑入；`bottom` / `right` 可强制指定方向 */
  @property({ type: String, reflect: true })
  placement: "auto" | "right" | "bottom" = "auto";

  /**
   * 底部弹出时面板高度。默认 `90vh`；设为 `auto` 时高度随内容，关闭态仍用 `translateY(100%)` 整段滑入/滑出。
   * 也可传任意 CSS 长度（如 `60vh`、`420px`），会同步到 `--yn-drawer-sheet-height`。
   */
  @property({ type: String, attribute: "sheet-height", reflect: true })
  sheetHeight = "90vh";

  @query("#drawerPopover")
  private popoverEl!: HTMLElement;

  @query('slot[name="trigger"]')
  private triggerSlotEl!: HTMLSlotElement;

  @query('slot[name="footer"]')
  private footerSlotEl!: HTMLSlotElement;

  private _open = false;
  private footerEmpty = true;
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
    :host {
      --yn-drawer-z-index: 1500;
      --yn-drawer-width: 420px;
      --yn-drawer-bg: #ffffff;
      --yn-drawer-shadow: -12px 0 36px rgba(36, 31, 33, 0.18);
      --yn-drawer-backdrop: rgba(12, 10, 11, 0.36);
      --yn-drawer-header-border: rgba(36, 31, 33, 0.08);
      --yn-drawer-footer-border: rgba(36, 31, 33, 0.08);
      --yn-drawer-title-color: #241f21;
      --yn-drawer-close-color: #241f21;
      --yn-drawer-close-hover-bg: rgba(36, 31, 33, 0.08);
      --yn-drawer-content-color: #241f21;
      --yn-drawer-footer-bg: #ffffff;
      --yn-drawer-open-duration: 380ms;
      --yn-drawer-close-duration: 320ms;
      --yn-drawer-open-ease: cubic-bezier(0.22, 0.01, 0.35, 1);
      --yn-drawer-close-ease: cubic-bezier(0.55, 0.055, 0.675, 0.19);
      --yn-drawer-mobile-radius: 16px;
      --yn-drawer-mobile-shadow: 0 -12px 36px rgba(36, 31, 33, 0.18);
      --yn-drawer-sheet-height: 90vh;
      --yn-drawer-breakpoint: 1024px;
      --yn-drawer-body-padding: 16px;
      display: block;
    }

    * {
      box-sizing: border-box;
    }

    .trigger-wrap {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .trigger-btn {
      border: 0;
      border-radius: 999px;
      padding: 10px 16px;
      background: #241f21;
      color: #fff;
      cursor: pointer;
      font-size: 14px;
      line-height: 1;
    }

    .drawer-popover {
      margin: 0;
      padding: 0;
      border: 0;
      background: transparent;
      width: 100vw;
      max-width: 100vw;
      height: 100vh;
      max-height: 100vh;
      inset: 0;
      overflow: hidden;
      z-index: var(--yn-drawer-z-index);
    }

    .drawer-popover::backdrop {
      background: transparent;
    }

    .drawer-surface {
      position: fixed;
      inset: 0;
      display: flex;
      justify-content: flex-end;
      align-items: stretch;
      pointer-events: none;
    }

    .backdrop {
      position: absolute;
      inset: 0;
      background: var(--yn-drawer-backdrop);
      opacity: 0;
      transition: opacity var(--yn-drawer-open-duration) var(--yn-drawer-open-ease);
      pointer-events: none;
    }

    .panel {
      position: relative;
      width: min(100vw, var(--yn-drawer-width));
      max-width: 100vw;
      height: 100vh;
      background: var(--yn-drawer-bg);
      box-shadow: var(--yn-drawer-shadow);
      color: var(--yn-drawer-content-color);
      transform: translateX(100%);
      opacity: 0;
      pointer-events: auto;
      display: flex;
      flex-direction: column;
      transition:
        transform var(--yn-drawer-open-duration) var(--yn-drawer-open-ease),
        opacity var(--yn-drawer-open-duration) var(--yn-drawer-open-ease);
      will-change: transform, opacity;
    }

    .drawer-popover.visible .backdrop {
      opacity: 1;
      pointer-events: auto;
    }

    .drawer-popover.visible .panel {
      transform: translateX(0);
      opacity: 1;
    }

    .drawer-popover.closing .backdrop {
      transition-duration: var(--yn-drawer-close-duration);
      transition-timing-function: var(--yn-drawer-close-ease);
      opacity: 0;
      pointer-events: none;
    }

    .drawer-popover.closing .panel {
      transition-duration: var(--yn-drawer-close-duration);
      transition-timing-function: var(--yn-drawer-close-ease);
      transform: translateX(100%);
      opacity: 0;
    }

    /* 窄屏 / placement=bottom：底部弹出，高度随内容 */
    @media (max-width: 1023px) {
      :host([placement="bottom"]),
      :host([placement="auto"]) {
        .drawer-surface {
          align-items: flex-end;
          justify-content: center;
        }

        .panel {
          width: 100%;
          max-width: 100vw;
          height: var(--yn-drawer-sheet-height);
          max-height: min(95vh, 100dvh);
          transform: translateY(100%);
          opacity: 1;
          border-radius: var(--yn-drawer-mobile-radius) var(--yn-drawer-mobile-radius) 0 0;
          box-shadow: var(--yn-drawer-mobile-shadow);
          transition: transform var(--yn-drawer-open-duration) var(--yn-drawer-open-ease);
        }

        :host([sheet-height="auto"]) .panel {
          height: auto;
        }

        .drawer-popover.visible .panel {
          transform: translateY(0);
        }

        .drawer-popover.closing .panel {
          transform: translateY(100%);
          opacity: 1;
          transition: transform var(--yn-drawer-close-duration) var(--yn-drawer-close-ease);
        }

        .body {
          flex: 1;
          min-height: 0;
          overflow: auto;
        }

        :host([sheet-height="auto"]) .body {
          flex: 0 1 auto;
          overflow: visible;
        }

        .footer--empty {
          display: none;
        }
      }
    }

    @media (min-width: 1024px) {
      :host([placement="bottom"]) .drawer-surface {
        align-items: flex-end;
        justify-content: center;
      }

      :host([placement="bottom"]) .panel {
        width: 100%;
        height: var(--yn-drawer-sheet-height);
        max-height: min(95vh, 100dvh);
        transform: translateY(100%);
        border-radius: var(--yn-drawer-mobile-radius) var(--yn-drawer-mobile-radius) 0 0;
      }

      :host([placement="bottom"][sheet-height="auto"]) .panel {
        height: auto;
      }

      :host([placement="bottom"]) .body {
        flex: 1;
        min-height: 0;
        overflow: auto;
      }

      :host([placement="bottom"][sheet-height="auto"]) .body {
        flex: 0 1 auto;
        overflow: visible;
      }

      :host([placement="bottom"]) .drawer-popover.visible .panel {
        transform: translateY(0);
      }

      :host([placement="bottom"]) .drawer-popover.closing .panel {
        transform: translateY(100%);
      }
    }

    .header {
      height: 56px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 0 12px 0 16px;
      border-bottom: 1px solid var(--yn-drawer-header-border);
      flex-shrink: 0;
    }

    .header-main {
      flex: 1;
      min-width: 0;
      display: flex;
      align-items: center;
    }

    .title {
      margin: 0;
      color: var(--yn-drawer-title-color);
      font-size: 18px;
      line-height: 1.3;
      font-weight: 600;
    }

    .close-btn {
      border: 0;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      color: var(--yn-drawer-close-color);
      cursor: pointer;
      transition: background-color 160ms ease;
    }

    .close-btn:hover {
      background: var(--yn-drawer-close-hover-bg);
    }

    .body {
      flex: 1;
      min-height: 0;
      overflow: auto;
      padding: var(--yn-drawer-body-padding);
    }

    .header-actions {
      display: inline-flex;
      align-items: center;
      flex-shrink: 0;
    }

    .header-actions:empty {
      display: none;
    }

    .footer {
      border-top: 1px solid var(--yn-drawer-footer-border);
      background: var(--yn-drawer-footer-bg);
      padding: 12px 16px;
      flex-shrink: 0;
    }

    .footer--empty {
      display: none;
      border: 0;
      padding: 0;
    }
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

  protected firstUpdated() {
    this.syncFooterEmptyState();
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
      const transitionMeta = this.pendingTransitionMeta ?? {
        nextOpen: this.open,
        source: "property" as const
      };
      this.pendingTransitionMeta = undefined;
      this.syncPopoverState(false, transitionMeta);
      this.emitOpenChange(transitionMeta);
    }
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
    if (!this.popoverEl) return;
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
    if (!this.popoverEl.matches(":popover-open")) {
      this.popoverEl.showPopover();
    }
    this.popoverEl.classList.remove("closing");
    this.popoverEl.classList.remove("visible");
    requestAnimationFrame(() => {
      this.popoverEl.classList.add("visible");
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
    if (!this.popoverEl.matches(":popover-open")) return;
    if (immediate) {
      this.popoverEl.classList.remove("visible");
      this.popoverEl.classList.remove("closing");
      this.popoverEl.hidePopover();
      this.emitLifecycleEvent("after-close", meta);
      return;
    }
    this.popoverEl.classList.remove("visible");
    this.popoverEl.classList.add("closing");
    const closeDuration = this.getMotionDuration("--yn-drawer-close-duration", 320);
    this.closeTimer = window.setTimeout(() => {
      this.popoverEl.hidePopover();
      this.popoverEl.classList.remove("closing");
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
    const triggerEl = this.triggerSlotEl?.assignedElements({ flatten: true })[0] as
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

  private syncFooterEmptyState() {
    if (!this.footerSlotEl) return;
    const nodes = this.footerSlotEl.assignedNodes({ flatten: true });
    this.footerEmpty = !nodes.some((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        return Boolean(node.textContent?.trim());
      }
      if (node.nodeType === Node.ELEMENT_NODE) {
        return true;
      }
      return false;
    });
  }

  private handleFooterSlotChange = () => {
    this.syncFooterEmptyState();
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
              <button class="close-btn" type="button" aria-label="Close drawer" @click=${this.handleCloseClick}>
                ${unsafeSVG(ynClose20Svg)}
              </button>
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
