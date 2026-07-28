# yn-drawer：移动端 Sheet 动效与手动 motion 控制

日期：2026-07-28  
状态：已确认设计，待实现

## 背景

`yn-drawer` 主要承载购物车：宽屏为右侧多段卡片抽屉，窄屏希望自下而上弹出。

当前问题：

1. 布局上已有 `placement` / 断点差异，但 GSAP 动效统一为「右侧滑入 + 坠落退出」，与底部 Sheet 形态不匹配。
2. 移动端不希望一打开就接近全屏，希望先半高，再随手势展开。
3. 抽屉有三段面板（`top` / `middle` / `bottom`），滚动与展开必须有明确归属，否则手势冲突。
4. 业务需要**手动指定动效**，以便不同端（或同一端不同场景）使用不同动画，而不是只靠断点猜测。

## 目标

1. 新增 `motion` 属性，支持 `auto` | `side` | `sheet`，业务可按端写死。
2. `motion="sheet"`：自下而上进入；初始不沾满屏；支持半高 ↔ 近全高吸附展开。
3. `motion="side"`：保留现有右侧滑入 + 坠落（或等价侧向）退场。
4. 三卡在 Sheet 模式下整叠联动；仅 `top .body` 可滚；`middle` 为短促销条固定高度；`bottom` 钉底。
5. 更新 README / Storybook / 必要单测；storefront 购物车按端接入。

## 非目标

- 不做全程跟手连续插值长高（默认用两档 snap）。
- 不做三段接力滚动（middle / bottom 不独立滚动）。
- 不改 PC 侧滑品牌动效的核心观感（除非 `motion` 显式切到 sheet）。
- 不在本设计中重做购物车业务内容（商品行、结算逻辑等）。
- 不修改 Medusa / Hono API。

## API

### `motion`

| 项 | 说明 |
| --- | --- |
| 属性名 | `motion`（reflect） |
| 类型 | `"auto" \| "side" \| "sheet"` |
| 默认 | `"auto"` |

语义：

| 值 | 行为 |
| --- | --- |
| `auto` | 由 `placement` + 断点决定：`right` → side；`bottom` → sheet；`auto` 时宽屏（≥1024）side、窄屏 sheet |
| `side` | 强制侧滑动效（忽略窄屏） |
| `sheet` | 强制底部 Sheet 动效（忽略宽屏） |

`placement` 继续管**布局方向**；`motion` 管**动效管线**。推荐业务显式组合，避免布局与动效错位：

```html
<!-- 移动端购物车 -->
<yn-drawer placement="bottom" motion="sheet" sheet-height="auto"></yn-drawer>

<!-- PC 购物车 -->
<yn-drawer placement="right" motion="side" width="420"></yn-drawer>
```

### `sheet-expand`

| 项 | 说明 |
| --- | --- |
| 属性名 | `sheet-expand`（reflect） |
| 类型 | `"snap" \| "none"` |
| 默认 | `"snap"` |
| 生效条件 | 仅 `motion` 解析为 `sheet` 时生效 |

| 值 | 行为 |
| --- | --- |
| `snap` | 内容超出初始档时可上滑吸附到近全高，再到顶后滚列表 |
| `none` | 高度只跟内容 / `sheet-height`，不上滑长高 |

### 现有属性关系

| 属性 | 与本设计关系 |
| --- | --- |
| `placement` | 布局；`motion=auto` 时参与动效选择 |
| `sheet-height` | Sheet 初始/内容高度基准；`auto` 随内容 |
| `exit-speed` / `ease-reverse` | 继续作用于 side 管线；sheet 管线可复用或映射等价参数 |
| `--yn-drawer-open-duration` 等 CSS 变量 | sheet 管线应对齐读取或提供等价默认；避免只写在 CSS、GSAP 不用 |

## 结构与滚动（sheet）

三卡保留视觉分段，但**高度与变换只绑外层 Sheet 容器**：

```
Sheet（高度随展开档变化）
├── top：header 固定 + .body 唯一滚动
├── middle：短促销/满减，固定高度，不滚
└── bottom：CTA，钉在 Sheet 底，始终可见
```

规则：

