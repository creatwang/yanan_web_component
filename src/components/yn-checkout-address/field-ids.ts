import type { YnCheckoutAddressField } from "./types";

export type CheckoutFieldSet = "google" | "dr5hn" | "manual";

const EMAIL_ID = "yn-ca-email";

/** 各数据源下的表单 input id（渲染与 reportValidity 共用） */
export const CHECKOUT_FIELD_IDS = {
  google: {
    region: "yn-ca-address",
    firstName: "yn-ca-first-name",
    lastName: "yn-ca-last-name",
    phone: "yn-ca-phone",
    line1: "yn-ca-line1",
    line2: "yn-ca-line2",
    zip: "yn-ca-zip",
    notes: "yn-ca-notes",
  },
  dr5hn: {
    region: "yn-ca-region",
    firstName: "yn-ca-d-first-name",
    lastName: "yn-ca-d-last-name",
    phone: "yn-ca-d-phone",
    line1: "yn-ca-d-line1",
    line2: "yn-ca-d-line2",
    zip: "yn-ca-d-zip",
    notes: "yn-ca-d-notes",
  },
  manual: {
    region: "yn-ca-m-country-code",
    firstName: "yn-ca-m-first-name",
    lastName: "yn-ca-m-last-name",
    phone: "yn-ca-m-phone",
    line1: "yn-ca-m-line1",
    line2: "yn-ca-m-line2",
    zip: "yn-ca-m-zip",
    notes: "yn-ca-m-notes",
  },
} as const;

export const CHECKOUT_FOCUS_IDS: Record<
  CheckoutFieldSet,
  Record<YnCheckoutAddressField, string>
> = {
  google: {
    region: CHECKOUT_FIELD_IDS.google.region,
    firstName: CHECKOUT_FIELD_IDS.google.firstName,
    lastName: CHECKOUT_FIELD_IDS.google.lastName,
    phoneNumber: CHECKOUT_FIELD_IDS.google.phone,
    line1: CHECKOUT_FIELD_IDS.google.line1,
    postalCode: CHECKOUT_FIELD_IDS.google.zip,
    email: EMAIL_ID,
  },
  dr5hn: {
    region: CHECKOUT_FIELD_IDS.dr5hn.region,
    firstName: CHECKOUT_FIELD_IDS.dr5hn.firstName,
    lastName: CHECKOUT_FIELD_IDS.dr5hn.lastName,
    phoneNumber: CHECKOUT_FIELD_IDS.dr5hn.phone,
    line1: CHECKOUT_FIELD_IDS.dr5hn.line1,
    postalCode: CHECKOUT_FIELD_IDS.dr5hn.zip,
    email: EMAIL_ID,
  },
  manual: {
    region: CHECKOUT_FIELD_IDS.manual.region,
    firstName: CHECKOUT_FIELD_IDS.manual.firstName,
    lastName: CHECKOUT_FIELD_IDS.manual.lastName,
    phoneNumber: CHECKOUT_FIELD_IDS.manual.phone,
    line1: CHECKOUT_FIELD_IDS.manual.line1,
    postalCode: CHECKOUT_FIELD_IDS.manual.zip,
    email: EMAIL_ID,
  },
};
