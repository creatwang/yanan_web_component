import { expect, fixture, html, oneEvent } from "@open-wc/testing";
import "./yn-cookie-notice";
import type { YnCookieNotice, YnCookieNoticePreferenceChangeDetail } from "./yn-cookie-notice";

const STORAGE_KEY = "test_cookie_consent_v1";

function clearConsent() {
  document.cookie = `${STORAGE_KEY}=; Max-Age=0; Path=/`;
}

describe("yn-cookie-notice", () => {
  beforeEach(() => {
    clearConsent();
  });

  afterEach(() => {
    clearConsent();
  });

  it("reflects visible when shown", async () => {
    const el = await fixture<YnCookieNotice>(html`
      <yn-cookie-notice storage-key=${STORAGE_KEY} auto-show-delay="0" ?auto-show=${false}></yn-cookie-notice>
    `);
    el.show();
    await el.updateComplete;
    expect(el.hasAttribute("visible")).to.equal(true);
  });

  it("dispatches preference-change on accept all", async () => {
    const el = await fixture<YnCookieNotice>(html`
      <yn-cookie-notice storage-key=${STORAGE_KEY} auto-show-delay="0" visible></yn-cookie-notice>
    `);
    await el.updateComplete;

    const acceptBtn = el.shadowRoot?.querySelector<HTMLButtonElement>(
      ".panel__button-group .action-button:first-child"
    );
    if (!acceptBtn) throw new Error("missing accept button");

    const eventPromise = oneEvent(el, "preference-change");
    acceptBtn.click();
    const event = (await eventPromise) as CustomEvent<YnCookieNoticePreferenceChangeDetail>;
    expect(event.detail.source).to.equal("accept-all");
    expect(event.detail.prefs.functional).to.equal(true);
    expect(event.detail.prefs.analytics).to.equal(true);
    expect(event.detail.prefs.marketing).to.equal(true);
    expect(el.hasAttribute("visible")).to.equal(false);
  });

  it("persists consent to document.cookie", async () => {
    const el = await fixture<YnCookieNotice>(html`
      <yn-cookie-notice storage-key=${STORAGE_KEY} auto-show-delay="0" visible></yn-cookie-notice>
    `);
    await el.updateComplete;

    const rejectBtn = el.shadowRoot?.querySelector<HTMLButtonElement>(
      ".panel__button-group .action-button:nth-child(2)"
    );
    rejectBtn?.click();
    await el.updateComplete;

    expect(document.cookie.includes(encodeURIComponent(STORAGE_KEY))).to.equal(true);
    const prefs = el.getPreferences();
    expect(prefs.marketing).to.equal(false);
  });

  it("skips auto show when consent already exists", async () => {
    document.cookie = `${encodeURIComponent(STORAGE_KEY)}=${encodeURIComponent(
      JSON.stringify({
        necessary: true,
        functional: false,
        analytics: false,
        marketing: false,
        v: 1,
        ts: Date.now()
      })
    )}; Path=/`;

    const el = await fixture<YnCookieNotice>(html`
      <yn-cookie-notice storage-key=${STORAGE_KEY} auto-show-delay="0"></yn-cookie-notice>
    `);
    await el.updateComplete;
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(el.hasAttribute("visible")).to.equal(false);
  });
});
