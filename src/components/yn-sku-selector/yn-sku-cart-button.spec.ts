import { expect, fixture, html } from "@open-wc/testing";
import { ynSkuCartSvg } from "../../asset/svg";
import "./yn-sku-cart-button";
import type { YnSkuCartButton } from "./yn-sku-cart-button";

describe("yn-sku-cart-button", () => {
  it("renders cart icon, label and price", async () => {
    const el = await fixture<YnSkuCartButton>(html`
      <yn-sku-cart-button label="Add to cart" price="65.00 €" .cartIcon=${ynSkuCartSvg}></yn-sku-cart-button>
    `);

    const root = el.shadowRoot;
    expect(root?.querySelector(".submit-inner")).to.not.equal(null);
    expect(root?.querySelector(".submit-label")?.textContent).to.equal("Add to cart");
    expect(root?.querySelector(".submit-price")?.textContent?.trim()).to.equal("65.00 €");
    expect(root?.querySelector(".submit-icon svg")).to.not.equal(null);
  });

  it("uses spinner mode in left section by default when loading", async () => {
    const el = await fixture<YnSkuCartButton>(html`
      <yn-sku-cart-button loading price="65.00 €"></yn-sku-cart-button>
    `);

    expect(el.loading).to.equal(true);
    const submit = el.shadowRoot?.querySelector(".submit");
    expect(submit?.classList.contains("is-loading")).to.equal(true);
    expect(submit?.classList.contains("is-loading-spinner")).to.equal(true);
    expect(el.shadowRoot?.querySelector(".submit-main .submit-spinner-overlay svg")).to.not.equal(null);
    expect(el.shadowRoot?.querySelector(".submit > .submit-spinner-overlay")).to.equal(null);
    expect(el.shadowRoot?.querySelector(".submit-icon svg")).to.not.equal(null);
  });

  it("replaces label with loading-text in text mode", async () => {
    const el = await fixture<YnSkuCartButton>(html`
      <yn-sku-cart-button
        label="ADD TO CART"
        loading-text="ADDING..."
        loading
        price="65.00 €"
      ></yn-sku-cart-button>
    `);

    const submit = el.shadowRoot?.querySelector(".submit");
    expect(submit?.classList.contains("is-loading-text")).to.equal(true);
    expect(submit?.classList.contains("is-loading-spinner")).to.equal(false);
    expect(el.shadowRoot?.querySelector(".submit-label")?.textContent).to.equal("ADDING...");
    expect(el.shadowRoot?.querySelector(".submit-spinner-overlay")).to.equal(null);
    expect(el.shadowRoot?.querySelector(".submit-icon svg")).to.not.equal(null);
  });

  it("renders slotted icon instead of cart-icon fallback", async () => {
    const el = await fixture<YnSkuCartButton>(html`
      <yn-sku-cart-button label="ADD TO CART" price="65.00 €">
        <svg slot="icon" viewBox="0 0 24 24" data-testid="custom-icon">
          <circle cx="12" cy="12" r="8"></circle>
        </svg>
      </yn-sku-cart-button>
    `);

    const slot = el.shadowRoot?.querySelector('slot[name="icon"]') as HTMLSlotElement | null;
    const assigned = slot?.assignedElements() ?? [];
    expect(assigned[0]?.getAttribute("data-testid")).to.equal("custom-icon");
  });
});
