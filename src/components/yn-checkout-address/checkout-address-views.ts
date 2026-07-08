import { html, nothing } from "lit";
import type { TemplateResult } from "lit";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";
import { ynSearchCloseSvg, ynSearchSvg } from "../../asset/svg";
import type { AddressSuggestion } from "./address-providers";
import {
  renderFloatField,
  renderFloatTextarea,
  type CheckoutFieldTemplateHost,
} from "./checkout-address-field-templates";
import type { Dr5hnRegionSuggestion, RegionSearchLevel } from "./dr5hn-region-types";
import type { CheckoutFieldSet } from "./field-ids";
import { CHECKOUT_FIELD_IDS } from "./field-ids";
import type { AddressProviderMode } from "./provider-probe";
import type {
  YnCheckoutAddressChangeDetail,
  YnCheckoutAddressMessages,
} from "./types";
import { buildRegionSummary } from "./value-utils";

type CheckoutFields = (typeof CHECKOUT_FIELD_IDS)[CheckoutFieldSet];

export type CheckoutAddressViewHost = CheckoutFieldTemplateHost & {
  dev: boolean;
  disabled: boolean;
  msg: YnCheckoutAddressMessages;
  activeProvider: AddressProviderMode | null;
  probeReason: string;
  query: string;
  countryCode: string;
  countryName: string;
  stateName: string | null;
  cityName: string;
  firstName: string;
  lastName: string;
  line1: string;
  line2: string;
  notes: string;
  suggestions: AddressSuggestion[];
  dr5hnSuggestions: Dr5hnRegionSuggestion[];
  suggestionsOpen: boolean;
  searching: boolean;
  searchError: string;
  isDr5hnMode: boolean;
  isDr5hnRegionSearch: boolean;
  showInlineRegionSearch: boolean;
  fields: CheckoutFields;
  startRegionEdit: () => void;
  handleSearchInput: (event: Event) => void;
  clearSearch: () => void;
  applyDr5hnRegion: (item: Dr5hnRegionSuggestion) => void;
  applyGoogleSuggestion: (item: AddressSuggestion) => void | Promise<void>;
  dr5hnLevelLabel: (level: RegionSearchLevel) => string;
  usageHintForProvider: (mode: AddressProviderMode) => string;
  providerLabel: (mode: AddressProviderMode) => string;
  buildChangeDetail: () => YnCheckoutAddressChangeDetail;
  runProbe: () => void | Promise<void>;
  onManualField: (
    key: "countryName" | "countryCode" | "stateName" | "cityName",
  ) => (event: Event) => void;
  handleFieldInput: (
    field:
      | "firstName"
      | "lastName"
      | "line1"
      | "line2"
      | "postalCode"
      | "phone"
      | "email"
      | "whatsapp"
      | "notes",
  ) => (event: Event) => void;
  renderEmailFields(): TemplateResult | typeof nothing;
  renderWhatsappFields(): TemplateResult | typeof nothing;
  renderPhoneField(phoneInputId: string): TemplateResult;
  renderPostalField(inputId: string): TemplateResult;
};

function regionSummaryText(host: CheckoutAddressViewHost) {
  return buildRegionSummary({
    searchLabel: host.query,
    cityName: host.cityName,
    stateName: host.stateName,
    countryName: host.countryName,
    countryCode: host.countryCode,
  });
}

export function renderCheckoutSkeleton(host: CheckoutAddressViewHost) {
  return html`
    <div class="stack skeleton-stack" aria-busy="true" aria-live="polite">
      <p class="skeleton-hint">${host.msg.probing}</p>
      <div class="checkout-step skeleton-panel">
        <div class="skeleton-line skeleton-line--label"></div>
        <div class="skeleton-line skeleton-line--field"></div>
      </div>
    </div>
  `;
}

/** 已确认地区：紧凑条，避免再占一整张卡片（结账 UX 常见模式） */
export function renderRegionChip(host: CheckoutAddressViewHost) {
  return html`
    <div class="region-chip">
      <div class="region-chip__body">
        <span class="region-chip__step" aria-hidden="true">1</span>
        <div class="region-chip__text">
          <span class="region-chip__label">${host.msg.sectionRegion}</span>
          <p class="region-chip__value">${regionSummaryText(host)}</p>
        </div>
      </div>
      <button
        type="button"
        class="region-chip__edit"
        ?disabled=${host.disabled}
        @click=${host.startRegionEdit}
      >
        ${host.msg.regionEdit}
      </button>
    </div>
  `;
}

