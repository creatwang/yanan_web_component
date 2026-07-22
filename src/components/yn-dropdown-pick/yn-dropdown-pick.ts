import "../../lib/lit-hydrate.js";
import { LitElement, css, html, unsafeCSS } from "lit";
import type { PropertyValues } from "lit";
import { customElement, property, queryAssignedElements, state } from "lit/decorators.js";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";
import "../yn-pick/yn-pick";
import type { YnPick } from "../yn-pick/yn-pick";
import { ynDropdownPickCheckSvg, ynDropdownPickChevronUpSvg } from "../../asset/svg";
import { YN_DROPDOWN_PICK_SHADOW_STYLES } from "./yn-dropdown-pick-styles.js";

type Primitive = string | number;
type PickValue = Primitive | "";

export type YnDropdownPickNode = Record<string, unknown>;

export type YnDropdownPickChangeDetail = {
  id: PickValue;
  node: YnDropdownPickNode | null;
};

const parsePrimitive = (raw: string | null): PickValue => {
  if (raw === null) return "";
  const value = raw.trim();
  if (value === "") return "";
  if (/^-?\d+(\.\d+)?$/.test(value)) return Number(value);
  return value;
};

@customElement("yn-dropdown-pick")
export class YnDropdownPick extends LitElement {
  @property({
    attribute: "value",
    converter: {
      fromAttribute: (value) => parsePrimitive(value),
      toAttribute: (value) => String(value ?? "")
    }
  })
  value: PickValue = "";

  @property({ type: String, attribute: "value-field" })
  valueField = "id";

  @property({ type: String, attribute: "button-display-field" })
  buttonDisplayField = "label";

  @property({ type: String })
  placeholder = "Select";

  @property({ type: Boolean, attribute: "close-on-outside-click" })
  closeOnOutsideClick = true;

  @property({ type: Boolean })
  disabled = false;

  @property({ type: String, attribute: "button-bg" })
  buttonBg = "var(--yn-dropdown-pick-button-bg, var(--yn-color-surface, #f8f6f2))";

  @property({ type: String, attribute: "button-color" })
  buttonColor = "var(--yn-dropdown-pick-button-color, var(--yn-color-text, #241f21))";

  @property({ type: String, attribute: "open-button-bg" })
  openButtonBg = "var(--yn-dropdown-pick-open-button-bg, var(--yn-color-inverse-bg, #241f21))";

  @property({ type: String, attribute: "open-button-color" })
  openButtonColor = "var(--yn-dropdown-pick-open-button-color, var(--yn-color-on-inverse, #ffffff))";

  @property({ type: String, attribute: "panel-min-width" })
  panelMinWidth = "132px";

  @property({ type: Boolean, attribute: "show-selected-icon" })
  showSelectedIcon = true;

  @state()
  private open = false;

  @state()
  private selectedNode: YnDropdownPickNode | null = null;

  private postSelectTimer = 0;
  private pendingSelectionCleanup: (() => void) | null = null;

  @queryAssignedElements({ selector: "yn-pick", flatten: true })
  private picks!: YnPick[];

  static styles = css`
    ${unsafeCSS(YN_DROPDOWN_PICK_SHADOW_STYLES)}
  `;

  /** 注册外部点击与键盘事件。 */
  connectedCallback() {
    super.connectedCallback();
    document.addEventListener("pointerdown", this.handleDocumentPointerDown);
    document.addEventListener("keydown", this.handleDocumentKeydown);
  }

  /** 卸载时清理全局监听。 */
  disconnectedCallback() {
    document.removeEventListener("pointerdown", this.handleDocumentPointerDown);
    document.removeEventListener("keydown", this.handleDocumentKeydown);
    this.clearPendingSelectionTask();
    super.disconnectedCallback();
  }

  /** 清理“等待选中视觉完成”相关监听和计时器。 */
  private clearPendingSelectionTask() {
    this.pendingSelectionCleanup?.();
    this.pendingSelectionCleanup = null;
    if (this.postSelectTimer) {
      window.clearTimeout(this.postSelectTimer);
      this.postSelectTimer = 0;
    }
  }

