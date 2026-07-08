import { html, nothing } from "lit";
import type { TemplateResult } from "lit";
import type { YnCheckoutAddressField } from "./types";

export type CheckoutFieldTemplateHost = {
  showFieldErrors: boolean;
  invalidFieldSet: ReadonlySet<YnCheckoutAddressField>;
  fieldError(field: YnCheckoutAddressField): TemplateResult | typeof nothing;
  inputClass(field: YnCheckoutAddressField): string;
};

export type FloatFieldOptions = {
  id: string;
  label: string;
  value: string;
  onInput: (event: Event) => void;
  errorField?: YnCheckoutAddressField;
  invalidField?: YnCheckoutAddressField;
  disabled?: boolean;
  autocomplete?: string;
  inputmode?: string;
  type?: string;
  maxlength?: number;
  controlClass?: string;
  trailing?: TemplateResult;
  helper?: string;
};

export type FloatTextareaOptions = {
  id: string;
  label: string;
  value: string;
  onInput: (event: Event) => void;
  disabled?: boolean;
  maxlength?: number;
  helper?: string;
};

/** Flutter / Material 式上浮 label（`placeholder=" "` + label 置于 input 之后） */
export function renderFloatField(host: CheckoutFieldTemplateHost, opts: FloatFieldOptions) {
  const invalid = opts.invalidField ? host.inputClass(opts.invalidField) : "";
  return html`
    <div class="float-field ${opts.trailing ? "float-field--has-trailing" : ""}">
      <div class="float-field__control ${opts.controlClass ?? ""}">
        <input
          id=${opts.id}
          type=${opts.type ?? "text"}
          placeholder=" "
          autocomplete=${opts.autocomplete ?? "off"}
          inputmode=${opts.inputmode ?? nothing}
          maxlength=${opts.maxlength ?? nothing}
          ?disabled=${opts.disabled}
          class=${invalid}
          .value=${opts.value}
          @input=${opts.onInput}
        />
        <label class="float-field__label" for=${opts.id}>${opts.label}</label>
        ${opts.trailing ?? nothing}
      </div>
      ${opts.helper ? html`<p class="field-helper">${opts.helper}</p>` : nothing}
      ${opts.errorField ? host.fieldError(opts.errorField) : nothing}
    </div>
  `;
}

export function renderFloatTextarea(host: CheckoutFieldTemplateHost, opts: FloatTextareaOptions) {
  return html`
    <div class="float-field float-field--multiline">
      <div class="float-field__control float-field__control--textarea">
        <label class="float-field__label" for=${opts.id}>${opts.label}</label>
        <textarea
          id=${opts.id}
          class="float-field__textarea"
          placeholder=" "
          rows="3"
          maxlength=${opts.maxlength ?? 500}
          ?disabled=${opts.disabled}
          .value=${opts.value}
          @input=${opts.onInput}
        ></textarea>
      </div>
      ${opts.helper ? html`<p class="field-helper">${opts.helper}</p>` : nothing}
    </div>
  `;
}
