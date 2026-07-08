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
    expect(html).toContain('slot name="prefix-button"');
    expect(html).toContain('slot name="suffix-button"');
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
      inputId: "auth-email",
    });

    expect(html).toContain('class="field-wrap field-wrap--floating"');
    expect(html).toContain('class="float-label"');
    expect(html).toContain("Email Address *");
    expect(html).toContain('name="email"');
    expect(html).toContain('for="auth-email"');
  });
});
