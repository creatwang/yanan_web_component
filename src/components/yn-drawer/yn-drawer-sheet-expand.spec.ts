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

function pointer(type: string, clientY: number) {
  const event = new Event(type, { bubbles: true, cancelable: true });
  Object.defineProperty(event, "clientY", { value: clientY });
  Object.defineProperty(event, "pointerId", { value: 1 });
  Object.defineProperty(event, "pointerType", { value: "touch" });
  return event;
}

function setup(canExpand = true) {
  const stack = document.createElement("div");
  const body = document.createElement("div");
  body.style.cssText = "height: 10px; overflow: auto;";
  const content = document.createElement("div");
  content.style.height = "100px";
  body.append(content);
  stack.append(body);
  const onSizeChange = spy();
  const onRequestClose = spy();
  document.body.append(stack);

  const controller = createYnDrawerSheetExpand({
    stack,
    body,
    onSizeChange,
    onRequestClose,
    canExpand: () => canExpand
  });

  return { stack, body, controller, onRequestClose, onSizeChange };
}

describe("createYnDrawerSheetExpand", () => {
  it("keeps setSize and getSize synchronized", () => {
    const { controller, onSizeChange } = setup();

    controller.setSize("expanded");

    expect(controller.getSize()).to.equal("expanded");
    expect(onSizeChange.mock.calls).to.deep.equal([["expanded"]]);
    controller.dispose();
  });

  it("does not react to gestures while disabled", () => {
    const { stack, controller, onRequestClose, onSizeChange } = setup();
    controller.attach();
    controller.setEnabled(false);

    stack.dispatchEvent(pointer("pointerdown", 100));
    stack.dispatchEvent(pointer("pointerup", 40));

    expect(controller.getSize()).to.equal("peek");
    expect(onSizeChange.mock.calls).to.have.length(0);
    expect(onRequestClose.mock.calls).to.have.length(0);
    controller.dispose();
  });

  it("expands peek after an upward drag beyond 40px", () => {
    const { stack, body, controller, onSizeChange } = setup();
    controller.setEnabled(true);
    controller.attach();

    expect(body.style.touchAction).to.equal("none");
    expect(stack.style.touchAction).to.equal("none");
    stack.dispatchEvent(pointer("pointerdown", 100));
    stack.dispatchEvent(pointer("pointermove", 59));
    stack.dispatchEvent(pointer("pointerup", 59));

    expect(controller.getSize()).to.equal("expanded");
    expect(onSizeChange.mock.calls).to.have.length(1);
    // expanded 清掉 inline touch-action，交给 CSS pan-y
    expect(body.style.touchAction).to.equal("");
    controller.dispose();
  });

  it("closes peek after a downward drag beyond 50px", () => {
    const { stack, controller, onRequestClose, onSizeChange } = setup();
    controller.setEnabled(true);
    controller.attach();

    stack.dispatchEvent(pointer("pointerdown", 20));
    stack.dispatchEvent(pointer("pointermove", 80));
    stack.dispatchEvent(pointer("pointerup", 80));

    expect(onRequestClose.mock.calls).to.have.length(1);
    expect(controller.getSize()).to.equal("peek");
    expect(onSizeChange.mock.calls).to.have.length(0);
    controller.dispose();
  });

  it("does not expand when content cannot expand", () => {
    const { stack, body, controller, onSizeChange } = setup(false);
    controller.setEnabled(true);
    controller.attach();

    expect(body.style.touchAction).to.equal("pan-y");
    stack.dispatchEvent(pointer("pointerdown", 100));
    stack.dispatchEvent(pointer("pointerup", 0));

    expect(controller.getSize()).to.equal("peek");
    expect(onSizeChange.mock.calls).to.have.length(0);
    controller.dispose();
  });

  it("expands peek after an upward wheel gesture beyond 40px", () => {
    const { stack, controller, onSizeChange } = setup();
    controller.setEnabled(true);
    controller.attach();

    stack.dispatchEvent(new WheelEvent("wheel", { deltaY: -41, bubbles: true }));

    expect(controller.getSize()).to.equal("expanded");
    expect(onSizeChange.mock.calls).to.have.length(1);
    controller.dispose();
  });

  it("collapses expanded to peek after pulling down over 50px at scroll top", () => {
    const { stack, body, controller, onSizeChange, onRequestClose } = setup();
    controller.setEnabled(true);
    controller.setSize("expanded");
    onSizeChange.mock.calls.length = 0;
    controller.attach();
    body.scrollTop = 0;

    stack.dispatchEvent(pointer("pointerdown", 20));
    stack.dispatchEvent(pointer("pointermove", 80));
    stack.dispatchEvent(pointer("pointerup", 80));

    expect(controller.getSize()).to.equal("peek");
    expect(onSizeChange.mock.calls).to.deep.equal([["peek"]]);
    expect(onRequestClose.mock.calls).to.have.length(0);
    controller.dispose();
  });

  it("does not collapse while expanded body is scrolled", () => {
    const { stack, body, controller, onSizeChange } = setup();
    controller.setEnabled(true);
    controller.setSize("expanded");
    onSizeChange.mock.calls.length = 0;
    controller.attach();
    body.scrollTop = 1;

    stack.dispatchEvent(pointer("pointerdown", 20));
    stack.dispatchEvent(pointer("pointermove", 100));
    stack.dispatchEvent(pointer("pointerup", 100));

    expect(controller.getSize()).to.equal("expanded");
    expect(onSizeChange.mock.calls).to.have.length(0);
    controller.dispose();
  });

  it("detaches gesture listeners", () => {
    const { stack, controller, onSizeChange } = setup();
    controller.setEnabled(true);
    controller.attach();
    controller.detach();

    stack.dispatchEvent(pointer("pointerdown", 100));
    stack.dispatchEvent(pointer("pointerup", 0));

    expect(onSizeChange.mock.calls).to.have.length(0);
    controller.dispose();
  });
});
