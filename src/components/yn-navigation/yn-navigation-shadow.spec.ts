import { describe, expect, it } from "vitest";
import { renderYnNavigationShadowHtml, renderYnNavigationSeoFallbackHtml } from "./yn-navigation-shadow.js";

describe("renderYnNavigationShadowHtml", () => {
  it("outputs svg paths and tab links for seo mode", () => {
    const html = renderYnNavigationShadowHtml({
      items: [
        { label: "首页", href: "/zh/" },
        { label: "系列", href: "/zh/collections" },
      ],
      activeLabel: "首页",
      ariaLabel: "站点导航",
      seoMode: true,
    });

    expect(html).toContain('data-meta-row-shape-bridges d="');
    expect(html).toContain('<slot name="seo-fallback"></slot>');
    expect(html).toContain('data-meta-row-rect="0" d="');
    expect(html).toContain('href="/zh/"');
    expect(html).toContain('aria-current="page"');
    expect(html).toContain("首页");
    expect(html).toContain("<style>");
    // 选中项两侧 bridge 应已合并（progress=1），与客户端首帧一致
    expect(html).toMatch(/data-meta-row-shape-bridges d="M[\d.]+ 29\.429/);
  });

  it("returns empty string when items is empty", () => {
    expect(renderYnNavigationShadowHtml({ items: [], activeLabel: "" })).to.equal("");
  });
});

describe("renderYnNavigationSeoFallbackHtml", () => {
  it("outputs light DOM nav links with slot and href", () => {
    const html = renderYnNavigationSeoFallbackHtml({
      items: [
        { label: "首页", href: "/zh/" },
        { label: "系列", href: "/zh/collections" },
      ],
      activeLabel: "首页",
      ariaLabel: "站点导航",
    });

    expect(html).toContain('slot="seo-fallback"');
    expect(html).toContain('href="/zh/"');
    expect(html).toContain('aria-current="page"');
    expect(html).toContain("yn-navigation-seo-fallback");
  });
});
