import { LitElement, css, html } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { unsafeHTML } from "lit/directives/unsafe-html.js";

export type YnToastType = "success" | "info" | "warning" | "error";

export type YnToastShowOptions = {
  duration?: number;
  loadingDuration?: number;
  persist?: boolean;
};

export type YnToastDoneOptions = {
  duration?: number;
  persist?: boolean;
};

type YnToastDisplayOptions = YnToastShowOptions & {
  type?: YnToastType;
  message?: string;
  mask?: boolean;
};

type YnToastFinishOptions = YnToastDoneOptions & {
  type?: YnToastType;
  message?: string;
};

export type YnToastController = {
  readonly element: YnToast;
  done: (type: YnToastType, message?: string, options?: YnToastDoneOptions) => void;
  hide: () => void;
};

export type YnToastShortcutController = {
  readonly element: YnToast;
  done: (message?: string, options?: YnToastDoneOptions) => void;
  hide: () => void;
};

export type YnToastTask<T> = (instance: YnToastController) => T | Promise<T>;

export type YnToastShortcutTask<T> = (instance: YnToastShortcutController) => T | Promise<T>;

export type YnToastDetail = {
  type: YnToastType;
  message: string;
  source: "api" | "swipe" | "timer" | "property";
};

type ToastPhase = "idle" | "loading" | "success";

const DEFAULT_ICONS: Record<YnToastType, string> = {
  success: "M5 12l5 5L20 7",
  info: "M12 10v7M12 7h.01",
  warning: "M12 6v8M12 18h.01",
  error: "M7 7l10 10M17 7L7 17"
};

const DEFAULT_MESSAGES: Record<YnToastType, string> = {
  success: "success!",
  info: "info!",
  warning: "warning!",
  error: "error!"
};

@customElement("yn-toast")
export class YnToast extends LitElement {
  @property({ type: String, reflect: true }) type: YnToastType = "success";
  @property({ type: String }) message = "";
  @property({ type: Number }) duration = 2600;
  @property({ type: Number, attribute: "loading-duration" }) loadingDuration = 1400;
  @property({ type: Boolean, reflect: true }) persist = false;

  @query(".pill") private pillEl!: HTMLElement;
  @query(".msg") private msgEl!: HTMLElement;
  @query(".ring") private ringEl!: SVGElement;
  @query(".arc-primary") private primaryArcEl!: SVGCircleElement;
  @query(".arc-secondary") private secondaryArcEl!: SVGCircleElement;

  @state() private phase: ToastPhase = "idle";
  @state() private variant: YnToastType = "success";
  @state() private iconPath = DEFAULT_ICONS.success;
  @state() private currentMessage = DEFAULT_MESSAGES.success;
  @state() private hasMessage = true;
  @state() private wrap = false;
  @state() private grow = false;
  @state() private closing = false;
  @state() private resetting = false;
  @state() private loadingMask = false;

  private hideTimer = 0;
  private loadingTimer = 0;
  private spinFrame = 0;
  private spinAngle = 0;
  private spinStart = 0;
  private lastSpinTime = 0;
  private shapeAnimation: Animation | null = null;
  private swipeStartY = 0;
  private isSwiping = false;
  private runId = 0;

