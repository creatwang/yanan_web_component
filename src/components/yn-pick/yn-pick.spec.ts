import { expect, fixture, html } from "@open-wc/testing";
import "./yn-pick";
import type { YnPick } from "./yn-pick";

describe("yn-pick", () => {
  it("emits toggle with id and flag", async () => {
    const el = await fixture<YnPick>(html`<yn-pick .value=${"Nature"}></yn-pick>`);
    let emittedId: string | number = "";
    let emittedFlag = false;
    el.addEventListener("toggle", (event) => {
      if (!(event instanceof CustomEvent)) return;
      const detail = event.detail as { id: string | number; flag: boolean };
      emittedId = detail.id;
      emittedFlag = detail.flag;
    });

    const wrap = el.shadowRoot?.querySelector(".wrap");
    if (!wrap) throw new Error("wrap not found");
    wrap.dispatchEvent(new MouseEvent("click", { bubbles: true, composed: true }));

    expect(emittedId).to.equal("Nature");
    expect(emittedFlag).to.equal(true);
    expect(el.selected).to.equal(true);
  });

  it("shows border by default", async () => {
    const el = await fixture<YnPick>(html`<yn-pick></yn-pick>`);
    const wrap = el.shadowRoot?.querySelector(".wrap");
    expect(wrap?.classList.contains("with-border")).to.equal(true);
  });
});
