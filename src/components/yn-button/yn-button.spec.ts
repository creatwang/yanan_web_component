import { fixture, expect, html } from "@open-wc/testing";
import "./yn-button";
import type { YnButton } from "./yn-button";

describe("yn-button", () => {
  it("renders label", async () => {
    const el = await fixture<YnButton>(html`<yn-button label="确认"></yn-button>`);
    const button = el.shadowRoot?.querySelector("button");
    expect(button?.textContent?.trim()).to.equal("确认");
  });

  it("emits yn-click event", async () => {
    const el = await fixture<YnButton>(html`<yn-button></yn-button>`);
    let emitted = false;
    el.addEventListener("yn-click", () => {
      emitted = true;
    });

    el.shadowRoot?.querySelector("button")?.click();
    expect(emitted).to.equal(true);
  });
});
