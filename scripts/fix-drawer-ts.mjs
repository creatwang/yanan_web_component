import fs from "node:fs";

const path = new URL("../src/components/yn-drawer/yn-drawer.ts", import.meta.url);
let s = fs.readFileSync(path, "utf8");

s = s.replace(
  /import \{ applyLitDsd, dedupeShadowDsdContent, ensureRenderRoot \} from "\.\.\/\.\.\/lib\/lit-dsd\.js";\n/g,
  "",
);
if (!s.includes('from "../../lib/lit-dsd.js"')) {
  s = s.replace(
    'import { ynClose20Svg } from "../../asset/svg";',
    'import { ynClose20Svg } from "../../asset/svg";\nimport { applyLitDsd, dedupeShadowDsdContent, ensureRenderRoot } from "../../lib/lit-dsd.js";',
  );
}

const stylesStart = s.indexOf("  static styles = css`");
const superCb = s.indexOf("    super.connectedCallback();");
const realConnected = s.lastIndexOf("  connectedCallback() {", superCb);
if (stylesStart === -1 || realConnected === -1 || superCb === -1) {
  throw new Error("Could not locate styles/connectedCallback anchors");
}

const before = s.slice(0, stylesStart);
const after = s.slice(realConnected + 1);
s =
  before +
  "  static styles = css`\n    ${unsafeCSS(YN_DRAWER_SHADOW_STYLES)}\n  `;\n\n" +
  after;

s = s.replace(/(\napplyLitDsd\(YnDrawer[^\n]+\n)+/g, "\napplyLitDsd(YnDrawer, \"#drawerPopover\", (el) => el.bootstrapFromDeclarativeShadow());\n");

fs.writeFileSync(path, s);
console.log("ok", {
  bindTrigger: s.includes("private bindTriggerSlotClicks"),
  applyLitDsdCount: (s.match(/applyLitDsd/g) ?? []).length,
  lines: s.split("\n").length,
});
