import { LitElement, css, html, unsafeCSS } from "lit";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";
import { customElement, property, state } from "lit/decorators.js";
import { ynClose20Svg, ynDropdownPickChevronUpSvg } from "../../asset/svg/index.js";
import "../yn-icon-button/yn-icon-button.js";
import { YN_COOKIE_NOTICE_MODAL_HOLDER_SVG } from "./cookie-notice-icons.js";
import { YN_COOKIE_NOTICE_STYLES } from "./yn-cookie-notice-styles.js";
import type {
  YnCookieNoticeCategory,
  YnCookieNoticePreferenceChangeDetail,
  YnCookieNoticePreferences,
  YnCookieNoticePreferenceSource
} from "./types.js";


@customElement("yn-cookie-notice")
export class YnCookieNotice extends LitElement {
  /** 写入 document.cookie 的键名。 */
  @property({ type: String, attribute: "storage-key" }) storageKey = "cookie_consent_v1";
  /** 无历史同意记录时，延迟多少毫秒后自动显示（ms）。 */
  @property({ type: Number, attribute: "auto-show-delay" }) autoShowDelay = 800;
  /** 是否显示横幅（reflect 便于外部观测）。 */
  @property({ type: Boolean, reflect: true }) visible = false;
  /** 是否已有同意记录时跳过自动弹出。 */
  @property({ type: Boolean, attribute: "auto-show" }) autoShow = true;
  /** Cookie Max-Age（秒）。 */
  @property({ type: Number, attribute: "max-age" }) maxAge = 31536000;
  @property({ type: Boolean, attribute: "default-functional" }) defaultFunctional = false;
  @property({ type: Boolean, attribute: "default-analytics" }) defaultAnalytics = false;
  @property({ type: Boolean, attribute: "default-marketing" }) defaultMarketing = true;
  @property({ type: String }) title = "We use cookies to improve your experience";
  @property({ type: String, attribute: "policy-line-1" }) policyLine1 = "By continuing, you";
  @property({ type: String, attribute: "policy-line-2" }) policyLine2 = "cookie policy.";

  @state() private functional = false;
  @state() private analytics = false;
  @state() private marketing = true;
  @state() private settingsOpen = false;
  @state() private hasStoredConsent = false;

  private autoShowTimer = 0;

  static styles = css`
    ${unsafeCSS(YN_COOKIE_NOTICE_STYLES)}
  `;

  connectedCallback() {
    super.connectedCallback();
    this.bootstrapFromStorage();
  }

  disconnectedCallback() {
    this.clearAutoShowTimer();
    super.disconnectedCallback();
  }

  /** 手动显示横幅。 */
  show() {
    this.visible = true;
  }

  /** 隐藏横幅（不写入同意记录）。 */
  hide() {
    this.visible = false;
    this.settingsOpen = false;
  }

  /** 显示横幅并展开偏好设置面板。 */
  openSettings() {
    this.visible = true;
    this.settingsOpen = true;
  }

  /** 清除本地同意记录并重新显示横幅。 */
  resetConsent() {
    this.eraseConsentCookie();
    this.hasStoredConsent = false;
    this.applyPreferences(
      {
        functional: this.defaultFunctional,
        analytics: this.defaultAnalytics,
        marketing: this.defaultMarketing
      },
      { silent: true }
    );
    this.settingsOpen = false;
    this.visible = true;
  }

  /** 读取当前表单偏好（必要项恒为 true）。 */
  getPreferences(): YnCookieNoticePreferences {
    return this.buildPreferences(this.functional, this.analytics, this.marketing);
  }

  /** 将偏好同步到表单（不写入 cookie）。 */
  setPreferences(prefs: Partial<Pick<YnCookieNoticePreferences, "functional" | "analytics" | "marketing">>) {
    this.applyPreferences(prefs, { silent: true });
  }

  private bootstrapFromStorage() {
    const saved = this.readConsent();
    if (saved) {
      this.hasStoredConsent = true;
      this.applyPreferences(saved, { silent: true });
      this.visible = false;
      this.settingsOpen = false;
      return;
    }

    this.applyPreferences(
      {
        functional: this.defaultFunctional,
        analytics: this.defaultAnalytics,
        marketing: this.defaultMarketing
      },
      { silent: true }
    );
    this.settingsOpen = false;
    this.visible = false;
    this.emitPreferenceChange("init-default");

    if (this.autoShow) {
      this.scheduleAutoShow();
    }
  }

  private scheduleAutoShow() {
    this.clearAutoShowTimer();
    if (this.autoShowDelay <= 0) {
      this.visible = true;
      return;
    }
    this.autoShowTimer = window.setTimeout(() => {
      this.autoShowTimer = 0;
      if (!this.hasStoredConsent) this.visible = true;
    }, this.autoShowDelay);
  }

