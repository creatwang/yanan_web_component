import { fixture, expect, html } from "@open-wc/testing";
import "./yn-pull-cord-switch";
import type { YnPullCordSwitch } from "./yn-pull-cord-switch";

const movePointerToFixedHotspot = (el: HTMLElement) => {
  const rect = el.getBoundingClientRect();
  const styleLeft = Number.parseFloat(el.style.left);
  const styleTop = Number.parseFloat(el.style.top);
  const left = Number.isFinite(styleLeft) ? styleLeft : rect.left;
  const top = Number.isFinite(styleTop) ? styleTop : rect.top;
  const width = rect.width || el.offsetWidth || 112;
  const x = left + width / 2;
  const y = Math.max(1, top + 8);
  const event = new PointerEvent("pointermove", { clientX: x, clientY: y, bubbles: true });
  (el as unknown as { handleFixedPointerMove: (event: PointerEvent) => void }).handleFixedPointerMove(event);
};

const movePointerAway = (el: HTMLElement) => {
  const event = new PointerEvent("pointermove", { clientX: -999, clientY: -999, bubbles: true });
  (el as unknown as { handleFixedPointerMove: (event: PointerEvent) => void }).handleFixedPointerMove(event);
};

describe("yn-pull-cord-switch", () => {
  it("renders canvas stage and default OFF fallback", async () => {
    const el = await fixture<YnPullCordSwitch>(html`<yn-pull-cord-switch></yn-pull-cord-switch>`);
    await el.updateComplete;
    expect(el.shadowRoot?.querySelector("canvas.rope")).to.not.equal(null);
    expect(el.shadowRoot?.querySelector(".backdrop")).to.equal(null);
    expect(el.shadowRoot?.querySelector(".card__label")?.textContent?.trim()).to.equal("OFF");
  });

  it("reflects glow-up attribute", async () => {
    const el = await fixture<YnPullCordSwitch>(
      html`<yn-pull-cord-switch glow-up checked></yn-pull-cord-switch>`
    );
    await el.updateComplete;
    expect(el.glowUp).to.equal(true);
    expect(el.hasAttribute("glow-up")).to.equal(true);
  });

  it("reflects checked attribute", async () => {
    const el = await fixture<YnPullCordSwitch>(
      html`<yn-pull-cord-switch checked></yn-pull-cord-switch>`
    );
    await el.updateComplete;
    expect(el.checked).to.equal(true);
    expect(el.shadowRoot?.querySelector(".card__label")?.textContent?.trim()).to.equal("ON");
  });

  it("reflects size attribute with mini default", async () => {
    const el = await fixture<YnPullCordSwitch>(html`<yn-pull-cord-switch></yn-pull-cord-switch>`);
    await el.updateComplete;
    expect(el.size).to.equal("mini");
    expect(el.getAttribute("size")).to.equal("mini");
  });

  it("reflects mini size", async () => {
    const el = await fixture<YnPullCordSwitch>(
      html`<yn-pull-cord-switch size="mini"></yn-pull-cord-switch>`
    );
    await el.updateComplete;
    expect(el.size).to.equal("mini");
  });

  it("reflects floema variant", async () => {
    const el = await fixture<YnPullCordSwitch>(
      html`<yn-pull-cord-switch variant="floema"></yn-pull-cord-switch>`
    );
    await el.updateComplete;
    expect(el.variant).to.equal("floema");
    expect(el.getAttribute("variant")).to.equal("floema");
  });

  it("exposes switch semantics", async () => {
    const el = await fixture<YnPullCordSwitch>(
      html`<yn-pull-cord-switch checked></yn-pull-cord-switch>`
    );
    await el.updateComplete;
    expect(el.getAttribute("role")).to.equal("switch");
    expect(el.getAttribute("aria-checked")).to.equal("true");
  });

  it("reflects fixed mode with horizontal grip", async () => {
    const el = await fixture<YnPullCordSwitch>(
      html`<yn-pull-cord-switch fixed></yn-pull-cord-switch>`
    );
    await el.updateComplete;
    expect(el.fixed).to.equal(true);
    expect(el.shadowRoot?.querySelector(".fixed-grip")).to.not.equal(null);
    expect(el.shadowRoot?.querySelector("canvas.rope")).to.not.equal(null);
  });

  it("applies top offset when fixed", async () => {
    const el = await fixture<YnPullCordSwitch>(
      html`<yn-pull-cord-switch fixed top="48"></yn-pull-cord-switch>`
    );
    await el.updateComplete;
    expect(el.top).to.equal(48);
    expect(el.style.top).to.equal("48px");
  });

  it("uses rope-length independent of size", async () => {
    const el = await fixture<YnPullCordSwitch>(
      html`<yn-pull-cord-switch size="medium" rope-length="260"></yn-pull-cord-switch>`
    );
    await el.updateComplete;
    expect(el.ropeLength).to.equal(260);
    expect(el.style.getPropertyValue("--yn-pull-cord-switch-height")).to.equal("260px");
    expect(el.style.getPropertyValue("--yn-pull-cord-switch-segment-count")).to.equal("8");
  });

  it("applies z-index to css variable", async () => {
    const el = await fixture<YnPullCordSwitch>(
      html`<yn-pull-cord-switch z-index="120"></yn-pull-cord-switch>`
    );
    await el.updateComplete;
    expect(el.zIndex).to.equal(120);
    expect(el.style.getPropertyValue("--yn-pull-cord-switch-z-index")).to.equal("120");
  });

  it("applies card-offset property to css variable", async () => {
    const el = await fixture<YnPullCordSwitch>(
      html`<yn-pull-cord-switch card-offset="32"></yn-pull-cord-switch>`
    );
    await el.updateComplete;
    expect(el.cardOffset).to.equal(32);
    expect(el.style.getPropertyValue("--yn-pull-cord-switch-card-offset")).to.equal("32px");
  });

  it("disables fixed peek when card-offset is negative", async () => {
    const el = await fixture<YnPullCordSwitch>(
      html`<yn-pull-cord-switch fixed fixed-x="-20" card-offset="-8"></yn-pull-cord-switch>`
    );
    await el.updateComplete;
    expect(el.hasAttribute("data-fixed-peekable")).to.equal(false);
    el.dispatchEvent(new PointerEvent("pointerenter", { bubbles: true }));
    expect(el.hasAttribute("data-fixed-peeking")).to.equal(false);
    expect(el.style.left).to.not.equal("0px");
  });

  it("scales rope physics when rope-length changes", async () => {
    const el = await fixture<YnPullCordSwitch>(
      html`<yn-pull-cord-switch rope-length="360"></yn-pull-cord-switch>`
    );
    await el.updateComplete;
    expect(el.style.getPropertyValue("--yn-pull-cord-switch-height")).to.equal("360px");
    expect(el.style.getPropertyValue("--yn-pull-cord-switch-segment-count")).to.equal("11");
  });

  it("applies negative top and peeks on hover", async () => {
    const el = await fixture<YnPullCordSwitch>(
      html`<yn-pull-cord-switch fixed top="-24"></yn-pull-cord-switch>`
    );
    await el.updateComplete;
    await new Promise((resolve) => requestAnimationFrame(resolve));
    expect(el.top).to.equal(-24);
    expect(el.style.top).to.equal("-24px");
    expect(el.hasAttribute("data-fixed-peekable")).to.equal(true);
    movePointerToFixedHotspot(el);
    expect(el.style.top).to.equal("0px");
    movePointerAway(el);
    expect(el.style.top).to.equal("-24px");
  });

  it("applies fixed-x as initial horizontal offset", async () => {
    const el = await fixture<YnPullCordSwitch>(
      html`<yn-pull-cord-switch fixed fixed-x="24"></yn-pull-cord-switch>`
    );
    await el.updateComplete;
    await new Promise((resolve) => requestAnimationFrame(resolve));
    expect(el.fixedX).to.equal(24);
    expect(el.style.left).to.equal("24px");
  });

  it("centers when fixed without fixed-x attribute", async () => {
    const el = await fixture<YnPullCordSwitch>(
      html`<yn-pull-cord-switch fixed></yn-pull-cord-switch>`
    );
    await el.updateComplete;
    await new Promise((resolve) => requestAnimationFrame(resolve));
    expect(el.hasAttribute("fixed-x")).to.equal(false);
    const w = el.offsetWidth;
    const expected = (window.innerWidth - w) / 2;
    expect(Math.abs(Number.parseFloat(el.style.left) - expected)).to.be.lessThan(2);
  });

  it("applies negative fixed-x for partial hide", async () => {
    const el = await fixture<YnPullCordSwitch>(
      html`<yn-pull-cord-switch fixed fixed-x="-20"></yn-pull-cord-switch>`
    );
    await el.updateComplete;
    await new Promise((resolve) => requestAnimationFrame(resolve));
    expect(el.fixedX).to.equal(-20);
    expect(el.style.left).to.equal("-20px");
    expect(el.hasAttribute("data-fixed-peekable")).to.equal(true);
  });

  it("reverse computes fixed-x from the right", async () => {
    const el = await fixture<YnPullCordSwitch>(
      html`<yn-pull-cord-switch fixed reverse fixed-x="10"></yn-pull-cord-switch>`
    );
    await el.updateComplete;
    await new Promise((resolve) => requestAnimationFrame(resolve));
    const w = el.offsetWidth;
    expect(el.style.left).to.equal(`${window.innerWidth - w - 10}px`);
  });

  it("reverse negative fixed-x peeks on hover from the right", async () => {
    const el = await fixture<YnPullCordSwitch>(
      html`<yn-pull-cord-switch fixed reverse fixed-x="-20"></yn-pull-cord-switch>`
    );
    await el.updateComplete;
    await new Promise((resolve) => requestAnimationFrame(resolve));
    const w = el.offsetWidth;
    const restLeft = window.innerWidth - w - -20;
    expect(Number.parseFloat(el.style.left)).to.be.closeTo(restLeft, 2);
    movePointerToFixedHotspot(el);
    expect(Number.parseFloat(el.style.left)).to.be.closeTo(window.innerWidth - w, 2);
    movePointerAway(el);
    expect(Number.parseFloat(el.style.left)).to.be.closeTo(restLeft, 2);
  });

  it("negative fixed-x peeks on hover from the left", async () => {
    const el = await fixture<YnPullCordSwitch>(
      html`<yn-pull-cord-switch fixed fixed-x="-20"></yn-pull-cord-switch>`
    );
    await el.updateComplete;
    await new Promise((resolve) => requestAnimationFrame(resolve));
    expect(el.style.left).to.equal("-20px");
    movePointerToFixedHotspot(el);
    expect(el.style.left).to.equal("0px");
    movePointerAway(el);
    expect(el.style.left).to.equal("-20px");
  });

  it("renders slotted card content", async () => {
    const el = await fixture<YnPullCordSwitch>(html`
      <yn-pull-cord-switch>
        <span>拉绳</span>
      </yn-pull-cord-switch>
    `);
    await el.updateComplete;
    const slot = el.shadowRoot?.querySelector("slot:not([name])") as HTMLSlotElement | null;
    const assigned = slot?.assignedNodes({ flatten: true }) ?? [];
    expect(assigned.some((node) => node.textContent?.includes("拉绳"))).to.equal(true);
    expect(el.getAttribute("data-card-mode")).to.equal("default-slot");
  });

  it("keeps default slot content when checked without activated slot", async () => {
    const el = await fixture<YnPullCordSwitch>(html`
      <yn-pull-cord-switch>
        <button type="button">主题</button>
      </yn-pull-cord-switch>
    `);
    await el.updateComplete;
    expect(el.getAttribute("data-card-mode")).to.equal("default-slot");
    el.checked = true;
    await el.updateComplete;
    expect(el.querySelector("button")?.textContent?.trim()).to.equal("主题");
    expect(el.shadowRoot?.querySelector(".card__label")).to.equal(null);
  });

  it("switches between default and activated slots when checked", async () => {
    const el = await fixture<YnPullCordSwitch>(html`
      <yn-pull-cord-switch>
        <span id="off">关</span>
        <span id="on" slot="activated">开</span>
      </yn-pull-cord-switch>
    `);
    await el.updateComplete;
    expect(el.getAttribute("data-card-mode")).to.equal("dual-slot");
    const offLayer = el.shadowRoot?.querySelector(".card__layer--active");
    expect(offLayer?.querySelector('slot:not([name])')).to.not.equal(null);
    el.checked = true;
    await el.updateComplete;
    const onLayer = el.shadowRoot?.querySelector(".card__layer--active");
    expect(onLayer?.querySelector('slot[name="activated"]')).to.not.equal(null);
  });
});
