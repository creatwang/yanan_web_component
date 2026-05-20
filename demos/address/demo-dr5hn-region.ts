import { LitElement, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { demoAddressFormStyles } from "./demo-address-form-styles";
import { ZH } from "./demo-zh";
import { enrichCountry, isChinaQuery, loadCountries, searchDr5hnRegions } from "./dr5hn-region-service";
import type { Dr5hnRegionSuggestion, Dr5hnRegionValue } from "./dr5hn-region-types";

const DEBOUNCE = 320;

@customElement("demo-dr5hn-region")
export class DemoDr5hnRegion extends LitElement {
  @property({ type: Boolean, reflect: true, attribute: "embedded" }) embedded = false;

  @property({ type: Boolean }) disabled = false;

  @state() private query = "";
  @state() private suggestions: Dr5hnRegionSuggestion[] = [];
  @state() private open = false;
  @state() private searching = false;
  @state() private error = "";

  @state() private countryCode = "";
  @state() private countryName = "";
  @state() private stateCode: string | null = null;
  @state() private stateName: string | null = null;
  @state() private cityId: number | null = null;
  @state() private cityName = "";
  @state() private phonecode = "";
  @state() private currency = "";

  @state() private phoneNumber = "";
  @state() private line1 = "";
  @state() private line2 = "";
  @state() private postalCode = "";

  private timer: number | undefined;
  private abort?: AbortController;

  override connectedCallback() {
    super.connectedCallback();
    void loadCountries();
    this.emitChange();
  }

  private get hasRegion() {
    return Boolean(this.countryCode);
  }

  private get regionComplete() {
    return Boolean(this.countryCode && this.cityName.trim());
  }

  private buildPayload(): Dr5hnRegionValue {
    const regionComplete = this.regionComplete;
    return {
      countryCode: this.countryCode,
      countryName: this.countryName,
      stateCode: this.stateCode,
      stateName: this.stateName,
      cityId: this.cityId,
      cityName: this.cityName.trim(),
      phonecode: this.phonecode,
      currency: this.currency,
      phoneNumber: this.phoneNumber.trim(),
      line1: this.line1.trim(),
      line2: this.line2.trim(),
      postalCode: this.postalCode.trim(),
      regionComplete,
      formReady: Boolean(regionComplete && this.phoneNumber.trim() && this.line1.trim()),
    };
  }

  private emitChange() {
    this.dispatchEvent(
      new CustomEvent<Dr5hnRegionValue>("change", {
        detail: this.buildPayload(),
        bubbles: true,
        composed: true,
      }),
    );
  }

  private clearRegion() {
    this.countryCode = "";
    this.countryName = "";
    this.stateCode = null;
    this.stateName = null;
    this.cityId = null;
    this.cityName = "";
    this.phonecode = "";
    this.currency = "";
  }

  private applyRegion(item: Dr5hnRegionSuggestion) {
    this.countryCode = item.countryCode;
    this.countryName = item.countryName;
    this.stateCode = item.stateCode;
    this.stateName = item.stateName;
    this.cityId = item.cityId;
    this.cityName = item.cityName;
    this.phonecode = item.phonecode;
    this.currency = item.currency;
    this.query = item.label;
    this.open = false;
    this.error =
      item.level === "country"
        ? ZH.regionSearchCountryOnly
        : item.level === "state"
          ? ZH.regionSearchStateOnly
          : "";
    this.emitChange();
    void enrichCountry(item.countryCode, item).then((meta) => {
      this.countryName = meta.countryName;
      this.phonecode = meta.phonecode;
      this.currency = meta.currency;
      this.emitChange();
    });
  }

  private schedule(value: string) {
    window.clearTimeout(this.timer);
    this.abort?.abort();
    if (value.trim().length < 2) {
      this.suggestions = [];
      this.open = false;
      this.searching = false;
      return;
    }
    this.timer = window.setTimeout(() => void this.run(value.trim()), DEBOUNCE);
  }

  private async run(value: string) {
    this.searching = true;
    this.error = "";
    this.abort = new AbortController();
    try {
      this.suggestions = await searchDr5hnRegions(value, this.abort.signal);
      this.open = this.suggestions.length > 0;
      if (!this.abort.signal.aborted && this.suggestions.length === 0) {
        this.error = isChinaQuery(value) ? ZH.regionSearchChinaExcluded : ZH.regionSearchNoResults;
      }
    } catch {
      if (!this.abort.signal.aborted) {
        this.error = ZH.searchFailed;
        this.suggestions = [];
        this.open = false;
      }
    } finally {
      if (!this.abort.signal.aborted) this.searching = false;
    }
  }

  private pick(item: Dr5hnRegionSuggestion) {
    this.applyRegion(item);
  }

  private levelLabel(level: Dr5hnRegionSuggestion["level"]) {
    if (level === "city") return ZH.regionSearchLevelCity;
    if (level === "state") return ZH.regionSearchLevelState;
    return ZH.regionSearchLevelCountry;
  }

  private onSearchInput = (e: Event) => {
    const input = e.target as HTMLInputElement;
    this.query = input.value;
    this.clearRegion();
    this.error = "";
    this.schedule(input.value);
    this.emitChange();
  };

  private onFieldInput =
    (field: "line1" | "line2" | "postalCode" | "phone") => (e: Event) => {
      const input = e.target as HTMLInputElement;
      if (field === "line1") this.line1 = input.value;
      if (field === "line2") this.line2 = input.value;
      if (field === "postalCode") this.postalCode = input.value;
      if (field === "phone") this.phoneNumber = input.value.replace(/\D/g, "");
      this.emitChange();
    };

  static styles = demoAddressFormStyles;

  override render() {
    const phonePrefix = this.phonecode ? `+${this.phonecode}` : ZH.phonePrefixEmpty;

    return html`
      <div class="stack">
        ${this.embedded ? nothing : html`<p class="banner"><strong>${ZH.dr5hnBanner}</strong></p>`}

        <div class="field search-wrap">
          <label for="d-search">${ZH.regionSearchLabel}</label>
          <input
            id="d-search"
            type="search"
            autocomplete="off"
            placeholder=${ZH.regionSearchPlaceholder}
            ?disabled=${this.disabled}
            .value=${this.query}
            @input=${this.onSearchInput}
          />
          ${this.searching ? html`<p class="hint">${ZH.searching}</p>` : nothing}
          ${this.error ? html`<p class="hint hint--warn">${this.error}</p>` : nothing}
          ${this.open
            ? html`
                <ul class="dropdown" role="listbox">
                  ${this.suggestions.map(
                    (item) => html`
                      <li>
                        <button type="button" @click=${() => this.pick(item)}>
                          ${item.label}
                          <span class="meta">${this.levelLabel(item.level)}</span>
                        </button>
                      </li>
                    `,
                  )}
                </ul>
              `
            : nothing}
        </div>

        ${this.hasRegion
          ? html`
              <p class="section-title">${ZH.sectionRegion}</p>
              <div class="grid-3">
                <div class="field">
                  <label>${ZH.country}</label>
                  <div class="readonly">${this.countryName} (${this.countryCode})</div>
                </div>
                <div class="field">
                  <label>${ZH.state}</label>
                  <div class="readonly">
                    ${this.stateName ?? ZH.empty}${this.stateCode ? ` (${this.stateCode})` : ""}
                  </div>
                </div>
                <div class="field">
                  <label>${ZH.cityDistrict}</label>
                  <div class="readonly">${this.cityName || ZH.empty}</div>
                </div>
              </div>

              <p class="section-title">${ZH.sectionContact}</p>
              <div class="phone-row">
                <div class="field">
                  <label>${ZH.phoneDial}</label>
                  <div class="phone-prefix">${phonePrefix}</div>
                </div>
                <div class="field">
                  <label for="d-phone">${ZH.phoneNumber}</label>
                  <input
                    id="d-phone"
                    type="tel"
                    inputmode="numeric"
                    placeholder=${ZH.phonePlaceholder}
                    ?disabled=${this.disabled || !this.phonecode}
                    .value=${this.phoneNumber}
                    @input=${this.onFieldInput("phone")}
                  />
                </div>
              </div>

              <p class="section-title">${ZH.sectionAddress}</p>
              <div class="field">
                <label for="d-line1">${ZH.detailAddress}</label>
                <input
                  id="d-line1"
                  autocomplete="address-line1"
                  placeholder=${ZH.detailAddressPlaceholder}
                  ?disabled=${this.disabled}
                  .value=${this.line1}
                  @input=${this.onFieldInput("line1")}
                />
              </div>
              <div class="grid-2">
                <div class="field">
                  <label for="d-line2">${ZH.detailAddress2}</label>
                  <input
                    id="d-line2"
                    autocomplete="address-line2"
                    placeholder=${ZH.detailAddress2Placeholder}
                    ?disabled=${this.disabled}
                    .value=${this.line2}
                    @input=${this.onFieldInput("line2")}
                  />
                </div>
                <div class="field">
                  <label for="d-zip">${ZH.postal}</label>
                  <input
                    id="d-zip"
                    autocomplete="postal-code"
                    placeholder=${ZH.postalPlaceholder}
                    ?disabled=${this.disabled}
                    .value=${this.postalCode}
                    @input=${this.onFieldInput("postalCode")}
                  />
                </div>
              </div>
              <p class="hint">${ZH.dr5hnSubmitHint}</p>
            `
          : nothing}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "demo-dr5hn-region": DemoDr5hnRegion;
  }
}
