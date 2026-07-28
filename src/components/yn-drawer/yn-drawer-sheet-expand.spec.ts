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
  it("expands peek after an upward drag beyond 40px", () => {
    const { stack, body, controller, onSizeChange } = setup();
    controller.setEnabled(true);
    controller.attach();

    expect(body.style.touchAction).to.equal("none");
    stack.dispatchEvent(pointer("pointerdown", 100));
    stack.dispatchEvent(pointer("pointermove", 59));
    stack.dispatchEvent(pointer("pointerup", 59));

    expect(controller.getSize()).to.equal("expanded");
    expect(onSizeChange.mock.calls).to.have.length(1);
    expect(body.style.touchAction).to.equal("pan-up");
    controller.dispose();
  });

  it("closes peek after a downward drag beyond 50px", () => {
    const { stack, controller, onRequestClose } = setup();
    controller.setEnabled(true);
    controller.attach();

    stack.dispatchEvent(pointer("pointerdown", 20));
    stack.dispatchEvent(pointer("pointermove", 80));
    stack.dispatchEvent(pointer("pointerup", 80));

    expect(onRequestClose.mock.calls).to.have.length(1);
    controller.dispose();
  });

  it("closes expanded after pulling down over 50px at scroll top", () => {
    const { stack, body, controller, onRequestClose } = setup();
    controller.setEnabled(true);
    controller.setSize("expanded");
    controller.attach();
    body.scrollTop = 0;

    expect(body.style.touchAction).to.equal("pan-up");
    stack.dispatchEvent(pointer("pointerdown", 20));
    stack.dispatchEvent(pointer("pointermove", 80));
    stack.dispatchEvent(pointer("pointerup", 80));

    expect(onRequestClose.mock.calls).to.have.length(1);
    controller.dispose();
  });

  it("does not prevent upward moves at expanded top (scroll can start)", () => {
    const { stack, body, controller, onRequestClose } = setup();
    controller.setEnabled(true);
    controller.setSize("expanded");
    controller.attach();
    body.scrollTop = 0;

    const move = pointer("pointermove", 0);
    let prevented = false;
    move.preventDefault = () => {
      prevented = true;
    };

    stack.dispatchEvent(pointer("pointerdown", 40));
    stack.dispatchEvent(move);
    stack.dispatchEvent(pointer("pointerup", 0));

    expect(prevented).to.equal(false);
    expect(onRequestClose.mock.calls).to.have.length(0);
    controller.dispose();
  });

  it("switches to pan-y after expanded body scrolls away from top", () => {
    const { body, controller } = setup();
    controller.setEnabled(true);
    controller.setSize("expanded");
    controller.attach();

    expect(body.style.touchAction).to.equal("pan-up");
    body.scrollTop = 1;
    body.dispatchEvent(new Event("scroll"));
    expect(body.style.touchAction).to.equal("pan-y");
    controller.dispose();
  });

  it("ignores touch-typed pointer events (touch channel owns mobile)", () => {
    const { stack, controller, onSizeChange } = setup();
    controller.setEnabled(true);
    controller.attach();

    stack.dispatchEvent(pointer("pointerdown", 100, "touch"));
    stack.dispatchEvent(pointer("pointermove", 50, "touch"));
    stack.dispatchEvent(pointer("pointerup", 50, "touch"));

    expect(onSizeChange.mock.calls).to.have.length(0);
    controller.dispose();
  });

  it("expands via touchmove upward", () => {
    const { stack, controller, onSizeChange } = setup();
    controller.setEnabled(true);
    controller.attach();

    const start = new Event("touchstart", { bubbles: true, cancelable: true });
    Object.defineProperty(start, "touches", {
      value: [{ clientY: 100 }]
    });
    const move = new Event("touchmove", { bubbles: true, cancelable: true });
    Object.defineProperty(move, "touches", {
      value: [{ clientY: 50 }]
    });
    const end = new Event("touchend", { bubbles: true, cancelable: true });

    stack.dispatchEvent(start);
    stack.dispatchEvent(move);
    stack.dispatchEvent(end);

    expect(controller.getSize()).to.equal("expanded");
    expect(onSizeChange.mock.calls.length).to.be.greaterThan(0);
    controller.dispose();
  });

  it("detaches gesture listeners", () => {
    const { stack, controller, onRequestClose } = setup();
    controller.setEnabled(true);
    controller.attach();
    controller.detach();

    stack.dispatchEvent(pointer("pointerdown", 20));
    stack.dispatchEvent(pointer("pointerup", 100));

    expect(onRequestClose.mock.calls).to.have.length(0);
    controller.dispose();
  });
});
