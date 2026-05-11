import { fixture, expect, html } from "@open-wc/testing";
import "./yn-icon-connect-button";
import type { YnIconConnectButton } from "./yn-icon-connect-button";

describe("yn-icon-connect-button", () => {
  it("renders label text", async () => {
    const el = await fixture<YnIconConnectButton>(html`
      <yn-icon-connect-button label="确认提交"></yn-icon-connect-button>
    `);
    const label = el.shadowRoot?.querySelector(".label");
    expect(label?.textContent?.trim()).to.equal("确认提交");
  });

  it("emits yn-click event on click", async () => {
    const el = await fixture<YnIconConnectButton>(html`
      <yn-icon-connect-button label="点击"></yn-icon-connect-button>
    `);
    let emitted = false;
    el.addEventListener("yn-click", () => {
      emitted = true;
    });

    el.shadowRoot?.querySelector("button")?.click();
    expect(emitted).to.equal(true);
  });

  it("applies size attribute", async () => {
    const el = await fixture<YnIconConnectButton>(html`
      <yn-icon-connect-button size="mini"></yn-icon-connect-button>
    `);
    expect(el.getAttribute("size")).to.equal("mini");
  });
});
