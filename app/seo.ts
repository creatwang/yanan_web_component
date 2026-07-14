import type { Locale } from "./i18n/locale";
import { getDocPage } from "./data";
import { docHref, getBasePath } from "./router";

const NPM_PACKAGE_URL = "https://www.npmjs.com/package/yn-web-component";
const GITHUB_REPO_URL = "https://github.com/creatwang/yanan_web_component";

/** 文档站 canonical 根地址（部署后可在 .env 设置 VITE_DOCS_SITE_URL） */
export function getSiteOrigin(): string {
  const fromEnv = import.meta.env.VITE_DOCS_SITE_URL as string | undefined;
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  if (typeof window !== "undefined" && window.location.origin) {
    return window.location.origin;
  }
  return "https://web-components.yanan.store";
}


export function absoluteDocUrl(route: string): string {
  const origin = getSiteOrigin();
  const base = getBasePath();
  const path = docHref(route);
  if (base && path.startsWith(base)) {
    return `${origin}${path}`;
  }
  return `${origin}${path.startsWith("/") ? path : `/${path}`}`;
}

type SeoPayload = {
  title: string;
  description: string;
  keywords: string;
  robots: string;
  locale: string;
  alternateLocale: string;
};

const SITE_NAME = "yn-web-component";

const DEFAULT_SEO: Record<Locale, Omit<SeoPayload, "locale" | "alternateLocale">> = {
  "zh-CN": {
    title: `${SITE_NAME} · 独立站电商 Web Components 文档`,
    description:
      "面向 DTC / 跨境独立站的 Lit Web Components 组件库文档：Floema 风格按钮、导航、SKU 选择、结账地址、抽屉与 Toast。支持按需导入与 Tree Shaking。",
    keywords:
      "web components,lit,独立站,跨境电商,DTC,ecommerce,floema,组件库,yn-button,yn-navigation,sku,checkout",
    robots: "index,follow"
  },
  en: {
    title: `${SITE_NAME} · DTC E-commerce Web Components Docs`,
    description:
      "Lit Web Components for DTC and cross-border storefronts: Floema-style button, navigation, SKU selector, checkout address, drawer, and toast. Tree-shaking friendly subpath exports.",
    keywords:
      "web components,lit,dtc,ecommerce,cross-border,storefront,floema,component library,yn-button,yn-navigation,sku,checkout",
    robots: "index,follow"
  }
};

function routeSeo(route: string, locale: Locale): SeoPayload {
  const base = DEFAULT_SEO[locale];
  const page = getDocPage(route, locale);
  if (!page) {
    return {
      ...base,
      locale: locale === "zh-CN" ? "zh-CN" : "en",
      alternateLocale: locale === "zh-CN" ? "en" : "zh-CN"
    };
  }

  const title = `${page.title} | ${SITE_NAME}`;
  const description =
    page.description.length > 155 ? `${page.description.slice(0, 152)}…` : page.description;

  return {
    title,
    description,
    keywords: `${base.keywords},${route},${page.kind === "component" ? page.tag : route}`,
    robots: "index,follow",
    locale: locale === "zh-CN" ? "zh-CN" : "en",
    alternateLocale: locale === "zh-CN" ? "en" : "zh-CN"
  };
}

function upsertMeta(attr: "name" | "property", key: string, content: string) {
  if (!content) return;
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.content = content;
}

function upsertLink(rel: string, href: string, extra?: Record<string, string>) {
  let selector = `link[rel="${rel}"]`;
  if (extra?.hreflang) selector += `[hreflang="${extra.hreflang}"]`;
  let el = document.head.querySelector<HTMLLinkElement>(selector);
  if (!el) {
    el = document.createElement("link");
    el.rel = rel;
    document.head.appendChild(el);
  }
  el.href = href;
  if (extra) {
    Object.entries(extra).forEach(([k, v]) => el!.setAttribute(k, v));
  }
}

function upsertJsonLd(id: string, data: object) {
  let el = document.getElementById(id) as HTMLScriptElement | null;
  if (!el) {
    el = document.createElement("script");
    el.id = id;
    el.type = "application/ld+json";
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

export function applyDocumentSeo(route: string, locale: Locale): void {
  const seo = routeSeo(route, locale);
  const url = absoluteDocUrl(route);
  const origin = getSiteOrigin();
  const ogImage = `${origin}${getBasePath()}/og-cover.svg`;

  document.documentElement.lang = locale === "zh-CN" ? "zh-CN" : "en";
  document.title = seo.title;

  upsertMeta("name", "description", seo.description);
  upsertMeta("name", "keywords", seo.keywords);
  upsertMeta("name", "robots", seo.robots);
  upsertMeta("name", "application-name", SITE_NAME);

  upsertLink("canonical", url);
  upsertLink("alternate", url, { hreflang: seo.locale });
  upsertLink("alternate", url, { hreflang: seo.alternateLocale });
  upsertLink("alternate", absoluteDocUrl(route), { hreflang: "x-default" });

  upsertMeta("property", "og:type", "website");
  upsertMeta("property", "og:site_name", SITE_NAME);
  upsertMeta("property", "og:title", seo.title);
  upsertMeta("property", "og:description", seo.description);
  upsertMeta("property", "og:url", url);
  upsertMeta("property", "og:locale", seo.locale === "zh-CN" ? "zh_CN" : "en_US");
  upsertMeta("property", "og:image", ogImage);

  upsertMeta("name", "twitter:card", "summary");
  upsertMeta("name", "twitter:title", seo.title);
  upsertMeta("name", "twitter:description", seo.description);
  upsertMeta("name", "twitter:image", ogImage);

  upsertJsonLd("yn-docs-jsonld-website", {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: `${origin}${getBasePath() || "/"}`,
    description: DEFAULT_SEO[locale].description,
    inLanguage: [seo.locale, seo.alternateLocale],
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: GITHUB_REPO_URL
    }
  });

  upsertJsonLd("yn-docs-jsonld-software", {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: SITE_NAME,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    description: DEFAULT_SEO[locale].description,
    url,
    downloadUrl: NPM_PACKAGE_URL,
    softwareVersion: import.meta.env.VITE_PACKAGE_VERSION ?? "1.0.2",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD"
    },
    keywords: seo.keywords
  });

  const page = getDocPage(route, locale);
  if (page) {
    upsertJsonLd("yn-docs-jsonld-page", {
      "@context": "https://schema.org",
      "@type": "TechArticle",
      headline: page.title,
      description: page.description,
      url,
      inLanguage: seo.locale,
      author: { "@type": "Organization", name: SITE_NAME },
      isPartOf: { "@type": "WebSite", name: SITE_NAME, url: `${origin}${getBasePath() || "/"}` }
    });
  } else {
    const empty = document.getElementById("yn-docs-jsonld-page");
    empty?.remove();
  }
}
