import { passesCountryFilter } from "./region-filter";
import type { RegionSearchLevel } from "./dr5hn-region-types";
import type {
  YnCheckoutAddressErrorCode,
  YnCheckoutAddressField,
  YnCheckoutAddressMessages,
  YnCheckoutAddressValidation,
  YnCheckoutAddressValidationError,
  YnCheckoutRegionFilter,
} from "./types";
import type { AddressProviderMode } from "./provider-probe";

/** 常见必须填写邮编的国家/地区 ISO2 */
export const POSTAL_REQUIRED_COUNTRIES = new Set<string>([
  "US",
  "CA",
  "GB",
  "AU",
  "DE",
  "FR",
  "IT",
  "ES",
  "NL",
  "JP",
  "KR",
  "MX",
  "BR",
  "IN",
  "SG",
  "MY",
]);

const PHONE_MIN_LEN = 6;
const PHONE_MAX_LEN = 15;
const LINE1_MIN_LEN = 3;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

/** 当前国家/地区是否要求填写邮编 */
export function isPostalRequiredForCountry(countryCode: string): boolean {
  const country = countryCode.trim().toUpperCase();
  return Boolean(country && POSTAL_REQUIRED_COUNTRIES.has(country));
}

export type ValidateCheckoutInput = {
  provider: AddressProviderMode | null;
  isDr5hn: boolean;
  countryCode: string;
  cityName: string;
  cityId: number | null;
  dr5hnRegionLevel: RegionSearchLevel | null;
  phoneNumber: string;
  line1: string;
  postalCode: string;
  email: string;
  showEmail: boolean;
  emailRequired: boolean;
  regionFilter?: YnCheckoutRegionFilter;
  messages: YnCheckoutAddressMessages;
};

const pushError = (
  errors: YnCheckoutAddressValidationError[],
  field: YnCheckoutAddressField,
  code: YnCheckoutAddressErrorCode,
  message: string,
) => {
  errors.push({ field, code, message });
};

export function isRegionComplete(input: ValidateCheckoutInput): boolean {
  if (!input.countryCode.trim()) {
    return false;
  }
  if (input.isDr5hn) {
    return input.dr5hnRegionLevel === "city" && Boolean(input.cityId) && Boolean(input.cityName.trim());
  }
  return Boolean(input.cityName.trim());
}

export function validateCheckoutAddress(input: ValidateCheckoutInput): YnCheckoutAddressValidation {
  const errors: YnCheckoutAddressValidationError[] = [];
  const country = input.countryCode.trim().toUpperCase();

  if (!country) {
    pushError(errors, "region", "REGION_REQUIRED", input.messages.errorRegionRequired);
  } else if (input.regionFilter && !passesCountryFilter(country, input.regionFilter)) {
    pushError(errors, "region", "REGION_NOT_ALLOWED", input.messages.errorRegionNotAllowed);
  } else if (input.isDr5hn) {
    if (input.dr5hnRegionLevel !== "city" || !input.cityId) {
      pushError(errors, "region", "REGION_CITY_LEVEL_REQUIRED", input.messages.errorRegionCityLevel);
    }
  } else if (!input.cityName.trim()) {
    pushError(errors, "region", "REGION_REQUIRED", input.messages.errorRegionRequired);
  }

  const phone = input.phoneNumber.replace(/\D/g, "");
  if (!phone) {
    pushError(errors, "phoneNumber", "PHONE_REQUIRED", input.messages.errorPhoneRequired);
  } else if (phone.length < PHONE_MIN_LEN || phone.length > PHONE_MAX_LEN) {
    pushError(errors, "phoneNumber", "PHONE_INVALID", input.messages.errorPhoneInvalid);
  }

  const line1 = input.line1.trim();
  if (!line1) {
    pushError(errors, "line1", "LINE1_REQUIRED", input.messages.errorLine1Required);
  } else if (line1.length < LINE1_MIN_LEN) {
    pushError(errors, "line1", "LINE1_TOO_SHORT", input.messages.errorLine1TooShort);
  }

  const postalRequired = isPostalRequiredForCountry(country);
  if (postalRequired && !input.postalCode.trim()) {
    pushError(errors, "postalCode", "POSTAL_REQUIRED", input.messages.errorPostalRequired);
  }

  if (input.showEmail) {
    const email = input.email.trim();
    if (input.emailRequired && !email) {
      pushError(errors, "email", "EMAIL_REQUIRED", input.messages.errorEmailRequired);
    } else if (email && !EMAIL_PATTERN.test(email)) {
      pushError(errors, "email", "EMAIL_INVALID", input.messages.errorEmailInvalid);
    }
  }

  const regionComplete = isRegionComplete(input);
  const coreOk =
    regionComplete &&
    phone.length >= PHONE_MIN_LEN &&
    phone.length <= PHONE_MAX_LEN &&
    line1.length >= LINE1_MIN_LEN;

  const emailOk =
    !input.showEmail ||
    !input.emailRequired ||
    Boolean(input.email.trim() && EMAIL_PATTERN.test(input.email.trim()));

  const postalOk = !postalRequired || Boolean(input.postalCode.trim());
  const formReady = coreOk && emailOk && postalOk;

  return {
    valid: errors.length === 0,
    regionComplete,
    formReady,
    errors,
  };
}

export const fieldToInputId: Record<YnCheckoutAddressField, string> = {
  region: "yn-ca-region",
  phoneNumber: "yn-ca-phone",
  line1: "yn-ca-line1",
  postalCode: "yn-ca-d-zip",
  email: "yn-ca-email",
};

/** dr5hn 模式下字段 id 不同 */
export const fieldToInputIdDr5hn: Record<YnCheckoutAddressField, string> = {
  region: "yn-ca-region",
  phoneNumber: "yn-ca-d-phone",
  line1: "yn-ca-d-line1",
  postalCode: "yn-ca-d-zip",
  email: "yn-ca-email",
};
