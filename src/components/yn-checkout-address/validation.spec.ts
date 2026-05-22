import { describe, expect, it } from "vitest";
import { CHECKOUT_ADDRESS_MESSAGES } from "./messages";
import { validateCheckoutAddress } from "./validation";

const base = () => ({
  provider: "dr5hn" as const,
  isDr5hn: true,
  isManual: false,
  countryCode: "AE",
  countryName: "United Arab Emirates",
  stateName: "Dubai",
  cityName: "Dubai",
  cityId: 1,
  dr5hnRegionLevel: "city" as const,
  firstName: "Layla",
  lastName: "Al Mansoori",
  phoneNumber: "501234567",
  line1: "Sheikh Zayed Rd 1",
  postalCode: "",
  email: "buyer@shop.com",
  showEmail: true,
  emailRequired: true,
  whatsapp: "",
  showWhatsapp: false,
  whatsappRequired: false,
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

  it("passes manual mode when country, state, and city are filled", () => {
    const r = validateCheckoutAddress({
      ...base(),
      provider: "manual",
      isDr5hn: false,
      isManual: true,
      countryCode: "AE",
      countryName: "United Arab Emirates",
      stateName: "Dubai",
      cityName: "Dubai",
      cityId: null,
      dr5hnRegionLevel: null,
    });
    expect(r.valid).toBe(true);
    expect(r.regionComplete).toBe(true);
  });

  it("requires full manual region", () => {
    const r = validateCheckoutAddress({
      ...base(),
      provider: "manual",
      isDr5hn: false,
      isManual: true,
      countryCode: "AE",
      countryName: "UAE",
      stateName: "",
      cityName: "Dubai",
      cityId: null,
      dr5hnRegionLevel: null,
    });
    expect(r.valid).toBe(false);
    expect(r.errors.some((e) => e.code === "REGION_REQUIRED")).toBe(true);
  });

  it("requires first and last name", () => {
    const r = validateCheckoutAddress({
      ...base(),
      firstName: "",
      lastName: "  ",
    });
    expect(r.valid).toBe(false);
    expect(r.errors.some((e) => e.code === "FIRST_NAME_REQUIRED")).toBe(true);
    expect(r.errors.some((e) => e.code === "LAST_NAME_REQUIRED")).toBe(true);
    expect(r.formReady).toBe(false);
  });

  it("rejects invalid email when required", () => {
    const r = validateCheckoutAddress({
      ...base(),
      email: "not-an-email",
    });
    expect(r.errors.some((e) => e.code === "EMAIL_INVALID")).toBe(true);
  });

  it("rejects invalid whatsapp when required", () => {
    const r = validateCheckoutAddress({
      ...base(),
      showWhatsapp: true,
      whatsappRequired: true,
      whatsapp: "12",
    });
    expect(r.errors.some((e) => e.code === "WHATSAPP_INVALID")).toBe(true);
  });

  it("requires whatsapp when show-whatsapp and whatsapp-required", () => {
    const r = validateCheckoutAddress({
      ...base(),
      showWhatsapp: true,
      whatsappRequired: true,
      whatsapp: "",
    });
    expect(r.errors.some((e) => e.code === "WHATSAPP_REQUIRED")).toBe(true);
  });
});
