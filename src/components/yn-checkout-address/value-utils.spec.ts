import { describe, expect, it } from "vitest";
import { diffCheckoutValueKeys } from "./value-utils";
import { emptyCheckoutAddressValue } from "./types";

describe("diffCheckoutValueKeys", () => {
  it("reports single field change", () => {
    const prev = emptyCheckoutAddressValue();
    const next = { ...prev, firstName: "Ada" };
    expect(diffCheckoutValueKeys(prev, next)).toEqual(["firstName"]);
  });

  it("reports multiple region fields when selecting area", () => {
    const prev = emptyCheckoutAddressValue();
    const next = {
      ...prev,
      countryCode: "AU",
      countryName: "Australia",
      cityName: "Sydney",
      regionComplete: true,
    };
    const changed = diffCheckoutValueKeys(prev, next);
    expect(changed).toContain("countryCode");
    expect(changed).toContain("cityName");
    expect(changed).toContain("regionComplete");
  });
});
