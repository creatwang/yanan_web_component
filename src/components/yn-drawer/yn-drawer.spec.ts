import { expect, fixture, html, oneEvent } from "@open-wc/testing";
import "../yn-icon-button/yn-icon-button.js";
import "./yn-drawer";
import type { YnDrawer } from "./yn-drawer";

describe("yn-drawer", () => {
  it("renders default title and closed state", async () => {
    const el = await fixture<YnDrawer>(html`<yn-drawer title="Filters"></yn-drawer>`);
    await el.updateComplete;
    expect(el.open).to.equal(false);
    expect(el.title).to.equal("Filters");
    expect(el.shadowRoot?.querySelector(".title")?.textContent?.trim()).to.equal("Filters");
  });

  it("opens and closes via public API", async () => {
    const el = await fixture<YnDrawer>(html`<yn-drawer></yn-drawer>`);
    await el.updateComplete;

    el.show();
    await el.updateComplete;
    expect(el.open).to.equal(true);

    el.close();
    await el.updateComplete;
    expect(el.open).to.equal(false);
  });

  it("toggles open state via public API", async () => {
    const el = await fixture<YnDrawer>(html`<yn-drawer></yn-drawer>`);
    await el.updateComplete;

    el.toggle();
    await el.updateComplete;
    expect(el.open).to.equal(true);

    el.toggle();
    await el.updateComplete;
    expect(el.open).to.equal(false);
  });

  it("dispatches open-change when opened via API", async () => {
    const el = await fixture<YnDrawer>(html`<yn-drawer></yn-drawer>`);
    await el.updateComplete;

    const eventPromise = oneEvent(el, "open-change");
    el.show();
    const event = (await eventPromise) as CustomEvent<{ open: boolean; source: string }>;
    expect(event.detail.open).to.equal(true);
    expect(event.detail.source).to.equal("api");
  });

  it("opens when default trigger is clicked", async () => {
    const el = await fixture<YnDrawer>(html`<yn-drawer></yn-drawer>`);
    await el.updateComplete;

    const trigger = el.shadowRoot?.querySelector<HTMLButtonElement>(".trigger-btn");
    if (!trigger) throw new Error("missing default trigger");

    trigger.click();
    await el.updateComplete;
    expect(el.open).to.equal(true);
  });

  it("closes when close button is clicked", async () => {
    const el = await fixture<YnDrawer>(html`<yn-drawer open></yn-drawer>`);
    await el.updateComplete;

    const closeBtn = el.shadowRoot?.querySelector<HTMLElement>(".close-btn");
    if (!closeBtn) throw new Error("missing close button");

    closeBtn.click();
    await el.updateComplete;
    expect(el.open).to.equal(false);
  });

  it("reflects placement and sheet-height attributes", async () => {
    const el = await fixture<YnDrawer>(
      html`<yn-drawer placement="bottom" sheet-height="60vh"></yn-drawer>`,
    );
    expect(el.getAttribute("placement")).to.equal("bottom");
    expect(el.getAttribute("sheet-height")).to.equal("60vh");
  });

  it("renders middle slot panel when content is provided", async () => {
    const el = await fixture<YnDrawer>(html`
      <yn-drawer>
        <div slot="middle">Promo</div>
        <div slot="footer">Footer</div>
      </yn-drawer>
    `);
    await el.updateComplete;
    await new Promise((resolve) => queueMicrotask(() => resolve(undefined)));

    const middle = el.shadowRoot?.querySelector(".panel--middle");
    const bottom = el.shadowRoot?.querySelector(".panel--bottom");
    expect(middle?.classList.contains("panel--empty")).to.equal(false);
    expect(bottom?.classList.contains("panel--empty")).to.equal(false);
    expect(el.querySelector('[slot="middle"]')?.textContent).to.include("Promo");
  });

  it("keeps backdrop-extra content available for motion", async () => {
    const el = await fixture<YnDrawer>(html`
      <yn-drawer>
        <div slot="backdrop-extra">
          <article data-yn-drawer-reco>A</article>
          <article data-yn-drawer-reco>B</article>
        </div>
      </yn-drawer>
    `);
    await el.updateComplete;
    await new Promise((resolve) => queueMicrotask(() => resolve(undefined)));

    const extra = el.shadowRoot?.querySelector(".backdrop-extra");
    expect(extra?.classList.contains("backdrop-extra--empty")).to.equal(false);
    expect(el.querySelectorAll("[data-yn-drawer-reco]").length).to.equal(2);
  });
});
