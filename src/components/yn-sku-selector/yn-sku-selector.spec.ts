import { expect, fixture, html, oneEvent } from "@open-wc/testing";
import "./yn-sku-selector";
import type { YnSkuSelector } from "./yn-sku-selector";
import type { YnSkuChangeDetail, YnSkuSubmitEvent } from "./types";

const demoSkus = [
  { weight: "1kg", color: "红色", size: "37", price: 65, id: "1" },
  { weight: "1kg", color: "红色", size: "38", price: 65, id: "2" },
  { weight: "1kg", color: "黑色", size: "38", price: 68, id: "3" },
  { weight: "2kg", color: "黑色", size: "38", price: 72, id: "4" },
  { weight: "2kg", color: "白色", size: "41", price: 75, id: "5" }
];

describe("yn-sku-selector", () => {
  it("emits change detail with ready=false when selection is incomplete", async () => {
    const el = await fixture<YnSkuSelector>(html`
      <yn-sku-selector .skus=${demoSkus}></yn-sku-selector>
    `);

    const options = el.shadowRoot?.querySelectorAll<HTMLButtonElement>(".option");
    if (!options?.[0]) throw new Error("option not found");

    const changePromise = oneEvent(el, "change");
    options[0].click();
    const event = (await changePromise) as CustomEvent<YnSkuChangeDetail>;

    expect(event.detail.ready).to.equal(false);
    expect(event.detail.missingKeys).to.include.members(["color", "size"]);
    expect(event.detail.selections.weight).to.equal("1kg");
    expect(event.detail.sku).to.equal(null);
  });

  it("shows hint when submitting incomplete selection", async () => {
    const el = await fixture<YnSkuSelector>(html`
      <yn-sku-selector
        .skus=${demoSkus}
        incomplete-hint="Select {label}"
        .labels=${{ weight: "Weight" }}
      ></yn-sku-selector>
    `);

    el.shadowRoot?.querySelector<HTMLButtonElement>(".submit")?.click();
    await el.updateComplete;

    const hint = el.shadowRoot?.querySelector(".hint")?.textContent ?? "";
    expect(hint).to.equal("Select Weight");
  });

  it("hides spec labels when labels is not provided", async () => {
    const el = await fixture<YnSkuSelector>(html`
      <yn-sku-selector .skus=${demoSkus}></yn-sku-selector>
    `);

    expect(el.shadowRoot?.querySelectorAll(".label").length).to.equal(0);
  });

  it("emits submit and clears loading after instance.done()", async () => {
    const el = await fixture<YnSkuSelector>(html`
      <yn-sku-selector .skus=${demoSkus}></yn-sku-selector>
    `);

    const clickOption = (label: string) => {
      const btn = [...(el.shadowRoot?.querySelectorAll<HTMLButtonElement>(".option") ?? [])].find(
        (node) => node.textContent?.trim() === label
      );
      if (!btn) throw new Error(`option ${label} not found`);
      btn.click();
    };

    clickOption("1kg");
    await el.updateComplete;
    clickOption("红色");
    await el.updateComplete;
    clickOption("37");
    await el.updateComplete;

    const submitPromise = oneEvent(el, "submit");
    el.shadowRoot?.querySelector<HTMLButtonElement>(".submit")?.click();
    const submitEvent = (await submitPromise) as YnSkuSubmitEvent;

    expect(submitEvent.detail.sku.id).to.equal("1");
    expect(submitEvent.detail.selections).to.deep.equal({
      weight: "1kg",
      color: "红色",
      size: "37"
    });
    expect(el.shadowRoot?.querySelector(".submit")?.classList.contains("is-loading")).to.equal(true);

    submitEvent.instance.done();
    await el.updateComplete;
    expect(el.shadowRoot?.querySelector(".submit")?.classList.contains("is-loading")).to.equal(false);
  });

  it("auto submits in simple mode when selection becomes ready", async () => {
    const el = await fixture<YnSkuSelector>(html`
      <yn-sku-selector simple .skus=${[{ size: "S", price: 65, id: "s" }]}></yn-sku-selector>
    `);

    const submitPromise = oneEvent(el, "submit");
    el.shadowRoot?.querySelector<HTMLButtonElement>(".option")?.click();
    const submitEvent = (await submitPromise) as YnSkuSubmitEvent;

    expect(submitEvent.detail.sku.id).to.equal("s");
    submitEvent.instance.done();
    await el.updateComplete;
    expect(el.shadowRoot?.querySelector(".submit")).to.equal(null);
  });

  it("hides title and submit area in simple mode", async () => {
    const el = await fixture<YnSkuSelector>(html`
      <yn-sku-selector simple .skus=${demoSkus}>
        <h2 slot="title">Title</h2>
      </yn-sku-selector>
    `);

    expect(el.shadowRoot?.querySelector(".title")).to.equal(null);
    expect(el.shadowRoot?.querySelector(".submit-wrap")).to.equal(null);
    expect(el.shadowRoot?.querySelector(".label")).to.equal(null);
  });
});
