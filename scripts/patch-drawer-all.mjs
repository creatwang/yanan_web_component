import fs from "node:fs";
import { execSync } from "node:child_process";

const path = "D:/webstormProject/yanan_web_component/src/components/yn-drawer/yn-drawer.ts";
const src = execSync("git show HEAD:src/components/yn-drawer/yn-drawer.ts", {
  cwd: "D:/webstormProject/yanan_web_component",
  encoding: "utf8",
});
fs.writeFileSync(path, src);

execSync("node scripts/patch-drawer-bootstrap.mjs", { cwd: "D:/webstormProject/yanan_web_component", stdio: "inherit" });
execSync("node scripts/patch-drawer-dsd-refs.mjs", { cwd: "D:/webstormProject/yanan_web_component", stdio: "inherit" });

let s = fs.readFileSync(path, "utf8");
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

if (!s.includes("private flushOpenTransition()")) {
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
}

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
console.log("final", {
  flushInSetter: s.includes('this.flushOpenTransition();'),
  getPopoverEl: s.includes("getPopoverEl()"),
  noQuery: !s.includes("@query"),
});
