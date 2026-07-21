# Allow Manual Entry Implementation Plan

> **For agentic workers:** Inline execution in-session.

**Goal:** Add `allow-manual-entry` so users can switch between address search and manual region entry; enable it in storefront checkout; add a Storybook example.

**Architecture:** Boolean property gates UI links; remember `lastProbedProvider` on successful probe; `enterManualMode` / `returnToAddressSearch` toggle without full re-probe when possible.

**Tech Stack:** Lit 3, Storybook, Astro storefront

## Global Constraints

- Default `allowManualEntry = false` (no behavior change).
- Preserve contact/address detail fields across switches; clear unconfirmed region/search state.
- Spec: `docs/superpowers/specs/2026-07-21-checkout-address-allow-manual-entry-design.md`

---

### Task 1: Messages + types + property + switch logic + UI

**Files:** `types.ts`, `messages.ts`, `yn-checkout-address.ts`, `checkout-address-views.ts`, `checkout-address-styles.ts` (minimal)

### Task 2: Story + unit smoke

**Files:** `yn-checkout-address.stories.ts`, optionally `yn-checkout-address.spec.ts`

### Task 3: Storefront

**Files:** `checkout-address.client.ts`, `yn-element-types.ts`
