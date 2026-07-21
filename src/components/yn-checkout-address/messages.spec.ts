import { describe, expect, it } from "vitest";
import { CHECKOUT_ADDRESS_MESSAGES, resolveCheckoutMessages } from "./messages";

describe("resolveCheckoutMessages", () => {
  it("defaults missing keys to en when locale pack is incomplete via override holes", () => {
    const resolved = resolveCheckoutMessages("zh-CN", {
      phoneNumber: "联系电话",
    });
    expect(resolved.phoneNumber).toBe("联系电话");
    expect(resolved.probing).toBe(CHECKOUT_ADDRESS_MESSAGES["zh-CN"].probing);
    expect(resolved.phoneNumberEnterDial).toBe(
      CHECKOUT_ADDRESS_MESSAGES["zh-CN"].phoneNumberEnterDial,
    );
  });

  it("falls back to en for keys omitted from override when locale is en", () => {
    const resolved = resolveCheckoutMessages("en", {
      phoneNumber: "Phone",
    });
    expect(resolved.phoneNumber).toBe("Phone");
    expect(resolved.probing).toBe(CHECKOUT_ADDRESS_MESSAGES.en.probing);
  });

  it("uses en as base under zh-CN so unknown future keys can land on en", () => {
    const enOnlyKey = CHECKOUT_ADDRESS_MESSAGES.en.phoneNumberEnterDial;
    const resolved = resolveCheckoutMessages("zh-CN", {});
    expect(resolved.phoneNumberEnterDial).toBeTruthy();
    expect(typeof enOnlyKey).toBe("string");
  });
});
