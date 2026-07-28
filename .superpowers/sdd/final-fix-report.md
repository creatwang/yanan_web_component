# Final fix report
- Status: Important findings 1–2 fixed and verified.
- None mode: stack uses `--yn-drawer-sheet-height` (or content for `sheet-height="auto"`), and body scrolling is enabled.
- Snap mode: peek keeps body overflow hidden; expanded keeps body overflow auto.
- Browser tests: `yn-drawer.spec.ts` 20/20 passed; `yn-drawer-sheet-expand.spec.ts` 9/9 passed.
- Build: `pnpm build` passed; generated ESM/CJS/types include `motion` and `sheetExpand`.
- Dist: `dist/` is gitignored, so it is not committed; linked consumers must use the locally rebuilt dist (or rebuild after checkout).
