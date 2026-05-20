export type AddressSuggestion = {
  id: string;
  label: string;
  line1: string;
  city: string;
  stateName: string | null;
  postalCode: string;
  countryCode: string;
  countryName: string;
  latitude: number | null;
  longitude: number | null;
};

const PHOTON_ENDPOINT = "https://photon.komoot.io/api/";

type PhotonFeature = {
  properties: {
    name?: string;
    street?: string;
    housenumber?: string;
    city?: string;
    state?: string;
    postcode?: string;
    country?: string;
    countrycode?: string;
  };
};

const buildLine1 = (props: PhotonFeature["properties"]) => {
  const parts = [props.housenumber, props.street, props.name].filter(Boolean);
  return parts.join(" ").trim() || props.name || "";
};

export async function searchPhoton(query: string, signal?: AbortSignal): Promise<AddressSuggestion[]> {
  const url = new URL(PHOTON_ENDPOINT);
  url.searchParams.set("q", query);
  url.searchParams.set("limit", "8");
  url.searchParams.set("lang", "en");

  const response = await fetch(url, { signal });
  if (!response.ok) {
    throw new Error(`Photon ${response.status}`);
  }

  const data = (await response.json()) as { features?: PhotonFeature[] };
  const features = data.features ?? [];
  const items: AddressSuggestion[] = [];

  features.forEach((feature, index) => {
    const props = feature.properties;
    const countryCode = (props.countrycode ?? "").toUpperCase();
    if (!countryCode) {
      return;
    }
    const line1 = buildLine1(props);
    const city = props.city ?? props.state ?? "";
    const label = [line1, city, props.state, props.country].filter(Boolean).join(", ");
    if (!label) {
      return;
    }
    items.push({
      id: `photon-${index}-${label}`,
      label,
      line1,
      city,
      stateName: props.state ?? null,
      postalCode: props.postcode ?? "",
      countryCode,
      countryName: props.country ?? countryCode,
      latitude: null,
      longitude: null,
    });
  });

  return items;
}

export function loadGoogleMaps(apiKey: string): Promise<void> {
  const w = window as typeof window & { __ynGoogleMapsLoading?: Promise<void> };
  if (w.google?.maps?.places) {
    return Promise.resolve();
  }
  if (w.__ynGoogleMapsLoading) {
    return w.__ynGoogleMapsLoading;
  }

  w.__ynGoogleMapsLoading = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=places`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Google Maps script failed"));
    document.head.append(script);
  });

  return w.__ynGoogleMapsLoading;
}

export async function searchGooglePlaces(
  query: string,
  countryCode?: string,
): Promise<AddressSuggestion[]> {
  const service = new google.maps.places.AutocompleteService();
  const request: google.maps.places.AutocompletionRequest = {
    input: query,
    types: ["address"],
  };
  if (countryCode) {
    request.componentRestrictions = { country: countryCode.toLowerCase() };
  }

  const predictions = await new Promise<google.maps.places.AutocompletePrediction[]>(
    (resolve, reject) => {
      service.getPlacePredictions(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          resolve(results);
          return;
        }
        if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
          resolve([]);
          return;
        }
        reject(new Error(status));
      });
    },
  );

  return predictions.map((item) => ({
    id: item.place_id,
    label: item.description,
    line1: item.structured_formatting.main_text,
    city: item.terms.at(-3)?.value ?? "",
    stateName: item.terms.at(-2)?.value ?? null,
    postalCode: "",
    countryCode: countryCode ?? "",
    countryName: item.terms.at(-1)?.value ?? "",
    latitude: null,
    longitude: null,
  }));
}

export async function resolveGooglePlace(placeId: string): Promise<AddressSuggestion | null> {
  const container = document.createElement("div");
  const service = new google.maps.places.PlacesService(container);

  const place = await new Promise<google.maps.places.PlaceResult | null>((resolve, reject) => {
    service.getDetails(
      { placeId, fields: ["address_components", "formatted_address", "geometry"] },
      (result, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && result) {
          resolve(result);
          return;
        }
        reject(new Error(status));
      },
    );
  });

  if (!place?.address_components) {
    return null;
  }

  const pick = (type: string, useShort = false) => {
    const part = place.address_components?.find((c) => c.types.includes(type));
    return (useShort ? part?.short_name : part?.long_name) ?? "";
  };

  const countryCode = pick("country", true).toUpperCase();
  const line1 = [pick("street_number"), pick("route")].filter(Boolean).join(" ").trim();

  return {
    id: placeId,
    label: place.formatted_address ?? line1,
    line1: line1 || pick("premise") || place.formatted_address?.split(",")[0] || "",
    city: pick("locality") || pick("postal_town") || pick("administrative_area_level_2"),
    stateName: pick("administrative_area_level_1") || null,
    postalCode: pick("postal_code"),
    countryCode,
    countryName: pick("country"),
    latitude: place.geometry?.location?.lat() ?? null,
    longitude: place.geometry?.location?.lng() ?? null,
  };
}