1. 未到封顶：上滑优先消耗为 Sheet 长高（整叠一起抬）。
2. 到封顶后：上滑交给 `top .body` 列表滚动。
3. 列表 `scrollTop === 0` 再下拉，或下拉 header/middle/footer：整叠**跟手下移**，松手过阈值关闭、否则弹回（不做「先缩回半高」）。
4. middle / bottom 不设独立 overflow 滚动；middle 内容过长应裁切或改放到 top content。

## 高度规则（sheet）

| 场景 | 高度 |
| --- | --- |
| 空车 / 内容很矮 | `min(内容高度, 初始档)`，不强制拉到 60vh |
| 少量商品 | 随内容增高，仍低于封顶 |
| 列表超出初始档 | 先停在初始档（`60vh` / `--yn-drawer-sheet-peek-height`），`sheet-expand=snap` 时可吸到封顶，再滚列表 |
| 封顶 | `--yn-drawer-sheet-height`（默认约 `90dvh`），保留顶边/圆角，避免真全屏 |

初始档默认 `60vh`，CSS 变量：`--yn-drawer-sheet-peek-height`（默认 `60vh`）。  
封顶沿用 `--yn-drawer-sheet-height`（默认 `90vh` / `90dvh` 实现时与现有 `sheet-height` 同步逻辑对齐）。

## 开闭动效

| | `side` | `sheet` |
| --- | --- | --- |
| 打开 | 右→左滑入 + 遮罩淡入（现有） | 下→上滑入 + 遮罩淡入 |
| 关闭 | 保持现有坠落退场 | 下沉滑出（更克制，无旋转坠落） |
| 多卡 | 面板/推荐卡可继续参与现有 stagger | 三卡作为整叠一起动；窄屏无 `backdrop-extra` |
| `prefers-reduced-motion` | 瞬时到位 | 瞬时到位 |

实现注意：

- 将 motion 拆成可切换管线（或同一 controller 内按 mode 分支），避免 sheet 仍走 `x: 110%`。
- 断点变化且 `motion=auto` 导致 `resolvedMotion` 改变：重建 motion controller；若当前为打开态，则 `seekOpenImmediate` 切到新模式开态（不强制关掉抽屉）。属性手动从 `side` ↔ `sheet` 切换时同样处理。

## Storefront 接入（my-medusa-store-hono）

建议购物车：

- 窄屏 / 移动：`placement="bottom" motion="sheet" sheet-height="auto"`
- 宽屏 / PC：`placement="right" motion="side"`

可用 CSS / matchMedia 在客户端设置属性，或按布局分别渲染；以不破坏现有 header 购物车事件为准。

QuickAdd 等其它 `yn-drawer` 按场景选择；默认 `motion="auto"` 保持兼容。

## Storybook

至少补充：

1. `CartDrawer`：`motion="sheet"` + 半高/吸附说明（mobile viewport）
2. `CartDrawerDesktop`：`motion="side"`（保持现有）
3. 属性文档：`motion`、`sheet-expand`
4. 可选：`sheet-expand="none"` 对照 Story

## 测试要点

1. `motion` / `sheet-expand` 属性 reflect 与默认值。
2. `motion="side"` 在窄屏仍侧滑；`motion="sheet"` 在宽屏仍底部。
3. `motion="auto"` + `placement="auto"`：断点两侧解析正确。
4. sheet：打开高度不超过初始档（内容不足时更矮）；snap 后可达封顶；仅 body 滚动。
5. bottom CTA 在半高与近全高均可见。
6. reduced-motion 下无长动画。
7. 现有 side 关闭/打开生命周期事件（before/after-open/close）行为不回归。

## 实现顺序（概要）

1. API：`motion`、`sheet-expand` + 解析 `resolvedMotion`
2. sheet 布局：外层高度档位、三卡整叠、body 单滚动、footer 钉底
3. sheet GSAP 管线：进入/退出/y 向
4. snap 手势：未封顶长高 ↔ 封顶后滚列表
5. Storybook + 单测 + README
6. storefront 购物车按端设置属性

## 已确认决策

| 决策 | 选择 |
| --- | --- |
| 移动端形态 | 底部上滑 Sheet，非侧滑 |
| 展开方式 | 两档吸附（snap），非全程连续插值 |
| middle | 短促销条，固定不滚 |
| 滚动模型 | 整叠联动 + 仅 top.body 滚动 |
| 列表顶下拉 | 默认直接关闭 |
| 动效控制 | 新增 `motion` 手动控制，默认 `auto` |
