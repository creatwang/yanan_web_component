import type { AddressProviderMode } from "./address-provider-probe";

export type UnifiedAddressPayload = {
  provider: AddressProviderMode;
  probeReason: string;
  countryCode: string;
  countryName: string;
  stateCode: string | null;
  stateName: string | null;
  cityName: string;
  cityId: number | null;
  phonecode: string;
  phoneNumber: string;
  line1: string;
  line2: string;
  postalCode: string;
  currency: string;
  regionComplete: boolean;
  formReady: boolean;
};
