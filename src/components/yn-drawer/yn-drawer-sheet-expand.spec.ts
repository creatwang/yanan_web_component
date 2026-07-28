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

  return { stack, body, content, middle, backdrop, controller, onRequestClose, onSizeChange };
}

describe("createYnDrawerSheetExpand", () => {
  it("expands when swiping up on body in peek", async () => {
    const { body, content, backdrop, controller, onSizeChange } = setup();
    backdrop.style.opacity = "1";
    controller.setEnabled(true);
    controller.attach();

    body.dispatchEvent(pointer("pointerdown", 200, content));
    body.dispatchEvent(pointer("pointermove", 80, content));
    body.dispatchEvent(pointer("pointerup", 80, content));
    await wait(480);

    expect(controller.getSize()).to.equal("expanded");
    expect(onSizeChange.mock.calls).to.deep.equal([["expanded"]]);
    expect(backdrop.style.opacity).to.equal("1");
    controller.dispose();
  });

  it("follows finger from measured start height, not CSS peek estimate", () => {
    const { body, content, stack, controller } = setup();
    controller.dispose();
    stack.style.height = "400px";

    const header = stack.querySelector("header")!;
    const middle = stack.children[2] as HTMLElement;
    const bottom = stack.querySelector("footer")!;
    const c = createYnDrawerSheetExpand({
      stack,
      body,
      chrome: [header, middle, bottom],
      canExpand: () => true,
      onSizeChange: () => undefined,
      onRequestClose: () => undefined,
      // 回调估值远大于实测 400px：旧逻辑会先跳到 780 再跟手
      getPeekHeightPx: () => 780,
      getExpandedHeightPx: () => 980
    });
    c.setEnabled(true);
    c.attach();

    body.dispatchEvent(pointer("pointerdown", 300, content));
    body.dispatchEvent(pointer("pointermove", 220, content));

    // 手指上移 80px → 高度应为 400+80，而不是 780+80
    expect(stack.style.height).to.equal("480px");

    body.dispatchEvent(pointer("pointerup", 220, content));
    c.dispose();
  });

  it("closes peek after follow-finger settle past threshold", async () => {
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

  it("springs back when peek dismiss drag is short", async () => {
    const { body, content, stack, backdrop, controller, onRequestClose } = setup();
    backdrop.style.opacity = "1";
    controller.setEnabled(true);
    controller.attach();

    body.dispatchEvent(pointer("pointerdown", 20, content));
    body.dispatchEvent(pointer("pointermove", 50, content));
    body.dispatchEvent(pointer("pointerup", 50, content));
    await wait(400);

    expect(onRequestClose.mock.calls).to.have.length(0);
    expect(stack.style.transform).to.equal("");
    expect(backdrop.style.opacity).to.equal("1");
    controller.dispose();
  });

  it("collapses toward cached peek height for short content-only sheets", async () => {
    const { stack, body, content, controller, onSizeChange } = setup();
    stack.style.height = "220px";
    controller.setEnabled(true);
    controller.attach();
    controller.setSize("expanded"); // 缓存 peek=220
    onSizeChange.mock.calls.length = 0;
    // 模拟展开后 CSS 钉在高位（单测无 host stylesheet）
    stack.style.height = "600px";
    body.scrollTop = 0;

    body.dispatchEvent(pointer("pointerdown", 20, content));
    body.dispatchEvent(pointer("pointermove", 420, content));
    const midH = Number.parseFloat(stack.style.height || "0");
    expect(midH).to.be.closeTo(220, 1);

    body.dispatchEvent(pointer("pointerup", 420, content));
    await wait(480);
    expect(controller.getSize()).to.equal("peek");
    controller.dispose();
  });

  it("collapses expanded to peek with a short pull (not half travel)", async () => {
    const { stack, body, content, controller, onSizeChange } = setup();
    controller.setEnabled(true);
    controller.attach();
    stack.style.height = "220px";
    controller.setSize("expanded");
    onSizeChange.mock.calls.length = 0;
    // 展开后钉在高位：旧逻辑要拖一半行程(~190px)，新逻辑约 88px 内即可吸附
    stack.style.height = "600px";
    body.scrollTop = 0;

    body.dispatchEvent(pointer("pointerdown", 20, content));
    body.dispatchEvent(pointer("pointermove", 100, content)); // 80px
    body.dispatchEvent(pointer("pointerup", 100, content));
    await wait(480);

    expect(controller.getSize()).to.equal("peek");
    expect(onSizeChange.mock.calls).to.deep.equal([["peek"]]);
    controller.dispose();
  });

  it("collapses expanded to peek when pulling down on body at top", async () => {
    const { body, content, controller, onRequestClose, onSizeChange } = setup();
    controller.setEnabled(true);
    controller.setSize("expanded");
    controller.attach();
    onSizeChange.mock.calls.length = 0;
    body.scrollTop = 0;

    body.dispatchEvent(pointer("pointerdown", 20, content));
    body.dispatchEvent(pointer("pointermove", 140, content));
    body.dispatchEvent(pointer("pointerup", 140, content));
    await wait(480);

    expect(controller.getSize()).to.equal("peek");
    expect(onSizeChange.mock.calls).to.deep.equal([["peek"]]);
    expect(onRequestClose.mock.calls).to.have.length(0);
    controller.dispose();
  });

  it("collapses expanded to peek when pulling chrome, then closes from peek", async () => {
    const { middle, controller, onRequestClose } = setup();
    controller.setEnabled(true);
    controller.setSize("expanded");
    controller.attach();

    middle.dispatchEvent(pointer("pointerdown", 10, middle));
    middle.dispatchEvent(pointer("pointermove", 130, middle));
    middle.dispatchEvent(pointer("pointerup", 130, middle));
    await wait(480);

    expect(controller.getSize()).to.equal("peek");
    expect(onRequestClose.mock.calls).to.have.length(0);

    middle.dispatchEvent(pointer("pointerdown", 10, middle));
    middle.dispatchEvent(pointer("pointermove", 130, middle));
    middle.dispatchEvent(pointer("pointerup", 130, middle));
    await wait(360);

    expect(onRequestClose.mock.calls).to.have.length(1);
    controller.dispose();
  });

  it("does not collapse when body is scrolled away from top", async () => {
    const { body, content, controller, onRequestClose, onSizeChange } = setup();
    controller.setEnabled(true);
    controller.setSize("expanded");
    controller.attach();
    onSizeChange.mock.calls.length = 0;
    body.scrollTop = 40;

    body.dispatchEvent(pointer("pointerdown", 20, content));
    body.dispatchEvent(pointer("pointermove", 160, content));
    body.dispatchEvent(pointer("pointerup", 160, content));
    await wait(360);

    expect(controller.getSize()).to.equal("expanded");
    expect(onSizeChange.mock.calls).to.have.length(0);
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