  static styles = css`
    :host {
      --yn-toast-height: 36px;
      --yn-toast-ball-size: 32px;
      --yn-toast-bg: rgba(246, 241, 230, 0.92);
      --yn-toast-text-color: #20231d;
      --yn-toast-success-color: #667a48;
      --yn-toast-info-color: #5f6f86;
      --yn-toast-warning-color: #b87d55;
      --yn-toast-error-color: #9a4f43;
      --yn-toast-paper-color: #f3eddf;
      --yn-toast-max-width: 90vw;
      --yn-toast-top: 26px;
      --yn-toast-z-index: 1600;
      --yn-toast-ease: cubic-bezier(0.22, 1, 0.36, 1);
      --yn-toast-message-padding: 0 14px 0 6px;
      --yn-toast-message-font-size: 0.8rem;
      --yn-toast-message-letter-spacing: 0.18em;
      --yn-toast-mask-bg: rgba(32, 35, 29, 0.18);
      --yn-toast-shadow:
        inset 0 0 0 1px rgba(255, 255, 255, 0.48),
        inset 0 -1px 0 rgba(32, 35, 29, 0.06),
        0 18px 45px rgba(62, 55, 42, 0.14),
        0 5px 16px rgba(62, 55, 42, 0.08);
      position: fixed;
      inset: 0;
      z-index: var(--yn-toast-z-index);
      display: flex;
      align-items: flex-start;
      justify-content: center;
      padding-top: var(--yn-toast-top);
      pointer-events: none;
    }

    * {
      box-sizing: border-box;
    }

    .mask {
      position: absolute;
      inset: 0;
      z-index: 0;
      background: var(--yn-toast-mask-bg);
      backdrop-filter: blur(2px);
      pointer-events: auto;
    }

    .pill {
      position: relative;
      z-index: 1;
      --w: var(--yn-toast-height);
      height: var(--yn-toast-height);
      width: var(--w);
      max-width: var(--yn-toast-max-width);
      border: 0;
      border-radius: calc(var(--yn-toast-height) / 2);
      background: var(--yn-toast-bg);
      box-shadow: var(--yn-toast-shadow);
      color: var(--yn-toast-text-color);
      display: flex;
      align-items: center;
      flex-direction: row;
      overflow: hidden;
      backdrop-filter: blur(22px);
      touch-action: none;
      cursor: pointer;
      pointer-events: auto;
      contain: layout paint;
      transition:
        width 0.62s var(--yn-toast-ease),
        height 0.52s var(--yn-toast-ease),
        border-radius 0.55s var(--yn-toast-ease),
        box-shadow 0.4s ease,
        opacity 0.32s ease,
        transform 0.4s var(--yn-toast-ease);
    }

    .pill[data-phase="idle"] {
      opacity: 0;
      transform: translateY(-12px) scale(0.92);
      pointer-events: none;
      transition:
        opacity 0.25s ease,
        transform 0.35s var(--yn-toast-ease),
        height 0.52s var(--yn-toast-ease),
        width 0.62s var(--yn-toast-ease),
        border-radius 0.55s var(--yn-toast-ease);
    }

    .pill[data-resetting="true"] {
      transition: none !important;
    }

    .pill[data-phase="loading"],
    .pill[data-phase="success"] {
      opacity: 1;
      transform: translateY(var(--swipe-y, 0px)) scale(1);
      will-change: width, height, transform;
    }

    .pill[data-phase="loading"] {
      --w: var(--yn-toast-height);
    }

    .pill[data-phase="success"] {
      --w: min(var(--yn-toast-max-width), var(--success-w, 238px));
      border-radius: calc(var(--yn-toast-height) / 2);
    }

    .pill[data-grow="true"] {
      height: var(--wrap-h, var(--yn-toast-height));
      border-radius: 18px;
    }

    .pill[data-wrap="true"] {
      align-items: flex-start;
    }

    .pill[data-wrap="true"] .ball-slot {
      align-self: center;
    }

    .pill[data-has-message="false"] .msg {
      width: 0;
      max-width: 0;
      padding: 0;
      visibility: hidden;
      opacity: 0;
    }

    .ball-slot {
      flex: 0 0 var(--yn-toast-height);
      width: var(--yn-toast-height);
      height: var(--yn-toast-height);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .ball {
      width: var(--yn-toast-ball-size);
      height: var(--yn-toast-ball-size);
      border-radius: 50%;
      position: relative;
      display: grid;
      place-items: center;
      transition: transform 0.45s var(--yn-toast-ease);
    }

    .ring {
      position: absolute;
      width: 28px;
      height: 28px;
      z-index: 2;
      opacity: 1;
      overflow: visible;
      transform-origin: center;
      transform-box: fill-box;
      backface-visibility: hidden;
      transition:
        opacity 0.28s ease,
        transform 0.45s var(--yn-toast-ease);
    }

    .pill[data-phase="loading"] .ring {
      transition: opacity 0.28s ease;
      will-change: transform;
    }

    .ring .track {
      fill: none;
      stroke: rgba(32, 35, 29, 0.08);
      stroke-width: 2;
    }

    .ring .arc {
      fill: none;
      stroke: var(--yn-toast-text-color);
      stroke-width: 2.35;
      stroke-linecap: round;
      stroke-dasharray: 15 85;
      opacity: var(--spin-opacity, 0.96);
      filter: drop-shadow(0 0 2px rgba(32, 35, 29, 0.08));
      transform-origin: center;
      transform-box: fill-box;
    }

    .ring .arc-primary {
      stroke-dashoffset: 8;
    }

    .ring .arc-secondary {
      stroke-dashoffset: 58;
    }

    .pill[data-phase="success"] .ring {
      opacity: 0;
      transform: scale(0.88);
      animation: none;
    }

    .core {
      position: absolute;
      z-index: 1;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--yn-toast-success-color);
      opacity: 0;
      transform: scale(0.35);
      transform-origin: center;
      box-shadow: 0 0 0 0 rgba(102, 122, 72, 0);
      transition:
        opacity 0.2s ease,
        transform 0.58s var(--yn-toast-ease),
        background 0.35s ease,
        width 0.45s var(--yn-toast-ease),
        height 0.45s var(--yn-toast-ease),
        border-radius 0.45s var(--yn-toast-ease),
        box-shadow 0.48s var(--yn-toast-ease);
    }

    .pill[data-phase="success"] .core {
      width: 28px;
      height: 28px;
      opacity: 1;
      transform: scale(1);
    }

    .pill[data-variant="info"] .core {
      background: var(--yn-toast-info-color);
    }

    .pill[data-variant="warning"] .core {
      background: var(--yn-toast-warning-color);
    }

    .pill[data-variant="error"] .core {
      background: var(--yn-toast-error-color);
    }

    .check {
      position: absolute;
      z-index: 3;
      width: 14px;
      height: 14px;
      opacity: 0;
      transform: scale(0.5) rotate(-12deg);
      transition: opacity 0.3s ease 0.24s, transform 0.45s var(--yn-toast-ease) 0.22s;
      pointer-events: none;
    }

    .pill[data-phase="success"] .check {
      opacity: 1;
      transform: scale(1) rotate(0deg);
    }

    .check svg {
      display: block;
      width: 100%;
      height: 100%;
    }

    .check path {
      fill: none;
      stroke: var(--yn-toast-paper-color);
      stroke-width: 2.2;
      stroke-linecap: round;
      stroke-linejoin: round;
      stroke-dasharray: 24;
      stroke-dashoffset: 24;
    }

    .pill[data-phase="success"] .check path {
      animation: draw-check 0.45s var(--yn-toast-ease) 0.18s forwards;
    }

    @keyframes draw-check {
      to {
        stroke-dashoffset: 0;
      }
    }

    .msg {
      flex: 0 0 auto;
      width: var(--msg-w, auto);
      min-width: 0;
      padding: var(--yn-toast-message-padding);
      color: var(--yn-toast-text-color);
      font-size: var(--yn-toast-message-font-size);
      font-weight: 800;
      letter-spacing: var(--yn-toast-message-letter-spacing);
      text-transform: uppercase;
      white-space: nowrap;
      visibility: hidden;
      opacity: 0;
      transform: none;
      max-width: var(--msg-w, 320px);
      transition: none;
    }

    .pill[data-phase="success"] .msg {
      visibility: visible;
      opacity: 1;
    }

    .pill[data-wrap="true"] .msg,
    .pill[data-closing="true"] .msg {
      white-space: normal;
      overflow-wrap: anywhere;
      line-height: 1.25;
    }
  `;

