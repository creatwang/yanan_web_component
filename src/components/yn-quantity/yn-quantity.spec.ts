import { expect, fixture, html, oneEvent } from "@open-wc/testing";
import "./yn-quantity";
import type { YnQuantity } from "./yn-quantity";

describe("yn-quantity", () => {
  it("renders default value", async () => {
    const el = await fixture<YnQuantity>(html`<yn-quantity></yn-quantity>`);
    await el.updateComplete;
    const input = el.shadowRoot?.querySelector<HTMLInputElement>(".value");
    expect(input?.value).to.equal("1");
    expect(el.value).to.equal(1);
  });

  it("increments and decrements value", async () => {
    const el = await fixture<YnQuantity>(html`<yn-quantity .value=${2}></yn-quantity>`);
    await el.updateComplete;

    const increase = el.shadowRoot?.querySelector<HTMLButtonElement>('[aria-label="增加数量"]');
    const decrease = el.shadowRoot?.querySelector<HTMLButtonElement>('[aria-label="减少数量"]');
    if (!increase || !decrease) throw new Error("missing stepper buttons");

    increase.click();
    await el.updateComplete;
    expect(el.value).to.equal(3);

    decrease.click();
    await el.updateComplete;
    expect(el.value).to.equal(2);
  });

  it("emits change with updated value", async () => {
    const el = await fixture<YnQuantity>(html`<yn-quantity .value=${1}></yn-quantity>`);
    await el.updateComplete;

    const increase = el.shadowRoot?.querySelector<HTMLButtonElement>('[aria-label="增加数量"]');
    if (!increase) throw new Error("missing increase button");

    const changePromise = oneEvent(el, "change");
    increase.click();
    const event = (await changePromise) as CustomEvent<{ value: number }>;
    expect(event.detail.value).to.equal(2);
  });

  it("clamps value to min and max", async () => {
    const el = await fixture<YnQuantity>(html`<yn-quantity min="1" max="3" .value=${3}></yn-quantity>`);
    await el.updateComplete;

    const increase = el.shadowRoot?.querySelector<HTMLButtonElement>('[aria-label="增加数量"]');
    if (!increase) throw new Error("missing increase button");

    increase.click();
    await el.updateComplete;
    expect(el.value).to.equal(3);
    expect(increase.disabled).to.equal(true);
  });

  it("disables controls when disabled", async () => {
    const el = await fixture<YnQuantity>(html`<yn-quantity disabled></yn-quantity>`);
    await el.updateComplete;

    expect(el.hasAttribute("disabled")).to.equal(true);
    const input = el.shadowRoot?.querySelector<HTMLInputElement>(".value");
    const buttons = el.shadowRoot?.querySelectorAll<HTMLButtonElement>(".btn");
    expect(input?.disabled).to.equal(true);
    buttons?.forEach((button) => {
      expect(button.disabled).to.equal(true);
    });
  });

  it("syncs typed input on blur", async () => {
    const el = await fixture<YnQuantity>(html`<yn-quantity min="1" max="10" .value=${1}></yn-quantity>`);
    await el.updateComplete;

    const input = el.shadowRoot?.querySelector<HTMLInputElement>(".value");
    if (!input) throw new Error("missing input");

    input.value = "5";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    await el.updateComplete;
    expect(el.value).to.equal(5);
  });

  it("bootstraps stepper from declarative shadow DOM", async () => {
    const { renderYnQuantityShadowHtml } = await import("./yn-quantity-shadow.js");
    const shadowHtml = renderYnQuantityShadowHtml({ value: 2, min: 1, max: 10 });
    const host = document.createElement("yn-quantity") as YnQuantity;
    host.value = 2;
    host.min = 1;
    host.max = 10;
    const template = document.createElement("template");
    template.setAttribute("shadowrootmode", "open");
    template.innerHTML = shadowHtml;
    host.appendChild(template);
    document.body.appendChild(host);

    await host.updateComplete;

    const increase = host.shadowRoot?.querySelector<HTMLButtonElement>(".btn-increase");
    if (!increase) throw new Error("missing increase button");

    increase.click();
    await host.updateComplete;
    expect(host.value).to.equal(3);
    expect(host.shadowRoot?.querySelector<HTMLInputElement>(".value")?.value).to.equal("3");

    host.remove();
  });
});
