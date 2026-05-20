import { fixture, expect, html } from "@open-wc/testing";
import "./yn-input";
import type { YnInput } from "./yn-input";

describe("yn-input", () => {
  it("renders placeholder", async () => {
    const el = await fixture<YnInput>(html`<yn-input placeholder="搜索"></yn-input>`);
    const input = el.shadowRoot?.querySelector("input");
    expect(input?.getAttribute("placeholder")).to.equal("搜索");
  });

  it("does not render action buttons without slots", async () => {
    const el = await fixture<YnInput>(html`<yn-input></yn-input>`);
    expect(el.shadowRoot?.querySelector(".action-prefix")).to.equal(null);
    expect(el.shadowRoot?.querySelector(".action-suffix")).to.equal(null);
  });

  it("emits yn-input event with current value", async () => {
    const el = await fixture<YnInput>(html`<yn-input></yn-input>`);
    let emittedValue = "";
    el.addEventListener("yn-input", (event) => {
      emittedValue = (event as CustomEvent<{ value: string }>).detail.value;
    });

    const input = el.shadowRoot?.querySelector("input");
    if (!input) {
      throw new Error("input not found");
    }

    input.value = "hello";
    input.dispatchEvent(new Event("input"));
    expect(emittedValue).to.equal("hello");
    expect(el.value).to.equal("hello");
  });

  it("renders prefix and suffix button slots", async () => {
    const el = await fixture<YnInput>(html`
      <yn-input>
        <span slot="prefix-button">P</span>
        <span slot="suffix-button">S</span>
      </yn-input>
    `);

    await el.updateComplete;

    expect(el.shadowRoot?.querySelector(".action-prefix")).to.not.equal(null);
    expect(el.shadowRoot?.querySelector(".action-suffix")).to.not.equal(null);

    const prefixSlot = el.shadowRoot?.querySelector<HTMLSlotElement>('slot[name="prefix-button"]');
    const suffixSlot = el.shadowRoot?.querySelector<HTMLSlotElement>('slot[name="suffix-button"]');
    expect(prefixSlot?.assignedElements({ flatten: true }).length).to.equal(1);
    expect(suffixSlot?.assignedElements({ flatten: true }).length).to.equal(1);
  });

  it("emits prefix and suffix click events with current value", async () => {
    const el = await fixture<YnInput>(html`
      <yn-input value="hello">
        <span slot="prefix-button">P</span>
        <span slot="suffix-button">S</span>
      </yn-input>
    `);
    await el.updateComplete;

    let prefixValue = "";
    let suffixValue = "";

    el.addEventListener("yn-prefix-click", (event) => {
      prefixValue = (event as CustomEvent<{ value: string }>).detail.value;
    });
    el.addEventListener("yn-suffix-click", (event) => {
      suffixValue = (event as CustomEvent<{ value: string }>).detail.value;
    });

    const prefixButton = el.shadowRoot?.querySelector<HTMLButtonElement>(".action-prefix");
    const suffixButton = el.shadowRoot?.querySelector<HTMLButtonElement>(".action-suffix");
    if (!prefixButton || !suffixButton) {
      throw new Error("button not found");
    }

    prefixButton.click();
    suffixButton.click();

    expect(prefixValue).to.equal("hello");
    expect(suffixValue).to.equal("hello");
  });

  it("disables prefix and suffix buttons when disabled", async () => {
    const el = await fixture<YnInput>(html`
      <yn-input disabled>
        <span slot="prefix-button">P</span>
        <span slot="suffix-button">S</span>
      </yn-input>
    `);
    await el.updateComplete;

    let prefixClicked = false;
    let suffixClicked = false;

    el.addEventListener("yn-prefix-click", () => {
      prefixClicked = true;
    });
    el.addEventListener("yn-suffix-click", () => {
      suffixClicked = true;
    });

    const prefixButton = el.shadowRoot?.querySelector<HTMLButtonElement>(".action-prefix");
    const suffixButton = el.shadowRoot?.querySelector<HTMLButtonElement>(".action-suffix");
    if (!prefixButton || !suffixButton) {
      throw new Error("button not found");
    }

    expect(prefixButton.disabled).to.equal(true);
    expect(suffixButton.disabled).to.equal(true);
    prefixButton.click();
    suffixButton.click();
    expect(prefixClicked).to.equal(false);
    expect(suffixClicked).to.equal(false);
  });
});
