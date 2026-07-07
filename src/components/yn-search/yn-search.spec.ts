import { fixture, expect, html, oneEvent } from "@open-wc/testing";
import "./yn-search";
import type { YnSearch } from "./yn-search";

describe("yn-search", () => {
  it("defaults close to true, open to false and expand-direction to right", async () => {
    const el = await fixture<YnSearch>(html`<yn-search></yn-search>`);
    expect(el.close).to.equal(true);
    expect(el.open).to.equal(false);
    expect(el.getAttribute("expand-direction")).to.equal("right");
  });

  it("renders expanded when open=true initially", async () => {
    const el = await fixture<YnSearch>(html`<yn-search open input-width="200"></yn-search>`);
    await el.updateComplete;
    expect(el.open).to.equal(true);
    const shell = el.shadowRoot?.querySelector("#searchShell");
    expect(shell?.classList.contains("open")).to.equal(true);
    expect(Number.parseFloat(el.style.width)).to.be.greaterThan(200);
  });

  it("opens on toggle click", async () => {
    const el = await fixture<YnSearch>(html`<yn-search input-width="200"></yn-search>`);
    await el.updateComplete;
    el.shadowRoot?.querySelector<HTMLButtonElement>("#toggleBtn")?.click();
    await el.updateComplete;
    const shell = el.shadowRoot?.querySelector("#searchShell");
    expect(shell?.classList.contains("open")).to.equal(true);
  });

  it("clears value on first close click and dispatches input, then closes on second click", async () => {
    const el = await fixture<YnSearch>(html`<yn-search input-width="200"></yn-search>`);
    await el.updateComplete;

    el.shadowRoot?.querySelector<HTMLButtonElement>("#toggleBtn")?.click();
    await el.updateComplete;

    const input = el.shadowRoot?.querySelector<HTMLInputElement>("#searchInput");
    if (!input) throw new Error("missing input");
    input.value = "Sofa";
    input.dispatchEvent(new InputEvent("input", { bubbles: true, composed: true }));
    await el.updateComplete;

    const clearPromise = oneEvent(el, "input");
    el.shadowRoot?.querySelector<HTMLButtonElement>("#toggleBtn")?.click();
    const clearEvent = (await clearPromise) as CustomEvent<{ value: string }>;
    expect(clearEvent.detail.value).to.equal("");
    expect(input.value).to.equal("");
    expect(el.shadowRoot?.querySelector("#searchShell")?.classList.contains("open")).to.equal(true);

    el.shadowRoot?.querySelector<HTMLButtonElement>("#toggleBtn")?.click();
    await new Promise((resolve) => setTimeout(resolve, 700));
    expect(el.shadowRoot?.querySelector("#searchShell")?.classList.contains("open")).to.equal(false);
  });

  it("closes immediately when close=false even with value", async () => {
    const el = await fixture<YnSearch>(html`<yn-search input-width="200"></yn-search>`);
    el.close = false;
    await el.updateComplete;

    el.shadowRoot?.querySelector<HTMLButtonElement>("#toggleBtn")?.click();
    await el.updateComplete;

    const input = el.shadowRoot?.querySelector<HTMLInputElement>("#searchInput");
    if (!input) throw new Error("missing input");
    input.value = "Table";
    input.dispatchEvent(new InputEvent("input", { bubbles: true, composed: true }));
    await el.updateComplete;

    el.shadowRoot?.querySelector<HTMLButtonElement>("#toggleBtn")?.click();
    await new Promise((resolve) => setTimeout(resolve, 700));
    expect(el.shadowRoot?.querySelector("#searchShell")?.classList.contains("open")).to.equal(false);
    expect(input.value).to.equal("");
  });

  it("reflects expand-direction=left layout class", async () => {
    const el = await fixture<YnSearch>(html`<yn-search expand-direction="left"></yn-search>`);
    await el.updateComplete;
    expect(el.getAttribute("expand-direction")).to.equal("left");
    const shell = el.shadowRoot?.querySelector("#searchShell");
    expect(shell?.classList.contains("expand-left")).to.equal(true);
  });

  it("mirrors shape paths for expand-left so outer cap stays on the left", async () => {
    const el = await fixture<YnSearch>(
      html`<yn-search expand-direction="left" input-width="200" open></yn-search>`
    );
    await el.updateComplete;
    await new Promise((resolve) => setTimeout(resolve, 50));

    const rect = el.shadowRoot?.querySelector<SVGPathElement>("#rect1");
    const bridge = el.shadowRoot?.querySelector<SVGPathElement>("#bridge");
    if (!rect || !bridge) throw new Error("missing shape paths");

    const rectD = rect.getAttribute("d") ?? "";
    const bridgeD = bridge.getAttribute("d") ?? "";
    expect(rectD.startsWith("M44 ")).to.equal(true);
    expect(bridgeD).to.match(/2[0-4]\d\./);
  });

  it("keeps host layout width at button size during open phase one", async () => {
    const el = await fixture<YnSearch>(html`<yn-search input-width="200"></yn-search>`);
    await el.updateComplete;

    el.shadowRoot?.querySelector<HTMLButtonElement>("#toggleBtn")?.click();
    await el.updateComplete;

    expect(el.getBoundingClientRect().width).to.be.at.most(48);
    expect(el.style.width).to.equal("44px");
  });

  it("dispatches enter event on Enter key", async () => {
    const el = await fixture<YnSearch>(html`<yn-search input-width="200"></yn-search>`);
    await el.updateComplete;
    el.shadowRoot?.querySelector<HTMLButtonElement>("#toggleBtn")?.click();
    await el.updateComplete;

    const input = el.shadowRoot?.querySelector<HTMLInputElement>("#searchInput");
    if (!input) throw new Error("missing input");
    input.value = "Chair";
    input.dispatchEvent(new Event("input", { bubbles: true, composed: true }));

    const enterPromise = oneEvent(el, "enter");
    input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true, composed: true }));
    const enterEvent = (await enterPromise) as CustomEvent<{ value: string }>;
    expect(enterEvent.detail.value).to.equal("Chair");
  });

  it("does not jump to full layout width when opening animation starts", async () => {
    const container = await fixture(html`
      <div style="display:flex;align-items:center;gap:12px">
        <yn-search input-width="240"></yn-search>
        <button>Cart</button>
      </div>
    `);
    const el = container.querySelector("yn-search") as YnSearch;
    await el.updateComplete;
    const cart = container.querySelector("button") as HTMLButtonElement;
    const shell = el.shadowRoot?.querySelector("#searchShell") as HTMLElement;
    if (!shell) throw new Error("missing shell");

    const searchLeftBefore = el.getBoundingClientRect().left;
    const cartLeftBefore = cart.getBoundingClientRect().left;

    el.shadowRoot?.querySelector<HTMLButtonElement>("#toggleBtn")?.click();
    await el.updateComplete;

    expect(Number.parseFloat(shell.style.width)).to.be.lessThan(80);
    expect(el.getBoundingClientRect().left).to.be.closeTo(searchLeftBefore, 1);
    expect(cart.getBoundingClientRect().left).to.be.closeTo(cartLeftBefore, 1);
  });

  it("clears visible input on first close click when value state is out of sync", async () => {
    const el = await fixture<YnSearch>(html`<yn-search input-width="200" open></yn-search>`);
    await el.updateComplete;

    const input = el.shadowRoot?.querySelector<HTMLInputElement>("#searchInput");
    const toggle = el.shadowRoot?.querySelector<HTMLButtonElement>("#toggleBtn");
    if (!input || !toggle) throw new Error("missing search controls");

    input.value = "Chair";
    expect(el.value).to.equal("");

    toggle.click();
    await el.updateComplete;

    expect(input.value).to.equal("");
    expect(el.open).to.equal(true);
  });

  it("grows shell width with animation and finishes expanded", async () => {
    const container = await fixture(html`
      <div style="display:flex;align-items:center;gap:12px">
        <yn-search input-width="240"></yn-search>
        <button>Cart</button>
      </div>
    `);
    const el = container.querySelector("yn-search") as YnSearch;
    await el.updateComplete;
    const shell = el.shadowRoot?.querySelector("#searchShell") as HTMLElement;
    if (!shell) throw new Error("missing shell");

    el.shadowRoot?.querySelector<HTMLButtonElement>("#toggleBtn")?.click();
    await el.updateComplete;
    expect(Number.parseFloat(shell.style.width)).to.be.lessThan(80);

    await new Promise((resolve) => setTimeout(resolve, 700));
    await el.updateComplete;

    expect(shell.classList.contains("open")).to.equal(true);
    expect(Number.parseFloat(shell.style.width)).to.be.greaterThan(200);
  });
});
