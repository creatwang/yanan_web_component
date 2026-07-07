export type YnCookieNoticeCategory = "functional" | "analytics" | "marketing";

export type YnCookieNoticePreferences = {
  necessary: true;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
  v: 1;
  ts: number;
};

export type YnCookieNoticePreferenceSource =
  | "init-default"
  | "apply"
  | "checkbox-change"
  | "save"
  | "accept-all"
  | "reject-all"
  | "close";

export type YnCookieNoticePreferenceChangeDetail = {
  prefs: YnCookieNoticePreferences;
  source: YnCookieNoticePreferenceSource;
  changedKey: YnCookieNoticeCategory | null;
};
