import { fixture, expect, html } from "@open-wc/testing";
import "./yn-pull-cord-switch";
import type { YnPullCordSwitch } from "./yn-pull-cord-switch";

describe("yn-pull-cord-switch", () => {
  it("renders canvas stage and default OFF fallback", async () => {
    const el = await fixture<YnPullCordSwitch>(html`<yn-pull-cord-switch></yn-pull-cord-switch>`);
    await el.updateComplete;
    expect(el.shadowRoot?.querySelector("canvas.rope")).to.not.equal(null);
    expect(el.shadowRoot?.querySelector(".card__label")?.textContent?.trim()).to.equal("OFF");
  });

  it("reflects checked attribute", async () => {
    const el = await fixture<YnPullCordSwitch>(
      html`<yn-pull-cord-switch checked></yn-pull-cord-switch>`
    );
    await el.updateComplete;
    expect(el.checked).to.equal(true);
    expect(el.shadowRoot?.querySelector(".card__label")?.textContent?.trim()).to.equal("ON");
  });

  it("reflects size attribute with mini default", async () => {
    const el = await fixture<YnPullCordSwitch>(html`<yn-pull-cord-switch></yn-pull-cord-switch>`);
    await el.updateComplete;
    expect(el.size).to.equal("mini");
    expect(el.getAttribute("size")).to.equal("mini");
  });

  it("reflects mini size", async () => {
    const el = await fixture<YnPullCordSwitch>(
      html`<yn-pull-cord-switch size="mini"></yn-pull-cord-switch>`
    );
    await el.updateComplete;
    expect(el.size).to.equal("mini");
  });

  it("reflects floema variant", async () => {
    const el = await fixture<YnPullCordSwitch>(
      html`<yn-pull-cord-switch variant="floema"></yn-pull-cord-switch>`
    );
    await el.updateComplete;
    expect(el.variant).to.equal("floema");
    expect(el.getAttribute("variant")).to.equal("floema");
  });

  it("exposes switch semantics", async () => {
    const el = await fixture<YnPullCordSwitch>(
      html`<yn-pull-cord-switch checked></yn-pull-cord-switch>`
    );
    await el.updateComplete;
    expect(el.getAttribute("role")).to.equal("switch");
    expect(el.getAttribute("aria-checked")).to.equal("true");
  });

  it("renders slotted card content", async () => {
    const el = await fixture<YnPullCordSwitch>(html`
      <yn-pull-cord-switch>
        <span>拉绳</span>
      </yn-pull-cord-switch>
    `);
    await el.updateComplete;
    const slot = el.shadowRoot?.querySelector("slot");
    const assigned = slot?.assignedNodes({ flatten: true }) ?? [];
    expect(assigned.some((node) => node.textContent?.includes("拉绳"))).to.equal(true);
  });
});