  /** 监听关键属性变化并同步选中项。 */
  protected updated(changed: PropertyValues<this>) {
    if (changed.has("value") || changed.has("valueField") || changed.has("buttonDisplayField")) {
      this.syncSelectedByValue();
      this.syncPickState();
    }
  }

  /** 同步插槽 pick 的默认配置。 */
  private handleSlotChange = () => {
    this.syncPickState();
    this.syncSelectedByValue();
  };

  /** 非选中项进入 hover 时应用背景。 */
  private handleItemMouseEnter = (event: Event) => {
    const contentEl = event.currentTarget as HTMLElement;
    if (contentEl.dataset.ynDpSelected === "1") return;
    contentEl.style.background = "var(--yn-dropdown-pick-item-hover-bg, var(--yn-color-surface-hover, #ebe7df))";
  };

  /** hover 离开时恢复背景。 */
  private handleItemMouseLeave = (event: Event) => {
    const contentEl = event.currentTarget as HTMLElement;
    if (contentEl.dataset.ynDpSelected === "1") {
      contentEl.style.background = "var(--yn-dropdown-pick-item-selected-bg, var(--yn-color-bg-muted, #e6e1d8))";
      return;
    }
    contentEl.style.background = contentEl.dataset.ynDpOriginalBackground || "";
  };

  /** 同步 pick 的单选态和默认视觉配置。 */
  private syncPickState() {
    const picks = this.picks ?? [];
    picks.forEach((pick) => {
      if (!pick.hasAttribute("border")) pick.border = false;
      const selected = this.isSameValue(pick.value as PickValue, this.value);
      pick.selected = selected;
      if (!pick.hasAttribute("selected-icon")) {
        pick.selectedIcon = "";
      }

      const wrapEl = pick.shadowRoot?.querySelector<HTMLElement>(".wrap");
      const slotWrapEl = pick.shadowRoot?.querySelector<HTMLElement>(".slot-wrap");
      const iconEls = pick.shadowRoot?.querySelectorAll<HTMLElement>(".icon");
      if (wrapEl) {
        wrapEl.style.display = "block";
        wrapEl.style.width = "100%";
      }
      if (slotWrapEl) {
        slotWrapEl.style.display = "block";
        slotWrapEl.style.width = "100%";
      }
      iconEls?.forEach((iconEl) => {
        iconEl.style.display = "none";
      });

      const contentEl = pick.firstElementChild as HTMLElement | null;
      if (!contentEl) return;

      if (contentEl.dataset.ynDpOriginalBackground === undefined) {
        contentEl.dataset.ynDpOriginalBackground = contentEl.style.background || "";
      }
      if (contentEl.dataset.ynDpOriginalDisplay === undefined) {
        contentEl.dataset.ynDpOriginalDisplay = contentEl.style.display || "";
      }
      if (contentEl.dataset.ynDpOriginalWidth === undefined) {
        contentEl.dataset.ynDpOriginalWidth = contentEl.style.width || "";
      }
      if (contentEl.dataset.ynDpOriginalBoxSizing === undefined) {
        contentEl.dataset.ynDpOriginalBoxSizing = contentEl.style.boxSizing || "";
      }
      if (contentEl.dataset.ynDpOriginalPaddingRight === undefined) {
        contentEl.dataset.ynDpOriginalPaddingRight = contentEl.style.paddingRight || "";
      }
      if (contentEl.dataset.ynDpHoverBound !== "1") {
        contentEl.addEventListener("mouseenter", this.handleItemMouseEnter);
        contentEl.addEventListener("mouseleave", this.handleItemMouseLeave);
        contentEl.dataset.ynDpHoverBound = "1";
      }

      contentEl.style.position = "relative";
      contentEl.style.display = "flex";
      contentEl.style.alignItems = "center";
      contentEl.style.justifyContent = "flex-start";
      contentEl.style.width = "100%";
      contentEl.style.boxSizing = "border-box";
      contentEl.style.paddingRight = this.showSelectedIcon
        ? "var(--yn-dropdown-pick-item-content-right-space, 34px)"
        : contentEl.dataset.ynDpOriginalPaddingRight || "";
      contentEl.style.transition = "background-color 160ms cubic-bezier(0.22, 1, 0.36, 1), padding-right 120ms ease";

      let checkEl = contentEl.querySelector<HTMLElement>("[data-yn-dp-check]");
      if (!checkEl) {
        checkEl = document.createElement("span");
        checkEl.setAttribute("data-yn-dp-check", "true");
        checkEl.style.width = "18px";
        checkEl.style.height = "18px";
        checkEl.style.position = "absolute";
        checkEl.style.right = "10px";
        checkEl.style.top = "50%";
        checkEl.style.transform = "translateY(-50%)";
        checkEl.style.display = "inline-flex";
        checkEl.style.alignItems = "center";
        checkEl.style.justifyContent = "center";
        checkEl.style.borderRadius = "999px";
        checkEl.style.background = "var(--yn-dropdown-pick-check-bg, var(--yn-color-inverse-bg, #241f21))";
        checkEl.style.color = "var(--yn-dropdown-pick-check-color, var(--yn-color-on-inverse, #ffffff))";
        checkEl.style.transition =
          "opacity 140ms ease, transform var(--yn-dropdown-pick-check-duration, 220ms) var(--yn-dropdown-pick-check-ease, cubic-bezier(0.22, 1, 0.36, 1))";
        checkEl.innerHTML = ynDropdownPickCheckSvg;
        contentEl.appendChild(checkEl);
      }
      checkEl.style.opacity = this.showSelectedIcon && selected ? "1" : "0";
      checkEl.style.transform =
        this.showSelectedIcon && selected ? "translateY(-50%) scale(1)" : "translateY(-50%) scale(0)";
      checkEl.style.pointerEvents = "none";
      contentEl.dataset.ynDpSelected = selected ? "1" : "0";

      if (selected) {
        contentEl.style.background = "var(--yn-dropdown-pick-item-selected-bg, var(--yn-color-bg-muted, #e6e1d8))";
      } else {
        contentEl.style.background = contentEl.dataset.ynDpOriginalBackground || "";
      }
    });
  }

