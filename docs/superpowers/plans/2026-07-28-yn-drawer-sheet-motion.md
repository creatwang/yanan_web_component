# yn-drawer Sheet Motion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为 `yn-drawer` 增加可手控的 `motion`（side/sheet/auto）与移动端底部 Sheet（半高吸附、三卡整叠、仅 body 滚动），并接入 storefront 购物车。

**Architecture:** 纯函数 `resolveYnDrawerMotion` 解析模式；GSAP controller 按 `side` / `sheet` 两套管线构建时间轴；Sheet 布局由 host attribute + CSS 驱动高度档；`sheet-expand=snap` 时由独立 gesture 模块在 peek↔expanded 间切换。`placement` 只管布局，`motion` 管动效。

**Tech Stack:** Lit 3、GSAP、@web/test-runner + Playwright、Storybook、Astro storefront

**Spec:** `docs/superpowers/specs/2026-07-28-yn-drawer-sheet-motion-design.md`

## Global Constraints

- `motion` 默认 `"auto"`；`sheet-expand` 默认 `"snap"`；默认行为对现有 side 调用方尽量无感。
- Sheet：仅 `top .body` 滚动；middle 固定矮促销；bottom 钉底。
- Sheet 关闭：下沉滑出（无旋转坠落）；side 关闭：保留现有坠落。
- `resolvedMotion` 变化时重建 motion；若已打开则 `seekOpenImmediate`。
- 断点常量与样式一致：`1024px`（`--yn-drawer-breakpoint`）。
- Peek 默认 `60vh`（`--yn-drawer-sheet-peek-height`）；封顶走 `--yn-drawer-sheet-height`。
- 不改 Medusa/Hono API；不重做购物车业务内容。

## File map

| File | Responsibility |
| --- | --- |
| `src/components/yn-drawer/yn-drawer-motion-resolve.ts` | 纯函数：`auto`/`placement`/viewport → `side` \| `sheet` |
| `src/components/yn-drawer/yn-drawer-motion.ts` | GSAP：按 mode 建 side 或 sheet 时间轴；统一 controller API |
| `src/components/yn-drawer/yn-drawer-sheet-expand.ts` | snap 手势：peek ↔ expanded；列表顶下拉关闭回调 |
| `src/components/yn-drawer/yn-drawer-styles.ts` | Sheet 布局 CSS、peek/expanded 变量、钉底 |
| `src/components/yn-drawer/yn-drawer.ts` | 属性、`resolvedMotion`、模式切换、接线 gesture |
| `src/components/yn-drawer/yn-drawer.spec.ts` | 浏览器单测 |
| `src/components/yn-drawer/yn-drawer.stories.ts` | Story / controls |
| `README.md` + `app/data/component-i18n.ts` | 文档与 demo 文案 |
| `apps/storefront/...`（hono 仓） | 购物车按端设置 `motion`/`placement` |

---

### Task 1: `resolveYnDrawerMotion` 纯函数

**Files:**
- Create: `src/components/yn-drawer/yn-drawer-motion-resolve.ts`
- Create: `src/components/yn-drawer/yn-drawer-motion-resolve.spec.ts`
- Test: `pnpm test:browser`（或仅跑该 spec）

**Interfaces:**
- Produces:
  ```ts
  export type YnDrawerMotionMode = "side" | "sheet";
  export type YnDrawerMotionProp = "auto" | "side" | "sheet";
  export type YnDrawerPlacement = "auto" | "right" | "bottom";

  export function resolveYnDrawerMotion(input: {
    motion: YnDrawerMotionProp;
    placement: YnDrawerPlacement;
    /** 视口宽度；测试可注入，运行时用 window.innerWidth */
    viewportWidth: number;
    breakpoint?: number; // 默认 1024
  }): YnDrawerMotionMode;
  ```

- [ ] **Step 1: 写失败测试**