  private clearAutoShowTimer() {
    if (this.autoShowTimer) {
      window.clearTimeout(this.autoShowTimer);
      this.autoShowTimer = 0;
    }
  }

  private buildPreferences(functional: boolean, analytics: boolean, marketing: boolean): YnCookieNoticePreferences {
    return {
      necessary: true,
      functional,
      analytics,
      marketing,
      v: 1,
      ts: Date.now()
    };
  }

  private applyPreferences(
    prefs: Partial<Pick<YnCookieNoticePreferences, "functional" | "analytics" | "marketing">>,
    { silent = false }: { silent?: boolean } = {}
  ) {
    if (prefs.functional !== undefined) this.functional = !!prefs.functional;
    if (prefs.analytics !== undefined) this.analytics = !!prefs.analytics;
    if (prefs.marketing !== undefined) this.marketing = !!prefs.marketing;
    if (!silent) this.emitPreferenceChange("apply");
  }

  private emitPreferenceChange(
    source: YnCookieNoticePreferenceSource,
    changedKey: YnCookieNoticeCategory | null = null
  ) {
    const detail: YnCookieNoticePreferenceChangeDetail = {
      prefs: this.getPreferences(),
      source,
      changedKey
    };
    this.dispatchEvent(
      new CustomEvent("preference-change", {
        detail,
        bubbles: true,
        composed: true
      })
    );
  }

  private isSecureContext() {
    try {
      return window.location?.protocol === "https:";
    } catch {
      return false;
    }
  }

  private readCookie(name: string) {
    const prefix = `${encodeURIComponent(name)}=`;
    const parts = document.cookie ? document.cookie.split("; ") : [];
    for (const part of parts) {
      if (part.startsWith(prefix)) {
        return decodeURIComponent(part.slice(prefix.length));
      }
    }
    return null;
  }

  private writeCookie(name: string, value: string) {
    let cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
    cookie += `; Max-Age=${this.maxAge}`;
    cookie += "; Path=/";
    cookie += "; SameSite=Lax";
    if (this.isSecureContext()) cookie += "; Secure";
    document.cookie = cookie;
  }

  private eraseConsentCookie() {
    document.cookie = `${encodeURIComponent(this.storageKey)}=; Max-Age=0; Path=/`;
  }

  private readConsent(): YnCookieNoticePreferences | null {
    try {
      const raw = this.readCookie(this.storageKey);
      if (!raw) return null;
      const data = JSON.parse(raw) as Partial<YnCookieNoticePreferences>;
      if (!data || typeof data !== "object") return null;
      return this.buildPreferences(!!data.functional, !!data.analytics, !!data.marketing);
    } catch {
      return null;
    }
  }

  private persistConsent(prefs: YnCookieNoticePreferences) {
    try {
      this.writeCookie(this.storageKey, JSON.stringify(prefs));
      this.hasStoredConsent = true;
    } catch {
      /* ignore quota / privacy mode */
    }
  }

  private onCloseClick(event: Event) {
    event.preventDefault();
    if (!this.hasStoredConsent) {
      this.persistConsent(this.buildPreferences(false, false, false));
      this.emitPreferenceChange("close");
    }
    this.hide();
  }

  private onAcceptAll(event: Event) {
    event.preventDefault();
    this.applyPreferences({ functional: true, analytics: true, marketing: true }, { silent: true });
    const prefs = this.getPreferences();
    this.persistConsent(prefs);
    this.emitPreferenceChange("accept-all");
    this.hide();
  }

  private onRejectAll(event: Event) {
    event.preventDefault();
    this.applyPreferences({ functional: false, analytics: false, marketing: false }, { silent: true });
    const prefs = this.getPreferences();
    this.persistConsent(prefs);
    this.emitPreferenceChange("reject-all");
    this.hide();
  }

  private onToggleSettings(event: Event) {
    event.preventDefault();
    this.settingsOpen = !this.settingsOpen;
  }

  private onSettingsCancel(event: Event) {
    event.preventDefault();
    const saved = this.readConsent();
    if (saved) {
      this.applyPreferences(saved, { silent: true });
    } else {
      this.applyPreferences(
        {
          functional: this.defaultFunctional,
          analytics: this.defaultAnalytics,
          marketing: this.defaultMarketing
        },
        { silent: true }
      );
    }
    this.settingsOpen = false;
  }

  private onSettingsSave(event: Event) {
    event.preventDefault();
    const prefs = this.getPreferences();
    this.persistConsent(prefs);
    this.emitPreferenceChange("save");
    this.hide();
  }

