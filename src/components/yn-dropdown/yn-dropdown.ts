import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";
import { ynDropdownCloseSvg } from "../../asset/svg";

type PlacementSide = "top" | "bottom" | "left" | "right";
type PlacementAlign = "start" | "center" | "end";
export type YnDropdownPlacement =
  | "top-start"
  | "top"
  | "top-end"
  | "bottom-start"
  | "bottom"
  | "bottom-end"
  | "left-start"
  | "left"
  | "left-end"
  | "right-start"
  | "right"
  | "right-end";

export type YnDropdownOpenChangeDetail = {
  open: boolean;
  placement: YnDropdownPlacement;
};

const splitPlacement = (placement: YnDropdownPlacement): [PlacementSide, PlacementAlign] => {
  const [sideRaw, alignRaw] = placement.split("-");
  const side = sideRaw as PlacementSide;
  const align = (alignRaw ?? "center") as PlacementAlign;
  return [side, align];
};

const getMotionVectorBySide = (side: PlacementSide, distance: number) => {
  if (side === "top") return { x: 0, y: -distance };
  if (side === "bottom") return { x: 0, y: distance };
  if (side === "left") return { x: -distance, y: 0 };
  return { x: distance, y: 0 };
};

const calculatePosition = (
  triggerRect: DOMRect,
  panelWidth: number,
  panelHeight: number,
  placement: YnDropdownPlacement,
  offset: number
) => {
  const [side, align] = splitPlacement(placement);
  let left: number;
  let top: number;

  if (side === "top" || side === "bottom") {
    if (side === "bottom") {
      top = triggerRect.bottom + offset;
    } else {
      top = triggerRect.top - panelHeight - offset;
    }

    if (align === "start") {
      left = triggerRect.left;
    } else if (align === "end") {
      left = triggerRect.right - panelWidth;
    } else {
      left = triggerRect.left + (triggerRect.width - panelWidth) / 2;
    }
    return { left, top };
  }

  if (side === "right") {
    left = triggerRect.right + offset;
  } else {
    left = triggerRect.left - panelWidth - offset;
  }

  if (align === "start") {
    top = triggerRect.top;
  } else if (align === "end") {
    top = triggerRect.bottom - panelHeight;
  } else {
    top = triggerRect.top + (triggerRect.height - panelHeight) / 2;
  }
  return { left, top };
};

@customElement("yn-dropdown")
export class YnDropdown extends LitElement {
  @property({ type: String, reflect: true })
  placement: YnDropdownPlacement = "bottom-start";

  @property({ type: Boolean, reflect: true })
  open = false;

  @property({ type: Number })
  offset = 12;

  @property({ type: Number, attribute: "motion-distance" })
  motionDistance = 14;

  @property({ type: Number, attribute: "panel-open-distance" })
  panelOpenDistance = 16;

  @property({ type: Number, attribute: "panel-close-distance" })
  panelCloseDistance = 20;

  @property({ type: Number, attribute: "viewport-padding" })
  viewportPadding = 12;

  @property({ type: Boolean, attribute: "auto-flip" })
  autoFlip = false;

  @property({ type: Boolean, attribute: "close-on-outside-click" })
  closeOnOutsideClick = true;

  @state()
  private actualPlacement: YnDropdownPlacement = "bottom-start";

  @state()
  private panelMotionSide: PlacementSide = "bottom";

  @state()
  private panelStyle = "left:0px;top:0px;";

  @state()
  private closing = false;

  @state()
  private useButtonLabelMotion = false;

  private positionRaf = 0;
  private resizeObserver: ResizeObserver | null = null;
  private buttonLabelEl: HTMLElement | null = null;
  private viewportListenersActive = false;

