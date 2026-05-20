import { describe, expect, it } from "vitest";
import { CHECKOUT_ADDRESS_MESSAGES } from "./messages";
import { validateCheckoutAddress } from "./validation";

const base = () => ({
  provider: "dr5hn" as const,
  isDr5hn: true,
  countryCode: "AE",
  cityName: "Dubai",
  cityId: 1,
  dr5hnRegionLevel: "city" as const,
  phoneNumber: "501234567",
  line1: "Sheikh Zayed Rd 1",
  postalCode: "",
  email: "buyer@shop.com",
  showEmail: true,
  emailRequired: true,
  regionFilter: undefined,
  messages: CHECKOUT_ADDRESS_MESSAGES.en,
});

describe("validateCheckoutAddress", () => {
  it("passes when dr5hn city-level and contact filled", () => {
    const r = validateCheckoutAddress(base());
    expect(r.valid).toBe(true);
    expect(r.formReady).toBe(true);
  });

  it("fails when dr5hn only country level", () => {
    const r = validateCheckoutAddress({
      ...base(),
      cityId: null,
      dr5hnRegionLevel: "country",
    });
    expect(r.valid).toBe(false);
    expect(r.errors.some((e) => e.code === "REGION_CITY_LEVEL_REQUIRED")).toBe(true);
  });

  it("requires postal for US and blocks formReady until filled", () => {
    const r = validateCheckoutAddress({
      ...base(),
      countryCode: "US",
      isDr5hn: false,
      dr5hnRegionLevel: null,
    });
    expect(r.errors.some((e) => e.code === "POSTAL_REQUIRED")).toBe(true);
    expect(r.valid).toBe(false);
    expect(r.formReady).toBe(false);

    const ok = validateCheckoutAddress({
      ...base(),
      countryCode: "US",
      isDr5hn: false,
      dr5hnRegionLevel: null,
      postalCode: "10001",
    });
    expect(ok.valid).toBe(true);
    expect(ok.formReady).toBe(true);
  });

  it("keeps postal optional for AE in formReady", () => {
    const r = validateCheckoutAddress(base());
    expect(r.formReady).toBe(true);
    expect(r.valid).toBe(true);
  });

  it("rejects invalid email when required", () => {
    const r = validateCheckoutAddress({
      ...base(),
      email: "not-an-email",
    });
    expect(r.errors.some((e) => e.code === "EMAIL_INVALID")).toBe(true);
  });
});
