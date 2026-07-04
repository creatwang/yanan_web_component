import fs from "node:fs";

const path = "D:/webstormProject/yanan_web_component/src/components/yn-drawer/yn-drawer.ts";
let s = fs.readFileSync(path, "utf8");
const marker = "declare global {";
const idx = s.lastIndexOf(marker);
if (idx === -1) throw new Error("declare global not found");
const head = s.slice(0, idx).trimEnd();
const tailFromGlobal = s.slice(idx);
const closeIdx = tailFromGlobal.indexOf("\n}");
if (closeIdx === -1) throw new Error("global block end not found");
const globalBlock = tailFromGlobal.slice(0, closeIdx + 2);
s =
  head +
  "\n\n" +
  globalBlock +
  "\n\napplyLitDsd(YnDrawer, \"#drawerPopover\", (el) => el.bootstrapFromDeclarativeShadow());\n";
fs.writeFileSync(path, s);
console.log("apply calls:", (s.match(/applyLitDsd\(/g) ?? []).length, "lines:", s.split(/\n/).length);
