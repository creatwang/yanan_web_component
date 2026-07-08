/**
 * 根据 dist/ ESM 产物更新 app/data/bundle-sizes.ts。
 *
 *   pnpm build && node scripts/generate-bundle-sizes.mjs --write
 *   node scripts/generate-bundle-sizes.mjs --check
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";
import { COMPONENTS } from "./components.manifest.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const distDir = resolve(root, "dist");
const outPath = resolve(root, "app/data/bundle-sizes.ts");
const pkg = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8"));
const write = process.argv.includes("--write");
const check = process.argv.includes("--check") || !write;

/** @param {number} bytes */
const toKb = (bytes) => Math.round((bytes / 1024) * 100) / 100;

/** @param {Buffer} buffer */
const gzipKb = (buffer) => toKb(gzipSync(buffer).length);

/** @param {string} filePath */
const readDistFile = (filePath) => {
  const abs = resolve(distDir, filePath);
  const buffer = readFileSync(abs);
  return { sizeKb: toKb(buffer.length), gzipKb: gzipKb(buffer) };
};

/** @param {RegExp} pattern */
const findDistChunk = (pattern) => {
  const files = readdirSync(distDir)
    .filter((name) => pattern.test(name) && name.endsWith(".js"))
    .map((name) => {
      const abs = join(distDir, name);
      const stat = statSync(abs);
      return { name, size: stat.size };
    })
    .sort((a, b) => b.size - a.size);
  return files[0]?.name ?? null;
};

/** @type {Record<string, { note?: Record<string, string> }>} */
const PRESERVED_NOTES = {
  "yn-sku-selector": {
    note: {
      "zh-CN": "首次注册约 {entryKb} kB；SKU 交互代码约 {chunkKb} kB 会按需加载",
      en: "Initial registration ~{entryKb} kB; SKU interaction code ~{chunkKb} kB loads on demand",
    },
  },
  "yn-pull-cord-switch": {
    note: {
      "zh-CN":
        "页面先加载约 {entryKb} kB（gzip {entryGzipKb} kB）；首次显示/交互时再加载绳子物理动画约 {chunkKb} kB（gzip {chunkGzipKb} kB）",
      en: "Page initially loads ~{entryKb} kB (gzip {entryGzipKb} kB); rope physics animation loads on first render/interaction ~{chunkKb} kB (gzip {chunkGzipKb} kB)",
    },
  },
  "yn-checkout-address": {
    note: {
      "zh-CN":
        "页面先加载注册代码约 {entryKb} kB；地址表单核心约 {chunkKb} kB 按需加载，Google/Photon/dr5hn 探测逻辑再按实际数据源懒加载",
      en: "Page initially loads registration ~{entryKb} kB; address form core ~{chunkKb} kB loads on demand, and Google/Photon/dr5hn provider logic lazy-loads based on the selected source",
    },
  },
};

/** @param {Record<string, string>} template */
const fillNote = (template, vars) =>
  Object.fromEntries(
    Object.entries(template).map(([locale, text]) => [
      locale,
      text.replace(/\{(\w+)\}/g, (_, key) => String(vars[key] ?? "")),
    ]),
  );

/** @param {string} id */
const measureComponent = (id) => {
  const entry = readDistFile(`components/${id}.js`);

  if (id === "yn-sku-selector") {
    const chunkName = findDistChunk(/^yn-sku-selector-.*\.js$/);
    const chunk = chunkName ? readDistFile(chunkName) : { sizeKb: 0, gzipKb: 0 };
    const preserved = PRESERVED_NOTES[id];
    return {
      id,
      importPath: `components/${id}`,
      sizeKb: Math.round((entry.sizeKb + chunk.sizeKb) * 100) / 100,
      gzipKb: Math.round((entry.gzipKb + chunk.gzipKb) * 100) / 100,
      note: preserved?.note
        ? fillNote(preserved.note, {
            entryKb: entry.sizeKb,
            chunkKb: chunk.sizeKb,
          })
        : undefined,
    };
  }

  if (id === "yn-checkout-address") {
    const chunkName = findDistChunk(/^yn-checkout-address-.*\.js$/);
    const chunk = chunkName ? readDistFile(chunkName) : { sizeKb: 0, gzipKb: 0 };
    const preserved = PRESERVED_NOTES[id];
    return {
      id,
      importPath: `components/${id}`,
      sizeKb: Math.round((entry.sizeKb + chunk.sizeKb) * 100) / 100,
      gzipKb: Math.round((entry.gzipKb + chunk.gzipKb) * 100) / 100,
      note: preserved?.note
        ? fillNote(preserved.note, {
            entryKb: entry.sizeKb,
            chunkKb: chunk.sizeKb,
          })
        : undefined,
    };
  }

  if (id === "yn-pull-cord-switch") {
    const chunkName = findDistChunk(/^pull-cord-rope-engine-.*\.js$/);
    const chunk = chunkName ? readDistFile(chunkName) : { sizeKb: 0, gzipKb: 0 };
    const preserved = PRESERVED_NOTES[id];
    return {
      id,
      importPath: `components/${id}`,
      sizeKb: Math.round((entry.sizeKb + chunk.sizeKb) * 100) / 100,
      gzipKb: Math.round((entry.gzipKb + chunk.gzipKb) * 100) / 100,
      note: preserved?.note
        ? fillNote(preserved.note, {
            entryKb: entry.sizeKb,
            entryGzipKb: entry.gzipKb,
            chunkKb: chunk.sizeKb,
            chunkGzipKb: chunk.gzipKb,
          })
        : undefined,
    };
  }

  return {
    id,
    importPath: `components/${id}`,
    sizeKb: entry.sizeKb,
    gzipKb: entry.gzipKb,
  };
};

const builtAt = new Date().toISOString().slice(0, 10);
const indexExport = readDistFile("index.js");
const defineEntry = readDistFile("define.js");
const fullIife = readDistFile("index.iife.js");

const rows = COMPONENTS.map((component) => measureComponent(component.id)).sort(
  (a, b) => a.sizeKb - b.sizeKb,
);

const formatRow = (row) => {
  const note = row.note
    ? `,
    note: ${JSON.stringify(row.note, null, 6).replace(/\n/g, "\n    ")}`
    : "";
  return `  { id: "${row.id}", importPath: "${row.importPath}", sizeKb: ${row.sizeKb}, gzipKb: ${row.gzipKb}${note} }`;
};

const source = `import type { L10nText } from "../i18n/locale";

/** 来自 \`pnpm build\` ESM 产物（v${pkg.version}，${builtAt}）。含分包时标注 total。 */
export type BundleSizeRow = {
  id: string;
  importPath: string;
  sizeKb: number;
  gzipKb: number;
  note?: L10nText;
};

export const BUNDLE_SIZES: BundleSizeRow[] = [
${rows.map(formatRow).join(",\n")}
];

export const BUNDLE_META = {
  builtAt: "${builtAt}",
  fullIifeKb: ${fullIife.sizeKb},
  fullIifeGzipKb: ${fullIife.gzipKb},
  defineKb: ${defineEntry.sizeKb},
  indexExportKb: ${indexExport.sizeKb}
} as const;
`;

if (check) {
  const current = readFileSync(outPath, "utf8");
  if (current !== source) {
    console.error("app/data/bundle-sizes.ts is out of sync with dist/.");
    console.error("Run: pnpm build && pnpm generate:bundle-sizes");
    process.exit(1);
  }
  console.log("Bundle size doc is in sync.");
  process.exit(0);
}

writeFileSync(outPath, source);
console.log(`Updated ${outPath}`);