export function renderAddressSearch(host: CheckoutAddressViewHost) {
  const searchId = host.fields.region;
  const label = host.isDr5hnRegionSearch
    ? host.msg.regionSearchLabel
    : host.msg.addressSearchLabel;

  const showClear = Boolean(host.query.trim()) && !host.disabled;

  return html`
    <div class="float-field float-field--search search-wrap">
      <div class="float-field__control float-field__control--search">
        <input
          id=${searchId}
          class=${`float-field__input ${host.inputClass("region")}`}
          type="text"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded=${host.suggestionsOpen ? "true" : "false"}
          autocomplete="off"
          placeholder=" "
          ?disabled=${host.disabled}
          .value=${host.query}
          @input=${host.handleSearchInput}
        />
        <label class="float-field__label" for=${searchId}>${label}</label>
        ${showClear
          ? html`
              <button
                type="button"
                class="search-field__trailing search-field__clear"
                aria-label=${host.msg.searchClear}
                @click=${host.clearSearch}
              >
                ${unsafeSVG(ynSearchCloseSvg)}
              </button>
            `
          : html`
              <span class="search-field__trailing search-field__hint" aria-hidden="true">
                ${unsafeSVG(ynSearchSvg)}
              </span>
            `}
      </div>
      ${host.fieldError("region")}
      ${host.searching ? html`<p class="hint">${host.msg.searching}</p>` : nothing}
      ${host.searchError
        ? html`<p class="hint ${host.isDr5hnMode ? "hint--warn" : "hint--error"}">${host.searchError}</p>`
        : nothing}
      ${host.suggestionsOpen
        ? html`
            <ul class="dropdown" role="listbox">
              ${host.isDr5hnMode
                ? host.dr5hnSuggestions.map(
                    (item) => html`
                      <li>
                        <button type="button" @click=${() => host.applyDr5hnRegion(item)}>
                          ${item.label}
                          <span class="meta">${host.dr5hnLevelLabel(item.level)}</span>
                        </button>
                      </li>
                    `,
                  )
                : host.suggestions.map(
                    (item) => html`
                      <li>
                        <button type="button" @click=${() => void host.applyGoogleSuggestion(item)}>
                          ${item.label}
                        </button>
                      </li>
                    `,
                  )}
            </ul>
          `
        : nothing}
    </div>
  `;
}

/** 步骤 1：仅搜索/选择配送地区（联想优先） */
export function renderRegionStep(host: CheckoutAddressViewHost) {
  const mode = host.activeProvider!;
  return html`
    <section class="checkout-step checkout-step--region">
      <header class="step-header">
        <span class="step-badge" aria-hidden="true">1</span>
        <div class="step-header__body">
          <h2 class="step-title">${host.msg.sectionRegion}</h2>
          <p class="step-lead">${host.usageHintForProvider(mode)}</p>
        </div>
      </header>
      ${renderAddressSearch(host)}
    </section>
  `;
}

/**
 * 步骤 2：街道 + 联系（Line1 主地址、Line2 apt/unit、邮编独立一行）
 */
