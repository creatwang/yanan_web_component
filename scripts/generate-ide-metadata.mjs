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

/** @param {string} tag @param {{ name: string }} attr */
const getAttrMeta = (tag, attr) => tagMeta[tag]?.attributes?.[attr.name];

const DEFAULT_CSS_VAR_DESC = "可覆写的 CSS 变量（Shadow DOM；写在组件 `style` 或外层选择器上）。";

/** @param {string} source @param {string} tagName */
const extractCssVariables = (source, tagName) => {
  const prefix = `--${tagName}-`;
  /** @type {Set<string>} */
  const names = new Set();
  for (const m of source.matchAll(/(--yn-[a-z0-9-]+)/gi)) {
    const name = m[1];
    if (name.startsWith("--_")) continue;
    if (name.startsWith(prefix)) names.add(name);
  }
  return [...names].sort();
};

/** @param {string} source */
const parseSlotsFromJsDoc = (source) => {
  /** @type {import('./ide-attribute-meta.mjs').TagMeta['slots']} */
  const slots = [];
  for (const m of source.matchAll(/@slot\s+([^\n*]+)/g)) {
    const line = m[1].trim();
    const dash = line.indexOf(" - ");
    if (dash >= 0) {
      const rawName = line.slice(0, dash).trim();
      slots.push({
        name: rawName === "-" || rawName === "" ? undefined : rawName,
        description: line.slice(dash + 3).trim()
      });
    } else if (line) {
      slots.push({ description: line });
    }
  }
  return slots;
};

/** @param {string} source */
const parseSlotsFromTemplate = (source) => {
  /** @type {Map<string, string>} */
  const names = new Map();
  if (/<slot(?:\s|>)/.test(source) && !/<slot\s+name=/.test(source.split("render")[1] ?? source)) {
    names.set("", "默认插槽");
  }
  for (const m of source.matchAll(/<slot\s+name=["']([^"']+)["']/g)) {
    if (!names.has(m[1])) names.set(m[1], "");
  }
  return [...names.entries()].map(([name, description]) =>
    name ? { name, description: description || `具名插槽 \`${name}\`` } : { description: description || "默认插槽" }
  );
};

/** @param {...import('./ide-attribute-meta.mjs').TagMeta['slots']} lists 先传入的优先（meta > JSDoc > 模板推断） */
const mergeSlots = (...lists) => {
  /** @type {Map<string, import('./ide-attribute-meta.mjs').TagMeta['slots'][0]>} */
  const map = new Map();
  for (const list of lists) {
    for (const slot of list ?? []) {
      const key = slot.name ?? "";
      const fallback = slot.name ? `具名插槽 \`${slot.name}\`` : "默认插槽";
      const existing = map.get(key);
      if (!existing) {
        map.set(key, { name: slot.name, description: slot.description || fallback });
        continue;
      }
      if (
        slot.description &&
        (!existing.description ||
          existing.description === fallback ||
          existing.description.startsWith("具名插槽"))
      ) {
        existing.description = slot.description;
      }
    }
  }
  return [...map.values()];
};

/** @param {string} tagName @param {string} source @param {import('./ide-attribute-meta.mjs').TagMeta | undefined} meta */
const resolveComponentDocs = (tagName, source, meta) => {
  const extractedCss = extractCssVariables(source, tagName);
  /** @type {Record<string, string>} */
  const cssVariables = {};
  for (const name of extractedCss) {
    cssVariables[name] = meta?.cssVariables?.[name] ?? DEFAULT_CSS_VAR_DESC;
  }
  for (const [name, desc] of Object.entries(meta?.cssVariables ?? {})) {
    cssVariables[name] = desc;
  }

  const slots = mergeSlots(meta?.slots, parseSlotsFromJsDoc(source), parseSlotsFromTemplate(source));

  return { cssVariables, slots };
};

/** @param {import('./ide-attribute-meta.mjs').TagMeta | undefined} meta @param {{ name: string, description?: string, value?: { default?: string } }[]} attributes @param {import('./ide-attribute-meta.mjs').TagMeta['slots']} slots @param {Record<string, string>} cssVariables */
const buildTagOverview = (meta, attributes, slots, cssVariables) => {
  const parts = [];
  if (meta?.summary) parts.push(meta.summary);

  if (attributes.length) {
    const lines = attributes.map((attr) => {
      const am = meta?.attributes?.[attr.name];
      const head = am?.description ?? attr.description ?? "";
      const values = am?.values
        ? ` — 可选：${Object.keys(am.values)
            .map((k) => `\`${k}\``)
            .join("、")}`
        : "";
      const def = attr.value?.default ? `（默认 ${attr.value.default.replace(/^"|"$/g, "")}）` : "";
      return `- \`${attr.name}\`${def} — ${head}${values}`;
    });
    parts.push(`### HTML 属性\n${lines.join("\n")}`);
  }

  if (slots.length) {
    const lines = slots.map((slot) => {
      const label = slot.name ? `\`${slot.name}\`` : "（默认）";
      return `- ${label} — ${slot.description}`;
    });
    parts.push(`### 插槽\n${lines.join("\n")}`);
  }

  if (Object.keys(cssVariables).length) {
    const lines = Object.entries(cssVariables).map(([name, desc]) => `- \`${name}\` — ${desc}`);
    parts.push(
      `### CSS 变量\n在标签上写 \`style="${Object.keys(cssVariables)[0]}: …"\` 等形式覆写：\n${lines.join("\n")}`
    );
  }

  return parts.join("\n\n");
};

