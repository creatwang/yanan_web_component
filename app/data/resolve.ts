import type { Locale, L10nText } from "../i18n/locale";
import { lt } from "../i18n/locale";
import type { ComponentDocPage, DocPage, GuideDocPage, UsageExample } from "../types";
import { COMPONENT_PAGES } from "./component-pages";
import { COMPONENT_I18N } from "./component-i18n";
import { STORYBOOK_INTROS, STORYBOOK_SHOWCASES } from "./storybook-intros";
import { BUNDLE_SIZES, BUNDLE_META } from "./bundle-sizes";
import { getGuidePage } from "./guides-i18n";
import type { DocShowcase } from "./component-i18n";
import { storybookUrl } from "../storybook";

function same(s: string): L10nText {
  return { "zh-CN": s, en: s };
}

export type ResolvedShowcase = Omit<DocShowcase, "title" | "description" | "code"> & {
  title: string;
  description: string;
  storybookHref: string;
  code?: string;
};

export type ResolvedUsageExample = {
  title: string;
  code: string;
  demoVariant?: string;
};

export type ResolvedComponentPage = {
  kind: "component";
  id: string;
  title: string;
  tag: string;
  className: string;
  importPath: string;
  description: string;
  longDescription: string;
  usageCode: string;
  demoId: string;
  bundleSize?: { sizeKb: number; gzipKb: number; note?: string };
  props: Array<{ name: string; type: string; default: string; desc: string }>;
  events: Array<{ name: string; detail: string; desc: string }>;
  slots: Array<{ name: string; desc: string; priority?: string }>;
  cssVars: Array<{ name: string; default?: string; desc: string }>;
  methods?: Array<{ name: string; signature: string; desc: string }>;
  notes?: string[];
  showcases: ResolvedShowcase[];
  usageExamples?: ResolvedUsageExample[];
};

export type ResolvedGuidePage = GuideDocPage;

function resolveShowcases(id: string, locale: Locale): ResolvedShowcase[] {
  const ext = COMPONENT_I18N[id]?.showcases ?? [];
  const extra = STORYBOOK_SHOWCASES[id] ?? [];
  const merged = [...ext, ...extra.filter((e) => !ext.some((x) => x.id === e.id))];

  return merged.map((s) => ({
    ...s,
    title: lt(s.title, locale),
    description: lt(s.description, locale),
    storybookHref: storybookUrl(s.storybookComponent, s.storybookStory),
    code: s.code ? lt(s.code, locale) : undefined
  }));
}

function resolveComponent(base: ComponentDocPage, locale: Locale): ResolvedComponentPage {
  const ext = COMPONENT_I18N[idKey(base.id)];
  const intro =
    ext?.longDescription ??
    STORYBOOK_INTROS[base.id] ??
    same(base.description);

  const bundle = BUNDLE_SIZES.find((b) => b.id === base.id);

  return {
    kind: "component",
    id: base.id,
    title: ext ? lt(ext.title, locale) : base.title,
    tag: base.tag,
    className: base.className,
    importPath: base.importPath,
    description: ext ? lt(ext.description, locale) : base.description,
    longDescription: lt(intro, locale),
    usageCode: ext ? lt(ext.usageCode, locale) : base.usageCode,
    demoId: base.demoId,
    bundleSize: bundle
      ? {
          sizeKb: bundle.sizeKb,
          gzipKb: bundle.gzipKb,
          note: bundle.note ? lt(bundle.note, locale) : undefined
        }
      : undefined,
    props: (ext?.props ?? base.props.map((p) => ({ ...p, desc: same(p.desc) }))).map((p) => ({
      name: p.name,
      type: p.type,
      default: p.default,
      desc: lt(p.desc, locale)
    })),
    events: (ext?.events ?? base.events.map((e) => ({ ...e, desc: same(e.desc) }))).map((e) => ({
      name: e.name,
      detail: e.detail,
      desc: lt(e.desc, locale)
    })),
    slots: (
      ext?.slots ??
      base.slots.map((s) => ({
        ...s,
        desc: same(s.desc),
        priority: s.priority ? same(s.priority) : undefined
      }))
    ).map((s) => ({
      name: s.name,
      desc: lt(s.desc, locale),
      priority: s.priority ? lt(s.priority, locale) : undefined
    })),
    cssVars: (ext?.cssVars ?? base.cssVars.map((v) => ({ ...v, desc: same(v.desc) }))).map((v) => ({
      name: v.name,
      default: v.default,
      desc: lt(v.desc, locale)
    })),
    methods: (ext?.methods ?? base.methods?.map((m) => ({ ...m, desc: same(m.desc) })))?.map((m) => ({
      name: m.name,
      signature: m.signature,
      desc: lt(m.desc, locale)
    })),
    notes: (ext?.notes ?? base.notes?.map((n) => same(n)))?.map((n) => lt(n, locale)),
    showcases: resolveShowcases(base.id, locale),
    usageExamples: ext?.usageExamples?.map((ex) => ({
      title: lt(ex.title, locale),
      code: lt(ex.code, locale),
      demoVariant: ex.demoVariant
    }))
  };
}

function idKey(id: string) {
  return id;
}

export function getResolvedDocPage(id: string, locale: Locale): DocPage | undefined {
  if (id === "bundle-size") {
    return getBundleSizeGuide(locale);
  }

  const guide = getGuidePage(id, locale);
  if (guide) return guide;

  const base = COMPONENT_PAGES.find((p) => p.id === id);
  if (!base) return undefined;
  return resolveComponent(base, locale);
}

export function getBundleSizeGuide(locale: Locale): GuideDocPage {
  const isZh = locale === "zh-CN";
  return {
    kind: "guide",
    id: "bundle-size",
    title: isZh ? "打包体积" : "Bundle Size",
    description: isZh
      ? `基于 pnpm build ESM 产物（${BUNDLE_META.builtAt}）。按需导入单组件体积如下；全量 IIFE 约 ${BUNDLE_META.fullIifeKb} kB（gzip ${BUNDLE_META.fullIifeGzipKb} kB）。`
      : `From pnpm build ESM output (${BUNDLE_META.builtAt}). Per-component on-demand sizes below; full IIFE ~${BUNDLE_META.fullIifeKb} kB (gzip ${BUNDLE_META.fullIifeGzipKb} kB).`,
    sections: [
      {
        id: "table",
        title: isZh ? "组件体积一览" : "Component sizes",
        body: isZh
          ? "以下为 `yn-web-component/components/*` 子路径 ESM 体积（kB）。含分包者标注合计。"
          : "ESM sizes (kB) for `yn-web-component/components/*` subpaths. Totals shown when chunked."
      },
      {
        id: "tips",
        title: isZh ? "优化建议" : "Tips",
        body: isZh
          ? "1) 优先子路径按需导入，避免 `define` 全量注册。2) `yn-checkout-address` / `yn-pull-cord-switch` 体积较大，仅在结账/主题页引入。3) 共享 lit 依赖由宿主打包器 externals 或 dedupe。"
          : "1) Prefer subpath imports over `define`. 2) Large: checkout-address, pull-cord-switch—import only where needed. 3) Dedupe `lit` in host bundler."
      }
    ]
  };
}

export function getBundleTableRows(locale: Locale) {
  return BUNDLE_SIZES.map((row) => ({
    id: row.id,
    importPath: `yn-web-component/${row.importPath}`,
    size: `${row.sizeKb.toFixed(2)} kB`,
    gzip: `${row.gzipKb.toFixed(2)} kB`,
    note: row.note ? lt(row.note, locale) : "—"
  }));
}
