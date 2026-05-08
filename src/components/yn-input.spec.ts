import { fixture, expect, html } from "@open-wc/testing";
import "./yn-input";
import type { YnInput } from "./yn-input";

describe("yn-input", () => {
  it("renders placeholder", async () => {
    const el = await fixture<YnInput>(html`<yn-input placeholder="搜索"></yn-input>`);
    const input = el.shadowRoot?.querySelector("input");
    expect(input?.getAttribute("placeholder")).to.equal("搜索");
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
});