  disconnectedCallback() {
    this.clearTimers();
    this.resetShapeAnimation();
    this.stopSpin();
    super.disconnectedCallback();
  }

  show(): Promise<void>;
  show(type: YnToastType, message?: string, options?: YnToastShowOptions): Promise<void>;
  show<T>(task: YnToastTask<T>, mask?: boolean): Promise<T>;
  async show<T>(
    input?: YnToastType | YnToastTask<T>,
    messageOrMask?: string | boolean,
    options: YnToastShowOptions = {}
  ): Promise<T | void> {
    if (typeof input === "function") {
      return this.runTask(input, undefined, Boolean(messageOrMask));
    }

    const normalized = this.normalizeShowOptions(input, messageOrMask as string | undefined, options);
    const id = this.startLoading(normalized);
    const loadingDuration = typeof input === "string" ? 0 : (normalized.loadingDuration ?? this.loadingDuration);

    this.loadingTimer = window.setTimeout(() => {
      this.finish(normalized, id);
    }, Math.max(0, loadingDuration));
  }

  success(message?: string, options?: YnToastShowOptions): Promise<void>;
  success<T>(task: YnToastShortcutTask<T>, mask?: boolean): Promise<T>;
  success<T>(
    input?: string | YnToastShortcutTask<T>,
    optionsOrMask: YnToastShowOptions | boolean = {}
  ): Promise<T | void> {
    return this.showShortcut("success", input, optionsOrMask);
  }

