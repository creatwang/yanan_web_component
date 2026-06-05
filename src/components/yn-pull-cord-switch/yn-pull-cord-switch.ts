import { LitElement, css, html } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import {
  PullCordFixedDrag,
  applyCssLeft,
  applyCssTop,
  applyRopeLengthVars,
  centerLogical,
  DEFAULT_ROPE_LENGTH,
  logicalToCssLeft,
  normalizeRopeLength,
  peekCssLeft,
  peekCssTop
} from "./pull-cord-layout";
import { PullCordRopeEngine } from "./pull-cord-rope-engine";

export { DEFAULT_ROPE_LENGTH } from "./pull-cord-layout";

export type YnPullCordSwitchVariant = "default" | "floema";
export type YnPullCordSwitchSize = "mini" | "small" | "medium";
type CardMode = "fallback" | "default-slot" | "dual-slot";

function scanLightDomSlots(host: HTMLElement) {
  let hasDefault = false;
  let hasActivated = false;
  for (const node of host.childNodes) {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as Element;
      if (el.getAttribute("slot") === "activated") hasActivated = true;
      else hasDefault = true;
    } else if (node.nodeType === Node.TEXT_NODE && (node.textContent?.trim().length ?? 0) > 0) {
      hasDefault = true;
    }
  }
  return { hasDefault, hasActivated };
}

/**
 * 向下拖拽绳端切换开/关。
 *
 * @slot - 关闭态绳端内容（如 `yn-button`）
 * @slot activated - 开启态绳端内容
 *
 * @fires change - 开关变化，`detail.checked` 为当前状态
 * @fires fixed-move - `fixed` 模式下水平拖拽结束，`detail: { x, reverse }`
 */
