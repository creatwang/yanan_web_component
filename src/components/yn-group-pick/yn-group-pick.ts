import { LitElement, css, html } from "lit";
import { customElement, property, queryAssignedElements } from "lit/decorators.js";
import type { YnPick } from "../yn-pick/yn-pick";

type PickValue = string | number;
type GroupValue = PickValue | PickValue[];

export type YnGroupPickChangeDetail = {
  ids: PickValue[];
  flag: boolean;
};

const parsePrimitive = (raw: unknown): PickValue => {
  if (typeof raw === "number") return raw;
  if (typeof raw === "string") {
    const value = raw.trim();
    if (/^-?\d+(\.\d+)?$/.test(value)) {
      return Number(value);
    }
    return value;
  }
  return String(raw ?? "");
};

const normalizeGroupValue = (input: unknown): GroupValue => {
  if (Array.isArray(input)) {
    return input.map((item) => parsePrimitive(item));
  }
  return parsePrimitive(input);
};

const parseGroupValueFromAttribute = (raw: string | null): GroupValue => {
  if (raw === null) return "";
  const value = raw.trim();
  if (value === "") return "";
  if (value.startsWith("[")) {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return normalizeGroupValue(parsed);
      }
    } catch {
      return value;
    }
  }
  return parsePrimitive(value);
};

@customElement("yn-group-pick")
export class YnGroupPick extends LitElement {
  @property({
    attribute: "value",
    converter: {
      fromAttribute: (value) => parseGroupValueFromAttribute(value),
      toAttribute: (value) => (Array.isArray(value) ? JSON.stringify(value) : String(value ?? ""))
    }
  })
  value: GroupValue = "";

  @property({ type: Boolean, reflect: true })
  multiple = false;

  @property({ type: String, attribute: "selected-icon" })
  selectedIcon = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
<path d="M10 18C14.4182 18 18 14.4182 18 10C18 5.58172 14.4182 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4182 5.58172 18 10 18Z" fill="#241F21"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M14.1207 8.02566L8.86034 13.0355L6 10.3114L7.03448 9.22517L8.17069 10.3073C8.5569 10.6751 9.16379 10.6751 9.55 10.3073L13.0862 6.93945L14.1207 8.02566Z" fill="white"/>
</svg>`;

  @property({ type: String, attribute: "close-icon" })
  closeIcon = "";

  @queryAssignedElements({ selector: "yn-pick", flatten: true })
  private picks!: YnPick[];

  static styles = css`
    :host {
      display: block;
    }

    .group {
      display: flex;
      flex-wrap: wrap;
      gap: var(--yn-group-pick-gap, 12px);
    }
  `;

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener("toggle", this.onPickToggle as EventListener);
  }

  disconnectedCallback() {
    this.removeEventListener("toggle", this.onPickToggle as EventListener);
    super.disconnectedCallback();
  }

  protected firstUpdated() {
    this.syncChildrenState();
  }

  protected updated(changed: Map<string, unknown>) {
    if (changed.has("value") || changed.has("multiple") || changed.has("selectedIcon") || changed.has("closeIcon")) {
      this.syncChildrenState();
    }
  }

  private getCurrentIds() {
    if (Array.isArray(this.value)) {
      return this.value;
    }
    if (this.value === "" || this.value === null || this.value === undefined) {
      return [];
    }
    return [this.value];
  }

  private toComparable(value: PickValue) {
    return String(value);
  }

  private isSelected(value: PickValue) {
    const selected = this.getCurrentIds();
    const target = this.toComparable(value);
    return selected.some((item) => this.toComparable(item) === target);
  }

  private syncChildrenState() {
    const picks = this.picks ?? [];
    picks.forEach((pick) => {
      pick.selected = this.isSelected(pick.value);
      if (!pick.hasAttribute("selected-icon")) {
        pick.selectedIcon = this.selectedIcon;
      }
      if (!pick.hasAttribute("close-icon")) {
        pick.closeIcon = this.closeIcon;
      }
    });
  }

  private emitChange(ids: PickValue[], flag: boolean) {
    this.dispatchEvent(
      new CustomEvent<YnGroupPickChangeDetail>("change", {
        detail: { ids, flag },
        bubbles: true,
        composed: true
      })
    );
  }

  private onPickToggle(event: Event) {
    const detail = (event as CustomEvent<{ id: PickValue; flag: boolean }>).detail;
    if (!detail) return;
    const targetId = detail.id;
    const current = this.getCurrentIds();
    const targetKey = this.toComparable(targetId);
    const exists = current.some((item) => this.toComparable(item) === targetKey);
    let ids: PickValue[] = [];
    let flag = false;

    if (this.multiple) {
      if (exists) {
        ids = current.filter((item) => this.toComparable(item) !== targetKey);
        flag = false;
      } else {
        ids = [...current, targetId];
        flag = true;
      }
      this.value = ids;
    } else if (exists) {
      ids = [];
      flag = false;
      this.value = "";
    } else {
      ids = [targetId];
      flag = true;
      this.value = targetId;
    }

    this.syncChildrenState();
    this.emitChange(ids, flag);
  }

  private onSlotChange() {
    this.syncChildrenState();
  }

  render() {
    return html`
      <div class="group">
        <slot @slotchange=${this.onSlotChange}></slot>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "yn-group-pick": YnGroupPick;
  }
}