  info(message?: string, options?: YnToastShowOptions): Promise<void>;
  info<T>(task: YnToastShortcutTask<T>, mask?: boolean): Promise<T>;
  info<T>(
    input?: string | YnToastShortcutTask<T>,
    optionsOrMask: YnToastShowOptions | boolean = {}
  ): Promise<T | void> {
    return this.showShortcut("info", input, optionsOrMask);
  }

  warning(message?: string, options?: YnToastShowOptions): Promise<void>;
  warning<T>(task: YnToastShortcutTask<T>, mask?: boolean): Promise<T>;
  warning<T>(
    input?: string | YnToastShortcutTask<T>,
    optionsOrMask: YnToastShowOptions | boolean = {}
  ): Promise<T | void> {
    return this.showShortcut("warning", input, optionsOrMask);
  }

  error(message?: string, options?: YnToastShowOptions): Promise<void>;
  error<T>(task: YnToastShortcutTask<T>, mask?: boolean): Promise<T>;
  error<T>(
    input?: string | YnToastShortcutTask<T>,
    optionsOrMask: YnToastShowOptions | boolean = {}
  ): Promise<T | void> {
    return this.showShortcut("error", input, optionsOrMask);
  }

  hide(source: YnToastDetail["source"] = "api") {
    this.runId += 1;
    this.clearTimers();
    this.resetShapeAnimation();
    this.stopSpin();
    this.closing = true;
    this.loadingMask = false;
    this.phase = "idle";
    this.emitEvent("close", source);
  }

  done(type: YnToastType, message?: string, options: YnToastDoneOptions = {}) {
    this.finish(this.normalizeDoneOptions(type, message, options), this.runId);
  }

  private async showShortcut<T>(
    type: YnToastType,
    input?: string | YnToastShortcutTask<T>,
    optionsOrMask: YnToastShowOptions | boolean = {}
  ) {
    if (typeof input === "function") {
      return this.runTask(input, type, Boolean(optionsOrMask));
    }

    const options = typeof optionsOrMask === "boolean" ? {} : optionsOrMask;
    const normalized = { ...options, type, message: input };
    const id = this.startLoading(normalized);

    this.loadingTimer = window.setTimeout(() => {
      this.finish(normalized, id);
    }, 0);
  }

  private runTask<T>(task: YnToastTask<T>, type?: undefined, mask?: boolean): Promise<T>;
  private runTask<T>(task: YnToastShortcutTask<T>, type: YnToastType, mask?: boolean): Promise<T>;
  private async runTask<T>(task: YnToastTask<T> | YnToastShortcutTask<T>, type?: YnToastType, mask = false) {
    const id = this.startLoading({ type, mask });
    const controller = {
      element: this,
      done: (...args: [YnToastType, string?, YnToastDoneOptions?] | [string?, YnToastDoneOptions?]) => {
        this.finish(this.normalizeDoneArguments(type, args), id);
      },
      hide: () => {
        if (id !== this.runId) return;
        this.hide("api");
      }
    } as YnToastController & YnToastShortcutController;

    try {
      return await task(controller);
    } catch (error) {
      if (id === this.runId) {
        const message = error instanceof Error ? error.message : DEFAULT_MESSAGES.error;
        this.finish({ type: "error", message }, id);
      }
      throw error;
    }
  }

  private normalizeShowOptions(
    input?: YnToastType,
    message?: string,
    options: YnToastShowOptions = {}
  ): YnToastDisplayOptions {
    return { ...options, type: input, message };
  }

