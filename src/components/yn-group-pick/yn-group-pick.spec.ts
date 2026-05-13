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

  it("uses group defaults while keeping yn-pick explicit icon props", async () => {
    const groupSelected = "<svg>group-selected</svg>";
    const groupUnselected = "<svg>group-unselected</svg>";
    const childSelected = "<svg>child-selected</svg>";
    const childUnselected = "<svg>child-unselected</svg>";

    const el = await fixture<YnGroupPick>(html`
      <yn-group-pick
        selected-icon=${groupSelected}
        unselected-icon=${groupUnselected}
        show-unselected-icon
      >
        <yn-pick value="A"></yn-pick>
        <yn-pick
          value="B"
          selected-icon=${childSelected}
          unselected-icon=${childUnselected}
          show-unselected-icon
        ></yn-pick>
      </yn-group-pick>
    `);

    const picks = el.querySelectorAll<HTMLElement & { selectedIcon: string; unselectedIcon: string; showUnselectedIcon: boolean }>("yn-pick");
    expect(picks[0]?.selectedIcon).to.equal(groupSelected);
    expect(picks[0]?.unselectedIcon).to.equal(groupUnselected);
    expect(picks[0]?.showUnselectedIcon).to.equal(true);
    expect(picks[1]?.selectedIcon).to.equal(childSelected);
    expect(picks[1]?.unselectedIcon).to.equal(childUnselected);
    expect(picks[1]?.showUnselectedIcon).to.equal(true);
  });
});
