# Task 5 Report

Status: Implemented and committed.
Commit: `6fb526c feat(yn-drawer): add sheet peek/expanded snap gesture`

Changes:
- Added the sheet-expand controller with attach/detach, enable, size, and dispose APIs.
- Added pointer and wheel expansion at the 40px threshold.
- Added expanded top pull-to-close at the 50px threshold without collapsing to peek.
- Exposed `YnDrawer.setSheetSize()` and synchronized `data-sheet-size`.
- Wired enablement to sheet/snap mode and lifecycle attachment after open.

Verification:
- TDD red run: missing controller module and `setSheetSize` failed as expected.
- Targeted drawer/controller tests: 25 passed.
- TypeScript typecheck: passed.
- ESLint on changed files: passed.
- Full suite: 186 passed, 5 unrelated existing baseline failures.

Concerns: Full repository suite remains non-green due to the existing navigation, quantity, input, and search failures documented in Task 4.

## Important review follow-up

Status: Fixed the peek scrolling and touch pull-to-close findings.

Changes:
- Sheet peek now keeps `.body` at `overflow: hidden`; only expanded uses `overflow: auto`.
- Gesture touch-action is `none` in peek, `pan-up` at expanded scroll top, and `pan-y` only away from top.
- Added pointer capture and scroll-state synchronization so a downward touch pull from top remains observable past 50px.
- Added computed overflow coverage and touch gesture/touch-action regression tests with a real scrollable fixture.

Verification:
- `pnpm test:browser -- src/components/yn-drawer/yn-drawer.spec.ts` — 17 passed.
- `pnpm test:browser -- src/components/yn-drawer/yn-drawer-sheet-expand.spec.ts` — 9 passed.
- `pnpm typecheck` — passed.
- ESLint on the four changed drawer files — passed.

## Important Review Fixes

- Peek now computes `.body` overflow as `hidden`; expanded computes it as `auto`.
- Touch gestures use `none` in peek, `pan-up` at expanded scroll top, and `pan-y`
  only away from the top, preserving upward content scrolling while preventing
  browser cancellation of the top pull-to-close gesture.
- Pointer capture keeps the active gesture targeted at the sheet body.
- Browser regression tests cover overflow state, touch-action transitions, and
  the `deltaY > 50` expanded pull-to-close behavior.
- `pnpm test:browser -- src/components/yn-drawer/yn-drawer.spec.ts src/components/yn-drawer/yn-drawer-sheet-expand.spec.ts`: 26 passed.
- `pnpm typecheck`: passed.
- ESLint on the changed drawer files: passed.
