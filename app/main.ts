import { getDefaultLocale, setLocale } from "./i18n/locale";
import "./styles/docs.css";
import "../src/define";
import "./docs-app";

setLocale(getDefaultLocale());

const mount = () => {
  const root = document.getElementById("app");
  if (!root) return;
  root.innerHTML = "";
  const app = document.createElement("yn-docs-app");
  root.append(app);
};

mount();
