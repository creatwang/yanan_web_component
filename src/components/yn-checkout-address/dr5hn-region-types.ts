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
