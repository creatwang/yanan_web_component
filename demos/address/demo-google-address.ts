import { getCountryByCode, getStatesOfCountry } from "@countrystatecity/countries-browser";
import { LitElement, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { AddressSuggestion } from "./address-providers";
import {
  loadGoogleMaps,
  resolveGooglePlace,
  searchGooglePlaces,
  searchPhoton,
} from "./address-providers";
import { demoAddressFormStyles } from "./demo-address-form-styles";
import type { GoogleAddressPayload } from "./google-address-types";
import { ZH } from "./demo-zh";

const GOOGLE_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;
const DEBOUNCE_MS = 280;

@customElement("demo-google-address")
export class DemoGoogleAddress extends LitElement {
  /** Set by parent unified component after probe. */
  @property({ type: String }) provider: "google" | "photon" = "photon";

  @property({ type: Boolean, reflect: true, attribute: "embedded" }) embedded = false;

  @property({ type: Boolean }) disabled = false;

  @state() private query = "";
  @state() private suggestions: AddressSuggestion[] = [];
  @state() private suggestionsOpen = false;
  @state() private searching = false;
  @state() private searchError = "";

  @state() private line1 = "";
  @state() private line2 = "";
  @state() private cityName = "";
  @state() private stateName: string | null = null;
  @state() private stateCode: string | null = null;
  @state() private postalCode = "";
  @state() private countryCode = "";
  @state() private countryName = "";
  @state() private phonecode = "";
  @state() private currency = "";
  @state() private phoneNumber = "";

  @state() private providerLabel: string = ZH.providerPhoton;

  private debounceTimer: number | undefined;
  private abortController: AbortController | undefined;
  private googleReady = false;

  override connectedCallback() {
    super.connectedCallback();
    this.syncProviderMode();
    this.emitPayload();
  }

  override updated(changed: Map<string, unknown>) {
    if (changed.has("provider")) {
      this.syncProviderMode();
    }
  }

  private syncProviderMode() {
    this.providerLabel = this.provider === "google" ? ZH.providerGoogle : ZH.providerPhoton;
    this.googleReady = false;

    if (this.provider === "google" && GOOGLE_KEY) {
      void loadGoogleMaps(GOOGLE_KEY)
        .then(() => {
          this.googleReady = true;
          this.providerLabel = ZH.providerGoogle;
        })
        .catch(() => {
          this.provider = "photon";
          this.providerLabel = ZH.providerGoogleFailed;
        });
    }
  }

  private async resolveStateCode(country: string, name: string | null) {
    if (!country || !name) {
      return null;
    }
    try {
      const states = await getStatesOfCountry(country);
      const hit =
        states.find((s) => s.iso2 === name || s.name === name) ??
        states.find((s) => name.includes(s.name) || s.name.includes(name));
      return hit?.iso2 ?? null;
    } catch {
      return null;
    }
  }

  private async applyCountryMeta(code: string) {
    if (!code) {
      return;
    }
    try {
      const meta = await getCountryByCode(code);
      if (meta) {
        this.phonecode = meta.phonecode;
        this.currency = meta.currency;
        this.countryName = meta.name;
      }
    } catch {
      /* optional */
    }
  }

  private async applySuggestion(suggestion: AddressSuggestion) {
    let resolved = suggestion;

    if (this.provider === "google" && this.googleReady && !suggestion.id.startsWith("photon-")) {
      try {
        const detail = await resolveGooglePlace(suggestion.id);
        if (detail) {
          resolved = { ...detail, label: suggestion.label };
        }
      } catch {
        /* keep list row */
      }
    }

    this.line1 = resolved.line1;
    this.cityName = resolved.city;
    this.stateName = resolved.stateName;
    this.postalCode = resolved.postalCode;
    this.countryCode = resolved.countryCode;
    this.countryName = resolved.countryName;
    this.stateCode = await this.resolveStateCode(resolved.countryCode, resolved.stateName);
    await this.applyCountryMeta(resolved.countryCode);

    this.query = resolved.label;
    this.suggestionsOpen = false;
    this.searchError = "";
    this.emitPayload();
  }

  private emitPayload() {
    const formReady = Boolean(
      this.countryCode && this.cityName.trim() && this.line1.trim() && this.phoneNumber.trim(),
    );

    const detail: GoogleAddressPayload = {
      countryCode: this.countryCode,
      countryName: this.countryName,
      stateCode: this.stateCode,
      stateName: this.stateName,
      cityName: this.cityName.trim(),
      phonecode: this.phonecode,
      phoneNumber: this.phoneNumber.trim(),
      line1: this.line1.trim(),
      line2: this.line2.trim(),
      postalCode: this.postalCode.trim(),
      currency: this.currency,
      formReady,
    };

    this.dispatchEvent(
      new CustomEvent<GoogleAddressPayload>("address-change", {
        detail,
        bubbles: true,
        composed: true,
      }),
    );
  }

  private scheduleSearch(value: string) {
    window.clearTimeout(this.debounceTimer);
    this.abortController?.abort();

    if (value.trim().length < 3) {
      this.suggestions = [];
      this.suggestionsOpen = false;
      this.searching = false;
      return;
    }

    this.debounceTimer = window.setTimeout(() => {
      void this.runSearch(value.trim());
    }, DEBOUNCE_MS);
  }

  private async runSearch(value: string) {
    this.searching = true;
    this.searchError = "";
    this.abortController = new AbortController();

    try {
      let items: AddressSuggestion[] = [];
      if (this.provider === "google" && this.googleReady) {
        items = await searchGooglePlaces(value, this.countryCode || undefined);
      } else {
        items = await searchPhoton(value, this.abortController.signal);
      }
      this.suggestions = items;
      this.suggestionsOpen = items.length > 0;
      if (items.length === 0) {
        this.searchError = ZH.searchFailed;
      }
    } catch {
      this.searchError = ZH.searchFailed;
      this.suggestions = [];
      this.suggestionsOpen = false;
    } finally {
      this.searching = false;
    }
  }

  private handleSearchInput = (event: Event) => {
    const input = event.target as HTMLInputElement;
    this.query = input.value;
    this.scheduleSearch(input.value);
  };

  private handleFieldInput =
    (field: "line1" | "line2" | "phone") => (event: Event) => {
      const input = event.target as HTMLInputElement;
      if (field === "line1") this.line1 = input.value;
      if (field === "line2") this.line2 = input.value;
      if (field === "phone") this.phoneNumber = input.value.replace(/\D/g, "");
      this.emitPayload();
    };

  static styles = demoAddressFormStyles;

  override render() {
    const hasRegion = Boolean(this.countryCode);
    const phonePrefix = this.phonecode ? `+${this.phonecode}` : ZH.phonePrefixEmpty;

    return html`
      <div class="stack">
        ${this.embedded
          ? nothing
          : html`
              <p class="banner">
                <strong>${ZH.googleBanner}</strong>
                ${ZH.dataSource}${this.providerLabel}。${this.provider === "google" ? "" : ZH.googleKeyHint}
              </p>
            `}

        <div class="field search-wrap">
          <label for="g-search">${ZH.addressSearchLabel}</label>
          <input
            id="g-search"
            type="search"
            autocomplete="off"
            placeholder=${ZH.addressSearchPlaceholder}
            ?disabled=${this.disabled}
            .value=${this.query}
            @input=${this.handleSearchInput}
          />
          ${this.searching ? html`<p class="hint">${ZH.searching}</p>` : nothing}
          ${this.searchError ? html`<p class="hint hint--error">${this.searchError}</p>` : nothing}
          ${this.suggestionsOpen
            ? html`
                <ul class="dropdown" role="listbox">
                  ${this.suggestions.map(
                    (item) => html`
                      <li>
                        <button type="button" @click=${() => void this.applySuggestion(item)}>
                          ${item.label}
                        </button>
                      </li>
                    `,
                  )}
                </ul>
              `
            : nothing}
        </div>

        ${hasRegion
          ? html`
              <div class="grid-2">
                <div class="field">
                  <label>${ZH.cityDistrict}</label>
                  <div class="readonly">${this.cityName || ZH.empty}</div>
                </div>
                <div class="field">
                  <label>${ZH.state}</label>
                  <div class="readonly">
                    ${this.stateName ?? ZH.empty}${this.stateCode ? ` (${this.stateCode})` : ""}
                  </div>
                </div>
              </div>
              <div class="field">
                <label>${ZH.country}</label>
                <div class="readonly">${this.countryName} (${this.countryCode})</div>
              </div>
              <div class="grid-2">
                <div class="field">
                  <label for="g-line1">${ZH.detailAddress}</label>
                  <input id="g-line1" .value=${this.line1} @input=${this.handleFieldInput("line1")} />
                </div>
                <div class="field">
                  <label for="g-line2">${ZH.detailAddress2}</label>
                  <input
                    id="g-line2"
                    placeholder=${ZH.detailAddress2Placeholder}
                    .value=${this.line2}
                    @input=${this.handleFieldInput("line2")}
                  />
                </div>
              </div>
              <div class="phone-row">
                <div class="field">
                  <label>${ZH.phoneDial}</label>
                  <div class="phone-prefix">${phonePrefix}</div>
                </div>
                <div class="field">
                  <label for="g-phone">${ZH.phoneNumber}</label>
                  <input
                    id="g-phone"
                    type="tel"
                    inputmode="numeric"
                    placeholder=${ZH.phonePlaceholder}
                    .value=${this.phoneNumber}
                    @input=${this.handleFieldInput("phone")}
                  />
                </div>
              </div>
            `
          : nothing}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "demo-google-address": DemoGoogleAddress;
  }
}
