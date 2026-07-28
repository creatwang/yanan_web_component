# Task 3 Report: Sheet layout CSS

## Status

**DONE**

## Commit

- `1ff848a feat(yn-drawer): add sheet layout CSS and host motion attrs`

## Test summary

- TDD RED confirmed: the new host-attribute and shared-stack tests failed before implementation.
- `pnpm vitest run src/components/yn-drawer/yn-drawer.spec.ts` — **13 passed, 0 failed**.
- `pnpm typecheck` — passed.
- ESLint and Prettier checks for the three changed files — passed.
- Full `pnpm test` — **174 passed, 5 failed** in unrelated existing `yn-input-shadow`, `yn-navigation-shadow`, `yn-quantity-shadow`, and `yn-search` tests.

## Implementation notes

- Synchronizes `data-yn-motion` and sheet-only `data-sheet-size="peek"` on connection and relevant Lit updates.
- Wraps all three panels in one `.drawer-stack`; side mode retains the right-aligned stacked-card layout.
- Adds bottom-aligned sheet layout, 60vh peek cap, configured expanded cap, pinned footer ordering, and `.body` as the sheet scroll container.
- `sheet-height="auto"` removes the inline height override while the stack remains `height: fit-content` under peek/expanded max-height constraints.
- No GSAP sheet enter/exit animation or snap gesture behavior was added.

## Files changed

- `src/components/yn-drawer/yn-drawer-styles.ts`
- `src/components/yn-drawer/yn-drawer.ts`
- `src/components/yn-drawer/yn-drawer.spec.ts`

## Concerns

- The repository-wide test suite is not fully green due to the five failures listed above; the Task 3 targeted suite is green.

## Review fix (2026-07-28)

- Restored a fixed sheet-middle cap with `max-height: min(32vh, 200px)` so promo content cannot grow and displace the footer.
- Added browser coverage confirming the sheet stack remains bottom-pinned, the middle stays capped, panel overflow stays hidden, and only `.body` scrolls.
- RED: `pnpm test:browser -- src/components/yn-drawer/yn-drawer.spec.ts` — **13 passed, 1 failed** with `expected 'none' to not equal 'none'`.
- GREEN: `pnpm test:browser -- src/components/yn-drawer/yn-drawer.spec.ts` — **14 passed, 0 failed**.
- Deferred as planned: no `matchMedia` or viewport resize listener changes.