export function renderShippingSection(
  host: CheckoutAddressViewHost,
  firstNameId: string,
  lastNameId: string,
  phoneId: string,
  line1Id: string,
  line2Id: string,
  zipId: string,
  notesId: string,
) {
  return html`
    <section class="checkout-card" aria-labelledby="yn-ca-shipping-title">
      ${renderRegionChip(host)}
      ${host.showInlineRegionSearch && host.activeProvider === "photon"
        ? html`<p class="step-lead step-lead--inline">${host.msg.usageHintPhoton}</p>`
        : nothing}
      ${host.showInlineRegionSearch && host.isDr5hnMode
        ? html`<p class="step-lead step-lead--inline">${host.msg.usageHintDr5hn}</p>`
        : nothing}
      ${host.showInlineRegionSearch ? renderAddressSearch(host) : nothing}
      <header class="step-header step-header--inset">
        <span class="step-badge" aria-hidden="true">2</span>
        <h2 id="yn-ca-shipping-title" class="step-title">${host.msg.sectionShipping}</h2>
      </header>
      <div class="field-stack">
        <div class="grid-2">
          ${renderFloatField(host, {
            id: firstNameId,
            label: `${host.msg.firstName} *`,
            value: host.firstName,
            autocomplete: "given-name",
            errorField: "firstName",
            invalidField: "firstName",
            disabled: host.disabled,
            onInput: host.handleFieldInput("firstName"),
          })}
          ${renderFloatField(host, {
            id: lastNameId,
            label: `${host.msg.lastName} *`,
            value: host.lastName,
            autocomplete: "family-name",
            errorField: "lastName",
            invalidField: "lastName",
            disabled: host.disabled,
            onInput: host.handleFieldInput("lastName"),
          })}
        </div>
        ${host.renderEmailFields()}
        ${host.renderWhatsappFields()}
        ${host.renderPhoneField(phoneId)}
        ${renderFloatField(host, {
          id: line1Id,
          label: `${host.msg.detailAddress} *`,
          value: host.line1,
          autocomplete: "address-line1",
          errorField: "line1",
          invalidField: "line1",
          disabled: host.disabled,
          onInput: host.handleFieldInput("line1"),
        })}
        ${renderFloatField(host, {
          id: line2Id,
          label: `${host.msg.detailAddress2} (${host.msg.fieldMarkOptional})`,
          value: host.line2,
          autocomplete: "address-line2",
          helper: host.msg.line2Helper,
          disabled: host.disabled,
          onInput: host.handleFieldInput("line2"),
        })}
        ${host.renderPostalField(zipId)}
        ${renderFloatTextarea(host, {
          id: notesId,
          label: host.msg.notes,
          helper: `${host.msg.fieldMarkOptional} · ${host.msg.notesPlaceholder}`,
          value: host.notes,
          disabled: host.disabled,
          onInput: host.handleFieldInput("notes"),
        })}
      </div>
    </section>
  `;
}

export function renderDevPanel(host: CheckoutAddressViewHost) {
  if (!host.dev) {
    return nothing;
  }
  const detail = host.buildChangeDetail();
  const mode = host.activeProvider;
  return html`
    <aside class="dev-panel" aria-label=${host.msg.devPanelTitle}>
      <strong>${host.msg.devPanelTitle}</strong>
      <p class="dev-meta">
        ${host.msg.activeProvider}
        ${mode ? host.providerLabel(mode) : "—"} · ${host.probeReason}
      </p>
      <p class="dev-meta">
        valid: ${detail.validation.valid} · formReady: ${detail.value.formReady} · errors:
        ${detail.validation.errors.length}
      </p>
      <pre>${JSON.stringify(detail, null, 2)}</pre>
    </aside>
  `;
}

export function renderManualBanner(host: CheckoutAddressViewHost) {
  return html`
    <div class="banner banner--warn">
      <p>${host.usageHintForProvider("manual")}</p>
      <button type="button" class="retry" @click=${() => void host.runProbe()}>
        ${host.msg.retryProbe}
      </button>
    </div>
  `;
}

export function renderManualRegionSection(host: CheckoutAddressViewHost) {
  return html`
    <section class="checkout-step checkout-card manual-region" aria-labelledby="yn-ca-manual-region-heading">
      <header class="step-header">
        <span class="step-badge" aria-hidden="true">1</span>
        <h2 id="yn-ca-manual-region-heading" class="step-title">${host.msg.sectionRegion}</h2>
      </header>
      ${renderFloatField(host, {
        id: "yn-ca-m-country-name",
        label: host.msg.country,
        value: host.countryName,
        autocomplete: "country-name",
        disabled: host.disabled,
        onInput: host.onManualField("countryName"),
      })}
      <div class="grid-3">
        ${renderFloatField(host, {
          id: "yn-ca-m-country-code",
          label: host.msg.manualCountryCodePlaceholder,
          value: host.countryCode,
          maxlength: 2,
          invalidField: "region",
          errorField: "region",
          disabled: host.disabled,
          onInput: host.onManualField("countryCode"),
        })}
        ${renderFloatField(host, {
          id: "yn-ca-m-state",
          label: host.msg.state,
          value: host.stateName ?? "",
          autocomplete: "address-level1",
          disabled: host.disabled,
          onInput: host.onManualField("stateName"),
        })}
        ${renderFloatField(host, {
          id: "yn-ca-m-city",
          label: host.msg.cityDistrict,
          value: host.cityName,
          autocomplete: "address-level2",
          disabled: host.disabled,
          onInput: host.onManualField("cityName"),
        })}
      </div>
      ${host.fieldError("region")}
    </section>
  `;
}