@customElement("yn-pull-cord-switch")
export class YnPullCordSwitch extends LitElement {
  @property({ type: Boolean, reflect: true }) checked = false;
  /** 开启且 checked 时，顶灯光向锚点上方对称扩散（默认仅向下半圆） */
  @property({ type: Boolean, attribute: "glow-up", reflect: true }) glowUp = false;
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ type: Boolean, reflect: true }) fixed = false;
  @property({ type: Boolean, reflect: true }) reverse = false;
  @property({ type: String, reflect: true }) variant: YnPullCordSwitchVariant = "default";
  @property({ type: String, reflect: true }) size: YnPullCordSwitchSize = "mini";
  /** 绳子长度（px），默认与原先 mini 一致；与 `size` 解耦，仅控制绳身高度与物理参数 */
  @property({ type: Number, attribute: "rope-length", reflect: true })
  ropeLength = DEFAULT_ROPE_LENGTH;
  @property({ type: Number, attribute: "fixed-x", reflect: true }) fixedX?: number;
  /** 仅 `fixed=true` 时：距视口顶部的偏移（px，可为负）；负值 hover 滑出完全露出 */
  @property({ type: Number, reflect: true }) top?: number;
  @property({ type: Number, attribute: "toggle-threshold" }) toggleThreshold?: number;
  /** 绳端卡片距绳头的间距（px，可为负）；未设置时随 `rope-length` 缩放。负值时 fixed 负偏移的 hover 滑出不可用 */
  @property({ type: Number, attribute: "card-offset" }) cardOffset?: number;
  /** 组件层级（映射 `--yn-pull-cord-switch-z-index`）；fixed 模式下控制相对页面的叠放顺序 */
  @property({ type: Number, attribute: "z-index", reflect: true }) zIndex = 1;

  @query("canvas.rope") private ropeCanvas?: HTMLCanvasElement;
  @query(".card") private cardEl?: HTMLElement;
  @query(".fixed-grip") private fixedGripEl?: HTMLElement;
  @query(".stage") private stageEl?: HTMLElement;

  private engine: PullCordRopeEngine | null = null;
  private fixedDrag: PullCordFixedDrag | null = null;
  private hasDefaultSlot = false;
  private hasActivatedSlot = false;
  private cardMode: CardMode = "fallback";
  private peeking = false;
  private stageOffset = { x: 0, y: 0 };
  private stageOffsetValid = false;
  private slotsBound = false;
  private cardMetricsCache: { width: number; height: number } | null = null;

  private readonly onHostPointerEnter = () => this.handlePeekEnter();
  private readonly onHostPointerLeave = () => this.handlePeekLeave();
  private readonly onSlotChange = () => this.refreshSlotFlags();

  static styles = css`
    :host {
      display: block;
      position: relative;
      z-index: var(--yn-pull-cord-switch-z-index, 1);
      width: 100%;
      height: var(--yn-pull-cord-switch-height);
      background: transparent;
      touch-action: none;
      user-select: none;
      -webkit-user-select: none;
      --yn-pull-cord-switch-height: 260px;
      --yn-pull-cord-switch-segment-count: 8;
      --yn-pull-cord-switch-segment-len: 10px;
      --yn-pull-cord-switch-card-offset: 20px;
      --yn-pull-cord-switch-max-pull: 84px;
      --yn-pull-cord-switch-toggle-threshold: 52px;
      --yn-pull-cord-switch-canvas-width: 100%;
      --yn-pull-cord-switch-glow-up-bleed: 72px;
      --yn-pull-cord-switch-slot-transition-duration: 0.28s;
      --yn-pull-cord-switch-fixed-peek-transition-duration: 0.34s;
      --yn-pull-cord-switch-slot-button-scale: 0.88;
    }

    :host([disabled]) {
      opacity: var(--yn-pull-cord-switch-disabled-opacity, 0.55);
      cursor: not-allowed;
    }

    :host([size="mini"]) {
      --yn-pull-cord-switch-ceiling-width: 44;
      --yn-pull-cord-switch-rope-width: 2.5;
      --yn-pull-cord-switch-rope-shadow-width: 4;
      --yn-pull-cord-switch-card-width: 52px;
      --yn-pull-cord-switch-card-height: 30px;
      --yn-pull-cord-switch-card-radius: 7px;
      --yn-pull-cord-switch-card-padding: 4px 6px;
      --yn-pull-cord-switch-card-gap: 2px;
      --yn-pull-cord-switch-card-dot-size: 7px;
      --yn-pull-cord-switch-card-label-size: 8px;
    }

    :host([size="small"]) {
      --yn-pull-cord-switch-ceiling-width: 50;
      --yn-pull-cord-switch-rope-width: 2.75;
      --yn-pull-cord-switch-rope-shadow-width: 4.5;
      --yn-pull-cord-switch-card-width: 62px;
      --yn-pull-cord-switch-card-height: 34px;
      --yn-pull-cord-switch-card-radius: 8px;
      --yn-pull-cord-switch-card-padding: 5px 7px;
      --yn-pull-cord-switch-card-gap: 3px;
      --yn-pull-cord-switch-card-dot-size: 8px;
      --yn-pull-cord-switch-card-label-size: 9px;
    }

    :host([size="medium"]) {
      --yn-pull-cord-switch-ceiling-width: 56;
      --yn-pull-cord-switch-rope-width: 3;
      --yn-pull-cord-switch-rope-shadow-width: 5;
      --yn-pull-cord-switch-card-width: 72px;
      --yn-pull-cord-switch-card-height: 40px;
      --yn-pull-cord-switch-card-radius: 9px;
      --yn-pull-cord-switch-card-padding: 6px 8px;
      --yn-pull-cord-switch-card-gap: 3px;
      --yn-pull-cord-switch-card-dot-size: 9px;
      --yn-pull-cord-switch-card-label-size: 10px;
    }

    :host([variant="floema"][size="mini"]) {
      --yn-pull-cord-switch-card-width: 56px;
      --yn-pull-cord-switch-card-height: 32px;
      --yn-pull-cord-switch-card-radius: 8px;
    }

    :host([variant="floema"][size="small"]) {
      --yn-pull-cord-switch-card-width: 66px;
      --yn-pull-cord-switch-card-height: 38px;
      --yn-pull-cord-switch-card-radius: 10px;
    }

    :host([variant="floema"][size="medium"]) {
      --yn-pull-cord-switch-card-width: 76px;
      --yn-pull-cord-switch-card-height: 44px;
      --yn-pull-cord-switch-card-radius: 11px;
    }

    :host([variant="default"]) {
      --yn-pull-cord-switch-bg-top: var(--yn-color-cord-night-bg-top, #1a1d24);
      --yn-pull-cord-switch-bg-bottom: var(--yn-color-cord-night-bg-bottom, #12141a);
      --yn-pull-cord-switch-bg-on-top: var(--yn-color-cord-night-bg-on-top, #2a2830);
      --yn-pull-cord-switch-bg-on-bottom: var(--yn-color-cord-night-bg-on-bottom, #15141a);
      --yn-pull-cord-switch-accent: var(--yn-color-cord-night-accent, rgba(255, 214, 102, 0.35));
      --yn-pull-cord-switch-ceiling-bg: var(--yn-color-cord-night-ceiling-bg, rgba(255, 255, 255, 0.08));
      --yn-pull-cord-switch-anchor-color: var(--yn-color-cord-night-anchor, #4a4f5c);
      --yn-pull-cord-switch-rope-start: var(--yn-color-cord-night-rope-start, #6b5d4f);
      --yn-pull-cord-switch-rope-end: var(--yn-color-cord-night-rope-end, #9a8468);
      --yn-pull-cord-switch-card-bg: var(--yn-color-cord-night-card-bg, linear-gradient(180deg, #343a46 0%, #22262e 100%));
      --yn-pull-cord-switch-card-border: var(--yn-color-cord-night-card-border, rgba(255, 255, 255, 0.1));
      --yn-pull-cord-switch-card-color: var(--yn-color-cord-night-card-color, rgba(255, 255, 255, 0.88));
      --yn-pull-cord-switch-card-shadow: var(--yn-color-cord-night-card-shadow, 0 8px 16px rgba(0, 0, 0, 0.45));
      --yn-pull-cord-switch-card-bg-on: var(--yn-color-cord-night-card-bg-on, linear-gradient(180deg, #3d4454 0%, #252a34 100%));
      --yn-pull-cord-switch-card-border-on: var(--yn-color-cord-night-card-border-on, rgba(255, 214, 102, 0.45));
      --yn-pull-cord-switch-card-color-on: var(--yn-color-cord-night-card-color-on, #ffd666);
    }

    :host([variant="floema"]) {
      --yn-pull-cord-switch-bg-top: var(--yn-color-cord-day-bg-top, #ebe4d4);
      --yn-pull-cord-switch-bg-bottom: var(--yn-color-cord-day-bg-bottom, #ddd6c4);
      --yn-pull-cord-switch-bg-on-top: var(--yn-color-cord-day-bg-on-top, #f2e8cf);
      --yn-pull-cord-switch-bg-on-bottom: var(--yn-color-cord-day-bg-on-bottom, #e5d6b4);
      --yn-pull-cord-switch-accent: var(--yn-color-cord-day-accent, rgba(212, 165, 116, 0.5));
      --yn-pull-cord-switch-ceiling-bg: var(--yn-color-cord-day-ceiling-bg, rgba(32, 35, 29, 0.07));
      --yn-pull-cord-switch-anchor-color: var(--yn-color-cord-day-anchor, #586247);
      --yn-pull-cord-switch-rope-start: var(--yn-color-cord-day-rope-start, #6f5f4d);
      --yn-pull-cord-switch-rope-end: var(--yn-color-cord-day-rope-end, #a0896c);
      --yn-pull-cord-switch-card-bg: var(--yn-color-cord-day-card-bg, linear-gradient(180deg, #f8f3ea 0%, #ebe4d4 100%));
      --yn-pull-cord-switch-card-border: var(--yn-color-cord-day-card-border, rgba(32, 35, 29, 0.12));
      --yn-pull-cord-switch-card-color: var(--yn-color-cord-day-card-color, #20231d);
      --yn-pull-cord-switch-card-shadow: var(--yn-color-cord-day-card-shadow, 0 14px 28px rgba(48, 42, 34, 0.16));
      --yn-pull-cord-switch-card-bg-on: var(--yn-color-cord-day-card-bg-on, linear-gradient(180deg, #6d7a58 0%, #586247 100%));
      --yn-pull-cord-switch-card-border-on: var(--yn-color-cord-day-card-border-on, rgba(243, 237, 223, 0.28));
      --yn-pull-cord-switch-card-color-on: var(--yn-color-cord-day-card-color-on, #f8f3ea);
    }

    :host([fixed]) {
      position: fixed;
      top: var(--yn-pull-cord-switch-fixed-top, 0);
      width: var(--yn-pull-cord-switch-fixed-width, 112px);
      height: var(--yn-pull-cord-switch-fixed-height, 220px);
      z-index: var(--yn-pull-cord-switch-z-index, var(--yn-pull-cord-switch-fixed-z, 1));
      pointer-events: none;
      overflow: visible;
      --yn-pull-cord-switch-fixed-height: 220px;
      /* host 仅 ~112px 宽，但光晕至少 280px；canvas 需宽于 host，居中绘制 */
      --yn-pull-cord-switch-canvas-width: max(100%, 280px);
    }

    :host([fixed][data-fixed-peekable]) {
      pointer-events: auto;
      transition:
        left var(--yn-pull-cord-switch-fixed-peek-transition-duration) cubic-bezier(0.22, 1, 0.36, 1),
        top var(--yn-pull-cord-switch-fixed-peek-transition-duration) cubic-bezier(0.22, 1, 0.36, 1);
      will-change: left, top;
    }

    :host([fixed][data-fixed-dragging]),
    :host([fixed][data-fixed-layout-lock]) {
      transition: none;
    }

    :host([fixed][size="mini"]) {
      --yn-pull-cord-switch-fixed-width: 112px;
    }

    :host([fixed][size="small"]) {
      --yn-pull-cord-switch-fixed-width: 128px;
    }

    :host([fixed][size="medium"]) {
      --yn-pull-cord-switch-fixed-width: 144px;
    }

    .stage {
      position: relative;
      width: 100%;
      height: 100%;
      overflow: visible;
      background: transparent;
      border-radius: var(--yn-pull-cord-switch-radius, 12px);
    }

    .fixed-grip {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 28px;
      z-index: 2;
      cursor: ew-resize;
      touch-action: none;
      pointer-events: auto;
    }

    .fixed-grip[hidden] {
      display: none;
    }

    canvas.rope {
      z-index: 0;
      position: absolute;
      top: 0;
      left: 50%;
      width: var(--yn-pull-cord-switch-canvas-width, 100%);
      height: 100%;
      transform: translateX(-50%);
      display: block;
      background: transparent;
      cursor: grab;
    }

    :host([glow-up]) canvas.rope {
      top: calc(-1 * var(--yn-pull-cord-switch-glow-up-bleed));
      height: calc(100% + var(--yn-pull-cord-switch-glow-up-bleed));
    }

    :host([disabled]) canvas.rope {
      pointer-events: none;
      cursor: not-allowed;
    }

    .card {
      position: absolute;
      left: 0;
      top: 0;
      width: var(--yn-pull-cord-switch-card-width);
      min-height: var(--yn-pull-cord-switch-card-height);
      transform: translate(-50%, -50%);
      border-radius: var(--yn-pull-cord-switch-card-radius);
      background: var(--yn-pull-cord-switch-card-bg);
      border: 1.5px solid var(--yn-pull-cord-switch-card-border);
      box-shadow: var(--yn-pull-cord-switch-card-shadow);
      color: var(--yn-pull-cord-switch-card-color);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--yn-pull-cord-switch-card-gap);
      padding: var(--yn-pull-cord-switch-card-padding);
      box-sizing: border-box;
      pointer-events: none;
      z-index: 1;
      will-change: transform;
    }

    :host([checked][data-card-mode="fallback"]) .card {
      background: var(--yn-pull-cord-switch-card-bg-on);
      border-color: var(--yn-pull-cord-switch-card-border-on);
      color: var(--yn-pull-cord-switch-card-color-on);
    }

    :host([data-card-mode="fallback"]) .card {
      height: var(--yn-pull-cord-switch-card-height);
    }

    :host([data-card-mode="fallback"]) .card__layers {
      height: 100%;
      min-height: 100%;
    }

    .card__fallback {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--yn-pull-cord-switch-card-gap);
      width: 100%;
      height: 100%;
      box-sizing: border-box;
    }

    :host([data-card-mode="default-slot"]) .card,
    :host([data-card-mode="dual-slot"]) .card {
      background: transparent;
      border-color: transparent;
      box-shadow: none;
      padding: 0;
      min-height: 0;
      width: auto;
      pointer-events: auto;
      cursor: grab;
    }

    :host([data-card-mode="default-slot"]) ::slotted(yn-button),
    :host([data-card-mode="dual-slot"]) ::slotted(yn-button) {
      transform: scale(var(--yn-pull-cord-switch-slot-button-scale));
      transform-origin: top center;
      pointer-events: auto;
      cursor: grab;
    }

    :host([disabled][data-card-mode="default-slot"]) .card,
    :host([disabled][data-card-mode="dual-slot"]) .card,
    :host([disabled]) ::slotted(yn-button) {
      pointer-events: none;
      cursor: not-allowed;
    }

    :host([fixed]) .card {
      pointer-events: auto;
      z-index: 10000;
    }

    .card__layers {
      display: grid;
      place-items: center;
      width: 100%;
      min-height: inherit;
    }

    .card__layer {
      grid-area: 1 / 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transform: translateY(6px);
      transition:
        opacity var(--yn-pull-cord-switch-slot-transition-duration) cubic-bezier(0.22, 1, 0.36, 1),
        transform var(--yn-pull-cord-switch-slot-transition-duration) cubic-bezier(0.22, 1, 0.36, 1);
      pointer-events: none;
    }

    .card__layer--active {
      opacity: 1;
      transform: translateY(0);
      pointer-events: auto;
    }

    .card__layer[aria-hidden="true"] {
      visibility: hidden;
    }

    .card__fallback[aria-hidden="true"] {
      display: none;
    }

    .card__dot {
      width: var(--yn-pull-cord-switch-card-dot-size);
      height: var(--yn-pull-cord-switch-card-dot-size);
      border-radius: 50%;
      background: currentColor;
      opacity: 0.85;
    }

    .card__label {
      font-size: var(--yn-pull-cord-switch-card-label-size);
      font-weight: 600;
      letter-spacing: 0.04em;
      line-height: 1;
      display: block;
    }
  `;

  connectedCallback() {
    super.connectedCallback();
    this.setAttribute("role", "switch");
    this.refreshSlotFlags();
    this.syncRopeLengthVars();
    this.syncZIndex();
    this.updateComplete.then(() => {
      this.bindSlotListeners();
      this.mountEngine();
      if (this.fixed) {
        this.setupFixedMode();
        this.syncFixedTop();
        this.applyInitialFixedPosition();
      }
    });
  }

  disconnectedCallback() {
    this.unbindSlotListeners();
    this.teardownFixedMode();
    this.engine?.stop();
    this.engine = null;
    super.disconnectedCallback();
  }

  protected updated(changed: Map<PropertyKey, unknown>) {
    this.setAttribute("aria-checked", String(this.checked));

    if (changed.has("fixed")) {
      if (this.fixed) {
        this.setupFixedMode();
        this.syncFixedTop();
        this.applyInitialFixedPosition();
      } else {
        this.teardownFixedMode();
        this.style.removeProperty("left");
        this.style.removeProperty("top");
        this.style.removeProperty("transform");
        this.removeAttribute("data-fixed-peekable");
      }
      this.syncRopeLengthVars();
    }

    if (changed.has("ropeLength")) {
      this.syncRopeLengthVars();
      this.invalidateCardMetrics();
      this.engine?.invalidateTheme();
      this.engine?.resize();
    }

    if (changed.has("cardOffset")) {
      this.syncRopeLengthVars();
      this.engine?.invalidateTheme();
      this.engine?.requestFrame();
      if (this.fixed) {
        this.syncPeekableAttr();
        if (!this.isPeekable && this.peeking) {
          this.handlePeekLeave();
        }
      }
    }

    if (changed.has("glowUp")) {
      this.engine?.invalidateLayout();
      this.engine?.resize();
    }

    if (changed.has("toggleThreshold")) {
      this.engine?.requestFrame();
    }

    if (changed.has("zIndex")) {
      this.syncZIndex();
    }

    if (this.fixed && (changed.has("fixedX") || changed.has("reverse")) && !this.peeking) {
      this.applyInitialFixedPosition();
    }

    if (this.fixed && changed.has("top")) {
      if (!this.peeking) {
        this.syncFixedTop();
      }
      this.syncPeekableAttr();
    }

    if (this.fixed && changed.has("disabled")) {
      this.syncPeekableAttr();
      if (this.peeking) {
        this.handlePeekLeave();
      }
    }

    if (changed.has("fixed") || changed.has("disabled")) {
      this.syncEngineInteractionTargets();
    }

    if (this.fixed && !this.fixedDrag && this.fixedGripEl) {
      this.setupFixedMode();
      this.applyInitialFixedPosition();
    }

    if (!this.engine) return;

    if (changed.has("variant") || changed.has("size")) {
      this.invalidateStageOffset();
      this.invalidateCardMetrics();
      this.engine.invalidateTheme();
      this.engine.resize();
    }
    if (changed.has("checked")) {
      this.invalidateStageOffset();
      this.invalidateCardMetrics();
      this.engine.invalidateTheme();
      this.engine.requestFrame();
    }
    if (changed.has("disabled")) {
      this.engine.requestFrame();
    }
  }

  private refreshSlotFlags() {
    const prevMode = this.cardMode;
    const slots = scanLightDomSlots(this);
    this.hasDefaultSlot = slots.hasDefault;
    this.hasActivatedSlot = slots.hasActivated;
    this.cardMode = this.hasActivatedSlot
      ? "dual-slot"
      : this.hasDefaultSlot
        ? "default-slot"
        : "fallback";
    this.syncCardModeAttr();
    if (prevMode !== this.cardMode) {
      this.syncRopeLengthVars();
      this.invalidateStageOffset();
      this.invalidateCardMetrics();
      this.syncEngineInteractionTargets();
      this.engine?.invalidateTheme();
      this.engine?.resize();
    }
  }

  private bindSlotListeners() {
    if (this.slotsBound || !this.shadowRoot) return;
    this.slotsBound = true;
    for (const slot of this.shadowRoot.querySelectorAll("slot")) {
      slot.addEventListener("slotchange", this.onSlotChange);
    }
  }

  private unbindSlotListeners() {
    if (!this.slotsBound || !this.shadowRoot) return;
    for (const slot of this.shadowRoot.querySelectorAll("slot")) {
      slot.removeEventListener("slotchange", this.onSlotChange);
    }
    this.slotsBound = false;
  }

  private invalidateCardMetrics() {
    this.cardMetricsCache = null;
  }

  private invalidateStageOffset() {
    this.stageOffsetValid = false;
  }

  private syncRopeLengthVars() {
    applyRopeLengthVars(this, normalizeRopeLength(this.ropeLength), {
      cardOffset: this.cardOffset
    });
  }

  private usesSlotCard() {
    return this.cardMode === "default-slot" || this.cardMode === "dual-slot";
  }

  private syncZIndex() {
    if (Number.isFinite(this.zIndex)) {
      this.style.setProperty("--yn-pull-cord-switch-z-index", String(this.zIndex));
    } else {
      this.style.removeProperty("--yn-pull-cord-switch-z-index");
    }
  }

  private cardTransformAnchor() {
    return this.usesSlotCard() ? "translate(-50%, 0)" : "translate(-50%, -50%)";
  }

  private syncCardModeAttr() {
    const next = this.cardMode;
    if (this.getAttribute("data-card-mode") !== next) {
      this.setAttribute("data-card-mode", next);
    }
  }

  private get showFallback() {
    if (this.cardMode === "fallback") return true;
    if (this.cardMode === "dual-slot" && !this.hasDefaultSlot && !this.checked) return true;
    return false;
  }

  private getResolvedCardOffset(): number {
    if (this.cardOffset != null && Number.isFinite(this.cardOffset)) {
      return this.cardOffset;
    }
    const raw = this.style.getPropertyValue("--yn-pull-cord-switch-card-offset").trim();
    const parsed = Number.parseFloat(raw);
    return Number.isFinite(parsed) ? parsed : 20;
  }

  private get isPeekable() {
    return (
      this.fixed &&
      !this.disabled &&
      this.getResolvedCardOffset() >= 0 &&
      ((this.fixedX != null && this.fixedX < 0) || (this.top != null && this.top < 0))
    );
  }

  private syncFixedTop() {
    if (!this.fixed) return;
    if (this.top != null && Number.isFinite(this.top)) {
      applyCssTop(this, this.top);
    } else {
      this.style.removeProperty("top");
    }
  }

  private setupFixedMode() {
    this.addEventListener("pointerenter", this.onHostPointerEnter);
    this.addEventListener("pointerleave", this.onHostPointerLeave);
    const grip = this.fixedGripEl;
    if (!grip || this.fixedDrag) return;
    this.fixedDrag = new PullCordFixedDrag({
      host: this,
      grip,
      getReverse: () => this.reverse,
      getDisabled: () => this.disabled,
      onPositionChange: (logical) => {
        this.fixedX = logical;
        this.syncPeekableAttr();
        this.dispatchFixedMove();
      },
      onDragStateChange: (dragging) => {
        if (dragging) {
          this.setAttribute("data-fixed-dragging", "");
        } else {
          this.removeAttribute("data-fixed-dragging");
        }
      }
    });
    this.fixedDrag.bind();
  }

  private teardownFixedMode() {
    this.removeEventListener("pointerenter", this.onHostPointerEnter);
    this.removeEventListener("pointerleave", this.onHostPointerLeave);
    this.fixedDrag?.unbind();
    this.fixedDrag = null;
    this.peeking = false;
  }

  private applyInitialFixedPosition() {
    if (!this.fixed) return;
    this.setAttribute("data-fixed-layout-lock", "");
    if (this.hasAttribute("fixed-x") && this.fixedX != null && Number.isFinite(this.fixedX)) {
      applyCssLeft(this, logicalToCssLeft(this.fixedX, this, this.reverse));
    } else if (this.fixedDrag) {
      this.fixedDrag.center();
    } else {
      const logical = centerLogical(this, this.reverse);
      applyCssLeft(this, logicalToCssLeft(logical, this, this.reverse));
    }
    this.syncFixedTop();
    this.syncPeekableAttr();
    requestAnimationFrame(() => {
      requestAnimationFrame(() => this.removeAttribute("data-fixed-layout-lock"));
    });
  }

  private syncPeekableAttr() {
    if (this.isPeekable) {
      this.setAttribute("data-fixed-peekable", "");
    } else {
      this.removeAttribute("data-fixed-peekable");
    }
  }

  private handlePeekEnter() {
    if (!this.isPeekable || this.peeking || this.disabled) return;
    this.peeking = true;
    this.setAttribute("data-fixed-peeking", "");
    if (this.fixedX != null && this.fixedX < 0) {
      applyCssLeft(this, peekCssLeft(this, this.reverse));
    }
    if (this.top != null && this.top < 0) {
      applyCssTop(this, peekCssTop());
    }
  }

  private handlePeekLeave() {
    if (!this.peeking) return;
    this.peeking = false;
    this.removeAttribute("data-fixed-peeking");
    if (this.fixedX != null && this.fixedX < 0 && Number.isFinite(this.fixedX)) {
      applyCssLeft(this, logicalToCssLeft(this.fixedX, this, this.reverse));
    }
    if (this.top != null && this.top < 0 && Number.isFinite(this.top)) {
      applyCssTop(this, this.top);
    }
  }

  private dispatchFixedMove() {
    this.dispatchEvent(
      new CustomEvent<{ x: number; reverse: boolean }>("fixed-move", {
        detail: { x: this.fixedX ?? 0, reverse: this.reverse },
        bubbles: true,
        composed: true
      })
    );
  }

  private getCanvasStageOffset() {
    if (this.stageOffsetValid) return this.stageOffset;
    const canvas = this.ropeCanvas;
    const stage = this.stageEl;
    if (!canvas || !stage) return this.stageOffset;
    const cr = canvas.getBoundingClientRect();
    const sr = stage.getBoundingClientRect();
    this.stageOffset = { x: cr.left - sr.left, y: cr.top - sr.top };
    this.stageOffsetValid = true;
    return this.stageOffset;
  }

  /** 绳端可见元素（插槽按钮含 scale 后的视觉包围盒） */
  private getActiveCardVisualEl(): Element | null {
    if (this.cardMode === "fallback") {
      return this.cardEl ?? null;
    }
    const pickAssigned = (slot: HTMLSlotElement | null) => {
      const nodes = slot?.assignedElements({ flatten: true }) ?? [];
      const button = nodes.find((node) => node.tagName === "YN-BUTTON");
      return button ?? nodes[0] ?? null;
    };
    if (this.cardMode === "dual-slot") {
      const slot = this.checked
        ? (this.shadowRoot?.querySelector('slot[name="activated"]') as HTMLSlotElement | null)
        : (this.shadowRoot?.querySelector("slot:not([name])") as HTMLSlotElement | null);
      return pickAssigned(slot) ?? this.cardEl ?? null;
    }
    const slot = this.shadowRoot?.querySelector("slot:not([name])") as HTMLSlotElement | null;
    return pickAssigned(slot) ?? this.cardEl ?? null;
  }

  private measureCardMetrics() {
    if (!this.usesSlotCard()) return null;
    if (this.cardMetricsCache) return this.cardMetricsCache;
    const target = this.getActiveCardVisualEl();
    if (!target) return null;
    const rect = target.getBoundingClientRect();
    if (rect.width < 1 || rect.height < 1) return null;
    this.cardMetricsCache = { width: rect.width, height: rect.height };
    return this.cardMetricsCache;
  }

  private syncEngineInteractionTargets() {
    if (!this.engine) return;
    const targets: HTMLElement[] = [];
    if (this.ropeCanvas && !this.fixed) targets.push(this.ropeCanvas);
    if (this.cardEl && (this.fixed || this.usesSlotCard())) {
      targets.push(this.cardEl);
    }
    this.engine.setInteractionTargets(targets);
  }

  private mountEngine() {
    if (!this.ropeCanvas || this.engine) return;
    try {
      this.engine = new PullCordRopeEngine({
        canvas: this.ropeCanvas,
        host: this,
        getChecked: () => this.checked,
        getGlowUp: () => this.glowUp,
        getDisabled: () => this.disabled,
        getToggleThreshold: () => this.toggleThreshold,
        getCardMetrics: () => this.measureCardMetrics(),
        getCardAnchor: () => (this.usesSlotCard() ? "top" : "center"),
        onCheckedChange: (checked) => this.setChecked(checked, true),
        onCardTransform: ({ x, y, tilt }) => {
          const card = this.cardEl;
          if (!card) return;
          const off = this.getCanvasStageOffset();
          card.style.transform = `translate(${x + off.x}px, ${y + off.y}px) ${this.cardTransformAnchor()} rotate(${tilt}rad)`;
        }
      });
      this.engine.start();
      this.syncEngineInteractionTargets();
      this.invalidateStageOffset();
      if (this.fixed) {
        requestAnimationFrame(() => {
          this.invalidateStageOffset();
          this.invalidateCardMetrics();
          this.engine?.resize();
        });
      }
    } catch (error) {
      if (!(error instanceof Error) || error.message !== "CANVAS_2D_UNAVAILABLE") {
        throw error;
      }
    }
  }

  private setChecked(next: boolean, fromUser: boolean) {
    if (this.checked === next) return;
    this.checked = next;
    if (fromUser) {
      this.dispatchEvent(
        new CustomEvent<{ checked: boolean }>("change", {
          detail: { checked: next },
          bubbles: true,
          composed: true
        })
      );
    }
    this.requestUpdate();
  }

  private renderFallback() {
    return html`
      <div class="card__fallback" aria-hidden=${this.showFallback ? "false" : "true"}>
        <span class="card__dot"></span>
        <span class="card__label">${this.checked ? "ON" : "OFF"}</span>
      </div>
    `;
  }

  private renderCardBody() {
    if (this.cardMode === "dual-slot") {
      return html`
        <div class="card__layers">
          <div
            class="card__layer ${this.checked ? "" : "card__layer--active"}"
            aria-hidden=${this.checked ? "true" : "false"}
          >
            <slot></slot>
            ${!this.hasDefaultSlot ? this.renderFallback() : ""}
          </div>
          <div
            class="card__layer ${this.checked ? "card__layer--active" : ""}"
            aria-hidden=${this.checked ? "false" : "true"}
          >
            <slot name="activated"></slot>
          </div>
        </div>
      `;
    }

    if (this.cardMode === "default-slot") {
      return html`
        <div class="card__layers">
          <slot></slot>
        </div>
      `;
    }

    return html`
      <div class="card__layers">
        <slot></slot>
        ${this.renderFallback()}
      </div>
    `;
  }

  render() {
    return html`
      <div class="stage" part="stage">
        <div
          class="fixed-grip"
          part="fixed-grip"
          role="presentation"
          aria-label="水平拖动调整位置"
          ?hidden=${!this.fixed}
        ></div>
        <canvas class="rope" aria-hidden="true"></canvas>
        <div class="card" part="card">${this.renderCardBody()}</div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "yn-pull-cord-switch": YnPullCordSwitch;
  }
}
