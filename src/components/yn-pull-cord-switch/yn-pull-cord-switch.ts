import { LitElement, css, html } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { PullCordRopeEngine } from "./pull-cord-rope-engine";

export type YnPullCordSwitchVariant = "default" | "floema";
export type YnPullCordSwitchSize = "mini" | "small" | "medium";

@customElement("yn-pull-cord-switch")
export class YnPullCordSwitch extends LitElement {
  @property({ type: Boolean, reflect: true }) checked = false;
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ type: String, reflect: true }) variant: YnPullCordSwitchVariant = "default";
  @property({ type: String, reflect: true }) size: YnPullCordSwitchSize = "mini";
  @property({ type: Number, attribute: "toggle-threshold" }) toggleThreshold?: number;

  @query("canvas.rope") private ropeCanvas?: HTMLCanvasElement;
  @query(".card") private cardEl?: HTMLElement;

  private engine: PullCordRopeEngine | null = null;
  private hasSlotContent = false;

  static styles = css`
    :host {
      display: block;
      width: 100%;
      height: var(--yn-pull-cord-switch-height);
      touch-action: none;
      user-select: none;
      -webkit-user-select: none;
    }

    :host([disabled]) {
      opacity: var(--yn-pull-cord-switch-disabled-opacity, 0.55);
      cursor: not-allowed;
    }

    :host([size="mini"]) {
      --yn-pull-cord-switch-height: 260px;
      --yn-pull-cord-switch-segment-len: 10;
      --yn-pull-cord-switch-card-offset: 20;
      --yn-pull-cord-switch-max-pull: 84;
      --yn-pull-cord-switch-toggle-threshold: 52;
      --yn-pull-cord-switch-ceiling-width: 44;
      --yn-pull-cord-switch-rope-width: 2.5;
      --yn-pull-cord-switch-rope-shadow-width: 4;
      --yn-pull-cord-switch-card-width: 64px;
      --yn-pull-cord-switch-card-height: 38px;
      --yn-pull-cord-switch-card-radius: 8px;
      --yn-pull-cord-switch-card-padding: 6px 8px;
      --yn-pull-cord-switch-card-gap: 3px;
      --yn-pull-cord-switch-card-dot-size: 9px;
      --yn-pull-cord-switch-card-label-size: 9px;
    }

    :host([size="small"]) {
      --yn-pull-cord-switch-height: 310px;
      --yn-pull-cord-switch-segment-len: 12;
      --yn-pull-cord-switch-card-offset: 24;
      --yn-pull-cord-switch-max-pull: 101;
      --yn-pull-cord-switch-toggle-threshold: 62;
      --yn-pull-cord-switch-ceiling-width: 50;
      --yn-pull-cord-switch-rope-width: 2.75;
      --yn-pull-cord-switch-rope-shadow-width: 4.5;
      --yn-pull-cord-switch-card-width: 76px;
      --yn-pull-cord-switch-card-height: 44px;
      --yn-pull-cord-switch-card-radius: 9px;
      --yn-pull-cord-switch-card-padding: 7px 9px;
      --yn-pull-cord-switch-card-gap: 4px;
      --yn-pull-cord-switch-card-dot-size: 10px;
      --yn-pull-cord-switch-card-label-size: 10px;
    }

    :host([size="medium"]) {
      --yn-pull-cord-switch-height: 360px;
      --yn-pull-cord-switch-segment-len: 14;
      --yn-pull-cord-switch-card-offset: 28;
      --yn-pull-cord-switch-max-pull: 118;
      --yn-pull-cord-switch-toggle-threshold: 72;
      --yn-pull-cord-switch-ceiling-width: 56;
      --yn-pull-cord-switch-rope-width: 3;
      --yn-pull-cord-switch-rope-shadow-width: 5;
      --yn-pull-cord-switch-card-width: 88px;
      --yn-pull-cord-switch-card-height: 52px;
      --yn-pull-cord-switch-card-radius: 10px;
      --yn-pull-cord-switch-card-padding: 8px 10px;
      --yn-pull-cord-switch-card-gap: 4px;
      --yn-pull-cord-switch-card-dot-size: 12px;
      --yn-pull-cord-switch-card-label-size: 11px;
    }

    :host([variant="floema"][size="mini"]) {
      --yn-pull-cord-switch-card-width: 70px;
      --yn-pull-cord-switch-card-height: 42px;
      --yn-pull-cord-switch-card-radius: 10px;
    }

    :host([variant="floema"][size="small"]) {
      --yn-pull-cord-switch-card-width: 82px;
      --yn-pull-cord-switch-card-height: 50px;
      --yn-pull-cord-switch-card-radius: 12px;
    }

    :host([variant="floema"][size="medium"]) {
      --yn-pull-cord-switch-card-width: 96px;
      --yn-pull-cord-switch-card-height: 58px;
      --yn-pull-cord-switch-card-radius: 14px;
    }

    :host([variant="default"]) {
      --yn-pull-cord-switch-vignette: 0.55;
      --yn-pull-cord-switch-bg-top: #1a1d24;
      --yn-pull-cord-switch-bg-bottom: #12141a;
      --yn-pull-cord-switch-bg-on-top: #2a2830;
      --yn-pull-cord-switch-bg-on-bottom: #15141a;
      --yn-pull-cord-switch-accent: rgba(255, 214, 102, 0.35);
      --yn-pull-cord-switch-ceiling-bg: rgba(255, 255, 255, 0.08);
      --yn-pull-cord-switch-anchor-color: #4a4f5c;
      --yn-pull-cord-switch-rope-start: #6b5d4f;
      --yn-pull-cord-switch-rope-end: #9a8468;
      --yn-pull-cord-switch-card-bg: linear-gradient(180deg, #343a46 0%, #22262e 100%);
      --yn-pull-cord-switch-card-border: rgba(255, 255, 255, 0.1);
      --yn-pull-cord-switch-card-color: rgba(255, 255, 255, 0.88);
      --yn-pull-cord-switch-card-shadow: 0 8px 16px rgba(0, 0, 0, 0.45);
      --yn-pull-cord-switch-card-bg-on: linear-gradient(180deg, #3d4454 0%, #252a34 100%);
      --yn-pull-cord-switch-card-border-on: rgba(255, 214, 102, 0.45);
      --yn-pull-cord-switch-card-color-on: #ffd666;
    }

    :host([variant="floema"]) {
      --yn-pull-cord-switch-anchor-y: 0.12;
      --yn-pull-cord-switch-vignette: 0.18;
      --yn-pull-cord-switch-bg-top: #ebe4d4;
      --yn-pull-cord-switch-bg-bottom: #ddd6c4;
      --yn-pull-cord-switch-bg-on-top: #f2e8cf;
      --yn-pull-cord-switch-bg-on-bottom: #e5d6b4;
      --yn-pull-cord-switch-accent: rgba(212, 165, 116, 0.5);
      --yn-pull-cord-switch-ceiling-bg: rgba(32, 35, 29, 0.07);
      --yn-pull-cord-switch-anchor-color: #586247;
      --yn-pull-cord-switch-rope-start: #6f5f4d;
      --yn-pull-cord-switch-rope-end: #a0896c;
      --yn-pull-cord-switch-card-bg: linear-gradient(180deg, #f8f3ea 0%, #ebe4d4 100%);
      --yn-pull-cord-switch-card-border: rgba(32, 35, 29, 0.12);
      --yn-pull-cord-switch-card-color: #20231d;
      --yn-pull-cord-switch-card-shadow: 0 14px 28px rgba(48, 42, 34, 0.16);
      --yn-pull-cord-switch-card-bg-on: linear-gradient(180deg, #6d7a58 0%, #586247 100%);
      --yn-pull-cord-switch-card-border-on: rgba(243, 237, 223, 0.28);
      --yn-pull-cord-switch-card-color-on: #f8f3ea;
    }

    .stage {
      position: relative;
      width: 100%;
      height: 100%;
      overflow: hidden;
      border-radius: var(--yn-pull-cord-switch-radius, 12px);
    }

    canvas.rope {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      display: block;
      cursor: grab;
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

    :host([checked]) .card {
      background: var(--yn-pull-cord-switch-card-bg-on);
      border-color: var(--yn-pull-cord-switch-card-border-on);
      color: var(--yn-pull-cord-switch-card-color-on);
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
    }

    .card__fallback[hidden] {
      display: none;
    }
  `;

  connectedCallback() {
    super.connectedCallback();
    this.setAttribute("role", "switch");
    this.updateComplete.then(() => this.mountEngine());
  }

  disconnectedCallback() {
    this.engine?.stop();
    this.engine = null;
    super.disconnectedCallback();
  }

  protected updated(changed: Map<PropertyKey, unknown>) {
    this.setAttribute("aria-checked", String(this.checked));
    if (!this.engine) return;
    if (changed.has("variant") || changed.has("size")) {
      this.engine.invalidateTheme();
      this.engine.resize();
    }
    if (changed.has("checked")) {
      this.engine.invalidateTheme();
      this.engine.requestFrame();
    }
    if (changed.has("disabled")) {
      this.engine.requestFrame();
    }
  }

  private mountEngine() {
    if (!this.ropeCanvas || this.engine) return;
    try {
      this.engine = new PullCordRopeEngine({
        canvas: this.ropeCanvas,
        host: this,
        getChecked: () => this.checked,
        getDisabled: () => this.disabled,
        getToggleThreshold: () => this.toggleThreshold,
        onCheckedChange: (checked) => this.setChecked(checked, true),
        onCardTransform: ({ x, y, tilt }) => {
          const card = this.cardEl;
          if (!card) return;
          card.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%) rotate(${tilt}rad)`;
        }
      });
      this.engine.start();
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

  private handleSlotChange(event: Event) {
    const slot = event.target as HTMLSlotElement;
    this.hasSlotContent = slot
      .assignedNodes({ flatten: true })
      .some((node) => node.nodeType !== Node.TEXT_NODE || (node.textContent?.trim().length ?? 0) > 0);
  }

  render() {
    return html`
      <div class="stage" part="stage">
        <canvas class="rope" aria-hidden="true"></canvas>
        <div class="card" part="card" aria-hidden="true">
          <slot @slotchange=${this.handleSlotChange}></slot>
          <div class="card__fallback" ?hidden=${this.hasSlotContent}>
            <span class="card__dot"></span>
            <span class="card__label">${this.checked ? "ON" : "OFF"}</span>
          </div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "yn-pull-cord-switch": YnPullCordSwitch;
  }
}
