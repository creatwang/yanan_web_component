declare namespace google.maps.places {
  class AutocompleteService {
    getPlacePredictions(
      request: AutocompletionRequest,
      callback: (results: AutocompletePrediction[] | null, status: PlacesServiceStatus) => void,
    ): void;
  }

  class PlacesService {
    constructor(attrContainer: HTMLDivElement | google.maps.Map);
    getDetails(
      request: PlaceDetailsRequest,
      callback: (result: PlaceResult | null, status: PlacesServiceStatus) => void,
    ): void;
  }

  interface AutocompletionRequest {
    input: string;
    types?: string[];
    componentRestrictions?: { country: string | string[] };
  }

  interface AutocompletePrediction {
    place_id: string;
    description: string;
    structured_formatting: { main_text: string; secondary_text: string };
    terms: Array<{ value: string; offset: number }>;
  }

  interface PlaceDetailsRequest {
    placeId: string;
    fields?: string[];
  }

  interface PlaceResult {
    formatted_address?: string;
    address_components?: Array<{
      long_name: string;
      short_name: string;
      types: string[];
    }>;
    geometry?: { location?: { lat(): number; lng(): number } };
  }

  enum PlacesServiceStatus {
    OK = "OK",
    ZERO_RESULTS = "ZERO_RESULTS",
  }
}

declare namespace google.maps {
  class Map {}
}

declare const google: {
  maps: {
    places: typeof google.maps.places;
    Map: typeof google.maps.Map;
  };
};

declare interface Window {
  google?: typeof google;
  __ynGoogleMapsLoading?: Promise<void>;
}
