import { expect, fixture, html, oneEvent } from "@open-wc/testing";
import "../yn-icon-button/yn-icon-button.js";
import "./yn-drawer";
import type { YnDrawer } from "./yn-drawer";

function stubMatchMedia(matches: boolean) {
  const originalMatchMedia = window.matchMedia;
  window.matchMedia = () => ({ matches }) as MediaQueryList;
  return () => {
    window.matchMedia = originalMatchMedia;
  };
}

function stubDrawerBreakpoint(initialMatches: boolean) {
  const originalMatchMedia = window.matchMedia;
  const originalInnerWidth = Object.getOwnPropertyDescriptor(window, "innerWidth");
  const listeners = new Set<EventListenerOrEventListenerObject>();
  let matches = initialMatches;

  const setInnerWidth = (nextMatches: boolean) => {
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: nextMatches ? 1024 : 1023,
    });
  };
  setInnerWidth(matches);

  const mediaQuery = {
    media: "(min-width: 1024px)",
    onchange: null,
    get matches() {
      return matches;
    },
    addEventListener(type: string, listener: EventListenerOrEventListenerObject) {
      if (type === "change") listeners.add(listener);
    },
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject) {
      if (type === "change") listeners.delete(listener);
    },
    addListener(listener: EventListenerOrEventListenerObject) {
      listeners.add(listener);
    },
    removeListener(listener: EventListenerOrEventListenerObject) {
      listeners.delete(listener);
    },
    dispatchEvent() {
      return true;
    },
  } as unknown as MediaQueryList;

  window.matchMedia = (query: string) =>
    query === mediaQuery.media
      ? mediaQuery
      : ({ matches: false } as MediaQueryList);

  return {
    change(nextMatches: boolean) {
      matches = nextMatches;
      setInnerWidth(matches);
      const event = new Event("change");
      Object.defineProperties(event, {
        matches: { value: matches },
        media: { value: mediaQuery.media },
      });
      for (const listener of listeners) {
        if (typeof listener === "function") listener(event);
        else listener.handleEvent(event);
      }
    },
    restore() {
      window.matchMedia = originalMatchMedia;
      if (originalInnerWidth) {
        Object.defineProperty(window, "innerWidth", originalInnerWidth);
      }
    },
  };
}

