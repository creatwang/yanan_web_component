/**
 * 1. 为 CEM 补全 tagName / attribute / 枚举类型 / 属性说明
 * 2. 生成 WebStorm web-types.json 与 VS Code html-custom-data.json
 * 3. 按 scripts/ide-attribute-meta.mjs 补全枚举可选值与用法说明
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { generateJetBrainsWebTypes } from "custom-element-jet-brains-integration";
import { generateVsCodeCustomElementData } from "custom-element-vs-code-integration";
import tagMeta from "./ide-attribute-meta.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const manifestPath = resolve(root, "custom-elements.json");

/** @typedef {import('custom-elements-manifest').Package} CemPackage */

/** @type {CemPackage} */
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));

const CUSTOM_ELEMENT_RE = /@customElement\s*\(\s*["']([^"']+)["']\s*\)/;
const PROPERTY_RE = /@property\s*\(\s*\{([^}]*)\}\s*\)\s+(\w+)/g;
const TYPE_ALIAS_RE = /(?:export\s+)?type\s+(\w+)\s*=\s*([\s\S]*?);/g;
const PROP_DOC_RE = /\/\*\*\s*([\s\S]*?)\s*\*\/\s*@property\s*\(\s*\{[^}]*\}\s*\)\s+(\w+)/g;

const camelToKebab = (name) => name.replace(/([A-Z])/g, "-$1").toLowerCase();

const parseAttributeName = (optionsStr, propName) => {
  const quoted = optionsStr.match(/attribute:\s*["']([^"']+)["']/);
  if (quoted) return quoted[1];
  const bare = optionsStr.match(/attribute:\s*([a-z][\w-]*)/);
  if (bare) return bare[1];
  return camelToKebab(propName);
};

/** @param {string} rhs */
const extractUnionLiterals = (rhs) => {
  const literals = [];
  for (const m of rhs.matchAll(/["']([^"']+)["']/g)) {
    if (!literals.includes(m[1])) literals.push(m[1]);
  }
  return literals;
};

/** @param {string} source */
const parseTypeAliases = (source) => {
  /** @type {Map<string, string[]>} */
  const map = new Map();
  for (const m of source.matchAll(TYPE_ALIAS_RE)) {
    const literals = extractUnionLiterals(m[2]);
    if (literals.length) map.set(m[1], literals);
  }
  return map;
};

/** @param {string | undefined} typeText @param {Map<string, string[]>} aliases */
const resolveEnumLiterals = (typeText, aliases) => {
  if (!typeText) return null;
  const trimmed = typeText.trim();
  if (trimmed.includes("|")) {
    const direct = extractUnionLiterals(trimmed);
    if (direct.length) return direct;
  }
  const alias = aliases.get(trimmed.replace(/\s/g, ""));
  if (alias?.length) return alias;
  return null;
};

const cleanJsDoc = (raw) =>
  raw
    .split("\n")
    .map((line) => line.replace(/^\s*\*\s?/, "").trimEnd())
    .join("\n")
    .trim();

/** @param {string} description @param {Record<string, string> | undefined} valueDocs */
const formatAttrDescription = (description, valueDocs) => {
  const parts = [];
  if (description) parts.push(description);
  if (valueDocs && Object.keys(valueDocs).length) {
    const lines = Object.entries(valueDocs).map(([k, v]) => `- \`${k}\` — ${v}`);
    parts.push(`**可选值：**\n${lines.join("\n")}`);
  }
  return parts.join("\n\n");
};

/** @param {string} tag @param {import('custom-elements-manifest').Attribute} attr */
const getAttrMeta = (tag, attr) => tagMeta[tag]?.attributes?.[attr.name];

manifest.modules = manifest.modules.filter(
  (mod) => mod.path !== "src/components/yn-icon-connect-button.ts"
);

