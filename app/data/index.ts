import type { Locale } from "../i18n/locale";
import { getResolvedDocPage, getBundleTableRows, getBundleSizeGuide } from "./resolve";

export { getBundleTableRows, getBundleSizeGuide };

export function getDocPage(id: string, locale: Locale) {
  return getResolvedDocPage(id, locale);
}
