import { expect, fixture, html } from "@open-wc/testing";
import "./yn-dropdown-pick";
import "../yn-pick/yn-pick";
import type { YnDropdownPick } from "./yn-dropdown-pick";

describe("yn-dropdown-pick", () => {
  it("shows placeholder when no value is selected", async () => {
    const el = await fixture<YnDropdownPick>(html`
      <yn-dropdown-pick placeholder="Choose size">
        <yn-pick value="S"><span>S</span></yn-pick>
        <yn-pick value="M"><span>M</span></yn-pick>
      </yn-dropdown-pick>
    `);
    await el.updateComplete;
    const label = el.shadowRoot?.querySelector(".trigger > span:first-child");
    expect(label?.textContent?.trim()).to.equal("Choose size");
  });

  it("disables trigger when disabled", async () => {
    const el = await fixture<YnDropdownPick>(html`
      <yn-dropdown-pick disabled>
        <yn-pick value="S"><span>S</span></yn-pick>
      </yn-dropdown-pick>
    `);
    await el.updateComplete;

    const trigger = el.shadowRoot?.querySelector<HTMLButtonElement>(".trigger");
    expect(trigger?.disabled).to.equal(true);
  });

  it("renders assigned picks in the panel slot", async () => {
    const el = await fixture<YnDropdownPick>(html`
      <yn-dropdown-pick>
        <yn-pick value="S"><span>Small</span></yn-pick>
        <yn-pick value="M"><span>Medium</span></yn-pick>
      </yn-dropdown-pick>
    `);
    await el.updateComplete;
    expect(el.querySelectorAll("yn-pick").length).to.equal(2);
  });
});