  /** 根据当前 value 同步 selectedNode。 */
  private syncSelectedByValue() {
    const target = this.findPickByValue(this.value);
    this.selectedNode = this.extractNodeFromPick(target);
  }

  /** 统一值比较，兼容 number/string。 */
  private isSameValue(a: PickValue, b: PickValue) {
    return String(a) === String(b);
  }

  /** 在当前插槽项中查找指定值的 pick。 */
  private findPickByValue(value: PickValue) {
    const picks = this.picks ?? [];
    if (!picks.length || value === "" || value === null || value === undefined) return null;
    return picks.find((pick) => this.isSameValue(pick.value as PickValue, value)) ?? null;
  }

  /** 从 pick 上提取节点数据（优先 data-node JSON）。 */
  private extractNodeFromPick(pick: YnPick | null): YnDropdownPickNode | null {
    if (!pick) return null;
    const rawNode = pick.getAttribute("data-node");
    if (rawNode) {
      try {
        const parsed = JSON.parse(rawNode) as YnDropdownPickNode;
        if (parsed && typeof parsed === "object") return parsed;
      } catch {
        // ignore parse error and fallback
      }
    }
    return {
      [this.valueField]: pick.value,
      label: pick.textContent?.trim() ?? ""
    };
  }

  /** 从 node 中读取字段文本。 */
  private readNodeField(node: YnDropdownPickNode | null, field: string) {
    if (!node) return "";
    const raw = node[field];
    if (raw === null || raw === undefined) return "";
    return String(raw);
  }

  /** 计算按钮文案。 */
  private getButtonText() {
    const text = this.readNodeField(this.selectedNode, this.buttonDisplayField);
    return text || this.placeholder;
  }