```ts
import { expect } from "@open-wc/testing";
import { resolveYnDrawerMotion } from "./yn-drawer-motion-resolve.js";

describe("resolveYnDrawerMotion", () => {
  it("forces side / sheet when motion is explicit", () => {
    expect(
      resolveYnDrawerMotion({ motion: "side", placement: "bottom", viewportWidth: 375 })
    ).to.equal("side");
    expect(
      resolveYnDrawerMotion({ motion: "sheet", placement: "right", viewportWidth: 1440 })
    ).to.equal("sheet");
  });

  it("maps placement when motion is auto", () => {
    expect(
      resolveYnDrawerMotion({ motion: "auto", placement: "right", viewportWidth: 375 })
    ).to.equal("side");
    expect(
      resolveYnDrawerMotion({ motion: "auto", placement: "bottom", viewportWidth: 1440 })
    ).to.equal("sheet");
  });

  it("uses breakpoint when placement and motion are auto", () => {
    expect(
      resolveYnDrawerMotion({ motion: "auto", placement: "auto", viewportWidth: 1023 })
    ).to.equal("sheet");
    expect(
      resolveYnDrawerMotion({ motion: "auto", placement: "auto", viewportWidth: 1024 })
    ).to.equal("side");
  });
});
```

- [ ] **Step 2: 跑测试确认失败**

Run: `pnpm test:browser -- src/components/yn-drawer/yn-drawer-motion-resolve.spec.ts`  
Expected: FAIL（模块不存在或函数未导出）

- [ ] **Step 3: 最小实现**

```ts
export type YnDrawerMotionMode = "side" | "sheet";
export type YnDrawerMotionProp = "auto" | "side" | "sheet";
export type YnDrawerPlacement = "auto" | "right" | "bottom";

const DEFAULT_BREAKPOINT = 1024;

export function resolveYnDrawerMotion(input: {
  motion: YnDrawerMotionProp;
  placement: YnDrawerPlacement;
  viewportWidth: number;
  breakpoint?: number;
}): YnDrawerMotionMode {
  if (input.motion === "side" || input.motion === "sheet") return input.motion;
  if (input.placement === "right") return "side";
  if (input.placement === "bottom") return "sheet";
  const bp = input.breakpoint ?? DEFAULT_BREAKPOINT;
  return input.viewportWidth < bp ? "sheet" : "side";
}
```

- [ ] **Step 4: 跑测试确认通过**

Run: `pnpm test:browser -- src/components/yn-drawer/yn-drawer-motion-resolve.spec.ts`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/yn-drawer/yn-drawer-motion-resolve.ts src/components/yn-drawer/yn-drawer-motion-resolve.spec.ts
git commit -m "feat(yn-drawer): add resolveYnDrawerMotion helper"
```

---

### Task 2: `motion` / `sheet-expand` 属性接入组件

**Files:**
- Modify: `src/components/yn-drawer/yn-drawer.ts`
- Modify: `src/components/yn-drawer/yn-drawer.spec.ts`

**Interfaces:**
- Consumes: `resolveYnDrawerMotion`（本任务先只暴露属性与 `getResolvedMotion()`，真正接线在 Task 6）
- Produces:
  ```ts
  motion: YnDrawerMotionProp; // default "auto", reflect
  sheetExpand: "snap" | "none"; // attribute sheet-expand, default "snap", reflect
  getResolvedMotion(): YnDrawerMotionMode; // 测试用；内部也可 private + 测试读 attribute 组合
  ```

- [ ] **Step 1: 写失败测试（追加到 `yn-drawer.spec.ts`）**

```ts
it("reflects motion and sheet-expand defaults and overrides", async () => {
  const el = await fixture<YnDrawer>(html`<yn-drawer></yn-drawer>`);
  await el.updateComplete;
  expect(el.motion).to.equal("auto");
  expect(el.sheetExpand).to.equal("snap");
  expect(el.getAttribute("motion")).to.equal("auto");
  expect(el.getAttribute("sheet-expand")).to.equal("snap");

  el.motion = "sheet";
  el.sheetExpand = "none";
  await el.updateComplete;
  expect(el.getAttribute("motion")).to.equal("sheet");
  expect(el.getAttribute("sheet-expand")).to.equal("none");
});

