import { getDefaultLocale, setLocale } from "./i18n/locale";
import { getRouteFromLocation, migrateHashRoute } from "./router";
import { applyDocumentSeo } from "./seo";
import "../src/styles/tailwind.css";
import "./styles/docs.css";
import "../src/define";
import "./demos/interactive-demos";
import "./docs-app";

migrateHashRoute();
setLocale(getDefaultLocale());
applyDocumentSeo(getRouteFromLocation(), getDefaultLocale());

const mount = () => {
  const root = document.getElementById("app");
  if (!root) return;
  root.innerHTML = "";
  const app = document.createElement("yn-docs-app");
  root.append(app);
};

mount();
