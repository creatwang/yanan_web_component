/**
 * 从组件 static styles 一次性提取到 *-styles.ts（供 Lit + DSD SSR 共用）。
 * 新组件请直接维护 *-styles.ts，不必再跑本脚本。
 *
 *   node scripts/extract-shadow-styles.mjs
 */
import fs from "node:fs";

/** @param {string} file @param {string} exportName @param {string} outFile */
function extractStyles(file, exportName, outFile) {
  const src = fs.readFileSync(file, "utf8");
  const m = src.match(/static styles = css`([\s\S]*?)`;/);
  if (!m) throw new Error(`no styles in ${file}`);
  fs.writeFileSync(
    outFile,
    `/** Shadow DOM styles — Lit + DSD SSR shared */\nexport const ${exportName} = \`\n${m[1].trim()}\n\`;\n`,
  );
}

const jobs = [
  ["src/components/yn-search/yn-search.ts", "YN_SEARCH_SHADOW_STYLES", "src/components/yn-search/yn-search-styles.ts"],
  [
    "src/components/yn-dropdown-pick/yn-dropdown-pick.ts",
    "YN_DROPDOWN_PICK_SHADOW_STYLES",
    "src/components/yn-dropdown-pick/yn-dropdown-pick-styles.ts",
  ],
  ["src/components/yn-drawer/yn-drawer.ts", "YN_DRAWER_SHADOW_STYLES", "src/components/yn-drawer/yn-drawer-styles.ts"],
];

for (const [file, exportName, outFile] of jobs) {
  extractStyles(file, exportName, outFile);
  console.log(`extracted ${outFile}`);
}