  private normalizeDoneOptions(
    type: YnToastType,
    message?: string,
    options: YnToastDoneOptions = {}
  ): YnToastFinishOptions {
    return { ...options, type, message };
  }

  private normalizeDoneArguments(
    shortcutType: YnToastType | undefined,
    args: [YnToastType, string?, YnToastDoneOptions?] | [string?, YnToastDoneOptions?]
  ): YnToastFinishOptions {
    if (shortcutType) {
      const [message, options = {}] = args as [string?, YnToastDoneOptions?];
      return { ...options, type: shortcutType, message };
    }

    const [type, message, options = {}] = args as [YnToastType, string?, YnToastDoneOptions?];
    return { ...options, type, message };
  }

  private startLoading(options: YnToastDisplayOptions) {
    const type = options.type ?? this.type;
    const fallbackMessage = this.message || DEFAULT_MESSAGES[type];
    const nextMessage = options.message ?? fallbackMessage;

    this.runId += 1;
    this.clearTimers();
    this.resetShapeAnimation();
    this.variant = type;
    this.currentMessage = nextMessage;
    this.iconPath = DEFAULT_ICONS[type];
    this.hasMessage = nextMessage.trim().length > 0;
    this.wrap = false;
    this.grow = false;
    this.closing = false;
    this.loadingMask = Boolean(options.mask);
    this.phase = "loading";
    this.startSpin();
    this.emitEvent("show", "api");

    return this.runId;
  }

  private finish(options: YnToastFinishOptions, id: number) {
    if (id !== this.runId) return;
    if (this.hideTimer) window.clearTimeout(this.hideTimer);
    if (this.loadingTimer) window.clearTimeout(this.loadingTimer);
    this.hideTimer = 0;
    this.loadingTimer = 0;

    const type = options.type ?? this.type;
    const fallbackMessage = this.message || DEFAULT_MESSAGES[type];
    const message = options.message ?? fallbackMessage;
    const duration = options.duration ?? this.duration;
    const persist = options.persist ?? this.persist;

    this.loadingMask = false;
    this.variant = type;
    this.currentMessage = message;
    this.iconPath = DEFAULT_ICONS[type];
    this.hasMessage = message.trim().length > 0;
    this.loadingTimer = window.setTimeout(async () => {
      if (id !== this.runId) return;
      this.stopSpin();
      await this.updateComplete;
      const dimensions = this.updateSuccessWidth();

      if (dimensions.shouldWrap) {
        this.runWrappedShapeAnimation(dimensions);
      } else {
        this.wrap = false;
        this.grow = false;
        this.pillEl.style.width = "";
        this.pillEl.style.height = "";
        this.pillEl.style.borderRadius = "";
        this.phase = "success";
      }

      if (persist) return;

      this.hideTimer = window.setTimeout(() => {
        this.hide("timer");
      }, Math.max(0, duration));
    }, 0);
  }

  private clearTimers() {
    if (this.hideTimer) window.clearTimeout(this.hideTimer);
    if (this.loadingTimer) window.clearTimeout(this.loadingTimer);
    this.hideTimer = 0;
    this.loadingTimer = 0;
  }

  private setPhase(phase: ToastPhase) {
    this.phase = phase;
  }

  private resetShapeAnimation() {
    if (!this.pillEl) return;
    if (this.shapeAnimation) this.shapeAnimation.cancel();
    this.shapeAnimation = null;
    this.pillEl.getAnimations().forEach((animation) => animation.cancel());
    this.resetting = true;
    this.phase = "idle";
    this.wrap = false;
    this.grow = false;
    this.closing = false;
    this.loadingMask = false;
    this.pillEl.style.width = "";
    this.pillEl.style.height = "";
    this.pillEl.style.borderRadius = "";
    this.pillEl.style.removeProperty("--swipe-y");
    void this.pillEl.offsetWidth;
    this.resetting = false;
  }

  private stopSpin() {
    if (this.spinFrame) cancelAnimationFrame(this.spinFrame);
    this.spinFrame = 0;
    if (!this.ringEl) return;
    this.ringEl.style.transform = "";
    this.ringEl.style.removeProperty("--spin-opacity");
    this.primaryArcEl.style.transform = "";
    this.secondaryArcEl.style.transform = "";
  }