/** @type {Map<string, { source: string, attributes: import('custom-elements-manifest').Attribute[] }>} */
const componentIndex = new Map();

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

    if (tagName) {
      const docs = resolveComponentDocs(tagName, source, tagMeta[tagName]);
      if (docs.slots.length) {
        decl.slots = docs.slots.map((slot) => ({
          name: slot.name ?? "",
          description: slot.description
        }));
      }
      if (Object.keys(docs.cssVariables).length) {
        decl.cssProperties = Object.entries(docs.cssVariables).map(([name, description]) => ({
          name,
          description
        }));
      }
      componentIndex.set(tagName, { source, attributes });
    }
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
  /** @type {Record<string, string>} */
  const globalCss = {};

  for (const el of data.contributions?.html?.elements ?? []) {
    const meta = tagMeta[el.name];
    const indexed = componentIndex.get(el.name);
    const docs = indexed
      ? resolveComponentDocs(el.name, indexed.source, meta)
      : { cssVariables: meta?.cssVariables ?? {}, slots: meta?.slots ?? [] };

    for (const attr of el.attributes ?? []) {
      const am = meta?.attributes?.[attr.name];
      if (!am) continue;
      const desc = formatAttrDescription(am.description ?? attr.description, am.values);
      if (desc) attr.description = desc;
      if (am.values) {
        const literals = Object.keys(am.values);
        attr.value = attr.value ?? {};
        attr.value.type = literals.length > 1 ? literals : literals[0] ?? attr.value.type;
      }
    }

    if (docs.slots.length) {
      el.slots = docs.slots.map((slot) => ({
        name: slot.name ?? "",
        description: slot.description
      }));
    }

    if (Object.keys(docs.cssVariables).length) {
      el.css = {
        properties: Object.entries(docs.cssVariables).map(([name, description]) => {
          globalCss[name] = globalCss[name]
            ? `${globalCss[name]}；**${el.name}**`
            : `**${el.name}** — ${description}`;
          return { name, description };
        })
      };
    }

    const overview = buildTagOverview(meta, el.attributes ?? [], docs.slots, docs.cssVariables);
    if (overview) el.description = overview;
  }

  data.contributions.css = data.contributions.css ?? { properties: [], "pseudo-elements": [] };
  data.contributions.css.properties = Object.entries(globalCss).map(([name, description]) => ({
    name,
    description
  }));

  writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`);
};

/** @param {string} path */
const patchVsCodeHtml = (path) => {
  const data = JSON.parse(readFileSync(path, "utf8"));
  for (const tag of data.tags ?? []) {
    const meta = tagMeta[tag.name];
    const indexed = componentIndex.get(tag.name);
    const docs = indexed
      ? resolveComponentDocs(tag.name, indexed.source, meta)
      : { cssVariables: meta?.cssVariables ?? {}, slots: meta?.slots ?? [] };

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

    const overview = buildTagOverview(
      meta,
      (tag.attributes ?? []).map((a) => ({ name: a.name, description: a.description })),
      docs.slots,
      docs.cssVariables
    );
    if (overview) {
      tag.description = {
        kind: "markdown",
        value: overview
      };
    }
  }
  writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`);
};

/** @param {string} path */
const writeVsCodeCss = (path) => {
  /** @type {Record<string, string>} */
  const merged = {};
  for (const [tag, { source }] of componentIndex) {
    const docs = resolveComponentDocs(tag, source, tagMeta[tag]);
    for (const [name, desc] of Object.entries(docs.cssVariables)) {
      merged[name] = merged[name] ? `${merged[name]}\n\n**${tag}:** ${desc}` : `**${tag}:** ${desc}`;
    }
  }
  const payload = {
    version: 1.1,
    properties: Object.entries(merged)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([name, description]) => ({
        name,
        description: { kind: "markdown", value: description }
      }))
  };
  writeFileSync(path, `${JSON.stringify(payload, null, 2)}\n`);
};

patchWebTypes(webTypesPath);
patchVsCodeHtml(vscodeHtmlPath);
writeVsCodeCss(resolve(root, ".vscode/css-custom-data.json"));

console.log(
  "IDE metadata: custom-elements.json, web-types.json, .vscode/html-custom-data.json, .vscode/css-custom-data.json"
);
