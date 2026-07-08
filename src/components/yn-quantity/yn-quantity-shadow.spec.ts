import { describe, expect, it } from "vitest";
import { renderYnQuantityShadowHtml } from "./yn-quantity-shadow.js";

describe("renderYnQuantityShadowHtml", () => {
  it("outputs stepper with clamped value and svg buttons", () => {
    const html = renderYnQuantityShadowHtml({
      value: 120,
      min: 1,
      max: 99,
    });

    expect(html).toContain("<style>");
    expect(html).toContain('class="stepper"');
    expect(html).toContain('class="value"');
    expect(html).toContain('value="99"');
    expect(html).toContain('aria-label="减少数量"');
    expect(html).toContain('aria-label="增加数量"');
    expect(html).toContain("<svg");
  });

  it("disables decrease at min and marks disabled stepper", () => {
    const html = renderYnQuantityShadowHtml({
      value: 1,
      min: 1,
      disabled: true,
    });
    expect(html).toContain('class="stepper is-disabled"');
    expect(html).toMatch(/btn-decrease"[^>]* disabled/);
  });
});
