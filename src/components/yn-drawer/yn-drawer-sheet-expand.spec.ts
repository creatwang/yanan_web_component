import { expect } from "@open-wc/testing";
import { createYnDrawerSheetExpand } from "./yn-drawer-sheet-expand.js";

function spy() {
  const calls: unknown[][] = [];
  return Object.assign((...args: unknown[]) => {
    calls.push(args);
  }, { mock: { calls } });
}

function pointer(type: string, clientY: number, target: EventTarget) {
  const event = new Event(type, { bubbles: true, cancelable: true, composed: true });
  Object.defineProperty(event, "clientY", { value: clientY });
  Object.defineProperty(event, "pointerId", { value: 1 });
  Object.defineProperty(event, "pointerType", { value: "mouse" });
  Object.defineProperty(event, "target", { value: target });
  const path: EventTarget[] = [target];
  let node: EventTarget | null = target;
  while (node && node instanceof Node && node.parentNode) {
    node = node.parentNode;
    path.push(node);
  }
  Object.defineProperty(event, "composedPath", { value: () => path });
  return event;
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

function setup() {
  const stack = document.createElement("div");
  stack.style.cssText = "height:400px;";
  const header = document.createElement("header");
  const body = document.createElement("div");
  body.style.cssText = "height:40px;overflow:auto;";
  const content = document.createElement("div");
  content.style.height = "240px";
  body.append(content);
  const middle = document.createElement("div");
  const bottom = document.createElement("footer");
  const backdrop = document.createElement("div");
  stack.append(header, body, middle, bottom);
  document.body.append(stack, backdrop);

  const onSizeChange = spy();
  const onRequestClose = spy();
  const controller = createYnDrawerSheetExpand({
    stack,
    body,
    chrome: [header, middle, bottom],
    backdrop,
    onSizeChange,
    onRequestClose,
    canExpand: () => true
  });

  return { stack, body, content, middle, controller, onRequestClose, onSizeChange };
}

describe("createYnDrawerSheetExpand", () => {
  it("expands when swiping up on body in peek", () => {
    const { body, content, controller, onSizeChange } = setup();
    controller.setEnabled(true);
    controller.attach();

    body.dispatchEvent(pointer("pointerdown", 120, content));
    body.dispatchEvent(pointer("pointermove", 60, content));
    body.dispatchEvent(pointer("pointerup", 60, content));

    expect(controller.getSize()).to.equal("expanded");
    expect(onSizeChange.mock.calls).to.deep.equal([["expanded"]]);
    controller.dispose();
  });

  it("follows finger and closes after settle past threshold", async () => {
    const { body, content, stack, controller, onRequestClose } = setup();
    controller.setEnabled(true);
    controller.attach();

    body.dispatchEvent(pointer("pointerdown", 20, content));
    body.dispatchEvent(pointer("pointermove", 140, content));
    expect(stack.style.transform).to.contain("120px");
    expect(onRequestClose.mock.calls).to.have.length(0);

    body.dispatchEvent(pointer("pointerup", 140, content));
    await wait(360);

    expect(onRequestClose.mock.calls).to.have.length(1);
    expect(onRequestClose.mock.calls[0]?.[0]).to.deep.equal({ dragSettled: true });
    controller.dispose();
  });

  it("springs back when dismiss drag is short", async () => {
    const { body, content, stack, controller, onRequestClose } = setup();
    controller.setEnabled(true);
    controller.attach();

    body.dispatchEvent(pointer("pointerdown", 20, content));
    body.dispatchEvent(pointer("pointermove", 50, content));
    body.dispatchEvent(pointer("pointerup", 50, content));
    await wait(400);

    expect(onRequestClose.mock.calls).to.have.length(0);
    expect(stack.style.transform).to.equal("");
    controller.dispose();
  });

  it("does not expand peek when swiping up on chrome", () => {
    const { middle, controller, onSizeChange } = setup();
    controller.setEnabled(true);
    controller.attach();

    middle.dispatchEvent(pointer("pointerdown", 120, middle));
    middle.dispatchEvent(pointer("pointermove", 60, middle));
    middle.dispatchEvent(pointer("pointerup", 60, middle));

    expect(controller.getSize()).to.equal("peek");
    expect(onSizeChange.mock.calls).to.have.length(0);
    controller.dispose();
  });

  it("follows chrome drag and closes after settle", async () => {
    const { middle, stack, controller, onRequestClose } = setup();
    controller.setEnabled(true);
    controller.setSize("expanded");
    controller.attach();

    middle.dispatchEvent(pointer("pointerdown", 10, middle));
    middle.dispatchEvent(pointer("pointermove", 130, middle));
    expect(stack.style.transform).to.contain("px");
    middle.dispatchEvent(pointer("pointerup", 130, middle));
    await wait(360);

    expect(onRequestClose.mock.calls).to.have.length(1);
    controller.dispose();
  });

  it("closes when pulling down on body at scroll top past threshold", async () => {
    const { body, content, controller, onRequestClose } = setup();
    controller.setEnabled(true);
    controller.setSize("expanded");
    controller.attach();
    body.scrollTop = 0;

    body.dispatchEvent(pointer("pointerdown", 20, content));
    body.dispatchEvent(pointer("pointermove", 140, content));
    body.dispatchEvent(pointer("pointerup", 140, content));
    await wait(360);

    expect(onRequestClose.mock.calls).to.have.length(1);
    controller.dispose();
  });

  it("does not close when body is scrolled away from top", async () => {
    const { body, content, controller, onRequestClose } = setup();
    controller.setEnabled(true);
    controller.setSize("expanded");
    controller.attach();
    body.scrollTop = 40;

    body.dispatchEvent(pointer("pointerdown", 20, content));
    body.dispatchEvent(pointer("pointermove", 160, content));
    body.dispatchEvent(pointer("pointerup", 160, content));
    await wait(360);

    expect(onRequestClose.mock.calls).to.have.length(0);
    controller.dispose();
  });

  it("keeps body scrollable while expanded", () => {
    const { body, controller } = setup();
    controller.setEnabled(true);
    controller.setSize("expanded");
    controller.attach();

    expect(body.scrollHeight).to.be.greaterThan(body.clientHeight);
    body.scrollTop = 50;
    expect(body.scrollTop).to.equal(50);
    controller.dispose();
  });
});
