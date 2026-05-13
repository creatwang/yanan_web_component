import { fixture, expect, html } from "@open-wc/testing";
import "./yn-button";
import type { YnButton } from "./yn-button";

describe("yn-button", () => {
  it("renders default slot text", async () => {
    const el = await fixture<YnButton>(html`<yn-button>确认</yn-button>`);
    await el.updateComplete;
    const slot = el.shadowRoot?.querySelector<HTMLSlotElement>(".label slot");
    const assignedText = slot
      ?.assignedNodes({ flatten: true })
      .map((node) => node.textContent ?? "")
      .join("")
      .trim();
    expect(assignedText).to.equal("确认");
  });

  it("renders default slot text when named slots are provided", async () => {
    const el = await fixture<YnButton>(html`
      <yn-button>
        提交
        <span slot="prefix-icon">☆</span>
        <span slot="suffix-icon">→</span>
      </yn-button>
    `);
    await el.updateComplete;
    const slot = el.shadowRoot?.querySelector<HTMLSlotElement>(".label slot");
    const assignedText = slot
      ?.assignedNodes({ flatten: true })
      .map((node) => node.textContent ?? "")
      .join("")
      .trim();
    expect(assignedText).to.equal("提交");
  });

  it("emits click event", async () => {
    const el = await fixture<YnButton>(html`<yn-button></yn-button>`);
    let emitted = false;
    el.addEventListener("click", () => {
      emitted = true;
    });

    el.shadowRoot?.querySelector("button")?.click();
    expect(emitted).to.equal(true);
  });

  it("applies variant attribute", async () => {
    const el = await fixture<YnButton>(html`<yn-button variant="danger"></yn-button>`);
    expect(el.getAttribute("variant")).to.equal("danger");
  });

  it("uses medium as default size", async () => {
    const el = await fixture<YnButton>(html`<yn-button></yn-button>`);
    expect(el.getAttribute("size")).to.equal("medium");
  });

  it("applies size attribute", async () => {
    const el = await fixture<YnButton>(html`<yn-button size="mini"></yn-button>`);
    expect(el.getAttribute("size")).to.equal("mini");
  });

  it("applies loading and loading-type attributes", async () => {
    const el = await fixture<YnButton>(html`<yn-button loading loading-type="right">提交</yn-button>`);
    expect(el.hasAttribute("loading")).to.equal(true);
    expect(el.getAttribute("loading-type")).to.equal("right");
  });

  it("applies disabled attribute", async () => {
    const el = await fixture<YnButton>(html`<yn-button disabled>提交</yn-button>`);
    expect(el.hasAttribute("disabled")).to.equal(true);
    const button = el.shadowRoot?.querySelector("button");
    expect(button?.disabled).to.equal(true);
  });

  it("enables hit-slop by default", async () => {
    const el = await fixture<YnButton>(html`<yn-button>提交</yn-button>`);
    expect(el.hasAttribute("hit-slop")).to.equal(true);
    const button = el.shadowRoot?.querySelector("button");
    expect(button?.classList.contains("hit-slop")).to.equal(true);
  });

  it("can disable hit-slop", async () => {
    const el = await fixture<YnButton>(html`<yn-button .hitSlop=${false}>提交</yn-button>`);
    await el.updateComplete;
    expect(el.hasAttribute("hit-slop")).to.equal(false);
    const button = el.shadowRoot?.querySelector("button");
    expect(button?.classList.contains("hit-slop")).to.equal(false);
  });

  it("does not emit click when loading", async () => {
    const el = await fixture<YnButton>(html`<yn-button loading>提交</yn-button>`);
    let emitted = false;
    el.addEventListener("click", () => {
      emitted = true;
    });
    el.shadowRoot?.querySelector("button")?.click();
    expect(emitted).to.equal(false);
  });

  it("keeps label visible when loading-type is center", async () => {
    const el = await fixture<YnButton>(html`<yn-button loading loading-type="center">提交中</yn-button>`);
    await el.updateComplete;
    const slot = el.shadowRoot?.querySelector<HTMLSlotElement>(".label slot");
    const assignedText = slot
      ?.assignedNodes({ flatten: true })
      .map((node) => node.textContent ?? "")
      .join("")
      .trim();
    expect(assignedText).to.equal("提交中");
    expect(el.shadowRoot?.querySelector(".loading-center")).to.exist;
  });

  it("supports custom loading slot", async () => {
    const el = await fixture<YnButton>(html`
      <yn-button loading loading-type="left">
        提交中
        <svg slot="loading" viewBox="0 0 20 20"><circle cx="10" cy="10" r="8"></circle></svg>
      </yn-button>
    `);
    await el.updateComplete;
    await new Promise((resolve) => setTimeout(resolve, 0));
    await el.updateComplete;
    const loadingSlot = el.shadowRoot?.querySelector<HTMLSlotElement>('slot[name="loading"]');
    const customLoading = el.shadowRoot?.querySelector(".loading-custom");
    expect(customLoading).to.exist;
    expect(loadingSlot?.assignedElements({ flatten: true }).length).to.equal(1);
  });

  it("does not emit click when disabled", async () => {
    const el = await fixture<YnButton>(html`<yn-button disabled>提交</yn-button>`);
    let emitted = false;
    el.addEventListener("click", () => {
      emitted = true;
    });
    el.shadowRoot?.querySelector("button")?.click();
    expect(emitted).to.equal(false);
  });

  it("renders prefix and suffix icon slots", async () => {
    const el = await fixture<YnButton>(html`
      <yn-button>
        下载
        <span slot="prefix-icon">☆</span>
        <span slot="suffix-icon">→</span>
      </yn-button>
    `);
    const prefixSlot = el.shadowRoot?.querySelector<HTMLSlotElement>('slot[name="prefix-icon"]');
    const suffixSlot = el.shadowRoot?.querySelector<HTMLSlotElement>('slot[name="suffix-icon"]');
    expect(prefixSlot?.assignedElements({ flatten: true }).length).to.equal(1);
    expect(suffixSlot?.assignedElements({ flatten: true }).length).to.equal(1);
  });

  it("centers icon-only layout without label", async () => {
    const el = await fixture<YnButton>(html`
      <yn-button>
        <span slot="prefix-icon">☆</span>
        <span slot="suffix-icon">→</span>
      </yn-button>
    `);
    await el.updateComplete;
    const content = el.shadowRoot?.querySelector(".content");
    const label = el.shadowRoot?.querySelector(".label");
    expect(content?.classList.contains("icon-only")).to.equal(true);
    expect(label).to.equal(null);
  });

  it("exposes named icon slots", async () => {
    const el = await fixture<YnButton>(html`
      <yn-button>
        提交
        <span slot="prefix-icon">P</span>
        <span slot="suffix-icon">S</span>
      </yn-button>
    `);
    await el.updateComplete;
    expect(el.shadowRoot?.querySelector('slot[name="prefix-icon"]')).to.exist;
    expect(el.shadowRoot?.querySelector('slot[name="suffix-icon"]')).to.exist;
  });
});
