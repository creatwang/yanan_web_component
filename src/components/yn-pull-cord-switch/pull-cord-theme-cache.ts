const THEME_KEYS = [
  "--yn-pull-cord-switch-anchor-y",
  "--yn-pull-cord-switch-accent",
  "--yn-pull-cord-switch-ceiling-bg",
  "--yn-pull-cord-switch-anchor-color",
  "--yn-pull-cord-switch-rope-start",
  "--yn-pull-cord-switch-rope-end",
  "--yn-pull-cord-switch-card-width",
  "--yn-pull-cord-switch-card-height",
  "--yn-pull-cord-switch-segment-len",
  "--yn-pull-cord-switch-card-offset",
  "--yn-pull-cord-switch-max-pull",
  "--yn-pull-cord-switch-toggle-threshold",
  "--yn-pull-cord-switch-ceiling-width",
  "--yn-pull-cord-switch-rope-width",
  "--yn-pull-cord-switch-rope-shadow-width"
] as const;

const FALLBACKS: Record<(typeof THEME_KEYS)[number], string> = {
  "--yn-pull-cord-switch-anchor-y": "0.14",
  "--yn-pull-cord-switch-accent": "rgba(255, 214, 102, 0.35)",
  "--yn-pull-cord-switch-ceiling-bg": "rgba(255,255,255,0.08)",
  "--yn-pull-cord-switch-anchor-color": "#4a4f5c",
  "--yn-pull-cord-switch-rope-start": "#6b5d4f",
  "--yn-pull-cord-switch-rope-end": "#9a8468",
  "--yn-pull-cord-switch-card-width": "88",
  "--yn-pull-cord-switch-card-height": "52",
  "--yn-pull-cord-switch-segment-len": "14",
  "--yn-pull-cord-switch-card-offset": "28",
  "--yn-pull-cord-switch-max-pull": "118",
  "--yn-pull-cord-switch-toggle-threshold": "72",
  "--yn-pull-cord-switch-ceiling-width": "56",
  "--yn-pull-cord-switch-rope-width": "3",
  "--yn-pull-cord-switch-rope-shadow-width": "5"
};

/** 每帧至多读取一次 computed style，避免重复 getComputedStyle。 */
export class PullCordThemeCache {
  private readonly host: HTMLElement;
  private values = new Map<string, string>();
  private frame = -1;
  private token = 0;

  constructor(host: HTMLElement) {
    this.host = host;
  }

  invalidate() {
    this.frame = -1;
    this.token++;
  }

  get revision() {
    return this.token;
  }

  beginFrame(now: number) {
    if (this.frame === now) return;
    this.frame = now;
    this.token++;
    const style = getComputedStyle(this.host);
    for (let i = 0; i < THEME_KEYS.length; i++) {
      const key = THEME_KEYS[i];
      const raw = style.getPropertyValue(key).trim();
      this.values.set(key, raw || FALLBACKS[key]);
    }
  }

  get(key: (typeof THEME_KEYS)[number]): string {
    return this.values.get(key) ?? FALLBACKS[key];
  }

  num(key: (typeof THEME_KEYS)[number]): number {
    const n = Number.parseFloat(this.get(key));
    return Number.isFinite(n) ? n : Number.parseFloat(FALLBACKS[key]);
  }
}