  static styles = css`
    :host {
      display: inline-block;
      position: relative;
      overflow: visible;
    }

    .root {
      display: inline-flex;
      flex-direction: column;
    }

    .trigger {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }

    .trigger-content {
      display: inline-flex;
      align-items: center;
      transform: translate3d(0, 0, 0);
      opacity: 1;
      will-change: auto;
      transition:
        transform var(--yn-dropdown-trigger-duration, 220ms) var(--yn-dropdown-trigger-easing, cubic-bezier(0.22, 1, 0.36, 1)),
        opacity var(--yn-dropdown-trigger-opacity-duration, 160ms) var(--yn-dropdown-trigger-easing, cubic-bezier(0.22, 1, 0.36, 1));
    }

    :host([open]) .trigger-content {
      transform: translate3d(var(--yn-dropdown-motion-x, 0px), var(--yn-dropdown-motion-y, 0px), 0);
      opacity: 0;
      will-change: transform, opacity;
    }

    .trigger.button-trigger .trigger-content,
    :host([open]) .trigger.button-trigger .trigger-content {
      transform: translate3d(0, 0, 0);
      opacity: 1;
      transition: none;
    }

    .close-icon {
      position: absolute;
      left: 50%;
      right: auto;
      top: 50%;
      margin: 0;
      padding: 0;
      width: var(--yn-dropdown-close-icon-size, 24px);
      height: var(--yn-dropdown-close-icon-size, 24px);
      border: none;
      background: transparent;
      color: var(--yn-dropdown-close-icon-color, #241f21);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      pointer-events: none;
      opacity: 0;
      transform: translate3d(
        calc(-50% - var(--yn-dropdown-motion-x, 0px)),
        calc(-50% - var(--yn-dropdown-motion-y, 0px)),
        0
      );
      transition:
        transform var(--yn-dropdown-close-duration, 220ms) var(--yn-dropdown-close-easing, cubic-bezier(0.22, 1, 0.36, 1)),
        opacity var(--yn-dropdown-close-opacity-duration, 180ms) var(--yn-dropdown-close-easing, cubic-bezier(0.22, 1, 0.36, 1));
      transition-delay: 0ms, 0ms;
      will-change: auto;
    }

    .close-icon ::slotted(*) {
      width: 100%;
      height: 100%;
      display: block;
    }

    :host([open]) .close-icon {
      pointer-events: auto;
      opacity: 1;
      transform: translate3d(-50%, -50%, 0);
      transition-delay: var(--yn-dropdown-close-enter-delay, 67ms), var(--yn-dropdown-close-enter-delay, 67ms);
      will-change: transform, opacity;
    }

    :host(:not([open])) .close-icon {
      transition-delay: 0ms, 0ms;
    }

    .panel {
      position: absolute;
      box-sizing: border-box;
      min-width: var(--yn-dropdown-panel-min-width, 280px);
      border-radius: var(--yn-dropdown-panel-radius, 12px);
      border: var(--yn-dropdown-panel-border, none);
      background: var(--yn-dropdown-panel-bg, #ffffff);
      box-shadow: var(--yn-dropdown-panel-shadow, 0 12px 36px rgba(36, 31, 33, 0.18));
      padding: var(--yn-dropdown-panel-padding, 12px);
      overflow: auto;
      z-index: var(--yn-dropdown-z-index, 1200);
      opacity: 0;
      visibility: visible;
      pointer-events: none;
      transform: translate3d(
          var(--yn-dropdown-panel-open-shift-x, 0px),
          var(--yn-dropdown-panel-open-shift-y, 0px),
          0
        );
      transform-origin: center center;
      backface-visibility: hidden;
      contain: layout paint;
      transition:
        transform var(--yn-dropdown-panel-motion-duration, 270ms) var(--yn-dropdown-panel-motion-easing, cubic-bezier(0.22, 0.78, 0.24, 1)),
        opacity var(--yn-dropdown-panel-opacity-duration, 270ms) var(--yn-dropdown-panel-motion-easing, cubic-bezier(0.22, 0.78, 0.24, 1));
      will-change: auto;
    }

    .panel:not(.open):not(.closing) {
      visibility: hidden;
    }

    .panel[data-side="top"] {
      transform-origin: center bottom;
    }

    .panel[data-side="bottom"] {
      transform-origin: center top;
    }

    .panel[data-side="left"] {
      transform-origin: right center;
    }

    .panel[data-side="right"] {
      transform-origin: left center;
    }

    .panel.open {
      opacity: 1;
      visibility: visible;
      pointer-events: auto;
      box-shadow: var(--yn-dropdown-panel-motion-shadow, 0 8px 20px rgba(36, 31, 33, 0.12));
      --yn-dropdown-panel-motion-duration: var(--yn-dropdown-panel-open-duration, 270ms);
      --yn-dropdown-panel-opacity-duration: var(--yn-dropdown-panel-open-duration, 270ms);
      --yn-dropdown-panel-motion-easing: var(--yn-dropdown-panel-open-easing, cubic-bezier(0.22, 0.78, 0.24, 1));
      transform: translate3d(0, 0, 0);
      will-change: transform, opacity;
    }

    .panel.closing {
      opacity: 0;
      visibility: visible;
      pointer-events: none;
      box-shadow: var(--yn-dropdown-panel-motion-shadow, 0 8px 20px rgba(36, 31, 33, 0.12));
      --yn-dropdown-panel-motion-duration: var(--yn-dropdown-panel-close-duration, 330ms);
      --yn-dropdown-panel-opacity-duration: var(--yn-dropdown-panel-close-duration, 330ms);
      --yn-dropdown-panel-motion-easing: var(--yn-dropdown-panel-close-easing, cubic-bezier(0.4, 0, 0.2, 1));
      transform: translate3d(
          var(--yn-dropdown-panel-close-shift-x, 0px),
          var(--yn-dropdown-panel-close-shift-y, 0px),
          0
        );
      will-change: transform, opacity;
    }

  `;

