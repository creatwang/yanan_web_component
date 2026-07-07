import { LitElement, css, html } from "lit";
import type { PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";
import type { YnSvgSource } from "../../asset/svg";
import { ynPickSelectedSvg, ynPickUnselectedSvg } from "../../asset/svg";

const parsePrimitiveValue = (raw: string | null): string | number => {
  if (raw === null) return "";
  const value = raw.trim();
  if (value === "") return "";
  if (/^-?\d+(\.\d+)?$/.test(value)) {
    return Number(value);
  }
  return value;
};

type IconKind = "selected" | "unselected";
type IconPhase = "hidden" | "enter" | "visible" | "leave";

@customElement("yn-pick")
export class YnPick extends LitElement {
  @property({
    attribute: "value",
    converter: {
      fromAttribute: (value) => parsePrimitiveValue(value),
      toAttribute: (value) => String(value ?? "")
    }
  })
  value: string | number = "";

  @property({ type: Boolean, reflect: true })
  selected = false;

  @property({ type: Boolean, reflect: true })
  border = true;

  @property({ type: String, attribute: "selected-icon" })
  selectedIcon: YnSvgSource = ynPickSelectedSvg;

  @property({ type: String, attribute: "unselected-icon" })
  unselectedIcon: YnSvgSource = ynPickUnselectedSvg;

  @property({ type: Boolean, attribute: "show-unselected-icon", reflect: true })
  showUnselectedIcon = false;

  @state() private selectedIconPhase: IconPhase = "hidden";

  @state() private unselectedIconPhase: IconPhase = "hidden";

  private iconLifecycleStarted = false;

  static styles = css`
      :host {
        --yn-pick-border-color: var(--yn-color-border-focus, #241f21);
        display: inline-block;
      }

      .wrap {
        position: relative;
        display: inline-block;
        cursor: pointer;
      }

      .wrap.with-border::after {
        content: "";
        position: absolute;
        inset: 0;
        pointer-events: none;
        border: var(--yn-pick-border-width, 2px) solid var(--yn-pick-border-color, var(--yn-color-border-focus, #241f21));
        border-radius: var(--yn-pick-border-radius, 8px);
        box-sizing: border-box;
      }

      .slot-wrap {
        position: relative;
        display: inline-block;
      }

      .icon {
        position: absolute;
        top: 6px;
        right: 6px;
        z-index: 2;
        width: 20px;
        height: 20px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        transform-origin: center center;
        transform: scale(0);
        opacity: 0;
        pointer-events: none;
      }

      .icon.is-visible {
        transform: scale(1);
        opacity: 1;
      }

      .icon.anim-in {
        animation: yn-pick-icon-in var(--yn-pick-icon-duration, 220ms)
          var(--yn-pick-icon-ease, cubic-bezier(0.22, 1, 0.36, 1)) forwards;
      }

      .icon.anim-out {
        animation: yn-pick-icon-out var(--yn-pick-icon-duration, 220ms)
          var(--yn-pick-icon-ease, cubic-bezier(0.55, 0.055, 0.675, 0.19)) forwards;
      }

      @keyframes yn-pick-icon-in {
        from {
          transform: scale(0);
          opacity: 0;
        }

        to {
          transform: scale(1);
          opacity: 1;
        }
      }

      @keyframes yn-pick-icon-out {
        from {
          transform: scale(1);
          opacity: 1;
        }

        to {
          transform: scale(0);
          opacity: 0;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .icon.anim-in,
        .icon.anim-out {
          animation: none;
        }
      }
    `;

  protected willUpdate(changed: PropertyValues) {
    if (
      !this.iconLifecycleStarted ||
      changed.has("selected") ||
      changed.has("showUnselectedIcon") ||
      changed.has("selectedIcon") ||
      changed.has("unselectedIcon")
    ) {
      this.syncIconPhases(this.iconLifecycleStarted);
      this.iconLifecycleStarted = true;
    }
  }

  private shouldAnimateIcon(animate: boolean) {
    return animate && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  private wantsIcon(kind: IconKind) {
    if (kind === "selected") return this.selected && Boolean(this.selectedIcon?.trim());
    return !this.selected && this.showUnselectedIcon && Boolean(this.unselectedIcon?.trim());
  }

  private getIconPhase(kind: IconKind): IconPhase {
    return kind === "selected" ? this.selectedIconPhase : this.unselectedIconPhase;
  }

  private setIconPhase(kind: IconKind, phase: IconPhase) {
    if (kind === "selected") {
      this.selectedIconPhase = phase;
      return;
    }
    this.unselectedIconPhase = phase;
  }

  /** 同步选中/未选中图标的进出场动画阶段。 */
  private syncIconPhases(animate: boolean) {
    const motion = this.shouldAnimateIcon(animate);
    (["selected", "unselected"] as const).forEach((kind) => {
      const want = this.wantsIcon(kind);
      const phase = this.getIconPhase(kind);

      if (want) {
        if (phase === "hidden") {
          this.setIconPhase(kind, motion ? "enter" : "visible");
        } else if (phase === "leave") {
          this.setIconPhase(kind, motion ? "enter" : "visible");
        }
        return;
      }

      if (phase === "visible" || phase === "enter") {
        this.setIconPhase(kind, motion ? "leave" : "hidden");
      }
    });
  }

  private onIconAnimationEnd(kind: IconKind, event: AnimationEvent) {
    const phase = this.getIconPhase(kind);
    if (event.animationName === "yn-pick-icon-in" && phase === "enter") {
      this.setIconPhase(kind, "visible");
      return;
    }
    if (event.animationName === "yn-pick-icon-out" && phase === "leave") {
      this.setIconPhase(kind, "hidden");
    }
  }

  /** 派发选中状态切换事件。 */
  private emitToggle(nextSelected: boolean) {
    this.dispatchEvent(
      new CustomEvent<{ id: string | number; flag: boolean }>("toggle", {
        detail: { id: this.value, flag: nextSelected },
        bubbles: true,
        composed: true
      })
    );
  }

  /** 处理点击切换选中态。 */
  private handleClick() {
    const nextSelected = !this.selected;
    this.selected = nextSelected;
    this.emitToggle(nextSelected);
  }

  /** 处理键盘 Enter/Space 切换选中态。 */
  private handleKeydown(event: KeyboardEvent) {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    const nextSelected = !this.selected;
    this.selected = nextSelected;
    this.emitToggle(nextSelected);
  }

  /** 渲染图标字符串（支持 SVG 文本）。 */
  private renderIcon(iconText: string) {
    const source = iconText?.trim() ?? "";
    if (!source) return html``;
    if (source.startsWith("<svg")) {
      return html`${unsafeSVG(source)}`;
    }
    return html`${source}`;
  }

  private renderAnimatedIcon(kind: IconKind, icon: YnSvgSource) {
    const phase = this.getIconPhase(kind);
    if (phase === "hidden") return null;

    const classes = [
      "icon",
      kind,
      phase === "enter" ? "anim-in" : "",
      phase === "leave" ? "anim-out" : "",
      phase === "visible" ? "is-visible" : ""
    ]
      .filter(Boolean)
      .join(" ");

    return html`
      <span
        class=${classes}
        aria-hidden="true"
        @animationend=${(event: AnimationEvent) => this.onIconAnimationEnd(kind, event)}
      >
        ${this.renderIcon(icon)}
      </span>
    `;
  }

  /** 渲染 pick 容器、状态图标与插槽内容。 */
  render() {
    const classes = [
      "wrap",
      this.border ? "with-border" : "",
      this.selected ? "selected" : ""
    ]
      .filter(Boolean)
      .join(" ");

    return html`
      <div class=${classes} role="button" tabindex="0" @click=${this.handleClick} @keydown=${this.handleKeydown}>
        ${this.renderAnimatedIcon("selected", this.selectedIcon)}
        ${this.renderAnimatedIcon("unselected", this.unselectedIcon)}
        <div class="slot-wrap">
          <slot></slot>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "yn-pick": YnPick;
  }
}
