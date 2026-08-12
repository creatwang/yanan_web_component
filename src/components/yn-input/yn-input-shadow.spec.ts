import { describe, expect, it } from "vitest";
import { renderYnInputShadowHtml } from "./yn-input-shadow.js";

describe("renderYnInputShadowHtml", () => {
  it("outputs field shell with placeholder and shared styles", () => {
    const html = renderYnInputShadowHtml({
      placeholder: "搜索",
      value: "floema",
    });

    expect(html).toContain("<style>");
    expect(html).toContain('class="field"');
    expect(html).toContain('class="input"');
    expect(html).toContain('placeholder="搜索"');
    expect(html).toContain('value="floema"');
    // Lit SSR 可能把属性拆到多行：`<slot\n  name="prefix-button"`
    expect(html).toContain('name="prefix-button"');
    expect(html).toContain('name="suffix-button"');
  });

  it("marks disabled state on field and input", () => {
    const html = renderYnInputShadowHtml({ disabled: true });
    expect(html).toContain('class="field is-disabled"');
    expect(html).toContain(" disabled");
  });

  it("renders floating label shell for auth fields", () => {
    const html = renderYnInputShadowHtml({
      variant: "floating",
      label: "Email Address *",
      name: "email",
      type: "email",
    });

    expect(html).toContain('class="field-wrap field-wrap--floating"');
    expect(html).toContain('class="float-label"');
    expect(html).toContain("Email Address *");
    expect(html).toContain('name="email"');
    // 组件内部自增 id（yn-input-N），label.for 与 input.id 对齐
    expect(html).toMatch(/for="yn-input-\d+"/);
    expect(html).toMatch(/id="yn-input-\d+"/);
  });
});