  private onCategoryChange(category: YnCookieNoticeCategory, checked: boolean) {
    if (category === "functional") this.functional = checked;
    if (category === "analytics") this.analytics = checked;
    if (category === "marketing") this.marketing = checked;
    this.emitPreferenceChange("checkbox-change", category);
  }

  private renderCheckbox(options: {
    category: YnCookieNoticeCategory | "necessary";
    label: string;
    hint: string;
    checked: boolean;
    disabled?: boolean;
    requiredLabel?: string;
  }) {
    const { category, label, hint, checked, disabled = false, requiredLabel } = options;
    return html`
      <li>
        <label class=${`checkbox${checked ? " checked" : ""}${disabled ? " disabled" : ""}`}>
          <input
            class="checkbox__input"
            type="checkbox"
            name="cookie-pref"
            .checked=${checked}
            ?disabled=${disabled}
            @click=${disabled
              ? (event: Event) => {
                  event.preventDefault();
                }
              : undefined}
            @change=${disabled || category === "necessary"
              ? undefined
              : (event: Event) => {
                  this.onCategoryChange(category as YnCookieNoticeCategory, (event.target as HTMLInputElement).checked);
                }}
          />
          <span class="checkbox__box" aria-hidden="true"></span>
          <span class="checkbox__text">
            ${label}
            ${requiredLabel ? html`<small>${requiredLabel}</small>` : null}
          </span>
        </label>
        <p>${hint}</p>
      </li>
    `;
  }

  render() {
    return html`
      <section class=${`panel${this.visible ? " visible" : ""}`} aria-live="polite">
        <div class="panel__holder" aria-hidden="true">${unsafeSVG(YN_COOKIE_NOTICE_MODAL_HOLDER_SVG)}</div>
        <div class="panel__inner">
          <yn-icon-button class="panel__close" size="small" label="Close" @click=${this.onCloseClick}>
            ${unsafeSVG(ynClose20Svg)}
          </yn-icon-button>

          <div class="panel__header">
            <slot name="title">
              <p class="panel__title">${this.title}</p>
            </slot>
            <slot name="policy">
              <p class="panel__text">
                <span class="panel__text-line">${this.policyLine1} <strong>agree</strong></span>
                <span class="panel__text-line"><strong>to our</strong> ${this.policyLine2}</span>
              </p>
            </slot>

            <div class="panel__actions">
              <div class="panel__button-group">
                <button class="action-button action-button--primary" type="button" @click=${this.onAcceptAll}>
                  <strong>[</strong>
                  <span class="action-button__label">accept cookies</span>
                  <strong>]</strong>
                </button>
                <button class="action-button action-button--primary" type="button" @click=${this.onRejectAll}>
                  <strong>[</strong>
                  <span class="action-button__label">reject all</span>
                  <strong>]</strong>
                </button>
              </div>
              <button
                class=${`settings-toggle${this.settingsOpen ? " active" : ""}`}
                type="button"
                aria-expanded=${this.settingsOpen ? "true" : "false"}
                @click=${this.onToggleSettings}
              >
                <span class="settings-toggle__label">cookies settings</span>
                ${unsafeSVG(ynDropdownPickChevronUpSvg)}
              </button>
            </div>
          </div>

          <div class=${`panel__body${this.settingsOpen ? " open" : ""}`}>
            <div class="panel__body-inner">
              <div class="panel__settings">
                <ul class="pref-list">
                  ${this.renderCheckbox({
                    category: "necessary",
                    label: "Strictly necessary",
                    requiredLabel: "[required]",
                    hint: "Required for site functionality.",
                    checked: true,
                    disabled: true
                  })}
                  ${this.renderCheckbox({
                    category: "functional",
                    label: "Functional",
                    hint: "Remembers your preferences.",
                    checked: this.functional
                  })}
                  ${this.renderCheckbox({
                    category: "analytics",
                    label: "Analytics",
                    hint: "Helps us improve the site.",
                    checked: this.analytics
                  })}
                  ${this.renderCheckbox({
                    category: "marketing",
                    label: "Marketing",
                    hint: "Personalized ads.",
                    checked: this.marketing
                  })}
                </ul>

                <div class="settings-actions">
                  <button class="settings-cancel" type="button" @click=${this.onSettingsCancel}>Cancel</button>
                  <button class="action-button action-button--primary" type="button" @click=${this.onSettingsSave}>
                    <strong>[</strong>
                    <span class="action-button__label">Save preferences</span>
                    <strong>]</strong>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "yn-cookie-notice": YnCookieNotice;
  }
}

export type {
  YnCookieNoticeCategory,
  YnCookieNoticePreferenceChangeDetail,
  YnCookieNoticePreferences,
  YnCookieNoticePreferenceSource
} from "./types.js";