  /** 切换弹层开关。 */
  private toggleOpen() {
    if (this.disabled) return;
    this.open = !this.open;
    this.emitOpenChange();
  }

  /** 关闭弹层。 */
  private closePanel() {
    if (!this.open) return;
    this.open = false;
    this.emitOpenChange();
  }

  /**
   * 兼容旧 storefront rebootstrap。
   * 官方 hydrate 后事件由 Lit 模板绑定；此处仅同步 pick 选中态。
   */
  bootstrapFromDeclarativeShadow() {
    this.handleSlotChange();
  }

  /** 对外派发开关变化事件。 */
  private emitOpenChange() {
    this.dispatchEvent(
      new CustomEvent("open-change", {
        detail: { open: this.open },
        bubbles: true,
        composed: true
      })
    );
  }

  /** 外部点击时自动关闭。 */
  private handleDocumentPointerDown = (event: PointerEvent) => {
    if (!this.open || !this.closeOnOutsideClick) return;
    const path = event.composedPath();
    if (path.includes(this)) return;
    this.closePanel();
  };

  /** Esc 快捷关闭。 */
  private handleDocumentKeydown = (event: KeyboardEvent) => {
    if (!this.open) return;
    if (event.key !== "Escape") return;
    this.closePanel();
  };

  /** 处理子项 toggle 事件，维持单选并回传 node。 */
  private handlePickToggle = (event: Event) => {
    if (!(event instanceof CustomEvent)) return;
    const detail = event.detail as { id: Primitive; flag: boolean };
    const nextValue: PickValue = detail.flag ? detail.id : "";
    this.value = nextValue;
    this.syncPickState();
    this.syncSelectedByValue();
    const finalizeSelection = () => {
      this.dispatchEvent(
        new CustomEvent<YnDropdownPickChangeDetail>("change", {
          detail: { id: this.value, node: this.selectedNode },
          bubbles: true,
          composed: true
        })
      );
      this.closePanel();
    };

    this.clearPendingSelectionTask();

    if (!detail.flag) {
      finalizeSelection();
      return;
    }

    const selectedPick = this.findPickByValue(nextValue);
    const contentEl = selectedPick?.firstElementChild as HTMLElement | null;
    if (!contentEl) {
      finalizeSelection();
      return;
    }

    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      this.clearPendingSelectionTask();
      finalizeSelection();
    };
    const onTransitionEnd = (evt: Event) => {
      const transitionEvent = evt as TransitionEvent;
      if (transitionEvent.target !== contentEl) return;
      if (transitionEvent.propertyName !== "background-color") return;
      finish();
    };
    contentEl.addEventListener("transitionend", onTransitionEnd);
    this.pendingSelectionCleanup = () => {
      contentEl.removeEventListener("transitionend", onTransitionEnd);
    };
    // Fallback when transitionend is not emitted.
    this.postSelectTimer = window.setTimeout(finish, 80);
  };

  /** 渲染下拉选择器。 */
  render() {
    const btnBg = this.open ? this.openButtonBg : this.buttonBg;
    const btnColor = this.open ? this.openButtonColor : this.buttonColor;
    const styleVars = `--_btn-bg:${btnBg};--_btn-color:${btnColor};--_panel-min-width:${this.panelMinWidth};`;
    return html`
      <div class="root" style=${styleVars}>
        <button class="trigger" type="button" ?disabled=${this.disabled} @click=${this.toggleOpen}>
          <span>${this.getButtonText()}</span>
          <span class=${`caret ${this.open ? "open" : ""}`}>
            ${unsafeSVG(ynDropdownPickChevronUpSvg)}
          </span>
        </button>
        <div class=${`panel ${this.open ? "open" : ""}`}>
          <div class="pick-list" @toggle=${this.handlePickToggle}>
            <slot @slotchange=${this.handleSlotChange}></slot>
          </div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "yn-dropdown-pick": YnDropdownPick;
  }
}
