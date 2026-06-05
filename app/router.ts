const DEFAULT_ROUTE = "introduction";

/** Vite `base`（GitHub Pages 子路径部署时为 `/yanan_web_component/`） */
export function getBasePath(): string {
  const base = import.meta.env.BASE_URL ?? "/";
  return base.endsWith("/") ? base.slice(0, -1) : base;
}

function normalizeRoute(raw: string): string {
  const trimmed = raw.replace(/^\/+/, "").replace(/\/+$/, "");
  return trimmed || DEFAULT_ROUTE;
}

/** 将旧 hash 路由 `#/yn-button` 迁移到 pathname（SEO 友好 URL） */
export function migrateHashRoute(): void {
  const hash = window.location.hash.replace(/^#\/?/, "");
  if (!hash) return;
  const base = getBasePath();
  const target = `${base}/${normalizeRoute(hash)}`;
  window.history.replaceState(null, "", target);
  window.location.hash = "";
}

export function getRouteFromLocation(): string {
  const base = getBasePath();
  let path = window.location.pathname;
  if (base && path.startsWith(base)) {
    path = path.slice(base.length);
  }
  return normalizeRoute(path);
}

/** 文档站内路径（含 base，用于 `<a href>`） */
export function docHref(route: string): string {
  const base = getBasePath();
  const normalized = normalizeRoute(route);
  return `${base}/${normalized}`;
}

export function navigateTo(route: string): void {
  const href = docHref(route);
  if (window.location.pathname + window.location.search !== href) {
    window.history.pushState(null, "", href);
  }
  window.dispatchEvent(new PopStateEvent("popstate"));
}

export function subscribeRoute(onChange: (route: string) => void): () => void {
  const handler = () => onChange(getRouteFromLocation());
  window.addEventListener("popstate", handler);
  handler();
  return () => window.removeEventListener("popstate", handler);
}

/** 全部可索引文档路由（sitemap / noscript） */
export const DOC_ROUTE_IDS = [
  "introduction",
  "installation",
  "bundle-size",
  "yn-button",
  "yn-input",
  "yn-icon-connect-button",
  "yn-navigation",
  "yn-search",
  "yn-pick",
  "yn-group-pick",
  "yn-dropdown",
  "yn-dropdown-pick",
  "yn-quantity",
  "yn-sku-selector",
  "yn-checkout-address",
  "yn-drawer",
  "yn-toast",
  "yn-pull-cord-switch"
] as const;