for (const mod of manifest.modules) {
  const filePath = resolve(root, mod.path);
  let source;
  try {
    source = readFileSync(filePath, "utf8");
  } catch {
    continue;
  }

  const tagName = source.match(CUSTOM_ELEMENT_RE)?.[1];
  const propAttributes = new Map();
  /** @type {Map<string, string>} */
  const propDocs = new Map();
  const typeAliases = parseTypeAliases(source);

  for (const match of source.matchAll(PROPERTY_RE)) {
    propAttributes.set(match[2], parseAttributeName(match[1], match[2]));
  }
  for (const match of source.matchAll(PROP_DOC_RE)) {
    const doc = cleanJsDoc(match[1]);
    if (doc && !doc.startsWith("@")) propDocs.set(match[2], doc);
  }

  for (const decl of mod.declarations ?? []) {
    if (!decl.customElement) continue;
    if (tagName) decl.tagName = tagName;

    const meta = tagName ? tagMeta[tagName] : undefined;
    if (meta?.summary && !decl.summary) decl.summary = meta.summary;

    /** @type {import('custom-elements-manifest').Attribute[]} */
    const attributes = [];

    for (const member of decl.members ?? []) {
      if (member.kind !== "field" || member.static || member.privacy === "private") continue;
      const attrName = propAttributes.get(member.name);
      if (!attrName) continue;

      const am = tagName ? getAttrMeta(tagName, { name: attrName }) : undefined;
      const typeText = member.type?.text;
      const enumLiterals = resolveEnumLiterals(typeText, typeAliases);
      const description =
        am?.description ?? member.description ?? propDocs.get(member.name) ?? undefined;

      member.attribute = attrName;
      if (enumLiterals?.length) {
        member.type = { text: enumLiterals.map((v) => `"${v}"`).join(" | ") };
      }

      /** @type {import('custom-elements-manifest').Attribute} */
      const attr = {
        name: attrName,
        fieldName: member.name,
        type: member.type,
        description,
        default: member.default
      };
      if (enumLiterals?.length) {
        attr.type = { text: enumLiterals.map((v) => `"${v}"`).join(" | ") };
      }
      attributes.push(attr);
    }

    if (attributes.length) decl.attributes = attributes;
  }
}

writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

const webTypesPath = resolve(root, "web-types.json");
const vscodeHtmlPath = resolve(root, ".vscode/html-custom-data.json");

generateJetBrainsWebTypes(manifest, {
  outdir: root,
  webTypesFileName: "web-types.json"
});

mkdirSync(resolve(root, ".vscode"), { recursive: true });
generateVsCodeCustomElementData(manifest, {
  outdir: resolve(root, ".vscode"),
  htmlFileName: "html-custom-data.json",
  cssFileName: null
});

/** @param {string} path */
const patchWebTypes = (path) => {
  const data = JSON.parse(readFileSync(path, "utf8"));
  for (const el of data.contributions?.html?.elements ?? []) {
    const meta = tagMeta[el.name];
    if (meta?.summary) {
      const parts = (el.description ?? "").split("\n---\n");
      const body = parts.length > 1 ? parts.slice(1).join("\n---\n") : "";
      el.description = body ? `${meta.summary}\n---\n${body}` : meta.summary;
    }
    for (const attr of el.attributes ?? []) {
      const am = meta?.attributes?.[attr.name];
      if (!am) continue;
      const desc = formatAttrDescription(
        am.description ?? attr.description,
        am.values
      );
      if (desc) attr.description = desc;
      if (am.values) {
        const literals = Object.keys(am.values);
        attr.value = attr.value ?? {};
        attr.value.type = literals.length > 1 ? literals : literals[0] ?? attr.value.type;
        if (!attr.value.default && literals.length) {
          const def = attr.value.default?.replace?.(/^"|"$/g, "");
          if (def && literals.includes(def)) attr.value.default = def;
        }
      }
    }
  }
  writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`);
};

/** @param {string} path */
const patchVsCodeHtml = (path) => {
  const data = JSON.parse(readFileSync(path, "utf8"));
  for (const tag of data.tags ?? []) {
    const meta = tagMeta[tag.name];
    if (meta?.summary) {
      const parts = (tag.description ?? "").split("\n---\n");
      const body = parts.length > 1 ? parts.slice(1).join("\n---\n") : parts[0] ?? "";
      tag.description = body && body !== meta.summary ? `${meta.summary}\n---\n${body}` : meta.summary;
    }
    for (const attr of tag.attributes ?? []) {
      const am = meta?.attributes?.[attr.name];
      if (!am) continue;
      const desc = formatAttrDescription(am.description, am.values);
      if (desc) attr.description = desc;
      if (am.values) {
        attr.values = Object.entries(am.values).map(([name, description]) => ({
          name,
          description
        }));
      }
    }
  }
  writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`);
};

patchWebTypes(webTypesPath);
patchVsCodeHtml(vscodeHtmlPath);

console.log("IDE metadata: custom-elements.json, web-types.json, .vscode/html-custom-data.json");
