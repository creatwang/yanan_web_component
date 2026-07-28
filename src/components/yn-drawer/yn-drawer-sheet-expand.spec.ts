import { expect } from "@open-wc/testing";
import { createYnDrawerSheetExpand } from "./yn-drawer-sheet-expand.js";

function spy() {
  const calls: unknown[][] = [];
  return Object.assign(
    (...args: unknown[]) => {
      calls.push(args);
    },
    { mock: { calls } }
  );
}

function pointer(type: string, clientY: number, pointerType = "mouse") {
  const event = new Event(type, { bubbles: true, cancelable: true });
  Object.defineProperty(event, "clientY", { value: clientY });
  Object.defineProperty(event, "pointerId", { value: 1 });
  Object.defineProperty(event, "pointerType", { value: pointerType });
  return event;
}

function setup(canExpand = true) {
  const stack = document.createElement("div");
  const handle = document.createElement("header");
  const body = document.createElement("div");
  body.style.cssText = "height: 40px; overflow: auto;";
  const content = document.createElement("div");
  content.style.height = "200px";
  body.append(content);
  stack.append(handle, body);
  document.body.append(stack);

  const onSizeChange = spy();
  const onRequestClose = spy();
  const controller = createYnDrawerSheetExpand({
    stack,
    body,
    handle,
    onSizeChange,
    onRequestClose,
    canExpand: () => canExpand
  });

  return { stack, handle, body, controller, onRequestClose, onSizeChange };
}

describe("createYnDrawerSheetExpand", () => {
  it("expands peek from stack upward drag", () => {
    const { stack, body, controller, onSizeChange } = setup();
    controller.setEnabled(true);
    controller.attach();

    expect(body.style.touchAction).to.equal("none");
    stack.dispatchEvent(pointer("pointerdown", 100));
    stack.dispatchEvent(pointer("pointermove", 50));
    stack.dispatchEvent(pointer("pointerup", 50));

    expect(controller.getSize()).to.equal("expanded");
    expect(onSizeChange.mock.calls).to.deep.equal([["expanded"]]);
    expect(body.style.touchAction).to.equal("pan-y");
    controller.dispose();
  });

  it("closes peek from stack downward drag", () => {
    const { stack, controller, onRequestClose } = setup();
    controller.setEnabled(true);
    controller.attach();

    stack.dispatchEvent(pointer("pointerdown", 20));
    stack.dispatchEvent(pointer("pointermove", 90));
    stack.dispatchEvent(pointer("pointerup", 90));

    expect(onRequestClose.mock.calls).to.have.length(1);
    controller.dispose();
  });

  it("closes expanded only from handle downward drag", () => {
    const { stack, handle, body, controller, onRequestClose } = setup();
    controller.setEnabled(true);
    controller.setSize("expanded");
    controller.attach();

    expect(body.style.touchAction).to.equal("pan-y");
    expect(handle.style.touchAction).to.equal("none");

    // body 区域拖拽不应关闭
    stack.dispatchEvent(pointer("pointerdown", 20));
    stack.dispatchEvent(pointer("pointermove", 100));
    stack.dispatchEvent(pointer("pointerup", 100));
    expect(onRequestClose.mock.calls).to.have.length(0);

    // header 下拉关闭
    handle.dispatchEvent(pointer("pointerdown", 20));
    handle.dispatchEvent(pointer("pointermove", 100));
    handle.dispatchEvent(pointer("pointerup", 100));
    expect(onRequestClose.mock.calls).to.have.length(1);
    controller.dispose();
  });

  it("does not steal body scrolling while expanded", () => {
    const { body, controller } = setup();
    controller.setEnabled(true);
    controller.setSize("expanded");
    controller.attach();

    expect(body.style.touchAction).to.equal("pan-y");
    expect(body.scrollHeight).to.be.greaterThan(body.clientHeight);
    body.scrollTop = 30;
    expect(body.scrollTop).to.equal(30);
    controller.dispose();
  });

  it("detaches listeners", () => {
    const { stack, handle, controller, onRequestClose, onSizeChange } = setup();
    controller.setEnabled(true);
    controller.attach();
    controller.detach();

    stack.dispatchEvent(pointer("pointerdown", 100));
    stack.dispatchEvent(pointer("pointerup", 40));
    handle.dispatchEvent(pointer("pointerdown", 20));
    handle.dispatchEvent(pointer("pointerup", 100));

    expect(onSizeChange.mock.calls).to.have.length(0);
    expect(onRequestClose.mock.calls).to.have.length(0);
    controller.dispose();
  });
});