describe("yn-drawer", () => {
  it("renders default title and closed state", async () => {
    const el = await fixture<YnDrawer>(html`<yn-drawer title="Filters"></yn-drawer>`);
    await el.updateComplete;
    expect(el.open).to.equal(false);
    expect(el.title).to.equal("Filters");
    expect(el.shadowRoot?.querySelector(".title")?.textContent?.trim()).to.equal("Filters");
  });

  it("opens and closes via public API", async () => {
    const el = await fixture<YnDrawer>(html`<yn-drawer></yn-drawer>`);
    await el.updateComplete;

    el.show();
    await el.updateComplete;
    expect(el.open).to.equal(true);

    el.close();
    await el.updateComplete;
    expect(el.open).to.equal(false);
  });

  it("toggles open state via public API", async () => {
    const el = await fixture<YnDrawer>(html`<yn-drawer></yn-drawer>`);
    await el.updateComplete;

    el.toggle();
    await el.updateComplete;
    expect(el.open).to.equal(true);

    el.toggle();
    await el.updateComplete;
    expect(el.open).to.equal(false);
  });

  it("dispatches open-change when opened via API", async () => {
    const el = await fixture<YnDrawer>(html`<yn-drawer></yn-drawer>`);
    await el.updateComplete;

    const eventPromise = oneEvent(el, "open-change");
    el.show();
    const event = (await eventPromise) as CustomEvent<{ open: boolean; source: string }>;
    expect(event.detail.open).to.equal(true);
    expect(event.detail.source).to.equal("api");
  });

  it("opens when default trigger is clicked", async () => {
    const el = await fixture<YnDrawer>(html`<yn-drawer></yn-drawer>`);
    await el.updateComplete;

    const trigger = el.shadowRoot?.querySelector<HTMLButtonElement>(".trigger-btn");
    if (!trigger) throw new Error("missing default trigger");

    trigger.click();
    await el.updateComplete;
    expect(el.open).to.equal(true);
  });

  it("closes when close button is clicked", async () => {
    const el = await fixture<YnDrawer>(html`<yn-drawer open></yn-drawer>`);
    await el.updateComplete;

    const closeBtn = el.shadowRoot?.querySelector<HTMLElement>(".close-btn");
    if (!closeBtn) throw new Error("missing close button");

    closeBtn.click();
    await el.updateComplete;
    expect(el.open).to.equal(false);
  });

  it("reflects placement and sheet-height attributes", async () => {
    const el = await fixture<YnDrawer>(
      html`<yn-drawer placement="bottom" sheet-height="60vh"></yn-drawer>`,
    );
    expect(el.getAttribute("placement")).to.equal("bottom");
    expect(el.getAttribute("sheet-height")).to.equal("60vh");
  });

  it("renders middle slot panel when content is provided", async () => {
    const el = await fixture<YnDrawer>(html`
      <yn-drawer>
        <div slot="middle">Promo</div>
        <div slot="footer">Footer</div>
      </yn-drawer>
    `);
    await el.updateComplete;
    await new Promise((resolve) => queueMicrotask(() => resolve(undefined)));

    const middle = el.shadowRoot?.querySelector(".panel--middle");
    const bottom = el.shadowRoot?.querySelector(".panel--bottom");
    expect(middle?.classList.contains("panel--empty")).to.equal(false);
    expect(bottom?.classList.contains("panel--empty")).to.equal(false);
    expect(el.querySelector('[slot="middle"]')?.textContent).to.include("Promo");
  });

  it("reflects motion and sheet-expand defaults and overrides", async () => {
    const el = await fixture<YnDrawer>(html`<yn-drawer></yn-drawer>`);
    await el.updateComplete;
    expect(el.motion).to.equal("auto");
    expect(el.sheetExpand).to.equal("snap");
    expect(el.getAttribute("motion")).to.equal("auto");
    expect(el.getAttribute("sheet-expand")).to.equal("snap");

    el.motion = "sheet";
    el.sheetExpand = "none";
    await el.updateComplete;
    expect(el.getAttribute("motion")).to.equal("sheet");
    expect(el.getAttribute("sheet-expand")).to.equal("none");
  });

  it("applies sheet layout host attrs when motion=sheet", async () => {
    const el = await fixture<YnDrawer>(
      html`<yn-drawer motion="sheet" placement="bottom" sheet-height="90vh"></yn-drawer>`,
    );
    await el.updateComplete;
    expect(el.getAttribute("data-yn-motion")).to.equal("sheet");
    expect(el.getAttribute("data-sheet-size")).to.equal("peek");
  });

  it("expands sheet size attribute when setSheetSize is used", async () => {
    const el = await fixture<YnDrawer>(
      html`<yn-drawer motion="sheet" sheet-expand="snap"></yn-drawer>`,
    );
    await el.updateComplete;

    el.setSheetSize("expanded");
    await el.updateComplete;

    expect(el.getAttribute("data-sheet-size")).to.equal("expanded");
  });

  it("caps sheet middle while pinning the stack and scrolls body only when expanded", async () => {
    const el = await fixture<YnDrawer>(html`
      <yn-drawer motion="sheet">
        <div slot="middle">Promo</div>
        <div slot="footer">Footer</div>
      </yn-drawer>
    `);
    await el.updateComplete;
    await new Promise((resolve) => queueMicrotask(() => resolve(undefined)));

    const surface = el.shadowRoot?.querySelector<HTMLElement>(".drawer-surface");
    const stack = el.shadowRoot?.querySelector<HTMLElement>(".drawer-stack");
    const top = el.shadowRoot?.querySelector<HTMLElement>(".panel--top");
    const middle = el.shadowRoot?.querySelector<HTMLElement>(".panel--middle");
    const bottom = el.shadowRoot?.querySelector<HTMLElement>(".panel--bottom");
    const body = el.shadowRoot?.querySelector<HTMLElement>(".body");
    if (!surface || !stack || !top || !middle || !bottom || !body) {
      throw new Error("missing sheet layout elements");
    }

    expect(getComputedStyle(surface).justifyContent).to.equal("flex-end");
    expect(getComputedStyle(stack).marginTop).to.equal("auto");
    expect(getComputedStyle(middle).maxHeight).not.to.equal("none");
    expect(getComputedStyle(top).overflow).to.equal("hidden");
    expect(getComputedStyle(middle).overflow).to.equal("hidden");
    expect(getComputedStyle(bottom).overflow).to.equal("hidden");
    // 未打开前 can-expand 可能尚未按布局测量；打开后短内容只要低于封顶也可展开
    el.show();
    await oneEvent(el, "after-open");
    await el.updateComplete;
    expect(el.getAttribute("data-sheet-can-expand")).to.equal("true");
    expect(getComputedStyle(body).overflow).to.equal("hidden");

    el.setSheetSize("expanded");
    await el.updateComplete;
    expect(getComputedStyle(body).overflow).to.equal("auto");
    expect(stack.getBoundingClientRect().height).to.be.greaterThan(100);
  });

  it("expands short sheet to definite expanded height on setSheetSize", async () => {
    const el = await fixture<YnDrawer>(html`
      <yn-drawer
        motion="sheet"
        placement="bottom"
        sheet-expand="snap"
        sheet-height="auto"
        style="--yn-drawer-sheet-peek-height:40vh"
      >
        <div slot="content">short</div>
      </yn-drawer>
    `);
    await el.updateComplete;
    el.show();
    await oneEvent(el, "after-open");
    await el.updateComplete;

    const stack = el.shadowRoot?.querySelector<HTMLElement>(".drawer-stack");
    if (!stack) throw new Error("missing stack");
    const peekH = stack.getBoundingClientRect().height;

    el.setSheetSize("expanded");
    await el.updateComplete;
    await new Promise((r) => requestAnimationFrame(() => r(undefined)));

    expect(el.getAttribute("data-sheet-size")).to.equal("expanded");
    expect(stack.getBoundingClientRect().height).to.be.greaterThan(peekH + 20);
  });

  it("locks peek body scroll when sheet can still grow", async () => {
    const el = await fixture<YnDrawer>(html`
      <yn-drawer
        motion="sheet"
        placement="bottom"
        sheet-expand="snap"
        style="--yn-drawer-sheet-peek-height:120px"
      >
        <div slot="content" style="height: 2000px">tall</div>
      </yn-drawer>
    `);
    await el.updateComplete;

    el.show();
    await oneEvent(el, "after-open");
    await el.updateComplete;

    const body = el.shadowRoot?.querySelector<HTMLElement>(".body");
    if (!body) throw new Error("missing body");

    expect(el.getAttribute("data-sheet-can-expand")).to.equal("true");
    expect(getComputedStyle(body).overflow).to.equal("hidden");
  });

  it("uses sheet height and allows body scrolling when sheet-expand=none", async () => {
    const el = await fixture<YnDrawer>(html`
      <yn-drawer
        motion="sheet"
        sheet-expand="none"
        sheet-height="75vh"
      ></yn-drawer>
    `);
    await el.updateComplete;

    const stack = el.shadowRoot?.querySelector<HTMLElement>(".drawer-stack");
    const body = el.shadowRoot?.querySelector<HTMLElement>(".body");
    if (!stack || !body) throw new Error("missing sheet layout elements");

    expect(getComputedStyle(stack).maxHeight).to.equal(`${window.innerHeight * 0.75}px`);
    expect(getComputedStyle(body).overflow).to.equal("auto");
  });

  it("renders one shared drawer stack for all panels", async () => {
    const el = await fixture<YnDrawer>(html`<yn-drawer></yn-drawer>`);
    await el.updateComplete;
    const stack = el.shadowRoot?.querySelector(".drawer-stack");
    expect(stack).not.to.equal(null);
    expect(stack?.querySelectorAll(":scope > .panel")).to.have.length(3);
  });

  it("resolves motion=side even on narrow viewport intent", async () => {
    const el = await fixture<YnDrawer>(
      html`<yn-drawer motion="side" placement="bottom"></yn-drawer>`,
    );
    await el.updateComplete;
    expect(el.getResolvedMotion()).to.equal("side");
  });

  it("keeps backdrop-extra content available for motion", async () => {
    const el = await fixture<YnDrawer>(html`
      <yn-drawer>
        <div slot="backdrop-extra">
          <article data-yn-drawer-reco>A</article>
          <article data-yn-drawer-reco>B</article>
        </div>
      </yn-drawer>
    `);
    await el.updateComplete;
    await new Promise((resolve) => queueMicrotask(() => resolve(undefined)));

    const extra = el.shadowRoot?.querySelector(".backdrop-extra");
    expect(extra?.classList.contains("backdrop-extra--empty")).to.equal(false);
    expect(el.querySelectorAll("[data-yn-drawer-reco]").length).to.equal(2);
  });

  it(
    "sheet motion fires lifecycle events and closes the stack vertically",
    async () => {
      const restoreMatchMedia = stubMatchMedia(true);

      try {
        const el = await fixture<YnDrawer>(
          html`<yn-drawer motion="sheet" placement="bottom"></yn-drawer>`,
        );
        await el.updateComplete;

        const opened = oneEvent(el, "after-open");
        el.show();
        await opened;

        const closed = oneEvent(el, "after-close");
        el.close();
        await closed;

        const stack = el.shadowRoot?.querySelector<HTMLElement>(".drawer-stack");
        expect(stack?.style.transform).to.include("110%");
      } finally {
        restoreMatchMedia();
      }
    },
    5000,
  );

  it(
    "rebuilds sheet motion when mode changes while open",
    async () => {
      const restoreMatchMedia = stubMatchMedia(true);

      try {
        const el = await fixture<YnDrawer>(
          html`<yn-drawer motion="side" placement="right"></yn-drawer>`,
        );
        await el.updateComplete;

        const opened = oneEvent(el, "after-open");
        el.show();
        await opened;

        const rebuilt = oneEvent(el, "after-open");
        el.motion = "sheet";
        await el.updateComplete;
        await rebuilt;

        const closed = oneEvent(el, "after-close");
        el.close();
        await closed;

        const stack = el.shadowRoot?.querySelector<HTMLElement>(".drawer-stack");
        expect(stack?.style.transform).to.include("110%");
      } finally {
        restoreMatchMedia();
      }
    },
    5000,
  );

  it("rebuilds resolved motion when motion prop changes while open", async () => {
    const el = await fixture<YnDrawer>(
      html`<yn-drawer motion="side" open></yn-drawer>`,
    );
    await el.updateComplete;
    await oneEvent(el, "after-open").catch(() => undefined);
    el.motion = "sheet";
    await el.updateComplete;
    expect(el.getResolvedMotion()).to.equal("sheet");
    expect(el.getAttribute("data-yn-motion")).to.equal("sheet");
    expect(el.open).to.equal(true);
  });

  it(
    "rebuilds motion=auto across the desktop breakpoint while open",
    async () => {
      const breakpoint = stubDrawerBreakpoint(true);

      try {
        const el = await fixture<YnDrawer>(
          html`<yn-drawer motion="auto" placement="auto"></yn-drawer>`,
        );
        await el.updateComplete;

        const opened = oneEvent(el, "after-open");
        el.show();
        await opened;
        expect(el.getResolvedMotion()).to.equal("side");

        const rebuilt = oneEvent(el, "after-open");
        breakpoint.change(false);
        await rebuilt;

        expect(el.getResolvedMotion()).to.equal("sheet");
        expect(el.getAttribute("data-yn-motion")).to.equal("sheet");
        expect(el.open).to.equal(true);
      } finally {
        breakpoint.restore();
      }
    },
    5000,
  );
});
