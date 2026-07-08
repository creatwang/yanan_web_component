/**
 * 根据 scripts/components.manifest.mjs 同步 package.json exports 与 src/define.ts。
 *
 *   node scripts/sync-package-entries.mjs --write
 *   node scripts/sync-package-entries.mjs --check
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildDefineSource,
  buildPackageComponentExports,
} from "./components.manifest.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const pkgPath = resolve(root, "package.json");
const definePath = resolve(root, "src/define.ts");
const write = process.argv.includes("--write");
const check = process.argv.includes("--check") || !write;

if (!write && !check) {
  console.error("Usage: node scripts/sync-package-entries.mjs [--write|--check]");
  process.exit(1);
}

const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
const expectedExports = buildPackageComponentExports();
const expectedDefine = buildDefineSource();

const stableStringify = (value) => JSON.stringify(value, null, 2);

const exportsChanged =
  stableStringify(pkg.exports) !== stableStringify(expectedExports);
const defineChanged = readFileSync(definePath, "utf8") !== expectedDefine;

if (check) {
  let failed = false;
  if (exportsChanged) {
    console.error("package.json exports is out of sync with components.manifest.mjs");
    failed = true;
  }
  if (defineChanged) {
    console.error("src/define.ts is out of sync with components.manifest.mjs");
    failed = true;
  }
  if (failed) {
    console.error("Run: pnpm generate:entries");
    process.exit(1);
  }
  console.log("Package entries are in sync.");
  process.exit(0);
}

pkg.exports = expectedExports;
writeFileSync(pkgPath, `${stableStringify(pkg)}\n`);
writeFileSync(definePath, expectedDefine);
console.log("Synced package.json exports and src/define.ts");
