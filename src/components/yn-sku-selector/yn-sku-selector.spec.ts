import { expect, fixture, html, oneEvent } from "@open-wc/testing";
import "./yn-sku-selector";
import type { YnSkuSelector } from "./yn-sku-selector";
import type { YnSkuCartButton } from "./yn-sku-cart-button";
import type { YnSkuChangeDetail, YnSkuInitDetail, YnSkuSubmitEvent } from "./types";
import { YN_SKU_SELECTOR_STYLES } from "./yn-sku-selector-styles.js";

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

const nextFrame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

const flushIndicators = async (el: YnSkuSelector) => {
  await el.updateComplete;
  await nextFrame();
  await nextFrame();
  await el.updateComplete;
};

const readActiveIndicatorPair = (el: YnSkuSelector) => {
  const section = el.shadowRoot?.querySelector(".section");
  const active = section?.querySelector<HTMLElement>(".option.active:not(.unavailable)");
  const indicator = section?.querySelector<HTMLElement>(".option-indicator");
  if (!active || !indicator) throw new Error("active option or indicator not found");
  return { active, indicator };
};

/** happy-dom 常把 flex 按钮的 offset 算成 0，和 yn-search 一样桩布局再断言组件写出的尺寸 */
const stubOptionLayout = (el: YnSkuSelector, box = { width: 80, height: 48, left: 0, top: 0 }) => {
  el.shadowRoot?.querySelectorAll<HTMLElement>(".option").forEach((opt, index) => {
    Object.defineProperty(opt, "offsetWidth", { configurable: true, get: () => box.width });
    Object.defineProperty(opt, "offsetHeight", { configurable: true, get: () => box.height });
    Object.defineProperty(opt, "offsetLeft", { configurable: true, get: () => box.left + index * box.width });
    Object.defineProperty(opt, "offsetTop", { configurable: true, get: () => box.top });
  });
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

  it("supports whitelist and exclude semantics for spec keys", async () => {
    const skus = [
      { weight: "1kg", color: "红色", size: "37", channel: "online", price: 65, id: "1" },
      { weight: "1kg", color: "黑色", size: "38", channel: "store", price: 68, id: "2" }
    ];
    const el = await fixture<YnSkuSelector>(html`
      <yn-sku-selector
        .skus=${skus}
        .specKeyWhitelist=${["weight", "size", "channel"]}
        .specKeyExclude=${["channel"]}
      ></yn-sku-selector>
    `);

    const labels = [...(el.shadowRoot?.querySelectorAll<HTMLElement>(".section .label") ?? [])].map(
      (node) => node.textContent?.trim()
    );
    const optionsCount = el.shadowRoot?.querySelectorAll(".section").length ?? 0;

    expect(optionsCount).to.equal(2);
    expect(labels).to.deep.equal([]);

    const firstSectionOptions =
      el.shadowRoot?.querySelectorAll<HTMLButtonElement>(".section")[0]?.querySelectorAll(".option")
        .length ?? 0;
    expect(firstSectionOptions).to.equal(1);
  });

  it("sizes the selected indicator to the option box", async () => {
    const el = await fixture<YnSkuSelector>(html`
      <yn-sku-selector pick-one .skus=${[{ size: "S", price: 10, id: "s" }, { size: "M", price: 12, id: "m" }]}></yn-sku-selector>
    `);
    stubOptionLayout(el);
    await flushIndicators(el);

    const { indicator } = readActiveIndicatorPair(el);
    expect(indicator.style.width).to.equal("80px");
    expect(indicator.style.height).to.equal("48px");
  });

  it("keeps the selected indicator aligned under an ancestor CSS transform", async () => {
    const wrap = await fixture<HTMLDivElement>(html`
      <div style="transform: scale(0.8); transform-origin: top left;">
        <yn-sku-selector
          pick-one
          .skus=${[{ size: "S", price: 10, id: "s" }, { size: "M", price: 12, id: "m" }]}
        ></yn-sku-selector>
      </div>
    `);
    const el = wrap.querySelector<YnSkuSelector>("yn-sku-selector");
    if (!el) throw new Error("yn-sku-selector not found");
    stubOptionLayout(el);
    await flushIndicators(el);

    const { indicator } = readActiveIndicatorPair(el);
    expect(indicator.style.width).to.equal("80px");
    expect(indicator.style.height).to.equal("48px");
  });

  it("keeps calculated indicator size stable under a GSAP-like translate animation", async () => {
    const wrap = await fixture<HTMLDivElement>(html`
      <div style="width: 360px;">
        <yn-sku-selector
          pick-one
          .skus=${[{ size: "S", price: 10, id: "s" }, { size: "M", price: 12, id: "m" }]}
        ></yn-sku-selector>
      </div>
    `);
    const el = wrap.querySelector<YnSkuSelector>("yn-sku-selector");
    if (!el) throw new Error("yn-sku-selector not found");
    stubOptionLayout(el);
    await flushIndicators(el);

    const before = readActiveIndicatorPair(el);
    expect(before.indicator.style.height).to.equal("48px");
    expect(before.indicator.style.width).to.equal("80px");

    wrap.style.transform = "translate3d(0, 110%, 0)";
    stubOptionLayout(el, { width: 0, height: 0, left: 0, top: 0 });
    await flushIndicators(el);

    const mid = readActiveIndicatorPair(el);
    expect(mid.indicator.style.height).to.equal("48px");
    expect(mid.indicator.style.width).to.equal("80px");

    wrap.style.transform = "translate3d(0, 0, 0)";
    stubOptionLayout(el);
    await flushIndicators(el);

    const after = readActiveIndicatorPair(el);
    expect(after.indicator.style.height).to.equal("48px");
    expect(after.indicator.style.width).to.equal("80px");
  });

  it("does not interpolate indicator height", () => {
    const block = YN_SKU_SELECTOR_STYLES.match(/\.option-indicator\s*\{[\s\S]*?\n\}/)?.[0] ?? "";
    expect(block).to.include("transition:");
    expect(block).to.match(/transition:[\s\S]*\btransform\b/);
    expect(block).to.match(/transition:[\s\S]*\bwidth\b/);
    expect(block).to.not.match(/transition:[\s\S]*\bheight\b/);
  });
});
