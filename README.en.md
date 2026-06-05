# yn-web-component

[简体中文](./README.md)

A **Lit + Web Components** UI library with on-demand imports, full registration entry, Storybook docs, and test tooling.

## Inspiration

- Interaction and visual inspiration reference: [Floema](https://www.floema.com/)

## Overview

`yn-web-component` provides reusable `yn-*` custom elements with a focus on:

- Reusability: consistent UI behavior across projects
- Extensibility: props, events, slots, and CSS variables
- Publishability: npm-ready package with ESM/CJS outputs
- Maintainability: Storybook docs + tests + lint/format pipeline

## Why this project

- **Framework-agnostic**: works in React/Vue/Angular/vanilla apps
- **Style isolation**: Shadow DOM by default
- **Documented API**: props/events/slots/CSS variables in Storybook
- **Tree-shaking friendly**: component-level subpath exports
- **Modern toolchain**: Vite + Vitest + Web Test Runner + Storybook + Changesets

## Bundle size snapshot (current build)

> Numbers below are from a local `pnpm build` (ESM output). They may change by version.

- `yn-button`: about `1.31 kB` (gzip about `0.74 kB`)
- `yn-input`: about `1.53 kB` (gzip about `0.81 kB`)
- `yn-navigation`: about `19.26 kB` (gzip about `5.54 kB`)
- `yn-search`: about `21.27 kB` (gzip about `5.84 kB`)
- `yn-icon-connect-button`: about `22.75 kB` (gzip about `7.55 kB`)

## Web Components strengths in mainstream practice

- **Standards-based**: built on browser standards (Custom Elements / Shadow DOM)
- **Framework-agnostic reuse**: one component set across multiple stacks
- **Stable long-term maintenance**: less coupling to a single framework lifecycle
- **Style isolation**: Shadow DOM reduces style collisions in large apps
- **Mainstream pattern**: many modern design systems adopt “standard components + framework wrappers”

## Component API reference

**Full per-component documentation** (props, events, slots, CSS variables, methods, examples) is maintained in the [Chinese README](./README.md#组件文档).

Run `pnpm storybook` for interactive docs and Controls.

## Available components

| Component | Tag | Summary |
| --- | --- | --- |
| Button | `yn-button` | Semantic variants, loading, icon slots |
| Input | `yn-input` | Floema-style input with prefix/suffix buttons |
| Navigation | `yn-navigation` | Pill nav with SEO link mode |
| Search | `yn-search` | Expandable search with datalist |
| Group pick | `yn-group-pick` | Single/multi select container for `yn-pick` |
| Pick | `yn-pick` | Individual selectable option |
| Dropdown | `yn-dropdown` | Positioned dropdown overlay |
| Dropdown pick | `yn-dropdown-pick` | Dropdown single-select |
| Drawer | `yn-drawer` | Responsive side/bottom drawer |
| Toast | `yn-toast` | Dynamic Island-style top feedback |
| Icon connect button | `yn-icon-connect-button` | Animated icon button/link |
| Pull cord switch | `yn-pull-cord-switch` | Physics rope toggle |
| Quantity | `yn-quantity` | Stepper quantity input |
| Checkout address | `yn-checkout-address` | Cross-border address form |
| SKU selector | `yn-sku-selector` | Multi-dimension SKU picker + add to cart |

### Subpath imports

| Component | Import path |
| --- | --- |
| All above | `yn-web-component/components/<name>` |
| Full register | `yn-web-component/define` |
| Theme | `yn-web-component/theme.css` |

## Installation

```bash
pnpm add yn-web-component
# or npm i yn-web-component
# or yarn add yn-web-component
```

## Usage

### 1) Full registration (simple)

```ts
import "yn-web-component/define";
```

### 2) Named exports from root entry

```ts
import { YnSearch, YnNavigation } from "yn-web-component";
```

### 3) Component-level subpath import (recommended for tree shaking)

```ts
import { YnSearch } from "yn-web-component/components/yn-search";
import { YnNavigation } from "yn-web-component/components/yn-navigation";
```

### 4) Browser `<script>` usage (UMD / IIFE)

Useful for no-bundler setups (static pages, quick demos):

```html
<!-- Load lit first -->
<script src="https://unpkg.com/lit@3/index.js?module"></script>
<!-- Then load this library (IIFE) -->
<script src="https://unpkg.com/yn-web-component/dist/index.iife.js"></script>

<yn-search></yn-search>
```

You can also host and use `dist/index.umd.js` or `dist/index.iife.js` from your own CDN/static server.

## Tree Shaking guide

To maximize bundle pruning:

1. Prefer `yn-web-component/components/*` imports
2. Avoid `yn-web-component/define` in on-demand scenarios (it registers all components)
3. Keep your app bundler in ESM mode (Vite/Rollup/Webpack5 are fine)

## `yn-navigation` SEO mode

When `seoMode=true`, items render as anchor links and active state is resolved from `window.location.pathname`:

```html
<yn-navigation
  .seoMode=${true}
  .items=${{ Home: "/home", Products: "/products", Journal: "/journal" }}
  aria-label="Primary navigation"
></yn-navigation>
```

## Button theming recommendation (`variant` + CSS variables)

For button components, we recommend a two-layer strategy:

1. Semantic layer: use `variant` to express intent (`primary`, `danger`, etc.)
2. Visual layer: use CSS variables to override concrete colors for branding/themes

### 1) `yn-button` example

```html
<yn-button variant="primary">Save</yn-button>
<yn-button variant="danger">Delete</yn-button>

<!-- Local color overrides -->
<yn-button
  variant="success"
  style="
    --yn-button-bg: #22c55e;
    --yn-button-hover-bg: #16a34a;
  "
>
  Custom success color
</yn-button>
```

Available CSS variables:

- `--yn-button-bg`
- `--yn-button-hover-bg`
- `--yn-button-disabled-bg`
- `--yn-button-disabled-color`

Notes:

- Components use Shadow DOM; external styles do not penetrate by default
- Click interaction uses the native `click` event
- Prefer `variant` for semantic consistency, then use CSS variables for theme-level customization

## Versions & compatibility

### Package outputs

- ESM: `dist/index.js`
- CJS: `dist/index.cjs`
- UMD: `dist/index.umd.js`
- IIFE: `dist/index.iife.js`
- Types: `dist/types/*`

### Current dependency baseline

- `lit`: `^3.3.2`
- `storybook`: `8.6.x`
- `vite`: `6.4.x`
- `typescript` (dev): `6.x`

### Recommended runtime

- Node.js: `>= 18`
- Package manager: `pnpm 10+`
- Browser: modern browsers with Custom Elements v1 / Shadow DOM support

## Development scripts

```bash
pnpm dev
pnpm build
pnpm test
pnpm test:browser
pnpm lint
pnpm format
pnpm storybook
```

## Release

```bash
pnpm build
pnpm changeset
pnpm release
```

## License

MIT