it("resolves motion=side even on narrow viewport intent", async () => {
  const el = await fixture<YnDrawer>(
    html`<yn-drawer motion="side" placement="bottom"></yn-drawer>`,
  );
  await el.updateComplete;
  expect(el.getResolvedMotion()).to.equal("side");
});
```

- [ ] **Step 2: 跑相关测试确认失败**

Run: `pnpm test:browser -- src/components/yn-drawer/yn-drawer.spec.ts`  
Expected: FAIL（无 `motion` / `getResolvedMotion`）

- [ ] **Step 3: 在 `yn-drawer.ts` 增加属性与解析**

在现有 `@property` 旁加入：

```ts
import {
  resolveYnDrawerMotion,
  type YnDrawerMotionProp,
  type YnDrawerMotionMode
} from "./yn-drawer-motion-resolve.js";

@property({ type: String, reflect: true })
motion: YnDrawerMotionProp = "auto";

@property({ type: String, attribute: "sheet-expand", reflect: true })
sheetExpand: "snap" | "none" = "snap";

getResolvedMotion(): YnDrawerMotionMode {
  const viewportWidth =
    typeof window !== "undefined" ? window.innerWidth : 1024;
  return resolveYnDrawerMotion({
    motion: this.motion,
    placement: this.placement,
    viewportWidth
  });
}
```

首连时若希望默认 attribute 出现在 DOM：在 `connectedCallback` 里对缺省值 `setAttribute`，或依赖 Lit reflect（首次 update 后应有）。若 reflect 默认不写出，测试改为「赋值后 reflect」+ 属性默认值断言即可；以现有 `placement` 写法为准保持一致。

- [ ] **Step 4: 跑测试确认通过**

Run: `pnpm test:browser -- src/components/yn-drawer/yn-drawer.spec.ts`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/yn-drawer/yn-drawer.ts src/components/yn-drawer/yn-drawer.spec.ts
git commit -m "feat(yn-drawer): add motion and sheet-expand properties"
```

---

### Task 3: Sheet 布局 CSS（peek / expanded / 钉底）

**Files:**
- Modify: `src/components/yn-drawer/yn-drawer-styles.ts`
- Modify: `src/components/yn-drawer/yn-drawer.ts`（host 上 reflect `data-motion` 或 attribute `motion` 已有；另加 `data-sheet-size="peek|expanded"`）
- Modify: `src/components/yn-drawer/yn-drawer.spec.ts`（布局 smoke）

**Interfaces:**
- Consumes: `getResolvedMotion()`；`sheetSize: "peek" | "expanded"`（内部状态，reflect 为 `data-sheet-size`）
- Produces: CSS 在 `motion` 解析为 sheet 时：surface 底部对齐；stack 高度 `min(内容, peek)` 或 expanded 封顶；`.panel--bottom` 钉在 stack 底；`.body` 为唯一 `overflow: auto`

- [ ] **Step 1: 写失败测试**

```ts
it("applies sheet layout host attrs when motion=sheet", async () => {
  const el = await fixture<YnDrawer>(
    html`<yn-drawer motion="sheet" placement="bottom" sheet-height="90vh"></yn-drawer>`,
  );
  await el.updateComplete;
  expect(el.getAttribute("data-yn-motion")).to.equal("sheet");
  expect(el.getAttribute("data-sheet-size")).to.equal("peek");
});
```

- [ ] **Step 2: 跑测试确认失败**

Expected: FAIL（无 `data-yn-motion`）

- [ ] **Step 3: 样式与 host 同步**

在 `:host` 变量区增加：

```css
--yn-drawer-sheet-peek-height: 60vh;
```

