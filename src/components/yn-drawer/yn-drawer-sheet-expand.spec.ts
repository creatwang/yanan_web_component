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

  it("requests close from expanded at scroll top after pulling down over 50px", () => {
    const { stack, body, controller, onRequestClose } = setup();
    controller.setEnabled(true);
    controller.setSize("expanded");
    controller.attach();
    body.scrollTop = 0;

    expect(body.style.touchAction).to.equal("pan-up");
    stack.dispatchEvent(pointer("pointerdown", 20));
    stack.dispatchEvent(pointer("pointermove", 71));
    stack.dispatchEvent(pointer("pointerup", 71));

    expect(onRequestClose.mock.calls).to.have.length(1);
    expect(controller.getSize()).to.equal("expanded");
    controller.dispose();
  });

  it("allows vertical touch scrolling only while expanded content is away from top", () => {
    const { body, controller } = setup();
    controller.setEnabled(true);
    controller.setSize("expanded");
    controller.attach();

    expect(body.style.touchAction).to.equal("pan-up");
    body.scrollTop = 1;
    body.dispatchEvent(new Event("scroll"));
    expect(body.style.touchAction).to.equal("pan-y");

    body.scrollTop = 0;
    body.dispatchEvent(new Event("scroll"));
    expect(body.style.touchAction).to.equal("pan-up");
    controller.dispose();
  });

  it("does not request close while expanded body is scrolled", () => {
    const { stack, body, controller, onRequestClose } = setup();
    controller.setEnabled(true);
    controller.setSize("expanded");
    controller.attach();
    body.scrollTop = 1;

    stack.dispatchEvent(pointer("pointerdown", 20));
    stack.dispatchEvent(pointer("pointerup", 100));

    expect(onRequestClose.mock.calls).to.have.length(0);
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
