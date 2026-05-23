import { expect, fixture, html, oneEvent } from "@open-wc/testing";
import "./yn-sku-selector";
import type { YnSkuSelector } from "./yn-sku-selector";
import type { YnSkuCartButton } from "./yn-sku-cart-button";
import type { YnSkuChangeDetail, YnSkuInitDetail, YnSkuSubmitEvent } from "./types";

const demoSkus = [
  { weight: "1kg", color: "红色", size: "37", price: 65, id: "1" },
  { weight: "1kg", color: "红色", size: "38", price: 65, id: "2" },
  { weight: "1kg", color: "黑色", size: "38", price: 68, id: "3" },
  { weight: "2kg", color: "黑色", size: "38", price: 72, id: "4" },
  { weight: "2kg", color: "白色", size: "41", price: 75, id: "5" }
];

const getCartButton = (el: YnSkuSelector) => {
  const host = el.shadowRoot?.querySelector("yn-sku-cart-button") as YnSkuCartButton | null;
  return host?.shadowRoot?.querySelector<HTMLButtonElement>(".submit") ?? null;
};

const isCartLoading = (el: YnSkuSelector) => {
  const host = el.shadowRoot?.querySelector("yn-sku-cart-button") as YnSkuCartButton | null;
  return host?.loading ?? false;
};

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

    getCartButton(el)?.click();
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
    getCartButton(el)?.click();
    const submitEvent = (await submitPromise) as YnSkuSubmitEvent;

    expect(submitEvent.detail.sku.id).to.equal("1");
    expect(submitEvent.detail.selections).to.deep.equal({
      weight: "1kg",
      color: "红色",
      size: "37"
    });
    expect(isCartLoading(el)).to.equal(true);

    submitEvent.instance.done();
    await el.updateComplete;
    expect(isCartLoading(el)).to.equal(false);
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
    expect(el.shadowRoot?.querySelector("yn-sku-cart-button")).to.equal(null);
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

  it("pick-one selects first available sku and emits init once", async () => {
    const el = document.createElement("yn-sku-selector") as YnSkuSelector;
    el.pickOne = true;
    el.skus = demoSkus;

    const initPromise = oneEvent(el, "init");
    document.body.appendChild(el);
    const initEvent = (await initPromise) as CustomEvent<YnSkuInitDetail>;
    await el.updateComplete;

    expect(initEvent.detail.ready).to.equal(true);
    expect(initEvent.detail.sku?.id).to.equal("1");
    expect(initEvent.detail.selections).to.deep.equal({
      weight: "1kg",
      color: "红色",
      size: "37"
    });

    let initCount = 0;
    el.addEventListener("init", () => {
      initCount += 1;
    });
    el.skus = [...demoSkus];
    await el.updateComplete;
    expect(initCount).to.equal(0);

    el.remove();
  });

  it("does not apply pick-one in simple mode", async () => {
    let initCount = 0;
    const el = await fixture<YnSkuSelector>(html`
      <yn-sku-selector pick-one simple .skus=${[{ size: "S", price: 65, id: "s" }]}></yn-sku-selector>
    `);
    el.addEventListener("init", () => {
      initCount += 1;
    });
    await el.updateComplete;

    expect(el.shadowRoot?.querySelector(".option.active")).to.equal(null);
    expect(initCount).to.equal(0);
  });
});