  private startSpin() {
    this.stopSpin();
    this.spinAngle = 0;
    this.spinStart = performance.now();
    this.lastSpinTime = this.spinStart;

    const tick = (now: number) => {
      const dt = (now - this.lastSpinTime) / 1000;
      const elapsed = now - this.spinStart;
      const progress = Math.min(elapsed / this.loadingDuration, 1);
      const smooth = progress * progress * progress;
      const speed = 420 + smooth * 4300;
      const visualSoftness = Math.min(progress * 1.35, 1);

      this.lastSpinTime = now;
      this.spinAngle = (this.spinAngle + speed * dt) % 360;
      this.ringEl.style.setProperty("--spin-opacity", String(0.92 - visualSoftness * 0.22));
      this.primaryArcEl.style.transform = `rotate(${this.spinAngle}deg)`;
      this.secondaryArcEl.style.transform = `rotate(${-this.spinAngle}deg)`;
      this.spinFrame = requestAnimationFrame(tick);
    };

    this.spinFrame = requestAnimationFrame(tick);
  }

  private updateSuccessWidth() {
    const pillHeight = parseFloat(getComputedStyle(this.pillEl).getPropertyValue("--yn-toast-height"));
    const messageWidth = this.hasMessage ? this.getNaturalMessageWidth() : 0;
    const contentWidth = pillHeight + messageWidth;
    const maxWidth = this.getToastMaxWidth();
    const successWidth = Math.min(contentWidth, maxWidth);
    const msgWidth = Math.max(0, successWidth - pillHeight);
    const wrapHeight = this.getWrappedHeight(msgWidth, pillHeight);
    const shouldWrap = contentWidth > maxWidth || wrapHeight > pillHeight;

    this.pillEl.style.setProperty("--success-w", `${Math.ceil(successWidth)}px`);
    this.pillEl.style.setProperty("--msg-w", `${Math.ceil(msgWidth)}px`);
    this.pillEl.style.setProperty("--wrap-h", `${Math.ceil(wrapHeight)}px`);

    return {
      pillHeight,
      successWidth,
      wrapHeight,
      shouldWrap
    };
  }

  private getToastMaxWidth() {
    const computedMaxWidth = getComputedStyle(this.pillEl).maxWidth;
    const maxWidth = Number.parseFloat(computedMaxWidth);

    return Number.isFinite(maxWidth) ? maxWidth : window.innerWidth * 0.9;
  }

  private getNaturalMessageWidth() {
    const measure = this.createMessageMeasure("span");
    measure.style.whiteSpace = "nowrap";

    return this.measureMessage(measure, (element) => element.getBoundingClientRect().width);
  }

  private getWrappedHeight(msgWidth: number, pillHeight: number) {
    if (msgWidth <= 0) return pillHeight;
    const measure = this.createMessageMeasure("div");
    measure.style.width = `${msgWidth}px`;
    measure.style.whiteSpace = "normal";
    measure.style.overflowWrap = "anywhere";

    return this.measureMessage(measure, (element) => Math.max(pillHeight, element.getBoundingClientRect().height));
  }

  private createMessageMeasure(tagName: "span" | "div") {
    const measure = document.createElement(tagName);
    const msgStyle = getComputedStyle(this.msgEl);
    measure.innerHTML = this.currentMessage;
    measure.style.position = "fixed";
    measure.style.left = "-9999px";
    measure.style.top = "0";
    measure.style.visibility = "hidden";
    measure.style.boxSizing = "border-box";
    measure.style.padding = msgStyle.padding;
    measure.style.font = msgStyle.font;
    measure.style.fontWeight = msgStyle.fontWeight;
    measure.style.letterSpacing = msgStyle.letterSpacing;
    measure.style.textTransform = msgStyle.textTransform;
    measure.style.lineHeight = msgStyle.lineHeight;

    return measure;
  }

  private measureMessage(measure: HTMLElement, read: (element: HTMLElement) => number) {
    document.body.appendChild(measure);

    try {
      return read(measure);
    } finally {
      measure.remove();
    }
  }

