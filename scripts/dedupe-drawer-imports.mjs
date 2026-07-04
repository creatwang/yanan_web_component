import fs from "node:fs";

const path = "D:/webstormProject/yanan_web_component/src/components/yn-drawer/yn-drawer.ts";
let s = fs.readFileSync(path, "utf8");

const importLine =
  'import { applyLitDsd, dedupeShadowDsdContent, ensureRenderRoot } from "../../lib/lit-dsd.js";\r\n';
s = s.replaceAll(importLine, "");
s = s.replace(
  'import { ynClose20Svg } from "../../asset/svg";\r\n',
  `import { ynClose20Svg } from "../../asset/svg";\r\n${importLine}`,
);

const applyLine =
  'applyLitDsd(YnDrawer, "#drawerPopover", (el) => el.bootstrapFromDeclarativeShadow());\r\n';
s = s.replaceAll(applyLine, "");
s = s.trimEnd() + `\r\n\r\n${applyLine}`;

fs.writeFileSync(path, s);
console.log("deduped", {
  imports: (s.match(/from "\.\.\/\.\.\/lib\/lit-dsd\.js"/g) ?? []).length,
  apply: (s.match(/applyLitDsd\(/g) ?? []).length,
});