  /** 注册全局事件，建立组件生命周期监听。 */
  connectedCallback() {
    super.connectedCallback();
    // Keep initial motion direction aligned with current placement.
    const [initialSide] = splitPlacement(this.placement);
    this.actualPlacement = this.placement;
    this.panelMotionSide = initialSide;
    document.addEventListener("pointerdown", this.handleDocumentPointerDown);
    document.addEventListener("keydown", this.handleDocumentKeydown);
  }

  /** 组件卸载时清理事件、RAF 与观察器，避免内存泄漏。 */
  disconnectedCallback() {
    document.removeEventListener("pointerdown", this.handleDocumentPointerDown);
    document.removeEventListener("keydown", this.handleDocumentKeydown);
    this.toggleViewportListeners(false);
    if (this.positionRaf) {
      cancelAnimationFrame(this.positionRaf);
      this.positionRaf = 0;
    }
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    this.resetButtonLabelStyle(this.buttonLabelEl);
    this.buttonLabelEl = null;
    super.disconnectedCallback();
  }

  /** 首次渲染后预热方向与位置，保证首开动画可用。 */
  protected firstUpdated() {
    this.updateTriggerMode();
    this.panelMotionSide = splitPlacement(this.placement)[0];
    // Precompute panel geometry so first open has non-zero motion.
    this.positionPanel();
    if (this.open) {
      this.setupResizeObserver();
      this.schedulePosition();
    }
  }

  /** 属性变化后同步定位、开关状态和联动动画。 */
  protected updated(changed: Map<string, unknown>) {
    if (
      changed.has("open") ||
      changed.has("placement") ||
      changed.has("offset")
    ) {
      if (this.open) {
        this.closing = false;
        this.setupResizeObserver();
        this.schedulePosition();
      } else {
        this.resizeObserver?.disconnect();
      }
    }

    if (changed.has("open")) {
      const previousOpen = changed.get("open") as boolean | undefined;
      if (previousOpen === true && this.open === false) {
        this.closing = true;
        this.toggleViewportListeners(false);
      } else if (this.open) {
        this.closing = false;
        this.toggleViewportListeners(true);
      }
      this.emitOpenChange();
    }

    if (changed.has("placement") && !this.open && !this.closing) {
      this.panelMotionSide = splitPlacement(this.placement)[0];
    }

    if (changed.has("open") || changed.has("motionDistance") || changed.has("actualPlacement")) {
      this.syncButtonLabelMotion();
    }
  }

  /** 派发开关状态变化事件，供外部监听。 */
  private emitOpenChange() {
    this.dispatchEvent(
      new CustomEvent<YnDropdownOpenChangeDetail>("open-change", {
        detail: {
          open: this.open,
          placement: this.actualPlacement
        },
        bubbles: true,
        composed: true
      })
    );
  }

  /** 建立并刷新尺寸观察，触发器或面板尺寸变化时重算位置。 */
  private setupResizeObserver() {
    if (!this.resizeObserver) {
      this.resizeObserver = new ResizeObserver(() => this.schedulePosition());
    }
    this.resizeObserver.disconnect();
    const trigger = this.shadowRoot?.querySelector<HTMLElement>(".trigger");
    if (trigger) this.resizeObserver.observe(trigger);
  }