增加选择器（示意，实现时贴合现有 class）：

```css
:host([data-yn-motion="sheet"]) .drawer-surface {
  align-items: stretch;
  justify-content: flex-end;
  flex-direction: column;
}

:host([data-yn-motion="sheet"]) .drawer-stack {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-height: var(--yn-drawer-sheet-peek-height);
  margin-top: auto;
  pointer-events: auto;
  gap: var(--yn-drawer-panel-gap);
}

:host([data-yn-motion="sheet"][data-sheet-size="expanded"]) .drawer-stack {
  max-height: var(--yn-drawer-sheet-height, 90dvh);
}

:host([data-yn-motion="sheet"]) .panel {
  width: 100%;
}

:host([data-yn-motion="sheet"]) .panel--top {
  flex: 1 1 auto;
  min-height: 0;
  max-height: none;
}

:host([data-yn-motion="sheet"]) .panel--middle:not(.panel--empty) {
  flex: 0 0 auto;
  max-height: none;
  overflow: hidden;
}

:host([data-yn-motion="sheet"]) .panel--bottom:not(.panel--empty) {
  flex: 0 0 auto;
}

:host([data-yn-motion="sheet"]) .body {
  overflow: auto;
  overscroll-behavior: contain;
}

:host([data-yn-motion="sheet"]) .backdrop-extra {
  display: none !important;
}
```

在 `render()` 中用 `.drawer-stack` 包裹三个 panel（side 模式可同用该 wrapper，避免两套 DOM；side 下 stack 样式保持现有右对齐行为）。

在 `updated` / `syncMotionHostAttrs()` 中：

```ts
private syncMotionHostAttrs() {
  const mode = this.getResolvedMotion();
  this.setAttribute("data-yn-motion", mode);
  if (mode !== "sheet") {
    this.removeAttribute("data-sheet-size");
    return;
  }
  if (!this.getAttribute("data-sheet-size")) {
    this.setAttribute("data-sheet-size", "peek");
  }
}
```

`sheet-height="auto"`：peek 时 stack 高度随内容，但不超过 peek max；用 `height: fit-content; max-height: ...`。

- [ ] **Step 4: 跑测试确认通过**

- [ ] **Step 5: Commit**

```bash
git add src/components/yn-drawer/yn-drawer-styles.ts src/components/yn-drawer/yn-drawer.ts src/components/yn-drawer/yn-drawer.spec.ts
git commit -m "feat(yn-drawer): add sheet layout CSS and host motion attrs"
```

---

### Task 4: Sheet GSAP 管线（进入 / 退出）

**Files:**
- Modify: `src/components/yn-drawer/yn-drawer-motion.ts`
- Modify: `src/components/yn-drawer/yn-drawer.ts`（`ensureMotion` 传入 mode）
- Modify: `src/components/yn-drawer/yn-drawer.spec.ts`（生命周期仍触发；可用 stub 或 reduced-motion）

**Interfaces:**
- Consumes: `YnDrawerMotionMode`
- Produces: 扩展 options / targets：
  ```ts
  export type YnDrawerMotionOptions = {
    exitSpeed?: number;
    easeReverse?: boolean;
    reduceMotion?: boolean;
    mode?: YnDrawerMotionMode; // 默认 "side"
  };

  // setOptions / 重建时若 mode 变了必须 rebuild timeline
  ```
  - `side`：保持现有 `x: 110%` 入、坠落出
  - `sheet`：stack（或 panels 作为一组）`y: 110%` → `y: 0` 入；关闭 `y: 110%` 出（无 rotation）；backdrop 淡入淡出；不 stagger 旋转坠落

- [ ] **Step 1: 写失败测试**

```ts
it("sheet motion still fires after-open / after-close", async () => {
  const el = await fixture<YnDrawer>(
    html`<yn-drawer motion="sheet" placement="bottom"></yn-drawer>`,
  );
  await el.updateComplete;

  const opened = oneEvent(el, "after-open");
  el.show();
  await opened;

  const closed = oneEvent(el, "after-close");
  el.close();
  await closed;
}).timeout(5000);
```

