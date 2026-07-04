import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const file = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../src/components/yn-drawer/yn-drawer.ts",
)
let src = fs.readFileSync(file, "utf8")

if (!src.includes('from "../../lib/lit-dsd.js"')) {
  src = src.replace(
    'import { ynClose20Svg } from "../../asset/svg";\r\n',
    'import { ynClose20Svg } from "../../asset/svg";\r\nimport { applyLitDsd, dedupeShadowDsdContent, ensureRenderRoot } from "../../lib/lit-dsd.js";\r\n',
  )
  src = src.replace(
    'import { ynClose20Svg } from "../../asset/svg";\n',
    'import { ynClose20Svg } from "../../asset/svg";\nimport { applyLitDsd, dedupeShadowDsdContent, ensureRenderRoot } from "../../lib/lit-dsd.js";\n',
  )
}

const bootstrap = `
  bootstrapFromDeclarativeShadow() {
    const root = this.shadowRoot;
    if (!root) return;
    dedupeShadowDsdContent(root, "#drawerPopover");
    ensureRenderRoot(this);
    root.querySelector(".trigger-wrap")?.addEventListener("click", this.handleTriggerClick);
    root.querySelector(".close-btn")?.addEventListener("click", this.handleCloseClick);
    root.querySelector(".backdrop")?.addEventListener("click", this.handleBackdropClick);
    root.querySelector("#drawerPopover")?.addEventListener("keydown", this.handleEscape as EventListener);
    root.querySelector('slot[name="footer"]')?.addEventListener("slotchange", this.handleFooterSlotChange);
    root.querySelector('slot[name="backdrop-extra"]')?.addEventListener("slotchange", this.handleBackdropExtraSlotChange);
    this.syncFooterEmptyState();
    this.syncBackdropExtraEmptyState();
    this.syncPopoverState(true);
  }
`

if (!src.includes("bootstrapFromDeclarativeShadow")) {
  src = src.replace(
    "  protected updated(changed: PropertyValues) {",
    `${bootstrap}\n  protected updated(changed: PropertyValues) {`,
  )
}

if (!src.includes("applyLitDsd(YnDrawer")) {
  src = src.replace(
    /declare global \{\r?\n  interface HTMLElementTagNameMap \{\r?\n    "yn-drawer": YnDrawer;\r?\n  \}\r?\n\}\r?\n?$/,
    `declare global {
  interface HTMLElementTagNameMap {
    "yn-drawer": YnDrawer;
  }
}

applyLitDsd(YnDrawer, "#drawerPopover", (el) => el.bootstrapFromDeclarativeShadow());
`,
  )
}

fs.writeFileSync(file, src)