  /** 仅在展开阶段启用视口监听，降低空闲期开销。 */
  private toggleViewportListeners(active: boolean) {
    if (this.viewportListenersActive === active) return;
    this.viewportListenersActive = active;
    if (active) {
      window.addEventListener("resize", this.handleViewportChange, { passive: true });
      window.addEventListener("scroll", this.handleViewportChange, { passive: true, capture: true });
      return;
    }
    window.removeEventListener("resize", this.handleViewportChange);
    window.removeEventListener("scroll", this.handleViewportChange, true);
  }

  /** 视口尺寸或滚动变化时重算展开态位置。 */
  private handleViewportChange = () => {
    if (!this.open) return;
    this.schedulePosition();
  };

  /** 监听 ESC 快捷关闭。 */
  private handleDocumentKeydown = (event: KeyboardEvent) => {
    if (!this.open) return;
    if (event.key !== "Escape") return;
    this.closeDropdown();
  };

  /** 处理外部点击关闭逻辑。 */
  private handleDocumentPointerDown = (event: Event) => {
    if (!this.open || !this.closeOnOutsideClick) return;
    const path = event.composedPath();
    if (path.includes(this)) return;
    this.closeDropdown();
  };

  /** 处理触发器点击：展开或关闭。 */
  private handleTriggerClick = () => {
    if (this.open) {
      this.closeDropdown();
      return;
    }
    this.openDropdown();
  };

  /** 触发器插槽变化后刷新模式与定位。 */
  private handleTriggerSlotChange = () => {
    this.updateTriggerMode();
    this.schedulePosition(true);
  };

  /** 处理关闭图标点击并阻止冒泡到触发器。 */
  private handleCloseIconClick = (event: Event) => {
    event.stopPropagation();
    this.closeDropdown();
  };

  /** 以固定流程打开下拉：锁定方向、预计算、再切换 open。 */
  private openDropdown() {
    if (this.open) return;
    this.closing = false;
    // Fallback direction immediately follows desired placement.
    this.panelMotionSide = splitPlacement(this.placement)[0];
    // Resolve final placement/position before enabling open state.
    this.positionPanel();
    this.open = true;
  }

  /** 触发关闭态动画并切换 open。 */
  private closeDropdown() {
    if (!this.open) return;
    this.closing = true;
    this.open = false;
  }

  /** 供外部 JS 调用的关闭方法。 */
  close() {
    this.closeDropdown();
  }

  /** 关闭过渡结束后复位 closing 状态。 */
  private handlePanelTransitionEnd = (event: TransitionEvent) => {
    if (!(event.target instanceof HTMLElement)) return;
    if (!event.target.classList.contains("panel")) return;
    if (event.propertyName !== "transform" && event.propertyName !== "opacity") return;
    if (this.open || !this.closing) return;
    this.closing = false;
  };

  /** 判断触发器类型并同步按钮文本动画模式。 */
  private updateTriggerMode() {
    const previousLabel = this.buttonLabelEl;
    const slot = this.shadowRoot?.querySelector<HTMLSlotElement>("slot:not([name])");
    const first = slot?.assignedElements({ flatten: true })[0] as HTMLElement | undefined;
    if (!first || first.tagName !== "YN-BUTTON") {
      this.resetButtonLabelStyle(previousLabel);
      this.buttonLabelEl = null;
      this.useButtonLabelMotion = false;
      return;
    }
    const label = first.shadowRoot?.querySelector<HTMLElement>(".label") ?? null;
    if (previousLabel && previousLabel !== label) {
      this.resetButtonLabelStyle(previousLabel);
    }
    this.buttonLabelEl = label;
    this.useButtonLabelMotion = Boolean(label);
    this.syncButtonLabelMotion();
  }

  /** 清理按钮文本上注入的内联动画样式。 */
  private resetButtonLabelStyle(label: HTMLElement | null) {
    if (!label) return;
    label.style.willChange = "";
    label.style.transition = "";
    label.style.transform = "";
    label.style.opacity = "";
  }

