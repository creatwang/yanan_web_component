import fs from "node:fs";

const path = "D:/webstormProject/yanan_web_component/src/components/yn-drawer/yn-drawer.ts";
let s = fs.readFileSync(path, "utf8");

s = s.replace(
  /  @query\("#drawerPopover"\)\r?\n  private popoverEl!: HTMLElement;\r?\n\r?\n  @query\('slot\[name="trigger"\]'\)\r?\n  private triggerSlotEl!: HTMLSlotElement;\r?\n\r?\n  @query\('slot\[name="footer"\]'\)\r?\n  private footerSlotEl!: HTMLSlotElement;\r?\n\r?\n  @query\('slot\[name="backdrop-extra"\]'\)\r?\n  private backdropExtraSlotEl!: HTMLSlotElement;\r?\n\r?\n/,
  `  private getPopoverEl() {
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

`,
);

s = s.replace(
  /  private syncPopoverState\([\s\S]*?\) \{\r?\n    if \(!this\.popoverEl\) return;/,
  `  private syncPopoverState(
    initial: boolean,
    meta: {
      source: YnDrawerLifecycleSource;
      payload?: unknown;
      triggerPayload?: unknown;
    } = { source: "property" }
  ) {
    const popoverEl = this.getPopoverEl();
    if (!popoverEl) return;`,
);

s = s.replace(
  /  private showDrawerPopover\(meta: \{ source: YnDrawerLifecycleSource; payload\?: unknown; triggerPayload\?: unknown \}\) \{\r?\n    if \(!this\.popoverEl\.matches\(":popover-open"\)\) \{\r?\n      this\.popoverEl\.showPopover\(\);\r?\n    \}\r?\n    this\.popoverEl\.classList\.remove\("closing"\);\r?\n    this\.popoverEl\.classList\.remove\("visible"\);\r?\n    requestAnimationFrame\(\(\) => \{\r?\n      this\.popoverEl\.classList\.add\("visible"\);\r?\n    \}\);/,
  `  private showDrawerPopover(meta: { source: YnDrawerLifecycleSource; payload?: unknown; triggerPayload?: unknown }) {
    const popoverEl = this.getPopoverEl();
    if (!popoverEl) return;
    if (!popoverEl.matches(":popover-open")) {
      popoverEl.showPopover();
    }
    popoverEl.classList.remove("closing");
    popoverEl.classList.remove("visible");
    requestAnimationFrame(() => {
      popoverEl.classList.add("visible");
    });`,
);

s = s.replace(
  /  private hideDrawerPopover\([\s\S]*?\) \{\r?\n    if \(!this\.popoverEl\.matches\(":popover-open"\)\) return;/,
  `  private hideDrawerPopover(
    immediate: boolean,
    meta: { source: YnDrawerLifecycleSource; payload?: unknown; triggerPayload?: unknown }
  ) {
    const popoverEl = this.getPopoverEl();
    if (!popoverEl || !popoverEl.matches(":popover-open")) return;`,
);

s = s.replace(/this\.popoverEl\./g, "popoverEl.");
s = s.replace(/if \(!this\.popoverEl\)/g, "if (!popoverEl)");

s = s.replace(/\bthis\.triggerSlotEl\b/g, "this.getTriggerSlotEl()");
s = s.replace(/\bthis\.footerSlotEl\b/g, "this.getFooterSlotEl()");
s = s.replace(/\bthis\.backdropExtraSlotEl\b/g, "this.getBackdropExtraSlotEl()");

s = s.replace(
  "this.slotHasMeaningfulContent(this.getFooterSlotEl())",
  "this.slotHasMeaningfulContent(this.getFooterSlotEl() ?? undefined)",
);
s = s.replace(
  "this.slotHasMeaningfulContent(this.getBackdropExtraSlotEl())",
  "this.slotHasMeaningfulContent(this.getBackdropExtraSlotEl() ?? undefined)",
);

s = s.replace(/import \{ customElement, property, query \}/, "import { customElement, property }");

fs.writeFileSync(path, s);
console.log("ok", {
  noQuery: !s.includes("@query"),
  hasGetter: s.includes("getPopoverEl()"),
  noThisPopover: !s.includes("this.popoverEl"),
});
