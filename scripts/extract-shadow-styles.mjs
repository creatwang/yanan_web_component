import fs from "node:fs";

function extractStyles(file, exportName, outFile) {
  const src = fs.readFileSync(file, "utf8");
  const m = src.match(/static styles = css`([\s\S]*?)`;/);
  if (!m) throw new Error(`no styles in ${file}`);
  fs.writeFileSync(
    outFile,
    `/** Shadow DOM styles — Lit + DSD SSR shared */\nexport const ${exportName} = \`\n${m[1].trim()}\n\`;\n`,
  );
}

extractStyles(
  "src/components/yn-search/yn-search.ts",
  "YN_SEARCH_SHADOW_STYLES",
  "src/components/yn-search/yn-search-styles.ts",
);
extractStyles(
  "src/components/yn-dropdown-pick/yn-dropdown-pick.ts",
  "YN_DROPDOWN_PICK_SHADOW_STYLES",
  "src/components/yn-dropdown-pick/yn-dropdown-pick-styles.ts",
);
extractStyles(
  "src/components/yn-drawer/yn-drawer.ts",
  "YN_DRAWER_SHADOW_STYLES",
  "src/components/yn-drawer/yn-drawer-styles.ts",
);

console.log("extracted 3 style files");