  private runWrappedShapeAnimation(dimensions: { pillHeight: number; successWidth: number; wrapHeight: number }) {
    const radius = dimensions.pillHeight / 2;

    if (this.shapeAnimation) this.shapeAnimation.cancel();
    this.resetting = true;
    this.wrap = true;
    this.grow = false;
    this.pillEl.style.width = `${dimensions.pillHeight}px`;
    this.pillEl.style.height = `${dimensions.pillHeight}px`;
    this.pillEl.style.borderRadius = `${radius}px`;
    this.setPhase("success");
    void this.pillEl.offsetWidth;
    this.resetting = false;

    this.shapeAnimation = this.pillEl.animate(
      [
        {
          width: `${dimensions.pillHeight}px`,
          height: `${dimensions.pillHeight}px`,
          borderRadius: `${radius}px`,
          offset: 0
        },
        {
          width: `${dimensions.successWidth}px`,
          height: `${dimensions.pillHeight}px`,
          borderRadius: `${radius}px`,
          offset: 0.68
        },
        {
          width: `${dimensions.successWidth}px`,
          height: `${dimensions.wrapHeight}px`,
          borderRadius: "18px",
          offset: 1
        }
      ],
      {
        duration: 980,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
        fill: "both"
      }
    );

    this.shapeAnimation.addEventListener(
      "finish",
      () => {
        this.grow = true;
        this.pillEl.style.width = "";
        this.pillEl.style.height = "";
        this.pillEl.style.borderRadius = "";
        this.shapeAnimation?.cancel();
        this.shapeAnimation = null;
      },
      { once: true }
    );
  }

  private handlePointerDown(event: PointerEvent) {
    if (this.phase === "idle") return;
    this.swipeStartY = event.clientY;
    this.isSwiping = true;
    this.pillEl.setPointerCapture(event.pointerId);
  }

  private handlePointerMove(event: PointerEvent) {
    if (!this.isSwiping) return;
    const deltaY = event.clientY - this.swipeStartY;
    const y = Math.min(0, deltaY);
    this.pillEl.style.setProperty("--swipe-y", `${y}px`);
  }

  private handlePointerEnd(event: PointerEvent) {
    if (!this.isSwiping) return;
    this.isSwiping = false;
    const deltaY = event.clientY - this.swipeStartY;

    if (deltaY < -32) {
      this.hide("swipe");
      return;
    }

    this.pillEl.style.removeProperty("--swipe-y");
  }

  private handleTransitionEnd(event: TransitionEvent) {
    if (event.propertyName !== "width") return;
    if (this.phase === "idle") {
      this.wrap = false;
      this.grow = false;
      this.closing = false;
    }
  }

  private emitEvent(name: "show" | "close", source: YnToastDetail["source"]) {
    this.dispatchEvent(
      new CustomEvent<YnToastDetail>(name, {
        detail: {
          type: this.variant,
          message: this.currentMessage,
          source
        },
        bubbles: true,
        composed: true
      })
    );
  }

  render() {
    return html`
      ${this.loadingMask && this.phase === "loading" ? html`<div class="mask" aria-hidden="true"></div>` : null}
      <div
        class="pill"
        role="status"
        aria-live="polite"
        data-phase=${this.phase}
        data-variant=${this.variant}
        data-resetting=${String(this.resetting)}
        data-wrap=${String(this.wrap)}
        data-grow=${String(this.grow)}
        data-closing=${String(this.closing)}
        data-has-message=${String(this.hasMessage)}
        @pointerdown=${this.handlePointerDown}
        @pointermove=${this.handlePointerMove}
        @pointerup=${this.handlePointerEnd}
        @pointercancel=${this.handlePointerEnd}
        @transitionend=${this.handleTransitionEnd}
      >
        <div class="ball-slot">
          <div class="ball" aria-hidden="true">
            <svg class="ring" viewBox="0 0 24 24" aria-hidden="true">
              <circle class="track" cx="12" cy="12" r="9"></circle>
              <circle class="arc arc-primary" cx="12" cy="12" r="9" pathLength="100"></circle>
              <circle class="arc arc-secondary" cx="12" cy="12" r="9" pathLength="100"></circle>
            </svg>
            <span class="core"></span>
            <span class="check">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d=${this.iconPath}></path>
              </svg>
            </span>
          </div>
        </div>
        <span class="msg">${unsafeHTML(this.currentMessage)}</span>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "yn-toast": YnToast;
  }
}