  /** 同步按钮文本在开关过程中的位移与透明度。 */
  private syncButtonLabelMotion() {
    if (!this.buttonLabelEl) return;
    const [side] = splitPlacement(this.actualPlacement);
    const motion = getMotionVectorBySide(side, this.motionDistance);
    this.buttonLabelEl.style.willChange = "transform, opacity";
    const enterTransition =
      "transform 130ms cubic-bezier(0.4, 0, 1, 1), opacity 130ms cubic-bezier(0.4, 0, 1, 1)";
    const leaveTransition =
      "transform 140ms cubic-bezier(0, 0, 0.2, 1) 130ms, opacity 140ms cubic-bezier(0, 0, 0.2, 1) 130ms";
    this.buttonLabelEl.style.transition = this.open ? enterTransition : leaveTransition;
    this.buttonLabelEl.style.transform = this.open ? `translate3d(${motion.x}px, ${motion.y}px, 0)` : "translate3d(0, 0, 0)";
    this.buttonLabelEl.style.opacity = this.open ? "0" : "1";
  }

  /** 通过 RAF 合并定位计算，降低重复回流。 */
  private schedulePosition(force = false) {
    if (!this.open && !force) return;
    if (this.positionRaf) cancelAnimationFrame(this.positionRaf);
    this.positionRaf = requestAnimationFrame(() => {
      this.positionRaf = 0;
      this.positionPanel();
    });
  }

  /** 按 placement 计算面板坐标并写入样式变量。 */
  private positionPanel() {
    const trigger = this.shadowRoot?.querySelector<HTMLElement>(".trigger");
    const panel = this.shadowRoot?.querySelector<HTMLElement>(".panel");
    if (!trigger || !panel) return;

    const hostRect = this.getBoundingClientRect();
    const triggerRect = trigger.getBoundingClientRect();
    const panelWidth = Math.max(panel.offsetWidth, 120);
    const panelHeight = Math.max(panel.offsetHeight, 80);
    const position = calculatePosition(triggerRect, panelWidth, panelHeight, this.placement, this.offset);
    const localLeft = position.left - hostRect.left;
    const localTop = position.top - hostRect.top;
    this.actualPlacement = this.placement;
    this.panelMotionSide = splitPlacement(this.placement)[0];
    this.panelStyle = `left:${localLeft}px;top:${localTop}px;`;
  }

  /** 渲染触发器、关闭图标与内容面板。 */
  render() {
    const [side] = splitPlacement(this.actualPlacement);
    const activePanelMotionSide =
      this.open || this.closing ? this.panelMotionSide : splitPlacement(this.placement)[0];
    const motion = getMotionVectorBySide(side, this.motionDistance);
    const panelOpenMotion = getMotionVectorBySide(activePanelMotionSide, this.panelOpenDistance);
    const panelCloseMotion = getMotionVectorBySide(activePanelMotionSide, this.panelCloseDistance);
    const triggerStyle = `--yn-dropdown-motion-x:${motion.x}px;--yn-dropdown-motion-y:${motion.y}px;`;
    const panelStyle = `${this.panelStyle}--yn-dropdown-panel-open-shift-x:${-panelOpenMotion.x}px;--yn-dropdown-panel-open-shift-y:${-panelOpenMotion.y}px;--yn-dropdown-panel-close-shift-x:${-panelCloseMotion.x}px;--yn-dropdown-panel-close-shift-y:${-panelCloseMotion.y}px;`;

    return html`
      <div class="root">
        <div
          class=${`trigger ${this.useButtonLabelMotion ? "button-trigger" : ""}`}
          style=${triggerStyle}
          @click=${this.handleTriggerClick}
        >
          <span class="trigger-content">
            <slot @slotchange=${this.handleTriggerSlotChange}></slot>
          </span>
          <button
            class="close-icon"
            type="button"
            tabindex="-1"
            aria-label="close dropdown"
            @click=${this.handleCloseIconClick}
          >
            <slot name="close-icon">${unsafeSVG(ynDropdownCloseSvg)}</slot>
          </button>
        </div>
      </div>
      <div
        class=${`panel ${this.open ? "open" : ""} ${this.closing ? "closing" : ""}`}
        style=${panelStyle}
        data-side=${side}
        @transitionend=${this.handlePanelTransitionEnd}
      >
        <slot name="content"></slot>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "yn-dropdown": YnDropdown;
  }
}
