import { describe, expect, it } from "vitest";
import "./yn-checkout-address";
import { emptyCheckoutAddressValue } from "./types";

describe("yn-checkout-address", () => {
  it("registers custom element", () => {
    expect(customElements.get("yn-checkout-address")).toBeDefined();
  });

  it("emptyCheckoutAddressValue has stable defaults", () => {
    const v = emptyCheckoutAddressValue();
    expect(v.provider).toBeNull();
    expect(v.formReady).toBe(false);
    expect(v.countryCode).toBe("");
    expect(v.email).toBe("");
    expect(v.whatsapp).toBe("");
  });
});
