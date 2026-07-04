import fs from "node:fs";

const path = "D:/webstormProject/yanan_web_component/src/components/yn-drawer/yn-drawer.ts";
let s = fs.readFileSync(path, "utf8");

if (s.includes("flushOpenTransition")) {
  console.log("already patched");
  process.exit(0);
}

s = s.replace(
  `    this._open = normalized;
    this.pendingTransitionMeta = nextMeta;
    this.requestUpdate("open", oldValue);
  }`,
  `    this._open = normalized;
    this.pendingTransitionMeta = nextMeta;
    this.requestUpdate("open", oldValue);
    this.flushOpenTransition();
  }`,
);

s = s.replace(
  "  private syncSheetHeight() {",
  `  private flushOpenTransition() {
    const transitionMeta = this.pendingTransitionMeta;
    if (!transitionMeta) return;
    this.pendingTransitionMeta = undefined;
    this.syncPopoverState(false, transitionMeta);
    this.emitOpenChange(transitionMeta);
  }

  private syncSheetHeight() {`,
);

s = s.replace(
  `    if (changed.has("open")) {
      const transitionMeta = this.pendingTransitionMeta ?? {
        nextOpen: this.open,
        source: "property" as const
      };
      this.pendingTransitionMeta = undefined;
      this.syncPopoverState(false, transitionMeta);
      this.emitOpenChange(transitionMeta);
    }`,
  `    if (changed.has("open")) {
      this.pendingTransitionMeta = undefined;
    }`,
);

fs.writeFileSync(path, s);
console.log("patched", s.includes("flushOpenTransition"));
