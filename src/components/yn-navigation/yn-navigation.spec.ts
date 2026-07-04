import { fixture, expect, html } from "@open-wc/testing";
import "./yn-navigation";
import type { YnNavigation } from "./yn-navigation";

describe("yn-navigation", () => {
  const itemsNode = {
    A: "/a",
    B: "/b",
    C: "/c",
    D: "/d"
  };

  it("renders items from object node", async () => {
    const el = await fixture<YnNavigation>(html`
      <yn-navigation .items=${{ ONE: "/one", TWO: "/two", THREE: "/three" }} active="ONE" .seoMode=${false}></yn-navigation>
    `);
    const tabs = el.shadowRoot?.querySelectorAll<HTMLElement>(".tab");
    expect(tabs?.length).to.equal(3);
    expect(tabs?.[1].textContent?.trim()).to.equal("TWO");
  });

  it("uses active string to mark selected tab", async () => {
    const el = await fixture<YnNavigation>(html`
      <yn-navigation .items=${{ A: "/a", B: "/b", C: "/c" }} active="B" .seoMode=${false}></yn-navigation>
    `);
    const selected = el.shadowRoot?.querySelector<HTMLButtonElement>('.tab[aria-selected="true"]');
    expect(selected?.textContent?.trim()).to.equal("B");
  });

  it("emits change event with key and node but does not mutate active", async () => {
    const el = await fixture<YnNavigation>(html`
      <yn-navigation .items=${{ A: "/a", B: "/b", C: "/c" }} active="A" .seoMode=${false}></yn-navigation>
    `);
    let changed = "";
    let node: Record<string, string> = {};
    el.addEventListener("change", ((event: CustomEvent<{ key: string; node: Record<string, string> }>) => {
      node = event.detail.node;
      changed = event.detail.key;
    }) as EventListener);

    const target = el.shadowRoot?.querySelectorAll<HTMLButtonElement>(".tab")[2];
    target?.click();
    expect(changed).to.equal("C");
    expect(node).to.deep.equal({ A: "/a", B: "/b", C: "/c" });
    expect(el.active).to.equal("A");
  });

  it("updates selected tab when parent sets active in change callback", async () => {
    const el = await fixture<YnNavigation>(html`
      <yn-navigation .items=${{ A: "/a", B: "/b", C: "/c" }} active="A" .seoMode=${false}></yn-navigation>
    `);
    let changed: { key: string; node: Record<string, string> } | null = null;
    el.addEventListener("change", ((event: CustomEvent<{ key: string; node: Record<string, string> }>) => {
      changed = event.detail;
      el.active = event.detail.key;
    }) as EventListener);

    const target = el.shadowRoot?.querySelectorAll<HTMLButtonElement>(".tab")[2];
    target?.click();
    await el.updateComplete;
    expect(changed).to.deep.equal({ key: "C", node: { A: "/a", B: "/b", C: "/c" } });
    const selected = el.shadowRoot?.querySelector<HTMLButtonElement>('.tab[aria-selected="true"]');
    expect(selected?.textContent?.trim()).to.equal("C");
  });

  it("supports hit slop class when enabled", async () => {
    const el = await fixture<YnNavigation>(html`
      <yn-navigation .items=${{ A: "/a", B: "/b" }} active="A" .seoMode=${false} .hitSlop=${true}></yn-navigation>
    `);
    const firstTab = el.shadowRoot?.querySelector<HTMLButtonElement>(".tab");
    expect(firstTab?.classList.contains("hit-slope")).to.equal(true);
  });

  it("renders semantic navigation container", async () => {
    const el = await fixture<YnNavigation>(html`
      <yn-navigation .items=${{ A: "/a", B: "/b" }} active="A"></yn-navigation>
    `);
    const nav = el.shadowRoot?.querySelector("nav.nav");
    const list = el.shadowRoot?.querySelector("ul.tabs");
    expect(nav).to.not.equal(null);
    expect(list).to.not.equal(null);
  });

  it("renders links for seo mode with path items", async () => {
    history.pushState({}, "", "/home");
    const el = await fixture<YnNavigation>(html`
      <yn-navigation
        .items=${{ Home: "/home", About: "/about" }}
        .seoMode=${true}
        active="HOME"
      ></yn-navigation>
    `);
    const links = el.shadowRoot?.querySelectorAll<HTMLAnchorElement>("a.tab");
    const buttons = el.shadowRoot?.querySelectorAll<HTMLButtonElement>("button.tab");
    expect(links?.length).to.equal(2);
    expect(buttons?.length).to.equal(0);
    expect(links?.[0].getAttribute("href")).to.equal("/home");
    expect(links?.[0].getAttribute("aria-current")).to.equal("page");
    expect(links?.[0].textContent?.trim()).to.equal("Home");
  });

  it("renders dynamic svg rect paths in svg namespace", async () => {
    const el = await fixture<YnNavigation>(html`
      <yn-navigation .items=${itemsNode} active="A" .seoMode=${false}></yn-navigation>
    `);
    const rects = el.shadowRoot?.querySelectorAll("[data-meta-row-rect]");
    const clips = el.shadowRoot?.querySelectorAll("[data-meta-row-rect-clip]");
    expect(rects?.length).to.equal(4);
    expect(clips?.length).to.equal(4);
    expect(rects?.[0]).to.be.instanceOf(SVGPathElement);
    expect(clips?.[0]).to.be.instanceOf(SVGPathElement);
    const firstPath = rects?.[0]?.getAttribute("d") ?? "";
    expect(firstPath.length).to.be.greaterThan(10);
  });

  it("hydrates items from items-json attribute on connect", async () => {
    const el = await fixture<YnNavigation>(html`
      <yn-navigation
        items-json='{"首页":"/zh/","系列":"/zh/collections"}'
        active="首页"
        .seoMode=${true}
      ></yn-navigation>
    `);
    expect(el.items).to.deep.equal({ 首页: "/zh/", 系列: "/zh/collections" });
    const links = el.shadowRoot?.querySelectorAll<HTMLAnchorElement>("a.tab");
    expect(links?.length).to.equal(2);
    expect(links?.[0].textContent?.trim()).to.equal("首页");
  });

  it("bootstraps geometry and hover from declarative shadow DOM", async () => {
    const { renderYnNavigationShadowHtml } = await import("./yn-navigation-shadow.js");
    const shadowHtml = renderYnNavigationShadowHtml({
      items: [
        { label: "首页", href: "/zh" },
        { label: "系列", href: "/zh/collections" },
        { label: "促销", href: "/zh/promotions" },
      ],
      activeLabel: "首页",
      seoMode: true,
    });
    const host = document.createElement("yn-navigation") as YnNavigation;
    host.setAttribute("seo-mode", "");
    host.setAttribute(
      "items-json",
      '{"首页":"/zh","系列":"/zh/collections","促销":"/zh/promotions"}',
    );
    host.setAttribute("active", "首页");
    const template = document.createElement("template");
    template.setAttribute("shadowrootmode", "open");
    template.innerHTML = shadowHtml;
    host.appendChild(template);
    document.body.appendChild(host);

    await host.updateComplete;

    expect(host.hasUpdated).to.equal(true);
    const bridgeBefore = host.shadowRoot?.querySelector("[data-meta-row-shape-bridges]")?.getAttribute("d") ?? "";
    const tab2 = host.shadowRoot?.querySelectorAll<HTMLElement>(".tab")[2];
    tab2?.dispatchEvent(new PointerEvent("pointerenter", { clientX: 200, clientY: 20, bubbles: true }));
    await new Promise((resolve) => setTimeout(resolve, 360));
    const bridgeAfter = host.shadowRoot?.querySelector("[data-meta-row-shape-bridges]")?.getAttribute("d") ?? "";
    expect(bridgeAfter).to.not.equal("");
    expect(bridgeAfter).to.not.equal(bridgeBefore);

    host.remove();
  });
});
