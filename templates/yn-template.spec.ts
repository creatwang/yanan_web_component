import { fixture, expect, html } from "@open-wc/testing";
import "../src/components/yn-button";
import type { YnButton } from "../src/components/yn-button";

/**
 * 测试模板：
 * - 复制后改成 yn-xxx.spec.ts
 * - 将导入改为目标组件
 * - 至少保留“渲染测试 + 事件测试”两个 case
 */
describe("yn-template", () => {
  it("renders label", async () => {
    const el = await fixture<YnButton>(html`<yn-button label="确认"></yn-button>`);
    const button = el.shadowRoot?.querySelector("button");
    expect(button?.textContent?.trim()).to.equal("确认");
  });

  it("emits custom event", async () => {
    const el = await fixture<YnButton>(html`<yn-button></yn-button>`);
    let emitted = false;
    el.addEventListener("yn-click", () => {
      emitted = true;
    });

    el.shadowRoot?.querySelector("button")?.click();
    expect(emitted).to.equal(true);
  });
});
