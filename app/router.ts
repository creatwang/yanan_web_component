const DEFAULT_ROUTE = "introduction";

export function getRouteFromHash(): string {
  const hash = window.location.hash.replace(/^#\/?/, "");
  return hash || DEFAULT_ROUTE;
}

export function navigateTo(route: string): void {
  const normalized = route.replace(/^\//, "");
  window.location.hash = `#/${normalized}`;
}

export function subscribeRoute(onChange: (route: string) => void): () => void {
  const handler = () => onChange(getRouteFromHash());
  window.addEventListener("hashchange", handler);
  handler();
  return () => window.removeEventListener("hashchange", handler);
}
