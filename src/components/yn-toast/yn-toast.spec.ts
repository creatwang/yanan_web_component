import { fixture, expect, html } from "@open-wc/testing";
import "./yn-toast";
import type { YnToast, YnToastShortcutController } from "./yn-toast";

const nextFrame = () =>
  new Promise<void>((resolve) => {
    window.setTimeout(resolve, 0);
  });

const finishRender = async (toast: YnToast) => {
  await nextFrame();
  await toast.updateComplete;
};

const getPill = (toast: YnToast) => toast.shadowRoot?.querySelector<HTMLElement>(".pill");
const getMessage = (toast: YnToast) => toast.shadowRoot?.querySelector<HTMLElement>(".msg");
const getMask = (toast: YnToast) => toast.shadowRoot?.querySelector<HTMLElement>(".mask");

const waitForToastState = async (toast: YnToast, variant: string, message: string) => {
  const start = performance.now();
  while (performance.now() - start < 1000) {
    await finishRender(toast);
    if (
      getPill(toast)?.dataset.phase === "success" &&
      getPill(toast)?.dataset.variant === variant &&
      getMessage(toast)?.textContent?.includes(message)
    ) {
      return;
    }
  }
  throw new Error(`等待 ${variant} 状态超时：${message}`);
};

const expectToastState = (toast: YnToast, variant: string, message: string) => {
  expect(getPill(toast)?.dataset.phase).to.equal("success");
  expect(getPill(toast)?.dataset.variant).to.equal(variant);
  expect(getMessage(toast)?.textContent).to.contain(message);
};

describe("yn-toast", () => {
  it("does not show mask for shortcut async callback by default", async () => {
    const toast = await fixture<YnToast>(html`<yn-toast></yn-toast>`);
    let completeTask!: () => void;

    const result = toast.success(async (instance) => {
      await new Promise<void>((resolve) => {
        completeTask = resolve;
      });
      instance.done("async done", { persist: true });
      return "result";
    });

    await toast.updateComplete;
    expect(getMask(toast)).to.equal(null);

    completeTask();
    expect(await result).to.equal("result");
    await waitForToastState(toast, "success", "async done");
    expectToastState(toast, "success", "async done");
    toast.hide();
  });

  it("shows mask only when shortcut async callback passes true", async () => {
    const toast = await fixture<YnToast>(html`<yn-toast></yn-toast>`);
    let completeTask!: () => void;

    const result = toast.success(async (instance) => {
      await new Promise<void>((resolve) => {
        completeTask = resolve;
      });
      instance.done("masked done", { persist: true });
      return "masked-result";
    }, true);

    await toast.updateComplete;
    expect(getMask(toast)).to.not.equal(null);

    completeTask();
    expect(await result).to.equal("masked-result");
    await waitForToastState(toast, "success", "masked done");
    expect(getMask(toast)).to.equal(null);
    expectToastState(toast, "success", "masked done");
    toast.hide();
  });

  it("supports show() followed by public done()", async () => {
    const toast = await fixture<YnToast>(html`<yn-toast></yn-toast>`);

    await toast.show();
    await toast.updateComplete;
    expect(getPill(toast)?.dataset.phase).to.equal("loading");

    toast.done("warning", "external done", { persist: true });
    await waitForToastState(toast, "warning", "external done");

    expectToastState(toast, "warning", "external done");
    toast.hide();
  });

  it("ignores stale done() calls from an older async task", async () => {
    const toast = await fixture<YnToast>(html`<yn-toast></yn-toast>`);
    let oldController!: YnToastShortcutController;
    let finishOldTask!: () => void;

    const oldResult = toast.success(async (instance) => {
      oldController = instance;
      await new Promise<void>((resolve) => {
        finishOldTask = resolve;
      });
      return "old-result";
    });
    await toast.updateComplete;

    await toast.info("new message", { persist: true, loadingDuration: 0 });
    await waitForToastState(toast, "info", "new message");
    expectToastState(toast, "info", "new message");

    oldController.done("old message", { persist: true });
    finishOldTask();
    expect(await oldResult).to.equal("old-result");
    await finishRender(toast);

    expectToastState(toast, "info", "new message");
    toast.hide();
  });

  it("renders html message fragments", async () => {
    const toast = await fixture<YnToast>(html`<yn-toast></yn-toast>`);

    await toast.success('saved <strong class="flag">successfully</strong>', { persist: true, loadingDuration: 0 });
    await waitForToastState(toast, "success", "saved successfully");

    expect(toast.shadowRoot?.querySelector(".msg .flag")?.textContent).to.equal("successfully");
    toast.hide();
  });
});
