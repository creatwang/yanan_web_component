import { expect, fixture, html } from "@open-wc/testing";
import "./yn-group-pick";
import "../yn-pick/yn-pick";
import type { YnGroupPick } from "./yn-group-pick";

describe("yn-group-pick", () => {
  it("supports single selection and emits change detail", async () => {
    const el = await fixture<YnGroupPick>(html`
      <yn-group-pick .value=${"A"}>
        <yn-pick .value=${"A"}></yn-pick>
        <yn-pick .value=${"B"}></yn-pick>
      </yn-group-pick>
    `);

    let latest: { ids: Array<string | number>; flag: boolean } | null = null;
    el.addEventListener("change", (event) => {
      latest = (event as CustomEvent<{ ids: Array<string | number>; flag: boolean }>).detail;
    });

    const picks = el.querySelectorAll("yn-pick");
    picks[1]?.dispatchEvent(
      new CustomEvent("toggle", {
        detail: { id: "B", flag: true },
        bubbles: true,
        composed: true
      })
    );

    expect(el.value).to.equal("B");
    expect(latest).to.deep.equal({ ids: ["B"], flag: true });
  });

  it("supports multiple selection", async () => {
    const el = await fixture<YnGroupPick>(html`
      <yn-group-pick .multiple=${true} .value=${["A"]}>
        <yn-pick .value=${"A"}></yn-pick>
        <yn-pick .value=${"B"}></yn-pick>
      </yn-group-pick>
    `);

    const picks = el.querySelectorAll("yn-pick");
    picks[1]?.dispatchEvent(
      new CustomEvent("toggle", {
        detail: { id: "B", flag: true },
        bubbles: true,
        composed: true
      })
    );

    expect(el.value).to.deep.equal(["A", "B"]);
  });

  it("supports attribute usage for value and multiple", async () => {
    const el = await fixture<YnGroupPick>(html`
      <yn-group-pick multiple value='["A"]'>
        <yn-pick value="A"></yn-pick>
        <yn-pick value="B"></yn-pick>
      </yn-group-pick>
    `);

    const secondWrap = el.querySelectorAll("yn-pick")[1]?.shadowRoot?.querySelector(".wrap");
    if (!secondWrap) throw new Error("second pick wrap not found");
    secondWrap.dispatchEvent(new MouseEvent("click", { bubbles: true, composed: true }));

    expect(el.value).to.deep.equal(["A", "B"]);
  });
});
