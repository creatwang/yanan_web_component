import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const SITE_ORIGIN = (process.env.VITE_DOCS_SITE_URL ?? "https://web-components.yanan.store").replace(/\/$/, "");
const BASE = (process.env.VITE_DOCS_BASE ?? "").replace(/\/$/, "");

const routes = [
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
];

const today = new Date().toISOString().slice(0, 10);

const urls = routes
  .map((route) => {
    const loc = `${SITE_ORIGIN}${BASE}/${route}`;
    const priority = route === "introduction" ? "1.0" : route.startsWith("yn-") ? "0.8" : "0.9";
    return `  <url>
    <loc>${loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
  </url>`;
  })
  .join("\n");

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

writeFileSync(join(root, "public", "sitemap.xml"), xml, "utf8");
console.log(`sitemap.xml written (${routes.length} URLs) → ${SITE_ORIGIN}${BASE}/`);
