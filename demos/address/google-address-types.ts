export type GoogleAddressPayload = {
  countryCode: string;
  countryName: string;
  stateCode: string | null;
  stateName: string | null;
  cityName: string;
  phonecode: string;
  phoneNumber: string;
  line1: string;
  line2: string;
  postalCode: string;
  currency: string;
  formReady: boolean;
};
