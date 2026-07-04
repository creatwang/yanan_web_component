import fs from "node:fs";

const path = "D:/webstormProject/yanan_web_component/src/components/yn-drawer/yn-drawer.ts";
let s = fs.readFileSync(path, "utf8");

s = s.replace(
  /(\r?\napplyLitDsd\(YnDrawer, "#drawerPopover", \(el\) => el\.bootstrapFromDeclarativeShadow\(\);)+/g,
  "\n\napplyLitDsd(YnDrawer, \"#drawerPopover\", (el) => el.bootstrapFromDeclarativeShadow());\n",
);

fs.writeFileSync(path, s);
console.log("apply calls:", (s.match(/applyLitDsd\(/g) ?? []).length);
