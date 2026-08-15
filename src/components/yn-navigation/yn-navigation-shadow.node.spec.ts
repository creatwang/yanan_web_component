/**
 * @vitest-environment node
 */
import { describe, expect, it } from "vitest";
import { renderYnNavigationShadowHtml } from "./yn-navigation-shadow.js";

describe("SSR in Node without document", () => {
  it("renders without a browser document", () => {
    expect(typeof globalThis.document).toBe("undefined");
    const html = renderYnNavigationShadowHtml({
      items: [{ label: "Home", href: "/" }],
      activeLabel: "Home",
      seoMode: true,
    });
    expect(html).toContain("Home");
  });
});
