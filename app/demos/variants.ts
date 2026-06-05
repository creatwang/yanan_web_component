import { html } from "lit";
import type { DemoRenderer } from "../types";

const FLOEMA_IMG =
  "https://www.floema.com/_ipx/f_webp&s_200x114/https:/cdn.sanity.io/images/535lnz3g/production/6adaaad4b7aff57360124f76b64839aafe0bf6bd-317x180.png";

const categories = [
  { id: "Golf", color: "#b8d28a" },
  { id: "Urban", color: "#ef7d53" },
  { id: "Nature", color: "#d5c29f" },
  { id: "RePlastic", color: "#82a7d8" }
];

export const DOC_VARIANT_DEMOS: Record<string, DemoRenderer> = {
  "yn-button-variants": () => html`
    <yn-button variant="primary">Primary</yn-button>
    <yn-button variant="success">Success</yn-button>
    <yn-button variant="warning">Warning</yn-button>
    <yn-button variant="danger">Danger</yn-button>
    <yn-button variant="neutral">Neutral</yn-button>
    <yn-button variant="dark">Dark</yn-button>
  `,
  "yn-button-sizes": () => html`
    <yn-button size="mini">Mini</yn-button>
    <yn-button size="small">Small</yn-button>
    <yn-button size="medium">Medium</yn-button>
  `,
  "yn-button-loading": () => html`
    <yn-button loading loading-type="left">Loading left</yn-button>
    <yn-button loading loading-type="center">Loading center</yn-button>
    <yn-button loading loading-type="right">Loading right</yn-button>
  `,
  "yn-pick-color-card": () => html`
    <yn-pick value="nature" ?selected=${true} style="--yn-pick-border-radius:8px;">
      <div
        style="display:flex;align-items:flex-end;width:180px;height:100px;padding:12px;border-radius:8px;background:#d5c29f;font-size:22px;font-weight:700;color:#241f21;"
      >
        Nature
      </div>
    </yn-pick>
    <yn-pick value="urban" style="--yn-pick-border-radius:8px;">
      <div
        style="display:flex;align-items:flex-end;width:180px;height:100px;padding:12px;border-radius:8px;background:#ef7d53;font-size:22px;font-weight:700;color:#241f21;"
      >
        Urban
      </div>
    </yn-pick>
  `,
  "yn-pick-image-card": () => html`
    <yn-pick value="nature" ?selected=${true}>
      <div
        style="display:flex;flex-direction:column;align-items:flex-end;gap:6px;min-width:104px;padding:10px 12px;border-radius:8px;background:#d5c29f;font-weight:700;color:#241f21;"
      >
        <img
          src=${FLOEMA_IMG}
          alt="Nature"
          style="width:100%;border-radius:8px;display:block;"
        />
        <span style="font-size:16px;">Nature</span>
      </div>
    </yn-pick>
  `,
  "yn-group-pick-cards": () => html`
    <yn-group-pick style="--yn-group-pick-gap:8px;">
      ${categories.map(
        (item) => html`
          <yn-pick .value=${item.id}>
            <div
              style="display:flex;flex-direction:column;align-items:flex-end;gap:6px;min-width:104px;padding:10px 12px;border-radius:8px;font-weight:700;color:#241f21;background:${item.color};"
            >
              <img
                src=${FLOEMA_IMG}
                alt=${item.id}
                style="width:100%;border-radius:8px;display:block;"
              />
              <span style="font-size:16px;">${item.id}</span>
            </div>
          </yn-pick>
        `
      )}
    </yn-group-pick>
  `,
  "yn-group-pick-multiple": () => html`
    <yn-group-pick multiple .value=${["Urban", "Nature"]} style="--yn-group-pick-gap:8px;">
      ${categories.map(
        (item) => html`
          <yn-pick .value=${item.id}>
            <div
              style="padding:10px 16px;border-radius:8px;font-weight:600;background:${item.color};color:#241f21;"
            >
              ${item.id}
            </div>
          </yn-pick>
        `
      )}
    </yn-group-pick>
  `,
  "yn-quantity-product": () => html`
    <div
      style="max-width:360px;padding:20px;border-radius:16px;background:#f2efea;"
    >
      <h3 style="margin:0 0 12px;font-weight:400;font-size:18px;">Sun Lounger</h3>
      <div
        style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;font-size:14px;opacity:0.7;"
      >
        <span>Qty</span>
        <yn-quantity value="1" min="1" max="10"></yn-quantity>
      </div>
      <yn-button variant="dark" style="width:100%;">Add to list</yn-button>
    </div>
  `
};