（若 CI 上 GSAP 时序不稳：在 fixture 前 mock `matchMedia` 为 `prefers-reduced-motion: reduce`，使 duration≈0。）

- [ ] **Step 2: 跑测试确认当前可能 flake 或几何仍为 side——以红测驱动改 motion**

- [ ] **Step 3: 改 `createYnDrawerMotion`**

1. `opts.mode ?? "side"`。
2. `build()` 分支：
   - **side**：现有逻辑不变（cards = panels + reco）。
   - **sheet**：
     - targets 增加 `stack: HTMLElement`（`.drawer-stack`）；若无 stack 则退化为 panels 数组一起 `y`。
     - `paintClosed`：`stack`/`cards` 设 `y: "110%"`，`x: 0`，`rotation: 0`，`opacity: 0|1`（面板可 opacity 1，靠位移隐藏）。
     - enter：`y: 0`，`duration ~0.45 * d`，`ease: power3.out`（或读 CSS duration）。
     - exit：从 pause 点 `y: "110%"`，`duration ~0.32 * d`，`ease: power2.in`，**无** rotation/stagger 坠落。
3. `setOptions`：若 `mode` 变化 → 强制 `build()`；打开态由宿主 `seekOpenImmediate`。

`ensureMotion`：

```ts
createYnDrawerMotion(surface, backdrop, targets, callbacks, {
  exitSpeed: this.exitSpeed,
  easeReverse: this.easeReverse,
  mode: this.getResolvedMotion()
});
```

mode 变化时：`dispose` + 清 `motionBoot` + 若 `open` 再 `ensureMotion` + `seekOpenImmediate`。

- [ ] **Step 4: 跑 `yn-drawer.spec.ts` + resolve spec 全过**

- [ ] **Step 5: Commit**

```bash
git add src/components/yn-drawer/yn-drawer-motion.ts src/components/yn-drawer/yn-drawer.ts src/components/yn-drawer/yn-drawer.spec.ts
git commit -m "feat(yn-drawer): add sheet enter/exit GSAP pipeline"
```

---

### Task 5: `sheet-expand` snap 手势

**Files:**
- Create: `src/components/yn-drawer/yn-drawer-sheet-expand.ts`
- Create: `src/components/yn-drawer/yn-drawer-sheet-expand.spec.ts`（纯逻辑可测部分）
- Modify: `src/components/yn-drawer/yn-drawer.ts`
- Modify: `src/components/yn-drawer/yn-drawer-styles.ts`（如需）

**Interfaces:**
- Produces:
  ```ts
  export type YnDrawerSheetSize = "peek" | "expanded";

  export type YnDrawerSheetExpandController = {
    attach: () => void;
    detach: () => void;
    setEnabled: (enabled: boolean) => void; // sheet + snap 时 true
    setSize: (size: YnDrawerSheetSize) => void;
    getSize: () => YnDrawerSheetSize;
    dispose: () => void;
  };

  export function createYnDrawerSheetExpand(input: {
    stack: HTMLElement;
    body: HTMLElement;
    onSizeChange: (size: YnDrawerSheetSize) => void;
    onRequestClose: () => void;
    /** 内容高度未超过 peek 时禁止 expanded */
    canExpand: () => boolean;
  }): YnDrawerSheetExpandController;
  ```

行为（规格）：

1. `sheet-expand="none"` 或非 sheet：`setEnabled(false)`。
2. peek 且 `canExpand()`：在 body 上 `touchstart/move/end` 或 `wheel`；上滑超过阈值 → `expanded`。
3. expanded：body 正常滚动；`scrollTop===0` 且继续下拉超过阈值 → `onRequestClose()`（直接关）。
4. 不实现「先缩回 peek 再关」。

