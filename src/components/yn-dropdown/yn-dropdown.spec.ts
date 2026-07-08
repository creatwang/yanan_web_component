import { expect, fixture, html, oneEvent } from "@open-wc/testing";
import "./yn-dropdown";
import type { YnDropdown } from "./yn-dropdown";

describe("yn-dropdown", () => {
  it("renders trigger slot content", async () => {
    const el = await fixture<YnDropdown>(html`
      <yn-dropdown>
        <button type="button">Menu</button>
      </yn-dropdown>
    `);
    await el.updateComplete;
    expect(el.textContent?.trim()).to.equal("Menu");
  });

  it("opens when trigger is clicked", async () => {
    const el = await fixture<YnDropdown>(html`
      <yn-dropdown>
        <button type="button">Menu</button>
      </yn-dropdown>
    `);
    await el.updateComplete;

    const trigger = el.shadowRoot?.querySelector<HTMLElement>(".trigger");
    if (!trigger) throw new Error("missing trigger");

    trigger.click();
    await el.updateComplete;
    expect(el.open).to.equal(true);
    expect(el.shadowRoot?.querySelector(".panel.open")).to.not.equal(null);
  });

  it("dispatches open-change when toggled", async () => {
    const el = await fixture<YnDropdown>(html`
      <yn-dropdown>
        <button type="button">Menu</button>
      </yn-dropdown>
    `);
    await el.updateComplete;

    const trigger = el.shadowRoot?.querySelector<HTMLElement>(".trigger");
    if (!trigger) throw new Error("missing trigger");

    const eventPromise = oneEvent(el, "open-change");
    trigger.click();
    const event = (await eventPromise) as CustomEvent<{ open: boolean; placement: string }>;
    expect(event.detail.open).to.equal(true);
    expect(event.detail.placement).to.be.a("string");
  });

  it("closes via public close() method", async () => {
    const el = await fixture<YnDropdown>(html`
      <yn-dropdown open>
        <button type="button">Menu</button>
      </yn-dropdown>
    `);
    await el.updateComplete;

    el.close();
    await el.updateComplete;
    expect(el.open).to.equal(false);
  });

  it("closes on Escape key", async () => {
    const el = await fixture<YnDropdown>(html`
      <yn-dropdown open>
        <button type="button">Menu</button>
      </yn-dropdown>
    `);
    await el.updateComplete;

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    await el.updateComplete;
    expect(el.open).to.equal(false);
  });

  it("applies placement attribute", async () => {
    const el = await fixture<YnDropdown>(html`
      <yn-dropdown placement="top-end">
        <button type="button">Menu</button>
      </yn-dropdown>
    `);
    expect(el.getAttribute("placement")).to.equal("top-end");
  });
});
