import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import {
  probeAddressProvider,
  type AddressProviderMode,
  type ProviderProbeResult,
} from "./address-provider-probe";
import { demoAddressFormStyles } from "./demo-address-form-styles";
import { demoAddressSkeletonStyles } from "./demo-address-skeleton-styles";
import { ZH } from "./demo-zh";
import type { Dr5hnRegionValue } from "./dr5hn-region-types";
import type { GoogleAddressPayload } from "./google-address-types";
import type { UnifiedAddressPayload } from "./unified-address-types";
import "./demo-dr5hn-region";
import "./demo-google-address";

type ProbePhase = "probing" | "ready" | "error";

@customElement("demo-unified-address")
export class DemoUnifiedAddress extends LitElement {
  @property({ type: Boolean }) disabled = false;

  @state() private phase: ProbePhase = "probing";
  @state() private provider: AddressProviderMode | null = null;
  @state() private probeReason = "";
  @state() private probeError = "";

  private probeAbort?: AbortController;

  override connectedCallback() {
    super.connectedCallback();
    void this.runProbe();
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.probeAbort?.abort();
  }

  private async runProbe() {
    this.phase = "probing";
    this.probeAbort?.abort();
    this.probeAbort = new AbortController();

    try {
      const result: ProviderProbeResult = await probeAddressProvider(this.probeAbort.signal);
      this.provider = result.mode;
      this.probeReason = result.reason;
      this.phase = "ready";
    } catch (error) {
      if ((error as Error).name === "AbortError") {
        return;
      }
      this.phase = "error";
      this.probeError = ZH.unifiedProbeFailed;
      this.provider = "photon";
      this.probeReason = ZH.unifiedProbeFailedFallback;
    }
  }

  private providerLabel(mode: AddressProviderMode) {
    if (mode === "google") return ZH.unifiedProviderGoogle;
    if (mode === "dr5hn") return ZH.unifiedProviderDr5hn;
    return ZH.unifiedProviderPhoton;
  }

  private mapGoogle(detail: GoogleAddressPayload): UnifiedAddressPayload {
    const regionComplete = Boolean(detail.countryCode && detail.cityName.trim());
    return {
      provider: this.provider ?? "photon",
      probeReason: this.probeReason,
      countryCode: detail.countryCode,
      countryName: detail.countryName,
      stateCode: detail.stateCode,
      stateName: detail.stateName,
      cityName: detail.cityName,
      cityId: null,
      phonecode: detail.phonecode,
      phoneNumber: detail.phoneNumber,
      line1: detail.line1,
      line2: detail.line2,
      postalCode: detail.postalCode,
      currency: detail.currency,
      regionComplete,
      formReady: detail.formReady,
    };
  }

  private mapDr5hn(detail: Dr5hnRegionValue): UnifiedAddressPayload {
    return {
      provider: this.provider ?? "dr5hn",
      probeReason: this.probeReason,
      countryCode: detail.countryCode,
      countryName: detail.countryName,
      stateCode: detail.stateCode,
      stateName: detail.stateName,
      cityName: detail.cityName,
      cityId: detail.cityId,
      phonecode: detail.phonecode,
      phoneNumber: detail.phoneNumber,
      line1: detail.line1,
      line2: detail.line2,
      postalCode: detail.postalCode,
      currency: detail.currency,
      regionComplete: detail.regionComplete,
      formReady: detail.formReady,
    };
  }

  private emitUnified(detail: UnifiedAddressPayload) {
    this.dispatchEvent(
      new CustomEvent<UnifiedAddressPayload>("address-change", {
        detail,
        bubbles: true,
        composed: true,
      }),
    );
  }

  private handleGoogleChange = (event: Event) => {
    event.stopPropagation();
    const detail = (event as CustomEvent<GoogleAddressPayload>).detail;
    this.emitUnified(this.mapGoogle(detail));
  };

  private handleDr5hnChange = (event: Event) => {
    event.stopPropagation();
    const detail = (event as CustomEvent<Dr5hnRegionValue>).detail;
    this.emitUnified(this.mapDr5hn(detail));
  };

  private renderSkeleton() {
    return html`
      <div class="skeleton-stack" aria-busy="true" aria-live="polite">
        <p class="skeleton-hint">${ZH.unifiedProbing}</p>
        <div class="skeleton-line skeleton-line--banner"></div>
        <div class="skeleton-line skeleton-line--short"></div>
        <div class="skeleton-line skeleton-line--field"></div>
        <div class="skeleton-grid-2">
          <div class="skeleton-line skeleton-line--field"></div>
          <div class="skeleton-line skeleton-line--field"></div>
        </div>
        <div class="skeleton-line skeleton-line--field"></div>
      </div>
    `;
  }

  private renderForm() {
    const mode = this.provider;
    if (!mode) {
      return nothing;
    }

    return html`
      <p class="banner">
        <strong>${ZH.unifiedActiveProvider}</strong>${this.providerLabel(mode)}。
        <span class="banner__reason">${this.probeReason}</span>
      </p>
      ${mode === "dr5hn"
        ? html`
            <demo-dr5hn-region
              embedded
              ?disabled=${this.disabled}
              @change=${this.handleDr5hnChange}
            ></demo-dr5hn-region>
          `
        : html`
            <demo-google-address
              embedded
              .provider=${mode}
              ?disabled=${this.disabled}
              @address-change=${this.handleGoogleChange}
            ></demo-google-address>
          `}
    `;
  }

  static styles = [
    demoAddressFormStyles,
    demoAddressSkeletonStyles,
    css`
      .banner__reason {
        display: block;
        margin-top: 4px;
        font-weight: 400;
        color: var(--yn-color-text-muted, rgba(36, 31, 33, 0.48));
      }

      .error-box {
        padding: 12px 14px;
        border-radius: 12px;
        border: 1px solid color-mix(in srgb, var(--yn-color-warning, #b87d55) 40%, transparent);
        background: color-mix(in srgb, var(--yn-color-warning, #b87d55) 12%, transparent);
        font-size: 0.8125rem;
        line-height: 1.5;
      }

      .retry {
        margin-top: 10px;
        border: 0;
        padding: 8px 14px;
        border-radius: 999px;
        background: var(--yn-color-primary, #f76c46);
        color: var(--yn-color-on-inverse, #fff);
        font: inherit;
        font-size: 0.8125rem;
        font-weight: 600;
        cursor: pointer;
      }
    `,
  ];

  override render() {
    if (this.phase === "probing") {
      return this.renderSkeleton();
    }

    if (this.phase === "error") {
      return html`
        <div class="error-box">
          ${this.probeError}
          <button type="button" class="retry" @click=${() => void this.runProbe()}>${ZH.unifiedRetry}</button>
        </div>
        ${this.renderForm()}
      `;
    }

    return this.renderForm();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "demo-unified-address": DemoUnifiedAddress;
  }
}