- [ ] **Step 1: 写纯逻辑 / 控制器测试**

对阈值函数或用 jsdom/fixture 模拟：至少测 `setEnabled(false)` 不回调；`setSize` 同步。

手势集成测可放 `yn-drawer.spec.ts`：调用内部 API `el["sheetExpandCtrl"].setSize("expanded")` 或公开测试钩子——优先通过设置 `data-sheet-size` 的宿主方法：

```ts
// 若不便模拟 touch，至少：
it("expands sheet size attribute when setSheetSize is used", async () => {
  const el = await fixture<YnDrawer>(
    html`<yn-drawer motion="sheet" sheet-expand="snap"></yn-drawer>`,
  );
  await el.updateComplete;
  el.setSheetSize("expanded");
  await el.updateComplete;
  expect(el.getAttribute("data-sheet-size")).to.equal("expanded");
});
```

- [ ] **Step 2: 实现 `yn-drawer-sheet-expand.ts`**

阈值建议：`deltaY < -40` 展开；顶部下拉 `deltaY > 50` 关闭。用 `pointer` 事件 + `touch-action: pan-y`。

- [ ] **Step 3: 接线到 `YnDrawer`**

- `setSheetSize(size)` 写 `data-sheet-size` 并通知 expand ctrl。
- open 完成（`after-open` / enter complete）后 `attach`；close / disconnect `detach`。
- `canExpand`：`stack.scrollHeight > peekHeightPx * 0.98`（或 body 内容溢出）。
- `sheetExpand==="none"`：永不 `expanded`。

- [ ] **Step 4: 跑测试**

- [ ] **Step 5: Commit**

```bash
git add src/components/yn-drawer/yn-drawer-sheet-expand.ts src/components/yn-drawer/yn-drawer-sheet-expand.spec.ts src/components/yn-drawer/yn-drawer.ts src/components/yn-drawer/yn-drawer.spec.ts
git commit -m "feat(yn-drawer): add sheet peek/expanded snap gesture"
```

---

### Task 6: 模式切换、resize、`motion=auto` 断点

**Files:**
- Modify: `src/components/yn-drawer/yn-drawer.ts`
- Modify: `src/components/yn-drawer/yn-drawer.spec.ts`

**Interfaces:**
- 监听 `matchMedia('(min-width: 1024px)')` change；`motion`/`placement`/`sheetExpand` `updated` 时 `onMotionConfigChange()`：
  1. `syncMotionHostAttrs()`
  2. 若 `resolvedMotion` 与当前 controller mode 不同：dispose motion → 若 open 则 ensure + seekOpenImmediate
  3. 更新 sheet expand enabled

- [ ] **Step 1: 测试**

```ts
it("rebuilds resolved motion when motion prop changes while open", async () => {
  const el = await fixture<YnDrawer>(
    html`<yn-drawer motion="side" open></yn-drawer>`,
  );
  await el.updateComplete;
  await oneEvent(el, "after-open").catch(() => undefined);
  el.motion = "sheet";
  await el.updateComplete;
  expect(el.getResolvedMotion()).to.equal("sheet");
  expect(el.getAttribute("data-yn-motion")).to.equal("sheet");
  expect(el.open).to.equal(true);
});
```

- [ ] **Step 2–4: 实现 + 测试通过 + Commit**

```bash
git commit -m "feat(yn-drawer): rebuild motion on mode or breakpoint change"
```

---

### Task 7: Storybook + README + component-i18n

**Files:**
- Modify: `src/components/yn-drawer/yn-drawer.stories.ts`
- Modify: `README.md`（yn-drawer 属性表）
- Modify: `app/data/component-i18n.ts`（若 demo 站同步属性说明）

- [ ] **Step 1: Story controls**

增加 argTypes：

```ts
motion: { control: "select", options: ["auto", "side", "sheet"] },
sheetExpand: { control: "select", options: ["snap", "none"], name: "sheet-expand" },
```

