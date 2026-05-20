export type RegionSearchLevel = "country" | "state" | "city";

export type Dr5hnRegionSuggestion = {
  id: string;
  label: string;
  level: RegionSearchLevel;
  countryCode: string;
  countryName: string;
  stateCode: string | null;
  stateName: string | null;
  cityId: number | null;
  cityName: string;
  phonecode: string;
  currency: string;
};

export type Dr5hnRegionValue = {
  countryCode: string;
  countryName: string;
  stateCode: string | null;
  stateName: string | null;
  cityId: number | null;
  cityName: string;
  phonecode: string;
  currency: string;
  phoneNumber: string;
  line1: string;
  line2: string;
  postalCode: string;
  regionComplete: boolean;
  formReady: boolean;
};
