/**
 * 需要受控状态的文档 Demo（markup 来自 story-demos，与 Storybook 一致）
 */
import { LitElement, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import {
  storyNavigationInner,
  storyButtonDefault,
  storyButtonVariants,
  storyButtonSizes,
  storyButtonLoading,
  storyIconButtonDefault,
  storyIconButtonClick,
  storyInputDefault,
  storyInputPrefix,
  storyInputSuffix,
  storyInputSlotted,
  storyIconConnectSizes,
  storySearchDefault,
  storyDropdownDefault,
  storyDropdownCustomClose,
  storyDropdownPickDefault,
  storyQuantityProduct,
  storySkuPickOne,
  storySkuSimple,
  storyCheckoutAddress,
  storyDrawerCart,
  storyDrawerDesktop,
  storyToastApi,
  storyPullCordSlots,
  storyPullCordSizes,
  storyPullCordThemeSwitch,
  type DocsThemeMode,
  storyGroupPickDefault,
  storyGroupPickMultiple,
  storyPickDefault,
  renderGroupPickCard,
  GROUP_PICK_CATEGORIES
} from "./story-demos";
import { getLocale } from "../i18n/locale";

@customElement("yn-docs-navigation-demo")
export class YnDocsNavigationDemo extends LitElement {
  @property({ type: String }) variant: "controlled" | "dark" | "seo" = "controlled";
  @state() private active = "PRODUTOS";

  createRenderRoot() {
    return this;
  }

  protected updated(changed: Map<string, unknown>) {
    if (changed.has("variant")) {
      this.active = this.variant === "dark" ? "SOBRE" : "PRODUTOS";
    }
  }

  private onChange(e: Event) {
    const ev = e as CustomEvent<{ key: string }>;
    this.active = ev.detail.key;
    const el = e.currentTarget as HTMLElement & { active?: string };
    el.active = ev.detail.key;
  }

  render() {
    if (this.variant === "seo") {
      return storyNavigationInner("PRODUTOS", false, true);
    }

    const hitSlop = this.variant === "dark";

    const inner = storyNavigationInner(this.active, hitSlop, false, this.onChange.bind(this));

    if (this.variant === "dark") {
      return html`
        <div class="yn-inline-block yn-rounded-xl yn-bg-[#2f2521] yn-p-4">${inner}</div>
      `;
    }

    return inner;
  }
}

@customElement("yn-docs-button-demo")
export class YnDocsButtonDemo extends LitElement {
  @property({ type: String }) variant: "default" | "variants" | "sizes" | "loading" = "default";

  createRenderRoot() {
    return this;
  }

  render() {
    if (this.variant === "variants") return storyButtonVariants();
    if (this.variant === "sizes") return storyButtonSizes();
    if (this.variant === "loading") return storyButtonLoading();
    return storyButtonDefault();
  }
}

@customElement("yn-docs-icon-button-demo")
export class YnDocsIconButtonDemo extends LitElement {
  @property({ type: String }) variant: "default" | "click" = "default";

  createRenderRoot() {
    return this;
  }

  render() {
    if (this.variant === "click") return storyIconButtonClick();
    return storyIconButtonDefault();
  }
}

@customElement("yn-docs-input-demo")
export class YnDocsInputDemo extends LitElement {
  @property({ type: String }) variant: "default" | "prefix" | "suffix" | "both" = "both";

  createRenderRoot() {
    return this;
  }
  render() {
    if (this.variant === "default") return storyInputDefault();
    if (this.variant === "prefix") return storyInputPrefix();
    if (this.variant === "suffix") return storyInputSuffix();
    return storyInputSlotted();
  }
}

@customElement("yn-docs-icon-connect-demo")
export class YnDocsIconConnectDemo extends LitElement {
  createRenderRoot() {
    return this;
  }
  render() {
    return storyIconConnectSizes();
  }
}

@customElement("yn-docs-search-demo")
export class YnDocsSearchDemo extends LitElement {
  createRenderRoot() {
    return this;
  }

  render() {
    return storySearchDefault();
  }
}

@customElement("yn-docs-dropdown-demo")
export class YnDocsDropdownDemo extends LitElement {
  @property({ type: String }) variant: "default" | "custom-close" = "default";

  createRenderRoot() {
    return this;
  }

  render() {
    return this.variant === "custom-close" ? storyDropdownCustomClose() : storyDropdownDefault();
  }
}

@customElement("yn-docs-dropdown-pick-demo")
export class YnDocsDropdownPickDemo extends LitElement {
  createRenderRoot() {
    return this;
  }
  render() {
    return storyDropdownPickDefault();
  }
}

@customElement("yn-docs-sku-demo")
export class YnDocsSkuDemo extends LitElement {
  @property({ type: String }) mode: "default" | "simple" = "default";

  createRenderRoot() {
    return this;
  }

  render() {
    return this.mode === "simple" ? storySkuSimple() : storySkuPickOne();
  }
}

@customElement("yn-docs-drawer-demo")
export class YnDocsDrawerDemo extends LitElement {
  @property({ type: String }) variant: "cart" | "desktop" = "cart";

  createRenderRoot() {
    return this;
  }

  render() {
    return this.variant === "desktop" ? storyDrawerDesktop() : storyDrawerCart();
  }
}

@customElement("yn-docs-toast-demo")
export class YnDocsToastDemo extends LitElement {
  createRenderRoot() {
    return this;
  }
  render() {
    return storyToastApi();
  }
}

@customElement("yn-docs-pull-cord-demo")
export class YnDocsPullCordDemo extends LitElement {
  @property({ type: String }) variant: "theme" | "slots" | "sizes" = "theme";
  @state() private theme: DocsThemeMode = "light";
  private onExternalThemeChange = (event: Event) => {
    const theme = (event as CustomEvent<{ theme?: DocsThemeMode }>).detail?.theme;
    if (theme === "light" || theme === "dark") {
      this.theme = theme;
    }
  };
  private onLocaleChange = () => {
    this.requestUpdate();
  };

  createRenderRoot() {
    return this;
  }

  connectedCallback() {
    super.connectedCallback();
    const stored = window.localStorage.getItem("yn-docs-theme");
    this.theme = stored === "dark" ? "dark" : "light";
    this.applyTheme(this.theme);
    window.addEventListener("yn-docs-theme-change", this.onExternalThemeChange);
    window.addEventListener("yn-docs-locale-change", this.onLocaleChange);
  }

  disconnectedCallback() {
    window.removeEventListener("yn-docs-theme-change", this.onExternalThemeChange);
    window.removeEventListener("yn-docs-locale-change", this.onLocaleChange);
    super.disconnectedCallback();
  }

  private applyTheme(theme: DocsThemeMode) {
    this.theme = theme;
    document.documentElement.setAttribute("data-yn-theme", theme);
    window.localStorage.setItem("yn-docs-theme", theme);
    window.dispatchEvent(new CustomEvent("yn-docs-theme-change", { detail: { theme } }));
  }

  render() {
    if (this.variant === "sizes") return storyPullCordSizes();
    if (this.variant === "slots") return storyPullCordSlots();
    return storyPullCordThemeSwitch(this.theme, (theme) => this.applyTheme(theme), getLocale());
  }
}

@customElement("yn-docs-group-pick-demo")
export class YnDocsGroupPickDemo extends LitElement {
  @property({ type: String }) variant: "default" | "multiple" = "default";

  createRenderRoot() {
    return this;
  }

  render() {
    return this.variant === "multiple" ? storyGroupPickMultiple() : storyGroupPickDefault();
  }
}

@customElement("yn-docs-pick-demo")
export class YnDocsPickDemo extends LitElement {
  @property({ type: String }) variant: "default" | "image" = "default";

  createRenderRoot() {
    return this;
  }

  render() {
    if (this.variant === "image") {
      return html`
        <div class="yn-rounded-xl yn-bg-[#efede8] yn-p-6 yn-inline-block">
          ${renderGroupPickCard(GROUP_PICK_CATEGORIES[3])}
        </div>
      `;
    }
    return storyPickDefault();
  }
}

@customElement("yn-docs-checkout-address-demo")
export class YnDocsCheckoutAddressDemo extends LitElement {
  createRenderRoot() {
    return this;
  }
  render() {
    return storyCheckoutAddress();
  }
}

@customElement("yn-docs-quantity-demo")
export class YnDocsQuantityDemo extends LitElement {
  createRenderRoot() {
    return this;
  }
  render() {
    return storyQuantityProduct();
  }
}