- `CartDrawer`：`motion="sheet" placement="bottom" sheet-expand="snap"`，docs 写明半高吸附。
- `CartDrawerDesktop`：`motion="side" placement="right"`。
- 可选新 Story：`SheetExpandNone`。

- [ ] **Step 2: README 表增加 `motion`、`sheet-expand`、`--yn-drawer-sheet-peek-height`**

- [ ] **Step 3: 本地 Storybook 目视**（`pnpm storybook`）确认 sheet 自下而上、side 不回归。

- [ ] **Step 4: Commit**

```bash
git commit -m "docs(yn-drawer): document motion and sheet-expand"
```

---

### Task 8: Storefront 购物车按端设置

**Files（仓库 `my-medusa-store-hono`）：**
- Modify: `apps/storefront/src/components/header/StoreHeader.astro`
- Modify: `apps/storefront/src/lib/header/store-header.client.ts`（若需 matchMedia 动态设属性）
- Modify: `apps/storefront/src/lib/web-components/yn-element-types.ts`
- Modify: `apps/storefront/src/components/product/QuickAddDrawer.astro`（按场景：可 `motion="auto"` 保持，或移动 `sheet`）

**Interfaces:**
- `YnDrawerElement` 增加 `motion?`、`sheetExpand?`、`placement?`、`sheetHeight?`

- [ ] **Step 1: 类型补全**

```ts
export interface YnDrawerElement extends HTMLElement {
  width?: number
  open?: boolean
  hideTrigger?: boolean
  placement?: "auto" | "right" | "bottom"
  motion?: "auto" | "side" | "sheet"
  sheetExpand?: "snap" | "none"
  sheetHeight?: string
  show?: (payload?: unknown) => void
  close?: (payload?: unknown) => void
}
```

- [ ] **Step 2: Header 购物车**

推荐客户端一次性设置（避免 SSR 与断点不一致）：

```ts
function syncCartDrawerMotion(drawer: YnDrawerElement) {
  const wide = window.matchMedia("(min-width: 1024px)").matches
  drawer.placement = wide ? "right" : "bottom"
  drawer.motion = wide ? "side" : "sheet"
  drawer.sheetExpand = "snap"
  drawer.sheetHeight = "auto"
}
```

在 `store-header.client.ts` init 与 `matchMedia` change 时调用；Astro 上可保留 `placement="auto"` 作兜底，以客户端赋值为准。

- [ ] **Step 3: 确认依赖的 `yn-web-component` 版本已包含前述改动（workspace / 发版链接按团队惯例）。**

- [ ] **Step 4: 手动验：窄屏底部半高；宽屏右侧坠落；结算 footer 始终可见。**

- [ ] **Step 5: Commit（在 hono 仓）**

```bash
git commit -m "feat(storefront): wire cart yn-drawer motion per breakpoint"
```

---

## Spec coverage checklist

| Spec 项 | Task |
| --- | --- |
| `motion` API | 2 |
| `sheet-expand` API | 2, 5 |
| `resolve` auto/placement/breakpoint | 1, 6 |
| Sheet 自下而上 / 下沉关 | 4 |
| Side 保留坠落 | 4（不改 side 分支） |
| 三卡整叠 + 仅 body 滚 + middle 固定 + bottom 钉底 | 3 |
| Peek 60vh / 封顶 sheet-height / 空车不强制 60vh | 3, 5 `canExpand` |
| 列表顶下拉直接关 | 5 |
| mode 切换 rebuild + seek | 6 |
| Storybook / README | 7 |
| Storefront | 8 |
| reduced-motion | 4（沿用 durationScale） |

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-07-28-yn-drawer-sheet-motion.md`.

**Two execution options:**

1. **Subagent-Driven（推荐）** — 每任务新子代理，任务间审查  
2. **Inline Execution** — 本会话按 executing-plans 连续做，设检查点  

Which approach?
